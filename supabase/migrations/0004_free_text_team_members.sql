-- Team members no longer require a Supabase Auth account: a team member can
-- be a real user (user_id) or a plain name (member_name) carried over from
-- the old CRM's "Added by" style attribution.
alter table public.company_team_members
  alter column user_id drop not null,
  add column if not exists member_name text;

alter table public.company_team_members
  drop constraint if exists company_team_members_member_check,
  add constraint company_team_members_member_check
    check (user_id is not null or member_name is not null);

-- The existing unique (company_id, user_id) constraint only applies when
-- user_id is set (nulls are distinct in a unique index), which is fine:
-- free-text members aren't deduplicated by name.
