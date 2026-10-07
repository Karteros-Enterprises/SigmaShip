-- SigmaShip production foundation
-- Multi-tenant core schema. Provider secrets and raw card data never belong here.

create extension if not exists pgcrypto;

create type public.membership_role as enum ('owner', 'admin', 'shipper', 'accounting', 'viewer');
create type public.integration_status as enum ('not_configured', 'pending', 'connected', 'degraded', 'disconnected');
create type public.shipment_status as enum (
  'draft', 'rated', 'purchased', 'label_created', 'picked_up', 'in_transit',
  'out_for_delivery', 'delivered', 'exception', 'cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.membership_role not null default 'shipper',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text,
  contact_name text not null,
  company text,
  address1 text not null,
  address2 text,
  city text not null,
  region text not null,
  postal_code text not null,
  country_code char(2) not null,
  phone text,
  email text,
  residential boolean not null default false,
  po_box boolean not null default false,
  is_default_sender boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.package_presets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  weight numeric(12,3),
  weight_unit text not null default 'lb' check (weight_unit in ('lb', 'kg')),
  length numeric(12,3) not null check (length > 0),
  width numeric(12,3) not null check (width > 0),
  height numeric(12,3) not null check (height > 0),
  dimension_unit text not null default 'in' check (dimension_unit in ('in', 'cm')),
  created_at timestamptz not null default now()
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  external_account_id text,
  display_name text,
  status public.integration_status not null default 'not_configured',
  configuration jsonb not null default '{}'::jsonb,
  secret_reference text,
  connected_at timestamptz,
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider, external_account_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  integration_id uuid references public.integrations(id) on delete set null,
  external_order_id text,
  order_number text,
  status text not null default 'open',
  currency char(3) not null default 'CAD',
  recipient jsonb not null default '{}'::jsonb,
  raw_source jsonb,
  ordered_at timestamptz,
  imported_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (integration_id, external_order_id)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  external_item_id text,
  sku text,
  title text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2),
  weight numeric(12,3),
  metadata jsonb not null default '{}'::jsonb
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  status public.shipment_status not null default 'draft',
  sender_address jsonb not null,
  recipient_address jsonb not null,
  currency char(3) not null default 'CAD',
  carrier text,
  service text,
  tracking_number text,
  tracking_url text,
  label_url text,
  carrier_cost numeric(12,2),
  customer_charge numeric(12,2),
  markup_amount numeric(12,2),
  byoa_fee numeric(12,2),
  tax_amount numeric(12,2),
  processor_fee numeric(12,2),
  final_revenue numeric(12,2),
  gross_margin numeric(12,2),
  idempotency_key text unique,
  purchased_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipment_packages (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  weight numeric(12,3) not null check (weight > 0),
  weight_unit text not null check (weight_unit in ('lb', 'kg')),
  length numeric(12,3) not null check (length > 0),
  width numeric(12,3) not null check (width > 0),
  height numeric(12,3) not null check (height > 0),
  dimension_unit text not null check (dimension_unit in ('in', 'cm'))
);

create table public.customs_items (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  description text not null,
  country_of_origin char(2) not null,
  hs_code text,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_value numeric(12,2) not null check (unit_value >= 0),
  weight numeric(12,3) not null check (weight > 0)
);

create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status public.shipment_status not null,
  carrier_status text,
  description text not null,
  occurred_at timestamptz not null,
  location jsonb,
  raw_event jsonb,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index memberships_user_idx on public.memberships(user_id);
create index addresses_org_idx on public.addresses(organization_id);
create index integrations_org_idx on public.integrations(organization_id);
create index orders_org_created_idx on public.orders(organization_id, created_at desc);
create index shipments_org_created_idx on public.shipments(organization_id, created_at desc);
create index shipments_tracking_idx on public.shipments(tracking_number);
create index tracking_events_shipment_time_idx on public.tracking_events(shipment_id, occurred_at desc);

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = target_org
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(target_org uuid, allowed_roles public.membership_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = target_org
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.addresses enable row level security;
alter table public.package_presets enable row level security;
alter table public.integrations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_packages enable row level security;
alter table public.customs_items enable row level security;
alter table public.tracking_events enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles_read_self" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "organizations_read_member" on public.organizations
  for select using (public.is_org_member(id));

create policy "memberships_read_member" on public.memberships
  for select using (public.is_org_member(organization_id));

create policy "addresses_member_all" on public.addresses
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "packages_member_all" on public.package_presets
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "integrations_member_read" on public.integrations
  for select using (public.is_org_member(organization_id));

create policy "integrations_admin_write" on public.integrations
  for all using (public.has_org_role(organization_id, array['owner','admin']::public.membership_role[]))
  with check (public.has_org_role(organization_id, array['owner','admin']::public.membership_role[]));

create policy "orders_member_read" on public.orders
  for select using (public.is_org_member(organization_id));

create policy "order_items_member_read" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and public.is_org_member(orders.organization_id)
    )
  );

create policy "shipments_member_read" on public.shipments
  for select using (public.is_org_member(organization_id));

create policy "shipment_packages_member_read" on public.shipment_packages
  for select using (
    exists (
      select 1 from public.shipments
      where shipments.id = shipment_packages.shipment_id
        and public.is_org_member(shipments.organization_id)
    )
  );

create policy "customs_items_member_read" on public.customs_items
  for select using (
    exists (
      select 1 from public.shipments
      where shipments.id = customs_items.shipment_id
        and public.is_org_member(shipments.organization_id)
    )
  );

create policy "tracking_events_member_read" on public.tracking_events
  for select using (
    exists (
      select 1 from public.shipments
      where shipments.id = tracking_events.shipment_id
        and public.is_org_member(shipments.organization_id)
    )
  );

create policy "audit_events_member_read" on public.audit_events
  for select using (public.is_org_member(organization_id));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Browser clients may read operational records, but authoritative order,
-- shipment, tracking, audit and financial writes are server-only.
revoke insert, update, delete on public.orders from anon, authenticated;
revoke insert, update, delete on public.order_items from anon, authenticated;
revoke insert, update, delete on public.shipments from anon, authenticated;
revoke insert, update, delete on public.shipment_packages from anon, authenticated;
revoke insert, update, delete on public.customs_items from anon, authenticated;
revoke insert, update, delete on public.tracking_events from anon, authenticated;
revoke insert, update, delete on public.audit_events from anon, authenticated;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_role(uuid, public.membership_role[]) from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, public.membership_role[]) to authenticated;
