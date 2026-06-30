-- Opportunity score (0-100) shown as a progress bar on pipeline cards.
alter table public.companies
  add column if not exists opportunity_score int check (opportunity_score between 0 and 100);
