-- Optional reason for cancelling an order (Admin → Orders → Cancel order). Safe to run more than once.
--
--   * The admin can type why the order was cancelled, or leave the box blank.
--   * The reason is saved on the order and shown to the customer under "Cancelled on …" on My orders.
--
-- This replaces admin_cancel_orders() from 20261120020000_order_cancel.sql with a version that also
-- takes the reason, so the old one-argument version is dropped. Running this file on its own is enough.

alter table public.orders add column if not exists cancel_reason text not null default '';

drop function if exists public.admin_cancel_orders(bigint[]);

create or replace function public.admin_cancel_orders(p_numbers bigint[], p_reason text default '')
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
  -- Trim/collapse the reason so it reads well as one line, and cap it at 300 characters.
  v_reason text := left(btrim(regexp_replace(coalesce(p_reason, ''), '\s+', ' ', 'g')), 300);
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

    update public.orders
       set status = 'Cancelled',
           cancel_reason = v_reason
     where number = n;
    insert into public.order_events (order_number, label, note)
    values (n, 'Cancelled', nullif(v_reason, ''));
    v_cancelled := array_append(v_cancelled, n);
  end loop;

  return v_cancelled;
end;
$$;

revoke execute on function public.admin_cancel_orders(bigint[], text) from public, anon;
grant execute on function public.admin_cancel_orders(bigint[], text) to authenticated;

-- Ask PostgREST to pick up the new function signature straight away.
notify pgrst, 'reload schema';
