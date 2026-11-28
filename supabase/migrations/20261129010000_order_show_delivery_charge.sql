-- Distributor / Export invoice delivery option: keep the delivery charge in the total but choose
-- whether the invoice prints the charge line. 0 in delivery_charge means "Free delivery".
-- Run after 20261109000000_delivery_charge.sql. Safe to run more than once.

alter table public.orders add column if not exists show_delivery_charge boolean not null default false;
