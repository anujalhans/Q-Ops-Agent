# Delivery Intelligence AI-Native Gap To Implementation Roadmap

## Purpose

This document converts the strategic vision in `enterprise_ai_native_feature_problem_solution_master_plan.md` into a practical implementation roadmap for the current Q-Ops codebase, Supabase schema, n8n workflows, and Delivery Intelligence UI.

This is intended to be the working execution plan for end-to-end implementation.

## Scope And Guardrails

- Keep existing QA Intelligence flows intact.
- Keep existing QA generation, Jira, Confluence, ingestion, and polling behavior intact.
- Extend Delivery Intelligence as a separate additive capability.
- Reuse the current `di_*` schema, current DI workflows, and current DI UI wherever possible.
- Prefer phased delivery over broad simultaneous rewrites.

## Current State Snapshot

### Already Implemented

#### Supabase

Existing DI tables:

- `di_intelligence_jobs`
- `di_technologies`
- `di_project_technologies`
- `di_reusable_solutions`
- `di_solution_technologies`
- `di_solution_assets`
- `di_organizational_learnings`
- `di_knowledge_relationships`
- `di_recommendations`

#### n8n

Existing DI workflows:

- `DI - Intelligence Queue Creator and Status API`
- `DI - Intelligence Worker`
- `DI - Cross Project Search API`
- `DI - Catalog Read API`
- `DI - Recommendation Feedback API`

#### UI

Existing DI UI areas:

- Delivery Intelligence Overview
- Cross-Project Discovery
- Solution Marketplace
- Technology Intelligence
- AI Recommendations
- Organizational Learnings
- Relationship Explorer

### Current Strengths

- Project-scoped DI extraction already exists.
- DI queueing and polling model already exists.
- Governed catalog read model already exists.
- Recommendation feedback loop already exists.
- Core DI tables already support technologies, solutions, learnings, relationships, and recommendations.

### Current Limitations

- DI extraction is still heuristic and mostly driven by project metadata plus read-only QA outputs.
- DI search is governed text filtering, not true semantic organizational search.
- Only one DI extraction path is actively used from UI: `project_intelligence_extract`.
- No publish-review-governance workflow exists for reusable solutions.
- No dedicated similarity or duplicate engineering detector exists.
- No onboarding assistant, risk prediction, architecture advisor, RCA intelligence, or knowledge gap engine exists yet.
- DI analytics and DI operational telemetry are limited.

## Feature Coverage Matrix

### 1. AI Semantic Organizational Search

Current coverage:

- Partial

What exists:

- DI search API across `di_*` tables

What is missing:

- true embedding-based semantic retrieval
- intent-aware ranking
- multi-source enterprise evidence retrieval

### 2. Duplicate Engineering Detection

Current coverage:

- Missing

What is missing:

- similarity detector
- duplicate effort scoring
- reusable match explanations

### 3. AI Reusable Solution Marketplace

Current coverage:

- Partial

What exists:

- reusable solution tables
- catalog read
- UI listing

What is missing:

- review workflow
- publish workflow
- edit/update API
- sanitization workflow

### 4. AI Organizational Memory

Current coverage:

- Partial

What exists:

- `di_organizational_learnings`

What is missing:

- richer memory extraction from RCA, operations, delivery, and architecture sources

### 5. AI Onboarding Assistant

Current coverage:

- Missing

### 6. AI QA Intelligence Engine

Current coverage:

- Partial through QA Intelligence layer, not DI layer

What is missing:

- explicit DI reuse of historical QA patterns and QA strategy recommendations

### 7. AI Delivery Risk Prediction

Current coverage:

- Missing

### 8. AI Architecture Advisor

Current coverage:

- Missing

### 9. AI Semantic RCA Intelligence

Current coverage:

- Missing

### 10. AI Knowledge Gap Detection

Current coverage:

- Missing

## Gap Summary By Layer

### 1. Source Ingestion Gap

Today DI primarily uses:

- project metadata
- DI job payload
- read-only QA outputs

To achieve the target vision, DI must also ingest or derive intelligence from:

- Jira tickets and epics
- Confluence pages
- GitHub repositories and code summaries
- architecture documents
- runbooks and deployment guides
- incident and RCA content
- onboarding materials
- selected delivery metrics

### 2. Data Model Gap

Current tables are enough for the DI foundation, but not enough for the target AI-native platform.

### 3. Workflow Gap

Current workflows support extraction, catalog read, search, and recommendation feedback.

Missing are:

- similarity workflows
- publish/review workflows
- onboarding workflows
- risk workflows
- architecture workflows
- RCA workflows
- knowledge gap workflows

### 4. UI Gap

Current UI is catalog-oriented.

Missing are:

- operator workflows
- approval workflows
- risk and decision dashboards
- onboarding views
- compare/similarity views
- publish/review actions

### 5. Governance Gap

Current DI records have visibility fields, but governance is not fully operationalized.

Missing are:

- review states
- publish approval states
- sanitization rules
- explicit client-restricted handling workflow
- export controls

## Recommended Implementation Phases

## Phase 1: Strengthen The DI Foundation

### Goal

Make the current DI implementation production-grade before adding major new features.

### Supabase Work

Add:

- `di_project_profiles`
  - one summary row per project
  - stores project summary, domains, delivery type, major dependencies, QA maturity summary, onboarding summary stub

- `di_job_metrics`
  - optional but recommended
  - keeps DI telemetry separate from `qa_job_metrics`

Optional additions:

- `di_source_registry`
  - tracks which sources contributed to DI extraction for a project

### n8n Work

Enhance existing workflows:

- extend `DI - Intelligence Worker`
  - persist `di_project_profiles`
  - capture normalized source evidence
  - better extraction summary payloads

- extend `DI - Catalog Read API`
  - include project profile summary in overview

- extend `DI - Cross Project Search API`
  - improve scoring and ranking
  - support entity-specific search modes

New workflow:

- `DI - Semantic Reindex Worker`
  - prepares DI semantic search index
  - should be designed so it can later plug into Chroma or another vector layer

### UI Work

Enhance existing DI pages:

- Overview:
  - add project profile summary
  - add source coverage widget
  - add extraction freshness and last-run status

- Discovery:
  - add entity tabs and search quality indicators
  - add better search result grouping

- Solution Marketplace:
  - display source evidence, technologies, project usage

### Exit Criteria

- Project-level DI summary is visible.
- DI extraction is richer and less heuristic.
- Search ranking feels materially improved.
- DI records have clearer evidence traceability.

## Phase 2: Duplicate Engineering And Similarity Intelligence

### Goal

Implement the first high-value enterprise intelligence feature: finding reusable work and detecting overlap.

### Supabase Work

Add:

- `di_similarity_matches`
  - source entity type/id
  - target entity type/id
  - match type
  - score
  - rationale
  - evidence
  - status
  - created_at

Recommended match types:

- `project_similarity`
- `solution_similarity`
- `duplicate_effort_risk`
- `qa_pattern_similarity`
- `technology_stack_similarity`

### n8n Work

Add:

- `DI - Similarity Detector`
- `DI - Duplicate Engineering Recommendation Generator`

Responsibilities:

- compare project profiles
- compare reusable solutions
- compare technologies and QA outputs
- write `di_similarity_matches`
- create recommendations in `di_recommendations`

### UI Work

Add:

- Similar Projects panel
- Reuse Match drawer
- Duplicate Effort Risk panel

Recommended placement:

- DI Overview
- Discovery result details
- Recommendations

### Exit Criteria

- Users can see similar projects and reusable matches.
- Recommendations can point to actual reusable candidates.
- Duplicate effort warnings are actionable and evidence-backed.

## Phase 3: Reusable Solution Marketplace Governance

### Goal

Move the solution marketplace from passive listing to governed publish-review reuse.

### Supabase Work

Add:

- `di_solution_reviews`
  - solution_id
  - review_status
  - review_notes
  - reviewed_by
  - reviewed_at

Optional:

- `di_solution_exports`
  - logs external exports or publication actions

### n8n Work

Add:

- `DI - Solution Publish Review API`
- `DI - Solution Update API`
- `DI - Sensitive Content Review Workflow`

Responsibilities:

- move solution through `draft -> review -> published -> archived`
- validate visibility level
- enforce sanitization requirements
- write audit events

### UI Work

Add:

- Solution review queue
- Publish / archive / send-back actions
- Visibility editing
- Review history

### Exit Criteria

- A reusable solution can be reviewed and published safely.
- Visibility and governance are enforced through workflow, not just columns.

## Phase 4: Organizational Memory And Onboarding Intelligence

### Goal

Start turning DI into organizational memory instead of only extraction output.

### Supabase Work

Add:

- `di_onboarding_guides`
  - project_id
  - title
  - summary
  - service_map
  - dependency_list
  - learning_path
  - critical_risks
  - source_evidence

Optional:

- `di_memory_events`
  - if you want long-term lineage of extracted memory objects

### n8n Work

Add:

- `DI - Organizational Memory Extractor`
- `DI - Onboarding Summary Generator`

Inputs:

- project profile
- learnings
- technologies
- reusable solutions
- QA outputs
- architecture and runbook sources

### UI Work

Add:

- Onboarding Assistant page
- Organizational Memory page or subsection
- “Suggested learning order” and “critical system context” cards

### Exit Criteria

- A new user can open a project and see a structured onboarding summary.
- Delivery/QA/architecture learnings become reusable and browseable.

## Phase 5: Delivery Risk, Architecture Advisor, RCA Intelligence, Knowledge Gaps

### Goal

Implement the advanced intelligence layer after the DI foundation is mature.

### Supabase Work

Add:

- `di_delivery_risks`
- `di_architecture_patterns`
- `di_rca_insights`
- `di_knowledge_gaps`

Suggested responsibilities:

- `di_delivery_risks`
  - project risk predictions
  - confidence
  - recommended actions

- `di_architecture_patterns`
  - reusable architecture patterns and suitability

- `di_rca_insights`
  - repeated incident patterns, common root causes, reusable fixes

- `di_knowledge_gaps`
  - missing documentation, missing QA coverage, onboarding gaps

### n8n Work

Add:

- `DI - Delivery Risk Analyzer`
- `DI - Architecture Advisor`
- `DI - RCA Intelligence Extractor`
- `DI - Knowledge Gap Detector`

### UI Work

Add:

- Delivery Risk Dashboard
- Architecture Recommendations page
- RCA Intelligence page
- Knowledge Gap Report page

### Exit Criteria

- DI becomes predictive and advisory, not only descriptive.

## Concrete Workflow Roadmap

### Existing Workflows To Extend

- `DI - Intelligence Worker`
- `DI - Cross Project Search API`
- `DI - Catalog Read API`
- `DI - Recommendation Feedback API`

### New Workflows To Add

Priority order:

1. `DI - Semantic Reindex Worker`
2. `DI - Similarity Detector`
3. `DI - Duplicate Engineering Recommendation Generator`
4. `DI - Solution Publish Review API`
5. `DI - Solution Update API`
6. `DI - Organizational Memory Extractor`
7. `DI - Onboarding Summary Generator`
8. `DI - Delivery Risk Analyzer`
9. `DI - Architecture Advisor`
10. `DI - RCA Intelligence Extractor`
11. `DI - Knowledge Gap Detector`

## Concrete UI Roadmap

### Existing DI UI To Enhance

- `di-overview`
- `di-discovery`
- `di-solutions`
- `di-technologies`
- `di-recommendations`
- `di-learnings`
- `di-relationships`

### New DI UI Areas To Add

Priority order:

1. Similarity / Duplicate Detection
2. Solution Review / Publish Queue
3. Onboarding Assistant
4. Delivery Risk Dashboard
5. Architecture Advisor
6. RCA Intelligence
7. Knowledge Gap Report

## Recommended End-To-End Implementation Order

### Wave 1

- strengthen extraction
- add project profiles
- improve search
- add DI metrics

### Wave 2

- add similarity and duplicate detection
- expose similarity in UI

### Wave 3

- add solution review/publish governance
- harden marketplace

### Wave 4

- add onboarding and organizational memory

### Wave 5

- add risk, architecture, RCA, and knowledge gap intelligence

## Testing And Validation Plan

For each wave:

### Supabase Validation

- verify inserts and updates across DI tables
- verify RLS behavior for admin vs registered user
- verify catalog reads only show governed records

### n8n Validation

- validate each workflow with pinned data
- validate worker lock behavior
- validate failure handling and job status transitions
- validate audit events where applicable

### UI Validation

- validate admin and registered user experience
- validate job launch and polling
- validate new views do not break current DI navigation
- validate error states are graceful

### Regression Validation

- confirm QA Intelligence layer is unaffected
- confirm existing QA generation/integration flows are unaffected

## Key Dependencies To Decide Early

These decisions should be made before advanced implementation:

- Which source systems are Phase 2 sources:
  - Jira
  - Confluence
  - GitHub
  - Slack/Teams
  - RCA docs
  - deployment logs

- Which semantic index will DI use:
  - same Chroma strategy
  - separate DI collection
  - different vector strategy

- Which governance levels are operationally allowed:
  - organization
  - department
  - team
  - project
  - client_restricted
  - ai_sanitized_only

- Whether DI metrics should stay in `qa_job_metrics` or move to `di_job_metrics`

## Current Implementation Boundary And Pending Pickup List

As of the current internal-first implementation pass, the following roadmap items are completed and the remaining items should be treated as pending work for later phases.

### Implemented In Current Internal-First Phase

- DI-only Supabase foundation added:
  - `di_project_profiles`
  - `di_job_metrics`
  - `di_similarity_matches`
  - `di_solution_reviews`
  - `di_onboarding_guides`
- Existing DI persistence path extended to synthesize:
  - project profile
  - onboarding guide
  - DI job metrics
  - similarity record structure
- Existing DI projects backfilled into the new profile/onboarding/metrics model
- New n8n workflows created and published:
  - `DI - Insights API`
  - `DI - Solution Review API`
- New Delivery Intelligence UI views added:
  - `DI Overview`
  - `Project Profile`
  - `Onboarding`
  - `Governance`
  - `Similarity`
- Governance baseline implemented:
  - review
  - publish/archive state handling
  - `di_solution_reviews` persistence
- DI overview job display patched to reflect `di_intelligence_jobs` records more reliably

### Partially Implemented

- Similarity capability:
  - table and UI exist
  - mature matching/scoring logic is still pending
- Governance capability:
  - baseline workflow exists
  - richer review lifecycle, curation, and policy-driven publishing are still pending
- Onboarding capability:
  - onboarding guide exists
  - richer assistant-style onboarding and task-driven flows are still pending
- DI metrics:
  - `di_job_metrics` exists
  - DI-specific analytics and reporting depth are still pending

### Pending For Later Phases

The following roadmap items remain intentionally pending and should be picked up in later implementation waves.

#### Semantic And Search Intelligence

- true semantic organizational search
- vector-backed DI retrieval strategy
- semantic indexing or reindex workflow
- stronger cross-source search reasoning

#### Duplicate Detection And Similarity Intelligence

- mature project-to-project similarity engine
- duplicate engineering detection
- reusable overlap scoring with stronger evidence and ranking
- richer population of `di_similarity_matches`

#### Marketplace And Governance Maturity

- advanced reusable solution marketplace experience
- reviewer workflow and assignment model
- stronger publish/review lifecycle
- sanitization and controlled release flow
- broader governance reporting and audit visibility

#### Organizational Memory Expansion

- richer organizational memory beyond current internal project and QA signals
- broader reuse of internal delivery history as enterprise memory
- stronger cross-project memory extraction patterns

#### Advanced AI-Native Intelligence Features

- delivery risk prediction
- architecture advisor
- semantic RCA intelligence
- knowledge gap detection
- deeper QA-to-DI intelligence bridge maturity

#### Additional Data Model Expansion Expected Later

- `di_delivery_risks`
- `di_architecture_patterns`
- `di_rca_insights`
- `di_knowledge_gaps`
- any additional governance support tables needed by richer workflows

#### Additional n8n Workflow Expansion Expected Later

- `DI - Semantic Reindex Worker`
- `DI - Similarity Detector`
- `DI - Delivery Risk Analyzer`
- `DI - Architecture Advisor`
- `DI - RCA Intelligence Extractor`
- `DI - Knowledge Gap Detector`
- richer solution governance workflow(s)

#### Additional UI Expansion Expected Later

- DI risk dashboard
- architecture recommendations screen
- RCA insights screen
- knowledge gaps screen
- stronger marketplace/governance console
- more workflow-first DI launcher experience

#### External-Inclusive Expansion Still Pending By Design

These were intentionally excluded from the internal-first phase and remain future scope:

- Jira ingestion into DI
- Confluence ingestion into DI
- GitHub ingestion into DI
- Slack/Teams or other collaboration source ingestion into DI

## Immediate Next Actions

Recommended immediate next implementation steps:

1. Add `di_project_profiles`
2. Add `di_job_metrics`
3. Extend `DI - Intelligence Worker` to persist richer extraction summary and project profile
4. Upgrade DI UI overview to show project profile, source coverage, and freshness
5. Design and implement `di_similarity_matches`
6. Build `DI - Similarity Detector`

## Important Security Note

While DI tables have RLS enabled, the platform still has a critical unresolved security issue on QA-side tables:

- `qa_jobs`
- `doc_ingestion_jobs`
- `doc_ingestion_queuecreator_logs`
- `qa_job_metrics`

RLS is disabled there.

This does not block drafting the DI roadmap, but it should be handled before broad production rollout of the full enterprise intelligence platform.

## Definition Of Success

This roadmap succeeds when:

- DI is no longer just a catalog of extracted rows
- DI can detect reuse and similarity across projects
- reusable solutions can be governed and published safely
- onboarding and organizational memory become first-class outputs
- delivery, architecture, RCA, and knowledge gaps become actionable intelligence
- all of this remains additive to the existing QA Intelligence layer
