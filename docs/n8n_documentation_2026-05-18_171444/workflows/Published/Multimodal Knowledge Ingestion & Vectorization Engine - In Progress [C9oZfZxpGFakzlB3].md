# Multimodal Knowledge Ingestion & Vectorization Engine - In Progress

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | C9oZfZxpGFakzlB3 |
| Active | True |
| Archived | False |
| Created At | 2026-05-13T09:17:05.310Z |
| Updated At | 2026-05-15T04:08:04.437Z |
| Node Count | 35 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\Multimodal Knowledge Ingestion & Vectorization Engine - In Progress [C9oZfZxpGFakzlB3].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- When Executed by Another Workflow | n8n-nodes-base.executeWorkflowTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.documentDefaultDataLoader | 1 |
| @n8n/n8n-nodes-langchain.embeddingsOpenAi | 1 |
| @n8n/n8n-nodes-langchain.openAi | 1 |
| @n8n/n8n-nodes-langchain.textSplitterTokenSplitter | 1 |
| @n8n/n8n-nodes-langchain.vectorStoreChromaDB | 1 |
| n8n-nodes-base.code | 12 |
| n8n-nodes-base.executeWorkflowTrigger | 1 |
| n8n-nodes-base.httpRequest | 6 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.merge | 1 |
| n8n-nodes-base.set | 2 |
| n8n-nodes-base.splitInBatches | 2 |
| n8n-nodes-base.stickyNote | 5 |

## Credentials Referenced

- chromaCloudApi: ChromaDB Self-Hosted account
- httpCustomAuth: supabase-anon-key
- httpCustomAuth: supabase-service-role-key
- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- http://127.0.0.1:8001/process-document-v2
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs?job_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?id=eq.{{

### Supabase/Data Table Hints

- doc_ingestion_jobs
- doc_ingestion_queuecreator_logs
- qa_job_metrics
- qops_projects

## Connection Graph

- Rename Binary File Keys -> Extract Text + Image (source output 0, target input 0)
- Chunking Raw Data -> Store Chunks in Batches (source output 0, target input 0)
- Chunking Raw Data -> Merge (source output 0, target input 0)
- Extract Text + Image -> Has Images? (source output 0, target input 0)
- Split images for Vision Extraction -> Guard: Max Image Limit (source output 0, target input 0)
- Extract Vision Response -> Batch Images for Vision (source output 0, target input 0)
- Rebuild Document With Vision Extracted Text -> Build Semantic Content (source output 0, target input 0)
- Build Semantic Content -> Clean Emojis, # etc (source output 0, target input 0)
- Build Semantic Content -> Update Job Status as Failed (source output 1, target input 0)
- Vision Extraction -> Extract Vision Response (source output 0, target input 0)
- Vision Extraction -> Handle Vision Errors (source output 1, target input 0)
- Clean Emojis, # etc -> Chunking Raw Data (source output 0, target input 0)
- Chroma Vector Store -> Store Chunks in Batches (source output 0, target input 0)
- Embeddings OpenAI -> Chroma Vector Store (source output 0, target input 0)
- Default Data Loader -> Chroma Vector Store (source output 0, target input 0)
- Default Data Loader -> Handle Data Loader Errors (source output 0, target input 0)
- Token Splitter -> Default Data Loader (source output 0, target input 0)
- Prepare Vision Payload -> Vision Extraction (source output 0, target input 0)
- Batch Images for Vision -> Rebuild Document With Vision Extracted Text (source output 0, target input 0)
- Batch Images for Vision -> Prepare Vision Payload (source output 1, target input 0)
- Fix Data Format -> Chroma Vector Store (source output 0, target input 0)
- Handle Vision Errors -> Update Job Status as Failed (source output 0, target input 0)
- Store Chunks in Batches -> Count Stored Chunks (source output 0, target input 0)
- Store Chunks in Batches -> Fix Data Format (source output 1, target input 0)
- When Executed by Another Workflow -> Rename Binary File Keys (source output 0, target input 0)
- Update Job Status as Completed -> Update Project Status as Ready (source output 0, target input 0)
- Update Job Status as Completed -> LOG (source output 0, target input 0)
- Merge -> Update Job Status as Completed (source output 0, target input 0)
- Count Stored Chunks -> Merge (source output 0, target input 1)
- LOG -> LOG: Job Completed (source output 0, target input 0)
- Guard: Max Image Limit -> Batch Images for Vision (source output 0, target input 0)
- LOG: Job Completed -> Store LOGS in Supabase (source output 0, target input 0)
- Has Images? -> Split images for Vision Extraction (source output 0, target input 0)
- Has Images? -> Build Semantic Content (source output 1, target input 0)

## Nodes

### Batch Images for Vision

| Field | Value |
| --- | --- |
| Node ID | de1490a2-3e3c-4a05-b1fc-b911e14ba8db |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -2784, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Extract Vision Response -> Batch Images for Vision (output 0, input 0)
- Guard: Max Image Limit -> Batch Images for Vision (output 0, input 0)

**Outgoing Connections**

- Batch Images for Vision -> Rebuild Document With Vision Extracted Text (output 0, input 0)
- Batch Images for Vision -> Prepare Vision Payload (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "batchSize":  "={{ $json.visionBatchSize || $json.configSnapshot?.microservices?.vision?.batchSize || 5 }}",
    "options":  {

                }
}
```

### Build Semantic Content

| Field | Value |
| --- | --- |
| Node ID | 922d58aa-defd-41ac-9c4b-37881c853567 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1456, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rebuild Document With Vision Extracted Text -> Build Semantic Content (output 0, input 0)
- Has Images? -> Build Semantic Content (output 1, input 0)

**Outgoing Connections**

- Build Semantic Content -> Clean Emojis, # etc (output 0, input 0)
- Build Semantic Content -> Update Job Status as Failed (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map(item =\u003e {\n  const d = item.json;\n\n  const safeText = value =\u003e String(value ?? \u0027\u0027).trim();\n  const asArray = value =\u003e Array.isArray(value) ? value : [];\n\n  const tables = asArray(d.tables).filter(table =\u003e safeText(table.markdown || table.text));\n  const images = asArray(d.images);\n  const annotations = asArray(d.annotations).filter(annotation =\u003e\n    safeText(annotation.content || annotation.title || annotation.subject)\n  );\n  const links = asArray(d.links).filter(link =\u003e safeText(link.uri) || safeText(link.targetPage));\n  const warnings = asArray(d.warnings).filter(warning =\u003e safeText(warning));\n  const extractionStats = d.extractionStats || {};\n\n  const visualCandidatesDetected = Number(d.visualCandidatesDetected ?? extractionStats.visualCandidatesDetected ?? images.length) || 0;\n  const processedVisualCandidates = Number(d.processedImagesInJob ?? d.documentProcessedImageCount ?? images.filter(img =\u003e img.imageDescription).length) || 0;\n  const deferredVisualCandidates = Number(d.deferredImagesInJob ?? d.documentDeferredImageCount ?? Math.max(0, visualCandidatesDetected - processedVisualCandidates)) || 0;\n\n  let combined = \u0027\u0027;\n\n  combined += `Project Name: ${d.projectName}\\n`;\n  combined += `Document Name: ${d.fileName}\\n`;\n  combined += `Document Type: ${d.fileType}\\n\\n`;\n\n  if (d.rawText \u0026\u0026 d.rawText.trim().length \u003e 0) {\n    combined += \u0027===== DOCUMENT TEXT =====\\n\u0027;\n    combined += d.rawText.trim() + \u0027\\n\\n\u0027;\n  }\n\n  if (visualCandidatesDetected \u003e 0) {\n    combined += \u0027===== VISUAL PROCESSING SUMMARY =====\\n\\n\u0027;\n    combined += `Detected Visual Candidates: ${visualCandidatesDetected}\\n`;\n    combined += `Processed Through Vision: ${processedVisualCandidates}\\n`;\n    combined += `Deferred Visual Candidates: ${deferredVisualCandidates}\\n`;\n    combined += `Vision Max Images Per Job: ${safeText(d.visionMaxImagesPerJob) || \u0027n/a\u0027}\\n`;\n    combined += `Vision Batch Size: ${safeText(d.visionBatchSize) || \u0027n/a\u0027}\\n`;\n    combined += `Render DPI: ${safeText(d.visionConfigApplied?.renderDpi || extractionStats.renderDpi) || \u0027n/a\u0027}\\n\\n`;\n  }\n\n  if (tables.length \u003e 0) {\n    combined += \u0027===== STRUCTURED TABLES =====\\n\\n\u0027;\n\n    for (const table of tables) {\n      combined += `--- TABLE CONTEXT START ---\\n`;\n      combined += `Table ID: ${safeText(table.tableId) || \u0027unknown\u0027}\\n`;\n      combined += `Page Number: ${safeText(table.pageNumber) || \u0027unknown\u0027}\\n`;\n      combined += `Row Count: ${safeText(table.rowCount) || \u0027unknown\u0027}\\n`;\n      combined += `Column Count: ${safeText(table.columnCount) || \u0027unknown\u0027}\\n`;\n      combined += `Source: ${safeText(table.source) || \u0027table\u0027}\\n\\n`;\n\n      if (safeText(table.markdown)) {\n        combined += \u0027Table Content (Markdown):\\n\u0027;\n        combined += safeText(table.markdown) + \u0027\\n\\n\u0027;\n      }\n\n      if (safeText(table.text)) {\n        combined += \u0027Table Content (Plain Text):\\n\u0027;\n        combined += safeText(table.text) + \u0027\\n\\n\u0027;\n      }\n\n      combined += `--- TABLE CONTEXT END ---\\n\\n`;\n    }\n  }\n\n  if (images.length \u003e 0) {\n    const validImages = images.filter(img =\u003e img.imageDescription);\n\n    if (validImages.length \u003e 0) {\n      combined += \u0027===== IMAGE-DERIVED INSIGHTS =====\\n\\n\u0027;\n\n      for (const img of validImages) {\n        const visualReason = asArray(img.visualReason).filter(Boolean).join(\u0027, \u0027);\n        combined += `--- IMAGE CONTEXT START ---\\n`;\n        combined += `Image Name: ${img.imageFileName || img.fileName}\\n`;\n        combined += `Image ID: ${img.imageId}\\n`;\n        combined += `Page Number: ${safeText(img.pageNumber) || \u0027unknown\u0027}\\n`;\n        combined += `Image Source: ${safeText(img.imageSource) || \u0027unknown\u0027}\\n`;\n        combined += `Visual Reason: ${visualReason || \u0027n/a\u0027}\\n`;\n        combined += `Visual Locator: ${safeText(img.visualLocator) || \u0027n/a\u0027}\\n`;\n        combined += `Priority Score: ${safeText(img.priorityScore) || \u00270\u0027}\\n`;\n        combined += `Priority Class: ${safeText(img.priorityClass) || \u0027n/a\u0027}\\n\\n`;\n        combined += `Extracted Insights:\\n`;\n        combined += img.imageDescription + \u0027\\n\\n\u0027;\n        combined += `--- IMAGE CONTEXT END ---\\n\\n`;\n      }\n    }\n  }\n\n  if (annotations.length \u003e 0) {\n    combined += \u0027===== ANNOTATIONS AND COMMENTS =====\\n\\n\u0027;\n\n    for (const annotation of annotations) {\n      combined += `--- ANNOTATION CONTEXT START ---\\n`;\n      combined += `Annotation ID: ${safeText(annotation.annotationId) || \u0027unknown\u0027}\\n`;\n      combined += `Type: ${safeText(annotation.type) || \u0027annotation\u0027}\\n`;\n      combined += `Page Number: ${safeText(annotation.pageNumber) || \u0027unknown\u0027}\\n`;\n      combined += `Title: ${safeText(annotation.title) || \u0027n/a\u0027}\\n`;\n      combined += `Subject: ${safeText(annotation.subject) || \u0027n/a\u0027}\\n`;\n      combined += `Source: ${safeText(annotation.source) || \u0027annotation\u0027}\\n\\n`;\n      combined += \u0027Annotation Content:\\n\u0027;\n      combined += safeText(annotation.content) + \u0027\\n\\n\u0027;\n      combined += `--- ANNOTATION CONTEXT END ---\\n\\n`;\n    }\n  }\n\n  if (links.length \u003e 0) {\n    combined += \u0027===== LINKS AND CROSS REFERENCES =====\\n\\n\u0027;\n\n    for (const link of links) {\n      combined += `--- LINK CONTEXT START ---\\n`;\n      combined += `Link ID: ${safeText(link.linkId) || \u0027unknown\u0027}\\n`;\n      combined += `Page Number: ${safeText(link.pageNumber) || \u0027unknown\u0027}\\n`;\n      combined += `URI: ${safeText(link.uri) || \u0027n/a\u0027}\\n`;\n      combined += `Target Page: ${safeText(link.targetPage) || \u0027n/a\u0027}\\n`;\n      combined += `Kind: ${safeText(link.kind) || \u0027n/a\u0027}\\n`;\n      combined += `Source: ${safeText(link.source) || \u0027link\u0027}\\n`;\n      combined += `--- LINK CONTEXT END ---\\n\\n`;\n    }\n  }\n\n  if (warnings.length \u003e 0) {\n    combined += \u0027===== EXTRACTION WARNINGS =====\\n\\n\u0027;\n    for (const warning of warnings) {\n      combined += `Warning: ${warning}\\n`;\n    }\n    combined += \u0027\\n\u0027;\n  }\n\n  return {\n    json: {\n      projectName: d.projectName,\n      status: d.status,\n      jobId: d.jobId,\n      fileName: d.fileName,\n      fileType: d.fileType,\n      pageCount: d.pageCount,\n      docType: d.docType,\n      documentId: d.documentId,\n      contentMode: d.contentMode,\n      containsText: d.containsText,\n      containsImages: d.containsImages,\n      semanticContent: combined.trim(),\n      visionTokensInput: Number(d.visionTokensInput) || 0,\n      visionTokensOutput: Number(d.visionTokensOutput) || 0,\n      visionTokensTotal: Number(d.visionTokensTotal) || 0,\n      visionCostUsd: Number(d.visionCostUsd) || 0,\n      visionUsageEstimated: Boolean(d.visionUsageEstimated),\n      tables,\n      annotations,\n      links,\n      images,\n      warnings,\n      extractionStats,\n      visionConfigApplied: d.visionConfigApplied || {},\n      tableCount: tables.length,\n      annotationCount: annotations.length,\n      linkCount: links.length,\n      warningCount: warnings.length,\n      renderedPageCount: images.filter(img =\u003e safeText(img.imageSource) === \u0027rendered-page\u0027).length,\n      embeddedImageCount: images.filter(img =\u003e safeText(img.imageSource) === \u0027embedded-image\u0027).length,\n      standaloneImageCount: images.filter(img =\u003e safeText(img.imageSource) === \u0027standalone-image\u0027).length,\n      visualCandidatesDetected,\n      processedImagesInJob: processedVisualCandidates,\n      deferredImagesInJob: deferredVisualCandidates,\n      documentProcessedImageCount: Number(d.documentProcessedImageCount) || images.filter(img =\u003e img.imageDescription).length,\n      documentDeferredImageCount: Number(d.documentDeferredImageCount) || Math.max(0, images.length - images.filter(img =\u003e img.imageDescription).length),\n      visionMaxImagesPerJob: Number(d.visionMaxImagesPerJob) || null,\n      visionBatchSize: Number(d.visionBatchSize) || null,\n      projectId: d.projectId || $(\u0027When Executed by Another Workflow\u0027).first().json.projectId || $(\u0027When Executed by Another Workflow\u0027).first().json.project_id || null,\n      requestedBy: d.requestedBy || $(\u0027When Executed by Another Workflow\u0027).first().json.requestedBy || $(\u0027When Executed by Another Workflow\u0027).first().json.requested_by || null,\n      settingsVersion: d.settingsVersion || $(\u0027When Executed by Another Workflow\u0027).first().json.settingsVersion || $(\u0027When Executed by Another Workflow\u0027).first().json.settings_version || null,\n      configSnapshot: d.configSnapshot || $(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot || {},\n      environmentKey: (d.configSnapshot || $(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot || {}).environment?.key || d.environment || \u0027local\u0027\n    }\n  };\n});"
}
```

### Chroma Vector Store

| Field | Value |
| --- | --- |
| Node ID | 78f96822-bedc-425a-bac3-449b08ab8519 |
| Type | @n8n/n8n-nodes-langchain.vectorStoreChromaDB |
| Type Version | 1.3 |
| Position | -256, 464 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Embeddings OpenAI -> Chroma Vector Store (output 0, input 0)
- Default Data Loader -> Chroma Vector Store (output 0, input 0)
- Fix Data Format -> Chroma Vector Store (output 0, input 0)

**Outgoing Connections**

- Chroma Vector Store -> Store Chunks in Batches (output 0, input 0)

**Credential References**

```json
{
    "chromaCloudApi":  {
                           "id":  "vFAjhz7sZ0XQGaUU",
                           "name":  "ChromaDB Self-Hosted account"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "mode":  "insert",
    "authentication":  "chromaCloudApi",
    "chromaCollection":  {
                             "__rl":  true,
                             "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.chroma?.collection || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027 }}",
                             "mode":  "id",
                             "cachedResultName":  "runtime-configured collection"
                         },
    "options":  {

                }
}
```

### Chunking Raw Data

| Field | Value |
| --- | --- |
| Node ID | 0797f686-20cb-4b0d-82d9-627726efba8f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -976, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Clean Emojis, # etc -> Chunking Raw Data (output 0, input 0)

**Outgoing Connections**

- Chunking Raw Data -> Store Chunks in Batches (output 0, input 0)
- Chunking Raw Data -> Merge (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().flatMap(item =\u003e {\n  const data = item.json;\n  const chunks = [];\n\n  if (!data.semanticContent || typeof data.semanticContent !== \"string\") return [];\n\n  const text = data.semanticContent\n    .replace(/Project Name:.*\\n/, \"\")\n    .replace(/Document Name:.*\\n/, \"\")\n    .replace(/Document Type:.*\\n/, \"\")\n    .replace(/Source Format:.*\\n/, \"\");\n\n  const lines = text.split(/\\n/g).map(l =\u003e l.trim()).filter(l =\u003e l);\n\n  let currentSection = [];\n  let sectionIndex = 0;\n  let sectionTitle = \"\";\n\n  const chunkSize = 10000;\n  const overlap = 2000;\n  const minChunkSize = 200;\n\n  const headingRegex = /^(\\d+(\\.\\d+)*\\s+.*|[A-Z]{1,3}-\\d+\\s+.*|[A-Z][A-Za-z\\s]{3,50}:?)$/;\n\n  const safeString = value =\u003e String(value ?? \u0027\u0027).trim();\n  const metadataText = value =\u003e safeString(value).replace(/\\s+/g, \u0027 \u0027).slice(0, 500);\n  const metadataNumber = value =\u003e {\n    const number = Number(value);\n    return Number.isFinite(number) ? number : 0;\n  };\n  const normalizeDocType = value =\u003e {\n    const text = safeString(value).toUpperCase().replace(/[^A-Z0-9]+/g, \u0027_\u0027).replace(/^_+|_+$/g, \u0027\u0027);\n    return text || \u0027UNKNOWN\u0027;\n  };\n\n  function extractLabelValues(label, input) {\n    const values = [];\n    const regex = new RegExp(`${label}:\\\\s*(.+)`, \u0027ig\u0027);\n    let match;\n    while ((match = regex.exec(input)) !== null) {\n      const value = safeString(match[1]);\n      if (value \u0026\u0026 value.toLowerCase() !== \u0027n/a\u0027 \u0026\u0026 !values.includes(value)) {\n        values.push(value);\n      }\n    }\n    return values;\n  }\n\n  function extractImageId(chunkText) {\n    return extractLabelValues(\u0027Image ID\u0027, chunkText)[0] || null;\n  }\n\n  function detectStructuralType(sectionText) {\n    if (/TABLE CONTEXT START/i.test(sectionText)) return \u0027table_context\u0027;\n    if (/ANNOTATION CONTEXT START/i.test(sectionText)) return \u0027annotation_context\u0027;\n    if (/LINK CONTEXT START/i.test(sectionText)) return \u0027link_context\u0027;\n    if (/IMAGE CONTEXT START/i.test(sectionText)) return \u0027image_context\u0027;\n    return \u0027logical_section\u0027;\n  }\n\n  function detectContentSource(sectionText, imageId) {\n    const structuralType = detectStructuralType(sectionText);\n    const mode = safeString(data.contentMode).toLowerCase();\n    if (structuralType === \u0027table_context\u0027) return \u0027table\u0027;\n    if (structuralType === \u0027annotation_context\u0027) return \u0027annotation\u0027;\n    if (structuralType === \u0027link_context\u0027) return \u0027link\u0027;\n    if (structuralType === \u0027image_context\u0027) return \u0027image\u0027;\n    if (mode === \u0027image-only\u0027) return \u0027image\u0027;\n    if (mode === \u0027hybrid\u0027 \u0026\u0026 imageId) return \u0027image\u0027;\n    return \u0027text\u0027;\n  }\n\n  function buildMetadata(sectionText, chunkText, chunkIndex) {\n    const imageId = extractImageId(chunkText);\n    const contentSource = detectContentSource(chunkText, imageId);\n    const structuralType = detectStructuralType(chunkText);\n    const docType = normalizeDocType(data.docType || \u0027UNKNOWN\u0027);\n    const project = data.projectName || \u0027unknown\u0027;\n    const fileName = data.fileName || data.filename || \u0027unknown\u0027;\n    const sourceFormat = data.sourceFormat || data.fileType || \u0027unknown\u0027;\n    const compositeKey = `${project}|${docType}|${contentSource}`;\n    const chunkId = [\n      data.documentId || fileName,\n      sectionIndex,\n      chunkIndex,\n      contentSource,\n    ].map(value =\u003e safeString(value).replace(/[^A-Za-z0-9_-]+/g, \u0027-\u0027)).join(\u0027|\u0027);\n\n    const pageReferences = [\n      ...extractLabelValues(\u0027Page Number\u0027, chunkText),\n      ...extractLabelValues(\u0027Target Page\u0027, chunkText),\n    ].filter((value, index, array) =\u003e value \u0026\u0026 array.indexOf(value) === index);\n    const tableIds = extractLabelValues(\u0027Table ID\u0027, chunkText);\n    const annotationIds = extractLabelValues(\u0027Annotation ID\u0027, chunkText);\n    const linkIds = extractLabelValues(\u0027Link ID\u0027, chunkText);\n    const linkUris = extractLabelValues(\u0027URI\u0027, chunkText);\n    const imageSources = extractLabelValues(\u0027Image Source\u0027, chunkText);\n    const visualReasons = extractLabelValues(\u0027Visual Reason\u0027, chunkText);\n    const visualLocators = extractLabelValues(\u0027Visual Locator\u0027, chunkText);\n\n    return {\n      project,\n      projectId: data.projectId || null,\n      requestedBy: data.requestedBy || null,\n      settingsVersion: data.settingsVersion || null,\n      environment: data.environmentKey || \u0027local\u0027,\n      chromaCollection: data.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027,\n\n      jobId: data.jobId || null,\n      status: data.status || null,\n      documentId: data.documentId || \u0027unknown\u0027,\n      docType,\n      documentTypeOriginal: metadataText(data.documentTypeOriginal || \u0027\u0027),\n      documentCategory: data.documentCategory || \u0027unclassified\u0027,\n      artifactType: data.artifactType || \u0027unclassified_document\u0027,\n      metadataConfidence: metadataNumber(data.metadataConfidence),\n      metadataSource: data.metadataSource || \u0027fallback_unknown\u0027,\n\n      fileName,\n      filename: fileName,\n      fileType: data.fileType || \u0027unknown\u0027,\n      sourceFormat,\n      pageCount: metadataNumber(data.pageCount),\n\n      contentMode: data.contentMode || \u0027unknown\u0027,\n      containsImages: Boolean(data.containsImages),\n      containsText: Boolean(data.containsText),\n      hasVisionContent: /IMAGE-DERIVED INSIGHTS|IMAGE CONTEXT START|Extracted Insights:/i.test(sectionText),\n\n      sectionTitle: sectionTitle || `Section ${sectionIndex}`,\n      sectionIndex,\n      structuralType,\n      chunkIndex,\n      chunkId,\n\n      imageId: imageId || null,\n      contentSource,\n      compositeKey,\n      sectionPageReferences: metadataText(pageReferences.join(\u0027, \u0027)),\n      tableIds: metadataText(tableIds.join(\u0027, \u0027)),\n      annotationIds: metadataText(annotationIds.join(\u0027, \u0027)),\n      linkIds: metadataText(linkIds.join(\u0027, \u0027)),\n      linkUris: metadataText(linkUris.join(\u0027, \u0027)),\n      imageSources: metadataText(imageSources.join(\u0027, \u0027)),\n      visualReasons: metadataText(visualReasons.join(\u0027, \u0027)),\n      visualLocators: metadataText(visualLocators.join(\u0027, \u0027)),\n      tableCount: metadataNumber(data.tableCount ?? data.tables?.length),\n      annotationCount: metadataNumber(data.annotationCount ?? data.annotations?.length),\n      linkCount: metadataNumber(data.linkCount ?? data.links?.length),\n      warningCount: metadataNumber(data.warningCount ?? data.warnings?.length),\n      renderedPageCount: metadataNumber(data.renderedPageCount),\n      embeddedImageCount: metadataNumber(data.embeddedImageCount),\n      standaloneImageCount: metadataNumber(data.standaloneImageCount),\n      visualCandidateCount: metadataNumber(data.visualCandidatesDetected ?? data.extractionStats?.visualCandidatesDetected),\n      visionProcessedCount: metadataNumber(data.processedImagesInJob),\n      visionDeferredCount: metadataNumber(data.deferredImagesInJob),\n      visionMaxImagesPerJob: metadataNumber(data.visionMaxImagesPerJob),\n      visionBatchSize: metadataNumber(data.visionBatchSize),\n      renderDpi: metadataNumber(data.visionConfigApplied?.renderDpi ?? data.extractionStats?.renderDpi),\n    };\n  }\n\n  function buildChunks(sectionText) {\n    const result = [];\n\n    if (sectionText.length \u003c= chunkSize) {\n      if (sectionText.trim().length \u003e= minChunkSize) {\n        result.push({\n          json: {\n            pageContent: sectionText,\n            metadata: buildMetadata(sectionText, sectionText, 0),\n          },\n        });\n      }\n      return result;\n    }\n\n    for (let i = 0; i \u003c sectionText.length; i += (chunkSize - overlap)) {\n      const chunkText = sectionText.slice(i, i + chunkSize);\n      if (chunkText.trim().length \u003c minChunkSize) break;\n\n      const chunkIndex = Math.floor(i / (chunkSize - overlap));\n      result.push({\n        json: {\n          pageContent: chunkText,\n          metadata: buildMetadata(sectionText, chunkText, chunkIndex),\n        },\n      });\n    }\n\n    return result;\n  }\n\n  lines.forEach(line =\u003e {\n    if (headingRegex.test(line)) {\n      if (currentSection.length) {\n        const sectionText = currentSection.join(\u0027\\n\u0027).trim();\n        if (sectionText) chunks.push(...buildChunks(sectionText));\n      }\n      sectionIndex++;\n      sectionTitle = line;\n      currentSection = [line];\n    } else {\n      currentSection.push(line);\n    }\n  });\n\n  if (currentSection.length) {\n    const sectionText = currentSection.join(\u0027\\n\u0027).trim();\n    if (sectionText) chunks.push(...buildChunks(sectionText));\n  }\n\n  return chunks;\n});"
}
```

### Clean Emojis, # etc

| Field | Value |
| --- | --- |
| Node ID | 5799eafc-0e86-4433-9bb9-1872e0d0733e |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1232, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Semantic Content -> Clean Emojis, # etc (output 0, input 0)

**Outgoing Connections**

- Clean Emojis, # etc -> Chunking Raw Data (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map(item =\u003e {\n\n  let text = item.json.semanticContent || \"\";\n\n  // 1ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ Remove markdown headers (###, ##, #)\n  text = text.replace(/^#{1,6}\\s+/gm, \"\");\n\n  // 2ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ Remove separator lines like ===== or -----\n  text = text.replace(/^[=\\-]{3,}$/gm, \"\");\n\n  // 3ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ Remove emojis (basic unicode emoji ranges)\n  text = text.replace(\n    /[\\u{1F300}-\\u{1FAFF}]/gu,\n    \"\"\n  );\n\n  // 4ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ Remove markdown bullets (*, -, + at line start)\n  text = text.replace(/^[\\*\\-\\+]\\s+/gm, \"\");\n\n  // 5ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ Remove excessive line breaks (more than 2)\n  text = text.replace(/\\n{3,}/g, \"\\n\\n\");\n\n  // 6ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ Trim extra spaces\n  text = text.replace(/[ \\t]{2,}/g, \" \");\n\n  // 7ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ Final trim\n  text = text.trim();\n\n  return {\n    json: {\n      ...item.json,\n      semanticContent: text\n    }\n  };\n});\n"
}
```

### Count Stored Chunks

| Field | Value |
| --- | --- |
| Node ID | b73f07fb-8d13-4987-8c19-26b7a284b1e8 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -528, 256 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Store Chunks in Batches -> Count Stored Chunks (output 0, input 0)

**Outgoing Connections**

- Count Stored Chunks -> Merge (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const chunks = $items(\"Chunking Raw Data\").map(item =\u003e item.json);\nconst semanticDocs = $items(\"Build Semantic Content\").map(item =\u003e item.json);\nconst trigger = $(\u0027When Executed by Another Workflow\u0027).first().json;\nconst configSnapshot = trigger.configSnapshot || trigger.config_snapshot || {};\n\nfunction countWords(text) {\n  const matches = String(text || \u0027\u0027).match(/[A-Za-z0-9]+(?:[\u0027-][A-Za-z0-9]+)*/g);\n  return matches ? matches.length : 0;\n}\n\nconst embeddedCharacterCount = chunks.reduce((total, chunk) =\u003e {\n  return total + String(chunk.pageContent || \u0027\u0027).length;\n}, 0);\n\nconst embeddedWordCount = chunks.reduce((total, chunk) =\u003e {\n  return total + countWords(chunk.pageContent);\n}, 0);\n\nconst estimatedEmbeddingTokens = Math.ceil(embeddedCharacterCount / 4);\nconst embeddingModel = configSnapshot.models?.embeddingModel || \u0027text-embedding-3-small\u0027;\nconst embeddingCostPerToken = String(embeddingModel).includes(\u0027large\u0027)\n  ? 0.13 / 1_000_000\n  : 0.02 / 1_000_000;\nconst embeddingCostUsd = estimatedEmbeddingTokens * embeddingCostPerToken;\n\nconst visionTokensInput = semanticDocs.reduce((total, doc) =\u003e total + (Number(doc.visionTokensInput) || 0), 0);\nconst visionTokensOutput = semanticDocs.reduce((total, doc) =\u003e total + (Number(doc.visionTokensOutput) || 0), 0);\nconst visionCostUsd = semanticDocs.reduce((total, doc) =\u003e total + (Number(doc.visionCostUsd) || 0), 0);\nconst visionUsageEstimated = semanticDocs.some(doc =\u003e Boolean(doc.visionUsageEstimated));\n\nconst tokensInput = visionTokensInput + estimatedEmbeddingTokens;\nconst tokensOutput = visionTokensOutput;\nconst tokensTotal = tokensInput + tokensOutput;\nconst estimatedCostUsd = visionCostUsd + embeddingCostUsd;\n\nreturn [\n  {\n    json: {\n      totalChunksStored: chunks.length,\n      tokensInput,\n      tokensOutput,\n      tokensTotal,\n      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),\n      tokenUsage: {\n        accounting: \u0027actual_vision_when_available_plus_estimated_embeddings\u0027,\n        visionModel: \u0027gpt-4o-mini\u0027,\n        visionTokensInput,\n        visionTokensOutput,\n        visionTokensTotal: visionTokensInput + visionTokensOutput,\n        visionCostUsd: Number(visionCostUsd.toFixed(6)),\n        visionUsageEstimated,\n        embeddingModel,\n        embeddedCharacterCount,\n        embeddedWordCount,\n        estimatedEmbeddingTokens,\n        embeddingCostUsd: Number(embeddingCostUsd.toFixed(6)),\n        tokensInput,\n        tokensOutput,\n        tokensTotal,\n        estimatedCostUsd: Number(estimatedCostUsd.toFixed(6))\n      }\n    }\n  }\n];"
}
```

### Default Data Loader

| Field | Value |
| --- | --- |
| Node ID | 6989b58a-fa23-4d0e-bb74-b46be62b247f |
| Type | @n8n/n8n-nodes-langchain.documentDefaultDataLoader |
| Type Version | 1.1 |
| Position | -32, 688 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Token Splitter -> Default Data Loader (output 0, input 0)

**Outgoing Connections**

- Default Data Loader -> Chroma Vector Store (output 0, input 0)
- Default Data Loader -> Handle Data Loader Errors (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "textSplittingMode":  "custom",
    "options":  {
                    "metadata":  {
                                     "metadataValues":  [
                                                            {
                                                                "name":  "project",
                                                                "value":  "={{$json.metadata.project}}"
                                                            },
                                                            {
                                                                "name":  "projectId",
                                                                "value":  "={{$json.metadata.projectId}}"
                                                            },
                                                            {
                                                                "name":  "requestedBy",
                                                                "value":  "={{$json.metadata.requestedBy}}"
                                                            },
                                                            {
                                                                "name":  "jobId",
                                                                "value":  "={{$json.metadata.jobId}}"
                                                            },
                                                            {
                                                                "name":  "documentId",
                                                                "value":  "={{$json.metadata.documentId}}"
                                                            },
                                                            {
                                                                "name":  "chunkId",
                                                                "value":  "={{$json.metadata.chunkId}}"
                                                            },
                                                            {
                                                                "name":  "docType",
                                                                "value":  "={{$json.metadata.docType}}"
                                                            },
                                                            {
                                                                "name":  "documentCategory",
                                                                "value":  "={{$json.metadata.documentCategory}}"
                                                            },
                                                            {
                                                                "name":  "artifactType",
                                                                "value":  "={{$json.metadata.artifactType}}"
                                                            },
                                                            {
                                                                "name":  "fileName",
                                                                "value":  "={{$json.metadata.fileName}}"
                                                            },
                                                            {
                                                                "name":  "fileType",
                                                                "value":  "={{$json.metadata.fileType}}"
                                                            },
                                                            {
                                                                "name":  "pageCount",
                                                                "value":  "={{$json.metadata.pageCount}}"
                                                            },
                                                            {
                                                                "name":  "contentMode",
                                                                "value":  "={{$json.metadata.contentMode}}"
                                                            },
                                                            {
                                                                "name":  "containsImages",
                                                                "value":  "={{$json.metadata.containsImages}}"
                                                            },
                                                            {
                                                                "name":  "containsText",
                                                                "value":  "={{$json.metadata.containsText}}"
                                                            },
                                                            {
                                                                "name":  "hasVisionContent",
                                                                "value":  "={{$json.metadata.hasVisionContent}}"
                                                            },
                                                            {
                                                                "name":  "sectionTitle",
                                                                "value":  "={{$json.metadata.sectionTitle}}"
                                                            },
                                                            {
                                                                "name":  "sectionIndex",
                                                                "value":  "={{$json.metadata.sectionIndex}}"
                                                            },
                                                            {
                                                                "name":  "chunkIndex",
                                                                "value":  "={{$json.metadata.chunkIndex}}"
                                                            },
                                                            {
                                                                "name":  "structuralType",
                                                                "value":  "={{$json.metadata.structuralType}}"
                                                            },
                                                            {
                                                                "name":  "contentSource",
                                                                "value":  "={{$json.metadata.contentSource}}"
                                                            },
                                                            {
                                                                "name":  "compositeKey",
                                                                "value":  "={{$json.metadata.compositeKey}}"
                                                            },
                                                            {
                                                                "name":  "imageId",
                                                                "value":  "={{$json.metadata.imageId}}"
                                                            },
                                                            {
                                                                "name":  "sectionPageReferences",
                                                                "value":  "={{$json.metadata.sectionPageReferences}}"
                                                            },
                                                            {
                                                                "name":  "imageSources",
                                                                "value":  "={{$json.metadata.imageSources}}"
                                                            },
                                                            {
                                                                "name":  "visualReasons",
                                                                "value":  "={{$json.metadata.visualReasons}}"
                                                            },
                                                            {
                                                                "name":  "visualLocators",
                                                                "value":  "={{$json.metadata.visualLocators}}"
                                                            }
                                                        ]
                                 }
                }
}
```

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | 3c3ba1c3-05ea-4618-8e96-ecfb0e42f979 |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | -384, 688 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Embeddings OpenAI -> Chroma Vector Store (output 0, input 0)

**Credential References**

```json
{
    "openAiApi":  {
                      "id":  "rdVg2Kks1mUCJf4R",
                      "name":  "OpenAi Paid Account (Aonu)"
                  }
}
```

**Full Parameter Snapshot**

```json
{
    "options":  {

                }
}
```

### Extract Text + Image

| Field | Value |
| --- | --- |
| Node ID | 9e4426ef-a8ea-4171-be9f-af8b13c87066 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -3968, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Rename Binary File Keys -> Extract Text + Image (output 0, input 0)

**Outgoing Connections**

- Extract Text + Image -> Has Images? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "={{ $(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.microservices?.documentProcessorV2Url || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.microservices?.documentProcessorV2Url || $(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.microservices?.documentProcessorUrl || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.microservices?.documentProcessorUrl || \u0027http://127.0.0.1:8001/process-document-v2\u0027 }}",
    "sendBody":  true,
    "contentType":  "multipart-form-data",
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "fileUrl",
                                                  "value":  "={{ $json.files[0].fileUrl }}"
                                              },
                                              {
                                                  "name":  "projectName",
                                                  "value":  "={{ String(($json.files[0].projectName) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "status",
                                                  "value":  "={{ String(($json.files[0].status) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "jobId",
                                                  "value":  "={{ String(($json.files[0].jobId) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "projectId",
                                                  "value":  "={{ String(($(\u0027When Executed by Another Workflow\u0027).first().json.projectId || $(\u0027When Executed by Another Workflow\u0027).first().json.project_id) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "requestedBy",
                                                  "value":  "={{ String(($(\u0027When Executed by Another Workflow\u0027).first().json.requestedBy || $(\u0027When Executed by Another Workflow\u0027).first().json.requested_by) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "settingsVersion",
                                                  "value":  "={{ String(($(\u0027When Executed by Another Workflow\u0027).first().json.settingsVersion || $(\u0027When Executed by Another Workflow\u0027).first().json.settings_version) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "maxImagesPerJob",
                                                  "value":  "={{ String(($(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.microservices?.vision?.maxImagesPerJob || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.microservices?.vision?.maxImagesPerJob) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "visionBatchSize",
                                                  "value":  "={{ String(($(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.microservices?.vision?.batchSize || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.microservices?.vision?.batchSize) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "maxRenderedPagesPerDocument",
                                                  "value":  "={{ String(($(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.microservices?.vision?.maxRenderedPagesPerDocument || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.microservices?.vision?.maxRenderedPagesPerDocument) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "maxEmbeddedImagesPerDocument",
                                                  "value":  "={{ String(($(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.microservices?.vision?.maxEmbeddedImagesPerDocument || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.microservices?.vision?.maxEmbeddedImagesPerDocument) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "maxStandaloneImagesPerDocument",
                                                  "value":  "={{ String(($(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.microservices?.vision?.maxStandaloneImagesPerDocument || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.microservices?.vision?.maxStandaloneImagesPerDocument) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "visionRenderDpi",
                                                  "value":  "={{ String(($(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.microservices?.vision?.renderDpi || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.microservices?.vision?.renderDpi) || \u0027\u0027) }}"
                                              },
                                              {
                                                  "name":  "deferOverflowVisuals",
                                                  "value":  "={{ String(($(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.microservices?.vision?.deferOverflowVisuals || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.microservices?.vision?.deferOverflowVisuals) || \u0027\u0027) }}"
                                              }
                                          ]
                       },
    "options":  {
                    "response":  {
                                     "response":  {
                                                      "responseFormat":  "json"
                                                  }
                                 },
                    "timeout":  300000
                }
}
```

### Extract Vision Response

| Field | Value |
| --- | --- |
| Node ID | 5b7a44c8-e49e-4458-9af7-e21a72738d28 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1840, 480 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Vision Extraction -> Extract Vision Response (output 0, input 0)

**Outgoing Connections**

- Extract Vision Response -> Batch Images for Vision (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const visionOutputs = $input.all();\nconst originalItems = $items(\"Prepare Vision Payload\");\n\nfunction readUsage(json) {\n  const usage =\n    json.usage ||\n    json.response?.usage ||\n    json.output?.usage ||\n    json.output?.[0]?.usage ||\n    json.llmUsage ||\n    {};\n\n  const inputTokens =\n    Number(usage.input_tokens) ||\n    Number(usage.prompt_tokens) ||\n    Number(usage.inputTokens) ||\n    Number(usage.promptTokens) ||\n    0;\n\n  const outputTokens =\n    Number(usage.output_tokens) ||\n    Number(usage.completion_tokens) ||\n    Number(usage.outputTokens) ||\n    Number(usage.completionTokens) ||\n    0;\n\n  return { inputTokens, outputTokens };\n}\n\nconst results = [];\n\nfor (const vision of visionOutputs) {\n  const rawText =\n    vision.json.output?.[0]?.content?.[0]?.text ||\n    vision.json.output_text ||\n    \u0027\u0027;\n\n  const imageDescription = rawText.trim();\n  const pairedIndex = vision.pairedItem?.item;\n  const original = originalItems[pairedIndex];\n\n  if (!original) continue;\n\n  const usage = readUsage(vision.json || {});\n  const estimatedOutputTokens = usage.outputTokens || Math.ceil(imageDescription.length / 4);\n  const meta = original.json;\n\n  results.push({\n    json: {\n      projectName: meta.projectName,\n      status: meta.status,\n      jobId: meta.jobId,\n      imageIndex: meta.imageIndex,\n      imageId: meta.imageId,\n      imageFileName: meta.imageFileName,\n      parentFileName: meta.parentFileName,\n      imageDescription,\n      totalImagesInDocument: meta.totalImagesInDocument || null,\n      imageLimitApplied: meta.imageLimitApplied || false,\n      visionTokensInput: usage.inputTokens,\n      visionTokensOutput: estimatedOutputTokens,\n      visionTokensTotal: usage.inputTokens + estimatedOutputTokens,\n      visionUsageEstimated: !usage.inputTokens \u0026\u0026 !usage.outputTokens\n    }\n  });\n}\n\nreturn results;"
}
```

### Fix Data Format

| Field | Value |
| --- | --- |
| Node ID | 975d42b7-0e67-440e-a6dd-8b299c940886 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -480, 464 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Store Chunks in Batches -> Fix Data Format (output 1, input 0)

**Outgoing Connections**

- Fix Data Format -> Chroma Vector Store (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "assignments":  {
                        "assignments":  [
                                            {
                                                "id":  "81bab6c0-c1ef-44ff-aa10-e0528890ee91",
                                                "name":  "pageContent",
                                                "value":  "={{$json.pageContent}}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "2033c08e-6a87-4f9d-a26a-cb1b82716f15",
                                                "name":  "metadata",
                                                "value":  "={{$json.metadata}}",
                                                "type":  "object"
                                            }
                                        ]
                    },
    "options":  {

                }
}
```

### Guard: Max Image Limit

| Field | Value |
| --- | --- |
| Node ID | b03c557c-f62c-4f83-9bcf-cf774792ddc6 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -2992, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Split images for Vision Extraction -> Guard: Max Image Limit (output 0, input 0)

**Outgoing Connections**

- Guard: Max Image Limit -> Batch Images for Vision (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\n\nif (!items.length) {\n  return [];\n}\n\nconst clamp = (value, fallback, minimum, maximum) =\u003e {\n  const parsed = Number(value);\n  return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : fallback;\n};\n\nconst runtimeConfig = items[0].json.configSnapshot?.microservices?.vision || {};\nconst maxImages = clamp(runtimeConfig.maxImagesPerJob, 80, 1, 500);\nconst batchSize = clamp(runtimeConfig.batchSize, 5, 1, 50);\nconst deferOverflowVisuals = runtimeConfig.deferOverflowVisuals !== false;\n\nconst prioritized = items.slice().sort((left, right) =\u003e {\n  const scoreDelta = (Number(right.json.priorityScore) || 0) - (Number(left.json.priorityScore) || 0);\n  if (scoreDelta !== 0) return scoreDelta;\n\n  const pageDelta = (Number(left.json.pageNumber) || 0) - (Number(right.json.pageNumber) || 0);\n  if (pageDelta !== 0) return pageDelta;\n\n  return (Number(left.json.imageIndex) || 0) - (Number(right.json.imageIndex) || 0);\n});\n\nconst retained = prioritized.slice(0, maxImages);\nconst deferredCount = Math.max(0, prioritized.length - retained.length);\n\nif (deferredCount \u003e 0) {\n  console.log(`Vision candidate count (${prioritized.length}) exceeds configured limit ${maxImages}. Retaining ${retained.length} candidates and deferring ${deferredCount}.`);\n}\n\nreturn retained.map((item, index) =\u003e ({\n  json: {\n    ...item.json,\n    totalImagesInDocument: prioritized.length,\n    imageLimitApplied: deferredCount \u003e 0,\n    processedImagesInJob: retained.length,\n    deferredImagesInJob: deferredCount,\n    visionMaxImagesPerJob: maxImages,\n    visionBatchSize: batchSize,\n    deferOverflowVisuals,\n    visionProcessingRank: index + 1\n  }\n}));"
}
```

### Handle Data Loader Errors

| Field | Value |
| --- | --- |
| Node ID | 9e510f3e-729a-48ba-911e-23d2294c09b6 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 384, 672 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Default Data Loader -> Handle Data Loader Errors (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map(item =\u003e {\n\n  const err = item.json?.error || {};\n\n  return {\n    json: {\n      error: true,\n      source: \"Default Data Loader\",\n\n      // ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ Core error info\n      message: err.message || \"Unknown Loader Error\",\n      stack: err.stack || null,\n\n      // ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ Debug metadata\n      project: item.json?.metadata?.project || \"unknown\",\n      fileName: item.json?.metadata?.fileName || \"unknown\",\n      docType: item.json?.metadata?.docType || \"unknown\",\n      sectionTitle: item.json?.metadata?.sectionTitle || \"unknown\",\n      chunkIndex: item.json?.metadata?.chunkIndex ?? -1,\n\n      // ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ Content preview (VERY IMPORTANT for debugging)\n      preview: (item.json?.pageContent || \"\").slice(0, 200),\n\n      timestamp: new Date().toISOString()\n    }\n  };\n});"
}
```

### Handle Vision Errors

| Field | Value |
| --- | --- |
| Node ID | ba619b1d-b054-4448-8a14-6838ac47a790 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1840, 752 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Vision Extraction -> Handle Vision Errors (output 1, input 0)

**Outgoing Connections**

- Handle Vision Errors -> Update Job Status as Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const originalItems = $items(\"Prepare Vision Payload\");\n\nreturn $input.all().map((item, index) =\u003e {\n\n  const pairedIndex = item.pairedItem?.item;\n  const original = originalItems[pairedIndex];\n\n  return {\n    json: {\n      error: true,\n      message: item.json?.error?.message || \"Unknown Vision Error\",\n\n      // ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ CRITICAL: bring original metadata\n      jobId: original?.json?.jobId || \"unknown\",\n      projectName: original?.json?.projectName || \"unknown\",\n\n      imageId: original?.json?.imageId || \"unknown\",\n      imageFileName: original?.json?.imageFileName || \"unknown\",\n      parentFileName: original?.json?.parentFileName || \"unknown\",\n\n      timestamp: new Date().toISOString()\n    }\n  };\n});"
}
```

### Has Images?

| Field | Value |
| --- | --- |
| Node ID | has-images-route |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | -3552, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Extract Text + Image -> Has Images? (output 0, input 0)

**Outgoing Connections**

- Has Images? -> Split images for Vision Extraction (output 0, input 0)
- Has Images? -> Build Semantic Content (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "conditions":  {
                       "options":  {
                                       "caseSensitive":  true,
                                       "leftValue":  "",
                                       "typeValidation":  "strict",
                                       "version":  3
                                   },
                       "conditions":  [
                                          {
                                              "id":  "has-extracted-images",
                                              "leftValue":  "={{ Array.isArray($json.images) ? $json.images.length : 0 }}",
                                              "rightValue":  0,
                                              "operator":  {
                                                               "type":  "number",
                                                               "operation":  "gt"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### LOG

| Field | Value |
| --- | --- |
| Node ID | 04e0f061-7771-44dd-b22c-a13913832f3b |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 544, 256 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Update Job Status as Completed -> LOG (output 0, input 0)

**Outgoing Connections**

- LOG -> LOG: Job Completed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const data = $json;\nconst trigger = $(\u0027When Executed by Another Workflow\u0027).first().json;\n\nfunction firstFileKey(files) {\n  const keys = Object.keys(files || {});\n  return keys[0] || \u0027unknown\u0027;\n}\n\nfunction documentTypeFromFileKey(key) {\n  const value = String(key || \u0027\u0027).toLowerCase();\n  if ([\u0027brd\u0027, \u0027frd\u0027, \u0027hld\u0027, \u0027lld\u0027].includes(value)) return value.toUpperCase();\n  if (value.startsWith(\u0027transcript\u0027)) return \u0027TRANSCRIPT\u0027;\n  if (value === \u0027image\u0027 || value.startsWith(\u0027image\u0027)) return \u0027UI_DESIGN\u0027;\n  return value ? value.toUpperCase() : \u0027UNKNOWN\u0027;\n}\n\nfunction toDate(value) {\n  const date = value ? new Date(value) : null;\n  return date \u0026\u0026 !Number.isNaN(date.getTime()) ? date : null;\n}\n\nconst jobId = data.job_id;\nconst projectName = data.input?.projectName;\nconst files = data.input?.files || {};\nconst fileKeys = Object.keys(files);\nconst totalFiles = fileKeys.length;\nconst fileKey = firstFileKey(files);\nconst documentType = documentTypeFromFileKey(fileKey);\nconst configSnapshot = data.config_snapshot || trigger.configSnapshot || trigger.config_snapshot || {};\nconst tokenUsage = data.output?.tokenUsage || {};\nconst completedAt = new Date();\nconst completedAtFromDb = toDate(data.updated_at);\nconst createdAt = toDate(data.created_at);\nconst durationMs = createdAt ? Math.max(0, (completedAtFromDb || completedAt).getTime() - createdAt.getTime()) : null;\nconst embeddedWordCount = Number(tokenUsage.embeddedWordCount) || 0;\nconst wordCount = embeddedWordCount || null;\n\nconsole.log(\"INGESTION COMPLETED:\", {\n  jobId,\n  projectName,\n  totalFiles,\n  fileKeys,\n  documentType,\n  durationMs,\n  wordCount,\n  projectId: data.project_id || trigger.projectId || trigger.project_id || null,\n  requestedBy: data.requested_by || trigger.requestedBy || trigger.requested_by || null,\n  tokensTotal: tokenUsage.tokensTotal || 0,\n  estimatedCostUsd: tokenUsage.estimatedCostUsd || 0\n});\n\nreturn [\n  {\n    json: {\n      jobId,\n      projectName,\n      totalFiles,\n      fileKeys,\n      fileKey,\n      documentType,\n      logType: \"INGESTION_COMPLETED\",\n      totalChunksStored: data.output?.totalChunksStored || 0,\n      durationMs,\n      wordCount,\n      tokensInput: Number(tokenUsage.tokensInput) || 0,\n      tokensOutput: Number(tokenUsage.tokensOutput) || 0,\n      tokensTotal: Number(tokenUsage.tokensTotal) || 0,\n      estimatedCostUsd: Number(tokenUsage.estimatedCostUsd) || 0,\n      tokenUsage,\n      projectId: data.project_id || trigger.projectId || trigger.project_id || null,\n      requestedBy: data.requested_by || trigger.requestedBy || trigger.requested_by || null,\n      settingsVersion: data.settings_version || trigger.settingsVersion || trigger.settings_version || null,\n      configSnapshot,\n      environmentKey: configSnapshot.environment?.key || trigger.environment || \u0027local\u0027,\n      completedAt: completedAt.toISOString()\n    }\n  }\n];"
}
```

### LOG: Job Completed

| Field | Value |
| --- | --- |
| Node ID | 814aae3d-5e5d-4f74-996f-eeb49f60fe2a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 752, 256 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG -> LOG: Job Completed (output 0, input 0)

**Outgoing Connections**

- LOG: Job Completed -> Store LOGS in Supabase (output 0, input 0)

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"Prefer\": \"return=minimal\"\n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"job_id\":       \"{{ $json.jobId }}\",\n  \"project_name\": \"{{ $json.projectName }}\",\n  \"document_type\": \"{{ $json.documentType || \u0027UNKNOWN\u0027 }}\",\n  \"pipeline\":     \"ingestion\",\n  \"event\":        \"JOB_COMPLETED\",\n  \"status\":       \"info\",\n  \"project_id\": {{ $json.projectId ? JSON.stringify($json.projectId) : \u0027null\u0027 }},\n  \"requested_by\": {{ $json.requestedBy ? JSON.stringify($json.requestedBy) : \u0027null\u0027 }},\n  \"duration_ms\":  {{ Number($json.durationMs) || 0 }},\n  \"word_count\": {{ Number($json.wordCount) || 0 }},\n  \"chunk_count\":  {{ parseInt($json.totalChunksStored) || 0 }},\n  \"total_files\":  {{ $json.totalFiles || 0 }},\n  \"tokens_input\": {{ Number($json.tokensInput) || 0 }},\n  \"tokens_output\": {{ Number($json.tokensOutput) || 0 }},\n  \"tokens_total\": {{ Number($json.tokensTotal) || 0 }},\n  \"estimated_cost_usd\": {{ Number($json.estimatedCostUsd) || 0 }},\n  \"metadata\": {\n    \"file_keys\": {{ JSON.stringify($json.fileKeys || []) }},\n    \"file_key\": {{ JSON.stringify($json.fileKey || null) }},\n    \"document_type\": {{ JSON.stringify($json.documentType || \u0027UNKNOWN\u0027) }},\n    \"settings_version\": {{ $json.settingsVersion || \u0027null\u0027 }},\n    \"project_id\": {{ $json.projectId ? JSON.stringify($json.projectId) : \u0027null\u0027 }},\n    \"requested_by\": {{ $json.requestedBy ? JSON.stringify($json.requestedBy) : \u0027null\u0027 }},\n    \"environment\": \"{{ $json.environmentKey || \u0027local\u0027 }}\",\n    \"chroma_collection\": \"{{ $json.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027 }}\",\n    \"token_usage\": {{ JSON.stringify($json.tokenUsage || {}) }}\n  }\n}",
    "options":  {

                }
}
```

### Merge

| Field | Value |
| --- | --- |
| Node ID | df8f2f61-6920-40af-b52d-1e0c9f45245e |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -240, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Chunking Raw Data -> Merge (output 0, input 0)
- Count Stored Chunks -> Merge (output 0, input 1)

**Outgoing Connections**

- Merge -> Update Job Status as Completed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "mode":  "combine",
    "combineBy":  "combineByPosition",
    "options":  {

                }
}
```

### Prepare Vision Payload

| Field | Value |
| --- | --- |
| Node ID | 651c1609-c377-4478-ab7d-b8ebe8dbdf9c |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -2528, 496 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Batch Images for Vision -> Prepare Vision Payload (output 1, input 0)

**Outgoing Connections**

- Prepare Vision Payload -> Vision Extraction (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "assignments":  {
                        "assignments":  [
                                            {
                                                "id":  "250dc377-8ad3-47e7-99e6-a12000b96c31",
                                                "name":  "projectName",
                                                "value":  "={{$json.projectName}}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "b41d3aa7-4264-456d-9cae-ccf2a8abf07f",
                                                "name":  "status",
                                                "value":  "={{$json.status}}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "9581298d-61fa-4f1f-9092-1d2d39116fb1",
                                                "name":  "jobId",
                                                "value":  "={{$json.jobId}}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "ad29416a-7538-4399-bcbe-97e386c2a6da",
                                                "name":  "parentFileName",
                                                "value":  "={{$json.parentFileName}}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "dc007e9b-1453-446a-8240-36a3f668d19a",
                                                "name":  "imageFileName",
                                                "value":  "={{$json.imageFileName}}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "d0b27988-fa75-4ec7-8e47-e8f119942315",
                                                "name":  "imageId",
                                                "value":  "={{$json.imageId}}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "a891dce7-bdab-4de0-8f53-e84639a27c43",
                                                "name":  "base64",
                                                "value":  "={{$json.base64}}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "45499e22-a9cb-4708-b5e4-1eb1ed45e3ef",
                                                "name":  "imageIndex",
                                                "value":  "={{$json.imageIndex}}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "79938304-882b-49d7-bf79-de85683dbe7a",
                                                "name":  "totalImagesInDocument",
                                                "value":  "={{ $json.totalImagesInDocument }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "c2160bc5-8523-46d1-91ee-8acd437f7f6f",
                                                "name":  "imageLimitApplied",
                                                "value":  "={{ $json.imageLimitApplied }}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "options":  {

                }
}
```

### Rebuild Document With Vision Extracted Text

| Field | Value |
| --- | --- |
| Node ID | 1e442214-cf15-4bb3-a164-b1b3bb18b3e7 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1712, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Batch Images for Vision -> Rebuild Document With Vision Extracted Text (output 0, input 0)

**Outgoing Connections**

- Rebuild Document With Vision Extracted Text -> Build Semantic Content (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const originalDocs = $items(\"Extract Text + Image\");\nconst visionResults = $input.all();\n\nconst visionMap = {};\nlet processedImagesInJob = 0;\nlet deferredImagesInJob = 0;\nlet visionMaxImagesPerJob = 0;\nlet visionBatchSize = 5;\nlet totalVisionCandidatesInJob = 0;\n\nfor (const item of visionResults) {\n  const data = item.json || {};\n  if (!data.imageId) {\n    continue;\n  }\n\n  visionMap[data.imageId] = data;\n  processedImagesInJob = Math.max(processedImagesInJob, Number(data.processedImagesInJob) || 0);\n  deferredImagesInJob = Math.max(deferredImagesInJob, Number(data.deferredImagesInJob) || 0);\n  visionMaxImagesPerJob = Math.max(visionMaxImagesPerJob, Number(data.visionMaxImagesPerJob) || 0);\n  visionBatchSize = Math.max(visionBatchSize, Number(data.visionBatchSize) || 0);\n  totalVisionCandidatesInJob = Math.max(totalVisionCandidatesInJob, Number(data.totalImagesInDocument) || 0);\n}\n\nconst VISION_INPUT_PER_TOKEN = 0.15 / 1_000_000;\nconst VISION_OUTPUT_PER_TOKEN = 0.60 / 1_000_000;\n\nif (!totalVisionCandidatesInJob) {\n  totalVisionCandidatesInJob = originalDocs.reduce((sum, doc) =\u003e sum + ((Array.isArray(doc.json.images) ? doc.json.images.length : 0)), 0);\n}\n\nreturn originalDocs.map(doc =\u003e {\n  const data = doc.json;\n  const images = Array.isArray(data.images) ? data.images : [];\n\n  if (!images.length) {\n    return {\n      json: {\n        ...data,\n        visionTokensInput: 0,\n        visionTokensOutput: 0,\n        visionTokensTotal: 0,\n        visionCostUsd: 0,\n        visionUsageEstimated: false,\n        totalVisionCandidatesInJob,\n        processedImagesInJob: processedImagesInJob || 0,\n        deferredImagesInJob: deferredImagesInJob || 0,\n        documentProcessedImageCount: 0,\n        documentDeferredImageCount: 0,\n        visionMaxImagesPerJob: visionMaxImagesPerJob || null,\n        visionBatchSize: visionBatchSize || null,\n      }\n    };\n  }\n\n  let visionTokensInput = 0;\n  let visionTokensOutput = 0;\n  let visionUsageEstimated = false;\n  let documentProcessedImageCount = 0;\n\n  const updatedImages = images.map((img, index) =\u003e {\n    const result = visionMap[img.imageId] || {};\n    const imageDescription = result.imageDescription || null;\n    const inputTokens = Number(result.visionTokensInput) || 0;\n    const outputTokens = Number(result.visionTokensOutput) || 0;\n    const totalTokens = Number(result.visionTokensTotal) || 0;\n    const estimated = Boolean(result.visionUsageEstimated);\n\n    visionTokensInput += inputTokens;\n    visionTokensOutput += outputTokens;\n    visionUsageEstimated = visionUsageEstimated || estimated;\n\n    if (imageDescription) {\n      documentProcessedImageCount += 1;\n    }\n\n    return {\n      ...img,\n      imageFileName: img.fileName || img.imageFileName || `${data.fileName}_${index}`,\n      pageNumber: img.pageNumber ?? result.pageNumber ?? null,\n      imageSource: img.imageSource || result.imageSource || \u0027unknown\u0027,\n      visualReason: Array.isArray(img.visualReason) ? img.visualReason : (Array.isArray(result.visualReason) ? result.visualReason : []),\n      priorityScore: Number(img.priorityScore) || Number(result.priorityScore) || 0,\n      priorityClass: img.priorityClass || result.priorityClass || \u0027medium\u0027,\n      visualLocator: img.visualLocator || result.visualLocator || null,\n      imageDescription,\n      visionTokensInput: inputTokens,\n      visionTokensOutput: outputTokens,\n      visionTokensTotal: totalTokens,\n      visionUsageEstimated: estimated,\n      visionProcessingRank: Number(result.visionProcessingRank) || null,\n      visionProcessed: Boolean(imageDescription)\n    };\n  });\n\n  const visionCostUsd =\n    (visionTokensInput * VISION_INPUT_PER_TOKEN) +\n    (visionTokensOutput * VISION_OUTPUT_PER_TOKEN);\n\n  const documentDeferredImageCount = Math.max(0, updatedImages.length - documentProcessedImageCount);\n\n  return {\n    json: {\n      ...data,\n      images: updatedImages,\n      visionTokensInput,\n      visionTokensOutput,\n      visionTokensTotal: visionTokensInput + visionTokensOutput,\n      visionCostUsd: Number(visionCostUsd.toFixed(6)),\n      visionUsageEstimated,\n      totalVisionCandidatesInJob,\n      processedImagesInJob: processedImagesInJob || documentProcessedImageCount,\n      deferredImagesInJob: deferredImagesInJob || Math.max(0, totalVisionCandidatesInJob - (processedImagesInJob || documentProcessedImageCount)),\n      documentProcessedImageCount,\n      documentDeferredImageCount,\n      visionMaxImagesPerJob: visionMaxImagesPerJob || null,\n      visionBatchSize: visionBatchSize || null\n    }\n  };\n});"
}
```

### Rename Binary File Keys

| Field | Value |
| --- | --- |
| Node ID | ea33c8fd-324d-454a-9d43-0149d2961730 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4176, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- When Executed by Another Workflow -> Rename Binary File Keys (output 0, input 0)

**Outgoing Connections**

- Rename Binary File Keys -> Extract Text + Image (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "/*const output = [];\n\nfor (const item of $input.all()) {\n  const binaries = item.binary || {};\n  \n  for (const key of Object.keys(binaries)) {\n    output.push({\n      json: item.json,\n      binary: {\n        data: binaries[key]\n      }\n    });\n  }\n}\n\nreturn output;*/\n\nconst output = [];\n\nfor (const item of $input.all()) {\n  const binaries = item.binary || {};\n  \n  for (const key of Object.keys(binaries)) {\n    output.push({\n      json: {\n        ...item.json,\n        fileKey: key   // ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ VERY USEFUL for tracking\n      },\n      binary: {\n        data: binaries[key]\n      }\n    });\n  }\n}\n\nreturn output;"
}
```

### Split images for Vision Extraction

| Field | Value |
| --- | --- |
| Node ID | cd033654-284f-4025-b4c4-2f3551980332 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -3184, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Has Images? -> Split images for Vision Extraction (output 0, input 0)

**Outgoing Connections**

- Split images for Vision Extraction -> Guard: Max Image Limit (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().flatMap(item =\u003e {\n  const data = item.json;\n  const images = Array.isArray(data.images) ? data.images : [];\n\n  if (!images.length) {\n    return [];\n  }\n\n  return images.map((img, index) =\u003e ({\n    json: {\n      projectName: data.projectName,\n      status: data.status,\n      jobId: data.jobId,\n      projectId: data.projectId || null,\n      requestedBy: data.requestedBy || null,\n      settingsVersion: data.settingsVersion || null,\n      configSnapshot: data.configSnapshot || $(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot || {},\n      parentFileName: data.fileName,\n      imageFileName: img.fileName,\n      imageId: img.imageId || `${data.fileName}_${index}`,\n      imageIndex: index,\n      base64: img.base64,\n      pageNumber: img.pageNumber ?? null,\n      imageSource: img.imageSource || \u0027unknown\u0027,\n      visualReason: Array.isArray(img.visualReason) ? img.visualReason : [],\n      priorityScore: Number(img.priorityScore) || 0,\n      priorityClass: img.priorityClass || \u0027medium\u0027,\n      visualLocator: img.visualLocator || null,\n      totalImagesInDocument: images.length\n    }\n  }));\n});"
}
```

### Sticky Note

| Field | Value |
| --- | --- |
| Node ID | 528b821f-f375-40fb-987c-805812f3b060 |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | -4032, 240 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "content":  "Intelligent Document Extraction using Python Fast API"
}
```

### Sticky Note2

| Field | Value |
| --- | --- |
| Node ID | 11f94f2b-0304-4298-8a5d-27e713f85dac |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | -1040, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "content":  "Chunking raw data to generate embeddings"
}
```

### Sticky Note3

| Field | Value |
| --- | --- |
| Node ID | 35778cfc-6241-4169-ad83-3221c8cecef6 |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | -2272, 448 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "content":  "Vision Extraction"
}
```

### Sticky Note4

| Field | Value |
| --- | --- |
| Node ID | 649013e5-5b51-46e0-a6cc-6f9f3f8f4a7c |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | -1504, 176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "content":  "Combine Image text and raw text semantically so that it becomes a single text"
}
```

### Sticky Note5

| Field | Value |
| --- | --- |
| Node ID | 1f0479a3-107b-44a3-a4ea-7850d8044d7e |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | -1776, 176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "content":  "Base64 image context is now replaced with actual vision extracted text and combined with raw text"
}
```

### Store Chunks in Batches

| Field | Value |
| --- | --- |
| Node ID | ab690dc2-19b0-49b7-8911-77d8a0372eb7 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -752, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Chunking Raw Data -> Store Chunks in Batches (output 0, input 0)
- Chroma Vector Store -> Store Chunks in Batches (output 0, input 0)

**Outgoing Connections**

- Store Chunks in Batches -> Count Stored Chunks (output 0, input 0)
- Store Chunks in Batches -> Fix Data Format (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "batchSize":  50,
    "options":  {

                }
}
```

### Store LOGS in Supabase

| Field | Value |
| --- | --- |
| Node ID | 9d8d8fb6-cc64-4bba-add4-f31614252f4b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 992, 256 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Job Completed -> Store LOGS in Supabase (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs?job_id=eq.{{ $json.jobId }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=minimal\" \n}",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "total_files",
                                                  "value":  "={{ $json.totalFiles }}"
                                              },
                                              {
                                                  "name":  "file_keys",
                                                  "value":  "={{ $json.fileKeys }}"
                                              },
                                              {
                                                  "name":  "log_type",
                                                  "value":  "={{ $json.logType }}"
                                              },
                                              {
                                                  "name":  "updated_at",
                                                  "value":  "={{ $json.completedAt }}"
                                              }
                                          ]
                       },
    "options":  {
                    "batching":  {
                                     "batch":  {
                                                   "batchSize":  1
                                               }
                                 }
                }
}
```

### Token Splitter

| Field | Value |
| --- | --- |
| Node ID | baca51f9-7c8d-4b92-828c-1b0e5ce4d225 |
| Type | @n8n/n8n-nodes-langchain.textSplitterTokenSplitter |
| Type Version | 1 |
| Position | -112, 848 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Token Splitter -> Default Data Loader (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "chunkSize":  20000
}
```

### Update Job Status as Completed

| Field | Value |
| --- | --- |
| Node ID | df358bd0-52bb-43cd-9446-1942ffbb78ae |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 192, 256 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge -> Update Job Status as Completed (output 0, input 0)

**Outgoing Connections**

- Update Job Status as Completed -> Update Project Status as Ready (output 0, input 0)
- Update Job Status as Completed -> LOG (output 0, input 0)

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ $json.metadata.jobId }}\u0026status=eq.processing ",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"completed\",\n  \"output\": {\n    \"settingsVersion\": {{ $(\u0027When Executed by Another Workflow\u0027).first().json.settingsVersion || $(\u0027When Executed by Another Workflow\u0027).first().json.settings_version || \u0027null\u0027 }},\n    \"destination\": {\n      \"type\": \"chroma\",\n      \"collection\": \"{{ $(\u0027When Executed by Another Workflow\u0027).first().json.configSnapshot?.chroma?.collection || $(\u0027When Executed by Another Workflow\u0027).first().json.config_snapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027 }}\"\n    },\n    \"totalChunksStored\": {{ $json.totalChunksStored || 0 }},\n    \"tokenUsage\": {{ JSON.stringify($json.tokenUsage || {}) }}\n  },\n  \"updated_at\": \"{{ new Date().toISOString() }}\"\n}",
    "options":  {

                }
}
```

### Update Job Status as Failed

| Field | Value |
| --- | --- |
| Node ID | 0c55021d-d056-4a3e-800d-f993ff03c5e0 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -912, 752 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Semantic Content -> Update Job Status as Failed (output 1, input 0)
- Handle Vision Errors -> Update Job Status as Failed (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ encodeURIComponent($json.jobId || $json.metadata?.jobId || $(\u0027When Executed by Another Workflow\u0027).first().json.jobId || \u0027\u0027) }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"failed\",\n  \"error\": {{ JSON.stringify($json.message || $json.error?.message || \"Ingestion workflow failed\") }},\n  \"output\": {\n    \"error\": true,\n    \"message\": {{ JSON.stringify($json.message || $json.error?.message || \"Ingestion workflow failed\") }},\n    \"source\": {{ JSON.stringify($json.error?.node?.name || $json.source || \"Multimodal ingestion full clone\") }},\n    \"failureStage\": {{ JSON.stringify($json.failureStage || \"ingestion_workflow\") }},\n    \"timestamp\": {{ JSON.stringify($json.timestamp || new Date().toISOString()) }},\n    \"projectName\": {{ JSON.stringify($json.projectName || null) }},\n    \"projectId\": {{ JSON.stringify($json.projectId || null) }},\n    \"requestedBy\": {{ JSON.stringify($json.requestedBy || null) }},\n    \"fileName\": {{ JSON.stringify($json.fileName || null) }},\n    \"docType\": {{ JSON.stringify($json.docType || null) }},\n    \"chunkId\": {{ JSON.stringify($json.chunkId || null) }},\n    \"chunkIndex\": {{ $json.chunkIndex === undefined || $json.chunkIndex === null ? \u0027null\u0027 : Number($json.chunkIndex) }},\n    \"chromaCollection\": {{ JSON.stringify($json.chromaCollection || null) }},\n    \"stack\": {{ JSON.stringify($json.stack || null) }},\n    \"details\": {{ JSON.stringify($json.errorDetails || null) }}\n  },\n  \"updated_at\": \"{{$now}}\"\n}",
    "options":  {

                }
}
```

### Update Project Status as Ready

| Field | Value |
| --- | --- |
| Node ID | 20ab2d63-bd56-48b9-9fdd-1c64130340d4 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 416, 416 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Update Job Status as Completed -> Update Project Status as Ready (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?id=eq.{{ encodeURIComponent($json.project_id || $(\u0027When Executed by Another Workflow\u0027).first().json.projectId || $(\u0027When Executed by Another Workflow\u0027).first().json.project_id || \u0027\u0027) }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={ \"status\": \"ready\", \"updated_at\": \"{{ new Date().toISOString() }}\" }",
    "options":  {

                }
}
```

### Vision Extraction

| Field | Value |
| --- | --- |
| Node ID | 2ab21fe1-e7dc-42f8-9d08-80ed07450217 |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2.1 |
| Position | -2272, 496 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Vision Payload -> Vision Extraction (output 0, input 0)

**Outgoing Connections**

- Vision Extraction -> Extract Vision Response (output 0, input 0)
- Vision Extraction -> Handle Vision Errors (output 1, input 0)

**Credential References**

```json
{
    "openAiApi":  {
                      "id":  "rdVg2Kks1mUCJf4R",
                      "name":  "OpenAi Paid Account (Aonu)"
                  }
}
```

**Full Parameter Snapshot**

```json
{
    "modelId":  {
                    "__rl":  true,
                    "value":  "gpt-4o-mini",
                    "mode":  "list",
                    "cachedResultName":  "GPT-4O-MINI"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "role":  "system",
                                         "content":  "You are a software architecture and QA documentation analyzer.\nExtract all visible text.\nIf the image is a diagram, explain:\n- Components\n- Services\n- Integrations\n- Flows\n- Technical meaning\nProvide structured explanation.\n"
                                     },
                                     {
                                         "content":  "=Image Context \u0026 Metadata:\nprojectName: {{$json.projectName}}\nstatus: {{$json.status}}\njobId: {{$json.jobId}}\nimageIndex: {{$json.imageIndex}}\nimageId: {{$json.imageId}}\nimageFileName: {{$json.imageFileName}}\nparentFileName: {{$json.parentFileName}}\n---\n\nAnalyze this software document image.\n\nReturn:\n1. Extracted text (if any)\n2. UI elements (buttons, fields, labels)\n3. If diagram:\n   - Components\n   - Services\n   - Integrations\n   - Data flow\n4. Testing insights (what should be validated)\n\nBe precise and structured."
                                     },
                                     {
                                         "type":  "image",
                                         "imageUrl":  "=data:image/png;base64,{{$json.base64}}"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "temperature":  0.3
                }
}
```

### When Executed by Another Workflow

| Field | Value |
| --- | --- |
| Node ID | 4a7237bd-454e-48f6-8731-828be692b782 |
| Type | n8n-nodes-base.executeWorkflowTrigger |
| Type Version | 1.1 |
| Position | -4384, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- When Executed by Another Workflow -> Rename Binary File Keys (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "inputSource":  "passthrough"
}
```
