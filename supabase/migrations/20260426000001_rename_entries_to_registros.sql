-- Rename entries table to registros
alter table public.entries rename to registros;

-- Rename RLS policies
alter policy "Users can view own entries" on public.registros rename to "Users can view own registros";
alter policy "Users can insert own entries" on public.registros rename to "Users can insert own registros";
alter policy "Users can update own entries" on public.registros rename to "Users can update own registros";
alter policy "Users can delete own entries" on public.registros rename to "Users can delete own registros";
