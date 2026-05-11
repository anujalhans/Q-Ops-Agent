-- Supabase metadata introspection queries used for this documentation.
-- Generated on: 2026-05-08.
-- Run against the target project to regenerate/verify production metadata.

-- Tables and approximate row counts are available through Supabase MCP list_tables.

-- Columns
select
  table_schema,
  table_name,
  column_name,
  ordinal_position,
  column_default,
  is_nullable,
  data_type,
  udt_name,
  character_maximum_length,
  numeric_precision,
  numeric_scale
from information_schema.columns
where table_schema in ('public', 'storage')
order by table_schema, table_name, ordinal_position;

-- Indexes
select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname in ('public', 'storage')
order by schemaname, tablename, indexname;

-- Constraints
select
  n.nspname as schema_name,
  c.relname as table_name,
  con.conname as constraint_name,
  con.contype as constraint_type,
  pg_get_constraintdef(con.oid, true) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'storage')
order by n.nspname, c.relname, con.contype, con.conname;

-- Triggers
select
  event_object_schema as schema_name,
  event_object_table as table_name,
  trigger_name,
  event_manipulation,
  action_timing,
  action_orientation,
  action_statement
from information_schema.triggers
where event_object_schema in ('public', 'storage')
order by event_object_schema, event_object_table, trigger_name, event_manipulation;

-- RLS policies
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- Views
select
  schemaname,
  viewname,
  viewowner,
  definition
from pg_views
where schemaname in ('public', 'storage')
order by schemaname, viewname;

-- Public and storage functions
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as returns,
  l.lanname as language,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  array_to_string(p.proconfig, ', ') as config,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_language l on l.oid = p.prolang
where n.nspname in ('public', 'storage', 'private')
order by n.nspname, p.proname, arguments;

-- Grants
select
  grantee,
  table_schema,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema in ('public', 'storage')
  and grantee in ('anon', 'authenticated', 'service_role')
order by table_schema, table_name, grantee, privilege_type;

-- Sizes and table stats
select
  n.nspname as schema_name,
  c.relname as relation_name,
  c.relkind,
  pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
  pg_total_relation_size(c.oid) as total_size_bytes,
  coalesce(s.n_live_tup, 0) as estimated_live_rows,
  coalesce(s.n_dead_tup, 0) as estimated_dead_rows,
  s.last_vacuum,
  s.last_autovacuum,
  s.last_analyze,
  s.last_autoanalyze
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_stat_user_tables s on s.relid = c.oid
where n.nspname in ('public', 'storage')
  and c.relkind in ('r', 'p', 'v', 'm')
order by n.nspname, c.relkind, c.relname;

-- Sequences
select
  sequence_schema,
  sequence_name,
  data_type,
  start_value,
  minimum_value,
  maximum_value,
  increment
from information_schema.sequences
where sequence_schema in ('public', 'storage')
order by sequence_schema, sequence_name;

-- Enums
select
  n.nspname as schema_name,
  t.typname as type_name,
  e.enumlabel as enum_value,
  e.enumsortorder
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname in ('public', 'storage')
order by n.nspname, t.typname, e.enumsortorder;

-- Realtime publication
select
  schemaname,
  tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
order by schemaname, tablename;

