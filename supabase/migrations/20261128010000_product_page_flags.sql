-- Per-page product visibility: Ecommerce, Distributors and Export can now be chosen independently.
-- Run after 20261124010000_product_sort_order.sql. Safe to run more than once.

alter table public.products add column if not exists show_ecommerce boolean;
alter table public.products add column if not exists show_distributors boolean;
alter table public.products add column if not exists show_export boolean;

-- One-time backfill from the old channel rule: ecommerce products were on the shop and the
-- distributor page; export products were on /export only. Rows already set are left alone.
update public.products
   set show_ecommerce   = coalesce(show_ecommerce, coalesce(channel, 'ecommerce') <> 'export'),
       show_distributors = coalesce(show_distributors, coalesce(channel, 'ecommerce') <> 'export'),
       show_export       = coalesce(show_export, coalesce(channel, 'ecommerce') = 'export')
 where show_ecommerce is null or show_distributors is null or show_export is null;

alter table public.products alter column show_ecommerce set default true;
alter table public.products alter column show_distributors set default true;
alter table public.products alter column show_export set default false;
alter table public.products alter column show_ecommerce set not null;
alter table public.products alter column show_distributors set not null;
alter table public.products alter column show_export set not null;
