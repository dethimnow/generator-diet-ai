-- Async generowanie: pending → ready/failed (payload może być null do czasu ukończenia)
alter table public.diet_plans add column if not exists status text;
update public.diet_plans set status = 'ready' where status is null;
alter table public.diet_plans alter column status set not null;
alter table public.diet_plans alter column status set default 'ready';

alter table public.diet_plans drop constraint if exists diet_plans_status_check;
alter table public.diet_plans
  add constraint diet_plans_status_check check (status in ('ready', 'pending', 'failed'));

alter table public.diet_plans add column if not exists generation_error text;

alter table public.diet_plans alter column payload drop not null;

drop policy if exists "diet_update_own" on public.diet_plans;
create policy "diet_update_own" on public.diet_plans
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
