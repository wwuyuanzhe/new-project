create table if not exists public.family_app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_family_app_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_family_app_state_updated_at on public.family_app_state;

create trigger set_family_app_state_updated_at
before update on public.family_app_state
for each row
execute function public.set_family_app_state_updated_at();

alter table public.family_app_state enable row level security;

drop policy if exists "family helper read shared state" on public.family_app_state;
drop policy if exists "family helper insert shared state" on public.family_app_state;
drop policy if exists "family helper update shared state" on public.family_app_state;

create policy "family helper read shared state"
on public.family_app_state
for select
to anon
using (id = 'main');

create policy "family helper insert shared state"
on public.family_app_state
for insert
to anon
with check (id = 'main');

create policy "family helper update shared state"
on public.family_app_state
for update
to anon
using (id = 'main')
with check (id = 'main');

grant usage on schema public to anon;
grant select, insert, update on public.family_app_state to anon;
