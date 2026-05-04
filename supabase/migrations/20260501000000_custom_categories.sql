-- ============================================================
-- Custom categories & subcategories
-- ============================================================

-- 1. user_categories
create table if not exists public.user_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  slug text,
  is_default boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.user_categories enable row level security;

create policy "Users can view own categories"
  on public.user_categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.user_categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.user_categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own non-default categories"
  on public.user_categories for delete
  using (auth.uid() = user_id and not is_default);

-- 2. user_subcategories
create table if not exists public.user_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.user_categories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, name)
);

alter table public.user_subcategories enable row level security;

create policy "Users can view own subcategories"
  on public.user_subcategories for select
  using (auth.uid() = user_id);

create policy "Users can insert own subcategories"
  on public.user_subcategories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subcategories"
  on public.user_subcategories for update
  using (auth.uid() = user_id);

create policy "Users can delete own subcategories"
  on public.user_subcategories for delete
  using (auth.uid() = user_id);

-- 3. Alter registros: add category_id, subcategory_id, relax category column
alter table public.registros
  add column if not exists category_id uuid references public.user_categories(id),
  add column if not exists subcategory_id uuid references public.user_subcategories(id);

-- Make category text nullable (was NOT NULL with CHECK)
alter table public.registros alter column category drop not null;

-- Drop the hardcoded CHECK constraint
alter table public.registros drop constraint if exists entries_category_check;
