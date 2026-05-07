create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  onboarding_step text not null default 'brand_profile' check (
    onboarding_step in (
      'brand_profile',
      'first_project',
      'first_section',
      'complete'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Personal Workspace',
  kind text not null default 'personal' check (kind in ('personal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, kind)
);

create table public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_name text not null,
  audience text,
  tone text,
  visual_direction text,
  offer_positioning text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workspace_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_profile_id uuid references public.brand_profiles(id) on delete set null,
  name text not null,
  product_type text,
  commercial_goal text,
  fixed_section_order text[] not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  section_key text not null,
  position int not null,
  title text,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'empty' check (
    status in ('empty', 'generating', 'ready', 'accepted', 'error')
  ),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, section_key),
  unique (project_id, position)
);

create table public.section_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  section_id uuid references public.sections(id) on delete cascade,
  section_key text not null,
  draft_content jsonb not null,
  source text not null check (source in ('ai', 'manual', 'regenerate')),
  created_at timestamptz not null default now()
);

create table public.project_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  memory_type text not null check (memory_type in ('basic', 'advanced')),
  key text not null,
  value text not null,
  created_at timestamptz not null default now(),
  unique (project_id, memory_type, key)
);

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  request_category text not null check (
    request_category in (
      'production',
      'code_ui',
      'monetization',
      'brand',
      'client_deliverable',
      'ambiguous',
      'blocked_general_knowledge'
    )
  ),
  provider text not null,
  model_key text not null,
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  estimated_cost_cents int not null default 0,
  status text not null check (status in ('streaming', 'completed', 'failed', 'blocked')),
  error_message text,
  created_at timestamptz not null default now()
);

create table public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  ai_generations_count int not null default 0,
  sections_generated_count int not null default 0,
  exports_count int not null default 0,
  tokens_used int not null default 0,
  estimated_cost_cents int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, period_start, period_end)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stripe_events (
  id text primary key,
  event_type text not null,
  processed boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table public.pdf_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  signed_url_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index brand_profiles_user_workspace_idx on public.brand_profiles (user_id, workspace_id);
create index projects_user_workspace_idx on public.projects (user_id, workspace_id);
create index projects_brand_profile_idx on public.projects (brand_profile_id);
create index sections_project_position_idx on public.sections (project_id, position);
create index sections_workspace_project_idx on public.sections (workspace_id, project_id);
create index section_drafts_section_idx on public.section_drafts (section_id);
create index section_drafts_project_created_idx on public.section_drafts (project_id, created_at desc);
create index project_memory_project_type_idx on public.project_memory (project_id, memory_type);
create index ai_generations_user_created_idx on public.ai_generations (user_id, created_at desc);
create index ai_generations_project_section_idx on public.ai_generations (project_id, section_id);
create index usage_counters_user_period_idx on public.usage_counters (user_id, period_start, period_end);
create index subscriptions_user_idx on public.subscriptions (user_id);
create index subscriptions_stripe_customer_idx on public.subscriptions (stripe_customer_id);
create index subscriptions_stripe_subscription_idx on public.subscriptions (stripe_subscription_id);
create index pdf_exports_project_created_idx on public.pdf_exports (project_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;

  insert into public.workspaces (user_id, name, kind)
  values (new.id, 'Personal Workspace', 'personal')
  on conflict (user_id, kind) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.workspace_is_owned(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.sections enable row level security;
alter table public.section_drafts enable row level security;
alter table public.project_memory enable row level security;
alter table public.ai_generations enable row level security;
alter table public.usage_counters enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;
alter table public.pdf_exports enable row level security;

create policy "profiles select own row" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles insert own row" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles update own row" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "workspaces select own rows" on public.workspaces
  for select using (auth.uid() = user_id);
create policy "workspaces insert own rows" on public.workspaces
  for insert with check (auth.uid() = user_id);
create policy "workspaces update own rows" on public.workspaces
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workspaces delete own rows" on public.workspaces
  for delete using (auth.uid() = user_id);

create policy "brand_profiles select own rows" on public.brand_profiles
  for select using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "brand_profiles insert own rows" on public.brand_profiles
  for insert with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "brand_profiles update own rows" on public.brand_profiles
  for update using (auth.uid() = user_id and public.workspace_is_owned(workspace_id))
  with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "brand_profiles delete own rows" on public.brand_profiles
  for delete using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create policy "projects select own rows" on public.projects
  for select using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "projects insert own rows" on public.projects
  for insert with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "projects update own rows" on public.projects
  for update using (auth.uid() = user_id and public.workspace_is_owned(workspace_id))
  with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "projects delete own rows" on public.projects
  for delete using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create policy "sections select own rows" on public.sections
  for select using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "sections insert own rows" on public.sections
  for insert with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "sections update own rows" on public.sections
  for update using (auth.uid() = user_id and public.workspace_is_owned(workspace_id))
  with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "sections delete own rows" on public.sections
  for delete using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create policy "section_drafts select own rows" on public.section_drafts
  for select using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "section_drafts insert own rows" on public.section_drafts
  for insert with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "section_drafts update own rows" on public.section_drafts
  for update using (auth.uid() = user_id and public.workspace_is_owned(workspace_id))
  with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "section_drafts delete own rows" on public.section_drafts
  for delete using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create policy "project_memory select own rows" on public.project_memory
  for select using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "project_memory insert own rows" on public.project_memory
  for insert with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "project_memory update own rows" on public.project_memory
  for update using (auth.uid() = user_id and public.workspace_is_owned(workspace_id))
  with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));
create policy "project_memory delete own rows" on public.project_memory
  for delete using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create policy "ai_generations select own rows" on public.ai_generations
  for select using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create policy "usage_counters select own rows" on public.usage_counters
  for select using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create policy "subscriptions select own rows" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "pdf_exports select own rows" on public.pdf_exports
  for select using (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pdf_exports', 'pdf_exports', false, 10485760, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- No public storage.objects policy is created for pdf_exports.
-- PDF files must be written by trusted server code and read through signed URLs only.
