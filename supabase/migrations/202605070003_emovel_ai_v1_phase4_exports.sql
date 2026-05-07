create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  format text not null check (format in ('markdown', 'txt', 'pdf')),
  storage_path text,
  content_hash text,
  created_at timestamptz not null default now()
);

create index if not exists exports_project_created_idx on public.exports (project_id, created_at desc);
create index if not exists exports_user_workspace_created_idx on public.exports (user_id, workspace_id, created_at desc);

alter table public.exports enable row level security;

create policy "exports select own rows" on public.exports
  for select using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create policy "exports insert own rows" on public.exports
  for insert with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
