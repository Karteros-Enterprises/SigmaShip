-- Proof-of-concept workflow support.

create type public.pickup_status as enum (
  'scheduled',
  'cancelled',
  'completed'
);

create table public.onboarding_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  completed boolean not null default false,
  current_step text not null default 'organization',
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.rate_quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid references public.shipments(id) on delete cascade,
  provider text not null,
  service_code text not null,
  service_name text not null,
  carrier_cost numeric(12,2) not null,
  customer_price numeric(12,2) not null,
  markup_amount numeric(12,2) not null default 0,
  currency char(3) not null default 'CAD',
  transit_days integer,
  estimated_delivery timestamptz,
  expires_at timestamptz not null,
  raw_rate jsonb,
  created_at timestamptz not null default now()
);

create table public.pickups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  confirmation_number text not null,
  status public.pickup_status not null default 'scheduled',
  address jsonb not null,
  window_start timestamptz not null,
  window_end timestamptz not null,
  instructions text,
  cancelled_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (provider, confirmation_number)
);

create table public.pickup_shipments (
  pickup_id uuid not null references public.pickups(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  primary key (pickup_id, shipment_id)
);

alter table public.shipments
  add column cancelled_at timestamptz,
  add column cancellation_reason text,
  add column void_reference text;

create index rate_quotes_org_created_idx
  on public.rate_quotes(organization_id, created_at desc);

create index pickups_org_created_idx
  on public.pickups(organization_id, created_at desc);

alter table public.onboarding_states enable row level security;
alter table public.rate_quotes enable row level security;
alter table public.pickups enable row level security;
alter table public.pickup_shipments enable row level security;

create policy "onboarding_read_self"
  on public.onboarding_states
  for select
  using (user_id = auth.uid());

create policy "onboarding_update_self"
  on public.onboarding_states
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "rate_quotes_member_read"
  on public.rate_quotes
  for select
  using (public.is_org_member(organization_id));

create policy "pickups_member_read"
  on public.pickups
  for select
  using (public.is_org_member(organization_id));

create policy "pickup_shipments_member_read"
  on public.pickup_shipments
  for select
  using (
    exists (
      select 1
      from public.pickups
      where pickups.id = pickup_shipments.pickup_id
        and public.is_org_member(pickups.organization_id)
    )
  );


-- Rates and pickups are authoritative carrier operations. Browser clients
-- can read their organization's records; Nitro server routes perform writes.
revoke insert, update, delete on public.rate_quotes from anon, authenticated;
revoke insert, update, delete on public.pickups from anon, authenticated;
revoke insert, update, delete on public.pickup_shipments from anon, authenticated;

-- Onboarding is the one authenticated client mutation that must create an
-- organization and its owner membership atomically.
create or replace function public.create_organization(
  organization_name text,
  organization_slug text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_organization_id uuid;
  normalized_name text := btrim(organization_name);
  normalized_slug text := lower(btrim(organization_slug));
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if char_length(normalized_name) < 2 then
    raise exception 'Organization name is required';
  end if;

  if normalized_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Organization slug is invalid';
  end if;

  if exists (
    select 1
    from public.memberships
    where user_id = auth.uid()
  ) then
    raise exception 'User already belongs to an organization';
  end if;

  insert into public.organizations (name, slug)
  values (normalized_name, normalized_slug)
  returning id into new_organization_id;

  insert into public.memberships (organization_id, user_id, role)
  values (new_organization_id, auth.uid(), 'owner');

  insert into public.onboarding_states (
    user_id,
    organization_id,
    completed,
    current_step,
    completed_at
  )
  values (
    auth.uid(),
    new_organization_id,
    true,
    'complete',
    now()
  )
  on conflict (user_id) do update
  set organization_id = excluded.organization_id,
      completed = true,
      current_step = 'complete',
      completed_at = now(),
      updated_at = now();

  return new_organization_id;
end;
$$;

revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;
