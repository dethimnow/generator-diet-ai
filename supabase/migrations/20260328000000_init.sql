-- Generator Diet AI — schema + RLS
-- Uruchom w Supabase SQL Editor lub: supabase db push

create extension if not exists "pgcrypto";

-- Profile powiązany z auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_premium boolean not null default false,
  premium_until timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  goal text,
  diet_type text,
  weight_kg numeric(5,2),
  height_cm int,
  age int,
  gender text,
  cook_time_min int,
  weekly_budget_pln numeric(8,2),
  preferred_store text,
  pantry_items text,
  fridge_only boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Dieta 7-dniowa',
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists diet_plans_user_created_idx on public.diet_plans (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.diet_plans enable row level security;

-- Profiles: użytkownik widzi i edytuje tylko siebie
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "prefs_all_own" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "diet_select_own" on public.diet_plans for select using (auth.uid() = user_id);
create policy "diet_insert_own" on public.diet_plans for insert with check (auth.uid() = user_id);
create policy "diet_delete_own" on public.diet_plans for delete using (auth.uid() = user_id);

-- Nowy użytkownik → profil (trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Service role zapisuje webhook Stripe (aktualizacja is_premium) — robimy przez API route z service key, nie przez RLS z frontu
-- Opcjonalna tabela na idempotencję webhooków:
create table if not exists public.stripe_events (
  id text primary key,
  processed_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;
-- Brak polityk dla authenticated — tylko service role w API

comment on table public.diet_plans is 'Wygenerowane diety (JSON payload + tytuł)';
