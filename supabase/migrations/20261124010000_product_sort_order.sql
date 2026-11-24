-- Let the admin choose the order products appear in on the website (Admin → Products & Stock, ↑ / ↓).
-- 0 = "not positioned yet": those products keep their catalogue order and sit after the positioned ones.
-- Run after 20261123000000_product_channels_pack_sizes.sql. Safe to run more than once.

alter table public.products
  add column if not exists sort_order integer not null default 0 check (sort_order >= 0);

create index if not exists products_sort_order_idx on public.products (channel, sort_order);
