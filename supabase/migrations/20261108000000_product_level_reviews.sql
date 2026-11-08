-- Change reviews from order-level to product-level, and only allow reviews after delivery.
-- Run after 20261028000000_reviews.sql and 20261102000000_order_delivery.sql.
--
--   * Each product in an order can be reviewed separately (one review per product per order)
--   * Reviews can only be submitted after the order status is 'Delivered'
--   * Existing order-level reviews are preserved but migrated to the first product in the order

-- Add product_id column to reviews table
alter table public.reviews add column if not exists product_id text references public.products (id) on delete set null;

-- Change unique constraint from order_number to (order_number, product_id)
-- First drop the old unique constraint on order_number
alter table public.reviews drop constraint if exists reviews_order_number_key;

-- Add new unique constraint on (order_number, product_id)
alter table public.reviews add constraint reviews_order_product_key unique (order_number, product_id);

-- Migrate existing reviews to the first product in each order
update public.reviews r
set product_id = (
  select oi.product_id
  from public.order_items oi
  where oi.order_number = r.order_number
  and oi.product_id is not null
  order by oi.id
  limit 1
)
where r.product_id is null;

-- Update RLS policy to require delivery status
drop policy if exists reviews_own_insert on public.reviews;
create policy reviews_own_insert on public.reviews
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.orders o join public.customers c on c.id = o.customer_id
      where o.number = reviews.order_number
      and c.user_id = (select auth.uid())
      and o.status = 'Delivered'
    )
    and reviews.product_id is not null
  );

-- Update the trigger to ensure product_id is set
create or replace function public.set_review_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.user_id := (select auth.uid());
  new.message := btrim(coalesce(new.message, ''));
  new.created_at := now();
  new.published := false;
  new.published_at := null;
  new.customer_name := coalesce(
    (select nullif(btrim(o.ship_name), '') from public.orders o where o.number = new.order_number),
    (select nullif(btrim(c.name), '') from public.orders o join public.customers c on c.id = o.customer_id where o.number = new.order_number),
    'Customer'
  );
  -- Ensure product_id is set
  if new.product_id is null then
    raise exception 'product_id_required' using errcode = '23502';
  end if;
  return new;
end;
$$;

-- Update published_reviews function to use product_id (only runs after product_id column exists)
create or replace function public.published_reviews(p_limit integer default 12)
returns table (id uuid, name text, rating smallint, message text, products text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id,
         public.review_display_name(r.customer_name),
         r.rating,
         r.message,
         coalesce(p.name, 'Unknown product'),
         r.created_at
  from public.reviews r
  left join public.products p on p.id = r.product_id
  where r.published
  order by r.created_at desc
  limit least(greatest(coalesce(p_limit, 12), 1), 50)
$$;

-- Update published_reviews_page function to use product_id (only runs after product_id column exists)
create or replace function public.published_reviews_page(p_limit integer default 12, p_offset integer default 0, p_rating integer default null)
returns table (id uuid, name text, rating smallint, message text, products text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id,
         public.review_display_name(r.customer_name),
         r.rating,
         r.message,
         coalesce(p.name, 'Unknown product'),
         r.created_at
  from public.reviews r
  left join public.products p on p.id = r.product_id
  where r.published and (p_rating is null or r.rating = p_rating)
  order by r.created_at desc, r.id
  limit least(greatest(coalesce(p_limit, 12), 1), 50)
  offset greatest(coalesce(p_offset, 0), 0)
$$;

revoke execute on function public.published_reviews(integer) from public;
grant execute on function public.published_reviews(integer) to anon, authenticated, service_role;
revoke execute on function public.published_reviews_page(integer, integer, integer) from public;
grant execute on function public.published_reviews_page(integer, integer, integer) to anon, authenticated, service_role;
