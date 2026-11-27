-- Store selling and original prices for each pack size.
-- Existing product prices are copied to every existing pack size for compatibility.

alter table public.products
  add column if not exists pack_prices jsonb not null default '{}'::jsonb;

update public.products p
set pack_prices = (
  select coalesce(
    jsonb_object_agg(s.size, jsonb_build_object('price', p.price, 'originalPrice', p.original_price)),
    '{}'::jsonb
  )
  from unnest(
    case
      when cardinality(p.pack_sizes) > 0 then p.pack_sizes
      when btrim(coalesce(p.pack_size, '')) <> '' then array[p.pack_size]
      else array[]::text[]
    end
  ) as s(size)
)
where p.pack_prices = '{}'::jsonb;

comment on column public.products.pack_prices is
  'Selling and original prices by pack size, e.g. {"200 g":{"price":120,"originalPrice":150}}.';
