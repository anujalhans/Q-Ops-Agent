# Supabase Data Model Plan

## Scope

This plan defines new Supabase tables for Delivery Intelligence. It does not replace existing Q-Ops tables.

Existing tables to reuse:

- `qops_users`
- `qops_projects`
- `qops_project_members`
- `qa_jobs`
- `qa_job_metrics`
- `qops_audit_events`
- `qops_environment_settings`
- `qops_integration_settings`

## Naming Convention

Use `di_` prefix for new Delivery Intelligence tables.

## Proposed Tables

### `di_technologies`

Represents technologies used across projects.

Suggested columns:

- `id uuid primary key`
- `name text not null`
- `normalized_name text not null unique`
- `category text`
- `description text`
- `vendor text`
- `tags jsonb default '[]'`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Indexes:

- Unique index on `normalized_name`
- Optional GIN index on `tags`

### `di_project_technologies`

Maps projects to technologies.

Suggested columns:

- `id uuid primary key`
- `project_id text not null references qops_projects(id)`
- `technology_id uuid not null references di_technologies(id)`
- `version text`
- `confidence_score numeric`
- `source_type text`
- `source_ref text`
- `created_by_ai boolean default true`
- `created_at timestamptz default now()`

Indexes:

- `(project_id, technology_id)` unique
- `(technology_id, project_id)`

### `di_reusable_solutions`

Represents reusable implementations, QA accelerators, patterns, and templates.

Suggested columns:

- `id uuid primary key`
- `title text not null`
- `slug text not null unique`
- `summary text`
- `problem_statement text`
- `implementation_approach text`
- `qa_approach text`
- `risk_factors jsonb default '[]'`
- `production_learnings jsonb default '[]'`
- `implementation_complexity text`
- `applicability_tags jsonb default '[]'`
- `visibility_level text not null default 'project'`
- `owner_user_id uuid references qops_users(id)`
- `owner_team text`
- `source_project_id text references qops_projects(id)`
- `ai_summary text`
- `status text default 'draft'`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Recommended status values:

- `draft`
- `review`
- `published`
- `archived`

Recommended visibility values:

- `organization`
- `department`
- `team`
- `project`
- `client_restricted`
- `confidential`
- `ai_sanitized_only`

Indexes:

- `(status, visibility_level)`
- `(source_project_id, created_at desc)`
- GIN index on `applicability_tags`

### `di_solution_technologies`

Maps reusable solutions to technologies.

Suggested columns:

- `id uuid primary key`
- `solution_id uuid references di_reusable_solutions(id)`
- `technology_id uuid references di_technologies(id)`
- `created_at timestamptz default now()`

Indexes:

- `(solution_id, technology_id)` unique
- `(technology_id, solution_id)`

### `di_solution_assets`

References reusable assets such as Confluence pages, repo links, generated docs, test frameworks, templates, or attachments.

Suggested columns:

- `id uuid primary key`
- `solution_id uuid references di_reusable_solutions(id)`
- `asset_type text not null`
- `title text`
- `url text`
- `storage_path text`
- `description text`
- `visibility_level text not null default 'project'`
- `created_at timestamptz default now()`

Indexes:

- `(solution_id, asset_type)`

### `di_organizational_learnings`

Captures reusable engineering, QA, incident, deployment, and operational learnings.

Suggested columns:

- `id uuid primary key`
- `title text not null`
- `category text`
- `source_project_id text references qops_projects(id)`
- `learning_summary text`
- `impact_level text`
- `reusable_recommendation text`
- `visibility_level text not null default 'project'`
- `source_ref text`
- `created_by_ai boolean default true`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Indexes:

- `(source_project_id, created_at desc)`
- `(category, impact_level)`

### `di_knowledge_relationships`

Stores graph-like relationships between platform entities.

Suggested columns:

- `id uuid primary key`
- `source_entity_type text not null`
- `source_entity_id text not null`
- `target_entity_type text not null`
- `target_entity_id text not null`
- `relationship_type text not null`
- `confidence_score numeric`
- `evidence jsonb default '[]'`
- `created_by_ai boolean default true`
- `visibility_level text not null default 'project'`
- `created_at timestamptz default now()`

Indexes:

- `(source_entity_type, source_entity_id)`
- `(target_entity_type, target_entity_id)`
- `(relationship_type, confidence_score desc)`

### `di_recommendations`

Stores AI recommendations and user feedback.

Suggested columns:

- `id uuid primary key`
- `project_id text references qops_projects(id)`
- `recommendation_type text not null`
- `title text not null`
- `summary text`
- `rationale text`
- `related_entity_type text`
- `related_entity_id text`
- `confidence_score numeric`
- `status text default 'new'`
- `assigned_to uuid references qops_users(id)`
- `feedback jsonb default '{}'`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Recommended status values:

- `new`
- `viewed`
- `accepted`
- `dismissed`
- `converted`

Indexes:

- `(project_id, status, created_at desc)`
- `(recommendation_type, confidence_score desc)`

### `di_intelligence_jobs`

Tracks Delivery Intelligence background jobs separate from existing QA jobs.

Suggested columns:

- `job_id text primary key`
- `status text not null default 'pending'`
- `job_type text not null`
- `project_id text references qops_projects(id)`
- `requested_by uuid references qops_users(id)`
- `input jsonb default '{}'`
- `output jsonb default '{}'`
- `error text`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Indexes:

- Partial index for pending queue: `(created_at asc) where status = 'pending'`
- `(project_id, created_at desc)`
- `(requested_by, created_at desc)`

## RLS Model

Enable RLS on all `di_` tables.

Recommended policy structure:

- Admin users can manage all Delivery Intelligence records.
- Registered users can read organization-level records that are not restricted.
- Registered users can read project-level records for assigned projects.
- Confidential and client-restricted records require explicit membership or admin role.
- Backend n8n workflows should use service-role credentials for writes and extraction jobs.

Important:

- Do not rely on user-editable `user_metadata` for authorization.
- Use `qops_users` and `qops_project_members` for authorization checks.
- Add SELECT policies before UPDATE policies because Postgres UPDATE needs SELECT visibility.

## Migration Strategy

1. Create tables with RLS enabled.
2. Add indexes.
3. Add policies.
4. Add seed data only for controlled test projects.
5. Run Supabase advisors.
6. Test with admin and registered user.
7. Only then connect n8n workflows and UI.

