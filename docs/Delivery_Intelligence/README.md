# Delivery Intelligence Expansion Plan

## Purpose

This folder defines the plan for extending Q-Ops Agent from a QA operations platform into an Enterprise Delivery Intelligence platform.

The expansion must preserve the current working QA capabilities while adding SDLC-wide intelligence:

- Cross-project engineering discovery
- Reusable solution marketplace
- Technology intelligence
- Organizational learning capture
- AI recommendations
- Delivery analytics
- Governance-aware semantic search

No current workflow should be modified until the implementation plan is reviewed and approved.

## Current Foundation To Preserve

The existing platform already provides a strong QA intelligence foundation:

- Knowledge base ingestion
- Chroma-based retrieval
- QA document generation
- Jira epics and stories generation
- Confluence publishing
- Supabase job tracking
- Token, cost, and usage analytics
- Polling, notifications, metrics, and diagnostics
- User and project access management

The Delivery Intelligence expansion should sit beside this foundation, not replace it.

## Target Product Shape

The future product should have two clear modes:

1. QA Operations
   Existing Q-Ops workflows for QA artifact ingestion, test documentation, risk, RTM, test cases, and Jira backlog generation.

2. Delivery Intelligence
   New SDLC workflows for reusable implementation discovery, technology mapping, project similarity, organizational learnings, and engineering recommendations.

## Documentation Map

- [01_Implementation_Roadmap.md](./01_Implementation_Roadmap.md)
  Phased delivery plan from foundation to enterprise intelligence.

- [02_Supabase_Data_Model_Plan.md](./02_Supabase_Data_Model_Plan.md)
  Proposed tables, relationships, RLS model, indexes, and migration strategy.

- [03_n8n_Workflow_Plan.md](./03_n8n_Workflow_Plan.md)
  Proposed n8n workflows for ingestion, extraction, recommendations, and APIs.

- [04_UI_Design_Plan.md](./04_UI_Design_Plan.md)
  Proposed navigation, screens, components, and interaction design.

- [05_API_Data_Flow_Plan.md](./05_API_Data_Flow_Plan.md)
  UI-facing contracts, data flow, and integration boundaries.

- [06_Testing_Cutover_Plan.md](./06_Testing_Cutover_Plan.md)
  Testing, rollout, risk controls, and production-readiness checklist.

## Recommended First Decision

Before implementation, decide whether Delivery Intelligence should be:

- A new section inside the current Q-Ops dashboard, or
- A separate workspace mode with shared authentication, users, projects, and settings.

Recommendation: start as a new workspace mode inside the same app. This preserves reuse of authentication, Supabase projects, analytics, and existing UI patterns while keeping the product concept clear.

