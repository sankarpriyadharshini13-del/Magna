-- Add delivery_charge column to orders table for manual delivery charge entry by admin.
-- Run after 20261108000000_product_level_reviews.sql. Safe to run more than once.

alter table public.orders add column if not exists delivery_charge integer not null default 0;

-- Update constraint to include delivery_charge validation
alter table public.orders drop constraint if exists orders_delivery_check;
alter table public.orders add constraint orders_delivery_check check (
  discount >= 0 and delivery_charge >= 0 and (boxes is null or boxes >= 0)
  and length(total_weight) <= 20 and length(transporter) <= 80 and length(tracking_number) <= 60
  and length(tracking_url) <= 300
  and tracking_status in ('', 'Not dispatched', 'Dispatched', 'In transit', 'Out for delivery', 'Delivered', 'Delayed')
);

-- Update admin_save_order function to handle delivery_charge
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
  v_discount int := coalesce((p ->> 'discount')::int, 0);
  v_delivery_charge int := coalesce((p ->> 'delivery_charge')::int, 0);
  v_bulk boolean := coalesce(p ->> 'kind', '') = 'bulk';
  v_boxes int := nullif(p ->> 'boxes', '')::int;
  v_weight text := btrim(coalesce(p ->> 'total_weight', ''));
  v_transporter text := btrim(coalesce(p ->> 'transporter', ''));
  v_tracking text := btrim(coalesce(p ->> 'tracking_number', ''));
  v_dispatch date := nullif(p ->> 'dispatch_date', '')::date;
  v_tstatus text := btrim(coalesce(p ->> 'tracking_status', ''));
  v_turl text := btrim(coalesce(p ->> 'tracking_url', ''));
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
  if v_discount < 0 then raise exception 'invalid_discount'; end if;
  if v_delivery_charge < 0 then raise exception 'invalid_delivery_charge'; end if;
  if v_boxes is not null and v_boxes < 0 then raise exception 'invalid_boxes'; end if;
  if v_turl <> '' and v_turl !~* '^https?://' then raise exception 'invalid_tracking_url'; end if;
  if v_tstatus <> '' and v_tstatus not in ('Not dispatched', 'Dispatched', 'In transit', 'Out for delivery', 'Delivered', 'Delayed') then
    raise exception 'invalid_tracking_status';
  end if;
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

  v_total := v_shipping + v_delivery_charge - v_discount + (select coalesce(sum(x.qty * x.price), 0) from jsonb_to_recordset(p -> 'items') x(qty int, price int));
  if v_total < 0 then raise exception 'invalid_discount'; end if;
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
                               payment_mode, method, payment_status, discount, delivery_charge)
    values (cust, 'New', 'admin', v_kind, v_address, v_email, v_name, v_phone, v_city, v_state, v_pin,
            case when v_kind = 'bulk' then v_business else '' end,
            case when v_kind = 'bulk' then btrim(coalesce(p ->> 'gst_number', '')) else '' end,
            btrim(coalesce(p ->> 'note', '')), v_shipping,
            'pending', 'Other', 'pending', v_discount, v_delivery_charge)
    returning * into o;
    n := o.number;
  else
    update public.orders set
      kind = v_kind, address = v_address, email = v_email, ship_name = v_name, ship_phone = v_phone,
      ship_city = v_city, ship_state = v_state, ship_pincode = v_pin,
      business_name = case when v_kind = 'bulk' then v_business else '' end,
      gst_number = case when v_kind = 'bulk' then btrim(coalesce(p ->> 'gst_number', '')) else '' end,
      note = btrim(coalesce(p ->> 'note', '')), shipping = v_shipping, discount = v_discount,
      delivery_charge = v_delivery_charge, updated_at = now()
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

  -- Parcels and manual tracking are kept for bulk orders only (normal orders don't have them).
  update public.orders set
    boxes = case when v_bulk then v_boxes end,
    total_weight = case when v_bulk then v_weight else '' end,
    transporter = case when v_bulk then v_transporter else '' end,
    tracking_number = case when v_bulk then v_tracking else '' end,
    dispatch_date = case when v_bulk then v_dispatch end,
    tracking_status = case when v_bulk then v_tstatus else '' end,
    tracking_url = case when v_bulk then v_turl else '' end
  where number = n
  returning * into o;

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
