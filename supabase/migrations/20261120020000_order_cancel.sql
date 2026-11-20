-- Cancelling an order (Admin → Orders → Cancel order). Safe to run more than once.
--
--   * Only New and Packed orders can be cancelled — a delivered order stays delivered.
--   * The stock the order was holding goes back to the shop (and is noted under Recent stock changes).
--   * The status becomes 'Cancelled' and a "Cancelled" update is added to the order's timeline, so the
--     customer sees it on My orders. Money already paid is refunded separately in Payments & Refunds.

create or replace function public.admin_cancel_orders(p_numbers bigint[])
returns bigint[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  n bigint;
  d record;
  v_numbers bigint[] := coalesce(p_numbers, '{}'::bigint[]);
  v_cancelled bigint[] := '{}';
begin
  if not coalesce((select public.is_admin()), false) then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  -- Lock every order we were asked about first, so two admins can't cancel the same one twice.
  perform 1 from public.orders o where o.number = any (v_numbers) for update;

  for n in
    select o.number
      from public.orders o
     where o.number = any (v_numbers)
       and o.status in ('New', 'Packed')
     order by o.number
  loop
    -- Give back the stock this order was holding. Products deleted since then are simply skipped.
    for d in
      select i.product_id as pid, sum(i.qty)::int as qty
        from public.order_items i
       where i.order_number = n and i.product_id is not null
       group by i.product_id
    loop
      update public.products set stock = stock + d.qty where id = d.pid;
      insert into public.stock_log (text, delta, product_id)
      select 'Order #' || n || ' cancelled · ' || pr.name || ' returned ×' || d.qty, d.qty, d.pid
        from public.products pr where pr.id = d.pid;
    end loop;

    update public.orders set status = 'Cancelled' where number = n;
    insert into public.order_events (order_number, label, note)
    values (n, 'Cancelled', 'Cancelled by the shop · stock returned');
    v_cancelled := array_append(v_cancelled, n);
  end loop;

  return v_cancelled;
end;
$$;

revoke execute on function public.admin_cancel_orders(bigint[]) from public, anon;
grant execute on function public.admin_cancel_orders(bigint[]) to authenticated;
