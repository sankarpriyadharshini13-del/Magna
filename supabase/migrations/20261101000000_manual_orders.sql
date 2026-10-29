-- Orders added and edited by admins (Admin → Orders → "+ Add" / "Edit"). Run after
-- 20261031000000_review_listing.sql (needs the checkout migration). Safe to run more than once.
--
--   * Normal orders: one customer. Bulk orders: a business (shop, event…), optional GST number and
--     per-line bulk prices.
--   * public.admin_save_order() creates or updates an order in one transaction: customer, order, items,
--     timeline and stock (stock goes down by the quantity ordered, and is put back when an edit lowers it).
--   * It runs with the caller's own rights (row-level security applies) and refuses anyone who isn't an admin.

/* ------------------------------------------------------------- order fields */

alter table public.orders add column if not exists kind text not null default 'normal';
alter table public.orders add column if not exists source text not null default 'online';
alter table public.orders add column if not exists business_name text not null default '';
alter table public.orders add column if not exists gst_number text not null default '';
alter table public.orders add column if not exists note text not null default '';
-- online = paid through the website · paid = already paid (UPI / cash / card) · cod = cash on delivery ·
-- pending = to be collected · advance = part paid (amount_paid)
alter table public.orders add column if not exists payment_mode text not null default 'online';
alter table public.orders add column if not exists amount_paid integer not null default 0;
alter table public.orders add column if not exists updated_at timestamptz;

alter table public.orders drop constraint if exists orders_kind_check;
alter table public.orders add constraint orders_kind_check check (kind in ('normal', 'bulk'));
alter table public.orders drop constraint if exists orders_source_check;
alter table public.orders add constraint orders_source_check check (source in ('online', 'admin'));
alter table public.orders drop constraint if exists orders_payment_mode_check;
alter table public.orders add constraint orders_payment_mode_check check (payment_mode in ('online', 'paid', 'cod', 'pending', 'advance'));
alter table public.orders drop constraint if exists orders_amount_paid_check;
alter table public.orders add constraint orders_amount_paid_check check (amount_paid >= 0);
alter table public.orders drop constraint if exists orders_text_lengths_check;
alter table public.orders add constraint orders_text_lengths_check
  check (length(business_name) <= 120 and length(gst_number) <= 20 and length(note) <= 500);

alter table public.orders drop constraint if exists orders_method_check;
alter table public.orders add constraint orders_method_check
  check (method in ('UPI', 'Card', 'NetBanking', 'Wallet', 'Cash', 'Other'));

/* ------------------------------------------------------- admin_save_order() */

-- p_number null = create, otherwise update that order. p:
--   { kind, name, phone, email, business_name, gst_number, address, city, state, pincode, note, shipping,
--     payment_mode, method, amount_paid, items: [{ product_id, name, pack_size, qty, price }] }
-- Items with a product_id take their name and pack size from the product. Items without one are kept only
-- when editing (a line whose product was deleted later).
create or replace function public.admin_save_order(p_number bigint, p jsonb)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  o public.orders;
  n bigint := p_number;
  cust uuid;
  v_kind text := coalesce(nullif(p ->> 'kind', ''), 'normal');
  v_name text := btrim(coalesce(p ->> 'name', ''));
  v_phone text := btrim(coalesce(p ->> 'phone', ''));
  v_email text := lower(btrim(coalesce(p ->> 'email', '')));
  v_business text := btrim(coalesce(p ->> 'business_name', ''));
  v_line text := btrim(coalesce(p ->> 'address', ''));
  v_city text := btrim(coalesce(p ->> 'city', ''));
  v_state text := btrim(coalesce(p ->> 'state', ''));
  v_pin text := btrim(coalesce(p ->> 'pincode', ''));
  v_shipping int := coalesce((p ->> 'shipping')::int, 0);
  v_mode text := coalesce(nullif(p ->> 'payment_mode', ''), 'pending');
  v_method text := coalesce(nullif(p ->> 'method', ''), 'Other');
  v_paid int := coalesce((p ->> 'amount_paid')::int, 0);
  v_total int;
  v_status text;
  v_address text;
  d record;
  bad text;
begin
  if not coalesce((select public.is_admin()), false) then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  if n is not null then
    select * into o from public.orders where number = n for update;
    if not found then raise exception 'order_not_found'; end if;
  end if;

  -- Validation (the API checks the same things first, with friendlier messages).
  if v_kind not in ('normal', 'bulk') then raise exception 'invalid_kind'; end if;
  if v_name = '' then raise exception 'name_required'; end if;
  if v_kind = 'bulk' and v_business = '' then raise exception 'business_required'; end if;
  if v_shipping < 0 then raise exception 'invalid_shipping'; end if;
  if jsonb_typeof(p -> 'items') is distinct from 'array' or jsonb_array_length(p -> 'items') = 0 then
    raise exception 'items_required';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p -> 'items') x(product_id text, name text, qty int, price int)
    where coalesce(x.qty, 0) < 1 or x.price is null or x.price < 0
       or (x.product_id is null and (n is null or coalesce(btrim(x.name), '') = ''))
  ) then
    raise exception 'invalid_items';
  end if;
  select x.product_id into bad from jsonb_to_recordset(p -> 'items') x(product_id text)
   where x.product_id is not null and not exists (select 1 from public.products pr where pr.id = x.product_id) limit 1;
  if bad is not null then raise exception 'unknown_product:%', bad; end if;

  v_total := v_shipping + (select coalesce(sum(x.qty * x.price), 0) from jsonb_to_recordset(p -> 'items') x(qty int, price int));
  v_address := concat_ws(', ', nullif(v_line, ''), nullif(v_city, ''), nullif(v_state, ''))
               || case when v_pin <> '' then ' – ' || v_pin else '' end;

  -- Stock: the change per product between the old and the new items (cancelled orders don't hold stock).
  if coalesce(o.status, 'New') <> 'Cancelled' then
    for d in
      select coalesce(nw.pid, od.pid) as pid, coalesce(nw.q, 0) - coalesce(od.q, 0) as delta
      from (select x.product_id as pid, sum(x.qty)::int as q
              from jsonb_to_recordset(p -> 'items') x(product_id text, qty int)
             where x.product_id is not null group by 1) nw
      full join (select i.product_id as pid, sum(i.qty)::int as q
                   from public.order_items i
                  where i.order_number = n and i.product_id is not null group by 1) od
        on od.pid = nw.pid
    loop
      continue when d.delta = 0;
      if d.delta > 0 then
        update public.products set stock = stock - d.delta where id = d.pid and stock >= d.delta;
        if not found then
          select name into bad from public.products where id = d.pid;
          raise exception 'insufficient_stock:%', coalesce(bad, d.pid);
        end if;
      else
        update public.products set stock = stock - d.delta where id = d.pid;
      end if;
      insert into public.stock_log (text, delta, product_id)
      select case when n is null then 'Admin order' else 'Order #' || n || ' edited' end || ' · ' || pr.name
             || case when d.delta > 0 then ' ×' || d.delta else ' returned ×' || (-d.delta) end,
             -d.delta, d.pid
      from public.products pr where pr.id = d.pid;
    end loop;
  end if;

  if n is null then
    -- Reuse the customer with this email (or the same name and phone), else add a new one.
    if v_email <> '' then
      select id into cust from public.customers where lower(email) = v_email
       order by (user_id is not null) desc, created_at limit 1;
    end if;
    if cust is null and regexp_replace(v_phone, '\D', '', 'g') <> '' then
      select id into cust from public.customers
       where right(regexp_replace(phone, '\D', '', 'g'), 10) = right(regexp_replace(v_phone, '\D', '', 'g'), 10)
         and lower(btrim(name)) = lower(case when v_kind = 'bulk' then v_business else v_name end)
       order by (user_id is not null) desc, created_at limit 1;
    end if;
    if cust is null then
      insert into public.customers (name, phone, email, city, state)
      values (case when v_kind = 'bulk' then v_business else v_name end, v_phone, v_email, v_city, v_state)
      returning id into cust;
    end if;

    insert into public.orders (customer_id, status, source, kind, address, email, ship_name, ship_phone,
                               ship_city, ship_state, ship_pincode, business_name, gst_number, note, shipping,
                               payment_mode, method, payment_status)
    values (cust, 'New', 'admin', v_kind, v_address, v_email, v_name, v_phone, v_city, v_state, v_pin,
            case when v_kind = 'bulk' then v_business else '' end,
            case when v_kind = 'bulk' then btrim(coalesce(p ->> 'gst_number', '')) else '' end,
            btrim(coalesce(p ->> 'note', '')), v_shipping,
            'pending', 'Other', 'pending')
    returning * into o;
    n := o.number;
  else
    update public.orders set
      kind = v_kind, address = v_address, email = v_email, ship_name = v_name, ship_phone = v_phone,
      ship_city = v_city, ship_state = v_state, ship_pincode = v_pin,
      business_name = case when v_kind = 'bulk' then v_business else '' end,
      gst_number = case when v_kind = 'bulk' then btrim(coalesce(p ->> 'gst_number', '')) else '' end,
      note = btrim(coalesce(p ->> 'note', '')), shipping = v_shipping, updated_at = now()
    where number = n
    returning * into o;
    delete from public.order_items where order_number = n;
  end if;

  insert into public.order_items (order_number, product_id, name, pack_size, qty, price)
  select n, e.x ->> 'product_id',
         coalesce(pr.name, btrim(e.x ->> 'name')), coalesce(pr.pack_size, e.x ->> 'pack_size', ''),
         (e.x ->> 'qty')::int, (e.x ->> 'price')::int
  from jsonb_array_elements(p -> 'items') with ordinality as e(x, ord)
  left join public.products pr on pr.id = e.x ->> 'product_id'
  order by e.ord;

  -- Payment. Website payments (and anything already refunded) are left exactly as they are.
  if o.payment_mode <> 'online' and o.payment_refunded = 0 then
    if v_mode not in ('paid', 'cod', 'pending', 'advance') then raise exception 'invalid_payment'; end if;
    if v_method not in ('UPI', 'Card', 'NetBanking', 'Wallet', 'Cash', 'Other') then v_method := 'Other'; end if;
    if v_mode = 'cod' then v_method := 'Cash'; end if;
    if v_mode = 'advance' and (v_paid <= 0 or v_paid >= v_total) then raise exception 'invalid_advance'; end if;
    update public.orders set
      payment_mode = v_mode,
      method = v_method,
      payment_status = case when v_mode = 'paid' then 'captured' else 'pending' end,
      amount_paid = case v_mode when 'paid' then v_total when 'advance' then v_paid else 0 end
    where number = n
    returning * into o;
  end if;

  insert into public.order_events (order_number, label, note)
  values (
    n,
    case when p_number is null then 'Order added by admin' else 'Order edited by admin' end,
    concat_ws(' · ',
      case when v_kind = 'bulk' then 'Bulk order' end,
      case o.payment_mode
        when 'paid' then 'Paid (' || o.method || ')'
        when 'cod' then 'Cash on delivery'
        when 'pending' then 'Payment pending'
        when 'advance' then 'Advance ₹' || o.amount_paid || ' received'
      end)
  );

  return n;
end;
$$;

revoke execute on function public.admin_save_order(bigint, jsonb) from public, anon;
grant execute on function public.admin_save_order(bigint, jsonb) to authenticated;
