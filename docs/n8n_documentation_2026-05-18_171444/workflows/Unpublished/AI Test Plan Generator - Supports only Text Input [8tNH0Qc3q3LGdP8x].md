# AI Test Plan Generator - Supports only Text Input

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 8tNH0Qc3q3LGdP8x |
| Active | False |
| Archived | True |
| Created At | 2025-11-03T05:02:47.772Z |
| Updated At | 2026-04-16T10:15:53.000Z |
| Node Count | 20 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\AI Test Plan Generator - Supports only Text Input [8tNH0Qc3q3LGdP8x].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Start | n8n-nodes-base.manualTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.openAi | 1 |
| n8n-nodes-base.code | 5 |
| n8n-nodes-base.extractFromFile | 4 |
| n8n-nodes-base.httpRequest | 1 |
| n8n-nodes-base.manualTrigger | 1 |
| n8n-nodes-base.merge | 2 |
| n8n-nodes-base.readWriteFile | 6 |

## Credentials Referenced

- openAiApi: OpenAi Account 2

## External Dependencies Detected

### URL Hints

- http://127.0.0.1:8000/convert

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- Start -> Read BRD Document (source output 0, target input 0)
- Start -> Read FRD Document (source output 0, target input 0)
- Start -> Read HLD Document (source output 0, target input 0)
- Start -> Read LLD Document (source output 0, target input 0)
- Start -> Read Transcript File (source output 0, target input 0)
- Read BRD Document -> Extract BRD Text (source output 0, target input 0)
- Read FRD Document -> Extract FRD Text (source output 0, target input 0)
- Read HLD Document -> Extract HLD Text (source output 0, target input 0)
- Read LLD Document -> Extract LLD Text (source output 0, target input 0)
- Read Transcript File -> Normalize Transcript Text (source output 0, target input 0)
- Extract BRD Text -> Merge (source output 0, target input 0)
- Extract FRD Text -> Merge (source output 0, target input 1)
- Extract HLD Text -> Merge (source output 0, target input 2)
- Extract LLD Text -> Merge (source output 0, target input 3)
- Normalize Extracted Text -> Merge Normalized Docs + Normalized Transcript Text (source output 0, target input 0)
- Normalize Transcript Text -> Merge Normalized Docs + Normalized Transcript Text (source output 0, target input 1)
- OpenAI - Generate Test Plan -> Prepare Markdown Content (source output 0, target input 0)
- Prepare Markdown Content -> Clean Markdown Formatting (source output 0, target input 0)
- Convert md to docx -> Write Final Test Plan File (source output 0, target input 0)
- Merge -> Normalize Extracted Text (source output 0, target input 0)
- Merge Normalized Docs + Normalized Transcript Text -> Merged Context for OpenAI (source output 0, target input 0)
- Merged Context for OpenAI -> OpenAI - Generate Test Plan (source output 0, target input 0)
- Clean Markdown Formatting -> Convert md to docx (source output 0, target input 0)

## Nodes

### Clean Markdown Formatting

| Field | Value |
| --- | --- |
| Node ID | ee820816-9314-469c-a68d-14967575cdcd |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1600, 576 |
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

### Convert md to docx

| Field | Value |
| --- | --- |
| Node ID | 44e08bbe-1d37-4921-9cad-3df2a6869e05 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | 1824, 576 |
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
                                                  "value":  "={{ $(\u0027OpenAI - Generate Test Plan\u0027).item.json.output[0].content[0].text }}"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### Extract BRD Text

| Field | Value |
| --- | --- |
| Node ID | c7f2db9f-edbe-4be4-96b8-b577a9683580 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -80, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Read BRD Document -> Extract BRD Text (output 0, input 0)

**Outgoing Connections**

- Extract BRD Text -> Merge (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "pdf",
    "options":  {

                }
}
```

### Extract FRD Text

| Field | Value |
| --- | --- |
| Node ID | c5714c11-4ca1-44c0-b02c-7a345a25f423 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -80, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Read FRD Document -> Extract FRD Text (output 0, input 0)

**Outgoing Connections**

- Extract FRD Text -> Merge (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "pdf",
    "options":  {

                }
}
```

### Extract HLD Text

| Field | Value |
| --- | --- |
| Node ID | 4e3cc78c-005d-4655-b30d-a3dde42f62bc |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -80, 496 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Read HLD Document -> Extract HLD Text (output 0, input 0)

**Outgoing Connections**

- Extract HLD Text -> Merge (output 0, input 2)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "pdf",
    "options":  {

                }
}
```

### Extract LLD Text

| Field | Value |
| --- | --- |
| Node ID | 795b391c-81d9-48bd-8085-267933da511d |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -80, 688 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Read LLD Document -> Extract LLD Text (output 0, input 0)

**Outgoing Connections**

- Extract LLD Text -> Merge (output 0, input 3)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "pdf",
    "options":  {

                }
}
```

### Merge

| Field | Value |
| --- | --- |
| Node ID | f64be064-f710-4000-a003-ba444b6dd6c6 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 144, 368 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Extract BRD Text -> Merge (output 0, input 0)
- Extract FRD Text -> Merge (output 0, input 1)
- Extract HLD Text -> Merge (output 0, input 2)
- Extract LLD Text -> Merge (output 0, input 3)

**Outgoing Connections**

- Merge -> Normalize Extracted Text (output 0, input 0)

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

### Merge Normalized Docs + Normalized Transcript Text

| Field | Value |
| --- | --- |
| Node ID | 94052c10-d1b0-4544-866b-d531c3e8a03d |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 592, 576 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Extracted Text -> Merge Normalized Docs + Normalized Transcript Text (output 0, input 0)
- Normalize Transcript Text -> Merge Normalized Docs + Normalized Transcript Text (output 0, input 1)

**Outgoing Connections**

- Merge Normalized Docs + Normalized Transcript Text -> Merged Context for OpenAI (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Merged Context for OpenAI

| Field | Value |
| --- | --- |
| Node ID | 0908504c-c6df-47ad-8be4-030dcb34164b |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 816, 576 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Normalized Docs + Normalized Transcript Text -> Merged Context for OpenAI (output 0, input 0)

**Outgoing Connections**

- Merged Context for OpenAI -> OpenAI - Generate Test Plan (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Merge all normalized document + transcript text into one large context\nlet allTexts = [];\n\nfor (const item of items) {\n  const src = item.json.sourceType || item.json.sourceName || \"Unknown Source\";\n  const txt = item.json.text || \"\";\n\n  if (txt.trim()) {\n    allTexts.push(txt); // already has Source: tags\n  }\n}\n\n// Optional: Insert separator between sources\nconst merged = allTexts.join(\"\\n\\n---\\n\\n\");\n\nreturn [{\n  json: {\n    mergedContext: merged,\n    contextCount: allTexts.length\n  }\n}];\n"
}
```

### Normalize Extracted Text

| Field | Value |
| --- | --- |
| Node ID | 91324cf2-494e-4b00-9b85-e5ced8b855f2 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 368, 400 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge -> Normalize Extracted Text (output 0, input 0)

**Outgoing Connections**

- Normalize Extracted Text -> Merge Normalized Docs + Normalized Transcript Text (output 0, input 0)

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

### Normalize Transcript Text

| Field | Value |
| --- | --- |
| Node ID | 7476afba-634d-442b-acbb-5464b63b8a41 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 384, 912 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Read Transcript File -> Normalize Transcript Text (output 0, input 0)

**Outgoing Connections**

- Normalize Transcript Text -> Merge Normalized Docs + Normalized Transcript Text (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Normalize and tag Grooming Transcript\nlet combinedText = \u0027\u0027;\nfor (const item of items) {\n  let text = \u0027\u0027;\n\n  if (item.binary?.data) {\n    const dataBuffer = Buffer.from(item.binary.data.data || item.binary.data, \u0027base64\u0027);\n    text = dataBuffer.toString(\u0027utf8\u0027);\n  } else if (item.json?.data) {\n    text = item.json.data.toString();\n  } else if (item.json?.text) {\n    text = item.json.text.toString();\n  }\n\n  combinedText += \u0027\\n\u0027 + text.trim();\n}\n\ncombinedText = combinedText\n  .replace(/\\r/g, \u0027\u0027)\n  .replace(/\\n{3,}/g, \u0027\\n\\n\u0027)\n  .replace(/[ \\t]{2,}/g, \u0027 \u0027)\n  .trim();\n\n// Tag with header\nreturn [{\n  json: {\n    sourceName: \"Grooming Transcript\",\n    sourceType: \"TRANSCRIPT\",\n    text: `### Source: GROOMING TRANSCRIPT\\n${combinedText}`,\n    timestamp: new Date().toISOString()\n  }\n}];\n"
}
```

### OpenAI - Generate Test Plan

| Field | Value |
| --- | --- |
| Node ID | 53b520ea-1ee6-419b-b35d-656ed322fc9a |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | 1040, 576 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merged Context for OpenAI -> OpenAI - Generate Test Plan (output 0, input 0)

**Outgoing Connections**

- OpenAI - Generate Test Plan -> Prepare Markdown Content (output 0, input 0)

**Credential References**

```json
{
    "openAiApi":  {
                      "id":  "rdVg2Kks1mUCJf4R",
                      "name":  "OpenAi Account 2"
                  }
}
```

**Full Parameter Snapshot**

```json
{
    "modelId":  {
                    "__rl":  true,
                    "value":  "gpt-4.1-mini",
                    "mode":  "list",
                    "cachedResultName":  "GPT-4.1-MINI"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "role":  "system",
                                         "content":  "You are a Senior QA Test Manager with over 15 years of experience leading large-scale enterprise testing programs. \nYou specialize in Shift-Left Quality and Automation-First approaches, integrating QA deeply within CI/CD pipelines.\nYou have extensive experience in transforming raw business and technical documentation into actionable, data-driven, and traceable test strategies.\n\nYou are skilled at reading and interpreting:\n- Business Requirement Documents (BRD)\n- Functional Requirement Documents (FRD)\n- Low-Level Designs (LLD)\n- High-Level Designs (HLD)\n- Grooming session transcripts and stakeholder discussions\n\nYour outputs must demonstrate:\n- Analytical reasoning based directly on excerpts or statements from the provided materials.\n- A clear connection between **requirement intent**, **test coverage**, **automation feasibility**, and **risk mitigation**.\n- A focus on measurable, proactive quality metrics, and early defect prevention.\n- Realistic and context-aware alignment with Shift-Left and Automation-First principles.\n"
                                     },
                                     {
                                         "content":  "You are provided with a merged context that combines information extracted from the BRD, FRD, LLD, HLD, and grooming session transcripts. \nThese documents may include requirements, features, workflows, functional and non-functional details, and stakeholder discussions.\n\nYour task is to analyze the provided content carefully and generate a **comprehensive, professional, and context-grounded Test Plan** aligned with Shift-Left and Automation-First principles.\n\n### Instructions:\n1. Use **direct excerpts or paraphrased statements** from the provided documents wherever applicable. \n   - Quote important phrases in italics or blockquotes to preserve authenticity.\n   - Reference their origin (e.g., â€œAs mentioned in BRDâ€¦â€ or â€œAccording to LLD sectionâ€¦â€).\n2. Demonstrate clear traceability between **requirements â†’ testing objectives â†’ automation approach â†’ risk mitigation.**\n3. For every key area (test strategy, scope, risks, etc.), link back to **specific project elements or statements** from the input documents.\n4. Use tables or bullet lists where appropriate to make the plan easy to read and well-structured.\n\n### Structure your Test Plan as follows:\n1. **Test Strategy** â€“ Include how Shift-Left and Automation-First are embedded. Reference early testing opportunities from the design or grooming stages.\n2. **Scope** â€“ Distinguish in-scope vs. out-of-scope features, based on specific content from the documents.\n3. **Test Objectives** â€“ Mention objectives tied to functional or non-functional requirements.\n4. **Test Deliverables**\n5. **Entry and Exit Criteria**\n6. **Test Schedule and Milestones**\n7. **Risks and Mitigation Plan** â€“ Mention risks cited in the documents or inferred from complexity areas.\n8. **Test Environment** â€“ Include CI/CD, environment provisioning, and test data setup strategies.\n9. **Tools and Resources** â€“ Reference relevant automation or workflow tools mentioned or implied in the docs.\n10. **Roles and Responsibilities**\n11. **Test Data and Configurations** â€“ Include synthetic data strategy or test coverage automation if applicable.\n12. **Reporting and Communication Plan** â€“ Mention dashboards, metrics, and traceability matrices.\n13. **Appendix (Optional)** â€“ Include a summarized mapping table:\n    | Source Document | Key Excerpt | Related Test Focus Area | Automation Feasibility |\n\nEnsure:\n- The output reads like a **real Test Plan prepared for stakeholders**, not an academic essay.\n- Each section has **specific references** to document content to establish credibility and traceability.\n- The tone is professional, precise, and easy to publish directly as part of QA governance documentation.\n\n**Merged Context (from all input sources):**\n{{$json[\"mergedContext\"]}}\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  4000,
                    "temperature":  0.7
                }
}
```

### Prepare Markdown Content

| Field | Value |
| --- | --- |
| Node ID | 1e4f8522-1555-416b-9874-408543ebc48c |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1392, 576 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI - Generate Test Plan -> Prepare Markdown Content (output 0, input 0)

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

### Read BRD Document

| Field | Value |
| --- | --- |
| Node ID | 4349056a-d788-4f6d-8f90-88284e8a2e23 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | -304, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Start -> Read BRD Document (output 0, input 0)

**Outgoing Connections**

- Read BRD Document -> Extract BRD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "fileSelector":  "C:\\\\Users\\\\anujalhans01\\\\Downloads\\\\ShopSmart_BRD.pdf",
    "options":  {

                }
}
```

### Read FRD Document

| Field | Value |
| --- | --- |
| Node ID | d39fe769-0bbb-476a-b11b-baaf1e7fc03b |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | -304, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Start -> Read FRD Document (output 0, input 0)

**Outgoing Connections**

- Read FRD Document -> Extract FRD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "fileSelector":  "C:\\\\Users\\\\anujalhans01\\\\Downloads\\\\ShopSmart_FRD.pdf",
    "options":  {

                }
}
```

### Read HLD Document

| Field | Value |
| --- | --- |
| Node ID | d83d80be-527e-40b3-b14e-9c09b3c0f342 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | -304, 496 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Start -> Read HLD Document (output 0, input 0)

**Outgoing Connections**

- Read HLD Document -> Extract HLD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "fileSelector":  "C:\\\\Users\\\\anujalhans01\\\\Downloads\\\\ShopSmart_HLD.pdf",
    "options":  {

                }
}
```

### Read LLD Document

| Field | Value |
| --- | --- |
| Node ID | 629349da-9afb-4e1d-aa06-cf5c31bd306d |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | -304, 688 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Start -> Read LLD Document (output 0, input 0)

**Outgoing Connections**

- Read LLD Document -> Extract LLD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "fileSelector":  "C:\\\\Users\\\\anujalhans01\\\\Downloads\\\\ShopSmart_LLD.pdf",
    "options":  {

                }
}
```

### Read Transcript File

| Field | Value |
| --- | --- |
| Node ID | 608784fe-e6eb-4d5f-8207-fcba6b596c95 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | -304, 912 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Start -> Read Transcript File (output 0, input 0)

**Outgoing Connections**

- Read Transcript File -> Normalize Transcript Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "fileSelector":  "C:\\\\Users\\\\anujalhans01\\\\Downloads\\\\ShopSmart_Grooming_Transcript.txt",
    "options":  {

                }
}
```

### Start

| Field | Value |
| --- | --- |
| Node ID | c80c7f0e-ac31-46b4-b25f-5dbc1ae3fc14 |
| Type | n8n-nodes-base.manualTrigger |
| Type Version | 1 |
| Position | -528, 464 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Start -> Read BRD Document (output 0, input 0)
- Start -> Read FRD Document (output 0, input 0)
- Start -> Read HLD Document (output 0, input 0)
- Start -> Read LLD Document (output 0, input 0)
- Start -> Read Transcript File (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Write Final Test Plan File

| Field | Value |
| --- | --- |
| Node ID | 5ee37edf-7713-4f51-9d36-010a5ca3bad0 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 2048, 576 |
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
    "fileName":  "C:\\\\Users\\\\anujalhans01\\\\Downloads\\\\Generated-Test-Plan.docx",
    "options":  {

                }
}
```
