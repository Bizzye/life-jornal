-- Create entries table
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('event', 'food', 'personal')),
  title text not null,
  body text,
  date date not null default current_date,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.entries enable row level security;

create policy "Users can view own entries"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.entries for delete
  using (auth.uid() = user_id);

-- Storage policies for entry-photos bucket (bucket created via config.toml)

create policy "Users can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'entry-photos' and auth.role() = 'authenticated');

create policy "Anyone can view photos"
  on storage.objects for select
  using (bucket_id = 'entry-photos');

create policy "Users can update own photos"
  on storage.objects for update
  using (bucket_id = 'entry-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'entry-photos' and auth.uid()::text = (storage.foldername(name))[1]);
