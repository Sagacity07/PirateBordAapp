-- Canonical Pirate Borg Companion cloud schema. Applied to project ahubumpcxhwppovllxvf.
-- The live schema includes profiles, campaigns, campaign_members, player_states,
-- campaign_records, journal_entries, RLS policies, invite-code RPC, and Realtime publication.
-- Manage subsequent changes through reviewed SQL and keep RLS enabled on every public table.

-- RLS policies invoke these private SECURITY DEFINER helpers. Authenticated users
-- need EXECUTE permission even though the functions are not exposed by the Data API.
grant execute on function private.is_campaign_member(uuid, uuid) to authenticated;
grant execute on function private.is_campaign_owner(uuid, uuid) to authenticated;

-- Owners must be able to read a newly inserted campaign before the owner-member
-- trigger has finished making membership visible to the normal member check.
drop policy if exists campaigns_select_member on public.campaigns;
create policy campaigns_select_member on public.campaigns for select to authenticated
using (owner_id=(select auth.uid()) or private.is_campaign_member(id,(select auth.uid())));

-- A deliberately data-free endpoint used by the scheduled GitHub health check.
-- Anonymous clients can read the single constant row, but cannot insert, update,
-- or delete anything. This keeps campaign tables and user data private.
create table if not exists public.app_health (
  id boolean primary key default true check (id)
);
insert into public.app_health(id) values (true) on conflict (id) do nothing;
alter table public.app_health enable row level security;
revoke all on public.app_health from anon, authenticated;
grant select on public.app_health to anon, authenticated;
drop policy if exists app_health_read on public.app_health;
create policy app_health_read on public.app_health for select to anon, authenticated using (true);
