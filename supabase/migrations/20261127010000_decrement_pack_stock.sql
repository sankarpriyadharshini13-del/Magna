-- Keep per-pack inventory in sync when order items are added or removed.
-- The checkout function continues to maintain the product-wide stock total.
create or replace function public.adjust_pack_stock_for_order_item()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_product_id text;
  v_pack_size text;
  v_order_number bigint;
  v_quantity_delta integer;
  quantity_text text;
  current_quantity integer;
begin
  if tg_op = 'INSERT' then
    v_product_id := new.product_id;
    v_pack_size := new.pack_size;
    v_order_number := new.order_number;
    v_quantity_delta := new.qty;
  else
    v_product_id := old.product_id;
    v_pack_size := old.pack_size;
    v_order_number := old.order_number;
    v_quantity_delta := -old.qty;
  end if;

  if v_product_id is null or v_pack_size is null or v_pack_size = '' then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  if exists (
    select 1
      from public.orders o
     where o.number = v_order_number
       and (o.status = 'Cancelled' or o.channel in ('distributors', 'export'))
  ) then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  select p.pack_stock ->> v_pack_size
    into quantity_text
    from public.products p
   where p.id = v_product_id
     and jsonb_typeof(p.pack_stock) = 'object'
     and p.pack_stock ? v_pack_size
     and coalesce(p.channel, 'ecommerce') <> 'export'
   for update;

  if not found then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  current_quantity := case
    when quantity_text ~ '^[0-9]+$' then quantity_text::integer
    else 0
  end;

  update public.products
     set pack_stock = jsonb_set(
       pack_stock,
       array[v_pack_size],
       to_jsonb(greatest(current_quantity - v_quantity_delta, 0)),
       false
     )
   where id = v_product_id;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists order_items_decrement_pack_stock on public.order_items;
create trigger order_items_decrement_pack_stock
after insert or delete on public.order_items
for each row
execute function public.adjust_pack_stock_for_order_item();

create or replace function public.restore_pack_stock_on_order_cancel()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  item record;
  quantity_text text;
  current_quantity integer;
begin
  if old.status = 'Cancelled' or new.status <> 'Cancelled'
     or new.channel in ('distributors', 'export') then
    return new;
  end if;

  for item in
    select i.product_id, i.pack_size, sum(i.qty)::integer as quantity
      from public.order_items i
     where i.order_number = new.number
       and i.product_id is not null
       and i.pack_size <> ''
     group by i.product_id, i.pack_size
  loop
    select p.pack_stock ->> item.pack_size
      into quantity_text
      from public.products p
     where p.id = item.product_id
       and jsonb_typeof(p.pack_stock) = 'object'
       and p.pack_stock ? item.pack_size
       and coalesce(p.channel, 'ecommerce') <> 'export'
     for update;

    if found then
      current_quantity := case
        when quantity_text ~ '^[0-9]+$' then quantity_text::integer
        else 0
      end;
      update public.products
         set pack_stock = jsonb_set(
           pack_stock,
           array[item.pack_size],
           to_jsonb(current_quantity + item.quantity),
           false
         )
       where id = item.product_id;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists orders_restore_pack_stock_on_cancel on public.orders;
create trigger orders_restore_pack_stock_on_cancel
after update of status on public.orders
for each row
execute function public.restore_pack_stock_on_order_cancel();
