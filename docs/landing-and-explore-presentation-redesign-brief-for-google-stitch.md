# Google Stitch Brief: Landing Page And Explore More Presentation Redesign

Date: 2026-06-12

Scope: Landing/Login page and Explore More page only.

Purpose: Create fresh, professional, responsive UI/UX designs for the public-facing Q-Ops Agent experience while preserving all existing content, displayed text, behavior, routes, CTAs, authentication flow, and product functionality.

This is a presentation-layer-only redesign brief. Do not redesign the authenticated dashboard in this phase.

---

## 1. Objective

Redesign only these public screens:

- Landing/Login page.
- Login modal or login panel shown from the landing page.
- Forgot password flow shown from the login experience.
- Explore More page.
- Public comparison/capability sections on Explore More.
- Public footer/status/legal link presentation if visible.

The result should feel like a polished enterprise SaaS product for AI-assisted QA operations. The design should be modern, professional, credible, easy to understand, and responsive.

Important: Do not rewrite, replace, summarize, or add product content. Use the existing Landing/Login and Explore More page content exactly as currently shown in the application. The redesign is only about layout, visual hierarchy, typography, spacing, imagery treatment, icons, responsive behavior, and component styling.

---

## 2. Non-Negotiable Functional Freeze

Only presentation may change.

Do not change:

- Existing displayed text/content.
- Existing headings.
- Existing subheadings.
- Existing section copy.
- Existing CTA labels.
- Existing form labels.
- Existing helper text.
- Existing error/success messages.
- Existing comparison table content.
- Existing capability names.
- Existing footer text.
- Route behavior.
- Login behavior.
- Login form fields.
- Forgot password behavior.
- Auth callback behavior.
- CTA destinations.
- Button click behavior.
- Existing links or navigation targets.
- Existing product capabilities.
- Existing authentication implementation.
- Existing field validation behavior.
- Existing role logic.
- Existing API calls.
- Existing local/session storage logic.
- Existing Explore page comparison behavior.
- Any dashboard behavior.

Allowed changes:

- Visual layout.
- Typography.
- Color palette.
- Spacing.
- Section hierarchy.
- Button appearance.
- Form appearance.
- Modal appearance.
- Icons.
- Images/visual treatment.
- Responsive behavior.
- Empty/error/loading visual treatment.

If a proposed design needs new behavior, label it as "Future enhancement - not part of this presentation-only redesign."

If a proposed design needs different wording, label it separately as "Optional copy recommendation - do not implement in presentation-only redesign."

---

## 3. Content Freeze Requirement

The existing content must remain unchanged.

Google Stitch should use the current app content as source material and preserve it exactly. Do not create new marketing claims, new headings, new descriptions, new feature names, new CTA labels, or rewritten explanations.

The design may reorganize how the same content is visually arranged, for example:

- Same text in a new layout.
- Same heading with improved typography.
- Same section content with better spacing.
- Same comparison table content with improved table design.
- Same CTA label with improved button styling.
- Same form labels with improved input design.
- Same error message with improved alert styling.

The design may not:

- Replace content with newly written copy.
- Shorten or summarize content.
- Expand content with additional claims.
- Rename sections.
- Rename CTAs.
- Rename product capabilities.
- Add unsupported product promises.
- Remove existing visible text unless it is hidden by existing responsive behavior.

If the existing page has repeated or long content, preserve it and solve the design challenge through layout, hierarchy, spacing, progressive disclosure already supported by the current page, or responsive treatment.

---

## 4. Product Context

Q-Ops Agent is an enterprise AI platform for QA operations.

It helps teams:

- Upload project evidence such as BRD, FRD, HLD, LLD, API docs, transcripts, and UI references.
- Build a project knowledge base.
- Generate QA deliverables such as test strategy, test plan, risk matrix, traceability matrix, test cases, epics, and user stories.
- Track ingestion and generation jobs.
- Review generated outputs, Jira artifacts, and Confluence-ready documentation.
- Maintain governance through audit logs, project scoping, user roles, and integration settings.

The public pages should communicate this clearly without becoming visually noisy or over-marketing the product.

---

## 5. Design Direction

Design a fresh public experience. Do not simply add polish on top of the existing visual style.

Desired tone:

- Enterprise-grade.
- Confident.
- Clean.
- Modern.
- Trustworthy.
- Product-led.
- AI-native but not gimmicky.
- Clear for QA leaders, QA engineers, product owners, delivery managers, and platform admins.

Avoid:

- Generic startup landing-page styling.
- Decorative gradient-only hero sections.
- Abstract visuals that do not explain the product.
- Oversized marketing cards everywhere.
- Excessive animation.
- One-color-only palettes.
- Purple/blue-purple dominated gradients.
- Dark-only aesthetics unless a light mode is also designed.
- Low-contrast text.
- Rounded pill overload.
- Cluttered hero content.
- Feature claims that imply functionality not present in the app.

---

## 6. Landing/Login Page Requirements

### 6.1 Page Goal

The landing page should quickly answer:

- What is Q-Ops Agent?
- Who is it for?
- What problem does it solve?
- What can the user do next?

The login action must be obvious and easy to access.

### 6.2 First Viewport

The first viewport must preserve the existing content and make these existing items visually clear:

- Product identity.
- Existing headline.
- Existing supporting text.
- Existing primary CTA.
- Existing secondary CTA.
- Professional product visual or interface-inspired visual.

### 6.3 Hero Visual

Use a relevant product-focused visual.

Acceptable visual directions:

- A refined dashboard preview inspired by the application.
- A clean workflow visualization showing upload -> knowledge base -> generated QA outputs.
- A QA operations command-center style preview.
- A real product UI composition adapted for marketing presentation.

Avoid:

- Abstract AI brain graphics.
- Random stock business images.
- Dark blurred background images.
- Pure SVG decoration with no product meaning.
- Visuals that imply features not in the product.

### 6.4 Navigation/Header

Header should include:

- Product logo/name.
- Optional short nav links if currently present.
- Login action.
- Explore More action if present.

Requirements:

- Keep header simple.
- Make login visually available.
- Header should work on mobile.
- Do not add new navigation destinations that do not exist.

### 6.5 Content Sections

Redesign the existing landing page sections only. Preserve the existing section content and existing section intent.

Requirements:

- Keep current visible headings and body content.
- Keep current CTA labels.
- Keep current capability names.
- Improve visual grouping, hierarchy, spacing, and responsiveness.
- Do not introduce new sections unless the current page already has equivalent content that needs a better layout.

### 6.6 Login Modal/Panel

Design the login experience shown from the landing page.

Required states:

- Default email/password state.
- Focus state.
- Field validation error state.
- Invalid credentials/error state.
- Loading/signing-in state.
- Disabled submit state.
- Forgot password entry point.
- Forgot password form state.
- Forgot password success state.
- Forgot password error state.

Requirements:

- Email and password fields must be clear.
- Primary submit button must be obvious.
- Forgot password must be visible but secondary.
- Error messages must appear near the form and be easy to understand.
- Modal/panel must be usable on mobile.
- Do not add social login or SSO unless already present as a non-functional visual placeholder clearly marked out of scope.

### 6.7 Footer

Footer may include existing visible links/status items.

Requirements:

- Keep it professional and compact.
- Do not create new legal routes or behavior.
- If links are placeholders today, design them as existing visible links only.
- Include product identity and concise positioning.

---

## 7. Explore More Page Requirements

### 7.1 Page Goal

The Explore More page should explain the product in more detail than the landing page.

It should help users understand:

- What Q-Ops Agent does.
- How the workflow operates.
- What capabilities are available.
- Why it is useful for QA and delivery teams.
- How it compares to manual QA documentation practices.
- What action to take next.

### 7.2 Structure

Preserve the existing Explore More page content and section order unless a layout adjustment can improve visual clarity without changing meaning or behavior.

The Explore page should be informative but not visually heavy. Use better hierarchy, spacing, responsive layout, and component styling to present the same content.

### 7.3 Explore Hero

Hero should preserve existing content and visually clarify:

- Existing product name or page title.
- Existing explanation.
- Existing primary CTA.
- Existing secondary CTA if currently present.
- Product-relevant visual.

Do not make the Explore hero look unrelated to the landing page. It should share the same design system.

### 7.4 Workflow Section

Show the current workflow content exactly as it exists on the page.

Use a clear visual pattern:

- Horizontal stepper on desktop.
- Vertical stepper on mobile.
- Consistent icons.
- Short labels.
- Short descriptions.

Do not add workflow steps that do not exist in the application.

### 7.5 Capability Grid

Capabilities should be presented as clear product functions using the existing capability names and descriptions.

Requirements:

- Use consistent card design.
- Use consistent icons.
- Keep copy concise.
- Avoid nested cards.
- Cards should not be oversized on desktop.
- Cards should stack cleanly on mobile.

### 7.6 Comparison Section

If the current Explore page includes a comparison table or expandable comparison, preserve the behavior.

Design requirements:

- Make the comparison easy to scan.
- Preserve all comparison row and column content.
- Use clear columns.
- Use consistent success/limitation icons.
- Ensure table works on mobile through horizontal scroll or responsive card rows.
- Keep "See Full Comparison" or equivalent existing CTA behavior intact.
- Keep "Open Full View" modal behavior intact if currently present.

### 7.7 Architecture / Operating Model Section

If the existing page shows architecture or product operating model content, focus on product clarity while preserving the current labels and descriptions.

Requirements:

- Keep it understandable for business and technical users.
- Use consistent icon style.
- Avoid overly complex diagrams.
- Do not expose secrets or implementation-sensitive details.
- Do not imply integrations beyond those already represented by the app.

### 7.8 Governance And Trust Section

If the existing page includes governance or trust content, preserve that content exactly and improve its presentation. Do not add certifications, compliance guarantees, or enterprise controls that are not already written on the page.

### 7.9 Final CTA

Final CTA should guide users back to the primary action.

Required:

- Primary action: login/start/sign in, based on current behavior.
- Secondary action: explore/learn more/back to top if current behavior supports it.
- Keep CTA behavior unchanged.

---

## 8. Responsive Requirements

Create designs for:

- Mobile: 360px to 430px.
- Tablet: 768px to 1023px.
- Desktop: 1024px to 1439px.
- Wide desktop: 1440px and above.

Requirements:

- No horizontal overflow.
- Header must collapse cleanly on mobile.
- Login modal must fit mobile height and scroll if needed.
- Hero text must not overlap visuals.
- CTAs must remain visible and tappable.
- Capability cards must stack cleanly.
- Comparison table must remain usable on mobile.
- Footer must not become crowded.
- Text must wrap naturally.
- Long product terms must not break layout.

---

## 9. Accessibility And Usability Requirements

Requirements:

- High text contrast.
- Visible focus states.
- Keyboard-friendly form states.
- Touch targets at least 44px on mobile.
- Icon-only controls must have tooltip/accessible-label guidance.
- Error messages must not rely on color alone.
- Loading states must be clear.
- CTA hierarchy must be obvious.
- Forms must have visible labels.
- Modal close action must be visible.
- Mobile design must support one-handed use where practical.

---

## 10. Visual System Requirements For These Pages

Use the same design language for Landing and Explore.

Define:

- Color palette.
- Typography scale.
- Button styles.
- Form styles.
- Modal styles.
- Card styles.
- Table/comparison styles.
- Section spacing.
- Icon usage.
- Responsive rules.

These styles should be compatible with later dashboard redesign, but do not redesign dashboard screens in this phase.

---

## 11. Icon Guidelines

Use one consistent icon family, preferably lucide-style outline icons.

Recommended icon usage:

- Login/security: shield or lock.
- Upload/artifacts: upload/file icons.
- Knowledge base: database/layers/book-open.
- Generation: sparkles/wand/file-text.
- Jira-ready outputs: list-check/git-branch/clipboard-check.
- Analytics: chart icons.
- Governance: shield-check/history.
- Integration: plug/link.

Avoid:

- Mixing filled and outline icons.
- Emoji icons.
- 3D icons.
- Random illustration icon sets.
- Icons that do not match the product capability.

---

## 12. Text Preservation Rules

Do not write new copy for this redesign.

Rules:

- Preserve existing headings.
- Preserve existing body copy.
- Preserve existing CTA labels.
- Preserve existing form labels.
- Preserve existing validation and error messages.
- Preserve existing comparison table text.
- Preserve existing capability names and descriptions.
- Preserve existing footer text.
- Preserve existing product terminology.

The design may show text in a different visual treatment, but it may not change the text itself.

If Google Stitch wants to recommend better copy, place it in a separate section titled "Optional copy recommendations" and do not use those recommendations in the actual screen designs for this phase.

---

## 13. Required Stitch Deliverables

Provide design outputs for:

- Landing page desktop.
- Landing page mobile.
- Login modal/panel default state.
- Login modal/panel error state.
- Login modal/panel loading state.
- Forgot password state.
- Forgot password success state.
- Explore More page desktop.
- Explore More page mobile.
- Explore comparison section desktop.
- Explore comparison section mobile.
- Explore comparison full-view modal if currently visible.
- Public footer.

For each design, specify:

- Layout structure.
- Components used.
- Typography hierarchy.
- Color usage.
- Icon usage.
- Responsive behavior.
- Confirmation that no content/text was changed.
- Any future enhancement ideas clearly marked out of scope.

---

## 14. Acceptance Criteria

The design is acceptable only if:

- It covers Landing/Login and Explore More pages.
- It does not cover or redesign dashboard screens in this phase.
- It is a fresh presentation redesign, not a minor polish pass over the current design.
- It preserves all existing displayed content exactly.
- It does not rewrite headings, body copy, CTA labels, form labels, comparison content, capability names, or footer text.
- It keeps all existing behavior intact.
- Login and forgot password states are fully designed.
- Explore comparison behavior is preserved.
- The pages share the same design language.
- Desktop and mobile variants are included.
- The design is professional and enterprise-ready.
- Icons are consistent.
- Accessibility basics are covered.
- No unsupported features or claims are introduced.

---

## 15. Out Of Scope

Do not design or change:

- Authenticated dashboard.
- Knowledge Base screen.
- Generate Documents screen.
- Settings screen.
- Artifacts screen.
- Analytics screen.
- Delivery Intelligence screens.
- Backend APIs.
- Supabase Auth behavior.
- n8n workflows.
- Jira or Confluence integration behavior.
- User roles.
- Project scoping.
- New landing-page routes.
- New login methods.
- New product features.
- New or rewritten marketing copy.
- Renamed page sections.
- Renamed CTAs.
- Renamed capabilities.
- Changed comparison table content.

---

## 16. Final Direction

Create a focused public experience for Q-Ops Agent that presents the existing Landing/Login and Explore More content with a fresh, professional UI/UX design.

The redesign should change how the Landing and Explore More pages look, not what they say and not how they function.
