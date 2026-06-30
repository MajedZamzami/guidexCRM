-- GuideX CRM initial schema: pipeline_stages, companies, profiles
-- All authenticated users are GuideX workers and get full read/write access
-- to companies + pipeline_stages. profiles tracks who has access.

create extension if not exists "pgcrypto";

-- ─── PROFILES ───────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- auto-create a profile row whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── PIPELINE STAGES ────────────────────────────────────────
create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_order int not null default 0,
  color text not null default '#6366f1',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.pipeline_stages enable row level security;

create policy "authenticated users can manage pipeline stages"
  on public.pipeline_stages for all
  to authenticated
  using (true)
  with check (true);

-- ─── COMPANIES ──────────────────────────────────────────────
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  linkedin_url text,
  industry text,
  country text,
  city text,
  employee_count text,
  business_overview text,
  stage_id uuid references public.pipeline_stages (id) on delete set null,
  health_status text not null default 'active' check (health_status in ('active', 'at_risk', 'cold')),
  deal_value numeric,
  last_activity_at timestamptz,
  next_action_due timestamptz,
  next_action_title text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.companies enable row level security;

create policy "authenticated users can manage companies"
  on public.companies for all
  to authenticated
  using (true)
  with check (true);

create index if not exists companies_stage_id_idx on public.companies (stage_id);
create index if not exists companies_updated_at_idx on public.companies (updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- ─── DEFAULT PIPELINE STAGES ────────────────────────────────
insert into public.pipeline_stages (name, display_order, color)
select * from (values
  ('New Lead', 1, '#6366f1'),
  ('Contacted', 2, '#3b82f6'),
  ('Qualified', 3, '#06b6d4'),
  ('Proposal', 4, '#f59e0b'),
  ('Negotiation', 5, '#f97316'),
  ('Closed Won', 6, '#22c55e'),
  ('Closed Lost', 7, '#ef4444')
) as defaults (name, display_order, color)
where not exists (select 1 from public.pipeline_stages);
