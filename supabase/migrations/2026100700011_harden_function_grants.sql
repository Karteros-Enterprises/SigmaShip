-- Tighten execution privileges on SigmaShip SECURITY DEFINER helpers.
-- Migration 001 has already been deployed; keep its history immutable.

revoke execute on function public.is_org_member(uuid) from public, anon;
revoke execute on function public.has_org_role(uuid, public.membership_role[]) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

grant execute on function public.is_org_member(uuid) to authenticated, service_role;
grant execute on function public.has_org_role(uuid, public.membership_role[]) to authenticated, service_role;

-- handle_new_user() is invoked by the auth.users trigger, not by clients.
grant execute on function public.handle_new_user() to service_role;
