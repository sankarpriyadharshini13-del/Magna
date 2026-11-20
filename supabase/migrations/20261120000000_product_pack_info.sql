-- "Know your pack" block on the product page (optional, per product).
--   pack_enabled                 = admin on/off switch for the section
--   pack_ingredients, pack_benefits = free text
--   pack_who_can_eat, pack_who_should_be_careful = one bullet point per line
-- Safe to run more than once.

alter table public.products
  add column if not exists pack_enabled boolean not null default true,
  add column if not exists pack_ingredients text not null default '',
  add column if not exists pack_benefits text not null default '',
  add column if not exists pack_who_can_eat text not null default '',
  add column if not exists pack_who_should_be_careful text not null default '';
