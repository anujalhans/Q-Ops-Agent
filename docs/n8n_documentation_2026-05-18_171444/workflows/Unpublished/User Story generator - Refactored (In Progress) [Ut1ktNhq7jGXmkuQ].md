# User Story generator - Refactored (In Progress)

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | Ut1ktNhq7jGXmkuQ |
| Active | False |
| Archived | True |
| Created At | 2025-12-01T12:50:33.329Z |
| Updated At | 2026-04-16T10:15:49.000Z |
| Node Count | 33 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\User Story generator - Refactored (In Progress) [Ut1ktNhq7jGXmkuQ].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Webhook - Upload Test Docs | n8n-nodes-base.webhook | POST | /upload-test-docs

Known webhook route hints:

- POST /webhook/upload-test-docs

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.agent | 4 |
| @n8n/n8n-nodes-langchain.lmChatOpenAi | 3 |
| @n8n/n8n-nodes-langchain.memoryBufferWindow | 1 |
| @n8n/n8n-nodes-langchain.openAi | 1 |
| n8n-nodes-base.code | 12 |
| n8n-nodes-base.executeCommand | 1 |
| n8n-nodes-base.httpRequest | 1 |
| n8n-nodes-base.merge | 3 |
| n8n-nodes-base.noOp | 1 |
| n8n-nodes-base.readWriteFile | 2 |
| n8n-nodes-base.splitInBatches | 2 |
| n8n-nodes-base.switch | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- http://127.0.0.1:8000/convert

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- Prepare Markdown Content -> Clean Markdown Formatting (source output 0, target input 0)
- Convert md to docx -> Loop Over Items (source output 0, target input 0)
- Merged Context for OpenAI -> OpenAI - Generate User Stories (source output 0, target input 0)
- Clean Markdown Formatting -> Split into Multiple User Stories (source output 0, target input 0)
- Webhook - Upload Test Docs -> Split Uploaded Binaries (source output 0, target input 0)
- Merge Normalized Image + Docs + Transcript Text -> Merged Context for OpenAI (source output 0, target input 0)
- Run Python Extractor to extract images -> Merge JSON Outputs (source output 0, target input 1)
- Merge JSON Outputs -> Flatten & Parse Extractor Output (source output 0, target input 0)
- Flatten & Parse Extractor Output -> Again Rename Binary Keys (source output 0, target input 0)
- Save Binary Files to local Disk -> Run Python Extractor to extract images (source output 0, target input 0)
- Save Binary Files to local Disk -> Merge JSON Outputs (source output 0, target input 0)
- Again Rename Binary Keys -> Loop Over Items1 (source output 0, target input 0)
- OpenAI - Generate User Stories -> Prepare Markdown Content (source output 0, target input 0)
- Split into Multiple User Stories -> Loop Over Items (source output 0, target input 0)
- Loop Over Items -> Write Final Test Strategy File (source output 0, target input 0)
- Loop Over Items -> Convert md to docx (source output 1, target input 0)
- OpenAI Chat Model -> File Detector + Content Extractor Agent (source output 0, target input 0)
- Convert Binaries to json -> File Detector + Content Extractor Agent (source output 0, target input 0)
- Parse the output JSON into actual objects -> Switch - Find Extractor (source output 0, target input 0)
- Loop Over Items1 -> Replace Me (source output 1, target input 0)
- Replace Me -> Loop Over Items1 (source output 0, target input 0)
- Simple Memory -> File Detector + Content Extractor Agent (source output 0, target input 0)
- OpenAI Chat Model1 -> File Detector + Content Extractor Agent1 (source output 0, target input 0)
- File Detector + Content Extractor Agent -> Parse the output JSON into actual objects (source output 0, target input 0)
- Split Uploaded Binaries -> File Detector + Content Extractor Agent1 (source output 0, target input 0)
- File Detector + Content Extractor Agent1 -> Parse Agent Extracted Content (source output 0, target input 0)
- Parse Agent Extracted Content -> Prepare Context Inputs (source output 0, target input 0)
- Prepare Context Inputs -> Context Builder Agent (source output 0, target input 0)
- OpenAI Chat Model2 -> Context Builder Agent (source output 0, target input 0)

## Nodes

### Again Rename Binary Keys

| Field | Value |
| --- | --- |
| Node ID | 2f224997-528a-497f-b407-5bd46d66df8c |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1888, 720 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Flatten & Parse Extractor Output -> Again Rename Binary Keys (output 0, input 0)

**Outgoing Connections**

- Again Rename Binary Keys -> Loop Over Items1 (output 0, input 0)

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
| Node ID | 714c585a-192b-489b-8db9-2f2747f122e5 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2576, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Markdown Content -> Clean Markdown Formatting (output 0, input 0)

**Outgoing Connections**

- Clean Markdown Formatting -> Split into Multiple User Stories (output 0, input 0)

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

### Context Builder Agent

| Field | Value |
| --- | --- |
| Node ID | 0f57b582-c750-4a9d-8015-d891f061cf34 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3 |
| Position | -3456, 704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Context Inputs -> Context Builder Agent (output 0, input 0)
- OpenAI Chat Model2 -> Context Builder Agent (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "promptType":  "define",
    "text":  "You are a Senior QA Architect and Business Analyst.\nYour task is to build a structured, test-ready context from multiple uploaded documents such as BRD, FRD, HLD, LLD, transcripts, and images.\nYou are not a summarizer.\nYou must normalize, prioritize, and consolidate information so it can be directly used to generate:\n - User Stories\n - Test Plans\n - Test Strategies\n\nYour output must be strictly valid JSON and must follow the schema below.\n\nðŸ” Input Characteristics\n       - You will receive multiple documents as an array.\n       - Each document may contain:\n          - extractedText\n          - sections\n          - tables\n          - lists\n          - confidence score\n\n       - Documents may overlap, contradict, or be incomplete.\n       - Some documents may be irrelevant or low quality.\n\nðŸ§© Responsibilities\nClassify and prioritize documents\n - Identify document type: BRD, FRD, HLD, LLD, Transcript, Image\n - Apply confidence-based weighting\n\nExtract test-relevant knowledge\n - Functional capabilities\n - Non-functional requirements\n - Actors and user roles\n - Architecture and integration details\n - Data entities\n\nNormalize and de-duplicate\n - Merge overlapping content\n - Remove repetition\n - Resolve conflicts using priority rules\n\nPreserve traceability\n - Every capability or requirement must reference its source document type\n\nIdentify risks and gaps\n - Ambiguous or non-testable statements\n - Missing requirements\n - Conflicting definitions\n\nPrepare downstream agents\n - Output must be immediately consumable by User Story, Test Plan, and Test Strategy generators\n\nðŸ§  Mandatory Document Priority Rules\nWhen conflicts exist, resolve them in this order:\n\nBRD â€“ business scope and intent\nFRD â€“ functional behavior\nHLD â€“ system architecture\nLLD â€“ technical and data design\nTranscript â€“ supporting context only\nImage â€“ UI hints only\nDocuments with low confidence must be down-weighted or ignored.\n\nOUTPUT FORMAT (JSON ONLY):\n{\n  \"productContext\": {\n    \"productName\": \"\",\n    \"domain\": \"\",\n    \"primaryGoals\": []\n  },\n  \"actors\": [],\n  \"functionalCapabilities\": [\n    {\n      \"capability\": \"\",\n      \"details\": \"\",\n      \"priority\": \"\",\n      \"source\": []\n    }\n  ],\n  \"nonFunctionalRequirements\": {\n    \"performance\": [],\n    \"security\": [],\n    \"scalability\": [],\n    \"usability\": [],\n    \"compliance\": []\n  },\n  \"architectureContext\": {\n    \"architectureType\": \"\",\n    \"frontend\": \"\",\n    \"backend\": [],\n    \"database\": \"\",\n    \"integrations\": []\n  },\n  \"dataEntities\": [],\n  \"testableRisks\": [\n    {\n      \"risk\": \"\",\n      \"impact\": \"\",\n      \"source\": \"\"\n    }\n  ],\n  \"knownGapsAndAmbiguities\": [],\n  \"documentTraceability\": {\n    \"BRD\": [],\n    \"FRD\": [],\n    \"HLD\": [],\n    \"LLD\": [],\n    \"Transcript\": [],\n    \"Image\": []\n  }\n}\n\n\nHARD RULES:\nOutput ONLY valid JSON\nNo explanations, no markdown, no commentary\nDo not invent information\nIf data is missing, explicitly record it under knownGapsAndAmbiguities\n\\Ignore irrelevant or non-product content",
    "options":  {

                }
}
```

### Convert Binaries to json

| Field | Value |
| --- | --- |
| Node ID | e0ebff2f-23ec-4f2d-99de-de49819fff3c |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4624, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Convert Binaries to json -> File Detector + Content Extractor Agent (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const output = [];\n\nitems.forEach((item, index) =\u003e {\n  const binaries = item.binary || {};\n  const keys = Object.keys(binaries);\n\n  if (keys.length === 0) {\n    output.push({ json: { error: \"No binary received\" }});\n    return;\n  }\n\n  keys.forEach(key =\u003e {\n    const file = binaries[key];\n    const base64 = file.data || file.fileData || \"\";\n\n    let sampleText = \"\";\n\n    try {\n      // If file is an image, skip sample text extraction\n      if ((file.mimeType || \"\").startsWith(\"image/\")) {\n        sampleText = \"\";  // Prevent junk output for images\n      } else {\n        const buffer = Buffer.from(base64, \"base64\");\n        sampleText = buffer.toString(\"utf8\", 0, 20000);\n      }\n    } catch (e) {\n      sampleText = \"\";\n    }\n\n    output.push({\n      json: {\n        id: index,\n        fileName: file.fileName || key,\n        mimeType: file.mimeType || \"\",\n        sampleText\n      },\n      binary: { data: file }\n    });\n  });\n});\n\nreturn output;\n"
}
```

### Convert md to docx

| Field | Value |
| --- | --- |
| Node ID | 3041278f-4056-43cc-937b-589ea3963972 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | 3232, 864 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop Over Items -> Convert md to docx (output 1, input 0)

**Outgoing Connections**

- Convert md to docx -> Loop Over Items (output 0, input 0)

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
                                                  "value":  "={{ $json.markdown }}\n"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### File Detector + Content Extractor Agent

| Field | Value |
| --- | --- |
| Node ID | 693cdb23-bec4-41f7-b867-1e72b50def35 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3 |
| Position | -4240, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI Chat Model -> File Detector + Content Extractor Agent (output 0, input 0)
- Convert Binaries to json -> File Detector + Content Extractor Agent (output 0, input 0)
- Simple Memory -> File Detector + Content Extractor Agent (output 0, input 0)

**Outgoing Connections**

- File Detector + Content Extractor Agent -> Parse the output JSON into actual objects (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "promptType":  "define",
    "text":  "=You are a document routing and analysis agent.\nInput:\nfileName: {{$json[\"fileName\"]}}\nmimeType: {{$json[\"mimeType\"]}}\nsampleText: {{$json[\"sampleText\"]}}\n\nClassify and return JSON ONLY in this exact format:\n{\n  \"fileName\": \"{{$json[\"fileName\"]}}\",\n  \"fileType\": \"pdf|doc|ppt|image|text\",\n  \"docType\": \"brd|frd|hld|lld|transcript|jpeg-image|png-image|ppt-text|ppt-image\",\n  \"contentType\": \"plain-text|image-only|mixed\",\n  \"needImageExtraction\": true|false,\n  \"route\": \"extract-images|no-extract|unsupported\"\n}\n\nDo not include any explanation or markdown. If unsure, use \u0027unsupported\u0027 for route.",
    "options":  {

                }
}
```

### File Detector + Content Extractor Agent1

| Field | Value |
| --- | --- |
| Node ID | 9909e548-0334-42b2-a330-879d3bbb98ff |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3 |
| Position | -4224, 704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI Chat Model1 -> File Detector + Content Extractor Agent1 (output 0, input 0)
- Split Uploaded Binaries -> File Detector + Content Extractor Agent1 (output 0, input 0)

**Outgoing Connections**

- File Detector + Content Extractor Agent1 -> Parse Agent Extracted Content (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "promptType":  "define",
    "text":  "=You are a document ingestion and deep content extraction engine.\n\nInput:\n- Binary file\n- File metadata (fileName, mimeType)\n\nYour tasks:\n1. Detect file type and document type\n2. Extract ALL readable content in FULL DETAIL\n3. Preserve structure, wording, and intent\n4. Do NOT summarize\n5. Do NOT shorten\n6. Do NOT invent missing content\n\nExtraction rules:\n- Extract complete paragraphs, not snippets\n- Include headings, subheadings, bullet points, and descriptions\n- If tables exist, describe their contents fully in text\n- The extractedText field MUST be detailed enough to act as a knowledge base\n\nReturn STRICT JSON ONLY:\n\n{\n  \"fileName\": \"{{ $json.fileName }}\",\n  \"fileType\": \"pdf|doc|ppt|image|text|unknown\",\n  \"docType\": \"brd|frd|hld|lld|transcript|image|unknown\",\n  \"contentType\": \"plain-text|image-only|mixed\",\n  \"extractionType\": \"text|vision|mixed\",\n  \"extractedText\": \"FULL detailed extracted content\",\n  \"sections\": [\n    {\n      \"title\": \"Exact heading from document\",\n      \"content\": \"Complete text under this heading\"\n    }\n  ],\n  \"tables\": [],\n  \"lists\": [],\n  \"confidence\": 0.0\n}\n\nCRITICAL RULES:\n- extractedText must be long and detailed\n- Never return placeholder or example text\n- Never fabricate content\n- Always return valid JSON\n- No markdown\n- No explanations\n- The \"fileName\" field MUST be exactly the same as the input fileName.\n- NEVER invent or modify file names.\n",
    "options":  {

                }
}
```

### Flatten & Parse Extractor Output

| Field | Value |
| --- | --- |
| Node ID | 86cd0ea5-f493-42b6-b025-5e010e6842ee |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -2112, 720 |
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

### Loop Over Items

| Field | Value |
| --- | --- |
| Node ID | cbd26f74-1215-49e9-bf10-83de59aadb36 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | 2992, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert md to docx -> Loop Over Items (output 0, input 0)
- Split into Multiple User Stories -> Loop Over Items (output 0, input 0)

**Outgoing Connections**

- Loop Over Items -> Write Final Test Strategy File (output 0, input 0)
- Loop Over Items -> Convert md to docx (output 1, input 0)

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

### Loop Over Items1

| Field | Value |
| --- | --- |
| Node ID | 879c214d-a7a6-46c8-ab76-bd9d4bd46659 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -1680, 720 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Again Rename Binary Keys -> Loop Over Items1 (output 0, input 0)
- Replace Me -> Loop Over Items1 (output 0, input 0)

**Outgoing Connections**

- Loop Over Items1 -> Replace Me (output 1, input 0)

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

### Merge Images from 2 Sources

| Field | Value |
| --- | --- |
| Node ID | 91b7bc5b-f560-4bbb-8474-1d12ec776fa3 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -192, -80 |
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

}
```

### Merge JSON Outputs

| Field | Value |
| --- | --- |
| Node ID | cbe7eab8-8d7f-499d-82c5-f8474f7a6f34 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -2336, 720 |
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
| Node ID | 6fe9e5ee-54ab-44a4-a8a0-f1d9224ac8d6 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 1456, 720 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

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
| Node ID | 1b648802-620d-448b-bda7-17203202d349 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1648, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Normalized Image + Docs + Transcript Text -> Merged Context for OpenAI (output 0, input 0)

**Outgoing Connections**

- Merged Context for OpenAI -> OpenAI - Generate User Stories (output 0, input 0)

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

### OpenAI - Generate User Stories

| Field | Value |
| --- | --- |
| Node ID | d9b2250e-6646-4c6e-9ad6-d00514852f62 |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | 2048, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merged Context for OpenAI -> OpenAI - Generate User Stories (output 0, input 0)

**Outgoing Connections**

- OpenAI - Generate User Stories -> Prepare Markdown Content (output 0, input 0)

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
                                         "content":  "You are a Senior Product Owner and Business Analyst with 15+ years of experience defining enterprise-scale product requirements using Agile and Scrum frameworks. \nYou specialize in translating BRD, FRD, HLD, LLD, and stakeholder discussions into detailed INVEST-compliant Agile User Stories, Acceptance Criteria, Alternate Flows, and Test Scenarios.\n\nRules \u0026 Expectations:\n- Generate production-grade, implementation-ready user stories suitable for Jira/Azure DevOps.\n- Structure stories with high clarity, depth, and traceability back to source requirement intent.\n- Do not summarize or compress; instead expand details, UI/UX behavior, data handling, validations, error cases, integrations, and constraints.\n- Ensure each story stands independently and includes realistic examples and edge cases.\n- After every story block, insert the delimiter exactly as:\n--- USER_STORY_BREAK ---\n- Do not stop after the first story â€” continue until all extracted features are covered.\n\nTone: expert, precise, clear, solution-oriented.\n"
                                     },
                                     {
                                         "content":  "=You are provided with merged business and technical context extracted from BRD, FRD, HLD, LLD, workflows, and transcripts.\n\n========================\nMerged Requirements Context\n========================\n{{ $json[\"mergedContext\"] }}\n========================\n\n### Task\nStep 1 â€” **Extract high-level features** from the provided context. \nPresent only a bullet list named **\"Identified Features\"**.\n\nStep 2 â€” For **each identified feature**, generate a separate **highly detailed Agile User Story** following the structure below (one story per feature).\n\n### Required Story Structure\n# User Story ID: US-XXX\n## **Feature**\n## **User Story**\n## **Business Context \u0026 Narrative** (3â€“5 paragraphs)\n## **Primary Flow** (detailed step sequence)\n## **Alternate Flows**\n## **Exception / Error Handling**\n## **Acceptance Criteria â€“ Gherkin** (min 8â€“12 lines)\n## **UI / UX Requirements**\n## **Field-level Validation Rules**\n| Field | Rule | Error Message | Example |\n## **Data \u0026 Integration Requirements**\n## **Performance / NFRs**\n## **Test Scenarios** (8â€“15 realistic cases)\n## **Dependencies**\n## **Assumptions**\n## **Source Traceability**\n## **Automation Feasibility**\n\n### Constraints\n- Each story must contain 800â€“1200 words\n- Each story must deeply elaborate functional behavior, background logic, UI, validations, alternate flows, data needs, and corner cases\n- Use realistic example values and personas\n- Include the delimiter at end of each story:\n--- USER_STORY_BREAK ---\n\nGenerate multiple stories (not just one) â€” **one story per feature** extracted in Step 1.\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  12000,
                    "temperature":  0.5
                }
}
```

### OpenAI Chat Model

| Field | Value |
| --- | --- |
| Node ID | f87a9a38-bb90-4905-b196-356eae117060 |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.2 |
| Position | -4288, 464 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OpenAI Chat Model -> File Detector + Content Extractor Agent (output 0, input 0)

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
    "model":  {
                  "__rl":  true,
                  "value":  "gpt-4o-mini",
                  "mode":  "list",
                  "cachedResultName":  "gpt-4o-mini"
              },
    "options":  {

                }
}
```

### OpenAI Chat Model1

| Field | Value |
| --- | --- |
| Node ID | 63cb1ee9-7d72-4940-9901-4b0a3f572d35 |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.2 |
| Position | -4368, 912 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OpenAI Chat Model1 -> File Detector + Content Extractor Agent1 (output 0, input 0)

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
    "model":  {
                  "__rl":  true,
                  "value":  "gpt-4o-mini",
                  "mode":  "list",
                  "cachedResultName":  "gpt-4o-mini"
              },
    "options":  {

                }
}
```

### OpenAI Chat Model2

| Field | Value |
| --- | --- |
| Node ID | 110cc3be-e0ca-48ac-86e9-20e08f2dfc50 |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.2 |
| Position | -3600, 912 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OpenAI Chat Model2 -> Context Builder Agent (output 0, input 0)

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
    "model":  {
                  "__rl":  true,
                  "value":  "gpt-4o-mini",
                  "mode":  "list",
                  "cachedResultName":  "gpt-4o-mini"
              },
    "options":  {

                }
}
```

### Parse Agent Extracted Content

| Field | Value |
| --- | --- |
| Node ID | 43e9ee00-6870-4cf8-90e6-34ce0bf8b0ad |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -3872, 704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- File Detector + Content Extractor Agent1 -> Parse Agent Extracted Content (output 0, input 0)

**Outgoing Connections**

- Parse Agent Extracted Content -> Prepare Context Inputs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const results = [];\n\nfor (const inputItem of $input.all()) {\n  if (!inputItem.json.output) {\n    throw new Error(\"Missing \u0027output\u0027 field from extractor agent\");\n  }\n\n  let parsed;\n\n  // Case 1: Agent already returned an object\n  if (typeof inputItem.json.output === \"object\") {\n    parsed = inputItem.json.output;\n  }\n\n  // Case 2: Agent returned JSON as string\n  else if (typeof inputItem.json.output === \"string\") {\n    try {\n      parsed = JSON.parse(inputItem.json.output.trim());\n    } catch (e) {\n      throw new Error(\n        `Invalid JSON from extractor agent for one item. Raw output:\\n${inputItem.json.output}`\n      );\n    }\n  }\n\n  else {\n    throw new Error(\"Unsupported output type from extractor agent\");\n  }\n\n  results.push({\n    json: {\n      fileName: parsed.fileName,\n      fileType: parsed.fileType,\n      docType: parsed.docType,\n      contentType: parsed.contentType,\n      extractionType: parsed.extractionType,\n\n      extractedText: parsed.extractedText,\n      sections: parsed.sections || [],\n      tables: parsed.tables || [],\n      lists: parsed.lists || [],\n\n      confidence: parsed.confidence || 0\n    }\n  });\n}\n\nreturn results;\n"
}
```

### Parse the output JSON into actual objects

| Field | Value |
| --- | --- |
| Node ID | 1f4848da-43c4-4ce3-a6a3-b9dbfe87bdb6 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -3824, 320 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- File Detector + Content Extractor Agent -> Parse the output JSON into actual objects (output 0, input 0)

**Outgoing Connections**

- Parse the output JSON into actual objects -> Switch - Find Extractor (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Parse the agent output and attach the single binary object to all items\n\nreturn items.map((item,index) =\u003e {\n  let parsed = {};\n  try {\n    parsed = JSON.parse(item.json.output);\n  } catch (e) {\n    parsed = { error: \"Invalid JSON returned\", raw: item.json.output };\n  }\n\n // Directly access matching binary from Convert Binaries to json output\n  const source = $items(\"Convert Binaries to json\")[index];\n  const originalBinary = source?.binary || {};\n\n  return {\n    json: {\n      ...parsed,\n      id: index\n    },\n    binary: originalBinary\n  };\n});\n"
}
```

### Prepare Context Inputs

| Field | Value |
| --- | --- |
| Node ID | fdc9b7d7-be0c-464f-85f1-b857640cff7c |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -3664, 704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Parse Agent Extracted Content -> Prepare Context Inputs (output 0, input 0)

**Outgoing Connections**

- Prepare Context Inputs -> Context Builder Agent (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const documents = items.map(item =\u003e ({\n  fileName: item.json.fileName,\n  fileType: item.json.fileType,\n  docType: item.json.docType,\n  contentType: item.json.contentType,\n  extractionType: item.json.extractionType,\n\n  extractedText: item.json.extractedText,\n\n  sections: item.json.sections,\n  tables: item.json.tables,\n  lists: item.json.lists,\n\n  confidence: item.json.confidence\n}));\n\nreturn [\n  {\n    json: {\n      documentCount: documents.length,\n      documents\n    }\n  }\n];\n"
}
```

### Prepare Markdown Content

| Field | Value |
| --- | --- |
| Node ID | 2d73b30b-3f09-4f48-8f62-733bdbaa5348 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2384, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI - Generate User Stories -> Prepare Markdown Content (output 0, input 0)

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
| Node ID | 5daf664a-8707-43a5-bdde-3c5dbcff3e7b |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1824, 592 |
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
    "jsCode":  "// n8n Code node (JavaScript) - Preprocessor + Balanced Summarizer + Token Estimator\n// Input expected: items = [{ json: { mergedContext: \"....\", contextCount: N } }, ...]\n// Outputs: mergedContextCleaned, originalChars, cleanedChars, originalTokens, cleanedTokens, summaryTokens, summary, sections[]\n\nconst STOPWORDS = new Set([\n  \"the\",\"and\",\"is\",\"in\",\"it\",\"of\",\"to\",\"a\",\"for\",\"with\",\"on\",\"that\",\"as\",\"are\",\"be\",\"this\",\"by\",\"or\",\"an\",\"from\",\n  \"at\",\"we\",\"will\",\"should\",\"can\",\"which\",\"their\",\"have\",\"has\",\"not\",\"but\",\"if\",\"they\",\"these\",\"such\",\"may\",\"also\"\n]);\n\nfunction estimateTokensFromChars(chars) {\n  // Practical approximation: 1 token ~= 4 characters\n  // Adjust factor if you want more conservative estimate\n  return Math.max(1, Math.ceil(chars / 4));\n}\n\nfunction splitToSentences(text) {\n  // Simple sentence splitter - handles ., ?, !\n  // Keep short sentences intact\n  return text\n    .replace(/\\r\\n/g, \"\\n\")\n    .replace(/\\n+/g, \"\\n\")\n    .split(/(?\u003c=[.?!])\\s+(?=[A-Z0-9\"\u0027\\(\\[])/g)\n    .map(s =\u003e s.trim())\n    .filter(Boolean);\n}\n\nfunction scoreSentences(sentences, topNwords=120) {\n  // Simple frequency-based scoring (extractive)\n  const freq = {};\n  for (const s of sentences) {\n    const words = s.toLowerCase().replace(/[^a-z0-9\\s]/g, \" \").split(/\\s+/).filter(Boolean);\n    for (const w of words) {\n      if (STOPWORDS.has(w)) continue;\n      freq[w] = (freq[w] || 0) + 1;\n    }\n  }\n  // normalize and score\n  const scores = sentences.map(s =\u003e {\n    const words = s.toLowerCase().replace(/[^a-z0-9\\s]/g, \" \").split(/\\s+/).filter(Boolean);\n    let sc = 0;\n    for (const w of words) {\n      if (freq[w]) sc += freq[w];\n    }\n    // length-normalize a bit\n    sc = sc / Math.sqrt(Math.max(1, words.length));\n    return sc;\n  });\n  return scores;\n}\n\nfunction dedupeParagraphs(paragraphs) {\n  // Exact + lightweight fuzzy using trigram set Jaccard\n  const seen = [];\n  const out = [];\n  function ngrams(text, n=3){\n    const s = text.toLowerCase().replace(/\\s+/g, \" \").trim();\n    const out = [];\n    for (let i=0;i\u003cs.length-(n-1);i++){\n      out.push(s.slice(i,i+n));\n    }\n    return new Set(out);\n  }\n  for (const p of paragraphs) {\n    const pnorm = p.trim();\n    if (!pnorm) continue;\n    let isDup = false;\n    for (const s of seen) {\n      if (pnorm === s.raw) { isDup = true; break; }\n      // jaccard of char ngrams\n      const a = ngrams(pnorm), b = s.ng;\n      const inter = [...a].filter(x =\u003e b.has(x)).length;\n      const union = new Set([...a, ...b]).size;\n      const j = union === 0 ? 0 : inter/union;\n      if (j \u003e 0.85) { isDup = true; break; } // high threshold to avoid false positives\n    }\n    if (!isDup) {\n      seen.push({ raw: pnorm, ng: ngrams(pnorm) });\n      out.push(pnorm);\n    }\n  }\n  return out;\n}\n\nfunction normalizeHeadingsAndRemoveUndefined(md) {\n  // Remove \"## undefined\", orphan code fences; normalize \\page markers\n  let s = md.replace(/```(?:markdown)?/gi, \"\\n\"); // remove code fences markers\n  s = s.replace(/\\\\page/g, \"\\n\\n---\\n\\n\"); // unify page breaks\n  // remove headings that are just \u0027undefined\u0027 or blank\n  s = s.replace(/^(#{1,6})\\s*(undefined)\\s*$/gim, \"\");\n  // collapse excessive newlines\n  s = s.replace(/\\n{3,}/g, \"\\n\\n\");\n  return s.trim();\n}\n\nfunction splitIntoSections(text) {\n  // If markdown headings exist (h2/h3), split by them; otherwise return single section\n  const lines = text.split(\"\\n\");\n  const sections = [];\n  let curTitle = \"Document\";\n  let curBuf = [];\n\n  const headingRe = /^(#{1,6})\\s*(.+)$/;\n  for (let line of lines) {\n    const m = line.match(headingRe);\n    if (m) {\n      // flush\n      if (curBuf.length) {\n        sections.push({ sectionName: curTitle, text: curBuf.join(\"\\n\").trim() });\n      }\n      curTitle = m[2].trim();\n      curBuf = [];\n    } else {\n      curBuf.push(line);\n    }\n  }\n  if (curBuf.length) sections.push({ sectionName: curTitle, text: curBuf.join(\"\\n\").trim() });\n  return sections;\n}\n\nfunction summarizeExtractive(text, tokenBudget, mode=\"balanced\") {\n  // mode: \u0027concise\u0027 (more aggressive), \u0027balanced\u0027, \u0027detailed\u0027 (less aggressive)\n  if (!text || !text.trim()) return { summary: \"\", tokens: 0, chars: 0 };\n\n  const sentences = splitToSentences(text);\n  if (sentences.length === 0) return { summary: \"\", tokens: 0, chars: 0 };\n\n  const scores = scoreSentences(sentences);\n  // pair and sort\n  const pairs = sentences.map((s,i)=\u003e({s, score: scores[i], idx:i, chars: s.length}));\n  pairs.sort((a,b)=\u003eb.score - a.score);\n\n  // select sentences until tokenBudget reached (estimate)\n  const chosen = [];\n  let charsCount = 0;\n  for (const p of pairs) {\n    const estTokens = estimateTokensFromChars(p.chars);\n    const currentTokens = estimateTokensFromChars(charsCount);\n    if (currentTokens + estTokens \u003e tokenBudget) continue;\n    // Keep ordering by original index for readability\n    chosen.push(p);\n    charsCount += p.chars;\n  }\n\n  // If nothing selected (budget too small), pick top 1 sentence\n  if (chosen.length === 0) {\n    const top = pairs[0];\n    chosen.push(top);\n    charsCount = top.chars;\n  }\n\n  // Order chosen sentences by original order\n  chosen.sort((a,b)=\u003ea.idx - b.idx);\n  const summary = chosen.map(x=\u003ex.s).join(\" \");\n\n  return { summary: summary.trim(), tokens: estimateTokensFromChars(charsCount), chars: charsCount };\n}\n\n// -------------------- Main Node Logic --------------------\n\nconst inputs = items.map(i=\u003ei.json);\nconst mergedRaw = inputs.map(i=\u003ei.mergedContext || \"\").join(\"\\n\\n---\\n\\n\");\nconst contextCount = inputs.reduce((acc,i)=\u003e acc + (i.contextCount || 0), 0);\n\n// 1) Normalize and remove obvious garbage\nlet cleaned = normalizeHeadingsAndRemoveUndefined(mergedRaw);\n\n// 2) Break into paragraphs and dedupe\nconst paragraphs = cleaned.split(/\\n{2,}/).map(p=\u003ep.trim()).filter(Boolean);\nconst dedupedParas = dedupeParagraphs(paragraphs);\n\n// rebuild cleaned context\ncleaned = dedupedParas.join(\"\\n\\n\");\n\n// 3) Split into sections (by headings if any)\nconst sections = splitIntoSections(cleaned);\n\n// If sections are just single \u0027Document\u0027 and very long, optionally try to chunk by length\n// But for balanced mode we will still summarize\n\n// 4) Compute sizes and token estimates\nconst originalChars = mergedRaw.length;\nconst cleanedChars = cleaned.length;\nconst originalTokens = estimateTokensFromChars(originalChars);\nconst cleanedTokens = estimateTokensFromChars(cleanedChars);\n\n// 5) Summarize: balanced mode target\nconst TARGET_TOKENS_FOR_LLM = 6500; // \u003c--- tune this to control LLM cost\n// If cleanedTokens already less than target, return full cleaned text as summary-friendly\nlet summaryText = \"\";\nlet summaryTokens = 0;\n\n// Option B = Balanced summarization: summarize per-section but preserve sections until budget\nif (cleanedTokens \u003c= TARGET_TOKENS_FOR_LLM) {\n  summaryText = cleaned;\n  summaryTokens = cleanedTokens;\n} else {\n  // Distribute budget across sections proportional to section size\n  const sectionsInfo = sections.map(sec=\u003e{\n    const chars = sec.text.length;\n    const tokens = estimateTokensFromChars(chars);\n    return { sectionName: sec.sectionName, text: sec.text, chars, tokens };\n  });\n\n  const totalTokensSection = sectionsInfo.reduce((a,b)=\u003ea + b.tokens, 0) || 1;\n  const perSectionSummaries = [];\n  let tokensUsed = 0;\n\n  for (const s of sectionsInfo) {\n    // allocate proportional budget but at least 80 tokens for small sections\n    const alloc = Math.max(120, Math.floor((s.tokens / totalTokensSection) * (TARGET_TOKENS_FOR_LLM - 200)));\n    const summ = summarizeExtractive(s.text, alloc, \"detailed\");\n    perSectionSummaries.push({ sectionName: s.sectionName, summary: summ.summary, chars: summ.chars, tokens: summ.tokens });\n    tokensUsed += summ.tokens;\n  }\n\n  // Build final summary text by joining section summaries\n  summaryText = perSectionSummaries.map(s=\u003e `## ${s.sectionName}\\n\\n${s.summary}`).join(\"\\n\\n\");\n  summaryTokens = tokensUsed;\n}\n\n// 6) Prepare section-level summaries for output (use smaller local budgets)\nconst sectionOutputs = sections.map(sec =\u003e {\n  const secTokens = estimateTokensFromChars(sec.text.length);\n  const budget = Math.max(60, Math.floor(Math.min(secTokens, 300))); // small budget per section\n  const summ = summarizeExtractive(sec.text, budget, \"detailed\");\n  return {\n    sectionName: sec.sectionName,\n    text: sec.text,\n    chars: sec.text.length,\n    tokens: estimateTokensFromChars(sec.text.length),\n    summary: summ.summary,\n    summaryChars: summ.chars,\n    summaryTokens: summ.tokens\n  };\n});\n\n// return single output item\nreturn [\n  {\n    json: {\n      mergedContextCleaned: cleaned,\n      contextCount: contextCount,\n      originalChars,\n      cleanedChars,\n      originalTokens,\n      cleanedTokens,\n      targetTokensForLLM: TARGET_TOKENS_FOR_LLM,\n      summaryTokens,\n      summary: summaryText,\n      sections: sectionOutputs\n    }\n  }\n];\n"
}
```

### Replace Me

| Field | Value |
| --- | --- |
| Node ID | 2e3c544c-ff74-46c6-be32-f2ee0b716437 |
| Type | n8n-nodes-base.noOp |
| Type Version | 1 |
| Position | -1472, 864 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop Over Items1 -> Replace Me (output 1, input 0)

**Outgoing Connections**

- Replace Me -> Loop Over Items1 (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Requirement Content Extractor

| Field | Value |
| --- | --- |
| Node ID | c479948b-a5d1-4df3-b13c-d7b32d90fe87 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3 |
| Position | 64, -32 |
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
    "promptType":  "define",
    "text":  "You are a senior BA + QA hybrid.\n\nInput may include:\n- BRD, FRD, HLD, LLD text\n- Grooming transcripts\n- UI / architecture images\n\nYour task:\n1. Extract functional requirements\n2. Extract business rules\n3. Extract user flows\n4. Extract non-functional requirements\n5. Preserve source type and confidence\n\nOutput STRICT JSON:\n{\n  sourceType,\n  extractedRequirements[],\n  assumptions[],\n  ambiguities[],\n  dependencies[]\n}\n",
    "options":  {

                }
}
```

### Run Python Extractor to extract images

| Field | Value |
| --- | --- |
| Node ID | 0fc7708c-9e0b-4af9-9bd5-0d50762c3ff2 |
| Type | n8n-nodes-base.executeCommand |
| Type Version | 1 |
| Position | -2544, 816 |
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
| Node ID | f1444f51-59d8-45cc-8b7f-8e162f3f2099 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | -2784, 704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

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

### Simple Memory

| Field | Value |
| --- | --- |
| Node ID | 70563bb8-8deb-40f2-b5de-c16402c3a07b |
| Type | @n8n/n8n-nodes-langchain.memoryBufferWindow |
| Type Version | 1.3 |
| Position | -4128, 464 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Simple Memory -> File Detector + Content Extractor Agent (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "sessionIdType":  "customKey",
    "sessionKey":  "data"
}
```

### Split into Multiple User Stories

| Field | Value |
| --- | --- |
| Node ID | f7a185ab-9173-4d1f-9586-7876698d73e2 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2784, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Clean Markdown Formatting -> Split into Multiple User Stories (output 0, input 0)

**Outgoing Connections**

- Split into Multiple User Stories -> Loop Over Items (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const md = items[0].json.cleanedMarkdown;\n\n// regex that matches variations like whitespace, dashes, etc.\nconst stories = md.split(/\\s*-*\\s*USER_STORY_BREAK\\s*-*\\s*/g).map((block, i) =\u003e ({\n  json: {\n    storyIndex: i + 1,\n    markdown: block.trim()\n  }\n}));\n\nreturn stories;\n"
}
```

### Split Uploaded Binaries

| Field | Value |
| --- | --- |
| Node ID | abff93a7-9a15-40cc-92f0-7dc1ca6f518c |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4512, 704 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook - Upload Test Docs -> Split Uploaded Binaries (output 0, input 0)

**Outgoing Connections**

- Split Uploaded Binaries -> File Detector + Content Extractor Agent1 (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const output = [];\n\nfor (const item of items) {\n  const binaries = item.binary || {};\n\n  for (const [key, binary] of Object.entries(binaries)) {\n    output.push({\n      json: {\n        fileName: binary.fileName || key,\n        mimeType: binary.mimeType || \u0027\u0027,\n      },\n      binary: {\n        data: binary\n      }\n    });\n  }\n}\n\nreturn output;\n"
}
```

### Switch - Find Extractor

| Field | Value |
| --- | --- |
| Node ID | c6e6edb8-4cb5-490f-bb3d-f8dcad7adaae |
| Type | n8n-nodes-base.switch |
| Type Version | 3.3 |
| Position | -3552, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Parse the output JSON into actual objects -> Switch - Find Extractor (output 0, input 0)

**Outgoing Connections**

- None

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
                                                                               "leftValue":  "={{ $json.route }}",
                                                                               "rightValue":  "extract-images",
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
                                                                               "leftValue":  "={{ $json.route }}",
                                                                               "rightValue":  "no-extract",
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
                                                                               "leftValue":  "={{ $json.route }}",
                                                                               "rightValue":  "unsupported",
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

### Webhook - Upload Test Docs

| Field | Value |
| --- | --- |
| Node ID | 1c31f7bd-3d0b-4941-894f-b8ea6cd96a26 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | -4752, 704 |
| Disabled |  |
| Always Output Data | False |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Webhook - Upload Test Docs -> Split Uploaded Binaries (output 0, input 0)

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
| Node ID | bd5c6b63-f6c6-4003-94ee-4f944aeb01a4 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 3408, 720 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop Over Items -> Write Final Test Strategy File (output 0, input 0)

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
    "fileName":  "=C:\\\\Users\\\\anujalhans01\\\\Downloads\\\\Generated-User-Story-{{$now.toFormat(\u0027yyyyLLdd_HHmmss_SSS\u0027)}}-{{ $json.storyIndex }}.docx",
    "options":  {

                }
}
```

