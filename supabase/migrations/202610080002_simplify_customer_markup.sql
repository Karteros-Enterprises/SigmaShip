-- Simplify commercial pricing: markup belongs directly to the customer organization.
-- Retain legacy profile tables and data; new pricing uses organization markup columns.
-- Do not drop legacy tables in an automated production migration.
alter table public.organizations
  add column if not exists markup_percent numeric(7,4) not null default 0,
  add column if not exists markup_fixed numeric(12,2) not null default 0,
  add column if not exists accessorial_markup_percent numeric(7,4) not null default 0,
  add column if not exists accessorial_markup_fixed numeric(12,2) not null default 0;
alter table public.organizations
  add constraint organizations_markup_percent_check check (markup_percent >= 0),
  add constraint organizations_markup_fixed_check check (markup_fixed >= 0),
  add constraint organizations_accessorial_markup_percent_check check (accessorial_markup_percent >= 0),
  add constraint organizations_accessorial_markup_fixed_check check (accessorial_markup_fixed >= 0);
