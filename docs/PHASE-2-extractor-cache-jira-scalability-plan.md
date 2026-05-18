# PHASE-2: Extractor, LLM Cache, and Jira Scalability Plan

Generated on: 2026-05-15

This plan captures the Phase-2 implementation strategy for three major capability gaps in Q-Ops Agent:

1. Reintroducing advanced document extraction safely.
2. Enabling LLM/model-output caching to reduce token consumption.
3. Supporting both Team-managed and Company-managed Jira projects.

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

### Current Extractor Mode

The current extractor is intentionally conservative:

- `extract_images_v2/extractors/pdf_extractor.py`
  - text
  - embedded images
  - no tables
  - no annotations
  - no links
  - no rendered pages

- `extract_images_v2/extractors/docx_extractor.py`
  - paragraph text
  - embedded images
  - no tables
  - no comments
  - no footnotes/endnotes
  - no links
  - no rendered pages

- `extract_images_v2/extractors/pptx_extractor.py`
  - slide text
  - embedded images
  - no tables
  - no speaker notes
  - no links
  - no rendered slides

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

## Cross-Stream Dependencies

### Extractor and Cache

Advanced extraction changes source evidence, so cache fingerprint must include:

- extraction version
- extraction flags
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

## Proposed Phase-2 Timeline

### Milestone 1: Planning and Config

- Add documentation.
- Define feature flags.
- Define schema migrations.
- Define n8n dry-run approach.

### Milestone 2: Safe Extractor Restore

- Restore tables/annotations/links only.
- Update semantic content builder.
- Validate 12-document ingestion batch.

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

## Operational Safeguards

### Kill Switches

Add config-level kill switches:

- disable advanced extractor
- disable rendered pages
- disable cache reads
- disable cache writes
- disable Company-managed Jira creation
- enable Jira dry-run mode

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
- tokens saved estimate
- Jira created vs reused counts
- Jira capability failures

### Rollback

Each stream should be independently rollbackable:

- extractor feature flags can disable advanced fields
- cache can be bypassed while still writing normal jobs
- Jira Company-managed branch can be disabled while Team-managed continues

## Final Recommendation

Do not implement all three streams at once.

Recommended order:

1. Restore safe text-rich extractor fields.
2. Add retry cache and vision cache.
3. Add Jira capability resolver in read-only mode.
4. Add Company-managed Jira branch in dry-run mode.
5. Add rendered-page detection.
6. Add capped rendered-page extraction with external storage references.

This order gives the project better document intelligence, lower token cost, and broader Jira compatibility while preserving the stability achieved in the current E2E implementation.
