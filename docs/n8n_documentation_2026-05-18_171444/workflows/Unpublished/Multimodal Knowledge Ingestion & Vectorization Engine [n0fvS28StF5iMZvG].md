# Multimodal Knowledge Ingestion & Vectorization Engine

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | n0fvS28StF5iMZvG |
| Active | False |
| Archived | False |
| Created At | 2026-02-20T10:39:22.919Z |
| Updated At | 2026-05-07T05:15:21.484Z |
| Node Count | 33 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Multimodal Knowledge Ingestion & Vectorization Engine [n0fvS28StF5iMZvG].json |

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
| n8n-nodes-base.httpRequest | 5 |
| n8n-nodes-base.merge | 1 |
| n8n-nodes-base.set | 2 |
| n8n-nodes-base.splitInBatches | 2 |
| n8n-nodes-base.stickyNote | 5 |

## Credentials Referenced

- chromaCloudApi: ChromaDB Self-Hosted account
- httpCustomAuth: supabase-anon-key
- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- http://127.0.0.1:8000/process-document
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs?job_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics

### Supabase/Data Table Hints

- doc_ingestion_jobs
- doc_ingestion_queuecreator_logs
- qa_job_metrics

## Connection Graph

- Rename Binary File Keys -> Extract Text + Image (source output 0, target input 0)
- Extract Text + Image -> Split images for Vision Extraction (source output 0, target input 0)
- Split images for Vision Extraction -> Guard: Max Image Limit (source output 0, target input 0)
- Extract Vision Response -> Batch Images for Vision (source output 0, target input 0)
- Rebuild Document With Vision Extracted Text -> Build Semantic Content (source output 0, target input 0)
- Vision Extraction -> Extract Vision Response (source output 0, target input 0)
- Vision Extraction -> Handle Vision Errors (source output 1, target input 0)
- Build Semantic Content -> Clean Emojis, # etc (source output 0, target input 0)
- Clean Emojis, # etc -> Chunking Raw Data (source output 0, target input 0)
- Chunking Raw Data -> Store Chunks in Batches (source output 0, target input 0)
- Chunking Raw Data -> Merge (source output 0, target input 0)
- Embeddings OpenAI -> Chroma Vector Store (source output 0, target input 0)
- Default Data Loader -> Chroma Vector Store (source output 0, target input 0)
- Default Data Loader -> Handle Data Loader Errors (source output 0, target input 0)
- Token Splitter -> Default Data Loader (source output 0, target input 0)
- Prepare Vision Payload -> Vision Extraction (source output 0, target input 0)
- Batch Images for Vision -> Rebuild Document With Vision Extracted Text (source output 0, target input 0)
- Batch Images for Vision -> Prepare Vision Payload (source output 1, target input 0)
- Fix Data Format -> Chroma Vector Store (source output 0, target input 0)
- Chroma Vector Store -> Store Chunks in Batches (source output 0, target input 0)
- Store Chunks in Batches -> Count Stored Chunks (source output 0, target input 0)
- Store Chunks in Batches -> Fix Data Format (source output 1, target input 0)
- When Executed by Another Workflow -> Rename Binary File Keys (source output 0, target input 0)
- Merge -> Update Job Status as Completed (source output 0, target input 0)
- Count Stored Chunks -> Merge (source output 0, target input 1)
- Handle Vision Errors -> Update Job Status as Failed (source output 0, target input 0)
- LOG -> LOG: Job Completed (source output 0, target input 0)
- Update Job Status as Completed -> LOG (source output 0, target input 0)
- Guard: Max Image Limit -> Batch Images for Vision (source output 0, target input 0)
- LOG: Job Completed -> Store LOGS in Supabase (source output 0, target input 0)

## Nodes

### Batch Images for Vision

| Field | Value |
| --- | --- |
| Node ID | af4c0294-b5e6-4a15-8fea-7857c4355907 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -8896, 48 |
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
    "batchSize":  5,
    "options":  {

                }
}
```

### Build Semantic Content

| Field | Value |
| --- | --- |
| Node ID | 43c9c529-7334-4274-8f7b-aad7cfdc263a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -7568, 32 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rebuild Document With Vision Extracted Text -> Build Semantic Content (output 0, input 0)

**Outgoing Connections**

- Build Semantic Content -> Clean Emojis, # etc (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map(item =\u003e {\n\n  const d = item.json;\n\n  let combined = \"\";\n\n  // 1ï¸âƒ£ Add document header context (important for RAG quality)\n  combined += `Project Name: ${d.projectName}\\n`;\n  combined += `Document Name: ${d.fileName}\\n`;\n  combined += `Document Type: ${d.fileType}\\n\\n`;\n\n  // 2ï¸âƒ£ Add raw text (if exists)\n  if (d.rawText \u0026\u0026 d.rawText.trim().length \u003e 0) {\n    combined += \"===== DOCUMENT TEXT =====\\n\";\n    combined += d.rawText.trim() + \"\\n\\n\";\n  }\n\n  // 3ï¸âƒ£ Add image insights (if exists)\n  if (d.images \u0026\u0026 d.images.length \u003e 0) {\n\n    const validImages = d.images.filter(img =\u003e img.imageDescription);\n\n    if (validImages.length \u003e 0) {\n      combined += \"===== IMAGE-DERIVED INSIGHTS =====\\n\\n\";\n\n      for (const img of validImages) {\n        combined += `--- IMAGE CONTEXT START ---\\n`;\n        combined += `Image Name: ${img.imageFileName}\\n`;\n        combined += `Image ID: ${img.imageId}\\n\\n`;\n        combined += `Extracted Insights:\\n`;\n        combined += img.imageDescription + \"\\n\\n\";\n        combined += `--- IMAGE CONTEXT END ---\\n\\n`;\n      }\n    }\n  }\n\n  return {\n    json: {\n      projectName: d.projectName,\n      status: d.status,\n      jobId: d.jobId,\n      fileName: d.fileName,\n      fileType: d.fileType,\n      pageCount: d.pageCount,\n      docType:d.docType,\n      documentId: d.documentId,\n      contentMode: d.contentMode,\n      containsText: d.containsText,\n      containsImages: d.containsImages,\n      semanticContent: combined.trim()\n    }\n  };\n\n});\n"
}
```

### Chroma Vector Store

| Field | Value |
| --- | --- |
| Node ID | 98446b51-7f95-4ed0-a90a-f13e0de18231 |
| Type | @n8n/n8n-nodes-langchain.vectorStoreChromaDB |
| Type Version | 1.3 |
| Position | -6368, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
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
                             "value":  "qa-chunks-batches",
                             "mode":  "list",
                             "cachedResultName":  "qa-chunks-batches"
                         },
    "options":  {

                }
}
```

### Chunking Raw Data

| Field | Value |
| --- | --- |
| Node ID | 6c988ed7-46c5-4d47-9295-5da593d2c428 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -7088, 32 |
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
    "jsCode":  "/*return $input.all().flatMap(item =\u003e {\n  const data = item.json;\n  const chunks = [];\n\n  if (!data.semanticContent || typeof data.semanticContent !== \"string\") return [];\n\n  const text = data.semanticContent\n    .replace(/Project Name:.*\\n/, \"\")\n    .replace(/Document Name:.*\\n/, \"\")\n    .replace(/Document Type:.*\\n/, \"\");\n\n  // 1ï¸âƒ£ Split text into candidate lines\n  const lines = text.split(/\\n/g).map(l =\u003e l.trim()).filter(l =\u003e l);\n\n  let currentSection = [];\n  let sectionIndex = 0;\n  let sectionTitle = \"\";\n\n  const chunkSize = 1500;\n  const overlap = 200;\n\n  const headingRegex =\n/^(\\d+(\\.\\d+)*\\s+.*|[A-Z]{1,3}-\\d+\\s+.*|[A-Z][A-Za-z\\s]{3,50}:?)$/;\n\n  // ðŸ”¥ Helper â†’ Detect imageId from chunk text\n  function extractImageId(text) {\n    const match = text.match(/Image ID:\\s*(.+)/i);\n    return match ? match[1].trim() : null;\n  }\n\n  function buildChunks(sectionText) {\n    const result = [];\n\n    for (let i = 0; i \u003c sectionText.length; i += (chunkSize - overlap)) {\n      const chunkText = sectionText.slice(i, i + chunkSize);\n\n      // ðŸ”¥ Detect if this chunk contains image info\n      const imageId = extractImageId(chunkText);\n\n      // âœ… FIXED: contentSource using contentMode (ONLY CHANGE)\n      let contentSource = \"text\";\n      if (data.contentMode === \"image-only\") {\n        contentSource = \"image\";\n      } else if (data.contentMode === \"hybrid\") {\n        contentSource = imageId ? \"image\" : \"text\";\n      }\n\n      // âœ… EXISTING: Composite Key (UNCHANGED)\n      const project = data.projectName || \"unknown\";\n      const docType = data.docType || \"unknown\";\n      const compositeKey = `${project}|${docType}|${contentSource}`;\n\n      result.push({\n        json: {\n          pageContent: chunkText,\n          metadata: {\n            project: project,\n            jobId: data.jobId,\n            status: data.status,\n            fileName: data.fileName || \"unknown\",\n            fileType: data.fileType || \"unknown\",\n            documentId: data.documentId || \"unknown\",\n            docType: docType,\n            pageCount: data.pageCount || 0,\n            contentMode: data.contentMode || \"unknown\",\n            containsImages: data.containsImages || false,\n            containsText: data.containsText || false,\n\n            documentCategory: data.fileType || \"unknown\",\n            sectionTitle: sectionTitle || `Section ${sectionIndex}`,\n            sectionIndex,\n            structuralType: \"logical_section\",\n            chunkIndex: Math.floor(i / (chunkSize - overlap)),\n\n            // âœ… EXISTING FIELDS (UNCHANGED)\n            imageId: imageId || null,\n            contentSource: contentSource,\n\n            // âœ… EXISTING FIELD (UNCHANGED)\n            compositeKey: compositeKey\n          }\n        }\n      });\n    }\n\n    return result;\n  }\n\n  lines.forEach(line =\u003e {\n    if (headingRegex.test(line)) {\n\n      if (currentSection.length) {\n        const sectionText = currentSection.join(\"\\n\").trim();\n        if (sectionText) {\n          chunks.push(...buildChunks(sectionText));\n        }\n      }\n\n      sectionIndex++;\n      sectionTitle = line;\n      currentSection = [line];\n\n    } else {\n      currentSection.push(line);\n    }\n  });\n\n  // Last section\n  if (currentSection.length) {\n    const sectionText = currentSection.join(\"\\n\").trim();\n    if (sectionText) {\n      chunks.push(...buildChunks(sectionText));\n    }\n  }\n\n  return chunks;\n});*/\n\nreturn $input.all().flatMap(item =\u003e {\n  const data = item.json;\n  const chunks = [];\n\n  if (!data.semanticContent || typeof data.semanticContent !== \"string\") return [];\n\n  const text = data.semanticContent\n    .replace(/Project Name:.*\\n/, \"\")\n    .replace(/Document Name:.*\\n/, \"\")\n    .replace(/Document Type:.*\\n/, \"\");\n\n  // 1ï¸âƒ£ Split text into candidate lines\n  const lines = text.split(/\\n/g).map(l =\u003e l.trim()).filter(l =\u003e l);\n\n  let currentSection = [];\n  let sectionIndex = 0;\n  let sectionTitle = \"\";\n\n  // âœ… TUNED: Increased from 1500 chars / 200 overlap\n  // 10000 chars â‰ˆ 2500 tokens â€” better for enterprise documents with cross-references\n  // 2000 chars overlap â‰ˆ 500 tokens â€” enough to maintain context continuity across chunks\n  const chunkSize = 10000;\n  const overlap = 2000;\n\n  // âœ… NEW: Minimum chunk size guard â€” skip chunks too small to be meaningful\n  // Tiny chunks (e.g. a lone heading) create noise in the vector store\n  const minChunkSize = 200;\n\n  const headingRegex =\n    /^(\\d+(\\.\\d+)*\\s+.*|[A-Z]{1,3}-\\d+\\s+.*|[A-Z][A-Za-z\\s]{3,50}:?)$/;\n\n  // ðŸ”¥ Helper â†’ Detect imageId from chunk text (UNCHANGED)\n  function extractImageId(text) {\n    const match = text.match(/Image ID:\\s*(.+)/i);\n    return match ? match[1].trim() : null;\n  }\n\n  function buildChunks(sectionText) {\n    const result = [];\n\n    // âœ… NEW: If the entire section fits in one chunk, emit it as-is (no loop needed)\n    // This preserves full section context and avoids unnecessary splitting\n    if (sectionText.length \u003c= chunkSize) {\n      const imageId = extractImageId(sectionText);\n\n      let contentSource = \"text\";\n      if (data.contentMode === \"image-only\") {\n        contentSource = \"image\";\n      } else if (data.contentMode === \"hybrid\") {\n        contentSource = imageId ? \"image\" : \"text\";\n      }\n\n      const project = data.projectName || \"unknown\";\n      const docType = data.docType || \"unknown\";\n      const compositeKey = `${project}|${docType}|${contentSource}`;\n\n      // âœ… NEW: Skip chunks that are too small to be meaningful\n      if (sectionText.trim().length \u003e= minChunkSize) {\n        result.push({\n          json: {\n            pageContent: sectionText,\n            metadata: {\n              project,\n              jobId: data.jobId,\n              status: data.status,\n              fileName: data.fileName || \"unknown\",\n              fileType: data.fileType || \"unknown\",\n              documentId: data.documentId || \"unknown\",\n              docType,\n              pageCount: data.pageCount || 0,\n              contentMode: data.contentMode || \"unknown\",\n              containsImages: data.containsImages || false,\n              containsText: data.containsText || false,\n              documentCategory: data.fileType || \"unknown\",\n              sectionTitle: sectionTitle || `Section ${sectionIndex}`,\n              sectionIndex,\n              structuralType: \"logical_section\",\n              chunkIndex: 0,\n              imageId: imageId || null,\n              contentSource,\n              compositeKey\n            }\n          }\n        });\n      }\n\n      return result;\n    }\n\n    // âœ… TUNED: Same sliding window loop, but now with larger chunkSize + overlap\n    // Also added minChunkSize guard to skip the final tiny trailing chunk\n    for (let i = 0; i \u003c sectionText.length; i += (chunkSize - overlap)) {\n      const chunkText = sectionText.slice(i, i + chunkSize);\n\n      // âœ… NEW: Skip the final chunk if it\u0027s too small (trailing fragment)\n      // This happens when the last window has very little remaining text\n      if (chunkText.trim().length \u003c minChunkSize) break;\n\n      const imageId = extractImageId(chunkText);\n\n      let contentSource = \"text\";\n      if (data.contentMode === \"image-only\") {\n        contentSource = \"image\";\n      } else if (data.contentMode === \"hybrid\") {\n        contentSource = imageId ? \"image\" : \"text\";\n      }\n\n      const project = data.projectName || \"unknown\";\n      const docType = data.docType || \"unknown\";\n      const compositeKey = `${project}|${docType}|${contentSource}`;\n\n      result.push({\n        json: {\n          pageContent: chunkText,\n          metadata: {\n            project,\n            jobId: data.jobId,\n            status: data.status,\n            fileName: data.fileName || \"unknown\",\n            fileType: data.fileType || \"unknown\",\n            documentId: data.documentId || \"unknown\",\n            docType,\n            pageCount: data.pageCount || 0,\n            contentMode: data.contentMode || \"unknown\",\n            containsImages: data.containsImages || false,\n            containsText: data.containsText || false,\n            documentCategory: data.fileType || \"unknown\",\n            sectionTitle: sectionTitle || `Section ${sectionIndex}`,\n            sectionIndex,\n            structuralType: \"logical_section\",\n            chunkIndex: Math.floor(i / (chunkSize - overlap)),\n            imageId: imageId || null,\n            contentSource,\n            compositeKey\n          }\n        }\n      });\n    }\n\n    return result;\n  }\n\n  lines.forEach(line =\u003e {\n    if (headingRegex.test(line)) {\n      if (currentSection.length) {\n        const sectionText = currentSection.join(\"\\n\").trim();\n        if (sectionText) {\n          chunks.push(...buildChunks(sectionText));\n        }\n      }\n      sectionIndex++;\n      sectionTitle = line;\n      currentSection = [line];\n    } else {\n      currentSection.push(line);\n    }\n  });\n\n  // Last section (UNCHANGED)\n  if (currentSection.length) {\n    const sectionText = currentSection.join(\"\\n\").trim();\n    if (sectionText) {\n      chunks.push(...buildChunks(sectionText));\n    }\n  }\n\n  return chunks;\n});"
}
```

### Clean Emojis, # etc

| Field | Value |
| --- | --- |
| Node ID | 67ec909f-7fc5-4ee8-a70d-ec2158376483 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -7344, 32 |
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
    "jsCode":  "return $input.all().map(item =\u003e {\n\n  let text = item.json.semanticContent || \"\";\n\n  // 1ï¸âƒ£ Remove markdown headers (###, ##, #)\n  text = text.replace(/^#{1,6}\\s+/gm, \"\");\n\n  // 2ï¸âƒ£ Remove separator lines like ===== or -----\n  text = text.replace(/^[=\\-]{3,}$/gm, \"\");\n\n  // 3ï¸âƒ£ Remove emojis (basic unicode emoji ranges)\n  text = text.replace(\n    /[\\u{1F300}-\\u{1FAFF}]/gu,\n    \"\"\n  );\n\n  // 4ï¸âƒ£ Remove markdown bullets (*, -, + at line start)\n  text = text.replace(/^[\\*\\-\\+]\\s+/gm, \"\");\n\n  // 5ï¸âƒ£ Remove excessive line breaks (more than 2)\n  text = text.replace(/\\n{3,}/g, \"\\n\\n\");\n\n  // 6ï¸âƒ£ Trim extra spaces\n  text = text.replace(/[ \\t]{2,}/g, \" \");\n\n  // 7ï¸âƒ£ Final trim\n  text = text.trim();\n\n  return {\n    json: {\n      ...item.json,\n      semanticContent: text\n    }\n  };\n});\n"
}
```

### Count Stored Chunks

| Field | Value |
| --- | --- |
| Node ID | b71a6760-9201-493d-852f-81395d862e2a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -6640, 16 |
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
    "jsCode":  "return [\n  {\n    json: {\n      totalChunksStored: $input.all().length\n    }\n  }\n];"
}
```

### Default Data Loader

| Field | Value |
| --- | --- |
| Node ID | 16d3c06c-6cf5-42d8-a79a-7083cf6abf30 |
| Type | @n8n/n8n-nodes-langchain.documentDefaultDataLoader |
| Type Version | 1.1 |
| Position | -6144, 448 |
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
                                                                "name":  "filename",
                                                                "value":  "={{$json.metadata.fileName}}"
                                                            },
                                                            {
                                                                "name":  "fileType",
                                                                "value":  "={{$json.metadata.fileType}}"
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
                                                                "name":  "documentCategory",
                                                                "value":  "={{$json.metadata.documentCategory}}"
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
                                                                "name":  "structuralType",
                                                                "value":  "={{$json.metadata.structuralType}}"
                                                            },
                                                            {
                                                                "name":  "imageId",
                                                                "value":  "={{$json.metadata.imageId}}"
                                                            },
                                                            {
                                                                "name":  "contentSource",
                                                                "value":  "={{$json.metadata.contentSource}}"
                                                            },
                                                            {
                                                                "name":  "docType",
                                                                "value":  "={{$json.metadata.docType}}"
                                                            },
                                                            {
                                                                "name":  "compositeKey",
                                                                "value":  "={{$json.metadata.compositeKey}}"
                                                            },
                                                            {
                                                                "name":  "documentId",
                                                                "value":  "={{$json.metadata.documentId}}"
                                                            },
                                                            {
                                                                "name":  "chunkIndex",
                                                                "value":  "={{$json.metadata.chunkIndex}}"
                                                            }
                                                        ]
                                 }
                }
}
```

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | 021d729d-206d-4352-9780-0051ab5aa0d7 |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | -6496, 448 |
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
| Node ID | 9d1cad60-adbd-45ab-83d6-4423b4aaae82 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -9504, 48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename Binary File Keys -> Extract Text + Image (output 0, input 0)

**Outgoing Connections**

- Extract Text + Image -> Split images for Vision Extraction (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "http://127.0.0.1:8000/process-document",
    "sendBody":  true,
    "contentType":  "multipart-form-data",
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "parameterType":  "formBinaryData",
                                                  "name":  "file",
                                                  "inputDataFieldName":  "data"
                                              },
                                              {
                                                  "name":  "projectName",
                                                  "value":  "={{ $json.files[0].projectName }}"
                                              },
                                              {
                                                  "name":  "status",
                                                  "value":  "={{ $json.files[0].status }}"
                                              },
                                              {
                                                  "name":  "jobId",
                                                  "value":  "={{ $json.files[0].jobId }}"
                                              }
                                          ]
                       },
    "options":  {
                    "response":  {
                                     "response":  {
                                                      "responseFormat":  "json"
                                                  }
                                 }
                }
}
```

### Extract Vision Response

| Field | Value |
| --- | --- |
| Node ID | 16cc7cdf-9107-4f8b-9a40-8731a18da117 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -7952, 240 |
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
    "jsCode":  "/*const items = $input.all();\n\n// Get original image split data\nconst originalImages = $items(\"Split images for Vision Extraction\");\n\n// Combine OpenAI response + original metadata by position\nreturn items.map((item, index) =\u003e {\n\n  const original = originalImages[index];\n\n  let description = \"\";\n\n  // Handle OpenAI output structure\n  if (item.json.output \u0026\u0026 Array.isArray(item.json.output)) {\n    const first = item.json.output[0];\n\n    if (first?.content) {\n      description = first.content\n        .filter(p =\u003e p.type === \"output_text\")\n        .map(p =\u003e p.text)\n        .join(\"\\n\");\n    }\n  }\n\n  if (!description \u0026\u0026 item.json.output_text) {\n    description = item.json.output_text;\n  }\n\n  return {\n    json: {\n      projectName: original.json.projectName,\n      status: original.json.status,\n      jobId: original.json.jobId,\n      imageId: original.json.imageId,\n      imageFileName: original.json.imageFileName,\n      parentFileName: original.json.parentFileName,\n      imageIndex: original.json.imageIndex,\n      imageDescription: description\n    }\n  };\n});*/\n \n/*const visionOutputs = $input.all();\nconst originalImages = $items(\"Split images for Vision Extraction\");\n\nconst results = [];\n\nfor (let i = 0; i \u003c visionOutputs.length; i++) {\n  const vision = visionOutputs[i];\n  const original = originalImages[i];\n\n  let description = \"\";\n\n  if (vision.json.output \u0026\u0026 Array.isArray(vision.json.output)) {\n    const first = vision.json.output[0];\n\n    if (first?.content) {\n      description = first.content\n        .filter(p =\u003e p.type === \"output_text\")\n        .map(p =\u003e p.text)\n        .join(\"\\n\");\n    }\n  }\n\n  if (!description \u0026\u0026 vision.json.output_text) {\n    description = vision.json.output_text;\n  }\n\n  results.push({\n    json: {\n      imageId: original.json.imageId, // âœ… SAFE\n      imageFileName: original.json.imageFileName,\n      parentFileName: original.json.parentFileName,\n      imageDescription: description\n    }\n  });\n}\n\nreturn results;*/\n\n/*const visionOutputs = $input.all();\nconst originalImages = $items(\"Split images for Vision Extraction\");\n\nconst originalMap = {};\nfor (const item of originalImages) {\n  originalMap[item.json.imageId] = item.json;\n}\n\nconst results = [];\n\nfor (let i = 0; i \u003c visionOutputs.length; i++) {\n  const vision = visionOutputs[i];\n\n  // ðŸ”¥ KEY FIX: Get ORIGINAL item using pairedItem\n  const original = vision.pairedItem\n    ? originalImages[vision.pairedItem.item]\n    : null;\n\n  let description = \"\";\n\n  if (vision.json.output \u0026\u0026 Array.isArray(vision.json.output)) {\n    const first = vision.json.output[0];\n\n    if (first?.content) {\n      description = first.content\n        .filter(p =\u003e p.type === \"output_text\")\n        .map(p =\u003e p.text)\n        .join(\"\\n\");\n    }\n  }\n\n  if (!description \u0026\u0026 vision.json.output_text) {\n    description = vision.json.output_text;\n  }\n\n  const imageId = original?.json?.imageId;\n\n  if (!imageId) continue;\n\n  results.push({\n    json: {\n      imageId,\n      imageFileName: original.json.imageFileName,\n      parentFileName: original.json.parentFileName,\n      imageDescription: description\n    }\n  });\n}\n\nreturn results;*/\n\n/*const visionOutputs = $input.all();\nconst originalImages = $items(\"Split images for Vision Extraction\");\n\n// Build lookup map\nconst originalMap = {};\nfor (const item of originalImages) {\n  originalMap[item.json.imageId] = item.json;\n}\n\nconst results = [];\n\nfor (const vision of visionOutputs) {\n\n  // âœ… FIX 1: directly extract text safely\n  const content = vision.json.output?.[0]?.content?.[0]?.text;\n\n  let description = \"\";\n\n  if (typeof content === \"string\") {\n    description = content;\n  } else if (vision.json.output_text) {\n    description = vision.json.output_text;\n  }\n\n  // OPTIONAL: cleanup accidental JSON blocks inside LLM output\n  description = description\n    .replace(/```json/g, \"\")\n    .replace(/```/g, \"\")\n    .trim();\n\n  // âš ï¸ IMPORTANT: your vision output does NOT contain imageId\n  // so this is wrong:\n  // const imageId = vision.json.imageId;\n\n  // âœ… FIX 2: use pairedItem (THIS IS THE REAL LINK)\n  const original = vision.pairedItem\n    ? originalImages[vision.pairedItem.item]\n    : null;\n\n  if (!original) continue;\n\n  results.push({\n    json: {\n      projectName: original.json.projectName,\n      status: original.json.status,\n      jobId: original.json.jobId,\n      imageId: original.json.imageId,\n      imageFileName: original.json.imageFileName,\n      parentFileName: original.json.parentFileName,\n      imageIndex: original.json.imageIndex,\n      imageDescription: description\n    }\n  });\n}\n\nreturn results;*/\n\nconst visionOutputs = $input.all();\nconst originalItems = $items(\"Prepare Vision Payload\");\n\nconst results = [];\n\nfor (const vision of visionOutputs) {\n\n  // 1ï¸âƒ£ Extract vision text safely\n  const rawText =\n    vision.json.output?.[0]?.content?.[0]?.text ||\n    vision.json.output_text ||\n    \"\";\n\n  const imageDescription = rawText.trim();\n\n  // 2ï¸âƒ£ ðŸ”¥ CRITICAL FIX: get correct original item using pairedItem\n  const pairedIndex = vision.pairedItem?.item;\n\n  const original = originalItems[pairedIndex];\n\n  if (!original) continue;\n\n  const meta = original.json;\n\n  // 3ï¸âƒ£ Build final output\n  results.push({\n    json: {\n      projectName: meta.projectName,\n      status: meta.status,\n      jobId: meta.jobId,\n      imageIndex: meta.imageIndex,\n      imageId: meta.imageId,\n      imageFileName: meta.imageFileName,\n      parentFileName: meta.parentFileName,\n      imageDescription,\n      totalImagesInDocument: meta.totalImagesInDocument || null,\n    imageLimitApplied: meta.imageLimitApplied || false\n    }\n  });\n}\n\nreturn results;\n \n\n"
}
```

### Fix Data Format

| Field | Value |
| --- | --- |
| Node ID | 8b5ddb19-defc-480b-a023-331d4ece24e0 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -6592, 224 |
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
| Node ID | 491c62c8-593c-4dee-947c-a889cf56fb40 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -9104, 48 |
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
    "jsCode":  "const MAX_IMAGES = 30;\nconst items = $input.all();\n\n// Log if we\u0027re trimming\nif (items.length \u003e MAX_IMAGES) {\n  console.log(`âš ï¸ Image count (${items.length}) exceeds limit. Trimming to first ${MAX_IMAGES}.`);\n}\n\n// Take only the first MAX_IMAGES items\nreturn items.slice(0, MAX_IMAGES).map(item =\u003e ({\n  json: {\n    ...item.json,\n    totalImagesInDocument: items.length,\n    imageLimitApplied: items.length \u003e MAX_IMAGES\n  }\n}));"
}
```

### Handle Data Loader Errors

| Field | Value |
| --- | --- |
| Node ID | be087fa8-685e-42a4-939a-101155030ea5 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -5728, 432 |
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
    "jsCode":  "return $input.all().map(item =\u003e {\n\n  const err = item.json?.error || {};\n\n  return {\n    json: {\n      error: true,\n      source: \"Default Data Loader\",\n\n      // ðŸ”¥ Core error info\n      message: err.message || \"Unknown Loader Error\",\n      stack: err.stack || null,\n\n      // ðŸ”¥ Debug metadata\n      project: item.json?.metadata?.project || \"unknown\",\n      fileName: item.json?.metadata?.fileName || \"unknown\",\n      docType: item.json?.metadata?.docType || \"unknown\",\n      sectionTitle: item.json?.metadata?.sectionTitle || \"unknown\",\n      chunkIndex: item.json?.metadata?.chunkIndex ?? -1,\n\n      // ðŸ”¥ Content preview (VERY IMPORTANT for debugging)\n      preview: (item.json?.pageContent || \"\").slice(0, 200),\n\n      timestamp: new Date().toISOString()\n    }\n  };\n});"
}
```

### Handle Vision Errors

| Field | Value |
| --- | --- |
| Node ID | c2ab95da-aefc-46b4-908f-6cf0f2ae8f97 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -7952, 512 |
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
    "jsCode":  "const originalItems = $items(\"Prepare Vision Payload\");\n\nreturn $input.all().map((item, index) =\u003e {\n\n  const pairedIndex = item.pairedItem?.item;\n  const original = originalItems[pairedIndex];\n\n  return {\n    json: {\n      error: true,\n      message: item.json?.error?.message || \"Unknown Vision Error\",\n\n      // âœ… CRITICAL: bring original metadata\n      jobId: original?.json?.jobId || \"unknown\",\n      projectName: original?.json?.projectName || \"unknown\",\n\n      imageId: original?.json?.imageId || \"unknown\",\n      imageFileName: original?.json?.imageFileName || \"unknown\",\n      parentFileName: original?.json?.parentFileName || \"unknown\",\n\n      timestamp: new Date().toISOString()\n    }\n  };\n});"
}
```

### LOG

| Field | Value |
| --- | --- |
| Node ID | 47be1531-ed8d-4548-9c1d-6796da0265d4 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -5568, 16 |
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
    "jsCode":  "const data = $json;\n\n// âœ… Extract from new structure\nconst jobId = data.job_id;\nconst projectName = data.input?.projectName;\n\n// âœ… Files are inside input\nconst files = data.input?.files || {};\nconst fileKeys = Object.keys(files);\nconst totalFiles = fileKeys.length;\n\nconsole.log(\"âœ… INGESTION COMPLETED:\", {\n  jobId,\n  projectName,\n  totalFiles,\n  fileKeys\n});\n\nreturn [\n  {\n    json: {\n      jobId,\n      projectName,\n      totalFiles,\n      fileKeys,\n      logType: \"INGESTION_COMPLETED\",\n      totalChunksStored: data.output?.totalChunksStored || 0\n    }\n  }\n];"
}
```

### LOG: Job Completed

| Field | Value |
| --- | --- |
| Node ID | 3b8ed455-4a17-4b8c-a612-b9abe5a2d9e9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -5360, 16 |
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
    "jsonBody":  "={\n  \"job_id\":       \"{{ $json.jobId }}\",\n  \"project_name\": \"{{ $json.projectName }}\",\n  \"pipeline\":     \"ingestion\",\n  \"event\":        \"JOB_COMPLETED\",\n  \"status\":       \"info\",\n  \"chunk_count\":  \"{{ parseInt($json.totalChunksStored) || 0 }}\",\n  \"total_files\":  \"{{ $json.totalFiles || 0 }}\",\n  \"metadata\": {\n    \"file_keys\": \"{{ $json.fileKeys }}\"\n  }\n}",
    "options":  {

                }
}
```

### Merge

| Field | Value |
| --- | --- |
| Node ID | d3029986-d52d-4a99-a406-f5946b8dd8e6 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -6352, -224 |
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
| Node ID | fcb5001f-b887-473c-a1bc-3ad5b014307d |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -8640, 256 |
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
| Node ID | 3d935b11-2d94-4639-a30f-1842dea6a90a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -7824, 32 |
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
    "jsCode":  "/*// Get original documents\nconst originalDocs = $items(\"Extract Text + Image\");\n\n// Get vision results\nconst visionResults = $input.all();\n\n// Create lookup by imageFileName\nconst visionMap = {};\n\nfor (const item of visionResults) {\n  const { imageFileName, imageDescription } = item.json;\n  visionMap[imageFileName] = imageDescription;\n}\n\n// Rebuild documents\nconst rebuilt = originalDocs.map(doc =\u003e {\n  const data = doc.json;\n\n  if (!data.images || data.images.length === 0) {\n    return { json: data };\n  }\n\n  const updatedImages = data.images.map(img =\u003e ({\n    imageFileName: img.fileName,\n    imageDescription: visionMap[img.fileName] || null\n  }));\n\n  return {\n    json: {\n      ...data,\n      images: updatedImages\n    }\n  };\n});\n\nreturn rebuilt;/**\n * \n */\n\n// Get original documents\nconst originalDocs = $items(\"Extract Text + Image\");\n\n// Get vision results\nconst visionResults = $input.all();\n\n// Create lookup by imageId\nconst visionMap = {};\n\nfor (const item of visionResults) {\n  const { imageId, imageDescription } = item.json;\n  visionMap[imageId] = imageDescription;\n}\n\n// Rebuild documents\nconst rebuilt = originalDocs.map(doc =\u003e {\n  const data = doc.json;\n\n  if (!data.images || data.images.length === 0) {\n    return { json: data };\n  }\n\n  const updatedImages = data.images.map(img =\u003e ({\n    imageFileName: img.fileName,\n    imageId: img.imageId,\n    imageDescription: visionMap[img.imageId] || null\n  }));\n\n  return {\n    json: {\n      ...data,\n      images: updatedImages\n    }\n  };\n});\n\nreturn rebuilt;\n"
}
```

### Rename Binary File Keys

| Field | Value |
| --- | --- |
| Node ID | 1eb9bf43-6c26-4a4d-88b6-cf08a2e71b49 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -9712, 48 |
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
    "jsCode":  "/*const output = [];\n\nfor (const item of $input.all()) {\n  const binaries = item.binary || {};\n  \n  for (const key of Object.keys(binaries)) {\n    output.push({\n      json: item.json,\n      binary: {\n        data: binaries[key]\n      }\n    });\n  }\n}\n\nreturn output;*/\n\nconst output = [];\n\nfor (const item of $input.all()) {\n  const binaries = item.binary || {};\n  \n  for (const key of Object.keys(binaries)) {\n    output.push({\n      json: {\n        ...item.json,\n        fileKey: key   // ðŸ”¥ VERY USEFUL for tracking\n      },\n      binary: {\n        data: binaries[key]\n      }\n    });\n  }\n}\n\nreturn output;"
}
```

### Split images for Vision Extraction

| Field | Value |
| --- | --- |
| Node ID | 7a2a855d-d177-49a5-9e64-d327d5d06740 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -9296, 48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Extract Text + Image -> Split images for Vision Extraction (output 0, input 0)

**Outgoing Connections**

- Split images for Vision Extraction -> Guard: Max Image Limit (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().flatMap(item =\u003e {\n  const data = item.json;\n\n  if (!data.images || data.images.length === 0) {\n    return [];\n  }\n\n  return data.images.map((img, index) =\u003e ({\n    json: {\n      projectName: data.projectName,\n      status: data.status,\n      jobId: data.jobId,\n      parentFileName: data.fileName,\n      imageFileName: img.fileName,   // âœ… important\n      imageId: img.imageId || `${data.fileName}_${index}`, // âœ… SAFE FALLBACK\n      imageIndex: index,\n      base64: img.base64\n    }\n  }));\n});\n"
}
```

### Sticky Note

| Field | Value |
| --- | --- |
| Node ID | 7582bbbb-5f56-43d3-96a0-3aafc90bfbfc |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | -9568, -16 |
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
| Node ID | 26086f71-dd50-4c29-ab03-aa796309f9d7 |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | -7152, -16 |
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
| Node ID | 3615bd44-93da-444f-a7b4-b2b293dea390 |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | -8384, 208 |
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
| Node ID | 124bd622-b7ac-453b-af71-961cf561a8b3 |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | -7616, -64 |
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
| Node ID | 50c0f20d-f652-4759-a1e5-c159d75f8b46 |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | -7888, -64 |
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
| Node ID | cd8cd4a3-52ef-4aaf-b67f-68b0ee4687b3 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -6864, 32 |
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
| Node ID | 52afabbf-b409-4c51-8e94-6d36067ce8ce |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -5120, 16 |
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
| Node ID | 49604319-8c4a-470d-b629-154918fa8587 |
| Type | @n8n/n8n-nodes-langchain.textSplitterTokenSplitter |
| Type Version | 1 |
| Position | -6224, 608 |
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
| Node ID | f648f093-4ae7-4e37-b383-fe4ce6a22730 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -5824, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge -> Update Job Status as Completed (output 0, input 0)

**Outgoing Connections**

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
    "jsonBody":  "={\n  \"status\": \"completed\",\n  \"output\": {\n    \"totalChunksStored\": {{$json.totalChunksStored || 0}}\n  },\n  \"updated_at\": \"{{$now}}\"\n}",
    "options":  {

                }
}
```

### Update Job Status as Failed

| Field | Value |
| --- | --- |
| Node ID | e820178e-8258-4ca5-b71c-4218f4e10b53 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -7712, 512 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ $json.metadata.jobId }}\u0026status=eq.processing ",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"failed\",\n  \"output\": {\n    error: true,\n      message: item.json?.error?.message || \"Unknown Vision Error\"\n  },\n  \"updated_at\": \"{{$now}}\"\n}",
    "options":  {

                }
}
```

### Vision Extraction

| Field | Value |
| --- | --- |
| Node ID | cda260aa-57b9-48aa-b06a-b0d579c44750 |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2.1 |
| Position | -8384, 256 |
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
| Node ID | d8f02fce-ab5f-4e14-8d07-b1b032e6c129 |
| Type | n8n-nodes-base.executeWorkflowTrigger |
| Type Version | 1.1 |
| Position | -9920, 48 |
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
