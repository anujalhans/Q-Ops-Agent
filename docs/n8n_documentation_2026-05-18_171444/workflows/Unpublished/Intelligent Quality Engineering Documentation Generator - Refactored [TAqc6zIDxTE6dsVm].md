# Intelligent Quality Engineering Documentation Generator - Refactored

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | TAqc6zIDxTE6dsVm |
| Active | False |
| Archived | False |
| Created At | 2026-03-17T07:58:58.305Z |
| Updated At | 2026-03-31T11:44:53.387Z |
| Node Count | 38 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Intelligent Quality Engineering Documentation Generator - Refactored [TAqc6zIDxTE6dsVm].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Webhook | n8n-nodes-base.webhook | POST | generate-qa-doc

Known webhook route hints:

- POST /webhook/generate-qa-doc

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.agent | 1 |
| @n8n/n8n-nodes-langchain.embeddingsOpenAi | 1 |
| @n8n/n8n-nodes-langchain.lmChatOpenAi | 1 |
| @n8n/n8n-nodes-langchain.vectorStoreChromaDB | 1 |
| n8n-nodes-base.code | 12 |
| n8n-nodes-base.httpRequest | 8 |
| n8n-nodes-base.if | 3 |
| n8n-nodes-base.jira | 2 |
| n8n-nodes-base.merge | 7 |
| n8n-nodes-base.switch | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- chromaCloudApi: ChromaDB Self-Hosted account
- httpBasicAuth: Confluence
- httpBasicAuth: JIRA
- jiraSoftwareCloudApi: Jira SW Cloud account
- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- http://127.0.0.1:5050/convert
- https://anujalhans1.atlassian.net/rest/api/3/search/jql
- https://anujalhans1.atlassian.net/wiki/rest/api/content
- https://anujalhans1.atlassian.net/wiki/rest/api/content/{{
- https://anujalhans1.atlassian.net/wiki/rest/api/content?spaceKey=TD&title={{

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- OpenAI Chat Model -> Generator Agent (source output 0, target input 0)
- Chroma Vector Store -> Generator Agent (source output 0, target input 0)
- Embeddings OpenAI -> Chroma Vector Store (source output 0, target input 0)
- Clean Markdown Formatting -> Merge (source output 0, target input 1)
- Validate AI Agent Output -> Raw Content -> Structured Content (source output 0, target input 0)
- Generator Agent -> Validate AI Agent Output (source output 0, target input 0)
- Webhook -> Merge (source output 0, target input 0)
- Webhook -> Generate Job ID (source output 0, target input 0)
- Prompt Library -> Generator Agent (source output 0, target input 0)
- Merge -> Convert md -> DOCX & Confluence Format (source output 0, target input 0)
- Convert md -> DOCX & Confluence Format -> Convert MD -> Confluence Formatted HTML (source output 0, target input 0)
- Convert MD -> Confluence Formatted HTML -> Check Existing Page (source output 0, target input 0)
- Convert MD -> Confluence Formatted HTML -> Merge1 (source output 0, target input 1)
- Raw Content -> Structured Content -> does user stories exists as Strucutured Data? (source output 0, target input 0)
- Final Structured Data -> Search existence of Epics in JIRA (source output 0, target input 0)
- Identify Epics to be created -> Add Flag True or False based on Epic exists or not (source output 0, target input 0)
- Switch -> Search Epic in JIRA (source output 0, target input 0)
- Switch -> Merge4 (source output 0, target input 0)
- Switch -> Merge3 (source output 1, target input 0)
- Switch -> Deduplicate Epics (source output 1, target input 0)
- Merge3 -> Merge All Stories (source output 0, target input 1)
- Merge4 -> Merge All Stories (source output 0, target input 0)
- Search Epic in JIRA -> Extract Epic Key (source output 0, target input 0)
- Create Epics in JIRA -> Merge3 (source output 0, target input 1)
- Search Story in JIRA -> Merge Outputs (source output 0, target input 1)
- Extract Epic Key -> Merge4 (source output 0, target input 1)
- does user stories exists as Strucutured Data? -> Final Structured Data (source output 0, target input 0)
- does user stories exists as Strucutured Data? -> Clean Markdown Formatting (source output 1, target input 0)
- Add Flag True or False based on Epic exists or not -> Switch (source output 0, target input 0)
- Merge All Stories -> Search Story in JIRA (source output 0, target input 0)
- Merge All Stories -> Merge Outputs (source output 0, target input 0)
- Merge Outputs -> Story Already Exists in JIRA? (source output 0, target input 0)
- Story Already Exists in JIRA? -> Create User Stories in JIRA1 (source output 1, target input 0)
- Check Existing Page -> Page ID (source output 0, target input 0)
- If -> Get Page Details (source output 0, target input 0)
- If -> Merge2 (source output 0, target input 0)
- If -> Upload Document on Confluence (source output 1, target input 0)
- Get Page Details -> Merge2 (source output 0, target input 1)
- Search existence of Epics in JIRA -> Identify Epics to be created (source output 0, target input 0)
- Page ID -> Merge1 (source output 0, target input 0)
- Merge1 -> If (source output 0, target input 0)
- Merge2 -> Update existing Document on Confluence (source output 0, target input 0)
- Deduplicate Epics -> Create Epics in JIRA (source output 0, target input 0)
- Generate Job ID -> Prompt Library (source output 0, target input 0)

## Nodes

### Add Flag True or False based on Epic exists or not

| Field | Value |
| --- | --- |
| Node ID | 88ff5bee-d438-411d-bb1c-9915babeb4aa |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2704, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Identify Epics to be created -> Add Flag True or False based on Epic exists or not (output 0, input 0)

**Outgoing Connections**

- Add Flag True or False based on Epic exists or not -> Switch (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "function generateId(epicName, story) {\n  const str = epicName + JSON.stringify(story.userStory);\n\n  let hash = 0;\n  for (let i = 0; i \u003c str.length; i++) {\n    const char = str.charCodeAt(i);\n    hash = ((hash \u003c\u003c 5) - hash) + char;\n    hash |= 0; // Convert to 32bit int\n  }\n\n  return \"ID_\" + Math.abs(hash);\n}\n\nconst output = [];\n\nconst existingEpics = $json.existingEpics || [];\nconst missingEpics = $json.missingEpics || [];\n\n// Helper to extract epic-level fields (excluding userStories)\nfunction extractEpicMeta(epic) {\n  const { userStories, ...epicMeta } = epic;\n  return epicMeta;\n}\n\n// âœ… Existing Epics\nexistingEpics.forEach(epic =\u003e {\n  const epicMeta = extractEpicMeta(epic);\n\n  (epic.userStories || []).forEach(story =\u003e {\n    output.push({\n      json: {\n        ...epicMeta,   // âœ… includes epicDescription, businessObjective, etc.\n        idempotencyKey: generateId(epic.epicName, story),\n        ...story,\n        epicExists: true\n      }\n    });\n  });\n});\n\n// âœ… Missing Epics\nmissingEpics.forEach(epic =\u003e {\n  const epicMeta = extractEpicMeta(epic);\n\n  (epic.userStories || []).forEach(story =\u003e {\n    output.push({\n      json: {\n        ...epicMeta,   // âœ… includes all epic-level fields\n        idempotencyKey: generateId(epic.epicName, story),\n        ...story,\n        epicExists: false\n      }\n    });\n  });\n});\n\nreturn output;"
}
```

### Check Existing Page

| Field | Value |
| --- | --- |
| Node ID | c9be0010-a066-43d9-a382-274861fa9aa7 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2896, -432 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert MD -> Confluence Formatted HTML -> Check Existing Page (output 0, input 0)

**Outgoing Connections**

- Check Existing Page -> Page ID (output 0, input 0)

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "kNwO3XevolPxpmlK",
                          "name":  "Confluence"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "=https://anujalhans1.atlassian.net/wiki/rest/api/content?spaceKey=TD\u0026title={{ encodeURIComponent(\n  $json.body.documentType\n    .replace(/_/g, \u0027 \u0027)\n    .replace(/\\b\\w/g, c =\u003e c.toUpperCase()) \n  + \" - \" + \n  $json.body.projectName\n)}}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "options":  {

                }
}
```

### Chroma Vector Store

| Field | Value |
| --- | --- |
| Node ID | b8731a91-8830-449d-9e6d-11e2e98d8538 |
| Type | @n8n/n8n-nodes-langchain.vectorStoreChromaDB |
| Type Version | 1.3 |
| Position | 896, 176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Embeddings OpenAI -> Chroma Vector Store (output 0, input 0)

**Outgoing Connections**

- Chroma Vector Store -> Generator Agent (output 0, input 0)

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
    "mode":  "retrieve-as-tool",
    "toolDescription":  "Retrieves relevant data for document generation",
    "authentication":  "chromaCloudApi",
    "chromaCollection":  {
                             "__rl":  true,
                             "value":  "NQLB-Demo-DB",
                             "mode":  "list",
                             "cachedResultName":  "NQLB-Demo-DB"
                         },
    "topK":  30,
    "options":  {
                    "metadata":  {
                                     "metadataValues":  [
                                                            {
                                                                "name":  "projectName",
                                                                "value":  "={{ $(\u0027Prompt Library\u0027).item.json.projectName }}"
                                                            }
                                                        ]
                                 }
                }
}
```

### Clean Markdown Formatting

| Field | Value |
| --- | --- |
| Node ID | 65342d00-00f0-4b89-a4bb-2a2e8bb6e323 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2032, -32 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- does user stories exists as Strucutured Data? -> Clean Markdown Formatting (output 1, input 0)

**Outgoing Connections**

- Clean Markdown Formatting -> Merge (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "let markdown = $json.rawMarkdown;\n\n// Remove ```markdown wrappers if present\nmarkdown = markdown.replace(/```markdown/g, \u0027\u0027);\nmarkdown = markdown.replace(/```/g, \u0027\u0027);\n\nreturn [{ json: { cleanedMarkdown: markdown } }];\n"
}
```

### Convert MD -> Confluence Formatted HTML

| Field | Value |
| --- | --- |
| Node ID | d8c7f459-0d91-402d-8efc-5643523b1b4a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2704, -208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert md -> DOCX & Confluence Format -> Convert MD -> Confluence Formatted HTML (output 0, input 0)

**Outgoing Connections**

- Convert MD -> Confluence Formatted HTML -> Check Existing Page (output 0, input 0)
- Convert MD -> Confluence Formatted HTML -> Merge1 (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "let md = $json.cleanedMarkdown;\n\n// Remove separators\nmd = md.replace(/^[-_]{3,}$/gm, \u0027\u0027);\n\n// Convert headers with tight spacing\nmd = md\n  .replace(/^### (.*$)/gim, \u0027\u003ch3\u003e$1\u003c/h3\u003e\u003cbr/\u003e\u0027)\n  .replace(/^## (.*$)/gim, \u0027\u003ch2\u003e$1\u003c/h2\u003e\u003cbr/\u003e\u0027)\n  .replace(/^# (.*$)/gim, \u0027\u003ch1\u003e$1\u003c/h1\u003e\u003cbr/\u003e\u0027);\n\n// Convert bold/italic\nmd = md\n  .replace(/\\*\\*(.*?)\\*\\*/gim, \u0027\u003cstrong\u003e$1\u003c/strong\u003e\u0027)\n  .replace(/\\*(.*?)\\*/gim, \u0027\u003cem\u003e$1\u003c/em\u003e\u0027);\n\n// Convert tables (basic)\nmd = md.replace(\n  /\\|(.+)\\|\\n\\|[-\\s|]+\\|\\n((\\|.*\\|\\n?)*)/g,\n  (match) =\u003e {\n    const rows = match.trim().split(\u0027\\n\u0027);\n    const headers = rows[0].split(\u0027|\u0027).filter(Boolean);\n    const bodyRows = rows.slice(2);\n\n    let table = \u0027\u003ctable\u003e\u003ctbody\u003e\u003ctr\u003e\u0027;\n    headers.forEach(h =\u003e table += `\u003cth\u003e${h.trim()}\u003c/th\u003e`);\n    table += \u0027\u003c/tr\u003e\u0027;\n\n    bodyRows.forEach(row =\u003e {\n      const cols = row.split(\u0027|\u0027).filter(Boolean);\n      table += \u0027\u003ctr\u003e\u0027;\n      cols.forEach(c =\u003e table += `\u003ctd\u003e${c.trim()}\u003c/td\u003e`);\n      table += \u0027\u003c/tr\u003e\u0027;\n    });\n\n    table += \u0027\u003c/tbody\u003e\u003c/table\u003e\u0027;\n    return table;\n  }\n);\n\n// Line breaks\nmd = md.replace(/\\n/g, \u0027\u003cbr/\u003e\u0027);\nmd = md.replace(/(\u003cbr\\/\u003e\\s*){2,}/g, \u0027\u003cbr/\u003e\u0027);\n\nreturn [{\n  json: {\n    ...$json,\n    html: md\n  }\n}];"
}
```

### Convert md -> DOCX & Confluence Format

| Field | Value |
| --- | --- |
| Node ID | 14444c9a-4955-48ed-9a4d-a2b21d754481 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | 2448, -208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge -> Convert md -> DOCX & Confluence Format (output 0, input 0)

**Outgoing Connections**

- Convert md -> DOCX & Confluence Format -> Convert MD -> Confluence Formatted HTML (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "http://127.0.0.1:5050/convert",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "markdown",
                                                  "value":  "={{ $json.cleanedMarkdown }}"
                                              },
                                              {
                                                  "name":  "documentType",
                                                  "value":  "={{ $json.body.documentType }}"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### Create Epics in JIRA

| Field | Value |
| --- | --- |
| Node ID | 4bda4175-7e1e-46db-a34d-c68fa96ab2b5 |
| Type | n8n-nodes-base.jira |
| Type Version | 1 |
| Position | 3392, 608 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Deduplicate Epics -> Create Epics in JIRA (output 0, input 0)

**Outgoing Connections**

- Create Epics in JIRA -> Merge3 (output 0, input 1)

**Credential References**

```json
{
    "jiraSoftwareCloudApi":  {
                                 "id":  "F5nyQnchcdE8LxV1",
                                 "name":  "Jira SW Cloud account"
                             }
}
```

**Full Parameter Snapshot**

```json
{
    "project":  {
                    "__rl":  true,
                    "value":  "10001",
                    "mode":  "list",
                    "cachedResultName":  "Augmenting AI in STLC"
                },
    "issueType":  {
                      "__rl":  true,
                      "value":  "10002",
                      "mode":  "list",
                      "cachedResultName":  "Epic"
                  },
    "summary":  "={{ $json.epicName }}",
    "additionalFields":  {
                             "description":  "={{ \n\"**ðŸ“– Epic Description**\\n\" + $json.epicDescription +\n\n\"\\n\\n---\\n\\n**ðŸŽ¯ Business Objective**\\n\" + $json.businessObjective +\n\n\"\\n\\n**ðŸ“ˆ Success Metrics**\\n\" + \n$json.successMetrics\n  .replace(/\\sand\\s/g, \u0027, \u0027)     // normalize \"and\" â†’ comma\n  .split(\u0027,\u0027)                   // split by comma\n  .map(i =\u003e i.trim())\n  .filter(i =\u003e i !== \"\")\n  .map(i =\u003e \"- [ ] \" + i)\n  .join(\u0027\\n\u0027) +\n\n\"\\n\\n**ðŸ”— Source Reference**\\n\" + $json.sourceTraceability\n}}"
                         }
}
```

### Create User Stories in JIRA1

| Field | Value |
| --- | --- |
| Node ID | 8a1d5f71-fb7c-4060-8403-d0df90a30c6c |
| Type | n8n-nodes-base.jira |
| Type Version | 1 |
| Position | 5312, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | False |
| Continue On Fail |  |

**Incoming Connections**

- Story Already Exists in JIRA? -> Create User Stories in JIRA1 (output 1, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
{
    "jiraSoftwareCloudApi":  {
                                 "id":  "F5nyQnchcdE8LxV1",
                                 "name":  "Jira SW Cloud account"
                             }
}
```

**Full Parameter Snapshot**

```json
{
    "project":  {
                    "__rl":  true,
                    "value":  "10001",
                    "mode":  "list",
                    "cachedResultName":  "Augmenting AI in STLC"
                },
    "issueType":  {
                      "__rl":  true,
                      "value":  "10006",
                      "mode":  "list",
                      "cachedResultName":  "Story"
                  },
    "summary":  "={{ $json.feature }}",
    "additionalFields":  {
                             "description":  "={{ \n\"**User Story**\\n\" + $json.userStory +\n\n\"\\n\\n---\\n\\n**ðŸ“Œ Business Context**\\n\" + $json.businessContext +\n\n\"\\n\\n**ðŸ”„ Primary Flow**\\n\" + $json.primaryFlow +\n\n\"\\n\\n**ðŸ” Alternate Flows**\\n\" + $json.alternateFlows +\n\n\"\\n\\n**âš ï¸ Exception Handling**\\n\" + $json.exceptionHandling +\n\n\"\\n\\n**âœ… Acceptance Criteria**\\n\" + \n$json.acceptanceCriteria.split(\u0027\\n\u0027).map(i =\u003e \"- [ ] \" + i.replace(/^[-â€¢]\\s*/, \u0027\u0027)).join(\u0027\\n\u0027) +\n\n\"\\n\\n**ðŸŽ¨ UI/UX Requirements**\\n\" + $json.uiUxRequirements +\n\n\"\\n\\n**ðŸ§ª Test Scenarios**\\n\" + $json.testScenarios +\n\n\"\\n\\n**ðŸ“¦ Dependencies**\\n\" + $json.dependencies +\n\n\"\\n\\n**âš™ï¸ Assumptions**\\n\" + $json.assumptions +\n\n\"\\n\\n**ðŸ“Š Performance NFRs**\\n\" + $json.performanceNFRs +\n\n\"\\n\\n**ðŸ”— Traceability**\\n\" + $json.sourceTraceability +\n\n\"\\n\\n**ðŸ¤– Automation Feasibility**\\n\" + $json.automationFeasibility\n}}",
                             "labels":  "={{ [$json.idempotencyKey] }}"
                         }
}
```

### Deduplicate Epics

| Field | Value |
| --- | --- |
| Node ID | 8611b23e-973d-496c-ae90-bc4574e2c39d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3136, 608 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch -> Deduplicate Epics (output 1, input 0)

**Outgoing Connections**

- Deduplicate Epics -> Create Epics in JIRA (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\n\nconst uniqueEpicsMap = {};\n\nitems.forEach(item =\u003e {\n  const epic = item.json;\n\n  // Only process if epic does NOT exist in JIRA\n  if (!epic.epicExists) {\n    const key = epic.epicName;\n\n    if (!uniqueEpicsMap[key]) {\n      uniqueEpicsMap[key] = {\n        json: {\n          epicName: epic.epicName,\n          epicDescription: epic.epicDescription,\n          businessObjective: epic.businessObjective,\n          successMetrics: epic.successMetrics,\n          sourceTraceability: epic.sourceTraceability,\n          epicId: epic.epicId\n        }\n      };\n    }\n  }\n});\n\nreturn Object.values(uniqueEpicsMap);"
}
```

### does user stories exists as Strucutured Data?

| Field | Value |
| --- | --- |
| Node ID | 44a15134-0370-4895-a4c0-e46270ad3482 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1680, -48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Raw Content -> Structured Content -> does user stories exists as Strucutured Data? (output 0, input 0)

**Outgoing Connections**

- does user stories exists as Strucutured Data? -> Final Structured Data (output 0, input 0)
- does user stories exists as Strucutured Data? -> Clean Markdown Formatting (output 1, input 0)

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
                                              "id":  "d4ffe371-40fa-4862-8f46-438348afe649",
                                              "leftValue":  "={{ $json.structuredData }}",
                                              "rightValue":  "null",
                                              "operator":  {
                                                               "type":  "object",
                                                               "operation":  "notEmpty",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | 45864c50-0a82-4ada-9f75-5b8cdef6cb03 |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | 800, 352 |
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

### Extract Epic Key

| Field | Value |
| --- | --- |
| Node ID | 15535e5b-d516-4676-852d-a8776036862c |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3408, 64 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search Epic in JIRA -> Extract Epic Key (output 0, input 0)

**Outgoing Connections**

- Extract Epic Key -> Merge4 (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map(item =\u003e {\n  const issue = item.json.issues?.[0];\n\n  return {\n    json: {\n      id: issue?.id || null,\n      key: issue?.key || null,\n      self: issue?.self || null\n      \n    }\n  };\n});"
}
```

### Final Structured Data

| Field | Value |
| --- | --- |
| Node ID | 275a79bb-e4c7-47a3-81a2-40b5d1c3f0d0 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2032, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- does user stories exists as Strucutured Data? -> Final Structured Data (output 0, input 0)

**Outgoing Connections**

- Final Structured Data -> Search existence of Epics in JIRA (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const data = $json.structuredData ?? {};\n\nconst userStories = Array.isArray(data.userStories)\n  ? data.userStories\n  : [];\n\nconst filteredStories = userStories.filter(\n  item =\u003e typeof item === \u0027object\u0027 \u0026\u0026 item !== null\n);\n\nreturn [\n  {\n    json: {\n      structuredData: {\n        ...data,\n        userStories: filteredStories\n      }\n    }\n  }\n];"
}
```

### Generate Job ID

| Field | Value |
| --- | --- |
| Node ID | dd739c8c-7412-447c-8394-00935b628013 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 144, -48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Generate Job ID (output 0, input 0)

**Outgoing Connections**

- Generate Job ID -> Prompt Library (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{\n  json: {\n    jobId: \"JOB_\" + Date.now(),\n    input: $json.body\n  }\n}];"
}
```

### Generator Agent

| Field | Value |
| --- | --- |
| Node ID | 64dfa039-3b89-4b0a-bbd1-6dbf0fb1fe80 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3.1 |
| Position | 688, -48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI Chat Model -> Generator Agent (output 0, input 0)
- Chroma Vector Store -> Generator Agent (output 0, input 0)
- Prompt Library -> Generator Agent (output 0, input 0)

**Outgoing Connections**

- Generator Agent -> Validate AI Agent Output (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "promptType":  "define",
    "text":  "={{ $json.user }}",
    "options":  {
                    "systemMessage":  "={{ $json.system }}\n\nDocument Title: {{ $json.title }}\nGenerated On: {{ $now }}\nDocument Type: {{ $json.documentType }}"
                }
}
```

### Get Page Details

| Field | Value |
| --- | --- |
| Node ID | e8b08bd7-dd27-4219-8146-21c4cd44ece5 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 4208, -432 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- If -> Get Page Details (output 0, input 0)

**Outgoing Connections**

- Get Page Details -> Merge2 (output 0, input 1)

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "kNwO3XevolPxpmlK",
                          "name":  "Confluence"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "=https://anujalhans1.atlassian.net/wiki/rest/api/content/{{ $json.pageId }}?expand=version",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "options":  {

                }
}
```

### Identify Epics to be created

| Field | Value |
| --- | --- |
| Node ID | 35fa4514-6dd2-4c6a-ab4e-3ca465fb2b4e |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2496, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search existence of Epics in JIRA -> Identify Epics to be created (output 0, input 0)

**Outgoing Connections**

- Identify Epics to be created -> Add Flag True or False based on Epic exists or not (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Input 1: Original structured data\nconst structuredData = $items(\"Final Structured Data\")[0].json.structuredData;\nconst inputEpics = structuredData.epics;\nconst userStories = structuredData.userStories;\n\n// Build epicId â†’ userStories map\nconst epicStoryMap = {};\nuserStories.forEach(story =\u003e {\n  if (!epicStoryMap[story.epicId]) {\n    epicStoryMap[story.epicId] = [];\n  }\n  epicStoryMap[story.epicId].push(story);\n});\n\n// Input 2: JIRA search results\nconst jiraIssues = $input.all().flatMap(item =\u003e item.json.issues || []);\n\n// Build map of existing epics (by summary)\nconst existingMap = {};\njiraIssues.forEach(issue =\u003e {\n  const summary = issue.fields.summary;\n  existingMap[summary] = {\n    epicKey: issue.key,\n    epicID: issue.id\n  };\n});\n\n// Separate lists\nconst existingEpics = [];\nconst missingEpics = [];\n\ninputEpics.forEach(epic =\u003e {\n  const epicName = epic.epicName;\n\n  const baseEpicData = {\n    ...epic, // âœ… THIS preserves ALL epic fields\n    userStories: epicStoryMap[epic.epicId] || []\n  };\n\n  if (existingMap[epicName]) {\n    existingEpics.push({\n      ...baseEpicData,\n      epicKey: existingMap[epicName].epicKey,\n      epicID: existingMap[epicName].epicID\n    });\n  } else {\n    missingEpics.push(baseEpicData);\n  }\n});\n\nreturn [\n  {\n    json: {\n      existingEpics,\n      missingEpics\n    }\n  }\n];"
}
```

### If

| Field | Value |
| --- | --- |
| Node ID | 62f1ada3-28ad-4e27-97ff-beb1f6db4591 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 3632, -416 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge1 -> If (output 0, input 0)

**Outgoing Connections**

- If -> Get Page Details (output 0, input 0)
- If -> Merge2 (output 0, input 0)
- If -> Upload Document on Confluence (output 1, input 0)

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
                                       "typeValidation":  "loose",
                                       "version":  3
                                   },
                       "conditions":  [
                                          {
                                              "id":  "8b2fddfd-e3a9-4aea-ab81-2ac93e3abed4",
                                              "leftValue":  "={{ $json.pageExists }}",
                                              "rightValue":  0,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "looseTypeValidation":  true,
    "options":  {

                }
}
```

### Merge

| Field | Value |
| --- | --- |
| Node ID | 2d452145-4cb0-4d83-9151-56972953ca06 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 2224, -208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Clean Markdown Formatting -> Merge (output 0, input 1)
- Webhook -> Merge (output 0, input 0)

**Outgoing Connections**

- Merge -> Convert md -> DOCX & Confluence Format (output 0, input 0)

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

### Merge All Stories

| Field | Value |
| --- | --- |
| Node ID | c9e251bf-6580-423f-a709-36da91e9ac87 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 4080, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge3 -> Merge All Stories (output 0, input 1)
- Merge4 -> Merge All Stories (output 0, input 0)

**Outgoing Connections**

- Merge All Stories -> Search Story in JIRA (output 0, input 0)
- Merge All Stories -> Merge Outputs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Merge Outputs

| Field | Value |
| --- | --- |
| Node ID | 34840e6b-29f8-41d5-87c9-489e7a8acc14 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 4624, 320 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search Story in JIRA -> Merge Outputs (output 0, input 1)
- Merge All Stories -> Merge Outputs (output 0, input 0)

**Outgoing Connections**

- Merge Outputs -> Story Already Exists in JIRA? (output 0, input 0)

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

### Merge1

| Field | Value |
| --- | --- |
| Node ID | 91183c83-8930-43da-80fb-60ef88732601 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 3360, -416 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert MD -> Confluence Formatted HTML -> Merge1 (output 0, input 1)
- Page ID -> Merge1 (output 0, input 0)

**Outgoing Connections**

- Merge1 -> If (output 0, input 0)

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

### Merge2

| Field | Value |
| --- | --- |
| Node ID | c6c29183-e9c3-4f94-99f6-9dd5d866ef90 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 4416, -640 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- If -> Merge2 (output 0, input 0)
- Get Page Details -> Merge2 (output 0, input 1)

**Outgoing Connections**

- Merge2 -> Update existing Document on Confluence (output 0, input 0)

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

### Merge3

| Field | Value |
| --- | --- |
| Node ID | 77fac21b-ab15-47d4-a14f-1184ebca4a34 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 3744, 592 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch -> Merge3 (output 1, input 0)
- Create Epics in JIRA -> Merge3 (output 0, input 1)

**Outgoing Connections**

- Merge3 -> Merge All Stories (output 0, input 1)

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

### Merge4

| Field | Value |
| --- | --- |
| Node ID | 08094500-5e59-46ab-afc7-294fd51fc36d |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 3728, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch -> Merge4 (output 0, input 0)
- Extract Epic Key -> Merge4 (output 0, input 1)

**Outgoing Connections**

- Merge4 -> Merge All Stories (output 0, input 0)

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

### OpenAI Chat Model

| Field | Value |
| --- | --- |
| Node ID | 013cc5d1-dc8e-405d-946c-08747a327f09 |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.3 |
| Position | 544, 176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OpenAI Chat Model -> Generator Agent (output 0, input 0)

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
                  "value":  "gpt-4.1-mini",
                  "mode":  "list",
                  "cachedResultName":  "gpt-4.1-mini"
              },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  8000
                }
}
```

### Page ID

| Field | Value |
| --- | --- |
| Node ID | 74f05574-9164-455f-bc30-8104ba8dc673 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3104, -432 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Check Existing Page -> Page ID (output 0, input 0)

**Outgoing Connections**

- Page ID -> Merge1 (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const pages = $json.results || [];\n\nreturn [{\n  json: {\n    ...$json,\n    pageId: pages.length \u003e 0 ? pages[0].id : null,\n    pageExists: pages.length \u003e 0,\n    totalFound: pages.length\n  }\n}];"
}
```

### Prompt Library

| Field | Value |
| --- | --- |
| Node ID | d9633cd8-4294-456c-ac09-149b8db67d4f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 432, -48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Generate Job ID -> Prompt Library (output 0, input 0)

**Outgoing Connections**

- Prompt Library -> Generator Agent (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const type = $json.body.documentType;\nconst projectName = $json.body.projectName;\nconst productOwner = $json.body.productOwner;\n\nconst promptLibrary = {\n  test_strategy: {\n    title: \"Enterprise Test Strategy\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Strategy\nGenerated On: {{ $now }}\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Manager and Enterprise Test Strategy Consultant with more than 15 years of experience defining testing standards, quality governance frameworks, and automation-first transformation programs. \n\nYou specialize in:\n- Shift-Left \u0026 Shift-Right quality engineering approaches\n- CI/CD-integrated automated testing pipelines\n- Scalable test architecture across UI, API, performance, and security layers\n- Risk-based and metrics-driven software delivery governance\n\nYou excel at interpreting and synthesizing:\n- Business Requirement Documents (BRD)\n- Functional Requirement Documents (FRD)\n- Low-Level and High-Level Designs (LLD \u0026 HLD)\n- Grooming transcripts and stakeholder discussions\n\nYour outputs must demonstrate:\n- Strategic reasoning supported by traceable statements from the provided context\n- A strong linkage between **business intent â†’ architecture/design implications â†’ test strategy â†’ automation enablement â†’ risk mitigation**\n- A structured, enterprise-grade quality strategy suitable for CXO/leadership consumption\n- Deep elaboration, beyond basic bullet points, showing practical execution methodologies, governance layers, and measurable KPIs\n\nYour writing style should reflect:\n- Professional tone suitable for board-level review\n- Detailed, actionable, and solution-oriented content with clear justification\n- Balanced technical and managerial viewpoint\n`,\n    user: `You are provided with a vector store that combines information from BRD, FRD, HLD, LLD, UI/UX specifications, and grooming session transcripts. \nThis content includes requirements, workflows, data flows, system architecture, constraints, dependencies, and stakeholder expectations.\n\nYour task is to analyze and generate a **comprehensive and production-grade Test Strategy document**, aligned with **Shift-Left**, **Automation-First**, and **Quality Engineering** principles.\n\n=========================\nINSTRUCTIONS (MUST FOLLOW)\n=========================\n\n1. Use direct excerpts or paraphrased statements from the source materials where relevant.\n   - Quote key statements in italics or blockquotes to maintain authenticity.\n   - Cite origin using â€œAs mentioned in BRDâ€¦â€, â€œAccording to HLDâ€¦â€, etc.\n2. Provide deep explanation instead of generic bullet lists â€” elaborate how and why decisions are made.\n3. Demonstrate end-to-end traceability between:\n   **business requirements â†’ test strategy â†’ automation enablement â†’ quality metrics â†’ risk \u0026 mitigation**\n4. Include frameworks, methodology, and governance recommendations.\n5. Use tables, matrices, and hierarchical bullet structures where beneficial.\n6. Minimum expected length per major section: **900 â€“ 1500 words**.\n7. The output must be detailed enough to be presented to engineering leadership and auditors.\n\n====================\nDOCUMENT STRUCTURE\n====================\n\n### Test Strategy Document Structure\n\n1. **Introduction \u0026 Context**\n   - Problem statement \u0026 business need\n   - Strategic objectives of testing\n   - Alignment with enterprise quality vision and success criteria\n\n2. **Testing Scope**\n   - In-scope functional \u0026 non-functional areas (with references)\n   - Out-of-scope items \u0026 rationale\n\n3. **Strategic Testing Approach**\n   - Shift-Left adoption strategy\n   - Shift-Right validation strategy (where applicable)\n   - Testing model (Agile / DevOps / CI-CD-based)\n   - Test levels: Unit, Component, API, UI, E2E, UAT, NFR\n   - Governance and quality gates\n\n4. **Automation Strategy \u0026 Roadmap**\n   - Automation pyramid model alignment\n   - Tools, frameworks, CI/CD orchestration\n   - Prioritization matrix \u0026 ROI considerations\n   - In-sprint automation approach\n   - Resilience \u0026 maintainability standards\n\n5. **Test Environment \u0026 Infrastructure Strategy**\n   - Environment model \u0026 provisioning\n   - Service virtualization \u0026 mocks\n   - Data refresh, versioning \u0026 cloning strategies\n\n6. **Test Data Management Strategy**\n   - Data sourcing (synthetic, masked, production-like)\n   - Boundary / negative / chaos data\n   - Automation-driven data pipeline\n\n7. **Quality Metrics \u0026 Reporting Framework**\n   - KPIs, KRAs, SLAs (Defect density, leakage rate, DRE %, automation coverage etc.)\n   - Dashboards \u0026 transparency mechanisms\n\n8. **Risk-Based Testing \u0026 Mitigation Strategy**\n   - Identified risks + corresponding mitigation \u0026 contingency mapping\n   - Priority-based testing means: risk Ã— impact Ã— likelihood scoring\n\n9. **Roles, Collaboration \u0026 RACI Model**\n\n10. **Compliance, Security \u0026 Regulatory Considerations**\n    - OWASP, data privacy, audit logs, adherence requirements\n\n11. **Tooling \u0026 Integration Landscape**\n    - CI/CD, test frameworks, monitoring \u0026 observability\n\n12. **Communication \u0026 Governance Model**\n\n13. **Appendix / Traceability Matrix**\n    | Source Document | Key Insight | Test Strategy Implication | Automation Feasibility |\n`\n  },\n  test_plan: {\n    title: \"Enterprise Test Plan\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Plan\nGenerated On: {{ $now }}\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Manager with over 15 years of experience leading large-scale enterprise testing programs. \nYou specialize in Shift-Left Quality and Automation-First approaches, integrating QA deeply within CI/CD pipelines.\nYou have extensive experience in transforming raw business and technical documentation into actionable, data-driven, and traceable test strategies.\n\nYou are skilled at reading and interpreting:\n- Business Requirement Documents (BRD)\n- Functional Requirement Documents (FRD)\n- Low-Level Designs (LLD)\n- High-Level Designs (HLD)\n- Grooming session transcripts and stakeholder discussions\n\nYour outputs must demonstrate:\n- Analytical reasoning based directly on excerpts or statements from the provided context.\n- A clear connection between **requirement intent**, **test coverage**, **automation feasibility**, and **risk mitigation \u0026 risk contingency**.\n- A focus on measurable, proactive quality metrics, and early defect prevention.\n- Realistic and context-aware alignment with Shift-Left and Automation-First principles.\n`,\n    user: `You are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI specs, and stakeholder discussions via vector search.. It may include requirements, features, workflows, functional and non-functional details, and stakeholder discussions.\n\nYour task is to analyze the provided context carefully and generate a **comprehensive, professional, and context-grounded Test Plan** aligned with Shift-Left and Automation-First principles.\n\n### Instructions:\n1. Use **direct excerpts or paraphrased statements** from the provided context sources wherever applicable. \n   - Quote important phrases in italics or blockquotes to preserve authenticity.\n   - Reference their origin (e.g., â€œAs mentioned in BRDâ€¦â€ or â€œAccording to LLD sectionâ€¦â€).\n2. Demonstrate clear traceability between **requirements â†’ testing objectives â†’ automation approach â†’ risk mitigation \u0026 risk contingency.**\n3. For every key area (test strategy, scope, risks, etc.), link back to **specific project elements or statements** from the input documents.\n4. Use tables or bullet lists where appropriate to make the Test plan readable and well-structured.\n5. Generate detailed, structured, and exhaustive content. Expand on reasoning and provide elaborated explanations rather than short bullet points. Do not compress meaning.\n6. Minimum output length: 700â€“1200 words per section (unless insufficient context exists).\n7. For every claim or statement, reference the originating document (BRD, FRD, HLD, LLD, Transcript).\n\n### Structure the Test Plan as follows:\n1. **Test Strategy** â€“ Include how Shift-Left and Automation-First are embedded. Reference early testing opportunities from the design or grooming stages.\n2. **Scope** â€“ Distinguish in-scope vs. out-of-scope features, based on specific content from the documents.\n3. **Test Objectives** â€“ Mention objectives tied to functional or non-functional requirements.\n4. **Test Deliverables**\n5. **Entry and Exit Criteria**\n6. **Test Schedule and Milestones**\n7. **Risks, Mitigation \u0026 Contingency Plan** â€“ Mention risks cited in the documents or inferred from complexity areas. Also map each risk with Mitigation \u0026 Contigency Plan.\n8. **Test Environment** â€“ Include CI/CD, environment provisioning, and test data setup strategies.\n9. **Tools and Resources** â€“ Reference relevant automation or workflow tools mentioned or implied in the docs.\n10. **Roles and Responsibilities**\n11. **Test Data and Configurations** â€“ Include synthetic data strategy or test coverage automation if applicable.\n12. **Reporting and Communication Plan** â€“ Mention dashboards, metrics, and traceability matrices.\n13. **Suspension \u0026 Resumption Criteria**\n14. **Assumptions \u0026 Dependencies**\n15. **Automation Coverage Matrix**\n16. **Test Coverage Metrics**\n17, **Approval \u0026 Sign-off**\n18. **Appendix (Optional)** â€“ Include a summarized mapping table:\n    | Source Document | Key Excerpt | Related Test Focus Area | Automation Feasibility |\n\nEnsure:\n- The output reads like a **real Test Plan prepared for stakeholders**, not an academic essay.\n- Each section has **specific references** to document content to establish credibility and traceability.\n- The tone is professional, precise, and easy to publish directly as part of QA governance documentation.`\n  },\n  test_cases: {\n    title: \"Enterprise Test Cases\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Cases\nGenerated On: {{ $now }}\nModel: gpt-4o-mini\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Architect with 15+ years of experience designing enterprise-scale, risk-driven, automation-ready test cases.\n\nYou specialize in:\n- Requirement decomposition into test scenarios\n- Boundary \u0026 edge case design\n- Negative testing \u0026 failure modeling\n- API/UI/integration-level validations\n- Automation feasibility optimization\n\nYour outputs must:\n- Demonstrate traceability to retrieved requirements\n- Cover positive, negative, edge, alternate and exception flows\n- Align with automation-first strategy\n- Be production-ready for Jira/TestRail/Xray\n- Include risk tagging and priority classification\n\nAvoid generic test cases. Every case must be context-driven and realistic.\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI specs, and stakeholder discussions via vector search.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Identify distinct functional modules and workflows from the retrieved context.\n2. For each workflow, generate:\n   - Functional test cases\n   - Negative test cases\n   - Boundary value cases\n   - Integration scenarios\n   - Data validation scenarios\n   - Exception handling cases\n3. Each test case must include:\n\n| Test Case ID | Requirement Reference | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Priority | Risk Level | Automation Feasibility |\n\n4. Explicitly reference requirement origin:\n   - â€œAs described in BRD sectionâ€¦â€\n   - â€œAccording to HLD componentâ€¦â€\n5. Tag automation suitability (High / Medium / Low).\n6. Do not summarize â€” generate exhaustive coverage.\n\n========================\nCOVERAGE REQUIREMENTS\n========================\n\n- Minimum 20â€“40 test cases per major feature\n- Include API-level validations if architecture suggests services\n- Include data validation rules if UI forms are mentioned\n- Include failure simulation if integrations exist\n- Include security and performance-related validations if applicable\n\nOutput must be enterprise-grade and execution-ready.\n`\n  },\n  user_stories: {\n  title: \"Agile User Stories\",\n  system: `You are a Senior Product Owner and Business Analyst with 15+ years of experience defining enterprise-scale product requirements using Agile and Scrum frameworks.\n\nYou specialize in translating BRD, FRD, HLD, LLD, and stakeholder discussions into detailed INVEST-compliant Agile User Stories, Acceptance Criteria, Alternate Flows, and Test Scenarios.\n\nRules \u0026 Expectations:\n- Produce a **single structured output** in strict JSON format.\n- Follow a **hierarchical Agile model: Epic â†’ Multiple User Stories**.\n- Each Epic represents a high-level feature.\n- Each Epic MUST contain:\n  - epicId\n  - epicName\n  - epicDescription\n  - businessObjective\n  - successMetrics\n  - sourceTraceability\n\n- Each User Story must contain:\n  - userStoryId\n  - epicId\n  - feature\n  - userStory\n  - userStoryDescription\n  - businessContext\n  - primaryFlow\n  - alternateFlows\n  - exceptionHandling\n  - acceptanceCriteria\n  - uiUxRequirements\n  - fieldValidationRules\n  - dataIntegrationRequirements\n  - performanceNFRs\n  - testScenarios\n  - dependencies\n  - assumptions\n  - sourceTraceability\n  - automationFeasibility\n\n- Use markdown inside JSON string fields where needed.\n- Separate each story with the delimiter: --- USER_STORY_BREAK ---.\n- Ensure the JSON is **well-formed and parsable**.\n\nIMPORTANT:\n- DO NOT restrict to one story per feature.\n- Decompose features into **multiple small, testable, independent stories** wherever needed.\n- Prefer decomposition over large stories.\n\nYour task:\n1. Analyze the provided context from BRD, FRD, HLD, LLD, workflows, and transcripts.\n2. Extract **high-level features and convert them into Epics**.\n3. For each Epic:\n   - Generate a detailed **epicDescription** explaining scope, workflows, and business value.\n4. Dynamically create **one or more user stories per epic** based on complexity.\n5. Ensure **traceability** to source documents.\n6. Make output reusable across projects.`,\n  \n  user: `You are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI/UX specifications, and stakeholder discussions via vector search.\n\nYour task is to generate a single JSON object with the following structure:\n\n{\n  \"epics\": [\n    {\n      \"epicId\": \"EPIC-001\",\n      \"epicName\": \"Feature Name\",\n      \"epicDescription\": \"...\",\n      \"businessObjective\": \"...\",\n      \"successMetrics\": \"...\",\n      \"sourceTraceability\": \"...\"\n    }\n  ],\n  \"userStories\": [\n    {\n      \"userStoryId\": \"US-001\",\n      \"epicId\": \"EPIC-001\",\n      \"feature\": \"Feature Name\",\n      \"userStory\": \"...\",\n      \"userStoryDescription\": \"...\",\n      \"businessContext\": \"...\",\n      \"primaryFlow\": \"...\",\n      \"alternateFlows\": \"...\",\n      \"exceptionHandling\": \"...\",\n      \"acceptanceCriteria\": \"...\",\n      \"uiUxRequirements\": \"...\",\n      \"fieldValidationRules\": \"...\",\n      \"dataIntegrationRequirements\": \"...\",\n      \"performanceNFRs\": \"...\",\n      \"testScenarios\": \"...\",\n      \"dependencies\": \"...\",\n      \"assumptions\": \"...\",\n      \"sourceTraceability\": \"...\",\n      \"automationFeasibility\": \"...\"\n    }\n  ]\n}\n\n========================\nCRITICAL REQUIREMENTS\n========================\n\n1. EPIC GENERATION:\n- Convert each high-level feature into a structured Epic.\n- Provide a **detailed epicDescription** covering:\n  - Functional scope\n  - Key workflows\n  - Business value\n\n2. DYNAMIC STORY GENERATION (MANDATORY):\n- DO NOT generate only one story per epic.\n- Automatically decide number of user stories based on:\n  - Functional decomposition\n  - UI vs API separation\n  - Validation complexity\n  - Integration points\n  - Alternate \u0026 exception flows\n- Create MULTIPLE user stories for complex features.\n- Keep each story small, testable, and independently deliverable (INVEST).\n\n3. USER STORY DEPTH:\n- Each story must include **userStoryDescription** (detailed explanation).\n- Each story should be **800â€“1200 words**.\n- Include realistic:\n  - UI/UX behavior\n  - Field validations\n  - API/integration logic\n  - Edge cases\n\n4. TRACEABILITY:\n- Reference sources like:\n  - â€œAs mentioned in BRDâ€¦â€\n  - â€œAccording to HLDâ€¦â€\n\n5. FORMAT RULES:\n- Maintain valid JSON (no trailing commas).\n- Keep delimiter:\n--- USER_STORY_BREAK ---\n- Ensure output is parsable by Extract Structured JSON node.\n\nOUTPUT:\n- Return ONLY the final JSON object.\n- No explanations outside JSON.`\n},\n  risk_matrix: {\n    title: \"Risk Assessment Matrix\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Risk Assessment Matrix\nGenerated On: {{ $now }}\nModel: gpt-4o-mini\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior Risk \u0026 Quality Governance Consultant with 15+ years of experience in enterprise delivery risk management.\n\nYou specialize in:\n- Risk-based testing frameworks\n- Failure mode impact analysis (FMEA)\n- Technical \u0026 business risk modeling\n- Delivery risk governance\n- Quantitative scoring models (Probability Ã— Impact Ã— Detectability)\n\nYour output must be suitable for leadership review and audit compliance.\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, transcripts, and architecture documents.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Identify risks across:\n   - Functional complexity\n   - Integration dependencies\n   - Architecture scalability\n   - Security \u0026 compliance\n   - Performance constraints\n   - Data integrity\n   - Environment instability\n   - Delivery timelines\n2. Categorize risks:\n   - Technical Risk\n   - Business Risk\n   - Operational Risk\n   - Security Risk\n3. Use quantitative scoring:\n   - Probability (1â€“5)\n   - Impact (1â€“5)\n   - Risk Score = Probability Ã— Impact\n4. Define:\n   - Mitigation Strategy\n   - Contingency Plan\n   - Risk Owner\n   - Detection Mechanism\n   - Early Warning Indicators\n\n========================\nOUTPUT FORMAT\n========================\n\n| Risk ID | Risk Category | Risk Description | Source Reference | Probability | Impact | Risk Score | Mitigation Plan | Contingency Plan | Owner | Detection Strategy |\n\nThen provide:\n- Risk Heat Map summary\n- Top 5 Critical Risks analysis (detailed narrative)\n- Risk Prioritization Strategy explanation\n- Linkage to Test Strategy alignment\n\nEnsure reasoning is grounded in retrieved content.\n`\n  },\n  traceability_matrix: {\n    title: \"Requirement Traceability Matrix\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Requirement Traceability Matrix\nGenerated On: {{ $now }}\nModel: gpt-4o-mini\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a QA Governance Specialist responsible for end-to-end requirement traceability in large enterprise programs.\n\nYou ensure:\n- 100% requirement coverage\n- Bidirectional traceability\n- Audit-ready documentation\n- Automation coverage mapping\n- Risk mapping integration\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, and transcripts.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Extract all functional and non-functional requirements.\n2. Assign Requirement IDs if not explicitly present.\n3. Map each requirement to:\n   - Related Design Component\n   - Test Scenario ID(s)\n   - Automation Coverage Status\n   - Risk ID (if applicable)\n   - Status (Planned / In Progress / Covered / At Risk)\n4. Identify coverage gaps.\n5. Provide automation coverage percentage.\n\n========================\nOUTPUT FORMAT\n========================\n\n| Req ID | Requirement Description | Source Document | Design Component | Test Case IDs | Automation Status | Risk ID | Coverage Status |\n\nAfter the table, include:\n\n- Coverage Summary Metrics\n- Unmapped Requirement Analysis\n- Automation Coverage Insights\n- Governance \u0026 Audit Readiness Commentary\n\nEnsure traceability statements reference retrieved source context.\n`\n  }\n};\n\nreturn [{\n  json: {\n    ...promptLibrary[type],\n    documentType: type,\n    projectName: projectName,\n    productOwner: productOwner\n  }\n}];"
}
```

### Raw Content -> Structured Content

| Field | Value |
| --- | --- |
| Node ID | 2a0626aa-7756-4e49-adef-050b0a8351f4 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1440, -48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Validate AI Agent Output -> Raw Content -> Structured Content (output 0, input 0)

**Outgoing Connections**

- Raw Content -> Structured Content -> does user stories exists as Strucutured Data? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "let raw = $json.rawMarkdown;\n\ntry {\n  // âœ… Step 1: Clean invalid trailing delimiters or junk\n  let cleaned = raw\n    .replace(/--- USER_STORY_BREAK ---/g, \u0027\u0027)   // remove delimiter\n    .trim();\n\n  // âœ… Step 2: Extract ONLY valid JSON (safe guard)\n  const firstBrace = cleaned.indexOf(\u0027{\u0027);\n  const lastBrace = cleaned.lastIndexOf(\u0027}\u0027);\n\n  if (firstBrace !== -1 \u0026\u0026 lastBrace !== -1) {\n    cleaned = cleaned.substring(firstBrace, lastBrace + 1);\n  }\n\n  // âœ… Step 3: Parse JSON\n  const parsed = JSON.parse(cleaned);\n\n  return [{\n    json: {\n      rawMarkdown: raw,\n      cleanedJson: cleaned,\n      structuredData: parsed,\n      parsingError: false\n    }\n  }];\n\n} catch (err) {\n\n  return [{\n    json: {\n      rawMarkdown: raw,\n      structuredData: null,\n      parsingError: true,\n      errorMessage: err.message\n    }\n  }];\n}"
}
```

### Search Epic in JIRA

| Field | Value |
| --- | --- |
| Node ID | 205437c9-76fb-46d5-aa75-a1290eb9c779 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3136, 64 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch -> Search Epic in JIRA (output 0, input 0)

**Outgoing Connections**

- Search Epic in JIRA -> Extract Epic Key (output 0, input 0)

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "PmUodlFFlkC8NiuX",
                          "name":  "JIRA"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://anujalhans1.atlassian.net/rest/api/3/search/jql",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "jql",
                                                   "value":  "=project = KAN AND issuetype = Epic AND summary ~ \"{{ $json.epicName }}\""
                                               },
                                               {
                                                   "name":  "fields",
                                                   "value":  "key"
                                               }
                                           ]
                        },
    "options":  {

                }
}
```

### Search existence of Epics in JIRA

| Field | Value |
| --- | --- |
| Node ID | 807dc60b-56a9-4c4a-89e2-4fd0b9f86009 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2288, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Final Structured Data -> Search existence of Epics in JIRA (output 0, input 0)

**Outgoing Connections**

- Search existence of Epics in JIRA -> Identify Epics to be created (output 0, input 0)

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "PmUodlFFlkC8NiuX",
                          "name":  "JIRA"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://anujalhans1.atlassian.net/rest/api/3/search/jql",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "jql",
                                                   "value":  "={{ \n\"project = KAN AND issuetype = Epic AND (\" + \n$json.structuredData.epics\n  .map(e =\u003e `summary ~ \"${e.epicName.replace(/\"/g, \u0027\\\\\"\u0027)}\"`)\n  .join(\" OR \") \n+ \")\"\n}}"
                                               },
                                               {
                                                   "name":  "fields",
                                                   "value":  "summary,key,id"
                                               }
                                           ]
                        },
    "options":  {

                }
}
```

### Search Story in JIRA

| Field | Value |
| --- | --- |
| Node ID | 8ef777b6-eb75-4696-be32-3e7414997f31 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 4368, 528 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge All Stories -> Search Story in JIRA (output 0, input 0)

**Outgoing Connections**

- Search Story in JIRA -> Merge Outputs (output 0, input 1)

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "PmUodlFFlkC8NiuX",
                          "name":  "JIRA"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://anujalhans1.atlassian.net/rest/api/3/search/jql",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "jql",
                                                   "value":  "=project = KAN AND issuetype = Story AND labels IN (\"{{$json.idempotencyKey }}\")"
                                               },
                                               {
                                                   "name":  "fields",
                                                   "value":  "key"
                                               }
                                           ]
                        },
    "options":  {

                }
}
```

### Story Already Exists in JIRA?

| Field | Value |
| --- | --- |
| Node ID | 57201bfc-e1ac-41ad-a2b9-82477b5366c4 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 4976, 320 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Outputs -> Story Already Exists in JIRA? (output 0, input 0)

**Outgoing Connections**

- Story Already Exists in JIRA? -> Create User Stories in JIRA1 (output 1, input 0)

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
                                              "id":  "c35cd894-c8d4-42ea-b83f-08531d22de49",
                                              "leftValue":  "={{ $json.issues.length }}",
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

### Switch

| Field | Value |
| --- | --- |
| Node ID | 4c9e4a1e-e285-4320-9643-1caa10e8f35f |
| Type | n8n-nodes-base.switch |
| Type Version | 3.4 |
| Position | 2912, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Add Flag True or False based on Epic exists or not -> Switch (output 0, input 0)

**Outgoing Connections**

- Switch -> Search Epic in JIRA (output 0, input 0)
- Switch -> Merge4 (output 0, input 0)
- Switch -> Merge3 (output 1, input 0)
- Switch -> Deduplicate Epics (output 1, input 0)

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
                                                                        "version":  3
                                                                    },
                                                        "conditions":  [
                                                                           {
                                                                               "leftValue":  "={{ $json.epicExists }}",
                                                                               "rightValue":  "false",
                                                                               "operator":  {
                                                                                                "type":  "boolean",
                                                                                                "operation":  "true",
                                                                                                "singleValue":  true
                                                                                            },
                                                                               "id":  "c4bdf643-9137-42d6-aaf5-d168f7173bdf"
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
                                                                        "version":  3
                                                                    },
                                                        "conditions":  [
                                                                           {
                                                                               "id":  "9948d045-4991-4a10-9281-21917437a2bb",
                                                                               "leftValue":  "={{ $json.epicExists }}",
                                                                               "rightValue":  true,
                                                                               "operator":  {
                                                                                                "type":  "boolean",
                                                                                                "operation":  "false",
                                                                                                "singleValue":  true
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

### Update existing Document on Confluence

| Field | Value |
| --- | --- |
| Node ID | bb4210f8-ef1e-490f-888d-e1d829079480 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 4640, -448 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge2 -> Update existing Document on Confluence (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "kNwO3XevolPxpmlK",
                          "name":  "Confluence"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PUT",
    "url":  "=https://anujalhans1.atlassian.net/wiki/rest/api/content/{{ $json.pageId }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendHeaders":  true,
    "headerParameters":  {
                             "parameters":  [
                                                {
                                                    "name":  "Content-Type",
                                                    "value":  "application/json"
                                                }
                                            ]
                         },
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "id",
                                                  "value":  "={{$json.id}}"
                                              },
                                              {
                                                  "name":  "title",
                                                  "value":  "={{$json.title}}"
                                              },
                                              {
                                                  "name":  "version.number",
                                                  "value":  "={{$json.version.number + 1}}"
                                              },
                                              {
                                                  "name":  "body.storage.value",
                                                  "value":  "={{ $json.html }}"
                                              },
                                              {
                                                  "name":  "body.storage.representation",
                                                  "value":  "storage"
                                              },
                                              {
                                                  "name":  "type",
                                                  "value":  "page"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### Upload Document on Confluence

| Field | Value |
| --- | --- |
| Node ID | 6e88142c-298a-4807-b88d-afcc066732cc |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 4144, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- If -> Upload Document on Confluence (output 1, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "kNwO3XevolPxpmlK",
                          "name":  "Confluence"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "https://anujalhans1.atlassian.net/wiki/rest/api/content",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendHeaders":  true,
    "headerParameters":  {
                             "parameters":  [
                                                {
                                                    "name":  "Content-Type",
                                                    "value":  "application/json"
                                                }
                                            ]
                         },
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "type",
                                                  "value":  "page"
                                              },
                                              {
                                                  "name":  "title",
                                                  "value":  "={{ $json.body.documentType\n    .replace(/_/g, \u0027 \u0027)\n    .replace(/\\b\\w/g, c =\u003e c.toUpperCase())\n}} - {{ $json.body.projectName }}"
                                              },
                                              {
                                                  "name":  "space.key",
                                                  "value":  "TD"
                                              },
                                              {
                                                  "name":  "body.storage.value",
                                                  "value":  "={{$json.html}}"
                                              },
                                              {
                                                  "name":  "body.storage.representation",
                                                  "value":  "storage"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### Validate AI Agent Output

| Field | Value |
| --- | --- |
| Node ID | 8b5a0020-4aab-4e81-a5f5-4067adf58875 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1152, -48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Generator Agent -> Validate AI Agent Output (output 0, input 0)

**Outgoing Connections**

- Validate AI Agent Output -> Raw Content -> Structured Content (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Detect AI output safely across all n8n versions\n\nlet text = \"\";\n\n// Case 1: Newer n8n format\nif ($json.output_text) {\n  text = $json.output_text;\n}\n\n// Case 2: Direct string output\nelse if (typeof $json.output === \"string\") {\n  text = $json.output;\n}\n\n// Case 3: Array structured output\nelse if ($json.output?.[0]?.content?.[0]?.text) {\n  text = $json.output[0].content[0].text;\n}\n\n// Case 4: message.content format\nelse if ($json.message?.content) {\n  text = $json.message.content;\n}\n\n// If still empty, throw real debug info\nif (!text || text.trim().length \u003c 50) {\n  throw new Error(\"AI returned unexpected structure: \" + JSON.stringify($json));\n}\n\nif (!text || text.trim().length \u003c 50) {\n  throw new Error(\"RETRY_AI\");\n}\n\nreturn [\n  {\n    json: {\n      rawMarkdown: text\n    }\n  }\n];\n"
}
```

### Webhook

| Field | Value |
| --- | --- |
| Node ID | 4269d493-4c78-40e0-a35d-bcbeff0fe9f8 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | -288, -224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Webhook -> Merge (output 0, input 0)
- Webhook -> Generate Job ID (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "generate-qa-doc",
    "options":  {

                }
}
```
