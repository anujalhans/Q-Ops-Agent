# PHASE-2: Extractor, LLM Cache, and Jira Scalability Plan

Generated on: 2026-05-15
Last updated: 2026-05-28

This plan captures the Phase-2 implementation strategy for five major capability gaps in Q-Ops Agent:

1. Reintroducing advanced document extraction safely.
2. Enabling LLM/model-output caching to reduce token consumption.
3. Supporting both Team-managed and Company-managed Jira projects.
4. Scoping integration settings by user/project so different clients cannot accidentally publish into the same Jira, Confluence, or processing destinations.
5. Making generation coverage exhaustive enough for epics, stories, traceability, risk, and QA documents without relying on one large model response.

The goal of Phase 2 is to increase intelligence, scalability, and cost efficiency without regressing the stable end-to-end pipelines, frontend polling/status behavior, n8n worker stability, Supabase metrics, or analytics views.

## Current Baseline

### Stable Capabilities

- Frontend Create Knowledge Base flow supports multi-document submission with batch-aware job status display.
- Ingestion worker locks pending jobs and processes them through the active ingestion workflow.
- Extractor endpoint `/process-document-v2` is stable in compatibility mode.
- Ingestion workflow `C9oZfZxpGFakzlB3` calls the extractor using `fileUrl`.
- n8n routes image and non-image jobs separately through `Has Images?`.
- Vision candidates are limited using `Guard: Max Image Limit`.
- Vision requests are processed in batches.
- Chunks are stored in ChromaDB and metrics are written to Supabase.
- Generation workflows support Confluence document generation and Jira epics/stories/test cases for Team-managed Jira projects.
- Analytics reads `qa_job_metrics` and displays ingestion/generation metrics.

### Implementation Status As Of 2026-05-19

The first part of Stream 1 has already moved from plan to implementation.

Implemented extractor capabilities:

- `/process-document-v2` now supports feature flags for:
  - `extractTables`
  - `extractAnnotations`
  - `extractLinks`
  - `detectRenderedPages`
  - `renderPages`
- Safe text-rich extraction is enabled by default for tables, annotations, and links.
- Rendered-page detection is available as lightweight candidate metadata.
- Actual rendered-page image generation remains disabled by default.
- PDF extraction now supports text, embedded images, tables, annotations, links, and render-candidate detection.
- DOCX extraction now supports paragraph text, embedded images, tables, comments/annotation-style records, footnotes/endnotes where available, links, and document-level render-candidate detection.
- PPTX extraction now supports slide text, embedded images, tables, speaker notes, links, and slide-level render-candidate detection.
- Advanced extraction is fail-soft: optional extraction failures are returned as warnings instead of failing the whole ingestion job.
- Extractor observability now includes duration, file size, response-size estimate, warning count, table count, annotation count, link count, and visual candidate count.

Implemented n8n/FE support:

- Settings -> Integrations -> Document Processing exposes extraction flags and persists them into the integration config snapshot.
- The ingestion workflow passes extraction flags from `configSnapshot.microservices.extraction` to the extractor.
- The ingestion workflow appends extracted tables, annotations, and links into semantic content sections before chunking.
- Extractor warning and observability data is persisted in job output and metrics metadata.
- Audit details include compact extractor observability summaries.
- Job Status and My Knowledge Jobs can surface extractor warnings to users.
- A rich smoke-test dataset exists under `docs/test_data/quantumcart_loyalty_platform_project`.

Still pending for Stream 1:

- Selective rendered-page generation remains intentionally disabled.
- External storage references for large rendered visuals are not implemented yet.
- Response-size based visual deferral needs to be hardened before rendered images are enabled.
- Formal regression tests for feature flags, rich extraction, render-candidate detection, and n8n semantic content should be added.
- Analytics can optionally expose extractor observability trends, but this should remain secondary to pipeline stability.
- Production security hardening, including RLS and scoped service credentials, is still a separate rollout concern.

### Important Stability Lessons

- Large base64 payloads inside n8n execution data can cause memory pressure.
- Rendered PDF/page images are the highest-risk extraction output.
- Tables, annotations, links, speaker notes, comments, and footnotes are much safer because they are text-based.
- n8n should not carry large image payloads unnecessarily through multiple nodes.
- Any Phase-2 feature must prefer bounded, observable, and recoverable behavior over maximum extraction completeness.

## Stream 1: Advanced Extractor Reintroduction

### Objective

Restore richer document intelligence while keeping n8n memory stable.

Advanced extraction should eventually support:

- PDF tables
- PDF annotations
- PDF links
- PDF rendered-page candidates
- DOCX tables
- DOCX comments
- DOCX footnotes
- DOCX endnotes
- DOCX links
- DOCX visual indicators
- PPTX tables
- PPTX speaker notes
- PPTX links
- PPTX visual indicators
- Selected rendered pages/slides

### Original Extractor Baseline

This was the conservative extractor baseline before Phase-2 extractor work began:

- `extract_images_v2/extractors/pdf_extractor.py`
  - text
  - embedded images
  - no tables in the original baseline
  - no annotations in the original baseline
  - no links in the original baseline
  - no rendered pages in the original baseline

- `extract_images_v2/extractors/docx_extractor.py`
  - paragraph text
  - embedded images
  - no tables in the original baseline
  - no comments in the original baseline
  - no footnotes/endnotes in the original baseline
  - no links in the original baseline
  - no rendered pages in the original baseline

- `extract_images_v2/extractors/pptx_extractor.py`
  - slide text
  - embedded images
  - no tables in the original baseline
  - no speaker notes in the original baseline
  - no links in the original baseline
  - no rendered slides in the original baseline

The active implementation has since restored safe text-rich extraction for tables, annotations/notes, and links, and has added render-candidate detection without enabling actual rendered-page image payloads.

The richer extractor logic exists in backup form under:

- `backups/extract_images_v2-20260514-133801/extractors/pdf_extractor.py`
- `backups/extract_images_v2-20260514-133801/extractors/docx_extractor.py`
- `backups/extract_images_v2-20260514-133801/extractors/pptx_extractor.py`

### Design Principle

Do not restore the full extractor as one big switch.

Instead:

1. Restore safe text-rich extraction first.
2. Add rendered-page detection without returning rendered-page base64.
3. Add tightly capped rendered-page extraction only after measurement.
4. Prefer references/storage paths over base64 payloads for large visuals.

### Phase 2.1: Restore Safe Text-Rich Extraction

Scope:

- PDF tables
- PDF annotations
- PDF links
- DOCX tables
- DOCX comments
- DOCX footnotes
- DOCX endnotes
- DOCX links
- PPTX tables
- PPTX speaker notes
- PPTX links

Out of scope for Phase 2.1:

- rendered PDF pages
- rendered DOCX pages
- rendered PPTX slides
- OCR
- external storage of rendered visual artifacts

Expected behavior:

- Extracted tables should be represented as markdown and plain text.
- Extracted annotations should be represented as compact text records.
- Extracted links should include URI, page/slide reference when available, and source.
- These elements should be integrated into semantic content before chunking.
- The extractor response may still include `tables`, `annotations`, and `links`, but n8n should not depend only on side arrays. The downstream generation pipeline should see them inside `semanticContent`.

Implementation tasks:

1. Reintroduce table utility usage in active extractors.
2. Restore PDF table extraction with `page.find_tables()` when available.
3. Restore PDF annotation extraction with `page.annots()`.
4. Restore PDF link extraction with `page.get_links()`.
5. Restore DOCX table extraction using `python-docx`.
6. Restore DOCX comments, footnotes, and endnotes using XML parsing.
7. Restore DOCX hyperlink extraction from relationships.
8. Restore PPTX table extraction using `python-pptx`.
9. Restore PPTX speaker-note extraction.
10. Restore PPTX hyperlink extraction.
11. Add extraction counters into `extractionStats`.
12. Ensure all extraction failures are warnings, not hard failures, unless the main file cannot be parsed.

Acceptance criteria:

- Existing text-only documents still ingest successfully.
- Existing image documents still ingest successfully.
- Existing PDF/DOCX/PPTX files ingest successfully.
- A PDF with tables creates table context chunks.
- A DOCX with comments creates annotation context chunks.
- A PPTX with speaker notes creates annotation context chunks.
- n8n execution memory does not materially increase for non-rendered documents.
- Supabase metrics still populate word count, chunk count, duration, token count, and cost.

### Phase 2.2: Semantic Content Contract

The current n8n workflow has downstream logic that can detect structural sections:

- `TABLE CONTEXT START`
- `ANNOTATION CONTEXT START`
- `LINK CONTEXT START`
- `IMAGE CONTEXT START`

Phase 2 should standardize this contract.

Recommended semantic content layout:

```text
Project Name: <project>
Document Name: <file>
Document Type: <docType>
Source Format: <fileType>

SOURCE TEXT START
...
SOURCE TEXT END

TABLE CONTEXT START
Table ID: ...
Page Number: ...
Rows: ...
Columns: ...
Markdown:
...
TABLE CONTEXT END

ANNOTATION CONTEXT START
Annotation ID: ...
Type: ...
Page Number: ...
Content: ...
ANNOTATION CONTEXT END

LINK CONTEXT START
Link ID: ...
Page Number: ...
URI: ...
Target Page: ...
LINK CONTEXT END

IMAGE CONTEXT START
Image ID: ...
Image Source: ...
Page Number: ...
Visual Reason: ...
Extracted Insights: ...
IMAGE CONTEXT END
```

Implementation options:

- Option A: Build semantic content inside n8n `Build Semantic Content`.
- Option B: Build semantic content inside extractor and let n8n append vision descriptions.

Recommendation:

- Keep final `semanticContent` assembly in n8n for now because the workflow already combines vision output with extracted document content.
- Add extractor output fields consistently so n8n can build the text sections deterministically.

Required n8n checks:

- If `tables` exists, append table sections.
- If `annotations` exists, append annotation sections.
- If `links` exists, append link sections.
- If `warnings` exists, optionally append a small diagnostics section or store in job output only.
- Avoid adding huge raw JSON dumps to semantic content.

### Phase 2.3: Rendered Page Detection Only

Objective:

Understand how many pages/slides would need visual rendering before actually returning rendered images.

Extractor should return lightweight candidates:

```json
{
  "renderCandidates": [
    {
      "imageId": "file_page3_rendered",
      "pageNumber": 3,
      "imageSource": "rendered-page-candidate",
      "visualReason": ["table_shapes", "vector_drawings"],
      "priorityScore": 112,
      "priorityClass": "high",
      "visualLocator": "page-3:rendered-page:file_page3_rendered"
    }
  ]
}
```

No base64 should be returned in this phase.

Acceptance criteria:

- Jobs continue to complete.
- n8n logs candidate counts.
- Supabase job output captures candidate counts.
- Analytics can optionally expose `visualCandidateCount`.
- No additional vision calls are triggered for render candidates yet.

### Phase 2.4: Capped Rendered Page Extraction

Only after Phase 2.1 and 2.3 are stable, enable actual rendered pages.

Initial conservative defaults:

- `maxRenderedPagesPerDocument`: 3
- `maxEmbeddedImagesPerDocument`: 8
- `maxStandaloneImagesPerDocument`: 5
- `maxImagesPerJob`: 12
- `visionBatchSize`: 2
- `renderDpi`: 110 or 120
- `deferOverflowVisuals`: true

Behavior:

- Render only highest-priority pages/slides.
- Skip rendering if document has too many pages and no high-value indicators.
- Skip rendering if extraction time budget is exceeded.
- Return warnings rather than failing the job.

Hard limits:

- max extractor response size
- max rendered image count
- max individual image size
- max render duration per document
- max total extractor duration

Recommended response-size guard:

Before returning from extractor, estimate:

```text
rawText bytes
+ JSON tables bytes
+ JSON annotations bytes
+ JSON links bytes
+ base64 image bytes
```

If response exceeds configured threshold:

- remove lower-priority visuals
- add warning
- preserve text/tables/annotations/links

### Phase 2.5: Storage-Based Visual Payloads

Best long-term approach:

- Extractor should not return large base64 rendered images to n8n.
- Extractor should write rendered visuals to object storage or a controlled temp file endpoint.
- n8n should receive only references.

Possible visual reference shape:

```json
{
  "imageId": "file_page3_rendered",
  "imageSource": "rendered-page",
  "pageNumber": 3,
  "mimeType": "image/png",
  "storagePath": "extractor-renders/<jobId>/<imageId>.png",
  "signedUrl": "...",
  "expiresAt": "..."
}
```

Benefits:

- n8n execution data remains small.
- Vision can fetch images only when needed.
- Large visual assets can be expired/cleaned.
- Reuse and caching become easier with image hashes.

Implementation options:

1. Extractor writes to Supabase Storage using service credentials.
2. n8n writes visual payloads to storage after extractor response.
3. Extractor exposes a local temporary `/rendered-assets/{id}` endpoint.

Recommendation:

- Prefer Supabase Storage for production-like behavior.
- Do not use local-only temp URLs unless this stays strictly local/dev.

### Extractor Observability

Add extraction-level logging:

- request id
- job id
- file name
- file size
- file type
- page/slide count
- extraction mode
- tables count
- annotations count
- links count
- embedded image count
- rendered candidate count
- rendered returned count
- deferred visual count
- response size estimate
- duration per stage
- warnings

Recommended `extractionStats` additions:

```json
{
  "compatibilityMode": false,
  "safeTextRichMode": true,
  "renderingEnabled": false,
  "pagesProcessed": 12,
  "tablesExtracted": 5,
  "annotationsExtracted": 3,
  "linksExtracted": 8,
  "embeddedImagesDetected": 4,
  "embeddedImagesExtracted": 4,
  "renderedPageCandidatesDetected": 6,
  "renderedPagesGenerated": 0,
  "visualCandidatesDeferred": 6,
  "responseBytesEstimated": 128000,
  "durationMs": 4200
}
```

### Extractor Rollout Strategy

1. Add feature flags:
   - `extractTables`
   - `extractAnnotations`
   - `extractLinks`
   - `detectRenderedPages`
   - `renderPages`
   - `storeVisualsExternally`

2. Default flags:
   - tables: on
   - annotations: on
   - links: on
   - render detection: off initially, then on
   - actual rendering: off initially
   - external storage: off until implemented

3. Add n8n config support:
   - Pass flags from `configSnapshot.microservices.extraction`.
   - Maintain current defaults if config is absent.

4. Roll out one stage at a time:
   - single text-only document
   - single PDF with table
   - single DOCX with comments
   - single PPTX with notes
   - 12-document batch with rendering off
   - render detection only
   - capped rendering

## Stream 2: LLM/Model Output Caching

### Objective

Reduce token consumption and execution time by reusing validated outputs when a repeated or retry request is provably equivalent.

Caching must not weaken output quality, traceability, Jira correctness, Confluence correctness, or auditability.

### Current Reuse Behavior

Current project already has partial reuse/idempotency concepts:

- Jira labels are used for stable issue detection.
- Story test case workflow reuses existing Jira Test Case issues by stable label.
- Epics/stories use correlation IDs and stable labels.
- `qa_jobs.output` stores completed generation output.
- `qa_job_metrics` stores lifecycle and usage metrics.

Missing capability:

- No dedicated exact model-output cache.
- No reusable request/source/prompt fingerprint.
- No `CACHE_HIT` or `CACHE_MISS` metric.
- No policy for when retry should skip model calls.

### Caching Types

#### Type 1: Retry Cache

Use when the same job is retried and the model step already succeeded.

Good candidates:

- model output succeeded
- parser/quality gate succeeded
- Jira creation failed
- Confluence creation failed
- issue linking failed
- metrics insert failed
- final DB update failed

Behavior:

- Do not call the LLM again.
- Reuse validated generated output.
- Resume from the failed downstream stage.

Risk:

- If partial Jira/Confluence side effects already happened, downstream idempotency must reconcile instead of duplicating.

#### Type 2: Vision Cache

Use when the same image is processed with the same vision prompt/model/settings.

Fingerprint inputs:

- image binary hash
- image source
- page number
- visual locator
- vision prompt version
- vision model
- render DPI
- extraction version

Behavior:

- If cache hit, use cached image description.
- Skip vision model call.
- Record tokens saved estimate.

This is a high-value, lower-risk first cache implementation.

#### Type 3: Exact Generation Cache

Use when a full generation request is equivalent.

Fingerprint inputs:

- project id
- project name
- document type
- product owner/user fields
- selected chunk IDs
- selected chunk text hash
- retrieval profile key
- Chroma collection
- Chroma topK
- prompt version
- output schema version
- model name
- max tokens
- temperature
- settings version
- destination type
- Jira project key or Confluence space

Behavior:

- If cache hit and valid, skip the LLM call.
- Continue downstream publishing if destination output must be recreated.
- Or return previous output directly if user requested reuse only.

#### Type 4: Semantic Similarity Cache

Use when requests are similar but not identical.

Recommendation:

- Do not implement in early Phase 2.
- It is risky for QA/Jira outputs because small source changes can materially affect generated artifacts.

### Cache Candidate Rules

A job is a cache candidate only if all required conditions pass:

- Same user has access to project.
- Same project id/project name.
- Same document type.
- Same relevant request parameters.
- Same source evidence fingerprint.
- Same prompt version.
- Same model and model settings.
- Same output schema version.
- Previous output status is completed.
- Previous output passed quality validation.
- Previous output is not marked stale.
- Previous output is not from a failed parser/quality path.
- Cache entry is not expired.
- Destination strategy is compatible.

### Non-Cache Candidates

Never use cache when:

- source chunks changed
- ingestion has run after the cached output was created
- prompt version changed
- model changed
- output schema changed
- user explicitly requests fresh generation
- previous output failed validation
- previous output was manually invalidated
- Jira/Confluence destination settings changed incompatibly
- project membership/access check fails

### Recommended Cache Table

Create a dedicated table:

`qa_llm_output_cache`

Suggested columns:

```sql
cache_key text primary key,
pipeline text not null,
cache_type text not null,
project_id text,
project_name text,
document_type text,
request_fingerprint text not null,
source_fingerprint text not null,
prompt_version text not null,
output_schema_version text not null,
model text not null,
settings_version integer,
status text not null default 'active',
quality_status text not null default 'passed',
output jsonb not null,
usage jsonb default '{}',
metadata jsonb default '{}',
created_from_job_id text,
created_by uuid,
hit_count integer default 0,
last_hit_at timestamp,
expires_at timestamp,
created_at timestamp default now(),
updated_at timestamp default now()
```

Useful indexes:

```sql
create index qa_llm_output_cache_project_idx
  on qa_llm_output_cache(project_id, document_type, created_at desc);

create index qa_llm_output_cache_fingerprint_idx
  on qa_llm_output_cache(request_fingerprint, source_fingerprint);

create index qa_llm_output_cache_status_idx
  on qa_llm_output_cache(status, expires_at);
```

### Cache Key Generation

Use a deterministic hash over normalized JSON.

Example logical structure:

```json
{
  "pipeline": "generation",
  "cacheType": "exact_generation",
  "projectId": "...",
  "documentType": "test_strategy",
  "request": {
    "productOwner": "...",
    "destination": "confluence"
  },
  "source": {
    "collection": "qops-chunks",
    "retrievalProfile": "qa_document",
    "chunkIds": ["..."],
    "chunkTextHash": "..."
  },
  "prompt": {
    "promptVersion": "generation-v2",
    "schemaVersion": "qa-doc-output-v1"
  },
  "model": {
    "name": "gpt-4.1-mini",
    "temperature": 0,
    "maxTokens": 12000
  }
}
```

Hash with SHA-256.

### n8n Workflow Integration

Generation workflow should add these steps:

1. Normalize request.
2. Resolve settings/config snapshot.
3. Retrieve Chroma evidence.
4. Build source fingerprint.
5. Build request fingerprint.
6. Check cache.
7. If cache hit:
   - validate cache entry
   - skip model node
   - emit `CACHE_HIT`
   - continue downstream parser/publisher or use stored normalized output
8. If cache miss:
   - call model
   - parse/validate output
   - store cache entry
   - emit `CACHE_MISS`
9. Always write metrics.

Retry workflow should:

1. Fetch failed job.
2. Determine failure stage.
3. If model output exists and validation passed:
   - mark `retryMode = reuse_validated_output`
   - skip LLM node
4. Else:
   - rerun normally

Vision workflow should:

1. Compute image hash.
2. Check vision cache.
3. If hit:
   - use cached description.
4. If miss:
   - call vision model.
   - store result.

### Metrics For Cache

Add events to `qa_job_metrics`:

- `CACHE_LOOKUP`
- `CACHE_HIT`
- `CACHE_MISS`
- `CACHE_BYPASS`
- `CACHE_INVALIDATED`

Suggested metadata:

```json
{
  "cache_type": "exact_generation",
  "cache_key": "...",
  "reason": "source_fingerprint_match",
  "tokens_saved_estimate": 8200,
  "cost_saved_estimate_usd": 0.0094,
  "created_from_job_id": "PRO-...",
  "cache_age_seconds": 3600
}
```

Analytics additions:

- cache hit rate
- estimated tokens saved
- estimated cost saved
- cache bypass reasons
- top cacheable document types
- retry reuse count

### Quality Controls

Before using a cached output:

- Re-run lightweight output schema validation.
- Confirm output still matches requested document type.
- Confirm destination config compatibility.
- Confirm user/project access.
- Confirm source fingerprint match.
- Confirm cache entry quality status.

For Jira outputs:

- Verify linked Jira issues still exist when returning existing links.
- Reconcile by stable labels before creating anything.
- Do not assume cached Jira keys are still valid.

For Confluence outputs:

- Verify page URL still exists if reusing page link.
- If page no longer exists, reuse generated content but republish.

### Cache UI Considerations

Optional user-facing indicators:

- `Reused cached output`
- `Saved estimated tokens`
- `Generated fresh`
- `Retry reused validated model output`

Do not overexpose technical cache keys.

For admin/debug view:

- cache key
- source fingerprint
- prompt version
- model
- hit/miss reason

## Stream 3: Jira Team-Managed and Company-Managed Support

### Objective

Support Jira creation for both:

- Team-managed projects
- Company-managed projects

Current implementation is optimized for Team-managed Jira, where stories can be linked to epics using:

```json
{
  "fields": {
    "parent": {
      "key": "KAN-123"
    }
  }
}
```

Company-managed Jira often requires:

- Epic Link custom field for story-to-epic association.
- Epic Name custom field for epic creation.
- Different required fields.
- Different issue type configuration.

### Key Difference

Team-managed story payload:

```json
{
  "fields": {
    "project": { "key": "KAN" },
    "issuetype": { "name": "Story" },
    "summary": "Checkout flow",
    "parent": { "key": "KAN-100" }
  }
}
```

Company-managed story payload:

```json
{
  "fields": {
    "project": { "key": "ABC" },
    "issuetype": { "name": "Story" },
    "summary": "Checkout flow",
    "customfield_10014": "ABC-100"
  }
}
```

The custom field must be discovered. It must not be hardcoded.

### Jira Project Capability Resolver

Create a reusable n8n sub-workflow or node group:

`Resolve Jira Project Capability`

Inputs:

- Jira base URL
- Jira project key
- configured issue type names
- optional cached field config

Outputs:

```json
{
  "projectKey": "ABC",
  "projectId": "10001",
  "projectStyle": "company_managed",
  "storyEpicLinkStrategy": "epic_link",
  "epicIssueTypeName": "Epic",
  "storyIssueTypeName": "Story",
  "testCaseIssueTypeName": "Test Case",
  "epicLinkFieldId": "customfield_10014",
  "epicNameFieldId": "customfield_10011",
  "supported": true,
  "warnings": []
}
```

For Team-managed:

```json
{
  "projectKey": "KAN",
  "projectId": "10002",
  "projectStyle": "team_managed",
  "storyEpicLinkStrategy": "parent",
  "epicIssueTypeName": "Epic",
  "storyIssueTypeName": "Story",
  "testCaseIssueTypeName": "Test Case",
  "epicLinkFieldId": null,
  "epicNameFieldId": null,
  "supported": true,
  "warnings": []
}
```

### Resolver API Calls

Recommended Jira API checks:

1. Get project:
   - `GET /rest/api/3/project/{projectKey}`
   - inspect `style`
   - `next-gen` usually means Team-managed
   - `classic` usually means Company-managed

2. Get createmeta:
   - inspect available issue types
   - inspect required fields
   - confirm Epic, Story, and Test Case issue types

3. Get fields:
   - `GET /rest/api/3/field`
   - find Epic Link field
   - find Epic Name field if needed

4. Optional validation:
   - use Jira editmeta/createmeta per issue type if available.

### Settings Additions

Extend Jira integration config:

```json
{
  "projectKey": "KAN",
  "projectTypeMode": "auto",
  "epicIssueTypeName": "Epic",
  "storyIssueTypeName": "Story",
  "testCaseIssueTypeName": "Test Case",
  "storyEpicLinkStrategy": "auto",
  "epicLinkFieldId": null,
  "epicNameFieldId": null,
  "testCaseLinkType": "Relates",
  "idempotencyLabelPrefix": "qops"
}
```

Recommended modes:

- `auto`
- `team_managed`
- `company_managed`

Recommended link strategies:

- `auto`
- `parent`
- `epic_link`
- `issue_link`

### n8n Branching Design

Do not duplicate the full generation workflow.

Keep shared stages:

1. Normalize request.
2. Retrieve Chroma evidence.
3. Generate model output.
4. Normalize epics/stories/test cases.
5. Resolve Jira capability.
6. Branch only for Jira payload building and issue creation.
7. Merge normalized Jira results.
8. Save job output and metrics.

Branch:

```text
IF projectStyle == team_managed OR storyEpicLinkStrategy == parent
  -> Build Team-Managed Jira Payloads
  -> Create/Re-use Epics
  -> Create/Re-use Stories using parent.key
ELSE IF projectStyle == company_managed OR storyEpicLinkStrategy == epic_link
  -> Build Company-Managed Jira Payloads
  -> Create/Re-use Epics
  -> Create/Re-use Stories using epicLinkFieldId
ELSE
  -> Fail gracefully before Jira creation
```

### Team-Managed Branch

Epic creation:

- project key
- issue type Epic
- summary
- description ADF
- labels

Story creation:

- project key
- issue type Story
- summary
- description ADF
- parent key
- labels

Validation:

- parent key exists
- story issue type exists
- no custom Epic Link field required

### Company-Managed Branch

Epic creation:

- project key
- issue type Epic
- summary
- description ADF
- labels
- Epic Name custom field if required

Story creation:

- project key
- issue type Story
- summary
- description ADF
- Epic Link custom field
- labels

Validation:

- `epicLinkFieldId` must be present unless project supports parent.
- `epicNameFieldId` must be present if required by create metadata.
- Required fields must be populated.
- Fail before creating partial data if required fields are missing.

### Test Case Creation

Test case behavior depends on Jira configuration.

Possible strategies:

1. Plain Jira issue type `Test Case`
   - create Test Case issue
   - link to Story using issue link type

2. Xray/Zephyr or plugin-backed test type
   - may require plugin fields or API
   - must be treated as a separate adapter later

Initial recommendation:

- Continue supporting plain Jira `Test Case` issue type.
- Link to source story using configured issue link type.
- Make link type configurable:
  - `Relates`
  - `Tests`
  - `is tested by`
  - project-specific value

### Idempotency Requirements

Do not create duplicate Jira issues.

Use:

- stable labels
- project key
- issue type
- summary/correlation ID
- source job ID

Before create:

- search by stable label
- if found, reuse
- if not found, create

For Company-managed and Team-managed:

- stable label logic should remain identical.
- only payload field mapping should differ.

### Failure Safety

Before creating any Jira issue:

- Resolve Jira capability.
- Validate required issue types.
- Validate required fields.
- Validate link strategy.
- Validate idempotency label prefix.
- Validate Jira permissions if possible.

If unsupported:

- mark job failed with actionable error
- do not create partial Jira issues
- write `JIRA_CAPABILITY_UNSUPPORTED`

Example error:

```text
Company-managed Jira project ABC requires Epic Link field, but no Epic Link custom field was discovered. Configure epicLinkFieldId in Jira settings or verify Jira field permissions.
```

### Metrics

Add metadata to completion/failure metrics:

```json
{
  "jira_project_key": "ABC",
  "jira_project_style": "company_managed",
  "story_epic_link_strategy": "epic_link",
  "epic_link_field_id": "customfield_10014",
  "epic_name_field_id": "customfield_10011",
  "jira_epics_created": 2,
  "jira_epics_reused": 1,
  "jira_stories_created": 14,
  "jira_stories_reused": 3,
  "jira_test_cases_created": 20,
  "jira_test_cases_reused": 5
}
```

### UI Considerations

Admin Settings should eventually show:

- Jira project key
- detected project style
- issue type mappings
- Epic Link field
- Epic Name field
- Test Case issue type
- link type
- last capability check status

Recommended UX:

- `Auto-detected: Team-managed`
- `Auto-detected: Company-managed`
- `Needs configuration`

Do not expose too many fields to registered users.

### Rollout Strategy

1. Build resolver and run it read-only.
2. Display resolver output in logs/settings only.
3. Add branch for Team-managed and confirm no regression.
4. Add Company-managed branch with dry-run mode.
5. Test against a Company-managed Jira sandbox project.
6. Enable issue creation.
7. Validate epics, stories, and test cases.
8. Add analytics metadata.

## Stream 3B: Exhaustive Generation Coverage Strategy

### Objective

Prevent under-generation in workflows that currently depend on a single model response.

The current Epics/User Stories generator and the general QA document generator are not showing clear max-token truncation in the latest AstraCart smoke run. The recent outputs ended cleanly, parsed successfully, and stayed below configured output token limits. However, they can still miss coverage because they compress retrieved evidence into one final response.

This stream should make generation coverage explicit, measurable, and retryable before publishing Jira issues or Confluence pages.

### Current Findings From AstraCart Smoke Run

Epics/User Stories:

- Workflow: `PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready`
- Output used `10,794` output tokens against `16,000` max tokens.
- Output JSON parsed cleanly and created `3` epics and `11` stories.
- Retrieval found `40` chunks, but only `15` ranked/selected chunks were used in the prompt.
- Quality gate verified structure and source evidence, but not complete requirement/module coverage.
- Generated backlog covered account access, catalog discovery, checkout, and payment, but did not strongly surface every requested module as a distinct backlog area.

General QA documents:

- `test_strategy`, `test_plan`, `risk_matrix`, and `traceability_matrix` recent outputs also ended cleanly.
- They stayed below the current `8,000` output-token ceiling.
- The failed traceability matrix attempt failed because word count was below the quality threshold, not because the output was truncated.
- Some documents did not clearly cover all AstraCart modules such as Home Page, Product Detail Page, Forgot/Reset Password, Success/Failure pages, and Order History.

Conclusion:

- Token truncation is not the primary observed issue for these runs.
- The primary risk is coverage loss caused by single-shot evidence compression.
- Traceability Matrix has the highest need for exhaustive generation because it is an audit artifact.

### Target Pattern

Use a planning-first, batch-aware generation design:

```text
Retrieve project evidence
  -> Build requirement/module coverage ledger
  -> Generate in batches by module, requirement group, or artifact type
  -> Merge and dedupe
  -> Validate coverage against the ledger
  -> Retry only missing or weak batches
  -> Publish to Jira/Confluence
  -> Persist coverage/audit metrics
```

The model should not decide final coverage implicitly. It should generate against an explicit inventory.

### Requirement And Module Coverage Ledger

Add a lightweight planning step before final generation.

The ledger should include:

- project name
- job ID
- document type
- source chunk IDs
- source document names
- module/capability name
- requirement ID when available
- source section
- source excerpt
- priority/criticality
- applicable output type
- expected generated artifact
- generation status
- exclusion reason, if intentionally skipped

Example ledger item:

```json
{
  "ledgerId": "ASTRA-CHECKOUT-PAYMENT-CALLBACK-001",
  "module": "Payment Gateway Integration",
  "sourceDocType": "FRD",
  "sourceName": "FRD_AstraCart_Ecommerce_Platform.docx",
  "sourceSection": "Payment Gateway Integration",
  "chunkId": "01ae9515-...|payment|0|text",
  "requirement": "Payment callback must be idempotent and reconcile duplicate gateway notifications.",
  "expectedOutputs": ["epic_story", "risk", "traceability", "test_plan"],
  "priority": "High",
  "status": "pending"
}
```

This ledger can live inside workflow execution data first. A persisted Supabase table can be added later if UI visibility or retry history requires it.

### Epics And User Stories Strategy

Current risk:

- Single-shot backlog generation can produce a polished but incomplete backlog.
- Adaptive story count is useful, but it should not hide missing modules.
- Jira creation can happen before a coverage gap is detected.

Recommended workflow shape:

1. Retrieve and rank project evidence using the existing project-scoped Chroma filter.
2. Build a module/requirement ledger from BRD, FRD, UI/UX, transcript, HLD, LLD, API, and data model evidence.
3. Generate an epic skeleton from the ledger.
4. Generate stories per epic/module in bounded batches.
5. Normalize stories into the existing canonical story shape.
6. Dedupe by stable correlation ID, summary, and source requirement mapping.
7. Run a coverage gate before Jira creation.
8. Retry missing/weak modules only.
9. Create or reuse Jira epics/stories using existing stable-label idempotency logic.
10. Publish the consolidated Confluence page only after Jira creation/reuse completes.

Coverage gate requirements:

- every ledger item must map to at least one epic or story, or have an explicit exclusion reason
- every source module must have at least one generated story when it is in scope
- every story must carry source references
- no generated story should be created from fallback-only content
- duplicate or near-duplicate stories should be merged before Jira creation

Expected user-facing behavior:

- completed: all required modules covered
- completed with warnings: some low-priority ledger items excluded with reasons
- needs retry: missing high-priority modules or failed story batch
- recovered: retry filled the missing coverage

### Test Strategy Strategy

Test Strategy should remain a single leadership-ready document, but it should be grounded in an explicit strategy coverage ledger.

Recommended batches:

- business goals and quality objectives
- scope and out-of-scope analysis
- test levels and quality gates
- automation strategy
- environments and test data
- metrics and governance
- risk-based testing
- security, performance, accessibility, and compliance

Coverage gate requirements:

- every major source module should be represented in scope or risk-based prioritization
- every critical NFR should map to a test approach
- strategy must cite source evidence
- strategy must include governance, metrics, and automation approach

### Test Plan Strategy

Test Plan should be generated from the same ledger but with execution focus.

Recommended batches:

- in-scope features and workflows
- test objectives and deliverables
- entry and exit criteria
- test environment and data
- schedule/milestones
- roles and responsibilities
- risks and contingencies
- automation coverage matrix

Coverage gate requirements:

- every in-scope module should appear in scope or coverage matrix
- every critical integration should have environment/data needs
- every high-risk area should have mitigation and contingency
- entry/exit criteria must be present

### Risk Matrix Strategy

Risk Matrix should be generated by module/risk category, then merged.

Recommended batches:

- identity and session risks
- catalog and product data risks
- cart and checkout risks
- payment gateway and callback risks
- order history/tracking risks
- security/privacy risks
- performance/scalability risks
- operational/supportability risks

Coverage gate requirements:

- every critical module should have at least one risk or an explicit no-risk rationale
- every risk should include probability, impact, severity, mitigation, owner, and test response
- duplicate risks should be merged
- top risks should be ranked after merge, not inside individual batches only

### Traceability Matrix Strategy

Requirement Traceability Matrix should be treated as a two-layer traceability artifact, not a retrieval-only document.

The RTM must only be generated after these prerequisites exist for the selected project:

- project artifacts have been ingested
- Epics & User Stories have been generated successfully
- Story Test Cases have been generated successfully
- story-to-test-case mappings are available in `qa_story_testcase_links`

Layer 1: Requirement to Epic/User Story traceability

- build a requirement inventory from BRD/FRD/SRS/UI/UX/API/HLD/LLD evidence
- map every discovered requirement to generated Jira epics and user stories
- use actual Jira epic/story keys from the completed Epics & User Stories job
- include source document, source section, and chunk/source reference where available
- mark requirements as covered, partially covered, missing, or out of scope
- do not invent epic IDs, story IDs, or Jira keys

Layer 2: User Story to Test Case traceability

- map every generated user story to generated test cases
- use actual test case Jira keys from `qa_story_testcase_links`
- include test category metadata where available, such as positive, negative, functional, smoke, sanity, regression, security, performance, and network
- identify stories with no test cases as missing test coverage
- identify requirements whose stories exist but whose test cases are incomplete as partial coverage
- do not invent test case IDs or automation status when no generated test case exists

Expected RTM output structure:

- document metadata with source project, backlog job ID, and story test case job ID
- executive coverage summary
- Layer 1 table: requirements -> epics/stories
- Layer 1 gap table: requirements not mapped to backlog
- Layer 2 table: stories -> generated test cases
- Layer 2 gap table: stories without generated test cases
- coverage by test category
- final coverage ledger for audit and retry

Coverage gate requirements:

- every discovered requirement must appear in the RTM or be marked out of scope
- every high-priority requirement must have backlog coverage status
- every generated story must be represented in Layer 2
- every story with no generated test cases must be visible, not silently dropped
- RTM generation should be blocked before queueing if Epics & User Stories or Story Test Cases do not exist for the project
- unmapped requirements and missing story-test coverage should be visible and drive retry/recovery behavior

Implementation status as of 2026-05-22:

- UI now blocks Requirement Traceability Matrix until the selected project has completed Epics & User Stories and completed Story Test Cases.
- Generation queue creator now performs the same backend prerequisite gate before persisting an RTM job.
- For valid RTM requests, the queue creator fetches completed backlog output and `qa_story_testcase_links`, then persists a non-secret `traceabilityContext` snapshot on the job input.
- `fullRetrievalD01` now restores `traceabilityContext` and injects two-layer RTM instructions into the Traceability Matrix prompt.
- Smoke checks passed for workflow JSON shape, Code-node JavaScript syntax, Prompt Library syntax, frontend build, and Supabase prerequisite data availability.
- Real RTM generation tests passed with retry jobs `PRO-260522-Q9GDPO` and `PRO-260522-R53OSC`.
- The successful jobs used backlog job `PRO-260521-VHTJGQ`, story test-case job `STC-260521-4GJZH3`, 3 epics, 11 stories, and the available story-test-case mappings from `qa_story_testcase_links`.
- `PRO-260522-R53OSC` completed with quality gate passed, 1,911 words, 72,038 estimated tokens, estimated cost `US$0.033056`, `JOB_COMPLETED` metrics, and `GENERATION_COMPLETED` audit event.
- The generated Confluence output included Layer 1, Layer 2, and Coverage Ledger sections, passed the enforced coverage gate, and published to Confluence page `22642695`.
- During real testing, a previous RTM attempt `PRO-260522-KM9JJW` exposed two issues that were fixed:
  - RTM context selection was too permissive and could choose a Story Test Case job as the backlog source.
  - Generator-agent failure handling logged `JOB_FAILED` metrics but could leave `qa_jobs.status` stranded as `processing`.
- The queue now requires an actual `user_stories` backlog output for RTM context, dedupes story-test-case mappings, and the generator-agent failure status node now updates `qa_jobs` from the preserved failure payload.
- Follow-up output-quality review found RTM content issues that are now guarded in the prompt and quality gate:
  - hardcoded model/vector metadata is banned; runtime config values must be used
  - invented Risk IDs and Automation Status/percentage are banned unless a future real source is added
  - legacy duplicate RTM tables and duplicate Coverage Ledger sections are banned
  - Layer 2 must include an explicit Story -> Test Case mapping table
  - test case key ranges such as `KAN-560..KAN-570` are banned; actual keys must be listed
  - markdown table rows must match header column counts so source references cannot shift into the Jira key columns
  - source references inside RTM tables must use hyphen separators instead of pipe-separated `[FRD | file | section | chunkId]` syntax
- Additional RTM hardening implemented after real Confluence review:
  - composite chunk/source IDs such as `uuid|page|index|source` are sanitized in RTM table lines before Confluence conversion
  - transparent narrative notes such as "automation status was not available" are allowed, but Automation Status columns, automated/manual claims, and automation percentages remain blocked
  - Layer 2 is now generated deterministically from persisted story-test-case links during the quality-gate stage so all available story keys and test case keys are represented
  - duplicate Layer 2 sections are prevented by replacing both numbered and unnumbered Layer 2 headings
  - the quality gate checks exactly one Coverage Ledger and exactly one Layer 2 section
  - Layer 1 now uses evidence-safe `Traceability Notes` instead of implementation/testing claims, Coverage by Test Category uses `Coverage Scope` and `Evidence Basis` instead of a misleading non-numeric test-count column, and deterministic Layer 2 includes `Unique Test Case Count`
  - Executive Summary `Key Metrics` are normalized back into a table, duplicate comma-separated Jira keys are removed from RTM table cells, and known truncated ledger text such as `State Pers.` is expanded before Confluence conversion
  - RTM queue creation now evaluates freshness in warning-only mode by comparing latest completed ingestion, latest completed Epics & User Stories, and latest completed Story Test Cases; stale inputs are carried in `traceabilityContext.freshness` and rendered as an `RTM Freshness Notice` without blocking generation
  - Document Generation UI now represents readiness consistently across deliverable cards with subtle color-coded icons, hover tooltips, and compact details modals instead of bulky inline status text; RTM and Story Test Cases keep their document-specific upstream dependency rules
  - Document Generation UI now prevents accidental parallel generation from the form by disabling generation while another document job is queued, pending, or processing; retry actions use the same guard

Completed RTM items:

- UI prerequisite gate for RTM.
- Backend prerequisite gate for RTM queue creation.
- RTM `traceabilityContext` snapshot on job input.
- Two-layer RTM prompt contract.
- Enforced RTM coverage gate.
- RTM output contract quality gate.
- RTM table-safety checks for Confluence formatting.
- Deterministic Story -> Test Case Layer 2 table from persisted mappings.
- Metrics and audit validation for successful and failed RTM retries.

Still pending for RTM:

- True batched requirement-inventory generation and merge/dedupe for very large projects.
- Partial retry of only missing RTM requirement batches.
- Jira-sourced story/test-case enrichment instead of relying on generated content stored in Q-Ops tables.
- Retention/minimization review for generated output payloads before external-client rollout.

### Coverage Ledger Rollout Plan By Workflow

This section captures the next implementation plan so coverage-ledger work can continue one item at a time without losing context.

Current workflow split:

- Shared Confluence document path:
  - `PRO QA Generation Queue Creator - Ready Draft`
  - `RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft`
  - Applies to `test_strategy`, `test_plan`, `risk_matrix`, and `traceability_matrix`.
- Backlog/Jira path:
  - `PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready`
  - Applies to `user_stories` / Epics & User Stories.
- Story Test Case path:
  - `PRO QA Story Test Cases Queue Creator`
  - `PRO QA Story Test Cases Worker`
  - `PRO QA Jira Story Test Case Generator`
  - Applies to `story_test_cases`.

Current coverage-ledger status:

- `traceability_matrix`: implemented as an enforced RTM coverage gate with two-layer context, deterministic Story -> Test Case Layer 2, and output-contract validation.
- `story_test_cases`: implemented in a specialized story-test-case workflow path with story coverage, batching/retry, and persisted story-to-test-case mappings.
- `test_strategy`, `test_plan`, `risk_matrix`: implemented in warning mode in the shared document generator with document-specific Coverage Ledger prompt profiles and Quality Gate coverage-planning metadata.
- `user_stories`: implemented in the Team-managed Jira backlog generator with an enforced `document.coverageLedger` contract, pre-Jira coverage gate, Confluence coverage summary, and returned coverage metadata.

Recommended rollout order:

1. Shared document coverage planner for `risk_matrix`, `test_plan`, and `test_strategy`.
   - Implemented once in the shared generation generator path.
   - Started in warning/dry-run mode so existing generation is not blocked.
   - Persisted `coveragePlanningRequirement` on the prompt context.
   - Added quality-gate metadata showing ledger count and warning counts for coverage gaps or missing ledgers.
2. Risk Matrix coverage gate.
   - Highest priority in the shared path because missing context can hide delivery, security, payment, integration, performance, or compliance risk.
   - Ledger dimensions should include module, requirement, NFR, integration, UI flow, data/privacy concern, risk category, severity candidate, and source reference.
   - Gate should require every critical module/integration/NFR to have a risk or explicit no-material-risk rationale.
3. Test Plan coverage gate.
   - Ledger dimensions should include module/workflow, test scope, environment/data needs, dependencies, entry/exit criteria, roles/responsibilities, schedule/milestones, and risks.
   - Gate should flag missing in-scope modules, missing critical integration test coverage, and missing execution prerequisites.
4. Test Strategy coverage gate.
   - Ledger dimensions should include business goals, quality objectives, test levels, automation approach, NFRs, environments, metrics, governance, and risk-based prioritization.
   - Gate can remain warning-first because strategy is more abstract than a test plan or RTM.
5. Epics & User Stories coverage planner in the backlog/Jira workflow.
   - Implemented separately because the backlog generator creates/reuses Jira issues and has different idempotency concerns.
   - Ledger dimensions include source requirement/module, source reference, expected epic/story mapping, coverage status, and rationale/notes.
   - Jira issue creation now happens only after the backlog coverage gate passes. Missing or unrecognized coverage rows block creation; partial coverage passes with warnings.
6. Optional standalone Test Cases coverage ledger.
   - Only implement if standalone Confluence-style `test_cases` remains an active product path.
   - If Jira Story Test Cases is the primary direction, keep the specialized story-test-case workflow as the authoritative test-case coverage implementation.

Shared `coveragePlanningContext` shape:

```json
{
  "version": "coverage-planning-v1",
  "mode": "dry_run",
  "projectId": "project-id",
  "projectName": "Project Name",
  "documentType": "risk_matrix",
  "generatedAt": "2026-05-28T00:00:00.000Z",
  "sourceInventory": [
    {
      "sourceId": "chunk-or-artifact-id",
      "docType": "BRD",
      "sourceName": "BRD_AstraCart_Ecommerce_Platform.pdf",
      "sectionTitle": "Checkout",
      "chunkId": "chunk-id"
    }
  ],
  "ledgerItems": [
    {
      "ledgerId": "CHECKOUT-PAYMENT-001",
      "module": "Checkout",
      "requirementId": "BR-CHK-06",
      "capability": "Price lock survives retry within configured window",
      "priority": "Must",
      "nfrType": null,
      "integration": "Payment Gateway",
      "uiFlow": "Checkout",
      "expectedCoverage": ["risk_matrix", "test_plan", "test_strategy"],
      "coverageStatus": "pending",
      "exclusionReason": null,
      "sourceRefs": ["BRD - file - section - chunkId"]
    }
  ],
  "counts": {
    "ledgerItems": 0,
    "criticalItems": 0,
    "coveredItems": 0,
    "missingItems": 0,
    "warningItems": 0
  }
}
```

Shared document acceptance criteria:

- The generator should not rely only on a polished single response to imply coverage.
- Every important source module/capability should be represented in the ledger or explicitly excluded with a reason.
- The final document should include a concise coverage summary, not necessarily the full internal ledger.
- Quality Gate should fail only for severe structural issues at first; coverage gaps should start as warnings for `test_strategy`, `test_plan`, and `risk_matrix`.
- Metrics should record coverage counts so UI and analytics can later show document completeness trends.

Implementation checklist for shared document path:

- Implement planner block inside `Prompt Library` in `fullRetrievalD01`.
- Use the existing retrieved evidence contract and prompt profile to guide module/capability ledger items.
- Add document-specific ledger profiles for `risk_matrix`, `test_plan`, and `test_strategy`.
- Inject compact ledger requirements into the prompt.
- Add Quality Gate warning metadata for ledger presence and coverage warnings.
- Keep RTM on its existing enforced output contract and coverage gate.
- Smoke test the patched Quality Gate with latest RTM output replay plus synthetic clean/warning/missing-ledger states for all three shared document types.
- Future hardening: persist richer coverage-planning trend fields into analytics once the warning-mode behavior is stable.

Implementation checklist for backlog/Jira path:

- Add requirement/module ledger contract before epics/story generation in `Vwc6c8ehsRTF8svG`.
- Require the model to return `document.coverageLedger` with source requirement/module, source reference, mapped epic/story correlation IDs, coverage status, and notes.
- Normalize and validate coverage rows in `Validate Team Managed Backlog`.
- Run coverage gate before Jira creation/reuse.
- Block Jira creation when the ledger is missing or when rows are `missing`/`unknown`.
- Allow `partial` coverage as `passed_with_warnings` so intentional reduced scope remains visible.
- Return `coverageLedger` and `coverageSummary` in the final workflow output.
- Add a Coverage Gate summary/table to the generated Confluence backlog page.
- Smoke test clean, partial-warning, missing-row-blocked, and missing-ledger-blocked states.
- Future hardening: generate epic skeleton and story batches directly from a persisted ledger before Jira creation.

Open security/compliance hardening item:

- Move RTM story/test-case enrichment to a Jira-sourced model instead of relying on generated story/test-case content stored in Q-Ops tables.
- Q-Ops DB should retain only lightweight references and metrics where possible: Jira issue keys/IDs, mapping status, job IDs, project/user IDs, counts, duration, cost, and non-secret snapshots.
- Avoid long-term storage of external-client IP such as full user story descriptions, acceptance criteria, test steps, expected results, generated Confluence body, or copied business rules.
- During RTM generation, fetch the latest permitted Jira epic/story/test-case details using the user/project-scoped Jira configuration and current Jira permissions.
- Keep `qa_story_testcase_links` as a lightweight mapping/index table, but treat Jira as source of truth for detailed issue content.
- Add retention/minimization review for existing generated output payloads before external-client rollout.

### Retry And Recovery Behavior

Retry should not blindly regenerate the full document every time.

Recommended retry modes:

- `retry_missing_batches`: regenerate only missing modules/requirements
- `retry_failed_batches`: regenerate only batches that failed parsing/quality checks
- `retry_with_refined_prompt`: use failure-specific guidance, such as low word count or missing coverage
- `retry_full`: explicit user/admin action when the source or configuration changed significantly

The retry record should preserve:

- original job ID
- retry job ID
- failed batch IDs
- recovered batch IDs
- reused batch IDs
- missing ledger items before retry
- missing ledger items after retry

### Metrics And Audit Additions

Add or extend metrics metadata for generation jobs:

```json
{
  "coverage_ledger_count": 42,
  "covered_ledger_count": 40,
  "uncovered_ledger_count": 2,
  "batch_count": 8,
  "batch_success_count": 7,
  "batch_failed_count": 1,
  "batch_retried_count": 1,
  "generation_mode": "coverage_batched",
  "coverage_gate_status": "passed_with_warnings"
}
```

Audit events should distinguish:

- `GENERATION_COVERAGE_PLANNED`
- `GENERATION_BATCH_STARTED`
- `GENERATION_BATCH_COMPLETED`
- `GENERATION_BATCH_FAILED`
- `GENERATION_COVERAGE_GATE_FAILED`
- `GENERATION_RECOVERED`
- `GENERATION_COMPLETED_WITH_WARNINGS`

### Rollout Strategy

1. Add coverage ledger generation in dry-run mode for documents only. **Status: partially implemented.** Coverage ledger exists for generated documents and is enforced for RTM; broader dry-run reporting still needs hardening.
2. Display ledger/gap summary in n8n logs and metrics metadata. **Status: partially implemented.** RTM stores coverage summary in job output/metrics; generalized analytics visibility remains pending.
3. Add coverage gate for Traceability Matrix first. **Status: implemented.**
4. Add batched Traceability Matrix generation. **Status: partially implemented.** RTM now has two-layer prerequisite gating and deterministic Layer 2 from persisted mappings; true requirement-inventory batching and partial batch retry remain pending.
5. Add batched Risk Matrix generation. **Status: pending.**
6. Add planning ledger to Test Strategy and Test Plan. **Status: pending.**
7. Add Epics/User Stories skeleton + per-epic story batches. **Status: partially implemented for Team-managed backlog workflow via module batch plan/result metadata and internal missing-module retry contract.**
8. Keep Jira creation disabled until backlog coverage gate passes. **Status: implemented for Team-managed backlog workflow.**
9. Add retry for missing/failed batches. **Status: partially implemented for generation job retries, story-test-case batches, and backlog internal missing-module retry; durable per-batch checkpoint retry remains pending.**
10. Add UI visibility only after backend metrics are stable. **Status: partially implemented; FE now renders progress, coverage, and batch summary when workflow output includes it.**

## Stream 4: User And Project Scoped Integration Settings

### Objective

Prevent cross-client or cross-user configuration leakage by making integration settings tenant-safe.

Today, Settings -> Integrations behaves like a shared workspace/admin configuration. That is convenient for a single-user or single-client setup, but it is risky for a scalable SaaS model:

- one registered user could generate Jira issues into another client's Jira project
- Confluence pages could be published into the wrong space
- document-processing behavior could unexpectedly change for other users
- future LLM/cache settings could be shared across clients when they should be isolated

The target model should allow admin defaults while ensuring every registered user and project can have its own effective configuration.

### Implementation Status As Of 2026-05-22

This stream has moved from plan to implementation for the core runtime path.

Implemented:

- Settings tables exist for workspace defaults, user settings, project overrides, environment settings, and effective config audit.
- RLS is enabled on the settings/config tables:
  - `qops_integration_settings`
  - `qops_user_integration_settings`
  - `qops_project_integration_overrides`
  - `qops_effective_config_audit`
  - `qops_environment_settings`
- User-settings policies exist for own/admin select and own insert/update.
- Project-override policies exist for project member select and owner/admin write.
- Runtime config resolution exists through `qops_resolve_runtime_config`.
- Config snapshot sanitization exists through `qops_sanitize_config_snapshot`.
- Workspace defaults, My Settings, and Project Override are represented in the Settings UI.
- The settings UI keeps Workspace defaults, My Settings, and Project Override as independent scopes.
- Generation and ingestion queue creators resolve effective config during job creation.
- `qa_jobs` and `doc_ingestion_jobs` persist `project_id`, `requested_by`, `settings_version`, and non-secret `config_snapshot`.
- Worker workflows read the stored job snapshot instead of reconstructing settings later.
- Recent generation and ingestion jobs contain non-null `settings_version` and non-empty `config_snapshot`.
- Metrics rows now carry project/user/settings attribution for recent ingestion and generation activity.
- Retry/reprocess flows preserve project/user/settings attribution.

Still pending:

- Run an explicit two-user/two-destination validation where User A and User B have different Jira/Confluence settings and confirm there is no cross-publish.
- Production RLS hardening for transactional tables such as `qa_jobs`, `doc_ingestion_jobs`, and `qa_job_metrics` remains separate from the settings-table RLS work.
- Secret handling should continue to be reviewed before production use so raw service credentials never reach frontend state, local storage, documentation, or job output.

### Recommended Precedence Model

Use deterministic config resolution:

```text
Project override
  -> User integration settings
  -> Workspace/admin default
  -> Application fallback defaults
```

Meaning:

- If a project has explicit Jira/Confluence/model/extractor settings, those win.
- If not, use the logged-in user's own integration settings.
- If the user has not configured anything, use admin/workspace defaults.
- If no admin defaults exist, use safe application defaults.

This gives the product flexibility without forcing every user to configure every field on day one.

### Settings That Must Become Scoped

Integration settings that should be user/project-aware:

- Jira base URL
- Jira project key
- Jira issue type mappings
- Jira Team-managed vs Company-managed detection result
- Jira Epic Link / Epic Name custom field IDs
- Jira test case issue type and link type
- Jira authentication credential reference
- Confluence base URL
- Confluence space key
- Confluence parent page strategy
- Confluence authentication credential reference
- LLM provider/model profile
- token/cost tracking profile
- document-processing extraction flags
- extractor endpoint and timeout where environment-specific
- cache policy and cache-read/write permissions

Do not store raw secrets in frontend state, local storage, or documentation.

### Data Model Recommendation

Use separate records for defaults, user settings, project overrides, and credentials.

Suggested logical tables:

```text
qops_integration_profiles
qops_user_integration_settings
qops_project_integration_overrides
qops_integration_credentials
qops_effective_config_audit
```

Recommended responsibilities:

- `qops_integration_profiles`
  - named reusable profiles such as "Default Jira", "Client A Confluence", "Sandbox Jira"
  - no raw secrets

- `qops_user_integration_settings`
  - owned by `user_id`
  - stores user-specific config JSON
  - references credential records by ID

- `qops_project_integration_overrides`
  - owned by `project_id`
  - optional overrides for Jira project key, Confluence space, extraction flags, cache policy, and model profile

- `qops_integration_credentials`
  - encrypted/secured secret references only
  - never returned to the frontend in raw form
  - scoped by owner user/workspace/project as needed

- `qops_effective_config_audit`
  - records which resolved config version was used by each job
  - useful for debugging and compliance

### Effective Config Snapshot

Every ingestion and generation job should store a resolved config snapshot.

The snapshot should include non-secret values only:

```json
{
  "resolvedForUserId": "...",
  "resolvedForProjectId": "...",
  "sourcePriority": ["project_override", "user_settings", "admin_default"],
  "jira": {
    "projectKey": "ABC",
    "projectStyle": "company_managed",
    "storyEpicLinkStrategy": "epic_link",
    "credentialRef": "jira_cred_..."
  },
  "confluence": {
    "spaceKey": "QA",
    "credentialRef": "conf_cred_..."
  },
  "microservices": {
    "extraction": {
      "extractTables": true,
      "extractAnnotations": true,
      "extractLinks": true,
      "detectRenderedPages": false,
      "renderPages": false
    }
  },
  "configVersion": 7
}
```

The snapshot should explicitly avoid:

- API tokens
- passwords
- Basic Auth strings
- bearer tokens
- service-role keys
- refresh tokens

### Frontend Changes

Settings -> Integrations should evolve from a single global form into scoped configuration.

Recommended UX:

- Scope selector:
  - `My settings`
  - `Project override`
  - `Workspace default` for admins only
- Clear indicator of effective config:
  - `Using project override`
  - `Using your settings`
  - `Using workspace default`
- Test connection buttons should test the selected scope only.
- Registered users should not see other users' credentials or secret values.
- Admin can provide defaults, but should not silently override a user's own settings unless explicitly chosen.

Create Knowledge Base and Generate Documents should continue receiving only the resolved config snapshot from the backend/API layer. They should not independently reconstruct integration precedence in the browser.

### n8n Changes

n8n workflows should not assume settings are global.

Required workflow adjustments:

1. Queue creator resolves effective config for the authenticated user and selected project.
2. Worker workflows consume the job's stored `configSnapshot`.
3. Jira and Confluence nodes use credential references or n8n credentials resolved for the correct user/project scope.
4. Metrics and audit events record `configVersion`, `settingsScope`, and non-secret destination identifiers.
5. Retry workflows reuse the original job's config snapshot unless the user explicitly requests retry with latest settings.

Important retry rule:

- Default retry should use the original snapshot for reproducibility.
- A separate "retry with latest settings" action can be added later.

### Supabase And Security Changes

This stream should include explicit Supabase security work:

- enable RLS on settings/profile tables before production
- ensure users can read/write only their own integration settings
- ensure project overrides are limited to project owners/admins
- ensure registered users can only resolve settings for assigned projects
- ensure service-role usage remains server-side/n8n-only
- never expose service-role keys to the frontend

Recommended RLS posture:

- frontend reads non-secret config summaries
- frontend writes scoped non-secret settings where allowed
- secret material is written through a server-side/API/n8n controlled path
- n8n uses service-role only for backend automation where required

### Impact On Cache

Integration scoping must be part of cache fingerprinting.

Cache keys should include:

- user/project access scope
- config version
- Jira project key
- Confluence space key
- model/profile version
- extraction flags
- prompt version
- source fingerprint

This prevents a generated output from Client A being reused for Client B just because the source text or prompt looks similar.

### Impact On Jira Scalability

Team-managed vs Company-managed project detection should be scoped to the configured Jira destination.

The resolver output should be stored per:

- Jira base URL
- Jira project key
- credential/account scope
- config version

This avoids applying one Jira instance's custom fields to another Jira instance.

### Acceptance Criteria

- Admin can save workspace defaults.
- Registered user can save their own Jira/Confluence/document-processing settings.
- Project owner/admin can save project-specific overrides.
- A generation job for User A cannot publish into User B's Jira/Confluence destination unless explicitly configured and authorized.
- Job output and metrics show which non-secret config version/scope was used.
- Retry uses the original config snapshot by default.
- No raw tokens or Basic Auth strings are stored in local storage, documentation, or job output.
- Existing single-user/admin workflows continue to work through workspace defaults.

### Rollout Strategy

1. Add DB tables and RLS for scoped settings. **Status: implemented for settings/config tables.**
2. Move current global settings into workspace/admin default. **Status: implemented.**
3. Add user-level settings UI. **Status: implemented.**
4. Add project override UI only after user settings are stable. **Status: implemented.**
5. Update queue creator to resolve effective config. **Status: implemented for ingestion and generation queue creators.**
6. Update job creation to persist non-secret config snapshots. **Status: implemented.**
7. Update n8n workers to trust job snapshots. **Status: implemented.**
8. Add audit events for config resolution. **Status: implemented through effective config audit records.**
9. Add tests for two users with different Jira/Confluence destinations. **Status: pending validation.**

## Cross-Stream Dependencies

### Scoped Settings Across All Streams

User/project scoped settings are foundational for the rest of Phase 2.

- Extractor flags must resolve from the effective project/user/workspace config.
- Cache fingerprints must include config scope and config version.
- Jira capability resolution must run against the correct user's or project's Jira destination.
- Confluence publishing must use the correct scoped destination.
- Metrics and audit events must record non-secret config scope so failures can be debugged without exposing credentials.

### Extractor and Cache

Advanced extraction changes source evidence, so cache fingerprint must include:

- extraction version
- extraction flags
- config version
- settings scope
- table/annotation/link inclusion
- rendered-page mode
- selected chunk IDs
- selected chunk text hash

If extraction logic changes, old generation cache entries should not be reused unless explicitly marked compatible.

### Extractor and Jira

Richer extraction improves Jira story/test-case quality by adding:

- tables as structured requirements
- comments/annotations as stakeholder notes
- links as external references
- speaker notes as hidden project context
- rendered visuals as UI/process evidence

Generation prompt profiles should eventually rank these content sources differently:

- tables: strong requirement/validation source
- annotations: stakeholder clarification source
- links: reference/supporting source
- vision: UI/diagram/source evidence

### Cache and Jira

Caching generated Jira outputs must be careful:

- Cached model output can be reused.
- Cached Jira issue keys should be verified before display/reuse.
- Jira creation must remain idempotent even when model output is cached.
- Retry should resume downstream creation instead of blindly reusing stale links.

### Coverage Ledger, Cache, and Jira

Coverage-aware generation changes how cache and Jira publishing should behave.

- Cache fingerprints must include coverage ledger hash, selected chunk IDs, prompt version, and generation mode.
- Partial batch cache can be reused only when the same ledger item and source evidence hash match.
- Jira issue creation should happen only after the backlog coverage gate passes.
- If a batch retry recovers missing stories, Jira should create/reuse only the recovered stories and should not touch already published issues unless output materially changed.
- Confluence pages should show consolidated coverage, including warnings for intentionally excluded or still-unmapped items.

### Coverage Ledger and Scoped Settings

Coverage generation must use the same effective config snapshot as the parent job.

- Retry should default to the original config snapshot.
- "Retry with latest settings" should be a separate explicit action.
- Batch logs should include settings version and non-secret model/retrieval config.
- Coverage metrics must remain scoped by project/user so one client's coverage plan cannot leak into another client's analytics.

## Proposed Phase-2 Timeline

### Milestone 1: Planning and Config

- Add documentation.
- Define feature flags.
- Define user/project scoped integration settings.
- Define effective config snapshot shape.
- Define schema migrations.
- Define n8n dry-run approach.

### Milestone 2: Safe Extractor Restore

- Restore tables/annotations/links only. **Status: implemented.**
- Update semantic content builder. **Status: implemented.**
- Add extractor warnings and observability. **Status: implemented.**
- Validate rich smoke dataset and mixed ingestion behavior. **Status: implemented for local smoke tests; continue regression testing before rendered image payloads.**

### Milestone 2B: Scoped Integration Settings

- Add settings tables and RLS. **Status: implemented for settings/config tables.**
- Migrate current global settings into workspace/admin defaults. **Status: implemented.**
- Add user-specific Integration Settings. **Status: implemented.**
- Add project override support. **Status: implemented.**
- Resolve effective config during job creation. **Status: implemented.**
- Persist non-secret config snapshots on jobs and metrics. **Status: implemented.**
- Validate two users with different Jira/Confluence destinations. **Status: pending validation.**

### Milestone 2C: Coverage-Aware Generation Planning

- Add coverage ledger generation in dry-run mode. **Status: partially implemented; RTM enforced, broader document dry-run still pending.**
- Add coverage metadata to metrics. **Status: partially implemented for RTM/generation metrics; generalized analytics display pending.**
- Add coverage gate for Traceability Matrix first. **Status: implemented.**
- Add RTM prerequisite gating and two-layer context snapshot. **Status: implemented.**
- Add deterministic RTM Story -> Test Case layer from persisted story-testcase mappings. **Status: implemented.**
- Add RTM output contract quality gate and Confluence table-safety hardening. **Status: implemented.**
- Add batched Traceability Matrix generation. **Status: partially implemented; true requirement batch generation and missing-batch retry pending.**
- Add batched Risk Matrix generation. **Status: pending.**
- Add planning-ledger checks for Test Strategy and Test Plan. **Status: pending.**
- Add Epics/User Stories skeleton and per-epic story batches. **Status: partially implemented for Team-managed backlog workflow via `document.batchPlan`, `document.batchResults`, `batchSummary`, and Confluence batch summary.**
- Add partial retry/recovery for failed or missing generation batches. **Status: partially implemented for generation retries, story-testcase batches, and backlog internal missing-module retry; pending for durable RTM requirement batches and other document types.**

### Milestone 3: Cache Foundation

- Add cache table.
- Add fingerprint builders.
- Add retry cache.
- Add vision cache.
- Add cache metrics.

### Milestone 4: Jira Capability Resolver

- Add read-only resolver.
- Store/cache resolver output.
- Show in admin diagnostics/settings.

### Milestone 5: Company-Managed Jira Branch

- Add IF branch.
- Add company-managed payload builder.
- Add dry-run validation.
- Test in Jira sandbox.

### Milestone 6: Advanced Visual Extraction

- Add rendered candidate detection.
- Persist and monitor rendered candidate counts.
- Measure candidate volume.
- Enable capped rendering.
- Move large visual payloads to storage references.

## Testing Matrix

### Extractor Tests

- PDF text only
- PDF with embedded images
- PDF with tables
- PDF with annotations
- PDF with links
- PDF with diagrams/render candidates
- DOCX with paragraphs
- DOCX with tables
- DOCX with comments
- DOCX with footnotes/endnotes
- DOCX with links
- PPTX with text
- PPTX with tables
- PPTX with speaker notes
- PPTX with links
- PPTX with charts/diagrams
- 12-document mixed batch

### Cache Tests

- first run cache miss
- repeated run cache hit
- retry after downstream failure reuses model output
- changed prompt version bypasses cache
- changed source chunks bypasses cache
- changed model bypasses cache
- expired cache bypasses cache
- invalidated cache bypasses cache
- unauthorized user cannot access cache
- cache cannot cross user/project/config scope
- cache bypasses when config version changes
- cache metrics recorded

### Jira Tests

- Team-managed epic creation
- Team-managed story creation with parent
- Team-managed test case creation/linking
- Company-managed project detection
- Company-managed Epic Link discovery
- Company-managed Epic Name discovery
- Company-managed epic creation
- Company-managed story creation with Epic Link
- Company-managed test case creation/linking
- missing Epic Link field fails before creation
- missing issue type fails before creation
- existing issues are reused by stable label
- partial downstream retry does not duplicate issues

### Scoped Settings Tests

- admin default settings work for existing single-user flows
- registered user can save and use their own settings
- project override wins over user settings
- user settings win over workspace defaults
- unresolved settings fall back to application defaults safely
- two registered users with different Jira projects do not cross-publish
- retry uses original config snapshot by default
- raw tokens are never returned to frontend responses or job output
- RLS blocks access to another user's integration settings

### Coverage-Aware Generation Tests

- coverage ledger is generated for Test Strategy, Test Plan, Risk Matrix, Traceability Matrix, and Epics/User Stories
- ledger uses only selected project evidence
- ledger records source chunk IDs and source document names
- Traceability Matrix covers every discovered requirement or records an exclusion reason. **Status: implemented as enforced gate for RTM ledger items; true batched requirement inventory still pending.**
- Traceability Matrix is blocked until completed Epics/User Stories and Story Test Cases exist. **Status: implemented.**
- Traceability Matrix Layer 2 lists actual generated story and test case keys from `qa_story_testcase_links`. **Status: implemented.**
- Traceability Matrix output avoids duplicate sections, invented Risk IDs/automation status, hardcoded model/vector metadata, test case ranges, and broken markdown table cells. **Status: implemented.**
- Risk Matrix includes at least one risk per critical module or records a no-risk rationale
- Test Strategy maps critical modules/NFRs to strategic test approach
- Test Plan maps in-scope modules to execution coverage
- Epics/User Stories generate per module/epic and do not publish to Jira before coverage gate passes
- Epics/User Stories module batching metadata is emitted through `document.batchPlan`, `document.batchResults`, returned `batchSummary`, and UI progress/coverage strips. **Status: implemented for Team-managed backlog workflow `Vwc6c8ehsRTF8svG` on 2026-06-01.**
- missing batch retry creates only missing outputs. **Status: implemented as an internal model retry contract for missing/partial modules in the Team-managed backlog workflow; true multi-execution batch checkpoint retry remains a future hardening item.**
- failed batch retry preserves already successful batches. **Status: planned for future hard checkpointing; current implementation preserves final merged output and reports batch-level recovered/missing state.**
- recovered generation job shows recovered status and links to original failed attempt
- coverage metrics include ledger count, covered count, uncovered count, batch count, retry count, and generation mode. **Status: implemented for FE display and Team-managed backlog result contract.**
- cache fingerprints change when coverage ledger or selected source chunks change

## Operational Safeguards

### Responsive UI Standard For Future Work

All future UI changes should follow a mobile-first responsive standard:

- avoid fixed pixel widths/heights for app surfaces, tables, drawers, modals, cards, and page-level layout
- prefer fluid grid/flex layouts using relative sizing such as `%`, `rem`, `dvh`, `minmax()`, `auto-fit`, and responsive Tailwind breakpoints
- use stable dimensions only for small controls/icons where visual consistency requires it
- data-heavy tables must either stack into cards/lists on small screens or remain inside an intentional internal scroll region
- long project names, artifact IDs, job IDs, URLs, and generated titles must wrap with safe overflow handling
- modals and drawers must fit the viewport with internal scrolling and no body-level horizontal scroll
- every changed screen should be checked at phone, tablet, and desktop widths before completion

### Kill Switches

Add config-level kill switches:

- disable advanced extractor
- disable rendered pages
- disable cache reads
- disable cache writes
- disable Company-managed Jira creation
- enable Jira dry-run mode
- disable project overrides
- force workspace defaults only

### Monitoring

Track:

- extraction duration
- extractor response size
- n8n execution duration
- n8n memory symptoms/timeouts
- image candidate counts
- rendered page counts
- cache hit rate
- cache bypass reasons
- config scope used per job
- config resolution failures
- tokens saved estimate
- Jira created vs reused counts
- Jira capability failures

### Rollback

Each stream should be independently rollbackable:

- extractor feature flags can disable advanced fields
- cache can be bypassed while still writing normal jobs
- Jira Company-managed branch can be disabled while Team-managed continues
- project/user scoped settings can fall back to workspace defaults

## Final Recommendation

Do not implement all three streams at once.

Recommended order:

1. Restore safe text-rich extractor fields. **Implemented.**
2. Add extractor flags, semantic content, observability, warnings, and render-candidate detection. **Implemented with rendered images disabled.**
3. Add user/project scoped integration settings and effective config snapshots. **Implemented; two-user/two-destination validation still pending.**
4. Add coverage-aware generation planning in dry-run mode. **Partially implemented; RTM enforced path exists, generalized dry-run planning still pending.**
5. Add batched Traceability Matrix generation and recovery. **Partially implemented; RTM prerequisite gate, output contract, deterministic Layer 2, metrics, and audit are implemented; true requirement batching and missing-batch retry are pending.**
6. Add batched Risk Matrix generation and coverage gate.
7. Add coverage-ledger checks for Test Strategy and Test Plan.
8. Add Epics/User Stories skeleton + per-epic story batching before Jira creation. **Partially implemented; Team-managed backlog workflow now requires batched planning, internal missing-module retry, Confluence batch summary, and returned progress metadata before Jira publish. True durable per-batch checkpoint/retry can be added later if needed.**
9. Add retry cache and vision cache.
10. Add Jira capability resolver in read-only mode.
11. Add Company-managed Jira branch in dry-run mode.
12. Add capped rendered-page extraction with external storage references.

This order gives the project better document intelligence, stronger requirement coverage, lower token cost, and broader Jira compatibility while preserving the stability achieved in the current E2E implementation.
