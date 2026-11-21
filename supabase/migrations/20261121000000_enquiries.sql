-- Website enquiries (Business / Distributors / Export pages) are saved as orders with
-- source = 'enquiry' so they show up in Admin → Orders next to real orders.
-- Run after 20261101000000_manual_orders.sql (which created the source check). Safe to run more than once.

alter table public.orders drop constraint if exists orders_source_check;
alter table public.orders add constraint orders_source_check check (source in ('online', 'admin', 'enquiry'));
