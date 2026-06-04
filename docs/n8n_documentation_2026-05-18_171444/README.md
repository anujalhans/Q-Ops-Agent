# n8n Workflow Documentation - 2026-05-18 17:14:44 IST

This folder documents the latest exported n8n workflows from `docs/n8n_workflows_2026-05-18_171444`. It includes both published and unpublished workflows so implementation context stays aligned with the current n8n instance.

## Contents

- `workflows/Published/`: one detailed markdown document per active/published workflow.
- `workflows/Unpublished/`: one detailed markdown document per inactive/unpublished workflow.
- `manifest.json`: machine-readable workflow inventory and documentation paths.
- `dependency-map.md`: inferred external URLs/webhooks, credential references, and Supabase/data table references.

## Summary

- Total workflows documented: 71
- Published workflows: 39
- Unpublished workflows: 32

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
| Published | [Multimodal Knowledge Ingestion & Vectorization Engine - In Progress](workflows/Published/Multimodal Knowledge Ingestion & Vectorization Engine - In Progress [C9oZfZxpGFakzlB3].md) | C9oZfZxpGFakzlB3 | 35 |  |
| Published | [PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready](workflows/Published/PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready [Vwc6c8ehsRTF8svG].md) | Vwc6c8ehsRTF8svG | 40 |  |
| Published | [PRO QA Generation Queue Creator - Ready Draft](workflows/Published/PRO QA Generation Queue Creator - Ready Draft [yPgr7mtUnL3E8QQP].md) | yPgr7mtUnL3E8QQP | 18 | POST /webhook/generate-qa-doc<br>OPTIONS /webhook/generate-qa-doc |
| Published | [PRO QA Generation Queue Worker - Ready Draft](workflows/Published/PRO QA Generation Queue Worker - Ready Draft [QApRBFSaJgINsdHN].md) | QApRBFSaJgINsdHN | 22 |  |
| Published | [PRO QA Jira Story Test Case Generator](workflows/Published/PRO QA Jira Story Test Case Generator [SG7khcKlhHst48WH].md) | SG7khcKlhHst48WH | 18 |  |
| Published | [PRO QA Story Test Cases Queue Creator](workflows/Published/PRO QA Story Test Cases Queue Creator [8nuhDEewnnunXSbF].md) | 8nuhDEewnnunXSbF | 18 | POST /webhook/generate-story-test-cases<br>OPTIONS /webhook/generate-story-test-cases |
| Published | [PRO QA Story Test Cases Worker](workflows/Published/PRO QA Story Test Cases Worker [ivz13uFyjfCT8149].md) | ivz13uFyjfCT8149 | 19 |  |
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
| Published | [Q-Ops Agent Settings API](workflows/Published/Q-Ops Agent Settings API [ZuXZfzhWr8Fcep5a].md) | ZuXZfzhWr8Fcep5a | 6 | GET/POST /webhook/settings |
| Published | [Q-Ops Agent Settings Write API](workflows/Published/Q-Ops Agent Settings Write API [u3klCtPvbFd01ds4].md) | u3klCtPvbFd01ds4 | 6 | PATCH /webhook/settings |
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
| Unpublished | [AI Test Plan Generator](workflows/Unpublished/AI Test Plan Generator [pBxaNCUMJonO6Jg8].md) | pBxaNCUMJonO6Jg8 | 19 |  |
| Unpublished | [AI Test Plan Generator - Supports File Upload Dynamically via API](workflows/Unpublished/AI Test Plan Generator - Supports File Upload Dynamically via API [Xv7UheIRR8lYxc4d].md) | Xv7UheIRR8lYxc4d | 21 | POST /webhook/upload-test-docs |
| Unpublished | [AI Test Plan Generator - Supports only Text Input](workflows/Unpublished/AI Test Plan Generator - Supports only Text Input [8tNH0Qc3q3LGdP8x].md) | 8tNH0Qc3q3LGdP8x | 20 |  |
| Unpublished | [Auto PR Review](workflows/Unpublished/Auto PR Review [1sSbHEeqlS4K7Alb].md) | 1sSbHEeqlS4K7Alb | 12 | POST /webhook/github-pr-review |
| Unpublished | [Github->Jenkins Job Trigger](workflows/Unpublished/Github- Jenkins Job Trigger [FAkgwawIgaG54lOY].md) | FAkgwawIgaG54lOY | 10 | POST /webhook/github-webhook |
| Unpublished | [INGEST API Queue Creator - SaaS](workflows/Unpublished/INGEST API Queue Creator - SaaS [pjz9L77szB9DDsN1].md) | pjz9L77szB9DDsN1 | 12 | POST /webhook/upload-test-artifacts |
| Unpublished | [INGEST Worker Engine (Queue Processor)](workflows/Unpublished/INGEST Worker Engine (Queue Processor) [iKOec9hKQmR2KgHs].md) | iKOec9hKQmR2KgHs | 13 |  |
| Unpublished | [Intelligent Quality Engineering Documentation Generator](workflows/Unpublished/Intelligent Quality Engineering Documentation Generator [jKI3mzjtDyezA3eP].md) | jKI3mzjtDyezA3eP | 11 | POST /webhook/generate-qa-doc |
| Unpublished | [Intelligent Quality Engineering Documentation Generator - Refactored](workflows/Unpublished/Intelligent Quality Engineering Documentation Generator - Refactored [TAqc6zIDxTE6dsVm].md) | TAqc6zIDxTE6dsVm | 38 | POST /webhook/generate-qa-doc |
| Unpublished | [Multimodal Knowledge Ingestion & Vectorization Engine](workflows/Unpublished/Multimodal Knowledge Ingestion & Vectorization Engine [n0fvS28StF5iMZvG].md) | n0fvS28StF5iMZvG | 33 |  |
| Unpublished | [Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft](workflows/Unpublished/Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft [fullIngestDraft01].md) | fullIngestDraft01 | 34 |  |
| Unpublished | [My Sub-workflow](workflows/Unpublished/My Sub-workflow [VlsQ96Ok64BoaQea].md) | VlsQ96Ok64BoaQea | 2 |  |
| Unpublished | [NAGP_DataPreprocessor_Puru](workflows/Unpublished/NAGP_DataPreprocessor_Puru [jtTovk07OGHpS8UF].md) | jtTovk07OGHpS8UF | 15 |  |
| Unpublished | [NAGP-Data-preprocssor - Defect Intelligence](workflows/Unpublished/NAGP-Data-preprocssor - Defect Intelligence [ij7m4kdXx4KFWfOz].md) | ij7m4kdXx4KFWfOz | 9 |  |
| Unpublished | [NAGP-RAG-Agent- DefectIntelligence](workflows/Unpublished/NAGP-RAG-Agent- DefectIntelligence [wA3qrgR59Vlov0BQ].md) | wA3qrgR59Vlov0BQ | 6 |  |
| Unpublished | [Puru_AI-Powered Defect Triage and Classification Agent](workflows/Unpublished/Puru_AI-Powered Defect Triage and Classification Agent [UEfHE0VTkSxFvffG].md) | UEfHE0VTkSxFvffG | 6 |  |
| Unpublished | [Q-Ops Agent Projects API](workflows/Unpublished/Q-Ops Agent Projects API [J9wp94YeehAthHX0].md) | J9wp94YeehAthHX0 | 11 | GET/POST /webhook/projects<br>POST /webhook/projects |
| Unpublished | [Q-Ops Agent Repository API](workflows/Unpublished/Q-Ops Agent Repository API [8isqdCjPaPqE02eG].md) | 8isqdCjPaPqE02eG | 31 | GET/POST /webhook/projects<br>POST /webhook/projects<br>GET/POST /webhook/artifacts<br>GET/POST /webhook/generated-documents<br>GET/POST /webhook/audit-events<br>POST /webhook/artifacts/:artifactId/reprocess |
| Unpublished | [RETRIEVAL Document Generator AI Agent - SaaS](workflows/Unpublished/RETRIEVAL Document Generator AI Agent - SaaS [0G3qlenjAeBnHDTr].md) | 0G3qlenjAeBnHDTr | 67 |  |
| Unpublished | [RETRIEVAL Job Queue Creator - SaaS](workflows/Unpublished/RETRIEVAL Job Queue Creator - SaaS [sbUy9luTFnRJ52El].md) | sbUy9luTFnRJ52El | 5 | POST /webhook/generate-qa-doc |
| Unpublished | [RETRIEVAL Job Queue Creator - SaaS - Attributed Draft](workflows/Unpublished/RETRIEVAL Job Queue Creator - SaaS - Attributed Draft [d8hZl2gQpuWjlwr3].md) | d8hZl2gQpuWjlwr3 | 10 | POST /webhook/generate-qa-doc |
| Unpublished | [RETRIEVAL Worker Engine (Queue Processor) - Saas](workflows/Unpublished/RETRIEVAL Worker Engine (Queue Processor) - Saas [wvfvdSZjyRSEhy7Z].md) | wvfvdSZjyRSEhy7Z | 7 |  |
| Unpublished | [RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft](workflows/Unpublished/RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft [ew9RdPEvMAq5P6t3].md) | ew9RdPEvMAq5P6t3 | 7 |  |
| Unpublished | [Reverse-Engineering-Code-to-HLD Automation Pipeline (using OpenAI)](workflows/Unpublished/Reverse-Engineering-Code-to-HLD Automation Pipeline (using OpenAI) [gJzaM5OpYbwTw8qo].md) | gJzaM5OpYbwTw8qo | 29 |  |
| Unpublished | [Reverse-Engineering-Code-to-HLD Automation Pipeline (using OpenAI) - Refactored](workflows/Unpublished/Reverse-Engineering-Code-to-HLD Automation Pipeline (using OpenAI) - Refactored [i75ptvltSLz3ycUe].md) | i75ptvltSLz3ycUe | 31 |  |
| Unpublished | [Smart Travel Planning Agent](workflows/Unpublished/Smart Travel Planning Agent [B35RDSK69GLxA03S].md) | B35RDSK69GLxA03S | 6 |  |
| Unpublished | [Test Plan Generator](workflows/Unpublished/Test Plan Generator [TWSoUemb3J13h5wC].md) | TWSoUemb3J13h5wC | 7 |  |
| Unpublished | [Test Plan Generator - Text + OpenAI Vision Extractor (Final Version)](workflows/Unpublished/Test Plan Generator - Text + OpenAI Vision Extractor (Final Version) [Zh8eTzahoEYzfsiu].md) | Zh8eTzahoEYzfsiu | 41 | POST /webhook/upload-test-docs |
| Unpublished | [Test Plan Generator - using Gemini](workflows/Unpublished/Test Plan Generator - using Gemini [RNJmuRQkUl7Mj490].md) | RNJmuRQkUl7Mj490 | 45 | POST /webhook/upload-test-docs |
| Unpublished | [Test Strategy Generator - Text + OpenAI Vision Extractor (Final Version)](workflows/Unpublished/Test Strategy Generator - Text + OpenAI Vision Extractor (Final Version) [QA1M2UVADLckZYi0].md) | QA1M2UVADLckZYi0 | 41 | POST /webhook/upload-test-docs |
| Unpublished | [User Stories Generator - Text + OpenAI Vision Extractor (Final Version)](workflows/Unpublished/User Stories Generator - Text + OpenAI Vision Extractor (Final Version) [dFOtHUCCXKS8ASn9].md) | dFOtHUCCXKS8ASn9 | 43 | POST /webhook/upload-test-docs |
| Unpublished | [User Story generator - Refactored (In Progress)](workflows/Unpublished/User Story generator - Refactored (In Progress) [Ut1ktNhq7jGXmkuQ].md) | Ut1ktNhq7jGXmkuQ | 33 | POST /webhook/upload-test-docs |

## Notes

- Credential values are normally not exported by n8n; credential references are documented by name/type.
- Markdown parameter snapshots redact obvious Basic/Bearer/password/token literals where detected.
- Raw JSON backups remain the source of truth for exact workflow re-import.

