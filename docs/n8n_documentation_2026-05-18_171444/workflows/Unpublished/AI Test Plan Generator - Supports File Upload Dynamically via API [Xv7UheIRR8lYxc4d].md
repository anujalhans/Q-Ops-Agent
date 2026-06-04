# AI Test Plan Generator - Supports File Upload Dynamically via API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | Xv7UheIRR8lYxc4d |
| Active | False |
| Archived | True |
| Created At | 2025-11-03T08:17:55.904Z |
| Updated At | 2026-04-16T10:15:13.000Z |
| Node Count | 21 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\AI Test Plan Generator - Supports File Upload Dynamically via API [Xv7UheIRR8lYxc4d].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Webhook - Upload Test Docs | n8n-nodes-base.webhook | POST | /upload-test-docs

Known webhook route hints:

- POST /webhook/upload-test-docs

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.openAi | 1 |
| n8n-nodes-base.code | 10 |
| n8n-nodes-base.extractFromFile | 5 |
| n8n-nodes-base.httpRequest | 1 |
| n8n-nodes-base.merge | 2 |
| n8n-nodes-base.readWriteFile | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- openAiApi: OpenAi account 4

## External Dependencies Detected

### URL Hints

- http://127.0.0.1:8000/convert

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- Extract BRD Text -> Merge (source output 0, target input 0)
- Extract FRD Text -> Merge (source output 0, target input 1)
- Extract HLD Text -> Merge (source output 0, target input 2)
- Extract LLD Text -> Merge (source output 0, target input 3)
- Normalize Transcript Text -> Merge Normalized Docs + Transcript Text (source output 0, target input 1)
- OpenAI - Generate Test Plan -> Prepare Markdown Content (source output 0, target input 0)
- Prepare Markdown Content -> Clean Markdown Formatting (source output 0, target input 0)
- Convert md to docx -> Write Final Test Plan File (source output 0, target input 0)
- Merge -> Normalize Docs Text (source output 0, target input 0)
- Merged Context for OpenAI -> OpenAI - Generate Test Plan (source output 0, target input 0)
- Clean Markdown Formatting -> Convert md to docx (source output 0, target input 0)
- Webhook - Upload Test Docs -> Rename binary key - Transcript (source output 0, target input 0)
- Webhook - Upload Test Docs -> Rename binary key - LLD (source output 0, target input 0)
- Webhook - Upload Test Docs -> Rename binary key - HLD (source output 0, target input 0)
- Webhook - Upload Test Docs -> Rename binary key - FRD (source output 0, target input 0)
- Webhook - Upload Test Docs -> Rename binary key - BRD (source output 0, target input 0)
- Rename binary key - Transcript -> Extract Transcript Text (source output 0, target input 0)
- Rename binary key - LLD -> Extract LLD Text (source output 0, target input 0)
- Rename binary key - HLD -> Extract HLD Text (source output 0, target input 0)
- Rename binary key - FRD -> Extract FRD Text (source output 0, target input 0)
- Rename binary key - BRD -> Extract BRD Text (source output 0, target input 0)
- Extract Transcript Text -> Normalize Transcript Text (source output 0, target input 0)
- Normalize Docs Text -> Merge Normalized Docs + Transcript Text (source output 0, target input 0)
- Merge Normalized Docs + Transcript Text -> Merged Context for OpenAI (source output 0, target input 0)

## Nodes

### Clean Markdown Formatting

| Field | Value |
| --- | --- |
| Node ID | c4e12992-346d-4b91-925c-86da2f15c441 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1344, 736 |
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
| Node ID | 99ba5251-ce0a-49c5-bfa0-f48b92098560 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | 1568, 736 |
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
| Node ID | b23dbfd4-7718-432f-9e43-85d35e063bea |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -352, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename binary key - BRD -> Extract BRD Text (output 0, input 0)

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
    "binaryPropertyName":  "data0",
    "options":  {

                }
}
```

### Extract FRD Text

| Field | Value |
| --- | --- |
| Node ID | 65a4d9ba-2060-4033-b768-26da2ed1bbcb |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -352, 464 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename binary key - FRD -> Extract FRD Text (output 0, input 0)

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
    "binaryPropertyName":  "data1",
    "options":  {

                }
}
```

### Extract HLD Text

| Field | Value |
| --- | --- |
| Node ID | 872d6bd4-ea10-4b23-b940-74724a1c2df3 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -352, 656 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename binary key - HLD -> Extract HLD Text (output 0, input 0)

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
    "binaryPropertyName":  "data2",
    "options":  {

                }
}
```

### Extract LLD Text

| Field | Value |
| --- | --- |
| Node ID | c9e639a6-4211-4248-b8f9-f84ac90eb693 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -352, 848 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename binary key - LLD -> Extract LLD Text (output 0, input 0)

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
    "binaryPropertyName":  "data3",
    "options":  {

                }
}
```

### Extract Transcript Text

| Field | Value |
| --- | --- |
| Node ID | 2f239ddf-7aa1-4ab7-a018-2691f48234e2 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | -352, 1040 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Rename binary key - Transcript -> Extract Transcript Text (output 0, input 0)

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
    "binaryPropertyName":  "data4",
    "options":  {

                }
}
```

### Merge

| Field | Value |
| --- | --- |
| Node ID | 8d7a62b5-767d-493b-a33e-1a802acb7ec4 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -128, 528 |
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

- Merge -> Normalize Docs Text (output 0, input 0)

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

### Merge Normalized Docs + Transcript Text

| Field | Value |
| --- | --- |
| Node ID | 8f00cf69-8b31-4a23-9668-4d3112bf434d |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 320, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Transcript Text -> Merge Normalized Docs + Transcript Text (output 0, input 1)
- Normalize Docs Text -> Merge Normalized Docs + Transcript Text (output 0, input 0)

**Outgoing Connections**

- Merge Normalized Docs + Transcript Text -> Merged Context for OpenAI (output 0, input 0)

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
| Node ID | 46588d84-93f0-4a6f-a1dd-271a6b8d8d2e |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 544, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Normalized Docs + Transcript Text -> Merged Context for OpenAI (output 0, input 0)

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

### Normalize Docs Text

| Field | Value |
| --- | --- |
| Node ID | f3e6608a-9507-4f41-a796-83e7308fa2e1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 96, 560 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge -> Normalize Docs Text (output 0, input 0)

**Outgoing Connections**

- Normalize Docs Text -> Merge Normalized Docs + Transcript Text (output 0, input 0)

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
| Node ID | 08628f2f-1bb0-4d79-b343-6ca4362f249f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 96, 1040 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Extract Transcript Text -> Normalize Transcript Text (output 0, input 0)

**Outgoing Connections**

- Normalize Transcript Text -> Merge Normalized Docs + Transcript Text (output 0, input 1)

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

### OpenAI - Generate Test Plan

| Field | Value |
| --- | --- |
| Node ID | dd29496d-2f3d-479e-bdb9-3f0997af57db |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | 768, 736 |
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
                      "id":  "8vgztQhfHXEOcdwI",
                      "name":  "OpenAi account 4"
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
| Node ID | 93c94a73-6c0f-4070-a5d9-230b1f9f8b81 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 736 |
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

### Rename binary key - BRD

| Field | Value |
| --- | --- |
| Node ID | 1cbce7a7-024c-41b7-8c46-fe9a7a5e7847 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -576, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook - Upload Test Docs -> Rename binary key - BRD (output 0, input 0)

**Outgoing Connections**

- Rename binary key - BRD -> Extract BRD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return items.map(item =\u003e {\n  if (item.binary \u0026\u0026 item.binary.data) {\n    item.binary.brd = item.binary.data0; // copy to brd\n    // do NOT delete data\n  }\n  return item;\n});\n"
}
```

### Rename binary key - FRD

| Field | Value |
| --- | --- |
| Node ID | 00312240-fd0e-416c-af8f-429708969d9a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -576, 464 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook - Upload Test Docs -> Rename binary key - FRD (output 0, input 0)

**Outgoing Connections**

- Rename binary key - FRD -> Extract FRD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return items.map(item =\u003e {\n  if (item.binary \u0026\u0026 item.binary.data) {\n    item.binary.frd = item.binary.data1; // copy to brd\n    // do NOT delete data\n  }\n  return item;\n});\n"
}
```

### Rename binary key - HLD

| Field | Value |
| --- | --- |
| Node ID | fa5e71ad-dc2a-4194-a99d-6ae5c377eae3 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -576, 656 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook - Upload Test Docs -> Rename binary key - HLD (output 0, input 0)

**Outgoing Connections**

- Rename binary key - HLD -> Extract HLD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return items.map(item =\u003e {\n  if (item.binary \u0026\u0026 item.binary.data) {\n    item.binary.hld = item.binary.data2; // copy to brd\n    // do NOT delete data\n  }\n  return item;\n});\n"
}
```

### Rename binary key - LLD

| Field | Value |
| --- | --- |
| Node ID | d86fdf3b-de8e-4c29-8268-67dedc471cfa |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -576, 848 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook - Upload Test Docs -> Rename binary key - LLD (output 0, input 0)

**Outgoing Connections**

- Rename binary key - LLD -> Extract LLD Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return items.map(item =\u003e {\n  if (item.binary \u0026\u0026 item.binary.data) {\n    item.binary.lld = item.binary.data3; // copy to brd\n    // do NOT delete data\n  }\n  return item;\n});\n"
}
```

### Rename binary key - Transcript

| Field | Value |
| --- | --- |
| Node ID | c65b20a3-7e3b-4c4a-a69f-5b5dcbbc7cea |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -576, 1040 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook - Upload Test Docs -> Rename binary key - Transcript (output 0, input 0)

**Outgoing Connections**

- Rename binary key - Transcript -> Extract Transcript Text (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return items.map(item =\u003e {\n  if (item.binary \u0026\u0026 item.binary.data) {\n    item.binary.transcript = item.binary.data4; // copy to brd\n    // do NOT delete data\n  }\n  return item;\n});\n"
}
```

### Webhook - Upload Test Docs

| Field | Value |
| --- | --- |
| Node ID | 8c9318aa-13f3-4b0e-adfe-826e5499b0f9 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | -848, 656 |
| Disabled | True |
| Always Output Data | False |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Webhook - Upload Test Docs -> Rename binary key - Transcript (output 0, input 0)
- Webhook - Upload Test Docs -> Rename binary key - LLD (output 0, input 0)
- Webhook - Upload Test Docs -> Rename binary key - HLD (output 0, input 0)
- Webhook - Upload Test Docs -> Rename binary key - FRD (output 0, input 0)
- Webhook - Upload Test Docs -> Rename binary key - BRD (output 0, input 0)

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

### Write Final Test Plan File

| Field | Value |
| --- | --- |
| Node ID | 1eccb62e-de74-4840-824a-0d1fd4a882b4 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 1792, 736 |
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

