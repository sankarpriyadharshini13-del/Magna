-- Add quantity tracking for each pack size.
-- This allows the admin to specify stock levels per pack size instead of a single global stock.
-- Safe to run more than once.

alter table public.products
  add column if not exists pack_stock jsonb not null default '{}'::jsonb;

-- Migrate existing single stock to pack_stock if pack_stock is empty
-- Use a CTE to aggregate first, then update
with migration_data as (
  select
    id,
    jsonb_object_agg(
      coalesce(pack_sizes[1], pack_size),
      stock
    ) as new_pack_stock
  from public.products
  where pack_stock = '{}'::jsonb
    and (cardinality(pack_sizes) > 0 or btrim(pack_size) <> '')
  group by id, stock, pack_sizes, pack_size
)
update public.products
set pack_stock = md.new_pack_stock
from migration_data md
where public.products.id = md.id;

comment on column public.products.pack_stock is 'Stock quantity per pack size, e.g. {"200 g": 50, "500 g": 30}. Falls back to global stock if empty.';
