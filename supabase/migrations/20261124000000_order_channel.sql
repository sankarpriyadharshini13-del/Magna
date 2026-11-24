-- Which part of the website an order came from: the shop (Ecommerce), /distributors or /export.
-- Admin → Orders and Admin → Customers split their lists by this value.
-- Run after 20261123000000_product_channels_pack_sizes.sql. Safe to run more than once.

alter table public.orders
  add column if not exists channel text not null default 'ecommerce';

alter table public.orders drop constraint if exists orders_channel_check;
alter table public.orders add constraint orders_channel_check
  check (channel in ('ecommerce', 'distributors', 'export'));

-- Enquiries saved before this column existed name their page in the order's single line item.
update public.orders o
set channel = case
  when exists (
    select 1 from public.order_items i
    where i.order_number = o.number and i.name = 'Distributor application'
  ) then 'distributors'
  when exists (
    select 1 from public.order_items i
    where i.order_number = o.number and i.name = 'Export enquiry'
  ) then 'export'
  else 'ecommerce'
end
where o.source = 'enquiry';

create index if not exists orders_channel_placed_idx on public.orders (channel, placed_at desc);
