# n8n Published Workflow Documentation - 2026-08-06 12:35:51 IST

This folder documents the published n8n workflows exported from `docs\n8n_workflows_2026-08-06_123551`. It intentionally excludes unpublished/inactive workflows so this snapshot remains focused on the currently production-active surface.

## Contents

- `workflows/Published/`: one detailed markdown document per published workflow.
- `manifest.json`: machine-readable workflow inventory and documentation paths.
- `dependency-map.md`: inferred external URLs/webhooks, credential references, and Supabase/data table references.

## Summary

- Total workflows documented: 39
- Published workflows: 39

## Workflow Index

| Status | Workflow | ID | Nodes | Webhook Hints |
| --- | --- | --- | ---: | --- |
| Published | [DI - Catalog Read API](workflows/Published/DI - Catalog Read API [nzc2q8WqmTd6RGCw].md) | nzc2q8WqmTd6RGCw | 18 | GET/POST /webhook/di/catalog |
| Published | [DI - Cross Project Search API](workflows/Published/DI - Cross Project Search API [18yW35k0ANmU3ZY4].md) | 18yW35k0ANmU3ZY4 | 13 | GET/POST /webhook/di/search |
| Published | [DI - Insights API](workflows/Published/DI - Insights API [eFtemLZ4s5NRjF1d].md) | eFtemLZ4s5NRjF1d | 17 | GET/POST /webhook/di/insights<br>={{ "OPTIONS" }} /webhook/di/insights |
| Published | [DI - Intelligence Queue Creator and Status API](workflows/Published/DI - Intelligence Queue Creator and Status API [8v0RLFdhdelnBeu9].md) | 8v0RLFdhdelnBeu9 | 26 | POST /webhook/di/jobs<br>OPTIONS /webhook/di/jobs<br>GET/POST /webhook/di/jobs |
| Published | [DI - Intelligence Worker](workflows/Published/DI - Intelligence Worker [xmuy0M3IEbkISttj].md) | xmuy0M3IEbkISttj | 14 |  |
| Published | [DI - Recommendation Feedback API](workflows/Published/DI - Recommendation Feedback API [pbxli3DNK16tIhOe].md) | pbxli3DNK16tIhOe | 16 | PATCH /webhook/di/recommendations/feedback<br>OPTIONS /webhook/di/recommendations/feedback |
| Published | [DI - Solution Review API](workflows/Published/DI - Solution Review API [9baEqUVgSSFzZFbc].md) | 9baEqUVgSSFzZFbc | 15 | PATCH /webhook/di/solutions/review<br>={{ "OPTIONS" }} /webhook/di/solutions/review |
| Published | [INGEST API Queue Creator - SaaS - Attributed Draft](workflows/Published/INGEST API Queue Creator - SaaS - Attributed Draft [iiR8d9v5oI8WzBPX].md) | iiR8d9v5oI8WzBPX | 16 | POST /webhook/upload-test-artifacts |
| Published | [INGEST Worker Engine (Queue Processor) - Attributed Draft](workflows/Published/INGEST Worker Engine (Queue Processor) - Attributed Draft [mlelxUdlNcoBIyru].md) | mlelxUdlNcoBIyru | 16 |  |
| Published | [INGEST Workflow-Status-Check](workflows/Published/INGEST Workflow-Status-Check [KeTwumg3JT7C46BD].md) | KeTwumg3JT7C46BD | 5 | GET/POST /webhook/job-status |
| Published | [Multimodal Knowledge Ingestion & Vectorization Engine - In Progress](workflows/Published/Multimodal Knowledge Ingestion & Vectorization Engine - In Progress [C9oZfZxpGFakzlB3].md) | C9oZfZxpGFakzlB3 | 36 |  |
| Published | [PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready](workflows/Published/PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready [Vwc6c8ehsRTF8svG].md) | Vwc6c8ehsRTF8svG | 47 |  |
| Published | [PRO QA Generation Queue Creator - Ready Draft](workflows/Published/PRO QA Generation Queue Creator - Ready Draft [yPgr7mtUnL3E8QQP].md) | yPgr7mtUnL3E8QQP | 32 | POST /webhook/generate-qa-doc<br>OPTIONS /webhook/generate-qa-doc |
| Published | [PRO QA Generation Queue Worker - Ready Draft](workflows/Published/PRO QA Generation Queue Worker - Ready Draft [QApRBFSaJgINsdHN].md) | QApRBFSaJgINsdHN | 22 |  |
| Published | [PRO QA Jira Story Test Case Generator](workflows/Published/PRO QA Jira Story Test Case Generator [SG7khcKlhHst48WH].md) | SG7khcKlhHst48WH | 73 |  |
| Published | [PRO QA Story Test Cases Queue Creator](workflows/Published/PRO QA Story Test Cases Queue Creator [8nuhDEewnnunXSbF].md) | 8nuhDEewnnunXSbF | 18 | POST /webhook/generate-story-test-cases<br>OPTIONS /webhook/generate-story-test-cases |
| Published | [PRO QA Story Test Cases Worker](workflows/Published/PRO QA Story Test Cases Worker [ivz13uFyjfCT8149].md) | ivz13uFyjfCT8149 | 27 |  |
| Published | [Q-Ops Agent Artifact Reprocess API](workflows/Published/Q-Ops Agent Artifact Reprocess API [zHsg1Zr7oGOvhPFg].md) | zHsg1Zr7oGOvhPFg | 12 | POST /webhook/artifacts/reprocess |
| Published | [Q-Ops Agent Artifacts API](workflows/Published/Q-Ops Agent Artifacts API [YFsr2hRD7BZlPCEK].md) | YFsr2hRD7BZlPCEK | 4 | GET/POST /webhook/artifacts |
| Published | [Q-Ops Agent Audit Events API](workflows/Published/Q-Ops Agent Audit Events API [lyyrP14iTYacuEFv].md) | lyyrP14iTYacuEFv | 9 | GET/POST /webhook/audit-events |
| Published | [Q-Ops Agent Auth Me API](workflows/Published/Q-Ops Agent Auth Me API [55zxBkmwk8ezvWOP].md) | 55zxBkmwk8ezvWOP | 6 | GET /webhook/me |
| Published | [Q-Ops Agent Generated Documents API](workflows/Published/Q-Ops Agent Generated Documents API [mucEtw68lUvv9T6f].md) | mucEtw68lUvv9T6f | 4 | GET/POST /webhook/generated-documents |
| Published | [Q-Ops Agent Infrastructure Load API](workflows/Published/Q-Ops Agent Infrastructure Load API [NgKN1jdavJfmJG9h].md) | NgKN1jdavJfmJG9h | 11 | GET/POST /webhook/infrastructure-load |
| Published | [Q-Ops Agent Integration Test API](workflows/Published/Q-Ops Agent Integration Test API [3zXdQS9hABDTXuea].md) | 3zXdQS9hABDTXuea | 7 | POST /webhook/integrations/test |
| Published | [Q-Ops Agent Integrations Status API](workflows/Published/Q-Ops Agent Integrations Status API [CGkgxVrH5D6syesK].md) | CGkgxVrH5D6syesK | 5 | GET/POST /webhook/integrations/status |
| Published | [Q-Ops Agent Integrations Test All API](workflows/Published/Q-Ops Agent Integrations Test All API [0cyKIIbCq17bD0yK].md) | 0cyKIIbCq17bD0yK | 7 | POST /webhook/integrations/test-all |
| Published | [Q-Ops Agent Projects API - Wired](workflows/Published/Q-Ops Agent Projects API - Wired [hWo8zurIZ3KkPKxg].md) | hWo8zurIZ3KkPKxg | 11 | GET/POST /webhook/projects<br>POST /webhook/projects |
| Published | [Q-Ops Agent Settings API](workflows/Published/Q-Ops Agent Settings API [ZuXZfzhWr8Fcep5a].md) | ZuXZfzhWr8Fcep5a | 14 | GET/POST /webhook/settings |
| Published | [Q-Ops Agent Settings Write API](workflows/Published/Q-Ops Agent Settings Write API [u3klCtPvbFd01ds4].md) | u3klCtPvbFd01ds4 | 12 | PATCH /webhook/settings |
| Published | [Q-Ops Agent User Accept Invite API](workflows/Published/Q-Ops Agent User Accept Invite API [Nkkxc1p3wnzPyj21].md) | Nkkxc1p3wnzPyj21 | 9 | POST /webhook/users/accept-invite |
| Published | [Q-Ops Agent User Invite API](workflows/Published/Q-Ops Agent User Invite API [W8b32kGweBlEXN6r].md) | W8b32kGweBlEXN6r | 11 | POST /webhook/users/invite |
| Published | [Q-Ops Agent User Password Reset Audit API](workflows/Published/Q-Ops Agent User Password Reset Audit API [NpD8cnqPE7qAWEpL].md) | NpD8cnqPE7qAWEpL | 7 | POST /webhook/users/password-reset-audit |
| Published | [Q-Ops Agent User Project Assignments API](workflows/Published/Q-Ops Agent User Project Assignments API [SqF2eOhsuBrtyCtD].md) | SqF2eOhsuBrtyCtD | 13 | PATCH /webhook/users/project-assignments |
| Published | [Q-Ops Agent User Update API](workflows/Published/Q-Ops Agent User Update API [AL5fIgJ9skALon98].md) | AL5fIgJ9skALon98 | 9 | PATCH /webhook/users/update |
| Published | [Q-Ops Agent Users API](workflows/Published/Q-Ops Agent Users API [vhxA44slh746G1ja].md) | vhxA44slh746G1ja | 7 | GET /webhook/users |
| Published | [Q-Ops-Agent-Analytics-Summary](workflows/Published/Q-Ops-Agent-Analytics-Summary [tcKSeScJRiWtRx77].md) | tcKSeScJRiWtRx77 | 11 | GET/POST /webhook/analytics-summary |
| Published | [Q-Ops-Agent-Health-Status](workflows/Published/Q-Ops-Agent-Health-Status [zdx8YtZJOMWtbv1L].md) | zdx8YtZJOMWtbv1L | 11 | GET/POST /webhook/health |
| Published | [RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft](workflows/Published/RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft [fullRetrievalD01].md) | fullRetrievalD01 | 67 |  |
| Published | [RETRIEVE Workflow-status-check](workflows/Published/RETRIEVE Workflow-status-check [b63H3FLO9nFujtQp].md) | b63H3FLO9nFujtQp | 5 | GET/POST /webhook/job-status-retrieve |

## Notes

- Credential values and secrets are not exported by n8n; only credential references are documented.
- Full node parameter snapshots are included in each workflow document for future context setting.
- Raw JSON backups remain the source of truth for exact workflow re-import.