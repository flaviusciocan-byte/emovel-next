alter table public.sections
  drop constraint if exists sections_status_check;

alter table public.sections
  add constraint sections_status_check
  check (
    status in (
      'empty',
      'generating',
      'streaming_partial',
      'ready',
      'accepted',
      'error',
      'error_retryable',
      'error_blocked',
      'error_billing',
      'error_rate_limited'
    )
  );

alter table public.ai_generations
  drop constraint if exists ai_generations_request_category_check;

alter table public.ai_generations
  add constraint ai_generations_request_category_check
  check (
    request_category in (
      'production',
      'commercial_ui',
      'monetization',
      'brand',
      'client_deliverable',
      'ambiguous',
      'general_knowledge',
      'entertainment',
      'news',
      'medical_legal_financial_advice',
      'unrelated_coding_assistant_behavior',
      'trivia_history_science'
    )
  );

create policy "ai_generations insert own rows" on public.ai_generations
  for insert with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create policy "usage_counters insert own rows" on public.usage_counters
  for insert with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create policy "usage_counters update own rows" on public.usage_counters
  for update using (auth.uid() = user_id and public.workspace_is_owned(workspace_id))
  with check (auth.uid() = user_id and public.workspace_is_owned(workspace_id));

create or replace function public.increment_usage_counter(
  target_workspace_id uuid,
  target_period_start date,
  target_period_end date,
  ai_generations_delta int default 0,
  sections_generated_delta int default 0,
  tokens_used_delta int default 0,
  estimated_cost_cents_delta int default 0
)
returns public.usage_counters
language plpgsql
security invoker
set search_path = public
as $$
declare
  result public.usage_counters;
begin
  insert into public.usage_counters (
    user_id,
    workspace_id,
    period_start,
    period_end,
    ai_generations_count,
    sections_generated_count,
    tokens_used,
    estimated_cost_cents,
    updated_at
  )
  values (
    auth.uid(),
    target_workspace_id,
    target_period_start,
    target_period_end,
    greatest(ai_generations_delta, 0),
    greatest(sections_generated_delta, 0),
    greatest(tokens_used_delta, 0),
    greatest(estimated_cost_cents_delta, 0),
    now()
  )
  on conflict (workspace_id, period_start, period_end)
  do update set
    ai_generations_count = public.usage_counters.ai_generations_count + greatest(excluded.ai_generations_count, 0),
    sections_generated_count = public.usage_counters.sections_generated_count + greatest(excluded.sections_generated_count, 0),
    tokens_used = public.usage_counters.tokens_used + greatest(excluded.tokens_used, 0),
    estimated_cost_cents = public.usage_counters.estimated_cost_cents + greatest(excluded.estimated_cost_cents, 0),
    updated_at = now()
  where public.usage_counters.user_id = auth.uid()
    and public.workspace_is_owned(public.usage_counters.workspace_id)
  returning * into result;

  return result;
end;
$$;
