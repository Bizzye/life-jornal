-- ============================================================
-- Custom fields per category + JSONB values on registros
-- ============================================================

-- 1. category_custom_fields — field definitions per category
create table if not exists public.category_custom_fields (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.user_categories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  field_type text not null check (field_type in ('text', 'textarea', 'number', 'checkbox', 'select', 'rating')),
  options jsonb default '[]',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, name)
);

alter table public.category_custom_fields enable row level security;

create policy "Users can view own custom fields"
  on public.category_custom_fields for select
  using (auth.uid() = user_id);

create policy "Users can insert own custom fields"
  on public.category_custom_fields for insert
  with check (auth.uid() = user_id);

create policy "Users can update own custom fields"
  on public.category_custom_fields for update
  using (auth.uid() = user_id);

create policy "Users can delete own custom fields"
  on public.category_custom_fields for delete
  using (auth.uid() = user_id);

-- 2. Add custom_field_values JSONB column to registros
alter table public.registros
  add column if not exists custom_field_values jsonb default '{}';
