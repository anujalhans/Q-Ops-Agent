# PRO QA Generation Queue Worker - Ready Draft

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | QApRBFSaJgINsdHN |
| Active | True |
| Created At | 2026-05-11T04:00:34.834Z |
| Updated At | 2026-06-09T19:18:35.480Z |
| Node Count | 22 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\PRO QA Generation Queue Worker - Ready Draft [QApRBFSaJgINsdHN].json |

## Description

Professional worker with lock-success guard, started/quality/completed/failed metrics, failed status handling for professional backlog jobs, and reuse of fullRetrievalD01 for other document types.

## Trigger And Entry Contract

- Schedule Trigger | n8n-nodes-base.scheduleTrigger |  rule={     "interval":  [                      {                          "field":  "seconds",                          "secondsInterval":  20                      }                  ] }

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 7 |
| n8n-nodes-base.executeWorkflow | 2 |
| n8n-nodes-base.httpRequest | 8 |
| n8n-nodes-base.if | 3 |
| n8n-nodes-base.scheduleTrigger | 1 |
| n8n-nodes-base.stickyNote | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- Schedule Trigger -> Get Pending Professional Jobs (source output 0, target input 0)
- Get Pending Professional Jobs -> Pending Professional Job Exists? (source output 0, target input 0)
- Pending Professional Job Exists? -> Lock Professional Job (source output 0, target input 0)
- Lock Professional Job -> Professional Lock Acquired? (source output 0, target input 0)
- Professional Lock Acquired? -> Prepare Generator Input (source output 0, target input 0)
- Prepare Generator Input -> LOG: Professional Job Started (source output 0, target input 0)
- LOG: Professional Job Started -> Restore Generator Input After Start Log (source output 0, target input 0)
- Restore Generator Input After Start Log -> Use Professional Backlog Generator? (source output 0, target input 0)
- Use Professional Backlog Generator? -> Call Professional Backlog Generator (source output 0, target input 0)
- Use Professional Backlog Generator? -> Call Existing Full Retrieval Generator (source output 1, target input 0)
- Call Professional Backlog Generator -> Build Backlog Completion Output (source output 0, target input 0)
- Call Professional Backlog Generator -> Build Professional Failure Output (source output 1, target input 0)
- Build Backlog Completion Output -> LOG: Professional Quality Gate Passed (source output 0, target input 0)
- LOG: Professional Quality Gate Passed -> Restore Backlog Completion Output (source output 0, target input 0)
- Restore Backlog Completion Output -> LOG: Professional Backlog Completed (source output 0, target input 0)
- LOG: Professional Backlog Completed -> Restore Completion Before Status Update (source output 0, target input 0)
- Restore Completion Before Status Update -> Mark Professional Backlog Job Completed (source output 0, target input 0)
- Build Professional Failure Output -> LOG: Professional Backlog Failed (source output 0, target input 0)
- LOG: Professional Backlog Failed -> Restore Failure Output (source output 0, target input 0)
- Restore Failure Output -> Mark Professional Backlog Job Failed (source output 0, target input 0)
- Call Existing Full Retrieval Generator -> Build Professional Failure Output (source output 1, target input 0)

## Nodes

### Build Backlog Completion Output

| Field | Value |
| --- | --- |
| Node ID | 79210578-235e-4ae2-b514-4c8b3376f7e2 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Call Professional Backlog Generator -> Build Backlog Completion Output (output 0, input 0)

**Outgoing Connections**

- Build Backlog Completion Output -> LOG: Professional Quality Gate Passed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const result = $json || {};\nconst input = $(\u0027Prepare Generator Input\u0027).first().json;\n\nfunction array(value) {\n  return Array.isArray(value) ? value.filter(item =\u003e item \u0026\u0026 typeof item === \u0027object\u0027) : [];\n}\nfunction firstText(...values) {\n  for (const value of values) {\n    if (value === null || value === undefined) continue;\n    const text = String(value).trim();\n    if (text) return text;\n  }\n  return \u0027\u0027;\n}\nfunction actionOf(item) {\n  const action = String(item?.action || item?.operation || item?.status || \u0027\u0027).trim().toLowerCase();\n  if ([\u0027created\u0027, \u0027create\u0027, \u0027added\u0027, \u0027new\u0027].includes(action)) return \u0027created\u0027;\n  if ([\u0027updated\u0027, \u0027update\u0027, \u0027patched\u0027, \u0027modified\u0027].includes(action)) return \u0027updated\u0027;\n  if ([\u0027removed\u0027, \u0027remove\u0027, \u0027deleted\u0027, \u0027delete\u0027].includes(action)) return \u0027removed\u0027;\n  if ([\u0027reused\u0027, \u0027reuse\u0027, \u0027existing\u0027, \u0027unchanged\u0027, \u0027preserved\u0027, \u0027skipped\u0027].includes(action)) return \u0027reused\u0027;\n  return action || \u0027created\u0027;\n}\nfunction issueKey(item, kind) {\n  return kind === \u0027epic\u0027\n    ? firstText(item.jiraEpicKey, item.epicKey, item.key, item.issueKey, item.jiraKey, item.epicCorrelationId, item.epicName)\n    : firstText(item.storyKey, item.jiraStoryKey, item.key, item.issueKey, item.jiraKey, item.storyCorrelationId, item.summary);\n}\nfunction issueSummary(item, kind) {\n  return kind === \u0027epic\u0027\n    ? firstText(item.epicName, item.name, item.summary, item.title, item.jiraEpicKey, item.epicKey)\n    : firstText(item.summary, item.storySummary, item.name, item.title, item.storyKey, item.jiraStoryKey);\n}\nfunction normalizeActionItems(items, kind, actionOverride) {\n  const seen = new Set();\n  return array(items).map(item =\u003e {\n    const action = actionOverride || actionOf(item);\n    return {\n      ...item,\n      action,\n      key: issueKey(item, kind),\n      summary: issueSummary(item, kind),\n    };\n  }).filter(item =\u003e {\n    const key = String(item.key || item.summary || \u0027\u0027).toLowerCase();\n    const dedupeKey = kind + \u0027:\u0027 + actionOf(item) + \u0027:\u0027 + key;\n    if (!key || seen.has(dedupeKey)) return false;\n    seen.add(dedupeKey);\n    return true;\n  });\n}\nfunction summarizeCoverageLedger(rows) {\n  const summary = {\n    mode: \u0027enforced\u0027,\n    version: \u0027backlog-coverage-ledger-v1\u0027,\n    gateStatus: \u0027passed\u0027,\n    coverageLedgerCount: rows.length,\n    coveredCount: 0,\n    partialCount: 0,\n    missingCount: 0,\n    unknownCount: 0,\n    excludedCount: 0,\n    uncoveredCount: 0,\n    blockingUncoveredCount: 0,\n    missingItems: [],\n    mappingWarnings: [],\n    mappingWarningCount: 0,\n  };\n  for (const row of rows) {\n    const status = String(row.coverageStatus || row.status || \u0027\u0027).toLowerCase();\n    if (status.includes(\u0027cover\u0027)) summary.coveredCount += 1;\n    else if (status.includes(\u0027exclude\u0027)) summary.excludedCount += 1;\n    else if (status.includes(\u0027partial\u0027) || status.includes(\u0027review\u0027)) {\n      summary.partialCount += 1;\n      summary.missingItems.push(row);\n    } else {\n      summary.missingCount += 1;\n      summary.missingItems.push(row);\n    }\n  }\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  if (summary.blockingUncoveredCount) summary.gateStatus = \u0027failed\u0027;\n  else if (summary.partialCount) summary.gateStatus = \u0027warning\u0027;\n  return summary;\n}\n\nconst confluenceUrl = result.confluence?.url || result.confluenceUrl || result.url || null;\nconst generationMode = input.generationMode || (input.retryContext?.retryMode ? \u0027retry\u0027 : \u0027create\u0027);\nconst updateContext = input.updateContext || {};\nconst previousEpics = array(updateContext.previousEpics);\nconst previousStories = array(updateContext.previousStories);\nconst currentEpics = array(result.epics || result.jira?.epics);\nconst currentStories = array(result.stories || result.jira?.stories);\nconst addedEpics = normalizeActionItems(currentEpics.filter(item =\u003e actionOf(item) === \u0027created\u0027), \u0027epic\u0027, \u0027created\u0027);\nconst updatedEpics = normalizeActionItems(currentEpics.filter(item =\u003e actionOf(item) === \u0027updated\u0027), \u0027epic\u0027, \u0027updated\u0027);\nconst removedEpics = normalizeActionItems(currentEpics.filter(item =\u003e actionOf(item) === \u0027removed\u0027), \u0027epic\u0027, \u0027removed\u0027);\nconst addedStories = normalizeActionItems(currentStories.filter(item =\u003e actionOf(item) === \u0027created\u0027), \u0027story\u0027, \u0027created\u0027);\nconst updatedStories = normalizeActionItems(currentStories.filter(item =\u003e actionOf(item) === \u0027updated\u0027), \u0027story\u0027, \u0027updated\u0027);\nconst removedStories = normalizeActionItems(currentStories.filter(item =\u003e actionOf(item) === \u0027removed\u0027), \u0027story\u0027, \u0027removed\u0027);\nconst preservedEpics = generationMode === \u0027update\u0027\n  ? normalizeActionItems(previousEpics, \u0027epic\u0027, \u0027reused\u0027)\n  : normalizeActionItems(currentEpics.filter(item =\u003e actionOf(item) === \u0027reused\u0027), \u0027epic\u0027, \u0027reused\u0027);\nconst preservedStories = generationMode === \u0027update\u0027\n  ? normalizeActionItems(previousStories, \u0027story\u0027, \u0027reused\u0027)\n  : normalizeActionItems(currentStories.filter(item =\u003e actionOf(item) === \u0027reused\u0027), \u0027story\u0027, \u0027reused\u0027);\n\nconst noModelTokenUsage = result.updateSummary?.tokenUsage?.source === \u0027no_model_delta_gate\u0027\n  ? result.updateSummary.tokenUsage\n  : null;\nconst tokenUsage = {\n  source: noModelTokenUsage?.source || result.tokenUsage?.source || \u0027estimated\u0027,\n  input: Number(noModelTokenUsage?.input ?? result.tokenUsage?.input ?? result.tokenUsage?.tokensInput ?? result.tokensInput ?? 0) || 0,\n  output: Number(noModelTokenUsage?.output ?? result.tokenUsage?.output ?? result.tokenUsage?.tokensOutput ?? result.tokensOutput ?? 0) || 0,\n  total: Number(noModelTokenUsage?.total ?? result.tokenUsage?.total ?? result.tokenUsage?.tokensTotal ?? result.tokensTotal ?? 0) || 0,\n  tokensInput: Number(noModelTokenUsage?.input ?? result.tokenUsage?.input ?? result.tokenUsage?.tokensInput ?? result.tokensInput ?? 0) || 0,\n  tokensOutput: Number(noModelTokenUsage?.output ?? result.tokenUsage?.output ?? result.tokenUsage?.tokensOutput ?? result.tokensOutput ?? 0) || 0,\n  tokensTotal: Number(noModelTokenUsage?.total ?? result.tokenUsage?.total ?? result.tokenUsage?.tokensTotal ?? result.tokensTotal ?? 0) || 0,\n  estimatedCostUsd: Number(noModelTokenUsage?.estimatedCostUsd ?? result.tokenUsage?.estimatedCostUsd ?? result.estimatedCostUsd ?? 0) || 0,\n};\nconst previousTokenUsage = updateContext.previousTokenUsage || {};\nconst baselineTokens = Number(previousTokenUsage.total || previousTokenUsage.tokensTotal || 0) || 0;\nconst baselineCost = Number(previousTokenUsage.estimatedCostUsd || previousTokenUsage.estimated_cost_usd || 0) || 0;\nconst tokenSavings = {\n  estimatedBaselineTokens: baselineTokens || null,\n  estimatedTokensSaved: baselineTokens ? Math.max(0, baselineTokens - tokenUsage.total) : 0,\n  estimatedBaselineCostUsd: baselineCost || null,\n  estimatedCostSavedUsd: baselineCost ? Math.max(0, Number((baselineCost - tokenUsage.estimatedCostUsd).toFixed(6))) : 0,\n  estimatedSavingsPercent: baselineTokens ? Math.max(0, Math.round(((baselineTokens - tokenUsage.total) / baselineTokens) * 100)) : null,\n};\nconst coverageLedger = array(result.coverageLedger || result.qualityGate?.coverageLedger || result.generated?.document?.coverageLedger);\nconst coverageSummary = result.coverageSummary || result.qualityGate?.coverageSummary || result.qualityGate?.progress?.coverage || summarizeCoverageLedger(coverageLedger);\nconst existingSummary = result.updateSummary || {};\nconst updateSummary = {\n  ...existingSummary,\n  enabled: true,\n  version: \u0027backlog-update-summary-v2\u0027,\n  documentType: \u0027user_stories\u0027,\n  mode: generationMode,\n  operationMode: generationMode === \u0027update\u0027 \u0026\u0026 input.retryOfJobId ? \u0027update_retry\u0027 : generationMode,\n  deltaMode: generationMode === \u0027update\u0027,\n  updateOfJobId: updateContext.previousJobId || input.updateOfJobId || null,\n  previousJobId: updateContext.previousJobId || input.updateOfJobId || null,\n  previousBacklogBaselineCounts: {\n    epics: previousEpics.length,\n    stories: previousStories.length,\n  },\n  createdEpicCount: addedEpics.length,\n  createdStoryCount: addedStories.length,\n  updatedEpicCount: updatedEpics.length,\n  updatedStoryCount: updatedStories.length,\n  reusedEpicCount: preservedEpics.length,\n  reusedStoryCount: preservedStories.length,\n  removedEpicCount: removedEpics.length,\n  removedStoryCount: removedStories.length,\n  totalEpicCount: Math.max(0, (previousEpics.length || preservedEpics.length) + addedEpics.length - removedEpics.length),\n  totalStoryCount: Math.max(0, (previousStories.length || preservedStories.length) + addedStories.length - removedStories.length),\n  addedEpics,\n  addedStories,\n  updatedEpics,\n  updatedStories,\n  preservedEpics,\n  preservedStories,\n  removedEpics,\n  removedStories,\n  coverageSummary,\n  coverageLedgerCount: coverageSummary.coverageLedgerCount || coverageLedger.length,\n  tokenUsage,\n  previousTokenUsage,\n  tokenSavings,\n  estimatedBaselineTokens: tokenSavings.estimatedBaselineTokens,\n  estimatedTokensSaved: tokenSavings.estimatedTokensSaved,\n  estimatedBaselineCostUsd: tokenSavings.estimatedBaselineCostUsd,\n  estimatedCostSavedUsd: tokenSavings.estimatedCostSavedUsd,\n  estimatedSavingsPercent: tokenSavings.estimatedSavingsPercent,\n  message: [\n    addedEpics.length ? addedEpics.length + \u0027 epic\u0027 + (addedEpics.length === 1 ? \u0027\u0027 : \u0027s\u0027) + \u0027 added\u0027 : \u0027\u0027,\n    addedStories.length ? addedStories.length + \u0027 stor\u0027 + (addedStories.length === 1 ? \u0027y\u0027 : \u0027ies\u0027) + \u0027 added\u0027 : \u0027\u0027,\n    updatedEpics.length ? updatedEpics.length + \u0027 epic\u0027 + (updatedEpics.length === 1 ? \u0027\u0027 : \u0027s\u0027) + \u0027 updated\u0027 : \u0027\u0027,\n    updatedStories.length ? updatedStories.length + \u0027 stor\u0027 + (updatedStories.length === 1 ? \u0027y\u0027 : \u0027ies\u0027) + \u0027 updated\u0027 : \u0027\u0027,\n  ].filter(Boolean).join(\u0027, \u0027) || \u0027No backlog changes needed\u0027,\n};\n\nreturn [{\n  json: {\n    ...input,\n    result,\n    output: {\n      settingsVersion: input.settingsVersion || null,\n      destination: { type: \u0027jira_confluence\u0027, projectId: input.projectId || null },\n      url: confluenceUrl,\n      documentUrl: confluenceUrl,\n      confluence: result.confluence || null,\n      epics: currentEpics,\n      stories: currentStories,\n      professionalGenerator: true,\n      generationMode,\n      updateContext: generationMode === \u0027update\u0027 ? {\n        previousJobId: updateContext.previousJobId || input.updateOfJobId || null,\n        previousConfluencePageId: updateContext.previousConfluencePageId || null,\n        previousConfluenceUrl: updateContext.previousConfluenceUrl || null,\n        previousBacklogBaselineCounts: updateSummary.previousBacklogBaselineCounts,\n        previousTokenUsage,\n      } : null,\n      updateSummary,\n      tokenSavings,\n      tokenUsage,\n      qualityGate: { ...(result.qualityGate || {}), coverageLedger, coverageSummary },\n      coverageLedger,\n      coverageSummary,\n      batchPlan: result.batchPlan || result.qualityGate?.batchPlan || null,\n      batchSummary: result.batchSummary || result.qualityGate?.batchSummary || null,\n      jira: result.jira || null,\n      wordCount: result.wordCount || 0,\n      tokensInput: tokenUsage.input,\n      tokensOutput: tokenUsage.output,\n      tokensTotal: tokenUsage.total,\n      estimatedCostUsd: tokenUsage.estimatedCostUsd,\n      promptLibraryVersion: result.promptLibraryVersion || null,\n      sourceCoverage: result.sourceCoverage || [],\n      retrievalEvidenceCount: result.retrievalEvidenceCount || 0,\n      retrievalQuality: result.retrievalQuality || null,\n      progress: result.progress || { stage: \u0027published\u0027, stageLabel: \u0027Published to Jira and Confluence\u0027, progressPercent: 100, coverage: coverageSummary },\n    }\n  }\n}];"
}
```

### Build Professional Failure Output

| Field | Value |
| --- | --- |
| Node ID | a1c08079-2b77-447d-ad17-3bd4c2c6f5c4 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2240, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Call Professional Backlog Generator -> Build Professional Failure Output (output 1, input 0)
- Call Existing Full Retrieval Generator -> Build Professional Failure Output (output 1, input 0)

**Outgoing Connections**

- Build Professional Failure Output -> LOG: Professional Backlog Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const source = $input.first()?.json || {};\nconst job = source.job || source;\nconst error = source.error || source.output?.error || source;\nconst documentType = String(job.documentType || job.document_type || job.doc_type || \u0027\u0027).toLowerCase();\nconst isBacklog = documentType === \u0027user_stories\u0027 || documentType === \u0027epics_user_stories\u0027;\nconst messageParts = [\n  error.message,\n  error.error?.message,\n  error.description,\n  error.errorDescription,\n  error.errorDetails?.rawErrorMessage?.join?.(\u0027 \u0027),\n  source.message,\n].filter(Boolean);\nconst backendMessage = messageParts.join(\u0027 | \u0027) || \u0027Generation workflow failed before producing an output.\u0027;\nreturn [{\n  json: {\n    ...source,\n    job,\n    output: {\n      status: \u0027failed\u0027,\n      errorType: isBacklog ? \u0027PROFESSIONAL_BACKLOG_FAILED\u0027 : \u0027SHARED_GENERATOR_FAILED\u0027,\n      message: backendMessage,\n      backendMessage,\n      failedAt: error.node?.name || error.nodeName || error.name || \u0027Shared generator subworkflow\u0027,\n      remediation: isBacklog\n        ? \u0027Review the Jira/backlog generation workflow error, then regenerate with fixes.\u0027\n        : \u0027Review the shared document generator workflow error, then regenerate with fixes.\u0027,\n    },\n  },\n}];"
}
```

### Call Existing Full Retrieval Generator

| Field | Value |
| --- | --- |
| Node ID | 130defc2-e84a-4d93-82d6-a116d88ad7de |
| Type | n8n-nodes-base.executeWorkflow |
| Type Version | 1.3 |
| Position | 2016, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Use Professional Backlog Generator? -> Call Existing Full Retrieval Generator (output 1, input 0)

**Outgoing Connections**

- Call Existing Full Retrieval Generator -> Build Professional Failure Output (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "workflowId":  {
                       "__rl":  true,
                       "value":  "fullRetrievalD01",
                       "mode":  "id",
                       "cachedResultName":  "RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft"
                   },
    "workflowInputs":  {
                           "mappingMode":  "defineBelow",
                           "value":  {

                                     },
                           "matchingColumns":  [

                                               ],
                           "schema":  [

                                      ],
                           "attemptToConvertTypes":  false,
                           "convertFieldsToString":  true
                       },
    "options":  {
                    "waitForSubWorkflow":  true
                }
}
```

### Call Professional Backlog Generator

| Field | Value |
| --- | --- |
| Node ID | c2f4234b-3b00-41c7-bfd4-9aac855c3da1 |
| Type | n8n-nodes-base.executeWorkflow |
| Type Version | 1.3 |
| Position | 2016, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Use Professional Backlog Generator? -> Call Professional Backlog Generator (output 0, input 0)

**Outgoing Connections**

- Call Professional Backlog Generator -> Build Backlog Completion Output (output 0, input 0)
- Call Professional Backlog Generator -> Build Professional Failure Output (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "workflowId":  {
                       "__rl":  true,
                       "value":  "Vwc6c8ehsRTF8svG",
                       "mode":  "id",
                       "cachedResultName":  "PRO QA Backlog, Jira \u0026 Confluence Generator - Team Managed Ready"
                   },
    "workflowInputs":  {
                           "mappingMode":  "defineBelow",
                           "value":  {

                                     },
                           "matchingColumns":  [

                                               ],
                           "schema":  [

                                      ],
                           "attemptToConvertTypes":  false,
                           "convertFieldsToString":  true
                       },
    "options":  {
                    "waitForSubWorkflow":  true
                }
}
```

### Get Pending Professional Jobs

| Field | Value |
| --- | --- |
| Node ID | bf919723-8ceb-4457-b3a7-81d5850c7a88 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 192 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Schedule Trigger -> Get Pending Professional Jobs (output 0, input 0)

**Outgoing Connections**

- Get Pending Professional Jobs -> Pending Professional Job Exists? (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "status",
                                                   "value":  "eq.pending"
                                               },
                                               {
                                                   "name":  "input-\u003e\u003egeneratorMode",
                                                   "value":  "eq.professional"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.asc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
                                               },
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,status,input,project_id,requested_by,settings_version,config_snapshot,created_at"
                                               }
                                           ]
                        },
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Lock Professional Job

| Field | Value |
| --- | --- |
| Node ID | 0e8071e7-5e6d-4b33-88e6-fa07f5071fc0 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 192 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Pending Professional Job Exists? -> Lock Professional Job (output 0, input 0)

**Outgoing Connections**

- Lock Professional Job -> Professional Lock Acquired? (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.job_id }}\u0026status=eq.pending",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "{ \"status\": \"processing\" }",
    "options":  {

                }
}
```

### LOG: Professional Backlog Completed

| Field | Value |
| --- | --- |
| Node ID | 53bcf716-bbdf-4ab3-b7e6-40aa03a12c4a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2912, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Backlog Completion Output -> LOG: Professional Backlog Completed (output 0, input 0)

**Outgoing Connections**

- LOG: Professional Backlog Completed -> Restore Completion Before Status Update (output 0, input 0)

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
    "jsonHeaders":  "{ \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_COMPLETED\", status: \"info\", project_id: $json.projectId, requested_by: $json.requestedBy, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), word_count: $json.output.wordCount || 0, tokens_input: $json.output.tokensInput || 0, tokens_output: $json.output.tokensOutput || 0, tokens_total: $json.output.tokensTotal || 0, estimated_cost_usd: $json.output.estimatedCostUsd || 0, metadata: { generator_mode: \"professional\", generation_mode: $json.output.generationMode || $json.generationMode || \"create\", update_of_job_id: $json.output.updateContext?.previousJobId || $json.updateOfJobId || null, output_type: \"jira_confluence\", epics_created: ($json.output.epics || []).filter(e =\u003e [\"created\",\"create\"].includes(e.action)).length, epics_reused: ($json.output.epics || []).filter(e =\u003e [\"reused\",\"reuse\"].includes(e.action)).length, stories_created: ($json.output.stories || []).filter(s =\u003e [\"created\",\"create\"].includes(s.action)).length, stories_reused: ($json.output.stories || []).filter(s =\u003e [\"reused\",\"reuse\"].includes(s.action)).length, epics_updated: ($json.output.epics || []).filter(e =\u003e [\"updated\",\"update\"].includes(e.action)).length, stories_updated: ($json.output.stories || []).filter(s =\u003e [\"updated\",\"update\"].includes(s.action)).length, confluence_url: $json.output.url, settings_version: $json.settingsVersion, retrieval_quality: $json.output.retrievalQuality, retrieval_evidence_count: $json.output.retrievalEvidenceCount, source_coverage_count: ($json.output.sourceCoverage || []).length, prompt_library_version: $json.output.promptLibraryVersion, quality_gate_status: $json.output.qualityGate?.status || \"passed\" } }) }}",
    "options":  {

                }
}
```

### LOG: Professional Backlog Failed

| Field | Value |
| --- | --- |
| Node ID | 571f4150-d8eb-40c6-bde4-d1b54da1249e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Professional Failure Output -> LOG: Professional Backlog Failed (output 0, input 0)

**Outgoing Connections**

- LOG: Professional Backlog Failed -> Restore Failure Output (output 0, input 0)

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
    "jsonHeaders":  "{ \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_FAILED\", status: \"error\", project_id: $json.projectId, requested_by: $json.requestedBy, error_message: $json.errorMessage, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), metadata: { generator_mode: \"professional\", error_type: $json.output?.errorType || \"GENERATION_FAILED\", settings_version: $json.settingsVersion } }) }}",
    "options":  {

                }
}
```

### LOG: Professional Job Started

| Field | Value |
| --- | --- |
| Node ID | d52cf9f6-b8a0-4d5d-9cce-7a46a3421afd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Generator Input -> LOG: Professional Job Started (output 0, input 0)

**Outgoing Connections**

- LOG: Professional Job Started -> Restore Generator Input After Start Log (output 0, input 0)

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
    "jsonHeaders":  "{ \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_STARTED\", status: \"info\", project_id: $json.projectId, requested_by: $json.requestedBy, metadata: { generator_mode: \"professional\", generation_mode: $json.generationMode || \"create\", update_of_job_id: $json.updateContext?.previousJobId || $json.updateOfJobId || null, settings_version: $json.settingsVersion, environment: $json.environment || $json.configSnapshot?.environment?.key || \"local\" } }) }}",
    "options":  {

                }
}
```

### LOG: Professional Quality Gate Passed

| Field | Value |
| --- | --- |
| Node ID | 86877b0d-3edd-4493-8e7e-273be283f766 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Backlog Completion Output -> LOG: Professional Quality Gate Passed (output 0, input 0)

**Outgoing Connections**

- LOG: Professional Quality Gate Passed -> Restore Backlog Completion Output (output 0, input 0)

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
    "jsonHeaders":  "{ \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"QUALITY_GATE_PASSED\", status: \"info\", project_id: $json.projectId, requested_by: $json.requestedBy, word_count: $json.output.wordCount || 0, metadata: { generator_mode: \"professional\", epics: ($json.output.epics || []).length, stories: ($json.output.stories || []).length, quality_gate: $json.output.qualityGate, retrieval_quality: $json.output.retrievalQuality, retrieval_evidence_count: $json.output.retrievalEvidenceCount, source_coverage_count: ($json.output.sourceCoverage || []).length, prompt_library_version: $json.output.promptLibraryVersion } }) }}",
    "options":  {

                }
}
```

### Mark Professional Backlog Job Completed

| Field | Value |
| --- | --- |
| Node ID | d58a30ac-6ef6-4d14-9c1c-987a1df5e1fb |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3360, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Completion Before Status Update -> Mark Professional Backlog Job Completed (output 0, input 0)

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
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \"completed\", output: $json.output, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Mark Professional Backlog Job Failed

| Field | Value |
| --- | --- |
| Node ID | e87b63d1-f1a1-4722-a939-4a6dea1e9677 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2912, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Failure Output -> Mark Professional Backlog Job Failed (output 0, input 0)

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
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \"failed\", output: $json.output, error: $json.errorMessage, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Pending Professional Job Exists?

| Field | Value |
| --- | --- |
| Node ID | cd0cdc5c-9859-4316-9264-611a30777512 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 448, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get Pending Professional Jobs -> Pending Professional Job Exists? (output 0, input 0)

**Outgoing Connections**

- Pending Professional Job Exists? -> Lock Professional Job (output 0, input 0)

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
                                              "leftValue":  "={{ Object.keys($json).length }}",
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

### Prepare Generator Input

| Field | Value |
| --- | --- |
| Node ID | 52bb97d6-b5ae-479b-b3a6-81b6ba1a9744 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Professional Lock Acquired? -> Prepare Generator Input (output 0, input 0)

**Outgoing Connections**

- Prepare Generator Input -> LOG: Professional Job Started (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst job = Array.isArray($json) ? $json[0] : $json;\nconst input = job.input || {};\nreturn [{ json: {\n  jobId: job.job_id,\n  originalJobStatus: job.status,\n  projectId: job.project_id || null,\n  requestedBy: job.requested_by || null,\n  settingsVersion: job.settings_version || null,\n  configSnapshot: job.config_snapshot || {},\n  createdAt: job.created_at || new Date().toISOString(),\n  startedAt: new Date().toISOString(),\n  ...input\n}}];"
}
```

### Professional Lock Acquired?

| Field | Value |
| --- | --- |
| Node ID | d4bb380c-7a36-4d10-b014-dd6d9723b1e1 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 896, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Lock Professional Job -> Professional Lock Acquired? (output 0, input 0)

**Outgoing Connections**

- Professional Lock Acquired? -> Prepare Generator Input (output 0, input 0)

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
                                              "leftValue":  "={{ Object.keys($json).length }}",
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

### Restore Backlog Completion Output

| Field | Value |
| --- | --- |
| Node ID | 3b8ff390-2da8-4cfa-bd61-ba706fb3a272 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2688, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Professional Quality Gate Passed -> Restore Backlog Completion Output (output 0, input 0)

**Outgoing Connections**

- Restore Backlog Completion Output -> LOG: Professional Backlog Completed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\u0027Build Backlog Completion Output\u0027).first().json }];"
}
```

### Restore Completion Before Status Update

| Field | Value |
| --- | --- |
| Node ID | c0d605b8-796c-4ff6-905e-014e906164b5 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3136, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Professional Backlog Completed -> Restore Completion Before Status Update (output 0, input 0)

**Outgoing Connections**

- Restore Completion Before Status Update -> Mark Professional Backlog Job Completed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const item = $(\u0027Build Backlog Completion Output\u0027).first().json;\nconst output = item.output \u0026\u0026 typeof item.output === \u0027object\u0027 ? item.output : {};\n\nfunction array(value) {\n  return Array.isArray(value) ? value.filter(entry =\u003e entry \u0026\u0026 typeof entry === \u0027object\u0027) : [];\n}\nfunction numberValue(...values) {\n  for (const value of values) {\n    const number = Number(value);\n    if (Number.isFinite(number)) return number;\n  }\n  return 0;\n}\nfunction coverageSummaryFromLedger(rows) {\n  const summary = {\n    mode: \u0027enforced\u0027,\n    version: \u0027backlog-coverage-ledger-v1\u0027,\n    gateStatus: \u0027passed\u0027,\n    coverageLedgerCount: rows.length,\n    coveredCount: 0,\n    partialCount: 0,\n    missingCount: 0,\n    unknownCount: 0,\n    excludedCount: 0,\n    uncoveredCount: 0,\n    blockingUncoveredCount: 0,\n    missingItems: [],\n  };\n  for (const row of rows) {\n    const status = String(row.coverageStatus || row.status || \u0027\u0027).toLowerCase();\n    if (status.includes(\u0027cover\u0027)) summary.coveredCount += 1;\n    else if (status.includes(\u0027exclude\u0027)) summary.excludedCount += 1;\n    else if (status.includes(\u0027partial\u0027) || status.includes(\u0027review\u0027)) {\n      summary.partialCount += 1;\n      summary.missingItems.push(row);\n    } else {\n      summary.missingCount += 1;\n      summary.missingItems.push(row);\n    }\n  }\n  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;\n  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;\n  if (summary.blockingUncoveredCount) summary.gateStatus = \u0027failed\u0027;\n  else if (summary.partialCount) summary.gateStatus = \u0027warning\u0027;\n  return summary;\n}\n\nconst tokenUsage = output.tokenUsage || output.updateSummary?.tokenUsage || {\n  source: output.updateSummary?.tokenUsage?.source || \u0027estimated\u0027,\n  input: numberValue(output.tokensInput),\n  output: numberValue(output.tokensOutput),\n  total: numberValue(output.tokensTotal),\n  estimatedCostUsd: numberValue(output.estimatedCostUsd),\n};\ntokenUsage.tokensInput = numberValue(tokenUsage.tokensInput, tokenUsage.input);\ntokenUsage.tokensOutput = numberValue(tokenUsage.tokensOutput, tokenUsage.output);\ntokenUsage.tokensTotal = numberValue(tokenUsage.tokensTotal, tokenUsage.total);\ntokenUsage.input = numberValue(tokenUsage.input, tokenUsage.tokensInput);\ntokenUsage.output = numberValue(tokenUsage.output, tokenUsage.tokensOutput);\ntokenUsage.total = numberValue(tokenUsage.total, tokenUsage.tokensTotal);\ntokenUsage.estimatedCostUsd = numberValue(tokenUsage.estimatedCostUsd, output.estimatedCostUsd);\n\nconst coverageLedger = array(output.coverageLedger).length\n  ? array(output.coverageLedger)\n  : array(output.qualityGate?.coverageLedger);\nconst coverageSummary = output.coverageSummary || output.qualityGate?.coverageSummary || coverageSummaryFromLedger(coverageLedger);\nconst tokenSavings = output.tokenSavings || output.updateSummary?.tokenSavings || null;\n\nitem.output = {\n  ...output,\n  tokenUsage,\n  tokenSavings,\n  coverageLedger,\n  coverageSummary,\n  qualityGate: {\n    ...(output.qualityGate || {}),\n    coverageLedger,\n    coverageSummary,\n  },\n  updateSummary: output.updateSummary ? {\n    ...output.updateSummary,\n    tokenUsage: output.updateSummary.tokenUsage || tokenUsage,\n    tokenSavings: output.updateSummary.tokenSavings || tokenSavings,\n    coverageSummary: output.updateSummary.coverageSummary || coverageSummary,\n    coverageLedgerCount: output.updateSummary.coverageLedgerCount || coverageSummary.coverageLedgerCount || coverageLedger.length,\n  } : output.updateSummary,\n  tokensInput: tokenUsage.input,\n  tokensOutput: tokenUsage.output,\n  tokensTotal: tokenUsage.total,\n  estimatedCostUsd: tokenUsage.estimatedCostUsd,\n};\n\nreturn [{ json: item }];"
}
```

### Restore Failure Output

| Field | Value |
| --- | --- |
| Node ID | b9173136-34c4-40a2-a407-737630d99427 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2688, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Professional Backlog Failed -> Restore Failure Output (output 0, input 0)

**Outgoing Connections**

- Restore Failure Output -> Mark Professional Backlog Job Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\u0027Build Professional Failure Output\u0027).first().json }];"
}
```

### Restore Generator Input After Start Log

| Field | Value |
| --- | --- |
| Node ID | 62a94f43-d7a9-4569-ab92-ef8f6ef6efa8 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1568, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Professional Job Started -> Restore Generator Input After Start Log (output 0, input 0)

**Outgoing Connections**

- Restore Generator Input After Start Log -> Use Professional Backlog Generator? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\u0027Prepare Generator Input\u0027).first().json }];"
}
```

### Schedule Trigger

| Field | Value |
| --- | --- |
| Node ID | 536de7f1-b78e-4d84-904a-29c00871ab37 |
| Type | n8n-nodes-base.scheduleTrigger |
| Type Version | 1.3 |
| Position | 0, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Schedule Trigger -> Get Pending Professional Jobs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "rule":  {
                 "interval":  [
                                  {
                                      "field":  "seconds",
                                      "secondsInterval":  20
                                  }
                              ]
             }
}
```

### Sticky Note 13931090

| Field | Value |
| --- | --- |
| Node ID | e26977fb-1423-49ee-998e-1773c67319ee |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | 1680, 352 |
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
    "content":  "## Professional Generation Worker\nProcesses only generatorMode=professional jobs. Adds lock-success guard, JOB_STARTED, QUALITY_GATE_PASSED, JOB_COMPLETED, JOB_FAILED and failed job status handling for the professional backlog path. Non-user-story document types still reuse fullRetrievalD01.",
    "height":  300,
    "width":  3000,
    "color":  5
}
```

### Use Professional Backlog Generator?

| Field | Value |
| --- | --- |
| Node ID | 32513307-ae4d-43f6-b952-e932215d4d21 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1792, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Generator Input After Start Log -> Use Professional Backlog Generator? (output 0, input 0)

**Outgoing Connections**

- Use Professional Backlog Generator? -> Call Professional Backlog Generator (output 0, input 0)
- Use Professional Backlog Generator? -> Call Existing Full Retrieval Generator (output 1, input 0)

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
                                              "leftValue":  "={{ $json.documentType }}",
                                              "rightValue":  "user_stories",
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
