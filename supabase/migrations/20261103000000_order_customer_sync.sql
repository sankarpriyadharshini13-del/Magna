-- When an admin edits an order's customer details (Admin → Orders → Edit), copy them to the customer record
-- too, so the Customers page and everywhere else that shows the customer stays in step.
-- Run after 20261102000000_order_delivery.sql. Safe to run more than once.
--
--   * Name (the business name for bulk orders), phone, email, city and state are copied.
--   * Blank fields never wipe what the customer record already has.
--   * Only fires when one of those order fields actually changes (packing, delivery and payment updates
--     don't touch the customer).

create or replace function public.sync_customer_from_order()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.ship_name, new.ship_phone, new.email, new.ship_city, new.ship_state, new.business_name, new.kind)
     is not distinct from
     (old.ship_name, old.ship_phone, old.email, old.ship_city, old.ship_state, old.business_name, old.kind) then
    return new;
  end if;
  update public.customers c set
    name  = coalesce(nullif(btrim(case when new.kind = 'bulk' then new.business_name else new.ship_name end), ''), c.name),
    phone = coalesce(nullif(btrim(new.ship_phone), ''), c.phone),
    email = coalesce(nullif(lower(btrim(new.email)), ''), c.email),
    city  = coalesce(nullif(btrim(new.ship_city), ''), c.city),
    state = coalesce(nullif(btrim(new.ship_state), ''), c.state)
  where c.id = new.customer_id;
  return new;
end;
$$;
revoke execute on function public.sync_customer_from_order() from public, anon, authenticated;

drop trigger if exists orders_sync_customer on public.orders;
create trigger orders_sync_customer
  after update of ship_name, ship_phone, email, ship_city, ship_state, business_name, kind on public.orders
  for each row execute function public.sync_customer_from_order();
