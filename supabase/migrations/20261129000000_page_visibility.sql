-- Page-wide product visibility for the storefront (Admin → Products & Stock → page switch).
-- The switches live in app_settings.data.pages. This function lets the public pages read just that
-- object without exposing the rest of the settings, and works for signed-out visitors.
-- Run after 20261128010000_product_page_flags.sql. Safe to run more than once.

create or replace function public.public_page_visibility()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select data -> 'pages' from public.app_settings where id = 1),
    '{}'::jsonb
  );
$$;

revoke all on function public.public_page_visibility() from public;
grant execute on function public.public_page_visibility() to anon, authenticated;
