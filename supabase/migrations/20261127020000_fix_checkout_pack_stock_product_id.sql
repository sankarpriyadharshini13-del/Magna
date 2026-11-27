-- Product IDs are text slugs, not UUIDs. Replace the trigger function to match the products schema.
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
