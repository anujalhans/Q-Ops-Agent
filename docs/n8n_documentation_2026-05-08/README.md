# n8n Active Workflow Documentation - 2026-05-08

This folder documents all workflows that were active/published and available through the n8n MCP inventory on 2026-05-08. The markdown files were generated from the exported workflow JSON files in docs/n8n_workflows_2026-05-08/Published.

## Contents

- workflows/: one detailed markdown document per active workflow.
- manifest.json: machine-readable workflow inventory and documentation paths.
- dependency-map.md: inferred external URLs/webhooks and Supabase table references.

## Workflow Index

| Workflow | ID | Nodes | Webhook Hints |
| --- | --- | ---: | --- |
| [INGEST API Queue Creator - SaaS - Attributed Draft](workflows/INGEST API Queue Creator - SaaS - Attributed Draft.md) | iiR8d9v5oI8WzBPX | 16 | POST /webhook/upload-test-artifacts |
| [INGEST Worker Engine (Queue Processor) - Attributed Draft](workflows/INGEST Worker Engine (Queue Processor) - Attributed Draft.md) | mlelxUdlNcoBIyru | 13 |  |
| [INGEST Workflow-Status-Check](workflows/INGEST Workflow-Status-Check.md) | KeTwumg3JT7C46BD | 5 | GET/POST /webhook/job-status |
| [Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft](workflows/Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft.md) | fullIngestDraft01 | 34 |  |
| [Q-Ops Agent Artifact Reprocess API](workflows/Q-Ops Agent Artifact Reprocess API.md) | zHsg1Zr7oGOvhPFg | 12 | POST /webhook/artifacts/reprocess |
| [Q-Ops Agent Artifacts API](workflows/Q-Ops Agent Artifacts API.md) | YFsr2hRD7BZlPCEK | 4 | GET/POST /webhook/artifacts |
| [Q-Ops Agent Audit Events API](workflows/Q-Ops Agent Audit Events API.md) | lyyrP14iTYacuEFv | 9 | GET/POST /webhook/audit-events |
| [Q-Ops Agent Auth Me API](workflows/Q-Ops Agent Auth Me API.md) | 55zxBkmwk8ezvWOP | 6 | GET /webhook/me |
| [Q-Ops Agent Generated Documents API](workflows/Q-Ops Agent Generated Documents API.md) | mucEtw68lUvv9T6f | 4 | GET/POST /webhook/generated-documents |
| [Q-Ops Agent Infrastructure Load API](workflows/Q-Ops Agent Infrastructure Load API.md) | NgKN1jdavJfmJG9h | 11 | GET/POST /webhook/infrastructure-load |
| [Q-Ops Agent Integration Test API](workflows/Q-Ops Agent Integration Test API.md) | 3zXdQS9hABDTXuea | 7 | POST /webhook/integrations/test |
| [Q-Ops Agent Integrations Status API](workflows/Q-Ops Agent Integrations Status API.md) | CGkgxVrH5D6syesK | 5 | GET/POST /webhook/integrations/status |
| [Q-Ops Agent Integrations Test All API](workflows/Q-Ops Agent Integrations Test All API.md) | 0cyKIIbCq17bD0yK | 7 | POST /webhook/integrations/test-all |
| [Q-Ops Agent Projects API - Wired](workflows/Q-Ops Agent Projects API - Wired.md) | hWo8zurIZ3KkPKxg | 11 | GET/POST /webhook/projects<br>POST /webhook/projects |
| [Q-Ops Agent Settings API](workflows/Q-Ops Agent Settings API.md) | ZuXZfzhWr8Fcep5a | 6 | GET/POST /webhook/settings |
| [Q-Ops Agent Settings Write API](workflows/Q-Ops Agent Settings Write API.md) | u3klCtPvbFd01ds4 | 6 | PATCH /webhook/settings |
| [Q-Ops Agent User Accept Invite API](workflows/Q-Ops Agent User Accept Invite API.md) | Nkkxc1p3wnzPyj21 | 9 | POST /webhook/users/accept-invite |
| [Q-Ops Agent User Invite API](workflows/Q-Ops Agent User Invite API.md) | W8b32kGweBlEXN6r | 11 | POST /webhook/users/invite |
| [Q-Ops Agent User Password Reset Audit API](workflows/Q-Ops Agent User Password Reset Audit API.md) | NpD8cnqPE7qAWEpL | 7 | POST /webhook/users/password-reset-audit |
| [Q-Ops Agent User Project Assignments API](workflows/Q-Ops Agent User Project Assignments API.md) | SqF2eOhsuBrtyCtD | 13 | PATCH /webhook/users/project-assignments |
| [Q-Ops Agent User Update API](workflows/Q-Ops Agent User Update API.md) | AL5fIgJ9skALon98 | 9 | PATCH /webhook/users/update |
| [Q-Ops Agent Users API](workflows/Q-Ops Agent Users API.md) | vhxA44slh746G1ja | 7 | GET /webhook/users |
| [Q-Ops-Agent-Analytics-Summary](workflows/Q-Ops-Agent-Analytics-Summary.md) | tcKSeScJRiWtRx77 | 11 | GET/POST /webhook/analytics-summary |
| [Q-Ops-Agent-Health-Status](workflows/Q-Ops-Agent-Health-Status.md) | zdx8YtZJOMWtbv1L | 9 | GET/POST /webhook/health |
| [RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft](workflows/RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft.md) | fullRetrievalD01 | 67 |  |
| [RETRIEVAL Job Queue Creator - SaaS - Attributed Draft](workflows/RETRIEVAL Job Queue Creator - SaaS - Attributed Draft.md) | d8hZl2gQpuWjlwr3 | 10 | POST /webhook/generate-qa-doc |
| [RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft](workflows/RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft.md) | ew9RdPEvMAq5P6t3 | 7 |  |
| [RETRIEVE Workflow-status-check](workflows/RETRIEVE Workflow-status-check.md) | b63H3FLO9nFujtQp | 5 | GET/POST /webhook/job-status-retrieve |

## Notes

- Credential values and secrets are not exported by n8n; only credential references are documented.
- Full node parameter snapshots are included in each workflow document for future context setting.
- Raw JSON backups remain the source of truth for exact workflow re-import.
