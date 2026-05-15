# UI Design Plan

## UX Direction

Extend the current Q-Ops dashboard into a Delivery Intelligence workspace without making the existing QA flows harder to use.

Recommended model:

- Keep current navigation for QA operations.
- Add a Delivery Intelligence group in the sidebar.
- Use the existing dense operational design style.
- Avoid marketing-style screens.
- Make search, reuse, and relationships the center of the experience.

## New Navigation Areas

### Delivery Intelligence Overview

Purpose:

Show a high-level SDLC intelligence summary.

Widgets:

- Reusable solutions discovered
- Active recommendations
- Technologies detected
- Cross-project similarities
- Organizational learnings
- Reuse opportunity trend

### Solution Marketplace

Purpose:

Let users discover and manage reusable engineering and QA accelerators.

Core UI:

- Filterable table/list of reusable solutions
- Tags and technology filters
- Visibility badge
- Complexity badge
- Reuse recommendation score
- Source project
- Owner/team
- Detail drawer

Detail drawer sections:

- Problem solved
- Implementation approach
- Technologies
- QA approach
- Production learnings
- Risks and limitations
- Related projects
- Related artifacts
- Reuse guidance

### Cross-Project Discovery

Purpose:

Natural-language search across projects, solutions, QA outputs, technologies, and learnings.

Core UI:

- Search input with category filters
- Result groups by entity type
- AI-generated answer summary
- Evidence/source chips
- Related solutions panel
- Similar projects drawer

### Technology Intelligence

Purpose:

Show technology usage across projects.

Core UI:

- Technology table
- Project usage count
- Related reusable solutions
- Related learnings
- Risk/age indicators
- Adoption trend

### Organizational Learnings

Purpose:

Preserve and discover operational, incident, QA, deployment, and architecture learnings.

Core UI:

- Timeline/list view
- Category filters
- Source project
- Impact level
- Reuse recommendation
- Related solutions

### AI Recommendations

Purpose:

Show proactive reuse and delivery recommendations.

Core UI:

- Recommendation cards
- Confidence score
- Source evidence
- Related entity links
- Accept/dismiss actions
- Convert to action/backlog option later

### Relationship Explorer

Purpose:

Visualize relationships between projects, technologies, solutions, learnings, and QA outputs.

MVP UI:

- Table-first relationship browser
- Entity detail side drawer
- Related items list

Later UI:

- Graph visualization

## Reusable Components

Build these components once and reuse them across Delivery Intelligence screens:

- `VisibilityBadge`
- `ConfidenceBadge`
- `TechnologyChip`
- `SourceEvidenceList`
- `RelatedSolutionsPanel`
- `SimilarProjectsDrawer`
- `RecommendationCard`
- `LearningTimeline`
- `SolutionDetailDrawer`
- `RelationshipList`

## Interaction Rules

- Users should always see why a recommendation exists.
- Every AI-generated recommendation should link to evidence.
- Restricted records should show a clear restricted state, not disappear silently.
- Admin-only actions should be visible only to admins where possible.
- Registered users should see only assigned project intelligence plus organization-approved reusable assets.

## MVP Screen Priority

Build in this order:

1. Delivery Intelligence Overview
2. Solution Marketplace
3. Cross-Project Discovery
4. Technology Intelligence
5. AI Recommendations
6. Organizational Learnings
7. Relationship Explorer

## Current UI Reuse

Reuse existing patterns from the app:

- Sidebar navigation
- Top search/command button
- Metric cards
- Tables
- Side drawers
- Modal frames
- Status badges
- Analytics panels
- Settings integration blocks

## UX Risks

- Too many new nav items at once can overwhelm users.
- AI recommendations without evidence will reduce trust.
- Graph UI too early may look impressive but be less useful than tables.
- If governance is unclear, users may distrust search results.

Recommendation:

Start with tables, drawers, and evidence panels. Add graph visualization only after relationships are useful.

