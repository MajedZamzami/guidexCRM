-- Contacts, the buying committee, communication log, assigned team
-- members, follow-ups, team discussion, and files now belong to a
-- specific project (deal), not the company as a whole -- a company can
-- have several projects in flight, each with its own set of these.
-- Old company_id columns are left in place (unused by the app going
-- forward) rather than dropped, matching the non-destructive approach
-- used for the companies -> projects split.

alter table public.contacts add column project_id uuid references public.projects (id) on delete cascade;
alter table public.buying_committee_roles add column project_id uuid references public.projects (id) on delete cascade;
alter table public.interactions add column project_id uuid references public.projects (id) on delete cascade;
alter table public.company_team_members add column project_id uuid references public.projects (id) on delete cascade;
alter table public.follow_ups add column project_id uuid references public.projects (id) on delete cascade;
alter table public.comments add column project_id uuid references public.projects (id) on delete cascade;
alter table public.files add column project_id uuid references public.projects (id) on delete cascade;
alter table public.projects add column contact_method text;

-- ─── BACKFILL: point every row at its company's default project ─────
update public.contacts c set project_id = p.id
  from public.projects p where p.company_id = c.company_id and p.is_default = true;
update public.buying_committee_roles t set project_id = p.id
  from public.projects p where p.company_id = t.company_id and p.is_default = true;
update public.interactions t set project_id = p.id
  from public.projects p where p.company_id = t.company_id and p.is_default = true;
update public.company_team_members t set project_id = p.id
  from public.projects p where p.company_id = t.company_id and p.is_default = true;
update public.follow_ups t set project_id = p.id
  from public.projects p where p.company_id = t.company_id and p.is_default = true;
update public.comments t set project_id = p.id
  from public.projects p where p.company_id = t.company_id and p.is_default = true;
update public.files t set project_id = p.id
  from public.projects p where p.company_id = t.company_id and p.is_default = true;
update public.projects p set contact_method = c.contact_method
  from public.companies c where c.id = p.company_id;

-- ─── ENFORCE NOT NULL NOW THAT BACKFILL IS COMPLETE ──────────────────
alter table public.contacts alter column project_id set not null;
alter table public.buying_committee_roles alter column project_id set not null;
alter table public.interactions alter column project_id set not null;
alter table public.company_team_members alter column project_id set not null;
alter table public.follow_ups alter column project_id set not null;
alter table public.comments alter column project_id set not null;
alter table public.files alter column project_id set not null;

-- ─── INDEXES ──────────────────────────────────────────────────────────
create index if not exists contacts_project_id_idx on public.contacts (project_id);
create index if not exists buying_committee_roles_project_id_idx on public.buying_committee_roles (project_id);
create index if not exists interactions_project_id_idx on public.interactions (project_id);
create index if not exists company_team_members_project_id_idx on public.company_team_members (project_id);
create index if not exists follow_ups_project_id_idx on public.follow_ups (project_id);
create index if not exists comments_project_id_idx on public.comments (project_id);
create index if not exists files_project_id_idx on public.files (project_id);

-- ─── "one primary contact per project" (was "per company") ──────────
drop index if exists contacts_one_primary_per_company;
create unique index if not exists contacts_one_primary_per_project
  on public.contacts (project_id) where is_primary;

-- ─── "one team assignment per project" (was "per company") ──────────
alter table public.company_team_members
  drop constraint if exists company_team_members_company_id_user_id_key;
create unique index if not exists company_team_members_project_id_user_id_key
  on public.company_team_members (project_id, user_id) where user_id is not null;
