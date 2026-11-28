-- Prevent admin-created orders from exceeding per-pack inventory. Online checkouts are excluded
-- because payment is already captured before their order items are written.
create or replace function public.validate_admin_pack_stock_for_order_item()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_source text;
  v_status text;
  v_order_channel text;
  v_product_channel text;
  v_product_name text;
  v_pack_stock jsonb;
  v_pack_quantity text;
  v_available integer;
begin
  if new.product_id is null or coalesce(new.pack_size, '') = '' then
    return new;
  end if;

  select o.source, o.status, o.channel
    into v_source, v_status, v_order_channel
    from public.orders o
   where o.number = new.order_number;

  if not found
     or coalesce(v_source, '') <> 'admin'
     or v_status = 'Cancelled'
     or coalesce(v_order_channel, 'ecommerce') in ('distributors', 'export') then
    return new;
  end if;

  select coalesce(p.channel, 'ecommerce'), p.name, p.pack_stock
    into v_product_channel, v_product_name, v_pack_stock
    from public.products p
   where p.id = new.product_id
   for update;

  if not found or v_product_channel = 'export'
     or v_pack_stock is null
     or jsonb_typeof(v_pack_stock) <> 'object'
     or v_pack_stock = '{}'::jsonb then
    return new;
  end if;

  v_pack_quantity := v_pack_stock ->> new.pack_size;
  v_available := case
    when coalesce(v_pack_quantity, '') ~ '^[0-9]+$' then v_pack_quantity::integer
    else 0
  end;

  if v_available < new.qty then
    raise exception using message = 'insufficient_pack_stock:' || v_product_name || ' ' || new.pack_size;
  end if;

  return new;
end;
$$;

drop trigger if exists order_items_validate_admin_pack_stock on public.order_items;
create trigger order_items_validate_admin_pack_stock
before insert on public.order_items
for each row
execute function public.validate_admin_pack_stock_for_order_item();
