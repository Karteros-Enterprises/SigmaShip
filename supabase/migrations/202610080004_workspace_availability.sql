-- Allow signed-in users to check public-facing SigmaSpace name and ID availability.
-- Only returns booleans; never exposes organization or member records.
create or replace function public.sigma_space_availability(candidate_name text, candidate_slug text)
returns table (name_available boolean, slug_available boolean)
language sql stable security definer set search_path = ''
as $$
  select
    not exists (select 1 from public.organizations where lower(btrim(name)) = lower(btrim(candidate_name))),
    not exists (select 1 from public.organizations where lower(slug) = lower(candidate_slug));
$$;
revoke all on function public.sigma_space_availability(text,text) from public;
revoke all on function public.sigma_space_availability(text,text) from anon;
grant execute on function public.sigma_space_availability(text,text) to authenticated;
create unique index if not exists organizations_name_ci_unique on public.organizations (lower(btrim(name)));
