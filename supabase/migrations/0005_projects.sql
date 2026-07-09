-- Companies can now have multiple projects (deals) in flight at once.
-- Pipeline/deal-specific fields move off companies onto projects; the
-- pipeline board drags/displays projects, not companies. The old columns
-- on companies are left in place (unused by the app going forward) rather
-- than dropped, so this migration is non-destructive.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  stage_id uuid references public.pipeline_stages (id) on delete set null,
  health_status text not null default 'active' check (health_status in ('active', 'at_risk', 'cold')),
  deal_value numeric,
  opportunity_score int check (opportunity_score between 0 and 100),
  last_activity_at timestamptz,
  next_action_due timestamptz,
  next_action_title text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "authenticated users can manage projects"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

create index if not exists projects_company_id_idx on public.projects (company_id);
create index if not exists projects_stage_id_idx on public.projects (stage_id);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ─── BACKFILL: one default project per existing company ─────────
insert into public.projects (
  company_id, name, is_default, stage_id, health_status, deal_value,
  opportunity_score, last_activity_at, next_action_due, next_action_title,
  created_by, created_at, updated_at
)
select
  id, name, true, stage_id, health_status, deal_value,
  opportunity_score, last_activity_at, next_action_due, next_action_title,
  created_by, created_at, updated_at
from public.companies;

-- ─── AUTO-CREATE A DEFAULT PROJECT FOR EVERY NEW COMPANY ─────────
create or replace function public.handle_new_company()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.projects (company_id, name, is_default, stage_id)
  values (
    new.id,
    new.name,
    true,
    (select id from public.pipeline_stages order by display_order limit 1)
  );
  return new;
end;
$$;

drop trigger if exists on_company_created on public.companies;
create trigger on_company_created
  after insert on public.companies
  for each row execute function public.handle_new_company();
