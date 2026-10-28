-- JosHomes Milestone 1 — row level security.
--
-- These policies REINFORCE the application-layer authorization in
-- src/lib/domain/authorization.ts. Both layers must agree; the database is the
-- backstop that holds even if an application check is bypassed.
--
-- Covers acceptance C1 (lister owns edits), C2 (lister cannot self-approve),
-- C3 (role escalation blocked), and the moderator/admin separation.

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so they can read profiles under RLS)
-- ---------------------------------------------------------------------------

create or replace function current_profile_id() returns uuid
language sql stable
set search_path = public, pg_catalog
as $$
  select auth.uid();
$$;

create or replace function current_user_role() returns user_role
language sql stable security definer
set search_path = public, pg_catalog
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin() returns boolean
language sql stable security definer
set search_path = public, pg_catalog
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'admin', false);
$$;

create or replace function is_moderator_or_admin() returns boolean
language sql stable security definer
set search_path = public, pg_catalog
as $$
  select coalesce(
    (select role from profiles where id = auth.uid()) in ('moderator', 'admin'), false);
$$;

-- Does the current user own / manage this property?
create or replace function manages_property(target_property_id uuid) returns boolean
language sql stable security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from properties p
    where p.id = target_property_id
      and (p.created_by = auth.uid() or p.assigned_lister_id = auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere. Default deny; policies open only what is needed.
-- ---------------------------------------------------------------------------

alter table profiles               enable row level security;
alter table lister_profiles        enable row level security;
alter table areas                  enable row level security;
alter table properties             enable row level security;
alter table listings               enable row level security;
alter table listing_media          enable row level security;
alter table listing_status_history enable row level security;
alter table verification_records   enable row level security;
alter table audit_logs             enable row level security;

-- ---------------------------------------------------------------------------
-- areas — public read-only vocabulary; only admins may change it.
-- ---------------------------------------------------------------------------

create policy areas_select_all on areas
  for select using (true);

create policy areas_admin_write on areas
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- profiles
--   * a user reads and updates only their own profile;
--   * staff may read profiles for moderation duties;
--   * NOBODY may change their own role -> role escalation blocked (C3).
--     Role changes are performed by an admin only.
-- ---------------------------------------------------------------------------

create policy profiles_select_self on profiles
  for select using (id = auth.uid());

create policy profiles_select_staff on profiles
  for select using (is_moderator_or_admin());

create policy profiles_update_self_no_role_change on profiles
  for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- The role must remain exactly what it already is.
    and role = (select p.role from profiles p where p.id = auth.uid())
  );

create policy profiles_admin_manage on profiles
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- lister_profiles — a lister manages only their own; staff may read.
-- ---------------------------------------------------------------------------

create policy lister_profiles_select_self on lister_profiles
  for select using (profile_id = auth.uid());

create policy lister_profiles_select_staff on lister_profiles
  for select using (is_moderator_or_admin());

create policy lister_profiles_modify_self on lister_profiles
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy lister_profiles_admin_manage on lister_profiles
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- properties — owner/assigned lister only; staff read for moderation (C1).
-- ---------------------------------------------------------------------------

create policy properties_select_own on properties
  for select using (created_by = auth.uid() or assigned_lister_id = auth.uid());

create policy properties_select_staff on properties
  for select using (is_moderator_or_admin());

create policy properties_insert_own on properties
  for insert with check (created_by = auth.uid() and assigned_lister_id = auth.uid());

create policy properties_update_own on properties
  for update
  using (created_by = auth.uid() or assigned_lister_id = auth.uid())
  with check (created_by = auth.uid() or assigned_lister_id = auth.uid());

create policy properties_admin_manage on properties
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- listings
--   * a lister reads/edits only listings on properties they manage (C1);
--   * a lister may NEVER set workflow_state to 'approved' (C2) — enforced by
--     the with-check below plus the trigger further down;
--   * moderators may review and change workflow state;
--   * admins have full control.
-- ---------------------------------------------------------------------------

create policy listings_select_own on listings
  for select using (manages_property(property_id));

create policy listings_select_staff on listings
  for select using (is_moderator_or_admin());

create policy listings_insert_own on listings
  for insert with check (
    manages_property(property_id)
    and created_by = auth.uid()
    -- A new listing may only start as a draft or a submission.
    and workflow_state in ('draft', 'submitted')
  );

create policy listings_update_own on listings
  for update
  using (manages_property(property_id))
  with check (
    manages_property(property_id)
    -- A lister can never move a listing into an approved/rejected/suspended state.
    and workflow_state in ('draft', 'submitted', 'changes_requested', 'archived')
  );

create policy listings_staff_review on listings
  for update using (is_moderator_or_admin()) with check (is_moderator_or_admin());

create policy listings_admin_manage on listings
  for all using (is_admin()) with check (is_admin());

-- Belt-and-braces: block a self-approval even if a policy is later loosened.
create or replace function forbid_self_approval() returns trigger
language plpgsql security definer
set search_path = public, pg_catalog
as $$
begin
  if new.workflow_state = 'approved'
     and old.workflow_state is distinct from 'approved'
     and not is_moderator_or_admin() then
    raise exception 'Only a moderator or administrator can approve a listing';
  end if;
  return new;
end;
$$;

create trigger listings_forbid_self_approval
  before update on listings
  for each row execute function forbid_self_approval();

-- ---------------------------------------------------------------------------
-- listing_media — a lister may only touch media on listings they manage (H3).
-- ---------------------------------------------------------------------------

create policy listing_media_select_own on listing_media
  for select using (
    exists (select 1 from listings l where l.id = listing_id and manages_property(l.property_id))
  );

create policy listing_media_select_staff on listing_media
  for select using (is_moderator_or_admin());

create policy listing_media_modify_own on listing_media
  for all
  using (
    exists (select 1 from listings l where l.id = listing_id and manages_property(l.property_id))
  )
  with check (
    exists (select 1 from listings l where l.id = listing_id and manages_property(l.property_id))
    and uploaded_by = auth.uid()
    -- A lister cannot approve their own media.
    and moderation_state in ('pending', 'rejected')
  );

create policy listing_media_staff_moderate on listing_media
  for all using (is_moderator_or_admin()) with check (is_moderator_or_admin());

-- ---------------------------------------------------------------------------
-- listing_status_history — append-only. Readable by owner and staff, never
-- updatable or deletable by ordinary users.
-- ---------------------------------------------------------------------------

create policy status_history_select_own on listing_status_history
  for select using (
    exists (select 1 from listings l where l.id = listing_id and manages_property(l.property_id))
  );

create policy status_history_select_staff on listing_status_history
  for select using (is_moderator_or_admin());

create policy status_history_insert on listing_status_history
  for insert with check (
    is_moderator_or_admin()
    or exists (select 1 from listings l where l.id = listing_id and manages_property(l.property_id))
  );
-- Deliberately no UPDATE or DELETE policy: history is immutable to users.

-- ---------------------------------------------------------------------------
-- verification_records
--   * a lister sees the RESULT of checks about themselves, but evidence access
--     is restricted; moderators do not automatically get evidence (J3).
--   * only admins may issue or revoke.
-- ---------------------------------------------------------------------------

create policy verification_select_subject on verification_records
  for select using (subject_type = 'profile' and subject_id = auth.uid());

create policy verification_select_admin on verification_records
  for select using (is_admin());

create policy verification_admin_manage on verification_records
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- audit_logs — admins read; nobody updates or deletes. Writes happen through
-- server-side service-role code, which bypasses RLS.
-- ---------------------------------------------------------------------------

create policy audit_logs_select_admin on audit_logs
  for select using (is_admin());
