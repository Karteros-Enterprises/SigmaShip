-- SigmaShip platform administration and commercial controls
create type public.platform_role as enum ('owner','admin','operations','accounting','sales','support');
create type public.carrier_account_owner as enum ('sigmaship','customer','admin_managed');
create table public.platform_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role public.platform_role not null,
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.carrier_accounts (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid references public.organizations(id) on delete cascade,
 provider text not null,
 ownership public.carrier_account_owner not null,
 display_name text not null,
 external_account_id text,
 status public.integration_status not null default 'pending',
 secret_reference text,
 configuration jsonb not null default '{}'::jsonb,
 enabled boolean not null default true,
 validated_at timestamptz,
 last_error text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.pricing_profiles (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null,
 version integer not null default 1,
 active boolean not null default true,
 effective_from timestamptz not null default now(),
 effective_to timestamptz,
 rules jsonb not null default '{}'::jsonb,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 unique(organization_id,name,version)
);
create table public.accessorial_profiles (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null,
 version integer not null default 1,
 active boolean not null default true,
 effective_from timestamptz not null default now(),
 effective_to timestamptz,
 rules jsonb not null default '{}'::jsonb,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 unique(organization_id,name,version)
);
create table public.documents (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid references public.organizations(id) on delete cascade,
 shipment_id uuid references public.shipments(id) on delete cascade,
 category text not null,
 name text not null,
 storage_path text not null,
 version integer not null default 1,
 metadata jsonb not null default '{}'::jsonb,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now()
);
create or replace function public.is_platform_user()
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.platform_users where user_id=auth.uid() and active=true); $$;
alter table public.platform_users enable row level security;
alter table public.carrier_accounts enable row level security;
alter table public.pricing_profiles enable row level security;
alter table public.accessorial_profiles enable row level security;
alter table public.documents enable row level security;
create policy "platform_users_self" on public.platform_users for select using(user_id=auth.uid());
create policy "carrier_accounts_platform" on public.carrier_accounts for select using(public.is_platform_user());
create policy "pricing_platform" on public.pricing_profiles for select using(public.is_platform_user());
create policy "accessorial_platform" on public.accessorial_profiles for select using(public.is_platform_user());
create policy "documents_platform" on public.documents for select using(public.is_platform_user());
revoke insert,update,delete on public.platform_users,public.carrier_accounts,public.pricing_profiles,public.accessorial_profiles,public.documents from anon,authenticated;
revoke all on function public.is_platform_user() from public;
grant execute on function public.is_platform_user() to authenticated;
create index carrier_accounts_org_idx on public.carrier_accounts(organization_id);
create index pricing_profiles_org_idx on public.pricing_profiles(organization_id);
create index accessorial_profiles_org_idx on public.accessorial_profiles(organization_id);
create index documents_org_idx on public.documents(organization_id);
