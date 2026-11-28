-- Destination country for website enquiries (Distributor / Export forms).
-- Run after 20261124000000_order_channel.sql. Safe to run more than once.

alter table public.orders add column if not exists ship_country text not null default '';

alter table public.orders drop constraint if exists orders_ship_country_length;
alter table public.orders add constraint orders_ship_country_length check (length(ship_country) <= 80);
