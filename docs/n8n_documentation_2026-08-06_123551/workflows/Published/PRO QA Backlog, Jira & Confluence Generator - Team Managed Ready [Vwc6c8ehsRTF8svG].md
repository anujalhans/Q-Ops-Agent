# PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | Vwc6c8ehsRTF8svG |
| Active | True |
| Created At | 2026-05-11T03:59:47.905Z |
| Updated At | 2026-06-09T19:06:22.087Z |
| Node Count | 47 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready [Vwc6c8ehsRTF8svG].json |

## Description

Professional Team Managed Jira backlog workflow with Jira search/reuse before create, stable idempotency labels, story parent linking, Confluence update/create, quality gate and token/cost metadata. Does not modify fullRetrievalD01.

## Trigger And Entry Contract

- When Executed by Another Workflow | n8n-nodes-base.executeWorkflowTrigger

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.agent | 1 |
| @n8n/n8n-nodes-langchain.embeddingsOpenAi | 1 |
| @n8n/n8n-nodes-langchain.lmChatOpenAi | 1 |
| @n8n/n8n-nodes-langchain.vectorStoreChromaDB | 2 |
| n8n-nodes-base.code | 24 |
| n8n-nodes-base.executeWorkflowTrigger | 1 |
| n8n-nodes-base.httpRequest | 9 |
| n8n-nodes-base.if | 4 |
| n8n-nodes-base.merge | 3 |
| n8n-nodes-base.stickyNote | 1 |

## Credentials Referenced

- chromaCloudApi: ChromaDB Self-Hosted account
- httpBasicAuth: JIRA
- openAiApi: OpenAi Paid Account (Aonu)

## Connection Graph

- When Executed by Another Workflow -> Normalize Team Managed Request (source output 0, target input 0)
- Normalize Team Managed Request -> Preflight Project Knowledge Search (source output 0, target input 0)
- Professional QA Backlog Generator -> Robust Backlog JSON Parser (source output 0, target input 0)
- Validate Team Managed Backlog -> Prepare Epic Search Items (source output 0, target input 0)
- Prepare Epic Search Items -> Search Existing Epic in Jira (source output 0, target input 0)
- Search Existing Epic in Jira -> Determine Epic Reuse Or Create (source output 0, target input 0)
- Determine Epic Reuse Or Create -> Epic Needs Create? (source output 0, target input 0)
- Epic Needs Create? -> Create Missing Epic in Jira (source output 0, target input 0)
- Epic Needs Create? -> Normalize Existing Epic Result (source output 1, target input 0)
- Create Missing Epic in Jira -> Normalize Created Epic Result (source output 0, target input 0)
- Normalize Created Epic Result -> Combine Epic Reuse And Create Results (source output 0, target input 0)
- Combine Epic Reuse And Create Results -> Collect Team Managed Epic Jira Map (source output 0, target input 0)
- Normalize Existing Epic Result -> Combine Epic Reuse And Create Results (source output 0, target input 1)
- Collect Team Managed Epic Jira Map -> Prepare Story Search Items (source output 0, target input 0)
- Prepare Story Search Items -> Search Existing Story in Jira (source output 0, target input 0)
- Search Existing Story in Jira -> Determine Story Reuse Or Create (source output 0, target input 0)
- Determine Story Reuse Or Create -> Story Needs Create? (source output 0, target input 0)
- Story Needs Create? -> Create Missing Story Linked to Epic (source output 0, target input 0)
- Story Needs Create? -> Normalize Existing Story Result (source output 1, target input 0)
- Create Missing Story Linked to Epic -> Normalize Created Story Result (source output 0, target input 0)
- Normalize Created Story Result -> Combine Story Reuse And Create Results (source output 0, target input 0)
- Combine Story Reuse And Create Results -> Summarize Team Managed Jira Results (source output 0, target input 0)
- Normalize Existing Story Result -> Combine Story Reuse And Create Results (source output 0, target input 1)
- Summarize Team Managed Jira Results -> Prepare Confluence Upsert (source output 0, target input 0)
- Prepare Confluence Upsert -> Search Existing Confluence Page (source output 0, target input 0)
- Search Existing Confluence Page -> Determine Confluence Update Or Create (source output 0, target input 0)
- Determine Confluence Update Or Create -> Confluence Page Exists? (source output 0, target input 0)
- Confluence Page Exists? -> Update Existing Confluence Page (source output 0, target input 0)
- Confluence Page Exists? -> Create Confluence Page (source output 1, target input 0)
- Update Existing Confluence Page -> Normalize Updated Confluence Page (source output 0, target input 0)
- Normalize Updated Confluence Page -> Combine Confluence Results (source output 0, target input 0)
- Combine Confluence Results -> Return Team Managed Professional Result (source output 0, target input 0)
- Create Confluence Page -> Normalize Created Confluence Page (source output 0, target input 0)
- Normalize Created Confluence Page -> Combine Confluence Results (source output 0, target input 1)
- Professional Prompt Library -> Backlog Delta Gate (source output 0, target input 0)
- Preflight Project Knowledge Search -> Check Chroma Retrieval Quality (source output 0, target input 0)
- Check Chroma Retrieval Quality -> Build Live Update Snapshot Request (source output 0, target input 0)
- Robust Backlog JSON Parser -> Validate Team Managed Backlog (source output 0, target input 0)
- Build Live Update Snapshot Request -> Search Live Jira Backlog (source output 0, target input 0)
- Search Live Jira Backlog -> Search Live Confluence Backlog (source output 0, target input 0)
- Search Live Confluence Backlog -> Build Live Update Context (source output 0, target input 0)
- Build Live Update Context -> Professional Prompt Library (source output 0, target input 0)
- Backlog Delta Gate -> Backlog Delta No Model? (source output 0, target input 0)
- Backlog Delta No Model? -> Build Backlog No-Model Result (source output 0, target input 0)
- Backlog Delta No Model? -> Professional QA Backlog Generator (source output 1, target input 0)
- Build Backlog No-Model Result -> Validate Team Managed Backlog (source output 0, target input 0)

## Nodes

### Backlog Delta Gate

| Field | Value |
| --- | --- |
| Node ID | 3870e52e-449f-4141-9055-c014f8616527 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 512, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Professional Prompt Library -> Backlog Delta Gate (output 0, input 0)

**Outgoing Connections**

- Backlog Delta Gate -> Backlog Delta No Model? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const request = $json || {};\nconst updateContext = request.updateContext \u0026\u0026 typeof request.updateContext === \u0027object\u0027 ? request.updateContext : {};\nconst updateMode = String(request.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027 || Boolean(updateContext.updateMode || updateContext.previousJobId);\nconst previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];\nconst previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];\nconst previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];\nconst previousCoverageSummary = updateContext.previousCoverageSummary || {};\nconst updateReasons = Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons.filter(Boolean) : [];\nconst status = String(previousCoverageSummary.gateStatus || previousCoverageSummary.status || \u0027\u0027).toLowerCase();\nconst rows = previousCoverageLedger.length || Number(previousCoverageSummary.coverageLedgerCount || 0) || 0;\nconst unresolved = previousCoverageLedger.filter(row =\u003e {\n  const value = String(row.coverageStatus || row.status || \u0027\u0027).toLowerCase();\n  return value.includes(\u0027partial\u0027) || value.includes(\u0027missing\u0027) || value.includes(\u0027unknown\u0027) || value.includes(\u0027gap\u0027) || value.includes(\u0027review\u0027);\n});\nconst previousCoverageClean = rows \u003e 0\n  \u0026\u0026 unresolved.length === 0\n  \u0026\u0026 ![\u0027warning\u0027, \u0027failed\u0027, \u0027not_reported\u0027].includes(status)\n  \u0026\u0026 (Number(previousCoverageSummary.missingCount) || 0) === 0\n  \u0026\u0026 (Number(previousCoverageSummary.partialCount) || 0) === 0\n  \u0026\u0026 (Number(previousCoverageSummary.unknownCount) || 0) === 0;\nconst sourceChanged = Boolean(updateContext.contextUpdated) || updateReasons.length \u003e 0;\n\nconst normalizeId = value =\u003e String(value || \u0027\u0027).trim().toUpperCase().replace(/_/g, \u0027-\u0027);\nconst expectedDeltaIds = Array.isArray(request.updateDeltaTargets?.requirementIds)\n  ? [...new Set(request.updateDeltaTargets.requirementIds.map(normalizeId).filter(Boolean))]\n  : [];\nconst previousSummary = updateContext.previousUpdateSummary \u0026\u0026 typeof updateContext.previousUpdateSummary === \u0027object\u0027\n  ? updateContext.previousUpdateSummary\n  : {};\nconst previousResolvedText = JSON.stringify({\n  deltaRequirementIds: previousSummary.deltaRequirementIds || [],\n  resolvedCoverageIds: previousSummary.resolvedCoverageIds || [],\n  unchangedCoverageIds: previousSummary.unchangedCoverageIds || [],\n  coverageLedger: previousCoverageLedger,\n  coverageSummary: previousCoverageSummary\n}).toUpperCase().replace(/_/g, \u0027-\u0027);\nconst missingExpectedDeltaIds = expectedDeltaIds.filter(id =\u003e !previousResolvedText.includes(id));\n\nconst noModelRequired = Boolean(\n  updateMode\n  \u0026\u0026 previousEpics.length\n  \u0026\u0026 previousStories.length\n  \u0026\u0026 previousCoverageClean\n  \u0026\u0026 !sourceChanged\n  \u0026\u0026 missingExpectedDeltaIds.length === 0\n);\n\nreturn [{ json: {\n  ...request,\n  backlogDeltaDecision: {\n    version: \u0027backlog-delta-gate-v2-expected-targets\u0027,\n    noModelRequired,\n    reason: noModelRequired\n      ? \u0027Previous live Jira/Confluence backlog coverage is complete and all detected delta target IDs are already accounted for.\u0027\n      : missingExpectedDeltaIds.length\n        ? \u0027Generation required because detected delta target IDs are not accounted for by the previous Backlog update.\u0027\n        : \u0027Generation required because coverage/source delta check is not clean.\u0027,\n    previousEpicCount: previousEpics.length,\n    previousStoryCount: previousStories.length,\n    previousCoverageRows: rows,\n    unresolvedCoverageRows: unresolved.length,\n    sourceChanged,\n    updateReasons,\n    expectedDeltaIds,\n    missingExpectedDeltaIds\n  }\n} }];"
}
```

### Backlog Delta No Model?

| Field | Value |
| --- | --- |
| Node ID | 76b0dc43-c938-4c39-9923-5f3df863c2e5 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 1216, -384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Backlog Delta Gate -> Backlog Delta No Model? (output 0, input 0)

**Outgoing Connections**

- Backlog Delta No Model? -> Build Backlog No-Model Result (output 0, input 0)
- Backlog Delta No Model? -> Professional QA Backlog Generator (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "conditions":  {
                       "combinator":  "and",
                       "options":  {
                                       "caseSensitive":  true,
                                       "leftValue":  "",
                                       "typeValidation":  "strict",
                                       "version":  3
                                   },
                       "conditions":  [
                                          {
                                              "leftValue":  "={{ Boolean($json.backlogDeltaDecision?.noModelRequired) }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ]
                   },
    "options":  {

                }
}
```

### Build Backlog No-Model Result

| Field | Value |
| --- | --- |
| Node ID | 6faa782b-c788-4813-a704-ab8f9aebac90 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1504, -96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Backlog Delta No Model? -> Build Backlog No-Model Result (output 0, input 0)

**Outgoing Connections**

- Build Backlog No-Model Result -> Validate Team Managed Backlog (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const request = $json || {};\nconst updateContext = request.updateContext \u0026\u0026 typeof request.updateContext === \u0027object\u0027 ? request.updateContext : {};\nconst previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];\nconst previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];\nconst rawPreviousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];\nfunction isBacklogCoverageLedgerRow(row) {\n  const id = String(row?.coverageId || \u0027\u0027).trim();\n  const module = String(row?.moduleRequirement || row?.requirement || \u0027\u0027).trim();\n  const status = String(row?.coverageStatus || row?.status || \u0027\u0027).trim().toLowerCase();\n  const notes = String(row?.notes || \u0027\u0027).trim().toLowerCase();\n  if (!id) return false;\n  if (/^(coverage id|batch id)$/i.test(id)) return false;\n  if (/^batch[-_\\s]/i.test(id)) return false;\n  if (/^module$/i.test(module)) return false;\n  if (/^status$/i.test(status)) return false;\n  if (notes === \u0027coverage ids\u0027) return false;\n  return /(covered|partial|missing|excluded|review|gap|not covered|unknown)/i.test(status);\n}\nfunction normalizeCoverageKey(value) {\n  return String(value || \u0027\u0027).trim().toUpperCase();\n}\nfunction cleanMappedIds(value) {\n  const values = Array.isArray(value)\n    ? value\n    : value === null || value === undefined\n      ? []\n      : String(value).split(/[;,]/);\n  return [...new Set(values\n    .map(item =\u003e String(item || \u0027\u0027).trim())\n    .filter(item =\u003e item \u0026\u0026 !/^(no|n\\/a|na|none|null|undefined|-|not applicable|not mapped)$/i.test(item))\n  )];\n}\nfunction rowMappingScore(row) {\n  return cleanMappedIds(row?.mappedEpicIds || row?.epicCorrelationIds || row?.epicIds || row?.epics || row?.epicId || row?.epicCorrelationId).length\n    + cleanMappedIds(row?.mappedStoryIds || row?.storyCorrelationIds || row?.storyIds || row?.userStoryIds || row?.stories || row?.storyId || row?.storyCorrelationId).length;\n}\nfunction cleanBacklogCoverageLedger(rows) {\n  const byCoverageId = new Map();\n  for (const row of rows) {\n    if (!row || typeof row !== \u0027object\u0027) continue;\n    const cleaned = {\n      ...row,\n      coverageId: String(row.coverageId || row.id || row.requirementId || \u0027\u0027).trim(),\n      coverageStatus: row.coverageStatus || row.status || row.coverage || \u0027covered\u0027,\n      mappedEpicIds: cleanMappedIds(row.mappedEpicIds || row.epicCorrelationIds || row.epicIds || row.epics || row.epicId || row.epicCorrelationId),\n      mappedStoryIds: cleanMappedIds(row.mappedStoryIds || row.storyCorrelationIds || row.storyIds || row.userStoryIds || row.stories || row.storyId || row.storyCorrelationId),\n    };\n    const key = normalizeCoverageKey(cleaned.coverageId);\n    if (!key) continue;\n    const existing = byCoverageId.get(key);\n    if (!existing || rowMappingScore(cleaned) \u003e rowMappingScore(existing)) {\n      byCoverageId.set(key, cleaned);\n      continue;\n    }\n    if (existing) {\n      existing.mappedEpicIds = [...new Set([...cleanMappedIds(existing.mappedEpicIds), ...cleaned.mappedEpicIds])];\n      existing.mappedStoryIds = [...new Set([...cleanMappedIds(existing.mappedStoryIds), ...cleaned.mappedStoryIds])];\n      existing.notes = String(existing.notes || \u0027\u0027).trim() || String(cleaned.notes || \u0027\u0027).trim();\n      existing.sourceReference = String(existing.sourceReference || \u0027\u0027).trim() || String(cleaned.sourceReference || \u0027\u0027).trim();\n    }\n  }\n  return Array.from(byCoverageId.values());\n}\nconst previousCoverageLedger = cleanBacklogCoverageLedger(rawPreviousCoverageLedger.filter(isBacklogCoverageLedgerRow));\nconst previousCoverageSummary = updateContext.previousCoverageSummary || {};\nconst previousTokenUsage = updateContext.previousTokenUsage || {};\nconst baselineTokens = Number(previousTokenUsage.total || previousTokenUsage.tokensTotal || 0) || 0;\nconst baselineCost = Number(previousTokenUsage.estimatedCostUsd || previousTokenUsage.estimated_cost_usd || 0) || 0;\nconst currentTokens = 0;\nconst currentCost = 0;\nconst byEpic = new Map();\nfor (const epic of previousEpics) {\n  const key = String(epic.epicCorrelationId || epic.epicId || epic.jiraEpicKey || epic.key || epic.epicName || \u0027\u0027).trim();\n  if (!key) continue;\n  byEpic.set(key, { ...epic, action: epic.action || \u0027reused\u0027, stories: [] });\n}\nconst firstEpic = byEpic.values().next().value || null;\nfor (const story of previousStories) {\n  const parentKey = String(story.parentEpicCorrelationId || story.epicCorrelationId || story.epicId || story.parentEpicKey || \u0027\u0027).trim();\n  const target = byEpic.get(parentKey) || firstEpic;\n  if (target) target.stories.push({ ...story, action: story.action || \u0027reused\u0027 });\n}\nconst epics = Array.from(byEpic.values());\nconst sourceCoverage = previousCoverageLedger.map(row =\u003e ({\n  source: row.sourceReference || \u0027Previous coverage ledger\u0027,\n  coverageId: row.coverageId || \u0027\u0027,\n  status: row.coverageStatus || row.status || \u0027covered\u0027,\n  moduleRequirement: row.moduleRequirement || row.requirement || \u0027\u0027\n}));\nconst generated = {\n  document: {\n    title: \u0027Professional QA Backlog\u0027,\n    summary: \u0027No backlog changes were needed. Existing Jira epics and stories were reused from the live project state.\u0027,\n    coverageLedger: previousCoverageLedger,\n    sourceCoverage,\n    retrievalEvidence: sourceCoverage.slice(0, 50),\n    batchPlan: { modules: [] },\n    batchResults: {\n      totalBatches: 0,\n      completedBatches: 0,\n      partialBatches: 0,\n      retryingBatches: 0,\n      recoveredBatches: 0,\n      missingBatches: 0,\n      batches: []\n    },\n    updateSummary: {\n      enabled: true,\n      version: \u0027backlog-delta-update-v1\u0027,\n      documentType: \u0027user_stories\u0027,\n      mode: \u0027update\u0027,\n      deltaMode: true,\n      noChangesDetected: true,\n      noModelRequired: true,\n      updateOfJobId: updateContext.previousJobId || request.updateOfJobId || null,\n      reusedEpicCount: previousEpics.length,\n      reusedStoryCount: previousStories.length,\n      createdEpicCount: 0,\n      createdStoryCount: 0,\n      updatedEpicCount: 0,\n      updatedStoryCount: 0,\n      resolvedCoverageIds: [],\n      unchangedCoverageIds: previousCoverageLedger.map(row =\u003e row.coverageId).filter(Boolean),\n      tokenUsage: { source: \u0027no_model_delta_gate\u0027, input: currentTokens, output: 0, total: currentTokens, estimatedCostUsd: currentCost },\n      previousTokenUsage,\n      tokenSavings: {\n        estimatedBaselineTokens: baselineTokens || null,\n        estimatedTokensSaved: baselineTokens ? Math.max(0, baselineTokens - currentTokens) : 0,\n        estimatedBaselineCostUsd: baselineCost || null,\n        estimatedCostSavedUsd: baselineCost ? Math.max(0, baselineCost - currentCost) : 0,\n        estimatedSavingsPercent: baselineTokens ? Math.round(((baselineTokens - currentTokens) / baselineTokens) * 100) : null\n      },\n      message: \u0027Live Jira and Confluence already cover the current backlog. Q-Ops reused existing epics and stories without invoking the backlog model.\u0027\n    }\n  },\n  epics\n};\nreturn [{ json: { output: generated } }];"
}
```

### Build Live Update Context

| Field | Value |
| --- | --- |
| Node ID | dad4ef8f-7389-49d6-8996-4137c825138c |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 848, -176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search Live Confluence Backlog -> Build Live Update Context (output 0, input 0)

**Outgoing Connections**

- Build Live Update Context -> Professional Prompt Library (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst root = $(\u0027Build Live Update Snapshot Request\u0027).first().json;\nconst jiraResponse = $(\u0027Search Live Jira Backlog\u0027).first().json || {};\nconst confluenceResponse = $(\u0027Search Live Confluence Backlog\u0027).first().json || {};\nconst originalUpdateContext = root.updateContext \u0026\u0026 typeof root.updateContext === \u0027object\u0027 ? root.updateContext : {};\n\nconst clean = value =\u003e String(value ?? \u0027\u0027).replace(/\\r/g, \u0027\u0027).trim();\nconst normalizeKey = value =\u003e clean(value).toLowerCase().replace(/[^a-z0-9]+/g, \u0027\u0027);\nconst array = value =\u003e Array.isArray(value) ? value : [];\n\nfunction adfText(node) {\n  if (!node) return \u0027\u0027;\n  if (typeof node === \u0027string\u0027) return node;\n  if (Array.isArray(node)) return node.map(adfText).filter(Boolean).join(\u0027\\n\u0027);\n  if (typeof node !== \u0027object\u0027) return \u0027\u0027;\n  const own = typeof node.text === \u0027string\u0027 ? node.text : \u0027\u0027;\n  const children = Array.isArray(node.content) ? node.content.map(adfText).filter(Boolean).join(node.type === \u0027paragraph\u0027 || node.type === \u0027heading\u0027 ? \u0027\\n\u0027 : \u0027 \u0027) : \u0027\u0027;\n  return [own, children].filter(Boolean).join(own \u0026\u0026 children ? \u0027 \u0027 : \u0027\u0027);\n}\n\nfunction stableLabel(labels, kind) {\n  return array(labels).find(label =\u003e normalizeKey(label).includes(kind === \u0027epic\u0027 ? \u0027epic\u0027 : \u0027story\u0027) \u0026\u0026 normalizeKey(label).includes(\u0027qops\u0027)) || \u0027\u0027;\n}\n\nfunction correlationFromLabel(label, kind) {\n  const lower = String(label || \u0027\u0027).toLowerCase();\n  const marker = kind === \u0027epic\u0027 ? \u0027-epic-\u0027 : \u0027-story-\u0027;\n  const index = lower.indexOf(marker);\n  if (index \u003c 0) return \u0027\u0027;\n  return lower.slice(index + marker.length).replace(/-/g, \u0027 \u0027).trim().toUpperCase().replace(/\\s+/g, \u0027-\u0027);\n}\n\nfunction extractLines(text, heading) {\n  const lines = clean(text).split(/\\n+/).map(line =\u003e line.replace(/^[-*]\\s*/, \u0027\u0027).trim()).filter(Boolean);\n  const start = lines.findIndex(line =\u003e normalizeKey(line).includes(normalizeKey(heading)));\n  if (start \u003c 0) return [];\n  const result = [];\n  for (const line of lines.slice(start + 1)) {\n    if (/^[A-Z][A-Za-z /\u0026-]{2,40}:?$/.test(line) \u0026\u0026 !/^given|when|then/i.test(line)) break;\n    result.push(line.replace(/^\\d+[.)]\\s*/, \u0027\u0027).trim());\n    if (result.length \u003e= 12) break;\n  }\n  return result.filter(Boolean);\n}\n\nfunction issueType(issue) {\n  return clean(issue?.fields?.issuetype?.name).toLowerCase();\n}\n\nfunction isEpic(issue) {\n  const type = issueType(issue);\n  if (type) return type === \u0027epic\u0027;\n  const labels = array(issue?.fields?.labels).map(normalizeKey);\n  return labels.some(label =\u003e label.includes(\u0027epic\u0027)) \u0026\u0026 !labels.some(label =\u003e label.includes(\u0027story\u0027));\n}\n\nfunction isStory(issue) {\n  const type = issueType(issue);\n  if (type) return type === \u0027story\u0027 || type === \u0027user story\u0027 || type === \u0027task\u0027;\n  const labels = array(issue?.fields?.labels).map(normalizeKey);\n  return labels.some(label =\u003e label.includes(\u0027story\u0027));\n}\n\nconst issues = array(jiraResponse.issues);\nconst epics = issues.filter(isEpic);\nconst stories = issues.filter(isStory);\nconst epicByKey = new Map();\n\nconst previousEpics = epics.map(issue =\u003e {\n  const labels = array(issue.fields?.labels);\n  const stable = stableLabel(labels, \u0027epic\u0027);\n  const correlation = correlationFromLabel(stable, \u0027epic\u0027) || clean(issue.key);\n  const description = adfText(issue.fields?.description);\n  const item = {\n    jiraEpicKey: issue.key || null,\n    jiraEpicId: issue.id || null,\n    epicName: clean(issue.fields?.summary) || issue.key,\n    epicSummary: description || clean(issue.fields?.summary),\n    businessOutcome: description || clean(issue.fields?.summary),\n    epicCorrelationId: correlation,\n    stableLabel: stable || null,\n    sourceReferences: [\u0027Live Jira epic \u0027 + issue.key],\n    action: \u0027reused\u0027\n  };\n  epicByKey.set(issue.key, item);\n  return item;\n});\n\nconst previousStories = stories.map(issue =\u003e {\n  const labels = array(issue.fields?.labels);\n  const stable = stableLabel(labels, \u0027story\u0027);\n  const correlation = correlationFromLabel(stable, \u0027story\u0027) || clean(issue.key);\n  const parentKey = clean(issue.fields?.parent?.key);\n  const parentEpic = epicByKey.get(parentKey);\n  const description = adfText(issue.fields?.description);\n  const acceptanceCriteria = extractLines(description, \u0027Acceptance Criteria\u0027);\n  return {\n    storyKey: issue.key || null,\n    jiraStoryKey: issue.key || null,\n    storyId: issue.id || null,\n    jiraStoryId: issue.id || null,\n    summary: clean(issue.fields?.summary) || issue.key,\n    parentEpicKey: parentKey || null,\n    parentEpicCorrelationId: parentEpic?.epicCorrelationId || parentKey || null,\n    storyCorrelationId: correlation,\n    userStory: description || clean(issue.fields?.summary),\n    userStoryDescription: description || clean(issue.fields?.summary),\n    businessContext: description || clean(issue.fields?.summary),\n    acceptanceCriteria: acceptanceCriteria.length ? acceptanceCriteria : [\u0027Retain the existing acceptance criteria from Jira issue \u0027 + issue.key + \u0027.\u0027],\n    sourceReferences: [\u0027Live Jira story \u0027 + issue.key],\n    stableLabel: stable || null,\n    action: \u0027reused\u0027\n  };\n});\n\nconst confluencePage = array(confluenceResponse.results)[0] || null;\nconst confluenceBody = clean(confluencePage?.body?.storage?.value);\nconst coverageRows = [];\nif (confluenceBody) {\n  const rowMatches = confluenceBody.match(/\u003ctr[\\s\\S]*?\u003c\\/tr\u003e/gi) || [];\n  for (const row of rowMatches) {\n    const cells = [...row.matchAll(/\u003ct[dh][^\u003e]*\u003e([\\s\\S]*?)\u003c\\/t[dh]\u003e/gi)].map(match =\u003e clean(match[1].replace(/\u003c[^\u003e]+\u003e/g, \u0027 \u0027)));\n    if (cells.length \u003e= 3 \u0026\u0026 !/coverage id/i.test(cells[0])) {\n      coverageRows.push({\n        coverageId: cells[0],\n        moduleRequirement: cells[1] || \u0027\u0027,\n        coverageStatus: cells[2] || \u0027unknown\u0027,\n        mappedEpicIds: cells[3] ? cells[3].split(\u0027,\u0027).map(clean).filter(Boolean) : [],\n        mappedStoryIds: cells[3] ? cells[3].split(\u0027,\u0027).map(clean).filter(Boolean) : [],\n        notes: cells[4] || \u0027\u0027,\n        sourceReference: \u0027Live Confluence page \u0027 + (confluencePage?.id || \u0027\u0027)\n      });\n    }\n  }\n}\n\nfunction isBacklogCoverageLedgerRow(row) {\n  const id = clean(row?.coverageId);\n  const module = clean(row?.moduleRequirement);\n  const status = clean(row?.coverageStatus || row?.status).toLowerCase();\n  const notes = clean(row?.notes).toLowerCase();\n  if (!id) return false;\n  if (/^(coverage id|batch id)$/i.test(id)) return false;\n  if (/^batch[-_\\s]/i.test(id)) return false;\n  if (/^module$/i.test(module)) return false;\n  if (/^status$/i.test(status)) return false;\n  if (notes === \u0027coverage ids\u0027) return false;\n  return /(covered|partial|missing|excluded|review|gap|not covered|unknown)/i.test(status);\n}\n\nconst validCoverageRows = coverageRows.filter(isBacklogCoverageLedgerRow);\n\nconst liveUpdateContext = root.updateMode ? {\n  ...originalUpdateContext,\n  updateSourceOfTruth: \u0027jira_confluence_live\u0027,\n  liveHydrationRequired: true,\n  liveHydratedAt: new Date().toISOString(),\n  previousConfluencePageId: confluencePage?.id || originalUpdateContext.previousConfluencePageId || null,\n  previousConfluenceUrl: confluencePage?._links?.webui ? String(root.confluenceBaseUrl || \u0027\u0027).replace(/\\/$/, \u0027\u0027) + confluencePage._links.webui : null,\n  previousEpics,\n  previousStories,\n  previousCoverageLedger: validCoverageRows,\n  previousCoverageSummary: {\n    coverageLedgerCount: validCoverageRows.length,\n    coveredCount: validCoverageRows.filter(row =\u003e /cover/i.test(row.coverageStatus)).length,\n    partialCount: validCoverageRows.filter(row =\u003e /partial|review/i.test(row.coverageStatus)).length,\n    missingCount: validCoverageRows.filter(row =\u003e /missing|gap|unknown/i.test(row.coverageStatus)).length\n  },\n  liveSnapshot: {\n    jiraIssueCount: issues.length,\n    epicCount: previousEpics.length,\n    storyCount: previousStories.length,\n    confluencePageFound: Boolean(confluencePage?.id),\n    confluenceCoverageRows: validCoverageRows.length\n  }\n} : originalUpdateContext;\n\nreturn [{\n  json: {\n    ...root,\n    updateContext: liveUpdateContext,\n    liveUpdateSnapshot: liveUpdateContext.liveSnapshot || null\n  }\n}];\n"
}
```

### Build Live Update Snapshot Request

| Field | Value |
| --- | --- |
| Node ID | 61c3d3e9-e86b-44c5-ae0d-df3ffab1a75e |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 208, -176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Check Chroma Retrieval Quality -> Build Live Update Snapshot Request (output 0, input 0)

**Outgoing Connections**

- Build Live Update Snapshot Request -> Search Live Jira Backlog (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst root = $json;\nconst labelSafe = value =\u003e String(value || \u0027\u0027).toLowerCase().replace(/[^a-z0-9-]/g, \u0027-\u0027).replace(/-+/g, \u0027-\u0027).replace(/^-|-$/g, \u0027\u0027).slice(0, 60);\nconst projectKey = String(root.jiraProjectKey || \u0027\u0027).trim();\nconst jiraBaseUrl = String(root.jiraBaseUrl || \u0027https://anujalhans1.atlassian.net\u0027).replace(/\\/$/, \u0027\u0027);\nconst confluenceBaseUrl = String(root.confluenceBaseUrl || \u0027https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, \u0027\u0027);\nconst title = \u0027Professional QA Backlog - \u0027 + (root.projectName || \u0027Unknown Project\u0027);\nconst liveJiraBacklogJql = projectKey\n  ? \u0027project = \u0027 + projectKey + \u0027 AND labels = \"qops-generated\" AND labels = \"qops-pro\" ORDER BY updated DESC\u0027\n  : \u0027\u0027;\nreturn [{\n  json: {\n    ...root,\n    updateContext: root.updateMode ? {\n      ...(root.updateContext || {}),\n      liveHydrationRequired: true,\n      updateSourceOfTruth: \u0027jira_confluence_live\u0027\n    } : (root.updateContext || {}),\n    jiraBaseUrl,\n    confluenceBaseUrl,\n    liveJiraBacklogJql,\n    liveConfluenceTitle: title,\n    liveProjectLabelPrefix: labelSafe((root.idempotencyLabelPrefix || \u0027qops\u0027) + \u0027-\u0027 + projectKey)\n  }\n}];\n"
}
```

### Check Chroma Retrieval Quality

| Field | Value |
| --- | --- |
| Node ID | 642606d0-8925-4b6b-a6ac-e566ed1e1308 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 0, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Preflight Project Knowledge Search -> Check Chroma Retrieval Quality (output 0, input 0)

**Outgoing Connections**

- Check Chroma Retrieval Quality -> Build Live Update Snapshot Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst docs = $input.all();\nconst root = $(\u0027Normalize Team Managed Request\u0027).first().json;\n\nconst normalizeKey = value =\u003e String(value || \u0027\u0027).trim().toUpperCase().replace(/[^A-Z0-9]+/g, \u0027_\u0027).replace(/^_+|_+$/g, \u0027\u0027);\nconst normalizeDocRequest = value =\u003e String(value || \u0027qa_document\u0027).trim().toLowerCase().replace(/[^a-z0-9]+/g, \u0027_\u0027).replace(/^_+|_+$/g, \u0027\u0027) || \u0027qa_document\u0027;\nconst arrayUnique = values =\u003e [...new Set(values.filter(Boolean))];\nconst textIncludes = (text, terms) =\u003e terms.some(term =\u003e String(text || \u0027\u0027).toLowerCase().includes(String(term).toLowerCase()));\nconst metaValue = (metadata, names, fallback = \u0027\u0027) =\u003e {\n  for (const name of names) {\n    if (metadata[name] !== undefined \u0026\u0026 metadata[name] !== null \u0026\u0026 String(metadata[name]).trim() !== \u0027\u0027) return metadata[name];\n  }\n  return fallback;\n};\n\nconst retrievalProfiles = {\n  user_stories: {\n    label: \u0027Epics and User Stories\u0027,\n    intent: \u0027Build implementation-ready Agile epics and stories grounded in business, functional, UI, integration, validation, NFR, and stakeholder evidence.\u0027,\n    primaryDocTypes: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027PRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027TRANSCRIPT\u0027],\n    secondaryDocTypes: [\u0027HLD\u0027, \u0027LLD\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027, \u0027ARCHITECTURE\u0027, \u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027, \u0027SUPPORTING\u0027],\n    preferredCategories: [\u0027business_requirements\u0027, \u0027functional_requirements\u0027, \u0027user_experience\u0027, \u0027stakeholder_conversation\u0027, \u0027technical_design\u0027, \u0027quality_assurance\u0027],\n    preferredArtifacts: [\u0027business_requirements_document\u0027, \u0027functional_requirements_document\u0027, \u0027product_requirements_document\u0027, \u0027software_requirements_specification\u0027, \u0027ui_ux_artifact\u0027, \u0027meeting_transcript\u0027, \u0027api_specification\u0027, \u0027data_model\u0027],\n    preferredContentSources: [\u0027text\u0027, \u0027image\u0027],\n    sectionKeywords: [\u0027requirement\u0027, \u0027business rule\u0027, \u0027user journey\u0027, \u0027workflow\u0027, \u0027process\u0027, \u0027screen\u0027, \u0027validation\u0027, \u0027acceptance\u0027, \u0027integration\u0027, \u0027api\u0027, \u0027nfr\u0027, \u0027exception\u0027, \u0027error\u0027],\n    evidenceGroups: {\n      business: [\u0027BRD\u0027, \u0027PRD\u0027, \u0027TRANSCRIPT\u0027],\n      functional: [\u0027FRD\u0027, \u0027SRS\u0027],\n      experience: [\u0027UI_UX\u0027],\n      technical: [\u0027HLD\u0027, \u0027LLD\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027, \u0027ARCHITECTURE\u0027],\n      quality: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n      supporting: [\u0027SUPPORTING\u0027]\n    }\n  },\n  test_cases: {\n    label: \u0027Test Scenarios and Test Cases\u0027,\n    intent: \u0027Prioritize acceptance criteria, validation rules, UI behavior, integration behavior, edge cases, and negative scenarios.\u0027,\n    primaryDocTypes: [\u0027FRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n    secondaryDocTypes: [\u0027BRD\u0027, \u0027PRD\u0027, \u0027TRANSCRIPT\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027],\n    preferredCategories: [\u0027functional_requirements\u0027, \u0027user_experience\u0027, \u0027quality_assurance\u0027, \u0027business_requirements\u0027, \u0027technical_design\u0027],\n    preferredArtifacts: [\u0027functional_requirements_document\u0027, \u0027software_requirements_specification\u0027, \u0027ui_ux_artifact\u0027, \u0027test_cases\u0027, \u0027test_plan\u0027, \u0027api_specification\u0027],\n    preferredContentSources: [\u0027text\u0027, \u0027image\u0027],\n    sectionKeywords: [\u0027acceptance\u0027, \u0027validation\u0027, \u0027field\u0027, \u0027error\u0027, \u0027exception\u0027, \u0027edge\u0027, \u0027negative\u0027, \u0027precondition\u0027, \u0027expected result\u0027, \u0027test\u0027, \u0027scenario\u0027, \u0027api\u0027],\n    evidenceGroups: {\n      acceptance: [\u0027FRD\u0027, \u0027SRS\u0027],\n      experience: [\u0027UI_UX\u0027],\n      quality: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n      technical: [\u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027],\n      business: [\u0027BRD\u0027, \u0027PRD\u0027, \u0027TRANSCRIPT\u0027]\n    }\n  },\n  rtm: {\n    label: \u0027Requirement Traceability Matrix\u0027,\n    intent: \u0027Prioritize requirement IDs, source requirements, acceptance criteria, business rules, and test coverage evidence.\u0027,\n    primaryDocTypes: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027PRD\u0027, \u0027SRS\u0027],\n    secondaryDocTypes: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027, \u0027UI_UX\u0027, \u0027API_SPEC\u0027, \u0027TRANSCRIPT\u0027],\n    preferredCategories: [\u0027business_requirements\u0027, \u0027functional_requirements\u0027, \u0027quality_assurance\u0027, \u0027user_experience\u0027, \u0027technical_design\u0027],\n    preferredArtifacts: [\u0027business_requirements_document\u0027, \u0027functional_requirements_document\u0027, \u0027software_requirements_specification\u0027, \u0027test_cases\u0027, \u0027test_plan\u0027],\n    preferredContentSources: [\u0027text\u0027],\n    sectionKeywords: [\u0027requirement\u0027, \u0027req\u0027, \u0027acceptance\u0027, \u0027traceability\u0027, \u0027business rule\u0027, \u0027coverage\u0027, \u0027test case\u0027, \u0027test scenario\u0027],\n    evidenceGroups: {\n      requirements: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027PRD\u0027, \u0027SRS\u0027],\n      tests: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n      experience: [\u0027UI_UX\u0027],\n      technical: [\u0027API_SPEC\u0027],\n      stakeholder: [\u0027TRANSCRIPT\u0027]\n    }\n  },\n  technical_design: {\n    label: \u0027Technical Design\u0027,\n    intent: \u0027Prioritize architecture, API, database, integration, sequence, component, security, performance, and deployment evidence.\u0027,\n    primaryDocTypes: [\u0027HLD\u0027, \u0027LLD\u0027, \u0027ARCHITECTURE\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027],\n    secondaryDocTypes: [\u0027FRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027BRD\u0027, \u0027TRANSCRIPT\u0027],\n    preferredCategories: [\u0027technical_design\u0027, \u0027functional_requirements\u0027, \u0027user_experience\u0027],\n    preferredArtifacts: [\u0027high_level_design\u0027, \u0027low_level_design\u0027, \u0027architecture_document\u0027, \u0027api_specification\u0027, \u0027data_model\u0027],\n    preferredContentSources: [\u0027text\u0027, \u0027image\u0027],\n    sectionKeywords: [\u0027architecture\u0027, \u0027api\u0027, \u0027database\u0027, \u0027integration\u0027, \u0027sequence\u0027, \u0027component\u0027, \u0027security\u0027, \u0027performance\u0027, \u0027scalability\u0027, \u0027deployment\u0027, \u0027nfr\u0027],\n    evidenceGroups: {\n      architecture: [\u0027HLD\u0027, \u0027ARCHITECTURE\u0027],\n      detailedDesign: [\u0027LLD\u0027],\n      integrations: [\u0027API_SPEC\u0027],\n      data: [\u0027DATA_MODEL\u0027],\n      requirements: [\u0027FRD\u0027, \u0027SRS\u0027, \u0027BRD\u0027]\n    }\n  },\n  qa_document: {\n    label: \u0027General QA Document\u0027,\n    intent: \u0027Prioritize requirements, validation, acceptance criteria, risks, assumptions, tests, UI, integrations, and NFR evidence.\u0027,\n    primaryDocTypes: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n    secondaryDocTypes: [\u0027PRD\u0027, \u0027TRANSCRIPT\u0027, \u0027HLD\u0027, \u0027LLD\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027],\n    preferredCategories: [\u0027business_requirements\u0027, \u0027functional_requirements\u0027, \u0027quality_assurance\u0027, \u0027user_experience\u0027, \u0027technical_design\u0027],\n    preferredArtifacts: [\u0027business_requirements_document\u0027, \u0027functional_requirements_document\u0027, \u0027test_cases\u0027, \u0027test_plan\u0027, \u0027ui_ux_artifact\u0027],\n    preferredContentSources: [\u0027text\u0027, \u0027image\u0027],\n    sectionKeywords: [\u0027requirement\u0027, \u0027validation\u0027, \u0027acceptance\u0027, \u0027test\u0027, \u0027scenario\u0027, \u0027risk\u0027, \u0027assumption\u0027, \u0027dependency\u0027, \u0027integration\u0027, \u0027nfr\u0027],\n    evidenceGroups: {\n      requirements: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027SRS\u0027, \u0027PRD\u0027],\n      quality: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n      experience: [\u0027UI_UX\u0027],\n      technical: [\u0027HLD\u0027, \u0027LLD\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027],\n      stakeholder: [\u0027TRANSCRIPT\u0027]\n    }\n  }\n};\n\nconst requestProfileKey = normalizeDocRequest(root.retrievalProfileKey || root.documentType || \u0027qa_document\u0027);\nconst profile = retrievalProfiles[requestProfileKey] || retrievalProfiles.qa_document;\n\nconst BACKLOG_DELTA_SEMANTIC_V1_RETRIEVAL = true;\nconst BACKLOG_DELTA_SEMANTIC_V2_RETRIEVAL = true;\nconst updateMode = String(root.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027 || Boolean(root.updateMode || root.updateContext?.updateMode || root.updateOfJobId);\nconst backlogUpdateMode = updateMode \u0026\u0026 requestProfileKey === \u0027user_stories\u0027;\nconst deltaTerms = [\n  \u0027supporting\u0027, \u0027delta\u0027, \u0027addendum\u0027, \u0027change request\u0027, \u0027change log\u0027, \u0027new requirement\u0027,\n  \u0027new scope\u0027, \u0027enhancement\u0027, \u0027supplement\u0027, \u0027coverage gap\u0027, \u0027gap closure\u0027, \u0027updated requirement\u0027,\n  \u0027loyalty\u0027, \u0027wallet\u0027, \u0027store credit\u0027, \u0027marketplace\u0027, \u0027split shipment\u0027, \u0027fraud\u0027,\n  \u0027privacy\u0027, \u0027compliance\u0027, \u0027support operation\u0027, \u0027support ops\u0027\n];\nconst hasRequirementId = text =\u003e /\\b[A-Z]{2,10}[-_][A-Z0-9]{2,12}[-_]\\d{2,}\\b/.test(String(text || \u0027\u0027).toUpperCase());\nconst sourceTextForDelta = (metadata, text = \u0027\u0027) =\u003e [\n  metaValue(metadata, [\u0027source\u0027, \u0027fileName\u0027, \u0027filename\u0027, \u0027file_name\u0027], \u0027\u0027),\n  metaValue(metadata, [\u0027docType\u0027, \u0027documentType\u0027, \u0027document_type\u0027], \u0027\u0027),\n  metaValue(metadata, [\u0027documentCategory\u0027], \u0027\u0027),\n  metaValue(metadata, [\u0027artifactType\u0027], \u0027\u0027),\n  metaValue(metadata, [\u0027sectionTitle\u0027, \u0027section\u0027, \u0027title\u0027, \u0027heading\u0027], \u0027\u0027),\n  String(text || \u0027\u0027).slice(0, 2200)\n].join(\u0027 | \u0027);\nfunction backlogDeltaPriority(metadata, text = \u0027\u0027) {\n  const haystack = sourceTextForDelta(metadata, text).toLowerCase();\n  const sourceName = String(metaValue(metadata, [\u0027source\u0027, \u0027fileName\u0027, \u0027filename\u0027, \u0027file_name\u0027], \u0027\u0027)).toLowerCase();\n  const docType = normalizeKey(metaValue(metadata, [\u0027docType\u0027, \u0027documentType\u0027, \u0027document_type\u0027]));\n  const supportingSource = /supporting|addendum|delta/.test(sourceName);\n  const explicitRequirement = hasRequirementId(haystack);\n  if (docType === \u0027SUPPORTING\u0027) return 300;\n  if (supportingSource \u0026\u0026 explicitRequirement) return 280;\n  if (supportingSource) return 240;\n  if (explicitRequirement \u0026\u0026 /delta|addendum|change request|new requirement|supporting requirement|supporting functional|source type: supporting/.test(haystack)) return 200;\n  return 0;\n}\nfunction isBacklogDeltaCandidate(metadata, text = \u0027\u0027) {\n  return backlogDeltaPriority(metadata, text) \u003e 0;\n}\n\nconst getText = item =\u003e {\n  const j = item.json || {};\n  if (typeof j.pageContent === \u0027string\u0027) return j.pageContent;\n  if (typeof j.text === \u0027string\u0027) return j.text;\n  if (typeof j.content === \u0027string\u0027) return j.content;\n  if (typeof j.document === \u0027string\u0027) return j.document;\n  if (j.document \u0026\u0026 typeof j.document.pageContent === \u0027string\u0027) return j.document.pageContent;\n  if (j.document \u0026\u0026 typeof j.document.content === \u0027string\u0027) return j.document.content;\n  return \u0027\u0027;\n};\n\nconst scoreChunk = chunk =\u003e {\n  const metadata = chunk.metadata || {};\n  const docType = normalizeKey(metaValue(metadata, [\u0027docType\u0027, \u0027documentType\u0027, \u0027document_type\u0027]));\n  const documentCategory = String(metaValue(metadata, [\u0027documentCategory\u0027], \u0027\u0027)).trim();\n  const artifactType = String(metaValue(metadata, [\u0027artifactType\u0027], \u0027\u0027)).trim();\n  const contentSource = String(metaValue(metadata, [\u0027contentSource\u0027], \u0027\u0027)).trim().toLowerCase();\n  const sectionTitle = String(metaValue(metadata, [\u0027sectionTitle\u0027, \u0027section\u0027, \u0027title\u0027, \u0027heading\u0027], \u0027\u0027)).trim();\n  const hasVisionContent = [\u0027true\u0027, \u00271\u0027, \u0027yes\u0027].includes(String(metaValue(metadata, [\u0027hasVisionContent\u0027], \u0027\u0027)).toLowerCase());\n  const metadataConfidence = Number(metaValue(metadata, [\u0027metadataConfidence\u0027], 0)) || 0;\n  const reasons = [];\n  let profileScore = 0;\n\n  if (profile.primaryDocTypes.includes(docType)) {\n    profileScore += 40;\n    reasons.push(\u0027primary docType \u0027 + docType);\n  } else if (profile.secondaryDocTypes.includes(docType)) {\n    profileScore += 22;\n    reasons.push(\u0027secondary docType \u0027 + docType);\n  } else if (!docType || docType === \u0027UNKNOWN\u0027) {\n    profileScore += 2;\n    reasons.push(\u0027unclassified docType fallback\u0027);\n  }\n\n  if (profile.preferredCategories.includes(documentCategory)) {\n    profileScore += 18;\n    reasons.push(\u0027category \u0027 + documentCategory);\n  }\n\n  if (profile.preferredArtifacts.includes(artifactType)) {\n    profileScore += 18;\n    reasons.push(\u0027artifact \u0027 + artifactType);\n  }\n\n  if (profile.preferredContentSources.includes(contentSource)) {\n    profileScore += 8;\n    reasons.push(\u0027contentSource \u0027 + contentSource);\n  }\n\n  if (hasVisionContent) {\n    profileScore += requestProfileKey === \u0027technical_design\u0027 || requestProfileKey === \u0027user_stories\u0027 || requestProfileKey === \u0027test_cases\u0027 ? 7 : 3;\n    reasons.push(\u0027vision evidence\u0027);\n  }\n\n  if (textIncludes(sectionTitle, profile.sectionKeywords)) {\n    profileScore += 14;\n    reasons.push(\u0027section keyword match\u0027);\n  }\n\n  if (textIncludes(chunk.text.slice(0, 1200), profile.sectionKeywords)) {\n    profileScore += 10;\n    reasons.push(\u0027content keyword match\u0027);\n  }\n\n  if (metadataConfidence \u003e 0) {\n    profileScore += Math.min(8, Math.round(metadataConfidence * 8));\n  }\n\n  const deltaPriority = backlogUpdateMode ? backlogDeltaPriority(metadata, chunk.text) : 0;\n  const deltaCandidate = deltaPriority \u003e 0;\n  if (deltaCandidate) {\n    profileScore += deltaPriority;\n    reasons.push(deltaPriority \u003e= 240 ? \u0027update explicit supporting delta evidence\u0027 : \u0027update explicit requirement delta evidence\u0027);\n  }\n\n  return { profileScore, reasons, docType, documentCategory, artifactType, contentSource, sectionTitle, hasVisionContent, metadataConfidence, deltaCandidate, deltaPriority };\n};\n\nconst normalized = docs.map((item, index) =\u003e {\n  const j = item.json || {};\n  const text = getText(item);\n  const metadata = j.metadata || j.document?.metadata || {};\n  const score = j.score ?? j.similarity ?? j.distance ?? j.document?.score ?? null;\n  const base = { index: index + 1, text, metadata, score };\n  const ranked = scoreChunk(base);\n  return { ...base, ...ranked };\n}).filter(d =\u003e d.text \u0026\u0026 d.text.trim().length \u003e 0);\n\nif (!normalized.length) {\n  throw new Error(\u0027Chroma retrieval quality gate failed: 0 chunks returned for project=\u0027 + (root.projectName || \u0027Unknown Project\u0027) + \u0027 using metadata.project. Jira and Confluence creation stopped. Recheck ingestion metadata, project name, and collection=\u0027 + (root.chromaCollection || \u0027qa-chunks-batches\u0027) + \u0027.\u0027);\n}\n\nconst dedupeKey = d =\u003e [\n  metaValue(d.metadata, [\u0027chunkId\u0027], \u0027\u0027),\n  metaValue(d.metadata, [\u0027documentId\u0027], \u0027\u0027),\n  metaValue(d.metadata, [\u0027sectionIndex\u0027], \u0027\u0027),\n  metaValue(d.metadata, [\u0027chunkIndex\u0027], \u0027\u0027),\n  metaValue(d.metadata, [\u0027contentSource\u0027], \u0027\u0027)\n].join(\u0027|\u0027) || String(d.index);\n\nconst seen = new Set();\nconst ranked = normalized\n  .sort((a, b) =\u003e (b.profileScore - a.profileScore) || (a.index - b.index))\n  .filter(d =\u003e {\n    const key = dedupeKey(d);\n    if (seen.has(key)) return false;\n    seen.add(key);\n    return true;\n  });\n\nconst selected = ranked.slice(0, Number(root.chromaTopK || 20));\n\nconst sourceName = metadata =\u003e metaValue(metadata, [\u0027source\u0027, \u0027fileName\u0027, \u0027filename\u0027, \u0027file_name\u0027, \u0027documentType\u0027, \u0027document_type\u0027], \u0027Chroma chunk\u0027);\nconst retrievalContext = selected.map(d =\u003e ({\n  source: sourceName(d.metadata),\n  section: d.sectionTitle || \u0027\u0027,\n  project: metaValue(d.metadata, [\u0027project\u0027], \u0027\u0027),\n  score: d.score,\n  profileScore: d.profileScore,\n  profileMatchReasons: d.reasons,\n  deltaCandidate: Boolean(d.deltaCandidate),\n  deltaPriority: Number(d.deltaPriority || 0),\n  docType: d.docType || \u0027UNKNOWN\u0027,\n  documentCategory: d.documentCategory || \u0027\u0027,\n  artifactType: d.artifactType || \u0027\u0027,\n  contentSource: d.contentSource || \u0027\u0027,\n  hasVisionContent: d.hasVisionContent,\n  metadataConfidence: d.metadataConfidence,\n  metadataSource: metaValue(d.metadata, [\u0027metadataSource\u0027], \u0027\u0027),\n  sourceFormat: metaValue(d.metadata, [\u0027sourceFormat\u0027, \u0027fileType\u0027], \u0027\u0027),\n  documentId: metaValue(d.metadata, [\u0027documentId\u0027], \u0027\u0027),\n  chunkId: metaValue(d.metadata, [\u0027chunkId\u0027], \u0027\u0027),\n  chunkIndex: metaValue(d.metadata, [\u0027chunkIndex\u0027], \u0027\u0027),\n  excerpt: d.text.slice(0, 2500)\n}));\n\nconst groupedEvidence = {};\nfor (const [group, docTypes] of Object.entries(profile.evidenceGroups || {})) {\n  groupedEvidence[group] = retrievalContext.filter(chunk =\u003e docTypes.includes(normalizeKey(chunk.docType))).slice(0, 8);\n}\ngroupedEvidence.unclassified = retrievalContext.filter(chunk =\u003e !chunk.docType || normalizeKey(chunk.docType) === \u0027UNKNOWN\u0027).slice(0, 5);\nif (backlogUpdateMode) {\n  groupedEvidence.delta = retrievalContext.filter(chunk =\u003e chunk.deltaCandidate || normalizeKey(chunk.docType) === \u0027SUPPORTING\u0027).slice(0, 12);\n}\n\nconst docTypeCoverage = arrayUnique(retrievalContext.map(chunk =\u003e normalizeKey(chunk.docType)).filter(value =\u003e value \u0026\u0026 value !== \u0027UNKNOWN\u0027));\nconst categoryCoverage = arrayUnique(retrievalContext.map(chunk =\u003e chunk.documentCategory).filter(Boolean));\nconst profileMatchedCount = retrievalContext.filter(chunk =\u003e Number(chunk.profileScore || 0) \u003e= 30).length;\n\nreturn [{\n  json: {\n    ...root,\n    retrievalProfile: {\n      key: requestProfileKey,\n      label: profile.label,\n      intent: profile.intent,\n      primaryDocTypes: profile.primaryDocTypes,\n      secondaryDocTypes: profile.secondaryDocTypes,\n      preferredCategories: profile.preferredCategories,\n      preferredArtifacts: profile.preferredArtifacts,\n      preferredContentSources: profile.preferredContentSources,\n      sectionKeywords: profile.sectionKeywords,\n      rankingMode: \u0027project_filtered_metadata_profile_rerank\u0027,\n      hardFilter: { project: root.projectName },\n      softFilters: {\n        docType: profile.primaryDocTypes.concat(profile.secondaryDocTypes),\n        documentCategory: profile.preferredCategories,\n        artifactType: profile.preferredArtifacts,\n        contentSource: profile.preferredContentSources\n      }\n    },\n    retrievalQuality: {\n      passed: true,\n      chunkCount: normalized.length,\n      rankedChunkCount: ranked.length,\n      selectedChunkCount: retrievalContext.length,\n      profileMatchedCount,\n      metadataFilterKey: \u0027project\u0027,\n      metadataFilterValue: root.projectName,\n      profileKey: requestProfileKey,\n      docTypeCoverage,\n      categoryCoverage,\n      collection: root.chromaCollection,\n      topK: root.chromaTopK,\n      updateMode,\n      updateDeltaCandidateCount: retrievalContext.filter(chunk =\u003e chunk.deltaCandidate || normalizeKey(chunk.docType) === \u0027SUPPORTING\u0027).length\n    },\n    retrievalContext,\n    groupedEvidence\n  }\n}];\n"
}
```

### Collect Team Managed Epic Jira Map

| Field | Value |
| --- | --- |
| Node ID | d2ca0cb8-06d8-4416-a5f9-1bf4a8fadb06 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2704, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Combine Epic Reuse And Create Results -> Collect Team Managed Epic Jira Map (output 0, input 0)

**Outgoing Connections**

- Collect Team Managed Epic Jira Map -> Prepare Story Search Items (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst root = $(\u0027Validate Team Managed Backlog\u0027).item.json;\nconst actions = $(\u0027Determine Epic Reuse Or Create\u0027).all().map(i =\u003e i.json);\nconst createdSources = actions.filter(action =\u003e action.action === \u0027create\u0027);\nlet created = [];\ntry {\n  const createdResponses = $(\u0027Create Missing Epic in Jira\u0027).all().map(i =\u003e i.json);\n  created = createdSources.map((source, index) =\u003e {\n    const response = createdResponses[index] || {};\n    if (!response.key) {\n      throw new Error(\u0027Jira did not return a key for created epic \u0027 + source.epicCorrelationId);\n    }\n    return {\n      ...source,\n      action: \u0027created\u0027,\n      jiraEpicId: response.id || null,\n      jiraEpicKey: response.key || null,\n      jiraEpicSelf: response.self || null\n    };\n  });\n} catch (error) {\n  if (createdSources.length) throw error;\n  created = [];\n}\nconst createdByCorrelation = Object.fromEntries(created.map(e =\u003e [e.epicCorrelationId, e]));\nconst epicMap = {};\nfor (const action of actions) {\n  const source = action.action === \u0027create\u0027 ? (createdByCorrelation[action.epicCorrelationId] || action) : action;\n  epicMap[action.epicCorrelationId] = {\n    epicCorrelationId: action.epicCorrelationId,\n    epicName: action.epic.epicName,\n    jiraEpicId: source.jiraEpicId || null,\n    jiraEpicKey: source.jiraEpicKey || null,\n    jiraEpicSelf: source.jiraEpicSelf || null,\n    action: source.action || action.action,\n    stableLabel: action.stableEpicLabel\n  };\n}\nconst missing = root.epics.filter(e =\u003e !epicMap[e.epicCorrelationId]?.jiraEpicKey).map(e =\u003e e.epicCorrelationId);\nif (missing.length) throw new Error(\u0027Jira did not return or find epic keys for: \u0027 + missing.join(\u0027, \u0027));\nreturn [{ json: { ...root, epicMap } }];\n"
}
```

### Combine Confluence Results

| Field | Value |
| --- | --- |
| Node ID | e63d393d-7a43-44d2-ab54-867bb116eb6f |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 6064, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Updated Confluence Page -> Combine Confluence Results (output 0, input 0)
- Normalize Created Confluence Page -> Combine Confluence Results (output 0, input 1)

**Outgoing Connections**

- Combine Confluence Results -> Return Team Managed Professional Result (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Combine Epic Reuse And Create Results

| Field | Value |
| --- | --- |
| Node ID | 66bea855-7516-4541-9da7-8b927928ed29 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 2480, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Created Epic Result -> Combine Epic Reuse And Create Results (output 0, input 0)
- Normalize Existing Epic Result -> Combine Epic Reuse And Create Results (output 0, input 1)

**Outgoing Connections**

- Combine Epic Reuse And Create Results -> Collect Team Managed Epic Jira Map (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Combine Story Reuse And Create Results

| Field | Value |
| --- | --- |
| Node ID | 4dbca7af-d1cb-498b-bf68-bbc4db329604 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 4272, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Created Story Result -> Combine Story Reuse And Create Results (output 0, input 0)
- Normalize Existing Story Result -> Combine Story Reuse And Create Results (output 0, input 1)

**Outgoing Connections**

- Combine Story Reuse And Create Results -> Summarize Team Managed Jira Results (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Confluence Page Exists?

| Field | Value |
| --- | --- |
| Node ID | 5414d734-7ec8-4321-9380-2968210fc254 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 5392, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Determine Confluence Update Or Create -> Confluence Page Exists? (output 0, input 0)

**Outgoing Connections**

- Confluence Page Exists? -> Update Existing Confluence Page (output 0, input 0)
- Confluence Page Exists? -> Create Confluence Page (output 1, input 0)

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
                                              "leftValue":  "={{ $json.confluenceAction }}",
                                              "rightValue":  "update",
                                              "operator":  {
                                                               "type":  "string",
                                                               "operation":  "equals"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Create Confluence Page

| Field | Value |
| --- | --- |
| Node ID | 2843da9a-e1ce-47e4-9358-59b6add9118c |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 5616, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Confluence Page Exists? -> Create Confluence Page (output 1, input 0)

**Outgoing Connections**

- Create Confluence Page -> Normalize Created Confluence Page (output 0, input 0)

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
    "method":  "POST",
    "url":  "={{ $json.confluenceBaseUrl }}/rest/api/content",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\"Accept\":\"application/json\",\"Content-Type\":\"application/json\"}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.confluencePayload) }}",
    "options":  {

                }
}
```

### Create Missing Epic in Jira

| Field | Value |
| --- | --- |
| Node ID | 965d0509-fc39-4b9a-94ab-45ea6c9fb0c4 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2032, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Epic Needs Create? -> Create Missing Epic in Jira (output 0, input 0)

**Outgoing Connections**

- Create Missing Epic in Jira -> Normalize Created Epic Result (output 0, input 0)

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
    "method":  "POST",
    "url":  "={{ $json.jiraBaseUrl }}/rest/api/3/issue",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\"Accept\":\"application/json\",\"Content-Type\":\"application/json\"}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.jiraEpicPayload) }}",
    "options":  {

                }
}
```

### Create Missing Story Linked to Epic

| Field | Value |
| --- | --- |
| Node ID | 3dc940f5-2143-47af-a396-c9beb9b2b3a8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3824, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Needs Create? -> Create Missing Story Linked to Epic (output 0, input 0)

**Outgoing Connections**

- Create Missing Story Linked to Epic -> Normalize Created Story Result (output 0, input 0)

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
    "method":  "POST",
    "url":  "={{ $json.jiraBaseUrl }}/rest/api/3/issue",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\"Accept\":\"application/json\",\"Content-Type\":\"application/json\"}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.jiraStoryPayload) }}",
    "options":  {

                }
}
```

### Determine Confluence Update Or Create

| Field | Value |
| --- | --- |
| Node ID | 14c3f1ec-d4f3-4ffa-a8b9-e51a3b565c58 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 5168, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search Existing Confluence Page -> Determine Confluence Update Or Create (output 0, input 0)

**Outgoing Connections**

- Determine Confluence Update Or Create -> Confluence Page Exists? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst search = $input.first().json || {};\nconst root = $(\u0027Prepare Confluence Upsert\u0027).item.json;\nconst page = Array.isArray(search.results) \u0026\u0026 search.results.length ? search.results[0] : null;\nconst action = page?.id ? \u0027update\u0027 : \u0027create\u0027;\nconst payload = action === \u0027update\u0027\n  ? { id: page.id, type: \u0027page\u0027, title: root.confluenceTitle, version: { number: Number(page.version?.number || 1) + 1 }, body: { storage: { representation: \u0027storage\u0027, value: root.confluenceBody } } }\n  : { type: \u0027page\u0027, title: root.confluenceTitle, ancestors: root.confluenceParentPageId ? [{ id: root.confluenceParentPageId }] : [], space: { key: root.confluenceSpaceKey }, body: { storage: { representation: \u0027storage\u0027, value: root.confluenceBody } } };\nreturn [{ json: { ...root, confluenceAction: action, existingConfluencePage: page, confluencePageId: page?.id || null, confluencePayload: payload } }];"
}
```

### Determine Epic Reuse Or Create

| Field | Value |
| --- | --- |
| Node ID | 3abd0272-ceca-432a-b2d6-35121472982e |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1584, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search Existing Epic in Jira -> Determine Epic Reuse Or Create (output 0, input 0)

**Outgoing Connections**

- Determine Epic Reuse Or Create -> Epic Needs Create? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst searches = $input.all();\nconst sources = $(\u0027Prepare Epic Search Items\u0027).all();\nreturn sources.map((source, index) =\u003e {\n  const sourceJson = source.json || {};\n  const liveEpicKey = sourceJson.epic?.jiraEpicKey || sourceJson.epic?.epicKey || sourceJson.epic?.key || null;\n  const liveEpicId = sourceJson.epic?.jiraEpicId || sourceJson.epic?.epicId || sourceJson.epic?.id || null;\n  if (liveEpicKey) {\n    return { json: { ...sourceJson, action: \u0027reuse\u0027, existingEpicIssue: null, jiraEpicId: liveEpicId, jiraEpicKey: liveEpicKey, jiraEpicSelf: sourceJson.epic?.jiraEpicSelf || null } };\n  }\n  const search = searches[index]?.json || {};\n  const issue = Array.isArray(search.issues) \u0026\u0026 search.issues.length ? search.issues[0] : null;\n  return { json: { ...sourceJson, action: issue?.key ? \u0027reuse\u0027 : \u0027create\u0027, existingEpicIssue: issue, jiraEpicId: issue?.id || null, jiraEpicKey: issue?.key || null, jiraEpicSelf: issue?.self || null } };\n});"
}
```

### Determine Story Reuse Or Create

| Field | Value |
| --- | --- |
| Node ID | c2078044-f71a-4625-a6e3-b8ed4982bb41 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3376, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search Existing Story in Jira -> Determine Story Reuse Or Create (output 0, input 0)

**Outgoing Connections**

- Determine Story Reuse Or Create -> Story Needs Create? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst searches = $input.all();\nconst sources = $(\u0027Prepare Story Search Items\u0027).all();\nreturn sources.map((source, index) =\u003e {\n  const sourceJson = source.json || {};\n  const liveStoryKey = sourceJson.story?.jiraStoryKey || sourceJson.story?.storyKey || sourceJson.story?.key || null;\n  const liveStoryId = sourceJson.story?.jiraStoryId || sourceJson.story?.storyId || sourceJson.story?.id || null;\n  if (liveStoryKey) {\n    return { json: { ...sourceJson, action: \u0027reuse\u0027, existingStoryIssue: null, jiraStoryId: liveStoryId, jiraStoryKey: liveStoryKey, jiraStorySelf: sourceJson.story?.jiraStorySelf || null } };\n  }\n  const search = searches[index]?.json || {};\n  const issue = Array.isArray(search.issues) \u0026\u0026 search.issues.length ? search.issues[0] : null;\n  return { json: { ...sourceJson, action: issue?.key ? \u0027reuse\u0027 : \u0027create\u0027, existingStoryIssue: issue, jiraStoryId: issue?.id || null, jiraStoryKey: issue?.key || null, jiraStorySelf: issue?.self || null } };\n});"
}
```

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | f0298e84-17b6-4f19-9efb-4e88389a03cb |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | -48, 1008 |
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

### Epic Needs Create?

| Field | Value |
| --- | --- |
| Node ID | 65df1342-7e4e-4bbe-8a50-335f5c86aed4 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1808, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Determine Epic Reuse Or Create -> Epic Needs Create? (output 0, input 0)

**Outgoing Connections**

- Epic Needs Create? -> Create Missing Epic in Jira (output 0, input 0)
- Epic Needs Create? -> Normalize Existing Epic Result (output 1, input 0)

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
                                              "leftValue":  "={{ $json.action }}",
                                              "rightValue":  "create",
                                              "operator":  {
                                                               "type":  "string",
                                                               "operation":  "equals"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Normalize Created Confluence Page

| Field | Value |
| --- | --- |
| Node ID | 03ca9af8-58c4-4471-9944-222b5c6f439d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 5840, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Create Confluence Page -> Normalize Created Confluence Page (output 0, input 0)

**Outgoing Connections**

- Normalize Created Confluence Page -> Combine Confluence Results (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: { ...$(\u0027Determine Confluence Update Or Create\u0027).item.json, confluenceAction: \u0027created\u0027, confluenceResponse: $json } }];"
}
```

### Normalize Created Epic Result

| Field | Value |
| --- | --- |
| Node ID | fc72534c-6e67-4d70-b084-c96ec4fb050a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2256, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Create Missing Epic in Jira -> Normalize Created Epic Result (output 0, input 0)

**Outgoing Connections**

- Normalize Created Epic Result -> Combine Epic Reuse And Create Results (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst created = $input.all();\nconst sources = $(\u0027Determine Epic Reuse Or Create\u0027).all().filter(item =\u003e item.json.action === \u0027create\u0027);\nreturn created.map((item, index) =\u003e ({ json: { ...sources[index].json, action: \u0027created\u0027, jiraEpicId: item.json.id || null, jiraEpicKey: item.json.key || null, jiraEpicSelf: item.json.self || null } }));"
}
```

### Normalize Created Story Result

| Field | Value |
| --- | --- |
| Node ID | 59eddb04-1808-4264-98e4-88ce52cfaffb |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 4048, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Create Missing Story Linked to Epic -> Normalize Created Story Result (output 0, input 0)

**Outgoing Connections**

- Normalize Created Story Result -> Combine Story Reuse And Create Results (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst created = $input.all();\nconst sources = $(\u0027Determine Story Reuse Or Create\u0027).all().filter(item =\u003e item.json.action === \u0027create\u0027);\nreturn created.map((item, index) =\u003e ({ json: { ...sources[index].json, action: \u0027created\u0027, jiraStoryId: item.json.id || null, jiraStoryKey: item.json.key || null, jiraStorySelf: item.json.self || null } }));"
}
```

### Normalize Existing Epic Result

| Field | Value |
| --- | --- |
| Node ID | b6fb85b9-c343-4855-a3bf-b127f3178c2e |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2256, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Epic Needs Create? -> Normalize Existing Epic Result (output 1, input 0)

**Outgoing Connections**

- Normalize Existing Epic Result -> Combine Epic Reuse And Create Results (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map(item =\u003e ({ json: { ...item.json, action: \u0027reused\u0027 } }));"
}
```

### Normalize Existing Story Result

| Field | Value |
| --- | --- |
| Node ID | be155977-23b9-4ca2-b28c-0190fbaa305b |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 4048, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Needs Create? -> Normalize Existing Story Result (output 1, input 0)

**Outgoing Connections**

- Normalize Existing Story Result -> Combine Story Reuse And Create Results (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map(item =\u003e ({ json: { ...item.json, action: \u0027reused\u0027 } }));"
}
```

### Normalize Team Managed Request

| Field | Value |
| --- | --- |
| Node ID | 1751511c-bfbf-4c56-9da0-bd435ab67028 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -560, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- When Executed by Another Workflow -> Normalize Team Managed Request (output 0, input 0)

**Outgoing Connections**

- Normalize Team Managed Request -> Preflight Project Knowledge Search (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst input = $json || {};\nconst config = input.configSnapshot || input.config_snapshot || {};\nconst publishing = config.publishing || {};\nconst jira = config.jira || {\n  baseUrl: publishing.jiraBaseUrl,\n  projectKey: publishing.jiraProjectKey,\n  projectId: publishing.jiraProjectId,\n  epicIssueTypeId: publishing.jiraEpicIssueTypeId,\n  storyIssueTypeId: publishing.jiraStoryIssueTypeId,\n  idempotencyLabelPrefix: publishing.jiraIdempotencyLabelPrefix\n};\nconst confluence = config.confluence || {\n  baseUrl: publishing.confluenceBaseUrl,\n  spaceKey: publishing.confluenceSpaceKey,\n  parentPageId: publishing.confluenceParentPageId,\n  pageTitlePattern: publishing.confluencePageTitlePattern\n};\nconst models = config.models || {};\nconst chroma = config.chroma || {};\nconst cleanBase = (value, fallback) =\u003e { const s = String(value || fallback); return s.endsWith(\u0027/\u0027) ? s.slice(0, -1) : s; };\nconst normalizeDocumentType = value =\u003e String(value || \u0027user_stories\u0027).trim().toLowerCase().replace(/[^a-z0-9]+/g, \u0027_\u0027).replace(/^_+|_+$/g, \u0027\u0027) || \u0027user_stories\u0027;\nconst documentType = normalizeDocumentType(input.documentType || input.document_type || \u0027user_stories\u0027);\nconst normalizedGenerationMode = [\u0027update\u0027, \u0027retry\u0027].includes(String(input.generationMode || \u0027\u0027).trim().toLowerCase())\n  ? String(input.generationMode || \u0027\u0027).trim().toLowerCase()\n  : input.retryContext?.retryMode ? \u0027retry\u0027 : \u0027create\u0027;\nconst updateContext = input.updateContext \u0026\u0026 typeof input.updateContext === \u0027object\u0027 ? input.updateContext : {};\nconst rawChromaTopK = Number(chroma.topK || input.chromaTopK || 20);\nconst chromaTopK = Number.isFinite(rawChromaTopK) \u0026\u0026 rawChromaTopK \u003e 0 ? rawChromaTopK : 20;\nconst BACKLOG_CREATE_CAPACITY_V1 = true;\nconst requestedGenerationMode = String(input.generationMode || input.generation_mode || \u0027\u0027).trim().toLowerCase();\nconst isCreateLikeGeneration = !input.updateMode \u0026\u0026 !input.updateOfJobId \u0026\u0026 requestedGenerationMode !== \u0027update\u0027;\nconst configuredMaxTokens = Number(models.maxTokens || input.maxTokens || 0);\nconst maxTokens = Math.max(isCreateLikeGeneration ? 30000 : 16000, Number.isFinite(configuredMaxTokens) \u0026\u0026 configuredMaxTokens \u003e 0 ? configuredMaxTokens : 0);\nconst retrievalSearchQueries = {\n  user_stories: \u0027Project requirements for Agile epics user stories business rules functional requirements UI UX flows validation rules integrations acceptance criteria NFR risks constraints BRD FRD PRD SRS transcripts HLD LLD API data model\u0027,\n  test_cases: \u0027Project test scenarios test cases acceptance criteria validation rules edge cases negative scenarios UI behavior API behavior business rules preconditions expected results\u0027,\n  rtm: \u0027Project requirement traceability matrix BRD FRD requirement IDs acceptance criteria test coverage business rules source references\u0027,\n  technical_design: \u0027Project architecture high level design low level design API database integration sequence flows components NFR performance security scalability\u0027,\n  qa_document: \u0027Project QA strategy test plan test scenarios business rules acceptance criteria risks assumptions dependencies validation integration coverage\u0027\n};\nreturn [{ json: {\n  jobId: input.jobId || input.job_id || \u0027JOB-\u0027 + Date.now(),\n  projectName: input.projectName || input.project_name || \u0027Unknown Project\u0027,\n  documentType,\n  generationMode: normalizedGenerationMode,\n  updateMode: normalizedGenerationMode === \u0027update\u0027,\n  updateOfJobId: updateContext.previousJobId || input.updateOfJobId || null,\n  updateContext,\n  productOwner: input.productOwner || input.product_owner || \u0027Product Owner\u0027,\n  projectId: input.projectId || input.project_id || null,\n  requestedBy: input.requestedBy || input.requested_by || null,\n  settingsVersion: input.settingsVersion || input.settings_version || null,\n  environmentKey: config.environment?.key || input.environment || \u0027local\u0027,\n  startedAt: input.startedAt || input.createdAt || new Date().toISOString(),\n  jiraProjectType: \u0027team-managed\u0027,\n  jiraProjectKey: input.jiraProjectKey || jira.projectKey || \u0027KAN\u0027,\n  jiraProjectId: input.jiraProjectId || jira.projectId || null,\n  jiraBaseUrl: cleanBase(input.jiraBaseUrl || jira.baseUrl, \u0027https://anujalhans1.atlassian.net\u0027),\n  epicIssueTypeId: input.epicIssueTypeId || jira.epicIssueTypeId || null,\n  storyIssueTypeId: input.storyIssueTypeId || jira.storyIssueTypeId || null,\n  epicIssueTypeName: input.epicIssueTypeName || jira.epicIssueType || jira.epicIssueTypeName || \u0027Epic\u0027,\n  storyIssueTypeName: input.storyIssueTypeName || jira.storyIssueType || jira.storyIssueTypeName || \u0027Story\u0027,\n  idempotencyLabelPrefix: input.idempotencyLabelPrefix || jira.idempotencyLabelPrefix || \u0027qops\u0027,\n  confluenceBaseUrl: cleanBase(input.confluenceBaseUrl || confluence.baseUrl, \u0027https://anujalhans1.atlassian.net/wiki\u0027),\n  confluenceSpaceKey: input.confluenceSpaceKey || confluence.spaceKey || \u0027TD\u0027,\n  confluenceParentPageId: input.confluenceParentPageId || confluence.parentPageId || null,\n  generationModel: models.generationModel || input.generationModel || \u0027gpt-4.1-mini\u0027,\n  maxTokens,\n  chromaCollection: chroma.collection || input.chromaCollection || \u0027qa-chunks-batches\u0027,\n  chromaTopK,\n  retrievalProfileKey: documentType,\n  retrievalSearchQuery: \u0027Project \u0027 + (input.projectName || input.project_name || \u0027Unknown Project\u0027) + \u0027 \u0027 + (retrievalSearchQueries[documentType] || retrievalSearchQueries.qa_document)\n}}];"
}
```

### Normalize Updated Confluence Page

| Field | Value |
| --- | --- |
| Node ID | 4c1b1890-63c4-48ba-916d-9fe3b02276f1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 5840, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Update Existing Confluence Page -> Normalize Updated Confluence Page (output 0, input 0)

**Outgoing Connections**

- Normalize Updated Confluence Page -> Combine Confluence Results (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: { ...$(\u0027Determine Confluence Update Or Create\u0027).item.json, confluenceAction: \u0027updated\u0027, confluenceResponse: $json } }];"
}
```

### OpenAI Chat Model

| Field | Value |
| --- | --- |
| Node ID | 3861bcdb-7574-4d25-92f8-b549a1109eba |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.3 |
| Position | 96, 704 |
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
                  "value":  "={{ $json.generationModel }}",
                  "mode":  "id",
                  "cachedResultName":  "runtime-configured model"
              },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  "={{ $json.maxTokens }}"
                }
}
```

### Preflight Project Knowledge Search

| Field | Value |
| --- | --- |
| Node ID | 6a7f5bb8-1e3e-4f39-af75-58b7f1a8d6f0 |
| Type | @n8n/n8n-nodes-langchain.vectorStoreChromaDB |
| Type Version | 1.3 |
| Position | -352, 112 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Team Managed Request -> Preflight Project Knowledge Search (output 0, input 0)

**Outgoing Connections**

- Preflight Project Knowledge Search -> Check Chroma Retrieval Quality (output 0, input 0)

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
    "mode":  "load",
    "authentication":  "chromaCloudApi",
    "chromaCollection":  {
                             "__rl":  true,
                             "value":  "={{ $json.chromaCollection }}",
                             "mode":  "id",
                             "cachedResultName":  "runtime-configured collection"
                         },
    "prompt":  "={{ $json.retrievalSearchQuery || (\u0027Project \u0027 + $json.projectName + \u0027 requirements BRD FRD HLD LLD UI UX workflows integrations validations acceptance criteria business rules non functional requirements risks constraints\u0027) }}",
    "topK":  "={{ $json.chromaTopK }}",
    "options":  {
                    "metadata":  {
                                     "metadataValues":  [
                                                            {
                                                                "name":  "project",
                                                                "value":  "={{ $json.projectName }}"
                                                            }
                                                        ]
                                 }
                }
}
```

### Prepare Confluence Upsert

| Field | Value |
| --- | --- |
| Node ID | 65306e5e-4356-4fd6-9244-362d4a398e6d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 4720, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Summarize Team Managed Jira Results -> Prepare Confluence Upsert (output 0, input 0)

**Outgoing Connections**

- Prepare Confluence Upsert -> Search Existing Confluence Page (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const root = $json;\nconst esc = value =\u003e String(value ?? \u0027\u0027).replace(/\u0026/g, \u0027\u0026amp;\u0027).replace(/\u003c/g, \u0027\u0026lt;\u0027).replace(/\u003e/g, \u0027\u0026gt;\u0027);\nconst title = (root.generated.document?.title || \u0027Professional QA Backlog\u0027) + \u0027 - \u0027 + root.projectName;\nconst coverageSummary = root.coverageSummary || root.qualityGate?.coverageSummary || {};\nconst coverageItems = Array.isArray(root.coverageLedger)\n  ? root.coverageLedger\n  : Array.isArray(root.generated?.document?.coverageLedger)\n    ? root.generated.document.coverageLedger\n    : [];\nconst coverageRows = coverageItems.slice(0, 20).map(item =\u003e\n  \u0027\u003ctr\u003e\u003ctd\u003e\u0027 + esc(item.coverageId) + \u0027\u003c/td\u003e\u003ctd\u003e\u0027 + esc(item.moduleRequirement) + \u0027\u003c/td\u003e\u003ctd\u003e\u0027 + esc(item.coverageStatus) + \u0027\u003c/td\u003e\u003ctd\u003e\u0027 + esc([...(item.mappedEpicIds || []), ...(item.mappedStoryIds || [])].join(\u0027, \u0027)) + \u0027\u003c/td\u003e\u003ctd\u003e\u0027 + esc(item.notes) + \u0027\u003c/td\u003e\u003c/tr\u003e\u0027\n).join(\u0027\u0027);\nconst coverageTable = coverageRows\n  ? \u0027\u003ctable\u003e\u003ctbody\u003e\u003ctr\u003e\u003cth\u003eCoverage ID\u003c/th\u003e\u003cth\u003eModule / Requirement\u003c/th\u003e\u003cth\u003eStatus\u003c/th\u003e\u003cth\u003eMapped Output\u003c/th\u003e\u003cth\u003eNotes\u003c/th\u003e\u003c/tr\u003e\u0027 + coverageRows + \u0027\u003c/tbody\u003e\u003c/table\u003e\u0027\n  : \u0027\u003cp\u003eNo coverage ledger rows were available.\u003c/p\u003e\u0027;\nconst batchSummary = root.batchSummary || root.qualityGate?.batchSummary || root.generated?.document?.batchResults || {};\nconst batchRows = Array.isArray(batchSummary.batches) ? batchSummary.batches.slice(0, 30).map(batch =\u003e\n  \u0027\u003ctr\u003e\u003ctd\u003e\u0027 + esc(batch.batchId) + \u0027\u003c/td\u003e\u003ctd\u003e\u0027 + esc(batch.module) + \u0027\u003c/td\u003e\u003ctd\u003e\u0027 + esc(batch.status) + \u0027\u003c/td\u003e\u003ctd\u003e\u0027 + esc(batch.retried ? \u0027Yes\u0027 : \u0027No\u0027) + \u0027\u003c/td\u003e\u003ctd\u003e\u0027 + esc((batch.coverageIds || []).join(\u0027, \u0027)) + \u0027\u003c/td\u003e\u003c/tr\u003e\u0027\n).join(\u0027\u0027) : \u0027\u0027;\nconst batchTable = batchRows\n  ? \u0027\u003ctable\u003e\u003ctbody\u003e\u003ctr\u003e\u003cth\u003eBatch ID\u003c/th\u003e\u003cth\u003eModule\u003c/th\u003e\u003cth\u003eStatus\u003c/th\u003e\u003cth\u003eRetried\u003c/th\u003e\u003cth\u003eCoverage IDs\u003c/th\u003e\u003c/tr\u003e\u0027 + batchRows + \u0027\u003c/tbody\u003e\u003c/table\u003e\u0027\n  : \u0027\u003cp\u003eNo batch-level details were returned.\u003c/p\u003e\u0027;\nconst body = \u0027\u003ch1\u003e\u0027 + esc(root.generated.document?.title || \u0027Professional QA Backlog\u0027) + \u0027\u003c/h1\u003e\u0027\n  + \u0027\u003cp\u003e\u0027 + esc(root.generated.document?.summary || \u0027Generated professional QA backlog.\u0027) + \u0027\u003c/p\u003e\u0027\n  + \u0027\u003ch2\u003eQuality Gate\u003c/h2\u003e\u003cp\u003eStatus: \u003cstrong\u003e\u0027 + esc(root.qualityGate.status || \u0027passed\u0027) + \u0027\u003c/strong\u003e | Adaptive story count: \u003cstrong\u003eenabled\u003c/strong\u003e | Epics: \u0027 + root.qualityGate.epicCount + \u0027 | Stories: \u0027 + root.qualityGate.storyCount + \u0027 | Jira project type: Team Managed\u003c/p\u003e\u0027\n  + \u0027\u003ch2\u003eCoverage Gate\u003c/h2\u003e\u003cp\u003eStatus: \u003cstrong\u003e\u0027 + esc(coverageSummary.gateStatus || root.qualityGate.coverageGate || \u0027not_reported\u0027) + \u0027\u003c/strong\u003e | Ledger rows: \u0027 + esc(coverageSummary.coverageLedgerCount || 0) + \u0027 | Covered: \u0027 + esc(coverageSummary.coveredCount || 0) + \u0027 | Partial: \u0027 + esc(coverageSummary.partialCount || 0) + \u0027 | Missing: \u0027 + esc(coverageSummary.missingCount || 0) + \u0027 | Recovered: \u0027 + esc(coverageSummary.recoveredCount || 0) + \u0027\u003c/p\u003e\u0027 + coverageTable\n  + \u0027\u003ch2\u003eBatch Generation Summary\u003c/h2\u003e\u003cp\u003eTotal batches: \u0027 + esc(batchSummary.totalBatches || 0) + \u0027 | Completed: \u0027 + esc(batchSummary.completedBatches || 0) + \u0027 | Needs review: \u0027 + esc(batchSummary.partialBatches || 0) + \u0027 | Retrying: \u0027 + esc(batchSummary.retryingBatches || 0) + \u0027 | Recovered: \u0027 + esc(batchSummary.recoveredBatches || 0) + \u0027 | Missing: \u0027 + esc(batchSummary.missingBatches || 0) + \u0027\u003c/p\u003e\u0027 + batchTable\n  + \u0027\u003ch2\u003eJira Epics\u003c/h2\u003e\u003cul\u003e\u0027 + (root.jiraResults.epics || []).map(e =\u003e \u0027\u003cli\u003e\u003cstrong\u003e\u0027 + esc(e.jiraEpicKey || \u0027Not created\u0027) + \u0027\u003c/strong\u003e - \u0027 + esc(e.epicName) + \u0027 (\u0027 + esc(e.action) + \u0027)\u003c/li\u003e\u0027).join(\u0027\u0027) + \u0027\u003c/ul\u003e\u0027\n  + \u0027\u003ch2\u003eStories Linked by Parent\u003c/h2\u003e\u003cul\u003e\u0027 + (root.jiraResults.stories || []).map(s =\u003e \u0027\u003cli\u003e\u003cstrong\u003e\u0027 + esc(s.storyKey || \u0027Not created\u0027) + \u0027\u003c/strong\u003e parent \u0027 + esc(s.parentEpicKey || \u0027Missing parent\u0027) + \u0027 - \u0027 + esc(s.summary) + \u0027 (\u0027 + esc(s.action) + \u0027)\u003c/li\u003e\u0027).join(\u0027\u0027) + \u0027\u003c/ul\u003e\u0027;\nreturn [{ json: { ...root, confluenceTitle: title, confluenceBody: body } }];"
}
```

### Prepare Epic Search Items

| Field | Value |
| --- | --- |
| Node ID | 8ebc04b0-8ba9-45f2-965c-34e2f0e3f105 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1136, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Validate Team Managed Backlog -> Prepare Epic Search Items (output 0, input 0)

**Outgoing Connections**

- Prepare Epic Search Items -> Search Existing Epic in Jira (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const root = $json;\n\nconst cleanText = value =\u003e {\n  if (value === null || value === undefined) return \u0027\u0027;\n  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean).join(\u0027\\n\u0027);\n  if (typeof value === \u0027object\u0027) return JSON.stringify(value);\n  return String(value).replace(/\\r/g, \u0027\u0027).trim();\n};\n\nconst traceLine = value =\u003e {\n  if (value === null || value === undefined) return \u0027\u0027;\n  if (Array.isArray(value)) return value.map(traceLine).filter(Boolean).join(\u0027\\n\u0027);\n  if (typeof value === \u0027string\u0027) {\n    const text = value.trim();\n    if (!text || text === \u0027[object Object]\u0027) return \u0027\u0027;\n    if (text.startsWith(\u0027{\u0027) || text.startsWith(\u0027[\u0027)) {\n      try { return traceLine(JSON.parse(text)); } catch (error) {}\n    }\n    return text;\n  }\n  if (typeof value === \u0027object\u0027) {\n    const parts = [];\n    const source = value.source || value.fileName || value.file_name || value.document || value.documentType || value.document_type || value.title;\n    const section = value.section || value.heading || value.page || value.chunkId || value.chunk_id;\n    const excerpt = value.excerpt || value.text || value.content || value.evidence || value.summary;\n    const score = value.score ?? value.similarity ?? value.distance;\n    if (source) parts.push(\u0027Source: \u0027 + cleanText(source));\n    if (section) parts.push(\u0027Section: \u0027 + cleanText(section));\n    if (excerpt) parts.push(\u0027Evidence: \u0027 + cleanText(excerpt).slice(0, 500));\n    if (score !== undefined \u0026\u0026 score !== null) parts.push(\u0027Score: \u0027 + String(score));\n    if (parts.length) return parts.join(\u0027 | \u0027);\n    return Object.entries(value)\n      .filter(([_, v]) =\u003e v !== null \u0026\u0026 v !== undefined \u0026\u0026 typeof v !== \u0027object\u0027)\n      .map(([k, v]) =\u003e k + \u0027: \u0027 + cleanText(v))\n      .join(\u0027 | \u0027);\n  }\n  return cleanText(value);\n};\n\nconst traceList = (...values) =\u003e values\n  .flatMap(value =\u003e Array.isArray(value) ? value : [value])\n  .map(traceLine)\n  .flatMap(line =\u003e cleanText(line).split(/\\n+/))\n  .map(line =\u003e line.trim())\n  .filter(Boolean);\n\nconst normalizeArray = value =\u003e {\n  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);\n  const text = cleanText(value);\n  if (!text) return [];\n  return text.split(/\\n+/).map(line =\u003e line.replace(/^[-*]\\s*/, \u0027\u0027).trim()).filter(Boolean);\n};\n\nconst labelSafe = value =\u003e String(value || \u0027\u0027).toLowerCase().replace(/[^a-z0-9-]/g, \u0027-\u0027).replace(/-+/g, \u0027-\u0027).replace(/^-|-$/g, \u0027\u0027).slice(0, 60);\nconst mark = type =\u003e ({ type });\nconst textNode = (value, marks = []) =\u003e {\n  const text = cleanText(value).slice(0, 12000);\n  if (!text) return null;\n  return marks.length ? { type: \u0027text\u0027, text, marks } : { type: \u0027text\u0027, text };\n};\nconst paragraph = (...parts) =\u003e ({ type: \u0027paragraph\u0027, content: parts.flat().filter(Boolean) });\nconst heading = (value, level = 3) =\u003e ({ type: \u0027heading\u0027, attrs: { level }, content: [textNode(value)] });\nconst rule = () =\u003e ({ type: \u0027rule\u0027 });\nconst labeledParagraph = (label, value) =\u003e {\n  const text = cleanText(value);\n  if (!text) return null;\n  return paragraph(textNode(label + \u0027: \u0027, [mark(\u0027strong\u0027)]), textNode(text));\n};\nconst bulletList = values =\u003e {\n  const items = normalizeArray(values);\n  if (!items.length) return null;\n  return {\n    type: \u0027bulletList\u0027,\n    content: items.slice(0, 40).map(item =\u003e ({ type: \u0027listItem\u0027, content: [paragraph(textNode(item))] }))\n  };\n};\nconst orderedList = values =\u003e {\n  const items = normalizeArray(values);\n  if (!items.length) return null;\n  return {\n    type: \u0027orderedList\u0027,\n    attrs: { order: 1 },\n    content: items.slice(0, 40).map(item =\u003e ({ type: \u0027listItem\u0027, content: [paragraph(textNode(item))] }))\n  };\n};\n\nconst sourceLabelMap = {\n  BRD: \u0027Business requirements document\u0027,\n  FRD: \u0027Functional requirements document\u0027,\n  PRD: \u0027Product requirements document\u0027,\n  SRS: \u0027Software requirements specification\u0027,\n  HLD: \u0027High-level design\u0027,\n  LLD: \u0027Low-level design\u0027,\n  UI_UX: \u0027UI/UX artifact\u0027,\n  API_SPEC: \u0027API specification\u0027,\n  DATA_MODEL: \u0027Data model\u0027,\n  TRANSCRIPT: \u0027Stakeholder transcript\u0027,\n  TEST_CASES: \u0027Test cases\u0027,\n  TEST_PLAN: \u0027Test plan\u0027,\n  UNKNOWN: \u0027Source document\u0027\n};\n\nconst normalizeSourceType = value =\u003e {\n  const text = cleanText(value).toUpperCase().replace(/[^A-Z0-9]+/g, \u0027_\u0027).replace(/^_+|_+$/g, \u0027\u0027);\n  if (!text) return \u0027UNKNOWN\u0027;\n  if (text === \u0027UI\u0027 || text === \u0027UX\u0027 || text === \u0027UIUX\u0027 || text === \u0027UI_UX\u0027) return \u0027UI_UX\u0027;\n  if (text === \u0027API\u0027 || text === \u0027API_SPECIFICATION\u0027) return \u0027API_SPEC\u0027;\n  if (text === \u0027DATA\u0027 || text === \u0027DATA_MODEL_DOCUMENT\u0027) return \u0027DATA_MODEL\u0027;\n  if (text === \u0027TEST_CASE\u0027 || text === \u0027TEST_CASES_DOCUMENT\u0027) return \u0027TEST_CASES\u0027;\n  if (text === \u0027TEST_PLAN_DOCUMENT\u0027) return \u0027TEST_PLAN\u0027;\n  return text;\n};\n\nconst sourceLabel = value =\u003e {\n  const type = normalizeSourceType(value);\n  if (sourceLabelMap[type]) return sourceLabelMap[type];\n  return type.toLowerCase().replace(/_/g, \u0027 \u0027).replace(/\\b\\w/g, char =\u003e char.toUpperCase()) || \u0027Source document\u0027;\n};\n\nconst chunkPrefix = value =\u003e {\n  const text = cleanText(value);\n  if (!text) return \u0027\u0027;\n  return (text.split(\u0027|\u0027)[0] || text).replace(/\\.+$/g, \u0027\u0027).slice(0, 12);\n};\n\nconst shortChunkId = value =\u003e {\n  const prefix = chunkPrefix(value);\n  if (!prefix) return \u0027\u0027;\n  return cleanText(value).length \u003e prefix.length ? prefix + \u0027...\u0027 : prefix;\n};\n\nconst parseTraceText = textValue =\u003e {\n  const text = cleanText(textValue);\n  if (!text) return [];\n  if (text.includes(\u0027;\u0027)) return text.split(\u0027;\u0027).flatMap(part =\u003e parseTraceText(part));\n  const typeMatch = text.match(/\\b(BRD|FRD|PRD|SRS|HLD|LLD|UI[\\s_/-]*UX|API[\\s_/-]*SPEC|DATA[\\s_/-]*MODEL|TRANSCRIPT|TEST[\\s_/-]*(?:CASES?|PLAN)|UNKNOWN)\\b/i);\n  const sourceType = normalizeSourceType(typeMatch ? typeMatch[1] : \u0027\u0027);\n  const chunkMatch = text.match(/(?:chunk\\s+|\\/)([A-Za-z0-9-]+(?:\\.\\.\\.)?(?:\\|[^\\s;,)]*)?)/i);\n  const chunkId = chunkMatch ? chunkMatch[1] : \u0027\u0027;\n  const pipeParts = chunkId ? chunkId.split(\u0027|\u0027) : [];\n  const section = pipeParts.length \u003e 1 ? pipeParts[1] : \u0027\u0027;\n  const contentSource = pipeParts.length \u003e 3 ? pipeParts[3] : \u0027\u0027;\n  if (typeMatch || chunkId) {\n    return [{ sourceType, chunkId, section, contentSource, raw: text }];\n  }\n  return [{ sourceType: \u0027UNKNOWN\u0027, evidence: text, raw: text }];\n};\n\nconst parseTraceEntry = value =\u003e {\n  if (value === null || value === undefined) return [];\n  if (Array.isArray(value)) return value.flatMap(parseTraceEntry);\n  if (typeof value === \u0027object\u0027) {\n    const sourceType = normalizeSourceType(value.docType || value.documentType || value.sourceType || value.artifactType || value.source || value.documentCategory);\n    const chunkId = cleanText(value.chunkId || value.chunk_id || value.id || \u0027\u0027);\n    const section = cleanText(value.sectionTitle || value.section || value.heading || value.page || value.pageNumber || value.chunkIndex || \u0027\u0027);\n    const contentSource = cleanText(value.contentSource || value.sourceFormat || value.mode || \u0027\u0027);\n    const evidence = cleanText(value.evidence || value.excerpt || value.summary || value.text || value.content || \u0027\u0027);\n    return [{ sourceType, chunkId, section, contentSource, evidence, raw: traceLine(value) }];\n  }\n  return parseTraceText(value);\n};\n\nconst traceabilityNodes = (...values) =\u003e {\n  const parsedEntries = values.flatMap(parseTraceEntry);\n  const detailedChunkKeys = new Set(parsedEntries\n    .filter(entry =\u003e entry.chunkId \u0026\u0026 (entry.section || entry.contentSource || cleanText(entry.chunkId).includes(\u0027|\u0027)))\n    .map(entry =\u003e normalizeSourceType(entry.sourceType) + \u0027|\u0027 + chunkPrefix(entry.chunkId))\n    .filter(key =\u003e !key.endsWith(\u0027|\u0027)));\n\n  const seen = new Set();\n  const entries = parsedEntries.filter(entry =\u003e {\n    const compactKey = normalizeSourceType(entry.sourceType) + \u0027|\u0027 + chunkPrefix(entry.chunkId);\n    const isCompactDuplicate = entry.chunkId \u0026\u0026 !entry.section \u0026\u0026 !entry.contentSource \u0026\u0026 !cleanText(entry.chunkId).includes(\u0027|\u0027) \u0026\u0026 detailedChunkKeys.has(compactKey);\n    if (isCompactDuplicate) return false;\n    const key = [entry.sourceType, entry.chunkId, entry.section, entry.contentSource, entry.evidence || entry.raw].map(cleanText).join(\u0027|\u0027);\n    if (!key || seen.has(key)) return false;\n    seen.add(key);\n    return true;\n  });\n  if (!entries.length) return null;\n\n  const evidenceSeen = new Set();\n  const evidenceLines = [];\n  for (const entry of entries) {\n    const label = sourceLabel(entry.sourceType);\n    const detail = cleanText(entry.evidence).slice(0, 220);\n    const line = detail\n      ? label + \u0027: \u0027 + detail\n      : label + \u0027: source evidence referenced by the generated backlog.\u0027;\n    if (!evidenceSeen.has(line)) {\n      evidenceSeen.add(line);\n      evidenceLines.push(line);\n    }\n  }\n\n  const internalLines = entries.map(entry =\u003e {\n    const parts = [sourceLabel(entry.sourceType)];\n    if (entry.section) parts.push(\u0027section/page \u0027 + entry.section);\n    if (entry.contentSource) parts.push(entry.contentSource === \u0027image\u0027 ? \u0027visual extract\u0027 : entry.contentSource + \u0027 extract\u0027);\n    if (entry.chunkId) parts.push(\u0027chunk \u0027 + shortChunkId(entry.chunkId));\n    return parts.join(\u0027, \u0027);\n  }).filter(Boolean);\n\n  const nodes = [paragraph(textNode(\u0027Evidence used:\u0027, [mark(\u0027strong\u0027)])), bulletList(evidenceLines)];\n  if (internalLines.length) {\n    nodes.push(paragraph(textNode(\u0027Internal references:\u0027, [mark(\u0027strong\u0027)])), bulletList(internalLines));\n  }\n  return nodes;\n};\n\nconst section = (title, bodyNodes) =\u003e {\n  const nodes = Array.isArray(bodyNodes) ? bodyNodes : [bodyNodes];\n  const filtered = nodes.filter(Boolean);\n  return filtered.length ? [heading(title), ...filtered] : [];\n};\nconst makeDoc = content =\u003e ({ type: \u0027doc\u0027, version: 1, content: content.flat().filter(Boolean) });\n\nconst epicDescriptionAdf = epic =\u003e {\n  const childStories = Array.isArray(epic.stories) ? epic.stories : [];\n  const childStoryLines = childStories.map((story, index) =\u003e {\n    const item = story \u0026\u0026 typeof story === \u0027object\u0027 ? story : {};\n    return cleanText(item.summary || item.feature || item.title || item.userStory || item.userStoryDescription || item.description || (\u0027Story \u0027 + String(index + 1)));\n  }).filter(Boolean);\n\n  return makeDoc([\n    paragraph(textNode(\u0027Quality Gate: \u0027, [mark(\u0027strong\u0027)]), textNode(\u0027Passed | Adaptive story count enabled | Team Managed Jira\u0027)),\n    paragraph(textNode(\u0027Q-Ops Job: \u0027, [mark(\u0027strong\u0027)]), textNode(root.jobId || \u0027\u0027)),\n    rule(),\n    ...section(\u0027Business Outcome\u0027, paragraph(textNode(epic.businessOutcome || epic.businessObjective || epic.epicSummary || \u0027\u0027))),\n    ...section(\u0027Epic Summary\u0027, paragraph(textNode(epic.epicSummary || epic.epicDescription || \u0027\u0027))),\n    ...section(\u0027Epic Description\u0027, paragraph(textNode(epic.epicDescription || epic.epicSummary || \u0027\u0027))),\n    ...section(\u0027Story Count Rationale\u0027, paragraph(textNode(epic.storyCountRationale || \u0027The story count was selected based on available source evidence and implementation boundaries.\u0027))),\n    ...section(\u0027Success Metrics\u0027, bulletList(epic.successMetrics || [])),\n    ...section(\u0027Child Stories Planned\u0027, bulletList(childStoryLines)),\n    ...section(\u0027Priority\u0027, paragraph(textNode(epic.priority || \u0027Medium\u0027))),\n    ...section(\u0027Source Traceability\u0027, traceabilityNodes(epic.sourceTraceability, epic.sourceReferences))\n  ]);\n};\n\nreturn root.epics.map((epic, index) =\u003e {\n  const issueType = root.epicIssueTypeId ? { id: String(root.epicIssueTypeId) } : { name: root.epicIssueTypeName || \u0027Epic\u0027 };\n  const project = root.jiraProjectId ? { id: String(root.jiraProjectId) } : { key: root.jiraProjectKey };\n  const stableLabel = labelSafe(root.idempotencyLabelPrefix + \u0027-\u0027 + root.jiraProjectKey + \u0027-epic-\u0027 + (epic.epicCorrelationId || epic.epicName));\n  const labels = [\u0027qops-generated\u0027, \u0027qa-backlog\u0027, \u0027qops-pro\u0027, \u0027quality-gate-passed\u0027, \u0027adaptive-story-count\u0027, stableLabel];\n  const jiraEpicPayload = {\n    fields: {\n      project,\n      issuetype: issueType,\n      summary: String(epic.epicName || \u0027Generated Epic\u0027).slice(0, 255),\n      description: epicDescriptionAdf(epic),\n      labels: labels.filter(Boolean)\n    }\n  };\n  const jiraEpicSearchJql = \u0027project = \u0027 + root.jiraProjectKey + \u0027 AND issuetype = \"\u0027 + (root.epicIssueTypeName || \u0027Epic\u0027) + \u0027\" AND labels = \"\u0027 + stableLabel + \u0027\" ORDER BY updated DESC\u0027;\n  return { json: { ...root, epic, epicIndex: index, epicCorrelationId: epic.epicCorrelationId, stableEpicLabel: stableLabel, jiraEpicSearchJql, jiraEpicPayload } };\n});"
}
```

### Prepare Story Search Items

| Field | Value |
| --- | --- |
| Node ID | ba6180d3-9c72-4395-ba01-d247fbd7ddf3 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2928, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Collect Team Managed Epic Jira Map -> Prepare Story Search Items (output 0, input 0)

**Outgoing Connections**

- Prepare Story Search Items -> Search Existing Story in Jira (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const root = $json;\n\nconst cleanText = value =\u003e {\n  if (value === null || value === undefined) return \u0027\u0027;\n  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean).join(\u0027\\n\u0027);\n  if (typeof value === \u0027object\u0027) return JSON.stringify(value);\n  return String(value).replace(/\\r/g, \u0027\u0027).trim();\n};\n\nconst traceLine = value =\u003e {\n  if (value === null || value === undefined) return \u0027\u0027;\n  if (Array.isArray(value)) return value.map(traceLine).filter(Boolean).join(\u0027\\n\u0027);\n  if (typeof value === \u0027string\u0027) {\n    const text = value.trim();\n    if (!text || text === \u0027[object Object]\u0027) return \u0027\u0027;\n    if (text.startsWith(\u0027{\u0027) || text.startsWith(\u0027[\u0027)) {\n      try { return traceLine(JSON.parse(text)); } catch (error) {}\n    }\n    return text;\n  }\n  if (typeof value === \u0027object\u0027) {\n    const parts = [];\n    const source = value.source || value.fileName || value.file_name || value.document || value.documentType || value.document_type || value.title;\n    const section = value.section || value.heading || value.page || value.chunkId || value.chunk_id;\n    const excerpt = value.excerpt || value.text || value.content || value.evidence || value.summary;\n    const score = value.score ?? value.similarity ?? value.distance;\n    if (source) parts.push(\u0027Source: \u0027 + cleanText(source));\n    if (section) parts.push(\u0027Section: \u0027 + cleanText(section));\n    if (excerpt) parts.push(\u0027Evidence: \u0027 + cleanText(excerpt).slice(0, 500));\n    if (score !== undefined \u0026\u0026 score !== null) parts.push(\u0027Score: \u0027 + String(score));\n    if (parts.length) return parts.join(\u0027 | \u0027);\n    return Object.entries(value)\n      .filter(([_, v]) =\u003e v !== null \u0026\u0026 v !== undefined \u0026\u0026 typeof v !== \u0027object\u0027)\n      .map(([k, v]) =\u003e k + \u0027: \u0027 + cleanText(v))\n      .join(\u0027 | \u0027);\n  }\n  return cleanText(value);\n};\n\nconst traceList = (...values) =\u003e values\n  .flatMap(value =\u003e Array.isArray(value) ? value : [value])\n  .map(traceLine)\n  .flatMap(line =\u003e cleanText(line).split(/\\n+/))\n  .map(line =\u003e line.trim())\n  .filter(Boolean);\n\nconst normalizeArray = value =\u003e {\n  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);\n  const text = cleanText(value);\n  if (!text) return [];\n  return text.split(/\\n+/).map(line =\u003e line.replace(/^[-*]\\s*/, \u0027\u0027).trim()).filter(Boolean);\n};\n\nconst labelSafe = value =\u003e String(value || \u0027\u0027).toLowerCase().replace(/[^a-z0-9-]/g, \u0027-\u0027).replace(/-+/g, \u0027-\u0027).replace(/^-|-$/g, \u0027\u0027).slice(0, 60);\nconst mark = type =\u003e ({ type });\nconst textNode = (value, marks = []) =\u003e {\n  const text = cleanText(value).slice(0, 12000);\n  if (!text) return null;\n  return marks.length ? { type: \u0027text\u0027, text, marks } : { type: \u0027text\u0027, text };\n};\nconst paragraph = (...parts) =\u003e ({ type: \u0027paragraph\u0027, content: parts.flat().filter(Boolean) });\nconst heading = (value, level = 3) =\u003e ({ type: \u0027heading\u0027, attrs: { level }, content: [textNode(value)] });\nconst rule = () =\u003e ({ type: \u0027rule\u0027 });\nconst labeledParagraph = (label, value) =\u003e {\n  const text = cleanText(value);\n  if (!text) return null;\n  return paragraph(textNode(label + \u0027: \u0027, [mark(\u0027strong\u0027)]), textNode(text));\n};\nconst bulletList = values =\u003e {\n  const items = normalizeArray(values);\n  if (!items.length) return null;\n  return {\n    type: \u0027bulletList\u0027,\n    content: items.slice(0, 60).map(item =\u003e ({ type: \u0027listItem\u0027, content: [paragraph(textNode(item))] }))\n  };\n};\nconst orderedList = values =\u003e {\n  const items = normalizeArray(values);\n  if (!items.length) return null;\n  return {\n    type: \u0027orderedList\u0027,\n    attrs: { order: 1 },\n    content: items.slice(0, 60).map(item =\u003e ({ type: \u0027listItem\u0027, content: [paragraph(textNode(item))] }))\n  };\n};\n\nconst sourceLabelMap = {\n  BRD: \u0027Business requirements document\u0027,\n  FRD: \u0027Functional requirements document\u0027,\n  PRD: \u0027Product requirements document\u0027,\n  SRS: \u0027Software requirements specification\u0027,\n  HLD: \u0027High-level design\u0027,\n  LLD: \u0027Low-level design\u0027,\n  UI_UX: \u0027UI/UX artifact\u0027,\n  API_SPEC: \u0027API specification\u0027,\n  DATA_MODEL: \u0027Data model\u0027,\n  TRANSCRIPT: \u0027Stakeholder transcript\u0027,\n  TEST_CASES: \u0027Test cases\u0027,\n  TEST_PLAN: \u0027Test plan\u0027,\n  UNKNOWN: \u0027Source document\u0027\n};\n\nconst normalizeSourceType = value =\u003e {\n  const text = cleanText(value).toUpperCase().replace(/[^A-Z0-9]+/g, \u0027_\u0027).replace(/^_+|_+$/g, \u0027\u0027);\n  if (!text) return \u0027UNKNOWN\u0027;\n  if (text === \u0027UI\u0027 || text === \u0027UX\u0027 || text === \u0027UIUX\u0027 || text === \u0027UI_UX\u0027) return \u0027UI_UX\u0027;\n  if (text === \u0027API\u0027 || text === \u0027API_SPECIFICATION\u0027) return \u0027API_SPEC\u0027;\n  if (text === \u0027DATA\u0027 || text === \u0027DATA_MODEL_DOCUMENT\u0027) return \u0027DATA_MODEL\u0027;\n  if (text === \u0027TEST_CASE\u0027 || text === \u0027TEST_CASES_DOCUMENT\u0027) return \u0027TEST_CASES\u0027;\n  if (text === \u0027TEST_PLAN_DOCUMENT\u0027) return \u0027TEST_PLAN\u0027;\n  return text;\n};\n\nconst sourceLabel = value =\u003e {\n  const type = normalizeSourceType(value);\n  if (sourceLabelMap[type]) return sourceLabelMap[type];\n  return type.toLowerCase().replace(/_/g, \u0027 \u0027).replace(/\\b\\w/g, char =\u003e char.toUpperCase()) || \u0027Source document\u0027;\n};\n\nconst chunkPrefix = value =\u003e {\n  const text = cleanText(value);\n  if (!text) return \u0027\u0027;\n  return (text.split(\u0027|\u0027)[0] || text).replace(/\\.+$/g, \u0027\u0027).slice(0, 12);\n};\n\nconst shortChunkId = value =\u003e {\n  const prefix = chunkPrefix(value);\n  if (!prefix) return \u0027\u0027;\n  return cleanText(value).length \u003e prefix.length ? prefix + \u0027...\u0027 : prefix;\n};\n\nconst parseTraceText = textValue =\u003e {\n  const text = cleanText(textValue);\n  if (!text) return [];\n  if (text.includes(\u0027;\u0027)) return text.split(\u0027;\u0027).flatMap(part =\u003e parseTraceText(part));\n  const typeMatch = text.match(/\\b(BRD|FRD|PRD|SRS|HLD|LLD|UI[\\s_/-]*UX|API[\\s_/-]*SPEC|DATA[\\s_/-]*MODEL|TRANSCRIPT|TEST[\\s_/-]*(?:CASES?|PLAN)|UNKNOWN)\\b/i);\n  const sourceType = normalizeSourceType(typeMatch ? typeMatch[1] : \u0027\u0027);\n  const chunkMatch = text.match(/(?:chunk\\s+|\\/)([A-Za-z0-9-]+(?:\\.\\.\\.)?(?:\\|[^\\s;,)]*)?)/i);\n  const chunkId = chunkMatch ? chunkMatch[1] : \u0027\u0027;\n  const pipeParts = chunkId ? chunkId.split(\u0027|\u0027) : [];\n  const section = pipeParts.length \u003e 1 ? pipeParts[1] : \u0027\u0027;\n  const contentSource = pipeParts.length \u003e 3 ? pipeParts[3] : \u0027\u0027;\n  if (typeMatch || chunkId) {\n    return [{ sourceType, chunkId, section, contentSource, raw: text }];\n  }\n  return [{ sourceType: \u0027UNKNOWN\u0027, evidence: text, raw: text }];\n};\n\nconst parseTraceEntry = value =\u003e {\n  if (value === null || value === undefined) return [];\n  if (Array.isArray(value)) return value.flatMap(parseTraceEntry);\n  if (typeof value === \u0027object\u0027) {\n    const sourceType = normalizeSourceType(value.docType || value.documentType || value.sourceType || value.artifactType || value.source || value.documentCategory);\n    const chunkId = cleanText(value.chunkId || value.chunk_id || value.id || \u0027\u0027);\n    const section = cleanText(value.sectionTitle || value.section || value.heading || value.page || value.pageNumber || value.chunkIndex || \u0027\u0027);\n    const contentSource = cleanText(value.contentSource || value.sourceFormat || value.mode || \u0027\u0027);\n    const evidence = cleanText(value.evidence || value.excerpt || value.summary || value.text || value.content || \u0027\u0027);\n    return [{ sourceType, chunkId, section, contentSource, evidence, raw: traceLine(value) }];\n  }\n  return parseTraceText(value);\n};\n\nconst traceabilityNodes = (...values) =\u003e {\n  const parsedEntries = values.flatMap(parseTraceEntry);\n  const detailedChunkKeys = new Set(parsedEntries\n    .filter(entry =\u003e entry.chunkId \u0026\u0026 (entry.section || entry.contentSource || cleanText(entry.chunkId).includes(\u0027|\u0027)))\n    .map(entry =\u003e normalizeSourceType(entry.sourceType) + \u0027|\u0027 + chunkPrefix(entry.chunkId))\n    .filter(key =\u003e !key.endsWith(\u0027|\u0027)));\n\n  const seen = new Set();\n  const entries = parsedEntries.filter(entry =\u003e {\n    const compactKey = normalizeSourceType(entry.sourceType) + \u0027|\u0027 + chunkPrefix(entry.chunkId);\n    const isCompactDuplicate = entry.chunkId \u0026\u0026 !entry.section \u0026\u0026 !entry.contentSource \u0026\u0026 !cleanText(entry.chunkId).includes(\u0027|\u0027) \u0026\u0026 detailedChunkKeys.has(compactKey);\n    if (isCompactDuplicate) return false;\n    const key = [entry.sourceType, entry.chunkId, entry.section, entry.contentSource, entry.evidence || entry.raw].map(cleanText).join(\u0027|\u0027);\n    if (!key || seen.has(key)) return false;\n    seen.add(key);\n    return true;\n  });\n  if (!entries.length) return null;\n\n  const evidenceSeen = new Set();\n  const evidenceLines = [];\n  for (const entry of entries) {\n    const label = sourceLabel(entry.sourceType);\n    const detail = cleanText(entry.evidence).slice(0, 220);\n    const line = detail\n      ? label + \u0027: \u0027 + detail\n      : label + \u0027: source evidence referenced by the generated backlog.\u0027;\n    if (!evidenceSeen.has(line)) {\n      evidenceSeen.add(line);\n      evidenceLines.push(line);\n    }\n  }\n\n  const internalLines = entries.map(entry =\u003e {\n    const parts = [sourceLabel(entry.sourceType)];\n    if (entry.section) parts.push(\u0027section/page \u0027 + entry.section);\n    if (entry.contentSource) parts.push(entry.contentSource === \u0027image\u0027 ? \u0027visual extract\u0027 : entry.contentSource + \u0027 extract\u0027);\n    if (entry.chunkId) parts.push(\u0027chunk \u0027 + shortChunkId(entry.chunkId));\n    return parts.join(\u0027, \u0027);\n  }).filter(Boolean);\n\n  const nodes = [paragraph(textNode(\u0027Evidence used:\u0027, [mark(\u0027strong\u0027)])), bulletList(evidenceLines)];\n  if (internalLines.length) {\n    nodes.push(paragraph(textNode(\u0027Internal references:\u0027, [mark(\u0027strong\u0027)])), bulletList(internalLines));\n  }\n  return nodes;\n};\n\nconst section = (title, bodyNodes) =\u003e {\n  const nodes = Array.isArray(bodyNodes) ? bodyNodes : [bodyNodes];\n  const filtered = nodes.filter(Boolean);\n  return filtered.length ? [heading(title), ...filtered] : [];\n};\nconst makeDoc = content =\u003e ({ type: \u0027doc\u0027, version: 1, content: content.flat().filter(Boolean) });\n\nconst splitFlow = value =\u003e {\n  const lines = normalizeArray(value);\n  if (lines.length \u003e 1) return lines;\n  const text = cleanText(value);\n  if (!text) return [];\n  return text.split(/\\s*(?:\\d+\\.|-\u003e|=\u003e)\\s*/).map(x =\u003e x.trim()).filter(Boolean);\n};\n\nconst storyDescriptionAdf = (story, epic, jiraEpic) =\u003e makeDoc([\n  paragraph(textNode(\u0027Quality Gate: \u0027, [mark(\u0027strong\u0027)]), textNode(\u0027Passed | Team Managed parent link applied\u0027)),\n  paragraph(textNode(\u0027Parent Epic: \u0027, [mark(\u0027strong\u0027)]), textNode((jiraEpic \u0026\u0026 jiraEpic.jiraEpicKey) || epic.epicCorrelationId || \u0027\u0027)),\n  paragraph(textNode(\u0027Q-Ops Job: \u0027, [mark(\u0027strong\u0027)]), textNode(root.jobId || \u0027\u0027)),\n  rule(),\n  ...section(\u0027User Story\u0027, paragraph(textNode(story.userStory || \u0027\u0027))),\n  ...section(\u0027Business Context\u0027, paragraph(textNode(story.businessContext || story.userStoryDescription || \u0027\u0027))),\n  ...section(\u0027Detailed Description\u0027, paragraph(textNode(story.userStoryDescription || story.description || \u0027\u0027))),\n  ...section(\u0027Primary Flow\u0027, orderedList(splitFlow(story.primaryFlow))),\n  ...section(\u0027Alternate Flows\u0027, bulletList(story.alternateFlows || [])),\n  ...section(\u0027Exception Handling\u0027, bulletList(story.exceptionHandling || [])),\n  ...section(\u0027Acceptance Criteria\u0027, orderedList(story.acceptanceCriteria || [])),\n  ...section(\u0027UI / UX Requirements\u0027, bulletList(story.uiUxRequirements || [])),\n  ...section(\u0027Field Validation Rules\u0027, bulletList(story.fieldValidationRules || [])),\n  ...section(\u0027Data And Integration Requirements\u0027, bulletList(story.dataIntegrationRequirements || [])),\n  ...section(\u0027Performance And NFRs\u0027, bulletList(story.performanceNFRs || story.nonFunctionalConsiderations || [])),\n  ...section(\u0027Test Scenarios\u0027, bulletList(story.testScenarios || [])),\n  ...section(\u0027QA Notes\u0027, bulletList(story.testNotes || [])),\n  ...section(\u0027Dependencies And Assumptions\u0027, [\n    bulletList(story.dependencies || []),\n    bulletList(story.assumptions || [])\n  ]),\n  ...section(\u0027Estimation And Automation\u0027, [\n    labeledParagraph(\u0027Priority\u0027, story.priority || \u0027Medium\u0027),\n    labeledParagraph(\u0027Story Points\u0027, story.storyPoints ?? \u0027Not estimated\u0027),\n    labeledParagraph(\u0027Automation Feasibility\u0027, story.automationFeasibility || \u0027\u0027)\n  ]),\n  ...section(\u0027Source Traceability\u0027, traceabilityNodes(story.sourceTraceability, story.sourceReferences))\n]);\n\nconst items = [];\nfor (const epic of root.epics) {\n  const jiraEpic = root.epicMap[epic.epicCorrelationId];\n  for (const story of epic.stories || []) {\n    const issueType = root.storyIssueTypeId ? { id: String(root.storyIssueTypeId) } : { name: root.storyIssueTypeName || \u0027Story\u0027 };\n    const project = root.jiraProjectId ? { id: String(root.jiraProjectId) } : { key: root.jiraProjectKey };\n    const stableLabel = labelSafe(root.idempotencyLabelPrefix + \u0027-\u0027 + root.jiraProjectKey + \u0027-story-\u0027 + (story.storyCorrelationId || story.summary));\n    const labels = [\u0027qops-generated\u0027, \u0027qa-story\u0027, \u0027qops-pro\u0027, \u0027quality-gate-passed\u0027, stableLabel, labelSafe(epic.epicCorrelationId)];\n    const fields = {\n      project,\n      issuetype: issueType,\n      summary: String(story.summary || \u0027Generated Story\u0027).slice(0, 255),\n      description: storyDescriptionAdf(story, epic, jiraEpic),\n      labels: labels.filter(Boolean),\n      parent: { key: jiraEpic.jiraEpicKey }\n    };\n    const jiraStorySearchJql = \u0027project = \u0027 + root.jiraProjectKey + \u0027 AND issuetype = \"\u0027 + (root.storyIssueTypeName || \u0027Story\u0027) + \u0027\" AND labels = \"\u0027 + stableLabel + \u0027\" ORDER BY updated DESC\u0027;\n    items.push({ json: { ...root, epicCorrelationId: epic.epicCorrelationId, storyCorrelationId: story.storyCorrelationId, story, jiraEpic, stableStoryLabel: stableLabel, jiraStorySearchJql, jiraStoryPayload: { fields } } });\n  }\n}\nreturn items;"
}
```

### Professional Prompt Library

| Field | Value |
| --- | --- |
| Node ID | a59ce203-a0b9-4f71-bc6a-f9c1ab7a04b4 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Live Update Context -> Professional Prompt Library (output 0, input 0)

**Outgoing Connections**

- Professional Prompt Library -> Backlog Delta Gate (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst request = $json || {};\nconst documentType = request.documentType || \u0027user_stories\u0027;\nconst retrievalContext = Array.isArray(request.retrievalContext) ? request.retrievalContext : [];\nconst groupedEvidence = request.groupedEvidence || {};\nconst retrievalProfile = request.retrievalProfile || {};\nconst updateContext = request.updateContext \u0026\u0026 typeof request.updateContext === \u0027object\u0027 ? request.updateContext : {};\nconst updateMode = String(request.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027 \u0026\u0026 Object.keys(updateContext).length \u003e 0;\n\nconst formatChunk = (chunk, index) =\u003e {\n  const metadataLines = [\n    \u0027Chunk \u0027 + (index + 1),\n    \u0027Source: \u0027 + (chunk.source || \u0027Unknown\u0027),\n    \u0027DocType: \u0027 + (chunk.docType || \u0027UNKNOWN\u0027),\n    \u0027Category: \u0027 + (chunk.documentCategory || \u0027Not specified\u0027),\n    \u0027Artifact: \u0027 + (chunk.artifactType || \u0027Not specified\u0027),\n    \u0027Section: \u0027 + (chunk.section || \u0027Not specified\u0027),\n    \u0027Content Source: \u0027 + (chunk.contentSource || \u0027Not specified\u0027) + (chunk.hasVisionContent ? \u0027 | vision evidence present\u0027 : \u0027\u0027),\n    \u0027Profile Score: \u0027 + (chunk.profileScore ?? \u0027Not scored\u0027),\n    \u0027Profile Match: \u0027 + ((chunk.profileMatchReasons || []).join(\u0027; \u0027) || \u0027General project evidence\u0027),\n    \u0027Chunk ID: \u0027 + (chunk.chunkId || \u0027Not available\u0027),\n    \u0027Project: \u0027 + (chunk.project || request.projectName || \u0027Not specified\u0027),\n    \u0027Excerpt: \u0027 + (chunk.excerpt || \u0027\u0027)\n  ];\n  return metadataLines.join(\u0027\\n\u0027);\n};\n\nconst profileSummary = [\n  \u0027Retrieval profile: \u0027 + (retrievalProfile.label || retrievalProfile.key || \u0027General QA Document\u0027),\n  \u0027Profile intent: \u0027 + (retrievalProfile.intent || \u0027Use project evidence to generate the requested document.\u0027),\n  \u0027Hard metadata filter: project = \u0027 + (request.projectName || \u0027Unknown Project\u0027),\n  \u0027Preferred docTypes: \u0027 + ((retrievalProfile.primaryDocTypes || []).concat(retrievalProfile.secondaryDocTypes || []).join(\u0027, \u0027) || \u0027Any\u0027),\n  \u0027Preferred categories: \u0027 + ((retrievalProfile.preferredCategories || []).join(\u0027, \u0027) || \u0027Any\u0027),\n  \u0027Preferred artifacts: \u0027 + ((retrievalProfile.preferredArtifacts || []).join(\u0027, \u0027) || \u0027Any\u0027),\n  \u0027Ranking mode: \u0027 + (retrievalProfile.rankingMode || \u0027project_filtered_metadata_profile_rerank\u0027)\n].join(\u0027\\n\u0027);\n\nconst previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];\nconst previousCoverageSummary = updateContext.previousCoverageSummary \u0026\u0026 typeof updateContext.previousCoverageSummary === \u0027object\u0027 ? updateContext.previousCoverageSummary : {};\nconst previousBatchSummary = updateContext.previousBatchSummary \u0026\u0026 typeof updateContext.previousBatchSummary === \u0027object\u0027 ? updateContext.previousBatchSummary : {};\nconst unresolvedCoverage = previousCoverageLedger.filter(row =\u003e {\n  const status = String(row.coverageStatus || row.status || \u0027\u0027).toLowerCase();\n  return status.includes(\u0027partial\u0027) || status.includes(\u0027missing\u0027) || status.includes(\u0027unknown\u0027) || status.includes(\u0027gap\u0027) || status.includes(\u0027review\u0027);\n});\nconst previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];\n  const previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];\n  const compactText = (value, max = 180) =\u003e String(value || \u0027\u0027).replace(/\\s+/g, \u0027 \u0027).trim().slice(0, max);\n  const compactPreviousEpics = previousEpics.map((epic, index) =\u003e ({\n    key: epic.jiraEpicKey || epic.epicKey || epic.key || null,\n    epicCorrelationId: epic.epicCorrelationId || epic.epicId || epic.jiraEpicKey || (\u0027PREV-EPIC-\u0027 + (index + 1)),\n    epicName: compactText(epic.epicName || epic.summary || epic.name, 120),\n    action: \u0027reuse\u0027\n  })).slice(0, 50);\n  const compactPreviousStories = previousStories.map((story, index) =\u003e ({\n    key: story.jiraStoryKey || story.storyKey || story.key || null,\n    storyCorrelationId: story.storyCorrelationId || story.userStoryId || story.storyId || story.jiraStoryKey || story.storyKey || (\u0027PREV-STORY-\u0027 + (index + 1)),\n    parentEpicKey: story.parentEpicKey || story.parentEpicCorrelationId || story.epicCorrelationId || null,\n    summary: compactText(story.summary || story.title, 140),\n    action: \u0027reuse\u0027\n  })).slice(0, 120);\n  const compactCoverageLedger = previousCoverageLedger.map((row, index) =\u003e ({\n    coverageId: row.coverageId || row.id || (\u0027PREV-COV-\u0027 + (index + 1)),\n    moduleRequirement: compactText(row.moduleRequirement || row.requirement || row.module, 140),\n    coverageStatus: row.coverageStatus || row.status || \u0027covered\u0027\n  })).slice(0, 60);\n  const compactUnresolvedCoverage = unresolvedCoverage.map((row, index) =\u003e ({\n    coverageId: row.coverageId || row.id || (\u0027UNRESOLVED-\u0027 + (index + 1)),\n    moduleRequirement: compactText(row.moduleRequirement || row.requirement || row.module, 140),\n    coverageStatus: row.coverageStatus || row.status || \u0027review\u0027,\n    notes: compactText(row.notes || row.reason, 160)\n  })).slice(0, 30);\n\n  const BACKLOG_DELTA_SEMANTIC_V1_PROMPT = true;\n  const BACKLOG_DELTA_SEMANTIC_V2_PROMPT = true;\n  const deltaTerms = [\n    \u0027supporting\u0027, \u0027delta\u0027, \u0027addendum\u0027, \u0027change request\u0027, \u0027change log\u0027, \u0027new requirement\u0027,\n    \u0027new scope\u0027, \u0027enhancement\u0027, \u0027supplement\u0027, \u0027coverage gap\u0027, \u0027gap closure\u0027, \u0027updated requirement\u0027,\n    \u0027loyalty\u0027, \u0027wallet\u0027, \u0027store credit\u0027, \u0027marketplace\u0027, \u0027split shipment\u0027, \u0027fraud\u0027,\n    \u0027privacy\u0027, \u0027compliance\u0027, \u0027support operation\u0027, \u0027support ops\u0027\n  ];\n  const extractRequirementIds = value =\u003e [...new Set((String(value || \u0027\u0027).toUpperCase().match(/\\b[A-Z]{2,10}[-_][A-Z0-9]{2,12}[-_]\\d{2,}\\b/g) || []).map(id =\u003e id.replace(/_/g, \u0027-\u0027)))];\n  const previousMissingDeltaIds = [...new Set([\n    ...extractRequirementIds(JSON.stringify(previousCoverageSummary.missingDeltaTargetIds || [])),\n    ...extractRequirementIds(JSON.stringify(previousCoverageSummary.missingItems || [])),\n    ...extractRequirementIds(JSON.stringify(previousCoverageSummary.partialItems || [])),\n    ...extractRequirementIds(JSON.stringify((Array.isArray(previousBatchSummary.batches) ? previousBatchSummary.batches : []).filter(batch =\u003e /partial|missing|review|unknown/i.test(String(batch.status || \u0027\u0027)))))\n  ])];\n  const hasRequirementId = value =\u003e extractRequirementIds(value).length \u003e 0;\n  const chunkText = chunk =\u003e [\n    chunk.source,\n    chunk.docType,\n    chunk.documentCategory,\n    chunk.artifactType,\n    chunk.section,\n    chunk.excerpt\n  ].filter(Boolean).join(\u0027 | \u0027);\n  const deltaPriority = chunk =\u003e {\n    const text = chunkText(chunk);\n    const lower = text.toLowerCase();\n    const source = String(chunk.source || \u0027\u0027).toLowerCase();\n    const docType = String(chunk.docType || \u0027\u0027).toUpperCase();\n    const ids = extractRequirementIds(text);\n    const supportingSource = /supporting|addendum|delta/.test(source);\n    if (docType === \u0027SUPPORTING\u0027) return 400;\n    if (supportingSource \u0026\u0026 ids.length) return 360;\n    if (supportingSource) return 320;\n    if (ids.length \u0026\u0026 /delta|addendum|change request|new requirement|supporting requirement|supporting functional|source type: supporting/.test(lower)) return 260;\n    if (chunk.deltaCandidate \u0026\u0026 Number(chunk.deltaPriority || 0) \u003e 0) return Number(chunk.deltaPriority);\n    return 0;\n  };\n  const isDeltaChunk = chunk =\u003e deltaPriority(chunk) \u003e 0;\n  const unresolvedText = unresolvedCoverage.map(row =\u003e [row.coverageId, row.moduleRequirement, row.requirement, row.notes].filter(Boolean).join(\u0027 \u0027)).join(\u0027 \u0027).toLowerCase();\n  const isUnresolvedFocusChunk = chunk =\u003e {\n    if (!unresolvedText) return false;\n    const text = chunkText(chunk).toLowerCase();\n    return unresolvedCoverage.some(row =\u003e {\n      const terms = String(row.moduleRequirement || row.requirement || row.coverageId || \u0027\u0027)\n        .toLowerCase()\n        .split(/[^a-z0-9]+/)\n        .filter(term =\u003e term.length \u003e= 5)\n        .slice(0, 8);\n      return terms.length \u0026\u0026 terms.some(term =\u003e text.includes(term));\n    });\n  };\n  const dedupeChunks = chunks =\u003e {\n    const seen = new Set();\n    return chunks.filter(chunk =\u003e {\n      const key = [chunk.chunkId, chunk.documentId, chunk.source, chunk.section, chunk.excerpt].filter(Boolean).join(\u0027|\u0027).slice(0, 260);\n      if (!key) return true;\n      if (seen.has(key)) return false;\n      seen.add(key);\n      return true;\n    });\n  };\n  const deltaEvidence = updateMode\n    ? retrievalContext.filter(isDeltaChunk).sort((a, b) =\u003e (deltaPriority(b) - deltaPriority(a)) || (Number(b.profileScore || 0) - Number(a.profileScore || 0)))\n    : [];\n  const isPreviousMissingDeltaChunk = chunk =\u003e {\n    if (!previousMissingDeltaIds.length) return false;\n    const ids = extractRequirementIds(chunkText(chunk));\n    return ids.some(id =\u003e previousMissingDeltaIds.includes(id));\n  };\n  const retryFocusEvidence = updateMode ? retrievalContext.filter(isPreviousMissingDeltaChunk) : [];\n  const unresolvedEvidence = updateMode ? retrievalContext.filter(chunk =\u003e isUnresolvedFocusChunk(chunk) || isPreviousMissingDeltaChunk(chunk)) : [];\n  const discoveredDeltaRequirementIds = deltaEvidence.flatMap(chunk =\u003e extractRequirementIds(chunkText(chunk)));\n  const deltaRequirementIds = [...new Set([...previousMissingDeltaIds, ...discoveredDeltaRequirementIds])];\n  const deltaTargetSummary = deltaRequirementIds.map(id =\u003e {\n    const chunk = [...retryFocusEvidence, ...deltaEvidence, ...retrievalContext].find(item =\u003e extractRequirementIds(chunkText(item)).includes(id)) || {};\n    return {\n      requirementId: id,\n      source: chunk.source || (previousMissingDeltaIds.includes(id) ? \u0027Previous coverage warning\u0027 : \u0027Delta evidence\u0027),\n      docType: chunk.docType || \u0027UNKNOWN\u0027,\n      section: chunk.section || \u0027\u0027,\n      excerpt: compactText(chunk.excerpt || \u0027Requirement carried forward from previous partial Backlog update coverage.\u0027, 260),\n      retryFocus: previousMissingDeltaIds.includes(id)\n    };\n  });\n  const promptSeed = updateMode\n    ? dedupeChunks([...retryFocusEvidence, ...deltaEvidence, ...unresolvedEvidence, ...retrievalContext])\n    : retrievalContext;\n  const deltaChunkLimit = updateMode ? 24 : retrievalContext.length;\n  const deltaExcerptLimit = updateMode ? 1800 : 2500;\n  const deltaGroupedLimit = updateMode ? 6 : 8;\n  const promptRetrievalContext = promptSeed.slice(0, deltaChunkLimit).map(chunk =\u003e ({\n    ...chunk,\n    excerpt: compactText(chunk.excerpt, deltaExcerptLimit)\n  }));\n  const promptGroupedEvidence = Object.fromEntries(Object.entries({\n    ...(groupedEvidence || {}),\n    ...(updateMode ? { delta: deltaEvidence } : {})\n  })\n    .filter(([_, chunks]) =\u003e Array.isArray(chunks) \u0026\u0026 chunks.length)\n    .map(([group, chunks]) =\u003e [group, dedupeChunks(chunks).slice(0, deltaGroupedLimit).map(chunk =\u003e ({\n      ...chunk,\n      excerpt: compactText(chunk.excerpt, updateMode ? 450 : 500)\n    }))]));\n\nconst retrievalEvidenceText = promptRetrievalContext.map(formatChunk).join(\u0027\\\\n\\\\n\u0027);\nconst groupedEvidenceText = Object.entries(promptGroupedEvidence)\n  .filter(([_, chunks]) =\u003e Array.isArray(chunks) \u0026\u0026 chunks.length)\n  .map(([group, chunks]) =\u003e {\n    const body = chunks.map((chunk, index) =\u003e {\n      return \u0027- \u0027 + [\n        chunk.docType || \u0027UNKNOWN\u0027,\n        chunk.source || \u0027Unknown source\u0027,\n        chunk.section || \u0027No section\u0027,\n        \u0027score=\u0027 + (chunk.profileScore ?? \u0027n/a\u0027),\n        String(chunk.excerpt || \u0027\u0027).slice(0, updateMode ? 450 : 500)\n      ].join(\u0027 | \u0027);\n    }).join(\u0027\\\\n\u0027);\n    return group.toUpperCase() + \u0027 EVIDENCE\\\\n\u0027 + body;\n  })\n  .join(\u0027\\\\n\\\\n\u0027);\nconst updateContextSummary = updateMode ? [\n  \u0027UPDATE MODE: This request updates an existing generated backlog. It is not a fresh create.\u0027,\n  \u0027Previous job id: \u0027 + (updateContext.previousJobId || request.updateOfJobId || \u0027not provided\u0027),\n  \u0027Previous Confluence URL: \u0027 + (updateContext.previousConfluenceUrl || \u0027not provided\u0027),\n  \u0027Existing epics: \u0027 + previousEpics.length,\n  \u0027Existing stories: \u0027 + previousStories.length,\n  \u0027Previous coverage ledger rows: \u0027 + previousCoverageLedger.length,\n  \u0027Unresolved coverage rows to resolve: \u0027 + unresolvedCoverage.length,\n  \u0027Delta target evidence chunks: \u0027 + deltaEvidence.length,\n  \u0027Delta target requirement IDs: \u0027 + (deltaRequirementIds.join(\u0027, \u0027) || \u0027none detected\u0027),\n  \u0027Update repair missing delta IDs from previous coverage: \u0027 + (previousMissingDeltaIds.join(\u0027, \u0027) || \u0027none\u0027),\n  \u0027Delta target sources: \u0027 + ([...retryFocusEvidence, ...deltaEvidence].map(chunk =\u003e [chunk.docType || \u0027UNKNOWN\u0027, chunk.source || \u0027Unknown source\u0027, chunk.section || \u0027No section\u0027].join(\u0027 | \u0027)).slice(0, 12).join(\u0027; \u0027) || \u0027none detected\u0027),\n  \u0027Delta target details:\u0027,\n  JSON.stringify(deltaTargetSummary),\n  \u0027\u0027,\n  \u0027Existing epics snapshot:\u0027,\n  JSON.stringify(compactPreviousEpics),\n  \u0027\u0027,\n  \u0027Existing stories snapshot:\u0027,\n  JSON.stringify(compactPreviousStories),\n  \u0027\u0027,\n  \u0027Previous coverage ledger:\u0027,\n  JSON.stringify(compactCoverageLedger),\n  \u0027\u0027,\n  \u0027Unresolved coverage focus:\u0027,\n  JSON.stringify(compactUnresolvedCoverage)\n].join(\u0027\\n\u0027) : \u0027CREATE MODE: No previous generated backlog snapshot was supplied.\u0027;\n\nconst promptLibrary = {\n  user_stories: {\n    title: \u0027Rich Agile User Stories - Team Managed Jira\u0027,\n    promptLibraryVersion: \u0027professional-backlog-rich-v5-metadata-retrieval-profile\u0027,\n    system: [\n      \u0027You are a Senior Product Owner, Business Analyst, QA Architect, and Agile delivery consultant with 15+ years of experience.\u0027,\n      \u0027You translate BRD, FRD, PRD, SRS, HLD, LLD, UI/UX artifacts, stakeholder transcripts, API/data model notes, and QA artifacts into detailed INVEST-compliant Agile epics and user stories.\u0027,\n      \u0027A preflight Chroma retrieval gate has already run using metadata.project as the hard project boundary, then a metadata retrieval profile reranked evidence using docType, documentCategory, artifactType, contentSource, sectionTitle, and vision evidence.\u0027,\n      \u0027Use the highest-ranked retrieved chunks as authoritative context. Treat lower-ranked or unclassified chunks as supporting evidence, not primary evidence.\u0027,\n      \u0027You may use the Chroma vector-search tool again for follow-up lookups, but do not ignore the profiled preflight retrieval evidence.\u0027,\n      \u0027If no useful project evidence is available, do not invent generic backlog content. Return an empty sourceCoverage array so the workflow can stop before Jira creation.\u0027,\n      \u0027Return strict JSON only, matching the configured output parser schema. Do not include markdown outside JSON.\u0027,\n      \u0027This is a Team Managed Jira project. Stories will be linked to epics using parent.key after epics are created. Do not use the company-managed Epic Link custom field.\u0027,\n      updateMode ? \u0027Update mode is active. The DELTA TARGET EVIDENCE chunks are authoritative. Create or update backlog items only for those delta targets and unresolved coverage; do not rewrite unchanged backlog items. Previous live Jira items are merged back by the workflow after parsing.\u0027 : \u0027Create mode is active. Generate a complete first backlog from project evidence.\u0027,\n      \u0027\u0027,\n      \u0027Required output model:\u0027,\n      \u0027- In create mode: multiple epics, each representing one cohesive business capability. In update mode: only delta epics/stories needed for new or materially changed evidence.\u0027,\n      \u0027- Every returned epic must contain at least one child story, but the number of stories is adaptive.\u0027,\n      \u0027- Decide story count from source evidence and implementation complexity. A narrow epic may have 1 strong story; a complex epic may need many stories.\u0027,\n      \u0027- Do not pad epics with artificial, review-only, or placeholder stories just to reach a count.\u0027,\n      \u0027- Each epic must include epicCorrelationId, epicName, epicSummary, epicDescription, businessOutcome, businessObjective, successMetrics, priority, sourceReferences, sourceTraceability, and storyCountRationale.\u0027,\n      \u0027- storyCountRationale must briefly explain why the selected number of child stories is sufficient for that epic.\u0027,\n      \u0027- Each story must include storyCorrelationId, summary, feature, userStory, userStoryDescription, businessContext, primaryFlow, alternateFlows, exceptionHandling, acceptanceCriteria, uiUxRequirements, fieldValidationRules, dataIntegrationRequirements, performanceNFRs, testScenarios, dependencies, assumptions, sourceReferences, sourceTraceability, automationFeasibility, priority, storyPoints, nonFunctionalConsiderations, and testNotes.\u0027,\n      \u0027- Preserve source traceability with docType, source name, section/title, chunkId when available, and concise evidence. Prefer exact source names when available.\u0027,\n      \u0027- Acceptance criteria must use Given/When/Then wording and cover positive, negative, and edge-case behavior.\u0027,\n      \u0027- Stories should decompose UI, API/backend, validation, integration, error handling, security/compliance, and performance/NFR concerns where the source evidence supports that split.\u0027,\n      \u0027- Keep Jira summaries concise, but make descriptions rich and implementation/test ready.\u0027,\n      \u0027\u0027,\n      \u0027BACKLOG COVERAGE LEDGER REQUIREMENT:\u0027,\n      \u0027- The JSON must include document.coverageLedger as an array.\u0027,\n      \u0027- Each coverageLedger item must include coverageId, moduleRequirement, sourceReference, mappedEpicIds, mappedStoryIds, coverageStatus, and notes.\u0027,\n      \u0027- coverageStatus must be one of: covered, partial, missing, excluded.\u0027,\n      \u0027- In create mode, build ledger rows from all distinct modules, screens, workflows, integrations, business rules, NFRs, and requirements found in retrieved evidence. In update mode, build ledger rows only for new/changed evidence and unresolved coverage focus.\u0027,\n      \u0027- Do not silently drop source evidence. If an item is intentionally out of scope, mark excluded and explain why.\u0027,\n      \u0027- If an item is in scope, mappedEpicIds and mappedStoryIds must reference the generated epic/story correlation IDs that cover it.\u0027,\n      \u0027\u0027,\n      \u0027BATCHED BACKLOG GENERATION REQUIREMENT:\u0027,\n      \u0027- In create mode, plan generation in logical module batches before writing Jira backlog items. In update mode, plan only the delta modules.\u0027,\n      \u0027- Return document.batchPlan.modules with batchId, module, sourceReferences, intendedCoverageIds, and status.\u0027,\n      \u0027- Generate epics/stories batch-by-batch, then run a coverage review against document.coverageLedger.\u0027,\n      \u0027- If any in-scope module is missing or weak, retry only those missing/partial modules inside this same response and return document.retryBatches.\u0027,\n      \u0027- NFR backlog coverage must not remain silently partial: create explicit NFR/quality-enabler backlog items, map NFR acceptance criteria into relevant stories, or mark the NFR item excluded with a clear reason.\u0027,\n      \u0027- Merge recovered batch output into the final epics/stories arrays before returning JSON.\u0027,\n      \u0027- Return document.batchResults with completedBatches, retryingBatches, recoveredBatches, missingBatches, and notes.\u0027\n    ].join(\u0027\\n\u0027),\n    user: [\n      \u0027Generate a professional, context-grounded QA/Product backlog for a SaaS product using retrieved project knowledge.\u0027,\n      \u0027\u0027,\n      \u0027Project context:\u0027,\n      \u0027- Project name: \u0027 + (request.projectName || \u0027Q-Ops Agent\u0027),\n      \u0027- Generation mode: \u0027 + (updateMode ? \u0027update existing backlog\u0027 : \u0027create new backlog\u0027),\n      \u0027- Jira project key: \u0027 + ((request.jira \u0026\u0026 request.jira.projectKey) || request.jiraProjectKey || \u0027Not provided\u0027),\n      \u0027- Jira project type: Team Managed\u0027,\n      \u0027- Requested document type: \u0027 + documentType,\n      \u0027- Product owner: \u0027 + (request.productOwner || \u0027Not provided\u0027),\n      \u0027- Target Confluence space: \u0027 + ((request.confluence \u0026\u0026 request.confluence.spaceKey) || request.confluenceSpaceKey || \u0027Not provided\u0027),\n      \u0027- Chroma preflight chunk count: \u0027 + (request.retrievalQuality?.chunkCount || 0),\n      \u0027- Profile-selected chunk count: \u0027 + (request.retrievalQuality?.selectedChunkCount || retrievalContext.length),\n      \u0027- Profile matched chunk count: \u0027 + (request.retrievalQuality?.profileMatchedCount || 0),\n      \u0027- DocType coverage: \u0027 + ((request.retrievalQuality?.docTypeCoverage || []).join(\u0027, \u0027) || \u0027None\u0027),\n      \u0027- Chroma metadata hard filter: metadata.\u0027 + (request.retrievalQuality?.metadataFilterKey || \u0027project\u0027) + \u0027 = \u0027 + (request.retrievalQuality?.metadataFilterValue || request.projectName || \u0027Not provided\u0027),\n      \u0027\u0027,\n      \u0027Update context:\u0027,\n      updateContextSummary,\n      \u0027\u0027,\n      \u0027Retrieval profile configuration:\u0027,\n      profileSummary,\n      \u0027\u0027,\n      \u0027Grouped evidence summary:\u0027,\n      groupedEvidenceText || \u0027No grouped evidence was supplied.\u0027,\n      \u0027\u0027,\n      \u0027Retrieved project evidence from Chroma, already ranked by the retrieval profile:\u0027,\n      retrievalEvidenceText || \u0027No retrieved evidence was supplied.\u0027,\n      \u0027\u0027,\n      \u0027Critical requirements:\u0027,\n      \u00271. Use the profile-ranked Chroma evidence above as the primary source for every epic and story.\u0027,\n      \u00272. Prefer primary docTypes and grouped business/functional/UI evidence when defining scope, outcomes, flows, and acceptance criteria.\u0027,\n      \u00273. Use technical/API/data-model evidence to enrich integration, data, NFR, dependency, and implementation notes.\u0027,\n      \u00274. Use UI/UX and vision-derived evidence for screen behavior, user flows, validation, usability, and field-level rules.\u0027,\n      \u00275. Convert high-level features into epics with detailed epic descriptions, business objectives, success metrics, priority, and source traceability.\u0027,\n      \u00276. Decide the number of stories per epic dynamically. One story is acceptable for a narrow epic if it is complete, independently deliverable, testable, and well justified by storyCountRationale.\u0027,\n      \u00277. Split into more stories when the source evidence shows separate UI, API/backend, validation, integration, error handling, security/compliance, or performance/NFR work.\u0027,\n      \u00278. Do not create filler, placeholder, or review-only stories.\u0027,\n      \u00279. For each story, include detailed story description, business context, primary flow, alternate flows, exception handling, field validation, data integration, NFRs, test scenarios, dependencies, assumptions, source traceability, and automation feasibility.\u0027,\n      \u002710. Acceptance criteria must be concrete Given/When/Then statements. Include enough criteria to make the story testable.\u0027,\n      \u002711. Avoid generic backlog filler. Every epic and story must be grounded in retrieved evidence.\u0027,\n      \u002712. Include document.sourceCoverage and document.retrievalEvidence that cite the retrieved chunks by docType/source/section/chunkId/excerpt.\u0027,\n      \u002713. Include document.coverageLedger. This is mandatory because the Jira creation quality gate blocks missing or unrecognized coverage before any Jira issues are created.\u0027,\n      \u002714. For each coverageLedger row, map in-scope source items to actual generated epic/story correlation IDs. Use excluded only with a clear reason.\u0027,\n      \u002715. Include document.batchPlan, document.batchResults, and document.retryBatches so users can see what modules were generated, retried, recovered, or still missing.\u0027,\n      \u002716. Keep correlation IDs stable and label-safe for idempotent Jira search/reuse.\u0027,\n      \u002717. In update mode, preserve every existing epic/story correlation ID and stable label from the prior snapshot unless the item is intentionally superseded.\u0027,\n      \u002718. In update mode, do not re-plan or rewrite already-covered modules. Return new/updated delta epics and stories for every in-scope DELTA TARGET REQUIREMENT ID and unresolved coverage item. Do not stop after the first delta target.\u0027,\n      \u002719. In update-repair mode, any IDs listed as Update repair missing delta IDs are mandatory focus items. Generate or update backlog coverage for those IDs first, and include each ID in sourceTraceability plus document.coverageLedger. Reuse previous Jira items where correlation IDs already exist; create only the missing delta backlog items.\u0027,\n      \u002720. In update mode, the workflow will merge previous live Jira epics/stories after parsing. Do not include unchanged full descriptions in your JSON response.\u0027,\n      \u002721. In update mode, include document.updateSummary with previousJobId, reusedEpicCount, reusedStoryCount, createdEpicCount, createdStoryCount, updatedEpicCount, updatedStoryCount, resolvedCoverageIds, unchangedCoverageIds, deltaRequirementIds, and a concise noChangeReason only when no delta item needs a backlog change.\u0027,\n      \u002722. In update mode, keep output compact enough to fit comfortably below the model max tokens. Prefer complete valid JSON over verbose descriptions. If delta target requirement IDs exist, document.updateSummary.deltaRequirementIds and document.coverageLedger must account for each one, either mapped to a created/updated story or explicitly explained as already covered by existing Jira keys in noChangeReason.\u0027,\n      \u002723. Return only valid JSON matching the output parser schema.\u0027\n    ].join(\u0027\\n\u0027)\n  }\n};\n\nconst selectedPrompt = promptLibrary[documentType];\n\nif (!selectedPrompt) {\n  throw new Error(\u0027Professional Prompt Library does not support documentType=\u0027 + documentType + \u0027. Non-user-story documents should route to fullRetrievalD01.\u0027);\n}\n\nreturn [{\n  json: {\n    ...request,\n    ...selectedPrompt,\n    coverageLedgerRequirement: {\n      enabled: true,\n      version: \u0027backlog-coverage-ledger-v1\u0027,\n      mode: \u0027enforced\u0027,\n      requiredFor: \u0027user_stories\u0027,\n      statuses: [\u0027covered\u0027, \u0027partial\u0027, \u0027missing\u0027, \u0027excluded\u0027],\n      blockedStatuses: [\u0027missing\u0027, \u0027unknown\u0027]\n    },\n    batchGenerationRequirement: {\n      enabled: true,\n      version: \u0027backlog-batch-progress-v1\u0027,\n      mode: \u0027internal_retry\u0027,\n      requiredFor: \u0027user_stories\u0027,\n      retryScope: \u0027missing_or_partial_modules_only\u0027,\n      outputFields: [\u0027document.batchPlan\u0027, \u0027document.batchResults\u0027, \u0027document.retryBatches\u0027]\n    },\n    partialCoveragePolicy: {\n      nfrPolicy: \u0027resolve_or_exclude_with_reason\u0027,\n      userMessage: \u0027Partial coverage means review needed, not retrying.\u0027\n    },\n    updateDeltaTargets: updateMode ? {\n      version: \u0027backlog-delta-targets-v3\u0027,\n      requirementIds: deltaRequirementIds,\n      targetCount: deltaRequirementIds.length,\n      evidenceCount: deltaEvidence.length,\n      retryFocusIds: previousMissingDeltaIds,\n      targets: deltaTargetSummary\n    } : null,\n    promptRouting: {\n      route: \u0027professional_team_managed_backlog\u0027,\n      documentType,\n      usesPromptLibrary: true,\n      usesRetrievalProfile: true,\n      retrievalProfileKey: retrievalProfile.key || request.retrievalProfileKey || documentType,\n      requiresRetrievalEvidence: true,\n      preflightRetrievalRequired: true,\n      adaptiveStoryCount: true\n    }\n  }\n}];"
}
```

### Professional QA Backlog Generator

| Field | Value |
| --- | --- |
| Node ID | e2e1293a-3fbb-4cac-a91b-08ca95446ad0 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3.1 |
| Position | 368, 432 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Backlog Delta No Model? -> Professional QA Backlog Generator (output 1, input 0)

**Outgoing Connections**

- Professional QA Backlog Generator -> Robust Backlog JSON Parser (output 0, input 0)

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
                    "systemMessage":  "={{ $json.system }}\n\nDocument Title: {{ $json.title }}\nGenerated On: {{ $now }}\nDocument Type: {{ $json.documentType }}\n\nReturn a single JSON object with top-level keys document, epics, and qualityReview. Do not wrap it in markdown fences or an extra output property."
                }
}
```

### Project Knowledge Vector Search

| Field | Value |
| --- | --- |
| Node ID | 89544707-f29f-43ea-a633-e5eaa261f535 |
| Type | @n8n/n8n-nodes-langchain.vectorStoreChromaDB |
| Type Version | 1.3 |
| Position | 608, 528 |
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
    "toolDescription":  "Retrieves project-specific chunks from Chroma. The hard filter is metadata.project; generation receives a metadata retrieval profile that ranks docType, documentCategory, artifactType, contentSource, sectionTitle, and vision evidence for the requested document type.",
    "authentication":  "chromaCloudApi",
    "chromaCollection":  {
                             "__rl":  true,
                             "value":  "={{ $json.chromaCollection }}",
                             "mode":  "id",
                             "cachedResultName":  "runtime-configured collection"
                         },
    "topK":  "={{ $json.chromaTopK }}",
    "options":  {
                    "metadata":  {
                                     "metadataValues":  [
                                                            {
                                                                "name":  "project",
                                                                "value":  "={{ $json.projectName }}"
                                                            }
                                                        ]
                                 }
                }
}
```

### Return Team Managed Professional Result

| Field | Value |
| --- | --- |
| Node ID | c1ce59ba-7c54-4743-b405-13f14264911f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 6288, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Combine Confluence Results -> Return Team Managed Professional Result (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const root = $input.first().json;\nconst confluence = root.confluenceResponse || {};\nconst base = confluence._links?.base || root.confluenceBaseUrl;\nconst webui = confluence._links?.webui || null;\nconst baseClean = String(base || \u0027\u0027).endsWith(\u0027/\u0027) ? String(base || \u0027\u0027).slice(0, -1) : String(base || \u0027\u0027);\nconst confluenceUrl = webui ? baseClean + webui : null;\n\nfunction array(value) {\n  return Array.isArray(value) ? value.filter(item =\u003e item \u0026\u0026 typeof item === \u0027object\u0027) : [];\n}\nfunction firstText(...values) {\n  for (const value of values) {\n    if (value === null || value === undefined) continue;\n    const text = String(value).trim();\n    if (text) return text;\n  }\n  return \u0027\u0027;\n}\nfunction normalizeKey(value) {\n  return firstText(value).toLowerCase().replace(/[^a-z0-9]+/g, \u0027\u0027);\n}\nfunction textList(...values) {\n  return [...new Set(values.flatMap(value =\u003e {\n    if (Array.isArray(value)) return value;\n    if (value === null || value === undefined) return [];\n    return String(value).split(/[;,]/);\n  }).map(value =\u003e String(value || \u0027\u0027).trim()).filter(Boolean))];\n}\nfunction coverageStatus(value) {\n  const raw = String(value || \u0027\u0027).toLowerCase();\n  if (raw.includes(\u0027exclude\u0027)) return \u0027excluded\u0027;\n  if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027review\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n  if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unknown\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n  if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027include\u0027)) return \u0027covered\u0027;\n  return \u0027unknown\u0027;\n}\nfunction summarizeCoverageLedger(rows) {\n  const summary = {\n    mode: \u0027enforced\u0027,\n    version: \u0027backlog-coverage-ledger-v1\u0027,\n    gateStatus: \u0027passed\u0027,\n    coverageLedgerCount: rows.length,\n    coveredCount: 0,\n    partialCount: 0,\n    missingCount: 0,\n    unknownCount: 0,\n    excludedCount: 0,\n    uncoveredCount: 0,\n    blockingUncoveredCount: 0,\n    missingItems: [],\n    mappingWarnings: [],\n    mappingWarningCount: 0,\n  };\n  for (const row of rows) {\n    const status = coverageStatus(row.coverageStatus || row.status);\n    if (status === \u0027covered\u0027) summary.coveredCount += 1;\n    else if (status === \u0027excluded\u0027) summary.excludedCount += 1;\n    else if (status === \u0027partial\u0027) {\n      summary.partialCount += 1;\n      summary.missingItems.push(row);\n    } else {\n      summary.missingCount += 1;\n      summary.missingItems.push(row);\n    }\n  }\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  if (summary.blockingUncoveredCount) summary.gateStatus = \u0027failed\u0027;\n  else if (summary.partialCount) summary.gateStatus = \u0027warning\u0027;\n  return summary;\n}\nfunction addKnownIssueIds(set, item, kind) {\n  const values = kind === \u0027epic\u0027\n    ? [item.epicCorrelationId, item.epicId, item.jiraEpicKey, item.epicKey, item.key, item.stableLabel, item.epicName]\n    : [item.storyCorrelationId, item.userStoryId, item.storyId, item.jiraStoryKey, item.storyKey, item.key, item.stableLabel, item.summary];\n  for (const value of values) {\n    const key = normalizeKey(value);\n    if (key) set.add(key);\n  }\n}\n\nconst updateContext = root.updateContext \u0026\u0026 typeof root.updateContext === \u0027object\u0027 ? root.updateContext : {};\nconst previousEpics = array(updateContext.previousEpics);\nconst previousStories = array(updateContext.previousStories);\nconst jiraEpics = array(root.jiraResults?.epics);\nconst jiraStories = array(root.jiraResults?.stories);\nconst knownEpics = new Set();\nconst knownStories = new Set();\njiraEpics.forEach(item =\u003e addKnownIssueIds(knownEpics, item, \u0027epic\u0027));\npreviousEpics.forEach(item =\u003e addKnownIssueIds(knownEpics, item, \u0027epic\u0027));\njiraStories.forEach(item =\u003e addKnownIssueIds(knownStories, item, \u0027story\u0027));\npreviousStories.forEach(item =\u003e addKnownIssueIds(knownStories, item, \u0027story\u0027));\n\nlet coverageLedger = array(root.coverageLedger || root.qualityGate?.coverageLedger || root.generated?.document?.coverageLedger);\ncoverageLedger = coverageLedger.map((row, index) =\u003e {\n  const mappedEpicIds = textList(row.mappedEpicIds, row.epicCorrelationIds, row.epicIds, row.epics, row.epicId, row.epicCorrelationId);\n  const mappedStoryIds = textList(row.mappedStoryIds, row.storyCorrelationIds, row.storyIds, row.userStoryIds, row.stories, row.storyId, row.storyCorrelationId);\n  const mappedEpicMatches = mappedEpicIds.filter(id =\u003e knownEpics.has(normalizeKey(id)));\n  const mappedStoryMatches = mappedStoryIds.filter(id =\u003e knownStories.has(normalizeKey(id)));\n  let status = coverageStatus(row.coverageStatus || row.status || row.coverage);\n  let notes = firstText(row.notes, row.rationale, row.reason);\n  if (status === \u0027covered\u0027 \u0026\u0026 mappedStoryIds.length \u0026\u0026 !mappedStoryMatches.length) {\n    status = \u0027partial\u0027;\n    notes = [notes, \u0027Mapped story IDs were not found among published or preserved Jira stories.\u0027].filter(Boolean).join(\u0027 \u0027);\n  }\n  return {\n    ...row,\n    coverageId: firstText(row.coverageId, row.id, row.requirementId, \u0027BCOV-\u0027 + String(index + 1).padStart(3, \u00270\u0027)),\n    moduleRequirement: firstText(row.moduleRequirement, row.module, row.requirement, row.capability, row.title, row.name),\n    sourceReference: firstText(row.sourceReference, row.source, row.sourceRef, row.evidence),\n    mappedEpicIds,\n    mappedStoryIds,\n    mappedEpicMatches,\n    mappedStoryMatches,\n    coverageStatus: status,\n    notes,\n  };\n});\nconst coverageSummary = summarizeCoverageLedger(coverageLedger);\nconst noModelTokenUsage = root.generated?.document?.updateSummary?.tokenUsage?.source === \u0027no_model_delta_gate\u0027\n  ? root.generated.document.updateSummary.tokenUsage\n  : null;\nconst tokenUsage = {\n  source: noModelTokenUsage?.source || root.tokenUsage?.source || root.qualityGate?.tokenUsage?.source || root.generated?.document?.updateSummary?.tokenUsage?.source || \u0027estimated\u0027,\n  input: Number(noModelTokenUsage?.input ?? root.tokensInput ?? root.tokenUsage?.input ?? root.tokenUsage?.tokensInput ?? root.qualityGate?.tokensInput ?? 0) || 0,\n  output: Number(noModelTokenUsage?.output ?? root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? root.qualityGate?.tokensOutput ?? 0) || 0,\n  total: Number(noModelTokenUsage?.total ?? root.tokensTotal ?? root.tokenUsage?.total ?? root.tokenUsage?.tokensTotal ?? root.qualityGate?.tokensTotal ?? 0) || 0,\n  tokensInput: Number(noModelTokenUsage?.input ?? root.tokensInput ?? root.tokenUsage?.input ?? root.tokenUsage?.tokensInput ?? root.qualityGate?.tokensInput ?? 0) || 0,\n  tokensOutput: Number(noModelTokenUsage?.output ?? root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? 0) || 0,\n  tokensTotal: Number(noModelTokenUsage?.total ?? root.tokensTotal ?? root.tokenUsage?.total ?? root.tokenUsage?.tokensTotal ?? root.qualityGate?.tokensTotal ?? 0) || 0,\n  estimatedCostUsd: Number(noModelTokenUsage?.estimatedCostUsd ?? root.estimatedCostUsd ?? root.tokenUsage?.estimatedCostUsd ?? root.qualityGate?.estimatedCostUsd ?? 0) || 0,\n};\nconst rawUpdateSummary = root.generated?.document?.updateSummary || root.updateSummary || null;\n\nreturn [{ json: {\n  jobId: root.jobId,\n  projectName: root.projectName,\n  documentType: root.documentType,\n  jiraProjectType: \u0027team-managed\u0027,\n  promptLibraryVersion: $(\u0027Professional Prompt Library\u0027).first().json.promptLibraryVersion,\n  qualityGate: { ...(root.qualityGate || {}), coverageLedger, coverageSummary },\n  wordCount: root.wordCount,\n  tokensInput: tokenUsage.input,\n  tokensOutput: tokenUsage.output,\n  tokensTotal: tokenUsage.total,\n  estimatedCostUsd: tokenUsage.estimatedCostUsd,\n  tokenUsage,\n  epics: jiraEpics,\n  stories: jiraStories,\n  jira: root.jiraResults,\n  confluence: { pageId: confluence.id || null, title: confluence.title || root.confluenceTitle, action: root.confluenceAction, link: webui, url: confluenceUrl },\n  url: confluenceUrl,\n  confluenceUrl,\n  generated: root.generated,\n  coverageLedger,\n  coverageSummary,\n  batchPlan: root.batchPlan || root.qualityGate?.batchPlan || root.generated?.document?.batchPlan || null,\n  batchSummary: root.batchSummary || root.qualityGate?.batchSummary || root.generated?.document?.batchResults || null,\n  progress: {\n    stage: \u0027published\u0027,\n    stageLabel: \u0027Published to Jira and Confluence\u0027,\n    progressPercent: 100,\n    summary: coverageSummary.gateStatus === \u0027warning\u0027\n      ? \u0027Epics and user stories were published, with coverage review warnings that need final review.\u0027\n      : \u0027Epics and user stories were generated in module batches, coverage-reviewed, published to Jira, and summarized in Confluence.\u0027,\n    coverage: coverageSummary,\n    batches: root.batchSummary?.batches || root.qualityGate?.batchSummary?.batches || root.generated?.document?.batchResults?.batches || [],\n  },\n  generationSummary: {\n    epicCount: jiraEpics.length,\n    storyCount: jiraStories.length,\n    coverageGate: coverageSummary.gateStatus,\n    batchCount: root.batchSummary?.totalBatches || root.qualityGate?.batchSummary?.totalBatches || 0,\n  },\n  sourceCoverage: root.qualityGate?.sourceCoverage || [],\n  retrievalEvidenceCount: root.qualityGate?.retrievalEvidenceCount || 0,\n  retrievalQuality: root.retrievalQuality || null,\n  generationMode: root.generationMode || \u0027create\u0027,\n  updateContext: root.updateContext || null,\n  updateSummary: rawUpdateSummary,\n  tokenSavings: rawUpdateSummary?.tokenSavings || null,\n} }];"
}
```

### Robust Backlog JSON Parser

| Field | Value |
| --- | --- |
| Node ID | f00b7e35-9414-4b59-8a8d-668ed9cf210a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 768, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Professional QA Backlog Generator -> Robust Backlog JSON Parser (output 0, input 0)

**Outgoing Connections**

- Robust Backlog JSON Parser -> Validate Team Managed Backlog (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst raw = $json.output ?? $json.text ?? $json.response ?? $json;\n\nconst stringifyRaw = value =\u003e {\n  if (value \u0026\u0026 typeof value === \u0027object\u0027) {\n    if (typeof value.output === \u0027string\u0027) return value.output;\n    if (typeof value.text === \u0027string\u0027) return value.text;\n    if (typeof value.response === \u0027string\u0027) return value.response;\n    if (typeof value.output_text === \u0027string\u0027) return value.output_text;\n  }\n  return String(value || \u0027\u0027).trim();\n};\n\nconst count = (text, pattern) =\u003e (text.match(pattern) || []).length;\n\nconst truncationMessage = (text, extra = \u0027\u0027) =\u003e {\n  let context = {};\n  try {\n    const request = $(\u0027Normalize Team Managed Request\u0027).first().json || {};\n    const prompt = $(\u0027Professional Prompt Library\u0027).first().json || {};\n    const quality = $(\u0027Check Chroma Retrieval Quality\u0027).first().json?.retrievalQuality || {};\n    context = {\n      jobId: request.jobId,\n      projectName: request.projectName,\n      documentType: request.documentType,\n      generationModel: request.generationModel,\n      maxTokens: request.maxTokens,\n      chromaTopK: request.chromaTopK,\n      selectedChunkCount: quality.selectedChunkCount,\n      promptChars: String((prompt.system || \u0027\u0027) + (prompt.user || \u0027\u0027)).length,\n      outputChars: text.length\n    };\n  } catch (error) {}\n\n  return [\n    \u0027Backlog parser detected incomplete or truncated model JSON. Jira and Confluence creation stopped before any issues/pages were created.\u0027,\n    extra,\n    \u0027Action: rerun with create maxTokens \u003e= 30000, reduce retrieval context/topK, or split backlog generation into skeleton + enrichment steps.\u0027,\n    \u0027Context: \u0027 + JSON.stringify(context)\n  ].filter(Boolean).join(\u0027 \u0027);\n};\n\nconst extractBalancedJsonObject = text =\u003e {\n  const firstBrace = text.indexOf(\u0027{\u0027);\n  if (firstBrace \u003c 0) {\n    throw new Error(\u0027Backlog parser received a response without a JSON object. Raw preview: \u0027 + text.slice(0, 500));\n  }\n\n  let depth = 0;\n  let inString = false;\n  let escaped = false;\n\n  for (let i = firstBrace; i \u003c text.length; i++) {\n    const char = text[i];\n\n    if (inString) {\n      if (escaped) {\n        escaped = false;\n      } else if (char === \u0027\\\\\u0027) {\n        escaped = true;\n      } else if (char === \u0027\"\u0027) {\n        inString = false;\n      }\n      continue;\n    }\n\n    if (char === \u0027\"\u0027) {\n      inString = true;\n    } else if (char === \u0027{\u0027) {\n      depth += 1;\n    } else if (char === \u0027}\u0027) {\n      depth -= 1;\n      if (depth === 0) {\n        return {\n          candidate: text.slice(firstBrace, i + 1),\n          trailing: text.slice(i + 1).trim()\n        };\n      }\n      if (depth \u003c 0) break;\n    }\n  }\n\n  const partial = text.slice(firstBrace);\n  throw new Error(truncationMessage(\n    text,\n    \u0027No complete balanced JSON object was found. JSON balance: {\u0027 + count(partial, /{/g) + \u0027/\u0027 + count(partial, /}/g) + \u0027} [\u0027 + count(partial, /\\[/g) + \u0027/\u0027 + count(partial, /\\]/g) + \u0027].\u0027\n  ));\n};\n\nconst parseCandidate = (value) =\u003e {\n  if (value \u0026\u0026 typeof value === \u0027object\u0027 \u0026\u0026 value.document \u0026\u0026 Array.isArray(value.epics)) return value;\n  if (value \u0026\u0026 typeof value === \u0027object\u0027 \u0026\u0026 value.output?.document \u0026\u0026 Array.isArray(value.output.epics)) return value.output;\n\n  let text = stringifyRaw(value);\n  if (!text) throw new Error(\u0027Backlog parser received an empty model response.\u0027);\n\n  const fenced = text.match(new RegExp(\u0027\\\\x60{3}(?:json)?\\\\s*([\\\\s\\\\S]*?)\\\\s*\\\\x60{3}\u0027, \u0027i\u0027));\n  if (fenced) text = fenced[1].trim();\n\n  for (let i = 0; i \u003c 2; i++) {\n    const trimmed = text.trim();\n    if (!(trimmed.startsWith(\u0027\"\u0027) \u0026\u0026 trimmed.endsWith(\u0027\"\u0027))) break;\n    try {\n      const unwrapped = JSON.parse(trimmed);\n      if (unwrapped \u0026\u0026 typeof unwrapped === \u0027object\u0027) return unwrapped;\n      if (typeof unwrapped === \u0027string\u0027) text = unwrapped.trim();\n    } catch (error) {\n      break;\n    }\n  }\n\n  const { candidate, trailing } = extractBalancedJsonObject(text);\n  try {\n    return JSON.parse(candidate);\n  } catch (error) {\n    const position = String(error.message || \u0027\u0027).match(/position\\s+(\\d+)/i)?.[1];\n    const pos = position ? Number(position) : -1;\n    const near = pos \u003e= 0 ? candidate.slice(Math.max(0, pos - 300), Math.min(candidate.length, pos + 300)) : candidate.slice(0, 500);\n    const openBraces = count(candidate, /{/g);\n    const closeBraces = count(candidate, /}/g);\n    const openBrackets = count(candidate, /\\[/g);\n    const closeBrackets = count(candidate, /\\]/g);\n    const completionLike = openBraces !== closeBraces || openBrackets !== closeBrackets || /(\"[^\"]*|[,:\\[{]\\s*)$/.test(candidate.trim());\n    if (completionLike) {\n      throw new Error(truncationMessage(text, error.message + \u0027. JSON balance: {\u0027 + openBraces + \u0027/\u0027 + closeBraces + \u0027} [\u0027 + openBrackets + \u0027/\u0027 + closeBrackets + \u0027]. Near parse error: \u0027 + near));\n    }\n    throw new Error(\u0027Backlog parser failed to parse model JSON: \u0027 + error.message + \u0027. Near parse error: \u0027 + near);\n  }\n};\n\nlet parsed;\ntry {\n  parsed = parseCandidate(raw);\n} catch (error) {\n  throw new Error(error.message);\n}\n\nconst generated = parsed.output \u0026\u0026 typeof parsed.output === \u0027object\u0027 ? parsed.output : parsed;\nif (!generated.document || typeof generated.document !== \u0027object\u0027) generated.document = {};\n\nconst hasItems = value =\u003e Array.isArray(value) \u0026\u0026 value.length \u003e 0;\nlet contextForShape = {};\ntry { contextForShape = $(\u0027Build Live Update Context\u0027).first().json || {}; } catch (error) {\n  try { contextForShape = $(\u0027Check Chroma Retrieval Quality\u0027).first().json || {}; } catch (ignored) {}\n}\nconst isUpdateNoop =\n  Boolean(contextForShape.updateMode) \u0026\u0026\n  generated.document \u0026\u0026\n  generated.document.updateSummary \u0026\u0026\n  Array.isArray(generated.epics);\nconst hasBacklogShape =\n  hasItems(generated.epics) ||\n  hasItems(generated.stories) ||\n  hasItems(generated.userStories) ||\n  hasItems(generated.childStories) ||\n  hasItems(generated.features) ||\n  hasItems(generated.backlog?.epics) ||\n  hasItems(generated.backlog?.stories) ||\n  hasItems(generated.backlog?.userStories) ||\n  hasItems(generated.backlog?.features) ||\n  isUpdateNoop;\n\nif (!hasBacklogShape) {\n  throw new Error(\u0027Backlog parser found JSON but missing usable epics/stories structure. Top-level keys: \u0027 + Object.keys(generated || {}).join(\u0027, \u0027));\n}\n\nreturn [{ json: generated }];\n"
}
```

### Search Existing Confluence Page

| Field | Value |
| --- | --- |
| Node ID | 4a580258-6527-4fd6-a926-f6acd823c5b0 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 4944, 112 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Confluence Upsert -> Search Existing Confluence Page (output 0, input 0)

**Outgoing Connections**

- Search Existing Confluence Page -> Determine Confluence Update Or Create (output 0, input 0)

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
    "url":  "={{ $json.confluenceBaseUrl }}/rest/api/content",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "spaceKey",
                                                   "value":  "={{ $json.confluenceSpaceKey }}"
                                               },
                                               {
                                                   "name":  "title",
                                                   "value":  "={{ $json.confluenceTitle }}"
                                               },
                                               {
                                                   "name":  "expand",
                                                   "value":  "version"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
                                               }
                                           ]
                        },
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\"Accept\":\"application/json\"}",
    "options":  {

                }
}
```

### Search Existing Epic in Jira

| Field | Value |
| --- | --- |
| Node ID | 2e605f86-f945-4efa-9807-7b1c52c801a9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1360, 112 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Epic Search Items -> Search Existing Epic in Jira (output 0, input 0)

**Outgoing Connections**

- Search Existing Epic in Jira -> Determine Epic Reuse Or Create (output 0, input 0)

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
    "url":  "={{ $json.jiraBaseUrl }}/rest/api/3/search/jql",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "jql",
                                                   "value":  "={{ $json.jiraEpicSearchJql }}"
                                               },
                                               {
                                                   "name":  "maxResults",
                                                   "value":  "1"
                                               },
                                               {
                                                   "name":  "fields",
                                                   "value":  "key,summary,status,labels"
                                               }
                                           ]
                        },
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\"Accept\":\"application/json\"}",
    "options":  {

                }
}
```

### Search Existing Story in Jira

| Field | Value |
| --- | --- |
| Node ID | fae94c8f-4d72-452b-a4d2-1ebe861375ca |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3152, 112 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Story Search Items -> Search Existing Story in Jira (output 0, input 0)

**Outgoing Connections**

- Search Existing Story in Jira -> Determine Story Reuse Or Create (output 0, input 0)

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
    "url":  "={{ $json.jiraBaseUrl }}/rest/api/3/search/jql",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "jql",
                                                   "value":  "={{ $json.jiraStorySearchJql }}"
                                               },
                                               {
                                                   "name":  "maxResults",
                                                   "value":  "1"
                                               },
                                               {
                                                   "name":  "fields",
                                                   "value":  "key,summary,status,labels,parent"
                                               }
                                           ]
                        },
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\"Accept\":\"application/json\"}",
    "options":  {

                }
}
```

### Search Live Confluence Backlog

| Field | Value |
| --- | --- |
| Node ID | 48c92a13-3fcd-4e13-955a-115dae23121b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 608, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search Live Jira Backlog -> Search Live Confluence Backlog (output 0, input 0)

**Outgoing Connections**

- Search Live Confluence Backlog -> Build Live Update Context (output 0, input 0)

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
    "url":  "={{ ($json.confluenceBaseUrl || \u0027https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, \u0027\u0027) }}/rest/api/content",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "spaceKey",
                                                   "value":  "={{ $json.confluenceSpaceKey }}"
                                               },
                                               {
                                                   "name":  "title",
                                                   "value":  "={{ $(\"Build Live Update Snapshot Request\").first().json.liveConfluenceTitle }}"
                                               },
                                               {
                                                   "name":  "expand",
                                                   "value":  "body.storage,version"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
                                               }
                                           ]
                        },
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\"Accept\":\"application/json\"}",
    "options":  {

                }
}
```

### Search Live Jira Backlog

| Field | Value |
| --- | --- |
| Node ID | d3bc0411-6f06-4764-9da6-cc59bebaec24 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 400, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Live Update Snapshot Request -> Search Live Jira Backlog (output 0, input 0)

**Outgoing Connections**

- Search Live Jira Backlog -> Search Live Confluence Backlog (output 0, input 0)

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
    "url":  "={{ ($json.jiraBaseUrl || \u0027https://anujalhans1.atlassian.net\u0027).replace(/\\/$/, \u0027\u0027) }}/rest/api/3/search/jql",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "jql",
                                                   "value":  "={{ $json.liveJiraBacklogJql }}"
                                               },
                                               {
                                                   "name":  "maxResults",
                                                   "value":  "100"
                                               },
                                               {
                                                   "name":  "fields",
                                                   "value":  "key,summary,status,labels,parent,issuetype,description,updated"
                                               }
                                           ]
                        },
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\"Accept\":\"application/json\"}",
    "options":  {

                }
}
```

### Sticky Note 1d2db04d

| Field | Value |
| --- | --- |
| Node ID | 6e804d87-a806-4d6b-8dba-1d942181f7c3 |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | 3152, 384 |
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
    "content":  "## Team Managed Jira QA Backlog Generator\nSeparate from fullRetrievalD01. Adds stable idempotency labels, Jira search/reuse before create, Team Managed parent linking, and Confluence update-before-create.",
    "height":  220,
    "width":  4200,
    "color":  5
}
```

### Story Needs Create?

| Field | Value |
| --- | --- |
| Node ID | bb644052-5cb0-4eb4-88dd-c520d6d193bc |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 3600, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Determine Story Reuse Or Create -> Story Needs Create? (output 0, input 0)

**Outgoing Connections**

- Story Needs Create? -> Create Missing Story Linked to Epic (output 0, input 0)
- Story Needs Create? -> Normalize Existing Story Result (output 1, input 0)

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
                                              "leftValue":  "={{ $json.action }}",
                                              "rightValue":  "create",
                                              "operator":  {
                                                               "type":  "string",
                                                               "operation":  "equals"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Summarize Team Managed Jira Results

| Field | Value |
| --- | --- |
| Node ID | a7e01030-b435-4896-b874-a82ccebf4f8e |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 4496, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Combine Story Reuse And Create Results -> Summarize Team Managed Jira Results (output 0, input 0)

**Outgoing Connections**

- Summarize Team Managed Jira Results -> Prepare Confluence Upsert (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const root = $(\u0027Collect Team Managed Epic Jira Map\u0027).item.json;\nconst actions = $(\u0027Determine Story Reuse Or Create\u0027).all().map(i =\u003e i.json);\n\nlet created = [];\nconst createdSources = actions.filter(action =\u003e action.action === \u0027create\u0027);\ntry {\n  const createdResponses = $(\u0027Create Missing Story Linked to Epic\u0027).all().map(i =\u003e i.json);\n  created = createdSources.map((source, index) =\u003e {\n    const response = createdResponses[index] || {};\n    if (!response.key) {\n      throw new Error(\u0027Jira did not return a key for created story \u0027 + source.storyCorrelationId);\n    }\n    return {\n      ...source,\n      action: \u0027created\u0027,\n      jiraStoryId: response.id || null,\n      jiraStoryKey: response.key || null,\n      jiraStorySelf: response.self || null\n    };\n  });\n} catch (error) {\n  if (createdSources.length) throw error;\n  created = [];\n}\n\nconst createdByCorrelation = Object.fromEntries(created.map(s =\u003e [s.storyCorrelationId, s]));\nconst stories = actions.map(action =\u003e {\n  const source = action.action === \u0027create\u0027 ? (createdByCorrelation[action.storyCorrelationId] || action) : action;\n  if (action.action === \u0027create\u0027 \u0026\u0026 !source.jiraStoryKey) {\n    throw new Error(\u0027Missing Jira story key after create for \u0027 + action.storyCorrelationId);\n  }\n  return {\n    storyCorrelationId: action.storyCorrelationId,\n    summary: action.story.summary,\n    parentEpicCorrelationId: action.epicCorrelationId,\n    parentEpicKey: action.jiraEpic?.jiraEpicKey || null,\n    storyId: source.jiraStoryId || null,\n    storyKey: source.jiraStoryKey || null,\n    storySelf: source.jiraStorySelf || null,\n    action: source.action || action.action,\n    stableLabel: action.stableStoryLabel\n  };\n});\nreturn [{ json: { ...root, jiraResults: { projectType: \u0027team-managed\u0027, projectKey: root.jiraProjectKey, projectId: root.jiraProjectId, epics: Object.values(root.epicMap), stories } } }];"
}
```

### Update Existing Confluence Page

| Field | Value |
| --- | --- |
| Node ID | b8e640af-3f87-4679-a8fe-5dba8bd76e72 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 5616, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Confluence Page Exists? -> Update Existing Confluence Page (output 0, input 0)

**Outgoing Connections**

- Update Existing Confluence Page -> Normalize Updated Confluence Page (output 0, input 0)

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
    "method":  "PUT",
    "url":  "={{ $json.confluenceBaseUrl }}/rest/api/content/{{ $json.confluencePageId }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\"Accept\":\"application/json\",\"Content-Type\":\"application/json\"}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.confluencePayload) }}",
    "options":  {

                }
}
```

### Validate Team Managed Backlog

| Field | Value |
| --- | --- |
| Node ID | c9ff4562-abac-456e-a32c-eebe4ca0a0e9 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 960, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Robust Backlog JSON Parser -> Validate Team Managed Backlog (output 0, input 0)
- Build Backlog No-Model Result -> Validate Team Managed Backlog (output 0, input 0)

**Outgoing Connections**

- Validate Team Managed Backlog -> Prepare Epic Search Items (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const generated = $json.output || $json;\nlet context;\ntry { context = $(\u0027Build Live Update Context\u0027).first().json; } catch (error) {\n  try { context = $(\u0027Check Chroma Retrieval Quality\u0027).first().json; } catch (ignored) {\n    context = $(\u0027Normalize Team Managed Request\u0027).first().json;\n  }\n}\nconst toObjectArray = value =\u003e {\n  if (Array.isArray(value)) return value.filter(item =\u003e item \u0026\u0026 typeof item === \u0027object\u0027);\n  if (value \u0026\u0026 typeof value === \u0027object\u0027) return Object.values(value).filter(item =\u003e item \u0026\u0026 typeof item === \u0027object\u0027);\n  return [];\n};\n\nconst firstText = (...values) =\u003e {\n  for (const value of values) {\n    if (value === null || value === undefined) continue;\n    const text = String(value).trim();\n    if (text) return text;\n  }\n  return \u0027\u0027;\n};\n\nconst normalizeKey = value =\u003e firstText(value).toLowerCase().replace(/[^a-z0-9]+/g, \u0027\u0027);\nconst generatedBacklog = generated.backlog \u0026\u0026 typeof generated.backlog === \u0027object\u0027 ? generated.backlog : {};\n\nconst normalizeEpic = (epic, index) =\u003e {\n  const copy = { ...epic };\n  const epicId = firstText(copy.epicCorrelationId, copy.epicId, copy.id, copy.key, copy.referenceId, \u0027EPIC-\u0027 + String(index + 1).padStart(3, \u00270\u0027));\n  copy.epicCorrelationId = firstText(copy.epicCorrelationId, copy.epicId, copy.id, copy.key, epicId);\n  copy.epicId = firstText(copy.epicId, copy.epicCorrelationId, epicId);\n  copy.epicName = firstText(copy.epicName, copy.name, copy.title, copy.feature, copy.summary, \u0027Generated Epic \u0027 + String(index + 1));\n  copy.epicSummary = firstText(copy.epicSummary, copy.epicDescription, copy.description, copy.businessOutcome, copy.summary);\n  copy.businessOutcome = firstText(copy.businessOutcome, copy.businessObjective, copy.outcome, copy.epicSummary);\n  return copy;\n};\n\nconst normalizeStory = (story, epic, index) =\u003e {\n  const copy = { ...story };\n  const epicId = firstText(epic?.epicCorrelationId, epic?.epicId, copy.epicCorrelationId, copy.epicId, copy.parentEpicId, \u0027EPIC-001\u0027);\n  const storyId = firstText(copy.storyCorrelationId, copy.userStoryId, copy.storyId, copy.id, copy.key, epicId + \u0027-US-\u0027 + String(index + 1).padStart(3, \u00270\u0027));\n  copy.storyCorrelationId = firstText(copy.storyCorrelationId, copy.userStoryId, copy.storyId, storyId);\n  copy.userStoryId = firstText(copy.userStoryId, copy.storyCorrelationId, storyId);\n  copy.epicCorrelationId = firstText(copy.epicCorrelationId, copy.epicId, copy.parentEpicId, epicId);\n  copy.epicId = firstText(copy.epicId, copy.epicCorrelationId, epicId);\n  copy.summary = firstText(copy.summary, copy.title, copy.name, copy.feature, String(copy.userStory || \u0027\u0027).slice(0, 120));\n  copy.feature = firstText(copy.feature, copy.summary, epic?.epicName);\n  copy.userStory = firstText(copy.userStory, copy.story, copy.description, copy.userStoryDescription, copy.summary);\n  copy.userStoryDescription = firstText(copy.userStoryDescription, copy.description, copy.userStory);\n  copy.acceptanceCriteria = copy.acceptanceCriteria ?? copy.acceptance_criteria ?? copy.ac ?? copy.criteria ?? [];\n  copy.sourceReferences = copy.sourceReferences ?? copy.sourceTraceability ?? copy.traceability ?? [];\n  return copy;\n};\n\nlet epics = [\n  ...toObjectArray(generated.epics),\n  ...toObjectArray(generatedBacklog.epics),\n  ...toObjectArray(generated.features),\n  ...toObjectArray(generatedBacklog.features)\n].map(normalizeEpic);\n\nif (context.updateMode \u0026\u0026 epics.length === 0) {\n  const previousEpics = previousBacklogEpicsFromUpdateContext(context);\n  epics = previousEpics.map((epic, index) =\u003e normalizeEpic({\n    ...epic,\n    epicCorrelationId: firstText(epic.epicCorrelationId, epic.epicId, epic.jiraEpicKey, epic.key),\n    epicId: firstText(epic.epicId, epic.epicCorrelationId, epic.jiraEpicKey, epic.key),\n    action: firstText(epic.action, \u0027reused\u0027)\n  }, index));\n}\n\nconst seenEpicIds = new Set();\nepics = epics.filter(epic =\u003e {\n  const key = normalizeKey(firstText(epic.epicCorrelationId, epic.epicId, epic.epicName));\n  if (!key || seenEpicIds.has(key)) return false;\n  seenEpicIds.add(key);\n  return true;\n});\n\nfor (const [epicIndex, epic] of epics.entries()) {\n  const nestedStories = [\n    ...toObjectArray(epic.stories),\n    ...toObjectArray(epic.userStories),\n    ...toObjectArray(epic.childStories),\n    ...toObjectArray(epic.children),\n    ...toObjectArray(epic.items)\n  ];\n  epic.stories = nestedStories.map((story, storyIndex) =\u003e normalizeStory(story, epic, storyIndex));\n}\n\nconst topLevelStories = [\n  ...toObjectArray(generated.stories),\n  ...toObjectArray(generated.userStories),\n  ...toObjectArray(generatedBacklog.stories),\n  ...toObjectArray(generatedBacklog.userStories)\n];\n\nconst epicKeys = epic =\u003e new Set([\n  epic.epicCorrelationId,\n  epic.epicId,\n  epic.id,\n  epic.key,\n  epic.epicName,\n  epic.name,\n  epic.title,\n  epic.feature,\n  epic.summary\n].map(normalizeKey).filter(Boolean));\n\nconst storyEpicKeys = story =\u003e [\n  story.epicCorrelationId,\n  story.epicId,\n  story.parentEpicId,\n  story.parentEpicCorrelationId,\n  story.epicName,\n  story.epic,\n  story.feature,\n  story.module,\n  story.domain\n].map(normalizeKey).filter(Boolean);\n\nconst traceabilityTokens = value =\u003e textList(\n  value?.sourceTraceability,\n  value?.sourceReferences,\n  value?.traceability,\n  value?.requirementIds,\n  value?.requirements,\n  value?.coverageIds\n).map(normalizeKey).filter(Boolean);\n\nconst hasTraceabilityOverlap = (story, epic) =\u003e {\n  const storyTokens = new Set(traceabilityTokens(story));\n  if (!storyTokens.size) return false;\n  return traceabilityTokens(epic).some(token =\u003e storyTokens.has(token));\n};\n\nconst textMatchScore = (story, epic) =\u003e {\n  const storyText = normalizeKey(firstText(story.feature, story.summary, story.userStory, story.module, story.domain));\n  const epicText = normalizeKey(firstText(epic.epicName, epic.epicSummary, epic.feature, epic.summary));\n  if (!storyText || !epicText) return 0;\n  if (storyText === epicText) return 4;\n  if (storyText.includes(epicText) || epicText.includes(storyText)) return 3;\n  const storyWords = new Set(storyText.match(/[a-z0-9]{4,}/g) || []);\n  const epicWords = new Set(epicText.match(/[a-z0-9]{4,}/g) || []);\n  let overlap = 0;\n  for (const word of storyWords) if (epicWords.has(word)) overlap += 1;\n  return overlap;\n};\n\nconst groupUnmatchedStories = new Map();\nfor (const rawStory of topLevelStories) {\n  const keys = storyEpicKeys(rawStory);\n  let targetEpic = epics.find(epic =\u003e {\n    const keysForEpic = epicKeys(epic);\n    return keys.some(key =\u003e keysForEpic.has(key));\n  });\n\n  if (!targetEpic) {\n    targetEpic = epics.find(epic =\u003e hasTraceabilityOverlap(rawStory, epic));\n  }\n\n  if (!targetEpic) {\n    const scored = epics\n      .map(epic =\u003e ({ epic, score: textMatchScore(rawStory, epic) }))\n      .filter(item =\u003e item.score \u003e= 2)\n      .sort((a, b) =\u003e b.score - a.score);\n    if (scored.length) targetEpic = scored[0].epic;\n  }\n\n  if (!targetEpic \u0026\u0026 epics.length === 1) targetEpic = epics[0];\n\n  if (targetEpic) {\n    targetEpic.stories.push(normalizeStory(rawStory, targetEpic, targetEpic.stories.length));\n  } else {\n    const groupName = firstText(rawStory.epicName, rawStory.epic, rawStory.feature, rawStory.module, rawStory.domain, \u0027Generated Backlog\u0027);\n    const key = normalizeKey(groupName) || \u0027generatedbacklog\u0027;\n    if (!groupUnmatchedStories.has(key)) groupUnmatchedStories.set(key, { name: groupName, stories: [] });\n    groupUnmatchedStories.get(key).stories.push(rawStory);\n  }\n}\n\nfor (const group of groupUnmatchedStories.values()) {\n  const groupSourceReferences = textList(...group.stories.map(story =\u003e textList(story.sourceReferences, story.sourceTraceability, story.traceability)));\n  const epic = normalizeEpic({\n    epicName: group.name,\n    epicSummary: \u0027Generated from top-level user stories returned by the backlog model.\u0027,\n    businessOutcome: \u0027Create a Jira-ready backlog from retrieved project evidence.\u0027,\n    sourceReferences: groupSourceReferences,\n    sourceTraceability: groupSourceReferences\n  }, epics.length);\n  epic.stories = group.stories.map((story, storyIndex) =\u003e normalizeStory(story, epic, storyIndex));\n  epics.push(epic);\n}\n\nepics = mergePreviousStoriesForUpdateMode(epics, context);\nconst updateDuplicateStoryIdMap = collapseDuplicateStoriesForUpdateMode(epics, context, generated);\ngenerated.epics = epics;\nif (context.updateMode \u0026\u0026 !generated.document.updateSummary) {\n  const updateContext = context.updateContext \u0026\u0026 typeof context.updateContext === \u0027object\u0027 ? context.updateContext : {};\n  generated.document.updateSummary = {\n    previousJobId: updateContext.previousJobId || context.updateOfJobId || null,\n    reusedEpicCount: previousBacklogEpicsFromUpdateContext(context).length,\n    reusedStoryCount: previousBacklogStoriesFromUpdateContext(context).length,\n    createdEpicCount: 0,\n    createdStoryCount: 0,\n    updatedEpicCount: 0,\n    updatedStoryCount: 0,\n    note: \u0027Previous backlog snapshot merged for update-mode validation and Jira reuse.\u0027\n  };\n}\nconst fatalErrors = [];\n\nconst normalizeArray = value =\u003e {\n  if (Array.isArray(value)) return value.map(v =\u003e typeof v === \u0027string\u0027 ? v.trim() : JSON.stringify(v)).filter(Boolean);\n  if (typeof value === \u0027string\u0027 \u0026\u0026 value.trim()) return [value.trim()];\n  return [];\n};\n\nfunction normalizeCoverageStatus(value) {\n  const raw = String(value || \u0027\u0027).trim().toLowerCase();\n  if (raw.includes(\u0027exclude\u0027) || raw === \u0027n/a\u0027 || raw === \u0027not applicable\u0027) return \u0027excluded\u0027;\n  if (raw.includes(\u0027partial\u0027) || raw.includes(\u0027at risk\u0027)) return \u0027partial\u0027;\n  if (raw.includes(\u0027miss\u0027) || raw.includes(\u0027gap\u0027) || raw.includes(\u0027unmapped\u0027) || raw.includes(\u0027not covered\u0027)) return \u0027missing\u0027;\n  if (raw.includes(\u0027cover\u0027) || raw.includes(\u0027mapped\u0027) || raw.includes(\u0027included\u0027)) return \u0027covered\u0027;\n  return \u0027unknown\u0027;\n}\n\nfunction textList(...values) {\n  return [...new Set(values.flatMap(value =\u003e {\n    if (Array.isArray(value)) return value;\n    if (value === null || value === undefined) return [];\n    return String(value).split(/[;,]/);\n  }).map(value =\u003e String(value || \u0027\u0027).trim()).filter(Boolean))];\n}\n\nfunction normalizeCoverageLedger(value) {\n  const rows = Array.isArray(value)\n    ? value\n    : value \u0026\u0026 typeof value === \u0027object\u0027\n      ? Object.values(value)\n      : [];\n\n  return rows\n    .filter(row =\u003e row \u0026\u0026 typeof row === \u0027object\u0027)\n    .map((row, index) =\u003e {\n      const mappedEpicIds = textList(row.mappedEpicIds, row.epicCorrelationIds, row.epicIds, row.epics, row.epicId, row.epicCorrelationId);\n      const mappedStoryIds = textList(row.mappedStoryIds, row.storyCorrelationIds, row.storyIds, row.userStoryIds, row.stories, row.storyId, row.storyCorrelationId);\n      return {\n        coverageId: firstText(row.coverageId, row.id, row.requirementId, \u0027BCOV-\u0027 + String(index + 1).padStart(3, \u00270\u0027)),\n        moduleRequirement: firstText(row.moduleRequirement, row.module, row.requirement, row.capability, row.title, row.name),\n        sourceReference: firstText(row.sourceReference, row.source, row.sourceRef, row.sourceRefs, row.evidence),\n        mappedEpicIds,\n        mappedStoryIds,\n        coverageStatus: normalizeCoverageStatus(row.coverageStatus || row.status || row.coverage),\n        notes: firstText(row.notes, row.rationale, row.reason, row.exclusionReason)\n      };\n    })\n    .filter(row =\u003e row.coverageId || row.moduleRequirement);\n}\n\n\nfunction previousBacklogStoriesFromUpdateContext(context) {\n  const updateContext = context.updateContext \u0026\u0026 typeof context.updateContext === \u0027object\u0027 ? context.updateContext : {};\n  const previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];\n  return previousStories.filter(story =\u003e story \u0026\u0026 typeof story === \u0027object\u0027);\n}\n\nfunction previousBacklogEpicsFromUpdateContext(context) {\n  const updateContext = context.updateContext \u0026\u0026 typeof context.updateContext === \u0027object\u0027 ? context.updateContext : {};\n  const previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];\n  return previousEpics.filter(epic =\u003e epic \u0026\u0026 typeof epic === \u0027object\u0027);\n}\n\nfunction collapseDuplicateStoriesForUpdateMode(epics, context, generated) {\n  const idMap = new Map();\n  if (!context.updateMode) return idMap;\n\n  const bySummary = new Map();\n  for (const epic of epics) {\n    const retainedStories = [];\n    epic.stories = Array.isArray(epic.stories) ? epic.stories : [];\n    for (const story of epic.stories) {\n      const summaryKey = normalizeKey(story.summary);\n      if (!summaryKey) {\n        retainedStories.push(story);\n        continue;\n      }\n\n      const existing = bySummary.get(summaryKey);\n      if (!existing) {\n        bySummary.set(summaryKey, { epic, story });\n        retainedStories.push(story);\n        continue;\n      }\n\n      const keep = existing.story;\n      const droppedId = firstText(story.storyCorrelationId, story.userStoryId, story.storyId, story.id);\n      const keepId = firstText(keep.storyCorrelationId, keep.userStoryId, keep.storyId, keep.id);\n      if (droppedId \u0026\u0026 keepId \u0026\u0026 normalizeKey(droppedId) !== normalizeKey(keepId)) {\n        idMap.set(droppedId, keepId);\n      }\n\n      keep.acceptanceCriteria = textList(keep.acceptanceCriteria, story.acceptanceCriteria);\n      keep.primaryFlow = textList(keep.primaryFlow, story.primaryFlow);\n      keep.alternateFlows = textList(keep.alternateFlows, story.alternateFlows);\n      keep.exceptionHandling = textList(keep.exceptionHandling, story.exceptionHandling);\n      keep.testScenarios = textList(keep.testScenarios, story.testScenarios);\n      keep.sourceReferences = textList(keep.sourceReferences, story.sourceReferences, story.sourceTraceability);\n      keep.sourceTraceability = textList(keep.sourceTraceability, story.sourceTraceability, story.sourceReferences);\n      keep.testNotes = textList(keep.testNotes, story.testNotes).join(\u0027 \u0027);\n      keep.action = firstText(keep.action, \u0027updated\u0027);\n      keep.updateMergedDuplicate = true;\n    }\n    epic.stories = retainedStories;\n  }\n\n  const rewriteIds = value =\u003e textList(value).map(id =\u003e idMap.get(id) || id);\n  const rewriteRows = rows =\u003e {\n    if (!Array.isArray(rows)) return;\n    for (const row of rows) {\n      if (!row || typeof row !== \u0027object\u0027) continue;\n      if (row.mappedStoryIds !== undefined) row.mappedStoryIds = rewriteIds(row.mappedStoryIds);\n      if (row.storyCorrelationIds !== undefined) row.storyCorrelationIds = rewriteIds(row.storyCorrelationIds);\n      if (row.storyIds !== undefined) row.storyIds = rewriteIds(row.storyIds);\n      if (row.userStoryIds !== undefined) row.userStoryIds = rewriteIds(row.userStoryIds);\n      if (row.stories !== undefined) row.stories = rewriteIds(row.stories);\n    }\n  };\n\n  if (generated \u0026\u0026 typeof generated === \u0027object\u0027) {\n    if (generated.document \u0026\u0026 typeof generated.document === \u0027object\u0027) {\n      rewriteRows(generated.document.coverageLedger);\n    }\n    rewriteRows(generated.coverageLedger);\n    rewriteRows(generated.backlogCoverageLedger);\n  }\n\n  return idMap;\n}\n\nfunction mergePreviousStoriesForUpdateMode(epics, context) {\n  if (!context.updateMode) return epics;\n  const previousStories = previousBacklogStoriesFromUpdateContext(context);\n  if (!previousStories.length) return epics;\n\n  const previousEpics = previousBacklogEpicsFromUpdateContext(context);\n  const epicByCorrelation = new Map();\n  const epicByJiraKey = new Map();\n  const epicByStableLabel = new Map();\n\n  for (const epic of epics) {\n    const correlation = normalizeKey(firstText(epic.epicCorrelationId, epic.epicId, epic.id));\n    const jiraKey = normalizeKey(firstText(epic.jiraEpicKey, epic.epicKey, epic.key));\n    const stable = normalizeKey(firstText(epic.stableLabel));\n    if (correlation) epicByCorrelation.set(correlation, epic);\n    if (jiraKey) epicByJiraKey.set(jiraKey, epic);\n    if (stable) epicByStableLabel.set(stable, epic);\n  }\n\n  const enrichEpicFromSnapshot = (epic, snapshot) =\u003e {\n    if (!snapshot) return;\n    epic.jiraEpicKey = firstText(epic.jiraEpicKey, snapshot.jiraEpicKey, snapshot.epicKey, snapshot.key);\n    epic.jiraEpicId = firstText(epic.jiraEpicId, snapshot.jiraEpicId, snapshot.epicId, snapshot.id);\n    epic.stableLabel = firstText(epic.stableLabel, snapshot.stableLabel);\n    epic.epicSummary = firstText(epic.epicSummary, snapshot.epicSummary, snapshot.summary);\n    epic.businessOutcome = firstText(epic.businessOutcome, snapshot.businessOutcome, snapshot.businessObjective);\n    epic.sourceReferences = textList(epic.sourceReferences, snapshot.sourceReferences, snapshot.sourceTraceability);\n  };\n\n  for (const epic of epics) {\n    const match = previousEpics.find(snapshot =\u003e {\n      const snapshotCorrelation = normalizeKey(firstText(snapshot.epicCorrelationId, snapshot.epicId, snapshot.id));\n      const snapshotKey = normalizeKey(firstText(snapshot.jiraEpicKey, snapshot.epicKey, snapshot.key));\n      const snapshotStable = normalizeKey(firstText(snapshot.stableLabel));\n      return (\n        (snapshotCorrelation \u0026\u0026 snapshotCorrelation === normalizeKey(firstText(epic.epicCorrelationId, epic.epicId, epic.id))) ||\n        (snapshotKey \u0026\u0026 snapshotKey === normalizeKey(firstText(epic.jiraEpicKey, epic.epicKey, epic.key))) ||\n        (snapshotStable \u0026\u0026 snapshotStable === normalizeKey(firstText(epic.stableLabel)))\n      );\n    });\n    enrichEpicFromSnapshot(epic, match);\n  }\n\n  const existingStoryKeys = new Set();\n  for (const epic of epics) {\n    epic.stories = Array.isArray(epic.stories) ? epic.stories : [];\n    for (const story of epic.stories) {\n      const key = normalizeKey(firstText(story.storyCorrelationId, story.userStoryId, story.storyId, story.id, story.jiraStoryKey, story.storyKey, story.stableLabel));\n      if (key) existingStoryKeys.add(key);\n    }\n  }\n\n  const findTargetEpic = (story) =\u003e {\n    const parentCorrelation = normalizeKey(firstText(story.parentEpicCorrelationId, story.epicCorrelationId, story.epicId, story.parentEpicId));\n    const parentKey = normalizeKey(firstText(story.parentEpicKey, story.jiraEpicKey, story.epicKey));\n    const parentStable = normalizeKey(firstText(story.parentEpicStableLabel, story.epicStableLabel));\n    return epicByCorrelation.get(parentCorrelation) || epicByJiraKey.get(parentKey) || epicByStableLabel.get(parentStable) || null;\n  };\n\n  for (const rawStory of previousStories) {\n    const storyKey = normalizeKey(firstText(rawStory.storyCorrelationId, rawStory.userStoryId, rawStory.storyId, rawStory.id, rawStory.jiraStoryKey, rawStory.storyKey, rawStory.stableLabel));\n    if (storyKey \u0026\u0026 existingStoryKeys.has(storyKey)) continue;\n    const targetEpic = findTargetEpic(rawStory);\n    if (!targetEpic) continue;\n    const story = normalizeStory(rawStory, targetEpic, targetEpic.stories.length);\n    story.jiraStoryKey = firstText(story.jiraStoryKey, rawStory.jiraStoryKey, rawStory.storyKey, rawStory.key);\n    story.jiraStoryId = firstText(story.jiraStoryId, rawStory.jiraStoryId, rawStory.storyId, rawStory.id);\n    story.stableLabel = firstText(story.stableLabel, rawStory.stableLabel);\n    story.action = firstText(story.action, rawStory.action, \u0027reused\u0027);\n    story.acceptanceCriteria = textList(story.acceptanceCriteria, rawStory.acceptanceCriteria, rawStory.acceptance_criteria);\n    story.sourceReferences = textList(story.sourceReferences, rawStory.sourceReferences, rawStory.sourceTraceability, targetEpic.sourceReferences);\n    targetEpic.stories.push(story);\n    if (storyKey) existingStoryKeys.add(storyKey);\n  }\n\n  return epics;\n}\n\nfunction normalizeBatchPlan(value, coverageLedger) {\n  const rows = Array.isArray(value?.modules)\n    ? value.modules\n    : Array.isArray(value?.batches)\n      ? value.batches\n      : Array.isArray(value)\n        ? value\n        : [];\n  const modules = rows.length ? rows : coverageLedger.map(row =\u003e ({\n    batchId: row.coverageId,\n    module: row.moduleRequirement,\n    sourceReferences: [row.sourceReference].filter(Boolean),\n    intendedCoverageIds: [row.coverageId],\n    status: row.coverageStatus\n  }));\n  return {\n    version: \u0027backlog-batch-progress-v1\u0027,\n    mode: \u0027internal_retry\u0027,\n    modules: modules\n      .filter(row =\u003e row \u0026\u0026 typeof row === \u0027object\u0027)\n      .map((row, index) =\u003e ({\n        batchId: firstText(row.batchId, row.id, row.coverageId, \u0027BATCH-\u0027 + String(index + 1).padStart(3, \u00270\u0027)),\n        module: firstText(row.module, row.name, row.moduleRequirement, row.requirement, \u0027Module \u0027 + String(index + 1)),\n        sourceReferences: textList(row.sourceReferences, row.sourceReference, row.sources, row.evidence),\n        intendedCoverageIds: textList(row.intendedCoverageIds, row.coverageIds, row.coverageId),\n        status: normalizeCoverageStatus(row.status || row.coverageStatus || row.result || \u0027covered\u0027),\n        notes: firstText(row.notes, row.summary, row.resultNotes)\n      }))\n  };\n}\n\nfunction summarizeBatchPlan(batchPlan, coverageLedger, retryBatchesValue) {\n  const retryRows = Array.isArray(retryBatchesValue)\n    ? retryBatchesValue\n    : retryBatchesValue \u0026\u0026 typeof retryBatchesValue === \u0027object\u0027\n      ? Object.values(retryBatchesValue)\n      : [];\n  const retryIds = new Set(retryRows.flatMap(row =\u003e textList(row.batchId, row.id, row.coverageId, row.coverageIds, row.module, row.moduleRequirement)).map(normalizeKey));\n  const coverageById = new Map(coverageLedger.map(row =\u003e [normalizeKey(row.coverageId), row]));\n  const batches = (batchPlan.modules || []).map(batch =\u003e {\n    const coverageRows = batch.intendedCoverageIds\n      .map(id =\u003e coverageById.get(normalizeKey(id)))\n      .filter(Boolean);\n    const statuses = coverageRows.length ? coverageRows.map(row =\u003e row.coverageStatus) : [batch.status];\n    const status = statuses.includes(\u0027missing\u0027) || statuses.includes(\u0027unknown\u0027)\n      ? \u0027missing\u0027\n      : statuses.includes(\u0027partial\u0027)\n        ? \u0027partial\u0027\n        : statuses.includes(\u0027excluded\u0027)\n          ? \u0027excluded\u0027\n          : \u0027covered\u0027;\n    const retried = retryIds.has(normalizeKey(batch.batchId)) || retryIds.has(normalizeKey(batch.module)) || batch.intendedCoverageIds.some(id =\u003e retryIds.has(normalizeKey(id)));\n    return {\n      ...batch,\n      status,\n      retried,\n      recovered: retried \u0026\u0026 status === \u0027covered\u0027,\n      coverageIds: batch.intendedCoverageIds\n    };\n  });\n  const retryingBatches = batches.filter(batch =\u003e batch.retried \u0026\u0026 !batch.recovered \u0026\u0026 [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(batch.status)).length;\n  const recoveredBatches = batches.filter(batch =\u003e batch.recovered).length;\n  return {\n    version: \u0027backlog-batch-progress-v1\u0027,\n    mode: \u0027internal_retry\u0027,\n    totalBatches: batches.length,\n    completedBatches: batches.filter(batch =\u003e batch.status === \u0027covered\u0027 || batch.status === \u0027excluded\u0027).length,\n    retryingBatches,\n    recoveredBatches,\n    missingBatches: batches.filter(batch =\u003e batch.status === \u0027missing\u0027 || batch.status === \u0027unknown\u0027).length,\n    partialBatches: batches.filter(batch =\u003e batch.status === \u0027partial\u0027).length,\n    batches\n  };\n}\n\nfunction summarizeCoverageLedger(coverageLedger) {\n  const summary = {\n    version: \u0027backlog-coverage-ledger-v1\u0027,\n    mode: \u0027enforced\u0027,\n    coverageLedgerCount: coverageLedger.length,\n    coveredCount: 0,\n    partialCount: 0,\n    missingCount: 0,\n    excludedCount: 0,\n    unknownCount: 0,\n    uncoveredCount: 0,\n    blockingUncoveredCount: 0,\n    gateStatus: \u0027not_reported\u0027,\n    missingItems: []\n  };\n\n  for (const row of coverageLedger) {\n    if (row.coverageStatus === \u0027covered\u0027) summary.coveredCount += 1;\n    else if (row.coverageStatus === \u0027partial\u0027) summary.partialCount += 1;\n    else if (row.coverageStatus === \u0027missing\u0027) summary.missingCount += 1;\n    else if (row.coverageStatus === \u0027excluded\u0027) summary.excludedCount += 1;\n    else summary.unknownCount += 1;\n  }\n\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  summary.missingItems = coverageLedger\n    .filter(row =\u003e [\u0027partial\u0027, \u0027missing\u0027, \u0027unknown\u0027].includes(row.coverageStatus))\n    .slice(0, 25)\n    .map(row =\u003e ({\n      coverageId: row.coverageId,\n      moduleRequirement: row.moduleRequirement,\n      coverageStatus: row.coverageStatus,\n      notes: row.notes\n    }));\n\n  if (!coverageLedger.length) summary.gateStatus = \u0027failed\u0027;\n  else if (summary.blockingUncoveredCount \u003e 0) summary.gateStatus = \u0027failed\u0027;\n  else if (summary.partialCount \u003e 0) summary.gateStatus = \u0027warning\u0027;\n  else summary.gateStatus = \u0027passed\u0027;\n\n  return summary;\n}\n\nlet sourceCoverage = normalizeArray(generated.document?.sourceCoverage);\nlet retrievalEvidence = Array.isArray(generated.document?.retrievalEvidence) ? generated.document.retrievalEvidence : [];\n\nconst preflightRetrievalContext = Array.isArray(context.retrievalContext) ? context.retrievalContext : [];\nconst preflightCoverage = [...new Set(preflightRetrievalContext.map(chunk =\u003e {\n  const docType = String(chunk.docType || chunk.metadata?.docType || \u0027Source\u0027).trim();\n  const source = String(chunk.source || chunk.fileName || chunk.metadata?.fileName || chunk.metadata?.filename || \u0027\u0027).trim();\n  const section = String(chunk.section || chunk.sectionTitle || chunk.metadata?.sectionTitle || \u0027\u0027).trim();\n  return [docType, source, section].filter(Boolean).join(\u0027 - \u0027);\n}).filter(Boolean))];\n\nif (!sourceCoverage.length \u0026\u0026 preflightCoverage.length) {\n  sourceCoverage = preflightCoverage;\n}\n\nif (!retrievalEvidence.length \u0026\u0026 preflightRetrievalContext.length) {\n  retrievalEvidence = preflightRetrievalContext.slice(0, 20).map(chunk =\u003e ({\n    source: chunk.source || chunk.fileName || \u0027Chroma chunk\u0027,\n    docType: chunk.docType || \u0027UNKNOWN\u0027,\n    section: chunk.section || chunk.sectionTitle || \u0027\u0027,\n    chunkId: chunk.chunkId || \u0027\u0027,\n    contentSource: chunk.contentSource || \u0027\u0027,\n    profileScore: chunk.profileScore || null\n  }));\n}\n\nif (!generated.document || typeof generated.document !== \u0027object\u0027) {\n  generated.document = {};\n}\ngenerated.document.sourceCoverage = sourceCoverage;\ngenerated.document.retrievalEvidence = retrievalEvidence;\n\nlet coverageLedger = normalizeCoverageLedger(generated.document.coverageLedger || generated.coverageLedger || generated.backlogCoverageLedger);\nif (context.updateMode \u0026\u0026 !coverageLedger.length) {\n  const expectedIds = textList(\n    context.updateDeltaTargets?.requirementIds,\n    context.request?.updateDeltaTargets?.requirementIds,\n    context.updateContext?.updateDeltaTargets?.requirementIds,\n    context.updateContext?.expectedDeltaRequirementIds\n  );\n  const allGeneratedStories = epics.flatMap(epic =\u003e (Array.isArray(epic.stories) ? epic.stories : []).map(story =\u003e ({ epic, story })));\n  const requirementIds = [...new Set([\n    ...expectedIds,\n    ...epics.flatMap(epic =\u003e textList(epic.sourceTraceability, epic.sourceReferences)),\n    ...allGeneratedStories.flatMap(({ story }) =\u003e textList(story.sourceTraceability, story.sourceReferences))\n  ].filter(value =\u003e /^FRD-[A-Z0-9-]+$/i.test(String(value || \u0027\u0027).trim())))];\n  coverageLedger = requirementIds.map((requirementId, index) =\u003e {\n    const normalizedRequirement = normalizeKey(requirementId);\n    const mappedEpics = epics\n      .filter(epic =\u003e traceabilityTokens(epic).includes(normalizedRequirement))\n      .map(epic =\u003e firstText(epic.epicCorrelationId, epic.epicId))\n      .filter(Boolean);\n    const mappedStories = allGeneratedStories\n      .filter(({ story }) =\u003e traceabilityTokens(story).includes(normalizedRequirement))\n      .map(({ story }) =\u003e firstText(story.storyCorrelationId, story.userStoryId))\n      .filter(Boolean);\n    return {\n      coverageId: requirementId,\n      moduleRequirement: requirementId,\n      sourceReference: requirementId,\n      mappedEpicIds: [...new Set(mappedEpics)],\n      mappedStoryIds: [...new Set(mappedStories)],\n      coverageStatus: mappedEpics.length || mappedStories.length ? \u0027covered\u0027 : \u0027partial\u0027,\n      notes: mappedEpics.length || mappedStories.length\n        ? \u0027Delta requirement mapped from update-mode source traceability.\u0027\n        : \u0027Delta requirement was expected but not mapped by the model output.\u0027\n    };\n  });\n}\nif (context.updateMode \u0026\u0026 !coverageLedger.length) {\n  const previousEpics = Array.isArray(context.updateContext?.previousEpics) ? context.updateContext.previousEpics : [];\n  const previousStories = Array.isArray(context.updateContext?.previousStories) ? context.updateContext.previousStories : [];\n  const generatedStoryPairs = epics.flatMap(epic =\u003e\n    (Array.isArray(epic.stories) ? epic.stories : []).map(story =\u003e ({ epic, story }))\n  );\n  const priorEpicByKey = new Map(previousEpics.map(epic =\u003e [\n    normalizeKey(firstText(epic.epicCorrelationId, epic.epicId, epic.jiraEpicKey, epic.epicKey, epic.stableLabel, epic.epicName)),\n    epic\n  ]).filter(([key]) =\u003e key));\n  const priorStories = previousStories.map(story =\u003e {\n    const parentKey = normalizeKey(firstText(story.parentEpicCorrelationId, story.epicCorrelationId, story.parentEpicKey, story.jiraEpicKey, story.epicKey));\n    return {\n      epic: priorEpicByKey.get(parentKey) || {},\n      story\n    };\n  });\n  const fallbackStoryPairs = generatedStoryPairs.length ? generatedStoryPairs : priorStories;\n  coverageLedger = fallbackStoryPairs.map(({ epic, story }, index) =\u003e {\n    const storyId = firstText(story.storyCorrelationId, story.userStoryId, story.storyId, story.jiraStoryKey, story.storyKey, story.stableLabel, \u0027BACKLOG-STORY-\u0027 + (index + 1));\n    const epicId = firstText(epic.epicCorrelationId, epic.epicId, epic.jiraEpicKey, epic.epicKey, story.parentEpicCorrelationId, story.parentEpicKey, story.jiraEpicKey);\n    const traceIds = textList(story.sourceTraceability, story.sourceReferences, story.traceability, epic.sourceTraceability, epic.sourceReferences)\n      .filter(value =\u003e /^FRD-[A-Z0-9-]+$/i.test(String(value || \u0027\u0027).trim()));\n    const coverageId = firstText(traceIds[0], storyId);\n    return {\n      coverageId,\n      moduleRequirement: firstText(story.summary, story.storySummary, story.feature, story.userStory, storyId),\n      sourceReference: firstText(traceIds[0], story.sourceTraceability, story.sourceReferences, epic.sourceTraceability, epic.sourceReferences, \u0027Previous Jira backlog baseline\u0027),\n      mappedEpicIds: textList(epicId),\n      mappedStoryIds: textList(storyId),\n      coverageStatus: \u0027covered\u0027,\n      notes: \u0027Synthesized from update-mode generated/backlog baseline because the model omitted document.coverageLedger.\u0027\n    };\n  });\n  if (!coverageLedger.length \u0026\u0026 previousEpics.length) {\n    coverageLedger = previousEpics.map((epic, index) =\u003e {\n      const epicId = firstText(epic.epicCorrelationId, epic.epicId, epic.jiraEpicKey, epic.epicKey, epic.stableLabel, \u0027BACKLOG-EPIC-\u0027 + (index + 1));\n      return {\n        coverageId: epicId,\n        moduleRequirement: firstText(epic.epicName, epic.summary, epic.name, epicId),\n        sourceReference: firstText(epic.sourceTraceability, epic.sourceReferences, \u0027Previous Jira backlog baseline\u0027),\n        mappedEpicIds: textList(epicId),\n        mappedStoryIds: [],\n        coverageStatus: \u0027covered\u0027,\n        notes: \u0027Synthesized from update-mode generated/backlog baseline because the model omitted document.coverageLedger.\u0027\n      };\n    });\n  }\n}\ngenerated.document.coverageLedger = coverageLedger;\nlet coverageSummary = summarizeCoverageLedger(coverageLedger);\n\nif (!context.retrievalQuality || Number(context.retrievalQuality.chunkCount || 0) \u003c 1) {\n  fatalErrors.push(\u0027Preflight Chroma retrieval returned 0 chunks for project=\u0027 + (context.projectName || \u0027Unknown Project\u0027) + \u0027.\u0027);\n}\nif (!sourceCoverage.length \u0026\u0026 !retrievalEvidence.length) {\n  fatalErrors.push(\u0027No Chroma retrieval evidence is available from either the model response or preflight retrieval. Refusing to create Jira issues from fallback-only content. Check Chroma metadata filter, project ingestion, and whether chunks exist for project=\u0027 + (context.projectName || \u0027Unknown Project\u0027) + \u0027.\u0027);\n}\nif (!epics.length) fatalErrors.push(\u0027No epics were generated.\u0027);\nif (!coverageLedger.length) {\n  fatalErrors.push(\u0027Backlog Coverage Gate failed: document.coverageLedger is required before Jira issues can be created.\u0027);\n}\n\nconst epicNames = new Set();\nconst storySummaries = new Set();\nlet totalStories = 0;\n\nfor (const [epicIndex, epic] of epics.entries()) {\n  const epicId = epic.epicCorrelationId || epic.epicId || `EPIC-${String(epicIndex + 1).padStart(3, \u00270\u0027)}`;\n  epic.epicCorrelationId = epic.epicCorrelationId || epic.epicId || epicId;\n  epic.epicName = epic.epicName || epic.feature || \u0027\u0027;\n  epic.epicSummary = epic.epicSummary || epic.epicDescription || epic.businessOutcome || \u0027\u0027;\n  epic.businessOutcome = epic.businessOutcome || epic.businessObjective || \u0027\u0027;\n  epic.sourceReferences = normalizeArray(epic.sourceReferences).concat(normalizeArray(epic.sourceTraceability));\n  epic.sourceReferences = [...new Set(epic.sourceReferences)];\n  epic.successMetrics = normalizeArray(epic.successMetrics);\n  epic.priority = epic.priority || \u0027Medium\u0027;\n  epic.storyCountRationale = epic.storyCountRationale || epic.decompositionRationale || epic.scopeRationale || \u0027\u0027;\n\n  if (!epic.epicCorrelationId) fatalErrors.push(\u0027Epic at index \u0027 + epicIndex + \u0027 is missing epicCorrelationId.\u0027);\n  if (!epic.epicName || String(epic.epicName).trim().length \u003c 8) fatalErrors.push(\u0027Epic \u0027 + epicId + \u0027 has a missing or weak epicName.\u0027);\n  const epicName = String(epic.epicName || \u0027\u0027).trim().toLowerCase();\n  if (epicName \u0026\u0026 epicNames.has(epicName)) fatalErrors.push(\u0027Duplicate epic name: \u0027 + epic.epicName);\n  if (epicName) epicNames.add(epicName);\n  if (!epic.sourceReferences.length) fatalErrors.push(\u0027Epic \u0027 + epicId + \u0027 has no source references.\u0027);\n\n  epic.stories = Array.isArray(epic.stories) ? epic.stories : [];\n  if (!epic.stories.length) {\n    fatalErrors.push(\u0027Epic \u0027 + epicId + \u0027 has zero stories. Adaptive story count is allowed, but every epic must have at least one valid child story or it cannot be linked cleanly in Jira.\u0027);\n    continue;\n  }\n\n  totalStories += epic.stories.length;\n\n  for (const [storyIndex, story] of epic.stories.entries()) {\n    const storyId = story.storyCorrelationId || story.userStoryId || `${epicId}-US-${String(storyIndex + 1).padStart(3, \u00270\u0027)}`;\n    story.storyCorrelationId = story.storyCorrelationId || story.userStoryId || storyId;\n    story.summary = story.summary || story.feature || String(story.userStory || \u0027\u0027).slice(0, 120) || \u0027\u0027;\n    story.feature = story.feature || story.summary;\n    story.userStoryDescription = story.userStoryDescription || story.description || \u0027\u0027;\n    story.businessContext = story.businessContext || epic.businessOutcome || epic.businessObjective || \u0027\u0027;\n    story.acceptanceCriteria = normalizeArray(story.acceptanceCriteria);\n    story.alternateFlows = normalizeArray(story.alternateFlows);\n    story.exceptionHandling = normalizeArray(story.exceptionHandling);\n    story.uiUxRequirements = normalizeArray(story.uiUxRequirements);\n    story.fieldValidationRules = normalizeArray(story.fieldValidationRules);\n    story.dataIntegrationRequirements = normalizeArray(story.dataIntegrationRequirements);\n    story.performanceNFRs = normalizeArray(story.performanceNFRs);\n    story.testScenarios = normalizeArray(story.testScenarios);\n    story.dependencies = normalizeArray(story.dependencies);\n    story.assumptions = normalizeArray(story.assumptions);\n    story.nonFunctionalConsiderations = normalizeArray(story.nonFunctionalConsiderations);\n    story.testNotes = normalizeArray(story.testNotes);\n    story.sourceReferences = normalizeArray(story.sourceReferences).concat(normalizeArray(story.sourceTraceability));\n    if (!story.sourceReferences.length \u0026\u0026 epic.sourceReferences.length) story.sourceReferences = epic.sourceReferences;\n    story.sourceReferences = [...new Set(story.sourceReferences)];\n\n    if (!story.storyCorrelationId) fatalErrors.push(\u0027Story under \u0027 + epicId + \u0027 missing storyCorrelationId.\u0027);\n    if (!story.summary || String(story.summary).trim().length \u003c 8) fatalErrors.push(\u0027Story \u0027 + storyId + \u0027 has a missing or weak summary.\u0027);\n    const storySummary = String(story.summary || \u0027\u0027).trim().toLowerCase();\n    if (storySummary \u0026\u0026 storySummaries.has(storySummary)) {\n      if (context.updateMode \u0026\u0026 story.updateMergedDuplicate) {\n        story.validationNote = firstText(story.validationNote, \u0027Duplicate update story summary merged into existing Jira story for idempotent update.\u0027);\n      } else {\n        fatalErrors.push(\u0027Duplicate story summary: \u0027 + story.summary);\n      }\n    }\n    if (storySummary) storySummaries.add(storySummary);\n    const userStoryText = String(story.userStory || \u0027\u0027).trim();\n    story.userStoryFormat = /^As a\\b/i.test(userStoryText) ? \u0027canonical\u0027 : (userStoryText ? \u0027narrative_statement\u0027 : \u0027missing\u0027);\n    if (!userStoryText \u0026\u0026 story.summary) {\n      story.userStory = story.summary;\n      story.userStoryFormat = \u0027derived_from_summary\u0027;\n    }\n    if (story.acceptanceCriteria.length \u003c 1) fatalErrors.push(\u0027Story \u0027 + storyId + \u0027 has no acceptance criteria.\u0027);\n    const hasGivenWhenThenCriteria = story.acceptanceCriteria.some(a =\u003e /given.+when.+then/i.test(String(a)));\n    story.acceptanceCriteriaFormat = hasGivenWhenThenCriteria ? \u0027given_when_then\u0027 : \u0027testable_statement\u0027;\n    if (!story.sourceReferences.length) fatalErrors.push(\u0027Story \u0027 + storyId + \u0027 has no source references.\u0027);\n  }\n}\n\nconst knownEpicIds = new Set(epics.flatMap(epic =\u003e [\n  epic.epicCorrelationId,\n  epic.epicId,\n  epic.id,\n  epic.key,\n  epic.epicName\n].map(normalizeKey).filter(Boolean)));\nconst knownStoryIds = new Set(epics.flatMap(epic =\u003e (epic.stories || []).flatMap(story =\u003e [\n  story.storyCorrelationId,\n  story.userStoryId,\n  story.storyId,\n  story.id,\n  story.key,\n  story.summary\n].map(normalizeKey).filter(Boolean))));\n\nconst mappingWarnings = [];\ncoverageLedger = coverageLedger.map(row =\u003e {\n  const mappedEpicMatches = row.mappedEpicIds.filter(id =\u003e knownEpicIds.has(normalizeKey(id)));\n  const mappedStoryMatches = row.mappedStoryIds.filter(id =\u003e knownStoryIds.has(normalizeKey(id)));\n  const hasMappedOutput = mappedEpicMatches.length \u003e 0 || mappedStoryMatches.length \u003e 0;\n  if (row.coverageStatus === \u0027covered\u0027 \u0026\u0026 !hasMappedOutput) {\n    fatalErrors.push(\u0027Backlog Coverage Gate failed: covered ledger row \u0027 + row.coverageId + \u0027 has no mapped generated epic/story correlation IDs.\u0027);\n  }\n  if (row.coverageStatus === \u0027partial\u0027 \u0026\u0026 !hasMappedOutput) {\n    mappingWarnings.push(row.coverageId + \u0027 has partial coverage but no mapped generated epic/story correlation IDs.\u0027);\n  }\n  return {\n    ...row,\n    mappedEpicMatches,\n    mappedStoryMatches\n  };\n});\ngenerated.document.coverageLedger = coverageLedger;\ncoverageSummary = summarizeCoverageLedger(coverageLedger);\ncoverageSummary.mappingWarnings = mappingWarnings.slice(0, 25);\ncoverageSummary.mappingWarningCount = mappingWarnings.length;\nconst retryBatches = Array.isArray(generated.document.retryBatches || generated.retryBatches)\n  ? (generated.document.retryBatches || generated.retryBatches)\n  : [];\nconst batchPlan = normalizeBatchPlan(generated.document.batchPlan || generated.batchPlan || generated.document.moduleBatchPlan, coverageLedger);\nconst batchSummary = summarizeBatchPlan(batchPlan, coverageLedger, retryBatches);\n\nconst BACKLOG_DELTA_SEMANTIC_V1_VALIDATE = true;\nconst BACKLOG_DELTA_SEMANTIC_V2_VALIDATE = true;\nconst updateModeActive = String(context.generationMode || \u0027\u0027).toLowerCase() === \u0027update\u0027 || Boolean(context.updateMode || context.updateContext?.updateMode);\nconst updateReasonsActive = Array.isArray(context.updateContext?.updateReasons) \u0026\u0026 context.updateContext.updateReasons.filter(Boolean).length \u003e 0;\nconst sourceChangedActive = Boolean(context.updateContext?.contextUpdated) || updateReasonsActive;\nlet promptDeltaTargets = {};\ntry { promptDeltaTargets = $(\u0027Professional Prompt Library\u0027).first().json.updateDeltaTargets || {}; } catch (error) { promptDeltaTargets = {}; }\nconst expectedDeltaIds = Array.isArray(promptDeltaTargets.requirementIds) ? promptDeltaTargets.requirementIds.map(id =\u003e String(id || \u0027\u0027).toUpperCase()).filter(Boolean) : [];\nconst updateSummaryForDelta = generated.document?.updateSummary \u0026\u0026 typeof generated.document.updateSummary === \u0027object\u0027 ? generated.document.updateSummary : {};\nconst reportedDeltaText = JSON.stringify({\n  updateSummaryDeltaRequirementIds: updateSummaryForDelta.deltaRequirementIds || [],\n  resolvedCoverageIds: updateSummaryForDelta.resolvedCoverageIds || [],\n  unchangedCoverageIds: updateSummaryForDelta.unchangedCoverageIds || [],\n  noChangeReason: updateSummaryForDelta.noChangeReason || \u0027\u0027,\n  coverageLedger,\n  sourceCoverage,\n  epics\n}).toUpperCase();\nconst accountedDeltaIds = new Set([\n  ...textList(updateSummaryForDelta.deltaRequirementIds),\n  ...textList(updateSummaryForDelta.resolvedCoverageIds),\n  ...textList(updateSummaryForDelta.unchangedCoverageIds),\n  ...coverageLedger.flatMap(row =\u003e textList(row.coverageId, row.mappedCoverageIds, row.intendedCoverageIds)),\n  ...sourceCoverage.flatMap(item =\u003e textList(item)),\n  ...epics.flatMap(epic =\u003e textList(epic.sourceTraceability, epic.sourceReferences, (epic.stories || []).flatMap(story =\u003e textList(story.sourceTraceability, story.sourceReferences))))\n].map(id =\u003e String(id || \u0027\u0027).toUpperCase()).filter(Boolean));\nconst missingDeltaTargetIds = expectedDeltaIds.filter(id =\u003e !accountedDeltaIds.has(id) \u0026\u0026 !reportedDeltaText.includes(id));\nif (updateModeActive \u0026\u0026 missingDeltaTargetIds.length) {\n  const reviewRows = missingDeltaTargetIds.slice(0, 20).map(id =\u003e ({\n    coverageId: id,\n    moduleRequirement: \u0027Delta target requirement \u0027 + id,\n    coverageStatus: \u0027partial\u0027,\n    notes: \u0027Detected supporting-document delta target was not mapped in this Backlog update output.\u0027\n  }));\n  coverageSummary.gateStatus = \u0027warning\u0027;\n  coverageSummary.deltaUpdateNeedsReview = true;\n  coverageSummary.missingDeltaTargetIds = missingDeltaTargetIds;\n  coverageSummary.partialCount = Math.max(coverageSummary.partialCount, reviewRows.length);\n  coverageSummary.uncoveredCount = Math.max(coverageSummary.uncoveredCount, coverageSummary.partialCount);\n  coverageSummary.missingItems = [...(coverageSummary.missingItems || []), ...reviewRows].slice(0, 25);\n  for (const row of reviewRows) {\n    batchSummary.batches.push({\n      batchId: row.coverageId,\n      module: row.moduleRequirement,\n      sourceReferences: [\u0027Professional Prompt Library delta target list\u0027],\n      intendedCoverageIds: [row.coverageId],\n      status: \u0027partial\u0027,\n      notes: row.notes,\n      retried: false,\n      recovered: false,\n      coverageIds: [row.coverageId]\n    });\n  }\n  batchSummary.totalBatches = batchSummary.batches.length;\n  batchSummary.partialBatches = batchSummary.batches.filter(batch =\u003e batch.status === \u0027partial\u0027).length;\n  batchSummary.completedBatches = batchSummary.batches.filter(batch =\u003e batch.status === \u0027covered\u0027 || batch.status === \u0027excluded\u0027).length;\n  generated.document.deltaUpdateNeedsReview = true;\n}\n\nif (updateModeActive \u0026\u0026 sourceChangedActive \u0026\u0026 (batchSummary.missingBatches \u003e 0 || batchSummary.partialBatches \u003e 0)) {\n  const reviewBatches = batchSummary.batches\n    .filter(batch =\u003e [\u0027missing\u0027, \u0027unknown\u0027, \u0027partial\u0027].includes(batch.status))\n    .slice(0, 12)\n    .map(batch =\u003e ({\n      coverageId: (batch.coverageIds || [])[0] || batch.batchId,\n      moduleRequirement: batch.module,\n      coverageStatus: batch.status === \u0027partial\u0027 ? \u0027partial\u0027 : \u0027partial\u0027,\n      notes: \u0027Delta update batch needs review before it can be treated as covered.\u0027\n    }));\n  coverageSummary.gateStatus = \u0027warning\u0027;\n  coverageSummary.deltaUpdateNeedsReview = true;\n  coverageSummary.deltaBatchReviewCount = reviewBatches.length;\n  coverageSummary.partialCount = Math.max(coverageSummary.partialCount, reviewBatches.length || 1);\n  coverageSummary.uncoveredCount = Math.max(coverageSummary.uncoveredCount, coverageSummary.partialCount);\n  coverageSummary.missingItems = [...(coverageSummary.missingItems || []), ...reviewBatches].slice(0, 25);\n  generated.document.deltaUpdateNeedsReview = true;\n}\n\ngenerated.document.batchPlan = batchPlan;\ngenerated.document.batchResults = {\n  ...(generated.document.batchResults || {}),\n  ...batchSummary\n};\ngenerated.document.retryBatches = retryBatches;\ncoverageSummary.recoveredCount = batchSummary.recoveredBatches;\ncoverageSummary.recoveredItems = batchSummary.batches\n  .filter(batch =\u003e batch.recovered)\n  .slice(0, 25)\n  .map(batch =\u003e ({ batchId: batch.batchId, moduleRequirement: batch.module, coverageStatus: batch.status }));\n\nif (coverageSummary.blockingUncoveredCount \u003e 0) {\n  const examples = coverageSummary.missingItems\n    .filter(item =\u003e [\u0027missing\u0027, \u0027unknown\u0027].includes(item.coverageStatus))\n    .slice(0, 5)\n    .map(item =\u003e [item.coverageId, item.moduleRequirement, item.coverageStatus].filter(Boolean).join(\u0027 - \u0027))\n    .join(\u0027; \u0027);\n  fatalErrors.push(\u0027Backlog Coverage Gate failed: \u0027 + coverageSummary.blockingUncoveredCount + \u0027 missing or unrecognized coverage ledger item(s).\u0027 + (examples ? \u0027 Examples: \u0027 + examples : \u0027\u0027));\n}\n\nif (!totalStories) fatalErrors.push(\u0027No user stories were generated across the backlog.\u0027);\nif (fatalErrors.length) throw new Error(\u0027Backlog quality gate failed: \u0027 + [...new Set(fatalErrors)].join(\u0027 | \u0027));\n\nconst textForTokens = JSON.stringify(generated);\nconst tokensOutput = Math.max(1, Math.ceil(textForTokens.length / 4));\nconst prompt = $(\u0027Professional Prompt Library\u0027).first().json;\nconst tokensInput = Math.max(1, Math.ceil(((prompt.system || \u0027\u0027) + (prompt.user || \u0027\u0027)).length / 4));\nconst estimatedCostUsd = Number(((tokensInput * 0.40 / 1000000) + (tokensOutput * 1.60 / 1000000)).toFixed(6));\n\nreturn [{\n  json: {\n    ...context,\n    generated,\n    epics,\n    wordCount: textForTokens.split(/\\s+/).length,\n    tokensInput,\n    tokensOutput,\n    tokensTotal: tokensInput + tokensOutput,\n    estimatedCostUsd,\n    coverageLedger,\n    coverageSummary,\n    batchPlan,\n    batchSummary,\n    progress: {\n      stage: \u0027coverage_reviewed\u0027,\n      stageLabel: coverageSummary.gateStatus === \u0027warning\u0027 ? \u0027Coverage reviewed with warnings\u0027 : \u0027Coverage reviewed\u0027,\n      progressPercent: 82,\n      summary: coverageSummary.gateStatus === \u0027warning\u0027\n        ? \u0027Backlog batches were generated and reviewed. Some coverage needs review before final sign-off.\u0027\n        : \u0027Backlog batches were generated, reviewed against the coverage ledger, and prepared for Jira publishing.\u0027,\n      coverage: coverageSummary,\n      batches: batchSummary.batches\n    },\n    qualityGate: {\n      passed: true,\n      status: coverageSummary.gateStatus === \u0027warning\u0027 ? \u0027passed_with_warnings\u0027 : \u0027passed\u0027,\n      jiraProjectType: \u0027team-managed\u0027,\n      adaptiveStoryCount: true,\n      epicCount: epics.length,\n      storyCount: totalStories,\n      sourceCoverage,\n      retrievalEvidenceCount: retrievalEvidence.length,\n      coverageGate: coverageSummary.gateStatus,\n      coverageLedger,\n      coverageSummary,\n      coverageLedgerCount: coverageSummary.coverageLedgerCount,\n      uncoveredCoverageCount: coverageSummary.uncoveredCount,\n      blockingUncoveredCoverageCount: coverageSummary.blockingUncoveredCount,\n      missingCoverageItems: coverageSummary.missingItems,\n      batchPlan,\n      batchSummary,\n      progress: {\n        stage: \u0027coverage_reviewed\u0027,\n        stageLabel: coverageSummary.gateStatus === \u0027warning\u0027 ? \u0027Coverage reviewed with warnings\u0027 : \u0027Coverage reviewed\u0027,\n        progressPercent: 82,\n        summary: \u0027Backlog batches were generated, reviewed against the coverage ledger, and prepared for Jira publishing.\u0027,\n        coverage: coverageSummary,\n        batches: batchSummary.batches\n      }\n    }\n  }\n}];"
}
```

### When Executed by Another Workflow

| Field | Value |
| --- | --- |
| Node ID | ae07f3be-1010-4c7b-8c60-4dc5e96b393b |
| Type | n8n-nodes-base.executeWorkflowTrigger |
| Type Version | 1.1 |
| Position | -736, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- When Executed by Another Workflow -> Normalize Team Managed Request (output 0, input 0)

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
