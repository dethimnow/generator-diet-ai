-- Dane kreatora zapisane przy pending — Edge Function generuje plan bez długiego Vercel serverless
alter table public.diet_plans add column if not exists generation_input jsonb;
