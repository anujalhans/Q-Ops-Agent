# Storage, Migrations, Extensions, And Environment

Generated on: 2026-05-08

## Storage Configuration

Global storage config observed:

| Setting | Value |
|---|---|
| File size limit | `52428800` bytes |
| Image transformation | enabled |
| S3 protocol | enabled |
| Iceberg catalog | enabled |
| Iceberg max namespaces | `10` |
| Iceberg max tables | `10` |
| Iceberg max catalogs | `2` |
| Vector buckets | disabled |
| Vector max buckets | `10` |
| Vector max indexes | `5` |
| `list_v2` capability | true |
| Storage migration version | `optimize-existing-functions-again` |
| Database pool mode | `recycled` |

## Storage Buckets

| Bucket | Public | Type | File size limit | Allowed MIME types | Created |
|---|---|---|---|---|---|
| `uploaded-project-docs` | `true` | `STANDARD` | null | null | `2026-04-14T08:10:58.918Z` |

Production note:

- The bucket is public. This is convenient for document ingestion URLs, but production should confirm whether uploaded project documents are allowed to be publicly accessible.
- If not, make the bucket private and switch workflows/UI to signed URLs or service-role reads.

## Storage Enum Types

| Type | Values |
|---|---|
| `storage.buckettype` | `STANDARD`, `ANALYTICS`, `VECTOR` |

## Supabase Migrations

Migrations currently applied:

| Version | Name |
|---|---|
| `20260507045008` | `persona_settings_backend_support` |
| `20260507045201` | `restrict_runtime_config_rpc_to_service_role` |
| `20260507075620` | `add_unique_qops_users_email` |
| `20260507153328` | `add_qa_job_metrics_attribution_columns` |

Production note:

- Use migration files as the source of truth for production provisioning.
- Confirm local migration files match these versions before deploying.
- If schema drift exists, generate a fresh migration or schema dump before production creation.

## Installed Extensions

Installed extensions observed:

| Extension | Schema | Version |
|---|---|---|
| `pg_stat_statements` | `extensions` | `1.11` |
| `uuid-ossp` | `extensions` | `1.1` |
| `supabase_vault` | `vault` | `0.3.1` |
| `plpgsql` | `pg_catalog` | `1.0` |
| `pgcrypto` | `extensions` | `1.3` |

Many additional extensions are available but not installed. Notable available extensions include `vector`, `pg_cron`, `pg_graphql`, `pg_trgm`, `pgmq`, `http`, `pg_jsonschema`, `postgis`, and others.

## Edge Functions

No Supabase Edge Functions are currently deployed.

## Realtime

No tables are currently listed in publication `supabase_realtime`.

## TypeScript Contract

Supabase generated TypeScript types include:

- Public tables: all application tables listed in this documentation.
- Public views: `job_cost_summary`, `job_failure_rate`, `job_observability_dashboard`.
- Public functions: `get_analytics_overview`, `get_analytics_by_document_type`, `get_analytics_failure_rate`, `qops_resolve_runtime_config`.
- No public enums.

For production, regenerate types after migrations:

```bash
supabase gen types typescript --project-id <project-ref> --schema public > src/lib/database.types.ts
```

Or use the Supabase MCP `generate_typescript_types` tool after connecting to the production project.

