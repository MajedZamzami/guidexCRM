-- Company detail page: contacts, buying committee, communication log,
-- team assignment, follow-ups, comments, and file uploads.
-- Everything stays scoped to a company (no standalone Prospects section).

alter table public.companies
  add column if not exists contact_method text;

-- ─── CONTACTS (company-scoped, not a standalone Prospects entity) ──
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  title text,
  email text,
  phone text,
  linkedin_url text,
  is_primary boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

create policy "authenticated users can manage contacts"
  on public.contacts for all
  to authenticated
  using (true)
  with check (true);

create index if not exists contacts_company_id_idx on public.contacts (company_id);

-- only one primary contact per company
create unique index if not exists contacts_one_primary_per_company
  on public.contacts (company_id)
  where is_primary;

-- ─── BUYING COMMITTEE ROLES ─────────────────────────────────
create table if not exists public.buying_committee_roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  role text not null check (role in ('decision_maker', 'budget_holder', 'champion', 'blocker', 'other')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.buying_committee_roles enable row level security;

create policy "authenticated users can manage buying committee roles"
  on public.buying_committee_roles for all
  to authenticated
  using (true)
  with check (true);

create index if not exists buying_committee_roles_company_id_idx
  on public.buying_committee_roles (company_id);

-- ─── COMMUNICATION TRACKER ──────────────────────────────────
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  type text not null check (type in ('call', 'email', 'meeting', 'whatsapp', 'note', 'other')),
  notes text,
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.interactions enable row level security;

create policy "authenticated users can manage interactions"
  on public.interactions for all
  to authenticated
  using (true)
  with check (true);

create index if not exists interactions_company_id_idx on public.interactions (company_id);

-- ─── ASSIGNED TEAM MEMBERS ───────────────────────────────────
create table if not exists public.company_team_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (company_id, user_id)
);

alter table public.company_team_members enable row level security;

create policy "authenticated users can manage team assignments"
  on public.company_team_members for all
  to authenticated
  using (true)
  with check (true);

-- ─── FOLLOW-UP DATES ─────────────────────────────────────────
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  due_date date not null,
  note text,
  is_done boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.follow_ups enable row level security;

create policy "authenticated users can manage follow ups"
  on public.follow_ups for all
  to authenticated
  using (true)
  with check (true);

create index if not exists follow_ups_company_id_idx on public.follow_ups (company_id);

-- ─── TEAM DISCUSSION (COMMENTS) ──────────────────────────────
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "authenticated users can manage comments"
  on public.comments for all
  to authenticated
  using (true)
  with check (true);

create index if not exists comments_company_id_idx on public.comments (company_id);

-- ─── FILES ───────────────────────────────────────────────────
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  storage_path text not null,
  size bigint,
  content_type text,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.files enable row level security;

create policy "authenticated users can manage files"
  on public.files for all
  to authenticated
  using (true)
  with check (true);

create index if not exists files_company_id_idx on public.files (company_id);

-- ─── STORAGE BUCKET FOR UPLOADS ──────────────────────────────
insert into storage.buckets (id, name, public)
values ('company-files', 'company-files', false)
on conflict (id) do nothing;

create policy "authenticated users can upload company files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'company-files');

create policy "authenticated users can view company files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'company-files');

create policy "authenticated users can delete company files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'company-files');
