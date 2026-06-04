# PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | Vwc6c8ehsRTF8svG |
| Active | True |
| Archived | False |
| Created At | 2026-05-11T03:59:47.905Z |
| Updated At | 2026-05-15T05:26:46.000Z |
| Node Count | 40 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready [Vwc6c8ehsRTF8svG].json |

## Description

Professional Team Managed Jira backlog workflow with Jira search/reuse before create, stable idempotency labels, story parent linking, Confluence update/create, quality gate and token/cost metadata. Does not modify fullRetrievalD01.

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
| @n8n/n8n-nodes-langchain.vectorStoreChromaDB | 2 |
| n8n-nodes-base.code | 20 |
| n8n-nodes-base.executeWorkflowTrigger | 1 |
| n8n-nodes-base.httpRequest | 7 |
| n8n-nodes-base.if | 3 |
| n8n-nodes-base.merge | 3 |
| n8n-nodes-base.stickyNote | 1 |

## Credentials Referenced

- chromaCloudApi: ChromaDB Self-Hosted account
- httpBasicAuth: JIRA
- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- https://anujalhans1.atlassian.net
- https://anujalhans1.atlassian.net/wiki

### Supabase/Data Table Hints

- qa_document

## Connection Graph

- When Executed by Another Workflow -> Normalize Team Managed Request (source output 0, target input 0)
- Normalize Team Managed Request -> Preflight Project Knowledge Search (source output 0, target input 0)
- Professional QA Backlog Generator -> Robust Backlog JSON Parser (source output 0, target input 0)
- OpenAI Chat Model -> Professional QA Backlog Generator (source output 0, target input 0)
- Project Knowledge Vector Search -> Professional QA Backlog Generator (source output 0, target input 0)
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
- Professional Prompt Library -> Professional QA Backlog Generator (source output 0, target input 0)
- Embeddings OpenAI -> Project Knowledge Vector Search (source output 0, target input 0)
- Embeddings OpenAI -> Preflight Project Knowledge Search (source output 0, target input 0)
- Preflight Project Knowledge Search -> Check Chroma Retrieval Quality (source output 0, target input 0)
- Check Chroma Retrieval Quality -> Professional Prompt Library (source output 0, target input 0)
- Robust Backlog JSON Parser -> Validate Team Managed Backlog (source output 0, target input 0)

## Nodes

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

- Check Chroma Retrieval Quality -> Professional Prompt Library (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst docs = $input.all();\nconst root = $(\u0027Normalize Team Managed Request\u0027).first().json;\n\nconst normalizeKey = value =\u003e String(value || \u0027\u0027).trim().toUpperCase().replace(/[^A-Z0-9]+/g, \u0027_\u0027).replace(/^_+|_+$/g, \u0027\u0027);\nconst normalizeDocRequest = value =\u003e String(value || \u0027qa_document\u0027).trim().toLowerCase().replace(/[^a-z0-9]+/g, \u0027_\u0027).replace(/^_+|_+$/g, \u0027\u0027) || \u0027qa_document\u0027;\nconst arrayUnique = values =\u003e [...new Set(values.filter(Boolean))];\nconst textIncludes = (text, terms) =\u003e terms.some(term =\u003e String(text || \u0027\u0027).toLowerCase().includes(String(term).toLowerCase()));\nconst metaValue = (metadata, names, fallback = \u0027\u0027) =\u003e {\n  for (const name of names) {\n    if (metadata[name] !== undefined \u0026\u0026 metadata[name] !== null \u0026\u0026 String(metadata[name]).trim() !== \u0027\u0027) return metadata[name];\n  }\n  return fallback;\n};\n\nconst retrievalProfiles = {\n  user_stories: {\n    label: \u0027Epics and User Stories\u0027,\n    intent: \u0027Build implementation-ready Agile epics and stories grounded in business, functional, UI, integration, validation, NFR, and stakeholder evidence.\u0027,\n    primaryDocTypes: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027PRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027TRANSCRIPT\u0027],\n    secondaryDocTypes: [\u0027HLD\u0027, \u0027LLD\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027, \u0027ARCHITECTURE\u0027, \u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n    preferredCategories: [\u0027business_requirements\u0027, \u0027functional_requirements\u0027, \u0027user_experience\u0027, \u0027stakeholder_conversation\u0027, \u0027technical_design\u0027, \u0027quality_assurance\u0027],\n    preferredArtifacts: [\u0027business_requirements_document\u0027, \u0027functional_requirements_document\u0027, \u0027product_requirements_document\u0027, \u0027software_requirements_specification\u0027, \u0027ui_ux_artifact\u0027, \u0027meeting_transcript\u0027, \u0027api_specification\u0027, \u0027data_model\u0027],\n    preferredContentSources: [\u0027text\u0027, \u0027image\u0027],\n    sectionKeywords: [\u0027requirement\u0027, \u0027business rule\u0027, \u0027user journey\u0027, \u0027workflow\u0027, \u0027process\u0027, \u0027screen\u0027, \u0027validation\u0027, \u0027acceptance\u0027, \u0027integration\u0027, \u0027api\u0027, \u0027nfr\u0027, \u0027exception\u0027, \u0027error\u0027],\n    evidenceGroups: {\n      business: [\u0027BRD\u0027, \u0027PRD\u0027, \u0027TRANSCRIPT\u0027],\n      functional: [\u0027FRD\u0027, \u0027SRS\u0027],\n      experience: [\u0027UI_UX\u0027],\n      technical: [\u0027HLD\u0027, \u0027LLD\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027, \u0027ARCHITECTURE\u0027],\n      quality: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027]\n    }\n  },\n  test_cases: {\n    label: \u0027Test Scenarios and Test Cases\u0027,\n    intent: \u0027Prioritize acceptance criteria, validation rules, UI behavior, integration behavior, edge cases, and negative scenarios.\u0027,\n    primaryDocTypes: [\u0027FRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n    secondaryDocTypes: [\u0027BRD\u0027, \u0027PRD\u0027, \u0027TRANSCRIPT\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027],\n    preferredCategories: [\u0027functional_requirements\u0027, \u0027user_experience\u0027, \u0027quality_assurance\u0027, \u0027business_requirements\u0027, \u0027technical_design\u0027],\n    preferredArtifacts: [\u0027functional_requirements_document\u0027, \u0027software_requirements_specification\u0027, \u0027ui_ux_artifact\u0027, \u0027test_cases\u0027, \u0027test_plan\u0027, \u0027api_specification\u0027],\n    preferredContentSources: [\u0027text\u0027, \u0027image\u0027],\n    sectionKeywords: [\u0027acceptance\u0027, \u0027validation\u0027, \u0027field\u0027, \u0027error\u0027, \u0027exception\u0027, \u0027edge\u0027, \u0027negative\u0027, \u0027precondition\u0027, \u0027expected result\u0027, \u0027test\u0027, \u0027scenario\u0027, \u0027api\u0027],\n    evidenceGroups: {\n      acceptance: [\u0027FRD\u0027, \u0027SRS\u0027],\n      experience: [\u0027UI_UX\u0027],\n      quality: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n      technical: [\u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027],\n      business: [\u0027BRD\u0027, \u0027PRD\u0027, \u0027TRANSCRIPT\u0027]\n    }\n  },\n  rtm: {\n    label: \u0027Requirement Traceability Matrix\u0027,\n    intent: \u0027Prioritize requirement IDs, source requirements, acceptance criteria, business rules, and test coverage evidence.\u0027,\n    primaryDocTypes: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027PRD\u0027, \u0027SRS\u0027],\n    secondaryDocTypes: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027, \u0027UI_UX\u0027, \u0027API_SPEC\u0027, \u0027TRANSCRIPT\u0027],\n    preferredCategories: [\u0027business_requirements\u0027, \u0027functional_requirements\u0027, \u0027quality_assurance\u0027, \u0027user_experience\u0027, \u0027technical_design\u0027],\n    preferredArtifacts: [\u0027business_requirements_document\u0027, \u0027functional_requirements_document\u0027, \u0027software_requirements_specification\u0027, \u0027test_cases\u0027, \u0027test_plan\u0027],\n    preferredContentSources: [\u0027text\u0027],\n    sectionKeywords: [\u0027requirement\u0027, \u0027req\u0027, \u0027acceptance\u0027, \u0027traceability\u0027, \u0027business rule\u0027, \u0027coverage\u0027, \u0027test case\u0027, \u0027test scenario\u0027],\n    evidenceGroups: {\n      requirements: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027PRD\u0027, \u0027SRS\u0027],\n      tests: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n      experience: [\u0027UI_UX\u0027],\n      technical: [\u0027API_SPEC\u0027],\n      stakeholder: [\u0027TRANSCRIPT\u0027]\n    }\n  },\n  technical_design: {\n    label: \u0027Technical Design\u0027,\n    intent: \u0027Prioritize architecture, API, database, integration, sequence, component, security, performance, and deployment evidence.\u0027,\n    primaryDocTypes: [\u0027HLD\u0027, \u0027LLD\u0027, \u0027ARCHITECTURE\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027],\n    secondaryDocTypes: [\u0027FRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027BRD\u0027, \u0027TRANSCRIPT\u0027],\n    preferredCategories: [\u0027technical_design\u0027, \u0027functional_requirements\u0027, \u0027user_experience\u0027],\n    preferredArtifacts: [\u0027high_level_design\u0027, \u0027low_level_design\u0027, \u0027architecture_document\u0027, \u0027api_specification\u0027, \u0027data_model\u0027],\n    preferredContentSources: [\u0027text\u0027, \u0027image\u0027],\n    sectionKeywords: [\u0027architecture\u0027, \u0027api\u0027, \u0027database\u0027, \u0027integration\u0027, \u0027sequence\u0027, \u0027component\u0027, \u0027security\u0027, \u0027performance\u0027, \u0027scalability\u0027, \u0027deployment\u0027, \u0027nfr\u0027],\n    evidenceGroups: {\n      architecture: [\u0027HLD\u0027, \u0027ARCHITECTURE\u0027],\n      detailedDesign: [\u0027LLD\u0027],\n      integrations: [\u0027API_SPEC\u0027],\n      data: [\u0027DATA_MODEL\u0027],\n      requirements: [\u0027FRD\u0027, \u0027SRS\u0027, \u0027BRD\u0027]\n    }\n  },\n  qa_document: {\n    label: \u0027General QA Document\u0027,\n    intent: \u0027Prioritize requirements, validation, acceptance criteria, risks, assumptions, tests, UI, integrations, and NFR evidence.\u0027,\n    primaryDocTypes: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027SRS\u0027, \u0027UI_UX\u0027, \u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n    secondaryDocTypes: [\u0027PRD\u0027, \u0027TRANSCRIPT\u0027, \u0027HLD\u0027, \u0027LLD\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027],\n    preferredCategories: [\u0027business_requirements\u0027, \u0027functional_requirements\u0027, \u0027quality_assurance\u0027, \u0027user_experience\u0027, \u0027technical_design\u0027],\n    preferredArtifacts: [\u0027business_requirements_document\u0027, \u0027functional_requirements_document\u0027, \u0027test_cases\u0027, \u0027test_plan\u0027, \u0027ui_ux_artifact\u0027],\n    preferredContentSources: [\u0027text\u0027, \u0027image\u0027],\n    sectionKeywords: [\u0027requirement\u0027, \u0027validation\u0027, \u0027acceptance\u0027, \u0027test\u0027, \u0027scenario\u0027, \u0027risk\u0027, \u0027assumption\u0027, \u0027dependency\u0027, \u0027integration\u0027, \u0027nfr\u0027],\n    evidenceGroups: {\n      requirements: [\u0027BRD\u0027, \u0027FRD\u0027, \u0027SRS\u0027, \u0027PRD\u0027],\n      quality: [\u0027TEST_CASES\u0027, \u0027TEST_PLAN\u0027],\n      experience: [\u0027UI_UX\u0027],\n      technical: [\u0027HLD\u0027, \u0027LLD\u0027, \u0027API_SPEC\u0027, \u0027DATA_MODEL\u0027],\n      stakeholder: [\u0027TRANSCRIPT\u0027]\n    }\n  }\n};\n\nconst requestProfileKey = normalizeDocRequest(root.retrievalProfileKey || root.documentType || \u0027qa_document\u0027);\nconst profile = retrievalProfiles[requestProfileKey] || retrievalProfiles.qa_document;\n\nconst getText = item =\u003e {\n  const j = item.json || {};\n  if (typeof j.pageContent === \u0027string\u0027) return j.pageContent;\n  if (typeof j.text === \u0027string\u0027) return j.text;\n  if (typeof j.content === \u0027string\u0027) return j.content;\n  if (typeof j.document === \u0027string\u0027) return j.document;\n  if (j.document \u0026\u0026 typeof j.document.pageContent === \u0027string\u0027) return j.document.pageContent;\n  if (j.document \u0026\u0026 typeof j.document.content === \u0027string\u0027) return j.document.content;\n  return \u0027\u0027;\n};\n\nconst scoreChunk = chunk =\u003e {\n  const metadata = chunk.metadata || {};\n  const docType = normalizeKey(metaValue(metadata, [\u0027docType\u0027, \u0027documentType\u0027, \u0027document_type\u0027]));\n  const documentCategory = String(metaValue(metadata, [\u0027documentCategory\u0027], \u0027\u0027)).trim();\n  const artifactType = String(metaValue(metadata, [\u0027artifactType\u0027], \u0027\u0027)).trim();\n  const contentSource = String(metaValue(metadata, [\u0027contentSource\u0027], \u0027\u0027)).trim().toLowerCase();\n  const sectionTitle = String(metaValue(metadata, [\u0027sectionTitle\u0027, \u0027section\u0027, \u0027title\u0027, \u0027heading\u0027], \u0027\u0027)).trim();\n  const hasVisionContent = [\u0027true\u0027, \u00271\u0027, \u0027yes\u0027].includes(String(metaValue(metadata, [\u0027hasVisionContent\u0027], \u0027\u0027)).toLowerCase());\n  const metadataConfidence = Number(metaValue(metadata, [\u0027metadataConfidence\u0027], 0)) || 0;\n  const reasons = [];\n  let profileScore = 0;\n\n  if (profile.primaryDocTypes.includes(docType)) {\n    profileScore += 40;\n    reasons.push(\u0027primary docType \u0027 + docType);\n  } else if (profile.secondaryDocTypes.includes(docType)) {\n    profileScore += 22;\n    reasons.push(\u0027secondary docType \u0027 + docType);\n  } else if (!docType || docType === \u0027UNKNOWN\u0027) {\n    profileScore += 2;\n    reasons.push(\u0027unclassified docType fallback\u0027);\n  }\n\n  if (profile.preferredCategories.includes(documentCategory)) {\n    profileScore += 18;\n    reasons.push(\u0027category \u0027 + documentCategory);\n  }\n\n  if (profile.preferredArtifacts.includes(artifactType)) {\n    profileScore += 18;\n    reasons.push(\u0027artifact \u0027 + artifactType);\n  }\n\n  if (profile.preferredContentSources.includes(contentSource)) {\n    profileScore += 8;\n    reasons.push(\u0027contentSource \u0027 + contentSource);\n  }\n\n  if (hasVisionContent) {\n    profileScore += requestProfileKey === \u0027technical_design\u0027 || requestProfileKey === \u0027user_stories\u0027 || requestProfileKey === \u0027test_cases\u0027 ? 7 : 3;\n    reasons.push(\u0027vision evidence\u0027);\n  }\n\n  if (textIncludes(sectionTitle, profile.sectionKeywords)) {\n    profileScore += 14;\n    reasons.push(\u0027section keyword match\u0027);\n  }\n\n  if (textIncludes(chunk.text.slice(0, 1200), profile.sectionKeywords)) {\n    profileScore += 10;\n    reasons.push(\u0027content keyword match\u0027);\n  }\n\n  if (metadataConfidence \u003e 0) {\n    profileScore += Math.min(8, Math.round(metadataConfidence * 8));\n  }\n\n  return { profileScore, reasons, docType, documentCategory, artifactType, contentSource, sectionTitle, hasVisionContent, metadataConfidence };\n};\n\nconst normalized = docs.map((item, index) =\u003e {\n  const j = item.json || {};\n  const text = getText(item);\n  const metadata = j.metadata || j.document?.metadata || {};\n  const score = j.score ?? j.similarity ?? j.distance ?? j.document?.score ?? null;\n  const base = { index: index + 1, text, metadata, score };\n  const ranked = scoreChunk(base);\n  return { ...base, ...ranked };\n}).filter(d =\u003e d.text \u0026\u0026 d.text.trim().length \u003e 0);\n\nif (!normalized.length) {\n  throw new Error(\u0027Chroma retrieval quality gate failed: 0 chunks returned for project=\u0027 + (root.projectName || \u0027Unknown Project\u0027) + \u0027 using metadata.project. Jira and Confluence creation stopped. Recheck ingestion metadata, project name, and collection=\u0027 + (root.chromaCollection || \u0027qa-chunks-batches\u0027) + \u0027.\u0027);\n}\n\nconst dedupeKey = d =\u003e [\n  metaValue(d.metadata, [\u0027chunkId\u0027], \u0027\u0027),\n  metaValue(d.metadata, [\u0027documentId\u0027], \u0027\u0027),\n  metaValue(d.metadata, [\u0027sectionIndex\u0027], \u0027\u0027),\n  metaValue(d.metadata, [\u0027chunkIndex\u0027], \u0027\u0027),\n  metaValue(d.metadata, [\u0027contentSource\u0027], \u0027\u0027)\n].join(\u0027|\u0027) || String(d.index);\n\nconst seen = new Set();\nconst ranked = normalized\n  .sort((a, b) =\u003e (b.profileScore - a.profileScore) || (a.index - b.index))\n  .filter(d =\u003e {\n    const key = dedupeKey(d);\n    if (seen.has(key)) return false;\n    seen.add(key);\n    return true;\n  });\n\nconst selected = ranked.slice(0, Number(root.chromaTopK || 20));\n\nconst sourceName = metadata =\u003e metaValue(metadata, [\u0027source\u0027, \u0027fileName\u0027, \u0027filename\u0027, \u0027file_name\u0027, \u0027documentType\u0027, \u0027document_type\u0027], \u0027Chroma chunk\u0027);\nconst retrievalContext = selected.map(d =\u003e ({\n  source: sourceName(d.metadata),\n  section: d.sectionTitle || \u0027\u0027,\n  project: metaValue(d.metadata, [\u0027project\u0027], \u0027\u0027),\n  score: d.score,\n  profileScore: d.profileScore,\n  profileMatchReasons: d.reasons,\n  docType: d.docType || \u0027UNKNOWN\u0027,\n  documentCategory: d.documentCategory || \u0027\u0027,\n  artifactType: d.artifactType || \u0027\u0027,\n  contentSource: d.contentSource || \u0027\u0027,\n  hasVisionContent: d.hasVisionContent,\n  metadataConfidence: d.metadataConfidence,\n  metadataSource: metaValue(d.metadata, [\u0027metadataSource\u0027], \u0027\u0027),\n  sourceFormat: metaValue(d.metadata, [\u0027sourceFormat\u0027, \u0027fileType\u0027], \u0027\u0027),\n  documentId: metaValue(d.metadata, [\u0027documentId\u0027], \u0027\u0027),\n  chunkId: metaValue(d.metadata, [\u0027chunkId\u0027], \u0027\u0027),\n  chunkIndex: metaValue(d.metadata, [\u0027chunkIndex\u0027], \u0027\u0027),\n  excerpt: d.text.slice(0, 2500)\n}));\n\nconst groupedEvidence = {};\nfor (const [group, docTypes] of Object.entries(profile.evidenceGroups || {})) {\n  groupedEvidence[group] = retrievalContext.filter(chunk =\u003e docTypes.includes(normalizeKey(chunk.docType))).slice(0, 8);\n}\ngroupedEvidence.unclassified = retrievalContext.filter(chunk =\u003e !chunk.docType || normalizeKey(chunk.docType) === \u0027UNKNOWN\u0027).slice(0, 5);\n\nconst docTypeCoverage = arrayUnique(retrievalContext.map(chunk =\u003e normalizeKey(chunk.docType)).filter(value =\u003e value \u0026\u0026 value !== \u0027UNKNOWN\u0027));\nconst categoryCoverage = arrayUnique(retrievalContext.map(chunk =\u003e chunk.documentCategory).filter(Boolean));\nconst profileMatchedCount = retrievalContext.filter(chunk =\u003e Number(chunk.profileScore || 0) \u003e= 30).length;\n\nreturn [{\n  json: {\n    ...root,\n    retrievalProfile: {\n      key: requestProfileKey,\n      label: profile.label,\n      intent: profile.intent,\n      primaryDocTypes: profile.primaryDocTypes,\n      secondaryDocTypes: profile.secondaryDocTypes,\n      preferredCategories: profile.preferredCategories,\n      preferredArtifacts: profile.preferredArtifacts,\n      preferredContentSources: profile.preferredContentSources,\n      sectionKeywords: profile.sectionKeywords,\n      rankingMode: \u0027project_filtered_metadata_profile_rerank\u0027,\n      hardFilter: { project: root.projectName },\n      softFilters: {\n        docType: profile.primaryDocTypes.concat(profile.secondaryDocTypes),\n        documentCategory: profile.preferredCategories,\n        artifactType: profile.preferredArtifacts,\n        contentSource: profile.preferredContentSources\n      }\n    },\n    retrievalQuality: {\n      passed: true,\n      chunkCount: normalized.length,\n      rankedChunkCount: ranked.length,\n      selectedChunkCount: retrievalContext.length,\n      profileMatchedCount,\n      metadataFilterKey: \u0027project\u0027,\n      metadataFilterValue: root.projectName,\n      profileKey: requestProfileKey,\n      docTypeCoverage,\n      categoryCoverage,\n      collection: root.chromaCollection,\n      topK: root.chromaTopK\n    },\n    retrievalContext,\n    groupedEvidence\n  }\n}];\n"
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
    "jsCode":  "\nconst searches = $input.all();\nconst sources = $(\u0027Prepare Epic Search Items\u0027).all();\nreturn sources.map((source, index) =\u003e {\n  const search = searches[index]?.json || {};\n  const issue = Array.isArray(search.issues) \u0026\u0026 search.issues.length ? search.issues[0] : null;\n  return { json: { ...source.json, action: issue?.key ? \u0027reuse\u0027 : \u0027create\u0027, existingEpicIssue: issue, jiraEpicId: issue?.id || null, jiraEpicKey: issue?.key || null, jiraEpicSelf: issue?.self || null } };\n});"
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
    "jsCode":  "\nconst searches = $input.all();\nconst sources = $(\u0027Prepare Story Search Items\u0027).all();\nreturn sources.map((source, index) =\u003e {\n  const search = searches[index]?.json || {};\n  const issue = Array.isArray(search.issues) \u0026\u0026 search.issues.length ? search.issues[0] : null;\n  return { json: { ...source.json, action: issue?.key ? \u0027reuse\u0027 : \u0027create\u0027, existingStoryIssue: issue, jiraStoryId: issue?.id || null, jiraStoryKey: issue?.key || null, jiraStorySelf: issue?.self || null } };\n});"
}
```

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | f0298e84-17b6-4f19-9efb-4e88389a03cb |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | 480, 720 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Embeddings OpenAI -> Project Knowledge Vector Search (output 0, input 0)
- Embeddings OpenAI -> Preflight Project Knowledge Search (output 0, input 0)

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
    "jsCode":  "\nconst input = $json || {};\nconst config = input.configSnapshot || input.config_snapshot || {};\nconst jira = config.jira || {};\nconst confluence = config.confluence || {};\nconst models = config.models || {};\nconst chroma = config.chroma || {};\nconst cleanBase = (value, fallback) =\u003e { const s = String(value || fallback); return s.endsWith(\u0027/\u0027) ? s.slice(0, -1) : s; };\nconst normalizeDocumentType = value =\u003e String(value || \u0027user_stories\u0027).trim().toLowerCase().replace(/[^a-z0-9]+/g, \u0027_\u0027).replace(/^_+|_+$/g, \u0027\u0027) || \u0027user_stories\u0027;\nconst documentType = normalizeDocumentType(input.documentType || input.document_type || \u0027user_stories\u0027);\nconst rawChromaTopK = Number(chroma.topK || input.chromaTopK || 20);\nconst chromaTopK = Number.isFinite(rawChromaTopK) \u0026\u0026 rawChromaTopK \u003e 0 ? rawChromaTopK : 20;\nconst retrievalSearchQueries = {\n  user_stories: \u0027Project requirements for Agile epics user stories business rules functional requirements UI UX flows validation rules integrations acceptance criteria NFR risks constraints BRD FRD PRD SRS transcripts HLD LLD API data model\u0027,\n  test_cases: \u0027Project test scenarios test cases acceptance criteria validation rules edge cases negative scenarios UI behavior API behavior business rules preconditions expected results\u0027,\n  rtm: \u0027Project requirement traceability matrix BRD FRD requirement IDs acceptance criteria test coverage business rules source references\u0027,\n  technical_design: \u0027Project architecture high level design low level design API database integration sequence flows components NFR performance security scalability\u0027,\n  qa_document: \u0027Project QA strategy test plan test scenarios business rules acceptance criteria risks assumptions dependencies validation integration coverage\u0027\n};\nreturn [{ json: {\n  jobId: input.jobId || input.job_id || \u0027JOB-\u0027 + Date.now(),\n  projectName: input.projectName || input.project_name || \u0027Unknown Project\u0027,\n  documentType,\n  productOwner: input.productOwner || input.product_owner || \u0027Product Owner\u0027,\n  projectId: input.projectId || input.project_id || null,\n  requestedBy: input.requestedBy || input.requested_by || null,\n  settingsVersion: input.settingsVersion || input.settings_version || null,\n  environmentKey: config.environment?.key || input.environment || \u0027local\u0027,\n  startedAt: input.startedAt || input.createdAt || new Date().toISOString(),\n  jiraProjectType: \u0027team-managed\u0027,\n  jiraProjectKey: input.jiraProjectKey || jira.projectKey || \u0027KAN\u0027,\n  jiraProjectId: input.jiraProjectId || jira.projectId || null,\n  jiraBaseUrl: cleanBase(input.jiraBaseUrl || jira.baseUrl, \u0027https://anujalhans1.atlassian.net\u0027),\n  epicIssueTypeId: input.epicIssueTypeId || jira.epicIssueTypeId || null,\n  storyIssueTypeId: input.storyIssueTypeId || jira.storyIssueTypeId || null,\n  epicIssueTypeName: input.epicIssueTypeName || jira.epicIssueType || jira.epicIssueTypeName || \u0027Epic\u0027,\n  storyIssueTypeName: input.storyIssueTypeName || jira.storyIssueType || jira.storyIssueTypeName || \u0027Story\u0027,\n  idempotencyLabelPrefix: input.idempotencyLabelPrefix || jira.idempotencyLabelPrefix || \u0027qops\u0027,\n  confluenceBaseUrl: cleanBase(input.confluenceBaseUrl || confluence.baseUrl, \u0027https://anujalhans1.atlassian.net/wiki\u0027),\n  confluenceSpaceKey: input.confluenceSpaceKey || confluence.spaceKey || \u0027TD\u0027,\n  confluenceParentPageId: input.confluenceParentPageId || confluence.parentPageId || null,\n  generationModel: models.generationModel || input.generationModel || \u0027gpt-4.1-mini\u0027,\n  maxTokens: Math.max(16000, Number(models.maxTokens || input.maxTokens || 16000) || 16000),\n  chromaCollection: chroma.collection || input.chromaCollection || \u0027qa-chunks-batches\u0027,\n  chromaTopK,\n  retrievalProfileKey: documentType,\n  retrievalSearchQuery: \u0027Project \u0027 + (input.projectName || input.project_name || \u0027Unknown Project\u0027) + \u0027 \u0027 + (retrievalSearchQueries[documentType] || retrievalSearchQueries.qa_document)\n}}];"
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
| Position | 256, 352 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OpenAI Chat Model -> Professional QA Backlog Generator (output 0, input 0)

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
- Embeddings OpenAI -> Preflight Project Knowledge Search (output 0, input 0)

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
    "jsCode":  "const root = $json;\nconst esc = value =\u003e String(value ?? \u0027\u0027).replace(/\u0026/g, \u0027\u0026amp;\u0027).replace(/\u003c/g, \u0027\u0026lt;\u0027).replace(/\u003e/g, \u0027\u0026gt;\u0027);\nconst title = (root.generated.document?.title || \u0027Professional QA Backlog\u0027) + \u0027 - \u0027 + root.projectName;\nconst body = \u0027\u003ch1\u003e\u0027 + esc(root.generated.document?.title || \u0027Professional QA Backlog\u0027) + \u0027\u003c/h1\u003e\u0027\n  + \u0027\u003cp\u003e\u0027 + esc(root.generated.document?.summary || \u0027Generated professional QA backlog.\u0027) + \u0027\u003c/p\u003e\u0027\n  + \u0027\u003ch2\u003eQuality Gate\u003c/h2\u003e\u003cp\u003eStatus: \u003cstrong\u003epassed\u003c/strong\u003e | Adaptive story count: \u003cstrong\u003eenabled\u003c/strong\u003e | Epics: \u0027 + root.qualityGate.epicCount + \u0027 | Stories: \u0027 + root.qualityGate.storyCount + \u0027 | Jira project type: Team Managed\u003c/p\u003e\u0027\n  + \u0027\u003ch2\u003eJira Epics\u003c/h2\u003e\u003cul\u003e\u0027 + (root.jiraResults.epics || []).map(e =\u003e \u0027\u003cli\u003e\u003cstrong\u003e\u0027 + esc(e.jiraEpicKey || \u0027Not created\u0027) + \u0027\u003c/strong\u003e - \u0027 + esc(e.epicName) + \u0027 (\u0027 + esc(e.action) + \u0027)\u003c/li\u003e\u0027).join(\u0027\u0027) + \u0027\u003c/ul\u003e\u0027\n  + \u0027\u003ch2\u003eStories Linked by Parent\u003c/h2\u003e\u003cul\u003e\u0027 + (root.jiraResults.stories || []).map(s =\u003e \u0027\u003cli\u003e\u003cstrong\u003e\u0027 + esc(s.storyKey || \u0027Not created\u0027) + \u0027\u003c/strong\u003e parent \u0027 + esc(s.parentEpicKey || \u0027Missing parent\u0027) + \u0027 - \u0027 + esc(s.summary) + \u0027 (\u0027 + esc(s.action) + \u0027)\u003c/li\u003e\u0027).join(\u0027\u0027) + \u0027\u003c/ul\u003e\u0027;\nreturn [{ json: { ...root, confluenceTitle: title, confluenceBody: body } }];"
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

- Check Chroma Retrieval Quality -> Professional Prompt Library (output 0, input 0)

**Outgoing Connections**

- Professional Prompt Library -> Professional QA Backlog Generator (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst request = $json || {};\nconst documentType = request.documentType || \u0027user_stories\u0027;\nconst retrievalContext = Array.isArray(request.retrievalContext) ? request.retrievalContext : [];\nconst groupedEvidence = request.groupedEvidence || {};\nconst retrievalProfile = request.retrievalProfile || {};\n\nconst formatChunk = (chunk, index) =\u003e {\n  const metadataLines = [\n    \u0027Chunk \u0027 + (index + 1),\n    \u0027Source: \u0027 + (chunk.source || \u0027Unknown\u0027),\n    \u0027DocType: \u0027 + (chunk.docType || \u0027UNKNOWN\u0027),\n    \u0027Category: \u0027 + (chunk.documentCategory || \u0027Not specified\u0027),\n    \u0027Artifact: \u0027 + (chunk.artifactType || \u0027Not specified\u0027),\n    \u0027Section: \u0027 + (chunk.section || \u0027Not specified\u0027),\n    \u0027Content Source: \u0027 + (chunk.contentSource || \u0027Not specified\u0027) + (chunk.hasVisionContent ? \u0027 | vision evidence present\u0027 : \u0027\u0027),\n    \u0027Profile Score: \u0027 + (chunk.profileScore ?? \u0027Not scored\u0027),\n    \u0027Profile Match: \u0027 + ((chunk.profileMatchReasons || []).join(\u0027; \u0027) || \u0027General project evidence\u0027),\n    \u0027Chunk ID: \u0027 + (chunk.chunkId || \u0027Not available\u0027),\n    \u0027Project: \u0027 + (chunk.project || request.projectName || \u0027Not specified\u0027),\n    \u0027Excerpt: \u0027 + (chunk.excerpt || \u0027\u0027)\n  ];\n  return metadataLines.join(\u0027\\n\u0027);\n};\n\nconst retrievalEvidenceText = retrievalContext.map(formatChunk).join(\u0027\\n\\n\u0027);\nconst groupedEvidenceText = Object.entries(groupedEvidence)\n  .filter(([_, chunks]) =\u003e Array.isArray(chunks) \u0026\u0026 chunks.length)\n  .map(([group, chunks]) =\u003e {\n    const body = chunks.map((chunk, index) =\u003e {\n      return \u0027- \u0027 + [\n        chunk.docType || \u0027UNKNOWN\u0027,\n        chunk.source || \u0027Unknown source\u0027,\n        chunk.section || \u0027No section\u0027,\n        \u0027score=\u0027 + (chunk.profileScore ?? \u0027n/a\u0027),\n        String(chunk.excerpt || \u0027\u0027).slice(0, 500)\n      ].join(\u0027 | \u0027);\n    }).join(\u0027\\n\u0027);\n    return group.toUpperCase() + \u0027 EVIDENCE\\n\u0027 + body;\n  })\n  .join(\u0027\\n\\n\u0027);\n\nconst profileSummary = [\n  \u0027Retrieval profile: \u0027 + (retrievalProfile.label || retrievalProfile.key || \u0027General QA Document\u0027),\n  \u0027Profile intent: \u0027 + (retrievalProfile.intent || \u0027Use project evidence to generate the requested document.\u0027),\n  \u0027Hard metadata filter: project = \u0027 + (request.projectName || \u0027Unknown Project\u0027),\n  \u0027Preferred docTypes: \u0027 + ((retrievalProfile.primaryDocTypes || []).concat(retrievalProfile.secondaryDocTypes || []).join(\u0027, \u0027) || \u0027Any\u0027),\n  \u0027Preferred categories: \u0027 + ((retrievalProfile.preferredCategories || []).join(\u0027, \u0027) || \u0027Any\u0027),\n  \u0027Preferred artifacts: \u0027 + ((retrievalProfile.preferredArtifacts || []).join(\u0027, \u0027) || \u0027Any\u0027),\n  \u0027Ranking mode: \u0027 + (retrievalProfile.rankingMode || \u0027project_filtered_metadata_profile_rerank\u0027)\n].join(\u0027\\n\u0027);\n\nconst promptLibrary = {\n  user_stories: {\n    title: \u0027Rich Agile User Stories - Team Managed Jira\u0027,\n    promptLibraryVersion: \u0027professional-backlog-rich-v5-metadata-retrieval-profile\u0027,\n    system: [\n      \u0027You are a Senior Product Owner, Business Analyst, QA Architect, and Agile delivery consultant with 15+ years of experience.\u0027,\n      \u0027You translate BRD, FRD, PRD, SRS, HLD, LLD, UI/UX artifacts, stakeholder transcripts, API/data model notes, and QA artifacts into detailed INVEST-compliant Agile epics and user stories.\u0027,\n      \u0027A preflight Chroma retrieval gate has already run using metadata.project as the hard project boundary, then a metadata retrieval profile reranked evidence using docType, documentCategory, artifactType, contentSource, sectionTitle, and vision evidence.\u0027,\n      \u0027Use the highest-ranked retrieved chunks as authoritative context. Treat lower-ranked or unclassified chunks as supporting evidence, not primary evidence.\u0027,\n      \u0027You may use the Chroma vector-search tool again for follow-up lookups, but do not ignore the profiled preflight retrieval evidence.\u0027,\n      \u0027If no useful project evidence is available, do not invent generic backlog content. Return an empty sourceCoverage array so the workflow can stop before Jira creation.\u0027,\n      \u0027Return strict JSON only, matching the configured output parser schema. Do not include markdown outside JSON.\u0027,\n      \u0027This is a Team Managed Jira project. Stories will be linked to epics using parent.key after epics are created. Do not use the company-managed Epic Link custom field.\u0027,\n      \u0027\u0027,\n      \u0027Required output model:\u0027,\n      \u0027- Multiple epics, each representing one cohesive business capability.\u0027,\n      \u0027- Every epic must contain at least one child story, but the number of stories is adaptive.\u0027,\n      \u0027- Decide story count from source evidence and implementation complexity. A narrow epic may have 1 strong story; a complex epic may need many stories.\u0027,\n      \u0027- Do not pad epics with artificial, review-only, or placeholder stories just to reach a count.\u0027,\n      \u0027- Each epic must include epicCorrelationId, epicName, epicSummary, epicDescription, businessOutcome, businessObjective, successMetrics, priority, sourceReferences, sourceTraceability, and storyCountRationale.\u0027,\n      \u0027- storyCountRationale must briefly explain why the selected number of child stories is sufficient for that epic.\u0027,\n      \u0027- Each story must include storyCorrelationId, summary, feature, userStory, userStoryDescription, businessContext, primaryFlow, alternateFlows, exceptionHandling, acceptanceCriteria, uiUxRequirements, fieldValidationRules, dataIntegrationRequirements, performanceNFRs, testScenarios, dependencies, assumptions, sourceReferences, sourceTraceability, automationFeasibility, priority, storyPoints, nonFunctionalConsiderations, and testNotes.\u0027,\n      \u0027- Preserve source traceability with docType, source name, section/title, chunkId when available, and concise evidence. Prefer exact source names when available.\u0027,\n      \u0027- Acceptance criteria must use Given/When/Then wording and cover positive, negative, and edge-case behavior.\u0027,\n      \u0027- Stories should decompose UI, API/backend, validation, integration, error handling, security/compliance, and performance/NFR concerns where the source evidence supports that split.\u0027,\n      \u0027- Keep Jira summaries concise, but make descriptions rich and implementation/test ready.\u0027\n    ].join(\u0027\\n\u0027),\n    user: [\n      \u0027Generate a professional, context-grounded QA/Product backlog for a SaaS product using retrieved project knowledge.\u0027,\n      \u0027\u0027,\n      \u0027Project context:\u0027,\n      \u0027- Project name: \u0027 + (request.projectName || \u0027Q-Ops Agent\u0027),\n      \u0027- Jira project key: \u0027 + ((request.jira \u0026\u0026 request.jira.projectKey) || request.jiraProjectKey || \u0027Not provided\u0027),\n      \u0027- Jira project type: Team Managed\u0027,\n      \u0027- Requested document type: \u0027 + documentType,\n      \u0027- Product owner: \u0027 + (request.productOwner || \u0027Not provided\u0027),\n      \u0027- Target Confluence space: \u0027 + ((request.confluence \u0026\u0026 request.confluence.spaceKey) || request.confluenceSpaceKey || \u0027Not provided\u0027),\n      \u0027- Chroma preflight chunk count: \u0027 + (request.retrievalQuality?.chunkCount || 0),\n      \u0027- Profile-selected chunk count: \u0027 + (request.retrievalQuality?.selectedChunkCount || retrievalContext.length),\n      \u0027- Profile matched chunk count: \u0027 + (request.retrievalQuality?.profileMatchedCount || 0),\n      \u0027- DocType coverage: \u0027 + ((request.retrievalQuality?.docTypeCoverage || []).join(\u0027, \u0027) || \u0027None\u0027),\n      \u0027- Chroma metadata hard filter: metadata.\u0027 + (request.retrievalQuality?.metadataFilterKey || \u0027project\u0027) + \u0027 = \u0027 + (request.retrievalQuality?.metadataFilterValue || request.projectName || \u0027Not provided\u0027),\n      \u0027\u0027,\n      \u0027Retrieval profile configuration:\u0027,\n      profileSummary,\n      \u0027\u0027,\n      \u0027Grouped evidence summary:\u0027,\n      groupedEvidenceText || \u0027No grouped evidence was supplied.\u0027,\n      \u0027\u0027,\n      \u0027Retrieved project evidence from Chroma, already ranked by the retrieval profile:\u0027,\n      retrievalEvidenceText || \u0027No retrieved evidence was supplied.\u0027,\n      \u0027\u0027,\n      \u0027Critical requirements:\u0027,\n      \u00271. Use the profile-ranked Chroma evidence above as the primary source for every epic and story.\u0027,\n      \u00272. Prefer primary docTypes and grouped business/functional/UI evidence when defining scope, outcomes, flows, and acceptance criteria.\u0027,\n      \u00273. Use technical/API/data-model evidence to enrich integration, data, NFR, dependency, and implementation notes.\u0027,\n      \u00274. Use UI/UX and vision-derived evidence for screen behavior, user flows, validation, usability, and field-level rules.\u0027,\n      \u00275. Convert high-level features into epics with detailed epic descriptions, business objectives, success metrics, priority, and source traceability.\u0027,\n      \u00276. Decide the number of stories per epic dynamically. One story is acceptable for a narrow epic if it is complete, independently deliverable, testable, and well justified by storyCountRationale.\u0027,\n      \u00277. Split into more stories when the source evidence shows separate UI, API/backend, validation, integration, error handling, security/compliance, or performance/NFR work.\u0027,\n      \u00278. Do not create filler, placeholder, or review-only stories.\u0027,\n      \u00279. For each story, include detailed story description, business context, primary flow, alternate flows, exception handling, field validation, data integration, NFRs, test scenarios, dependencies, assumptions, source traceability, and automation feasibility.\u0027,\n      \u002710. Acceptance criteria must be concrete Given/When/Then statements. Include enough criteria to make the story testable.\u0027,\n      \u002711. Avoid generic backlog filler. Every epic and story must be grounded in retrieved evidence.\u0027,\n      \u002712. Include document.sourceCoverage and document.retrievalEvidence that cite the retrieved chunks by docType/source/section/chunkId/excerpt.\u0027,\n      \u002713. Keep correlation IDs stable and label-safe for idempotent Jira search/reuse.\u0027,\n      \u002714. Return only valid JSON matching the output parser schema.\u0027\n    ].join(\u0027\\n\u0027)\n  }\n};\n\nconst selectedPrompt = promptLibrary[documentType];\n\nif (!selectedPrompt) {\n  throw new Error(\u0027Professional Prompt Library does not support documentType=\u0027 + documentType + \u0027. Non-user-story documents should route to fullRetrievalD01.\u0027);\n}\n\nreturn [{\n  json: {\n    ...request,\n    ...selectedPrompt,\n    promptRouting: {\n      route: \u0027professional_team_managed_backlog\u0027,\n      documentType,\n      usesPromptLibrary: true,\n      usesRetrievalProfile: true,\n      retrievalProfileKey: retrievalProfile.key || request.retrievalProfileKey || documentType,\n      requiresRetrievalEvidence: true,\n      preflightRetrievalRequired: true,\n      adaptiveStoryCount: true\n    }\n  }\n}];"
}
```

### Professional QA Backlog Generator

| Field | Value |
| --- | --- |
| Node ID | e2e1293a-3fbb-4cac-a91b-08ca95446ad0 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3.1 |
| Position | 432, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI Chat Model -> Professional QA Backlog Generator (output 0, input 0)
- Project Knowledge Vector Search -> Professional QA Backlog Generator (output 0, input 0)
- Professional Prompt Library -> Professional QA Backlog Generator (output 0, input 0)

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
| Position | 608, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Embeddings OpenAI -> Project Knowledge Vector Search (output 0, input 0)

**Outgoing Connections**

- Project Knowledge Vector Search -> Professional QA Backlog Generator (output 0, input 0)

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
    "jsCode":  "const root = $input.first().json;\nconst confluence = root.confluenceResponse || {};\nconst base = confluence._links?.base || root.confluenceBaseUrl;\nconst webui = confluence._links?.webui || null;\nconst baseClean = String(base || \u0027\u0027).endsWith(\u0027/\u0027) ? String(base || \u0027\u0027).slice(0, -1) : String(base || \u0027\u0027);\nconst confluenceUrl = webui ? baseClean + webui : null;\nreturn [{ json: { jobId: root.jobId, projectName: root.projectName, documentType: root.documentType, jiraProjectType: \u0027team-managed\u0027, promptLibraryVersion: $(\u0027Professional Prompt Library\u0027).first().json.promptLibraryVersion, qualityGate: root.qualityGate, wordCount: root.wordCount, tokensInput: root.tokensInput, tokensOutput: root.tokensOutput, tokensTotal: root.tokensTotal, estimatedCostUsd: root.estimatedCostUsd, epics: root.jiraResults.epics, stories: root.jiraResults.stories, jira: root.jiraResults, confluence: { pageId: confluence.id || null, title: confluence.title || root.confluenceTitle, action: root.confluenceAction, link: webui, url: confluenceUrl }, url: confluenceUrl, confluenceUrl, generated: root.generated, sourceCoverage: root.qualityGate?.sourceCoverage || [], retrievalEvidenceCount: root.qualityGate?.retrievalEvidenceCount || 0, retrievalQuality: root.retrievalQuality || null } }];"
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
    "jsCode":  "\nconst raw = $json.output ?? $json.text ?? $json.response ?? $json;\n\nconst stringifyRaw = value =\u003e {\n  if (value \u0026\u0026 typeof value === \u0027object\u0027) {\n    if (typeof value.output === \u0027string\u0027) return value.output;\n    if (typeof value.text === \u0027string\u0027) return value.text;\n    if (typeof value.response === \u0027string\u0027) return value.response;\n    if (typeof value.output_text === \u0027string\u0027) return value.output_text;\n  }\n  return String(value || \u0027\u0027).trim();\n};\n\nconst count = (text, pattern) =\u003e (text.match(pattern) || []).length;\n\nconst truncationMessage = (text, extra = \u0027\u0027) =\u003e {\n  let context = {};\n  try {\n    const request = $(\u0027Normalize Team Managed Request\u0027).first().json || {};\n    const prompt = $(\u0027Professional Prompt Library\u0027).first().json || {};\n    const quality = $(\u0027Check Chroma Retrieval Quality\u0027).first().json?.retrievalQuality || {};\n    context = {\n      jobId: request.jobId,\n      projectName: request.projectName,\n      documentType: request.documentType,\n      generationModel: request.generationModel,\n      maxTokens: request.maxTokens,\n      chromaTopK: request.chromaTopK,\n      selectedChunkCount: quality.selectedChunkCount,\n      promptChars: String((prompt.system || \u0027\u0027) + (prompt.user || \u0027\u0027)).length,\n      outputChars: text.length\n    };\n  } catch (error) {}\n\n  return [\n    \u0027Backlog parser detected incomplete or truncated model JSON. Jira and Confluence creation stopped before any issues/pages were created.\u0027,\n    extra,\n    \u0027Action: rerun with maxTokens \u003e= 16000, reduce retrieval context/topK, or split backlog generation into skeleton + enrichment steps.\u0027,\n    \u0027Context: \u0027 + JSON.stringify(context)\n  ].filter(Boolean).join(\u0027 \u0027);\n};\n\nconst extractBalancedJsonObject = text =\u003e {\n  const firstBrace = text.indexOf(\u0027{\u0027);\n  if (firstBrace \u003c 0) {\n    throw new Error(\u0027Backlog parser received a response without a JSON object. Raw preview: \u0027 + text.slice(0, 500));\n  }\n\n  let depth = 0;\n  let inString = false;\n  let escaped = false;\n\n  for (let i = firstBrace; i \u003c text.length; i++) {\n    const char = text[i];\n\n    if (inString) {\n      if (escaped) {\n        escaped = false;\n      } else if (char === \u0027\\\\\u0027) {\n        escaped = true;\n      } else if (char === \u0027\"\u0027) {\n        inString = false;\n      }\n      continue;\n    }\n\n    if (char === \u0027\"\u0027) {\n      inString = true;\n    } else if (char === \u0027{\u0027) {\n      depth += 1;\n    } else if (char === \u0027}\u0027) {\n      depth -= 1;\n      if (depth === 0) {\n        return {\n          candidate: text.slice(firstBrace, i + 1),\n          trailing: text.slice(i + 1).trim()\n        };\n      }\n      if (depth \u003c 0) break;\n    }\n  }\n\n  const partial = text.slice(firstBrace);\n  throw new Error(truncationMessage(\n    text,\n    \u0027No complete balanced JSON object was found. JSON balance: {\u0027 + count(partial, /{/g) + \u0027/\u0027 + count(partial, /}/g) + \u0027} [\u0027 + count(partial, /\\[/g) + \u0027/\u0027 + count(partial, /\\]/g) + \u0027].\u0027\n  ));\n};\n\nconst parseCandidate = (value) =\u003e {\n  if (value \u0026\u0026 typeof value === \u0027object\u0027 \u0026\u0026 value.document \u0026\u0026 Array.isArray(value.epics)) return value;\n  if (value \u0026\u0026 typeof value === \u0027object\u0027 \u0026\u0026 value.output?.document \u0026\u0026 Array.isArray(value.output.epics)) return value.output;\n\n  let text = stringifyRaw(value);\n  if (!text) throw new Error(\u0027Backlog parser received an empty model response.\u0027);\n\n  const fenced = text.match(new RegExp(\u0027\\\\x60{3}(?:json)?\\\\s*([\\\\s\\\\S]*?)\\\\s*\\\\x60{3}\u0027, \u0027i\u0027));\n  if (fenced) text = fenced[1].trim();\n\n  for (let i = 0; i \u003c 2; i++) {\n    const trimmed = text.trim();\n    if (!(trimmed.startsWith(\u0027\"\u0027) \u0026\u0026 trimmed.endsWith(\u0027\"\u0027))) break;\n    try {\n      const unwrapped = JSON.parse(trimmed);\n      if (unwrapped \u0026\u0026 typeof unwrapped === \u0027object\u0027) return unwrapped;\n      if (typeof unwrapped === \u0027string\u0027) text = unwrapped.trim();\n    } catch (error) {\n      break;\n    }\n  }\n\n  const { candidate, trailing } = extractBalancedJsonObject(text);\n  try {\n    return JSON.parse(candidate);\n  } catch (error) {\n    const position = String(error.message || \u0027\u0027).match(/position\\s+(\\d+)/i)?.[1];\n    const pos = position ? Number(position) : -1;\n    const near = pos \u003e= 0 ? candidate.slice(Math.max(0, pos - 300), Math.min(candidate.length, pos + 300)) : candidate.slice(0, 500);\n    const openBraces = count(candidate, /{/g);\n    const closeBraces = count(candidate, /}/g);\n    const openBrackets = count(candidate, /\\[/g);\n    const closeBrackets = count(candidate, /\\]/g);\n    const completionLike = openBraces !== closeBraces || openBrackets !== closeBrackets || /(\"[^\"]*|[,:\\[{]\\s*)$/.test(candidate.trim());\n    if (completionLike) {\n      throw new Error(truncationMessage(text, error.message + \u0027. JSON balance: {\u0027 + openBraces + \u0027/\u0027 + closeBraces + \u0027} [\u0027 + openBrackets + \u0027/\u0027 + closeBrackets + \u0027]. Near parse error: \u0027 + near));\n    }\n    throw new Error(\u0027Backlog parser failed to parse model JSON: \u0027 + error.message + \u0027. Near parse error: \u0027 + near);\n  }\n};\n\nlet parsed;\ntry {\n  parsed = parseCandidate(raw);\n} catch (error) {\n  throw new Error(error.message);\n}\n\nconst generated = parsed.output \u0026\u0026 typeof parsed.output === \u0027object\u0027 ? parsed.output : parsed;\nif (!generated.document || typeof generated.document !== \u0027object\u0027) generated.document = {};\n\nconst hasItems = value =\u003e Array.isArray(value) \u0026\u0026 value.length \u003e 0;\nconst hasBacklogShape =\n  hasItems(generated.epics) ||\n  hasItems(generated.stories) ||\n  hasItems(generated.userStories) ||\n  hasItems(generated.features) ||\n  hasItems(generated.backlog?.epics) ||\n  hasItems(generated.backlog?.stories) ||\n  hasItems(generated.backlog?.userStories) ||\n  hasItems(generated.backlog?.features);\n\nif (!hasBacklogShape) {\n  throw new Error(\u0027Backlog parser found JSON but missing usable epics/stories structure. Top-level keys: \u0027 + Object.keys(generated || {}).join(\u0027, \u0027));\n}\n\nreturn [{ json: generated }];\n"
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

**Outgoing Connections**

- Validate Team Managed Backlog -> Prepare Epic Search Items (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const generated = $json.output || $json;\nlet context;\ntry { context = $(\u0027Check Chroma Retrieval Quality\u0027).first().json; } catch (error) { context = $(\u0027Normalize Team Managed Request\u0027).first().json; }\nconst toObjectArray = value =\u003e {\n  if (Array.isArray(value)) return value.filter(item =\u003e item \u0026\u0026 typeof item === \u0027object\u0027);\n  if (value \u0026\u0026 typeof value === \u0027object\u0027) return Object.values(value).filter(item =\u003e item \u0026\u0026 typeof item === \u0027object\u0027);\n  return [];\n};\n\nconst firstText = (...values) =\u003e {\n  for (const value of values) {\n    if (value === null || value === undefined) continue;\n    const text = String(value).trim();\n    if (text) return text;\n  }\n  return \u0027\u0027;\n};\n\nconst normalizeKey = value =\u003e firstText(value).toLowerCase().replace(/[^a-z0-9]+/g, \u0027\u0027);\nconst generatedBacklog = generated.backlog \u0026\u0026 typeof generated.backlog === \u0027object\u0027 ? generated.backlog : {};\n\nconst normalizeEpic = (epic, index) =\u003e {\n  const copy = { ...epic };\n  const epicId = firstText(copy.epicCorrelationId, copy.epicId, copy.id, copy.key, copy.referenceId, \u0027EPIC-\u0027 + String(index + 1).padStart(3, \u00270\u0027));\n  copy.epicCorrelationId = firstText(copy.epicCorrelationId, copy.epicId, copy.id, copy.key, epicId);\n  copy.epicId = firstText(copy.epicId, copy.epicCorrelationId, epicId);\n  copy.epicName = firstText(copy.epicName, copy.name, copy.title, copy.feature, copy.summary, \u0027Generated Epic \u0027 + String(index + 1));\n  copy.epicSummary = firstText(copy.epicSummary, copy.epicDescription, copy.description, copy.businessOutcome, copy.summary);\n  copy.businessOutcome = firstText(copy.businessOutcome, copy.businessObjective, copy.outcome, copy.epicSummary);\n  return copy;\n};\n\nconst normalizeStory = (story, epic, index) =\u003e {\n  const copy = { ...story };\n  const epicId = firstText(epic?.epicCorrelationId, epic?.epicId, copy.epicCorrelationId, copy.epicId, copy.parentEpicId, \u0027EPIC-001\u0027);\n  const storyId = firstText(copy.storyCorrelationId, copy.userStoryId, copy.storyId, copy.id, copy.key, epicId + \u0027-US-\u0027 + String(index + 1).padStart(3, \u00270\u0027));\n  copy.storyCorrelationId = firstText(copy.storyCorrelationId, copy.userStoryId, copy.storyId, storyId);\n  copy.userStoryId = firstText(copy.userStoryId, copy.storyCorrelationId, storyId);\n  copy.epicCorrelationId = firstText(copy.epicCorrelationId, copy.epicId, copy.parentEpicId, epicId);\n  copy.epicId = firstText(copy.epicId, copy.epicCorrelationId, epicId);\n  copy.summary = firstText(copy.summary, copy.title, copy.name, copy.feature, String(copy.userStory || \u0027\u0027).slice(0, 120));\n  copy.feature = firstText(copy.feature, copy.summary, epic?.epicName);\n  copy.userStory = firstText(copy.userStory, copy.story, copy.description, copy.userStoryDescription, copy.summary);\n  copy.userStoryDescription = firstText(copy.userStoryDescription, copy.description, copy.userStory);\n  copy.acceptanceCriteria = copy.acceptanceCriteria ?? copy.acceptance_criteria ?? copy.ac ?? copy.criteria ?? [];\n  copy.sourceReferences = copy.sourceReferences ?? copy.sourceTraceability ?? copy.traceability ?? [];\n  return copy;\n};\n\nlet epics = [\n  ...toObjectArray(generated.epics),\n  ...toObjectArray(generatedBacklog.epics),\n  ...toObjectArray(generated.features),\n  ...toObjectArray(generatedBacklog.features)\n].map(normalizeEpic);\n\nconst seenEpicIds = new Set();\nepics = epics.filter(epic =\u003e {\n  const key = normalizeKey(firstText(epic.epicCorrelationId, epic.epicId, epic.epicName));\n  if (!key || seenEpicIds.has(key)) return false;\n  seenEpicIds.add(key);\n  return true;\n});\n\nfor (const [epicIndex, epic] of epics.entries()) {\n  const nestedStories = [\n    ...toObjectArray(epic.stories),\n    ...toObjectArray(epic.userStories),\n    ...toObjectArray(epic.children),\n    ...toObjectArray(epic.items)\n  ];\n  epic.stories = nestedStories.map((story, storyIndex) =\u003e normalizeStory(story, epic, storyIndex));\n}\n\nconst topLevelStories = [\n  ...toObjectArray(generated.stories),\n  ...toObjectArray(generated.userStories),\n  ...toObjectArray(generatedBacklog.stories),\n  ...toObjectArray(generatedBacklog.userStories)\n];\n\nconst epicKeys = epic =\u003e new Set([\n  epic.epicCorrelationId,\n  epic.epicId,\n  epic.id,\n  epic.key,\n  epic.epicName,\n  epic.name,\n  epic.title,\n  epic.feature,\n  epic.summary\n].map(normalizeKey).filter(Boolean));\n\nconst storyEpicKeys = story =\u003e [\n  story.epicCorrelationId,\n  story.epicId,\n  story.parentEpicId,\n  story.parentEpicCorrelationId,\n  story.epicName,\n  story.epic,\n  story.feature,\n  story.module,\n  story.domain\n].map(normalizeKey).filter(Boolean);\n\nconst groupUnmatchedStories = new Map();\nfor (const rawStory of topLevelStories) {\n  const keys = storyEpicKeys(rawStory);\n  let targetEpic = epics.find(epic =\u003e {\n    const keysForEpic = epicKeys(epic);\n    return keys.some(key =\u003e keysForEpic.has(key));\n  });\n\n  if (!targetEpic \u0026\u0026 epics.length === 1) targetEpic = epics[0];\n\n  if (targetEpic) {\n    targetEpic.stories.push(normalizeStory(rawStory, targetEpic, targetEpic.stories.length));\n  } else {\n    const groupName = firstText(rawStory.epicName, rawStory.epic, rawStory.feature, rawStory.module, rawStory.domain, \u0027Generated Backlog\u0027);\n    const key = normalizeKey(groupName) || \u0027generatedbacklog\u0027;\n    if (!groupUnmatchedStories.has(key)) groupUnmatchedStories.set(key, { name: groupName, stories: [] });\n    groupUnmatchedStories.get(key).stories.push(rawStory);\n  }\n}\n\nfor (const group of groupUnmatchedStories.values()) {\n  const epic = normalizeEpic({\n    epicName: group.name,\n    epicSummary: \u0027Generated from top-level user stories returned by the backlog model.\u0027,\n    businessOutcome: \u0027Create a Jira-ready backlog from retrieved project evidence.\u0027\n  }, epics.length);\n  epic.stories = group.stories.map((story, storyIndex) =\u003e normalizeStory(story, epic, storyIndex));\n  epics.push(epic);\n}\n\ngenerated.epics = epics;\nconst fatalErrors = [];\n\nconst normalizeArray = value =\u003e {\n  if (Array.isArray(value)) return value.map(v =\u003e typeof v === \u0027string\u0027 ? v.trim() : JSON.stringify(v)).filter(Boolean);\n  if (typeof value === \u0027string\u0027 \u0026\u0026 value.trim()) return [value.trim()];\n  return [];\n};\n\nlet sourceCoverage = normalizeArray(generated.document?.sourceCoverage);\nlet retrievalEvidence = Array.isArray(generated.document?.retrievalEvidence) ? generated.document.retrievalEvidence : [];\n\nconst preflightRetrievalContext = Array.isArray(context.retrievalContext) ? context.retrievalContext : [];\nconst preflightCoverage = [...new Set(preflightRetrievalContext.map(chunk =\u003e {\n  const docType = String(chunk.docType || chunk.metadata?.docType || \u0027Source\u0027).trim();\n  const source = String(chunk.source || chunk.fileName || chunk.metadata?.fileName || chunk.metadata?.filename || \u0027\u0027).trim();\n  const section = String(chunk.section || chunk.sectionTitle || chunk.metadata?.sectionTitle || \u0027\u0027).trim();\n  return [docType, source, section].filter(Boolean).join(\u0027 - \u0027);\n}).filter(Boolean))];\n\nif (!sourceCoverage.length \u0026\u0026 preflightCoverage.length) {\n  sourceCoverage = preflightCoverage;\n}\n\nif (!retrievalEvidence.length \u0026\u0026 preflightRetrievalContext.length) {\n  retrievalEvidence = preflightRetrievalContext.slice(0, 20).map(chunk =\u003e ({\n    source: chunk.source || chunk.fileName || \u0027Chroma chunk\u0027,\n    docType: chunk.docType || \u0027UNKNOWN\u0027,\n    section: chunk.section || chunk.sectionTitle || \u0027\u0027,\n    chunkId: chunk.chunkId || \u0027\u0027,\n    contentSource: chunk.contentSource || \u0027\u0027,\n    profileScore: chunk.profileScore || null\n  }));\n}\n\nif (!generated.document || typeof generated.document !== \u0027object\u0027) {\n  generated.document = {};\n}\ngenerated.document.sourceCoverage = sourceCoverage;\ngenerated.document.retrievalEvidence = retrievalEvidence;\n\nif (!context.retrievalQuality || Number(context.retrievalQuality.chunkCount || 0) \u003c 1) {\n  fatalErrors.push(\u0027Preflight Chroma retrieval returned 0 chunks for project=\u0027 + (context.projectName || \u0027Unknown Project\u0027) + \u0027.\u0027);\n}\nif (!sourceCoverage.length \u0026\u0026 !retrievalEvidence.length) {\n  fatalErrors.push(\u0027No Chroma retrieval evidence is available from either the model response or preflight retrieval. Refusing to create Jira issues from fallback-only content. Check Chroma metadata filter, project ingestion, and whether chunks exist for project=\u0027 + (context.projectName || \u0027Unknown Project\u0027) + \u0027.\u0027);\n}\nif (!epics.length) fatalErrors.push(\u0027No epics were generated.\u0027);\n\nconst epicNames = new Set();\nconst storySummaries = new Set();\nlet totalStories = 0;\n\nfor (const [epicIndex, epic] of epics.entries()) {\n  const epicId = epic.epicCorrelationId || epic.epicId || `EPIC-${String(epicIndex + 1).padStart(3, \u00270\u0027)}`;\n  epic.epicCorrelationId = epic.epicCorrelationId || epic.epicId || epicId;\n  epic.epicName = epic.epicName || epic.feature || \u0027\u0027;\n  epic.epicSummary = epic.epicSummary || epic.epicDescription || epic.businessOutcome || \u0027\u0027;\n  epic.businessOutcome = epic.businessOutcome || epic.businessObjective || \u0027\u0027;\n  epic.sourceReferences = normalizeArray(epic.sourceReferences).concat(normalizeArray(epic.sourceTraceability));\n  epic.sourceReferences = [...new Set(epic.sourceReferences)];\n  epic.successMetrics = normalizeArray(epic.successMetrics);\n  epic.priority = epic.priority || \u0027Medium\u0027;\n  epic.storyCountRationale = epic.storyCountRationale || epic.decompositionRationale || epic.scopeRationale || \u0027\u0027;\n\n  if (!epic.epicCorrelationId) fatalErrors.push(\u0027Epic at index \u0027 + epicIndex + \u0027 is missing epicCorrelationId.\u0027);\n  if (!epic.epicName || String(epic.epicName).trim().length \u003c 8) fatalErrors.push(\u0027Epic \u0027 + epicId + \u0027 has a missing or weak epicName.\u0027);\n  const epicName = String(epic.epicName || \u0027\u0027).trim().toLowerCase();\n  if (epicName \u0026\u0026 epicNames.has(epicName)) fatalErrors.push(\u0027Duplicate epic name: \u0027 + epic.epicName);\n  if (epicName) epicNames.add(epicName);\n  if (!epic.sourceReferences.length) fatalErrors.push(\u0027Epic \u0027 + epicId + \u0027 has no source references.\u0027);\n\n  epic.stories = Array.isArray(epic.stories) ? epic.stories : [];\n  if (!epic.stories.length) {\n    fatalErrors.push(\u0027Epic \u0027 + epicId + \u0027 has zero stories. Adaptive story count is allowed, but every epic must have at least one valid child story or it cannot be linked cleanly in Jira.\u0027);\n    continue;\n  }\n\n  totalStories += epic.stories.length;\n\n  for (const [storyIndex, story] of epic.stories.entries()) {\n    const storyId = story.storyCorrelationId || story.userStoryId || `${epicId}-US-${String(storyIndex + 1).padStart(3, \u00270\u0027)}`;\n    story.storyCorrelationId = story.storyCorrelationId || story.userStoryId || storyId;\n    story.summary = story.summary || story.feature || String(story.userStory || \u0027\u0027).slice(0, 120) || \u0027\u0027;\n    story.feature = story.feature || story.summary;\n    story.userStoryDescription = story.userStoryDescription || story.description || \u0027\u0027;\n    story.businessContext = story.businessContext || epic.businessOutcome || epic.businessObjective || \u0027\u0027;\n    story.acceptanceCriteria = normalizeArray(story.acceptanceCriteria);\n    story.alternateFlows = normalizeArray(story.alternateFlows);\n    story.exceptionHandling = normalizeArray(story.exceptionHandling);\n    story.uiUxRequirements = normalizeArray(story.uiUxRequirements);\n    story.fieldValidationRules = normalizeArray(story.fieldValidationRules);\n    story.dataIntegrationRequirements = normalizeArray(story.dataIntegrationRequirements);\n    story.performanceNFRs = normalizeArray(story.performanceNFRs);\n    story.testScenarios = normalizeArray(story.testScenarios);\n    story.dependencies = normalizeArray(story.dependencies);\n    story.assumptions = normalizeArray(story.assumptions);\n    story.nonFunctionalConsiderations = normalizeArray(story.nonFunctionalConsiderations);\n    story.testNotes = normalizeArray(story.testNotes);\n    story.sourceReferences = normalizeArray(story.sourceReferences).concat(normalizeArray(story.sourceTraceability));\n    if (!story.sourceReferences.length \u0026\u0026 epic.sourceReferences.length) story.sourceReferences = epic.sourceReferences;\n    story.sourceReferences = [...new Set(story.sourceReferences)];\n\n    if (!story.storyCorrelationId) fatalErrors.push(\u0027Story under \u0027 + epicId + \u0027 missing storyCorrelationId.\u0027);\n    if (!story.summary || String(story.summary).trim().length \u003c 8) fatalErrors.push(\u0027Story \u0027 + storyId + \u0027 has a missing or weak summary.\u0027);\n    const storySummary = String(story.summary || \u0027\u0027).trim().toLowerCase();\n    if (storySummary \u0026\u0026 storySummaries.has(storySummary)) fatalErrors.push(\u0027Duplicate story summary: \u0027 + story.summary);\n    if (storySummary) storySummaries.add(storySummary);\n    const userStoryText = String(story.userStory || \u0027\u0027).trim();\n    story.userStoryFormat = /^As a\\b/i.test(userStoryText) ? \u0027canonical\u0027 : (userStoryText ? \u0027narrative_statement\u0027 : \u0027missing\u0027);\n    if (!userStoryText \u0026\u0026 story.summary) {\n      story.userStory = story.summary;\n      story.userStoryFormat = \u0027derived_from_summary\u0027;\n    }\n    if (story.acceptanceCriteria.length \u003c 1) fatalErrors.push(\u0027Story \u0027 + storyId + \u0027 has no acceptance criteria.\u0027);\n    const hasGivenWhenThenCriteria = story.acceptanceCriteria.some(a =\u003e /given.+when.+then/i.test(String(a)));\n    story.acceptanceCriteriaFormat = hasGivenWhenThenCriteria ? \u0027given_when_then\u0027 : \u0027testable_statement\u0027;\n    if (!story.sourceReferences.length) fatalErrors.push(\u0027Story \u0027 + storyId + \u0027 has no source references.\u0027);\n  }\n}\n\nif (!totalStories) fatalErrors.push(\u0027No user stories were generated across the backlog.\u0027);\nif (fatalErrors.length) throw new Error(\u0027Backlog quality gate failed: \u0027 + [...new Set(fatalErrors)].join(\u0027 | \u0027));\n\nconst textForTokens = JSON.stringify(generated);\nconst tokensOutput = Math.max(1, Math.ceil(textForTokens.length / 4));\nconst prompt = $(\u0027Professional Prompt Library\u0027).first().json;\nconst tokensInput = Math.max(1, Math.ceil(((prompt.system || \u0027\u0027) + (prompt.user || \u0027\u0027)).length / 4));\nconst estimatedCostUsd = Number(((tokensInput * 0.40 / 1000000) + (tokensOutput * 1.60 / 1000000)).toFixed(6));\n\nreturn [{\n  json: {\n    ...context,\n    generated,\n    epics,\n    wordCount: textForTokens.split(/\\s+/).length,\n    tokensInput,\n    tokensOutput,\n    tokensTotal: tokensInput + tokensOutput,\n    estimatedCostUsd,\n    qualityGate: {\n      passed: true,\n      status: \u0027passed\u0027,\n      jiraProjectType: \u0027team-managed\u0027,\n      adaptiveStoryCount: true,\n      epicCount: epics.length,\n      storyCount: totalStories,\n      sourceCoverage,\n      retrievalEvidenceCount: retrievalEvidence.length\n    }\n  }\n}];"
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
