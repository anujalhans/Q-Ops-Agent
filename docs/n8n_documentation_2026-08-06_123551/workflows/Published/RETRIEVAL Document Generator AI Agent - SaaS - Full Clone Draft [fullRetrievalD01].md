# RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | fullRetrievalD01 |
| Active | True |
| Created At | 2026-05-07T16:29:29.537Z |
| Updated At | 2026-06-11T08:03:39.016Z |
| Node Count | 67 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft [fullRetrievalD01].json |

## Description

Full inactive clone of the production retrieval document generator with worker-side attribution/runtime-config changes. Production workflow remains untouched.

## Trigger And Entry Contract

- When Executed by Another Workflow | n8n-nodes-base.executeWorkflowTrigger

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
- httpCustomAuth: supabase-service-role-key
- jiraSoftwareCloudApi: Jira SW Cloud account
- openAiApi: OpenAi Paid Account (Aonu)

## Connection Graph

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
- Version Number > 1? -> Merge6 (source output 1, target input 1)
- Document uploaded Successfully on Confluence? -> Merge5 (source output 0, target input 1)
- Document uploaded Successfully on Confluence? -> Merge6 (source output 1, target input 1)
- Merge8 -> Code in JavaScript (source output 0, target input 0)
- Code in JavaScript -> Switch (source output 0, target input 0)
- Create User Stories in JIRA1 -> Edit Fields1 (source output 0, target input 0)
- Merge9 -> Code in JavaScript1 (source output 0, target input 0)
- Code in JavaScript1 -> LOG: JIRA Job Completed (source output 0, target input 0)
- Code in JavaScript1 -> Update Job Status as Completed1 (source output 0, target input 0)
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
    "jsCode":  "function generateId(epicName, story) {\n  const str = epicName + JSON.stringify(story.userStory);\n\n  let hash = 0;\n  for (let i = 0; i \u003c str.length; i++) {\n    const char = str.charCodeAt(i);\n    hash = ((hash \u003c\u003c 5) - hash) + char;\n    hash |= 0; // Convert to 32bit int\n  }\n\n  return \"ID_\" + Math.abs(hash);\n}\n\nconst output = [];\n\nconst existingEpics = $json.existingEpics || [];\nconst missingEpics = $json.missingEpics || [];\n\n// Helper to extract epic-level fields (excluding userStories)\nfunction extractEpicMeta(epic) {\n  const { userStories, ...epicMeta } = epic;\n  return epicMeta;\n}\n\n// ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Existing Epics\nexistingEpics.forEach(epic =\u003e {\n  const epicMeta = extractEpicMeta(epic);\n\n  (epic.userStories || []).forEach(story =\u003e {\n    output.push({\n      json: {\n        ...epicMeta,   // ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ includes epicDescription, businessObjective, etc.\n        idempotencyKey: generateId(epic.epicName, story),\n        ...story,\n        epicExists: true\n      }\n    });\n  });\n});\n\n// ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Missing Epics\nmissingEpics.forEach(epic =\u003e {\n  const epicMeta = extractEpicMeta(epic);\n\n  (epic.userStories || []).forEach(story =\u003e {\n    output.push({\n      json: {\n        ...epicMeta,   // ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ includes all epic-level fields\n        idempotencyKey: generateId(epic.epicName, story),\n        ...story,\n        epicExists: false\n      }\n    });\n  });\n});\n\nreturn output;"
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
    "url":  "={{ String((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).confluenceBaseUrl || \u0027https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, \u0027\u0027) + \u0027/rest/api/content?spaceKey=\u0027 + encodeURIComponent(((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).confluenceSpaceKey || \u0027TD\u0027)) +  \u0027\u0026title=\u0027 + encodeURIComponent($json.documentType.replace(/_/g, \u0027 \u0027).replace(/\\b\\w/g, c =\u003e c.toUpperCase()) + \u0027 - \u0027 + $json.projectName) }}",
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

- None

**Outgoing Connections**

- None

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
    "toolDescription":  "Retrieves project-specific chunks from Chroma for Confluence QA document generation. The hard metadata filter is project. The generator must deduplicate by chunkId, ignore metadata-only page content, maintain source diversity, and cite only exact retrieved evidence with chunkId.",
    "authentication":  "chromaCloudApi",
    "chromaCollection":  {
                             "__rl":  true,
                             "value":  "={{ $(\u0027Prompt Library\u0027).item.json.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027 }}",
                             "mode":  "id",
                             "cachedResultName":  "runtime-configured collection"
                         },
    "topK":  "={{ Math.min(Number($(\u0027Prompt Library\u0027).item.json.configSnapshot?.chroma?.topK || 20), 12) }}",
    "options":  {
                    "metadata":  {
                                     "metadataValues":  [
                                                            {
                                                                "name":  "project",
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
- Code in JavaScript1 -> Update Job Status as Completed1 (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\n\nconst stories = [];\nconst epicsMap = {};\n\nitems.forEach(item =\u003e {\n  const data = item.json;\n\n  if (data.storyid \u0026\u0026 data.storykey \u0026\u0026 data.storylink) {\n    stories.push({\n      storyID: data.storyid,\n      storyKey: data.storykey,\n      storyLink: data.storylink\n    });\n  }\n\n  if (data.epicid \u0026\u0026 data.epickey) {\n    const epicKey = data.epickey;\n\n    if (!epicsMap[epicKey]) {\n      epicsMap[epicKey] = {\n        epicID: data.epicid,\n        epicKey: data.epickey,\n        epicLink: data.epicklink\n      };\n    }\n  }\n});\n\nconst firstJson = items[0]?.json || {};\nconst context = ($items(\u0027Restore Job Context\u0027)[0] || {}).json || {};\nconst quality = ($items(\u0027Restore Quality Gate Output\u0027)[0] || {}).json || {};\nconst prompt = ($items(\u0027Prompt Library\u0027)[0] || {}).json || {};\n\nreturn [\n  {\n    json: {\n      jobId: firstJson.jobId || context.jobId || null,\n      projectName: firstJson.projectName || context.projectName || prompt.projectName || null,\n      documentType: firstJson.documentType || context.documentType || prompt.documentType || \u0027user_stories\u0027,\n      projectId: context.projectId || null,\n      requestedBy: context.requestedBy || null,\n      settingsVersion: context.settingsVersion || null,\n      environmentKey: context.environmentKey || \u0027local\u0027,\n      generationModel: context.configSnapshot?.models?.generationModel || \u0027gpt-4.1-mini\u0027,\n      chromaCollection: context.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027,\n      startedAt: context.startedAt || new Date().toISOString(),\n      wordCount: parseInt(quality.wordCount, 10) || 0,\n      tokensInput: Number(quality.tokensInput) || 0,\n      tokensOutput: Number(quality.tokensOutput) || 0,\n      tokensTotal: Number(quality.tokensTotal) || 0,\n      estimatedCostUsd: Number(quality.estimatedCostUsd) || 0,\n      tokenUsageSource: quality.tokenUsage?.source || \u0027estimated\u0027,\n      stories,\n      epics: Object.values(epicsMap)\n    }\n  }\n];"
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
    "jsCode":  "const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\nconst prompt = $(\u0027Prompt Library\u0027).item.json || {};\nconst restore = $(\u0027Restore Job Context\u0027).item.json || {};\n\nlet md = String($json.cleanedMarkdown || $json.rawMarkdown || \u0027\u0027);\n\nconst normalizeDocumentType = (value) =\u003e String(value || \u0027\u0027)\n  .trim()\n  .toLowerCase()\n  .replace(/[^a-z0-9]+/g, \u0027_\u0027)\n  .replace(/^_+|_+$/g, \u0027\u0027);\n\nconst documentType = normalizeDocumentType(prompt.documentType || q.documentType || $json.documentType);\nconst sharedTypes = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027];\nconst isShared = sharedTypes.includes(documentType);\nconst requestedMode = String(prompt.generationMode || q.generationMode || restore.generationMode || restore.input?.generationMode || \u0027\u0027).trim().toLowerCase();\nconst retryOfJobId = prompt.retryOfJobId || restore.retryOfJobId || restore.input?.retryOfJobId || restore.input?.retryJobId || \u0027\u0027;\nconst isUpdate = requestedMode === \u0027update\u0027;\nconst operationMode = isUpdate\n  ? (retryOfJobId ? \u0027update_retry\u0027 : (prompt.updateContext?.previousCoverageSummary?.gateStatus === \u0027warning\u0027 ? \u0027update_repair\u0027 : \u0027update_delta\u0027))\n  : (retryOfJobId || requestedMode === \u0027retry\u0027 ? \u0027create_retry\u0027 : \u0027create\u0027);\n\nconst escapeHtml = (value) =\u003e String(value === undefined || value === null ? \u0027\u0027 : value)\n  .replace(/\u0026/g, \u0027\u0026amp;\u0027)\n  .replace(/\u003c/g, \u0027\u0026lt;\u0027)\n  .replace(/\u003e/g, \u0027\u0026gt;\u0027)\n  .replace(/\"/g, \u0027\u0026quot;\u0027)\n  .replace(/\u0027/g, \u0027\u0026#39;\u0027);\n\nconst stripTags = (html) =\u003e String(html || \u0027\u0027)\n  .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n  .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n  .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n  .replace(/\\s+/g, \u0027 \u0027)\n  .trim();\n\nconst sectionKey = (value) =\u003e String(value || \u0027\u0027)\n  .replace(/^\\s*\\d+[.)-]?\\s*/, \u0027\u0027)\n  .replace(/^appendix\\s*\\/\\s*/i, \u0027\u0027)\n  .toLowerCase()\n  .replace(/\u0026/g, \u0027 and \u0027)\n  .replace(/[^a-z0-9]+/g, \u0027 \u0027)\n  .trim();\n\nconst canonicalSections = {\n  test_strategy: [\n    \u0027Introduction \u0026 Context\u0027,\n    \u0027Testing Scope\u0027,\n    \u0027Strategic Testing Approach\u0027,\n    \u0027Automation Strategy \u0026 Roadmap\u0027,\n    \u0027Test Environment \u0026 Infrastructure Strategy\u0027,\n    \u0027Test Data Management Strategy\u0027,\n    \u0027Quality Metrics \u0026 Reporting Framework\u0027,\n    \u0027Risk-Based Testing \u0026 Mitigation Strategy\u0027,\n    \u0027Roles, Collaboration \u0026 RACI Model\u0027,\n    \u0027Compliance, Security \u0026 Regulatory Considerations\u0027,\n    \u0027Tooling \u0026 Integration Landscape\u0027,\n    \u0027Communication \u0026 Governance Model\u0027,\n    \u0027Coverage Ledger\u0027\n  ],\n  test_plan: [\n    \u0027Test Strategy\u0027,\n    \u0027Scope\u0027,\n    \u0027Test Objectives\u0027,\n    \u0027Test Deliverables\u0027,\n    \u0027Entry and Exit Criteria\u0027,\n    \u0027Test Schedule and Milestones\u0027,\n    \u0027Risks, Mitigation \u0026 Contingency Plan\u0027,\n    \u0027Test Environment\u0027,\n    \u0027Tools and Resources\u0027,\n    \u0027Roles and Responsibilities\u0027,\n    \u0027Test Data and Configurations\u0027,\n    \u0027Reporting and Communication Plan\u0027,\n    \u0027Suspension \u0026 Resumption Criteria\u0027,\n    \u0027Assumptions \u0026 Dependencies\u0027,\n    \u0027Automation Coverage Matrix\u0027,\n    \u0027Test Coverage Metrics\u0027,\n    \u0027Approval \u0026 Sign-off\u0027,\n    \u0027Coverage Ledger\u0027\n  ],\n  risk_matrix: [\n    \u0027Executive Summary\u0027,\n    \u0027Risk Register Summary\u0027,\n    \u0027Risk Detail Register\u0027,\n    \u0027Risk Heat Map Summary\u0027,\n    \u0027Top Critical Risks Analysis\u0027,\n    \u0027Risk Prioritization Strategy Explanation\u0027,\n    \u0027Linkage to Test Strategy Alignment\u0027,\n    \u0027Coverage Ledger\u0027\n  ]\n};\n\nfunction convertLooseHtmlLists(html) {\n  const lines = String(html || \u0027\u0027).replace(/\u003cbr\\s*\\/?\u003e/gi, \u0027\\n\u0027).split(/\\n/);\n  const output = [];\n  let listType = null;\n\n  const closeList = () =\u003e {\n    if (listType) {\n      output.push(\u0027\u003c/\u0027 + listType + \u0027\u003e\u0027);\n      listType = null;\n    }\n  };\n\n  const appendToPreviousItem = (text) =\u003e {\n    const lastIndex = output.length - 1;\n    if (lastIndex \u003e= 0 \u0026\u0026 /^\u003cli\u003e[\\s\\S]*\u003c\\/li\u003e$/.test(output[lastIndex])) {\n      output[lastIndex] = output[lastIndex].replace(/\u003c\\/li\u003e$/, \u0027 \u0027 + text.trim() + \u0027\u003c/li\u003e\u0027);\n      return true;\n    }\n    return false;\n  };\n\n  for (const rawLine of lines) {\n    const line = String(rawLine || \u0027\u0027);\n    const trimmed = line.trim();\n    const unordered = line.match(/^\\s*[-*]\\s+(.+)$/);\n    const ordered = line.match(/^\\s*\\d+[.)]\\s+(.+)$/);\n\n    if (unordered || ordered) {\n      const nextType = ordered ? \u0027ol\u0027 : \u0027ul\u0027;\n      if (listType !== nextType) {\n        closeList();\n        output.push(\u0027\u003c\u0027 + nextType + \u0027\u003e\u0027);\n        listType = nextType;\n      }\n      output.push(\u0027\u003cli\u003e\u0027 + (unordered ? unordered[1] : ordered[1]).trim() + \u0027\u003c/li\u003e\u0027);\n      continue;\n    }\n\n    if (listType \u0026\u0026 trimmed \u0026\u0026 !/^\u003c\\/?(?:h[1-6]|table|tbody|tr|td|th|ul|ol|li)\\b/i.test(trimmed)) {\n      if (appendToPreviousItem(trimmed)) continue;\n    }\n\n    closeList();\n    if (output.length \u0026\u0026 trimmed) output.push(\u0027\u003cbr/\u003e\u0027);\n    output.push(line);\n  }\n\n  closeList();\n  return output.join(\u0027\u0027);\n}\n\nconst sanitizeSourceMetadata = (value) =\u003e convertLooseHtmlLists(String(value || \u0027\u0027)\n  .replace(/Existing Confluence content below was preserved unless explicitly updated in the delta summary\\.?/gi, \u0027\u0027)\n  .replace(/Evidence review required:\\s*missing concrete chunkId/gi, \u0027Evidence review required: supporting source detail needs reviewer confirmation\u0027)\n  .replace(/missing concrete chunkId/gi, \u0027supporting evidence needs reviewer confirmation\u0027)\n  .replace(/(chunkIds?\\s*:\\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\\s*\\|\\s*\\d+\\s*){1,4}\\|\\s*(?:table|text|image|metadata)\\s*\\|?/gi, \u0027\u0027)\n  .replace(/(chunkIds?\\s*:\\s*[A-Za-z0-9_.:-]{12,})(?:\\s*\\|\\s*\\d+\\s*){1,4}\\|\\s*(?:table|text|image|metadata)\\s*\\|?/gi, \u0027\u0027)\n  .replace(/\\s*\\|\\s*(?:table|text|image|metadata)\\s*\\|\\s*/gi, \u0027 - \u0027)\n  .replace(/\\s*(?:[-–—]\\s*)?chunkIds?\\s*:\\s*[A-Za-z0-9_.:-]{8,}(?:\\s*[-–—,;])?/gi, \u0027 \u0027)\n  .replace(/\\s*\\(\\s*\\)/g, \u0027\u0027)\n  .replace(/[ \\t]{2,}/g, \u0027 \u0027)\n  .replace(/\\s+([,.;:])/g, \u0027$1\u0027)\n  .trim());\n\nfunction splitMarkdownRow(line) {\n  return sanitizeSourceMetadata(line)\n    .trim()\n    .replace(/^\\|/, \u0027\u0027)\n    .replace(/\\|$/, \u0027\u0027)\n    .split(\u0027|\u0027)\n    .map(cell =\u003e cell.trim());\n}\n\nfunction isSeparatorRow(line) {\n  return /^\\s*\\|?\\s*:?-{3,}:?\\s*(\\|\\s*:?-{3,}:?\\s*)+\\|?\\s*$/.test(String(line || \u0027\u0027));\n}\n\nfunction normalizeCells(cells, headers) {\n  const headerCount = headers.length;\n  if (!headerCount) return cells;\n  if (cells.length === headerCount) return cells;\n  const headerLabels = headers.map(header =\u003e String(header || \u0027\u0027).toLowerCase());\n  const sourceIndex = headerLabels.findIndex(label =\u003e /source\\s+reference|source\\s+document|source/.test(label));\n  if (sourceIndex \u003e= 0 \u0026\u0026 cells.length \u003e headerCount) {\n    const semanticTailCount = Math.max(0, headerCount - sourceIndex - 1);\n    const prefix = cells.slice(0, sourceIndex);\n    const suffix = semanticTailCount ? cells.slice(-semanticTailCount) : [];\n    const sourceCells = cells.slice(sourceIndex, cells.length - semanticTailCount);\n    const repaired = [...prefix, sourceCells.filter(Boolean).join(\u0027 - \u0027), ...suffix];\n    if (repaired.length === headerCount) return repaired;\n  }\n  if (cells.length \u003e headerCount) {\n    return [...cells.slice(0, headerCount - 1), cells.slice(headerCount - 1).filter(Boolean).join(\u0027 - \u0027)];\n  }\n  const padded = cells.slice(0, headerCount);\n  while (padded.length \u003c headerCount) padded.push(\u0027Not provided\u0027);\n  return padded;\n}\n\nfunction convertMarkdownTables(source) {\n  const lines = String(source || \u0027\u0027).split(/\\r?\\n/);\n  const output = [];\n  for (let i = 0; i \u003c lines.length; i += 1) {\n    const line = lines[i];\n    const next = lines[i + 1] || \u0027\u0027;\n    if (line.includes(\u0027|\u0027) \u0026\u0026 isSeparatorRow(next)) {\n      const tableLines = [line, next];\n      i += 2;\n      while (i \u003c lines.length \u0026\u0026 lines[i].includes(\u0027|\u0027) \u0026\u0026 !/^#{1,6}\\s+/.test(lines[i].trim())) {\n        tableLines.push(lines[i]);\n        i += 1;\n      }\n      i -= 1;\n      const headers = splitMarkdownRow(tableLines[0]).filter(Boolean);\n      const rows = tableLines\n        .slice(2)\n        .map(row =\u003e normalizeCells(splitMarkdownRow(row), headers))\n        .filter(cells =\u003e cells.some(cell =\u003e String(cell || \u0027\u0027).trim()));\n      const table = [\n        \u0027\u003ctable\u003e\u003ctbody\u003e\u003ctr\u003e\u0027,\n        headers.map(header =\u003e \u0027\u003cth\u003e\u0027 + escapeHtml(header) + \u0027\u003c/th\u003e\u0027).join(\u0027\u0027),\n        \u0027\u003c/tr\u003e\u0027,\n        rows.map(cells =\u003e \u0027\u003ctr\u003e\u0027 + cells.map(cell =\u003e \u0027\u003ctd\u003e\u0027 + escapeHtml(cell || \u0027Not provided\u0027) + \u0027\u003c/td\u003e\u0027).join(\u0027\u0027) + \u0027\u003c/tr\u003e\u0027).join(\u0027\u0027),\n        \u0027\u003c/tbody\u003e\u003c/table\u003e\u0027\n      ].join(\u0027\u0027);\n      output.push(table);\n    } else {\n      output.push(line);\n    }\n  }\n  return output.join(\u0027\\n\u0027);\n}\n\nfunction convertMarkdownLists(source) {\n  const lines = String(source || \u0027\u0027).split(/\\r?\\n/);\n  const output = [];\n  let listType = null;\n\n  const closeList = () =\u003e {\n    if (listType) {\n      output.push(\u0027\u003c/\u0027 + listType + \u0027\u003e\u0027);\n      listType = null;\n    }\n  };\n\n  const appendToPreviousItem = (text) =\u003e {\n    const lastIndex = output.length - 1;\n    if (lastIndex \u003e= 0 \u0026\u0026 /^\u003cli\u003e[\\s\\S]*\u003c\\/li\u003e$/.test(output[lastIndex])) {\n      output[lastIndex] = output[lastIndex].replace(/\u003c\\/li\u003e$/, \u0027 \u0027 + text.trim() + \u0027\u003c/li\u003e\u0027);\n      return true;\n    }\n    return false;\n  };\n\n  for (const rawLine of lines) {\n    const line = String(rawLine || \u0027\u0027);\n    const trimmed = line.trim();\n    const unordered = line.match(/^\\s*[-*]\\s+(.+)$/);\n    const ordered = line.match(/^\\s*\\d+[.)]\\s+(.+)$/);\n\n    if (unordered || ordered) {\n      const nextType = ordered ? \u0027ol\u0027 : \u0027ul\u0027;\n      if (listType !== nextType) {\n        closeList();\n        output.push(\u0027\u003c\u0027 + nextType + \u0027\u003e\u0027);\n        listType = nextType;\n      }\n      output.push(\u0027\u003cli\u003e\u0027 + (unordered ? unordered[1] : ordered[1]).trim() + \u0027\u003c/li\u003e\u0027);\n      continue;\n    }\n\n    if (listType \u0026\u0026 trimmed \u0026\u0026 !/^\u003c\\/?(?:h[1-6]|table|tbody|tr|td|th|ul|ol|li)\\b/i.test(trimmed) \u0026\u0026 !/^#{1,6}\\s+/.test(trimmed)) {\n      if (appendToPreviousItem(trimmed)) continue;\n    }\n\n    closeList();\n    output.push(line);\n  }\n\n  closeList();\n  return output.join(\u0027\\n\u0027);\n}\n\nfunction markdownToHtml(source) {\n  let html = sanitizeSourceMetadata(String(source || \u0027\u0027).replace(/\u003cbr\\s*\\/?\u003e/gi, \u0027\\n\u0027))\n    .replace(/\u003cbr\\s*\\/?\u003e/gi, \u0027\\n\u0027)\n    .replace(/\\x60\\x60\\x60markdown/gi, \u0027\u0027)\n    .replace(/\\x60\\x60\\x60/g, \u0027\u0027)\n    .replace(/^[-_]{3,}$/gm, \u0027\u0027);\n  html = convertMarkdownTables(html);\n  html = convertMarkdownLists(html);\n  html = html\n    .replace(/^### (.*$)/gim, \u0027\u003ch3\u003e$1\u003c/h3\u003e\u003cbr/\u003e\u0027)\n    .replace(/^## (.*$)/gim, \u0027\u003ch2\u003e$1\u003c/h2\u003e\u003cbr/\u003e\u0027)\n    .replace(/^# (.*$)/gim, \u0027\u003ch1\u003e$1\u003c/h1\u003e\u003cbr/\u003e\u0027)\n    .replace(/\\*\\*(.*?)\\*\\*/gim, \u0027\u003cstrong\u003e$1\u003c/strong\u003e\u0027)\n    .replace(/\\*(.*?)\\*/gim, \u0027\u003cem\u003e$1\u003c/em\u003e\u0027)\n    .replace(/\\n/g, \u0027\u003cbr/\u003e\u0027)\n    .replace(/(\u003cbr\\/\u003e\\s*){2,}/g, \u0027\u003cbr/\u003e\u0027)\n    .replace(/(\u003c\\/table\u003e)\\s*\\|+\\s*(?=\u003ch[1-6]\\b|$)/gi, \u0027$1\u0027)\n    .replace(/\u003ch[1-6][^\u003e]*\u003e\\s*End of document\\.\\s*\u003c\\/h[1-6]\u003e\\s*$/i, \u0027\u0027);\n  return html;\n}\n\nfunction sanitizeConfluenceStorageHtml(input) {\n  let html = String(input || \u0027\u0027);\n\n  // Confluence Cloud Fabric rejects custom extension-like wrappers and styled storage fragments.\n  // Keep the user-visible document content, but reduce the body to plain storage-safe HTML.\n  html = html\n    .replace(/\u003c!--\\s*QOPS_[\\s\\S]*?--\u003e/gi, \u0027\u0027)\n    .replace(/\u003cdiv\\b[^\u003e]*data-qops-[^\u003e]*\u003e/gi, \u0027\u0027)\n    .replace(/\u003cdiv\\b[^\u003e]*\u003e/gi, \u0027\u0027)\n    .replace(/\u003c\\/div\u003e/gi, \u0027\u0027)\n    .replace(/\u003cspan\\b[^\u003e]*\u003e/gi, \u0027\u0027)\n    .replace(/\u003c\\/span\u003e/gi, \u0027\u0027)\n    .replace(/\\s(?:style|class|id|data-[a-z0-9_-]+)=(\"[^\"]*\"|\u0027[^\u0027]*\u0027|[^\\s\u003e]+)/gi, \u0027\u0027)\n    .replace(/\u003c\\/?font\\b[^\u003e]*\u003e/gi, \u0027\u0027)\n    .replace(/\u003cscript\\b[\\s\\S]*?\u003c\\/script\u003e/gi, \u0027\u0027)\n    .replace(/\u003ciframe\\b[\\s\\S]*?\u003c\\/iframe\u003e/gi, \u0027\u0027)\n    .replace(/\u003cobject\\b[\\s\\S]*?\u003c\\/object\u003e/gi, \u0027\u0027)\n    .replace(/\u003cembed\\b[\\s\\S]*?\u003c\\/embed\u003e/gi, \u0027\u0027)\n    .replace(/\u003cac:structured-macro\\b[\\s\\S]*?\u003c\\/ac:structured-macro\u003e/gi, \u0027\u0027)\n    .replace(/\u003cac:adf-extension\\b[\\s\\S]*?\u003c\\/ac:adf-extension\u003e/gi, \u0027\u0027)\n    .replace(/\u003cac:extension\\b[\\s\\S]*?\u003c\\/ac:extension\u003e/gi, \u0027\u0027)\n    .replace(/\u003c\\/?ac:[^\u003e]+\u003e/gi, \u0027\u0027)\n    .replace(/\u003c\\/?ri:[^\u003e]+\u003e/gi, \u0027\u0027)\n    .replace(/(\u003cbr\\s*\\/?\u003e\\s*){3,}/gi, \u0027\u003cbr/\u003e\u003cbr/\u003e\u0027);\n\n  return html.trim();\n}\n\nfunction normalizeCellText(html) {\n  return stripTags(html).replace(/\\\\+/g, \u0027\u0027).replace(/\\s+/g, \u0027 \u0027).trim();\n}\n\nfunction normalizeTablesForConfluence(html) {\n  return String(html || \u0027\u0027).replace(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/gi, (table) =\u003e {\n    const rows = [...table.matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (!rows.length) return table;\n    const header = rows.find(row =\u003e /\u003cth\\b/i.test(row)) || rows[0];\n    const headerCells = [...header.matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/t[hd]\u003e/gi)].map(match =\u003e match[0]);\n    const headerLabels = headerCells.map(normalizeCellText);\n    const headerCount = headerCells.length;\n    if (!headerCount) return table;\n    return table.replace(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi, (row) =\u003e {\n      if (row === header || /\u003cth\\b/i.test(row)) return row;\n      const cells = [...row.matchAll(/\u003ctd\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/td\u003e/gi)].map(match =\u003e match[0]);\n      if (!cells.length || cells.length === headerCount) return row;\n      const sourceIndex = headerLabels.findIndex(label =\u003e /source\\s+reference|source\\s+document|source/i.test(label));\n      if (sourceIndex \u003e= 0 \u0026\u0026 cells.length \u003e headerCount) {\n        const semanticTailCount = Math.max(0, headerCount - sourceIndex - 1);\n        const prefix = cells.slice(0, sourceIndex);\n        const suffix = semanticTailCount ? cells.slice(-semanticTailCount) : [];\n        const sourceCells = cells.slice(sourceIndex, cells.length - semanticTailCount);\n        const sourceValue = sourceCells.map(normalizeCellText).filter(Boolean).join(\u0027 - \u0027);\n        const repaired = [...prefix, \u0027\u003ctd\u003e\u0027 + escapeHtml(sourceValue || \u0027Not provided\u0027) + \u0027\u003c/td\u003e\u0027, ...suffix];\n        if (repaired.length === headerCount) return \u0027\u003ctr\u003e\u0027 + repaired.join(\u0027\u0027) + \u0027\u003c/tr\u003e\u0027;\n      }\n      const values = cells.map(normalizeCellText);\n      const fixed = normalizeCells(values, headerLabels).map(cell =\u003e \u0027\u003ctd\u003e\u0027 + escapeHtml(cell || \u0027Not provided\u0027) + \u0027\u003c/td\u003e\u0027);\n      return \u0027\u003ctr\u003e\u0027 + fixed.join(\u0027\u0027) + \u0027\u003c/tr\u003e\u0027;\n    });\n  });\n}\n\nfunction tableShapeIssues(html) {\n  const issues = [];\n  String(html || \u0027\u0027).replace(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/gi, (table, offset) =\u003e {\n    const rows = [...table.matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    const header = rows.find(row =\u003e /\u003cth\\b/i.test(row)) || rows[0];\n    const expected = (header.match(/\u003cth\\b[^\u003e]*\u003e/gi) || []).length || (header.match(/\u003ctd\\b[^\u003e]*\u003e/gi) || []).length;\n    if (!expected) return table;\n    rows.forEach((row, index) =\u003e {\n      if (row === header) return;\n      const count = (row.match(/\u003ctd\\b[^\u003e]*\u003e/gi) || []).length || (row.match(/\u003cth\\b[^\u003e]*\u003e/gi) || []).length;\n      if (count \u0026\u0026 count !== expected) issues.push({ tableOffset: offset, rowIndex: index, expected, actual: count });\n    });\n    return table;\n  });\n  return issues;\n}\n\nfunction extractHeadingSections(html) {\n  const source = String(html || \u0027\u0027);\n  const re = /\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/ig;\n  const matches = [];\n  let match;\n  while ((match = re.exec(source)) !== null) {\n    matches.push({ level: Number(match[1]), index: match.index, end: re.lastIndex, title: stripTags(match[2]) });\n  }\n  const required = canonicalSections[documentType] || [];\n  const canonicalForKey = (key) =\u003e required.find(section =\u003e sectionKey(section) === key) || null;\n  const sections = new Map();\n  const duplicates = [];\n  for (let i = 0; i \u003c matches.length; i += 1) {\n    const current = matches[i];\n    const known = canonicalForKey(sectionKey(current.title));\n    if (!known) continue;\n    const key = sectionKey(known);\n    const next = matches.slice(i + 1).find(candidate =\u003e {\n      if (canonicalForKey(sectionKey(candidate.title))) return true;\n      return candidate.level \u003c= current.level;\n    });\n    if (sections.has(key)) duplicates.push(known);\n    else sections.set(key, { name: known, html: source.slice(current.index, next ? next.index : source.length) });\n  }\n  const firstKnown = matches.find(item =\u003e canonicalForKey(sectionKey(item.title)));\n  return { preamble: firstKnown ? source.slice(0, firstKnown.index).trim() : source.trim(), sections, duplicates };\n}\n\nfunction sectionWordCount(html) {\n  return stripTags(html).split(/\\s+/).filter(Boolean).length;\n}\n\nfunction coverageSummary() {\n  return q.coverageSummary || $json.coverageSummary || { gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0 };\n}\n\nfunction coverageLedger() {\n  return Array.isArray(q.coverageLedger) ? q.coverageLedger : Array.isArray($json.coverageLedger) ? $json.coverageLedger : [];\n}\n\nfunction buildCoverageLedgerHtml() {\n  const rows = coverageLedger();\n  if (!rows.length) return \u0027\u0027;\n  const body = rows.map(row =\u003e \u0027\u003ctr\u003e\u0027 + [\n    row.coverageId || \u0027\u0027,\n    row.moduleRequirement || \u0027\u0027,\n    sanitizeSourceMetadata(row.sourceReference || \u0027\u0027),\n    row.includedInOutput || \u0027\u0027,\n    row.coverageStatus || \u0027unknown\u0027,\n    row.notes || \u0027\u0027\n  ].map(value =\u003e \u0027\u003ctd\u003e\u0027 + escapeHtml(value || \u0027Not provided\u0027) + \u0027\u003c/td\u003e\u0027).join(\u0027\u0027) + \u0027\u003c/tr\u003e\u0027).join(\u0027\u0027);\n  return \u0027\u003ch2\u003eCoverage Ledger\u003c/h2\u003e\u003cbr/\u003e\u003ctable\u003e\u003ctbody\u003e\u003ctr\u003e\u003cth\u003eCoverage ID\u003c/th\u003e\u003cth\u003eModule / Requirement\u003c/th\u003e\u003cth\u003eSource Reference\u003c/th\u003e\u003cth\u003eIncluded In Output\u003c/th\u003e\u003cth\u003eCoverage Status\u003c/th\u003e\u003cth\u003eNotes\u003c/th\u003e\u003c/tr\u003e\u0027 + body + \u0027\u003c/tbody\u003e\u003c/table\u003e\u0027;\n}\n\nfunction buildCoverageReviewNote() {\n  const summary = coverageSummary();\n  const status = String(summary.gateStatus || summary.status || \u0027\u0027).toLowerCase();\n  const warningItems = Array.isArray(summary.warningItems) ? summary.warningItems : [\n    ...(Array.isArray(summary.partialItems) ? summary.partialItems : []),\n    ...(Array.isArray(summary.missingItems) ? summary.missingItems : []),\n    ...(Array.isArray(summary.unknownItems) ? summary.unknownItems : [])\n  ];\n  if (![\u0027warning\u0027, \u0027failed\u0027, \u0027not_reported\u0027].includes(status) \u0026\u0026 !warningItems.length) return \u0027\u0027;\n  const rows = warningItems.slice(0, 8).map(item =\u003e \u0027\u003cli\u003e\u0027 + escapeHtml([\n    item.coverageId,\n    item.moduleRequirement,\n    item.coverageStatus,\n    item.notes\n  ].filter(Boolean).join(\u0027 - \u0027)) + \u0027\u003c/li\u003e\u0027).join(\u0027\u0027);\n  return [\n    \u0027\u003ch2\u003eCoverage Review Note\u003c/h2\u003e\u0027,\n    \u0027\u003cp\u003eQ-Ops completed the document with coverage items that require QA or business review before final sign-off.\u003c/p\u003e\u0027,\n    rows ? \u0027\u003cul\u003e\u0027 + rows + \u0027\u003c/ul\u003e\u0027 : \u0027\u003cp\u003eCoverage metadata was not fully parsed. Review the Coverage Ledger before sign-off.\u003c/p\u003e\u0027,\n    \u0027\u003chr/\u003e\u0027\n  ].join(\u0027\u0027);\n}\n\nfunction buildEvidenceGapSection(section) {\n  return \u0027\u003ch2\u003e\u0027 + escapeHtml(section) + \u0027\u003c/h2\u003e\u003cbr/\u003e\u003cp\u003eEvidence review required: Q-Ops preserved the required document structure, but the generated output did not contain enough validated source-backed content for this section. Review source coverage before final sign-off.\u003c/p\u003e\u0027;\n}\n\nfunction finalizeSharedCreateOrRetry(html) {\n  const issues = [];\n  let normalized = normalizeTablesForConfluence(String(html || \u0027\u0027).trim());\n  const before = extractHeadingSections(normalized);\n  const required = canonicalSections[documentType] || [];\n  const ledgerHtml = buildCoverageLedgerHtml();\n  const finalSections = new Map(before.sections);\n\n  if (ledgerHtml) finalSections.set(sectionKey(\u0027Coverage Ledger\u0027), { name: \u0027Coverage Ledger\u0027, html: ledgerHtml });\n  before.duplicates.forEach(section =\u003e issues.push({ code: \u0027duplicate_section_removed\u0027, section }));\n\n  for (const section of required) {\n    const key = sectionKey(section);\n    const existing = finalSections.get(key);\n    if (!existing || sectionWordCount(existing.html) \u003c (key === sectionKey(\u0027Coverage Ledger\u0027) ? 2 : 12)) {\n      issues.push({ code: \u0027required_section_repaired\u0027, section });\n      finalSections.set(key, {\n        name: section,\n        html: key === sectionKey(\u0027Coverage Ledger\u0027) \u0026\u0026 ledgerHtml ? ledgerHtml : buildEvidenceGapSection(section)\n      });\n    }\n  }\n\n  const preamble = before.preamble || \u0027\u0027;\n  const coverageNote = buildCoverageReviewNote();\n  normalized = [\n    preamble,\n    coverageNote,\n    ...required.map(section =\u003e finalSections.get(sectionKey(section))?.html || \u0027\u0027).filter(Boolean)\n  ].filter(Boolean).join(\u0027\u0027);\n  normalized = normalizeTablesForConfluence(normalized).replace(/(\u003c\\/table\u003e)\\s*\\|+\\s*(?=\u003ch[1-6]\\b|$)/gi, \u0027$1\u0027);\n  const malformedTables = tableShapeIssues(normalized);\n  if (malformedTables.length) {\n    throw new Error(\u0027Shared final validation failed: malformed table shape after repair. \u0027 + JSON.stringify(malformedTables.slice(0, 5)));\n  }\n  const after = extractHeadingSections(normalized);\n  const missing = required.filter(section =\u003e !after.sections.has(sectionKey(section)));\n  if (missing.length) {\n    throw new Error(\u0027Shared final validation failed: required section(s) still missing after repair: \u0027 + missing.join(\u0027, \u0027));\n  }\n  return { html: normalized, issues };\n}\n\nlet html = sanitizeSourceMetadata(markdownToHtml(md));\nlet finalValidation = {\n  version: \u0027shared-final-validation-v18\u0027,\n  status: \u0027passed\u0027,\n  structuralStatus: \u0027passed\u0027,\n  operationMode,\n  documentType,\n  issues: [],\n  checkedAt: new Date().toISOString()\n};\n\nif (isShared \u0026\u0026 !isUpdate) {\n  const finalized = finalizeSharedCreateOrRetry(html);\n  html = finalized.html;\n  finalValidation.issues = finalized.issues;\n  if (finalized.issues.length) {\n    finalValidation.status = \u0027warning\u0027;\n    finalValidation.structuralStatus = \u0027repaired\u0027;\n  }\n} else if (isShared \u0026\u0026 isUpdate) {\n  html = normalizeTablesForConfluence(html).replace(/(\u003c\\/table\u003e)\\s*\\|+\\s*(?=\u003ch[1-6]\\b|$)/gi, \u0027$1\u0027);\n  const malformedTables = tableShapeIssues(html);\n  if (malformedTables.length) {\n    throw new Error(\u0027Shared update patch validation failed: malformed table shape before merge. \u0027 + JSON.stringify(malformedTables.slice(0, 5)));\n  }\n  finalValidation.status = \u0027pending_merge\u0027;\n  finalValidation.structuralStatus = \u0027pending_merge\u0027;\n}\n\nhtml = sanitizeConfluenceStorageHtml(html);\n\nreturn [{\n  json: {\n    ...$json,\n    html,\n    finalValidation,\n    diagnostics: {\n      validatorVersion: \u0027shared-final-validation-v18\u0027,\n      operationMode,\n      documentType,\n      finalValidation\n    }\n  }\n}];"
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
    "url":  "={{ $(\u0027Prompt Library\u0027).item.json.configSnapshot?.microservices?.converterUrl || \u0027http://127.0.0.1:5050/convert\u0027 }}",
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
                    "value":  "={{ ((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).jiraProjectId || \u002710001\u0027) }}",
                    "mode":  "id",
                    "cachedResultName":  "Runtime snapshot Jira project"
                },
    "issueType":  {
                      "__rl":  true,
                      "value":  "={{ ((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).jiraEpicIssueTypeId || \u002710002\u0027) }}",
                      "mode":  "id",
                      "cachedResultName":  "Runtime snapshot Epic"
                  },
    "summary":  "={{ $json.epicName }}",
    "additionalFields":  {
                             "description":  "={{ \n\"**ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬â€œ Epic Description**\\n\" + $json.epicDescription +\n\n\"\\n\\n---\\n\\n**ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¯ Business Objective**\\n\" + $json.businessObjective +\n\n\"\\n\\n**ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‹â€  Success Metrics**\\n\" + \n$json.successMetrics\n  .replace(/\\sand\\s/g, \u0027, \u0027)     // normalize \"and\" ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ comma\n  .split(\u0027,\u0027)                   // split by comma\n  .map(i =\u003e i.trim())\n  .filter(i =\u003e i !== \"\")\n  .map(i =\u003e \"- [ ] \" + i)\n  .join(\u0027\\n\u0027) +\n\n\"\\n\\n**ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬â€ Source Reference**\\n\" + $json.sourceTraceability\n}}"
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
                    "value":  "={{ ((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).jiraProjectId || \u002710001\u0027) }}",
                    "mode":  "id",
                    "cachedResultName":  "Runtime snapshot Jira project"
                },
    "issueType":  {
                      "__rl":  true,
                      "value":  "={{ ((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).jiraStoryIssueTypeId || \u002710006\u0027) }}",
                      "mode":  "id",
                      "cachedResultName":  "Runtime snapshot Story"
                  },
    "summary":  "={{ $json.feature }}",
    "additionalFields":  {
                             "description":  "={{ \n\"**User Story**\\n\" + $json.userStory +\n\n\"\\n\\n---\\n\\n**ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…â€™ Business Context**\\n\" + $json.businessContext +\n\n\"\\n\\n**ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ Primary Flow**\\n\" + $json.primaryFlow +\n\n\"\\n\\n**ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â Alternate Flows**\\n\" + $json.alternateFlows +\n\n\"\\n\\n**ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Exception Handling**\\n\" + $json.exceptionHandling +\n\n\"\\n\\n**ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Acceptance Criteria**\\n\" + \n$json.acceptanceCriteria.split(\u0027\\n\u0027).map(i =\u003e \"- [ ] \" + i.replace(/^[-ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢]\\s*/, \u0027\u0027)).join(\u0027\\n\u0027) +\n\n\"\\n\\n**ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¨ UI/UX Requirements**\\n\" + $json.uiUxRequirements +\n\n\"\\n\\n**ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Âª Test Scenarios**\\n\" + $json.testScenarios +\n\n\"\\n\\n**ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¦ Dependencies**\\n\" + $json.dependencies +\n\n\"\\n\\n**ÃƒÂ¢Ã…Â¡Ã¢â€žÂ¢ÃƒÂ¯Ã‚Â¸Ã‚Â Assumptions**\\n\" + $json.assumptions +\n\n\"\\n\\n**ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â  Performance NFRs**\\n\" + $json.performanceNFRs +\n\n\"\\n\\n**ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬â€ Traceability**\\n\" + $json.sourceTraceability +\n\n\"\\n\\n**ÃƒÂ°Ã…Â¸Ã‚Â¤Ã¢â‚¬â€œ Automation Feasibility**\\n\" + $json.automationFeasibility\n}}",
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
    "jsCode":  "const items = $input.all();\n\nconst uniqueEpicsMap = {};\n\n// Deduplicate epics (only where epicExists = false)\nitems.forEach(item =\u003e {\n  const epic = item.json;\n\n  if (epic.epicId \u0026\u0026 !epic.epicExists) {\n    const key = epic.epicName;\n\n    if (!uniqueEpicsMap[key]) {\n      uniqueEpicsMap[key] = {\n        json: {\n          epicName: epic.epicName,\n          epicDescription: epic.epicDescription,\n          businessObjective: epic.businessObjective,\n          successMetrics: epic.successMetrics,\n          sourceTraceability: epic.sourceTraceability,\n          epicId: epic.epicId,\n\n          // ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Keep everything else automatically (including metadata)\n          ...epic\n        }\n      };\n    }\n  }\n});\n\nreturn Object.values(uniqueEpicsMap);"
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

- None

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
                    "systemMessage":  "={{ $json.system }}\n\nDocument Title: {{ $json.title }}\nGenerated On: {{ $now }}\nDocument Type: {{ $json.documentType }}",
                    "maxIterations":  4
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
    "url":  "={{ String((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).confluenceBaseUrl || \u0027https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, \u0027\u0027) + \u0027/rest/api/content/\u0027 + $json.pageId + \u0027?expand=version,body.storage\u0027 }}",
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
    "jsCode":  "const projectName = $(\u0027Restore Job Context\u0027).item.json.projectName || \u0027unknown\u0027;\nconst documentType = $(\u0027Restore Job Context\u0027).item.json.documentType || \u0027unknown\u0027;\nconst jobId = $(\u0027Restore Job Context\u0027).item.json.jobId || \u0027unknown\u0027;\n\n// Extract error details from the error output\nconst errorMessage = $json.error?.message || \n                     $json.message || \n                     \u0027Generator Agent failed unexpectedly\u0027;\n\nconst errorDescription = $json.error?.description || \n                         $json.errorDescription || \n                         \u0027\u0027;\n\nconsole.error(`ÃƒÂ¢Ã‚ÂÃ…â€™ Generator Agent failed for job ${jobId}:`, errorMessage);\n\nreturn [\n  {\n    json: {\n      jobId,\n      projectName,\n      documentType,\n      error: true,\n      errorType: \u0027GENERATOR_AGENT_FAILED\u0027,\n      message: errorMessage,\n      description: errorDescription,\n      timestamp: new Date().toISOString(),\n      diagnostics: {\n        version: \u0027shared-final-validation-v9\u0027,\n        jobId,\n        documentType,\n        projectName,\n        failedNode: \u0027Generator Agent\u0027,\n        errorType: \u0027GENERATOR_AGENT_FAILED\u0027,\n        errorMessage,\n        errorDescription,\n        operationMode: $(\u0027Restore Job Context\u0027).item.json.generationMode || \u0027create\u0027\n      }\n    }\n  }\n];"
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
    "jsCode":  "// Input 1: Original structured data\nconst structuredData = $items(\"Final Structured Data\")[0].json.structuredData;\nconst inputEpics = structuredData.epics;\nconst userStories = structuredData.userStories;\n\n// Build epicId ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ userStories map\nconst epicStoryMap = {};\nuserStories.forEach(story =\u003e {\n  if (!epicStoryMap[story.epicId]) {\n    epicStoryMap[story.epicId] = [];\n  }\n  epicStoryMap[story.epicId].push(story);\n});\n\n// Input 2: JIRA search results\nconst jiraIssues = $input.all().flatMap(item =\u003e item.json.issues || []);\n\n// Build map of existing epics (by summary)\nconst existingMap = {};\njiraIssues.forEach(issue =\u003e {\n  const summary = issue.fields.summary;\n  existingMap[summary] = {\n    epicKey: issue.key,\n    epicID: issue.id\n  };\n});\n\n// Separate lists\nconst existingEpics = [];\nconst missingEpics = [];\n\ninputEpics.forEach(epic =\u003e {\n  const epicName = epic.epicName;\n\n  const baseEpicData = {\n    ...epic, // ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ THIS preserves ALL epic fields\n    userStories: epicStoryMap[epic.epicId] || []\n  };\n\n  if (existingMap[epicName]) {\n    existingEpics.push({\n      ...baseEpicData,\n      epicKey: existingMap[epicName].epicKey,\n      epicID: existingMap[epicName].epicID\n    });\n  } else {\n    missingEpics.push(baseEpicData);\n  }\n});\n\nreturn [\n  {\n    json: {\n      existingEpics,\n      missingEpics\n    }\n  }\n];"
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
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
    "jsonBody":  "={\n  \"job_id\": \"{{ $(\u0027Preserve Job ID\u0027).item.json.job_id }}\",\n  \"project_name\":  \"{{ $(\u0027Preserve Job ID\u0027).item.json.projectName }}\",\n  \"document_type\": \"{{ $(\u0027Preserve Job ID\u0027).item.json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"JOB_COMPLETED\",\n  \"status\":        \"info\",\n  \"project_id\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n  \"requested_by\": {{ $(\u0027Restore Job Context\u0027).item.json.requestedBy ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.requestedBy) : \u0027null\u0027 }},\n  \"duration_ms\": \"{{ Date.now() - new Date($(\u0027Restore Job Context\u0027).item.json.startedAt).getTime() }}\",\n  \"word_count\": \"{{ parseInt($(\u0027Restore Quality Gate Output\u0027).item.json.wordCount) || 0 }}\",\n  \"tokens_input\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensInput) || 0 }},\n  \"tokens_output\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensOutput) || 0 }},\n  \"tokens_total\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensTotal) || 0 }},\n  \"estimated_cost_usd\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.estimatedCostUsd) || 0 }},\n  \"metadata\": {\n    \"settings_version\": {{ $(\u0027Restore Job Context\u0027).item.json.settingsVersion || \u0027null\u0027 }},\n    \"project_id\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n    \"requested_by\": {{ $(\u0027Restore Job Context\u0027).item.json.requestedBy ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.requestedBy) : \u0027null\u0027 }},\n    \"environment\": \"{{ $(\u0027Restore Job Context\u0027).item.json.environmentKey || \u0027local\u0027 }}\",\n    \"generation_model\": \"{{ $(\u0027Restore Job Context\u0027).item.json.configSnapshot?.models?.generationModel || \u0027gpt-4.1-mini\u0027 }}\",\n    \"chroma_collection\": \"{{ $(\u0027Restore Job Context\u0027).item.json.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027 }}\",\n    \"final_validation\": {{ JSON.stringify((() =\u003e { const fv = ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.finalValidation || $(\u0027Restore Quality Gate Output\u0027).item.json.finalValidation) || null; return fv?.status === \u0027pending_merge\u0027 ? { ...fv, status: \u0027passed\u0027, structuralStatus: \u0027passed\u0027, mergeGuard: \u0027passed\u0027 } : (fv || { version: \u0027shared-final-validation-v11\u0027, status: \u0027passed\u0027, structuralStatus: \u0027passed\u0027 }); })()) }},\n    \"diagnostics\": {{ JSON.stringify(($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.diagnostics || $(\u0027Restore Quality Gate Output\u0027).item.json.diagnostics) || {}) }},\n    \"operation_mode\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary?.operationMode || ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.finalValidation || $(\u0027Restore Quality Gate Output\u0027).item.json.finalValidation)?.operationMode || ($(\u0027Restore Job Context\u0027).item.json.generationMode === \u0027update\u0027 ? \u0027update_delta\u0027 : (($(\u0027Restore Job Context\u0027).item.json.retryOfJobId || $(\u0027Restore Job Context\u0027).item.json.input?.retryJobId) ? \u0027create_retry\u0027 : \u0027create\u0027))) }},\n    \"confluence_page_id\": \"{{ $json.id }}\",\n    \"confluence_url\": \"{{ $json._links.base + $json._links.webui }}\",\n    \"output_type\": \"confluence\",\n    \"generation_mode\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.generationMode || $(\u0027Restore Job Context\u0027).item.json.generationMode || \u0027create\u0027) }},\n    \"update_of_job_id\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary?.updateOfJobId || $(\u0027Restore Job Context\u0027).item.json.updateContext?.previousJobId || null) }},\n    \"update_summary\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary || null) }},\n    \"coverage_mode\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.mode || \u0027dry_run\u0027) }},\n    \"coverage_gate_status\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.gateStatus || \u0027not_reported\u0027) }},\n    \"coverage_ledger_count\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.coverageLedgerCount) || 0 }},\n    \"covered_ledger_count\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.coveredCount) || 0 }},\n    \"partial_ledger_count\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.partialCount) || 0 }},\n    \"missing_ledger_count\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.missingCount) || 0 }},\n    \"excluded_ledger_count\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.excludedCount) || 0 }},\n    \"uncovered_ledger_count\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.uncoveredCount) || 0 }},\n    \"coverage_missing_items\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.missingItems || []) }},\n    \"token_usage\": {\n      \"input\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensInput) || 0 }},\n      \"output\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensOutput) || 0 }},\n      \"total\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensTotal) || 0 }},\n      \"estimated_cost_usd\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.estimatedCostUsd) || 0 }}\n    }\n  }\n}",
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
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
    "jsonBody":  "={{ (() =\u003e {\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const preserved = $(\u0027Preserve Job ID\u0027).item.json || {};\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const converter = ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0] || {}).json || {};\n  const error = $json.error || {};\n  const details = error.errorDetails || $json.errorDetails || {};\n  const raw = Array.isArray(details.rawErrorMessage) ? details.rawErrorMessage.join(\u0027 | \u0027) : (details.rawErrorMessage || error.rawErrorMessage || \u0027\u0027);\n  const httpCode = details.httpCode || error.httpCode || $json.httpCode || $json.statusCode || null;\n  const message = error.message || $json.errorMessage || $json.message || \u0027Confluence publish failed\u0027;\n  const description = error.description || $json.errorDescription || $json.description || raw || \u0027\u0027;\n  const tokenUsage = {\n    source: q.tokenUsage?.source || \u0027estimated\u0027,\n    input: Number(q.tokensInput) || Number(q.tokenUsage?.input) || 0,\n    output: Number(q.tokensOutput) || Number(q.tokenUsage?.output) || 0,\n    total: Number(q.tokensTotal) || Number(q.tokenUsage?.total) || 0,\n    estimatedCostUsd: Number(q.estimatedCostUsd) || Number(q.tokenUsage?.estimatedCostUsd) || 0\n  };\n  return JSON.stringify({\n    job_id: preserved.job_id || restore.jobId,\n    project_name: preserved.projectName || restore.projectName,\n    document_type: preserved.documentType || restore.documentType,\n    pipeline: \u0027generation\u0027,\n    event: \u0027JOB_FAILED\u0027,\n    status: \u0027error\u0027,\n    project_id: restore.projectId || null,\n    requested_by: restore.requestedBy || null,\n    error_message: message,\n    duration_ms: Math.max(0, Date.now() - new Date(restore.startedAt || Date.now()).getTime()),\n    word_count: Number(q.wordCount) || 0,\n    tokens_input: tokenUsage.input,\n    tokens_output: tokenUsage.output,\n    tokens_total: tokenUsage.total,\n    estimated_cost_usd: tokenUsage.estimatedCostUsd,\n    metadata: {\n      settings_version: restore.settingsVersion || null,\n      project_id: restore.projectId || null,\n      requested_by: restore.requestedBy || null,\n      environment: restore.environmentKey || \u0027local\u0027,\n      generation_model: restore.configSnapshot?.models?.generationModel || \u0027gpt-4.1-mini\u0027,\n      chroma_collection: restore.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027,\n      failed_at: new Date().toISOString(),\n      error_type: \u0027CONFLUENCE_PUBLISH_FAILED\u0027,\n      error_description: description,\n      http_code: httpCode,\n      raw_error_message: raw,\n      token_usage: tokenUsage,\n      diagnostics: {\n        version: \u0027confluence-fabric-resilience-v1\u0027,\n        failedNode: error.node?.name || $json.nodeName || \u0027Confluence publish\u0027,\n        errorType: \u0027CONFLUENCE_PUBLISH_FAILED\u0027,\n        errorMessage: message,\n        errorDescription: description,\n        httpCode,\n        rawErrorMessage: raw,\n        operationMode: restore.generationMode || \u0027create\u0027,\n        finalValidation: converter.finalValidation || q.finalValidation || null,\n        confluencePayloadSanitized: true\n      }\n    }\n  });\n})() }}",
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
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
    "jsonBody":  "={\n  \"job_id\":        \"{{ $json.jobId }}\",\n  \"project_name\":  \"{{ $json.projectName }}\",\n  \"document_type\": \"{{ $json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"JOB_FAILED\",\n  \"status\":        \"error\",\n  \"project_id\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n  \"requested_by\": {{ $(\u0027Restore Job Context\u0027).item.json.requestedBy ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.requestedBy) : \u0027null\u0027 }},\n  \"error_message\": \"{{ $json.message }}\",\n  \"metadata\": {\n    \"settings_version\": {{ $(\u0027Restore Job Context\u0027).item.json.settingsVersion || \u0027null\u0027 }},\n    \"project_id\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n    \"requested_by\": {{ $(\u0027Restore Job Context\u0027).item.json.requestedBy ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.requestedBy) : \u0027null\u0027 }},\n    \"environment\": \"{{ $(\u0027Restore Job Context\u0027).item.json.environmentKey || \u0027local\u0027 }}\",\n    \"generation_model\": \"{{ $(\u0027Restore Job Context\u0027).item.json.configSnapshot?.models?.generationModel || \u0027gpt-4.1-mini\u0027 }}\",\n    \"chroma_collection\": \"{{ $(\u0027Restore Job Context\u0027).item.json.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027 }}\",\n    \"error_type\":        \"GENERATOR_AGENT_FAILED\",\n    \"error_description\": \"{{ $json.description }}\",\n    \"failed_at\":         \"{{ $json.timestamp }}\",\n    \"diagnostics\": {{ JSON.stringify($json.diagnostics || {}) }}\n  }\n}",
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
    "method":  "POST",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n\"Prefer\": \"return=minimal\"  \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"job_id\": \"{{ $json.jobId }}\",\n  \"project_name\": \"{{ $json.projectName }}\",\n  \"document_type\": \"{{ $json.documentType }}\",\n  \"pipeline\": \"generation\",\n  \"event\": \"JOB_COMPLETED\",\n  \"status\": \"info\",\n  \"project_id\": {{ $json.projectId ? JSON.stringify($json.projectId) : \u0027null\u0027 }},\n  \"requested_by\": {{ $json.requestedBy ? JSON.stringify($json.requestedBy) : \u0027null\u0027 }},\n  \"duration_ms\": \"{{ Date.now() - new Date($json.startedAt).getTime() }}\",\n  \"word_count\": {{ Number($json.wordCount) || 0 }},\n  \"tokens_input\": {{ Number($json.tokensInput) || 0 }},\n  \"tokens_output\": {{ Number($json.tokensOutput) || 0 }},\n  \"tokens_total\": {{ Number($json.tokensTotal) || 0 }},\n  \"estimated_cost_usd\": {{ Number($json.estimatedCostUsd) || 0 }},\n  \"metadata\": {\n    \"settings_version\": {{ $json.settingsVersion || \u0027null\u0027 }},\n    \"project_id\": {{ $json.projectId ? JSON.stringify($json.projectId) : \u0027null\u0027 }},\n    \"requested_by\": {{ $json.requestedBy ? JSON.stringify($json.requestedBy) : \u0027null\u0027 }},\n    \"environment\": \"{{ $json.environmentKey || \u0027local\u0027 }}\",\n    \"generation_model\": \"{{ $json.generationModel || \u0027gpt-4.1-mini\u0027 }}\",\n    \"chroma_collection\": \"{{ $json.chromaCollection || \u0027qa-chunks-batches\u0027 }}\",\n    \"stories_created\": \"{{ ($json.stories || []).length }}\",\n    \"epics_created\": \"{{ ($json.epics || []).length }}\",\n    \"output_type\": \"jira\",\n    \"token_usage\": {\n      \"input\": {{ Number($json.tokensInput) || 0 }},\n      \"output\": {{ Number($json.tokensOutput) || 0 }},\n      \"total\": {{ Number($json.tokensTotal) || 0 }},\n      \"estimated_cost_usd\": {{ Number($json.estimatedCostUsd) || 0 }}\n    }\n  }\n}",
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
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
    "jsonBody":  "={\n  \"job_id\": \"{{ $json.jobId }}\",\n  \"project_name\": \"{{ $json.projectName }}\",\n  \"document_type\": \"{{ $json.documentType }}\",\n  \"pipeline\": \"generation\",\n  \"event\": \"GENERATOR_STARTED\",\n  \"status\": \"info\",\n  \"project_id\": {{ ($json.projectId || $json.project_id) ? JSON.stringify($json.projectId || $json.project_id) : \u0027null\u0027 }},\n  \"requested_by\": {{ ($json.requestedBy || $json.requested_by) ? JSON.stringify($json.requestedBy || $json.requested_by) : \u0027null\u0027 }},\n  \"metadata\": {\n    \"settings_version\": {{ $json.settingsVersion || $json.settings_version || \u0027null\u0027 }},\n    \"project_id\": {{ ($json.projectId || $json.project_id) ? JSON.stringify($json.projectId || $json.project_id) : \u0027null\u0027 }},\n    \"requested_by\": {{ ($json.requestedBy || $json.requested_by) ? JSON.stringify($json.requestedBy || $json.requested_by) : \u0027null\u0027 }},\n    \"environment\": \"{{ (($json.configSnapshot || $json.config_snapshot || {}).environment || {}).key || $json.environment || \u0027local\u0027 }}\",\n    \"generation_model\": \"{{ (($json.configSnapshot || $json.config_snapshot || {}).models || {}).generationModel || \u0027gpt-4.1-mini\u0027 }}\",\n    \"chroma_collection\": \"{{ (($json.configSnapshot || $json.config_snapshot || {}).chroma || {}).collection || \u0027qa-chunks-batches\u0027 }}\",\n    \"started_at\": \"{{ $now }}\"\n  }\n}",
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
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
    "jsonBody":  "={\n  \"job_id\":        {{ JSON.stringify($(\u0027Restore Job Context\u0027).item.json.jobId) }},\n  \"project_name\":  {{ JSON.stringify($(\u0027Prompt Library\u0027).item.json.projectName) }},\n  \"document_type\": {{ JSON.stringify($(\u0027Prompt Library\u0027).item.json.documentType) }},\n  \"pipeline\":      \"generation\",\n  \"event\":         \"QUALITY_GATE_FAILED\",\n  \"status\":        \"error\",\n  \"project_id\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n  \"requested_by\": {{ $(\u0027Restore Job Context\u0027).item.json.requestedBy ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.requestedBy) : \u0027null\u0027 }},\n  \"word_count\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.wordCount || 0) || 0 }},\n  \"tokens_input\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.tokensInput || 0) || 0 }},\n  \"tokens_output\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.tokensOutput || 0) || 0 }},\n  \"tokens_total\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.tokensTotal || 0) || 0 }},\n  \"estimated_cost_usd\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.estimatedCostUsd || 0) || 0 }},\n  \"error_message\": {{ JSON.stringify(typeof $json.error === \u0027string\u0027 ? $json.error : ($json.message || $json.error?.message || \u0027Quality Gate Failed\u0027)) }},\n  \"metadata\": {\n    \"settings_version\": {{ $(\u0027Restore Job Context\u0027).item.json.settingsVersion || \u0027null\u0027 }},\n    \"project_id\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n    \"requested_by\": {{ $(\u0027Restore Job Context\u0027).item.json.requestedBy ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.requestedBy) : \u0027null\u0027 }},\n    \"environment\": {{ JSON.stringify($(\u0027Restore Job Context\u0027).item.json.environmentKey || \u0027local\u0027) }},\n    \"generation_model\": {{ JSON.stringify($(\u0027Restore Job Context\u0027).item.json.configSnapshot?.models?.generationModel || \u0027gpt-4.1-mini\u0027) }},\n    \"chroma_collection\": {{ JSON.stringify($(\u0027Restore Job Context\u0027).item.json.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027) }},\n    \"word_count\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.wordCount || 0) || 0 }},\n    \"token_usage\": {{ JSON.stringify((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).tokenUsage || {}) }},\n    \"retry_of_job_id\": {{ $(\u0027Restore Job Context\u0027).item.json.retryOfJobId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.retryOfJobId) : \u0027null\u0027 }},\n    \"coverage_mode\": {{ JSON.stringify((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).coverageSummary?.mode || \u0027dry_run\u0027) }},\n    \"coverage_gate_status\": {{ JSON.stringify((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).coverageSummary?.gateStatus || \u0027not_reported\u0027) }},\n    \"coverage_ledger_count\": {{ Number((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).coverageSummary?.coverageLedgerCount || 0) || 0 }},\n    \"covered_ledger_count\": {{ Number((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).coverageSummary?.coveredCount || 0) || 0 }},\n    \"partial_ledger_count\": {{ Number((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).coverageSummary?.partialCount || 0) || 0 }},\n    \"missing_ledger_count\": {{ Number((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).coverageSummary?.missingCount || 0) || 0 }},\n    \"excluded_ledger_count\": {{ Number((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).coverageSummary?.excludedCount || 0) || 0 }},\n    \"uncovered_ledger_count\": {{ Number((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).coverageSummary?.uncoveredCount || 0) || 0 }},\n    \"coverage_missing_items\": {{ JSON.stringify(((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).coverageSummary || {}).missingItems || []) }}\n  }\n}",
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
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
    "jsonBody":  "={\n  \"job_id\":        \"{{ $json.jobId }}\",\n  \"project_name\":  \"{{ $(\u0027Prompt Library\u0027).item.json.projectName }}\",\n  \"document_type\": \"{{ $(\u0027Prompt Library\u0027).item.json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"QUALITY_GATE_PASSED\",\n  \"status\":        \"info\",\n  \"project_id\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n  \"requested_by\": {{ $(\u0027Restore Job Context\u0027).item.json.requestedBy ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.requestedBy) : \u0027null\u0027 }},\n  \"word_count\": {{ Number($json.wordCount) || 0 }},\n  \"tokens_input\": {{ Number($json.tokensInput) || 0 }},\n  \"tokens_output\": {{ Number($json.tokensOutput) || 0 }},\n  \"tokens_total\": {{ Number($json.tokensTotal) || 0 }},\n  \"estimated_cost_usd\": {{ Number($json.estimatedCostUsd) || 0 }},\n  \"metadata\": {\n    \"settings_version\": {{ $(\u0027Restore Job Context\u0027).item.json.settingsVersion || \u0027null\u0027 }},\n    \"project_id\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n    \"requested_by\": {{ $(\u0027Restore Job Context\u0027).item.json.requestedBy ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.requestedBy) : \u0027null\u0027 }},\n    \"environment\": \"{{ $(\u0027Restore Job Context\u0027).item.json.environmentKey || \u0027local\u0027 }}\",\n    \"generation_model\": \"{{ $(\u0027Restore Job Context\u0027).item.json.configSnapshot?.models?.generationModel || \u0027gpt-4.1-mini\u0027 }}\",\n    \"chroma_collection\": \"{{ $(\u0027Restore Job Context\u0027).item.json.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027 }}\",\n    \"char_count\":       \"{{ $json.charCount }}\",\n    \"min_word_count\":   \"{{ $json.qualityGate.minWordCount }}\",\n    \"checked_sections\": \"{{ $json.qualityGate.checkedSections }}\",\n    \"coverage_mode\": {{ JSON.stringify($json.coverageSummary?.mode || \u0027dry_run\u0027) }},\n    \"coverage_gate_status\": {{ JSON.stringify($json.coverageSummary?.gateStatus || \u0027not_reported\u0027) }},\n    \"coverage_ledger_count\": {{ Number($json.coverageSummary?.coverageLedgerCount) || 0 }},\n    \"covered_ledger_count\": {{ Number($json.coverageSummary?.coveredCount) || 0 }},\n    \"partial_ledger_count\": {{ Number($json.coverageSummary?.partialCount) || 0 }},\n    \"missing_ledger_count\": {{ Number($json.coverageSummary?.missingCount) || 0 }},\n    \"excluded_ledger_count\": {{ Number($json.coverageSummary?.excludedCount) || 0 }},\n    \"uncovered_ledger_count\": {{ Number($json.coverageSummary?.uncoveredCount) || 0 }},\n    \"coverage_missing_items\": {{ JSON.stringify($json.coverageSummary?.missingItems || []) }}\n  }\n}",
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
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
    "jsonBody":  "={\n  \"job_id\": \"{{ $(\u0027Preserve Job ID\u0027).item.json.job_id }}\",\n  \"project_name\":  \"{{ $(\u0027Preserve Job ID\u0027).item.json.projectName }}\",\n  \"document_type\": \"{{ $(\u0027Preserve Job ID\u0027).item.json.documentType }}\",\n  \"pipeline\":      \"generation\",\n  \"event\":         \"JOB_COMPLETED\",\n  \"status\":        \"info\",\n  \"project_id\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n  \"requested_by\": {{ $(\u0027Restore Job Context\u0027).item.json.requestedBy ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.requestedBy) : \u0027null\u0027 }},\n  \"duration_ms\": \"{{ Date.now() - new Date($(\u0027Restore Job Context\u0027).item.json.startedAt).getTime() }}\",\n  \"word_count\": \"{{ parseInt($(\u0027Restore Quality Gate Output\u0027).item.json.wordCount) || 0 }}\",\n  \"tokens_input\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensInput) || 0 }},\n  \"tokens_output\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensOutput) || 0 }},\n  \"tokens_total\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensTotal) || 0 }},\n  \"estimated_cost_usd\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.estimatedCostUsd) || 0 }},\n  \"metadata\": {\n    \"settings_version\": {{ $(\u0027Restore Job Context\u0027).item.json.settingsVersion || \u0027null\u0027 }},\n    \"project_id\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n    \"requested_by\": {{ $(\u0027Restore Job Context\u0027).item.json.requestedBy ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.requestedBy) : \u0027null\u0027 }},\n    \"environment\": \"{{ $(\u0027Restore Job Context\u0027).item.json.environmentKey || \u0027local\u0027 }}\",\n    \"generation_model\": \"{{ $(\u0027Restore Job Context\u0027).item.json.configSnapshot?.models?.generationModel || \u0027gpt-4.1-mini\u0027 }}\",\n    \"chroma_collection\": \"{{ $(\u0027Restore Job Context\u0027).item.json.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027 }}\",\n    \"final_validation\": {{ JSON.stringify((() =\u003e { const fv = ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.finalValidation || $(\u0027Restore Quality Gate Output\u0027).item.json.finalValidation) || null; return fv?.status === \u0027pending_merge\u0027 ? { ...fv, status: \u0027passed\u0027, structuralStatus: \u0027passed\u0027, mergeGuard: \u0027passed\u0027 } : (fv || { version: \u0027shared-final-validation-v11\u0027, status: \u0027passed\u0027, structuralStatus: \u0027passed\u0027 }); })()) }},\n    \"diagnostics\": {{ JSON.stringify(($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.diagnostics || $(\u0027Restore Quality Gate Output\u0027).item.json.diagnostics) || {}) }},\n    \"operation_mode\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary?.operationMode || ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.finalValidation || $(\u0027Restore Quality Gate Output\u0027).item.json.finalValidation)?.operationMode || ($(\u0027Restore Job Context\u0027).item.json.generationMode === \u0027update\u0027 ? \u0027update_delta\u0027 : (($(\u0027Restore Job Context\u0027).item.json.retryOfJobId || $(\u0027Restore Job Context\u0027).item.json.input?.retryJobId) ? \u0027create_retry\u0027 : \u0027create\u0027))) }},\n    \"confluence_page_id\": \"{{ $json.id }}\",\n    \"confluence_url\": \"{{ $json._links.base + $json._links.webui }}\",\n    \"output_type\": \"confluence\",\n    \"generation_mode\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.generationMode || $(\u0027Restore Job Context\u0027).item.json.generationMode || \u0027create\u0027) }},\n    \"update_of_job_id\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary?.updateOfJobId || $(\u0027Restore Job Context\u0027).item.json.updateContext?.previousJobId || null) }},\n    \"update_summary\": {{ JSON.stringify((() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); const summary = $(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary || null; if (!summary) return summary;\nconst summaryLedgerCount = Number(summary.coverageLedgerCount || summary.coverageSummary?.coverageLedgerCount || summary.batchSummary?.total || 0) || 0;\nif (!finalCoverage.ledger.length || (summaryLedgerCount \u003e 0 \u0026\u0026 finalCoverage.source !== \u0027final_published_body\u0027)) return summary;\nreturn {\n  ...summary,\n  coverageSummary: { ...finalCoverage.summary, carriedForwardFromPreviousUpdate: finalCoverage.source !== \u0027final_published_body\u0027 },\n  batchSummary: finalCoverage.batchSummary,\n  coverageLedgerCount: finalCoverage.ledger.length,\n  needsReviewSections: finalCoverage.summary.gateStatus === \u0027passed\u0027 ? (summary.needsReviewSections || []).filter(section =\u003e !/coverage ledger/i.test(section)) : summary.needsReviewSections,\n  needsReviewSectionCount: finalCoverage.summary.gateStatus === \u0027passed\u0027 ? (summary.needsReviewSections || []).filter(section =\u003e !/coverage ledger/i.test(section)).length : summary.needsReviewSectionCount\n}; })()) }},\n    \"coverage_mode\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.mode || \u0027dry_run\u0027) }},\n    \"coverage_gate_status\": {{ JSON.stringify((() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); return finalCoverage.summary.gateStatus || \u0027not_reported\u0027; })()) }},\n    \"coverage_ledger_count\": {{ (() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); return Number(finalCoverage.summary.coverageLedgerCount) || 0; })() }},\n    \"covered_ledger_count\": {{ (() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); return Number(finalCoverage.summary.coveredCount) || 0; })() }},\n    \"partial_ledger_count\": {{ (() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); return Number(finalCoverage.summary.partialCount) || 0; })() }},\n    \"missing_ledger_count\": {{ (() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); return Number(finalCoverage.summary.missingCount) || 0; })() }},\n    \"excluded_ledger_count\": {{ (() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); return Number(finalCoverage.summary.excludedCount) || 0; })() }},\n    \"uncovered_ledger_count\": {{ (() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); return Number(finalCoverage.summary.uncoveredCount) || 0; })() }},\n    \"coverage_missing_items\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary?.missingItems || []) }},\n    \"token_usage\": {\n      \"input\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensInput) || 0 }},\n      \"output\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensOutput) || 0 }},\n      \"total\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensTotal) || 0 }},\n      \"estimated_cost_usd\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.estimatedCostUsd) || 0 }}\n    }\n  }\n}",
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $(\u0027Preserve Job ID\u0027).item.json.job_id }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"completed\",\n  \"output\": {\n    \"settingsVersion\": {{ $(\u0027Restore Job Context\u0027).item.json.settingsVersion || \u0027null\u0027 }},\n    \"coverageMetadataSource\": {{ JSON.stringify((() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); return finalCoverage.source; })()) }},\n    \"destination\": {\n      \"projectId\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n      \"type\": \"confluence\"\n    },\n    \"confluencePageId\": \"{{ $(\u0027Update existing Document on Confluence\u0027).item.json.id }}\",\n    \"url\": \"{{ $(\u0027Update existing Document on Confluence\u0027).item.json._links.base + $(\u0027Update existing Document on Confluence\u0027).item.json._links.webui }}\",\n    \"wordCount\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.wordCount) || 0 }},\n    \"documentType\": {{ $(\u0027Restore Job Context\u0027).item.json.documentType ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.documentType) : \u0027null\u0027 }},\n    \"generationMode\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.generationMode || $(\u0027Restore Job Context\u0027).item.json.generationMode || \u0027create\u0027) }},\n    \"updateOfJobId\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary?.updateOfJobId || $(\u0027Restore Job Context\u0027).item.json.updateContext?.previousJobId || null) }},\n    \"updateSummary\": {{ JSON.stringify((() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); const summary = $(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary || null; if (!summary) return summary;\nconst summaryLedgerCount = Number(summary.coverageLedgerCount || summary.coverageSummary?.coverageLedgerCount || summary.batchSummary?.total || 0) || 0;\nif (!finalCoverage.ledger.length || (summaryLedgerCount \u003e 0 \u0026\u0026 finalCoverage.source !== \u0027final_published_body\u0027)) return summary;\nreturn {\n  ...summary,\n  coverageSummary: { ...finalCoverage.summary, carriedForwardFromPreviousUpdate: finalCoverage.source !== \u0027final_published_body\u0027 },\n  batchSummary: finalCoverage.batchSummary,\n  coverageLedgerCount: finalCoverage.ledger.length,\n  needsReviewSections: finalCoverage.summary.gateStatus === \u0027passed\u0027 ? (summary.needsReviewSections || []).filter(section =\u003e !/coverage ledger/i.test(section)) : summary.needsReviewSections,\n  needsReviewSectionCount: finalCoverage.summary.gateStatus === \u0027passed\u0027 ? (summary.needsReviewSections || []).filter(section =\u003e !/coverage ledger/i.test(section)).length : summary.needsReviewSectionCount\n}; })()) }},\n    \"coverageSummary\": {{ JSON.stringify((() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n  const stripTags = (html) =\u003e String(html || \u0027\u0027).replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027).replace(/\u0026nbsp;/gi, \u0027 \u0027).replace(/\u0026amp;/gi, \u0027\u0026\u0027).replace(/\u0026ndash;/gi, \u0027-\u0027).replace(/\u0026mdash;/gi, \u0027-\u0027).replace(/\u0026quot;/gi, \u0027\"\u0027).replace(/\u0026#39;/gi, \"\u0027\").replace(/\\s+/g, \u0027 \u0027).trim();\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027)) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)].map(match =\u003e stripTags(match[1]));\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings.map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) })).find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row.coverageId || row.moduleRequirement).slice(0, 200);\n  };\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return { summary };\n})(); return finalCoverage.summary; })()) }},\n    \"coverageLedger\": {{ JSON.stringify((() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); return finalCoverage.ledger; })()) }},\n    \"batchSummary\": {{ JSON.stringify((() =\u003e { const finalCoverage = (() =\u003e {\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n  const isSharedUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027;\n  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n  const rawSummary = q.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\u0026ndash;/gi, \u0027-\u0027)\n    .replace(/\u0026mdash;/gi, \u0027-\u0027)\n    .replace(/\u0026quot;/gi, \u0027\"\u0027)\n    .replace(/\u0026#39;/gi, \"\u0027\")\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const normalizeStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return \u0027unknown\u0027;\n  };\n\n  const cellTexts = (rowHtml) =\u003e [...String(rowHtml || \u0027\u0027).matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[hd]\u003e/gi)]\n    .map(match =\u003e stripTags(match[1]));\n\n  const parseFinalLedger = () =\u003e {\n    const html = String($(\u0027Update existing Document on Confluence\u0027).item.json.body?.storage?.value || \u0027\u0027);\n    if (!html) return [];\n    const headings = [...html.matchAll(/\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/gi)];\n    const coverage = headings\n      .map((match, index) =\u003e ({ match, index, title: stripTags(match[2]) }))\n      .find(item =\u003e /coverage\\s+ledger/i.test(item.title));\n    if (!coverage) return [];\n    const start = coverage.match.index + coverage.match[0].length;\n    const next = headings.slice(coverage.index + 1).find(match =\u003e match.index \u003e start);\n    const section = html.slice(start, next ? next.index : html.length);\n    const tableMatch = section.match(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/i);\n    if (!tableMatch) return [];\n    const rows = [...tableMatch[0].matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n    if (rows.length \u003c 2) return [];\n    const headers = cellTexts(rows[0]).map(header =\u003e header.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const indexFor = (patterns, fallback) =\u003e {\n      const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n      return index \u003e= 0 ? index : fallback;\n    };\n    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);\n    const moduleIndex = indexFor([/module/, /requirement/], 1);\n    const sourceIndex = indexFor([/source/], 2);\n    const includedIndex = indexFor([/included/, /output/], 3);\n    const statusIndex = indexFor([/status/], 4);\n    const notesIndex = indexFor([/note/, /rationale/], 5);\n    return rows.slice(1).map(row =\u003e {\n      const cells = cellTexts(row);\n      if (!cells.some(Boolean)) return null;\n      return {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }).filter(row =\u003e row \u0026\u0026 (row.coverageId || row.moduleRequirement)).slice(0, 200);\n  };\n\n  const finalLedger = isSharedUpdate ? parseFinalLedger() : [];\n  const ledger = finalLedger.length \u003e rawLedger.length ? finalLedger : rawLedger;\n  const summary = { ...rawSummary, version: rawSummary.version || \u0027coverage-ledger-v1\u0027, mode: rawSummary.mode || \u0027dry_run\u0027, coverageLedgerCount: ledger.length };\n  summary.coveredCount = ledger.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  summary.partialCount = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  summary.missingCount = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  summary.excludedCount = ledger.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  summary.unknownCount = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).length;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || \u0027not_reported\u0027) : (summary.blockingUncoveredCount \u003e 0 ? \u0027warning\u0027 : summary.partialCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027);\n  summary.missingItems = ledger.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.partialItems = ledger.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.unknownItems = ledger.filter(row =\u003e ![\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  summary.warningItems = ledger.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus)).slice(0, 25).map(row =\u003e ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));\n  return {\n    ledger,\n    summary,\n    batchSummary: {\n      ...(q.batchSummary || {}),\n      version: q.batchSummary?.version || \u0027coverage-batch-summary-v1\u0027,\n      documentType: type,\n      total: ledger.length,\n      covered: summary.coveredCount,\n      complete: summary.coveredCount,\n      review: summary.partialCount + summary.missingCount + summary.unknownCount,\n      partial: summary.partialCount,\n      missing: summary.missingCount,\n      unknown: summary.unknownCount,\n      excluded: summary.excludedCount,\n      gateStatus: summary.gateStatus,\n      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,\n      reviewItems: summary.warningItems || []\n    },\n    source: finalLedger.length \u003e rawLedger.length ? \u0027final_published_body\u0027 : \u0027quality_gate\u0027\n  };\n})(); return finalCoverage.ledger.length ? finalCoverage.batchSummary : ($(\u0027Restore Quality Gate Output\u0027).item.json.batchSummary || null); })()) }},\n    \"progress\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.progress || null) }},\n    \"qualityGate\": {{ JSON.stringify((() =\u003e {\n      const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n      const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n      const type = String(q.documentType || restore.documentType || \u0027\u0027).toLowerCase();\n      const mode = String(q.generationMode || restore.generationMode || \u0027\u0027).toLowerCase();\n      return [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type) \u0026\u0026 mode === \u0027update\u0027 ? null : (q.qualityGate || null);\n    })()) }},\n    \"finalValidation\": {{ JSON.stringify((() =\u003e { const fv = ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.finalValidation || $(\u0027Restore Quality Gate Output\u0027).item.json.finalValidation) || null; return fv?.status === \u0027pending_merge\u0027 ? { ...fv, status: \u0027passed\u0027, structuralStatus: \u0027passed\u0027, mergeGuard: \u0027passed\u0027 } : (fv || { version: \u0027shared-final-validation-v11\u0027, status: \u0027passed\u0027, structuralStatus: \u0027passed\u0027 }); })()) }},\n    \"operationMode\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary?.operationMode || ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.finalValidation || $(\u0027Restore Quality Gate Output\u0027).item.json.finalValidation)?.operationMode || ($(\u0027Restore Job Context\u0027).item.json.generationMode === \u0027update\u0027 ? \u0027update_delta\u0027 : (($(\u0027Restore Job Context\u0027).item.json.retryOfJobId || $(\u0027Restore Job Context\u0027).item.json.input?.retryJobId) ? \u0027create_retry\u0027 : \u0027create\u0027))) }},\n    \"diagnostics\": {{ JSON.stringify({ ...(($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.diagnostics || $(\u0027Restore Quality Gate Output\u0027).item.json.diagnostics) || {}), finalValidation: (() =\u003e { const fv = ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.finalValidation || $(\u0027Restore Quality Gate Output\u0027).item.json.finalValidation) || null; return fv?.status === \u0027pending_merge\u0027 ? { ...fv, status: \u0027passed\u0027, structuralStatus: \u0027passed\u0027, mergeGuard: \u0027passed\u0027 } : fv; })() }) }},\n    \"tokenUsage\": {\n      \"source\": \"{{ $(\u0027Restore Quality Gate Output\u0027).item.json.tokenUsage?.source || \u0027estimated\u0027 }}\",\n      \"input\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensInput) || 0 }},\n      \"output\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensOutput) || 0 }},\n      \"total\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensTotal) || 0 }},\n      \"estimatedCostUsd\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.estimatedCostUsd) || 0 }}\n    }\n  },\n  \"updated_at\": \"{{ new Date().toISOString() }}\"\n}",
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
- Version Number > 1? -> Merge6 (output 1, input 1)
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

- None

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
                  "value":  "={{ $(\u0027Prompt Library\u0027).item.json.configSnapshot?.models?.generationModel || \u0027gpt-4.1-mini\u0027 }}",
                  "mode":  "id",
                  "cachedResultName":  "runtime-configured model"
              },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  "={{ (() =\u003e { const p = $(\u0027Prompt Library\u0027).item.json || {}; const base = Number(p.configSnapshot?.models?.maxTokens || 8000) || 8000; const type = String(p.documentType || \u0027\u0027).toLowerCase(); const isSharedUpdate = [\u0027test_strategy\u0027,\u0027test_plan\u0027,\u0027risk_matrix\u0027,\u0027traceability_matrix\u0027].includes(type) \u0026\u0026 String(p.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027; if (!isSharedUpdate) return base; const summary = p.updateContext?.previousCoverageSummary || {}; const rows = Array.isArray(p.updateContext?.previousCoverageLedger) ? p.updateContext.previousCoverageLedger.length : Number(summary.coverageLedgerCount || 0) || 0; const status = String(summary.gateStatus || summary.status || \u0027\u0027).toLowerCase(); const needsRepair = rows === 0 || [\u0027warning\u0027,\u0027failed\u0027,\u0027not_reported\u0027].includes(status) || (Number(summary.missingCount)||0) \u003e 0 || (Number(summary.partialCount)||0) \u003e 0 || (Number(summary.unknownCount)||0) \u003e 0; return needsRepair ? base : Math.min(base, 3000); })() }}"
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
    "jsCode":  "const normalizeDocumentType = value =\u003e String(value || \u0027test_plan\u0027)\n  .trim()\n  .toLowerCase()\n  .replace(/[^a-z0-9]+/g, \u0027_\u0027)\n  .replace(/^_+|_+$/g, \u0027\u0027) || \u0027test_plan\u0027;\n\nconst type = normalizeDocumentType($json.documentType);\nconst projectName = $json.projectName;\nconst productOwner = $json.productOwner;\nconst jobId = $json.jobId;\nconst retryContext = $json.retryContext || {};\nconst retryInstruction = String($json.retryInstruction || retryContext.retryInstruction || \u0027\u0027).trim();\nconst generationMode = String($json.generationMode || $json.input?.generationMode || retryContext.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027 ? \u0027update\u0027 : \u0027create\u0027;\nconst updateContext = ($json.updateContext \u0026\u0026 typeof $json.updateContext === \u0027object\u0027) ? $json.updateContext : ($json.input?.updateContext \u0026\u0026 typeof $json.input.updateContext === \u0027object\u0027 ? $json.input.updateContext : {});\nconst traceabilityContext = $json.traceabilityContext || {};\nconst configSnapshot = $json.configSnapshot || {};\nconst runtimeGenerationModel = configSnapshot.models?.generationModel || configSnapshot.models?.generation_model || \u0027runtime-configured\u0027;\nconst runtimeChromaCollection = configSnapshot.chroma?.collection || configSnapshot.vectorStore?.collection || \u0027runtime-configured\u0027;\n\nfunction buildTwoLayerRtmInstructions(type, context) {\n  if (type !== \u0027traceability_matrix\u0027 || !context || context.version !== \u0027two_layer_rtm_v1\u0027) return \u0027\u0027;\n  const compact = {\n    version: context.version,\n    projectId: context.projectId,\n    projectName: context.projectName,\n    backlogJobId: context.backlogJobId,\n    storyTestCaseJobId: context.storyTestCaseJobId,\n    counts: context.counts,\n    epics: context.epics || [],\n    stories: context.stories || [],\n    storyTestCaseLinks: context.storyTestCaseLinks || [],\n    storiesWithoutTestCases: context.storiesWithoutTestCases || [],\n    freshness: context.freshness || {}\n  };\n  return [\n    \u0027==============================\u0027,\n    \u0027TWO-LAYER REQUIREMENT TRACEABILITY INPUT\u0027,\n    \u0027==============================\u0027,\n    \u0027\u0027,\n    \u0027Generate a true Requirement Traceability Matrix with exactly two traceability layers.\u0027,\n    \u0027\u0027,\n    \u0027Use only actual Jira epic keys, story keys, and test case keys supplied in this context.\u0027,\n    \u0027Do not invent Risk IDs, Test Case IDs, Epic IDs, Story IDs, automation statuses, Jira links, requirement counts, model names, or vector collection names.\u0027,\n    \u0027Risk IDs are not available in the current RTM context. Do not include a Risk ID column. If risk linkage is needed, write \"Risk linkage not generated in this run\" in narrative text only.\u0027,\n    \u0027Do not write the phrase \"Risk ID\" anywhere in the final RTM output. Use \"risk linkage\" only for any short explanatory note.\u0027,\n    \u0027If a draft contains any Risk ID or risk identifier column, remove that column before final answer and keep the RTM limited to the two supported traceability layers.\u0027,\n    \u0027Automation execution status is not available in the current RTM context. Do not include an Automation Status column or automation percentage. A short narrative note saying automation status was not available is allowed.\u0027,\n    \u0027\u0027,\n    \u0027Markdown table safety rules:\u0027,\n    \u0027- Never put the pipe character | inside any table cell.\u0027,\n    \u0027- Source references inside tables must use this format: DocType - FileName - Section - chunkId:abc123.\u0027,\n    \u0027- If source metadata has a composite chunkId such as uuid|page|index|source, keep only the uuid or rewrite it with hyphens. Never copy the pipe-delimited form into a table.\u0027,\n    \u0027- Do not use bracketed source references like [FRD | file | section | chunkId] inside tables.\u0027,\n    \u0027- Every row in a table must have exactly the same number of columns as its header.\u0027,\n    \u0027- Do not use range shorthand such as KAN-560..KAN-570. List actual keys from the supplied context.\u0027,\n    \u0027\u0027,\n    \u0027Required output sections, exactly once and in this order:\u0027,\n    \u00271. Executive Coverage Summary\u0027,\n    \u00272. Layer 1 - Requirements to Epics/User Stories\u0027,\n    \u00273. Layer 1 Gaps - Requirements Without Backlog Coverage\u0027,\n    \u00274. Layer 2 - User Stories to Generated Test Cases\u0027,\n    \u00275. Layer 2 Gaps - Stories Without Test Case Coverage\u0027,\n    \u00276. Coverage by Test Category\u0027,\n    \u00277. Coverage Ledger\u0027,\n    \u00278. Governance \u0026 Audit Readiness Commentary\u0027,\n    \u0027\u0027,\n    \u0027Section 2 must contain exactly this table schema:\u0027,\n    \u0027| Req ID | Requirement Description | Source Reference | Design Component | Jira Epic Key | Jira Story Key | Backlog Coverage Status | Traceability Notes |\u0027,\n    \u0027\u0027,\n    \u0027Section 4 must contain exactly this table schema:\u0027,\n    \u0027| Story Key | Story Summary | Test Case Keys | Unique Test Case Count | Test Categories | Test Coverage Status | Traceability Notes |\u0027,\n    \u0027\u0027,\n    \u0027Section 6 must contain exactly this table schema:\u0027,\n    \u0027| Test Category | Coverage Scope | Evidence Basis | Notes |\u0027,\n    \u0027\u0027,\n    \u0027Section 7 must contain exactly this table schema:\u0027,\n    \u0027| Coverage ID | Module / Requirement | Source Reference | Included In Output | Coverage Status | Notes |\u0027,\n    \u0027\u0027,\n    \u0027Do not include a legacy \"Main Requirement Traceability Matrix Table\" section.\u0027,\n    \u0027Do not repeat Coverage Ledger.\u0027,\n    \u0027Executive summary counts must match the actual supplied context and generated ledger. If there are 13 ledger items, do not say 38 requirements.\u0027,\n    \u0027Do not claim requirements are implemented, tested, validated, verified, passed, executed, or production-ready unless that status is present in supplied execution evidence.\u0027,\n    \u0027Layer 1 Traceability Notes must describe traceability state only, for example: \"Mapped to backlog and generated test-case coverage; implementation and execution status not assessed.\"\u0027,\n    \u0027Coverage by Test Category must not use a misleading \"Number of Test Cases\" column unless numeric category counts are available from supplied metadata. Use Coverage Scope and Evidence Basis instead.\u0027,\n    \u0027\u0027,\n    \u0027RTM freshness status: \u0027 + (context.freshness?.status || \u0027unknown\u0027) + \u0027. If status is warning, mention that the RTM is generated with freshness warnings and do not imply upstream artifacts are fully current.\u0027,\n    \u0027Two-layer traceability context JSON:\u0027,\n    JSON.stringify(compact)\n  ].join(\u0027\\n\u0027);\n}\n\n\nconst canonical = values =\u003e [...new Set(values.filter(Boolean))];\n\nfunction buildRtmUpdateInstructions(type, generationMode, updateContext, context) {\n  if (type !== \u0027traceability_matrix\u0027 || generationMode !== \u0027update\u0027) return \u0027\u0027;\n  const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];\n  const previousCoverageSummary = updateContext.previousCoverageSummary || {};\n  const previousBatchSummary = updateContext.previousBatchSummary || {};\n  const compactUpdateContext = {\n    previousJobId: updateContext.previousJobId || null,\n    previousDocumentType: updateContext.previousDocumentType || null,\n    previousConfluencePageId: updateContext.previousConfluencePageId || null,\n    previousConfluenceUrl: updateContext.previousConfluenceUrl || null,\n    previousCreatedAt: updateContext.previousCreatedAt || null,\n    previousCoverageSummary,\n    previousCoverageLedger,\n    previousBatchSummary,\n    currentBacklogJobId: context?.backlogJobId || null,\n    currentStoryTestCaseJobId: context?.storyTestCaseJobId || null,\n    currentCounts: context?.counts || {}\n  };\n\n  return [\n    \u0027==============================\u0027,\n    \u0027RTM UPDATE MODE\u0027,\n    \u0027==============================\u0027,\n    \u0027\u0027,\n    \u0027This is an update of an existing Requirement Traceability Matrix.\u0027,\n    \u0027Use the current two-layer traceability context as the latest delta/current evidence for Jira Epics, User Stories, and Story Test Case links.\u0027,\n    \u0027Merge this evidence with the previous RTM baseline. The previous RTM coverage rows are presumed preserved unless current evidence explicitly marks a requirement removed, deleted, superseded, or out of scope.\u0027,\n    \u0027Absence of a previous requirement from the current context is not by itself a removal, because upstream Backlog/STC update outputs may be delta-shaped.\u0027,\n    \u0027If current evidence adds new requirements, story mappings, or test case links, add those rows while preserving unaffected previous RTM rows.\u0027,\n    \u0027If current evidence changes an existing requirement mapping, update that row and list it as updated in a short RTM Update Summary near the top of the document.\u0027,\n    \u0027If current evidence explicitly removes a requirement or mapping, remove it and list the exact Coverage ID in the RTM Update Summary.\u0027,\n    \u0027If current evidence shows no traceability change, state clearly: \"No traceability changes were detected in the current source context.\"\u0027,\n    \u0027The final RTM must be the complete merged current-state RTM, not a delta-only patch note.\u0027,\n    \u0027Do not invent coverage. Preserve stable mappings from the previous RTM when current evidence does not contradict them.\u0027,\n    \u0027\u0027,\n    \u0027RTM update context JSON:\u0027,\n    JSON.stringify(compactUpdateContext)\n  ].join(\u0027\\n\u0027);\n}\n\nconst retrievalProfiles = {\n  test_strategy: {\n    label: \u0027Enterprise Test Strategy\u0027,\n    intent: \u0027Prioritize business goals, quality governance, scope, architecture implications, automation strategy, NFRs, risk, metrics, and operating model evidence.\u0027,\n    primaryDocTypes: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027PRD\u0027, \u0027SRS\u0027, \u0027HLD\u0027, \u0027LLD\u0027, \u0027TRANSCRIPT\u0027],\n    secondaryDocTypes: [\u0027UI_UX\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027, \u0027ARCHITECTURE\u0027, \u0027TEST_PLAN\u0027, \u0027TEST_CASES\u0027],\n    preferredCategories: [\u0027business_requirements\u0027, \u0027functional_requirements\u0027, \u0027technical_design\u0027, \u0027stakeholder_conversation\u0027, \u0027quality_assurance\u0027],\n    preferredArtifacts: [\u0027business_requirements_document\u0027, \u0027functional_requirements_document\u0027, \u0027high_level_design\u0027, \u0027low_level_design\u0027, \u0027architecture_document\u0027, \u0027meeting_transcript\u0027],\n    sectionKeywords: [\u0027strategy\u0027, \u0027scope\u0027, \u0027risk\u0027, \u0027quality\u0027, \u0027automation\u0027, \u0027governance\u0027, \u0027nfr\u0027, \u0027performance\u0027, \u0027security\u0027, \u0027architecture\u0027, \u0027dependency\u0027, \u0027metric\u0027]\n  },\n  test_plan: {\n    label: \u0027Enterprise Test Plan\u0027,\n    intent: \u0027Prioritize functional scope, test objectives, entry/exit criteria, environments, data, risks, milestones, roles, automation coverage, and traceability evidence.\u0027,\n    primaryDocTypes: [\u0027FRD\u0027, \u0027SRS\u0027, \u0027BRD\u0027, \u0027PRD\u0027, \u0027HLD\u0027, \u0027LLD\u0027, \u0027TRANSCRIPT\u0027],\n    secondaryDocTypes: [\u0027UI_UX\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027, \u0027TEST_PLAN\u0027, \u0027TEST_CASES\u0027, \u0027ARCHITECTURE\u0027],\n    preferredCategories: [\u0027functional_requirements\u0027, \u0027business_requirements\u0027, \u0027technical_design\u0027, \u0027user_experience\u0027, \u0027quality_assurance\u0027, \u0027stakeholder_conversation\u0027],\n    preferredArtifacts: [\u0027functional_requirements_document\u0027, \u0027business_requirements_document\u0027, \u0027software_requirements_specification\u0027, \u0027high_level_design\u0027, \u0027low_level_design\u0027, \u0027ui_ux_artifact\u0027],\n    sectionKeywords: [\u0027scope\u0027, \u0027objective\u0027, \u0027requirement\u0027, \u0027workflow\u0027, \u0027test data\u0027, \u0027environment\u0027, \u0027risk\u0027, \u0027entry\u0027, \u0027exit\u0027, \u0027milestone\u0027, \u0027automation\u0027, \u0027coverage\u0027]\n  },\n  test_cases: {\n    label: \u0027Enterprise Test Cases\u0027,\n    intent: \u0027Prioritize acceptance criteria, validation rules, UI behavior, API/integration behavior, edge cases, negative scenarios, test scenarios, and expected results.\u0027,\n    primaryDocTypes: [\u0027FRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n    secondaryDocTypes: [\u0027BRD\u0027, \u0027PRD\u0027, \u0027TRANSCRIPT\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027, \u0027HLD\u0027, \u0027LLD\u0027],\n    preferredCategories: [\u0027functional_requirements\u0027, \u0027user_experience\u0027, \u0027quality_assurance\u0027, \u0027technical_design\u0027, \u0027business_requirements\u0027],\n    preferredArtifacts: [\u0027functional_requirements_document\u0027, \u0027software_requirements_specification\u0027, \u0027ui_ux_artifact\u0027, \u0027test_cases\u0027, \u0027test_plan\u0027, \u0027api_specification\u0027],\n    sectionKeywords: [\u0027acceptance\u0027, \u0027validation\u0027, \u0027field\u0027, \u0027error\u0027, \u0027exception\u0027, \u0027edge\u0027, \u0027negative\u0027, \u0027precondition\u0027, \u0027expected result\u0027, \u0027test\u0027, \u0027scenario\u0027, \u0027api\u0027, \u0027workflow\u0027]\n  },\n  risk_matrix: {\n    label: \u0027Risk Assessment Matrix\u0027,\n    intent: \u0027Prioritize architectural complexity, integration dependencies, NFRs, security, data integrity, delivery risk, operational risk, and business criticality evidence.\u0027,\n    primaryDocTypes: [\u0027HLD\u0027, \u0027LLD\u0027, \u0027ARCHITECTURE\u0027, \u0027FRD\u0027, \u0027SRS\u0027, \u0027BRD\u0027],\n    secondaryDocTypes: [\u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027, \u0027TRANSCRIPT\u0027, \u0027UI_UX\u0027, \u0027TEST_PLAN\u0027],\n    preferredCategories: [\u0027technical_design\u0027, \u0027functional_requirements\u0027, \u0027business_requirements\u0027, \u0027stakeholder_conversation\u0027, \u0027quality_assurance\u0027],\n    preferredArtifacts: [\u0027high_level_design\u0027, \u0027low_level_design\u0027, \u0027architecture_document\u0027, \u0027api_specification\u0027, \u0027data_model\u0027, \u0027functional_requirements_document\u0027],\n    sectionKeywords: [\u0027risk\u0027, \u0027dependency\u0027, \u0027constraint\u0027, \u0027assumption\u0027, \u0027security\u0027, \u0027performance\u0027, \u0027scalability\u0027, \u0027integration\u0027, \u0027failure\u0027, \u0027mitigation\u0027, \u0027contingency\u0027]\n  },\n  traceability_matrix: {\n    label: \u0027Requirement Traceability Matrix\u0027,\n    intent: \u0027Prioritize requirement IDs, business and functional requirements, acceptance criteria, design components, test coverage, risk mapping, and automation coverage evidence.\u0027,\n    primaryDocTypes: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027PRD\u0027, \u0027SRS\u0027],\n    secondaryDocTypes: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027, \u0027UI_UX\u0027, \u0027API_SPEC\u0027, \u0027HLD\u0027, \u0027LLD\u0027, \u0027TRANSCRIPT\u0027],\n    preferredCategories: [\u0027business_requirements\u0027, \u0027functional_requirements\u0027, \u0027quality_assurance\u0027, \u0027user_experience\u0027, \u0027technical_design\u0027],\n    preferredArtifacts: [\u0027business_requirements_document\u0027, \u0027functional_requirements_document\u0027, \u0027software_requirements_specification\u0027, \u0027test_cases\u0027, \u0027test_plan\u0027],\n    sectionKeywords: [\u0027requirement\u0027, \u0027req\u0027, \u0027acceptance\u0027, \u0027traceability\u0027, \u0027business rule\u0027, \u0027coverage\u0027, \u0027test case\u0027, \u0027test scenario\u0027, \u0027design component\u0027]\n  },\n  user_stories: {\n    label: \u0027Agile User Stories\u0027,\n    intent: \u0027Prioritize business requirements, functional requirements, UI/UX flows, stakeholder context, integrations, validation rules, NFRs, and acceptance criteria.\u0027,\n    primaryDocTypes: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027PRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027TRANSCRIPT\u0027],\n    secondaryDocTypes: [\u0027HLD\u0027, \u0027LLD\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027, \u0027ARCHITECTURE\u0027, \u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n    preferredCategories: [\u0027business_requirements\u0027, \u0027functional_requirements\u0027, \u0027user_experience\u0027, \u0027stakeholder_conversation\u0027, \u0027technical_design\u0027, \u0027quality_assurance\u0027],\n    preferredArtifacts: [\u0027business_requirements_document\u0027, \u0027functional_requirements_document\u0027, \u0027ui_ux_artifact\u0027, \u0027meeting_transcript\u0027, \u0027api_specification\u0027, \u0027data_model\u0027],\n    sectionKeywords: [\u0027requirement\u0027, \u0027business rule\u0027, \u0027user journey\u0027, \u0027workflow\u0027, \u0027screen\u0027, \u0027validation\u0027, \u0027acceptance\u0027, \u0027integration\u0027, \u0027api\u0027, \u0027nfr\u0027, \u0027exception\u0027, \u0027error\u0027]\n  },\n  default: {\n    label: \u0027General QA Document\u0027,\n    intent: \u0027Prioritize requirements, validation, acceptance criteria, risks, assumptions, tests, UI, integrations, and NFR evidence.\u0027,\n    primaryDocTypes: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n    secondaryDocTypes: [\u0027PRD\u0027, \u0027TRANSCRIPT\u0027, \u0027HLD\u0027, \u0027LLD\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027, \u0027ARCHITECTURE\u0027],\n    preferredCategories: [\u0027business_requirements\u0027, \u0027functional_requirements\u0027, \u0027quality_assurance\u0027, \u0027user_experience\u0027, \u0027technical_design\u0027, \u0027stakeholder_conversation\u0027],\n    preferredArtifacts: [\u0027business_requirements_document\u0027, \u0027functional_requirements_document\u0027, \u0027test_cases\u0027, \u0027test_plan\u0027, \u0027ui_ux_artifact\u0027],\n    sectionKeywords: [\u0027requirement\u0027, \u0027validation\u0027, \u0027acceptance\u0027, \u0027test\u0027, \u0027scenario\u0027, \u0027risk\u0027, \u0027assumption\u0027, \u0027dependency\u0027, \u0027integration\u0027, \u0027nfr\u0027]\n  }\n};\n\nfunction getRetrievalProfile(type) {\n  return retrievalProfiles[type] || retrievalProfiles.default;\n}\n\nfunction getDocTypeFilter(type) {\n  const profile = getRetrievalProfile(type);\n  const aliases = {\n    UI_UX: [\u0027UI_UX\u0027, \u0027UI/UX\u0027],\n  };\n  return canonical(profile.primaryDocTypes.concat(profile.secondaryDocTypes).flatMap(value =\u003e aliases[value] || [value]));\n}\n\nfunction resolveContentSources() {\n  return [\u0027text\u0027, \u0027image\u0027];\n}\n\n\n\nfunction buildSharedDeltaUpdateInstructions(type, generationMode, updateContext, profile) {\n  const sharedTypes = new Set([\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027]);\n  if (!sharedTypes.has(type) || generationMode !== \u0027update\u0027) return \u0027\u0027;\n  const updateReasons = Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons : [];\n  const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];\n  const previousUpdateSummary = updateContext.previousUpdateSummary || {};\n  const previousTokenUsage = updateContext.previousTokenUsage || {};\n  const sectionHints = {\n    test_strategy: [\u0027Introduction \u0026 Context\u0027, \u0027Testing Scope\u0027, \u0027Strategic Testing Approach\u0027, \u0027Automation Strategy \u0026 Roadmap\u0027, \u0027Quality Metrics \u0026 Reporting Framework\u0027, \u0027Risk-Based Testing \u0026 Mitigation Strategy\u0027, \u0027Appendix / Coverage Ledger\u0027],\n    test_plan: [\u0027Scope\u0027, \u0027Test Objectives\u0027, \u0027Entry and Exit Criteria\u0027, \u0027Risks, Mitigation \u0026 Contingency Plan\u0027, \u0027Test Environment\u0027, \u0027Test Data and Configurations\u0027, \u0027Automation Coverage Matrix\u0027, \u0027Appendix / Coverage Ledger\u0027],\n    risk_matrix: [\u0027Executive Summary\u0027, \u0027Risk Register Summary\u0027, \u0027Risk Detail Register\u0027, \u0027Risk Heat Map Summary\u0027, \u0027Top Critical Risks Analysis\u0027, \u0027Linkage to Test Strategy Alignment\u0027, \u0027Coverage Ledger\u0027]\n  };\n  const compactContext = {\n    previousJobId: updateContext.previousJobId || null,\n    previousDocumentType: updateContext.previousDocumentType || null,\n    previousConfluencePageId: updateContext.previousConfluencePageId || null,\n    previousConfluenceUrl: updateContext.previousConfluenceUrl || null,\n    previousCreatedAt: updateContext.previousCreatedAt || null,\n    updateReasons,\n    contextUpdated: Boolean(updateContext.contextUpdated),\n    previousCoverageRows: previousCoverageLedger.length,\n    previousCoverageSummary: updateContext.previousCoverageSummary || {},\n    previousUpdateSummary,\n    previousTokenUsage,\n    likelyImpactedSections: sectionHints[type] || [],\n    retrievalProfile: profile?.label || type\n  };\n\n  return [\n    \u0027==============================\u0027,\n    \u0027SHARED_DELTA_UPDATE_V8\u0027,\n    \u0027==============================\u0027,\n    \u0027\u0027,\n    \u0027This is a cost-optimized update patch for an existing shared QA deliverable.\u0027,\n    \u0027Output updated sections only when the existing Confluence page is complete. If the prior page or prior coverage metadata is incomplete, missing, partial, or warning, output the full affected canonical sections needed to repair the final document.\u0027,\n    \u0027The workflow merges this update with the existing Confluence page and refuses to publish if preserved sections or coverage are dropped.\u0027,\n    \u0027Target 700-1400 words. Do not restate stable sections. Only describe sections that changed, were added, were removed, or need review.\u0027,\n    \u0027If no material source or coverage change exists and prior coverage was already complete, return only Delta Update Summary and state that no content changes were needed.\u0027,\n    \u0027If previousCoverageSummary reports missing, partial, unknown, warning, failed, not_reported, or previousCoverageRows is 0, treat Coverage Ledger and related sections as updated or needs_review. Do not return a no-change update until the current output repairs or explicitly explains the coverage gap.\u0027,\n    \u0027\u0027,\n    \u0027Required patch sections:\u0027,\n    \u00271. Delta Update Summary\u0027,\n    \u00272. Updated or Added Sections\u0027,\n    \u00273. Preserved Sections\u0027,\n    \u00274. Coverage Ledger Delta\u0027,\n    \u0027\u0027,\n    \u0027Delta Update Summary must contain a markdown table with exactly these columns:\u0027,\n    \u0027| Section | Action | Reason | Evidence Reference | Review Status |\u0027,\n    \u0027Use Action values only from: updated, added, removed, preserved, no_change, needs_review.\u0027,\n    \u0027Normalize section names to the likely impacted section names from the context. Do not use short aliases if a canonical section name exists.\u0027,\n    \u0027\u0027,\n    \u0027Evidence rules:\u0027,\n    \u0027- Every updated, added, or removed row must cite a direct retrieved evidence reference with a concrete chunkId.\u0027,\n    \u0027- Do not use broad references such as derived from FRD/LLD, grooming insights, internal compilation, multiple documents, or personas and transcripts.\u0027,\n    \u0027- If direct evidence is unavailable, set Action to needs_review, Review Status to Needs review, and explain the missing evidence plainly.\u0027,\n    \u0027- Coverage Ledger Delta rows with broad or inferred evidence must be marked partial or needs_review, not covered.\u0027,\n    \u0027\u0027,\n    \u0027Preservation rules:\u0027,\n    \u0027- Preserved Sections should be a compact list or compact table. Do not rewrite preserved content.\u0027,\n    \u0027- Do not list a section as preserved if the same canonical section is updated, added, removed, or needs_review.\u0027,\n    \u0027\u0027,\n    \u0027Shared document update context JSON:\u0027,\n    JSON.stringify(compactContext)\n  ].join(\u0027\\n\u0027);\n}\n\nfunction buildRetrievalProfileInstructions(profile, type, projectName, compositeKeys) {\n  const allDocTypes = canonical(profile.primaryDocTypes.concat(profile.secondaryDocTypes));\n  const queryFacets = canonical([\n    profile.intent,\n    profile.primaryDocTypes.join(\u0027 \u0027),\n    profile.preferredCategories.join(\u0027 \u0027),\n    profile.preferredArtifacts.join(\u0027 \u0027),\n    profile.sectionKeywords.join(\u0027 \u0027)\n  ]);\n  const lines = [\n    \u0027==============================\u0027,\n    \u0027METADATA RETRIEVAL PROFILE\u0027,\n    \u0027==============================\u0027,\n    \u0027\u0027,\n    \u0027Use Chroma retrieval with metadata.project as the hard project boundary.\u0027,\n    \u0027Project hard filter: project = \u0027 + projectName,\n    \u0027Requested document type: \u0027 + type,\n    \u0027Profile: \u0027 + profile.label,\n    \u0027Profile intent: \u0027 + profile.intent,\n    \u0027\u0027,\n    \u0027Retrieval execution rules:\u0027,\n    \u00271. Use at most 2 Chroma retrieval calls. Start with the profile intent and primary document types; if evidence is weak, use one narrower follow-up with section keywords. Do not keep retrying retrieval. Suggested facets: \u0027 + queryFacets.join(\u0027 / \u0027) + \u0027.\u0027,\n    \u00272. Prefer primary docTypes first, then secondary docTypes. Primary docTypes: \u0027 + profile.primaryDocTypes.join(\u0027, \u0027) + \u0027.\u0027,\n    \u00273. Deduplicate retrieved evidence by chunkId first, then by fileName + sectionTitle + contentSource.\u0027,\n    \u00274. Maintain source diversity where available. Use evidence from requirements, design, transcripts/workshops, QA seed, API/UI/data sources as relevant to this document type.\u0027,\n    \u00275. Treat label-only pageContent such as technical_design, quality_assurance, or functional_requirements as weak metadata-only evidence. Do not quote it as source text.\u0027,\n    \u00276. Every citation, source reference, and Coverage Ledger source must be copied from retrieved metadata. Do not cite files, sections, or chunkIds that were not retrieved.\u0027,\n    \u00277. If a required evidence class is not retrieved after the capped retrieval calls, mark the related item partial or missing instead of inventing a source.\u0027,\n    \u00278. HARD EVIDENCE RULE: before writing, create a mental selected-evidence set from Chroma results after removing duplicate chunkIds and metadata-only records. Build the document only from that selected-evidence set.\u0027,\n    \u00279. HARD SOURCE BALANCE RULE: do not let one QA seed/supporting file dominate. Unless it is the only useful source, use no more than 2 ledger rows from the same file and include requirements/design/transcript/API/UI evidence when available.\u0027,\n    \u002710. HARD METADATA-ONLY RULE: ignore Chroma records whose body is only a docType, documentCategory, artifactType, file name, composite key, or label such as technical_design, quality_assurance, functional_requirements, business_requirements, high_level_design, low_level_design, test_plan_document, or TEST_PLAN.\u0027,\n    \u002711. HARD LEDGER RULE: Coverage Ledger source references must point to direct retrieved evidence. Broad references such as TRANSCRIPT, TEST_PLAN documents combined, and others, multiple documents, or source combinations are invalid. If a row needs more than one source, list exact source references separated with semicolons and include chunkId for each.\u0027,\n    \u0027QOPS_EVIDENCE_HARDENING_V1\u0027,\n    \u0027\u0027,\n    \u0027When using the Chroma Vector Store tool, prefer chunks with these metadata values:\u0027,\n    \u0027- Primary docTypes: \u0027 + profile.primaryDocTypes.join(\u0027, \u0027),\n    \u0027- Secondary docTypes: \u0027 + profile.secondaryDocTypes.join(\u0027, \u0027),\n    \u0027- Preferred documentCategory values: \u0027 + profile.preferredCategories.join(\u0027, \u0027),\n    \u0027- Preferred artifactType values: \u0027 + profile.preferredArtifacts.join(\u0027, \u0027),\n    \u0027- Preferred contentSource values: text, image\u0027,\n    \u0027- Preferred section/content keywords: \u0027 + profile.sectionKeywords.join(\u0027, \u0027),\n    \u0027\u0027,\n    \u0027Source reference rules:\u0027,\n    \u0027- Use exact source metadata in this compact format: DocType - FileName - SectionTitle - chunkId:FULL_CHUNK_ID.\u0027,\n    \u0027- Never use pipe characters in source references inside tables.\u0027,\n    \u0027- Never shorten chunk IDs with ellipses. Use the full chunkId when it is available.\u0027,\n    \u0027- Never use bracketed source references like [BRD | file | section | chunkId] in tables.\u0027,\n    \u0027\u0027,\n    \u0027Useful compositeKey candidates for this project/profile:\u0027,\n    compositeKeys.slice(0, 30).join(\u0027, \u0027) || \u0027None\u0027\n  ];\n\n  return lines.join(\u0027\\n\u0027);\n}\n\nconst contentSources = resolveContentSources(type);\nconst retrievalProfile = getRetrievalProfile(type);\n\nconst compositeKeys = [];\n\nfor (const docType of getDocTypeFilter(type)) {\n  for (const source of contentSources) {\n    compositeKeys.push(projectName + \u0027|\u0027 + docType + \u0027|\u0027 + source);\n  }\n}\n\nconst retrievalProfileInstructions = buildRetrievalProfileInstructions(retrievalProfile, type, projectName, compositeKeys);\n\nconst promptLibrary = {\n  test_strategy: {\n    title: \"Enterprise Test Strategy\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Strategy\nGenerated On: {{ $now }}\nModel: ${runtimeGenerationModel}\nVector Collection: ${runtimeChromaCollection}\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Manager and Enterprise Test Strategy Consultant with more than 15 years of experience defining testing standards, quality governance frameworks, and automation-first transformation programs. \n\nYou specialize in:\n- Shift-Left \u0026 Shift-Right quality engineering approaches\n- CI/CD-integrated automated testing pipelines\n- Scalable test architecture across UI, API, performance, and security layers\n- Risk-based and metrics-driven software delivery governance\n\nYou excel at interpreting and synthesizing:\n- Business Requirement Documents (BRD)\n- Functional Requirement Documents (FRD)\n- Low-Level and High-Level Designs (LLD \u0026 HLD)\n- Grooming transcripts and stakeholder discussions\n\nYour outputs must demonstrate:\n- Strategic reasoning supported by traceable statements from the provided context\n- A strong linkage between **business intent ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ architecture/design implications ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ test strategy ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ automation enablement ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ risk mitigation**\n- A structured, enterprise-grade quality strategy suitable for CXO/leadership consumption\n- Deep elaboration, beyond basic [REDACTED] points, showing practical execution methodologies, governance layers, and measurable KPIs\n\nYour writing style should reflect:\n- Professional tone suitable for board-level review\n- Detailed, actionable, and solution-oriented content with clear justification\n- Balanced technical and managerial viewpoint\n`,\n    user: `You are provided with a vector store that combines information from BRD, FRD, HLD, LLD, UI/UX specifications, and grooming session transcripts. \nThis content includes requirements, workflows, data flows, system architecture, constraints, dependencies, and stakeholder expectations.\n\nYour task is to analyze and generate a **comprehensive and production-grade Test Strategy document**, aligned with **Shift-Left**, **Automation-First**, and **Quality Engineering** principles.\n\n=========================\nINSTRUCTIONS (MUST FOLLOW)\n=========================\n\n1. Use direct excerpts or paraphrased statements from the source materials where relevant.\n   - Quote key statements in italics or blockquotes to maintain authenticity.\n   - Cite origin using ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œAs mentioned in BRDÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â, ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œAccording to HLDÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â, etc.\n2. Provide deep explanation instead of generic bullet lists ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â elaborate how and why decisions are made.\n3. Demonstrate end-to-end traceability between:\n   **business requirements ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ test strategy ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ automation enablement ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ quality metrics ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ risk \u0026 mitigation**\n4. Include frameworks, methodology, and governance recommendations.\n5. Use tables, matrices, and hierarchical bullet structures where beneficial.\n6. Minimum expected length per major section: **900 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ 1500 words**.\n7. The output must be detailed enough to be presented to engineering leadership and auditors.\n\n====================\nDOCUMENT STRUCTURE\n====================\n\n### Test Strategy Document Structure\n\n1. **Introduction \u0026 Context**\n   - Problem statement \u0026 business need\n   - Strategic objectives of testing\n   - Alignment with enterprise quality vision and success criteria\n\n2. **Testing Scope**\n   - In-scope functional \u0026 non-functional areas (with references)\n   - Out-of-scope items \u0026 rationale\n\n3. **Strategic Testing Approach**\n   - Shift-Left adoption strategy\n   - Shift-Right validation strategy (where applicable)\n   - Testing model (Agile / DevOps / CI-CD-based)\n   - Test levels: Unit, Component, API, UI, E2E, UAT, NFR\n   - Governance and quality gates\n\n4. **Automation Strategy \u0026 Roadmap**\n   - Automation pyramid model alignment\n   - Tools, frameworks, CI/CD orchestration\n   - Prioritization matrix \u0026 ROI considerations\n   - In-sprint automation approach\n   - Resilience \u0026 maintainability standards\n\n5. **Test Environment \u0026 Infrastructure Strategy**\n   - Environment model \u0026 provisioning\n   - Service virtualization \u0026 mocks\n   - Data refresh, versioning \u0026 cloning strategies\n\n6. **Test Data Management Strategy**\n   - Data sourcing (synthetic, masked, production-like)\n   - Boundary / negative / chaos data\n   - Automation-driven data pipeline\n\n7. **Quality Metrics \u0026 Reporting Framework**\n   - KPIs, KRAs, SLAs (Defect density, leakage rate, DRE %, automation coverage etc.)\n   - Dashboards \u0026 transparency mechanisms\n\n8. **Risk-Based Testing \u0026 Mitigation Strategy**\n   - Identified risks + corresponding mitigation \u0026 contingency mapping\n   - Priority-based testing means: risk ÃƒÆ’Ã¢â‚¬â€ impact ÃƒÆ’Ã¢â‚¬â€ likelihood scoring\n\n9. **Roles, Collaboration \u0026 RACI Model**\n\n10. **Compliance, Security \u0026 Regulatory Considerations**\n    - OWASP, data privacy, audit logs, adherence requirements\n\n11. **Tooling \u0026 Integration Landscape**\n    - CI/CD, test frameworks, monitoring \u0026 observability\n\n12. **Communication \u0026 Governance Model**\n\n13. **Appendix / Traceability Matrix**\n    | Source Document | Key Insight | Test Strategy Implication | Automation Feasibility |\n`\n  },\n  test_plan: {\n    title: \"Enterprise Test Plan\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Plan\nGenerated On: {{ $now }}\nModel: ${runtimeGenerationModel}\nVector Collection: ${runtimeChromaCollection}\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Manager with over 15 years of experience leading large-scale enterprise testing programs. \nYou specialize in Shift-Left Quality and Automation-First approaches, integrating QA deeply within CI/CD pipelines.\nYou have extensive experience in transforming raw business and technical documentation into actionable, data-driven, and traceable test strategies.\n\nYou are skilled at reading and interpreting:\n- Business Requirement Documents (BRD)\n- Functional Requirement Documents (FRD)\n- Low-Level Designs (LLD)\n- High-Level Designs (HLD)\n- Grooming session transcripts and stakeholder discussions\n\nYour outputs must demonstrate:\n- Analytical reasoning based directly on excerpts or statements from the provided context.\n- A clear connection between **requirement intent**, **test coverage**, **automation feasibility**, and **risk mitigation \u0026 risk contingency**.\n- A focus on measurable, proactive quality metrics, and early defect prevention.\n- Realistic and context-aware alignment with Shift-Left and Automation-First principles.\n`,\n    user: `You are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI specs, and stakeholder discussions via vector search.. It may include requirements, features, workflows, functional and non-functional details, and stakeholder discussions.\n\nYour task is to analyze the provided context carefully and generate a **comprehensive, professional, and context-grounded Test Plan** aligned with Shift-Left and Automation-First principles.\n\n### Instructions:\n1. Use **direct excerpts or paraphrased statements** from the provided context sources wherever applicable. \n   - Quote important phrases in italics or blockquotes to preserve authenticity.\n   - Reference their origin (e.g., ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œAs mentioned in BRDÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â or ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œAccording to LLD sectionÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â).\n2. Demonstrate clear traceability between **requirements ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ testing objectives ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ automation approach ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ risk mitigation \u0026 risk contingency.**\n3. For every key area (test strategy, scope, risks, etc.), link back to **specific project elements or statements** from the input documents.\n4. Use tables or bullet lists where appropriate to make the Test plan readable and well-structured.\n5. Generate detailed, structured, and exhaustive content. Expand on reasoning and provide elaborated explanations rather than short bullet points. Do not compress meaning.\n6. Minimum output length: 700ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“1200 words per section (unless insufficient context exists).\n7. For every claim or statement, reference the originating document (BRD, FRD, HLD, LLD, Transcript).\n\n### Structure the Test Plan as follows:\n1. **Test Strategy** ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Include how Shift-Left and Automation-First are embedded. Reference early testing opportunities from the design or grooming stages.\n2. **Scope** ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Distinguish in-scope vs. out-of-scope features, based on specific content from the documents.\n3. **Test Objectives** ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Mention objectives tied to functional or non-functional requirements.\n4. **Test Deliverables**\n5. **Entry and Exit Criteria**\n6. **Test Schedule and Milestones**\n7. **Risks, Mitigation \u0026 Contingency Plan** ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Mention risks cited in the documents or inferred from complexity areas. Also map each risk with Mitigation \u0026 Contigency Plan.\n8. **Test Environment** ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Include CI/CD, environment provisioning, and test data setup strategies.\n9. **Tools and Resources** ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Reference relevant automation or workflow tools mentioned or implied in the docs.\n10. **Roles and Responsibilities**\n11. **Test Data and Configurations** ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Include synthetic data strategy or test coverage automation if applicable.\n12. **Reporting and Communication Plan** ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Mention dashboards, metrics, and traceability matrices.\n13. **Suspension \u0026 Resumption Criteria**\n14. **Assumptions \u0026 Dependencies**\n15. **Automation Coverage Matrix**\n16. **Test Coverage Metrics**\n17, **Approval \u0026 Sign-off**\n18. **Appendix (Optional)** ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Include a summarized mapping table:\n    | Source Document | Key Excerpt | Related Test Focus Area | Automation Feasibility |\n\nEnsure:\n- The output reads like a **real Test Plan prepared for stakeholders**, not an academic essay.\n- Each section has **specific references** to document content to establish credibility and traceability.\n- The tone is professional, precise, and easy to publish directly as part of QA governance documentation.`\n  },\n  test_cases: {\n    title: \"Enterprise Test Cases\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Cases\nGenerated On: {{ $now }}\nModel: ${runtimeGenerationModel}\nVector Collection: ${runtimeChromaCollection}\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Architect with 15+ years of experience designing enterprise-scale, risk-driven, automation-ready test cases.\n\nYou specialize in:\n- Requirement decomposition into test scenarios\n- Boundary \u0026 edge case design\n- Negative testing \u0026 failure modeling\n- API/UI/integration-level validations\n- Automation feasibility optimization\n\nYour outputs must:\n- Demonstrate traceability to retrieved requirements\n- Cover positive, negative, edge, alternate and exception flows\n- Align with automation-first strategy\n- Be production-ready for Jira/TestRail/Xray\n- Include risk tagging and priority classification\n\nAvoid generic test cases. Every case must be context-driven and realistic.\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI specs, and stakeholder discussions via vector search.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Identify distinct functional modules and workflows from the retrieved context.\n2. For each workflow, generate:\n   - Functional test cases\n   - Negative test cases\n   - Boundary value cases\n   - Integration scenarios\n   - Data validation scenarios\n   - Exception handling cases\n3. Each test case must include:\n\n| Test Case ID | Requirement Reference | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Priority | Risk Level | Automation Feasibility |\n\n4. Explicitly reference requirement origin:\n   - ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œAs described in BRD sectionÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â\n   - ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œAccording to HLD componentÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â\n5. Tag automation suitability (High / Medium / Low).\n6. Do not summarize ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â generate exhaustive coverage.\n\n========================\nCOVERAGE REQUIREMENTS\n========================\n\n- Minimum 20ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“40 test cases per major feature\n- Include API-level validations if architecture suggests services\n- Include data validation rules if UI forms are mentioned\n- Include failure simulation if integrations exist\n- Include security and performance-related validations if applicable\n\nOutput must be enterprise-grade and execution-ready.\n`\n  },\n  user_stories: {\n  title: \"Agile User Stories\",\n  system: `You are a Senior Product Owner and Business Analyst with 15+ years of experience defining enterprise-scale product requirements using Agile and Scrum frameworks.\n\nYou specialize in translating BRD, FRD, HLD, LLD, and stakeholder discussions into detailed INVEST-compliant Agile User Stories, Acceptance Criteria, Alternate Flows, and Test Scenarios.\n\nRules \u0026 Expectations:\n- Produce a **single structured output** in strict JSON format.\n- Follow a **hierarchical Agile model: Epic ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Multiple User Stories**.\n- Each Epic represents a high-level feature.\n- Each Epic MUST contain:\n  - epicId\n  - epicName\n  - epicDescription\n  - businessObjective\n  - successMetrics\n  - sourceTraceability\n\n- Each User Story must contain:\n  - userStoryId\n  - epicId\n  - feature\n  - userStory\n  - userStoryDescription\n  - businessContext\n  - primaryFlow\n  - alternateFlows\n  - exceptionHandling\n  - acceptanceCriteria\n  - uiUxRequirements\n  - fieldValidationRules\n  - dataIntegrationRequirements\n  - performanceNFRs\n  - testScenarios\n  - dependencies\n  - assumptions\n  - sourceTraceability\n  - automationFeasibility\n\n- Use markdown inside JSON string fields where needed.\n- Separate each story with the delimiter: --- USER_STORY_BREAK ---.\n- Ensure the JSON is **well-formed and parsable**.\n\nIMPORTANT:\n- DO NOT restrict to one story per feature.\n- Decompose features into **multiple small, testable, independent stories** wherever needed.\n- Prefer decomposition over large stories.\n\nYour task:\n1. Analyze the provided context from BRD, FRD, HLD, LLD, workflows, and transcripts.\n2. Extract **high-level features and convert them into Epics**.\n3. For each Epic:\n   - Generate a detailed **epicDescription** explaining scope, workflows, and business value.\n4. Dynamically create **one or more user stories per epic** based on complexity.\n5. Ensure **traceability** to source documents.\n6. Make output reusable across projects.`,\n  \n  user: `You are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI/UX specifications, and stakeholder discussions via vector search.\n\nYour task is to generate a single JSON object with the following structure:\n\n{\n  \"epics\": [\n    {\n      \"epicId\": \"EPIC-001\",\n      \"epicName\": \"Feature Name\",\n      \"epicDescription\": \"...\",\n      \"businessObjective\": \"...\",\n      \"successMetrics\": \"...\",\n      \"sourceTraceability\": \"...\"\n    }\n  ],\n  \"userStories\": [\n    {\n      \"userStoryId\": \"US-001\",\n      \"epicId\": \"EPIC-001\",\n      \"feature\": \"Feature Name\",\n      \"userStory\": \"...\",\n      \"userStoryDescription\": \"...\",\n      \"businessContext\": \"...\",\n      \"primaryFlow\": \"...\",\n      \"alternateFlows\": \"...\",\n      \"exceptionHandling\": \"...\",\n      \"acceptanceCriteria\": \"...\",\n      \"uiUxRequirements\": \"...\",\n      \"fieldValidationRules\": \"...\",\n      \"dataIntegrationRequirements\": \"...\",\n      \"performanceNFRs\": \"...\",\n      \"testScenarios\": \"...\",\n      \"dependencies\": \"...\",\n      \"assumptions\": \"...\",\n      \"sourceTraceability\": \"...\",\n      \"automationFeasibility\": \"...\"\n    }\n  ]\n}\n\n========================\nCRITICAL REQUIREMENTS\n========================\n\n1. EPIC GENERATION:\n- Convert each high-level feature into a structured Epic.\n- Provide a **detailed epicDescription** covering:\n  - Functional scope\n  - Key workflows\n  - Business value\n\n2. DYNAMIC STORY GENERATION (MANDATORY):\n- DO NOT generate only one story per epic.\n- Automatically decide number of user stories based on:\n  - Functional decomposition\n  - UI vs API separation\n  - Validation complexity\n  - Integration points\n  - Alternate \u0026 exception flows\n- Create MULTIPLE user stories for complex features.\n- Keep each story small, testable, and independently deliverable (INVEST).\n\n3. USER STORY DEPTH:\n- Each story must include **userStoryDescription** (detailed explanation).\n- Each story should be **concise but complete (200-300 words preferred)**.\n- Focus on clarity, decomposition, and independence rather than verbosity.\n- Include realistic:\n  - UI/UX behavior\n  - Field validations\n  - API/integration logic\n  - Edge cases\n\n4. TRACEABILITY:\n- Reference sources like:\n  - ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œAs mentioned in BRDÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â\n  - ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œAccording to HLDÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â\n\n5. FORMAT RULES:\n- Maintain valid JSON (no trailing commas).\n- Keep delimiter:\n--- USER_STORY_BREAK ---\n- Ensure output is parsable by Extract Structured JSON node.\n\n====================\nEPIC SPLITTING RULE:\n====================\n\n- If multiple distinct business capabilities exist, you MUST create multiple epics.\n- Do NOT combine unrelated workflows into a single epic.\n- Each epic should represent a cohesive business capability.\n\n==============================\nMANDATORY DECOMPOSITION RULES:\n==============================\n\nFor EACH Epic, you MUST generate stories across the following dimensions (if applicable):\n\n1. UI Layer Stories\n   - Screen rendering\n   - Form handling\n   - User interactions\n\n2. API / Backend Stories\n   - Data processing\n   - Business logic\n   - Service interactions\n\n3. Validation Stories\n   - Field validations\n   - Business rule validations\n\n4. Integration Stories\n   - External services\n   - Third-party APIs\n   - Event/message flows\n\n5. Error Handling Stories\n   - Failure scenarios\n   - Retry logic\n   - Exception flows\n\n6. Security \u0026 Compliance Stories\n   - Authentication / authorization\n   - Data privacy / masking\n\n7. Performance / NFR Stories\n   - Latency\n   - Scalability\n   - Load handling\n\nMINIMUM:\n- Each Epic must generate AT LEAST 6ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“10 user stories\n- Complex features should generate 10ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“20 stories\n\n====================\nPRIORITIZATION RULE:\n====================\n\n- Prefer generating more stories over longer descriptions if token limits are reached.\n\n=============================\nVALIDATION CHECK (MANDATORY):\n=============================\n\nVALIDATION RULE (STRICT):\n\n- Each Epic MUST have at least 6 user stories.\n- Under no condition should an epic contain fewer than 6 stories.\n- Prefer splitting stories rather than merging.\n\n======================\nEXPECTED OUTPUT SCALE:\n======================\n\n- Small feature: 5ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“8 stories\n- Medium feature: 8ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“15 stories\n- Large feature: 15ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“25 stories\n\nOUTPUT:\n- Return ONLY the final JSON object.\n- No explanations outside JSON.`\n},\n  risk_matrix: {\n    title: \"Risk Assessment Matrix\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Risk Assessment Matrix\nGenerated On: {{ $now }}\nModel: ${runtimeGenerationModel}\nVector Collection: ${runtimeChromaCollection}\n---\n\nThen generate the full document.\n\nYou are a Senior Risk \u0026 Quality Governance Consultant with 15+ years of experience in enterprise delivery risk management.\n\nYou specialize in:\n- Risk-based testing frameworks\n- Failure mode impact analysis (FMEA)\n- Technical \u0026 business risk modeling\n- Delivery risk governance\n- Quantitative scoring models (Probability ÃƒÆ’Ã¢â‚¬â€ Impact ÃƒÆ’Ã¢â‚¬â€ Detectability)\n\nYour output must be suitable for leadership review and audit compliance.\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, transcripts, and architecture documents.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Identify risks across:\n   - Functional complexity\n   - Integration dependencies\n   - Architecture scalability\n   - Security \u0026 compliance\n   - Performance constraints\n   - Data integrity\n   - Environment instability\n   - Delivery timelines\n2. Categorize risks:\n   - Technical Risk\n   - Business Risk\n   - Operational Risk\n   - Security Risk\n3. Use quantitative scoring:\n   - Probability (1ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“5)\n   - Impact (1ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“5)\n   - Risk Score = Probability ÃƒÆ’Ã¢â‚¬â€ Impact\n4. Define:\n   - Mitigation Strategy\n   - Contingency Plan\n   - Risk Owner\n   - Detection Mechanism\n   - Early Warning Indicators\n\n========================\nOUTPUT FORMAT\n========================\n\nUse a Confluence-readable two-part risk register. Do not create one crowded 11-column table.\n\n1. Risk Register Summary table:\n| Risk ID | Category | Risk Title | Probability | Impact | Risk Score | Owner |\n\n2. Risk Detail Register table:\n| Risk ID | Risk Description | Source Reference | Mitigation Plan | Contingency Plan | Detection Strategy |\n\nThen provide:\n- Risk Heat Map summary\n- Top 5 Critical Risks analysis (detailed narrative)\n- Risk Prioritization Strategy explanation\n- Linkage to Test Strategy alignment\n- Coverage Ledger with exact source references and chunkId values\n\nEnsure reasoning is grounded in retrieved content. Every risk row and ledger row must cite exact retrieved evidence using DocType - FileName - SectionTitle - chunkId:FULL_CHUNK_ID.\n`\n  },\n  traceability_matrix: {\n    title: \"Requirement Traceability Matrix\",\n    system: [\n      \u0027Before the document, include:\u0027,\n      \u0027\u0027,\n      \u0027---\u0027,\n      \u0027Document: Enterprise Requirement Traceability Matrix\u0027,\n      \u0027Generated On: {{ $now }}\u0027,\n      \u0027Model: \u0027 + runtimeGenerationModel,\n      \u0027Vector Collection: \u0027 + runtimeChromaCollection,\n      \u0027---\u0027,\n      \u0027\u0027,\n      \u0027You are a QA Governance Specialist responsible for audit-grade, two-layer requirement traceability.\u0027,\n      \u0027\u0027,\n      \u0027You must produce concise, factual traceability using only retrieved requirement evidence and the supplied Jira/test-case context.\u0027,\n      \u0027Do not fabricate risk IDs, automation status, model metadata, vector collection names, Jira keys, or test case keys.\u0027,\n      \u0027If a linkage is unavailable, mark it as Not linked or Not available rather than inventing it.\u0027\n    ].join(\u0027\\n\u0027),\n    user: [\n      \u0027Generate the Requirement Traceability Matrix using the two-layer RTM context and retrieved project evidence.\u0027,\n      \u0027\u0027,\n      \u0027Hard requirements:\u0027,\n      \u00271. Produce exactly the eight required sections from the TWO-LAYER REQUIREMENT TRACEABILITY INPUT block.\u0027,\n      \u00272. Layer 1 maps source requirements to actual Jira Epic and Story keys.\u0027,\n      \u00273. Layer 2 maps every generated Story key to its actual generated Test Case keys.\u0027,\n      \u00274. Use all supplied Story keys and all supplied Test Case keys. Do not summarize test case keys as ranges.\u0027,\n      \u00275. Do not include Risk ID or Automation Status columns. A narrative \"not available\" note is acceptable; do not claim automated/manual/percentage coverage.\u0027,\n      \u00276. Do not include any table cell containing the pipe character | except as markdown column separators.\u0027,\n      \u00277. Source references in tables must use hyphen separators, for example: FRD - FRD_AstraCart_Ecommerce_Platform.docx - Validation and Error Handling - chunkId:a5396b3a.\u0027,\n      \u00277a. If retrieved chunk metadata contains a pipe-delimited composite key like uuid|page|index|source, use only uuid or rewrite it as uuid-page-index-source.\u0027,\n      \u00278. Include exactly one Coverage Ledger section.\u0027,\n      \u00279. Do not include a legacy Main Requirement Traceability Matrix Table.\u0027,\n      \u002710. Counts in the Executive Coverage Summary, Coverage Summary Metrics, and Coverage Ledger must agree with each other.\u0027,\n      \u002711. Do not write \"fully implemented\", \"tested\", \"validated\", \"verified\", \"passed\", or similar delivery/execution claims. This RTM only proves traceability coverage unless execution evidence is supplied.\u0027,\n      \u002712. In Layer 1, use Traceability Notes to explain mapping evidence, not delivery status. Preferred wording: \"Mapped to backlog and generated test-case coverage; implementation and execution status not assessed.\"\u0027,\n      \u002713. In Coverage by Test Category, use the column \"Coverage Scope\" unless you can populate a numeric count from supplied category metadata.\u0027,\n      \u0027\u0027,\n      \u0027When unsure, prefer transparent Not available / Not linked wording over invented values.\u0027\n    ].join(\u0027\\n\u0027)\n  }\n};\n\n\nfunction buildSharedCoveragePlanningProfile(type) {\n  const profiles = {\n    test_strategy: {\n      label: \u0027Test Strategy\u0027,\n      goal: \u0027Every major source objective, module, workflow, integration, quality attribute, test level, governance concern, and automation signal should be reflected in the strategy or explicitly excluded.\u0027,\n      expectedCoverage: [\u0027quality objectives\u0027, \u0027in-scope and out-of-scope modules\u0027, \u0027test levels\u0027, \u0027NFRs\u0027, \u0027automation approach\u0027, \u0027risk-based priorities\u0027, \u0027governance and metrics\u0027],\n      inclusionHint: \u0027Name the strategy section where the item is handled, for example Scope, Test Levels, Automation, Risk, Metrics, or Governance.\u0027\n    },\n    test_plan: {\n      label: \u0027Test Plan\u0027,\n      goal: \u0027Every major source module, workflow, integration, test data need, environment dependency, entry/exit criterion, and execution risk should be represented in the plan or explicitly excluded.\u0027,\n      expectedCoverage: [\u0027scope items\u0027, \u0027execution workflows\u0027, \u0027integrations\u0027, \u0027environment and data dependencies\u0027, \u0027entry and exit criteria\u0027, \u0027roles and schedule\u0027, \u0027risks and mitigations\u0027],\n      inclusionHint: \u0027Name the plan section where the item is handled, for example Scope, Approach, Environment, Test Data, Schedule, Entry Criteria, Exit Criteria, or Risks.\u0027\n    },\n    risk_matrix: {\n      label: \u0027Risk Matrix\u0027,\n      goal: \u0027Every major source module, workflow, integration, business rule, security/privacy concern, data concern, operational dependency, and NFR should have a risk row or a clear no-material-risk rationale.\u0027,\n      expectedCoverage: [\u0027functional risks\u0027, \u0027integration risks\u0027, \u0027data risks\u0027, \u0027security and privacy risks\u0027, \u0027NFR risks\u0027, \u0027operational risks\u0027, \u0027mitigation ownership\u0027],\n      inclusionHint: \u0027Name the risk row, risk category, or rationale where the item is handled.\u0027\n    }\n  };\n  return profiles[type] || null;\n}\n\nfunction buildCoverageLedgerInstructions(type, profile, planningProfile) {\n  const isTraceability = type === \u0027traceability_matrix\u0027;\n  const lines = [\n    \u0027==============================\u0027,\n    \u0027COVERAGE LEDGER REQUIREMENT\u0027,\n    \u0027==============================\u0027,\n    \u0027\u0027,\n    \u0027Create a compact markdown section named exactly: Coverage Ledger.\u0027,\n    \u0027Use this exact table structure:\u0027,\n    \u0027| Coverage ID | Module / Requirement | Source Reference | Included In Output | Coverage Status | Notes |\u0027,\n    \u0027|---|---|---|---|---|---|\u0027,\n    \u0027\u0027,\n    \u0027Coverage Status must be one of: covered, partial, missing, excluded.\u0027,\n    \u0027Build the ledger from all distinct modules, screens, workflows, integrations, business rules, NFRs, and requirements discovered from retrieved project evidence.\u0027,\n    \u0027Do not silently drop discovered evidence. If evidence is weak or deliberately out of scope, mark partial or excluded and explain why.\u0027,\n    \u0027Use Source Reference values in this format: DocType - FileName - SectionTitle - chunkId:FULL_CHUNK_ID.\u0027,\n    \u0027Do not use pipe characters, bracketed pipe references, or shortened chunk IDs in Coverage Ledger source references.\u0027,\n    \u0027Do not repeat the Coverage Ledger table header. Emit one header row and then data rows only.\u0027,\n    \u0027For the current profile, pay special attention to: \u0027 + profile.sectionKeywords.join(\u0027, \u0027) + \u0027.\u0027\n  ];\n\n  if (isTraceability) {\n    lines.push(\u0027Traceability Matrix hard gate: every discovered requirement/module must be represented in the matrix or explicitly excluded with rationale. Do not leave missing rows unless the output truly lacks coverage.\u0027);\n  } else if (planningProfile) {\n    lines.push(\n      \u0027Shared document coverage-planning mode: this ledger is a review warning gate, not a hard publish blocker.\u0027,\n      \u0027Document-specific coverage goal: \u0027 + planningProfile.goal,\n      \u0027Expected coverage dimensions: \u0027 + planningProfile.expectedCoverage.join(\u0027, \u0027) + \u0027.\u0027,\n      \u0027Included In Output must identify the concrete section, table, risk row, or rationale where the item was handled. \u0027 + planningProfile.inclusionHint,\n      \u0027If an item belongs in this document but is not included, mark missing. If only part of it is handled, mark partial. If it is truly outside the document purpose, mark excluded with rationale.\u0027\n    );\n  } else {\n    lines.push(\u0027For this document type, the ledger is currently collected in dry-run mode for analytics and future batching. Still make it accurate.\u0027);\n  }\n\n  return lines.join(\u0027\\n\u0027);\n}\n\nconst sharedCoveragePlanningProfile = buildSharedCoveragePlanningProfile(type);\nconst coverageLedgerInstructions = buildCoverageLedgerInstructions(type, retrievalProfile, sharedCoveragePlanningProfile);\nconst twoLayerRtmInstructions = buildTwoLayerRtmInstructions(type, traceabilityContext);\nconst rtmUpdateInstructions = buildRtmUpdateInstructions(type, generationMode, updateContext, traceabilityContext);\nconst sharedDeltaUpdateInstructions = buildSharedDeltaUpdateInstructions(type, generationMode, updateContext, retrievalProfile);\n\nconst selectedPrompt = promptLibrary[type] || promptLibrary.test_plan;\nconst enhancedSystem = [\n  selectedPrompt.system,\n  retrievalProfileInstructions,\n  coverageLedgerInstructions,\n  twoLayerRtmInstructions,\n  rtmUpdateInstructions,\n  sharedDeltaUpdateInstructions\n].filter(Boolean).join(\u0027\\n\\n\u0027);\nconst retryGuidance = retryInstruction\n  ? [\n      \u0027========================\u0027,\n      \u0027REGENERATION RETRY GUIDANCE\u0027,\n      \u0027========================\u0027,\n      retryInstruction,\n      \u0027Before finalizing, self-check the output against the quality gate: minimum word count, required sections, traceability/source references, and document-specific table expectations.\u0027\n    ].join(\u0027\\n\u0027)\n  : \u0027\u0027;\n\nconst coverageGateReminder = type === \u0027traceability_matrix\u0027\n  ? [\n      \u0027========================\u0027,\n      \u0027TRACEABILITY MATRIX QUALITY GATE REMINDER\u0027,\n      \u0027========================\u0027,\n      \u0027The final RTM must satisfy the RTM output contract exactly.\u0027,\n      \u0027Required sections must appear once: Executive Coverage Summary, Layer 1, Layer 1 Gaps, Layer 2, Layer 2 Gaps, Coverage by Test Category, Coverage Ledger, Governance \u0026 Audit Readiness Commentary.\u0027,\n      \u0027Do not include Risk ID or Automation Status columns. A narrative \"not available\" note is acceptable; do not claim automated/manual/percentage coverage.\u0027,\n      \u0027Do not include a legacy Main Requirement Traceability Matrix Table.\u0027,\n      \u0027Do not repeat Coverage Ledger.\u0027,\n      \u0027Do not use pipe characters inside table cell values.\u0027,\n      \u0027If source chunk metadata contains pipe-delimited composite keys, rewrite them with hyphens before placing them in a table.\u0027,\n      \u0027Do not use test key ranges. List actual generated test case keys from the supplied context.\u0027,\n      \u0027All table rows must align with their header column counts.\u0027,\n      \u0027Do not claim fully implemented, tested, validated, verified, passed, executed, or production-ready status unless supplied execution evidence exists.\u0027,\n      \u0027Layer 1 table must use Traceability Notes, not implementation/testing notes.\u0027,\n      \u0027Coverage by Test Category must use Coverage Scope and Evidence Basis rather than a non-numeric Number of Test Cases column.\u0027\n    ].join(\u0027\\n\u0027)\n  : \u0027\u0027;\n\n\nconst sharedCoverageGateReminder = sharedCoveragePlanningProfile\n  ? [\n      \u0027========================\u0027,\n      \u0027SHARED DOCUMENT COVERAGE PLANNING REMINDER\u0027,\n      \u0027========================\u0027,\n      \u0027This \u0027 + sharedCoveragePlanningProfile.label + \u0027 must include one Coverage Ledger section using the required ledger table.\u0027,\n      \u0027Use the ledger to prove that major retrieved source signals were covered, partially covered, missing, or intentionally excluded.\u0027,\n      \u0027If any ledger item is partial, missing, or unknown, add a short Coverage Review Note near the top of the document.\u0027,\n      \u0027Coverage gaps are warning-level for this rollout, but the ledger itself should be accurate and reviewable.\u0027\n    ].join(\u0027\\n\u0027)\n  : \u0027\u0027;\n\nconst sharedDocumentFormatReminder = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(type)\n  ? [\n      \u0027========================\u0027,\n      \u0027SHARED CONFLUENCE DOCUMENT SAFETY RULES\u0027,\n      \u0027========================\u0027,\n      \u0027Use markdown tables only when the table has 7 or fewer columns. For wider data, split into a summary table plus detail sections.\u0027,\n      \u0027Do not place long source references, mitigation text, contingency text, or detection text inside a crowded table.\u0027,\n      \u0027Never put pipe characters inside table cells. Convert source references to: DocType - FileName - SectionTitle - chunkId:FULL_CHUNK_ID.\u0027,\n      \u0027Do not truncate chunk IDs with ellipses. Use the full chunkId if available, or write chunkId not available.\u0027,\n      \u0027Do not invent specific dates, KPI targets, approval/sign-off status, implementation status, execution status, or risk scores. If inferred, label them Proposed or Recommended pending stakeholder validation.\u0027,\n      \u0027Do not include conversational assistant closings such as Please advise, Let me know, or If you need.\u0027,\n      type === \u0027risk_matrix\u0027\n        ? \u0027Risk Matrix layout: do not create one large risk table. Use Risk Register Summary with columns Risk ID, Category, Risk Title, Probability, Impact, Risk Score, Owner. Keep Risk Title under 12 words. Then add Risk Detail Register with Risk ID, Risk Description, Source Reference, Mitigation Plan, Contingency Plan, Detection Strategy. Do not place mitigation, contingency, detection, or long source references in the summary table.\u0027\n        : \u0027\u0027,\n      type === \u0027test_plan\u0027\n        ? \u0027Test Plan schedule dates must be marked Proposed unless dates are present in retrieved evidence. Approval/sign-off must be phrased as planned or required, not completed. Coverage Ledger rows must use exact retrieved source references with chunkId; never use combined references such as TRANSCRIPT, TEST_PLAN documents combined or UI_UX and others.\u0027\n        : \u0027\u0027,\n      type === \u0027test_strategy\u0027\n        ? \u0027Test Strategy KPI targets must be marked Proposed unless the targets are present in retrieved evidence.\u0027\n        : \u0027\u0027\n    ].filter(Boolean).join(\u0027\\n\u0027)\n  : \u0027\u0027;\n\nconst enhancedUser = [\n  selectedPrompt.user,\n  sharedDeltaUpdateInstructions,\n  coverageGateReminder,\n  sharedCoverageGateReminder,\n  sharedDocumentFormatReminder,\n  retryGuidance,\n  \u0027\u0027,\n  type === \u0027traceability_matrix\u0027\n    ? \u0027Additional RTM Confluence requirement: keep tables column-safe. Use source metadata in table cells as DocType - source file - sectionTitle - chunkId. Never use [docType | source file | sectionTitle | chunkId] inside RTM tables.\u0027\n    : \u0027Additional Confluence generation requirement: organize the final document so that traceability is visible and useful. Cite source metadata in the table-safe format DocType - source file - sectionTitle - chunkId:FULL_CHUNK_ID.\u0027\n].filter(Boolean).join(\u0027\\n\\n\u0027);\n\nreturn [{\n  json: {\n    ...selectedPrompt,\n    system: enhancedSystem,\n    user: enhancedUser,\n    documentType: type,\n    jobId,\n    projectName: projectName,\n    productOwner: productOwner,\n    docTypeFilter: getDocTypeFilter(type),\n    contentSources: contentSources,\n    compositeKeys: compositeKeys,\n    retrievalProfile: {\n      key: type,\n      label: retrievalProfile.label,\n      intent: retrievalProfile.intent,\n      primaryDocTypes: retrievalProfile.primaryDocTypes,\n      secondaryDocTypes: retrievalProfile.secondaryDocTypes,\n      preferredCategories: retrievalProfile.preferredCategories,\n      preferredArtifacts: retrievalProfile.preferredArtifacts,\n      preferredContentSources: contentSources,\n      sectionKeywords: retrievalProfile.sectionKeywords,\n      rankingMode: \u0027agent_tool_project_filter_metadata_profile_guidance\u0027,\n      hardFilter: { project: projectName },\n      softFilters: {\n        docType: getDocTypeFilter(type),\n        documentCategory: retrievalProfile.preferredCategories,\n        artifactType: retrievalProfile.preferredArtifacts,\n        contentSource: contentSources\n      }\n    },\n    retrievalProfileInstructions,\n    sharedDeltaUpdate: {\n      enabled: Boolean(sharedDeltaUpdateInstructions),\n      version: sharedDeltaUpdateInstructions ? \u0027shared-delta-v2\u0027 : null,\n      updateReasons: Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons : [],\n      previousJobId: updateContext.previousJobId || null,\n      previousConfluencePageId: updateContext.previousConfluencePageId || null,\n      previousTokenUsage: updateContext.previousTokenUsage || null\n    },\n    coverageLedgerRequirement: {\n      enabled: true,\n      version: \u0027coverage-ledger-v1\u0027,\n      mode: type === \u0027traceability_matrix\u0027 ? \u0027enforced\u0027 : \u0027dry_run\u0027,\n      requiredFor: type === \u0027traceability_matrix\u0027,\n      statuses: [\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027]\n    },\n    coveragePlanningRequirement: {\n      enabled: Boolean(sharedCoveragePlanningProfile),\n      version: \u0027coverage-planning-v1\u0027,\n      mode: sharedCoveragePlanningProfile ? \u0027warning\u0027 : \u0027not_applicable\u0027,\n      documentTypes: [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027],\n      profile: sharedCoveragePlanningProfile\n    },\n    traceabilityMode: $json.traceabilityMode || \u0027\u0027,\n    traceabilityContext: traceabilityContext || {},\n    generationMode,\n    updateContext,\n    projectId: $json.projectId || null,\n    requestedBy: $json.requestedBy || null,\n    settingsVersion: $json.settingsVersion || null,\n    configSnapshot: $json.configSnapshot || {},\n    environmentKey: $json.environmentKey || \u0027local\u0027,\n    retryOfJobId: retryContext.retryOfJobId || null,\n    retryContext,\n    retryInstruction\n  }\n}];"
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
    "jsCode":  "const data = $json;\nconst documentType = $(\u0027Prompt Library\u0027).item.json.documentType;\nconst projectName = $(\u0027Prompt Library\u0027).item.json.projectName;\nconst jobId = data.jobId; \nconst promptContext = $(\u0027Prompt Library\u0027).item.json || {};\nconst restoreContext = $(\u0027Restore Job Context\u0027).item.json || {};\nconst updateContext =\n  (promptContext.updateContext \u0026\u0026 typeof promptContext.updateContext === \u0027object\u0027) ? promptContext.updateContext :\n  (restoreContext.updateContext \u0026\u0026 typeof restoreContext.updateContext === \u0027object\u0027) ? restoreContext.updateContext :\n  (restoreContext.input?.updateContext \u0026\u0026 typeof restoreContext.input.updateContext === \u0027object\u0027) ? restoreContext.input.updateContext :\n  {};\nconst generationMode = String(\n  promptContext.generationMode ||\n  restoreContext.generationMode ||\n  restoreContext.input?.generationMode ||\n  updateContext.generationMode ||\n  \u0027\u0027\n).toLowerCase() === \u0027update\u0027 || Boolean(updateContext.updateMode || updateContext.deltaRequested || updateContext.previousJobId)\n  ? \u0027update\u0027\n  : \u0027create\u0027;\n\nlet rawMarkdown = data.rawMarkdown || \"\";\nlet wordCount = data.wordCount || 0;\nconst coverageLedger = Array.isArray(data.coverageLedger) ? data.coverageLedger : [];\nconst coverageSummary = data.coverageSummary || {\n  version: \u0027coverage-ledger-v1\u0027,\n  mode: documentType === \u0027traceability_matrix\u0027 ? \u0027enforced\u0027 : \u0027dry_run\u0027,\n  coverageLedgerCount: 0,\n  coveredCount: 0,\n  partialCount: 0,\n  missingCount: 0,\n  excludedCount: 0,\n  unknownCount: 0,\n  blockingUncoveredCount: 0,\n  uncoveredCount: 0,\n  gateStatus: documentType === \u0027traceability_matrix\u0027 ? \u0027failed\u0027 : \u0027not_reported\u0027,\n  missingItems: [], partialItems: [], unknownItems: [], warningItems: [], partialItems: [], unknownItems: [], warningItems: [], partialItems: [], unknownItems: [], warningItems: []\n};\n\nfunction sanitizeRtmMarkdownTables(text) {\n  if (documentType !== \u0027traceability_matrix\u0027) return text;\n  return String(text || \u0027\u0027)\n    .split(/\\r?\\n/)\n    .map(line =\u003e {\n      if (!/^\\s*\\|.*\\|\\s*$/.test(line)) return line;\n      return line\n        .replace(/chunkId:([^|\\s]+)\\|(\\d+)\\|(\\d+)\\|([A-Za-z0-9_-]+)/g, \u0027chunkId:$1-$2-$3-$4\u0027)\n        .replace(/\\[([^\\]\\n|]+)\\s*\\|\\s*([^\\]\\n|]+)\\s*\\|\\s*([^\\]\\n|]+)\\s*\\|\\s*([^\\]\\n|]+)\\]/g, \u0027$1 - $2 - $3 - $4\u0027);\n    })\n    .join(\u0027\\n\u0027);\n}\n\n\nfunction rtmTableCell(value) {\n  const normalized = String(value === undefined || value === null ? \u0027Not available\u0027 : value)\n    .replace(/\\|/g, \u0027-\u0027)\n    .replace(/[\\r\\n]+/g, \u0027 \u0027)\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n  return normalized || \u0027Not available\u0027;\n}\n\nfunction buildDeterministicLayer2Table() {\n  if (documentType !== \u0027traceability_matrix\u0027) return \u0027\u0027;\n  const context = $(\u0027Prompt Library\u0027).item.json.traceabilityContext || {};\n  const stories = Array.isArray(context.stories) ? context.stories : [];\n  const links = Array.isArray(context.storyTestCaseLinks) ? context.storyTestCaseLinks : [];\n  if (!stories.length || !links.length) return \u0027\u0027;\n\n  const linksByStory = new Map();\n  for (const link of links) {\n    const storyKey = rtmTableCell(link.storyKey);\n    if (!storyKey || storyKey === \u0027Not available\u0027) continue;\n    if (!linksByStory.has(storyKey)) linksByStory.set(storyKey, []);\n    linksByStory.get(storyKey).push(link);\n  }\n\n  const rows = stories.map(story =\u003e {\n    const storyKey = rtmTableCell(story.storyKey);\n    const storyLinks = linksByStory.get(storyKey) || [];\n    const testCaseKeys = [...new Set(storyLinks.map(link =\u003e rtmTableCell(link.testcaseKey)).filter(key =\u003e key \u0026\u0026 key !== \u0027Not available\u0027))];\n    const categories = [...new Set(storyLinks.flatMap(link =\u003e Array.isArray(link.categories) ? link.categories : []).map(rtmTableCell).filter(value =\u003e value \u0026\u0026 value !== \u0027Not available\u0027))];\n    const coverage = testCaseKeys.length ? \u0027Covered\u0027 : \u0027Missing\u0027;\n    const notes = testCaseKeys.length\n      ? \u0027Trace established from persisted story-testcase links in \u0027 + rtmTableCell(context.storyTestCaseJobId || \u0027traceability context\u0027)\n      : \u0027No generated test case links found in traceability context\u0027;\n    return \u0027| \u0027 + [\n      storyKey,\n      rtmTableCell(story.storySummary || story.summary),\n      rtmTableCell(testCaseKeys.join(\u0027, \u0027)),\n      String(testCaseKeys.length),\n      rtmTableCell(categories.length ? categories.join(\u0027, \u0027) : \u0027Not available from link metadata\u0027),\n      coverage,\n      notes\n    ].join(\u0027 | \u0027) + \u0027 |\u0027;\n  });\n\n  return [\n    \u0027## 4. Layer 2 - User Stories to Generated Test Cases\u0027,\n    \u0027\u0027,\n    \u0027This table is generated from persisted story-testcase links to keep RTM coverage complete and audit-safe.\u0027,\n    \u0027\u0027,\n    \u0027| Story Key | Story Summary | Test Case Keys | Unique Test Case Count | Test Categories | Test Coverage Status | Traceability Notes |\u0027,\n    \u0027| --- | --- | --- | --- | --- | --- | --- |\u0027,\n    ...rows\n  ].join(\u0027\\n\u0027);\n}\n\nfunction rtmHeadingRegex(title, numberPrefix = \u0027\u0027) {\n  const escapedTitle = String(title || \u0027\u0027).replace(/[-/\\\\^$*+?.()|[\\]{}]/g, \u0027\\\\$\u0026\u0027);\n  const escapedPrefix = numberPrefix ? String(numberPrefix).replace(\u0027.\u0027, \u0027\\\\.\u0027) + \u0027\\\\s*\u0027 : \u0027\u0027;\n  return new RegExp(\u0027^\\\\s*(?:#{1,6}\\\\s*)?(?:\u0027 + escapedPrefix + \u0027)?\u0027 + escapedTitle + \u0027\\\\s*$\u0027, \u0027i\u0027);\n}\n\nfunction findRtmHeadingIndex(lines, title, numberPrefix = \u0027\u0027) {\n  const pattern = rtmHeadingRegex(title, numberPrefix);\n  return lines.findIndex(line =\u003e pattern.test(String(line || \u0027\u0027).trim()));\n}\n\nfunction replaceRtmLayer2WithContext(text) {\n  if (documentType !== \u0027traceability_matrix\u0027) return text;\n  const deterministicTable = buildDeterministicLayer2Table();\n  if (!deterministicTable) return text;\n  const lines = String(text || \u0027\u0027).split(/\\r?\\n/);\n  const start = findRtmHeadingIndex(lines, \u0027Layer 2 - User Stories to Generated Test Cases\u0027, \u00274.\u0027);\n  if (start \u003c 0) return String(text || \u0027\u0027).trim() + \u0027\\n\\n\u0027 + deterministicTable;\n\n  const nextSectionPatterns = [\n    rtmHeadingRegex(\u0027Layer 2 Gaps - Stories Without Test Case Coverage\u0027, \u00275.\u0027),\n    rtmHeadingRegex(\u0027Coverage by Test Category\u0027, \u00276.\u0027),\n    rtmHeadingRegex(\u0027Coverage Ledger\u0027, \u00277.\u0027),\n    rtmHeadingRegex(\u0027Governance \u0026 Audit Readiness Commentary\u0027, \u00278.\u0027),\n    /^\\s*#{1,6}\\s+\\d+\\.\\s+/i,\n  ];\n  let end = lines.length;\n  for (let index = start + 1; index \u003c lines.length; index += 1) {\n    const candidate = String(lines[index] || \u0027\u0027).trim();\n    if (nextSectionPatterns.some(pattern =\u003e pattern.test(candidate))) {\n      end = index;\n      break;\n    }\n  }\n  return [\n    ...lines.slice(0, start),\n    deterministicTable,\n    \u0027\u0027,\n    ...lines.slice(end),\n  ].join(\u0027\\n\u0027).replace(/\\n{3,}/g, \u0027\\n\\n\u0027).trim();\n}\n\n\nfunction dedupeRtmLayer2Sections(text) {\n  if (documentType !== \u0027traceability_matrix\u0027) return text;\n  const deterministicTable = buildDeterministicLayer2Table();\n  if (!deterministicTable) return text;\n  return replaceRtmLayer2WithContext(text);\n}\n\nfunction stripUnsupportedRtmRiskFields(text) {\n  if (documentType !== \u0027traceability_matrix\u0027) return text;\n\n  const splitTableLine = (line) =\u003e String(line || \u0027\u0027)\n    .trim()\n    .replace(/^\\|/, \u0027\u0027)\n    .replace(/\\|$/, \u0027\u0027)\n    .split(\u0027|\u0027)\n    .map((cell) =\u003e cell.trim());\n  const isTableLine = (line) =\u003e /^\\s*\\|.*\\|\\s*$/.test(String(line || \u0027\u0027));\n  const isRiskIdHeader = (cell) =\u003e /^risk\\s*(?:id|ids|identifier|identifiers)$/i.test(String(cell || \u0027\u0027).trim());\n  const renderTableLine = (cells) =\u003e \u0027| \u0027 + cells.map((cell) =\u003e String(cell || \u0027\u0027).trim() || \u0027-\u0027).join(\u0027 | \u0027) + \u0027 |\u0027;\n\n  const lines = String(text || \u0027\u0027).split(/\\r?\\n/);\n  const output = [];\n\n  for (let index = 0; index \u003c lines.length; index += 1) {\n    const line = lines[index];\n    if (!isTableLine(line)) {\n      output.push(String(line || \u0027\u0027)\n        .replace(/\\bRisk\\s+IDs?\\b/gi, \u0027risk linkage\u0027)\n        .replace(/\\bRSK-[A-Za-z0-9-]+\\b/g, \u0027risk linkage not generated\u0027));\n      continue;\n    }\n\n    const group = [];\n    while (index \u003c lines.length \u0026\u0026 isTableLine(lines[index])) {\n      group.push(lines[index]);\n      index += 1;\n    }\n    index -= 1;\n\n    const headerCells = splitTableLine(group[0]);\n    const removeIndexes = headerCells\n      .map((cell, cellIndex) =\u003e (isRiskIdHeader(cell) ? cellIndex : -1))\n      .filter((cellIndex) =\u003e cellIndex \u003e= 0);\n\n    if (!removeIndexes.length) {\n      output.push(...group.map((row) =\u003e row\n        .replace(/\\bRisk\\s+IDs?\\b/gi, \u0027risk linkage\u0027)\n        .replace(/\\bRSK-[A-Za-z0-9-]+\\b/g, \u0027risk linkage not generated\u0027)));\n      continue;\n    }\n\n    for (const row of group) {\n      const cells = splitTableLine(row).filter((_, cellIndex) =\u003e !removeIndexes.includes(cellIndex));\n      output.push(renderTableLine(cells));\n    }\n  }\n\n  return output.join(\u0027\\n\u0027);\n}\n\nrawMarkdown = sanitizeRtmMarkdownTables(rawMarkdown);\nfunction dedupeCommaSeparatedJiraKeys(value) {\n  const parts = String(value || \u0027\u0027)\n    .split(\u0027,\u0027)\n    .map(part =\u003e part.trim())\n    .filter(Boolean);\n  if (parts.length \u003c 2 || !parts.every(part =\u003e /^[A-Z][A-Z0-9]+-\\d+$/.test(part))) {\n    return value;\n  }\n  return [...new Set(parts)].join(\u0027, \u0027);\n}\n\nfunction normalizeRtmGeneratedText(text) {\n  if (documentType !== \u0027traceability_matrix\u0027) return text;\n  const normalized = String(text || \u0027\u0027)\n    .split(/\\r?\\n/)\n    .map(line =\u003e {\n      if (!/^\\s*\\|.*\\|\\s*$/.test(line)) {\n        return line.replace(/\\bState Pers\\./g, \u0027State Persistence\u0027);\n      }\n      const leading = line.match(/^\\s*/)[0];\n      const trailing = line.match(/\\s*$/)[0];\n      const cells = line\n        .trim()\n        .replace(/^\\|/, \u0027\u0027)\n        .replace(/\\|$/, \u0027\u0027)\n        .split(\u0027|\u0027)\n        .map(cell =\u003e cell.trim());\n      const normalizedCells = cells.map(cell =\u003e {\n        const expanded = cell.replace(/\\bState Pers\\./g, \u0027State Persistence\u0027);\n        return dedupeCommaSeparatedJiraKeys(expanded);\n      });\n      return leading + \u0027| \u0027 + normalizedCells.join(\u0027 | \u0027) + \u0027 |\u0027 + trailing;\n    })\n    .join(\u0027\\n\u0027);\n  return normalized.replace(\n    /Key Metrics:\\s*\\n- Epics:\\s*([^\\n]+)\\n- User Stories:\\s*([^\\n]+)\\n- Test Cases linked to Stories:\\s*([^\\n]+)\\n- User Stories without Test Cases:\\s*([^\\n]+)/,\n    [\n      \u0027Key Metrics:\u0027,\n      \u0027\u0027,\n      \u0027| Metric | Value |\u0027,\n      \u0027| --- | --- |\u0027,\n      \u0027| Epics | $1 |\u0027,\n      \u0027| User Stories | $2 |\u0027,\n      \u0027| Test Cases linked to Stories | $3 |\u0027,\n      \u0027| User Stories without Test Cases | $4 |\u0027\n    ].join(\u0027\\n\u0027)\n  );\n}\n\n\nfunction buildRtmFreshnessNotice() {\n  if (documentType !== \u0027traceability_matrix\u0027) return \u0027\u0027;\n  const context = $(\u0027Prompt Library\u0027).item.json.traceabilityContext || {};\n  const freshness = context.freshness || $(\u0027Prompt Library\u0027).item.json.rtmFreshness || {};\n  const status = String(freshness.status || \u0027\u0027).toLowerCase();\n  if (!status || status === \u0027ready\u0027) return \u0027\u0027;\n  const warnings = Array.isArray(freshness.warnings) ? freshness.warnings : [];\n  const lines = [\n    \u0027### RTM Freshness Notice\u0027,\n    \u0027\u0027,\n    status === \u0027blocked\u0027\n      ? \u0027Freshness Status: Blocked - required upstream artifacts were missing when this RTM context was evaluated.\u0027\n      : \u0027Freshness Status: Warning - this RTM was generated, but one or more upstream artifacts may be stale.\u0027,\n    \u0027\u0027,\n    \u0027| Signal | Detail | Recommended Action |\u0027,\n    \u0027| --- | --- | --- |\u0027\n  ];\n  if (warnings.length) {\n    for (const warning of warnings) {\n      lines.push(\u0027| \u0027 + rtmTableCell(warning.code || \u0027FRESHNESS_WARNING\u0027) + \u0027 | \u0027 + rtmTableCell(warning.message || \u0027Freshness warning detected.\u0027) + \u0027 | \u0027 + rtmTableCell(warning.recommendedAction || \u0027Review upstream artifacts before audit use.\u0027) + \u0027 |\u0027);\n    }\n  } else {\n    lines.push(\u0027| FRESHNESS_WARNING | Freshness warning detected. | Review upstream artifacts before audit use. |\u0027);\n  }\n  lines.push(\u0027\u0027, \u0027Freshness checked at: \u0027 + rtmTableCell(freshness.checkedAt || \u0027Not available\u0027));\n  return lines.join(\u0027\\n\u0027);\n}\n\nfunction injectRtmFreshnessNotice(text) {\n  if (documentType !== \u0027traceability_matrix\u0027) return text;\n  const notice = buildRtmFreshnessNotice();\n  if (!notice || /RTM Freshness Notice/i.test(text)) return text;\n  const pattern = /(^\\s*#*\\s*(?:8\\.\\s*)?Governance \u0026 Audit Readiness Commentary\\s*$)/mi;\n  if (pattern.test(text)) {\n    return String(text).replace(pattern, \u0027$1\\n\\n\u0027 + notice + \u0027\\n\u0027);\n  }\n  return String(text || \u0027\u0027) + \u0027\\n\\n\u0027 + notice;\n}\n\nrawMarkdown = normalizeRtmGeneratedText(rawMarkdown);\nrawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);\nrawMarkdown = dedupeRtmLayer2Sections(rawMarkdown);\nrawMarkdown = injectRtmFreshnessNotice(rawMarkdown);\nrawMarkdown = stripUnsupportedRtmRiskFields(rawMarkdown);\n\nfunction tableSafeCell(value) {\n  const normalized = String(value ?? \u0027Not available\u0027)\n    .replace(/\\[[^\\]\\n]*\\|[^\\]\\n]*\\]/g, match =\u003e match.slice(1, -1).replace(/\\|/g, \u0027 - \u0027))\n    .replace(/\\|/g, \u0027-\u0027)\n    .replace(/[\\r\\n]+/g, \u0027 \u0027)\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n  return normalized || \u0027Not available\u0027;\n}\n\nfunction splitMarkdownTableLine(line) {\n  return String(line || \u0027\u0027).trim().replace(/^\\|/, \u0027\u0027).replace(/\\|$/, \u0027\u0027).split(\u0027|\u0027).map(cell =\u003e cell.trim());\n}\n\nfunction isMarkdownTableLine(line) {\n  return /^\\s*\\|.*\\|\\s*$/.test(String(line || \u0027\u0027));\n}\n\nfunction isMarkdownSeparatorLine(line) {\n  return splitMarkdownTableLine(line).every(cell =\u003e /^:?-{3,}:?$/.test(cell));\n}\n\nfunction normalizeTableRows(text) {\n  return String(text || \u0027\u0027).split(/\\r?\\n/).map(line =\u003e {\n    if (!isMarkdownTableLine(line)) return line;\n    const cells = splitMarkdownTableLine(line).map(tableSafeCell);\n    return \u0027| \u0027 + cells.join(\u0027 | \u0027) + \u0027 |\u0027;\n  }).join(\u0027\\n\u0027);\n}\n\nfunction removeDuplicateCoverageLedgerHeader(text) {\n  const lines = String(text || \u0027\u0027).split(/\\r?\\n/);\n  const result = [];\n  let inCoverage = false;\n  let seenHeader = false;\n  for (let i = 0; i \u003c lines.length; i += 1) {\n    const line = lines[i];\n    const lower = line.toLowerCase();\n    if (/^\\s*#{0,6}\\s*coverage ledger\\s*:?\\s*$/i.test(line) || /^\\s*#{1,6}\\s+.*coverage\\s+ledger/i.test(line)) {\n      inCoverage = true;\n      seenHeader = false;\n      result.push(line);\n      continue;\n    }\n    if (inCoverage \u0026\u0026 /^\\s*#{1,6}\\s+/.test(line) \u0026\u0026 !/coverage\\s+ledger/i.test(line)) {\n      inCoverage = false;\n    }\n    if (inCoverage \u0026\u0026 isMarkdownTableLine(line)) {\n      const joined = splitMarkdownTableLine(line).join(\u0027 \u0027).toLowerCase();\n      const isCoverageHeader = joined.includes(\u0027coverage id\u0027) \u0026\u0026 joined.includes(\u0027module\u0027) \u0026\u0026 joined.includes(\u0027status\u0027);\n      if (isCoverageHeader) {\n        if (seenHeader) {\n          if (isMarkdownSeparatorLine(lines[i + 1] || \u0027\u0027)) i += 1;\n          continue;\n        }\n        seenHeader = true;\n      }\n    }\n    result.push(line);\n  }\n  return result.join(\u0027\\n\u0027);\n}\n\nfunction stripAssistantClosings(text) {\n  return String(text || \u0027\u0027)\n    .replace(/^\\s*(Please advise|Let me know|If you need|If you would like)[^\\n]*(?:\\n|$)/gim, \u0027\u0027)\n    .trim();\n}\n\nfunction normalizeRuntimeHeader(text) {\n  const model = $(\u0027Restore Job Context\u0027).item.json.configSnapshot?.models?.generationModel || \u0027gpt-4.1-mini\u0027;\n  const collection = $(\u0027Restore Job Context\u0027).item.json.configSnapshot?.chroma?.collection || \u0027qa-chunks-batches\u0027;\n  return String(text || \u0027\u0027)\n    .replace(/Model:\\s*gpt-4o-mini/g, \u0027Model: \u0027 + model)\n    .replace(/Vector Collection:\\s*qa-knowledge-base/g, \u0027Vector Collection: \u0027 + collection);\n}\n\nfunction injectSharedCoverageNotice(text, coverageSummary) {\n  if (![\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(documentType)) return text;\n  const summary = coverageSummary || {};\n  if (summary.gateStatus !== \u0027warning\u0027 || /Coverage Review Note/i.test(text)) return text;\n  const warningCount = Number(summary.partialCount || 0) + Number(summary.missingCount || 0) + Number(summary.unknownCount || 0);\n  const notice = [\n    \u0027### Coverage Review Note\u0027,\n    \u0027\u0027,\n    \u0027Coverage review recommended: \u0027 + (Number(summary.coveredCount) || 0) + \u0027 item(s) are covered and \u0027 + warningCount + \u0027 item(s) need review. Review the Coverage Ledger before final sign-off.\u0027,\n    \u0027\u0027\n  ].join(\u0027\\n\u0027);\n  const firstHeading = String(text || \u0027\u0027).match(/^#{1,2}\\s+.+$/m);\n  if (firstHeading) {\n    const index = firstHeading.index + firstHeading[0].length;\n    return text.slice(0, index) + \u0027\\n\\n\u0027 + notice + text.slice(index).replace(/^\\n+/, \u0027\\n\u0027);\n  }\n  return notice + String(text || \u0027\u0027);\n}\n\nfunction compactRiskTitle(value) {\n  const text = tableSafeCell(value)\n    .replace(/^risks*[:-]s*/i, \u0027\u0027)\n    .replace(/s+dues+tos+.*$/i, \u0027\u0027)\n    .replace(/s+causings+.*$/i, \u0027\u0027)\n    .replace(/s+potentiallys+.*$/i, \u0027\u0027)\n    .trim();\n  const words = text.split(/s+/).filter(Boolean);\n  const compact = words.slice(0, 12).join(\u0027 \u0027);\n  return compact || \u0027Risk item\u0027;\n}\n\nfunction splitRiskMatrixWideTable(text) {\n  if (documentType !== \u0027risk_matrix\u0027) return text;\n  const lines = String(text || \u0027\u0027).split(/\\r?\\n/);\n  const out = [];\n  for (let i = 0; i \u003c lines.length; i += 1) {\n    const line = lines[i];\n    if (!isMarkdownTableLine(line)) {\n      out.push(line);\n      continue;\n    }\n    const header = splitMarkdownTableLine(line);\n    const normalizedHeader = header.map(cell =\u003e cell.toLowerCase());\n    const isRiskWideTable = [\u0027risk id\u0027, \u0027risk category\u0027, \u0027risk description\u0027, \u0027source reference\u0027, \u0027probability\u0027, \u0027impact\u0027, \u0027risk score\u0027, \u0027mitigation plan\u0027, \u0027contingency plan\u0027, \u0027owner\u0027, \u0027detection strategy\u0027]\n      .every(required =\u003e normalizedHeader.includes(required));\n    if (!isRiskWideTable) {\n      out.push(line);\n      continue;\n    }\n\n    const group = [line];\n    let j = i + 1;\n    while (j \u003c lines.length \u0026\u0026 isMarkdownTableLine(lines[j])) {\n      group.push(lines[j]);\n      j += 1;\n    }\n    i = j - 1;\n\n    const indexes = Object.fromEntries(normalizedHeader.map((name, index) =\u003e [name, index]));\n    const dataRows = group.slice(1).filter(row =\u003e !isMarkdownSeparatorLine(row)).map(splitMarkdownTableLine);\n    out.push(\u0027### Risk Register Summary\u0027, \u0027\u0027);\n    out.push(\u0027| Risk ID | Category | Risk Title | Probability | Impact | Risk Score | Owner |\u0027);\n    out.push(\u0027| --- | --- | --- | --- | --- | --- | --- |\u0027);\n    for (const row of dataRows) {\n      out.push(\u0027| \u0027 + [\n        row[indexes[\u0027risk id\u0027]],\n        row[indexes[\u0027risk category\u0027]],\n        compactRiskTitle(row[indexes[\u0027risk description\u0027]]),\n        row[indexes.probability],\n        row[indexes.impact],\n        row[indexes[\u0027risk score\u0027]],\n        row[indexes.owner]\n      ].map(tableSafeCell).join(\u0027 | \u0027) + \u0027 |\u0027);\n    }\n    out.push(\u0027\u0027, \u0027### Risk Detail Register\u0027, \u0027\u0027);\n    out.push(\u0027| Risk ID | Risk Description | Source Reference | Mitigation Plan | Contingency Plan | Detection Strategy |\u0027);\n    out.push(\u0027| --- | --- | --- | --- | --- | --- |\u0027);\n    for (const row of dataRows) {\n      out.push(\u0027| \u0027 + [\n        row[indexes[\u0027risk id\u0027]],\n        row[indexes[\u0027risk description\u0027]],\n        row[indexes[\u0027source reference\u0027]],\n        row[indexes[\u0027mitigation plan\u0027]],\n        row[indexes[\u0027contingency plan\u0027]],\n        row[indexes[\u0027detection strategy\u0027]]\n      ].map(tableSafeCell).join(\u0027 | \u0027) + \u0027 |\u0027);\n    }\n  }\n  return out.join(\u0027\\n\u0027);\n}\n\n\nfunction sharedCoverageTableCell(value) {\n  return String(value === undefined || value === null ? \u0027\u0027 : value)\n    .replace(/\\|/g, \u0027-\u0027)\n    .replace(/[\\r\\n]+/g, \u0027 \u0027)\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim() || \u0027Not available\u0027;\n}\n\nfunction sanitizedCoverageLedgerMarkdown(coverageLedger) {\n  const rows = Array.isArray(coverageLedger) ? coverageLedger : [];\n  if (!rows.length) return \u0027\u0027;\n  return [\n    \u0027### Coverage Ledger\u0027,\n    \u0027\u0027,\n    \u0027| Coverage ID | Module / Requirement | Source Reference | Included In Output | Coverage Status | Notes |\u0027,\n    \u0027| --- | --- | --- | --- | --- | --- |\u0027,\n    ...rows.map(row =\u003e \u0027| \u0027 + [\n      row.coverageId,\n      row.moduleRequirement,\n      row.sourceReference,\n      row.includedInOutput,\n      row.coverageStatus,\n      row.notes\n    ].map(sharedCoverageTableCell).join(\u0027 | \u0027) + \u0027 |\u0027)\n  ].join(\u0027\\n\u0027);\n}\n\nfunction replaceSharedCoverageLedgerMarkdown(text, coverageLedger) {\n  const sharedTypes = new Set([\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027]);\n  if (!sharedTypes.has(documentType) || !Array.isArray(coverageLedger) || !coverageLedger.length) return text;\n  const replacement = sanitizedCoverageLedgerMarkdown(coverageLedger);\n  const lines = String(text || \u0027\u0027).split(/\\r?\\n/);\n  const start = lines.findIndex(line =\u003e /^\\s*#{0,6}\\s*(?:Appendix\\s*\\/\\s*)?Coverage\\s+Ledger\\s*:?\\s*$/i.test(line.trim()));\n  if (start \u003c 0) return text + \u0027\\n\\n\u0027 + replacement;\n  let end = start + 1;\n  while (end \u003c lines.length \u0026\u0026 !/^\\s*#{1,6}\\s+/.test(lines[end].trim())) end += 1;\n  return [...lines.slice(0, start), replacement, ...lines.slice(end)].join(\u0027\\n\u0027);\n}\n\n\nfunction applySharedDocumentCleanup(text, coverageSummary, coverageLedger) {\n  let cleaned = String(text || \u0027\u0027);\n  cleaned = normalizeRuntimeHeader(cleaned);\n  cleaned = stripAssistantClosings(cleaned);\n  cleaned = normalizeTableRows(cleaned);\n  cleaned = splitRiskMatrixWideTable(cleaned);\n  cleaned = removeDuplicateCoverageLedgerHeader(cleaned);\n  cleaned = replaceSharedCoverageLedgerMarkdown(cleaned, coverageLedger);\n  cleaned = injectSharedCoverageNotice(cleaned, coverageSummary);\n  return cleaned.trim();\n}\n\n\nrawMarkdown = applySharedDocumentCleanup(rawMarkdown, coverageSummary, coverageLedger);\nwordCount = rawMarkdown.trim() ? rawMarkdown.trim().split(/\\s+/).length : 0;\n\nconst MIN_WORD_COUNTS = {\n  test_strategy:       2000,\n  test_plan:           1500,\n  test_cases:          1000,\n  user_stories:        500,\n  risk_matrix:         800,\n  traceability_matrix: 800\n};\n\nconst isSharedDeltaUpdate = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(documentType)\n  \u0026\u0026 (generationMode === \u0027update\u0027 || Boolean(updateContext.updateMode || updateContext.deltaRequested || updateContext.previousJobId));\nconst minWords = isSharedDeltaUpdate ? 300 : (MIN_WORD_COUNTS[documentType] || 500);\n\nif (wordCount \u003c minWords) {\n  throw new Error(\n    `Quality Gate Failed - Word count too low for ${documentType}. ` +\n    `Got ${wordCount} words, minimum is ${minWords}.`\n  );\n}\n\nconst REQUIRED_SECTIONS = {\n  test_strategy: [\n    \"Introduction\",\n    \"Scope\",\n    \"Automation\",\n    \"Risk\",\n    \"Metrics\"\n  ],\n  test_plan: [\n    \"Scope\",\n    \"Objectives\",\n    \"Entry\",\n    \"Exit\",\n    \"Risk\"\n  ],\n  test_cases: [\n    \"Test Case\",\n    \"Precondition\",\n    \"Expected\"\n  ],\n  user_stories: [\n    \"epicId\",\n    \"userStoryId\",\n    \"acceptanceCriteria\"\n  ],\n  risk_matrix: [\n    \"Risk\",\n    \"Probability\",\n    \"Impact\",\n    \"Mitigation\"\n  ],\n  traceability_matrix: [\n    \"Req ID\",\n    \"Test Case\",\n    \"Coverage\"\n  ]\n};\n\nconst requiredSections = REQUIRED_SECTIONS[documentType] || [];\nconst missingSections = requiredSections.filter(\n  section =\u003e !rawMarkdown.toLowerCase().includes(section.toLowerCase())\n);\n\nif (missingSections.length \u003e 0) {\n  throw new Error(\n    `Quality Gate Failed - Missing required sections for ${documentType}: ` +\n    missingSections.join(\", \")\n  );\n}\n\nconst TRACEABILITY_MARKERS = [\n  \"brd\", \"frd\", \"hld\", \"lld\",\n  \"as mentioned in\", \"according to\",\n  \"transcript\", \"requirement\"\n];\n\nif (documentType !== \"user_stories\") {\n  const hasTraceability = TRACEABILITY_MARKERS.some(\n    marker =\u003e rawMarkdown.toLowerCase().includes(marker)\n  );\n\n  if (!hasTraceability) {\n    throw new Error(\n      `Quality Gate Failed - Output contains no source document references ` +\n      `(BRD, FRD, HLD, LLD etc.) for ${documentType}. ` +\n      `Output may be hallucinated.`\n    );\n  }\n}\n\n\nfunction markdownTableGroups(text) {\n  const lines = String(text || \u0027\u0027).split(/\\r?\\n/);\n  const groups = [];\n  let current = [];\n  for (const line of lines) {\n    if (/^\\s*\\|.*\\|\\s*$/.test(line)) {\n      current.push(line);\n    } else if (current.length) {\n      groups.push(current);\n      current = [];\n    }\n  }\n  if (current.length) groups.push(current);\n  return groups;\n}\n\nfunction tableCells(line) {\n  return String(line || \u0027\u0027)\n    .trim()\n    .replace(/^\\|/, \u0027\u0027)\n    .replace(/\\|$/, \u0027\u0027)\n    .split(\u0027|\u0027)\n    .map(cell =\u003e cell.trim());\n}\n\nfunction isSeparatorLine(line) {\n  return tableCells(line).every(cell =\u003e /^:?-{3,}:?$/.test(cell));\n}\n\nfunction headingCount(text, title) {\n  const escapedTitle = title.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, \u0027\\\\$\u0026\u0027);\n  const pattern = new RegExp(\u0027^#{1,6}\\\\s*(?:\\\\d+\\\\.\\\\s*)?\u0027 + escapedTitle + \u0027\\\\s*$\u0027, \u0027gmi\u0027);\n  return (String(text || \u0027\u0027).match(pattern) || []).length;\n}\n\nfunction validateNamedTable(text, tableName, requiredHeaders) {\n  const groups = markdownTableGroups(text);\n  const normalizedRequired = requiredHeaders.map(header =\u003e header.toLowerCase());\n  const group = groups.find(rows =\u003e {\n    const header = tableCells(rows[0]).map(cell =\u003e cell.toLowerCase());\n    return normalizedRequired.every(required =\u003e header.includes(required));\n  });\n  if (!group) {\n    throw new Error(\u0027RTM Contract Failed - Missing required table: \u0027 + tableName);\n  }\n  const expectedCount = tableCells(group[0]).length;\n  for (const row of group) {\n    if (isSeparatorLine(row)) continue;\n    const count = tableCells(row).length;\n    if (count !== expectedCount) {\n      throw new Error(\u0027RTM Contract Failed - Table \"\u0027 + tableName + \u0027\" has a row with \u0027 + count + \u0027 columns; expected \u0027 + expectedCount + \u0027. Avoid pipe characters inside cell values.\u0027);\n    }\n  }\n}\n\nfunction validateRtmOutputContract(rawMarkdown, coverageSummary) {\n  const text = String(rawMarkdown || \u0027\u0027);\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const context = prompt.traceabilityContext || {};\n  const counts = context.counts || {};\n  const lower = text.toLowerCase();\n\n  if (/Main Requirement Traceability Matrix Table/i.test(text)) {\n    throw new Error(\u0027RTM Contract Failed - Legacy \"Main Requirement Traceability Matrix Table\" section is not allowed.\u0027);\n  }\n  if (/Model:\\s*gpt-4o-mini/i.test(text) || /Vector Collection:\\s*qa-knowledge-base/i.test(text)) {\n    throw new Error(\u0027RTM Contract Failed - Hardcoded model/vector metadata found. Use runtime metadata only.\u0027);\n  }\n  const hasRiskIdColumn = markdownTableGroups(text).some(rows =\u003e tableCells(rows[0]).some(cell =\u003e /^risk\\s*(?:id|ids|identifier|identifiers)$/i.test(cell)));\n  if (hasRiskIdColumn || /\\bRSK-[A-Za-z0-9-]+\\b/i.test(text)) {\n    throw new Error(\u0027RTM Contract Failed - Risk identifiers are not available in the RTM context and must not be invented.\u0027);\n  }\n  if (/\\bfully\\s+(?:implemented|tested|validated|verified)|\\bimplemented\\s+and\\s+tested\\b|\\btests?\\s+passed\\b|\\bproduction[-\\s]?ready\\b/i.test(text)) {\n    throw new Error(\u0027RTM Contract Failed - Delivery/execution status claims are not supported by the current RTM evidence.\u0027);\n  }\n  if (/\\|\\s*Number of Test Cases\\s*\\|/i.test(text)) {\n    throw new Error(\u0027RTM Contract Failed - Coverage by Test Category must not use Number of Test Cases unless numeric counts are available. Use Coverage Scope and Evidence Basis.\u0027);\n  }\n  const hasAutomationColumn = markdownTableGroups(text).some(rows =\u003e tableCells(rows[0]).some(cell =\u003e /^automation status$/i.test(cell)));\n  const hasAutomationPercentage = /approx(?:imate|\\.)?\\s*\\d+%\\s*automation|\\b\\d+%\\s*automation/i.test(text);\n  const hasInventedAutomationCell = markdownTableGroups(text).some(rows =\u003e rows.slice(2).some(row =\u003e tableCells(row).some(cell =\u003e /^(automated|partially automated|manual|not automated)$/i.test(cell))));\n  if (hasAutomationColumn || hasAutomationPercentage || hasInventedAutomationCell) {\n    throw new Error(\u0027RTM Contract Failed - Automation columns, percentages, or invented automation statuses are not available in the RTM context.\u0027);\n  }\n  if (/[A-Z][A-Z0-9]+-\\d+\\s*\\.\\.\\s*[A-Z][A-Z0-9]+-\\d+/.test(text)) {\n    throw new Error(\u0027RTM Contract Failed - Test case range shorthand is not allowed. List actual test case keys.\u0027);\n  }\n\n  const coverageLedgerHeadingCount = headingCount(text, \u0027Coverage Ledger\u0027);\n  if (coverageLedgerHeadingCount !== 1) {\n    throw new Error(\u0027RTM Contract Failed - Expected exactly one Coverage Ledger heading, found \u0027 + coverageLedgerHeadingCount + \u0027.\u0027);\n  }\n  const layer2HeadingCount = headingCount(text, \u0027Layer 2 - User Stories to Generated Test Cases\u0027);\n  if (layer2HeadingCount !== 1) {\n    throw new Error(\u0027RTM Contract Failed - Expected exactly one Layer 2 heading, found \u0027 + layer2HeadingCount + \u0027.\u0027);\n  }\n\n  validateNamedTable(text, \u0027Layer 1 - Requirements to Epics/User Stories\u0027, [\u0027Req ID\u0027, \u0027Requirement Description\u0027, \u0027Source Reference\u0027, \u0027Jira Epic Key\u0027, \u0027Jira Story Key\u0027, \u0027Backlog Coverage Status\u0027]);\n  validateNamedTable(text, \u0027Layer 2 - User Stories to Generated Test Cases\u0027, [\u0027Story Key\u0027, \u0027Story Summary\u0027, \u0027Test Case Keys\u0027, \u0027Unique Test Case Count\u0027, \u0027Test Categories\u0027, \u0027Test Coverage Status\u0027]);\n  validateNamedTable(text, \u0027Coverage by Test Category\u0027, [\u0027Test Category\u0027, \u0027Coverage Scope\u0027, \u0027Evidence Basis\u0027, \u0027Notes\u0027]);\n  validateNamedTable(text, \u0027Coverage Ledger\u0027, [\u0027Coverage ID\u0027, \u0027Module / Requirement\u0027, \u0027Source Reference\u0027, \u0027Included In Output\u0027, \u0027Coverage Status\u0027, \u0027Notes\u0027]);\n\n  const expectedStoryKeys = [...new Set((context.stories || []).map(story =\u003e story.storyKey).filter(Boolean))];\n  const missingStories = expectedStoryKeys.filter(key =\u003e !text.includes(key));\n  if (missingStories.length) {\n    throw new Error(\u0027RTM Contract Failed - Missing story key(s) from output: \u0027 + missingStories.slice(0, 10).join(\u0027, \u0027));\n  }\n\n  const expectedTestCaseKeys = [...new Set((context.storyTestCaseLinks || []).map(link =\u003e link.testcaseKey).filter(Boolean))];\n  const missingTestCases = expectedTestCaseKeys.filter(key =\u003e !text.includes(key));\n  if (missingTestCases.length) {\n    throw new Error(\u0027RTM Contract Failed - Missing generated test case key(s) from output: \u0027 + missingTestCases.slice(0, 15).join(\u0027, \u0027) + (missingTestCases.length \u003e 15 ? \u0027...\u0027 : \u0027\u0027));\n  }\n\n  const ledgerCount = Number(coverageSummary.coverageLedgerCount) || 0;\n  const declaredPatterns = [\n    /Defines\\s+(\\d+)\\s+key requirements/i,\n    /Total Requirements Analyzed:\\s*(\\d+)/i,\n    /Total Requirements Identified:\\s*(\\d+)/i\n  ];\n  for (const pattern of declaredPatterns) {\n    const match = text.match(pattern);\n    if (match \u0026\u0026 ledgerCount \u0026\u0026 Number(match[1]) !== ledgerCount) {\n      throw new Error(\u0027RTM Contract Failed - Requirement count mismatch. Declared \u0027 + match[1] + \u0027 but coverage ledger has \u0027 + ledgerCount + \u0027.\u0027);\n    }\n  }\n\n  if (!lower.includes(\u0027layer 1 - requirements to epics/user stories\u0027) || !lower.includes(\u0027layer 2 - user stories to generated test cases\u0027)) {\n    throw new Error(\u0027RTM Contract Failed - Required Layer 1 and Layer 2 section titles were not found.\u0027);\n  }\n\n  const misleadingMissingStoryLine = String(text || \u0027\u0027).split(/\\r?\\n/).some(line =\u003e {\n    const trimmed = line.trim();\n    if (/^#{1,6}\\s*/.test(trimmed)) return false;\n    if (!/stories? without test case/i.test(trimmed)) return false;\n    return !/(^|[:\\-\\s])(?:0|none|no)\\b/i.test(trimmed);\n  });\n  if (Number(counts.storiesWithoutTestCases || 0) === 0 \u0026\u0026 misleadingMissingStoryLine) {\n    throw new Error(\u0027RTM Contract Failed - Output suggests missing story test coverage even though context has zero missing stories.\u0027);\n  }\n}\n\nconst sharedCoveragePlanningTypes = new Set([\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027]);\n\nfunction sharedDocumentSections(documentType) {\n  const sections = {\n    test_strategy: [\n      \u0027Introduction \u0026 Context\u0027,\n      \u0027Testing Scope\u0027,\n      \u0027Strategic Testing Approach\u0027,\n      \u0027Automation Strategy \u0026 Roadmap\u0027,\n      \u0027Test Environment \u0026 Infrastructure Strategy\u0027,\n      \u0027Test Data Management Strategy\u0027,\n      \u0027Quality Metrics \u0026 Reporting Framework\u0027,\n      \u0027Risk-Based Testing \u0026 Mitigation Strategy\u0027,\n      \u0027Roles, Collaboration \u0026 RACI Model\u0027,\n      \u0027Compliance, Security \u0026 Regulatory Considerations\u0027,\n      \u0027Tooling \u0026 Integration Landscape\u0027,\n      \u0027Communication \u0026 Governance Model\u0027,\n      \u0027Appendix / Coverage Ledger\u0027\n    ],\n    test_plan: [\n      \u0027Test Strategy\u0027,\n      \u0027Scope\u0027,\n      \u0027Test Objectives\u0027,\n      \u0027Test Deliverables\u0027,\n      \u0027Entry and Exit Criteria\u0027,\n      \u0027Test Schedule and Milestones\u0027,\n      \u0027Risks, Mitigation \u0026 Contingency Plan\u0027,\n      \u0027Test Environment\u0027,\n      \u0027Tools and Resources\u0027,\n      \u0027Roles and Responsibilities\u0027,\n      \u0027Test Data and Configurations\u0027,\n      \u0027Reporting and Communication Plan\u0027,\n      \u0027Suspension \u0026 Resumption Criteria\u0027,\n      \u0027Assumptions \u0026 Dependencies\u0027,\n      \u0027Automation Coverage Matrix\u0027,\n      \u0027Test Coverage Metrics\u0027,\n      \u0027Approval \u0026 Sign-off\u0027,\n      \u0027Appendix / Coverage Ledger\u0027\n    ],\n    risk_matrix: [\n      \u0027Executive Summary\u0027,\n      \u0027Risk Register Summary\u0027,\n      \u0027Risk Detail Register\u0027,\n      \u0027Risk Heat Map Summary\u0027,\n      \u0027Top Critical Risks Analysis\u0027,\n      \u0027Risk Prioritization Strategy Explanation\u0027,\n      \u0027Linkage to Test Strategy Alignment\u0027,\n      \u0027Coverage Ledger\u0027\n    ]\n  };\n  return sections[documentType] || [];\n}\n\nfunction sectionKey(value) {\n  return String(value || \u0027\u0027)\n    .replace(/^\\s*\\d+[.)-]?\\s*/, \u0027\u0027)\n    .toLowerCase()\n    .replace(/\u0026/g, \u0027 and \u0027)\n    .replace(/[^a-z0-9]+/g, \u0027 \u0027)\n    .trim();\n}\n\nfunction canonicalSharedSectionName(documentType, value) {\n  const raw = String(value || \u0027\u0027).trim();\n  if (!raw) return \u0027\u0027;\n  const key = sectionKey(raw);\n  const aliases = {\n    test_strategy: {\n      \u0027quality metrics reporting\u0027: \u0027Quality Metrics \u0026 Reporting Framework\u0027,\n      \u0027quality metrics and reporting\u0027: \u0027Quality Metrics \u0026 Reporting Framework\u0027,\n      \u0027quality metrics reporting framework\u0027: \u0027Quality Metrics \u0026 Reporting Framework\u0027,\n      \u0027quality metrics and reporting framework\u0027: \u0027Quality Metrics \u0026 Reporting Framework\u0027,\n      \u0027risk based testing mitigation\u0027: \u0027Risk-Based Testing \u0026 Mitigation Strategy\u0027,\n      \u0027risk based testing and mitigation\u0027: \u0027Risk-Based Testing \u0026 Mitigation Strategy\u0027,\n      \u0027risk based testing mitigation strategy\u0027: \u0027Risk-Based Testing \u0026 Mitigation Strategy\u0027,\n      \u0027risk based testing and mitigation strategy\u0027: \u0027Risk-Based Testing \u0026 Mitigation Strategy\u0027,\n      \u0027coverage ledger\u0027: \u0027Appendix / Coverage Ledger\u0027,\n      \u0027appendix coverage ledger\u0027: \u0027Appendix / Coverage Ledger\u0027,\n      \u0027appendix traceability matrix\u0027: \u0027Appendix / Coverage Ledger\u0027,\n      \u0027automation strategy roadmap\u0027: \u0027Automation Strategy \u0026 Roadmap\u0027,\n      \u0027strategic testing approach\u0027: \u0027Strategic Testing Approach\u0027,\n      \u0027testing scope\u0027: \u0027Testing Scope\u0027\n    },\n    test_plan: {\n      \u0027coverage ledger\u0027: \u0027Appendix / Coverage Ledger\u0027,\n      \u0027appendix coverage ledger\u0027: \u0027Appendix / Coverage Ledger\u0027,\n      \u0027risks mitigation contingency plan\u0027: \u0027Risks, Mitigation \u0026 Contingency Plan\u0027,\n      \u0027test data configurations\u0027: \u0027Test Data and Configurations\u0027,\n      \u0027entry exit criteria\u0027: \u0027Entry and Exit Criteria\u0027\n    },\n    risk_matrix: {\n      \u0027coverage ledger\u0027: \u0027Coverage Ledger\u0027,\n      \u0027risk identification and categorization\u0027: \u0027Risk Detail Register\u0027,\n      \u0027main risk identification table\u0027: \u0027Risk Detail Register\u0027,\n      \u0027top 5 critical risks analysis\u0027: \u0027Top Critical Risks Analysis\u0027\n    }\n  };\n  if (aliases[documentType]?.[key]) return aliases[documentType][key];\n  const canonical = sharedDocumentSections(documentType).find(section =\u003e sectionKey(section) === key);\n  return canonical || raw;\n}\n\nfunction normalizeDeltaAction(value) {\n  const action = String(value || \u0027\u0027).trim().toLowerCase().replace(/\\s+/g, \u0027_\u0027);\n  if ([\u0027updated\u0027, \u0027update\u0027, \u0027modified\u0027, \u0027changed\u0027, \u0027refreshed\u0027].includes(action)) return \u0027updated\u0027;\n  if ([\u0027added\u0027, \u0027add\u0027, \u0027new\u0027, \u0027created\u0027].includes(action)) return \u0027added\u0027;\n  if ([\u0027removed\u0027, \u0027remove\u0027, \u0027deleted\u0027].includes(action)) return \u0027removed\u0027;\n  if ([\u0027preserved\u0027, \u0027preserve\u0027, \u0027unchanged\u0027, \u0027reused\u0027, \u0027retained\u0027].includes(action)) return \u0027preserved\u0027;\n  if ([\u0027no_change\u0027, \u0027none\u0027, \u0027no_changes\u0027].includes(action)) return \u0027no_change\u0027;\n  if ([\u0027needs_review\u0027, \u0027review\u0027, \u0027needs-review\u0027, \u0027partial\u0027, \u0027weak_evidence\u0027].includes(action)) return \u0027needs_review\u0027;\n  return action || \u0027updated\u0027;\n}\n\nfunction uniqueStrings(values) {\n  return [...new Set((Array.isArray(values) ? values : [])\n    .map(value =\u003e String(value || \u0027\u0027).trim())\n    .filter(Boolean))];\n}\n\nfunction hasConcreteChunkReference(value) {\n  return /chunkIds?\\s*[:=]\\s*[A-Za-z0-9][A-Za-z0-9_.:-]{7,}/i.test(String(value || \u0027\u0027));\n}\n\nfunction findDeltaEvidenceIssues(value) {\n  const text = String(value || \u0027\u0027).trim();\n  const issues = [];\n  if (!hasConcreteChunkReference(text)) issues.push(\u0027missing concrete chunkId\u0027);\n  if (/\\b(derived|internal compilation|compiled|combined|multiple documents|various|grooming insights|personas and transcripts|frd,\\s*lld|brd personas|source combinations?)\\b/i.test(text)) {\n    issues.push(\u0027broad or inferred evidence\u0027);\n  }\n  if (/\\.\\.\\./.test(text)) issues.push(\u0027truncated evidence\u0027);\n  return issues;\n}\n\nfunction parseDeltaUpdateSummaryRows(markdown) {\n  const text = String(markdown || \u0027\u0027);\n  const marker = text.search(/^\\s*#{0,6}\\s*Delta Update Summary\\s*$/im);\n  if (marker \u003c 0) return [];\n  const section = text.slice(marker).split(/\\n\\s*#{1,6}\\s+(?!Delta Update Summary)/i)[0] || \u0027\u0027;\n  const rows = [];\n  for (const line of section.split(/\\r?\\n/)) {\n    const trimmed = line.trim();\n    if (!trimmed.startsWith(\u0027|\u0027) || !trimmed.endsWith(\u0027|\u0027)) continue;\n    if (/^\\|\\s*-+\\s*\\|/.test(trimmed) || /section\\s*\\|\\s*action/i.test(trimmed)) continue;\n    const cells = trimmed.slice(1, -1).split(\u0027|\u0027).map(cell =\u003e cell.trim());\n    if (cells.length \u003c 2) continue;\n    rows.push({\n      section: cells[0] || \u0027\u0027,\n      action: normalizeDeltaAction(cells[1]),\n      reason: cells[2] || \u0027\u0027,\n      evidenceReference: cells.slice(3, -1).join(\u0027 | \u0027) || cells[3] || \u0027\u0027,\n      reviewStatus: cells.length \u003e 4 ? cells[cells.length - 1] : \u0027\u0027\n    });\n  }\n  return rows;\n}\n\nfunction inferSharedUpdatedSections(documentType, updateReasons, coverageSummary) {\n  const reasons = (Array.isArray(updateReasons) ? updateReasons : []).join(\u0027 \u0027).toLowerCase();\n  const reviewCount = (Number(coverageSummary.partialCount) || 0) + (Number(coverageSummary.missingCount) || 0) + (Number(coverageSummary.unknownCount) || 0);\n  const sections = [];\n  if (documentType === \u0027risk_matrix\u0027) {\n    if (reasons || reviewCount) sections.push(\u0027Risk Register Summary\u0027, \u0027Risk Detail Register\u0027, \u0027Coverage Ledger\u0027);\n  } else if (documentType === \u0027test_plan\u0027) {\n    if (reasons.includes(\u0027knowledge base\u0027)) sections.push(\u0027Scope\u0027, \u0027Test Objectives\u0027, \u0027Risks, Mitigation \u0026 Contingency Plan\u0027, \u0027Test Data and Configurations\u0027, \u0027Appendix / Coverage Ledger\u0027);\n    if (reviewCount) sections.push(\u0027Appendix / Coverage Ledger\u0027);\n  } else if (documentType === \u0027test_strategy\u0027) {\n    if (reasons.includes(\u0027knowledge base\u0027)) sections.push(\u0027Testing Scope\u0027, \u0027Strategic Testing Approach\u0027, \u0027Risk-Based Testing \u0026 Mitigation Strategy\u0027, \u0027Appendix / Coverage Ledger\u0027);\n    if (reviewCount) sections.push(\u0027Appendix / Coverage Ledger\u0027);\n  }\n  return uniqueStrings(sections);\n}\n\nfunction normalizeCoverageRow(row) {\n  const coverageId = String(row?.coverageId || row?.coverage_id || row?.id || \u0027\u0027).trim();\n  const moduleRequirement = String(row?.moduleRequirement || row?.module_requirement || row?.requirement || row?.module || \u0027\u0027).trim();\n  const sourceReference = String(row?.sourceReference || row?.source_reference || row?.source || \u0027\u0027).trim();\n  const includedInOutput = String(row?.includedInOutput || row?.included_in_output || row?.included || \u0027\u0027).trim();\n  const coverageStatus = String(row?.coverageStatus || row?.coverage_status || row?.status || \u0027unknown\u0027).trim().toLowerCase();\n  const notes = String(row?.notes || row?.note || row?.rationale || \u0027\u0027).trim();\n  const key = (coverageId || moduleRequirement || sourceReference || JSON.stringify(row || {})).toLowerCase();\n  return { key, coverageId, moduleRequirement, sourceReference, includedInOutput, coverageStatus, notes };\n}\n\n\nfunction coverageRowIsExplicitlyRemoved(row) {\n  const status = String(row?.coverageStatus || row?.coverage_status || row?.status || \u0027\u0027).trim().toLowerCase();\n  const included = String(row?.includedInOutput || row?.included_in_output || row?.included || \u0027\u0027).trim().toLowerCase();\n  const notes = String(row?.notes || row?.note || row?.rationale || \u0027\u0027).trim().toLowerCase();\n  return [\u0027removed\u0027, \u0027deleted\u0027, \u0027superseded\u0027].includes(status)\n    || included === \u0027removed\u0027\n    || /\\b(explicitly\\s+)?(removed|deleted|superseded)\\b/.test(notes);\n}\n\nfunction comparableCoverageRow(row) {\n  const normalized = normalizeCoverageRow(row);\n  return JSON.stringify({\n    coverageId: normalized.coverageId,\n    moduleRequirement: normalized.moduleRequirement,\n    sourceReference: normalized.sourceReference,\n    includedInOutput: normalized.includedInOutput,\n    coverageStatus: normalized.coverageStatus,\n    notes: normalized.notes\n  });\n}\n\nfunction summarizeCoverageRows(rows, fallbackSummary = {}) {\n  const normalizedRows = (Array.isArray(rows) ? rows : []).map(normalizeCoverageRow);\n  const coveredCount = normalizedRows.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  const partialCount = normalizedRows.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  const missingCount = normalizedRows.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  const unknownCount = normalizedRows.filter(row =\u003e row.coverageStatus === \u0027unknown\u0027).length;\n  const excludedCount = normalizedRows.filter(row =\u003e [\u0027excluded\u0027, \u0027out_of_scope\u0027].includes(row.coverageStatus)).length;\n  const warningItems = normalizedRows.filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus));\n  return {\n    ...fallbackSummary,\n    version: fallbackSummary.version || \u0027coverage-ledger-v1\u0027,\n    mode: fallbackSummary.mode || \u0027enforced\u0027,\n    coverageLedgerCount: normalizedRows.length,\n    coveredCount,\n    partialCount,\n    missingCount,\n    unknownCount,\n    excludedCount,\n    uncoveredCount: missingCount + partialCount + unknownCount,\n    blockingUncoveredCount: missingCount + partialCount + unknownCount,\n    missingItems: warningItems.filter(row =\u003e row.coverageStatus === \u0027missing\u0027),\n    partialItems: warningItems.filter(row =\u003e row.coverageStatus === \u0027partial\u0027),\n    unknownItems: warningItems.filter(row =\u003e row.coverageStatus === \u0027unknown\u0027),\n    warningItems,\n    gateStatus: warningItems.length ? \u0027warning\u0027 : \u0027passed\u0027\n  };\n}\n\nfunction coverageLabel(row) {\n  const normalized = normalizeCoverageRow(row);\n  return normalized.coverageId || normalized.moduleRequirement || normalized.key;\n}\n\n\nfunction rtmStatusRank(status) {\n  const value = String(status || \u0027\u0027).trim().toLowerCase();\n  if ([\u0027covered\u0027, \u0027passed\u0027, \u0027complete\u0027, \u0027included\u0027].includes(value)) return 3;\n  if ([\u0027partial\u0027, \u0027needs review\u0027, \u0027warning\u0027].includes(value)) return 2;\n  if ([\u0027missing\u0027, \u0027unknown\u0027, \u0027not covered\u0027, \u0027failed\u0027].includes(value)) return 1;\n  return 0;\n}\n\nfunction rtmShouldPreservePreviousCoverage(previousRow, currentRow) {\n  if (!previousRow || !currentRow || coverageRowIsExplicitlyRemoved(currentRow)) return false;\n  const previous = normalizeCoverageRow(previousRow);\n  const current = normalizeCoverageRow(currentRow);\n  const previousRank = rtmStatusRank(previous.coverageStatus);\n  const currentRank = rtmStatusRank(current.coverageStatus);\n  if (previousRank \u003c 3 || currentRank \u003e= previousRank) return false;\n  const currentText = [current.includedInOutput, current.notes, current.sourceReference].join(\u0027 \u0027).toLowerCase();\n  return currentRank \u003c= 1\n    \u0026\u0026 /\\b(no linkage|not linked|missing in current|no story|no backlog|current context|current evidence|not found)\\b/.test(currentText);\n}\n\nfunction buildRtmEffectiveCoverageLedger(documentType, generationMode, updateContext, coverageLedger) {\n  const currentLedger = Array.isArray(coverageLedger) ? coverageLedger : [];\n  const isSharedConfluenceDocument = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(documentType);\n  if ((documentType !== \u0027traceability_matrix\u0027 \u0026\u0026 !isSharedConfluenceDocument) || generationMode !== \u0027update\u0027) {\n    return {\n      applied: false,\n      coverageLedger: currentLedger,\n      addedRows: currentLedger.map(coverageLabel),\n      updatedRows: [],\n      preservedRows: [],\n      removedRows: []\n    };\n  }\n\n  const previousLedger = Array.isArray(updateContext?.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];\n  if (!previousLedger.length) {\n    return {\n      applied: false,\n      coverageLedger: currentLedger,\n      addedRows: currentLedger.map(coverageLabel),\n      updatedRows: [],\n      preservedRows: [],\n      removedRows: []\n    };\n  }\n\n  const hasExplicitRemoval = currentLedger.some(row =\u003e coverageRowIsExplicitlyRemoved(row));\n  const updateReasons = Array.isArray(updateContext?.updateReasons) ? updateContext.updateReasons : [];\n  if (isSharedConfluenceDocument \u0026\u0026 previousLedger.length \u003e currentLedger.length \u0026\u0026 !hasExplicitRemoval \u0026\u0026 !updateReasons.length) {\n    return {\n      applied: true,\n      coverageLedger: previousLedger,\n      addedRows: [],\n      updatedRows: [],\n      preservedRows: previousLedger.map(coverageLabel),\n      removedRows: []\n    };\n  }\n\n  const effectiveByKey = new Map();\n  const previousComparableByKey = new Map();\n  for (const row of previousLedger) {\n    const normalized = normalizeCoverageRow(row);\n    effectiveByKey.set(normalized.key, row);\n    previousComparableByKey.set(normalized.key, comparableCoverageRow(row));\n  }\n\n  const addedRows = [];\n  const updatedRows = [];\n  const removedRows = [];\n  const touchedKeys = new Set();\n\n  for (const row of currentLedger) {\n    const normalized = normalizeCoverageRow(row);\n    touchedKeys.add(normalized.key);\n    if (coverageRowIsExplicitlyRemoved(row)) {\n      if (effectiveByKey.has(normalized.key)) {\n        effectiveByKey.delete(normalized.key);\n        removedRows.push(coverageLabel(row));\n      }\n      continue;\n    }\n    if (!effectiveByKey.has(normalized.key)) {\n      addedRows.push(coverageLabel(row));\n      effectiveByKey.set(normalized.key, row);\n      continue;\n    }\n    const previousRow = effectiveByKey.get(normalized.key);\n    if (rtmShouldPreservePreviousCoverage(previousRow, row)) {\n      continue;\n    }\n    if (previousComparableByKey.get(normalized.key) !== comparableCoverageRow(row)) {\n      updatedRows.push(coverageLabel(row));\n      effectiveByKey.set(normalized.key, row);\n    }\n  }\n\n  const preservedRows = [];\n  for (const row of previousLedger) {\n    const normalized = normalizeCoverageRow(row);\n    if (!effectiveByKey.has(normalized.key)) continue;\n    if (!touchedKeys.has(normalized.key)) preservedRows.push(coverageLabel(row));\n    else if (!addedRows.includes(coverageLabel(row)) \u0026\u0026 !updatedRows.includes(coverageLabel(row)) \u0026\u0026 !removedRows.includes(coverageLabel(row))) preservedRows.push(coverageLabel(row));\n  }\n\n  return {\n    applied: true,\n    coverageLedger: Array.from(effectiveByKey.values()),\n    addedRows,\n    updatedRows,\n    preservedRows,\n    removedRows\n  };\n}\n\nfunction rtmCoverageLedgerMarkdown(rows) {\n  const values = Array.isArray(rows) ? rows : [];\n  if (!values.length) return \u0027\u0027;\n  const escapeCell = (value) =\u003e String(value || \u0027\u0027)\n    .replace(/\\|/g, \u0027 - \u0027)\n    .replace(/\\r?\\n/g, \u0027 \u0027)\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim() || \u0027Not provided\u0027;\n  const lines = [\n    \u0027### Coverage Ledger\u0027,\n    \u0027\u0027,\n    \u0027| Coverage ID | Module / Requirement | Source Reference | Included In Output | Coverage Status | Notes |\u0027,\n    \u0027|---|---|---|---|---|---|\u0027\n  ];\n  for (const row of values) {\n    const normalized = normalizeCoverageRow(row);\n    lines.push(\u0027| \u0027 + [\n      normalized.coverageId,\n      normalized.moduleRequirement,\n      normalized.sourceReference,\n      normalized.includedInOutput || \u0027Yes\u0027,\n      normalized.coverageStatus || \u0027unknown\u0027,\n      normalized.notes\n    ].map(escapeCell).join(\u0027 | \u0027) + \u0027 |\u0027);\n  }\n  return lines.join(\u0027\\n\u0027);\n}\n\nfunction replaceRtmCoverageLedgerMarkdown(text, rows) {\n  if (documentType !== \u0027traceability_matrix\u0027 || !Array.isArray(rows) || !rows.length) return text;\n  const replacement = rtmCoverageLedgerMarkdown(rows);\n  const lines = String(text || \u0027\u0027).split(/\\r?\\n/);\n  const start = lines.findIndex(line =\u003e /^\\s*#{0,6}\\s*(?:7\\.\\s*)?Coverage\\s+Ledger\\s*:?\\s*$/i.test(line.trim()));\n  if (start \u003c 0) return String(text || \u0027\u0027).trim() + \u0027\\n\\n\u0027 + replacement;\n  let end = start + 1;\n  while (end \u003c lines.length \u0026\u0026 !/^\\s*#{1,6}\\s+/.test(lines[end])) end += 1;\n  return [...lines.slice(0, start), replacement, ...lines.slice(end)].join(\u0027\\n\u0027);\n}\n\n\n\nfunction rtmStoryGapCoverageRows(context) {\n  if (documentType !== \u0027traceability_matrix\u0027) return [];\n  const missingStories = Array.isArray(context?.storiesWithoutTestCases) ? context.storiesWithoutTestCases : [];\n  return missingStories\n    .map((story) =\u003e {\n      const storyKey = String(story?.storyKey || \u0027\u0027).trim();\n      const summary = String(story?.storySummary || story?.summary || \u0027\u0027).trim();\n      if (!storyKey \u0026\u0026 !summary) return null;\n      return {\n        coverageId: storyKey ? \u0027STORY-GAP-\u0027 + storyKey : \u0027STORY-GAP\u0027,\n        moduleRequirement: [storyKey, summary].filter(Boolean).join(\u0027 - \u0027),\n        sourceReference: \u0027Current RTM traceability context - storiesWithoutTestCases\u0027,\n        includedInOutput: \u0027Needs review\u0027,\n        coverageStatus: \u0027missing\u0027,\n        notes: \u0027Story has no generated test case links in the current Story Test Case traceability context.\u0027\n      };\n    })\n    .filter(Boolean);\n}\n\nfunction mergeCoverageRowsByKey(rows) {\n  const merged = new Map();\n  for (const row of Array.isArray(rows) ? rows : []) {\n    const normalized = normalizeCoverageRow(row);\n    if (!normalized.key) continue;\n    merged.set(normalized.key, row);\n  }\n  return Array.from(merged.values());\n}\n\n\nfunction buildCoverageBatchSummary(documentType, coverageLedger, coverageSummary) {\n  const rows = (Array.isArray(coverageLedger) ? coverageLedger : []).map(normalizeCoverageRow);\n  const total = rows.length || Number(coverageSummary?.coverageLedgerCount) || 0;\n  const covered = Number(coverageSummary?.coveredCount) || rows.filter(row =\u003e row.coverageStatus === \u0027covered\u0027).length;\n  const partial = Number(coverageSummary?.partialCount) || rows.filter(row =\u003e row.coverageStatus === \u0027partial\u0027).length;\n  const missing = Number(coverageSummary?.missingCount) || rows.filter(row =\u003e row.coverageStatus === \u0027missing\u0027).length;\n  const unknown = Number(coverageSummary?.unknownCount) || rows.filter(row =\u003e row.coverageStatus === \u0027unknown\u0027).length;\n  const excluded = Number(coverageSummary?.excludedCount) || rows.filter(row =\u003e row.coverageStatus === \u0027excluded\u0027).length;\n  const review = partial + missing + unknown;\n  const complete = Math.max(0, covered + excluded);\n  const progressPercent = total ? Math.round((complete / total) * 100) : 0;\n  return {\n    version: \u0027coverage-batch-summary-v1\u0027,\n    documentType,\n    total,\n    covered,\n    partial,\n    missing,\n    unknown,\n    excluded,\n    review,\n    complete,\n    progressPercent,\n    gateStatus: coverageSummary?.gateStatus || coverageSummary?.status || \u0027not_reported\u0027,\n    reviewItems: rows\n      .filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus))\n      .slice(0, 10)\n      .map(row =\u003e ({\n        coverageId: row.coverageId,\n        moduleRequirement: row.moduleRequirement,\n        coverageStatus: row.coverageStatus,\n        notes: row.notes\n      }))\n  };\n}\n\nfunction buildSharedDocumentDeltaUpdateSummary(documentType, generationMode, updateContext, markdown, coverageLedger, coverageSummary, batchSummary, data) {\n  const sharedTypes = new Set([\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027]);\n  if (!sharedTypes.has(documentType) || generationMode !== \u0027update\u0027) return null;\n  const rawRows = parseDeltaUpdateSummaryRows(markdown);\n  const canonicalSections = sharedDocumentSections(documentType);\n  const updateReasons = Array.isArray(updateContext?.updateReasons) ? updateContext.updateReasons : [];\n  const rows = rawRows.map(row =\u003e {\n    const evidenceIssues = findDeltaEvidenceIssues(row.evidenceReference);\n    const hasBroadEvidence = evidenceIssues.some(issue =\u003e issue !== \u0027missing concrete chunkId\u0027);\n    const action = (hasBroadEvidence || (evidenceIssues.length \u0026\u0026 [\u0027updated\u0027, \u0027added\u0027, \u0027removed\u0027].includes(row.action))) ? \u0027needs_review\u0027 : row.action;\n    return {\n      ...row,\n      section: canonicalSharedSectionName(documentType, row.section),\n      action,\n      evidenceIssues,\n      reviewStatus: evidenceIssues.length ? \u0027Needs review\u0027 : (row.reviewStatus || \u0027Direct evidence\u0027)\n    };\n  });\n  let updatedSections = uniqueStrings(rows.filter(row =\u003e row.action === \u0027updated\u0027).map(row =\u003e row.section));\n  let addedSections = uniqueStrings(rows.filter(row =\u003e row.action === \u0027added\u0027).map(row =\u003e row.section));\n  let removedSections = uniqueStrings(rows.filter(row =\u003e row.action === \u0027removed\u0027).map(row =\u003e row.section));\n  let needsReviewSections = uniqueStrings(rows.filter(row =\u003e row.action === \u0027needs_review\u0027).map(row =\u003e row.section));\n  let preservedSections = uniqueStrings(rows.filter(row =\u003e [\u0027preserved\u0027, \u0027no_change\u0027].includes(row.action)).map(row =\u003e row.section));\n  if (!updatedSections.length \u0026\u0026 !addedSections.length \u0026\u0026 !removedSections.length \u0026\u0026 !needsReviewSections.length) {\n    updatedSections = inferSharedUpdatedSections(documentType, updateReasons, coverageSummary);\n  }\n  const changedKeys = new Set([...updatedSections, ...addedSections, ...removedSections, ...needsReviewSections].map(sectionKey));\n  preservedSections = preservedSections.filter(section =\u003e !changedKeys.has(sectionKey(section)));\n  if (!preservedSections.length) {\n    preservedSections = canonicalSections.filter(section =\u003e !changedKeys.has(sectionKey(section)));\n  }\n  const previousTokenUsage = updateContext?.previousTokenUsage || {};\n  const previousTokensTotal = Number(previousTokenUsage.total ?? previousTokenUsage.tokensTotal ?? updateContext?.previousTokensTotal ?? 0) || 0;\n  const currentTokensTotal = Number(data.tokensTotal) || ((Number(data.tokensInput) || 0) + (Number(data.tokensOutput) || 0));\n  const previousCostUsd = Number(previousTokenUsage.estimatedCostUsd ?? previousTokenUsage.estimated_cost_usd ?? 0) || 0;\n  const currentCostUsd = Number(data.estimatedCostUsd) || 0;\n  const estimatedTokensSaved = previousTokensTotal ? Math.max(0, previousTokensTotal - currentTokensTotal) : 0;\n  const estimatedCostSavedUsd = previousCostUsd ? Math.max(0, previousCostUsd - currentCostUsd) : 0;\n  const estimatedSavingsPercent = previousTokensTotal ? Math.round((estimatedTokensSaved / previousTokensTotal) * 100) : null;\n  const previousCoverageSummary = updateContext?.previousCoverageSummary || {};\n  const previousCoverageRows = Array.isArray(updateContext?.previousCoverageLedger) ? updateContext.previousCoverageLedger.length : Number(previousCoverageSummary.coverageLedgerCount || 0) || 0;\n  const previousCoverageStatus = String(previousCoverageSummary.gateStatus || previousCoverageSummary.status || \u0027\u0027).toLowerCase();\n  const previousCoverageNeedsRepair = previousCoverageRows === 0\n    || [\u0027warning\u0027, \u0027failed\u0027, \u0027not_reported\u0027].includes(previousCoverageStatus)\n    || (Number(previousCoverageSummary.missingCount) || 0) \u003e 0\n    || (Number(previousCoverageSummary.partialCount) || 0) \u003e 0\n    || (Number(previousCoverageSummary.unknownCount) || 0) \u003e 0;\n  if (previousCoverageNeedsRepair \u0026\u0026 !updatedSections.some(section =\u003e sectionKey(section) === sectionKey(\u0027Coverage Ledger\u0027))) {\n    const coverageSection = documentType === \u0027risk_matrix\u0027 ? \u0027Coverage Ledger\u0027 : \u0027Appendix / Coverage Ledger\u0027;\n    if ((Array.isArray(coverageLedger) ? coverageLedger.length : 0) \u003e 0) updatedSections.push(coverageSection);\n    else needsReviewSections.push(coverageSection);\n  }\n  if (previousCoverageNeedsRepair) {\n    const coverageRepairKeys = new Set([...updatedSections, ...addedSections, ...removedSections, ...needsReviewSections].map(sectionKey));\n    preservedSections = preservedSections.filter(section =\u003e !coverageRepairKeys.has(sectionKey(section)));\n  }\n  const noChangesDetected = updateReasons.length === 0\n    \u0026\u0026 updatedSections.length === 0\n    \u0026\u0026 addedSections.length === 0\n    \u0026\u0026 removedSections.length === 0\n    \u0026\u0026 needsReviewSections.length === 0\n    \u0026\u0026 !previousCoverageNeedsRepair;\n  const evidenceQualityIssues = rows\n    .filter(row =\u003e row.evidenceIssues?.length)\n    .map(row =\u003e ({\n      section: row.section,\n      evidenceReference: row.evidenceReference,\n      issues: row.evidenceIssues\n    }));\n\n  return {\n    enabled: true,\n    deltaMode: true,\n    deltaPatchMode: true,\n    mergedWithExistingConfluence: true,\n    version: \u0027shared-delta-update-v10\u0027,\n    documentType,\n    mode: generationMode,\n    sourceOfTruth: updateContext?.updateSourceOfTruth || \u0027current_retrieval_and_previous_confluence_page\u0027,\n    updateOfJobId: updateContext?.previousJobId || null,\n    previousConfluencePageId: updateContext?.previousConfluencePageId || null,\n    updateReasons,\n    noChangesDetected,\n    changedEvidenceCount: rows.filter(row =\u003e [\u0027updated\u0027, \u0027added\u0027, \u0027removed\u0027, \u0027needs_review\u0027].includes(row.action)).length,\n    needsReviewSections,\n    updatedSections,\n    addedSections,\n    removedSections,\n    preservedSections: noChangesDetected ? canonicalSections : preservedSections,\n    updatedSectionCount: updatedSections.length,\n    addedSectionCount: addedSections.length,\n    removedSectionCount: removedSections.length,\n    needsReviewSectionCount: needsReviewSections.length,\n    preservedSectionCount: (noChangesDetected ? canonicalSections : preservedSections).length,\n    deltaRows: rows,\n    evidenceQualityIssues,\n    coverageSummary,\n    coverageLedgerCount: Array.isArray(coverageLedger) ? coverageLedger.length : 0,\n    batchSummary,\n    tokenUsage: {\n      source: data.tokenUsage?.source || \u0027estimated\u0027,\n      input: Number(data.tokensInput) || 0,\n      output: Number(data.tokensOutput) || 0,\n      total: currentTokensTotal,\n      estimatedCostUsd: currentCostUsd\n    },\n    previousTokenUsage,\n    tokenSavings: {\n      estimatedBaselineTokens: previousTokensTotal || null,\n      estimatedTokensSaved,\n      estimatedBaselineCostUsd: previousCostUsd || null,\n      estimatedCostSavedUsd,\n      estimatedSavingsPercent\n    },\n    message: noChangesDetected\n      ? \u0027No source-context changes were detected for this shared document update.\u0027\n      : previousCoverageNeedsRepair\n        ? \u0027Shared document update refreshed coverage-related sections because previous coverage needed repair or review.\u0027\n        : \u0027Shared document update generated a compact patch and preserved unchanged sections.\u0027\n  };\n}\n\n\nfunction normalizeRtmChangeBuckets(addedRows, updatedRows, preservedRows, removedRows) {\n  const unique = (values) =\u003e {\n    const seen = new Set();\n    return (Array.isArray(values) ? values : [])\n      .map((value) =\u003e String(value || \u0027\u0027).trim())\n      .filter(Boolean)\n      .filter((value) =\u003e {\n        const key = value.toLowerCase();\n        if (seen.has(key)) return false;\n        seen.add(key);\n        return true;\n      });\n  };\n  const added = unique(addedRows);\n  const removed = unique(removedRows);\n  const addedKeys = new Set(added.map((value) =\u003e value.toLowerCase()));\n  const removedKeys = new Set(removed.map((value) =\u003e value.toLowerCase()));\n  const updated = unique(updatedRows)\n    .filter((value) =\u003e !addedKeys.has(value.toLowerCase()) \u0026\u0026 !removedKeys.has(value.toLowerCase()));\n  const changedKeys = new Set([\n    ...added,\n    ...updated,\n    ...removed\n  ].map((value) =\u003e value.toLowerCase()));\n  const preserved = unique(preservedRows)\n    .filter((value) =\u003e !changedKeys.has(value.toLowerCase()));\n  return { addedRows: added, updatedRows: updated, preservedRows: preserved, removedRows: removed };\n}\n\nfunction buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, batchSummary, mergeInfo = null) {\n  if (documentType !== \u0027traceability_matrix\u0027) return null;\n  const currentRows = (Array.isArray(coverageLedger) ? coverageLedger : []).map(normalizeCoverageRow);\n  const previousRows = (Array.isArray(updateContext?.previousCoverageLedger) ? updateContext.previousCoverageLedger : []).map(normalizeCoverageRow);\n  let {\n    addedRows,\n    updatedRows,\n    preservedRows,\n    removedRows\n  } = normalizeRtmChangeBuckets(\n    Array.isArray(mergeInfo?.addedRows) ? mergeInfo.addedRows : [],\n    Array.isArray(mergeInfo?.updatedRows) ? mergeInfo.updatedRows : [],\n    Array.isArray(mergeInfo?.preservedRows) ? mergeInfo.preservedRows : [],\n    Array.isArray(mergeInfo?.removedRows) ? mergeInfo.removedRows : []\n  );\n  let createdCoverageRows = addedRows.length;\n  let updatedCoverageRows = updatedRows.length;\n  let reusedCoverageRows = preservedRows.length;\n  let removedCoverageRows = removedRows.length;\n\n  if (!mergeInfo?.applied) {\n    const previousByKey = new Map(previousRows.map(row =\u003e [row.key, row]));\n    const currentByKey = new Map(currentRows.map(row =\u003e [row.key, row]));\n    createdCoverageRows = 0;\n    updatedCoverageRows = 0;\n    reusedCoverageRows = 0;\n    for (const row of currentRows) {\n      const previous = previousByKey.get(row.key);\n      if (!previous) {\n        createdCoverageRows += 1;\n        continue;\n      }\n      const currentComparable = JSON.stringify({\n        status: row.coverageStatus,\n        included: row.includedInOutput,\n        notes: row.notes\n      });\n      const previousComparable = JSON.stringify({\n        status: previous.coverageStatus,\n        included: previous.includedInOutput,\n        notes: previous.notes\n      });\n      if (currentComparable === previousComparable) reusedCoverageRows += 1;\n      else updatedCoverageRows += 1;\n    }\n    removedCoverageRows = previousRows.filter(row =\u003e !currentByKey.has(row.key) \u0026\u0026 coverageRowIsExplicitlyRemoved(row)).length;\n    ({ addedRows, updatedRows, preservedRows, removedRows } = normalizeRtmChangeBuckets(addedRows, updatedRows, preservedRows, removedRows));\n    createdCoverageRows = addedRows.length;\n    updatedCoverageRows = updatedRows.length;\n    reusedCoverageRows = preservedRows.length;\n    removedCoverageRows = removedRows.length;\n  }\n\n  const missingCoverageRows = Number(coverageSummary.missingCount) || 0;\n  const partialCoverageRows = Number(coverageSummary.partialCount) || 0;\n  const reviewCoverageRows = missingCoverageRows + partialCoverageRows + (Number(coverageSummary.unknownCount) || 0);\n  const noChangesDetected = generationMode === \u0027update\u0027\n    \u0026\u0026 previousRows.length \u003e 0\n    \u0026\u0026 createdCoverageRows === 0\n    \u0026\u0026 updatedCoverageRows === 0\n    \u0026\u0026 removedCoverageRows === 0;\n\n  return {\n    enabled: true,\n    version: \u0027rtm-update-summary-v2\u0027,\n    documentType,\n    mode: generationMode || \u0027create\u0027,\n    sourceOfTruth: updateContext?.updateSourceOfTruth || \u0027jira_confluence_live\u0027,\n    updateOfJobId: updateContext?.previousJobId || null,\n    previousConfluencePageId: updateContext?.previousConfluencePageId || null,\n    previousCoverageRows: previousRows.length,\n    currentCoverageRows: currentRows.length,\n    createdCoverageRows,\n    updatedCoverageRows,\n    reusedCoverageRows,\n    removedCoverageRows,\n    addedRows,\n    updatedRows,\n    preservedRows,\n    removedRows,\n    missingCoverageRows,\n    partialCoverageRows,\n    reviewCoverageRows,\n    noChangesDetected,\n    message: generationMode === \u0027update\u0027\n      ? noChangesDetected\n        ? \u0027No traceability changes were detected in the current source context.\u0027\n        : \u0027RTM update merged previous traceability baseline with current Backlog and Story Test Case updates.\u0027\n      : \u0027RTM was created from the current backlog and story test case traceability context.\u0027,\n    batchSummary\n  };\n}\n\n\nfunction evaluateSharedCoveragePlanning(documentType, coverageLedger, coverageSummary) {\n  if (!sharedCoveragePlanningTypes.has(documentType)) return null;\n\n  const summary = coverageSummary || {};\n  const ledgerCount = coverageLedger.length;\n  const partialCount = Number(summary.partialCount) || 0;\n  const missingCount = Number(summary.missingCount) || 0;\n  const unknownCount = Number(summary.unknownCount) || 0;\n  const warningCount = partialCount + missingCount + unknownCount;\n  const profile = $(\u0027Prompt Library\u0027).item.json.coveragePlanningRequirement?.profile || {};\n\n  if (!ledgerCount) {\n    summary.gateStatus = \u0027warning\u0027;\n    return {\n      enabled: true,\n      version: \u0027coverage-planning-v1\u0027,\n      documentType,\n      status: \u0027warning\u0027,\n      reason: \u0027missing_coverage_ledger\u0027,\n      ledgerCount,\n      warningCount: 1,\n      message: \u0027Coverage Ledger was not reported. Review the document for missed source modules or regenerate if audit coverage is required.\u0027,\n      profileLabel: profile.label || documentType\n    };\n  }\n\n  const status = warningCount \u003e 0 ? \u0027warning\u0027 : \u0027passed\u0027;\n  summary.gateStatus = status === \u0027warning\u0027 ? \u0027warning\u0027 : summary.gateStatus;\n  return {\n    enabled: true,\n    version: \u0027coverage-planning-v1\u0027,\n    documentType,\n    status,\n    reason: status === \u0027warning\u0027 ? \u0027coverage_gaps_reported\u0027 : \u0027coverage_ledger_clean\u0027,\n    ledgerCount,\n    warningCount,\n    partialCount,\n    missingCount,\n    unknownCount,\n    message: status === \u0027warning\u0027\n      ? \u0027Coverage Ledger reported partial, missing, or unrecognized items. Generation can proceed, but review is recommended.\u0027\n      : \u0027Coverage Ledger reported all included source items as covered or intentionally excluded.\u0027,\n    profileLabel: profile.label || documentType\n  };\n}\n\nfunction uniqueSectionList(values) {\n  const seen = new Set();\n  return (Array.isArray(values) ? values : [])\n    .map(value =\u003e String(value || \u0027\u0027).trim())\n    .filter(Boolean)\n    .filter(value =\u003e {\n      const key = sectionKey(value);\n      if (seen.has(key)) return false;\n      seen.add(key);\n      return true;\n    });\n}\n\nfunction normalizeUpdateSummary(summary) {\n  if (!summary || typeof summary !== \u0027object\u0027) return summary;\n  const normalized = { ...summary, version: String(summary.version || \u0027\u0027).replace(/v8$/i, \u0027v9\u0027) || \u0027shared-delta-update-v10\u0027 };\n  normalized.updatedSections = uniqueSectionList(normalized.updatedSections);\n  normalized.addedSections = uniqueSectionList(normalized.addedSections);\n  normalized.removedSections = uniqueSectionList(normalized.removedSections);\n  normalized.needsReviewSections = uniqueSectionList(normalized.needsReviewSections);\n  const changedKeys = new Set([\n    ...normalized.updatedSections,\n    ...normalized.addedSections,\n    ...normalized.removedSections,\n    ...normalized.needsReviewSections\n  ].map(sectionKey));\n  normalized.preservedSections = uniqueSectionList(normalized.preservedSections)\n    .filter(section =\u003e !changedKeys.has(sectionKey(section)));\n  normalized.updatedSectionCount = normalized.updatedSections.length;\n  normalized.addedSectionCount = normalized.addedSections.length;\n  normalized.removedSectionCount = normalized.removedSections.length;\n  normalized.needsReviewSectionCount = normalized.needsReviewSections.length;\n  normalized.preservedSectionCount = normalized.preservedSections.length;\n  const tokenUsage = normalized.tokenUsage || {};\n  const total = Number(tokenUsage.total || normalized.tokensTotal || 0) || 0;\n  const baseline = Number(normalized.tokenSavings?.estimatedBaselineTokens || normalized.previousTokenUsage?.total || 0) || 0;\n  normalized.operationMode = normalized.operationMode || (normalized.deltaPatchMode ? \u0027update_delta\u0027 : \u0027update_repair\u0027);\n  return normalized;\n}\n\nfunction enrichRtmUpdateSummaryWithTokenSavings(summary, data, updateContext) {\n  if (!summary || summary.documentType !== \u0027traceability_matrix\u0027) return summary;\n  const previousTokenUsage = updateContext?.previousTokenUsage || {};\n  const previousTokensTotal = Number(previousTokenUsage.total ?? previousTokenUsage.tokensTotal ?? updateContext?.previousTokensTotal ?? 0) || 0;\n  const currentTokensTotal = Number(data.tokensTotal) || ((Number(data.tokensInput) || 0) + (Number(data.tokensOutput) || 0));\n  const previousCostUsd = Number(previousTokenUsage.estimatedCostUsd ?? previousTokenUsage.estimated_cost_usd ?? 0) || 0;\n  const currentCostUsd = Number(data.estimatedCostUsd) || 0;\n  const estimatedTokensSaved = previousTokensTotal ? Math.max(0, previousTokensTotal - currentTokensTotal) : 0;\n  const estimatedCostSavedUsd = previousCostUsd ? Math.max(0, previousCostUsd - currentCostUsd) : 0;\n  const estimatedSavingsPercent = previousTokensTotal ? Math.round((estimatedTokensSaved / previousTokensTotal) * 100) : null;\n  return {\n    ...summary,\n    deltaMode: summary.mode === \u0027update\u0027,\n    tokenUsage: {\n      source: data.tokenUsage?.source || \u0027estimated\u0027,\n      input: Number(data.tokensInput) || 0,\n      output: Number(data.tokensOutput) || 0,\n      total: currentTokensTotal,\n      estimatedCostUsd: currentCostUsd\n    },\n    previousTokenUsage,\n    tokenSavings: {\n      estimatedBaselineTokens: previousTokensTotal || null,\n      estimatedTokensSaved,\n      estimatedBaselineCostUsd: previousCostUsd || null,\n      estimatedCostSavedUsd,\n      estimatedSavingsPercent\n    }\n  };\n}\n\nconst rtmCoverageMerge = buildRtmEffectiveCoverageLedger(documentType, generationMode, updateContext, coverageLedger);\nconst traceabilityContextForGate = $(\u0027Prompt Library\u0027).item.json.traceabilityContext || data.traceabilityContext || {};\nlet effectiveCoverageLedger = mergeCoverageRowsByKey([\n  ...(rtmCoverageMerge.coverageLedger || []),\n  ...rtmStoryGapCoverageRows(traceabilityContextForGate)\n]);\nif (rtmCoverageMerge.applied || rtmStoryGapCoverageRows(traceabilityContextForGate).length) {\n  Object.assign(coverageSummary, summarizeCoverageRows(effectiveCoverageLedger, coverageSummary));\n  rawMarkdown = replaceRtmCoverageLedgerMarkdown(rawMarkdown, effectiveCoverageLedger);\n  rawMarkdown = dedupeRtmLayer2Sections(rawMarkdown);\n  rawMarkdown = stripUnsupportedRtmRiskFields(rawMarkdown);\n  wordCount = rawMarkdown.trim() ? rawMarkdown.trim().split(/\\s+/).length : 0;\n}\nconst sharedCoveragePlanning = evaluateSharedCoveragePlanning(documentType, effectiveCoverageLedger, coverageSummary);\nlet coverageBatchSummary = buildCoverageBatchSummary(documentType, effectiveCoverageLedger, coverageSummary);\nconst rtmUpdateSummary = buildRtmUpdateSummary(documentType, generationMode, updateContext, effectiveCoverageLedger, coverageSummary, coverageBatchSummary, rtmCoverageMerge);\nconst sharedDeltaUpdateSummary = buildSharedDocumentDeltaUpdateSummary(documentType, generationMode, updateContext, rawMarkdown, effectiveCoverageLedger, coverageSummary, coverageBatchSummary, data);\nconst updateSummary = normalizeUpdateSummary(sharedDeltaUpdateSummary || enrichRtmUpdateSummaryWithTokenSavings(rtmUpdateSummary, data, updateContext));\n\nif (documentType === \u0027traceability_matrix\u0027) {\n  validateRtmOutputContract(rawMarkdown, coverageSummary);\n\n  if (!effectiveCoverageLedger.length) {\n    throw new Error(\n      \u0027Coverage Gate Failed - Traceability Matrix is missing Coverage Ledger. \u0027 +\n      \u0027Regenerate with the exact Coverage Ledger table so requirement coverage can be audited.\u0027\n    );\n  }\n\n  const blockingUncoveredCount = Number(coverageSummary.blockingUncoveredCount) || ((Number(coverageSummary.missingCount) || 0) + (Number(coverageSummary.unknownCount) || 0));\n  if (blockingUncoveredCount \u003e 0) {\n    coverageSummary.gateStatus = \u0027warning\u0027;\n    coverageSummary.blockingUncoveredCount = 0;\n    coverageSummary.uncoveredCount = Number(coverageSummary.missingCount || 0)\n      + Number(coverageSummary.partialCount || 0)\n      + Number(coverageSummary.unknownCount || 0);\n    coverageSummary.warningReason = \u0027RTM has traceability gaps that need review, but the document is publishable as amber coverage.\u0027;\n    coverageBatchSummary = buildCoverageBatchSummary(documentType, effectiveCoverageLedger, coverageSummary);\n  }\n}\n\nconsole.log(`Quality Gate Passed - ${documentType} | Words: ${wordCount} | Coverage: ${coverageSummary.gateStatus} | Project: ${projectName}`);\n\nreturn [\n  {\n    json: {\n      rawMarkdown,\n      wordCount: data.wordCount,\n      charCount: rawMarkdown.length,\n      jobId,\n      generationMode,\n      updateContext,\n      updateSummary,\n      batchSummary: coverageBatchSummary,\n      progress: {\n        coverageSummary,\n        batchSummary: coverageBatchSummary,\n        updateSummary\n      },\n      tokensInput: Number(data.tokensInput) || 0,\n      tokensOutput: Number(data.tokensOutput) || 0,\n      tokensTotal: Number(data.tokensTotal) || ((Number(data.tokensInput) || 0) + (Number(data.tokensOutput) || 0)),\n      estimatedCostUsd: Number(data.estimatedCostUsd) || 0,\n      tokenUsage: data.tokenUsage || {\n        source: \u0027estimated\u0027,\n        input: Number(data.tokensInput) || 0,\n        output: Number(data.tokensOutput) || 0,\n        total: Number(data.tokensTotal) || ((Number(data.tokensInput) || 0) + (Number(data.tokensOutput) || 0)),\n        estimatedCostUsd: Number(data.estimatedCostUsd) || 0,\n      },\n      coverageLedger: effectiveCoverageLedger,\n      coverageSummary,\n      qualityGate: {\n        passed: true,\n        documentType,\n        wordCount,\n        minWordCount: minWords,\n        checkedSections: requiredSections,\n        missingSections: [],\n        traceabilityFound: true,\n        coverageGate: coverageSummary.gateStatus,\n        coveragePlanning: sharedCoveragePlanning,\n        updateSummary,\n        batchSummary: coverageBatchSummary,\n        coverageLedgerCount: Number(coverageSummary.coverageLedgerCount) || effectiveCoverageLedger.length || 0,\n        uncoveredCoverageCount: Number(coverageSummary.uncoveredCount) || 0,\n        blockingUncoveredCoverageCount: Number(coverageSummary.blockingUncoveredCount) || 0,\n        missingCoverageItems: coverageSummary.warningItems || coverageSummary.missingItems || []\n      }\n    }\n  }\n];"
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
    "jsCode":  "const raw = $json.rawMarkdown;\n\n// ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Carry forward quality gate metadata from upstream\nconst wordCount = $json.wordCount || 0;\nconst charCount = $json.charCount || 0;\nconst qualityGate = $json.qualityGate || null;\n\ntry {\n  // Step 1: Clean invalid trailing delimiters or junk\n  let cleaned = raw\n    .replace(/--- USER_STORY_BREAK ---/g, \u0027\u0027)\n    .trim();\n\n  // Step 2: Extract ONLY valid JSON (safe guard)\n  const firstBrace = cleaned.indexOf(\u0027{\u0027);\n  const lastBrace = cleaned.lastIndexOf(\u0027}\u0027);\n\n  if (firstBrace !== -1 \u0026\u0026 lastBrace !== -1) {\n    cleaned = cleaned.substring(firstBrace, lastBrace + 1);\n  }\n\n  // Step 3: Parse JSON\n  const parsed = JSON.parse(cleaned);\n\n  return [{\n    json: {\n      rawMarkdown: raw,\n      cleanedJson: cleaned,\n      structuredData: parsed,\n      parsingError: false,\n      // ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ NEW: carry forward quality metadata\n      wordCount,\n      charCount,\n      qualityGate\n    }\n  }];\n\n} catch (err) {\n  return [{\n    json: {\n      rawMarkdown: raw,\n      structuredData: null,\n      parsingError: true,\n      errorMessage: err.message,\n      // ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ NEW: carry forward even on parse error\n      wordCount,\n      charCount,\n      qualityGate\n    }\n  }];\n}"
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
                                            },
                                            {
                                                "id":  "76acd5c5-92fe-4adc-b4fb-f0feacdbf62f",
                                                "name":  "projectId",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.projectId || $(\u0027When Executed by Another Workflow\u0027).item.json.project_id || null }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "80b60057-fdff-4645-9abe-17b1468baf9e",
                                                "name":  "requestedBy",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.requestedBy || $(\u0027When Executed by Another Workflow\u0027).item.json.requested_by || null }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "3eb2bf95-5ce8-49b7-9719-3d36a49869e7",
                                                "name":  "settingsVersion",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.settingsVersion || $(\u0027When Executed by Another Workflow\u0027).item.json.settings_version || null }}",
                                                "type":  "number"
                                            },
                                            {
                                                "id":  "e98d1cc9-6db3-4243-818b-862e59c09d2e",
                                                "name":  "configSnapshot",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.configSnapshot || $(\u0027When Executed by Another Workflow\u0027).item.json.config_snapshot || {} }}",
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "480a4fc9-78b1-4645-9de4-ce4e46dd9f69",
                                                "name":  "environmentKey",
                                                "value":  "={{ ($(\u0027When Executed by Another Workflow\u0027).item.json.configSnapshot || $(\u0027When Executed by Another Workflow\u0027).item.json.config_snapshot || {}).environment?.key || $(\u0027When Executed by Another Workflow\u0027).item.json.environment || \u0027local\u0027 }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "rtm-traceability-context-assignment",
                                                "name":  "traceabilityContext",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.traceabilityContext || $(\u0027When Executed by Another Workflow\u0027).item.json.input?.traceabilityContext || {} }}",
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "rtm-traceability-mode-assignment",
                                                "name":  "traceabilityMode",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.traceabilityMode || $(\u0027When Executed by Another Workflow\u0027).item.json.input?.traceabilityMode || \u0027\u0027 }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "rtm-freshness-assignment",
                                                "name":  "rtmFreshness",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.rtmFreshness || $(\u0027When Executed by Another Workflow\u0027).item.json.input?.traceabilityContext?.freshness || {} }}",
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "rtm-generation-mode-assignment",
                                                "name":  "generationMode",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.generationMode || $(\u0027When Executed by Another Workflow\u0027).item.json.input?.generationMode || \u0027create\u0027 }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "rtm-update-context-assignment",
                                                "name":  "updateContext",
                                                "value":  "={{ $(\u0027When Executed by Another Workflow\u0027).item.json.updateContext || $(\u0027When Executed by Another Workflow\u0027).item.json.input?.updateContext || {} }}",
                                                "type":  "object"
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
                                                "value":  "={{ Number($(\u0027Quality Gate\u0027).item.json.wordCount) || 0 }}",
                                                "type":  "number"
                                            },
                                            {
                                                "id":  "1c88f04e-6a41-47fb-9c63-c86f05e1125e",
                                                "name":  "charCount",
                                                "value":  "={{ Number($(\u0027Quality Gate\u0027).item.json.charCount) || 0 }}",
                                                "type":  "number"
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
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "e2825570-ca1b-4f11-a965-fffad1b911d8",
                                                "name":  "tokensInput",
                                                "value":  "={{ Number($(\u0027Quality Gate\u0027).item.json.tokensInput) || 0 }}",
                                                "type":  "number"
                                            },
                                            {
                                                "id":  "380fc2f1-930c-4406-8a48-cb8c25b0c61b",
                                                "name":  "tokensOutput",
                                                "value":  "={{ Number($(\u0027Quality Gate\u0027).item.json.tokensOutput) || 0 }}",
                                                "type":  "number"
                                            },
                                            {
                                                "id":  "fcfc24f6-dd5b-4f4d-a01e-1670005efebd",
                                                "name":  "tokensTotal",
                                                "value":  "={{ Number($(\u0027Quality Gate\u0027).item.json.tokensTotal) || 0 }}",
                                                "type":  "number"
                                            },
                                            {
                                                "id":  "99dbc8e5-4bdf-4c4d-9301-487537534fdc",
                                                "name":  "estimatedCostUsd",
                                                "value":  "={{ Number($(\u0027Quality Gate\u0027).item.json.estimatedCostUsd) || 0 }}",
                                                "type":  "number"
                                            },
                                            {
                                                "id":  "generation-token-usage-output",
                                                "name":  "tokenUsage",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.tokenUsage }}",
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "coverage-summary-output",
                                                "name":  "coverageSummary",
                                                "value":  "={{ (($(\u0027Quality Gate\u0027).item.json.coverageLedger || []).length ? $(\u0027Quality Gate\u0027).item.json.coverageSummary : (($(\u0027Quality Gate\u0027).item.json.updateSummary?.noChangesDetected \u0026\u0026 ($(\u0027Quality Gate\u0027).item.json.updateContext?.previousCoverageLedger || []).length) ? { ...($(\u0027Quality Gate\u0027).item.json.updateContext.previousCoverageSummary || {}), version: ($(\u0027Quality Gate\u0027).item.json.updateContext.previousCoverageSummary?.version || \u0027coverage-ledger-v1\u0027), carriedForwardFromPreviousUpdate: true, coverageLedgerCount: ($(\u0027Quality Gate\u0027).item.json.updateContext.previousCoverageLedger || []).length } : $(\u0027Quality Gate\u0027).item.json.coverageSummary)) }}",
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "coverage-ledger-output",
                                                "name":  "coverageLedger",
                                                "value":  "={{ (($(\u0027Quality Gate\u0027).item.json.coverageLedger || []).length ? $(\u0027Quality Gate\u0027).item.json.coverageLedger : (($(\u0027Quality Gate\u0027).item.json.updateSummary?.noChangesDetected \u0026\u0026 ($(\u0027Quality Gate\u0027).item.json.updateContext?.previousCoverageLedger || []).length) ? $(\u0027Quality Gate\u0027).item.json.updateContext.previousCoverageLedger : [])) }}",
                                                "type":  "array"
                                            },
                                            {
                                                "id":  "rtm-update-summary-output",
                                                "name":  "updateSummary",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.updateSummary }}",
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "rtm-batch-summary-output",
                                                "name":  "batchSummary",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.batchSummary }}",
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "rtm-progress-output",
                                                "name":  "progress",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.progress }}",
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "rtm-generation-mode-output",
                                                "name":  "generationMode",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.generationMode }}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "rtm-update-context-output",
                                                "name":  "updateContext",
                                                "value":  "={{ $(\u0027Quality Gate\u0027).item.json.updateContext }}",
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "shared-v9-finalValidation",
                                                "name":  "finalValidation",
                                                "value":  "={{ { version: \u0027shared-final-validation-v10\u0027, status: \u0027pending_publish\u0027, structuralStatus: \u0027pending\u0027, reason: \u0027Final HTML validation runs after markdown-to-html conversion.\u0027 } }}",
                                                "type":  "object"
                                            },
                                            {
                                                "id":  "shared-v9-diagnostics",
                                                "name":  "diagnostics",
                                                "value":  "={{ { validatorVersion: \u0027shared-final-validation-v10\u0027, stage: \u0027quality_gate_restored\u0027 } }}",
                                                "type":  "object"
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
    "url":  "={{ String((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).jiraBaseUrl || \u0027https://anujalhans1.atlassian.net\u0027).replace(/\\/$/, \u0027\u0027) + \u0027/rest/api/3/search/jql\u0027 }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "jql",
                                                   "value":  "={{ \u0027project = \u0027 + ((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).jiraProjectKey || \u0027KAN\u0027) + \u0027 AND issuetype = Epic AND summary ~ \"\u0027 + $json.epicName + \u0027\"\u0027 }}"
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
    "url":  "={{ String((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).jiraBaseUrl || \u0027https://anujalhans1.atlassian.net\u0027).replace(/\\/$/, \u0027\u0027) + \u0027/rest/api/3/search/jql\u0027 }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "jql",
                                                   "value":  "={{ \u0027project = \u0027 + ((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).jiraProjectKey || \u0027KAN\u0027) + \u0027 AND issuetype = Epic AND (\u0027 + $json.structuredData.epics.map(e =\u003e `summary ~ \"${e.epicName.replace(/\"/g, \u0027\\\\\"\u0027)}\"`).join(\u0027 OR \u0027) + \u0027)\u0027 }}"
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
    "url":  "={{ String((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).jiraBaseUrl || \u0027https://anujalhans1.atlassian.net\u0027).replace(/\\/$/, \u0027\u0027) + \u0027/rest/api/3/search/jql\u0027 }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "jql",
                                                   "value":  "={{ \u0027project = \u0027 + ((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).jiraProjectKey || \u0027KAN\u0027) + \u0027 AND issuetype = Story AND labels IN (\"\u0027 + $json.idempotencyKey + \u0027\")\u0027 }}"
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
| Always Output Data | True |
| Retry On Fail | True |
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
    "url":  "={{ String((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).confluenceBaseUrl || \u0027https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, \u0027\u0027) + \u0027/rest/api/content/\u0027 + $json.pageId }}",
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
                                                  "value":  "={{ (() =\u003e {\n  const prompt = $(\u0027Prompt Library\u0027).item.json || {};\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const type = String(prompt.documentType || q.documentType || \u0027\u0027).toLowerCase();\n  const updateSummary = q.updateSummary || q.qualityGate?.updateSummary || {};\n  const sharedTypes = [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027];\n  const isSharedUpdate = sharedTypes.includes(type)\n    \u0026\u0026 String(prompt.generationMode || q.generationMode || updateSummary.mode || \u0027\u0027).toLowerCase() === \u0027update\u0027\n    \u0026\u0026 (updateSummary.deltaPatchMode || updateSummary.deltaMode);\n  const rawPatch = String($json.html || \u0027\u0027);\n  const existingRaw = String($json.body?.storage?.value || \u0027\u0027);\n\n  const escapeHtml = (value) =\u003e String(value === undefined || value === null ? \u0027\u0027 : value)\n    .replace(/\u0026/g, \u0027\u0026amp;\u0027)\n    .replace(/\u003c/g, \u0027\u0026lt;\u0027)\n    .replace(/\u003e/g, \u0027\u0026gt;\u0027)\n    .replace(/\"/g, \u0027\u0026quot;\u0027)\n    .replace(/\u0027/g, \u0027\u0026#39;\u0027);\n\n  const stripTags = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)\n    .replace(/\u0026nbsp;/gi, \u0027 \u0027)\n    .replace(/\u0026amp;/gi, \u0027\u0026\u0027)\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  function convertLooseHtmlLists(html) {\n  const normalized = String(html || \u0027\u0027)\n    .replace(/\u003c(p|div)[^\u003e]*\u003e\\s*((?:[-*]|\\d+[.)])\\s+[\\s\\S]*?)\u003c\\/\\1\u003e/gi, \u0027\\n$2\\n\u0027)\n    .replace(/\u003cbr\\s*\\/?\u003e/gi, \u0027\\n\u0027);\n  const lines = normalized.split(/\\n/);\n  const output = [];\n  let listType = null;\n\n  const closeList = () =\u003e {\n    if (listType) {\n      output.push(\u0027\u003c/\u0027 + listType + \u0027\u003e\u0027);\n      listType = null;\n    }\n  };\n\n  const appendToPreviousItem = (text) =\u003e {\n    const lastIndex = output.length - 1;\n    if (lastIndex \u003e= 0 \u0026\u0026 /^\u003cli\u003e[\\s\\S]*\u003c\\/li\u003e$/.test(output[lastIndex])) {\n      output[lastIndex] = output[lastIndex].replace(/\u003c\\/li\u003e$/, \u0027 \u0027 + text.trim() + \u0027\u003c/li\u003e\u0027);\n      return true;\n    }\n    return false;\n  };\n\n  for (const rawLine of lines) {\n    const line = String(rawLine || \u0027\u0027);\n    const trimmed = line.trim();\n    const unordered = line.match(/^\\s*[-*]\\s+(.+)$/);\n    const ordered = line.match(/^\\s*\\d+[.)]\\s+(.+)$/);\n\n    if (unordered || ordered) {\n      const nextType = ordered ? \u0027ol\u0027 : \u0027ul\u0027;\n      if (listType !== nextType) {\n        closeList();\n        output.push(\u0027\u003c\u0027 + nextType + \u0027\u003e\u0027);\n        listType = nextType;\n      }\n      output.push(\u0027\u003cli\u003e\u0027 + (unordered ? unordered[1] : ordered[1]).trim() + \u0027\u003c/li\u003e\u0027);\n      continue;\n    }\n\n    if (listType \u0026\u0026 trimmed \u0026\u0026 !/^\u003c\\/?(?:h[1-6]|table|tbody|tr|td|th|ul|ol|li)\\b/i.test(trimmed)) {\n      if (appendToPreviousItem(trimmed)) continue;\n    }\n\n    closeList();\n    if (output.length \u0026\u0026 trimmed) output.push(\u0027\u003cbr/\u003e\u0027);\n    output.push(line);\n  }\n\n  closeList();\n  return output.join(\u0027\u0027);\n}\n\n  const sanitizeUserFacingHtml = (html) =\u003e convertLooseHtmlLists(String(html || \u0027\u0027)\n    .replace(/Existing Confluence content below was preserved unless explicitly updated in the delta summary\\.?/gi, \u0027\u0027)\n    .replace(/Evidence review required:\\s*missing concrete chunkId/gi, \u0027Evidence review required: supporting source detail needs reviewer confirmation\u0027)\n    .replace(/missing concrete chunkId/gi, \u0027supporting evidence needs reviewer confirmation\u0027)\n    .replace(/(chunkIds?\\s*:\\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\\s*\\|\\s*\\d+\\s*){1,4}\\|\\s*(?:table|text|image|metadata)\\s*\\|?/gi, \u0027\u0027)\n    .replace(/(chunkIds?\\s*:\\s*[A-Za-z0-9_.:-]{12,})(?:\\s*\\|\\s*\\d+\\s*){1,4}\\|\\s*(?:table|text|image|metadata)\\s*\\|?/gi, \u0027\u0027)\n    .replace(/\\s*\\|\\s*(?:table|text|image|metadata)\\s*\\|\\s*/gi, \u0027 - \u0027)\n    .replace(/\\s*(?:[-–—]\\s*)?chunkIds?\\s*:\\s*[A-Za-z0-9_.:-]{8,}(?:\\s*[-–—,;])?/gi, \u0027 \u0027)\n    .replace(/\\s*\\(\\s*\\)/g, \u0027\u0027)\n    .replace(/[ \\t]{2,}/g, \u0027 \u0027)\n    .replace(/\\s+([,.;:])/g, \u0027$1\u0027)\n    .replace(/(\u003c\\/table\u003e)\\s*\\|+\\s*(?=\u003ch[1-6]\\b|$)/gi, \u0027$1\u0027)\n    .trim());\n\n  const sanitizeConfluenceStorageHtml = (input) =\u003e String(input || \u0027\u0027)\n    .replace(/\u003c!--\\s*QOPS_[\\s\\S]*?--\u003e/gi, \u0027\u0027)\n    .replace(/\u003cdiv\\b[^\u003e]*data-qops-[^\u003e]*\u003e/gi, \u0027\u0027)\n    .replace(/\u003cdiv\\b[^\u003e]*\u003e/gi, \u0027\u0027)\n    .replace(/\u003c\\/div\u003e/gi, \u0027\u0027)\n    .replace(/\u003cspan\\b[^\u003e]*\u003e/gi, \u0027\u0027)\n    .replace(/\u003c\\/span\u003e/gi, \u0027\u0027)\n    .replace(/\\s(?:style|class|id|data-[a-z0-9_-]+)=(\"[^\"]*\"|\u0027[^\u0027]*\u0027|[^\\s\u003e]+)/gi, \u0027\u0027)\n    .replace(/\u003c\\/?font\\b[^\u003e]*\u003e/gi, \u0027\u0027)\n    .replace(/\u003cscript\\b[\\s\\S]*?\u003c\\/script\u003e/gi, \u0027\u0027)\n    .replace(/\u003ciframe\\b[\\s\\S]*?\u003c\\/iframe\u003e/gi, \u0027\u0027)\n    .replace(/\u003cobject\\b[\\s\\S]*?\u003c\\/object\u003e/gi, \u0027\u0027)\n    .replace(/\u003cembed\\b[\\s\\S]*?\u003c\\/embed\u003e/gi, \u0027\u0027)\n    .replace(/\u003cac:structured-macro\\b[\\s\\S]*?\u003c\\/ac:structured-macro\u003e/gi, \u0027\u0027)\n    .replace(/\u003cac:adf-extension\\b[\\s\\S]*?\u003c\\/ac:adf-extension\u003e/gi, \u0027\u0027)\n    .replace(/\u003cac:extension\\b[\\s\\S]*?\u003c\\/ac:extension\u003e/gi, \u0027\u0027)\n    .replace(/\u003c\\/?ac:[^\u003e]+\u003e/gi, \u0027\u0027)\n    .replace(/\u003c\\/?ri:[^\u003e]+\u003e/gi, \u0027\u0027)\n    .replace(/(\u003cbr\\s*\\/?\u003e\\s*){3,}/gi, \u0027\u003cbr/\u003e\u003cbr/\u003e\u0027)\n    .trim();\n\n  const canonicalSections = {\n    test_strategy: [\n      \u0027Introduction \u0026 Context\u0027,\n      \u0027Testing Scope\u0027,\n      \u0027Strategic Testing Approach\u0027,\n      \u0027Automation Strategy \u0026 Roadmap\u0027,\n      \u0027Test Environment \u0026 Infrastructure Strategy\u0027,\n      \u0027Test Data Management Strategy\u0027,\n      \u0027Quality Metrics \u0026 Reporting Framework\u0027,\n      \u0027Risk-Based Testing \u0026 Mitigation Strategy\u0027,\n      \u0027Roles, Collaboration \u0026 RACI Model\u0027,\n      \u0027Compliance, Security \u0026 Regulatory Considerations\u0027,\n      \u0027Tooling \u0026 Integration Landscape\u0027,\n      \u0027Communication \u0026 Governance Model\u0027,\n      \u0027Coverage Ledger\u0027\n    ],\n    test_plan: [\n      \u0027Test Strategy\u0027,\n      \u0027Scope\u0027,\n      \u0027Test Objectives\u0027,\n      \u0027Test Deliverables\u0027,\n      \u0027Entry and Exit Criteria\u0027,\n      \u0027Test Schedule and Milestones\u0027,\n      \u0027Risks, Mitigation \u0026 Contingency Plan\u0027,\n      \u0027Test Environment\u0027,\n      \u0027Tools and Resources\u0027,\n      \u0027Roles and Responsibilities\u0027,\n      \u0027Test Data and Configurations\u0027,\n      \u0027Reporting and Communication Plan\u0027,\n      \u0027Suspension \u0026 Resumption Criteria\u0027,\n      \u0027Assumptions \u0026 Dependencies\u0027,\n      \u0027Automation Coverage Matrix\u0027,\n      \u0027Test Coverage Metrics\u0027,\n      \u0027Approval \u0026 Sign-off\u0027,\n      \u0027Coverage Ledger\u0027\n    ],\n    risk_matrix: [\n      \u0027Executive Summary\u0027,\n      \u0027Risk Register Summary\u0027,\n      \u0027Risk Detail Register\u0027,\n      \u0027Risk Heat Map Summary\u0027,\n      \u0027Top Critical Risks Analysis\u0027,\n      \u0027Risk Prioritization Strategy Explanation\u0027,\n      \u0027Linkage to Test Strategy Alignment\u0027,\n      \u0027Coverage Ledger\u0027\n    ]\n  };\n\n  const sectionKey = (value) =\u003e String(value || \u0027\u0027)\n    .replace(/^\\s*\\d+[.)-]?\\s*/, \u0027\u0027)\n    .replace(/^appendix\\s*\\/\\s*/i, \u0027\u0027)\n    .toLowerCase()\n    .replace(/\u0026/g, \u0027 and \u0027)\n    .replace(/[^a-z0-9]+/g, \u0027 \u0027)\n    .replace(/\\btop\\s+\\d+\\s+critical\\b/g, \u0027top critical\u0027)\n    .trim();\n\n  const canonicalForKey = (key) =\u003e (canonicalSections[type] || []).find(section =\u003e sectionKey(section) === key) || null;\n  const hasCoverageLedgerText = (html) =\u003e /coverage\\s+ledger/i.test(stripTags(html));\n\n  const stripPriorSummary = (html) =\u003e {\n    const start = \u0027\u003c!-- QOPS_DELTA_UPDATE_SUMMARY_START --\u003e\u0027;\n    const end = \u0027\u003c!-- QOPS_DELTA_UPDATE_SUMMARY_END --\u003e\u0027;\n    const escapedStart = start.replace(/[-/\\^$*+?.()|[\\]{}]/g, \u0027\\\\$\u0026\u0027);\n    const escapedEnd = end.replace(/[-/\\^$*+?.()|[\\]{}]/g, \u0027\\\\$\u0026\u0027);\n    return String(html || \u0027\u0027)\n      .replace(new RegExp(escapedStart + \u0027[\\\\s\\\\S]*?\u0027 + escapedEnd + \u0027\\\\s*(?:\u003chr\\\\s*/?\u003e)?\u0027, \u0027ig\u0027), \u0027\u0027)\n      .replace(/\u003cdiv[^\u003e]+data-qops-delta-summary=[\"\u0027]true[\"\u0027][\\s\\S]*?\u003c\\/div\u003e\\s*(?:\u003chr\\s*\\/?\u003e)?/ig, \u0027\u0027)\n      .replace(/\u003ch[1-6][^\u003e]*\u003e\\s*(?:No document changes needed|Delta Update Summary)\\s*\u003c\\/h[1-6]\u003e[\\s\\S]*?(?=\u003ch[1-6][^\u003e]*\u003e|$)/ig, \u0027\u0027)\n      .replace(/\u003cp\u003e\\s*\u003cem\u003e\\s*Existing Confluence content below[\\s\\S]*?\u003c\\/em\u003e\\s*\u003c\\/p\u003e/ig, \u0027\u0027);\n  };\n\n  const extractHeadingSections = (html) =\u003e {\n    const source = String(html || \u0027\u0027);\n    const re = /\u003ch([1-6])[^\u003e]*\u003e([\\s\\S]*?)\u003c\\/h\\1\u003e/ig;\n    const matches = [];\n    let match;\n    while ((match = re.exec(source)) !== null) {\n      const title = stripTags(match[2]);\n      matches.push({ level: Number(match[1]), index: match.index, end: re.lastIndex, title });\n    }\n    const sections = new Map();\n    for (let i = 0; i \u003c matches.length; i += 1) {\n      const current = matches[i];\n      const key = sectionKey(current.title);\n      const known = canonicalForKey(key);\n      if (!known) continue;\n      const next = matches.slice(i + 1).find(candidate =\u003e {\n        if (canonicalForKey(sectionKey(candidate.title))) return true;\n        return candidate.level \u003c= current.level;\n      });\n      sections.set(sectionKey(known), {\n        name: known,\n        html: source.slice(current.index, next ? next.index : source.length)\n      });\n    }\n    const firstKnown = matches.find(item =\u003e canonicalForKey(sectionKey(item.title)));\n    return {\n      preamble: firstKnown ? source.slice(0, firstKnown.index).trim() : \u0027\u0027,\n      sections\n    };\n  };\n\n  const removePatchAdministrativeSections = (html) =\u003e String(html || \u0027\u0027)\n    .replace(/\u003ch[1-6][^\u003e]*\u003e\\s*Delta Update Summary\\s*\u003c\\/h[1-6]\u003e[\\s\\S]*?(?=\u003ch[1-6][^\u003e]*\u003e|$)/ig, \u0027\u0027)\n    .replace(/\u003ch[1-6][^\u003e]*\u003e\\s*(?:Updated or Added Sections|Preserved Sections|Coverage Ledger Delta)\\s*\u003c\\/h[1-6]\u003e[\\s\\S]*?(?=\u003ch[1-6][^\u003e]*\u003e|$)/ig, \u0027\u0027)\n    .trim();\n\n  const sectionWordCount = (sectionHtml) =\u003e stripTags(sectionHtml).split(/\\s+/).filter(Boolean).length;\n  const compactEnough = (sectionHtml) =\u003e sectionWordCount(sectionHtml) \u003e= 12;\n\n  const normalizeCellText = (html) =\u003e stripTags(html)\n    .replace(/\\\\+/g, \u0027\u0027)\n    .replace(/\\s+/g, \u0027 \u0027)\n    .trim();\n\n  const makeTd = (value) =\u003e \u0027\u003ctd\u003e\u0027 + escapeHtml(String(value || \u0027\u0027).trim() || \u0027Not provided\u0027) + \u0027\u003c/td\u003e\u0027;\n\n  const normalizeTablesForConfluence = (html) =\u003e String(html || \u0027\u0027).replace(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/gi, (table) =\u003e {\n    const headerMatch = table.match(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/i);\n    if (!headerMatch) return table;\n    const headerCells = [...headerMatch[0].matchAll(/\u003ct[hd]\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/t[hd]\u003e/gi)].map(match =\u003e match[0]);\n    const headerLabels = headerCells.map(normalizeCellText);\n    const headerCount = headerCells.length;\n    if (!headerCount) return table;\n    return table.replace(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi, (row) =\u003e {\n      const isHeader = /\u003cth\\b/i.test(row);\n      if (isHeader) return row;\n      const cells = [...row.matchAll(/\u003ctd\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/td\u003e/gi)].map(match =\u003e match[0]);\n      if (!cells.length) return row;\n      if (cells.length === headerCount) return row;\n      const sourceIndex = headerLabels.findIndex(label =\u003e /source\\s+reference/i.test(label));\n      if (sourceIndex \u003e= 0 \u0026\u0026 cells.length \u003e headerCount) {\n        const semanticTailCount = Math.max(0, headerCount - sourceIndex - 1);\n        const prefix = cells.slice(0, sourceIndex);\n        const suffix = semanticTailCount ? cells.slice(-semanticTailCount) : [];\n        const sourceCells = cells.slice(sourceIndex, cells.length - semanticTailCount);\n        const joinedSource = sourceCells.map(normalizeCellText).filter(Boolean).join(\u0027 - \u0027);\n        const repaired = [...prefix, makeTd(joinedSource), ...suffix];\n        if (repaired.length === headerCount) return \u0027\u003ctr\u003e\u0027 + repaired.join(\u0027\u0027) + \u0027\u003c/tr\u003e\u0027;\n      }\n      const fixed = cells.slice(0, headerCount);\n      while (fixed.length \u003c headerCount) fixed.push(\u0027\u003ctd\u003eNot provided\u003c/td\u003e\u0027);\n      return \u0027\u003ctr\u003e\u0027 + fixed.join(\u0027\u0027) + \u0027\u003c/tr\u003e\u0027;\n    });\n  });\n\n  const tableShapeIssues = (html) =\u003e {\n    const issues = [];\n    String(html || \u0027\u0027).replace(/\u003ctable\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/table\u003e/gi, (table) =\u003e {\n      const rows = [...table.matchAll(/\u003ctr\\b[^\u003e]*\u003e[\\s\\S]*?\u003c\\/tr\u003e/gi)].map(match =\u003e match[0]);\n      const header = rows.find(row =\u003e /\u003cth\\b/i.test(row)) || rows[0];\n      const expected = (header.match(/\u003cth\\b[^\u003e]*\u003e/gi) || []).length || (header.match(/\u003ctd\\b[^\u003e]*\u003e/gi) || []).length;\n      if (!expected) return table;\n      rows.forEach((row, index) =\u003e {\n        if (index === 0 \u0026\u0026 row === header) return;\n        const count = (row.match(/\u003ctd\\b[^\u003e]*\u003e/gi) || []).length || (row.match(/\u003cth\\b[^\u003e]*\u003e/gi) || []).length;\n        if (count \u0026\u0026 count !== expected) issues.push({ expected, count, index });\n      });\n      return table;\n    });\n    return issues;\n  };\n\n  const looksTruncated = (html) =\u003e {\n    const text = stripTags(html);\n    if (/[|,;:]$/.test(text)) return true;\n    if (/\u003ctable[\\s\\S]*\u003ctr[^\u003e]*\u003e\\s*\u003ctd\u003e[^\u003c]{1,80}\u003c\\/td\u003e\\s*\u003c\\/tr\u003e\\s*\u003c\\/tbody\u003e\\s*\u003c\\/table\u003e\\s*$/i.test(html)) return true;\n    return false;\n  };\n\n  const pill = (label, value) =\u003e \u0027\u003cspan style=\"display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;border:1px solid #c8c1ea;border-radius:999px;background:#f4f0ff;font-size:12px;\"\u003e\u003cstrong\u003e\u0027 + escapeHtml(label) + \u0027:\u003c/strong\u003e \u0027 + escapeHtml(value) + \u0027\u003c/span\u003e\u0027;\n  const listItems = (items, emptyText) =\u003e {\n    const values = Array.isArray(items) ? items.map(item =\u003e String(item || \u0027\u0027).trim()).filter(Boolean) : [];\n    if (!values.length) return \u0027\u003cp\u003e\u0027 + escapeHtml(emptyText) + \u0027\u003c/p\u003e\u0027;\n    return \u0027\u003cul\u003e\u0027 + values.map(item =\u003e \u0027\u003cli\u003e\u0027 + escapeHtml(item) + \u0027\u003c/li\u003e\u0027).join(\u0027\u0027) + \u0027\u003c/ul\u003e\u0027;\n  };\n  const buildCoverageReviewHtml = () =\u003e {\n    const summary = updateSummary.coverageSummary || q.coverageSummary || {};\n    const status = String(summary.gateStatus || summary.status || \u0027\u0027).toLowerCase();\n    const warningItems = Array.isArray(summary.warningItems) ? summary.warningItems : [\n      ...(Array.isArray(summary.partialItems) ? summary.partialItems : []),\n      ...(Array.isArray(summary.missingItems) ? summary.missingItems : []),\n      ...(Array.isArray(summary.unknownItems) ? summary.unknownItems : [])\n    ];\n    const previousCoverage = q.updateContext?.previousCoverageSummary || {};\n    const previousCoveragePassed = String(previousCoverage.gateStatus || previousCoverage.status || \u0027\u0027).toLowerCase() === \u0027passed\u0027\n      \u0026\u0026 (Number(previousCoverage.coverageLedgerCount || 0) \u003e 0 || Array.isArray(q.updateContext?.previousCoverageLedger));\n    if (!warningItems.length \u0026\u0026 previousCoveragePassed) return \u0027\u0027;\n    if (![\u0027warning\u0027, \u0027failed\u0027, \u0027not_reported\u0027].includes(status) \u0026\u0026 !warningItems.length) return \u0027\u0027;\n    const rows = warningItems.slice(0, 8).map(item =\u003e \u0027\u003cli\u003e\u0027 + escapeHtml([\n      item.coverageId,\n      item.moduleRequirement,\n      item.coverageStatus,\n      item.notes\n    ].filter(Boolean).join(\u0027 - \u0027)) + \u0027\u003c/li\u003e\u0027).join(\u0027\u0027);\n    return [\n      \u0027\u003cdiv data-qops-coverage-review=\"true\" style=\"border:1px solid #e0b94f;border-radius:10px;padding:12px;margin:12px 0;background:#fff8e1;\"\u003e\u0027,\n      \u0027\u003ch2\u003eCoverage Review Note\u003c/h2\u003e\u0027,\n      \u0027\u003cp\u003eQ-Ops completed the update with coverage items that require QA or business review before final sign-off.\u003c/p\u003e\u0027,\n      rows ? \u0027\u003cul\u003e\u0027 + rows + \u0027\u003c/ul\u003e\u0027 : \u0027\u003cp\u003eCoverage metadata was not fully parsed. Review the Coverage Ledger before sign-off.\u003c/p\u003e\u0027,\n      \u0027\u003c/div\u003e\u0027\n    ].join(\u0027\u0027);\n  };\n\n  const buildSummaryHtml = () =\u003e {\n    const title = updateSummary.noChangesDetected ? \u0027No document changes needed\u0027 : \u0027Delta Update Summary\u0027;\n    const updated = Number(updateSummary.updatedSectionCount || 0) + Number(updateSummary.addedSectionCount || 0);\n    const preserved = Number(updateSummary.preservedSectionCount || 0);\n    const removed = Number(updateSummary.removedSectionCount || 0);\n    const tokens = Number(updateSummary.tokenUsage?.total || updateSummary.tokensTotal || 0);\n    const cost = Number(updateSummary.tokenUsage?.estimatedCostUsd || updateSummary.estimatedCostUsd || 0);\n    const saved = Number(updateSummary.tokenSavings?.estimatedTokensSaved || updateSummary.estimatedTokensSaved || 0);\n    const reason = Array.isArray(updateSummary.updateReasons) \u0026\u0026 updateSummary.updateReasons.length\n      ? updateSummary.updateReasons.join(\u0027; \u0027)\n      : \u0027No source-context changes were detected; Regenerate Anyway refreshed the document safely.\u0027;\n    const focus = [...(updateSummary.updatedSections || []), ...(updateSummary.addedSections || []), ...(updateSummary.needsReviewSections || [])].filter(Boolean);\n    return [\n      \u0027\u003c!-- QOPS_DELTA_UPDATE_SUMMARY_START --\u003e\u0027,\n      \u0027\u003cdiv data-qops-delta-summary=\"true\" style=\"border:1px solid #c8c1ea;border-radius:12px;padding:16px;margin:0 0 18px 0;background:#fbf9ff;\"\u003e\u0027,\n      \u0027\u003ch2\u003e\u0027 + escapeHtml(title) + \u0027\u003c/h2\u003e\u0027,\n      \u0027\u003cp\u003eQ-Ops refreshed this existing document selectively using the latest source context and preserved stable sections.\u003c/p\u003e\u0027,\n      \u0027\u003cp\u003e\u0027 + [\n        pill(\u0027Updated\u0027, updated),\n        pill(\u0027Preserved\u0027, preserved),\n        pill(\u0027Removed\u0027, removed),\n        tokens ? pill(\u0027Update tokens\u0027, tokens.toLocaleString()) : \u0027\u0027,\n        cost ? pill(\u0027Update cost\u0027, \u0027US$\u0027 + cost.toFixed(4)) : \u0027\u0027,\n        saved ? pill(\u0027Tokens saved\u0027, saved.toLocaleString()) : \u0027\u0027\n      ].filter(Boolean).join(\u0027\u0027) + \u0027\u003c/p\u003e\u0027,\n      \u0027\u003cp\u003e\u003cstrong\u003eWhy this update ran:\u003c/strong\u003e \u0027 + escapeHtml(reason) + \u0027\u003c/p\u003e\u0027,\n      \u0027\u003cp\u003e\u003cstrong\u003eUpdated focus:\u003c/strong\u003e\u003c/p\u003e\u0027,\n      listItems(focus, updateSummary.noChangesDetected ? \u0027No sections required changes.\u0027 : \u0027Changed or review-needed sections are listed above.\u0027),\n      \u0027\u003c/div\u003e\u0027,\n      \u0027\u003c!-- QOPS_DELTA_UPDATE_SUMMARY_END --\u003e\u0027\n    ].join(\u0027\u0027);\n  };\n\n  if (!isSharedUpdate) return sanitizeUserFacingHtml(rawPatch);\n\n  const cleanedExisting = stripPriorSummary(sanitizeUserFacingHtml(existingRaw)).trim();\n  const cleanedPatch = removePatchAdministrativeSections(stripPriorSummary(sanitizeUserFacingHtml(rawPatch))).trim();\n  const existingParts = extractHeadingSections(cleanedExisting);\n  const patchParts = extractHeadingSections(cleanedPatch);\n  const existingSectionCount = existingParts.sections.size;\n  const patchSectionCount = patchParts.sections.size;\n  const required = canonicalSections[type] || [];\n  const patchHasMostRequiredSections = required.length \u003e 0 \u0026\u0026 patchSectionCount \u003e= Math.max(4, Math.ceil(required.length * 0.65));\n  const noChanges = Boolean(updateSummary.noChangesDetected);\n\n  const baseSections = new Map(existingParts.sections);\n  const normalizeCoverageStatus = (value) =\u003e {\n    const raw = String(value || \u0027\u0027).trim().toLowerCase();\n    if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n    if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n    if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n    if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n    return raw || \u0027unknown\u0027;\n  };\n\n  const coverageRowKey = (row) =\u003e sectionKey(row?.coverageId || row?.moduleRequirement || row?.requirementId || row?.id || \u0027\u0027);\n  const normalizeCoverageRowForPublish = (row) =\u003e ({\n    coverageId: String(row?.coverageId || row?.id || \u0027\u0027).trim(),\n    moduleRequirement: String(row?.moduleRequirement || row?.requirement || row?.title || \u0027\u0027).trim(),\n    sourceReference: String(row?.sourceReference || row?.source || \u0027\u0027).trim(),\n    includedInOutput: String(row?.includedInOutput || row?.included || \u0027\u0027).trim(),\n    coverageStatus: normalizeCoverageStatus(row?.coverageStatus || row?.status),\n    notes: String(row?.notes || row?.rationale || \u0027\u0027).trim()\n  });\n\n  const buildCoverageLedgerSectionHtml = (rows) =\u003e {\n    const normalizedRows = (Array.isArray(rows) ? rows : [])\n      .map(normalizeCoverageRowForPublish)\n      .filter(row =\u003e row.coverageId || row.moduleRequirement);\n    if (!normalizedRows.length) return \u0027\u0027;\n    const body = normalizedRows.map(row =\u003e \u0027\u003ctr\u003e\u0027 + [\n      row.coverageId,\n      row.moduleRequirement,\n      row.sourceReference,\n      row.includedInOutput,\n      row.coverageStatus,\n      row.notes\n    ].map(makeTd).join(\u0027\u0027) + \u0027\u003c/tr\u003e\u0027).join(\u0027\u0027);\n    return \u0027\u003ch2\u003eCoverage Ledger\u003c/h2\u003e\u003cbr/\u003e\u003ctable\u003e\u003ctbody\u003e\u003ctr\u003e\u003cth\u003eCoverage ID\u003c/th\u003e\u003cth\u003eModule / Requirement\u003c/th\u003e\u003cth\u003eSource Reference\u003c/th\u003e\u003cth\u003eIncluded In Output\u003c/th\u003e\u003cth\u003eCoverage Status\u003c/th\u003e\u003cth\u003eNotes\u003c/th\u003e\u003c/tr\u003e\u0027 + body + \u0027\u003c/tbody\u003e\u003c/table\u003e\u0027;\n  };\n\n  const mergedCoverageLedgerHtml = () =\u003e {\n    const previousRows = Array.isArray(q.updateContext?.previousCoverageLedger) ? q.updateContext.previousCoverageLedger : [];\n    const currentRows = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];\n    if (!previousRows.length \u0026\u0026 !currentRows.length) return \u0027\u0027;\n    const byKey = new Map();\n    previousRows.map(normalizeCoverageRowForPublish).forEach(row =\u003e {\n      const key = coverageRowKey(row);\n      if (key) byKey.set(key, row);\n    });\n    currentRows.map(normalizeCoverageRowForPublish).forEach(row =\u003e {\n      const key = coverageRowKey(row);\n      if (key) byKey.set(key, row);\n    });\n    const shouldPreserveBaseline = previousRows.length \u003e currentRows.length\n      \u0026\u0026 !(Array.isArray(updateSummary.removedSections) \u0026\u0026 updateSummary.removedSections.some(section =\u003e sectionKey(section) === sectionKey(\u0027Coverage Ledger\u0027)));\n    const rows = shouldPreserveBaseline ? Array.from(byKey.values()) : (currentRows.length ? currentRows : previousRows);\n    return buildCoverageLedgerSectionHtml(rows);\n  };\n\n  if (type === \u0027risk_matrix\u0027 \u0026\u0026 !baseSections.has(sectionKey(\u0027Executive Summary\u0027))) {\n    const previousSummary = q.updateContext?.previousBatchSummary || updateSummary.batchSummary || q.batchSummary || {};\n    const covered = Number(previousSummary.covered || q.coverageSummary?.coveredCount || 0);\n    const review = Number(previousSummary.review || q.coverageSummary?.partialCount || q.coverageSummary?.uncoveredCount || 0);\n    const summaryText = [\n      \u0027This Risk Matrix was selectively refreshed from the latest AstraCart project evidence and preserves stable risk governance context from the existing Confluence page.\u0027,\n      \u0027The update keeps the risk register, detailed risks, heat map, prioritization rationale, test-strategy linkage, and coverage ledger aligned to the current E2E scope.\u0027,\n      covered || review ? (\u0027Current coverage review indicates \u0027 + covered + \u0027 covered item(s) and \u0027 + review + \u0027 item(s) needing QA or business review before final sign-off.\u0027) : \u0027Coverage status should be reviewed in the Coverage Ledger before final sign-off.\u0027\n    ].join(\u0027 \u0027);\n    baseSections.set(sectionKey(\u0027Executive Summary\u0027), {\n      name: \u0027Executive Summary\u0027,\n      html: \u0027\u003ch1\u003eExecutive Summary\u003c/h1\u003e\u003cp\u003e\u0027 + escapeHtml(summaryText) + \u0027\u003c/p\u003e\u0027\n    });\n  }\n  const allowedPatchKeys = new Set([\n    ...(Array.isArray(updateSummary.updatedSections) ? updateSummary.updatedSections : []),\n    ...(Array.isArray(updateSummary.addedSections) ? updateSummary.addedSections : []),\n    ...(Array.isArray(updateSummary.needsReviewSections) ? updateSummary.needsReviewSections : [])\n  ].map(section =\u003e sectionKey(canonicalForKey(sectionKey(section)) || section)));\n  const coverageLedgerKey = sectionKey(\u0027Coverage Ledger\u0027);\n  allowedPatchKeys.add(coverageLedgerKey);\n  (Array.isArray(updateSummary.removedSections) ? updateSummary.removedSections : [])\n    .map(section =\u003e sectionKey(canonicalForKey(sectionKey(section)) || section))\n    .forEach(key =\u003e baseSections.delete(key));\n  const mergedLedgerHtml = mergedCoverageLedgerHtml();\n  if (mergedLedgerHtml) {\n    baseSections.set(coverageLedgerKey, { name: \u0027Coverage Ledger\u0027, html: mergedLedgerHtml });\n  }\n  for (const [key, patchSection] of patchParts.sections.entries()) {\n    if (!allowedPatchKeys.has(key)) continue;\n    if (key === coverageLedgerKey \u0026\u0026 mergedLedgerHtml) {\n      baseSections.set(key, { name: \u0027Coverage Ledger\u0027, html: mergedLedgerHtml });\n      continue;\n    }\n    if (compactEnough(patchSection.html) || key === coverageLedgerKey) {\n      baseSections.set(key, patchSection);\n    }\n  }\n\n  let body;\n  if (!cleanedExisting \u0026\u0026 patchHasMostRequiredSections \u0026\u0026 patchSectionCount \u003e= existingSectionCount) {\n    body = (patchParts.preamble || existingParts.preamble || \u0027\u0027) + required\n      .map(section =\u003e patchParts.sections.get(sectionKey(section))?.html || baseSections.get(sectionKey(section))?.html || \u0027\u0027)\n      .filter(Boolean)\n      .join(\u0027\u0027);\n  } else if (noChanges \u0026\u0026 cleanedExisting \u0026\u0026 !mergedLedgerHtml) {\n    body = cleanedExisting;\n  } else if (baseSections.size) {\n    const preamble = existingParts.preamble || patchParts.preamble || \u0027\u0027;\n    body = preamble + required\n      .map(section =\u003e baseSections.get(sectionKey(section))?.html || \u0027\u0027)\n      .filter(Boolean)\n      .join(\u0027\u0027);\n    const extraPatchSections = [...patchParts.sections.entries()]\n      .filter(([key]) =\u003e !required.some(section =\u003e sectionKey(section) === key))\n      .map(([, section]) =\u003e section.html)\n      .join(\u0027\u0027);\n    body += extraPatchSections;\n  } else if (cleanedExisting) {\n    body = cleanedExisting;\n  } else {\n    body = cleanedPatch;\n  }\n\n  body = normalizeTablesForConfluence(sanitizeUserFacingHtml(body || \u0027\u0027).trim());\n  let finalHtml = buildSummaryHtml() + buildCoverageReviewHtml() + \u0027\u003chr/\u003e\u0027 + body;\n  const finalText = stripTags(finalHtml);\n  const documentHeaderPatterns = {\n    test_strategy: /Document:\\s*Enterprise\\s+Test\\s+Strategy/gi,\n    test_plan: /Document:\\s*Enterprise\\s+Test\\s+Plan/gi,\n    risk_matrix: /Document:\\s*Enterprise\\s+Risk\\s+(?:Assessment\\s+)?Matrix/gi\n  };\n  const headerCount = (finalText.match(documentHeaderPatterns[type] || /a^/g) || []).length;\n  if (headerCount \u003e 1) {\n    throw new Error(\u0027Shared update merge guard failed: duplicate document headers detected before Confluence publish.\u0027);\n  }\n\n  const malformedTables = tableShapeIssues(finalHtml);\n  if (malformedTables.length) {\n    throw new Error(\u0027Shared update merge guard failed: malformed table shape detected before Confluence publish.\u0027);\n  }\n\n  const finalParts = extractHeadingSections(finalHtml);\n  const claimedPreserved = Array.isArray(updateSummary.preservedSections) ? updateSummary.preservedSections : [];\n  const missingClaimed = claimedPreserved\n    .map(section =\u003e canonicalForKey(sectionKey(section)) || section)\n    .filter(section =\u003e sectionKey(section) !== sectionKey(\u0027Coverage Ledger\u0027))\n    .filter(section =\u003e {\n      const sectionHtml = finalParts.sections.get(sectionKey(section))?.html || \u0027\u0027;\n      return !sectionHtml || sectionWordCount(sectionHtml) \u003c 12;\n    });\n  if (missingClaimed.length) {\n    throw new Error(\u0027Shared update merge guard failed: preserved section(s) missing or content-thin in final body: \u0027 + missingClaimed.join(\u0027, \u0027));\n  }\n\n  const hadCoverageBefore = hasCoverageLedgerText(cleanedExisting) || (Array.isArray(q.updateContext?.previousCoverageLedger) \u0026\u0026 q.updateContext.previousCoverageLedger.length \u003e 0);\n  if (hadCoverageBefore \u0026\u0026 !hasCoverageLedgerText(finalHtml)) {\n    throw new Error(\u0027Shared update merge guard failed: Coverage Ledger would be dropped by the update.\u0027);\n  }\n\n  const mustBeComplete = !cleanedExisting || existingSectionCount \u003c Math.max(3, Math.ceil(required.length * 0.5)) || patchHasMostRequiredSections;\n  if (mustBeComplete) {\n    const missingRequired = required\n      .filter(section =\u003e sectionKey(section) !== sectionKey(\u0027Coverage Ledger\u0027))\n      .filter(section =\u003e {\n        const sectionHtml = finalParts.sections.get(sectionKey(section))?.html || \u0027\u0027;\n        return !sectionHtml || sectionWordCount(sectionHtml) \u003c 12;\n      });\n    if (missingRequired.length) {\n      throw new Error(\u0027Shared update merge guard failed: final document is incomplete for \u0027 + type + \u0027. Missing: \u0027 + missingRequired.join(\u0027, \u0027));\n    }\n  }\n\n  if (looksTruncated(finalHtml)) {\n    throw new Error(\u0027Shared update merge guard failed: generated update appears truncated before Confluence publish.\u0027);\n  }\n\n  return sanitizeConfluenceStorageHtml(sanitizeUserFacingHtml(finalHtml));\n})() }}"
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $(\u0027Preserve Job ID\u0027).item.json.job_id }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\"\n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"completed\",\n  \"output\": {\n    \"settingsVersion\": {{ $(\u0027Restore Job Context\u0027).item.json.settingsVersion || \u0027null\u0027 }},\n    \"destination\": {\n      \"projectId\": {{ $(\u0027Restore Job Context\u0027).item.json.projectId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.projectId) : \u0027null\u0027 }},\n      \"type\": \"confluence\"\n    },\n    \"confluencePageId\": \"{{ $(\u0027Upload Document on Confluence\u0027).item.json.id }}\",\n    \"url\": \"{{ $(\u0027Upload Document on Confluence\u0027).item.json._links.base + $(\u0027Upload Document on Confluence\u0027).item.json._links.webui }}\",\n    \"wordCount\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.wordCount) || 0 }},\n    \"documentType\": {{ $(\u0027Restore Job Context\u0027).item.json.documentType ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.documentType) : \u0027null\u0027 }},\n    \"generationMode\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.generationMode || $(\u0027Restore Job Context\u0027).item.json.generationMode || \u0027create\u0027) }},\n    \"updateOfJobId\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary?.updateOfJobId || $(\u0027Restore Job Context\u0027).item.json.updateContext?.previousJobId || null) }},\n    \"updateSummary\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary || null) }},\n    \"coverageSummary\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] }) }},\n    \"coverageLedger\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.coverageLedger || []) }},\n    \"batchSummary\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.batchSummary || null) }},\n    \"progress\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.progress || null) }},\n    \"qualityGate\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.qualityGate || null) }},\n    \"finalValidation\": {{ JSON.stringify((() =\u003e { const fv = ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.finalValidation || $(\u0027Restore Quality Gate Output\u0027).item.json.finalValidation) || null; return fv?.status === \u0027pending_merge\u0027 ? { ...fv, status: \u0027passed\u0027, structuralStatus: \u0027passed\u0027, mergeGuard: \u0027passed\u0027 } : (fv || { version: \u0027shared-final-validation-v11\u0027, status: \u0027passed\u0027, structuralStatus: \u0027passed\u0027 }); })()) }},\n    \"operationMode\": {{ JSON.stringify($(\u0027Restore Quality Gate Output\u0027).item.json.updateSummary?.operationMode || ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.finalValidation || $(\u0027Restore Quality Gate Output\u0027).item.json.finalValidation)?.operationMode || ($(\u0027Restore Job Context\u0027).item.json.generationMode === \u0027update\u0027 ? \u0027update_delta\u0027 : (($(\u0027Restore Job Context\u0027).item.json.retryOfJobId || $(\u0027Restore Job Context\u0027).item.json.input?.retryJobId) ? \u0027create_retry\u0027 : \u0027create\u0027))) }},\n    \"diagnostics\": {{ JSON.stringify({ ...(($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.diagnostics || $(\u0027Restore Quality Gate Output\u0027).item.json.diagnostics) || {}), finalValidation: (() =\u003e { const fv = ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0]?.json?.finalValidation || $(\u0027Restore Quality Gate Output\u0027).item.json.finalValidation) || null; return fv?.status === \u0027pending_merge\u0027 ? { ...fv, status: \u0027passed\u0027, structuralStatus: \u0027passed\u0027, mergeGuard: \u0027passed\u0027 } : fv; })() }) }},\n    \"tokenUsage\": {\n      \"source\": \"{{ $(\u0027Restore Quality Gate Output\u0027).item.json.tokenUsage?.source || \u0027estimated\u0027 }}\",\n      \"input\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensInput) || 0 }},\n      \"output\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensOutput) || 0 }},\n      \"total\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.tokensTotal) || 0 }},\n      \"estimatedCostUsd\": {{ Number($(\u0027Restore Quality Gate Output\u0027).item.json.estimatedCostUsd) || 0 }}\n    }\n  },\n  \"updated_at\": \"{{ new Date().toISOString() }}\"\n}",
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

- Code in JavaScript1 -> Update Job Status as Completed1 (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"completed\",\n  \"output\": {\n    \"settingsVersion\": {{ $json.settingsVersion || \u0027null\u0027 }},\n    \"destination\": {\n      \"projectId\": {{ $json.projectId ? JSON.stringify($json.projectId) : \u0027null\u0027 }},\n      \"type\": \"jira\"\n    },\n    \"stories\": {{ JSON.stringify($json.stories || []) }},\n    \"epics\": {{ JSON.stringify($json.epics || []) }},\n    \"wordCount\": {{ Number($json.wordCount) || 0 }},\n    \"tokenUsage\": {\n      \"source\": \"{{ $json.tokenUsageSource || \u0027estimated\u0027 }}\",\n      \"input\": {{ Number($json.tokensInput) || 0 }},\n      \"output\": {{ Number($json.tokensOutput) || 0 }},\n      \"total\": {{ Number($json.tokensTotal) || 0 }},\n      \"estimatedCostUsd\": {{ Number($json.estimatedCostUsd) || 0 }}\n    }\n  },\n  \"updated_at\": \"{{ new Date().toISOString() }}\"\n}",
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $(\u0027Preserve Job ID\u0027).item.json.job_id || $(\u0027Restore Job Context\u0027).item.json.jobId }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\"\n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ (() =\u003e {\n  const restore = $(\u0027Restore Job Context\u0027).item.json || {};\n  const preserved = $(\u0027Preserve Job ID\u0027).item.json || {};\n  const q = $(\u0027Restore Quality Gate Output\u0027).item.json || {};\n  const converter = ($items(\u0027Convert MD -\u003e Confluence Formatted HTML\u0027, 0, 0)[0] || {}).json || {};\n  const error = $json.error || {};\n  const details = error.errorDetails || $json.errorDetails || {};\n  const raw = Array.isArray(details.rawErrorMessage) ? details.rawErrorMessage.join(\u0027 | \u0027) : (details.rawErrorMessage || error.rawErrorMessage || \u0027\u0027);\n  const httpCode = details.httpCode || error.httpCode || $json.httpCode || $json.statusCode || null;\n  const message = error.message || $json.errorMessage || $json.message || \u0027Confluence publish failed\u0027;\n  const description = error.description || $json.errorDescription || $json.description || raw || \u0027\u0027;\n  const tokenUsage = {\n    source: q.tokenUsage?.source || \u0027estimated\u0027,\n    input: Number(q.tokensInput) || Number(q.tokenUsage?.input) || 0,\n    output: Number(q.tokensOutput) || Number(q.tokenUsage?.output) || 0,\n    total: Number(q.tokensTotal) || Number(q.tokenUsage?.total) || 0,\n    estimatedCostUsd: Number(q.estimatedCostUsd) || Number(q.tokenUsage?.estimatedCostUsd) || 0\n  };\n  const diagnostics = {\n    version: \u0027confluence-fabric-resilience-v1\u0027,\n    failedNode: error.node?.name || $json.nodeName || \u0027Confluence publish\u0027,\n    errorType: \u0027CONFLUENCE_PUBLISH_FAILED\u0027,\n    errorMessage: message,\n    errorDescription: description,\n    httpCode,\n    rawErrorMessage: raw,\n    operationMode: restore.generationMode || \u0027create\u0027,\n    finalValidation: converter.finalValidation || q.finalValidation || null,\n    confluencePayloadSanitized: true\n  };\n  return JSON.stringify({\n    status: \u0027failed\u0027,\n    error: message,\n    output: {\n      error: true,\n      errorType: \u0027CONFLUENCE_PUBLISH_FAILED\u0027,\n      message,\n      description,\n      httpCode,\n      rawErrorMessage: raw,\n      failed_at: new Date().toISOString(),\n      confluencePageId: null,\n      url: null,\n      documentType: restore.documentType || preserved.documentType || null,\n      projectName: restore.projectName || preserved.projectName || null,\n      operationMode: restore.generationMode || \u0027create\u0027,\n      wordCount: Number(q.wordCount) || 0,\n      tokensInput: tokenUsage.input,\n      tokensOutput: tokenUsage.output,\n      tokensTotal: tokenUsage.total,\n      estimatedCostUsd: tokenUsage.estimatedCostUsd,\n      tokenUsage,\n      qualityGate: q.qualityGate || null,\n      coverageSummary: q.coverageSummary || null,\n      coverageLedger: q.coverageLedger || [],\n      batchSummary: q.batchSummary || null,\n      finalValidation: converter.finalValidation || q.finalValidation || null,\n      diagnostics\n    },\n    updated_at: new Date().toISOString()\n  });\n})() }}",
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $(\u0027Restore Job Context\u0027).item.json.jobId }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{  \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"failed\",\n  \"error\": {{ JSON.stringify(typeof $json.error === \u0027string\u0027 ? $json.error : ($json.message || $json.error?.message || \u0027Quality Gate Failed\u0027)) }},\n  \"output\": {\n    \"error\": true,\n    \"message\": {{ JSON.stringify(typeof $json.error === \u0027string\u0027 ? $json.error : ($json.message || $json.error?.message || \u0027Quality Gate Failed\u0027)) }},\n    \"projectName\": {{ JSON.stringify($(\u0027Prompt Library\u0027).item.json.projectName) }},\n    \"documentType\": {{ JSON.stringify($(\u0027Prompt Library\u0027).item.json.documentType) }},\n    \"wordCount\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.wordCount || 0) || 0 }},\n    \"tokensInput\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.tokensInput || 0) || 0 }},\n    \"tokensOutput\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.tokensOutput || 0) || 0 }},\n    \"tokensTotal\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.tokensTotal || 0) || 0 }},\n    \"estimatedCostUsd\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.estimatedCostUsd || 0) || 0 }},\n    \"tokenUsage\": {{ JSON.stringify((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).tokenUsage || { source: \u0027estimated\u0027, input: 0, output: 0, total: 0, estimatedCostUsd: 0 }) }},\n    \"qualityGate\": {\n      \"passed\": false,\n      \"failureType\": \"QUALITY_GATE_FAILED\",\n      \"message\": {{ JSON.stringify(typeof $json.error === \u0027string\u0027 ? $json.error : ($json.message || $json.error?.message || \u0027Quality Gate Failed\u0027)) }},\n      \"wordCount\": {{ Number(($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json?.wordCount || 0) || 0 }},\n      \"minWordCount\": {{ ({ test_strategy: 2000, test_plan: 1500, test_cases: 1000, user_stories: 500, risk_matrix: 800, traceability_matrix: 800 })[$(\u0027Prompt Library\u0027).item.json.documentType] || 500 }}\n    },\n    \"settingsVersion\": {{ $(\u0027Restore Job Context\u0027).item.json.settingsVersion || \u0027null\u0027 }},\n    \"retryOfJobId\": {{ $(\u0027Restore Job Context\u0027).item.json.retryOfJobId ? JSON.stringify($(\u0027Restore Job Context\u0027).item.json.retryOfJobId) : \u0027null\u0027 }},\n    \"traceabilityContext\": {{ JSON.stringify($(\u0027Prompt Library\u0027).item.json.traceabilityContext || {}) }},\n    \"storiesWithoutTestCases\": {{ JSON.stringify(($(\u0027Prompt Library\u0027).item.json.traceabilityContext || {}).storiesWithoutTestCases || []) }},\n    \"coverageSummary\": {{ JSON.stringify(((($items(\u0027Validate AI Agent Output\u0027)[0] || {}).json || {}).coverageSummary || { version: \u0027coverage-ledger-v1\u0027, mode: \u0027dry_run\u0027, gateStatus: \u0027not_reported\u0027, coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] })) }}\n  },\n  \"updated_at\": \"{{ new Date().toISOString() }}\"\n}",
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
| Always Output Data | True |
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
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $(\u0027Handle: Generator Agent Failed\u0027).item.json.jobId }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\"\n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"failed\",\n  \"error\": \"{{ $(\u0027Handle: Generator Agent Failed\u0027).item.json.message }}\",\n  \"output\": {\n    \"error\": true,\n    \"errorType\": \"GENERATOR_AGENT_FAILED\",\n    \"message\": \"{{ $(\u0027Handle: Generator Agent Failed\u0027).item.json.message }}\",\n    \"failed_at\": \"{{ $(\u0027Handle: Generator Agent Failed\u0027).item.json.timestamp }}\",\n    \"diagnostics\": {{ JSON.stringify($(\u0027Handle: Generator Agent Failed\u0027).item.json.diagnostics || {}) }}\n  },\n  \"updated_at\": \"{{ new Date().toISOString() }}\"\n}",
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
| Always Output Data | True |
| Retry On Fail | True |
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
    "url":  "={{ String((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).confluenceBaseUrl || \u0027https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, \u0027\u0027) + \u0027/rest/api/content\u0027 }}",
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
                                                  "value":  "={{ ((($json.configSnapshot || $(\u0027Prompt Library\u0027).item.json.configSnapshot || {}).publishing || {}).confluenceSpaceKey || \u0027TD\u0027) }}"
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
    "jsCode":  "// Detect AI output safely across all n8n versions\n\nlet text = \"\";\nlet tokensInput = 0;\nlet tokensOutput = 0;\n\nif ($json.output_text) {\n  text = $json.output_text;\n} else if (typeof $json.output === \"string\") {\n  text = $json.output;\n} else if ($json.output?.[0]?.content?.[0]?.text) {\n  text = $json.output[0].content[0].text;\n} else if ($json.message?.content) {\n  text = $json.message.content;\n}\n\ntokensInput = $json.usage?.prompt_tokens ||\n  $json.usage?.input_tokens ||\n  $json.llmUsage?.promptTokens ||\n  $json.tokenUsage?.promptTokens ||\n  0;\n\ntokensOutput = $json.usage?.completion_tokens ||\n  $json.usage?.output_tokens ||\n  $json.llmUsage?.completionTokens ||\n  $json.tokenUsage?.completionTokens ||\n  0;\n\nif (!text || text.trim().length \u003c 50) {\n  throw new Error(\"AI returned unexpected structure: \" + JSON.stringify($json));\n}\n\nfunction splitMarkdownRow(line) {\n  return String(line || \u0027\u0027)\n    .trim()\n    .replace(/^\\|/, \u0027\u0027)\n    .replace(/\\|$/, \u0027\u0027)\n    .split(\u0027|\u0027)\n    .map(cell =\u003e cell.trim());\n}\n\nfunction isSeparatorRow(cells) {\n  return cells.length \u003e 0 \u0026\u0026 cells.every(cell =\u003e /^:?-{3,}:?$/.test(cell));\n}\n\nfunction normalizeStatus(value) {\n  const raw = String(value || \u0027\u0027).trim().toLowerCase();\n  if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n  if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n  if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n  if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n  return \u0027unknown\u0027;\n}\n\nfunction getColumnIndex(headers, patterns, fallback) {\n  const index = headers.findIndex(header =\u003e patterns.some(pattern =\u003e pattern.test(header)));\n  return index \u003e= 0 ? index : fallback;\n}\n\nfunction extractCoverageLedger(markdown) {\n  const rows = [];\n  const lines = String(markdown || \u0027\u0027).split(/\\r?\\n/);\n  let inCoverageSection = false;\n  let headers = null;\n\n  for (const line of lines) {\n    const trimmed = line.trim();\n    const lower = trimmed.toLowerCase();\n\n    if (/^#{1,6}\\s+.*coverage\\s+ledger/.test(lower) || /^coverage\\s+ledger\\s*:?$/i.test(trimmed)) {\n      inCoverageSection = true;\n      headers = null;\n      continue;\n    }\n\n    if (inCoverageSection \u0026\u0026 /^#{1,6}\\s+/.test(trimmed) \u0026\u0026 !/coverage\\s+ledger/i.test(trimmed)) {\n      if (headers) break;\n      inCoverageSection = false;\n    }\n\n    if (inCoverageSection \u0026\u0026 headers \u0026\u0026 rows.length \u003e 0 \u0026\u0026 (!trimmed.includes(\u0027|\u0027) || /^-{3,}$/.test(trimmed))) {\n      break;\n    }\n\n    if (!trimmed.includes(\u0027|\u0027)) {\n      continue;\n    }\n\n    const cells = splitMarkdownRow(trimmed);\n    if (cells.length \u003c 4 || isSeparatorRow(cells)) {\n      continue;\n    }\n\n    const normalizedCells = cells.map(cell =\u003e cell.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const joined = normalizedCells.join(\u0027 \u0027);\n    const looksLikeCoverageHeader =\n      joined.includes(\u0027coverage\u0027) \u0026\u0026\n      (joined.includes(\u0027module\u0027) || joined.includes(\u0027requirement\u0027)) \u0026\u0026\n      joined.includes(\u0027status\u0027);\n\n    if (looksLikeCoverageHeader) {\n      if (!inCoverageSection \u0026\u0026 !(normalizedCells[0] || \u0027\u0027).includes(\u0027coverage id\u0027)) {\n        continue;\n      }\n      headers = normalizedCells;\n      inCoverageSection = true;\n      continue;\n    }\n\n    if (!inCoverageSection || !headers) {\n      continue;\n    }\n\n    let entry;\n\n    if (headers.length \u003c= 6 \u0026\u0026 cells.length \u003e headers.length) {\n      // Source references often contain pipe-delimited metadata, for example\n      // \"BRD | file.pdf | chunkId\". Keep the first two and last three\n      // semantic columns stable, then join the middle back into Source Reference.\n      entry = {\n        coverageId: cells[0] || \u0027\u0027,\n        moduleRequirement: cells[1] || \u0027\u0027,\n        sourceReference: cells.slice(2, -3).join(\u0027 | \u0027),\n        includedInOutput: cells[cells.length - 3] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[cells.length - 2]),\n        notes: cells[cells.length - 1] || \u0027\u0027\n      };\n    } else {\n      const idIndex = getColumnIndex(headers, [/^coverage id$/, /^id$/, /req id/], 0);\n      const moduleIndex = getColumnIndex(headers, [/module/, /requirement/], 1);\n      const sourceIndex = getColumnIndex(headers, [/source/], 2);\n      const includedIndex = getColumnIndex(headers, [/included/, /output/], 3);\n      const statusIndex = getColumnIndex(headers, [/status/], 4);\n      const notesIndex = getColumnIndex(headers, [/note/, /rationale/], 5);\n\n      entry = {\n        coverageId: cells[idIndex] || \u0027\u0027,\n        moduleRequirement: cells[moduleIndex] || \u0027\u0027,\n        sourceReference: cells[sourceIndex] || \u0027\u0027,\n        includedInOutput: cells[includedIndex] || \u0027\u0027,\n        coverageStatus: normalizeStatus(cells[statusIndex]),\n        notes: cells[notesIndex] || \u0027\u0027\n      };\n    }\n\n    if (entry.moduleRequirement || entry.coverageId) {\n      rows.push(entry);\n    }\n  }\n\n  return rows.slice(0, 200);\n}\n\nfunction extractTraceabilityMatrixLedger(markdown) {\n  const rows = [];\n  const lines = String(markdown || \u0027\u0027).split(/\\r?\\n/);\n  let headers = null;\n\n  for (const line of lines) {\n    const trimmed = line.trim();\n    if (!trimmed.includes(\u0027|\u0027)) {\n      if (headers \u0026\u0026 rows.length \u003e 0) break;\n      continue;\n    }\n\n    const cells = splitMarkdownRow(trimmed);\n    if (cells.length \u003c 4 || isSeparatorRow(cells)) {\n      continue;\n    }\n\n    const normalizedCells = cells.map(cell =\u003e cell.toLowerCase().replace(/[^a-z0-9]+/g, \u0027 \u0027).trim());\n    const joined = normalizedCells.join(\u0027 \u0027);\n    const looksLikeRtmHeader =\n      (joined.includes(\u0027req id\u0027) || joined.includes(\u0027requirement id\u0027)) \u0026\u0026\n      joined.includes(\u0027requirement\u0027) \u0026\u0026\n      joined.includes(\u0027coverage status\u0027);\n\n    if (looksLikeRtmHeader) {\n      headers = normalizedCells;\n      continue;\n    }\n\n    if (!headers) {\n      continue;\n    }\n\n    const reqIndex = getColumnIndex(headers, [/req id/, /requirement id/, /^id$/], 0);\n    const requirementIndex = getColumnIndex(headers, [/requirement description/, /^requirement$/], 1);\n    const sourceIndex = getColumnIndex(headers, [/source/], 2);\n    const designIndex = getColumnIndex(headers, [/design/, /component/], 3);\n    const testIndex = getColumnIndex(headers, [/test case/], 4);\n\n    const coverageStatus = normalizeStatus(cells[cells.length - 1]);\n\n    rows.push({\n      coverageId: cells[reqIndex] || \u0027\u0027,\n      moduleRequirement: cells[requirementIndex] || \u0027\u0027,\n      sourceReference: cells[sourceIndex] || \u0027\u0027,\n      includedInOutput: cells[testIndex] || \u0027\u0027,\n      coverageStatus,\n      notes: cells[designIndex] || \u0027\u0027\n    });\n  }\n\n  return rows\n    .filter(row =\u003e row.coverageId || row.moduleRequirement)\n    .slice(0, 200);\n}\n\nfunction isSharedDocumentType(documentType) {\n  return [\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027].includes(documentType);\n}\n\nfunction hasConcreteChunkReference(value) {\n  return /chunkIds*:s*[A-Za-z0-9][A-Za-z0-9_.:-]{7,}/i.test(String(value || \u0027\u0027));\n}\n\nfunction isMetadataOnlyReference(value) {\n  const normalized = String(value || \u0027\u0027).trim().toLowerCase().replace(/[_-]+/g, \u0027 \u0027);\n  if (!normalized) return true;\n  const metadataLabels = new Set([\n    \u0027technical design\u0027, \u0027quality assurance\u0027, \u0027functional requirements\u0027, \u0027business requirements\u0027,\n    \u0027high level design\u0027, \u0027low level design\u0027, \u0027test plan document\u0027, \u0027test plan\u0027, \u0027transcript\u0027,\n    \u0027ui ux\u0027, \u0027api spec\u0027, \u0027data model\u0027, \u0027architecture\u0027, \u0027supporting document\u0027\n  ]);\n  return metadataLabels.has(normalized) || /^[a-z ]{3,32}$/.test(normalized) \u0026\u0026 !/chunkid|.pdf|.docx|.pptx|.md|.txt|.png|.webp/i.test(value);\n}\n\nfunction findEvidenceReferenceIssues(row, documentType) {\n  if (!isSharedDocumentType(documentType)) return [];\n  const ref = String(row.sourceReference || \u0027\u0027).trim();\n  const issues = [];\n  const broadReferencePattern = new RegExp(\u0027\\\\b(combined|and others|multiple|various|assorted)\\\\b\u0027, \u0027i\u0027);\n  const sourceCombinationPattern = new RegExp(\u0027\\\\b(BRD|FRD|HLD|LLD|TRANSCRIPT|TEST_PLAN|UI_UX|API_SPEC|DATA_MODEL|ARCHITECTURE)\\\\b\\\\s*[,\u0026+]\\\\s*\\\\b(BRD|FRD|HLD|LLD|TRANSCRIPT|TEST_PLAN|UI_UX|API_SPEC|DATA_MODEL|ARCHITECTURE)\\\\b\u0027, \u0027i\u0027);\n  if (!hasConcreteChunkReference(ref)) issues.push(\u0027missing concrete chunkId\u0027);\n  if (broadReferencePattern.test(ref)) issues.push(\u0027broad combined source reference\u0027);\n  if (sourceCombinationPattern.test(ref)) issues.push(\u0027source combination is not direct evidence\u0027);\n  if (ref.includes(\u0027...\u0027) || /ellipsis/i.test(ref)) issues.push(\u0027truncated source reference\u0027);\n  if (isMetadataOnlyReference(ref)) issues.push(\u0027metadata-only source reference\u0027);\n  return issues;\n}\n\nfunction enforceSharedLedgerEvidenceQuality(coverageLedger, documentType) {\n  if (!isSharedDocumentType(documentType)) return { ledger: coverageLedger, issues: [] };\n  const issues = [];\n  const ledger = coverageLedger.map(row =\u003e {\n    const rowIssues = findEvidenceReferenceIssues(row, documentType);\n    if (!rowIssues.length) return row;\n    const updated = { ...row };\n    issues.push({\n      coverageId: row.coverageId,\n      moduleRequirement: row.moduleRequirement,\n      sourceReference: row.sourceReference,\n      issues: rowIssues\n    });\n    if (updated.coverageStatus === \u0027covered\u0027) updated.coverageStatus = \u0027partial\u0027;\n    const note = rowIssues.join(\u0027; \u0027);\n    updated.notes = [updated.notes, \u0027Evidence review required: \u0027 + note].filter(Boolean).join(\u0027 | \u0027);\n    return updated;\n  });\n  return { ledger, issues };\n}\n\nfunction buildCoverageSummary(coverageLedger, documentType) {\n  const summary = {\n    version: \u0027coverage-ledger-v1\u0027,\n    mode: documentType === \u0027traceability_matrix\u0027 ? \u0027enforced\u0027 : \u0027dry_run\u0027,\n    coverageLedgerCount: coverageLedger.length,\n    coveredCount: 0,\n    partialCount: 0,\n    missingCount: 0,\n    excludedCount: 0,\n    unknownCount: 0,\n    blockingUncoveredCount: 0,\n    uncoveredCount: 0,\n    gateStatus: \u0027not_reported\u0027,\n    missingItems: [],\n    partialItems: [],\n    unknownItems: [],\n    warningItems: []\n  };\n\n  for (const row of coverageLedger) {\n    if (row.coverageStatus === \u0027covered\u0027) summary.coveredCount += 1;\n    else if (row.coverageStatus === \u0027partial\u0027) summary.partialCount += 1;\n    else if (row.coverageStatus === \u0027missing\u0027) summary.missingCount += 1;\n    else if (row.coverageStatus === \u0027excluded\u0027) summary.excludedCount += 1;\n    else summary.unknownCount += 1;\n  }\n\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.missingItems = coverageLedger\n    .filter(row =\u003e row.coverageStatus === \u0027missing\u0027)\n    .slice(0, 25)\n    .map(row =\u003e ({\n      coverageId: row.coverageId,\n      moduleRequirement: row.moduleRequirement,\n      coverageStatus: row.coverageStatus,\n      notes: row.notes\n    }));\n  summary.partialItems = coverageLedger\n    .filter(row =\u003e row.coverageStatus === \u0027partial\u0027)\n    .slice(0, 25)\n    .map(row =\u003e ({\n      coverageId: row.coverageId,\n      moduleRequirement: row.moduleRequirement,\n      coverageStatus: row.coverageStatus,\n      notes: row.notes\n    }));\n  summary.unknownItems = coverageLedger\n    .filter(row =\u003e row.coverageStatus === \u0027unknown\u0027)\n    .slice(0, 25)\n    .map(row =\u003e ({\n      coverageId: row.coverageId,\n      moduleRequirement: row.moduleRequirement,\n      coverageStatus: row.coverageStatus,\n      notes: row.notes\n    }));\n  summary.warningItems = coverageLedger\n    .filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus))\n    .slice(0, 25)\n    .map(row =\u003e ({\n      coverageId: row.coverageId,\n      moduleRequirement: row.moduleRequirement,\n      coverageStatus: row.coverageStatus,\n      notes: row.notes\n    }));\n\n  if (!coverageLedger.length) {\n    summary.gateStatus = documentType === \u0027traceability_matrix\u0027 ? \u0027failed\u0027 : \u0027not_reported\u0027;\n  } else if (summary.blockingUncoveredCount \u003e 0) {\n    summary.gateStatus = documentType === \u0027traceability_matrix\u0027 ? \u0027failed\u0027 : \u0027warning\u0027;\n  } else if (summary.partialCount \u003e 0) {\n    summary.gateStatus = \u0027warning\u0027;\n  } else {\n    summary.gateStatus = \u0027passed\u0027;\n  }\n\n  return summary;\n}\n\nconst wordCount = text.trim().split(/\\s+/).length;\nconst charCount = text.trim().length;\nconst jobId = $(\u0027Prompt Library\u0027).item.json.jobId;\nconst documentType = $(\u0027Prompt Library\u0027).item.json.documentType;\nconst systemPrompt = $(\u0027Prompt Library\u0027).item.json.system || \"\";\nconst userPrompt = $(\u0027Prompt Library\u0027).item.json.user || \"\";\nconst usageSource = tokensInput || tokensOutput ? \"provider_usage\" : \"estimated\";\n\nif (!tokensOutput) {\n  tokensOutput = Math.max(1, Math.ceil(charCount / 4));\n}\n\nif (!tokensInput) {\n  tokensInput = Math.max(1, Math.ceil((systemPrompt.length + userPrompt.length) / 4));\n}\n\nlet coverageLedger = extractCoverageLedger(text);\nif (!coverageLedger.length \u0026\u0026 documentType === \u0027traceability_matrix\u0027) {\n  coverageLedger = extractTraceabilityMatrixLedger(text);\n}\nconst evidenceAudit = enforceSharedLedgerEvidenceQuality(coverageLedger, documentType);\ncoverageLedger = evidenceAudit.ledger;\nconst coverageSummary = buildCoverageSummary(coverageLedger, documentType);\nif (evidenceAudit.issues.length) {\n  coverageSummary.evidenceQualityIssues = evidenceAudit.issues.slice(0, 25);\n  coverageSummary.gateStatus = coverageSummary.gateStatus === \u0027passed\u0027 ? \u0027warning\u0027 : coverageSummary.gateStatus;\n  coverageSummary.warningItems = coverageSummary.warningItems.concat(evidenceAudit.issues.slice(0, 25).map(issue =\u003e ({\n    coverageId: issue.coverageId,\n    moduleRequirement: issue.moduleRequirement,\n    coverageStatus: \u0027partial\u0027,\n    notes: \u0027Evidence reference needs review: \u0027 + issue.issues.join(\u0027; \u0027)\n  })));\n}\n\nconst INPUT_COST_PER_TOKEN = 0.40 / 1_000_000;\nconst OUTPUT_COST_PER_TOKEN = 1.60 / 1_000_000;\nconst estimatedCostUsd = (tokensInput * INPUT_COST_PER_TOKEN) + (tokensOutput * OUTPUT_COST_PER_TOKEN);\n\nreturn [\n  {\n    json: {\n      rawMarkdown: text,\n      wordCount,\n      charCount,\n      jobId,\n      tokensInput,\n      tokensOutput,\n      tokensTotal: tokensInput + tokensOutput,\n      estimatedCostUsd: parseFloat(estimatedCostUsd.toFixed(6)),\n      tokenUsage: {\n        source: usageSource,\n        input: tokensInput,\n        output: tokensOutput,\n        total: tokensInput + tokensOutput,\n        estimatedCostUsd: parseFloat(estimatedCostUsd.toFixed(6)),\n      },\n      coverageLedger,\n      coverageSummary,\n    }\n  }\n];"
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
- Version Number > 1? -> Merge6 (output 1, input 1)

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
