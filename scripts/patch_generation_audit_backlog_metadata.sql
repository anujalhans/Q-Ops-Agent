create or replace function public.qops_record_generation_audit_event()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  project_name text := 'unknown';
  document_type text := 'unknown';
  output_payload jsonb := '{}'::jsonb;
  token_usage jsonb := '{}'::jsonb;
  metadata_payload jsonb := '{}'::jsonb;
  duration_ms bigint;
  audit_action text;
  audit_status text;
  audit_details text;
  actor_display_name text := 'n8n';
  word_count integer;
  tokens_input integer;
  tokens_output integer;
  tokens_total integer;
  estimated_cost numeric;
begin
  if new.status not in ('completed', 'failed') then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status is not distinct from new.status then
    return new;
  end if;

  project_name := coalesce(nullif(new.input->>'projectName', ''), nullif(new.output->>'projectName', ''), 'unknown');
  document_type := coalesce(nullif(new.input->>'documentType', ''), nullif(new.output->>'documentType', ''), 'unknown');
  output_payload := coalesce(new.output, '{}'::jsonb);
  token_usage := coalesce(output_payload->'tokenUsage', '{}'::jsonb);

  if (output_payload->>'wordCount') ~ '^\d+$' then
    word_count := (output_payload->>'wordCount')::integer;
  end if;

  if (token_usage->>'input') ~ '^\d+$' then
    tokens_input := (token_usage->>'input')::integer;
  elsif (output_payload->>'tokensInput') ~ '^\d+$' then
    tokens_input := (output_payload->>'tokensInput')::integer;
  end if;

  if (token_usage->>'output') ~ '^\d+$' then
    tokens_output := (token_usage->>'output')::integer;
  elsif (output_payload->>'tokensOutput') ~ '^\d+$' then
    tokens_output := (output_payload->>'tokensOutput')::integer;
  end if;

  if (token_usage->>'total') ~ '^\d+$' then
    tokens_total := (token_usage->>'total')::integer;
  elsif (output_payload->>'tokensTotal') ~ '^\d+$' then
    tokens_total := (output_payload->>'tokensTotal')::integer;
  end if;

  if (token_usage->>'estimatedCostUsd') ~ '^\d+(\.\d+)?$' then
    estimated_cost := (token_usage->>'estimatedCostUsd')::numeric;
  elsif (output_payload->>'estimatedCostUsd') ~ '^\d+(\.\d+)?$' then
    estimated_cost := (output_payload->>'estimatedCostUsd')::numeric;
  end if;

  select m.duration_ms
    into duration_ms
  from public.qa_job_metrics m
  where m.job_id = new.job_id
    and m.event = case when new.status = 'completed' then 'JOB_COMPLETED' else 'JOB_FAILED' end
    and m.duration_ms is not null
  order by m.created_at desc
  limit 1;

  if duration_ms is null and (output_payload->>'durationMs') ~ '^\d+$' then
    duration_ms := (output_payload->>'durationMs')::bigint;
  elsif duration_ms is null and new.created_at is not null and new.updated_at is not null then
    duration_ms := greatest(0, floor(extract(epoch from (new.updated_at - new.created_at)) * 1000)::bigint);
  end if;

  select coalesce(nullif(name, ''), email, 'n8n')
    into actor_display_name
  from public.qops_users
  where id = new.requested_by;

  actor_display_name := coalesce(actor_display_name, 'n8n');

  if new.status = 'completed' then
    audit_action := 'GENERATION_COMPLETED';
    audit_status := 'success';
    audit_details := 'Generation completed for ' || project_name || ' / ' || document_type;
  else
    audit_action := 'GENERATION_FAILED';
    audit_status := 'error';
    audit_details := 'Generation failed for ' || project_name || ' / ' || document_type || ': ' || coalesce(nullif(new.error, ''), 'Generation workflow failed');
  end if;

  metadata_payload := jsonb_build_object(
    'source', 'supabase_trigger',
    'pipeline', 'generation',
    'event_source', 'qa_jobs.status_' || new.status,
    'jobId', new.job_id,
    'projectName', project_name,
    'documentType', document_type,
    'settingsVersion', new.settings_version,
    'projectId', new.project_id,
    'requestedBy', new.requested_by,
    'environment', coalesce(new.input->>'environment', new.config_snapshot->'environment'->>'key', 'local'),
    'generatorMode', coalesce(new.input->>'generatorMode', new.config_snapshot->'request'->>'generatorMode', 'professional'),
    'generationModel', coalesce(new.config_snapshot->'models'->>'generationModel', token_usage->>'model', 'unknown'),
    'chromaCollection', coalesce(new.config_snapshot->'chroma'->>'collection', 'unknown'),
    'destination', coalesce(output_payload->'destination', '{}'::jsonb),
    'outputUrl', coalesce(output_payload->>'url', output_payload->>'documentUrl', output_payload->'confluence'->>'url'),
    'confluencePageId', coalesce(output_payload->>'confluencePageId', output_payload->'confluence'->>'pageId'),
    'wordCount', word_count,
    'tokensInput', tokens_input,
    'tokensOutput', tokens_output,
    'tokensTotal', tokens_total,
    'estimatedCostUsd', estimated_cost,
    'durationMs', coalesce(duration_ms, 0),
    'errorMessage', new.error,
    'configSourcePriority', coalesce(new.config_snapshot->'scope'->'sourcePriority', '{}'::jsonb)
  );

  insert into public.qops_audit_events (
    actor_user_id,
    actor_name,
    action,
    entity_type,
    entity_id,
    project_id,
    status,
    details,
    metadata
  )
  select
    new.requested_by,
    actor_display_name,
    audit_action,
    'generation_job',
    new.job_id,
    new.project_id,
    audit_status,
    audit_details,
    metadata_payload
  where not exists (
    select 1
    from public.qops_audit_events existing
    where existing.entity_id = new.job_id
      and existing.entity_type = 'generation_job'
      and existing.action = audit_action
  );

  return new;
end;
$function$;
