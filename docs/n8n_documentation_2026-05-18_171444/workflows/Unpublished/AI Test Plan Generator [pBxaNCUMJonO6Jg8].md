# AI Test Plan Generator

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | pBxaNCUMJonO6Jg8 |
| Active | False |
| Archived | True |
| Created At | 2025-10-31T03:26:24.416Z |
| Updated At | 2026-04-16T10:15:57.000Z |
| Node Count | 19 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\AI Test Plan Generator [pBxaNCUMJonO6Jg8].json |

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
| n8n-nodes-base.code | 4 |
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
- Extract BRD Text -> Merge (source output 0, target input 0)
- Extract FRD Text -> Merge (source output 0, target input 1)
- Extract HLD Text -> Merge (source output 0, target input 2)
- Extract LLD Text -> Merge (source output 0, target input 3)
- Normalize Extracted Text -> Merge Normalized Docs + Normalized Transcript Text (source output 0, target input 0)
- Read Transcript File -> Normalize Transcript Text (source output 0, target input 0)
- Normalize Transcript Text -> Merge Normalized Docs + Normalized Transcript Text (source output 0, target input 1)
- OpenAI - Generate Test Plan -> Prepare Markdown Content (source output 0, target input 0)
- Prepare Markdown Content -> Convert md to docx (source output 0, target input 0)
- Convert md to docx -> Write Final Test Plan File (source output 0, target input 0)
- Merge -> Normalize Extracted Text (source output 0, target input 0)
- Merge Normalized Docs + Normalized Transcript Text -> Merged Context for OpenAI (source output 0, target input 0)
- Merged Context for OpenAI -> OpenAI - Generate Test Plan (source output 0, target input 0)

## Nodes

### Convert md to docx

| Field | Value |
| --- | --- |
| Node ID | c28fa186-fdf7-46ba-94f4-c94e4b831641 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | 2448, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Markdown Content -> Convert md to docx (output 0, input 0)

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
| Node ID | f9aaaf88-fd7b-448c-9e85-18069a0c50cd |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | 752, -160 |
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
| Node ID | 4b06d33d-26f4-486e-87dd-b3d24a63e9e6 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | 752, 32 |
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
| Node ID | 7b1be722-8692-4647-8cb1-7cc4c015b567 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | 752, 224 |
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
| Node ID | bcd74396-e52e-4641-adf5-11174d3f1644 |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | 752, 416 |
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
| Node ID | cc4abef3-9ec4-4ecd-9a47-e186aed22fb4 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 976, 96 |
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
| Node ID | feda9510-d883-4ad3-b791-4faa128d4b2f |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 1424, 304 |
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
| Node ID | 76d71a78-7f77-40ff-a7a3-2d499aca5fc3 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1648, 304 |
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
    "jsCode":  "// Merge normalized docs and transcript into one large text blob\nlet allTexts = [];\n\nfor (const item of items) {\n  const src =\n    item.json.sourceName ||\n    item.json.summary ||\n    item.json.sourceType ||\n    \"Unknown Source\";\n\n  const txt =\n    item.json.text ||\n    item.json.normalized_transcript ||\n    item.json.content ||\n    \"\";\n\n  if (txt.trim()) {\n    allTexts.push(`Source: ${src}\\n${txt}`);\n  }\n}\n\n// Return merged context safely\nreturn [\n  {\n    json: {\n      mergedContext: allTexts.join(\"\\n---\\n\"),\n      contextCount: allTexts.length,\n    },\n  },\n];\n"
}
```

### Normalize Extracted Text

| Field | Value |
| --- | --- |
| Node ID | d85c0966-9d57-461e-8260-d57992995bc8 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1200, 128 |
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
    "jsCode":  "// Normalize all extracted PDF text\nconst combined = [];\nfor (const item of items) {\n  const docs = Array.isArray(item.json) ? item.json : [item.json];\n  for (const d of docs) {\n    combined.push({\n      json: {\n        sourceName: d.fileName || d.sourceName || \u0027Unknown Document\u0027,\n        sourceType: d.fileName?.match(/BRD|FRD|LLD|HLD/)?.[0] || \u0027Document\u0027,\n        text: d.text || \u0027\u0027,\n        timestamp: new Date().toISOString()\n      }\n    });\n  }\n}\nreturn combined;"
}
```

### Normalize Transcript Text

| Field | Value |
| --- | --- |
| Node ID | 1a10037e-0f8e-47ab-b947-27fbf32e7d9a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1216, 640 |
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
    "jsCode":  "// Normalize Transcript Text\nlet combinedText = \u0027\u0027;\nfor (const item of items) {\n  let text = \u0027\u0027;\n  if (item.binary \u0026\u0026 item.binary.data) {\n    const dataBuffer = Buffer.from(item.binary.data.data || item.binary.data, \u0027base64\u0027);\n    text = dataBuffer.toString(\u0027utf8\u0027);\n  } else if (item.json \u0026\u0026 item.json.data) {\n    text = item.json.data.toString();\n  } else if (item.json \u0026\u0026 item.json.text) {\n    text = item.json.text.toString();\n  }\n  combinedText += \u0027\\n\\n\u0027 + text.trim();\n}\ncombinedText = combinedText.replace(/\\r/g, \u0027\u0027).replace(/\\n{3,}/g, \u0027\\n\\n\u0027).replace(/\\s{2,}/g, \u0027 \u0027).trim();\nreturn [{ json: { normalized_transcript: combinedText, summary: `Normalized transcript text.` } }];"
}
```

### OpenAI - Generate Test Plan

| Field | Value |
| --- | --- |
| Node ID | 2abd1d61-1f75-4cf9-b14d-b78a4c2b17cf |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | 1872, 304 |
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
| Node ID | 5f26688d-5948-4c27-9221-762000121fd6 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2224, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI - Generate Test Plan -> Prepare Markdown Content (output 0, input 0)

**Outgoing Connections**

- Prepare Markdown Content -> Convert md to docx (output 0, input 0)

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
| Node ID | 34a77b0c-46a9-40a0-b488-e60903fa72b5 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 528, -160 |
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
| Node ID | e4a00c0c-efa3-4e3e-9886-e063b29a9d81 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 528, 32 |
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
| Node ID | 506266c1-368c-4f54-9c1d-e4df7d5d016d |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 528, 224 |
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
| Node ID | d0768987-20c2-41d4-9e96-43dbd5431cc6 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 528, 416 |
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
| Node ID | 7c748383-c146-4839-99bd-af5716dc315e |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 528, 640 |
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
| Node ID | f12c79b4-484f-45f5-8622-7fb7a18844ec |
| Type | n8n-nodes-base.manualTrigger |
| Type Version | 1 |
| Position | 304, 192 |
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
| Node ID | 530d0ad9-6811-4540-a5c1-2d0c11cfc740 |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 2672, 304 |
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
