# Google Stitch Brief: Q-Ops Agent Presentation Layer Redesign

Date: 2026-06-12

Purpose: Create professional, user-friendly, responsive UI/UX designs for the entire Q-Ops Agent application while preserving all existing displayed content, functionality, behavior, workflows, roles, data contracts, and business logic.

This brief is intended for Google Stitch or a UI design agent. The output should be design-only: high-fidelity screens, responsive variants, component states, and design-system guidance that can later be implemented in the existing React application without changing how the product works.

---

## 1. Primary Objective

Transform only the presentation layer of Q-Ops Agent across all screens, pages, modals, panels, forms, lists, tables, cards, progress bars, status indicators, notifications, empty states, loading states, and displayed UI text.

The redesigned application should feel like a polished enterprise SaaS product for QA operations and AI-assisted delivery intelligence. It should be clear, credible, efficient, accessible, and consistent across the complete product surface.

Important: Preserve the existing displayed content exactly. Do not rewrite headings, body copy, CTA labels, form labels, statuses, helper text, validation messages, error messages, comparison text, capability names, navigation labels, footer text, or generated-output labels. The redesign should change how the content is presented, not what the content says.

---

## 2. Non-Negotiable Functional Freeze

The redesign must not change application behavior.

Do not change:

- Existing displayed text/content.
- Existing headings.
- Existing subheadings.
- Existing section copy.
- Existing navigation labels.
- Existing CTA labels.
- Existing form labels.
- Existing helper text.
- Existing validation messages.
- Existing error/success/warning messages.
- Existing status labels.
- Existing comparison table content.
- Existing capability names.
- Existing footer text.
- Authentication behavior.
- Login, logout, password reset, invite, or session restore behavior.
- API endpoints, request payloads, response handling, polling, retry behavior, or error handling logic.
- Supabase Auth session handling.
- n8n webhook behavior.
- Role-based access rules.
- Admin versus registered-user visibility.
- Project scoping.
- Project creation behavior.
- User assignment behavior.
- Knowledge-base upload behavior.
- Document generation behavior.
- Job polling and job status behavior.
- Generated output rendering logic.
- Jira or Confluence routing behavior.
- Settings save behavior.
- Integration test behavior.
- Audit log scoping.
- Notification scoping.
- Search/filter behavior if already implemented.
- Existing CTA click behavior.
- Existing navigation destinations.
- Existing form validation rules.
- Existing field values used by logic.
- Existing internal identifiers, status keys, document type keys, route keys, or API field names.

Allowed changes:

- Layout.
- Visual hierarchy.
- Typography.
- Color system.
- Spacing.
- Borders.
- Shadows.
- Component styling.
- Icon selection and icon styling.
- Responsive layout.
- Empty-state visual treatment without changing wording.
- Loading-state presentation.
- Error/success/warning visual treatment.
- Progress bar visual treatment.
- Table/list/card presentation.
- Modal/drawer presentation.
- Help text visual treatment without changing wording.

If a design idea requires new behavior, mark it clearly as "Future enhancement - not part of presentation-only redesign."

If a design idea requires changed wording, mark it separately as "Optional copy recommendation - do not implement in presentation-only redesign."

---

## 3. Content Freeze Requirement

Use the current application content as the source of truth and preserve it exactly.

The design may reorganize how the same content is visually arranged:

- Same text in a new layout.
- Same heading with improved typography.
- Same form label with improved field styling.
- Same CTA label with improved button hierarchy.
- Same status label with improved badge styling.
- Same table content with improved table layout.
- Same modal content with improved modal composition.

The design may not:

- Replace content with newly written copy.
- Shorten or summarize content.
- Expand content with additional claims.
- Rename sections.
- Rename navigation items.
- Rename CTAs.
- Rename capabilities.
- Rename statuses.
- Add unsupported product promises.
- Remove existing visible text unless it is hidden by existing responsive behavior.

If optional copy improvements are identified, keep them outside the actual screen design in a separate recommendation section.

---

## 4. Product Context

Q-Ops Agent is an AI-assisted QA operations platform. It helps teams convert project evidence into governed QA intelligence.

Primary user goals:

- Log in securely.
- Create or select a project.
- Upload project artifacts such as BRD, FRD, HLD, LLD, transcripts, API docs, UI references, and supporting documents.
- Build or update a project knowledge base.
- Generate QA deliverables from project evidence.
- Track long-running ingestion and generation jobs.
- Review completed, failed, retried, and recovered jobs.
- Review generated documents and Jira/Confluence outputs.
- Monitor operational health, usage, cost, and quality signals.
- Manage users, roles, project assignments, integration settings, and environment settings.
- Use Delivery Intelligence views for project profiling, onboarding, discovery, governance, recommendations, and learnings.

Core product tone:

- Enterprise-grade.
- Operational.
- Trustworthy.
- Precise.
- Efficient.
- AI-native but not gimmicky.
- Professional enough for QA leadership, program managers, product owners, and platform administrators.

---

## 5. Target Personas

### 5.1 Admin

Admin users manage the full workspace.

Admin needs:

- Workspace overview.
- All projects.
- User management.
- Project assignment.
- Integration settings.
- Environment and backend configuration.
- Audit logs.
- System health.
- Analytics.
- All generated outputs.
- Operational diagnostics.

Admin UI should feel powerful but controlled. Prioritize dense information, clear grouping, status visibility, and safe admin actions.

### 5.2 Registered User

Registered users work only on assigned projects.

Registered-user needs:

- See assigned projects only.
- Upload artifacts for assigned projects if allowed.
- Generate documents for assigned projects if allowed.
- Track their jobs.
- See relevant notifications.
- See project-specific audit events.
- View limited settings/preferences.

Registered-user UI should feel focused and uncluttered. Avoid exposing admin-only controls visually.

---

## 6. Application Surface To Redesign

Create designs for all visible application areas listed below.

### 6.1 Public And Authentication Screens

- Landing/login page.
- Login modal or login panel.
- Forgot password modal/state.
- Password reset success/error states.
- Invite/auth callback states, if visible.
- Public Explore page.
- Public comparison sections.
- Public final CTA area.
- Public footer links and legal/status placeholders if visible.

### 6.2 Authenticated App Shell

- Dashboard shell.
- Sidebar navigation.
- Header/top bar.
- Global search input or search area.
- Notification bell.
- User profile area.
- Logout control.
- Theme toggle, if visible.
- Mobile navigation.
- Collapsed sidebar state.
- Breadcrumb/page title area, if used.

### 6.3 QA Intelligence Workspace

- Overview/dashboard home.
- Project summary cards.
- New project entry point.
- Project selector.
- Knowledge Base screen.
- Artifact upload/dropzone.
- Upload progress state.
- Ingestion job status.
- Generate Documents screen.
- Document type selection.
- Generation job status.
- My Document Jobs list.
- Retry/recovered/failed/completed job states.
- Generated output preview/result cards.
- Jira output summaries.
- Confluence/document link summaries.
- Artifacts repository.
- Analytics dashboard.
- Audit log view/modal.
- Notifications panel.
- System status modal.
- Diagnostics modal.

### 6.4 Delivery Intelligence Workspace

Design these views with the same application shell and visual language:

- DI Overview.
- Project Profile.
- Onboarding.
- Discovery.
- Solutions.
- Governance.
- Similarity.
- Technologies.
- Recommendations.
- Learnings.
- Relationships.

These sections should look like operational intelligence tools, not marketing pages. They should prioritize scanning, comparison, structured evidence, and clear action areas.

### 6.5 Settings And Administration

- Admin settings.
- Registered-user settings.
- Profile settings.
- Users and roles.
- User invite flow.
- User assignment controls.
- Project assignment display.
- Environment settings.
- API/n8n base URL settings.
- Integration settings.
- Jira settings.
- Confluence settings.
- Chroma/settings.
- Microservice settings.
- Notifications and security preferences.
- Integration test results.
- Backend-managed credential indicators.
- Read-only states for registered users.

### 6.6 Documentation And Help

- Documentation page/view.
- FAQs page/view.
- Help article list.
- Help article detail or expanded state.
- Empty search/no result state if visible.

### 6.7 Cross-Application States

For every relevant screen and component, include:

- Default state.
- Loading state.
- Empty state.
- Success state.
- Warning state.
- Error state.
- Disabled state.
- Read-only state.
- Hover state.
- Focus state.
- Active/selected state.
- Validation error state.
- Long text overflow state.
- Small screen/mobile state.

---

## 7. Design Language Requirements

### 7.1 Overall Style

The design should be a professional enterprise web application, not a landing-page-heavy marketing site.

Preferred style:

- Clean.
- Modern.
- Structured.
- Calm.
- Information-dense but readable.
- SaaS dashboard quality.
- Strong hierarchy.
- Minimal decoration.
- Clear status communication.

Avoid:

- Decorative gradients as the main visual identity.
- Large marketing hero sections inside authenticated workspace.
- Overly playful visuals.
- One-color-only palettes.
- Excessive card nesting.
- Floating card sections inside other cards.
- Decorative blobs/orbs.
- Over-rounded controls.
- Low-contrast text.
- Tiny unreadable labels.
- Text that overlaps or truncates awkwardly.
- Inconsistent icon styles.
- Inconsistent button shapes.

### 7.2 Information Architecture

Keep the current feature structure intact.

The redesign may improve presentation of navigation groups, but must not remove or rename product areas in a way that changes user expectations or behavior.

Recommended grouping:

- QA Intelligence.
- Delivery Intelligence.
- Settings and Support.

Navigation should make it obvious which view is active and which workspace the user is in.

### 7.3 Layout Principles

- Use full-width application bands and constrained content areas.
- Use panels/cards only for real content groupings, repeated items, forms, modals, and metrics.
- Do not place cards inside cards.
- Maintain predictable alignment.
- Use consistent page header patterns.
- Keep actions near the content they affect.
- Use clear primary, secondary, and tertiary action hierarchy.
- Make destructive or risky actions visually distinct.
- Preserve existing action behavior.

---

## 8. Design System Requirements

Google Stitch should produce a consistent design system that can be implemented using React, Tailwind, and reusable components.

### 8.1 Tokens

Define tokens for:

- Color palette.
- Semantic colors.
- Typography.
- Font sizes.
- Font weights.
- Line heights.
- Spacing scale.
- Border radius.
- Border colors.
- Shadows/elevation.
- Focus ring.
- Icon sizes.
- Component density.
- Status colors.
- Chart colors.

### 8.2 Color

Use a professional palette with sufficient contrast.

Required semantic colors:

- Background.
- Surface.
- Surface elevated.
- Surface muted.
- Border.
- Text primary.
- Text secondary.
- Text muted.
- Primary action.
- Secondary action.
- Success.
- Warning.
- Error.
- Info.
- Neutral.
- Disabled.

Status colors must be consistent everywhere:

- Completed/success.
- Processing/in progress.
- Pending/queued.
- Failed/error.
- Needs retry.
- Recovered.
- Warning/degraded.
- Unauthorized.
- Not configured.

Avoid a design dominated by only purple, blue-purple, dark slate, beige, brown, or orange. Use a balanced enterprise palette with clear semantic contrast.

### 8.3 Typography

Use a web-safe professional sans-serif or a realistic enterprise UI font.

Requirements:

- Clear page title scale.
- Section heading scale.
- Compact panel heading scale.
- Body text scale.
- Metadata/caption scale.
- Button label scale.
- Table/list text scale.
- Form label and helper text scale.

Do not use viewport-based font scaling. Text must fit inside controls and panels on all supported breakpoints.

### 8.4 Spacing And Density

Use consistent spacing.

Recommended density:

- Authenticated dashboard should be moderately dense.
- Forms should be comfortable, not oversized.
- Tables/lists should be scannable.
- Metrics should be compact but legible.
- Modals should avoid excessive whitespace.

### 8.5 Radius And Elevation

Use restrained radius.

Recommended:

- Cards/panels: 8px or less.
- Buttons/inputs: consistent radius aligned with the system.
- Modals: slightly elevated but not visually detached from the app.
- Avoid pill-shaped controls unless they are status badges, tags, or segmented controls.

---

## 9. Icon System

Use one icon family consistently. The implementation currently uses lucide-style icons, so designs should follow the lucide visual language.

Icon requirements:

- Consistent stroke width.
- Consistent size by context.
- Navigation icons: same size and alignment.
- Button icons: same size and spacing.
- Status icons: consistent mapping.
- Empty-state icons: same style.
- Avoid mixing filled, outlined, 3D, emoji, or decorative icon styles.

Recommended status icon mapping:

- Success/completed: check-circle style.
- Warning/degraded: alert-triangle style.
- Error/failed: circle-x or alert-circle style.
- Processing: loader/spinner style.
- Queued/pending: clock style.
- Retry: rotate/refresh style.
- Locked/read-only: lock style.
- Backend-managed credential: shield/key style.

Icon-only buttons must have visible hover/focus states and tooltip-ready labels in the design specification.

---

## 10. Component Inventory To Redesign

Create design specifications for these reusable components.

### 10.1 Navigation Components

- Sidebar item.
- Sidebar group heading.
- Collapsed sidebar item.
- Mobile nav item.
- Top bar.
- Breadcrumb/page title.
- User menu/profile chip.
- Notification button.
- Search input.

### 10.2 Action Components

- Primary button.
- Secondary button.
- Tertiary/ghost button.
- Destructive button.
- Icon button.
- Split button, if needed visually.
- Link button.
- Disabled button.
- Loading button.

### 10.3 Form Components

- Text input.
- Textarea.
- Select/dropdown.
- Searchable select.
- Checkbox.
- Toggle.
- Radio/segmented choice.
- File dropzone.
- Form label.
- Helper text.
- Error text.
- Required indicator.
- Read-only field.
- Inline validation summary.

### 10.4 Data Display Components

- Metric tile.
- Status badge.
- Tag/chip.
- Table.
- List row.
- Job card.
- Artifact card.
- Project card.
- Generated output card.
- Integration status card.
- User row.
- Timeline item.
- Audit event row.
- Notification row.
- Empty state.
- Error state.
- Loading skeleton.

### 10.5 Feedback Components

- Toast.
- Inline alert.
- Progress bar.
- Stepper.
- Spinner.
- Modal.
- Drawer.
- Confirmation dialog.
- Tooltip.
- Popover.
- System status indicator.

### 10.6 Analytics Components

- KPI card.
- Chart container.
- Legend.
- Filter bar.
- Date/range selector.
- Cost/token usage summary.
- Failure trend summary.
- Health/status summary.

---

## 11. Screen-Level Design Requirements

### 11.1 Landing/Login Page

Goal: Present Q-Ops Agent clearly and get users into the product.

Requirements:

- Keep login behavior intact.
- Make the product identity obvious in the first viewport.
- Show a professional AI QA operations message.
- Login entry should be easy to find.
- Explore CTA should remain available.
- Footer links should look intentional even if behavior is existing placeholder behavior.
- Login modal/panel must support email, password, validation errors, forgot password, loading, and disabled states.

### 11.2 Explore Page

Goal: Explain product capabilities without feeling disconnected from the app.

Requirements:

- Keep current public route behavior.
- Use consistent brand/design language with the authenticated app.
- Keep comparison and capability content readable.
- Avoid over-marketing visuals.
- CTAs should remain clear and aligned with existing behavior.

### 11.3 Dashboard Shell

Goal: Provide a professional operations cockpit.

Requirements:

- Clear workspace identity.
- Strong sidebar hierarchy.
- Active nav state.
- Responsive mobile nav.
- Header with search, status, notifications, user identity, and logout/theme controls as currently available.
- Avoid visual clutter in the top bar.
- Maintain role-aware UI: admin and registered user should not see the same controls if current behavior hides them.

### 11.4 Overview

Goal: Give a quick operational summary.

Requirements:

- Project count/status summary.
- Job health summary.
- Recent activity.
- Notifications or audit highlights if currently visible.
- Clear next actions such as project selection, upload, generation, review, or settings depending on current UI.
- Metrics should be visually consistent and easy to scan.

### 11.5 Knowledge Base

Goal: Help users upload artifacts and understand ingestion progress.

Requirements:

- Clear project selection.
- Clear upload/dropzone.
- Supported file/context guidance without overwhelming the user.
- Upload progress.
- Ingestion status.
- Completed/failed/retry states.
- Artifact list/summary.
- Validation errors should be prominent and actionable.

### 11.6 Generate Documents

Goal: Help users generate QA deliverables from a project knowledge base.

Requirements:

- Clear project selector.
- Clear deliverable/document type selector.
- Preserve deliverable names and meanings.
- Primary action must be obvious.
- Reset action must remain secondary.
- Job status should be near the generation workflow.
- My Document Jobs should clearly show completed, failed, needs retry, and recovered states.
- Jira/Confluence/generated output cards should be easy to inspect.
- Long job IDs and project names must wrap safely.

### 11.7 Artifacts Repository

Goal: Let users review uploaded and processed artifacts.

Requirements:

- Scannable list/table/card layout.
- Filters/search if currently visible.
- Artifact metadata: project, type, uploaded by, date, status.
- Extraction/processing status.
- Empty state.
- Error state.
- Reprocess/retry controls if currently available.

### 11.8 Analytics

Goal: Help admins and users understand operational performance.

Requirements:

- KPI cards for job counts, failures, cost/token usage, throughput, and health where available.
- Filters should be compact and clear.
- Charts should have consistent colors and legends.
- No-data states must be useful.
- Avoid fake decorative charts.

### 11.9 Audit Log

Goal: Show traceable user/project events.

Requirements:

- Timeline or table suitable for many records.
- Event actor.
- Event action.
- Project/context.
- Timestamp.
- Severity/status if available.
- Filters should be visually clear if present.
- Registered users should visually see only scoped events according to current behavior.

### 11.10 Notifications

Goal: Show relevant project, job, assignment, and system notifications.

Requirements:

- Notification center/panel.
- Unread/read visual distinction if supported.
- Type/status icon.
- Message title and details.
- Timestamp.
- Empty state.
- Long messages should wrap.
- Preserve existing notification behavior.

### 11.11 Settings

Goal: Make configuration understandable and safe.

Requirements:

- Separate admin and registered-user presentations according to current permissions.
- Admin settings should support profile, users, environment, integrations, notifications/security, and system status where currently available.
- Registered-user settings should focus on profile, preferences, assigned projects, notifications, and read-only system status.
- Integration settings must never display raw secrets.
- Jira settings should show routing fields only: base URL, project key, project id, idempotency label prefix.
- Credential/token state should be displayed as backend-managed, saved, missing, or not configured.
- Save/test buttons should be consistently placed.
- Warnings should be clear before risky configuration edits.

### 11.12 Delivery Intelligence Views

Goal: Present project intelligence as structured operational insight.

Requirements:

- Use the same shell and component library.
- Avoid a marketing layout.
- Prioritize evidence, recommendations, relationships, and governance state.
- Tables, charts, relationship panels, recommendation cards, and status summaries should share the same design language as QA Intelligence.
- Empty/loading/error states are required.

### 11.13 Documentation And FAQs

Goal: Help users understand product usage and governance.

Requirements:

- Clean help layout.
- Search/category navigation if visible.
- FAQ items should be easy to scan and expand if behavior exists.
- Documentation should feel integrated, not like an external marketing page.

---

## 12. Progress, Status, And Job State Standards

Progress and job status are central to Q-Ops Agent. Design these carefully.

Required job statuses:

- Queued.
- Processing.
- Completed.
- Failed.
- Needs retry.
- Retried.
- Recovered.
- Cancelled, only if current UI can show it.

Progress bar requirements:

- Clear label.
- Numeric progress if available.
- Status color.
- Non-color indicator, such as icon or text, for accessibility.
- Smooth compact style.
- Must not resize the layout as progress changes.

Job card requirements:

- Job ID.
- Project name.
- Document type.
- Started timestamp.
- Status.
- Retry lineage if available.
- Output link or summary if completed.
- Failure reason and retry action if failed and currently supported.

---

## 13. Displayed Text Preservation Rules

UI text must be preserved exactly for this presentation-only redesign.

Rules:

- Do not rewrite existing text.
- Do not summarize existing text.
- Do not expand existing text.
- Keep domain terms accurate.
- Keep deliverable names stable.
- Keep statuses recognizable.
- Keep button intent unchanged.
- Keep current capitalization unless the implementation later explicitly approves copy changes.
- Use visual design to improve readability instead of changing wording.

Optional copy recommendations may be documented separately, but must not be used in the redesigned screens for this phase.

---

## 14. Responsive Design Requirements

Design responsive layouts for these breakpoints:

- Mobile: 360px to 430px width.
- Large mobile/small tablet: 600px to 767px width.
- Tablet: 768px to 1023px width.
- Desktop: 1024px to 1439px width.
- Wide desktop: 1440px and above.

Responsive requirements:

- No horizontal page overflow.
- Sidebar should collapse or become mobile navigation.
- Tables must be responsive through horizontal scroll, compact rows, or card conversion.
- Forms should stack cleanly on mobile.
- Modals should fit mobile screens and allow scrolling.
- Sticky headers/footers must not cover content.
- Buttons must wrap or resize without clipping labels.
- Long project names, emails, job IDs, URLs, and Jira keys must not break layouts.
- Charts and metric cards must remain readable.
- File upload/dropzone must remain usable on mobile.
- Progress bars must keep stable dimensions.

---

## 15. Usability And Accessibility Requirements

Design must comply with practical usability and accessibility expectations.

Requirements:

- WCAG-friendly contrast for text, borders, focus rings, and status labels.
- Visible keyboard focus state.
- Do not communicate status through color alone.
- Form labels must be visible and associated visually with inputs.
- Error messages must appear near the relevant field.
- Primary action must be obvious on every form.
- Disabled actions must include a clear reason where appropriate.
- Touch targets should be at least 44px tall on mobile.
- Icon-only actions need accessible labels/tooltips.
- Loading states must explain what is happening.
- Empty states must explain what to do next.
- Modal close action must be clear.
- Destructive actions require clear warning styling.

---

## 16. Implementation Alignment Constraints

The final design should be easy to implement in the current stack.

Current implementation assumptions:

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- lucide-react icons.
- Existing shared components under `src/components/common`.
- Main authenticated UI in `src/pages/DashboardPage.tsx`.
- Public pages in `src/pages/LoginPage.tsx` and `src/pages/ExploreMorePage.tsx`.

Design should map to reusable React components and Tailwind-compatible tokens.

Avoid designs that require:

- New business logic.
- New backend APIs.
- New animation engines.
- Heavy 3D scenes.
- Non-standard custom controls where native accessible controls would work.
- Complex layout behavior that requires rewriting application state.

---

## 17. Deliverables Requested From Google Stitch

Provide the following design outputs.

### 17.1 Design System

- Color tokens.
- Typography tokens.
- Spacing tokens.
- Radius/elevation tokens.
- Icon usage rules.
- Status color and icon mapping.
- Button variants.
- Form component variants.
- Badge/tag variants.
- Modal/drawer variants.
- Table/list/card variants.
- Progress/job status variants.

### 17.2 High-Fidelity Screens

Provide desktop and mobile variants for:

- Landing/login.
- Explore page.
- Dashboard overview.
- Knowledge Base.
- Generate Documents.
- Artifacts.
- Analytics.
- Audit Log.
- Notifications.
- Settings - Admin.
- Settings - Registered User.
- Delivery Intelligence overview.
- At least one detailed Delivery Intelligence view.
- Documentation/FAQs.

### 17.3 State Designs

Provide states for:

- Loading.
- Empty.
- Success.
- Warning.
- Error.
- Disabled.
- Read-only.
- Validation error.
- Job processing.
- Job completed.
- Job failed.
- Job needs retry.
- Integration operational.
- Integration degraded.
- Integration not configured.
- Integration unauthorized.

### 17.4 Responsive Specs

Provide guidance for:

- Sidebar collapse.
- Mobile navigation.
- Table/card behavior on mobile.
- Modal sizing on mobile.
- Form stacking.
- Header/search/notification behavior.
- Dense job lists on small screens.

### 17.5 Implementation Notes

For each screen, specify:

- Components used.
- Layout grid.
- Key responsive behavior.
- Text hierarchy.
- Status treatment.
- Icon usage.
- Confirmation that no visible content/text was changed.
- Any future-enhancement ideas that should not be implemented as part of presentation-only redesign.

---

## 18. Acceptance Criteria

The design is acceptable only if:

- All current product areas have a redesigned presentation.
- The same design language is used across the app.
- All existing displayed content/text is preserved exactly.
- No headings, body copy, CTA labels, form labels, navigation labels, status labels, comparison content, capability names, or footer text are rewritten.
- The UI feels professional and enterprise-ready.
- The UI is user-friendly and clear for both Admin and Registered User personas.
- Responsive behavior is specified for mobile, tablet, desktop, and wide desktop.
- Accessibility basics are covered.
- Icons are consistent.
- Progress bars and job states are clearly designed.
- Modals, drawers, toasts, empty states, and error states are included.
- No design requirement depends on changing business logic.
- No feature is removed.
- No existing workflow is replaced with a different workflow.
- Admin-only and registered-user-only views remain visually distinct according to existing permissions.
- Secret values are never displayed.
- Integration tokens are represented only as backend-managed or masked credential states.

---

## 19. Explicit Out Of Scope

The following are out of scope for the presentation-only redesign:

- Backend implementation.
- Database changes.
- Supabase Auth logic changes.
- n8n workflow changes.
- Jira API changes.
- Confluence API changes.
- New product features.
- New or rewritten product copy.
- Renamed sections.
- Renamed CTAs.
- Renamed navigation items.
- Renamed statuses.
- Renamed capabilities.
- New routes unless they only represent existing visible modal/page content.
- New permission model.
- New data model.
- New analytics calculations.
- New generation document types.
- New user roles.
- New notification logic.
- New audit log logic.
- Real secret management changes.
- Functional changes to test cases or automation.

---

## 20. Final Design Direction Summary

Redesign Q-Ops Agent as a cohesive enterprise QA intelligence platform.

The app should feel like a serious operational workspace where users can upload evidence, generate QA outputs, track jobs, inspect results, manage settings, and understand delivery intelligence with confidence.

The redesign must be visually comprehensive but behaviorally and content conservative: change how the product looks, not what the product says and not what the product does.

