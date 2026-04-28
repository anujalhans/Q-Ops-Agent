# Q-Ops Agent — Functional Specification

This document captures **all functional behaviors** of the existing Q-Ops Agent app. It is written for a UI redesign effort: every capability below must be preserved. Visual styling, layout choices, colors, typography, iconography, and "feel" are intentionally **not** prescribed — the redesign is free to rethink all of those.

---

## 1. Application Overview

Q-Ops Agent is a single-page web application (React + Vite + TypeScript + React Router) that lets a QA user:

1. Log in with static credentials.
2. Upload project artifacts (business/technical documents, transcripts, UI design images) to build a **Knowledge Base**.
3. Generate QA deliverables (test strategies, plans, risk matrices, test cases, epics/user stories, traceability matrices) from an existing Knowledge Base.
4. Track long-running backend jobs via status polling.
5. View a marketing/explainer page describing the product's capabilities and architecture.

The frontend talks to a backend (n8n workflow server) over HTTP webhooks. No backend code is included in this repo.

---

## 2. Routing & Navigation

The app uses client-side routing (`react-router-dom`).

| Route | Page | Access |
|---|---|---|
| `/` | Login / Landing Page | Public. If already authenticated, redirect to `/dashboard`. |
| `/dashboard` | Dashboard (Workspace) | Authenticated only. Unauthenticated users redirect to `/`. |
| `/explore` | Explore More (marketing page) | Public. Accessible regardless of auth state. |
| `*` (any other) | Redirect | Redirects to `/dashboard` if authenticated, otherwise `/`. |

### Navigation behaviors

- From the Login/Landing page: clicking **Explore More** (hero CTA) or **Explore Q-Ops Agent** (final CTA) navigates to `/explore`.
- From the Explore More page: clicking **Back to login**, **Get Started**, or **Return to login** navigates to `/`.
- From the Dashboard: clicking **Logout** clears auth state and navigates to `/`.

---

## 3. Authentication

### Credentials
- Static client-side credentials: username **`admin`**, password **`admin`**.
- No backend authentication call; validation happens in the browser.

### State persistence
- Auth state is persisted in `localStorage` under the key `qops-agent-auth` (value `"true"` or `"false"`).
- On app load, the stored value determines initial authenticated state.
- The key is updated whenever auth state changes.

### Login flow
1. User clicks a **Login** button in the landing page header, which opens a modal dialog.
2. User enters username and password into the modal form.
3. On submit:
   - If credentials match `admin/admin`: mark authenticated, close the modal, show a **success toast** (`"Welcome back"` / `"You have successfully logged in."`), and navigate to `/dashboard`.
   - Otherwise: show an inline error message (`"Invalid username or password."`) inside the modal and show an **error toast** (`"Authentication failed"` / `"Please use admin/admin to continue."`).
4. Pressing **Escape** while the login modal is open closes it.
5. Clicking outside the modal (backdrop) closes it.
6. Clicking the explicit close (×) button closes it.

### Forgot Password flow
1. From the login modal, clicking **Forgot your password?** closes the login modal and opens the Forgot Password modal.
2. User enters an email address (required, `type="email"`).
3. On submit (if email is non-empty after trim):
   - Show a **success toast** (`"Password reset email sent"` / `"Check your email at {email} for password reset instructions."`).
   - Clear the email input and close the modal.
4. From the Forgot Password modal, clicking **Back to Login** closes this modal and re-opens the Login modal.
5. Pressing **Escape** closes the Forgot Password modal.
6. Clicking the backdrop or the × button closes it.

> Note: The Forgot Password flow is currently UI-only — no email is actually sent. The redesign should preserve the same user-facing flow (form, validation, toast), but the underlying wiring to a real reset service is out of scope unless separately specified.

### Logout flow
- Clicking **Logout** in the Dashboard header clears authenticated state and navigates back to `/`.

---

## 4. Toast Notification System

A global toast notification system is available across all pages.

### Behavior
- Toasts appear fixed at the bottom-right of the viewport, stacked vertically.
- Each toast has: a unique `id`, a `title`, a `message`, and a `type` (one of `success`, `error`, `info`).
- Toasts auto-dismiss after **4.2 seconds**.
- Multiple toasts can be shown simultaneously; new ones append to the stack.

### Where toasts are raised
- Login success / failure
- Forgot-password submission
- Knowledge Base ingestion started / completed / failed
- Knowledge Base processing progress (first time entering `processing`)
- Knowledge Base job not found after retries
- Knowledge Base backend response format errors
- Document generation started / completed / failed
- Document generation processing progress (first time entering `processing`)
- Document generation job not found after retries
- Form reset (Knowledge Base form) — info toast
- Form reset (Document Generation form) — info toast

---

## 5. Login / Landing Page (`/`)

The landing page is **both** a marketing surface and the entry point for login. It contains the following sections, top to bottom:

### 5.1 Header bar
- Brand block on the left: a **"Q"** brand mark, the product name **"Q-Ops Agent"**, an **"AI-Powered"** badge/tag, and a tagline **"A Purpose-Built AI System for QA Engineering"**.
- **Login** button on the right, which opens the login modal (see §3).

### 5.2 Hero section
- Headline: **"Build QA That Starts Before Code Exists"**.
- Subhead: **"Transform requirements, designs, and conversations into a complete QA foundation—instantly."**
- Emphasis line: **"Q-Ops Agent doesn't assist QA. It builds it."**
- Supporting line: **"From scattered artifacts to structured QA—ready in minutes."**
- An **"AI-Powered"** badge.
- Primary CTA button: **"Explore More"** → navigates to `/explore`.
- A hero illustration image sourced from `/assets/hero-bg.jpg` (background) and `/assets/ai-qa-intelligence.png` (foreground illustration on large screens).
- If `/assets/hero-bg.jpg` is absent, the app should still render without breaking (fallback is acceptable).

### 5.3 Core Capabilities section
Heading: **"Core Capabilities"**.
Subtext: **"Purpose-built features that integrate into QA workflows and accelerate delivery."**
A grid of four capability items, each with a title and description:

| Title | Description |
|---|---|
| AI Test Strategy & Planning | Generate detailed test strategies and plans using semantic analysis of requirements |
| Intelligent Knowledge Base | Build searchable knowledge bases with vector embeddings for contextual QA insights |
| Automated Risk Analysis | Identify and prioritize risks automatically across all project artifacts |
| JIRA-Ready Artifacts | Create production-ready epics, user stories, and test cases ready for development |

### 5.4 Real Impact (Metrics) section
Heading: **"Real Impact"**.
Subtext: **"Measured outcomes from using Q-Ops Agent"**.
Three metric cards, each displaying a numeric value with a count-up animation from 0 to the target on mount, plus a descriptive label:

| Value | Label |
|---|---|
| 75% | Reduction in QA planning time |
| 40% | Improvement in test coverage |
| 50+ | Hours saved per project |

**Required behavior:** each numeric value animates upward from 0 to the target over ~900ms on first render.

### 5.5 Final CTA section
- Heading: **"Start shipping reliable tests faster"**.
- Subtext: **"Join teams that reduced manual QA effort and improved confidence."**
- Primary button: **"Explore Q-Ops Agent"** → navigates to `/explore`.
- Secondary link: **"Documentation"** (currently `href="#docs"`; preserve as a link placeholder).

### 5.6 Our Trusted Partners section
- Heading: **"Our Trusted Partners"**.
- Subtext: **"Trusted by QA teams and engineering organizations"**.
- A horizontally scrolling/marquee row of partner logos (placeholder names: **TechCorp**, **Innovate**, **DevOps Inc**, **Partner X**), looping seamlessly via a CSS animation.
- A badge/pill to the right showing **"500+ Test Artifacts Generated"**.

### 5.7 Enterprise-grade security note
- A centered card with a lock icon, the text **"Enterprise-grade security"**, and the subtext **"Your data is never used for model training."**

### 5.8 Login Modal
- Opens when the header **Login** button is clicked.
- Backdrop dims and blurs the page behind it.
- Contains a small header (`"Welcome back, QA lead."` + `"Login to Q-Ops Agent"`).
- Two input fields: **Username** (placeholder `admin`, `autoComplete="username"`) and **Password** (`type="password"`, placeholder `••••••••`, `autoComplete="current-password"`).
- Inline error region shown when authentication fails.
- Two supporting text lines: `"Having trouble? Try demo access"` and `"All systems operational"` (status indicator).
- Primary submit button: **Login**.
- Link below form: **Forgot your password?** → switches to the Forgot Password modal.
- Close via × button, backdrop click, or Escape key.

### 5.9 Forgot Password Modal
- Opens from the Login modal's forgot-password link.
- Small header (`"No worries!"` + `"Reset Your Password"` + helper text `"Enter your email address and we'll send you instructions to reset your password."`).
- One input: **Email Address** (`type="email"`, `required`, placeholder `your.email@example.com`).
- Primary submit button: **Send Reset Link**.
- Link below form: **Back to Login** → switches back to the Login modal.
- Close via × button, backdrop click, or Escape key.

---

## 6. Dashboard Page (`/dashboard`)

Authenticated-only workspace where the user creates knowledge bases and generates QA documents. The page has a persistent header plus a tabbed workspace.

### 6.1 Dashboard header
- Brand mark **"Q"**, product name **"Q-Ops Agent"**, tagline **"A Purpose-Built AI System for QA Engineering"**.
- Right side: a **time-of-day greeting** block showing `"Good morning"` / `"Good afternoon"` / `"Good evening"` (based on the user's local clock: <12, <18, else) plus the label **"Admin"** (the current user).
- A **Logout** button. Clicking it clears auth state and returns to `/`.
- The header should remain visible while scrolling (currently sticky).

### 6.2 Tab selector
A two-tab control in the workspace:

1. **Knowledge Base** (labeled `"1. Knowledge Base"`, default active tab)
2. **Generate Documents** (labeled `"2. Generate Documents"`)

Switching tabs changes the form shown in the left pane and the status block shown in the right pane. The right-side **Quick tips** block also changes content per tab (see §6.6).

A **"Workspace"** label is shown at the right end of the tab bar.

### 6.3 Knowledge Base tab — form

Purpose: upload project artifacts to build a knowledge base.

**Subheading / info line:** `"Upload your project artifacts to build a knowledgebase."`

**Fields:**

| Field | Control | Accepted formats | Required? | Multiple? | Notes |
|---|---|---|---|---|---|
| Project name | Text input | — | Free-form | — | Placeholder: `"Enter knowledge project name"`. Helper: `"Give a clear, descriptive project name for traceability."` |
| BRD document | File drop | `.pdf, .doc, .docx` | Optional | No | Under "Business Documents" group |
| FRD document | File drop | `.pdf, .doc, .docx` | Optional | No | Under "Business Documents" group |
| HLD document | File drop | `.pdf, .doc, .docx` | Optional | No | Under "Technical Documents" group |
| LLD document | File drop | `.pdf, .doc, .docx` | Optional | No | Under "Technical Documents" group |
| Transcript file | File drop | `.txt` | Optional | No | Under "Supporting Assets" group |
| UI designs | File drop | `.jpg, .png` | Optional | **Yes (multiple)** | Helper: `"Upload one or more design images for your UI assets."` |

The file fields are grouped into three labeled groups: **Business Documents**, **Technical Documents**, **Supporting Assets**.

**File input behavior (all file fields):**
- Click to open native file picker.
- Drag-and-drop support: user can drop files onto the field.
- Visual drag-active state when a drag is in progress over the field.
- Display of currently selected file(s):
  - If none: `"No file selected"`.
  - If single: the file name.
  - If multiple: `"{n} files selected"`.
- Input accepts the file types listed above; browser enforces accept filter.

**Action buttons:**
- **Create Knowledge Base** (primary submit):
  - While the request is in flight: button is disabled, shows a spinner and the text `"Creating knowledge base..."`.
  - Otherwise: shows the text `"Create Knowledge Base"`.
- **Reset** (secondary): clears project name, all file fields, cancels any active polling, resets retry count, and raises an info toast (`"Form reset"` / `"All files and data have been cleared."`).

**Inline error region:** if a request error occurs, an error message is rendered between the form groups and the action buttons.

### 6.4 Knowledge Base tab — submission & polling

On submit of the Knowledge Base form:

1. Build a `multipart/form-data` body containing:
   - `projectName` (string)
   - `brd` (file, if provided)
   - `frd` (file, if provided)
   - `hld` (file, if provided)
   - `lld` (file, if provided)
   - `transcript` (file, if provided)
   - `image` (one entry per selected UI design image — repeated field)
2. POST to `http://localhost:5678/webhook/upload-test-artifacts`.
3. Parse the JSON response. Expected shape: `{ jobId: string, status?: string }`.
4. If the response has no `jobId`: surface an error (`"Invalid response from backend"`) and raise an error toast.
5. On success:
   - Store `jobId` and `status` (default `"queued"`).
   - Reset retry counter to 0.
   - Raise an info toast: `"Ingestion started"` / `"Knowledge base ingestion queued."`
   - Immediately invoke the job-status polling function once.
   - After a **5-second delay**, start an interval that polls every **30 seconds**.

**Polling behavior** (GET `http://localhost:5678/webhook/job-status?jobId={jobId}`):
- Response may be an array or object; use the first element if it's an array.
- If `status` contains unsubstituted template variables (matches `{{`), surface a backend error toast (`"Backend error"` / `"Webhook is not properly configured."`) and stop polling.
- If `status === "completed"`: update status, raise a success toast (`"Job completed"` / `"Knowledge base creation completed successfully."`), stop polling.
- If `status === "failed"`: update status, set an error message, raise an error toast (`"Job failed"` / `"Knowledge base creation failed."`), stop polling.
- If `status === "processing"`:
  - First time entering `processing`: raise an info toast (`"Processing started"` / `"Your knowledge base is being created."`).
  - Switch the polling interval to every **45 seconds**.
- If `status === "not_found"`: increment retry counter; after **3 retries**, mark status `failed`, surface `"Job not found after retries."` and stop polling.
- If the fetch itself throws: increment retry counter; after **3 retries**, mark status `failed`, surface `"Failed to check job status."` and stop polling.

**Polling lifecycle:**
- Any new submission cancels prior polling (interval + delay timeout).
- The Reset button cancels polling.
- Unmounting the Dashboard cancels all polling.

### 6.5 Knowledge Base tab — status panel

The right-hand panel displays job status while a job is active.

- Only shown when `status !== "idle"`.
- Shows:
  - A status label: `Queued`, `Processing`, `Completed`, or `Failed`.
  - The **Job ID** returned by the backend.
  - The raw status string.
  - A progress bar whose fill reflects status:
    - `queued` → 25%
    - `processing` → 50% with a pulsing animation
    - `completed` → 100%
    - `failed` → 25% (no further progression)
  - A status-specific message:
    - Queued: `"Queued for ingestion. Polling starts in 30 seconds."`
    - Processing: `"Processing continues. Polling every 45 seconds until completion."`
    - Completed: `"Knowledge base created successfully."`
    - Failed: `"Knowledge base creation failed."`
- Success, failure, and in-flight states must be visually distinguishable (e.g., color cues on the border/background).

### 6.6 Quick tips panel (both tabs)
Right-hand sidebar also shows a **Quick tips** block with tab-specific content.

**Knowledge Base tab tips:**
- Use clear knowledge project names for traceable AI assets.
- Upload required source documents to build the knowledge base.
- Verify the API at `localhost:5678` if requests fail.

**Generate Documents tab tips:**
- Select a document type to generate QA artifacts.
- Reference an existing knowledge base project.
- Generated documents will appear as Jira or Confluence links.

### 6.7 Generate Documents tab — form

Purpose: choose a QA artifact type and generate it from an existing knowledge base.

**Subheading / info line:** `"Choose outputs and generate QA deliverables from your knowledge base."`

**Fields:**

1. **Project name** (text input) — placeholder `"Enter existing knowledge project name"`.
2. **Select artifacts** (radio-group selection, styled as a grid of selectable cards; only one selection allowed):

| Card key | Label | Description (shown on card) |
|---|---|---|
| `strategy` | Test Strategy | Generate Test Strategy from your knowledge base. |
| `plan` | Test Plan | Generate Test Plan from your knowledge base. |
| `risk` | Risk Matrix | Generate Risk Matrix from your knowledge base. |
| `testCases` | Test Cases | Generate Test Cases from your knowledge base. |
| `epicsAndStories` | Epics & User Stories | Generate Epics & User Stories from your knowledge base. |
| `traceability_matrix` | Traceability Matrix | Generate Traceability Matrix from your knowledge base. |

**Card selection behavior:**
- Clicking a card selects it.
- Pressing **Enter** or **Space** on a focused card selects it (keyboard accessibility).
- Selected card is visually distinct.
- Underlying `<input type="radio">` remains for form-semantic correctness (hidden visually).

**Action buttons:**
- **Generate Documents** (primary submit):
  - While the request is in flight: disabled, shows spinner and `"Generating documents..."`.
  - Otherwise: shows `"Generate Documents"`.
- **Reset** (secondary): clears project name and artifact selection, clears response/output, cancels polling, resets retry count, and raises an info toast (`"Form reset"` / `"Document generation form has been cleared."`).

**Inline error region:** validation errors (`"Please select project and artifact type"`) and request errors are rendered here.

### 6.8 Generate Documents tab — submission & polling

On submit:

1. Validate: if project name or artifact is missing, show the inline error and do not submit.
2. Map the selected artifact key to a backend `documentType` per this table:

| UI key | Backend `documentType` |
|---|---|
| `strategy` | `test_strategy` |
| `plan` | `test_plan` |
| `risk` | `risk_matrix` |
| `testCases` | `test_cases` |
| `epicsAndStories` | `user_stories` |
| `traceability_matrix` | `traceability_matrix` |
| (any other) | (passed through as-is) |

3. POST JSON to `http://localhost:5678/webhook/generate-qa-doc` with body:
   ```json
   {
     "projectName": "<string>",
     "documentType": "<mapped type>",
     "productOwner": "PO"
   }
   ```
4. Parse JSON. Expected shape: `{ jobId: string, status?: string, ... }`.
5. If the response has no `jobId`: surface an error (`"Invalid response from backend"`) and raise an error toast.
6. On success:
   - Store the `jobId` and `status` (default `"queued"`).
   - Reset retry counter and clear any prior output.
   - Raise an info toast: `"Generation started"` / `"Document generation queued."`
   - Immediately poll once for status.
   - After a **30-second delay**, start an interval that polls every **30 seconds**.

**Polling behavior** (GET `http://localhost:5678/webhook/job-status-retrieve?jobId={jobId}`):
- Response may be an array or object; use the first element if it's an array.
- Unsubstituted template variable detection (`{{`) → backend error toast + stop polling.
- `status === "completed"`:
  - Store the `output` field (or the full response if `output` is absent).
  - Raise a success toast (`"Document generation completed"` / `"Your QA document is ready."`).
  - Stop polling.
- `status === "failed"`: set error, raise error toast, stop polling.
- `status === "processing"`:
  - First time entering processing: raise info toast (`"Generation in progress"` / `"Your document is being generated."`).
  - Switch interval to every **45 seconds**.
- `status === "not_found"`: increment retry; after **3 retries**, mark `failed`, surface `"Document job not found after retries."` and stop polling.
- Fetch exception: increment retry; after **3 retries**, mark `failed`, surface `"Failed to check document generation status."` and stop polling.

### 6.9 Generate Documents tab — status panel & output rendering

The right-hand panel behaves like §6.5 for this tab, with these added output behaviors when `status === "completed"`:

- **If the output contains both `epics` and `stories`** (i.e., the Epics & User Stories artifact):
  - Render two side-by-side lists: **Epics** and **User Stories**.
  - Each epic: display `epicKey` as a clickable chip/link opening `epicLink` in a new tab (`target="_blank"`, `rel="noopener noreferrer"`). Key per item: `epicID`.
  - Each story: display `storyKey` as a clickable chip/link opening `storyLink` in a new tab. Key per item: `storyID`.
- **Else if the output contains a `url` field** (generic document artifact):
  - Render a **Document Link** section with a link labeled **"Open Document"** opening `output.url` in a new tab.
- **Else:** render nothing extra (status message alone).

Status-specific progress-bar messages for this tab:
- Queued: `"Generation queued. Polling starts in 30 seconds."`
- Processing: `"Generating document. Polling every 45 seconds until completion."`
- Completed: `"Document generated successfully."`
- Failed: `"Document generation failed."`

### 6.10 Dashboard cleanup behaviors
- Switching between tabs does not cancel active polling — both tabs can have jobs running simultaneously, each with its own status.
- Both **Reset** buttons clear their respective tab's state only.
- On unmount, both polling intervals and their startup timeouts are cleared.

---

## 7. Explore More Page (`/explore`)

A public-facing marketing/explainer page. Accessible from Login page CTAs. Contains the following sections, in order:

### 7.1 Hero section
- Eyebrow label: **"AI-Powered QA Platform"**.
- Headline: **"From Requirements to QA Intelligence"**.
- Subhead: **"Q-Ops Agent transforms project artifacts into structured, production-ready QA outputs using AI."**
- CTA button: **"Back to login"** → navigates to `/`.

### 7.2 How Q-Ops Agent Works
- Eyebrow: **"How Q-Ops Agent Works"**.
- Heading: **"End-to-end QA flow with clarity"**.
- Three sequential steps (each: title + description), shown in order:

| Step | Title | Description |
|---|---|---|
| 1 | Ingest Artifacts | BRD, FRD, HLD, UI, transcripts are centralized into a single QA knowledge source. |
| 2 | Build Knowledge Base | Vector embeddings and semantic understanding create contextual QA intelligence. |
| 3 | Generate QA Outputs | Produce strategy, plans, RTM, risk, test cases, and epics in one flow. |

A visual indicator of sequence (e.g., arrows) between steps is present on larger screens.

### 7.3 Capabilities built for QA teams
- Eyebrow: **"AI-Powered QA Capabilities"**.
- Heading: **"Capabilities built for QA teams"**.
- Intro: **"One platform that unifies knowledge ingestion, QA artifact generation, and traceability into a consistent workflow."**
- Grid of six feature cards:

| Title | Description |
|---|---|
| Test Strategy Generation | AI drafts high-level strategies that align with requirements and risk coverage. |
| Test Plan Creation | Build execution-ready test plans with scope, cycles, and exit criteria. |
| Risk Assessment | Highlight product, integration, and security risk areas automatically. |
| Traceability Matrix | Create RTM artifacts linking requirements to tests and coverage. |
| Test Case Generation | Generate structured, reusable test cases from project artifacts. |
| Epics & User Stories | Produce production-ready backlog items with QA context built in. |

### 7.4 Q-Ops Agent vs Standard AI Tools (comparison)
- Eyebrow: **"Q-Ops Agent vs Standard AI Tools"**.
- Heading: **"The differentiation is clear"**.
- A three-column table: **Capability**, **Standard AI Agents**, **Q-Ops Agent**.
- Each cell value is one of `Yes`, `No`, or `Limited` — with distinct iconography/coloring for each state.

**All 18 rows (full set):**

| Capability | Standard AI Agents | Q-Ops Agent |
|---|---|---|
| Document Understanding | Yes | Yes |
| Contextual Q&A | Yes | Yes |
| Multi-Artifact Correlation | Limited | Yes |
| QA-Specific Intelligence | No | Yes |
| Structured Output Generation | Limited | Yes |
| Test Strategy & Planning Depth | Limited | Yes |
| Risk Identification & Prioritization | Limited | Yes |
| Traceability (Req → Test → Defect) | No | Yes |
| Consistency Across Outputs | No | Yes |
| Reusability of Artifacts | No | Yes |
| Workflow-Driven Execution | No | Yes |
| QA Lifecycle Integration | Limited | Yes |
| Handling Unstructured Inputs | Limited | Yes |
| JIRA-Ready Output Formatting | No | Yes |
| Coverage Awareness (Functional/Risk) | No | Yes |
| Iterative Refinement (Feedback Loops) | Limited | Yes |
| Scalability Across Projects | Limited | Yes |
| Production-Ready Deliverables | No | Yes |

**Progressive disclosure behavior:**
- By default, only a **condensed subset** of 6 rows is shown. These rows are, in order:
  1. QA-Specific Intelligence
  2. Multi-Artifact Correlation
  3. Structured Output Generation
  4. Workflow-Driven Execution
  5. Traceability (Req → Test → Defect)
  6. Production-Ready Deliverables
- A toggle button labeled **"See Full Comparison ↓"** (or **"Show Less ↑"** when expanded) expands/collapses the table to show all 18 rows inline.
- A second button labeled **"Open Full View"** opens a **modal** containing the full 18-row table with the same column structure.
  - Modal has a **Close** button.
  - Modal closes on backdrop click.
  - Modal closes on **Escape** key.
  - Modal is scrollable if content overflows.

### 7.5 Why Teams Choose Q-Ops Agent
- Eyebrow: **"Why Teams Choose Q-Ops Agent"**.
- Heading: **"Built for enterprise QA delivery"**.
- Grid of five advantage cards:

| Title | Description |
|---|---|
| Built for QA Engineering | Purpose-built workflows designed around requirements, risk, and test execution. |
| Structured, Not Ad-Hoc | Deliver artifacts with consistent format, traceability, and auditability. |
| End-to-End Automation | Move from knowledge ingestion to QA outputs without manual translation. |
| Context-Aware Intelligence | AI understands your project artefacts, not just one-off prompts. |
| Scalable & Repeatable | Use the same workflow across projects and teams with consistent results. |

### 7.6 Architecture section
- Eyebrow: **"Powered by a Scalable AI Architecture"**.
- Heading: **"Q-Ops Agent combines orchestration, intelligence, and storage layers to deliver end-to-end QA automation"**.
- Four labeled sub-groups, each containing one or more component cards (name + description):

**Orchestration Layer**
- **n8n** — Manages workflow automation and agent execution

**Data & Knowledge Layer**
- **Supabase** — Stores artifacts, outputs, and system data
- **Chroma (Vector DB)** — Handles embeddings and semantic search

**Intelligence Layer**
- **OpenAI LLMs** — Generates QA artifacts: strategies, plans, stories
- **OpenAI Embeddings** — Converts docs into vectors for contextual understanding
- **OpenAI Vision** — Extracts structured insights from UI and visual inputs

**Delivery & Collaboration Layer**
- **Jira** — Creates epics, stories, and tracks QA execution
- **Confluence** — Houses strategies, plans, and QA documentation

### 7.7 Final CTA section
- Eyebrow: **"Move from understanding requirements to executing QA—instantly"**.
- Heading: **"Turn artifacts into action with confidence"**.
- Supporting paragraph: **"Explore how Q-Ops Agent delivers a complete QA intelligence workflow, from artifact ingestion through production-ready test delivery."**
- Two buttons:
  - **Get Started** → navigates to `/`.
  - **Return to login** → navigates to `/`.

---

## 8. Backend API Contract (summary)

All endpoints are served by an n8n webhook server. Base URL is hardcoded to `http://localhost:5678`.

| Purpose | Method | Endpoint | Request | Response |
|---|---|---|---|---|
| Upload Knowledge Base artifacts | POST | `/webhook/upload-test-artifacts` | `multipart/form-data` with `projectName`, optional `brd`, `frd`, `hld`, `lld`, `transcript`, and multiple `image` entries | `{ jobId: string, status?: string }` |
| Poll Knowledge Base job status | GET | `/webhook/job-status?jobId={jobId}` | — | Object or single-element array with `{ status: "queued"\|"processing"\|"completed"\|"failed"\|"not_found" }` |
| Trigger document generation | POST | `/webhook/generate-qa-doc` | JSON: `{ projectName, documentType, productOwner: "PO" }` | `{ jobId: string, status?: string }` |
| Poll document generation status | GET | `/webhook/job-status-retrieve?jobId={jobId}` | — | `{ status: ..., output?: { url?, epics?: [{epicID, epicKey, epicLink}], stories?: [{storyID, storyKey, storyLink}] } }` |

**Recommendation for redesign:** keep the same endpoint paths, HTTP methods, request shapes, response shapes, polling cadences (immediate poll → delayed interval start → interval switch on `processing`), and retry semantics (3-retry cap on `not_found` and fetch errors). These are the functional contract with the backend and must be preserved.

---

## 9. Accessibility & Keyboard Behavior Requirements

The following keyboard and accessibility behaviors exist today and must be preserved:

- **Escape** closes any open modal (Login, Forgot Password, Full Comparison).
- Backdrop clicks close modals.
- Explicit close (×) buttons exist on all modals.
- The artifact selector on the Generate Documents tab is keyboard-operable: focused cards accept **Enter** and **Space** to select. A screen-reader-accessible `<input type="radio">` is present per card.
- The tab control exposes `aria-pressed` on each tab button reflecting its active state.
- All form inputs have associated `<label>` elements.
- Password and username fields declare appropriate `autoComplete` hints.
- File inputs are usable both via click and drag-and-drop.

---

## 10. Responsive Behavior

The app targets both desktop and mobile. Current breakpoints in use (via Tailwind): `sm`, `md`, `lg`, `xl`.

Required responsive behaviors:
- Dashboard workspace collapses from a two-column layout (form on left, status on right) to single-column on small screens.
- Multi-column grids (Core Capabilities, feature cards, comparison rows, architecture cards, metrics) collapse gracefully to fewer columns / single column on small viewports.
- Modals occupy a bounded width on desktop (approximately 480px max) and fit the viewport with padding on mobile.
- Horizontal overflow (e.g., comparison table) is scrollable on small screens rather than clipping.

---

## 11. Non-UI State & Side-Effects Summary

For completeness, here are all the persistent and semi-persistent state items the app manages:

- `localStorage["qops-agent-auth"]` — `"true"` / `"false"`.
- In-memory per-session state: current tab, form fields, selected artifact, file selections, in-flight job IDs, polling interval IDs, delay timeout IDs, retry counters, last received output.
- Timers: setTimeout for poll-start delays, setInterval for poll cadences. Both are always cleaned up on reset, unmount, or job terminal state.

---

## 12. What the Redesign May Freely Change

For clarity — the redesign is explicitly free to change:
- Color palette, typography, iconography, illustrations, and imagery.
- Spacing, shadows, borders, radii, animations (other than the metric count-up behavior).
- Layout structure (single page vs split panels, stacked vs tabbed, etc.) — **provided** all functional behaviors listed above remain reachable.
- Component library / UI primitives.
- Copy tone — but preserve the **meaning** of headlines, subheads, labels, helper texts, error messages, and toast messages. If rewriting copy, retain the semantic intent (e.g., "Your data is never used for model training" can be reworded but must still communicate data privacy).
- The static image assets (`hero-bg.jpg`, `ai-qa-intelligence.png`) may be swapped.

## 13. What the Redesign Must Not Change

- Route paths and redirect rules (§2).
- Auth contract: static `admin`/`admin`, localStorage persistence key (§3).
- Backend API endpoints, request/response shapes, polling cadences, retry caps (§6.4, §6.8, §8).
- Artifact-key → backend `documentType` mapping (§6.8).
- Field names in the multipart upload (`projectName`, `brd`, `frd`, `hld`, `lld`, `transcript`, `image`) (§6.4).
- Accepted file types per field (§6.3).
- Output rendering rules for completed document jobs (epics+stories vs url vs none) (§6.9).
- Toast dismissal timing (4.2s) unless a better value is explicitly approved.
- The **existence** of every section listed in §5, §6, and §7 and the user capabilities they expose.
