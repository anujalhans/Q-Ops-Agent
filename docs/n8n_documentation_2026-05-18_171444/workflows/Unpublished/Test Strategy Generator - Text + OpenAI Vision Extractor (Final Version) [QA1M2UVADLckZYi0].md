# Test Strategy Generator - Text + OpenAI Vision Extractor (Final Version)

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | QA1M2UVADLckZYi0 |
| Active | False |
| Archived | True |
| Created At | 2025-11-26T12:57:39.215Z |
| Updated At | 2026-04-16T10:14:26.000Z |
| Node Count | 41 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Test Strategy Generator - Text + OpenAI Vision Extractor (Final Version) [QA1M2UVADLckZYi0].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Webhook - Upload Test Docs | n8n-nodes-base.webhook | POST | /upload-test-docs

Known webhook route hints:

- POST /webhook/upload-test-docs

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.openAi | 2 |
| n8n-nodes-base.code | 15 |
| n8n-nodes-base.convertToFile | 1 |
| n8n-nodes-base.executeCommand | 3 |
| n8n-nodes-base.extractFromFile | 5 |
| n8n-nodes-base.httpRequest | 1 |
| n8n-nodes-base.merge | 4 |
| n8n-nodes-base.readWriteFile | 2 |
| n8n-nodes-base.set | 2 |
| n8n-nodes-base.switch | 2 |
| n8n-nodes-base.wait | 3 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- http://127.0.0.1:8000/convert

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- Extract BRD Text -> Merge extracted text from all docs (source output 0, target input 0)
- Extract FRD Text -> Merge extracted text from all docs (source output 0, target input 1)
- Extract HLD Text -> Merge extracted text from all docs (source output 0, target input 2)
- Extract LLD Text -> Merge extracted text from all docs (source output 0, target input 3)
- Normalize Transcript Text -> Wait2 (source output 0, target input 0)
- Prepare Markdown Content -> Clean Markdown Formatting (source output 0, target input 0)
- Convert md to docx -> Write Final Test Strategy File (source output 0, target input 0)
- Merged Context for OpenAI -> Pre-Processor + Summarizer + Token Estimator (source output 0, target input 0)
- Clean Markdown Formatting -> Convert md to docx (source output 0, target input 0)
- Webhook - Upload Test Docs -> Detect File Type + Identify Text and/or Images (source output 0, target input 0)
- Rename binary key - LLD -> Extract LLD Text (source output 0, target input 0)
- Rename binary key - HLD -> Extract HLD Text (source output 0, target input 0)
- Rename binary key - FRD -> Extract FRD Text (source output 0, target input 0)
- Rename binary key - BRD -> Extract BRD Text (source output 0, target input 0)
- Extract Transcript Text -> Normalize Transcript Text (source output 0, target input 0)
- Open AI - Vision Extractor -> Normalize Image Vision Text (source output 0, target input 0)
- Switch - Find Extractor -> Merge Images from 2 Sources (source output 0, target input 0)
- Switch - Find Extractor -> Save Binary Files to local Disk (source output 1, target input 0)
- Switch - Find Extractor -> Extract Transcript Text (source output 2, target input 0)
- Normalize Image Vision Text -> Wait (source output 0, target input 0)
- Normalize Documents Text -> Wait1 (source output 0, target input 0)
- Merge Normalized Image + Docs + Transcript Text -> Merged Context for OpenAI (source output 0, target input 0)
- Run Python Extractor to extract images -> Merge JSON Outputs (source output 0, target input 1)
- Switch - docs Extractor route -> Expand Short Path (source output 0, target input 0)
- Switch - docs Extractor route -> Rename binary key - BRD (source output 1, target input 0)
- Switch - docs Extractor route -> Rename binary key - FRD (source output 2, target input 0)
- Switch - docs Extractor route -> Rename binary key - HLD (source output 3, target input 0)
- Switch - docs Extractor route -> Rename binary key - LLD (source output 4, target input 0)
- Merge JSON Outputs -> Flatten & Parse Extractor Output (source output 0, target input 0)
- Flatten & Parse Extractor Output -> Again Rename Binary Keys (source output 0, target input 0)
- Expand Short Path -> Store Expanded Path (source output 0, target input 0)
- Store Expanded Path -> Execute Command (source output 0, target input 0)
- Merge Images from 2 Sources -> Open AI - Vision Extractor (source output 0, target input 0)
- Execute Command -> Convert Base64 to Binary File of image type (source output 0, target input 0)
- Merge extracted text from all docs -> Normalize Documents Text (source output 0, target input 0)
- Add Metadata to Image File -> Merge Images from 2 Sources (source output 0, target input 1)
- Wait -> Merge Normalized Image + Docs + Transcript Text (source output 0, target input 0)
- Wait1 -> Merge Normalized Image + Docs + Transcript Text (source output 0, target input 1)
- Wait2 -> Merge Normalized Image + Docs + Transcript Text (source output 0, target input 2)
- Detect File Type + Identify Text and/or Images -> Rename Binary File Keys (source output 0, target input 0)
- Pre-Processor + Summarizer + Token Estimator -> OpenAI - Generate Test Strategy (source output 0, target input 0)
- Rename Binary File Keys -> Switch - Find Extractor (source output 0, target input 0)
- Save Binary Files to local Disk -> Run Python Extractor to extract images (source output 0, target input 0)
- Save Binary Files to local Disk -> Merge JSON Outputs (source output 0, target input 0)
- Again Rename Binary Keys -> Switch - docs Extractor route (source output 0, target input 0)
- Convert Base64 to Binary File of image type -> Add Metadata to Image File (source output 0, target input 0)
- OpenAI - Generate Test Strategy -> Prepare Markdown Content (source output 0, target input 0)

## Nodes

### Add Metadata to Image File

| Field | Value |
| --- | --- |
| Node ID | 61436f6b-1fd1-4342-a3b0-9c98deda662c |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -3904, -704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert Base64 to Binary File of image type -> Add Metadata to Image File (output 0, input 0)

**Outgoing Connections**

- Add Metadata to Image File -> Merge Images from 2 Sources (output 0, input 1)

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
                                                "id":  "54be1329-6e9d-4766-ace0-78721924af62",
                                                "name":  "fileName",
                                                "value":  "={{ \u0027ExtractedImage_\u0027 + $itemIndex  + \u0027.jpeg\u0027 }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "d370a8f0-8c71-4f03-bb5b-196797558aab",
                                                "name":  "fileType",
                                                "value":  "image",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "4fd43b90-f664-4f74-8edc-6130a0adc22b",
                                                "name":  "docType",
                                                "value":  "image",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "1384bb48-afaf-4f8c-ab96-356973c4e8a3",
                                                "name":  "containsText",
                                                "value":  false,
                                                "type":  "boolean"
                                            },
                                            {
                                                "id":  "4f54779d-0932-4ae4-bb18-3f9b33e06d51",
                                                "name":  "containsImages",
                                                "value":  true,
                                                "type":  "boolean"
                                            },
                                            {
                                                "id":  "0202b8be-161a-4363-8ee5-b79bc4f624cf",
                                                "name":  "contentType",
                                                "value":  "image-only",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "290844f3-7e01-42be-bd18-f814c7a7284b",
                                                "name":  "fileKey",
                                                "value":  "data",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "b8a8a8f8-19a1-4676-9af6-fd6b35f0fc8d",
                                                "name":  "data",
                                                "value":  "data",
                                                "type":  "binary"
                                            }
                                        ]
                    },
    "options":  {

                }
}
```

### Again Rename Binary Keys

| Field | Value |
| --- | --- |
| Node ID | e87cb3af-7f03-404e-b24a-5c9be2445a1d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -5392, -176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Flatten & Parse Extractor Output -> Again Rename Binary Keys (output 0, input 0)

**Outgoing Connections**

- Again Rename Binary Keys -> Switch - docs Extractor route (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map(item =\u003e {\n  // Just ensure it has a single binary key called \"data\"\n  const binaries = item.binary || {};\n  const keys = Object.keys(binaries);\n  if (keys.length === 0) return item;\n\n  const firstKey = keys[0];\n  const bin = binaries[firstKey];\n  // Keep structure intact\n  return {\n    json: item.json,\n    binary: { data: bin },\n  };\n});\n"
}
```

### Clean Markdown Formatting

| Field | Value |
| --- | --- |
| Node ID | 9afffc0f-3dec-4ac1-a202-3149f0580b8d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -928, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Markdown Content -> Clean Markdown Formatting (output 0, input 0)

**Outgoing Connections**

- Clean Markdown Formatting -> Convert md to docx (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Get text safely from previous node (supports both JSON and binary markdown)\nlet md = \"\";\n\n// Case 1: Markdown came as text field in JSON\nif (items[0]?.json?.output?.[0]?.content?.[0]?.text) {\n  md = items[0].json.output[0].content[0].text;\n}\n\n// Case 2: Markdown came as binary file\nelse if (items[0]?.binary?.data) {\n  md = Buffer.from(items[0].binary.data.data, \u0027base64\u0027).toString(\u0027utf8\u0027);\n}\n\n// Case 3: Markdown as plain text field\nelse if (items[0]?.json?.data) {\n  md = items[0].json.data;\n}\n\nelse {\n  return [{ json: { error: \"No markdown input found for cleaning\" } }];\n}\n\n// Clean and format Markdown\nlet cleaned = md\n  .replace(/#+\\s+/g, match =\u003e `\\n\\n${match}`) // add spacing before headings\n  .replace(/-{3,}/g, \u0027\\n\\n\\\\page\\n\\n\u0027)         // convert --- to page breaks\n  .replace(/\\n{3,}/g, \u0027\\n\\n\u0027)                  // collapse extra newlines\n  .trim();\n\nreturn [{\n  json: {\n    cleanedMarkdown: cleaned\n  }\n}];\n"
}
```

### Convert Base64 to Binary File of image type

| Field | Value |
| --- | --- |
| Node ID | 05c71371-c34e-43c0-b594-ba920edcf83a |
| Type | n8n-nodes-base.convertToFile |
| Type Version | 1.1 |
| Position | -4112, -704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Execute Command -> Convert Base64 to Binary File of image type (output 0, input 0)

**Outgoing Connections**

- Convert Base64 to Binary File of image type -> Add Metadata to Image File (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "toBinary",
    "sourceProperty":  "stdout",
    "options":  {

                }
}
```

### Convert md to docx

| Field | Value |
| --- | --- |
| Node ID | d70dfacb-303e-4a06-9ed9-36da5eb354b7 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | -720, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Clean Markdown Formatting -> Convert md to docx (output 0, input 0)

**Outgoing Connections**

- Convert md to docx -> Write Final Test Strategy File (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "http://127.0.0.1:8000/convert",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "markdown",
                                                  "value":  "={{ $(\u0027OpenAI - Generate Test Strategy\u0027).item.json.output[0].content[0].text }}"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### Detect File Type + Identify Text and/or Images

| Field | Value |
| --- | --- |
| Node ID | b474a556-20e9-4f3a-b0d2-1b56f62352f1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -7824, -192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook - Upload Test Docs -> Detect File Type + Identify Text and/or Images (output 0, input 0)

**Outgoing Connections**

- Detect File Type + Identify Text and/or Images -> Rename Binary File Keys (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// --- Detect File Type + Content Analyzer ---\n// Purpose: Segregate uploaded files based on file type, doc type, and content composition.\n\nconst newItems = [];\n\n// --- Advanced Lightweight analyzer for text/image detection ---\nasync function analyzeDocumentContent(fileType, base64Data) {\n  const buffer = Buffer.from(base64Data, \u0027base64\u0027);\n  let containsText = false;\n  let containsImages = false;\n\n  // Read only part of file to avoid memory overload\n  const sampleText = buffer.toString(\u0027utf8\u0027, 0, 50000);\n\n  switch (fileType) {\n    case \u0027pdf\u0027:\n      if (/BT|ET|\\/Font|\\/Text/i.test(sampleText)) containsText = true;\n      if (/\\/Image|\\/Subtype\\s*\\/Image/i.test(sampleText)) containsImages = true;\n      break;\n\n    case \u0027doc\u0027:\n      // DOCX/DOC internal relationships (text \u0026 images)\n      if (/\u003cw:t\u003e.*?\u003c\\/w:t\u003e/i.test(sampleText)) containsText = true;\n      if (/word\\/media\\//i.test(sampleText)) containsImages = true;\n      break;\n\n    case \u0027ppt\u0027:\n      if (/\u003ca:t\u003e.*?\u003c\\/a:t\u003e/i.test(sampleText)) containsText = true;\n      if (/ppt\\/media\\//i.test(sampleText)) containsImages = true;\n      break;\n  }\n\n  // Fallback: detect if itâ€™s probably text\n  if (!containsText \u0026\u0026 !containsImages) {\n    const textChars = sampleText.replace(/[^A-Za-z0-9\\s]/g, \u0027\u0027);\n    if (textChars.length \u003e 50) containsText = true;\n  }\n\n  return { containsText, containsImages };\n}\n\n// --- Main logic (must be async wrapper in n8n Code Node) ---\nreturn (async () =\u003e {\n  for (const item of items) {\n    const binaries = item.binary || {};\n\n    for (const [key, bin] of Object.entries(binaries)) {\n      if (!bin?.data) continue;\n\n      const fileName = (bin.fileName || key || \u0027\u0027).toString();\n      const mime = (bin.mimeType || \u0027\u0027).toLowerCase();\n      const lower = fileName.toLowerCase();\n\n      let fileType = \u0027unknown\u0027;\n      let docType = \u0027unknown\u0027;\n      let containsText = false;\n      let containsImages = false;\n\n      // --- Basic file type detection ---\n      if (mime.startsWith(\u0027image/\u0027) || /\\.(png|jpg|jpeg|gif|svg|webp)$/i.test(lower)) {\n        fileType = \u0027image\u0027;\n        containsImages = true;\n      } else if (/\\.(txt)$/i.test(lower)) {\n        fileType = \u0027text\u0027;\n        containsText = true;\n      } else if (/\\.(pdf)$/i.test(lower)) {\n        fileType = \u0027pdf\u0027;\n      } else if (/\\.(docx|doc)$/i.test(lower)) {\n        fileType = \u0027doc\u0027;\n      } else if (/\\.(pptx|ppt)$/i.test(lower)) {\n        fileType = \u0027ppt\u0027;\n      }\n\n      // --- docType classification ---\n      if (/brd/i.test(fileName)) docType = \u0027brd\u0027;\n      else if (/frd/i.test(fileName)) docType = \u0027frd\u0027;\n      else if (/hld/i.test(fileName)) docType = \u0027hld\u0027;\n      else if (/lld/i.test(fileName)) docType = \u0027lld\u0027;\n      else if (/transcript|grooming|meeting|discussion/i.test(fileName)) docType = \u0027transcript\u0027;\n      else if (fileType === \u0027ppt\u0027) docType = \u0027supporting\u0027;\n      else if (fileType === \u0027image\u0027) docType = \u0027image\u0027;\n      else docType = \u0027unknown\u0027;\n\n      // --- Analyze for content composition ---\n      if ([\u0027pdf\u0027, \u0027doc\u0027, \u0027ppt\u0027].includes(fileType)) {\n        const result = await analyzeDocumentContent(fileType, bin.data);\n        containsText = result.containsText;\n        containsImages = result.containsImages;\n      }\n\n      // --- Determine contentType ---\n      let contentType = \u0027unknown\u0027;\n      if (containsText \u0026\u0026 !containsImages) contentType = \u0027plain-text\u0027;\n      else if (!containsText \u0026\u0026 containsImages) contentType = \u0027image-only\u0027;\n      else if (containsText \u0026\u0026 containsImages) contentType = \u0027mixed\u0027;\n\n      console.log(`Analyzed ${fileName} â†’ ${contentType}`);\n\n      // --- Push result ---\n      newItems.push({\n        json: {\n          fileName,\n          fileType,\n          docType,\n          containsText,\n          containsImages,\n          contentType,\n          fileKey: key,\n        },\n        binary: {\n          [key]: bin,\n        },\n      });\n    }\n  }\n\n  return newItems;\n})();\n"
}
```

### Execute Command

| Field | Value |
| --- | --- |
| Node ID | 02fec503-086d-49d0-a68a-e6fe3d433d42 |
| Type | n8n-nodes-base.executeCommand |
| Type Version | 1 |
| Position | -4320, -704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Store Expanded Path -> Execute Command (output 0, input 0)

**Outgoing Connections**

- Execute Command -> Convert Base64 to Binary File of image type (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "command":  "=powershell -NoProfile -Command \"[System.Convert]::ToBase64String([IO.File]::ReadAllBytes(\u0027{{ $json.imagePathExpanded }}\u0027))\"\n"
}
```

### Expand Short Path

| Field | Value |
| --- | --- |
| Node ID | d21f4ab5-3647-43b1-bbdb-1be07f295e5c |
| Type | n8n-nodes-base.executeCommand |
| Type Version | 1 |
| Position | -4752, -704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch - docs Extractor route -> Expand Short Path (output 0, input 0)

**Outgoing Connections**

- Expand Short Path -> Store Expanded Path (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "command":  "=powershell -NoProfile -Command \"Get-Item -LiteralPath \u0027{{ $json.imageFiles[0] }}\u0027 | Select-Object -ExpandProperty FullName\""
}
```

### Extract BRD Text

| Field | Value |
| --- | --- |
| Node ID | 1280b5f1-e20a-4c36-a746-74478dbca2dc |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -4304, -416 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename binary key - BRD -> Extract BRD Text (output 0, input 0)

**Outgoing Connections**

- Extract BRD Text -> Merge extracted text from all docs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "pdf",
    "binaryPropertyName":  "brd",
    "options":  {

                }
}
```

### Extract FRD Text

| Field | Value |
| --- | --- |
| Node ID | 4e594631-1c3d-429c-a9b9-4f556239e78a |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -4304, -176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename binary key - FRD -> Extract FRD Text (output 0, input 0)

**Outgoing Connections**

- Extract FRD Text -> Merge extracted text from all docs (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "pdf",
    "binaryPropertyName":  "frd",
    "options":  {

                }
}
```

### Extract HLD Text

| Field | Value |
| --- | --- |
| Node ID | bb619cfb-5366-46f1-ad2e-c8df93c83ada |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -4304, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename binary key - HLD -> Extract HLD Text (output 0, input 0)

**Outgoing Connections**

- Extract HLD Text -> Merge extracted text from all docs (output 0, input 2)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "pdf",
    "binaryPropertyName":  "hld",
    "options":  {

                }
}
```

### Extract LLD Text

| Field | Value |
| --- | --- |
| Node ID | f3447a23-a783-4629-b14e-fe583bb697fd |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -4304, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename binary key - LLD -> Extract LLD Text (output 0, input 0)

**Outgoing Connections**

- Extract LLD Text -> Merge extracted text from all docs (output 0, input 3)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "pdf",
    "binaryPropertyName":  "lld",
    "options":  {

                }
}
```

### Extract Transcript Text

| Field | Value |
| --- | --- |
| Node ID | c1b88223-6880-4d5a-b87a-a9b9fa4474d8 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -4304, 544 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch - Find Extractor -> Extract Transcript Text (output 2, input 0)

**Outgoing Connections**

- Extract Transcript Text -> Normalize Transcript Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "text",
    "options":  {

                }
}
```

### Flatten & Parse Extractor Output

| Field | Value |
| --- | --- |
| Node ID | 2fa7965d-c9ed-4d40-b271-bc588b0a5fcb |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -5616, -176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge JSON Outputs -> Flatten & Parse Extractor Output (output 0, input 0)

**Outgoing Connections**

- Flatten & Parse Extractor Output -> Again Rename Binary Keys (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "let output = [];\n\nfor (const item of items) {\n\n  const out = item.json.stdout;\n  if (!out) throw new Error(\"No stdout returned from Python script.\");\n\n  let parsed;\n  try {\n    parsed = JSON.parse(out);\n  } catch (err) {\n    throw new Error(\"Invalid JSON in stdout: \" + out);\n  }\n\n  const arr = Array.isArray(parsed) ? parsed : [parsed];\n\n  // Main PDF entry (not extracted images)\n  const docInfo = arr.find(p =\u003e !p.isExtractedImage) || arr[0];\n\n  //\n  // 1ï¸âƒ£  Create MAIN PDF ITEM\n  //\n  const pdfItem = {\n    json: {\n      ...item.json,\n      parsedRaw: arr,\n      parsedContainsImage: docInfo.containsImage,\n      parsedImageCount: docInfo.imageCount,\n      parsedImageFiles: docInfo.imageFiles\n    },\n    binary: item.binary || {}\n  };\n\n  output.push(pdfItem);\n\n  //\n  // 2ï¸âƒ£  If extracted images exist â†’ create separate items\n  //\n  const extractedImages = arr.filter(p =\u003e p.isExtractedImage);\n\n  for (const img of extractedImages) {\n    const imgItem = {\n      json: {\n        sourceDoc: img.sourceDoc || item.json.fileName,\n        imageFile: img.file,\n        isExtractedImage: true,\n        imageCount: img.imageCount,\n        imageFiles: img.imageFiles\n      },\n      binary: {}     // keep empty now â€” can attach actual binary later if required\n    };\n\n    output.push(imgItem);\n  }\n}\n\nreturn output;\n"
}
```

### Merge extracted text from all docs

| Field | Value |
| --- | --- |
| Node ID | cedb057d-ca35-4be1-94c8-240acee33abf |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -3776, -192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Extract BRD Text -> Merge extracted text from all docs (output 0, input 0)
- Extract FRD Text -> Merge extracted text from all docs (output 0, input 1)
- Extract HLD Text -> Merge extracted text from all docs (output 0, input 2)
- Extract LLD Text -> Merge extracted text from all docs (output 0, input 3)

**Outgoing Connections**

- Merge extracted text from all docs -> Normalize Documents Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "numberInputs":  4
}
```

### Merge Images from 2 Sources

| Field | Value |
| --- | --- |
| Node ID | 682334e4-baf2-4418-b539-494e92d5c290 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -3696, -976 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch - Find Extractor -> Merge Images from 2 Sources (output 0, input 0)
- Add Metadata to Image File -> Merge Images from 2 Sources (output 0, input 1)

**Outgoing Connections**

- Merge Images from 2 Sources -> Open AI - Vision Extractor (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Merge JSON Outputs

| Field | Value |
| --- | --- |
| Node ID | cea63ed9-84f9-46ff-9370-152f7b14fb59 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -5840, -176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Run Python Extractor to extract images -> Merge JSON Outputs (output 0, input 1)
- Save Binary Files to local Disk -> Merge JSON Outputs (output 0, input 0)

**Outgoing Connections**

- Merge JSON Outputs -> Flatten & Parse Extractor Output (output 0, input 0)

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

### Merge Normalized Image + Docs + Transcript Text

| Field | Value |
| --- | --- |
| Node ID | 2459f630-acac-4cda-b891-7386dbc164f5 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -2048, -176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Wait -> Merge Normalized Image + Docs + Transcript Text (output 0, input 0)
- Wait1 -> Merge Normalized Image + Docs + Transcript Text (output 0, input 1)
- Wait2 -> Merge Normalized Image + Docs + Transcript Text (output 0, input 2)

**Outgoing Connections**

- Merge Normalized Image + Docs + Transcript Text -> Merged Context for OpenAI (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "numberInputs":  3
}
```

### Merged Context for OpenAI

| Field | Value |
| --- | --- |
| Node ID | 8aeb9ada-9e22-476c-bd2e-57c2dc1441ac |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1856, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Normalized Image + Docs + Transcript Text -> Merged Context for OpenAI (output 0, input 0)

**Outgoing Connections**

- Merged Context for OpenAI -> Pre-Processor + Summarizer + Token Estimator (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Merge all normalized document + transcript text into one large context\nlet allTexts = [];\n\nfor (const item of items) {\n  const src = item.json.sourceType || item.json.sourceName || item.json.source || \"Unknown Source\";\n  const txt = item.json.text || item.json.normalizedVisionText || \"\";\n\n  if (txt.trim()) {\n    allTexts.push(txt); // already has Source: tags\n  }\n}\n\n// Optional: Insert separator between sources\nconst merged = allTexts.join(\"\\n\\n---\\n\\n\");\n\nreturn [{\n  json: {\n    mergedContext: merged,\n    contextCount: allTexts.length\n  }\n}];\n"
}
```

### Normalize Documents Text

| Field | Value |
| --- | --- |
| Node ID | d88bbee0-b76b-483b-bc27-299793c42252 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -3552, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge extracted text from all docs -> Normalize Documents Text (output 0, input 0)

**Outgoing Connections**

- Normalize Documents Text -> Wait1 (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Normalize and tag each document extract with type headers\nconst cleanedDocs = [];\n\nfor (const item of items) {\n  const d = item.json || {};\n  const text = d.text || \"\";\n\n  // Identify document type\n  const type =\n    d.fileName?.match(/BRD|FRD|HLD|LLD/i)?.[0]?.toUpperCase() || \"DOCUMENT\";\n\n  // Basic cleaning: remove extra spaces, page numbers, headers/footers\n  const cleaned = text\n    .replace(/\\bPage\\s+\\d+\\b/gi, \"\") // remove page numbers\n    .replace(/\\n\\s*\\n\\s*\\n+/g, \"\\n\\n\") // collapse multiple newlines\n    .replace(/[ \\t]{2,}/g, \" \") // remove excessive spaces\n    .trim();\n\n  cleanedDocs.push({\n    json: {\n      sourceName: d.fileName || \"Unknown Document\",\n      sourceType: type,\n      text: `### Source: ${type}\\n${cleaned}`,\n      timestamp: new Date().toISOString(),\n    },\n  });\n}\n\nreturn cleanedDocs;\n"
}
```

### Normalize Image Vision Text

| Field | Value |
| --- | --- |
| Node ID | 669b5b1e-7407-4f59-9065-b65ecbd6f0b1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -3216, -976 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Open AI - Vision Extractor -> Normalize Image Vision Text (output 0, input 0)

**Outgoing Connections**

- Normalize Image Vision Text -> Wait (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "/**\n * Normalize text extracted by OpenAI Vision or similar models.\n * Cleans and standardizes Vision output while preserving metadata (e.g. fileName, docType).\n * Works for OpenAI \"Analyze Image\" output or other message-based formats.\n */\n\nconst newItems = [];\n\nfor (const outer of items) {\n  const meta = outer.json || {};\n\n  // Some OpenAI Vision responses are nested message arrays or structured responses\n  const messageArray = Array.isArray(meta) ? meta\n    : meta.content ? [meta]\n    : Array.isArray(outer) ? outer\n    : [outer];\n\n  for (const msg of messageArray) {\n    let text = \u0027\u0027;\n\n    // --- Extract text safely from common OpenAI output formats ---\n    if (msg?.json?.text) {\n      text = msg.json.text;\n    } else if (msg?.text) {\n      text = msg.text;\n    } else if (msg?.content \u0026\u0026 Array.isArray(msg.content)) {\n      const contentText = msg.content.find(c =\u003e c.type === \u0027output_text\u0027);\n      if (contentText?.text) text = contentText.text;\n    } else if (typeof msg === \u0027string\u0027) {\n      text = msg;\n    }\n\n    if (typeof text !== \u0027string\u0027) text = String(text || \u0027\u0027);\n\n    // --- Step 1: Basic cleanup ---\n    text = text\n      .replace(/\\r\\n/g, \u0027\\n\u0027)\n      .replace(/[ \\t]+/g, \u0027 \u0027)\n      .replace(/\\n{2,}/g, \u0027\\n\\n\u0027)\n      .replace(/\\f/g, \u0027 \u0027)\n      .trim();\n\n    // --- Step 2: Remove repeated or noisy labels ---\n    const lines = text.split(\u0027\\n\u0027);\n    const seen = new Set();\n    const filtered = lines.filter(line =\u003e {\n      const l = line.trim().toLowerCase();\n      if (!l || seen.has(l)) return false;\n      seen.add(l);\n      if (/^(diagram|figure|screenshot|ui|image|architecture|flow|mockup)/i.test(l)) return false;\n      return true;\n    });\n    text = filtered.join(\u0027\\n\u0027).trim();\n\n    // --- Step 3: Normalize punctuation ---\n    text = text\n      .replace(/\\s+([.,;:!?])/g, \u0027$1\u0027)\n      .replace(/([.,;:!?])([^\\s])/g, \u0027$1 $2\u0027)\n      .replace(/\\s{2,}/g, \u0027 \u0027);\n\n    // --- Step 4: Capitalize sentence starts ---\n    text = text.replace(/(^|[.!?]\\s+)([a-z])/g, (_, prefix, c) =\u003e prefix + c.toUpperCase());\n\n    // --- Step 5: Truncate if Vision returns long structured dumps ---\n    if (text.length \u003e 5000) {\n      text = text.slice(0, 5000) + \u0027... [truncated for processing]\u0027;\n    }\n\n    // --- Step 6: Attach metadata for merging later ---\n    const normalized = {\n      normalizedVisionText: text,\n      source: \u0027Vision\u0027,\n      cleaningStatus: \u0027normalized\u0027,\n      fileName: $(\u0027Switch - Find Extractor\u0027).first().json.fileName || \u0027Unknown_File\u0027,\n      fileType: $(\u0027Switch - Find Extractor\u0027).first().json.fileType || \u0027Unknown\u0027,\n      docType: $(\u0027Switch - Find Extractor\u0027).first().json.docType || \u0027Unknown\u0027,\n      requiresVision: $(\u0027Switch - Find Extractor\u0027).first().json.requiresVision ?? true,\n      contentType: $(\u0027Switch - Find Extractor\u0027).first().json.contentType || \u0027image\u0027,\n    };\n\n    newItems.push({ json: normalized });\n  }\n}\n\nreturn newItems;\n"
}
```

### Normalize Transcript Text

| Field | Value |
| --- | --- |
| Node ID | 78bf3cb9-ec56-4265-ad3e-807b183c7d4d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -3408, 544 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Extract Transcript Text -> Normalize Transcript Text (output 0, input 0)

**Outgoing Connections**

- Normalize Transcript Text -> Wait2 (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Normalize and tag Grooming Transcript\nlet combinedText = \u0027\u0027;\n\nfor (const item of items) {\n  // after extraction, text is inside item.json.data\n  const text = item.json?.data?.toString().trim();\n  if (text) combinedText += \u0027\\n\u0027 + text;\n}\n\n// cleanup formatting\ncombinedText = combinedText\n  .replace(/\\r/g, \u0027\u0027)\n  .replace(/\\n{3,}/g, \u0027\\n\\n\u0027)\n  .replace(/[ \\t]{2,}/g, \u0027 \u0027)\n  .trim();\n\nreturn [\n  {\n    json: {\n      sourceName: \"Grooming Transcript\",\n      sourceType: \"TRANSCRIPT\",\n      text: `### Source: GROOMING TRANSCRIPT\\n${combinedText}`,\n      timestamp: new Date().toISOString()\n    }\n  }\n];\n"
}
```

### Open AI - Vision Extractor

| Field | Value |
| --- | --- |
| Node ID | 48bd13ff-460c-49a2-9d0e-0f7d8914d83e |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | -3456, -976 |
| Disabled |  |
| Always Output Data | False |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Images from 2 Sources -> Open AI - Vision Extractor (output 0, input 0)

**Outgoing Connections**

- Open AI - Vision Extractor -> Normalize Image Vision Text (output 0, input 0)

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
    "resource":  "image",
    "operation":  "analyze",
    "modelId":  {
                    "__rl":  true,
                    "value":  "gpt-4o-mini",
                    "mode":  "list",
                    "cachedResultName":  "GPT-4O-MINI"
                },
    "text":  "=You are analyzing visual content from a software document ({{ $json.docType }}).\nExtract and summarize:\n1. Any readable text in the image.\n2. Describe diagrams or flows in simple sentences.\n3. Identify if it shows requirements, features, user flows, or architecture.\nReturn a clean, structured text summary suitable for inclusion in a test plan document.\n",
    "inputType":  "base64",
    "binaryPropertyName":  "=data",
    "options":  {

                }
}
```

### OpenAI - Generate Test Strategy

| Field | Value |
| --- | --- |
| Node ID | 248715c6-e304-4b35-8fcf-cbbeb259bd92 |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | -1456, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Pre-Processor + Summarizer + Token Estimator -> OpenAI - Generate Test Strategy (output 0, input 0)

**Outgoing Connections**

- OpenAI - Generate Test Strategy -> Prepare Markdown Content (output 0, input 0)

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
                                         "content":  "You are a Senior QA Test Manager and Enterprise Test Strategy Consultant with more than 15 years of experience defining testing standards, quality governance frameworks, and automation-first transformation programs. \n\nYou specialize in:\n- Shift-Left \u0026 Shift-Right quality engineering approaches\n- CI/CD-integrated automated testing pipelines\n- Scalable test architecture across UI, API, performance, and security layers\n- Risk-based and metrics-driven software delivery governance\n\nYou excel at interpreting and synthesizing:\n- Business Requirement Documents (BRD)\n- Functional Requirement Documents (FRD)\n- Low-Level and High-Level Designs (LLD \u0026 HLD)\n- Grooming transcripts and stakeholder discussions\n\nYour outputs must demonstrate:\n- Strategic reasoning supported by traceable statements from the provided context\n- A strong linkage between **business intent â†’ architecture/design implications â†’ test strategy â†’ automation enablement â†’ risk mitigation**\n- A structured, enterprise-grade quality strategy suitable for CXO/leadership consumption\n- Deep elaboration, beyond basic bullet points, showing practical execution methodologies, governance layers, and measurable KPIs\n\nYour writing style should reflect:\n- Professional tone suitable for board-level review\n- Detailed, actionable, and solution-oriented content with clear justification\n- Balanced technical and managerial viewpoint\n"
                                     },
                                     {
                                         "content":  "You are provided with a merged context that combines information from BRD, FRD, HLD, LLD, UI/UX specifications, and grooming session transcripts. \nThis content includes requirements, workflows, data flows, system architecture, constraints, dependencies, and stakeholder expectations.\n\nYour task is to analyze the context and generate a **comprehensive and production-grade Test Strategy document**, aligned with **Shift-Left**, **Automation-First**, and **Quality Engineering** principles.\n\n=========================\nINSTRUCTIONS (MUST FOLLOW)\n=========================\n\n1. Use direct excerpts or paraphrased statements from the source materials where relevant.\n   - Quote key statements in italics or blockquotes to maintain authenticity.\n   - Cite origin using â€œAs mentioned in BRDâ€¦â€, â€œAccording to HLDâ€¦â€, etc.\n2. Provide deep explanation instead of generic bullet lists â€” elaborate how and why decisions are made.\n3. Demonstrate end-to-end traceability between:\n   **business requirements â†’ test strategy â†’ automation enablement â†’ quality metrics â†’ risk \u0026 mitigation**\n4. Include frameworks, methodology, and governance recommendations.\n5. Use tables, matrices, and hierarchical bullet structures where beneficial.\n6. Minimum expected length per major section: **900 â€“ 1500 words**.\n7. The output must be detailed enough to be presented to engineering leadership and auditors.\n\n====================\nDOCUMENT STRUCTURE\n====================\n\n### Test Strategy Document Structure\n\n1. **Introduction \u0026 Context**\n   - Problem statement \u0026 business need\n   - Strategic objectives of testing\n   - Alignment with enterprise quality vision and success criteria\n\n2. **Testing Scope**\n   - In-scope functional \u0026 non-functional areas (with references)\n   - Out-of-scope items \u0026 rationale\n\n3. **Strategic Testing Approach**\n   - Shift-Left adoption strategy\n   - Shift-Right validation strategy (where applicable)\n   - Testing model (Agile / DevOps / CI-CD-based)\n   - Test levels: Unit, Component, API, UI, E2E, UAT, NFR\n   - Governance and quality gates\n\n4. **Automation Strategy \u0026 Roadmap**\n   - Automation pyramid model alignment\n   - Tools, frameworks, CI/CD orchestration\n   - Prioritization matrix \u0026 ROI considerations\n   - In-sprint automation approach\n   - Resilience \u0026 maintainability standards\n\n5. **Test Environment \u0026 Infrastructure Strategy**\n   - Environment model \u0026 provisioning\n   - Service virtualization \u0026 mocks\n   - Data refresh, versioning \u0026 cloning strategies\n\n6. **Test Data Management Strategy**\n   - Data sourcing (synthetic, masked, production-like)\n   - Boundary / negative / chaos data\n   - Automation-driven data pipeline\n\n7. **Quality Metrics \u0026 Reporting Framework**\n   - KPIs, KRAs, SLAs (Defect density, leakage rate, DRE %, automation coverage etc.)\n   - Dashboards \u0026 transparency mechanisms\n\n8. **Risk-Based Testing \u0026 Mitigation Strategy**\n   - Identified risks + corresponding mitigation \u0026 contingency mapping\n   - Priority-based testing means: risk Ã— impact Ã— likelihood scoring\n\n9. **Roles, Collaboration \u0026 RACI Model**\n\n10. **Compliance, Security \u0026 Regulatory Considerations**\n    - OWASP, data privacy, audit logs, adherence requirements\n\n11. **Tooling \u0026 Integration Landscape**\n    - CI/CD, test frameworks, monitoring \u0026 observability\n\n12. **Communication \u0026 Governance Model**\n\n13. **Appendix / Traceability Matrix**\n    | Source Document | Key Insight | Test Strategy Implication | Automation Feasibility |\n\n======================\nMerged Context (cleaned)\n======================\n{{$json[\"summary\"]}}"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  6000,
                    "temperature":  0.5
                }
}
```

### Prepare Markdown Content

| Field | Value |
| --- | --- |
| Node ID | ba58bc87-da67-4ee4-87c8-32fb810dadec |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1120, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI - Generate Test Strategy -> Prepare Markdown Content (output 0, input 0)

**Outgoing Connections**

- Prepare Markdown Content -> Clean Markdown Formatting (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: {}, binary: { data: { data: Buffer.from($input.first().json.output[0].content[0].text, \u0027utf8\u0027), mimeType: \u0027text/markdown\u0027, fileName: \u0027Merged-Test-Plan.md\u0027 } } }];"
}
```

### Pre-Processor + Summarizer + Token Estimator

| Field | Value |
| --- | --- |
| Node ID | 347e45cf-fe1e-477f-be26-e55ba61eb7e3 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1648, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merged Context for OpenAI -> Pre-Processor + Summarizer + Token Estimator (output 0, input 0)

**Outgoing Connections**

- Pre-Processor + Summarizer + Token Estimator -> OpenAI - Generate Test Strategy (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// n8n Code node (JavaScript) - Preprocessor + Balanced Summarizer + Token Estimator\n// Input expected: items = [{ json: { mergedContext: \"....\", contextCount: N } }, ...]\n// Outputs: mergedContextCleaned, originalChars, cleanedChars, originalTokens, cleanedTokens, summaryTokens, summary, sections[]\n\nconst STOPWORDS = new Set([\n  \"the\",\"and\",\"is\",\"in\",\"it\",\"of\",\"to\",\"a\",\"for\",\"with\",\"on\",\"that\",\"as\",\"are\",\"be\",\"this\",\"by\",\"or\",\"an\",\"from\",\n  \"at\",\"we\",\"will\",\"should\",\"can\",\"which\",\"their\",\"have\",\"has\",\"not\",\"but\",\"if\",\"they\",\"these\",\"such\",\"may\",\"also\"\n]);\n\nfunction estimateTokensFromChars(chars) {\n  // Practical approximation: 1 token ~= 4 characters\n  // Adjust factor if you want more conservative estimate\n  return Math.max(1, Math.ceil(chars / 4));\n}\n\nfunction splitToSentences(text) {\n  // Simple sentence splitter - handles ., ?, !\n  // Keep short sentences intact\n  return text\n    .replace(/\\r\\n/g, \"\\n\")\n    .replace(/\\n+/g, \"\\n\")\n    .split(/(?\u003c=[.?!])\\s+(?=[A-Z0-9\"\u0027\\(\\[])/g)\n    .map(s =\u003e s.trim())\n    .filter(Boolean);\n}\n\nfunction scoreSentences(sentences, topNwords=120) {\n  // Simple frequency-based scoring (extractive)\n  const freq = {};\n  for (const s of sentences) {\n    const words = s.toLowerCase().replace(/[^a-z0-9\\s]/g, \" \").split(/\\s+/).filter(Boolean);\n    for (const w of words) {\n      if (STOPWORDS.has(w)) continue;\n      freq[w] = (freq[w] || 0) + 1;\n    }\n  }\n  // normalize and score\n  const scores = sentences.map(s =\u003e {\n    const words = s.toLowerCase().replace(/[^a-z0-9\\s]/g, \" \").split(/\\s+/).filter(Boolean);\n    let sc = 0;\n    for (const w of words) {\n      if (freq[w]) sc += freq[w];\n    }\n    // length-normalize a bit\n    sc = sc / Math.sqrt(Math.max(1, words.length));\n    return sc;\n  });\n  return scores;\n}\n\nfunction dedupeParagraphs(paragraphs) {\n  // Exact + lightweight fuzzy using trigram set Jaccard\n  const seen = [];\n  const out = [];\n  function ngrams(text, n=3){\n    const s = text.toLowerCase().replace(/\\s+/g, \" \").trim();\n    const out = [];\n    for (let i=0;i\u003cs.length-(n-1);i++){\n      out.push(s.slice(i,i+n));\n    }\n    return new Set(out);\n  }\n  for (const p of paragraphs) {\n    const pnorm = p.trim();\n    if (!pnorm) continue;\n    let isDup = false;\n    for (const s of seen) {\n      if (pnorm === s.raw) { isDup = true; break; }\n      // jaccard of char ngrams\n      const a = ngrams(pnorm), b = s.ng;\n      const inter = [...a].filter(x =\u003e b.has(x)).length;\n      const union = new Set([...a, ...b]).size;\n      const j = union === 0 ? 0 : inter/union;\n      if (j \u003e 0.85) { isDup = true; break; } // high threshold to avoid false positives\n    }\n    if (!isDup) {\n      seen.push({ raw: pnorm, ng: ngrams(pnorm) });\n      out.push(pnorm);\n    }\n  }\n  return out;\n}\n\nfunction normalizeHeadingsAndRemoveUndefined(md) {\n  // Remove \"## undefined\", orphan code fences; normalize \\page markers\n  let s = md.replace(/```(?:markdown)?/gi, \"\\n\"); // remove code fences markers\n  s = s.replace(/\\\\page/g, \"\\n\\n---\\n\\n\"); // unify page breaks\n  // remove headings that are just \u0027undefined\u0027 or blank\n  s = s.replace(/^(#{1,6})\\s*(undefined)\\s*$/gim, \"\");\n  // collapse excessive newlines\n  s = s.replace(/\\n{3,}/g, \"\\n\\n\");\n  return s.trim();\n}\n\nfunction splitIntoSections(text) {\n  // If markdown headings exist (h2/h3), split by them; otherwise return single section\n  const lines = text.split(\"\\n\");\n  const sections = [];\n  let curTitle = \"Document\";\n  let curBuf = [];\n\n  const headingRe = /^(#{1,6})\\s*(.+)$/;\n  for (let line of lines) {\n    const m = line.match(headingRe);\n    if (m) {\n      // flush\n      if (curBuf.length) {\n        sections.push({ sectionName: curTitle, text: curBuf.join(\"\\n\").trim() });\n      }\n      curTitle = m[2].trim();\n      curBuf = [];\n    } else {\n      curBuf.push(line);\n    }\n  }\n  if (curBuf.length) sections.push({ sectionName: curTitle, text: curBuf.join(\"\\n\").trim() });\n  return sections;\n}\n\nfunction summarizeExtractive(text, tokenBudget, mode=\"balanced\") {\n  // mode: \u0027concise\u0027 (more aggressive), \u0027balanced\u0027, \u0027detailed\u0027 (less aggressive)\n  if (!text || !text.trim()) return { summary: \"\", tokens: 0, chars: 0 };\n\n  const sentences = splitToSentences(text);\n  if (sentences.length === 0) return { summary: \"\", tokens: 0, chars: 0 };\n\n  const scores = scoreSentences(sentences);\n  // pair and sort\n  const pairs = sentences.map((s,i)=\u003e({s, score: scores[i], idx:i, chars: s.length}));\n  pairs.sort((a,b)=\u003eb.score - a.score);\n\n  // select sentences until tokenBudget reached (estimate)\n  const chosen = [];\n  let charsCount = 0;\n  for (const p of pairs) {\n    const estTokens = estimateTokensFromChars(p.chars);\n    const currentTokens = estimateTokensFromChars(charsCount);\n    if (currentTokens + estTokens \u003e tokenBudget) continue;\n    // Keep ordering by original index for readability\n    chosen.push(p);\n    charsCount += p.chars;\n  }\n\n  // If nothing selected (budget too small), pick top 1 sentence\n  if (chosen.length === 0) {\n    const top = pairs[0];\n    chosen.push(top);\n    charsCount = top.chars;\n  }\n\n  // Order chosen sentences by original order\n  chosen.sort((a,b)=\u003ea.idx - b.idx);\n  const summary = chosen.map(x=\u003ex.s).join(\" \");\n\n  return { summary: summary.trim(), tokens: estimateTokensFromChars(charsCount), chars: charsCount };\n}\n\n// -------------------- Main Node Logic --------------------\n\nconst inputs = items.map(i=\u003ei.json);\nconst mergedRaw = inputs.map(i=\u003ei.mergedContext || \"\").join(\"\\n\\n---\\n\\n\");\nconst contextCount = inputs.reduce((acc,i)=\u003e acc + (i.contextCount || 0), 0);\n\n// 1) Normalize and remove obvious garbage\nlet cleaned = normalizeHeadingsAndRemoveUndefined(mergedRaw);\n\n// 2) Break into paragraphs and dedupe\nconst paragraphs = cleaned.split(/\\n{2,}/).map(p=\u003ep.trim()).filter(Boolean);\nconst dedupedParas = dedupeParagraphs(paragraphs);\n\n// rebuild cleaned context\ncleaned = dedupedParas.join(\"\\n\\n\");\n\n// 3) Split into sections (by headings if any)\nconst sections = splitIntoSections(cleaned);\n\n// If sections are just single \u0027Document\u0027 and very long, optionally try to chunk by length\n// But for balanced mode we will still summarize\n\n// 4) Compute sizes and token estimates\nconst originalChars = mergedRaw.length;\nconst cleanedChars = cleaned.length;\nconst originalTokens = estimateTokensFromChars(originalChars);\nconst cleanedTokens = estimateTokensFromChars(cleanedChars);\n\n// 5) Summarize: balanced mode target\nconst TARGET_TOKENS_FOR_LLM = 6500; // \u003c--- tune this to control LLM cost\n// If cleanedTokens already less than target, return full cleaned text as summary-friendly\nlet summaryText = \"\";\nlet summaryTokens = 0;\n\n// Option B = Balanced summarization: summarize per-section but preserve sections until budget\nif (cleanedTokens \u003c= TARGET_TOKENS_FOR_LLM) {\n  summaryText = cleaned;\n  summaryTokens = cleanedTokens;\n} else {\n  // Distribute budget across sections proportional to section size\n  const sectionsInfo = sections.map(sec=\u003e{\n    const chars = sec.text.length;\n    const tokens = estimateTokensFromChars(chars);\n    return { sectionName: sec.sectionName, text: sec.text, chars, tokens };\n  });\n\n  const totalTokensSection = sectionsInfo.reduce((a,b)=\u003ea + b.tokens, 0) || 1;\n  const perSectionSummaries = [];\n  let tokensUsed = 0;\n\n  for (const s of sectionsInfo) {\n    // allocate proportional budget but at least 80 tokens for small sections\n    const alloc = Math.max(120, Math.floor((s.tokens / totalTokensSection) * (TARGET_TOKENS_FOR_LLM - 200)));\n    const summ = summarizeExtractive(s.text, alloc, \"detailed\");\n    perSectionSummaries.push({ sectionName: s.sectionName, summary: summ.summary, chars: summ.chars, tokens: summ.tokens });\n    tokensUsed += summ.tokens;\n  }\n\n  // Build final summary text by joining section summaries\n  summaryText = perSectionSummaries.map(s=\u003e `## ${s.sectionName}\\n\\n${s.summary}`).join(\"\\n\\n\");\n  summaryTokens = tokensUsed;\n}\n\n// 6) Prepare section-level summaries for output (use smaller local budgets)\nconst sectionOutputs = sections.map(sec =\u003e {\n  const secTokens = estimateTokensFromChars(sec.text.length);\n  const budget = Math.max(60, Math.floor(Math.min(secTokens, 300))); // small budget per section\n  const summ = summarizeExtractive(sec.text, budget, \"detailed\");\n  return {\n    sectionName: sec.sectionName,\n    text: sec.text,\n    chars: sec.text.length,\n    tokens: estimateTokensFromChars(sec.text.length),\n    summary: summ.summary,\n    summaryChars: summ.chars,\n    summaryTokens: summ.tokens\n  };\n});\n\n// return single output item\nreturn [\n  {\n    json: {\n      mergedContextCleaned: cleaned,\n      contextCount: contextCount,\n      originalChars,\n      cleanedChars,\n      originalTokens,\n      cleanedTokens,\n      targetTokensForLLM: TARGET_TOKENS_FOR_LLM,\n      summaryTokens,\n      summary: summaryText,\n      sections: sectionOutputs\n    }\n  }\n];\n"
}
```

### Rename Binary File Keys

| Field | Value |
| --- | --- |
| Node ID | 093a94ba-5397-48bf-8945-aaf7ba22a81b |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -7600, -192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Detect File Type + Identify Text and/or Images -> Rename Binary File Keys (output 0, input 0)

**Outgoing Connections**

- Rename Binary File Keys -> Switch - Find Extractor (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map(item =\u003e {\n  // Just ensure it has a single binary key called \"data\"\n  const binaries = item.binary || {};\n  const keys = Object.keys(binaries);\n  if (keys.length === 0) return item;\n\n  const firstKey = keys[0];\n  const bin = binaries[firstKey];\n  // Keep structure intact\n  return {\n    json: item.json,\n    binary: { data: bin },\n  };\n});\n"
}
```

### Rename binary key - BRD

| Field | Value |
| --- | --- |
| Node ID | 102d9470-5ac9-4744-a57c-e7672f5d2f47 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4528, -416 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch - docs Extractor route -> Rename binary key - BRD (output 1, input 0)

**Outgoing Connections**

- Rename binary key - BRD -> Extract BRD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return items.map(item =\u003e {\n  const binKey = Object.keys(item.binary || {})[0]; // get current binary key\n  if (binKey) {\n    item.binary.brd = item.binary[binKey]; // rename to brd\n    delete item.binary[binKey]; // clean up old key (optional)\n  }\n  return item;\n});\n"
}
```

### Rename binary key - FRD

| Field | Value |
| --- | --- |
| Node ID | 0bb87bd4-de43-4637-a0a2-8de7f9d69022 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4528, -176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch - docs Extractor route -> Rename binary key - FRD (output 2, input 0)

**Outgoing Connections**

- Rename binary key - FRD -> Extract FRD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return items.map(item =\u003e {\n  const binKey = Object.keys(item.binary || {})[0]; // get current binary key\n  if (binKey) {\n    item.binary.frd = item.binary[binKey]; // rename to brd\n    delete item.binary[binKey]; // clean up old key (optional)\n  }\n  return item;\n});\n"
}
```

### Rename binary key - HLD

| Field | Value |
| --- | --- |
| Node ID | 21ddae33-3372-428d-a308-0d7bc29c0af0 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4528, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch - docs Extractor route -> Rename binary key - HLD (output 3, input 0)

**Outgoing Connections**

- Rename binary key - HLD -> Extract HLD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return items.map(item =\u003e {\n  const binKey = Object.keys(item.binary || {})[0]; // get current binary key\n  if (binKey) {\n    item.binary.hld = item.binary[binKey]; // rename to brd\n    delete item.binary[binKey]; // clean up old key (optional)\n  }\n  return item;\n});\n"
}
```

### Rename binary key - LLD

| Field | Value |
| --- | --- |
| Node ID | 8fd55335-3baf-4a0d-bf29-c7608aaac023 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4528, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch - docs Extractor route -> Rename binary key - LLD (output 4, input 0)

**Outgoing Connections**

- Rename binary key - LLD -> Extract LLD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return items.map(item =\u003e {\n  const binKey = Object.keys(item.binary || {})[0]; // get current binary key\n  if (binKey) {\n    item.binary.lld = item.binary[binKey]; // rename to brd\n    delete item.binary[binKey]; // clean up old key (optional)\n  }\n  return item;\n});\n"
}
```

### Run Python Extractor to extract images

| Field | Value |
| --- | --- |
| Node ID | 3cae80f4-9bec-4c82-b924-b0420203349c |
| Type | n8n-nodes-base.executeCommand |
| Type Version | 1 |
| Position | -6048, -80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Save Binary Files to local Disk -> Run Python Extractor to extract images (output 0, input 0)

**Outgoing Connections**

- Run Python Extractor to extract images -> Merge JSON Outputs (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "executeOnce":  false,
    "command":  "=python \"C:\\\\Users\\\\anujalhans01\\\\DOCUMENT-PARSER\\\\extract_images.py\" {{ $json.fileName }}"
}
```

### Save Binary Files to local Disk

| Field | Value |
| --- | --- |
| Node ID | 1b3f5cd8-05ec-41b5-9dcb-29809f3c34b9 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | -6288, -192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch - Find Extractor -> Save Binary Files to local Disk (output 1, input 0)

**Outgoing Connections**

- Save Binary Files to local Disk -> Run Python Extractor to extract images (output 0, input 0)
- Save Binary Files to local Disk -> Merge JSON Outputs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "write",
    "fileName":  "=C:\\\\Users\\\\anujalhans01\\\\n8n-temp-files\\\\{{$json.fileName}}",
    "options":  {

                }
}
```

### Store Expanded Path

| Field | Value |
| --- | --- |
| Node ID | ae555575-b3ff-4159-a644-f6f31005570d |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -4528, -704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Expand Short Path -> Store Expanded Path (output 0, input 0)

**Outgoing Connections**

- Store Expanded Path -> Execute Command (output 0, input 0)

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
                                                "id":  "1d1284ae-8f0e-4f42-af0d-205d99fe68bc",
                                                "name":  "imagePathExpanded",
                                                "value":  "={{ $node[\"Expand Short Path\"].json.stdout.trim().replace(/^\"|\"$/g, \u0027\u0027) }}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "options":  {

                }
}
```

### Switch - docs Extractor route

| Field | Value |
| --- | --- |
| Node ID | e83e0f21-374d-49c6-bd46-de5ba570bf2c |
| Type | n8n-nodes-base.switch |
| Type Version | 3.3 |
| Position | -5168, -224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Again Rename Binary Keys -> Switch - docs Extractor route (output 0, input 0)

**Outgoing Connections**

- Switch - docs Extractor route -> Expand Short Path (output 0, input 0)
- Switch - docs Extractor route -> Rename binary key - BRD (output 1, input 0)
- Switch - docs Extractor route -> Rename binary key - FRD (output 2, input 0)
- Switch - docs Extractor route -> Rename binary key - HLD (output 3, input 0)
- Switch - docs Extractor route -> Rename binary key - LLD (output 4, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "rules":  {
                  "values":  [
                                 {
                                     "conditions":  {
                                                        "options":  {
                                                                        "caseSensitive":  true,
                                                                        "leftValue":  "",
                                                                        "typeValidation":  "strict",
                                                                        "version":  2
                                                                    },
                                                        "conditions":  [
                                                                           {
                                                                               "leftValue":  "={{ $json.isExtractedImage }}",
                                                                               "rightValue":  "brd",
                                                                               "operator":  {
                                                                                                "type":  "boolean",
                                                                                                "operation":  "true",
                                                                                                "singleValue":  true
                                                                                            },
                                                                               "id":  "6531d6fe-de15-4121-b8fe-ce053cbf9af5"
                                                                           }
                                                                       ],
                                                        "combinator":  "and"
                                                    }
                                 },
                                 {
                                     "conditions":  {
                                                        "options":  {
                                                                        "caseSensitive":  true,
                                                                        "leftValue":  "",
                                                                        "typeValidation":  "strict",
                                                                        "version":  2
                                                                    },
                                                        "conditions":  [
                                                                           {
                                                                               "id":  "23c97bf0-d89b-47f8-80eb-0daa733b2a56",
                                                                               "leftValue":  "={{ $json.docType }}",
                                                                               "rightValue":  "brd",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "equals",
                                                                                                "name":  "filter.operator.equals"
                                                                                            }
                                                                           }
                                                                       ],
                                                        "combinator":  "and"
                                                    }
                                 },
                                 {
                                     "conditions":  {
                                                        "options":  {
                                                                        "caseSensitive":  true,
                                                                        "leftValue":  "",
                                                                        "typeValidation":  "strict",
                                                                        "version":  2
                                                                    },
                                                        "conditions":  [
                                                                           {
                                                                               "id":  "d14bf545-fe2e-431e-af66-5d7ff5a964a6",
                                                                               "leftValue":  "={{ $json.docType }}",
                                                                               "rightValue":  "frd",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "equals",
                                                                                                "name":  "filter.operator.equals"
                                                                                            }
                                                                           }
                                                                       ],
                                                        "combinator":  "and"
                                                    }
                                 },
                                 {
                                     "conditions":  {
                                                        "options":  {
                                                                        "caseSensitive":  true,
                                                                        "leftValue":  "",
                                                                        "typeValidation":  "strict",
                                                                        "version":  2
                                                                    },
                                                        "conditions":  [
                                                                           {
                                                                               "id":  "73dd074b-78f0-4c06-b110-7c6208be4455",
                                                                               "leftValue":  "={{ $json.docType }}",
                                                                               "rightValue":  "hld",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "equals",
                                                                                                "name":  "filter.operator.equals"
                                                                                            }
                                                                           }
                                                                       ],
                                                        "combinator":  "and"
                                                    }
                                 },
                                 {
                                     "conditions":  {
                                                        "options":  {
                                                                        "caseSensitive":  true,
                                                                        "leftValue":  "",
                                                                        "typeValidation":  "strict",
                                                                        "version":  2
                                                                    },
                                                        "conditions":  [
                                                                           {
                                                                               "id":  "c0e1edfb-e09d-46f0-91e7-b3eaa0be4d7d",
                                                                               "leftValue":  "={{ $json.docType }}",
                                                                               "rightValue":  "lld",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "equals"
                                                                                            }
                                                                           }
                                                                       ],
                                                        "combinator":  "and"
                                                    }
                                 }
                             ]
              },
    "options":  {

                }
}
```

### Switch - Find Extractor

| Field | Value |
| --- | --- |
| Node ID | e53b1430-694c-4aff-9f64-800692199d3b |
| Type | n8n-nodes-base.switch |
| Type Version | 3.3 |
| Position | -7376, -208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename Binary File Keys -> Switch - Find Extractor (output 0, input 0)

**Outgoing Connections**

- Switch - Find Extractor -> Merge Images from 2 Sources (output 0, input 0)
- Switch - Find Extractor -> Save Binary Files to local Disk (output 1, input 0)
- Switch - Find Extractor -> Extract Transcript Text (output 2, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "rules":  {
                  "values":  [
                                 {
                                     "conditions":  {
                                                        "options":  {
                                                                        "caseSensitive":  true,
                                                                        "leftValue":  "",
                                                                        "typeValidation":  "strict",
                                                                        "version":  2
                                                                    },
                                                        "conditions":  [
                                                                           {
                                                                               "id":  "c1ae99e2-4534-4205-8930-e7a422d34718",
                                                                               "leftValue":  "={{ $json.contentType }}",
                                                                               "rightValue":  "image-only",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "equals"
                                                                                            }
                                                                           }
                                                                       ],
                                                        "combinator":  "and"
                                                    }
                                 },
                                 {
                                     "conditions":  {
                                                        "options":  {
                                                                        "caseSensitive":  true,
                                                                        "leftValue":  "",
                                                                        "typeValidation":  "strict",
                                                                        "version":  2
                                                                    },
                                                        "conditions":  [
                                                                           {
                                                                               "id":  "c4a66703-d399-44a8-8758-cadbc5092ce5",
                                                                               "leftValue":  "={{ $json.contentType }}",
                                                                               "rightValue":  "mixed",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "equals"
                                                                                            }
                                                                           }
                                                                       ],
                                                        "combinator":  "and"
                                                    }
                                 },
                                 {
                                     "conditions":  {
                                                        "options":  {
                                                                        "caseSensitive":  true,
                                                                        "leftValue":  "",
                                                                        "typeValidation":  "strict",
                                                                        "version":  2
                                                                    },
                                                        "conditions":  [
                                                                           {
                                                                               "id":  "691a0fc4-19bb-4a2d-b9d6-ff30a96ef53b",
                                                                               "leftValue":  "={{ $json.contentType }}",
                                                                               "rightValue":  "plain-text",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "equals"
                                                                                            }
                                                                           }
                                                                       ],
                                                        "combinator":  "and"
                                                    }
                                 }
                             ]
              },
    "options":  {

                }
}
```

### Wait

| Field | Value |
| --- | --- |
| Node ID | c3654889-86eb-4629-b544-4a5d5f977fec |
| Type | n8n-nodes-base.wait |
| Type Version | 1.1 |
| Position | -3008, -976 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Image Vision Text -> Wait (output 0, input 0)

**Outgoing Connections**

- Wait -> Merge Normalized Image + Docs + Transcript Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Wait1

| Field | Value |
| --- | --- |
| Node ID | f3d58761-7c19-45da-8571-c45e0807095d |
| Type | n8n-nodes-base.wait |
| Type Version | 1.1 |
| Position | -3008, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Documents Text -> Wait1 (output 0, input 0)

**Outgoing Connections**

- Wait1 -> Merge Normalized Image + Docs + Transcript Text (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "amount":  20
}
```

### Wait2

| Field | Value |
| --- | --- |
| Node ID | 378d2a52-67dc-4f04-83be-f23ec10535b1 |
| Type | n8n-nodes-base.wait |
| Type Version | 1.1 |
| Position | -3008, 544 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Transcript Text -> Wait2 (output 0, input 0)

**Outgoing Connections**

- Wait2 -> Merge Normalized Image + Docs + Transcript Text (output 0, input 2)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Webhook - Upload Test Docs

| Field | Value |
| --- | --- |
| Node ID | e9df2782-e847-4731-924d-8736e3e34338 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | -8048, -192 |
| Disabled | True |
| Always Output Data | False |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Webhook - Upload Test Docs -> Detect File Type + Identify Text and/or Images (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "/upload-test-docs",
    "options":  {
                    "binaryPropertyName":  "data"
                }
}
```

### Write Final Test Strategy File

| Field | Value |
| --- | --- |
| Node ID | c4e2890f-d7c2-4744-a205-9e4fb483d845 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | -512, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert md to docx -> Write Final Test Strategy File (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "write",
    "fileName":  "C:\\\\Users\\\\anujalhans01\\\\Downloads\\\\Generated-Test-Strategy-{{$now}}.docx",
    "options":  {

                }
}
```

