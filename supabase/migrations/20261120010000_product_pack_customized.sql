-- Remembers that the admin saved the "Know your pack" block for a product.
-- Without it, clearing every box would look the same as "never edited" and the
-- built-in guide from data/dietary.ts would come back. Not set by hand.
-- Safe to run more than once.

alter table public.products
  add column if not exists pack_customized boolean not null default false;
