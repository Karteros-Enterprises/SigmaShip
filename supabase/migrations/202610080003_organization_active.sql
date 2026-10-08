-- Customer ΣigmaSpace access is controlled centrally by platform administrators.
alter table public.organizations add column if not exists is_active boolean not null default true;
create index if not exists organizations_active_idx on public.organizations(is_active);
