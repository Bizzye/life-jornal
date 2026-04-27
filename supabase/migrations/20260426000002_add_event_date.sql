-- Add event_date column (defaults to now, user can edit)
alter table public.registros
  add column event_date timestamptz not null default now();

-- Backfill existing rows: use created_at as event_date
update public.registros set event_date = created_at where event_date is null;
