# RETRIEVAL Document Generator AI Agent - SaaS

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 0G3qlenjAeBnHDTr |
| Active | False |
| Archived | False |
| Created At | 2026-04-01T06:04:29.890Z |
| Updated At | 2026-05-07T05:15:18.659Z |
| Node Count | 67 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\RETRIEVAL Document Generator AI Agent - SaaS [0G3qlenjAeBnHDTr].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- When Executed by Another Workflow | n8n-nodes-base.executeWorkflowTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.agent | 1 |
| @n8n/n8n-nodes-langchain.embeddingsOpenAi | 1 |
| @n8n/n8n-nodes-langchain.lmChatOpenAi | 1 |
| @n8n/n8n-nodes-langchain.vectorStoreChromaDB | 1 |
| n8n-nodes-base.code | 15 |
| n8n-nodes-base.executeWorkflowTrigger | 1 |
| n8n-nodes-base.httpRequest | 22 |
| n8n-nodes-base.if | 5 |
| n8n-nodes-base.jira | 2 |
| n8n-nodes-base.merge | 12 |
| n8n-nodes-base.set | 5 |
| n8n-nodes-base.switch | 1 |

## Credentials Referenced

- chromaCloudApi: ChromaDB Self-Hosted account
- httpBasicAuth: Confluence
- httpBasicAuth: JIRA
- httpCustomAuth: supabase-anon-key
- jiraSoftwareCloudApi: Jira SW Cloud account
- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- http://127.0.0.1:5050/convert
- https://anujalhans1.atlassian.net/rest/api/3/search/jql
- https://anujalhans1.atlassian.net/wiki/rest/api/content
- https://anujalhans1.atlassian.net/wiki/rest/api/content/{{
- https://anujalhans1.atlassian.net/wiki/rest/api/content?spaceKey=TD&title={{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{

### Supabase/Data Table Hints

- qa_job_metrics
- qa_jobs

## Connection Graph

- OpenAI Chat Model -> Generator Agent (source output 0, target input 0)
- Chroma Vector Store -> Generator Agent (source output 0, target input 0)
- Embeddings OpenAI -> Chroma Vector Store (source output 0, target input 0)
- Clean Markdown Formatting -> Merge (source output 0, target input 1)
- Validate AI Agent Output -> Quality Gate (source output 0, target input 0)
- Generator Agent -> Validate AI Agent Output (source output 0, target input 0)
- Generator Agent -> Handle: Generator Agent Failed (source output 1, target input 0)
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
- Create Epics in JIRA -> Edit Fields (source output 0, target input 0)
- Search Story in JIRA -> Merge Outputs (source output 0, target input 1)
- Extract Epic Key -> Merge4 (source output 0, target input 1)
- does user stories exists as Strucutured Data? -> Final Structured Data (source output 0, target input 0)
- does user stories exists as Strucutured Data? -> Clean Markdown Formatting (source output 1, target input 0)
- Add Flag True or False based on Epic exists or not -> Merge8 (source output 0, target input 0)
- Merge All Stories -> Search Story in JIRA (source output 0, target input 0)
- Merge All Stories -> Merge Outputs (source output 0, target input 0)
- Merge Outputs -> Story Already Exists in JIRA? (source output 0, target input 0)
- Story Already Exists in JIRA? -> Create User Stories in JIRA1 (source output 1, target input 0)
- Check Existing Page -> Page ID (source output 0, target input 0)
- Get Page Details -> Merge2 (source output 0, target input 1)
- Search existence of Epics in JIRA -> Identify Epics to be created (source output 0, target input 0)
- Page ID -> Merge1 (source output 0, target input 0)
- Merge1 -> Page Exists? (source output 0, target input 0)
- Merge1 -> Preserve Job ID (source output 0, target input 0)
- Merge2 -> Update existing Document on Confluence (source output 0, target input 0)
- Deduplicate Epics -> Create Epics in JIRA (source output 0, target input 0)
- When Executed by Another Workflow -> Merge (source output 0, target input 0)
- When Executed by Another Workflow -> Merge8 (source output 0, target input 1)
- When Executed by Another Workflow -> Log: Job Started (source output 0, target input 0)
- Update existing Document on Confluence -> Version Number > 1? (source output 0, target input 0)
- Upload Document on Confluence -> Document uploaded Successfully on Confluence? (source output 0, target input 0)
- Page Exists? -> Get Page Details (source output 0, target input 0)
- Page Exists? -> Merge2 (source output 0, target input 0)
- Page Exists? -> Upload Document on Confluence (source output 1, target input 0)
- Merge5 -> LOG: Confluence Job Completed (source output 0, target input 0)
- Merge6 -> LOG: Confluence Job Failed (source output 0, target input 0)
- Preserve Job ID -> Merge5 (source output 0, target input 0)
- Preserve Job ID -> Merge6 (source output 0, target input 0)
- Preserve Job ID -> Merge7 (source output 0, target input 1)
- Merge7 -> LOG: Update Confluence Job Completed (source output 0, target input 0)
- Version Number > 1? -> Merge7 (source output 0, target input 0)
- Document uploaded Successfully on Confluence? -> Merge5 (source output 0, target input 1)
- Document uploaded Successfully on Confluence? -> Merge6 (source output 1, target input 1)
- Merge8 -> Code in JavaScript (source output 0, target input 0)
- Code in JavaScript -> Switch (source output 0, target input 0)
- Create User Stories in JIRA1 -> Edit Fields1 (source output 0, target input 0)
- Merge9 -> Code in JavaScript1 (source output 0, target input 0)
- Code in JavaScript1 -> LOG: JIRA Job Completed (source output 0, target input 0)
- Edit Fields -> Merge3 (source output 0, target input 1)
- Edit Fields -> Merge9 (source output 0, target input 1)
- Edit Fields1 -> Merge9 (source output 0, target input 0)
- Quality Gate -> LOG: Quality Gate Passed (source output 0, target input 0)
- Quality Gate -> LOG: Quality Gate Failed (source output 1, target input 0)
- Log: Job Started -> Restore Job Context (source output 0, target input 0)
- LOG: Quality Gate Passed -> Restore Quality Gate Output (source output 0, target input 0)
- LOG: Quality Gate Failed -> Update Job Status as Failed1 (source output 0, target input 0)
- LOG: Confluence Job Completed -> Update Job Status as Completed (source output 0, target input 0)
- LOG: Update Confluence Job Completed -> Mark Job Status as Completed (source output 0, target input 0)
- LOG: JIRA Job Completed -> Update Job Status as Completed1 (source output 0, target input 0)
- LOG: Confluence Job Failed -> Update Job Status as Failed (source output 0, target input 0)
- Restore Job Context -> Prompt Library (source output 0, target input 0)
- Handle: Generator Agent Failed -> LOG: Generator Agent Failed (source output 0, target input 0)
- LOG: Generator Agent Failed -> Update Job Status: Generator Agent Failed (source output 0, target input 0)
- Restore Quality Gate Output -> Raw Content -> Structured Content (source output 0, target input 0)

## Nodes

### Add Flag True or False based on Epic exists or not

| Field | Value |
| --- | --- |
| Node ID | de75c289-dbec-48f1-9550-2d8f7d84a7cc |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -768, 1136 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Identify Epics to be created -> Add Flag True or False based on Epic exists or not (output 0, input 0)

**Outgoing Connections**

- Add Flag True or False based on Epic exists or not -> Merge8 (output 0, input 0)

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
| Node ID | 12cbc242-fac0-4afa-8198-30b2ff81bbb3 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -208, 368 |
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
    "url":  "=https://anujalhans1.atlassian.net/wiki/rest/api/content?spaceKey=TD\u0026title={{ encodeURIComponent(\n  $json.documentType\n    .replace(/_/g, \u0027 \u0027)\n    .replace(/\\b\\w/g, c =\u003e c.toUpperCase()) \n  + \" - \" + \n  $json.projectName\n)}}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "options":  {

                }
}
```

### Chroma Vector Store

| Field | Value |
| --- | --- |
| Node ID | 314d6dc0-43a1-46eb-8dab-160d7819a070 |
| Type | @n8n/n8n-nodes-langchain.vectorStoreChromaDB |
| Type Version | 1.3 |
| Position | -3872, 1040 |
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
    "toolDescription":  "Retrieves relevant chunks from the vector store for document generation",
    "authentication":  "chromaCloudApi",
    "chromaCollection":  {
                             "__rl":  true,
                             "value":  "qa-chunks-batches",
                             "mode":  "list",
                             "cachedResultName":  "qa-chunks-batches"
                         },
    "topK":  20,
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
| Node ID | 49fd6b3c-4881-40d0-9b93-9ad3420941a6 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1440, 752 |
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

### Code in JavaScript

| Field | Value |
| --- | --- |
| Node ID | 1c4042fb-7ea5-4b7b-817b-cf95448ec2aa |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -240, 1152 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge8 -> Code in JavaScript (output 0, input 0)

**Outgoing Connections**

- Code in JavaScript -> Switch (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\n\n// Step 1: Extract job metadata (item without epicId)\nconst jobMetaItem = items.find(item =\u003e !item.json.epicId);\n\nconst jobMeta = jobMetaItem\n  ? {\n      jobId: jobMetaItem.json.jobId,\n      originalJobStatus: jobMetaItem.json.originalJobStatus,\n      projectName: jobMetaItem.json.projectName,\n      documentType: jobMetaItem.json.documentType,\n      productOwner: jobMetaItem.json.productOwner\n    }\n  : {};\n\n// Step 2: Attach metadata to each valid item (having epicId)\nreturn items\n  .filter(item =\u003e item.json.epicId) // exclude metadata-only item\n  .map(item =\u003e ({\n    json: {\n      ...item.json,\n      ...jobMeta\n    }\n  }));"
}
```

### Code in JavaScript1

| Field | Value |
| --- | --- |
| Node ID | b7e392e0-dcf5-4601-8dc9-c51c0660f33a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3088, 1440 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge9 -> Code in JavaScript1 (output 0, input 0)

**Outgoing Connections**

- Code in JavaScript1 -> LOG: JIRA Job Completed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\n\nconst stories = [];\nconst epicsMap = {}; // to deduplicate epics\n\nitems.forEach(item =\u003e {\n  const data = item.json;\n\n  // âœ… FIXED: correct field names\n  if (data.storyid \u0026\u0026 data.storykey \u0026\u0026 data.storylink) {\n    stories.push({\n      storyID: data.storyid,\n      storyKey: data.storykey,\n      storyLink: data.storylink\n    });\n  }\n\n  // âœ… FIXED: correct field names\n  if (data.epicid \u0026\u0026 data.epickey) {\n    const epicKey = data.epickey;\n\n    if (!epicsMap[epicKey]) {\n      epicsMap[epicKey] = {\n        epicID: data.epicid,\n        epicKey: data.epickey,\n        epicLink: data.epicklink \n      };\n    }\n  }\n});\n\n// âœ… SAFE jobId handling (no crash)\nlet jobId = null;\n\ntry {\n  const nodeItems = $items(\"Story Already Exists in JIRA?\");\n  if (nodeItems.length \u003e 0) {\n    jobId = nodeItems[0].json.jobId;\n  }\n} catch (e) {\n  // fallback if node not available\n  jobId = items[0]?.json?.jobId || null;\n}\n\nreturn [\n  {\n    json: {\n      jobId,\n      stories,\n      epics: Object.values(epicsMap)\n    }\n  }\n];"
}
```

### Convert MD -> Confluence Formatted HTML

| Field | Value |
| --- | --- |
| Node ID | 6283e99d-ae43-4dc8-8380-883a9b51d87a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -400, 592 |
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
| Node ID | 695bcdb7-2637-4b49-b416-b7105a81fbd6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | -656, 592 |
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
                                                  "value":  "={{ $json.documentType }}"
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
| Node ID | 5402746a-3ce8-453c-aeba-d42ad1d9c68b |
| Type | n8n-nodes-base.jira |
| Type Version | 1 |
| Position | 416, 1456 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Deduplicate Epics -> Create Epics in JIRA (output 0, input 0)

**Outgoing Connections**

- Create Epics in JIRA -> Edit Fields (output 0, input 0)

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
| Node ID | b5a6760e-be87-4566-806f-b3966d5e1616 |
| Type | n8n-nodes-base.jira |
| Type Version | 1 |
| Position | 2416, 1136 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | False |
| Continue On Fail |  |

**Incoming Connections**

- Story Already Exists in JIRA? -> Create User Stories in JIRA1 (output 1, input 0)

**Outgoing Connections**

- Create User Stories in JIRA1 -> Edit Fields1 (output 0, input 0)

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
| Node ID | aea2b5b9-4709-497a-957a-b6a1a89dd545 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 240, 1456 |
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
    "jsCode":  "const items = $input.all();\n\nconst uniqueEpicsMap = {};\n\n// Deduplicate epics (only where epicExists = false)\nitems.forEach(item =\u003e {\n  const epic = item.json;\n\n  if (epic.epicId \u0026\u0026 !epic.epicExists) {\n    const key = epic.epicName;\n\n    if (!uniqueEpicsMap[key]) {\n      uniqueEpicsMap[key] = {\n        json: {\n          epicName: epic.epicName,\n          epicDescription: epic.epicDescription,\n          businessObjective: epic.businessObjective,\n          successMetrics: epic.successMetrics,\n          sourceTraceability: epic.sourceTraceability,\n          epicId: epic.epicId,\n\n          // âœ… Keep everything else automatically (including metadata)\n          ...epic\n        }\n      };\n    }\n  }\n});\n\nreturn Object.values(uniqueEpicsMap);"
}
```

### Document uploaded Successfully on Confluence?

| Field | Value |
| --- | --- |
| Node ID | c051f69a-87b7-44cf-a193-2794901751a1 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1248, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Upload Document on Confluence -> Document uploaded Successfully on Confluence? (output 0, input 0)

**Outgoing Connections**

- Document uploaded Successfully on Confluence? -> Merge5 (output 0, input 1)
- Document uploaded Successfully on Confluence? -> Merge6 (output 1, input 1)

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
                                              "id":  "2bd69045-205f-439c-8b09-93f7396a0ebe",
                                              "leftValue":  "={{ $json.id }}",
                                              "rightValue":  "",
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "exists",
                                                               "singleValue":  true
                                                           }
                                          },
                                          {
                                              "id":  "482e82c3-c98f-457a-b529-25183a1d9491",
                                              "leftValue":  "={{ $json.status }}",
                                              "rightValue":  "current",
                                              "operator":  {
                                                               "type":  "string",
                                                               "operation":  "equals",
                                                               "name":  "filter.operator.equals"
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

### does user stories exists as Strucutured Data?

| Field | Value |
| --- | --- |
| Node ID | cfd35f4f-3b9e-4ecb-b139-8e395866bfc8 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | -1792, 736 |
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

### Edit Fields

| Field | Value |
| --- | --- |
| Node ID | adbeeb80-f614-426c-a332-79ec2f6bc6c5 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | 592, 1456 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Create Epics in JIRA -> Edit Fields (output 0, input 0)

**Outgoing Connections**

- Edit Fields -> Merge3 (output 0, input 1)
- Edit Fields -> Merge9 (output 0, input 1)

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
                                                "id":  "800d9e22-3ba6-4869-b58c-161556ad759f",
                                                "name":  "epicid",
                                                "value":  "={{ $json.id }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "7c3954ac-80ac-4a6b-814b-f617f35e2406",
                                                "name":  "=epickey",
                                                "value":  "={{ $json.key }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "d9aa4c22-65b9-4459-9d66-7e433e6a568e",
                                                "name":  "epicklink",
                                                "value":  "={{ $json.self }}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "options":  {

                }
}
```

### Edit Fields1

| Field | Value |
| --- | --- |
| Node ID | 59a55f8e-97e8-4319-b0fe-5a8bfe0c838e |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | 2624, 1136 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Create User Stories in JIRA1 -> Edit Fields1 (output 0, input 0)

**Outgoing Connections**

- Edit Fields1 -> Merge9 (output 0, input 0)

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
                                                "id":  "2da82ef9-8423-4757-a30d-aa8413d9329c",
                                                "name":  "storyid",
                                                "value":  "={{ $json.id }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "3f4d0384-44bb-4b19-80a1-2e202e0f4a4d",
                                                "name":  "storykey",
                                                "value":  "={{ $json.key }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "dfc2a606-40d8-4150-afa4-3064cfa90fe3",
                                                "name":  "storylink",
                                                "value":  "={{ $json.self }}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "options":  {

                }
}
```

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | f7467631-87e8-4942-9caf-8c1125d940a4 |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | -3680, 1248 |
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
| Node ID | 79da0984-abbf-43e6-a5d9-f84f4c59d6cd |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 512, 864 |
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
    "jsCode":  "return $input.all().map(item =\u003e {\n  const issue = item.json.issues?.[0];\n\n  return {\n    json: {\n      epicid: issue?.id || null,\n      epickey: issue?.key || null,\n      epiclink: issue?.self || null\n      \n    }\n  };\n});"
}
```

### Final Structured Data

| Field | Value |
| --- | --- |
| Node ID | 2be72e63-1994-4d71-9ea5-6e6149e78244 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1440, 1136 |
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

### Generator Agent

| Field | Value |
| --- | --- |
| Node ID | bea1ae3e-301d-423c-aea0-f20efd23090a |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3.1 |
| Position | -3936, 752 |
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
- Generator Agent -> Handle: Generator Agent Failed (output 1, input 0)

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
| Node ID | 413e22ca-618c-4129-9795-47937ac7237d |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 960, 144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Page Exists? -> Get Page Details (output 0, input 0)

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

### Handle: Generator Agent Failed

| Field | Value |
| --- | --- |
| Node ID | 67771969-a8a7-4737-9b70-ffb74519ad30 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -3488, 1008 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Generator Agent -> Handle: Generator Agent Failed (output 1, input 0)

**Outgoing Connections**

- Handle: Generator Agent Failed -> LOG: Generator Agent Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const projectName = $(\u0027Restore Job Context\u0027).item.json.projectName || \u0027unknown\u0027;\nconst documentType = $(\u0027Restore Job Context\u0027).item.json.documentType || \u0027unknown\u0027;\nconst jobId = $(\u0027Restore Job Context\u0027).item.json.jobId || \u0027unknown\u0027;\n\n// Extract error details from the error output\nconst errorMessage = $json.error?.message || \n                     $json.message || \n                     \u0027Generator Agent failed unexpectedly\u0027;\n\nconst errorDescription = $json.error?.description || \n                         $json.errorDescription || \n                         \u0027\u0027;\n\nconsole.error(`âŒ Generator Agent failed for job ${jobId}:`, errorMessage);\n\nreturn [\n  {\n    json: {\n      jobId,\n      projectName,\n      documentType,\n      error: true,\n      errorType: \u0027GENERATOR_AGENT_FAILED\u0027,\n      message: errorMessage,\n      description: errorDescription,\n      timestamp: new Date().toISOString()\n    }\n  }\n];"
}
```

### Identify Epics to be created

| Field | Value |
| --- | --- |
| Node ID | 46295e9a-0aec-4940-81dd-038a7ef68923 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -976, 1136 |
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

### LOG: Confluence Job Completed

| Field | Value |
| --- | --- |
| Node ID | 0364d91c-c218-4466-82cf-f2b7664a6687 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2416, 592 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge5 -> LOG: Confluence Job Completed (output 0, input 0)

**Outgoing Connections**

- LOG: Confluence Job Completed -> Update Job Status as Completed (output 0, input 0)

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
    "jsonHeaders":  "{\n\"Prefer\": \"return=minimal\"  \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"job_id\":        \"{{ $(\u0027Preserve Job ID\u0027).item.json.job_id }}\",\n  \"project_name\":  \"{{ $(\u0027Preserve Job ID\u0027).item.json.projectName }}\",\n  \"document_type\": \"{{ $(\u0027Preserve Job ID\u0027).item.json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"JOB_COMPLETED\",\n  \"status\":        \"info\",\n  \"duration_ms\": \"{{ Date.now() - new Date($(\u0027Restore Job Context\u0027).item.json.startedAt).getTime() }}\",\n  \"metadata\": {\n    \"confluence_page_id\": \"{{ $json.id }}\",\n    \"confluence_url\":     \"{{ $json._links.base + $json._links.webui }}\",\n    \"output_type\":        \"confluence\"\n  }\n}",
    "options":  {

                }
}
```

### LOG: Confluence Job Failed

| Field | Value |
| --- | --- |
| Node ID | b62f8f7f-9e72-481b-878b-49b0a6d5dd06 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2416, 800 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge6 -> LOG: Confluence Job Failed (output 0, input 0)

**Outgoing Connections**

- LOG: Confluence Job Failed -> Update Job Status as Failed (output 0, input 0)

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
    "jsonHeaders":  "{\n\"Prefer\": \"return=minimal\"  \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"job_id\":        \"{{ $(\u0027Preserve Job ID\u0027).item.json.job_id }}\",\n  \"project_name\":  \"{{ $(\u0027Preserve Job ID\u0027).item.json.projectName }}\",\n  \"document_type\": \"{{ $(\u0027Preserve Job ID\u0027).item.json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"JOB_FAILED\",\n  \"status\":        \"error\",\n  \"error_message\": \"{{ $json.errorMessage || $json.message || \u0027Unknown error\u0027 }}\",\n\"duration_ms\": \"{{ Date.now() - new Date($(\u0027Restore Job Context\u0027).item.json.startedAt).getTime() }}\",\n  \"metadata\": {\n    \"failed_at\": \"{{ $now }}\"\n  }\n}",
    "options":  {

                }
}
```

### LOG: Generator Agent Failed

| Field | Value |
| --- | --- |
| Node ID | 7e7fbe64-a34a-4d59-ac87-38017805b2fd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -3280, 1008 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Handle: Generator Agent Failed -> LOG: Generator Agent Failed (output 0, input 0)

**Outgoing Connections**

- LOG: Generator Agent Failed -> Update Job Status: Generator Agent Failed (output 0, input 0)

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
    "jsonBody":  "={\n  \"job_id\":        \"{{ $json.jobId }}\",\n  \"project_name\":  \"{{ $json.projectName }}\",\n  \"document_type\": \"{{ $json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"JOB_FAILED\",\n  \"status\":        \"error\",\n  \"error_message\": \"{{ $json.message }}\",\n  \"metadata\": {\n    \"error_type\":        \"GENERATOR_AGENT_FAILED\",\n    \"error_description\": \"{{ $json.description }}\",\n    \"failed_at\":         \"{{ $json.timestamp }}\"\n  }\n}",
    "options":  {

                }
}
```

### LOG: JIRA Job Completed

| Field | Value |
| --- | --- |
| Node ID | 934f57d3-9f38-4636-b249-2c0d7f5ae6e5 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3312, 1440 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Code in JavaScript1 -> LOG: JIRA Job Completed (output 0, input 0)

**Outgoing Connections**

- LOG: JIRA Job Completed -> Update Job Status as Completed1 (output 0, input 0)

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
    "jsonHeaders":  "{\n\"Prefer\": \"return=minimal\"  \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"job_id\":        \"{{ $json.jobId }}\",\n  \"project_name\":  \"{{ $(\u0027Prompt Library\u0027).item.json.projectName }}\",\n  \"document_type\": \"{{ $(\u0027Prompt Library\u0027).item.json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"JOB_COMPLETED\",\n  \"status\":        \"info\",\n\"duration_ms\": \"{{ Date.now() - new Date($(\u0027Restore Job Context\u0027).item.json.startedAt).getTime() }}\",\n  \"metadata\": {\n    \"stories_created\": \"{{ $json.stories.length }}\",\n    \"epics_created\":   \"{{ $json.epics.length }}\",\n    \"output_type\":     \"jira\"\n  }\n}",
    "options":  {

                }
}
```

### Log: Job Started

| Field | Value |
| --- | --- |
| Node ID | 6319463e-4352-4445-a0e2-27006102505b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -4720, 752 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- When Executed by Another Workflow -> Log: Job Started (output 0, input 0)

**Outgoing Connections**

- Log: Job Started -> Restore Job Context (output 0, input 0)

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
    "jsonBody":  "={\n  \"job_id\":        \"{{ $json.jobId }}\",\n  \"project_name\":  \"{{ $json.projectName }}\",\n  \"document_type\": \"{{ $json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"JOB_STARTED\",\n  \"status\":        \"info\",\n  \"metadata\": {\n    \"started_at\": \"{{ $now }}\"\n  }\n}",
    "options":  {

                }
}
```

### LOG: Quality Gate Failed

| Field | Value |
| --- | --- |
| Node ID | b8d6f69a-629b-4c6b-8b82-86c4c0a8130a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -2464, 1152 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Quality Gate -> LOG: Quality Gate Failed (output 1, input 0)

**Outgoing Connections**

- LOG: Quality Gate Failed -> Update Job Status as Failed1 (output 0, input 0)

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
    "jsonHeaders":  "{\n\"Prefer\": \"return=minimal\"  \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"job_id\":        \"{{ $(\u0027Quality Gate\u0027).item.json.jobId }}\",\n  \"project_name\":  \"{{ $(\u0027Prompt Library\u0027).item.json.projectName }}\",\n  \"document_type\": \"{{ $(\u0027Prompt Library\u0027).item.json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"QUALITY_GATE_FAILED\",\n  \"status\":        \"error\",\n  \"error_message\": \"{{ $json.message || \u0027Quality Gate Failed\u0027 }}\",\n  \"metadata\": {\n    \"word_count\": \"{{ $(\u0027Quality Gate\u0027).item.json.wordCount }}\"\n  }\n}",
    "options":  {

                }
}
```

### LOG: Quality Gate Passed

| Field | Value |
| --- | --- |
| Node ID | b2ea3914-bc6d-4ca2-8fcd-38c80e0a6dbe |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -2464, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Quality Gate -> LOG: Quality Gate Passed (output 0, input 0)

**Outgoing Connections**

- LOG: Quality Gate Passed -> Restore Quality Gate Output (output 0, input 0)

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
    "jsonHeaders":  "{\n\"Prefer\": \"return=minimal\"  \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"job_id\":        \"{{ $json.jobId }}\",\n  \"project_name\":  \"{{ $(\u0027Prompt Library\u0027).item.json.projectName }}\",\n  \"document_type\": \"{{ $(\u0027Prompt Library\u0027).item.json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"QUALITY_GATE_PASSED\",\n  \"status\":        \"info\",\n  \"word_count\":    \"{{ parseInt($json.wordCount) || 0 }}\",\n  \"tokens_input\":       \"{{ $json.tokensInput || 0 }}\",\n  \"tokens_output\":      \"{{ $json.tokensOutput || 0 }}\",\n  \"tokens_total\":       \"{{ $json.tokensTotal || 0 }}\",\n  \"estimated_cost_usd\": \"{{ $json.estimatedCostUsd || 0 }}\",\n  \"metadata\": {\n    \"char_count\":       \"{{ $json.charCount }}\",\n    \"min_word_count\":   \"{{ $json.qualityGate.minWordCount }}\",\n    \"checked_sections\": \"{{ $json.qualityGate.checkedSections }}\"\n  }\n}",
    "options":  {

                }
}
```

### LOG: Update Confluence Job Completed

| Field | Value |
| --- | --- |
| Node ID | 6c4bbad4-7f07-4513-b734-185da17398ec |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2416, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge7 -> LOG: Update Confluence Job Completed (output 0, input 0)

**Outgoing Connections**

- LOG: Update Confluence Job Completed -> Mark Job Status as Completed (output 0, input 0)

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
    "jsonHeaders":  "{\n\"Prefer\": \"return=minimal\"  \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"job_id\":        \"{{ $(\u0027Preserve Job ID\u0027).item.json.job_id }}\",\n  \"project_name\":  \"{{ $(\u0027Preserve Job ID\u0027).item.json.projectName }}\",\n  \"document_type\": \"{{ $(\u0027Preserve Job ID\u0027).item.json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"JOB_COMPLETED\",\n  \"status\":        \"info\",\n\"duration_ms\": \"{{ Date.now() - new Date($(\u0027Restore Job Context\u0027).item.json.startedAt).getTime() }}\",\n  \"metadata\": {\n    \"confluence_page_id\": \"{{ $json.id }}\",\n    \"confluence_url\":     \"{{ $json._links.base + $json._links.webui }}\",\n    \"output_type\":        \"confluence\"\n  }\n}",
    "options":  {

                }
}
```

### Mark Job Status as Completed

| Field | Value |
| --- | --- |
| Node ID | 3658bc87-083d-43a2-82d8-c9db98b4c10e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2656, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Update Confluence Job Completed -> Mark Job Status as Completed (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.job_id }}\u0026status=eq.processing ",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"completed\",\n  \"output\": {\n    \"confluencePageId\": \"{{ $json.id }}\",\n    \"url\": \"{{ $json._links.base + $json._links.webui }}\"\n  }\n}",
    "options":  {

                }
}
```

### Merge

| Field | Value |
| --- | --- |
| Node ID | 6df7e5f0-c141-4e4f-9221-94521b6693b9 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -880, 592 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Clean Markdown Formatting -> Merge (output 0, input 1)
- When Executed by Another Workflow -> Merge (output 0, input 0)

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
| Node ID | 0dcc33b2-6f17-401e-83ff-f037e80a6ad2 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 1184, 1104 |
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
| Node ID | 3ee97a05-34cc-4b7b-bcdf-f5c11a7c629d |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 1728, 1120 |
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
| Node ID | 90887e0e-9501-46cd-a1af-fe1cebabf576 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 256, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert MD -> Confluence Formatted HTML -> Merge1 (output 0, input 1)
- Page ID -> Merge1 (output 0, input 0)

**Outgoing Connections**

- Merge1 -> Page Exists? (output 0, input 0)
- Merge1 -> Preserve Job ID (output 0, input 0)

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
| Node ID | b9094883-4f5c-4ced-ba5e-8852586be7b8 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 1312, 32 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get Page Details -> Merge2 (output 0, input 1)
- Page Exists? -> Merge2 (output 0, input 0)

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
| Node ID | 244eef45-8c50-42f0-9ae0-60d0397f816e |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 848, 1392 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch -> Merge3 (output 1, input 0)
- Edit Fields -> Merge3 (output 0, input 1)

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
| Node ID | dc3e3ee0-2867-425e-acd4-da9e91f0c3a6 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 832, 912 |
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

### Merge5

| Field | Value |
| --- | --- |
| Node ID | fdf2bae0-ab28-4a7c-9126-6279846a3469 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 2160, 592 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Preserve Job ID -> Merge5 (output 0, input 0)
- Document uploaded Successfully on Confluence? -> Merge5 (output 0, input 1)

**Outgoing Connections**

- Merge5 -> LOG: Confluence Job Completed (output 0, input 0)

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

### Merge6

| Field | Value |
| --- | --- |
| Node ID | 5ae2a8e1-6950-41d1-bbed-cf7edf467de1 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 2160, 800 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Preserve Job ID -> Merge6 (output 0, input 0)
- Document uploaded Successfully on Confluence? -> Merge6 (output 1, input 1)

**Outgoing Connections**

- Merge6 -> LOG: Confluence Job Failed (output 0, input 0)

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

### Merge7

| Field | Value |
| --- | --- |
| Node ID | 1141763f-a865-4a85-ac14-9001219f312c |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 2160, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Preserve Job ID -> Merge7 (output 0, input 1)
- Version Number > 1? -> Merge7 (output 0, input 0)

**Outgoing Connections**

- Merge7 -> LOG: Update Confluence Job Completed (output 0, input 0)

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

### Merge8

| Field | Value |
| --- | --- |
| Node ID | b3009c0c-140e-414c-a9db-a219ce5b2057 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -480, 1152 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Add Flag True or False based on Epic exists or not -> Merge8 (output 0, input 0)
- When Executed by Another Workflow -> Merge8 (output 0, input 1)

**Outgoing Connections**

- Merge8 -> Code in JavaScript (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Merge9

| Field | Value |
| --- | --- |
| Node ID | 7ab0ca84-3b31-429f-a71e-14d953118633 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 2880, 1440 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Edit Fields -> Merge9 (output 0, input 1)
- Edit Fields1 -> Merge9 (output 0, input 0)

**Outgoing Connections**

- Merge9 -> Code in JavaScript1 (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### OpenAI Chat Model

| Field | Value |
| --- | --- |
| Node ID | aeb72eef-7e1c-4d01-b886-17edc6770bd9 |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.3 |
| Position | -4256, 1040 |
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

### Page Exists?

| Field | Value |
| --- | --- |
| Node ID | 2f86c11e-3b27-4c80-af31-833e23479a88 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 576, 32 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge1 -> Page Exists? (output 0, input 0)

**Outgoing Connections**

- Page Exists? -> Get Page Details (output 0, input 0)
- Page Exists? -> Merge2 (output 0, input 0)
- Page Exists? -> Upload Document on Confluence (output 1, input 0)

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

### Page ID

| Field | Value |
| --- | --- |
| Node ID | 34237193-6a1f-4c44-ad0d-a92df6ab5ed8 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 0, 368 |
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

### Preserve Job ID

| Field | Value |
| --- | --- |
| Node ID | b0fda732-1fd7-4a26-a160-8d5acc9db0d0 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | 576, 576 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge1 -> Preserve Job ID (output 0, input 0)

**Outgoing Connections**

- Preserve Job ID -> Merge5 (output 0, input 0)
- Preserve Job ID -> Merge6 (output 0, input 0)
- Preserve Job ID -> Merge7 (output 0, input 1)

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
                                                "id":  "81f28675-aaf9-4664-951f-3e4999607ee3",
                                                "name":  "job_id",
                                                "value":  "={{ $json.jobId }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "ada39ef3-0211-437e-af79-9e9be47d27a4",
                                                "name":  "projectName",
                                                "value":  "={{ $json.projectName }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "af4c707f-dbf7-48f1-9381-e15f5524a642",
                                                "name":  "documentType",
                                                "value":  "={{ $json.documentType }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "0b970cea-2ed4-4a4d-be83-a20e373a220f",
                                                "name":  "jobStatus",
                                                "value":  "={{ $json.originalJobStatus}}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "options":  {

                }
}
```

### Prompt Library

| Field | Value |
| --- | --- |
| Node ID | f1ad4439-3455-42a6-996a-9df097afe820 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4256, 752 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Job Context -> Prompt Library (output 0, input 0)

**Outgoing Connections**

- Prompt Library -> Generator Agent (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const type = $json.documentType;\nconst projectName = $json.projectName;\nconst productOwner = $json.productOwner;\nconst jobId = $json.jobId;\n\nfunction getDocTypeFilter(type) {\n  switch (type) {\n\n    case \"test_strategy\":\n      return [\"BRD\", \"FRD\", \"HLD\", \"LLD\", \"TRANSCRIPT\"];\n\n    case \"test_plan\":\n      return [\"FRD\", \"LLD\", \"HLD\",\"TRANSCRIPT\"];\n\n    case \"test_cases\":\n      return [\"FRD\", \"LLD\", \"UI/UX\",\"TRANSCRIPT\"];\n\n    case \"user_stories\":\n      return [\"BRD\", \"FRD\", \"HLD\", \"LLD\", \"UI/UX\", \"TRANSCRIPT\"];\n\n    case \"risk_matrix\":\n      return [\"HLD\", \"LLD\", \"FRD\"];\n\n    case \"traceability_matrix\":\n      return [\"BRD\", \"FRD\", \"LLD\"];\n\n    default:\n      return [];\n  }\n}\nfunction resolveContentSources() {\n  return [\"text\", \"image\"];\n}\n\nconst contentSources = resolveContentSources(type);\n\nconst compositeKeys = [];\n\nfor (const docType of getDocTypeFilter(type)) {\n  for (const source of contentSources) {\n    compositeKeys.push(`${projectName}|${docType}|${source}`);\n  }\n}\n\nconst promptLibrary = {\n  test_strategy: {\n    title: \"Enterprise Test Strategy\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Strategy\nGenerated On: {{ $now }}\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Manager and Enterprise Test Strategy Consultant with more than 15 years of experience defining testing standards, quality governance frameworks, and automation-first transformation programs. \n\nYou specialize in:\n- Shift-Left \u0026 Shift-Right quality engineering approaches\n- CI/CD-integrated automated testing pipelines\n- Scalable test architecture across UI, API, performance, and security layers\n- Risk-based and metrics-driven software delivery governance\n\nYou excel at interpreting and synthesizing:\n- Business Requirement Documents (BRD)\n- Functional Requirement Documents (FRD)\n- Low-Level and High-Level Designs (LLD \u0026 HLD)\n- Grooming transcripts and stakeholder discussions\n\nYour outputs must demonstrate:\n- Strategic reasoning supported by traceable statements from the provided context\n- A strong linkage between **business intent â†’ architecture/design implications â†’ test strategy â†’ automation enablement â†’ risk mitigation**\n- A structured, enterprise-grade quality strategy suitable for CXO/leadership consumption\n- Deep elaboration, beyond basic bullet points, showing practical execution methodologies, governance layers, and measurable KPIs\n\nYour writing style should reflect:\n- Professional tone suitable for board-level review\n- Detailed, actionable, and solution-oriented content with clear justification\n- Balanced technical and managerial viewpoint\n`,\n    user: `You are provided with a vector store that combines information from BRD, FRD, HLD, LLD, UI/UX specifications, and grooming session transcripts. \nThis content includes requirements, workflows, data flows, system architecture, constraints, dependencies, and stakeholder expectations.\n\nYour task is to analyze and generate a **comprehensive and production-grade Test Strategy document**, aligned with **Shift-Left**, **Automation-First**, and **Quality Engineering** principles.\n\n=========================\nINSTRUCTIONS (MUST FOLLOW)\n=========================\n\n1. Use direct excerpts or paraphrased statements from the source materials where relevant.\n   - Quote key statements in italics or blockquotes to maintain authenticity.\n   - Cite origin using â€œAs mentioned in BRDâ€¦â€, â€œAccording to HLDâ€¦â€, etc.\n2. Provide deep explanation instead of generic bullet lists â€” elaborate how and why decisions are made.\n3. Demonstrate end-to-end traceability between:\n   **business requirements â†’ test strategy â†’ automation enablement â†’ quality metrics â†’ risk \u0026 mitigation**\n4. Include frameworks, methodology, and governance recommendations.\n5. Use tables, matrices, and hierarchical bullet structures where beneficial.\n6. Minimum expected length per major section: **900 â€“ 1500 words**.\n7. The output must be detailed enough to be presented to engineering leadership and auditors.\n\n====================\nDOCUMENT STRUCTURE\n====================\n\n### Test Strategy Document Structure\n\n1. **Introduction \u0026 Context**\n   - Problem statement \u0026 business need\n   - Strategic objectives of testing\n   - Alignment with enterprise quality vision and success criteria\n\n2. **Testing Scope**\n   - In-scope functional \u0026 non-functional areas (with references)\n   - Out-of-scope items \u0026 rationale\n\n3. **Strategic Testing Approach**\n   - Shift-Left adoption strategy\n   - Shift-Right validation strategy (where applicable)\n   - Testing model (Agile / DevOps / CI-CD-based)\n   - Test levels: Unit, Component, API, UI, E2E, UAT, NFR\n   - Governance and quality gates\n\n4. **Automation Strategy \u0026 Roadmap**\n   - Automation pyramid model alignment\n   - Tools, frameworks, CI/CD orchestration\n   - Prioritization matrix \u0026 ROI considerations\n   - In-sprint automation approach\n   - Resilience \u0026 maintainability standards\n\n5. **Test Environment \u0026 Infrastructure Strategy**\n   - Environment model \u0026 provisioning\n   - Service virtualization \u0026 mocks\n   - Data refresh, versioning \u0026 cloning strategies\n\n6. **Test Data Management Strategy**\n   - Data sourcing (synthetic, masked, production-like)\n   - Boundary / negative / chaos data\n   - Automation-driven data pipeline\n\n7. **Quality Metrics \u0026 Reporting Framework**\n   - KPIs, KRAs, SLAs (Defect density, leakage rate, DRE %, automation coverage etc.)\n   - Dashboards \u0026 transparency mechanisms\n\n8. **Risk-Based Testing \u0026 Mitigation Strategy**\n   - Identified risks + corresponding mitigation \u0026 contingency mapping\n   - Priority-based testing means: risk Ã— impact Ã— likelihood scoring\n\n9. **Roles, Collaboration \u0026 RACI Model**\n\n10. **Compliance, Security \u0026 Regulatory Considerations**\n    - OWASP, data privacy, audit logs, adherence requirements\n\n11. **Tooling \u0026 Integration Landscape**\n    - CI/CD, test frameworks, monitoring \u0026 observability\n\n12. **Communication \u0026 Governance Model**\n\n13. **Appendix / Traceability Matrix**\n    | Source Document | Key Insight | Test Strategy Implication | Automation Feasibility |\n`\n  },\n  test_plan: {\n    title: \"Enterprise Test Plan\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Plan\nGenerated On: {{ $now }}\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Manager with over 15 years of experience leading large-scale enterprise testing programs. \nYou specialize in Shift-Left Quality and Automation-First approaches, integrating QA deeply within CI/CD pipelines.\nYou have extensive experience in transforming raw business and technical documentation into actionable, data-driven, and traceable test strategies.\n\nYou are skilled at reading and interpreting:\n- Business Requirement Documents (BRD)\n- Functional Requirement Documents (FRD)\n- Low-Level Designs (LLD)\n- High-Level Designs (HLD)\n- Grooming session transcripts and stakeholder discussions\n\nYour outputs must demonstrate:\n- Analytical reasoning based directly on excerpts or statements from the provided context.\n- A clear connection between **requirement intent**, **test coverage**, **automation feasibility**, and **risk mitigation \u0026 risk contingency**.\n- A focus on measurable, proactive quality metrics, and early defect prevention.\n- Realistic and context-aware alignment with Shift-Left and Automation-First principles.\n`,\n    user: `You are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI specs, and stakeholder discussions via vector search.. It may include requirements, features, workflows, functional and non-functional details, and stakeholder discussions.\n\nYour task is to analyze the provided context carefully and generate a **comprehensive, professional, and context-grounded Test Plan** aligned with Shift-Left and Automation-First principles.\n\n### Instructions:\n1. Use **direct excerpts or paraphrased statements** from the provided context sources wherever applicable. \n   - Quote important phrases in italics or blockquotes to preserve authenticity.\n   - Reference their origin (e.g., â€œAs mentioned in BRDâ€¦â€ or â€œAccording to LLD sectionâ€¦â€).\n2. Demonstrate clear traceability between **requirements â†’ testing objectives â†’ automation approach â†’ risk mitigation \u0026 risk contingency.**\n3. For every key area (test strategy, scope, risks, etc.), link back to **specific project elements or statements** from the input documents.\n4. Use tables or bullet lists where appropriate to make the Test plan readable and well-structured.\n5. Generate detailed, structured, and exhaustive content. Expand on reasoning and provide elaborated explanations rather than short bullet points. Do not compress meaning.\n6. Minimum output length: 700â€“1200 words per section (unless insufficient context exists).\n7. For every claim or statement, reference the originating document (BRD, FRD, HLD, LLD, Transcript).\n\n### Structure the Test Plan as follows:\n1. **Test Strategy** â€“ Include how Shift-Left and Automation-First are embedded. Reference early testing opportunities from the design or grooming stages.\n2. **Scope** â€“ Distinguish in-scope vs. out-of-scope features, based on specific content from the documents.\n3. **Test Objectives** â€“ Mention objectives tied to functional or non-functional requirements.\n4. **Test Deliverables**\n5. **Entry and Exit Criteria**\n6. **Test Schedule and Milestones**\n7. **Risks, Mitigation \u0026 Contingency Plan** â€“ Mention risks cited in the documents or inferred from complexity areas. Also map each risk with Mitigation \u0026 Contigency Plan.\n8. **Test Environment** â€“ Include CI/CD, environment provisioning, and test data setup strategies.\n9. **Tools and Resources** â€“ Reference relevant automation or workflow tools mentioned or implied in the docs.\n10. **Roles and Responsibilities**\n11. **Test Data and Configurations** â€“ Include synthetic data strategy or test coverage automation if applicable.\n12. **Reporting and Communication Plan** â€“ Mention dashboards, metrics, and traceability matrices.\n13. **Suspension \u0026 Resumption Criteria**\n14. **Assumptions \u0026 Dependencies**\n15. **Automation Coverage Matrix**\n16. **Test Coverage Metrics**\n17, **Approval \u0026 Sign-off**\n18. **Appendix (Optional)** â€“ Include a summarized mapping table:\n    | Source Document | Key Excerpt | Related Test Focus Area | Automation Feasibility |\n\nEnsure:\n- The output reads like a **real Test Plan prepared for stakeholders**, not an academic essay.\n- Each section has **specific references** to document content to establish credibility and traceability.\n- The tone is professional, precise, and easy to publish directly as part of QA governance documentation.`\n  },\n  test_cases: {\n    title: \"Enterprise Test Cases\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Cases\nGenerated On: {{ $now }}\nModel: gpt-4o-mini\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Architect with 15+ years of experience designing enterprise-scale, risk-driven, automation-ready test cases.\n\nYou specialize in:\n- Requirement decomposition into test scenarios\n- Boundary \u0026 edge case design\n- Negative testing \u0026 failure modeling\n- API/UI/integration-level validations\n- Automation feasibility optimization\n\nYour outputs must:\n- Demonstrate traceability to retrieved requirements\n- Cover positive, negative, edge, alternate and exception flows\n- Align with automation-first strategy\n- Be production-ready for Jira/TestRail/Xray\n- Include risk tagging and priority classification\n\nAvoid generic test cases. Every case must be context-driven and realistic.\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI specs, and stakeholder discussions via vector search.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Identify distinct functional modules and workflows from the retrieved context.\n2. For each workflow, generate:\n   - Functional test cases\n   - Negative test cases\n   - Boundary value cases\n   - Integration scenarios\n   - Data validation scenarios\n   - Exception handling cases\n3. Each test case must include:\n\n| Test Case ID | Requirement Reference | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Priority | Risk Level | Automation Feasibility |\n\n4. Explicitly reference requirement origin:\n   - â€œAs described in BRD sectionâ€¦â€\n   - â€œAccording to HLD componentâ€¦â€\n5. Tag automation suitability (High / Medium / Low).\n6. Do not summarize â€” generate exhaustive coverage.\n\n========================\nCOVERAGE REQUIREMENTS\n========================\n\n- Minimum 20â€“40 test cases per major feature\n- Include API-level validations if architecture suggests services\n- Include data validation rules if UI forms are mentioned\n- Include failure simulation if integrations exist\n- Include security and performance-related validations if applicable\n\nOutput must be enterprise-grade and execution-ready.\n`\n  },\n  user_stories: {\n  title: \"Agile User Stories\",\n  system: `You are a Senior Product Owner and Business Analyst with 15+ years of experience defining enterprise-scale product requirements using Agile and Scrum frameworks.\n\nYou specialize in translating BRD, FRD, HLD, LLD, and stakeholder discussions into detailed INVEST-compliant Agile User Stories, Acceptance Criteria, Alternate Flows, and Test Scenarios.\n\nRules \u0026 Expectations:\n- Produce a **single structured output** in strict JSON format.\n- Follow a **hierarchical Agile model: Epic â†’ Multiple User Stories**.\n- Each Epic represents a high-level feature.\n- Each Epic MUST contain:\n  - epicId\n  - epicName\n  - epicDescription\n  - businessObjective\n  - successMetrics\n  - sourceTraceability\n\n- Each User Story must contain:\n  - userStoryId\n  - epicId\n  - feature\n  - userStory\n  - userStoryDescription\n  - businessContext\n  - primaryFlow\n  - alternateFlows\n  - exceptionHandling\n  - acceptanceCriteria\n  - uiUxRequirements\n  - fieldValidationRules\n  - dataIntegrationRequirements\n  - performanceNFRs\n  - testScenarios\n  - dependencies\n  - assumptions\n  - sourceTraceability\n  - automationFeasibility\n\n- Use markdown inside JSON string fields where needed.\n- Separate each story with the delimiter: --- USER_STORY_BREAK ---.\n- Ensure the JSON is **well-formed and parsable**.\n\nIMPORTANT:\n- DO NOT restrict to one story per feature.\n- Decompose features into **multiple small, testable, independent stories** wherever needed.\n- Prefer decomposition over large stories.\n\nYour task:\n1. Analyze the provided context from BRD, FRD, HLD, LLD, workflows, and transcripts.\n2. Extract **high-level features and convert them into Epics**.\n3. For each Epic:\n   - Generate a detailed **epicDescription** explaining scope, workflows, and business value.\n4. Dynamically create **one or more user stories per epic** based on complexity.\n5. Ensure **traceability** to source documents.\n6. Make output reusable across projects.`,\n  \n  user: `You are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI/UX specifications, and stakeholder discussions via vector search.\n\nYour task is to generate a single JSON object with the following structure:\n\n{\n  \"epics\": [\n    {\n      \"epicId\": \"EPIC-001\",\n      \"epicName\": \"Feature Name\",\n      \"epicDescription\": \"...\",\n      \"businessObjective\": \"...\",\n      \"successMetrics\": \"...\",\n      \"sourceTraceability\": \"...\"\n    }\n  ],\n  \"userStories\": [\n    {\n      \"userStoryId\": \"US-001\",\n      \"epicId\": \"EPIC-001\",\n      \"feature\": \"Feature Name\",\n      \"userStory\": \"...\",\n      \"userStoryDescription\": \"...\",\n      \"businessContext\": \"...\",\n      \"primaryFlow\": \"...\",\n      \"alternateFlows\": \"...\",\n      \"exceptionHandling\": \"...\",\n      \"acceptanceCriteria\": \"...\",\n      \"uiUxRequirements\": \"...\",\n      \"fieldValidationRules\": \"...\",\n      \"dataIntegrationRequirements\": \"...\",\n      \"performanceNFRs\": \"...\",\n      \"testScenarios\": \"...\",\n      \"dependencies\": \"...\",\n      \"assumptions\": \"...\",\n      \"sourceTraceability\": \"...\",\n      \"automationFeasibility\": \"...\"\n    }\n  ]\n}\n\n========================\nCRITICAL REQUIREMENTS\n========================\n\n1. EPIC GENERATION:\n- Convert each high-level feature into a structured Epic.\n- Provide a **detailed epicDescription** covering:\n  - Functional scope\n  - Key workflows\n  - Business value\n\n2. DYNAMIC STORY GENERATION (MANDATORY):\n- DO NOT generate only one story per epic.\n- Automatically decide number of user stories based on:\n  - Functional decomposition\n  - UI vs API separation\n  - Validation complexity\n  - Integration points\n  - Alternate \u0026 exception flows\n- Create MULTIPLE user stories for complex features.\n- Keep each story small, testable, and independently deliverable (INVEST).\n\n3. USER STORY DEPTH:\n- Each story must include **userStoryDescription** (detailed explanation).\n- Each story should be **concise but complete (200-300 words preferred)**.\n- Focus on clarity, decomposition, and independence rather than verbosity.\n- Include realistic:\n  - UI/UX behavior\n  - Field validations\n  - API/integration logic\n  - Edge cases\n\n4. TRACEABILITY:\n- Reference sources like:\n  - â€œAs mentioned in BRDâ€¦â€\n  - â€œAccording to HLDâ€¦â€\n\n5. FORMAT RULES:\n- Maintain valid JSON (no trailing commas).\n- Keep delimiter:\n--- USER_STORY_BREAK ---\n- Ensure output is parsable by Extract Structured JSON node.\n\n====================\nEPIC SPLITTING RULE:\n====================\n\n- If multiple distinct business capabilities exist, you MUST create multiple epics.\n- Do NOT combine unrelated workflows into a single epic.\n- Each epic should represent a cohesive business capability.\n\n==============================\nMANDATORY DECOMPOSITION RULES:\n==============================\n\nFor EACH Epic, you MUST generate stories across the following dimensions (if applicable):\n\n1. UI Layer Stories\n   - Screen rendering\n   - Form handling\n   - User interactions\n\n2. API / Backend Stories\n   - Data processing\n   - Business logic\n   - Service interactions\n\n3. Validation Stories\n   - Field validations\n   - Business rule validations\n\n4. Integration Stories\n   - External services\n   - Third-party APIs\n   - Event/message flows\n\n5. Error Handling Stories\n   - Failure scenarios\n   - Retry logic\n   - Exception flows\n\n6. Security \u0026 Compliance Stories\n   - Authentication / authorization\n   - Data privacy / masking\n\n7. Performance / NFR Stories\n   - Latency\n   - Scalability\n   - Load handling\n\nMINIMUM:\n- Each Epic must generate AT LEAST 6â€“10 user stories\n- Complex features should generate 10â€“20 stories\n\n====================\nPRIORITIZATION RULE:\n====================\n\n- Prefer generating more stories over longer descriptions if token limits are reached.\n\n=============================\nVALIDATION CHECK (MANDATORY):\n=============================\n\nVALIDATION RULE (STRICT):\n\n- Each Epic MUST have at least 6 user stories.\n- Under no condition should an epic contain fewer than 6 stories.\n- Prefer splitting stories rather than merging.\n\n======================\nEXPECTED OUTPUT SCALE:\n======================\n\n- Small feature: 5â€“8 stories\n- Medium feature: 8â€“15 stories\n- Large feature: 15â€“25 stories\n\nOUTPUT:\n- Return ONLY the final JSON object.\n- No explanations outside JSON.`\n},\n  risk_matrix: {\n    title: \"Risk Assessment Matrix\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Risk Assessment Matrix\nGenerated On: {{ $now }}\nModel: gpt-4o-mini\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior Risk \u0026 Quality Governance Consultant with 15+ years of experience in enterprise delivery risk management.\n\nYou specialize in:\n- Risk-based testing frameworks\n- Failure mode impact analysis (FMEA)\n- Technical \u0026 business risk modeling\n- Delivery risk governance\n- Quantitative scoring models (Probability Ã— Impact Ã— Detectability)\n\nYour output must be suitable for leadership review and audit compliance.\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, transcripts, and architecture documents.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Identify risks across:\n   - Functional complexity\n   - Integration dependencies\n   - Architecture scalability\n   - Security \u0026 compliance\n   - Performance constraints\n   - Data integrity\n   - Environment instability\n   - Delivery timelines\n2. Categorize risks:\n   - Technical Risk\n   - Business Risk\n   - Operational Risk\n   - Security Risk\n3. Use quantitative scoring:\n   - Probability (1â€“5)\n   - Impact (1â€“5)\n   - Risk Score = Probability Ã— Impact\n4. Define:\n   - Mitigation Strategy\n   - Contingency Plan\n   - Risk Owner\n   - Detection Mechanism\n   - Early Warning Indicators\n\n========================\nOUTPUT FORMAT\n========================\n\n| Risk ID | Risk Category | Risk Description | Source Reference | Probability | Impact | Risk Score | Mitigation Plan | Contingency Plan | Owner | Detection Strategy |\n\nThen provide:\n- Risk Heat Map summary\n- Top 5 Critical Risks analysis (detailed narrative)\n- Risk Prioritization Strategy explanation\n- Linkage to Test Strategy alignment\n\nEnsure reasoning is grounded in retrieved content.\n`\n  },\n  traceability_matrix: {\n    title: \"Requirement Traceability Matrix\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Requirement Traceability Matrix\nGenerated On: {{ $now }}\nModel: gpt-4o-mini\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a QA Governance Specialist responsible for end-to-end requirement traceability in large enterprise programs.\n\nYou ensure:\n- 100% requirement coverage\n- Bidirectional traceability\n- Audit-ready documentation\n- Automation coverage mapping\n- Risk mapping integration\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, and transcripts.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Extract all functional and non-functional requirements.\n2. Assign Requirement IDs if not explicitly present.\n3. Map each requirement to:\n   - Related Design Component\n   - Test Scenario ID(s)\n   - Automation Coverage Status\n   - Risk ID (if applicable)\n   - Status (Planned / In Progress / Covered / At Risk)\n4. Identify coverage gaps.\n5. Provide automation coverage percentage.\n\n========================\nOUTPUT FORMAT\n========================\n\n| Req ID | Requirement Description | Source Document | Design Component | Test Case IDs | Automation Status | Risk ID | Coverage Status |\n\nAfter the table, include:\n\n- Coverage Summary Metrics\n- Unmapped Requirement Analysis\n- Automation Coverage Insights\n- Governance \u0026 Audit Readiness Commentary\n\nEnsure traceability statements reference retrieved source context.\n`\n  }\n};\n\nreturn [{\n  json: {\n    ...promptLibrary[type],\n    documentType: type,\n    jobId,\n    projectName: projectName,\n    productOwner: productOwner,\n    docTypeFilter: getDocTypeFilter(type),\n    contentSources: contentSources,\n    compositeKeys: compositeKeys\n  }\n}];"
}
```

### Quality Gate

| Field | Value |
| --- | --- |
| Node ID | 25e3afae-ab2e-472f-b099-d33ed02e3fa5 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -2704, 752 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Validate AI Agent Output -> Quality Gate (output 0, input 0)

**Outgoing Connections**

- Quality Gate -> LOG: Quality Gate Passed (output 0, input 0)
- Quality Gate -> LOG: Quality Gate Failed (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const data = $json;\nconst documentType = $(\u0027Prompt Library\u0027).item.json.documentType;\nconst projectName = $(\u0027Prompt Library\u0027).item.json.projectName;\nconst jobId = data.jobId; \n\nconst rawMarkdown = data.rawMarkdown || \"\";\nconst wordCount = data.wordCount || 0;\n\n// âœ… 1: Minimum word count per document type\nconst MIN_WORD_COUNTS = {\n  test_strategy:       2000,\n  test_plan:           1500,\n  test_cases:          1000,\n  user_stories:        500,   // JSON output â€” lower threshold\n  risk_matrix:         800,\n  traceability_matrix: 800\n};\n\nconst minWords = MIN_WORD_COUNTS[documentType] || 500;\n\nif (wordCount \u003c minWords) {\n  throw new Error(\n    `Quality Gate Failed â€” Word count too low for ${documentType}. ` +\n    `Got ${wordCount} words, minimum is ${minWords}.`\n  );\n}\n\n// âœ… 2: Required section check per document type\nconst REQUIRED_SECTIONS = {\n  test_strategy: [\n    \"Introduction\",\n    \"Scope\",\n    \"Automation\",\n    \"Risk\",\n    \"Metrics\"\n  ],\n  test_plan: [\n    \"Scope\",\n    \"Objectives\",\n    \"Entry\",\n    \"Exit\",\n    \"Risk\"\n  ],\n  test_cases: [\n    \"Test Case\",\n    \"Precondition\",\n    \"Expected\"\n  ],\n  user_stories: [\n    \"epicId\",\n    \"userStoryId\",\n    \"acceptanceCriteria\"\n  ],\n  risk_matrix: [\n    \"Risk\",\n    \"Probability\",\n    \"Impact\",\n    \"Mitigation\"\n  ],\n  traceability_matrix: [\n    \"Req ID\",\n    \"Test Case\",\n    \"Coverage\"\n  ]\n};\n\nconst requiredSections = REQUIRED_SECTIONS[documentType] || [];\nconst missingSections = requiredSections.filter(\n  section =\u003e !rawMarkdown.toLowerCase().includes(section.toLowerCase())\n);\n\nif (missingSections.length \u003e 0) {\n  throw new Error(\n    `Quality Gate Failed â€” Missing required sections for ${documentType}: ` +\n    missingSections.join(\", \")\n  );\n}\n\n// âœ… 3: Traceability check â€” output must reference source documents\nconst TRACEABILITY_MARKERS = [\n  \"brd\", \"frd\", \"hld\", \"lld\",\n  \"as mentioned in\", \"according to\",\n  \"transcript\", \"requirement\"\n];\n\n// Skip traceability check for user_stories (JSON format)\nif (documentType !== \"user_stories\") {\n  const hasTraceability = TRACEABILITY_MARKERS.some(\n    marker =\u003e rawMarkdown.toLowerCase().includes(marker)\n  );\n\n  if (!hasTraceability) {\n    throw new Error(\n      `Quality Gate Failed â€” Output contains no source document references ` +\n      `(BRD, FRD, HLD, LLD etc.) for ${documentType}. ` +\n      `Output may be hallucinated.`\n    );\n  }\n}\n\n// âœ… All checks passed â€” pass data through with quality metadata attached\nconsole.log(`âœ… Quality Gate Passed â€” ${documentType} | Words: ${wordCount} | Project: ${projectName}`);\n\nreturn [\n  {\n    json: {\n      rawMarkdown: data.rawMarkdown,\n      wordCount: data.wordCount,\n      charCount: data.charCount,\n      jobId,\n      qualityGate: {\n        passed: true,\n        documentType,\n        wordCount,\n        minWordCount: minWords,\n        checkedSections: requiredSections,\n        missingSections: [],\n        traceabilityFound: true\n      }\n    }\n  }\n];"
}
```

### Raw Content -> Structured Content

| Field | Value |
| --- | --- |
| Node ID | ff304c13-c609-4128-b177-f3884e40b780 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -2032, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Quality Gate Output -> Raw Content -> Structured Content (output 0, input 0)

**Outgoing Connections**

- Raw Content -> Structured Content -> does user stories exists as Strucutured Data? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const raw = $json.rawMarkdown;\n\n// âœ… Carry forward quality gate metadata from upstream\nconst wordCount = $json.wordCount || 0;\nconst charCount = $json.charCount || 0;\nconst qualityGate = $json.qualityGate || null;\n\ntry {\n  // Step 1: Clean invalid trailing delimiters or junk\n  let cleaned = raw\n    .replace(/--- USER_STORY_BREAK ---/g, \u0027\u0027)\n    .trim();\n\n  // Step 2: Extract ONLY valid JSON (safe guard)\n  const firstBrace = cleaned.indexOf(\u0027{\u0027);\n  const lastBrace = cleaned.lastIndexOf(\u0027}\u0027);\n\n  if (firstBrace !== -1 \u0026\u0026 lastBrace !== -1) {\n    cleaned = cleaned.substring(firstBrace, lastBrace + 1);\n  }\n\n  // Step 3: Parse JSON\n  const parsed = JSON.parse(cleaned);\n\n  return [{\n    json: {\n      rawMarkdown: raw,\n      cleanedJson: cleaned,\n      structuredData: parsed,\n      parsingError: false,\n      // âœ… NEW: carry forward quality metadata\n      wordCount,\n      charCount,\n      qualityGate\n    }\n  }];\n\n} catch (err) {\n  return [{\n    json: {\n      rawMarkdown: raw,\n      structuredData: null,\n      parsingError: true,\n      errorMessage: err.message,\n      // âœ… NEW: carry forward even on parse error\n      wordCount,\n      charCount,\n      qualityGate\n    }\n  }];\n}"
}
```

### Restore Job Context

| Field | Value |
| --- | --- |
| Node ID | 4ce9a981-477c-477e-a0ea-82f93cd3d39a |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -4480, 752 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Log: Job Started -> Restore Job Context (output 0, input 0)

**Outgoing Connections**

- Restore Job Context -> Prompt Library (output 0, input 0)

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
                                                "id":  "c8611c87-8eea-4706-9138-d04de1bf3f6c",
                                                "name":  "jobId",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.jobId }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "ad99579d-fc44-40e8-9215-a2ae5710f254",
                                                "name":  "originalJobStatus",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.originalJobStatus }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "38e38287-d8be-4fc0-b0ed-131578c6c310",
                                                "name":  "projectName",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.projectName }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "2bae1317-75b8-491a-8a1f-0f12ef5d1b89",
                                                "name":  "documentType",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.documentType }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "e302d34d-0468-4085-821c-690b4bb0af93",
                                                "name":  "productOwner",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.productOwner }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "592a34f9-6ea7-48b1-b16e-5a2872d9a6d9",
                                                "name":  "startedAt",
                                                "value":  "={{ $now }}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "options":  {

                }
}
```

### Restore Quality Gate Output

| Field | Value |
| --- | --- |
| Node ID | 1bc5982c-1a14-42c3-913b-c615979d9a47 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -2256, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Quality Gate Passed -> Restore Quality Gate Output (output 0, input 0)

**Outgoing Connections**

- Restore Quality Gate Output -> Raw Content -> Structured Content (output 0, input 0)

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
                                                "id":  "0a317e53-361c-433f-8c01-55ea64ea1c50",
                                                "name":  "rawMarkdown",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.rawMarkdown }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "9fd17686-c1d5-47a3-8f6c-8cc0a4b94539",
                                                "name":  "wordCount",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.wordCount }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "1c88f04e-6a41-47fb-9c63-c86f05e1125e",
                                                "name":  "charCount",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.charCount }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "5d8621f4-e00c-4775-a1bc-c785ec90d3dd",
                                                "name":  "jobId",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.jobId }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "f5b98f2d-3fdf-471b-99dd-1c5fc99b10e8",
                                                "name":  "qualityGate",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.qualityGate }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "e2825570-ca1b-4f11-a965-fffad1b911d8",
                                                "name":  "tokensInput",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.tokensInput }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "380fc2f1-930c-4406-8a48-cb8c25b0c61b",
                                                "name":  "tokensOutput",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.tokensOutput }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "fcfc24f6-dd5b-4f4d-a01e-1670005efebd",
                                                "name":  "tokensTotal",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.tokensTotal }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "99dbc8e5-4bdf-4c4d-9301-487537534fdc",
                                                "name":  "estimatedCostUsd",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.estimatedCostUsd }}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "options":  {

                }
}
```

### Search Epic in JIRA

| Field | Value |
| --- | --- |
| Node ID | 4ed31195-0fdd-494d-b866-081c68a55f8f |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 240, 864 |
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
| Node ID | caca0a16-ab0a-4273-a22d-8531dcdfd3b9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -1184, 1136 |
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
| Node ID | cfc97983-3b15-4656-b1ec-20170a43dc24 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1472, 1328 |
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
| Node ID | a9d781a3-27c9-48eb-9dea-d1ddcd18f961 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 2080, 1120 |
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
| Node ID | 15e8b8c5-c1d0-4369-825b-79ea9b4a4580 |
| Type | n8n-nodes-base.switch |
| Type Version | 3.4 |
| Position | 16, 1152 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Code in JavaScript -> Switch (output 0, input 0)

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
| Node ID | 0bb68a84-6c26-450c-9be7-23794609c3d1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1584, 32 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge2 -> Update existing Document on Confluence (output 0, input 0)

**Outgoing Connections**

- Update existing Document on Confluence -> Version Number > 1? (output 0, input 0)

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

### Update Job Status as Completed

| Field | Value |
| --- | --- |
| Node ID | 319c0602-496d-4987-a302-06130395aa42 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2672, 592 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Confluence Job Completed -> Update Job Status as Completed (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.job_id }}\u0026status=eq.processing ",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\"\n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"completed\",\n  \"output\": {\n    \"confluencePageId\": \"{{ $json.id }}\",\n    \"url\": \"{{ $json._links.base + $json._links.webui }}\"\n  }\n}",
    "options":  {

                }
}
```

### Update Job Status as Completed1

| Field | Value |
| --- | --- |
| Node ID | 97d72d97-b79c-4ee2-9579-8539e6111b6f |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3536, 1440 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: JIRA Job Completed -> Update Job Status as Completed1 (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $node[\"Story Already Exists in JIRA?\"].json.jobId }}\u0026status=eq.processing ",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"completed\",\n  \"output\": {\n    \"stories\": {{ JSON.stringify($json.stories) }},\n\"epics\": {{ JSON.stringify($json.epics) }}\n  }\n}",
    "options":  {

                }
}
```

### Update Job Status as Failed

| Field | Value |
| --- | --- |
| Node ID | 664956ef-3599-41ab-8c95-700d3ba600e4 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2672, 800 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Confluence Job Failed -> Update Job Status as Failed (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.job_id }}\u0026status=eq.processing ",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{  \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"failed\",\n  \"job_id\": \"{{ $json.job_id || $node[\u0027Execute Workflow\u0027].json.job_id }}\",\n  \"error\": {\n    \"message\": \"{{ $json.errorMessage || \u0027Unknown error occurred\u0027 }}\",\n    \"description\": \"{{ $json.errorDescription || \u0027\u0027 }}\",\n    \"node\": \"{{ $node[\u0027Upload Document on Confluence\u0027]?.name || \u0027Unknown Node\u0027 }}\",\n    \"time\": \"{{ new Date().toISOString() }}\"\n  },\n  \"output\": {\n    \"confluencePageId\": null,\n    \"url\": null\n  }\n}",
    "options":  {

                }
}
```

### Update Job Status as Failed1

| Field | Value |
| --- | --- |
| Node ID | 86d32326-7534-4a57-8e6f-d7b80963384d |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -2224, 1152 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Quality Gate Failed -> Update Job Status as Failed1 (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $(\u0027Quality Gate\u0027).item.json.jobId }}\u0026status=eq.processing ",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{  \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"failed\",\n  \"output\": {\n    \"error\": true,\n    \"message\": \"Quality Gate Failed â€” see n8n execution log for details\"\n  },\n  \"updated_at\": \"{{ $now }}\"\n}",
    "options":  {

                }
}
```

### Update Job Status: Generator Agent Failed

| Field | Value |
| --- | --- |
| Node ID | 6891274a-d794-4903-ab8e-e8a8b26c3042 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -3072, 1008 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Generator Agent Failed -> Update Job Status: Generator Agent Failed (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"Prefer\": \"return=representation\"\n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"failed\",\n  \"output\": {\n    \"error\": true,\n    \"errorType\": \"GENERATOR_AGENT_FAILED\",\n    \"message\": \"{{ $json.message }}\",\n    \"failed_at\": \"{{ $json.timestamp }}\"\n  },\n  \"updated_at\": \"{{ $now }}\"\n}",
    "options":  {

                }
}
```

### Upload Document on Confluence

| Field | Value |
| --- | --- |
| Node ID | c36cf2a5-d865-4307-8f19-6d03a3ab1ae5 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1040, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Page Exists? -> Upload Document on Confluence (output 1, input 0)

**Outgoing Connections**

- Upload Document on Confluence -> Document uploaded Successfully on Confluence? (output 0, input 0)

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
                                                  "value":  "={{ $json.documentType\n    .replace(/_/g, \u0027 \u0027)\n    .replace(/\\b\\w/g, c =\u003e c.toUpperCase())\n}} - {{ $json.projectName }}"
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
| Node ID | 70c5671d-1732-4ba4-9f87-f8e6242e0991 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -2960, 752 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Generator Agent -> Validate AI Agent Output (output 0, input 0)

**Outgoing Connections**

- Validate AI Agent Output -> Quality Gate (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Detect AI output safely across all n8n versions\n\nlet text = \"\";\nlet tokensInput = 0;\nlet tokensOutput = 0;\n\n// Case 1: Newer n8n format\nif ($json.output_text) {\n  text = $json.output_text;\n}\n\n// Case 2: Direct string output\nelse if (typeof $json.output === \"string\") {\n  text = $json.output;\n}\n\n// Case 3: Array structured output\nelse if ($json.output?.[0]?.content?.[0]?.text) {\n  text = $json.output[0].content[0].text;\n}\n\n// Case 4: message.content format\nelse if ($json.message?.content) {\n  text = $json.message.content;\n}\n\n// âœ… Extract token usage from agent output\n// n8n agent node exposes usage in different locations depending on version\ntokensInput  = $json.usage?.prompt_tokens ||\n               $json.usage?.input_tokens ||\n               $json.llmUsage?.promptTokens || 0;\n\ntokensOutput = $json.usage?.completion_tokens ||\n               $json.usage?.output_tokens ||\n               $json.llmUsage?.completionTokens || 0;\n\n// If still empty, throw real debug info\nif (!text || text.trim().length \u003c 50) {\n  throw new Error(\"AI returned unexpected structure: \" + JSON.stringify($json));\n}\n\nif (!text || text.trim().length \u003c 50) {\n  throw new Error(\"RETRY_AI\");\n}\n\nconst wordCount = text.trim().split(/\\s+/).length;\nconst charCount = text.trim().length;\nconst jobId = $(\u0027Prompt Library\u0027).item.json.jobId;\n\n// GPT-4.1-mini pricing (as of 2025): $0.40/1M input, $1.60/1M output\nconst INPUT_COST_PER_TOKEN  = 0.40 / 1_000_000;\nconst OUTPUT_COST_PER_TOKEN = 1.60 / 1_000_000;\nconst estimatedCostUsd = (tokensInput * INPUT_COST_PER_TOKEN) + \n                         (tokensOutput * OUTPUT_COST_PER_TOKEN);\n\n\n\nreturn [\n  {\n    json: {\n      rawMarkdown: text,\n      wordCount,\n      charCount,\n      jobId,\n      tokensInput,\n      tokensOutput,\n      tokensTotal: tokensInput + tokensOutput,\n      estimatedCostUsd: parseFloat(estimatedCostUsd.toFixed(6))\n    }\n  }\n];\n"
}
```

### Version Number > 1?

| Field | Value |
| --- | --- |
| Node ID | b4f358e6-d1f3-46e6-b2d8-dca327c7e7b1 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1856, 32 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Update existing Document on Confluence -> Version Number > 1? (output 0, input 0)

**Outgoing Connections**

- Version Number > 1? -> Merge7 (output 0, input 0)

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
                                              "id":  "2bd69045-205f-439c-8b09-93f7396a0ebe",
                                              "leftValue":  "={{ $json.version.number }}",
                                              "rightValue":  1,
                                              "operator":  {
                                                               "type":  "number",
                                                               "operation":  "gt"
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

### When Executed by Another Workflow

| Field | Value |
| --- | --- |
| Node ID | 8323812a-0549-45ae-a9e8-5e10f7422e4a |
| Type | n8n-nodes-base.executeWorkflowTrigger |
| Type Version | 1.1 |
| Position | -5040, 528 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- When Executed by Another Workflow -> Merge (output 0, input 0)
- When Executed by Another Workflow -> Merge8 (output 0, input 1)
- When Executed by Another Workflow -> Log: Job Started (output 0, input 0)

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
