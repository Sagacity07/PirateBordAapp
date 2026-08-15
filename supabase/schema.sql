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
