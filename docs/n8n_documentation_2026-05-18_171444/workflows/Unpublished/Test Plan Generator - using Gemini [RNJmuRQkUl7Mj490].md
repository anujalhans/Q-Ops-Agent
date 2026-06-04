# Test Plan Generator - using Gemini

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | RNJmuRQkUl7Mj490 |
| Active | False |
| Archived | True |
| Created At | 2025-11-20T07:48:02.556Z |
| Updated At | 2026-04-16T10:15:07.000Z |
| Node Count | 45 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Test Plan Generator - using Gemini [RNJmuRQkUl7Mj490].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Webhook - Upload Test Docs | n8n-nodes-base.webhook | POST | /upload-test-docs

Known webhook route hints:

- POST /webhook/upload-test-docs

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.googleGemini | 2 |
| n8n-nodes-base.aggregate | 1 |
| n8n-nodes-base.code | 17 |
| n8n-nodes-base.convertToFile | 1 |
| n8n-nodes-base.executeCommand | 3 |
| n8n-nodes-base.extractFromFile | 5 |
| n8n-nodes-base.httpRequest | 1 |
| n8n-nodes-base.merge | 4 |
| n8n-nodes-base.readWriteFile | 2 |
| n8n-nodes-base.set | 2 |
| n8n-nodes-base.splitInBatches | 1 |
| n8n-nodes-base.switch | 2 |
| n8n-nodes-base.wait | 3 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- googlePalmApi: Google Gemini(PaLM) Api account

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
- Convert md to docx -> Write Final Test Plan File (source output 0, target input 0)
- Clean Markdown Formatting -> Convert md to docx (source output 0, target input 0)
- Webhook - Upload Test Docs -> Detect File Type (source output 0, target input 0)
- Rename binary key - LLD -> Extract LLD Text (source output 0, target input 0)
- Rename binary key - HLD -> Extract HLD Text (source output 0, target input 0)
- Rename binary key - FRD -> Extract FRD Text (source output 0, target input 0)
- Rename binary key - BRD -> Extract BRD Text (source output 0, target input 0)
- Extract Transcript Text -> Normalize Transcript Text (source output 0, target input 0)
- Detect File Type -> Normalize Binary Keys (source output 0, target input 0)
- Switch - Find Extractor -> Merge Images from 2 Sources (source output 0, target input 0)
- Switch - Find Extractor -> Write Binary Files To Disk (source output 1, target input 0)
- Switch - Find Extractor -> Extract Transcript Text (source output 2, target input 0)
- Normalize Image Vision Text -> Wait (source output 0, target input 0)
- Normalize Documents Text -> Wait1 (source output 0, target input 0)
- Merge Normalized Image + Docs + Transcript Text -> Merged Context for LLM (source output 0, target input 0)
- Write Binary Files To Disk -> Run Python Extractor to extract images (source output 0, target input 0)
- Write Binary Files To Disk -> Merge JSON Outputs (source output 0, target input 0)
- Run Python Extractor to extract images -> Merge JSON Outputs (source output 0, target input 1)
- Switch - docs Extractor route -> Expand Short Path (source output 0, target input 0)
- Switch - docs Extractor route -> Rename binary key - BRD (source output 1, target input 0)
- Switch - docs Extractor route -> Rename binary key - FRD (source output 2, target input 0)
- Switch - docs Extractor route -> Rename binary key - HLD (source output 3, target input 0)
- Switch - docs Extractor route -> Rename binary key - LLD (source output 4, target input 0)
- Normalize Binary Keys -> Switch - Find Extractor (source output 0, target input 0)
- Merge JSON Outputs -> Flatten & Parse Extractor Output (source output 0, target input 0)
- Flatten & Parse Extractor Output -> Normalize Binary Keys Again (source output 0, target input 0)
- Expand Short Path -> Store Expanded Path (source output 0, target input 0)
- Store Expanded Path -> Execute Command (source output 0, target input 0)
- Merge Images from 2 Sources -> Image Analyzer (source output 0, target input 0)
- Execute Command -> Convert to File (source output 0, target input 0)
- Convert to File -> Add Metadata to Image File (source output 0, target input 0)
- Normalize Binary Keys Again -> Switch - docs Extractor route (source output 0, target input 0)
- Merge extracted text from all docs -> Normalize Documents Text (source output 0, target input 0)
- Add Metadata to Image File -> Merge Images from 2 Sources (source output 0, target input 1)
- Wait -> Merge Normalized Image + Docs + Transcript Text (source output 0, target input 0)
- Wait1 -> Merge Normalized Image + Docs + Transcript Text (source output 0, target input 1)
- Wait2 -> Merge Normalized Image + Docs + Transcript Text (source output 0, target input 2)
- Message a model -> Collect Sections Output (source output 0, target input 0)
- Image Analyzer -> Normalize Image Vision Text (source output 0, target input 0)
- Generate Section List -> Split Sections (source output 0, target input 0)
- Split Sections -> Aggregate (source output 0, target input 0)
- Split Sections -> Message a model (source output 1, target input 0)
- Collect Sections Output -> Split Sections (source output 0, target input 0)
- Aggregate -> Prepare Markdown Content (source output 0, target input 0)
- Merged Context for LLM -> Normalize + Clean + Chunk Merged Context (source output 0, target input 0)
- Normalize + Clean + Chunk Merged Context -> Generate Section List (source output 0, target input 0)

## Nodes

### Add Metadata to Image File

| Field | Value |
| --- | --- |
| Node ID | 2942083e-e4c7-4b3d-bf49-d2134850fda7 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -544, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert to File -> Add Metadata to Image File (output 0, input 0)

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

### Aggregate

| Field | Value |
| --- | --- |
| Node ID | 2264d7d2-d0ef-4dc3-8808-c8c34ed31181 |
| Type | n8n-nodes-base.aggregate |
| Type Version | 1 |
| Position | 3088, 864 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Split Sections -> Aggregate (output 0, input 0)

**Outgoing Connections**

- Aggregate -> Prepare Markdown Content (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "aggregate":  "aggregateAllItemData",
    "options":  {

                }
}
```

### Clean Markdown Formatting

| Field | Value |
| --- | --- |
| Node ID | 68f77607-6249-42d1-852f-6482cb2ee4ab |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3488, 864 |
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
    "jsCode":  "// Extract markdown from previous node\nlet md = \"\";\n\n// Your previous node outputs markdown in json.data\nif (items[0]?.json?.data) {\n  md = items[0].json.data;\n} else {\n  return [{ json: { error: \"Markdown input not found\" }}];\n}\n\n// Clean and format Markdown\nlet cleaned = md\n  .replace(/#+\\s+/g, match =\u003e `\\n\\n${match}`)  // add spacing before headings\n  .replace(/-{3,}/g, \u0027\\n\\n\\\\\\\\page\\n\\n\u0027)       // convert --- to page breaks\n  .replace(/\\n{3,}/g, \u0027\\n\\n\u0027)                  // collapse extra newlines\n  .trim();\n\nreturn [\n  {\n    json: {\n      cleanedMarkdown: cleaned\n    }\n  }\n];\n"
}
```

### Collect Sections Output

| Field | Value |
| --- | --- |
| Node ID | a669532c-6a12-4103-a207-1c487b2bfb12 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2896, 1040 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Message a model -> Collect Sections Output (output 0, input 0)

**Outgoing Connections**

- Collect Sections Output -> Split Sections (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const section = $json.section;\nconst content = $json.content.parts?.[0]?.text || $json.text || \"\";\nreturn [{\n  json: {\n    sectionName: section,\n    text: content\n  }\n}];\n"
}
```

### Convert md to docx

| Field | Value |
| --- | --- |
| Node ID | 8dff9387-05cb-4615-b28b-db5088a35de6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | 3696, 864 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Clean Markdown Formatting -> Convert md to docx (output 0, input 0)

**Outgoing Connections**

- Convert md to docx -> Write Final Test Plan File (output 0, input 0)

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
                                                  "value":  "={{ $json.cleanedMarkdown }}"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### Convert to File

| Field | Value |
| --- | --- |
| Node ID | 68bf097d-9522-4b70-9ba7-fbf0b812aa25 |
| Type | n8n-nodes-base.convertToFile |
| Type Version | 1.1 |
| Position | -752, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Execute Command -> Convert to File (output 0, input 0)

**Outgoing Connections**

- Convert to File -> Add Metadata to Image File (output 0, input 0)

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

### Detect File Type

| Field | Value |
| --- | --- |
| Node ID | 5a88027f-4977-46db-8a8a-c409390e77fa |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4464, 848 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook - Upload Test Docs -> Detect File Type (output 0, input 0)

**Outgoing Connections**

- Detect File Type -> Normalize Binary Keys (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// --- Detect File Type + Content Analyzer ---\n// Purpose: Segregate uploaded files based on file type, doc type, and content composition.\n\nconst newItems = [];\n\n// --- Lightweight analyzer for text/image detection ---\nasync function analyzeDocumentContent(fileType, base64Data) {\n  const buffer = Buffer.from(base64Data, \u0027base64\u0027);\n  let containsText = false;\n  let containsImages = false;\n\n  // Read only part of file to avoid memory overload\n  const sampleText = buffer.toString(\u0027utf8\u0027, 0, 50000);\n\n  switch (fileType) {\n    case \u0027pdf\u0027:\n      if (/BT|ET|\\/Font|\\/Text/i.test(sampleText)) containsText = true;\n      if (/\\/Image|\\/Subtype\\s*\\/Image/i.test(sampleText)) containsImages = true;\n      break;\n\n    case \u0027doc\u0027:\n      // DOCX/DOC internal relationships (text \u0026 images)\n      if (/\u003cw:t\u003e.*?\u003c\\/w:t\u003e/i.test(sampleText)) containsText = true;\n      if (/word\\/media\\//i.test(sampleText)) containsImages = true;\n      break;\n\n    case \u0027ppt\u0027:\n      if (/\u003ca:t\u003e.*?\u003c\\/a:t\u003e/i.test(sampleText)) containsText = true;\n      if (/ppt\\/media\\//i.test(sampleText)) containsImages = true;\n      break;\n  }\n\n  // Fallback: detect if itâ€™s probably text\n  if (!containsText \u0026\u0026 !containsImages) {\n    const textChars = sampleText.replace(/[^A-Za-z0-9\\s]/g, \u0027\u0027);\n    if (textChars.length \u003e 50) containsText = true;\n  }\n\n  return { containsText, containsImages };\n}\n\n// --- Main logic (must be async wrapper in n8n Code Node) ---\nreturn (async () =\u003e {\n  for (const item of items) {\n    const binaries = item.binary || {};\n\n    for (const [key, bin] of Object.entries(binaries)) {\n      if (!bin?.data) continue;\n\n      const fileName = (bin.fileName || key || \u0027\u0027).toString();\n      const mime = (bin.mimeType || \u0027\u0027).toLowerCase();\n      const lower = fileName.toLowerCase();\n\n      let fileType = \u0027unknown\u0027;\n      let docType = \u0027unknown\u0027;\n      let containsText = false;\n      let containsImages = false;\n\n      // --- Basic file type detection ---\n      if (mime.startsWith(\u0027image/\u0027) || /\\.(png|jpg|jpeg|gif|svg|webp)$/i.test(lower)) {\n        fileType = \u0027image\u0027;\n        containsImages = true;\n      } else if (/\\.(txt)$/i.test(lower)) {\n        fileType = \u0027text\u0027;\n        containsText = true;\n      } else if (/\\.(pdf)$/i.test(lower)) {\n        fileType = \u0027pdf\u0027;\n      } else if (/\\.(docx|doc)$/i.test(lower)) {\n        fileType = \u0027doc\u0027;\n      } else if (/\\.(pptx|ppt)$/i.test(lower)) {\n        fileType = \u0027ppt\u0027;\n      }\n\n      // --- docType classification ---\n      if (/brd/i.test(fileName)) docType = \u0027brd\u0027;\n      else if (/frd/i.test(fileName)) docType = \u0027frd\u0027;\n      else if (/hld/i.test(fileName)) docType = \u0027hld\u0027;\n      else if (/lld/i.test(fileName)) docType = \u0027lld\u0027;\n      else if (/transcript|grooming|meeting|discussion/i.test(fileName)) docType = \u0027transcript\u0027;\n      else if (fileType === \u0027ppt\u0027) docType = \u0027supporting\u0027;\n      else if (fileType === \u0027image\u0027) docType = \u0027image\u0027;\n      else docType = \u0027unknown\u0027;\n\n      // --- Analyze for content composition ---\n      if ([\u0027pdf\u0027, \u0027doc\u0027, \u0027ppt\u0027].includes(fileType)) {\n        const result = await analyzeDocumentContent(fileType, bin.data);\n        containsText = result.containsText;\n        containsImages = result.containsImages;\n      }\n\n      // --- Determine contentType ---\n      let contentType = \u0027unknown\u0027;\n      if (containsText \u0026\u0026 !containsImages) contentType = \u0027plain-text\u0027;\n      else if (!containsText \u0026\u0026 containsImages) contentType = \u0027image-only\u0027;\n      else if (containsText \u0026\u0026 containsImages) contentType = \u0027mixed\u0027;\n\n      console.log(`Analyzed ${fileName} â†’ ${contentType}`);\n\n      // --- Push result ---\n      newItems.push({\n        json: {\n          fileName,\n          fileType,\n          docType,\n          containsText,\n          containsImages,\n          contentType,\n          fileKey: key,\n        },\n        binary: {\n          [key]: bin,\n        },\n      });\n    }\n  }\n\n  return newItems;\n})();\n"
}
```

### Execute Command

| Field | Value |
| --- | --- |
| Node ID | 1772ae7c-6bcc-4684-ab4a-978dd70543f4 |
| Type | n8n-nodes-base.executeCommand |
| Type Version | 1 |
| Position | -960, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Store Expanded Path -> Execute Command (output 0, input 0)

**Outgoing Connections**

- Execute Command -> Convert to File (output 0, input 0)

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
| Node ID | ba80ed01-5ffa-4b47-aee5-931b4ab8e8f5 |
| Type | n8n-nodes-base.executeCommand |
| Type Version | 1 |
| Position | -1472, 336 |
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
| Node ID | 2c499940-fb3f-4a46-9780-572d2d5a43b4 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -944, 624 |
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
| Node ID | 1a1cef20-323b-4240-9181-ce52f49533ea |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -944, 864 |
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
| Node ID | c9b581ee-9c0f-400b-a22a-c79706484913 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -944, 1056 |
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
| Node ID | d74a1422-c6cd-4754-8e3b-f86bfe34342d |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -944, 1248 |
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
| Node ID | ee82153a-3352-4756-89e1-411bbc15895b |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -944, 1584 |
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
| Node ID | c983006c-d142-4f1f-8fb2-2b7d663bb306 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -2256, 864 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge JSON Outputs -> Flatten & Parse Extractor Output (output 0, input 0)

**Outgoing Connections**

- Flatten & Parse Extractor Output -> Normalize Binary Keys Again (output 0, input 0)

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

### Generate Section List

| Field | Value |
| --- | --- |
| Node ID | f620b5bf-6aee-4d8e-8ae1-f8efecbec412 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2016, 880 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize + Clean + Chunk Merged Context -> Generate Section List (output 0, input 0)

**Outgoing Connections**

- Generate Section List -> Split Sections (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $items().flatMap(item =\u003e {\n  const merged = item.json.mergedContext;\n\n  const sections = [\n    \"Introduction\",\n    \"Test Objectives\",\n    \"Test Items\",\n    \"Features to Be Tested\",\n    \"Features Not to Be Tested\",\n    \"Test Approach / Strategy\",\n    \"Test Deliverables\",\n    \"Testing Tasks\",\n    \"Test Environment\",\n    \"Test Data Management\",\n    \"Roles and Responsibilities\",\n    \"Risks, Mitigation \u0026 Contingency Plan\",\n    \"Entry \u0026 Exit Criteria\",\n    \"Suspension \u0026 Resumption Criteria\",\n    \"Assumptions \u0026 Dependencies\",\n    \"Automation coverage matrix\",\n    \"Test coverage metrics\",\n    \"Approval \u0026 Sign-off\"\n  ];\n\n  return sections.map(sectionName =\u003e ({\n    json: {\n      mergedContext: merged,\n      section: sectionName       // \u003c-- SINGLE STRING, not ARRAY\n    }\n  }));\n}).flat();\n"
}
```

### Image Analyzer

| Field | Value |
| --- | --- |
| Node ID | 6957fac9-a66d-4d0b-ad16-4da540784a59 |
| Type | @n8n/n8n-nodes-langchain.googleGemini |
| Type Version | 1 |
| Position | -112, 64 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Images from 2 Sources -> Image Analyzer (output 0, input 0)

**Outgoing Connections**

- Image Analyzer -> Normalize Image Vision Text (output 0, input 0)

**Credential References**

```json
{
    "googlePalmApi":  {
                          "id":  "LlO1nVfHyzNZq1oT",
                          "name":  "Google Gemini(PaLM) Api account"
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
                    "value":  "models/gemini-2.0-flash-lite",
                    "mode":  "list",
                    "cachedResultName":  "models/gemini-2.0-flash-lite"
                },
    "text":  "You are analyzing visual content from a software document ({{ $json.docType }}).\nExtract and summarize:\n1. Any readable text in the image.\n2. Describe diagrams or flows in simple sentences.\n3. Identify if it shows requirements, features, user flows, or architecture.\nReturn a clean, structured text summary suitable for inclusion in a test plan document.\n",
    "inputType":  "binary",
    "options":  {
                    "maxOutputTokens":  300
                }
}
```

### Merge extracted text from all docs

| Field | Value |
| --- | --- |
| Node ID | bd362237-b8f4-44b2-ad10-4a72293f4792 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -336, 848 |
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
| Node ID | dfc11d68-1d5a-497e-a875-9ca3fb5a095d |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -336, 64 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch - Find Extractor -> Merge Images from 2 Sources (output 0, input 0)
- Add Metadata to Image File -> Merge Images from 2 Sources (output 0, input 1)

**Outgoing Connections**

- Merge Images from 2 Sources -> Image Analyzer (output 0, input 0)

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
| Node ID | a22e62a4-79ff-4068-8ebe-b5189ba71807 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -2480, 864 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Write Binary Files To Disk -> Merge JSON Outputs (output 0, input 0)
- Run Python Extractor to extract images -> Merge JSON Outputs (output 0, input 1)

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
| Node ID | dbef2db9-9d78-4e86-b46b-bc46607e48bb |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 1312, 864 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Wait -> Merge Normalized Image + Docs + Transcript Text (output 0, input 0)
- Wait1 -> Merge Normalized Image + Docs + Transcript Text (output 0, input 1)
- Wait2 -> Merge Normalized Image + Docs + Transcript Text (output 0, input 2)

**Outgoing Connections**

- Merge Normalized Image + Docs + Transcript Text -> Merged Context for LLM (output 0, input 0)

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

### Merged Context for LLM

| Field | Value |
| --- | --- |
| Node ID | 66605ef5-6005-4ed6-b5cd-d230f09eeac4 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1504, 880 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Normalized Image + Docs + Transcript Text -> Merged Context for LLM (output 0, input 0)

**Outgoing Connections**

- Merged Context for LLM -> Normalize + Clean + Chunk Merged Context (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Merge all normalized document + transcript text into one large context\nlet allTexts = [];\n\nfor (const item of items) {\n  const src = item.json.sourceType || item.json.sourceName || \"Unknown Source\";\n  const txt = item.json.text ||item.json.normalizedVisionText || \"\";\n\n  if (txt.trim()) {\n    allTexts.push(txt); // already has Source: tags\n  }\n}\n\n// Optional: Insert separator between sources\nconst merged = allTexts.join(\"\\n\\n---\\n\\n\");\n\nreturn [{\n  json: {\n    mergedContext: merged,\n    contextCount: allTexts.length\n  }\n}];\n"
}
```

### Message a model

| Field | Value |
| --- | --- |
| Node ID | 63887696-5289-49bd-9f25-b9696076ca01 |
| Type | @n8n/n8n-nodes-langchain.googleGemini |
| Type Version | 1 |
| Position | 2544, 1040 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Split Sections -> Message a model (output 1, input 0)

**Outgoing Connections**

- Message a model -> Collect Sections Output (output 0, input 0)

**Credential References**

```json
{
    "googlePalmApi":  {
                          "id":  "LlO1nVfHyzNZq1oT",
                          "name":  "Google Gemini(PaLM) Api account"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "modelId":  {
                    "__rl":  true,
                    "value":  "models/gemini-2.0-flash-lite",
                    "mode":  "list",
                    "cachedResultName":  "models/gemini-2.0-flash-lite"
                },
    "messages":  {
                     "values":  [
                                    {
                                        "content":  "You are a Senior QA Test Manager with deep experience converting multi-source requirements into concise, structured, non-repetitive Test Plan sections. You specialize in Shift-Left Quality and Automation-First approaches, integrating QA deeply within CI/CD pipelines.\n\nYour output must always maintain:\n- Precision over verbosity\n- No repeated statements across bullets\n- No duplication across sections\n- No invented content (â€œundefinedâ€, â€œmarkdown blocksâ€, headings inside code fences)\n- No re-listing features already described in earlier bullets.\n- When information is missing, you must summarize instead of expanding.\n- You must optimize output length to avoid token overflow.\n- Realistic and context-aware alignment with Shift-Left and Automation-First principles.",
                                        "role":  "model"
                                    },
                                    {
                                        "content":  "=You are provided with a cleaned context derived from BRD, FRD, LLD, HLD and grooming notes. Your task is to generate ONLY the section specified below:\n\nSection: {{$json[\"section\"]}}\n\nSTRICT RULES:\n1. DO NOT repeat any concept, sentence, or feature more than once.\n2. DO NOT restate the same requirement in different bullets.\n3. DO NOT repeat content that clearly belongs to another section.\n4. DO NOT generate headings, numbers, H1/H2/H3, code fences, or markdown blocks.\n5. DO NOT include â€œundefinedâ€, â€œmarkdownâ€, or fenced code sections.\n6. Keep every bullet short, unique, and non-redundant.\n7. Only expand content if it is present in the context. If not present, summarize generically.\n\nSTRUCTURE:\nFollow ONLY the bullet prompts for the section chosen.\nEach bullet gets EXACTLY 1â€“3 crisp lines, no elaboration.\n\n\nCleaned Context:\n{{$json[\"cleanedContext\"]}}\n"
                                    }
                                ]
                 },
    "options":  {
                    "maxOutputTokens":  400,
                    "temperature":  0.4,
                    "topP":  0.8,
                    "topK":  40
                }
}
```

### Normalize + Clean + Chunk Merged Context

| Field | Value |
| --- | --- |
| Node ID | 6042eaea-2c7e-47af-bb32-8b70548f852f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1712, 880 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merged Context for LLM -> Normalize + Clean + Chunk Merged Context (output 0, input 0)

**Outgoing Connections**

- Normalize + Clean + Chunk Merged Context -> Generate Section List (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "/**\n * Clean, normalize, deduplicate and chunk the merged context\n * to prevent:\n * - duplicated LLM output\n * - undefined blocks\n * - hallucinated subsections\n * - excessive tokens\n * - repeated paragraphs\n */\nconst input = $json.mergedContext || \"\";\n\n// 1. Remove garbage tokens\nlet cleaned = input\n  .replace(/undefined/gi, \"\")\n  .replace(/```+/g, \"\")\n  .replace(/\\\\page/g, \"\")\n  .replace(/\\t+/g, \" \")\n  .replace(/\\s{2,}/g, \" \")\n  .replace(/\\n{3,}/g, \"\\n\\n\")\n  .trim();\n\n// 2. Normalize heading structure (LLM loves this)\ncleaned = cleaned.replace(/^#+\\s*/gm, \"\");\n\n// 3. Split into paragraphs\nlet paragraphs = cleaned\n  .split(/\\n{2,}/)\n  .map(p =\u003e p.trim())\n  .filter(p =\u003e p.length \u003e 0);\n\n// 4. Deduplicate paragraphs based on content fingerprint\nconst seen = new Set();\nlet unique = [];\n\nfor (let p of paragraphs) {\n  const key = p.toLowerCase().replace(/[^a-z0-9]/g, \"\");\n  if (!seen.has(key)) {\n    seen.add(key);\n    unique.push(p);\n  }\n}\n\n// 5. Rejoin cleaned content\nlet finalText = unique.join(\"\\n\\n\");\n\n// 6. Hard token guard (max chunk size ~12k chars)\nconst maxSize = 12000;\nlet chunks = [];\n\nfor (let i = 0; i \u003c finalText.length; i += maxSize) {\n  chunks.push(finalText.substring(i, i + maxSize));\n}\n\nreturn [\n  {\n    json: {\n      cleanedContext: finalText,\n      chunks,\n      chunkCount: chunks.length\n    }\n  }\n];\n"
}
```

### Normalize Binary Keys

| Field | Value |
| --- | --- |
| Node ID | 766da035-0d54-4228-b28e-050a8b676192 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4240, 848 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Detect File Type -> Normalize Binary Keys (output 0, input 0)

**Outgoing Connections**

- Normalize Binary Keys -> Switch - Find Extractor (output 0, input 0)

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

### Normalize Binary Keys Again

| Field | Value |
| --- | --- |
| Node ID | d3981f0b-54bd-4e68-89b0-352712673994 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -2032, 864 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Flatten & Parse Extractor Output -> Normalize Binary Keys Again (output 0, input 0)

**Outgoing Connections**

- Normalize Binary Keys Again -> Switch - docs Extractor route (output 0, input 0)

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

### Normalize Documents Text

| Field | Value |
| --- | --- |
| Node ID | 3977d08a-f86d-428d-b9da-b3cb81f180aa |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 144, 880 |
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
| Node ID | ea97ed77-4ce9-45c8-be7c-dac13df2cb99 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 144, 64 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Image Analyzer -> Normalize Image Vision Text (output 0, input 0)

**Outgoing Connections**

- Normalize Image Vision Text -> Wait (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "/**\n * Normalize text extracted from Gemini \"Analyze an Image\" or OpenAI Vision.\n * Automatically detects Gemini structure containing:\n *   item.content.parts[0].text\n */\n\nconst newItems = [];\n\nfor (const outer of items) {\n  const meta = outer.json || {};\n\n  // Normalize message array (handles OpenAI + Gemini formats)\n  const messageArray = Array.isArray(meta)\n    ? meta\n    : meta.content?.parts\n      ? [meta]  // Gemini response case\n      : Array.isArray(outer)\n        ? outer\n        : [outer];\n\n  for (const msg of messageArray) {\n    let text = \u0027\u0027;\n\n    // -------------------------------\n    // 1. Extract text from GEMINI format\n    // -------------------------------\n    if (\n      msg?.content?.parts \u0026\u0026\n      Array.isArray(msg.content.parts) \u0026\u0026\n      msg.content.parts[0]?.text\n    ) {\n      text = msg.content.parts[0].text;\n    }\n\n    // -------------------------------\n    // 2. Extract text from OpenAI Vision formats\n    // -------------------------------\n    else if (msg?.json?.text) {\n      text = msg.json.text;\n    } \n    else if (msg?.text) {\n      text = msg.text;\n    } \n    else if (msg?.content \u0026\u0026 Array.isArray(msg.content)) {\n      const contentText = msg.content.find(c =\u003e c.type === \u0027output_text\u0027);\n      if (contentText?.text) text = contentText.text;\n    } \n    else if (typeof msg === \u0027string\u0027) {\n      text = msg;\n    }\n\n    if (typeof text !== \u0027string\u0027) text = String(text || \u0027\u0027);\n\n    // -------------------------------\n    // 3. Cleanup Processing\n    // -------------------------------\n    text = text\n      .replace(/\\r\\n/g, \u0027\\n\u0027)\n      .replace(/[ \\t]+/g, \u0027 \u0027)\n      .replace(/\\n{2,}/g, \u0027\\n\\n\u0027)\n      .replace(/\\f/g, \u0027 \u0027)\n      .trim();\n\n    // Remove repeated/noisy lines\n    const lines = text.split(\u0027\\n\u0027);\n    const seen = new Set();\n    const filtered = lines.filter(line =\u003e {\n      const l = line.trim().toLowerCase();\n      if (!l || seen.has(l)) return false;\n      seen.add(l);\n\n      // Drop auto-labeled noise\n      if (/^(diagram|figure|screenshot|ui|image|architecture|flow|mockup)/i.test(l)) return false;\n      return true;\n    });\n    text = filtered.join(\u0027\\n\u0027).trim();\n\n    // Normalize punctuation\n    text = text\n      .replace(/\\s+([.,;:!?])/g, \u0027$1\u0027)\n      .replace(/([.,;:!?])([^\\s])/g, \u0027$1 $2\u0027)\n      .replace(/\\s{2,}/g, \u0027 \u0027);\n\n    // Capitalize sentence starts\n    text = text.replace(/(^|[.!?]\\s+)([a-z])/g, (_, prefix, c) =\u003e prefix + c.toUpperCase());\n\n    // Truncate extremely long structured dumps\n    if (text.length \u003e 5000) {\n      text = text.slice(0, 5000) + \u0027... [truncated for processing]\u0027;\n    }\n\n    // -------------------------------\n    // 4. Attach metadata from â€œSwitch - Find Extractorâ€\n    // -------------------------------\n\n    const extractor = $(\u0027Switch - Find Extractor\u0027).first().json;\n\n    const normalized = {\n      normalizedVisionText: text,\n      source: \u0027Gemini-Vision\u0027,\n      cleaningStatus: \u0027normalized\u0027,\n      fileName: extractor.fileName || \u0027Unknown_File\u0027,\n      fileType: extractor.fileType || \u0027Unknown\u0027,\n      docType: extractor.docType || \u0027Unknown\u0027,\n      requiresVision: extractor.requiresVision ?? true,\n      contentType: extractor.contentType || \u0027image\u0027\n    };\n\n    newItems.push({ json: normalized });\n  }\n}\n\nreturn newItems;\n"
}
```

### Normalize Transcript Text

| Field | Value |
| --- | --- |
| Node ID | ae355f1d-493b-48ef-a403-6f78622d1b01 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -48, 1584 |
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

### Prepare Markdown Content

| Field | Value |
| --- | --- |
| Node ID | 3d2e5bbd-0d0c-4b18-adba-8a60b04748da |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3296, 864 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Aggregate -> Prepare Markdown Content (output 0, input 0)

**Outgoing Connections**

- Prepare Markdown Content -> Clean Markdown Formatting (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "let md = \"\";\n\nconst all = items[0].json.data; // this is the array of all sections\n\nfor (const entry of all) {\n  md += `## ${entry.sectionName}\\n\\n`;\n  md += entry.text.trim() + \"\\n\\n---\\n\\n\";\n}\n\nreturn [\n  {\n    json: { data: md }\n  }\n];\n"
}
```

### Rename binary key - BRD

| Field | Value |
| --- | --- |
| Node ID | 2efda6b1-5fcb-4b16-b12a-92ed63fc9468 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1168, 624 |
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
| Node ID | 554a6e6e-d7e8-4c9b-886d-60a7e5d1576f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1168, 864 |
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
| Node ID | 0ccc3fd2-f71a-48ed-890f-bc3fbfe33eaf |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1168, 1056 |
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
| Node ID | e4613f66-1fe2-4ff6-8c36-e5da73aec514 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1168, 1248 |
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
| Node ID | 30a3ebd7-f237-4ce9-9871-ba71099e23cd |
| Type | n8n-nodes-base.executeCommand |
| Type Version | 1 |
| Position | -2688, 960 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Write Binary Files To Disk -> Run Python Extractor to extract images (output 0, input 0)

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

### Split Sections

| Field | Value |
| --- | --- |
| Node ID | ab9c7adc-a71a-4499-9d7a-b2975beecddd |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | 2224, 880 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Generate Section List -> Split Sections (output 0, input 0)
- Collect Sections Output -> Split Sections (output 0, input 0)

**Outgoing Connections**

- Split Sections -> Aggregate (output 0, input 0)
- Split Sections -> Message a model (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "options":  {

                }
}
```

### Store Expanded Path

| Field | Value |
| --- | --- |
| Node ID | 9d56d86f-e864-4054-b875-e90abc30276a |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -1168, 336 |
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
| Node ID | d0939e4f-f718-459b-ac1a-d6e74c5e17c9 |
| Type | n8n-nodes-base.switch |
| Type Version | 3.3 |
| Position | -1808, 816 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Binary Keys Again -> Switch - docs Extractor route (output 0, input 0)

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
| Node ID | 04aa14d1-bf0e-4571-8fe9-d15027f8892a |
| Type | n8n-nodes-base.switch |
| Type Version | 3.3 |
| Position | -4016, 832 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Binary Keys -> Switch - Find Extractor (output 0, input 0)

**Outgoing Connections**

- Switch - Find Extractor -> Merge Images from 2 Sources (output 0, input 0)
- Switch - Find Extractor -> Write Binary Files To Disk (output 1, input 0)
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
| Node ID | 72058afb-dba2-4f08-bdfa-d69b3d60cac3 |
| Type | n8n-nodes-base.wait |
| Type Version | 1.1 |
| Position | 352, 64 |
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
| Node ID | a9697c02-e37e-4f03-a7da-2935d9d7fe19 |
| Type | n8n-nodes-base.wait |
| Type Version | 1.1 |
| Position | 352, 880 |
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

}
```

### Wait2

| Field | Value |
| --- | --- |
| Node ID | 57e36259-dd8e-4e13-a024-bafce3c39acc |
| Type | n8n-nodes-base.wait |
| Type Version | 1.1 |
| Position | 352, 1584 |
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
| Node ID | fd661852-55cb-48ca-8f36-9449b2aab37c |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | -4688, 848 |
| Disabled | True |
| Always Output Data | False |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Webhook - Upload Test Docs -> Detect File Type (output 0, input 0)

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

### Write Binary Files To Disk

| Field | Value |
| --- | --- |
| Node ID | 60ac3c72-3a1b-478c-abbf-aedb76330733 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | -2928, 848 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch - Find Extractor -> Write Binary Files To Disk (output 1, input 0)

**Outgoing Connections**

- Write Binary Files To Disk -> Run Python Extractor to extract images (output 0, input 0)
- Write Binary Files To Disk -> Merge JSON Outputs (output 0, input 0)

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

### Write Final Test Plan File

| Field | Value |
| --- | --- |
| Node ID | 4b3cc53b-0d6f-405f-a8c0-f5bf9322e0ca |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 3904, 864 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert md to docx -> Write Final Test Plan File (output 0, input 0)

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
    "fileName":  "C:\\\\Users\\\\anujalhans01\\\\Downloads\\\\Generated-Test-Plan-{{$now}}.docx",
    "options":  {

                }
}
```

