# Reverse-Engineering-Code-to-HLD Automation Pipeline (using OpenAI)

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | gJzaM5OpYbwTw8qo |
| Active | False |
| Archived | False |
| Created At | 2026-02-12T12:29:56.004Z |
| Updated At | 2026-02-18T08:03:56.841Z |
| Node Count | 29 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Reverse-Engineering-Code-to-HLD Automation Pipeline (using OpenAI) [gJzaM5OpYbwTw8qo].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- When clicking â€˜Execute workflowâ€™ | n8n-nodes-base.manualTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.openAi | 5 |
| n8n-nodes-base.aggregate | 1 |
| n8n-nodes-base.code | 13 |
| n8n-nodes-base.httpRequest | 2 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.manualTrigger | 1 |
| n8n-nodes-base.merge | 3 |
| n8n-nodes-base.splitInBatches | 3 |

## Credentials Referenced

- httpBearerAuth: Bearer Auth account
- httpHeaderAuth: Github latest PAT token
- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- https://api.github.com/repos/{{
- https://raw.githubusercontent.com/{{$json.owner}}/{{$json.repo}}/{{$json.branch}}/{{$json.path}}

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- When clicking â€˜Execute workflowâ€™ -> Define Github Repositories (source output 0, target input 0)
- Download file contents -> Merge (source output 0, target input 0)
- Get full repo tree -> Repo Structure Profiler (source output 0, target input 0)
- Get full repo tree -> Retain Repo Metadata (source output 0, target input 1)
- Filter Relevant Files -> Download file contents (source output 0, target input 0)
- Filter Relevant Files -> Merge (source output 0, target input 1)
- Group by logical folder -> Split folders in batches (source output 0, target input 0)
- Merge -> Extract content & Path (source output 0, target input 0)
- Split folders in batches -> Aggregate folder summaries (source output 0, target input 0)
- Split folders in batches -> Folder Architecture Analyzer (source output 1, target input 0)
- Define Github Repositories -> Loop Over Items (source output 0, target input 0)
- Define Github Repositories -> Retain Repo Metadata (source output 0, target input 0)
- Loop Over Items -> RepoMetaData + LLMresponse (source output 0, target input 1)
- Loop Over Items -> Get full repo tree (source output 1, target input 0)
- Retain Repo Metadata -> RepoMetaData + LLMresponse (source output 0, target input 0)
- Normalize File Summary -> Loop (source output 0, target input 0)
- Extract content & Path -> Loop (source output 0, target input 0)
- File Structure Summarizer -> Normalize File Summary (source output 0, target input 0)
- Folder Architecture Analyzer -> Normalize Folder Summary (source output 0, target input 0)
- Loop -> Group by logical folder (source output 0, target input 0)
- Loop -> If (source output 1, target input 0)
- Normalize Folder Summary -> Split folders in batches (source output 0, target input 0)
- Aggregate folder summaries -> Aggregate Repo Intelligence (source output 0, target input 0)
- Aggregate Repo Intelligence -> System Architecture Synthesizer (source output 0, target input 0)
- System Architecture Synthesizer -> Normalize System Architecture (source output 0, target input 0)
- Normalize System Architecture -> HLD Generator (source output 0, target input 0)
- HLD Generator -> Extract HLD JSON String (source output 0, target input 0)
- Extract HLD JSON String -> Parse HLD JSON (source output 0, target input 0)
- Parse HLD JSON -> Generate HLD Binary (source output 0, target input 0)
- If -> File Structure Summarizer (source output 0, target input 0)
- If -> Loop (source output 1, target input 0)
- Repo Structure Profiler -> Dynamic Files/Folders Filtering (source output 0, target input 0)
- Dynamic Files/Folders Filtering -> Parse LLM Response (source output 0, target input 0)
- Parse LLM Response -> Loop Over Items (source output 0, target input 0)
- RepoMetaData + LLMresponse -> Filter Relevant Files (source output 0, target input 0)

## Nodes

### Aggregate folder summaries

| Field | Value |
| --- | --- |
| Node ID | 63e01e7b-1a33-4856-ab2c-f99aa69541ba |
| Type | n8n-nodes-base.aggregate |
| Type Version | 1 |
| Position | 1536, 768 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Split folders in batches -> Aggregate folder summaries (output 0, input 0)

**Outgoing Connections**

- Aggregate folder summaries -> Aggregate Repo Intelligence (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "aggregate":  "aggregateAllItemData",
    "destinationFieldName":  "folderSummaries",
    "options":  {

                }
}
```

### Aggregate Repo Intelligence

| Field | Value |
| --- | --- |
| Node ID | 63ae6409-826c-410d-b410-173f670738ff |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1808, 768 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Aggregate folder summaries -> Aggregate Repo Intelligence (output 0, input 0)

**Outgoing Connections**

- Aggregate Repo Intelligence -> System Architecture Synthesizer (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const folders = $input.all().map(i =\u003e i.json);\n\nreturn [{\n  json: {\n    folders\n  }\n}];\n"
}
```

### Define Github Repositories

| Field | Value |
| --- | --- |
| Node ID | 0742d9e9-f895-4849-9739-f1ea7498c98f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -2256, 784 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- When clicking â€˜Execute workflowâ€™ -> Define Github Repositories (output 0, input 0)

**Outgoing Connections**

- Define Github Repositories -> Loop Over Items (output 0, input 0)
- Define Github Repositories -> Retain Repo Metadata (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [\n  {\n    json: {\n      owner: \"anujalhans\",\n      repo: \"saleor-storefront\",\n      branch: \"main\"\n    }\n  }\n];\n"
}
```

### Download file contents

| Field | Value |
| --- | --- |
| Node ID | d7ff5c79-1b8e-4022-a337-5e870537a742 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | -960, 656 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Filter Relevant Files -> Download file contents (output 0, input 0)

**Outgoing Connections**

- Download file contents -> Merge (output 0, input 0)

**Credential References**

```json
{
    "httpHeaderAuth":  {
                           "id":  "ycIqw4aN68Yh1hjM",
                           "name":  "Github latest PAT token"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "=https://raw.githubusercontent.com/{{$json.owner}}/{{$json.repo}}/{{$json.branch}}/{{$json.path}}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpHeaderAuth",
    "options":  {

                }
}
```

### Dynamic Files/Folders Filtering

| Field | Value |
| --- | --- |
| Node ID | 9df21b4f-753c-4422-b56b-bf7eea1f9c95 |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2.1 |
| Position | -1376, 1088 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Repo Structure Profiler -> Dynamic Files/Folders Filtering (output 0, input 0)

**Outgoing Connections**

- Dynamic Files/Folders Filtering -> Parse LLM Response (output 0, input 0)

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
                    "value":  "gpt-4.1-mini",
                    "mode":  "list",
                    "cachedResultName":  "GPT-4.1-MINI"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "role":  "system",
                                         "content":  "You are a senior software architect.\n\nYou are analyzing repository structure metadata.\n\nYour task:\nBased on file extensions, folder names, and sample file names,\ninfer intelligent filtering rules for architectural reverse engineering.\n\nSTRICT RULES:\n- Do not hallucinate files not present\n- Base decisions only on provided structure\n- Infer typical config files based on patterns\n- Infer test folders and build artifacts\n- Infer code file extensions relevant for architecture understanding\n- Return ONLY strict JSON.\n- Do NOT include comments.\n- Do NOT include explanations.\n- Do NOT include markdown fences.\n- JSON must be valid and parsable.\n\nReturn JSON only in this schema:\n\n{\n  \"tierAConfigFiles\": [],\n  \"ignoreFolders\": [],\n  \"ignorePatterns\": [],\n  \"codeExtensions\": []\n}\n"
                                     },
                                     {
                                         "content":  "=Repository Structure:\nExtensions:\n{{JSON.stringify($json.extensions)}}\n\nFolders:\n{{JSON.stringify($json.folders)}}\n\nSample File Names:\n{{JSON.stringify($json.sampleFileNames)}}\n\nOther File Paths:\n{{JSON.stringify($json.unmatchedPaths)}}\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {

                }
}
```

### Extract content & Path

| Field | Value |
| --- | --- |
| Node ID | 8fb921df-1fce-4b14-9621-6eba6ece8f38 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -544, 800 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge -> Extract content & Path (output 0, input 0)

**Outgoing Connections**

- Extract content & Path -> Loop (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\nconst maxChars = 4000;\n\nreturn items.map(item =\u003e {\n\n  const raw = item.json.data || \"\";\n  \n  const truncated = raw.length \u003e maxChars\n    ? raw.slice(0, maxChars) + \"\\n\\n...TRUNCATED...\"\n    : raw;\n\n  return {\n    json: {\n      owner: item.json.owner,\n      repo: item.json.repo,\n      branch: item.json.branch,\n      path: item.json.path,\n      mode: item.json.mode,\n      type: item.json.type,\n      sha: item.json.sha,\n      size: item.json.size,\n      url: item.json.url,\n      tier: item.json.tier,   // keep tier if you added it earlier\n      content: truncated\n    }\n  };\n});\n"
}
```

### Extract HLD JSON String

| Field | Value |
| --- | --- |
| Node ID | 3bd28960-ebdf-470c-9921-5c027f7d8856 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2928, 768 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- HLD Generator -> Extract HLD JSON String (output 0, input 0)

**Outgoing Connections**

- Extract HLD JSON String -> Parse HLD JSON (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const text = items[0].json.output[0].content[0].text;\n\nif (!text) {\n  throw new Error(\"No JSON text found in model output.\");\n}\n\nreturn [\n  {\n    json: {\n      rawHldJson: text.trim()\n    }\n  }\n];\n"
}
```

### File Structure Summarizer

| Field | Value |
| --- | --- |
| Node ID | ad8ad865-1b1a-468d-ad9a-f996f353350c |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | 64, 960 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- If -> File Structure Summarizer (output 0, input 0)

**Outgoing Connections**

- File Structure Summarizer -> Normalize File Summary (output 0, input 0)

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
                                         "content":  "=File: {{$json.path}}\n\nCode:\n{{$json.content.slice(0,4000)}}\n"
                                     },
                                     {
                                         "role":  "system",
                                         "content":  "You are a senior software engineer.\n\nAnalyze ONE file.\n\nSummarize in 5-8 bullet points:\n- What this file does\n- Key classes/functions\n- External libraries used\n- Architectural role\n\nBe concise.\nNo hallucination.\nNo code repetition.\n\nOutput JSON:\n\n{\n  \"path\": string,\n  \"summary\": string\n}\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  250,
                    "temperature":  0.2
                }
}
```

### Filter Relevant Files

| Field | Value |
| --- | --- |
| Node ID | ffe09ecd-7134-47b2-84b3-940ce0be621f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1184, 816 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- RepoMetaData + LLMresponse -> Filter Relevant Files (output 0, input 0)

**Outgoing Connections**

- Filter Relevant Files -> Download file contents (output 0, input 0)
- Filter Relevant Files -> Merge (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\n\nif (!items.length) {\n  throw new Error(\"No input items received.\");\n}\n\n// --------------------------------------\n// 1ï¸âƒ£ Merge repo + config safely\n// --------------------------------------\n\nlet merged = {};\nfor (const item of items) {\n  merged = { ...merged, ...item.json };\n}\n\nconst tree = merged.tree || [];\n\nif (!Array.isArray(tree)) {\n  throw new Error(\"Repo tree not found.\");\n}\n\n// --------------------------------------\n// 2ï¸âƒ£ Normalize Config Arrays\n// --------------------------------------\n\nfunction normalize(arr) {\n  return Array.isArray(arr)\n    ? arr.map(v =\u003e String(v).toLowerCase())\n    : [];\n}\n\nconst tierAConfigFiles = normalize(merged.tierAConfigFiles);\nconst ignoreFolders = normalize(merged.ignoreFolders);\nconst ignorePatterns = normalize(merged.ignorePatterns);\nconst codeExtensions = normalize(merged.codeExtensions);\n\n// --------------------------------------\n// 3ï¸âƒ£ Generic Helpers\n// --------------------------------------\n\nconst MAX_FILE_SIZE = 150000;\nconst MAX_FILES_PER_DIRECTORY = 25;\nconst directoryCounter = {};\n\nfunction getExtension(fileName) {\n  const parts = fileName.split(\".\");\n  return parts.length \u003e 1\n    ? parts.slice(1).join(\".\").toLowerCase()\n    : \"\";\n}\n\nfunction pathSegments(path) {\n  return path.toLowerCase().split(\"/\");\n}\n\nfunction matchesWildcard(value, pattern) {\n  const regex = new RegExp(\n    \"^\" +\n      pattern\n        .replace(/\\./g, \"\\\\.\")\n        .replace(/\\*/g, \".*\") +\n      \"$\",\n    \"i\"\n  );\n  return regex.test(value);\n}\n\nfunction isIgnored(path, fileName) {\n  const segments = pathSegments(path);\n\n  // Ignore folders (structural match)\n  if (segments.some(seg =\u003e ignoreFolders.includes(seg))) {\n    return true;\n  }\n\n  // Ignore wildcard patterns\n  if (ignorePatterns.some(p =\u003e matchesWildcard(fileName, p))) {\n    return true;\n  }\n\n  return false;\n}\n\n// --------------------------------------\n// 4ï¸âƒ£ Tier Detection (Generic)\n// --------------------------------------\n\nfunction detectTier(file) {\n  const path = file.path.toLowerCase();\n  const fileName = path.split(\"/\").pop();\n  const ext = getExtension(fileName);\n  const depth = pathSegments(path).length;\n\n  // Tier A â†’ Explicit config match\n  if (tierAConfigFiles.includes(fileName)) {\n    return \"A\";\n  }\n\n  // Tier A â†’ Root level config-like files\n  if (depth === 1 \u0026\u0026 ext === \"json\") {\n    return \"A\";\n  }\n\n  // Tier C â†’ Very deep + atomic-like files\n  if (depth \u003e 5) {\n    return \"C\";\n  }\n\n  // Tier B â†’ Default business logic\n  return \"B\";\n}\n\n// --------------------------------------\n// 5ï¸âƒ£ Generic Filtering Loop\n// --------------------------------------\n\nconst filtered = [];\n\nfor (const file of tree) {\n\n  if (!file || file.type !== \"blob\") continue;\n\n  if (file.size \u0026\u0026 file.size \u003e MAX_FILE_SIZE) continue;\n\n  const path = file.path.toLowerCase();\n  const fileName = path.split(\"/\").pop();\n  const ext = getExtension(fileName);\n\n  if (isIgnored(path, fileName)) continue;\n\n  const isConfig = tierAConfigFiles.includes(fileName);\n  const isCode = codeExtensions.includes(ext);\n\n  if (!isConfig \u0026\u0026 !isCode) continue;\n\n  const directoryKey = pathSegments(path).slice(0, 2).join(\"/\") || \"root\";\n\n  if (!directoryCounter[directoryKey]) {\n    directoryCounter[directoryKey] = 0;\n  }\n\n  if (directoryCounter[directoryKey] \u003e= MAX_FILES_PER_DIRECTORY) {\n    continue;\n  }\n\n  directoryCounter[directoryKey]++;\n\n  file.tier = detectTier(file);\n\n  filtered.push(file);\n}\n\n// --------------------------------------\n// 6ï¸âƒ£ Output\n// --------------------------------------\n\nreturn filtered.map(f =\u003e ({\n  json: {\n    owner: merged.owner,\n    repo: merged.repo,\n    branch: merged.branch,\n    repoSha: merged.sha,\n    tier: f.tier,\n    ...f\n  }\n}));\n"
}
```

### Folder Architecture Analyzer

| Field | Value |
| --- | --- |
| Node ID | 4f72d495-7801-4b2c-beb6-3dbb30c52f57 |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | 1040, 928 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Split folders in batches -> Folder Architecture Analyzer (output 1, input 0)

**Outgoing Connections**

- Folder Architecture Analyzer -> Normalize Folder Summary (output 0, input 0)

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
                    "value":  "gpt-4.1-mini",
                    "mode":  "list",
                    "cachedResultName":  "GPT-4.1-MINI"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "content":  "=Folder: {{$json.folder}}\nFile count: {{$json.files.length}}\n\nFiles:\n{{ $json.files.map(f =\u003e `File: ${f.path}\\nSummary: ${f.summary}`).join(\"\\n\\n\") }}\n"
                                     },
                                     {
                                         "role":  "system",
                                         "content":  "You are a senior software architect.\n\nYou are analyzing ONE logical folder of a repository.\n\nYou are given:\n- Folder name\n- File count\n- List of files with structured summaries (not raw code)\n\nBase your analysis strictly on the provided summaries.\nIf evidence is insufficient, state that explicitly.\n\nPerform static architectural inference only for this folder.\n\nInfer:\n- Architectural responsibility of this folder\n- Key components defined here\n- Internal patterns (state management, routing, business logic, etc.)\n- External APIs used in this folder\n- Dependencies on other layers\n\nSTRICT:\n- No hallucination\n- No assumptions without summary evidence\n- Do not infer global architecture\n- Analyze this folder in isolation\n- Return valid JSON only\n- Do not use markdown\n- Do not wrap in backticks\n- If file count is 0, return empty arrays and state that no evidence was available.\n- If response exceeds limit, compress instead of truncating.\n\nOutput JSON only in this schema:\n\n{\n  \"folder\": string,\n  \"architecturalSummary\": string,\n  \"detectedComponents\": [\n    {\n      \"name\": string,\n      \"responsibility\": string\n    }\n  ],\n  \"detectedAPIs\": [\n    {\n      \"name\": string,\n      \"evidence\": string\n    }\n  ],\n  \"layerDependencies\": string[]\n}\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  4000,
                    "temperature":  0.2,
                    "topP":  1
                }
}
```

### Generate HLD Binary

| Field | Value |
| --- | --- |
| Node ID | ee6112b5-8174-4935-b91a-d29f7f6eef05 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3344, 768 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Parse HLD JSON -> Generate HLD Binary (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const {\n  Document,\n  Packer,\n  Paragraph,\n  TextRun,\n  HeadingLevel,\n  AlignmentType,\n  TableOfContents,\n  Header,\n  Footer,\n  PageNumber,\n  BorderStyle\n} = require(\"docx\");\n\nconst items = $input.all();\nif (!items || items.length === 0) {\n  throw new Error(\"No input data received.\");\n}\n\nconst hld = items[0].json;\nif (!hld || hld.error) {\n  throw new Error(\"HLD generation failed or returned insufficient intelligence.\");\n}\n\nconst timestamp = new Date();\nconst formattedTime = timestamp.toLocaleString();\nconst repoName = (hld.systemType || \"System\").replace(/\\s+/g, \"_\");\nconst fileName = `HLD_${repoName}_${timestamp.toISOString().replace(/[:.]/g, \"-\")}.docx`;\n\nfunction safe(value, fallback = \"Not available\") {\n  return value ? value : fallback;\n}\n\nfunction bodyText(text) {\n  return safe(text)\n    .split(\"\\n\")\n    .map(line =\u003e\n      new Paragraph({\n        spacing: { after: 200 },\n        children: [\n          new TextRun({\n            text: line,\n            font: \"Calibri\",\n            size: 22\n          })\n        ],\n      })\n    );\n}\n\nfunction sectionDivider() {\n  return new Paragraph({\n    border: {\n      bottom: { style: BorderStyle.SINGLE, size: 6, color: \"DDDDDD\" },\n    },\n    spacing: { after: 300 },\n  });\n}\n\nconst children = [];\n\n//\n// COVER PAGE\n//\nchildren.push(\n  new Paragraph({\n    text: \"HIGH LEVEL DESIGN\",\n    heading: HeadingLevel.TITLE,\n    alignment: AlignmentType.CENTER,\n    spacing: { after: 300 },\n  })\n);\n\nchildren.push(\n  new Paragraph({\n    children: [\n      new TextRun({\n        text: repoName,\n        bold: true,\n        font: \"Calibri\",\n        size: 28,\n      }),\n    ],\n    alignment: AlignmentType.CENTER,\n    spacing: { after: 200 },\n  })\n);\n\nchildren.push(\n  new Paragraph({\n    children: [\n      new TextRun({\n        text: `Generated On: ${formattedTime}`,\n        italics: true,\n        font: \"Calibri\",\n        size: 22,\n      }),\n    ],\n    alignment: AlignmentType.CENTER,\n  })\n);\n\nchildren.push(new Paragraph({ pageBreakBefore: true }));\n\n//\n// TABLE OF CONTENTS\n//\nchildren.push(\n  new Paragraph({\n    text: \"Table of Contents\",\n    heading: HeadingLevel.HEADING_1,\n    spacing: { after: 200 },\n  })\n);\n\nchildren.push(\n  new TableOfContents(\"Table of Contents\", {\n    hyperlink: true,\n    headingStyleRange: \"1-3\",\n  })\n);\n\nchildren.push(new Paragraph({ pageBreakBefore: true }));\n\n//\n// SECTION TEMPLATE FUNCTION\n//\nfunction addSection(title, contentBuilder) {\n  children.push(\n    new Paragraph({\n      text: title,\n      heading: HeadingLevel.HEADING_1,\n      spacing: { before: 300, after: 200 },\n    })\n  );\n\n  contentBuilder();\n\n  children.push(sectionDivider());\n}\n\n//\n// 1. OVERVIEW\n//\naddSection(\"1. Overview\", () =\u003e {\n  children.push(...bodyText(hld.overview));\n});\n\n//\n// 2. MAJOR COMPONENTS\n//\naddSection(\"2. Major Components\", () =\u003e {\n  if (Array.isArray(hld.majorComponents) \u0026\u0026 hld.majorComponents.length \u003e 0) {\n    hld.majorComponents.forEach(comp =\u003e {\n      children.push(\n        new Paragraph({\n          text: safe(comp.name, \"Unnamed Component\"),\n          heading: HeadingLevel.HEADING_2,\n          spacing: { before: 200, after: 100 },\n        })\n      );\n      children.push(...bodyText(comp.description));\n    });\n  } else {\n    children.push(...bodyText(\"No major components identified.\"));\n  }\n});\n\n//\n// 3. EXTERNAL INTEGRATIONS\n//\naddSection(\"3. External Integrations\", () =\u003e {\n  if (Array.isArray(hld.externalIntegrations) \u0026\u0026 hld.externalIntegrations.length \u003e 0) {\n    hld.externalIntegrations.forEach(ext =\u003e {\n      children.push(\n        new Paragraph({\n          text: safe(ext.name, \"Unnamed Integration\"),\n          heading: HeadingLevel.HEADING_2,\n          spacing: { before: 200, after: 100 },\n        })\n      );\n      children.push(...bodyText(ext.purpose));\n    });\n  } else {\n    children.push(...bodyText(\"No external integrations identified.\"));\n  }\n});\n\n//\n// 4. DATA FLOW\n//\naddSection(\"4. Data Flow\", () =\u003e {\n  children.push(...bodyText(hld.dataFlow));\n});\n\n//\n// 5. ARCHITECTURAL PATTERNS\n//\naddSection(\"5. Architectural Patterns\", () =\u003e {\n  if (Array.isArray(hld.architecturePatterns) \u0026\u0026 hld.architecturePatterns.length \u003e 0) {\n    hld.architecturePatterns.forEach(pattern =\u003e {\n      children.push(\n        new Paragraph({\n          bullet: { level: 0 },\n          spacing: { after: 100 },\n          children: [\n            new TextRun({\n              text: pattern,\n              font: \"Calibri\",\n              size: 22,\n            }),\n          ],\n        })\n      );\n    });\n  } else {\n    children.push(...bodyText(\"No architectural patterns identified.\"));\n  }\n});\n\n//\n// 6. DEPLOYMENT\n//\naddSection(\"6. Deployment Considerations\", () =\u003e {\n  children.push(...bodyText(hld.deploymentConsiderations));\n});\n\n//\n// 7. MERMAID SOURCE\n//\naddSection(\"7. Architecture Diagram (Mermaid Source)\", () =\u003e {\n  children.push(\n    new Paragraph({\n      spacing: { after: 200 },\n      border: {\n        top: { style: BorderStyle.SINGLE, size: 4, color: \"CCCCCC\" },\n        bottom: { style: BorderStyle.SINGLE, size: 4, color: \"CCCCCC\" },\n        left: { style: BorderStyle.SINGLE, size: 4, color: \"CCCCCC\" },\n        right: { style: BorderStyle.SINGLE, size: 4, color: \"CCCCCC\" },\n      },\n      children: [\n        new TextRun({\n          text: safe(hld.mermaidDiagram),\n          font: \"Courier New\",\n          size: 20,\n        }),\n      ],\n    })\n  );\n});\n\n//\n// HEADER \u0026 FOOTER\n//\nconst header = new Header({\n  children: [\n    new Paragraph({\n      alignment: AlignmentType.RIGHT,\n      children: [\n        new TextRun({\n          text: `HLD - ${repoName}`,\n          font: \"Calibri\",\n          size: 20,\n        }),\n      ],\n    }),\n  ],\n});\n\nconst footer = new Footer({\n  children: [\n    new Paragraph({\n      alignment: AlignmentType.CENTER,\n      children: [\n        new TextRun({\n          text: \"Page \",\n          font: \"Calibri\",\n          size: 20,\n        }),\n        PageNumber.CURRENT,\n      ],\n    }),\n  ],\n});\n\n//\n// DOCUMENT CONFIG\n//\nconst doc = new Document({\n  sections: [\n    {\n      properties: {\n        page: {\n          margin: {\n            top: 1440,\n            right: 1440,\n            bottom: 1440,\n            left: 1440,\n          },\n        },\n      },\n      headers: { default: header },\n      footers: { default: footer },\n      children,\n    },\n  ],\n});\n\nconst buffer = await Packer.toBuffer(doc);\n\nreturn [\n  {\n    json: { fileName },\n    binary: {\n      data: {\n        data: buffer.toString(\"base64\"),\n        mimeType:\n          \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\",\n        fileName,\n      },\n    },\n  },\n];\n"
}
```

### Get full repo tree

| Field | Value |
| --- | --- |
| Node ID | 36fffbe8-fc95-402d-8d78-9d717d0f5116 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | -1808, 1088 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop Over Items -> Get full repo tree (output 1, input 0)

**Outgoing Connections**

- Get full repo tree -> Repo Structure Profiler (output 0, input 0)
- Get full repo tree -> Retain Repo Metadata (output 0, input 1)

**Credential References**

```json
{
    "httpHeaderAuth":  {
                           "id":  "ycIqw4aN68Yh1hjM",
                           "name":  "Github latest PAT token"
                       },
    "httpBearerAuth":  {
                           "id":  "nTi01UwbEgCFVIlW",
                           "name":  "Bearer Auth account"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "=https://api.github.com/repos/{{ $json.owner }}/{{$json.repo}}/git/trees/{{$json.branch}}?recursive=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpHeaderAuth",
    "sendHeaders":  true,
    "headerParameters":  {
                             "parameters":  [
                                                {
                                                    "name":  "Accept",
                                                    "value":  "application/vnd.github.v3+json"
                                                }
                                            ]
                         },
    "options":  {

                }
}
```

### Group by logical folder

| Field | Value |
| --- | --- |
| Node ID | cf35625b-47b2-4969-9acb-9229fff691db |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 592, 784 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop -> Group by logical folder (output 0, input 0)

**Outgoing Connections**

- Group by logical folder -> Split folders in batches (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\n\nfunction getLogicalGroup(path) {\n  if (!path) return \"unknown\";\n\n  const parts = path.split(\"/\");\n\n  // Root-level files (no folder)\n  if (parts.length === 1) {\n    return \"root\";\n  }\n\n  // Use first directory as logical group\n  return parts[0];\n}\n\nconst grouped = {};\n\nfor (const item of items) {\n  const path = item.json.path;\n  const summary = item.json.summary;\n\n  if (!path || !summary) continue;\n\n  const group = getLogicalGroup(path);\n\n  if (!grouped[group]) {\n    grouped[group] = [];\n  }\n\n  // Optional: cap files per folder (protect tokens)\n  if (grouped[group].length \u003c 25) {\n    grouped[group].push({\n      path,\n      summary\n    });\n  }\n}\n\nreturn Object.keys(grouped).map(folder =\u003e ({\n  json: {\n    folder,\n    files: grouped[folder]\n  }\n}));\n"
}
```

### HLD Generator

| Field | Value |
| --- | --- |
| Node ID | e9627140-40bf-4acc-b7dd-c591a999df91 |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | 2576, 768 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize System Architecture -> HLD Generator (output 0, input 0)

**Outgoing Connections**

- HLD Generator -> Extract HLD JSON String (output 0, input 0)

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
                    "value":  "gpt-4.1-mini",
                    "mode":  "list",
                    "cachedResultName":  "GPT-4.1-MINI"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "role":  "system",
                                         "content":  "You are a principal software architect specializing in reverse-engineering architecture from source code intelligence.\n\nYou must:\n\n- Produce a High Level Design (HLD)\n- Base all reasoning strictly on provided evidence\n- Never hallucinate missing layers or components\n- Never invent infrastructure or business context\n- Only describe what can be inferred\n\nSTRICT OUTPUT RULES:\n- Return valid JSON only\n- No markdown\n- No explanation outside JSON\n- Mermaid syntax must be valid\n- Do not wrap Mermaid in backticks\n\nIf input JSON is empty or incomplete, return:\n{\n  \"error\": \"Insufficient architectural intelligence\"\n}\n\nOutput schema:\n\n{\n  \"overview\": \"\",\n  \"majorComponents\": [\n    {\n      \"name\": \"\",\n      \"description\": \"\"\n    }\n  ],\n  \"externalIntegrations\": [\n    {\n      \"name\": \"\",\n      \"purpose\": \"\"\n    }\n  ],\n  \"dataFlow\": \"\",\n  \"architecturePatterns\": [],\n  \"deploymentConsiderations\": \"\",\n  \"mermaidDiagram\": \"\"\n}\n"
                                     },
                                     {
                                         "content":  "=You are provided structured system intelligence extracted from source code.\n\nYour task is to generate a High Level Design (HLD) document strictly based on the provided data.\n\nINPUT DATA:\n\nSystem Architecture:\n{{ JSON.stringify($node[\"Normalize System Architecture\"].json) }}\n\nFolder Intelligence:\n{{ JSON.stringify($node[\"Aggregate Repo Intelligence\"].json) }}\n\nANALYSIS INSTRUCTIONS:\n\n1. Identify major logical layers (UI, Application, Domain, Infrastructure) only if supported by evidence.\n2. Identify key subsystems and responsibilities.\n3. Extract external integrations from detected APIs and dependencies.\n4. Describe component-level data flow.\n5. Infer architectural patterns only if clearly supported (e.g., layered, modular, micro-frontend, etc.).\n6. Provide deployment considerations only if frameworks/tools strongly suggest them.\n7. Generate a Mermaid component diagram reflecting actual components and integrations.\n8. Use generic but accurate naming if specific names are not clearly defined.\n\nIf evidence is insufficient for any section, state that explicitly.\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  2500,
                    "temperature":  0.2,
                    "topP":  1
                }
}
```

### If

| Field | Value |
| --- | --- |
| Node ID | 392ba665-ac9f-4849-8a1a-10faa2f7e968 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | -192, 944 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop -> If (output 1, input 0)

**Outgoing Connections**

- If -> File Structure Summarizer (output 0, input 0)
- If -> Loop (output 1, input 0)

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
                                       "version":  2
                                   },
                       "conditions":  [
                                          {
                                              "id":  "6fd5d504-34ba-4989-9e27-cee665fcf6e6",
                                              "leftValue":  "={{$json.tier}}",
                                              "rightValue":  "C",
                                              "operator":  {
                                                               "type":  "string",
                                                               "operation":  "notEquals"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Loop

| Field | Value |
| --- | --- |
| Node ID | 20073440-9629-4742-a166-4a7a4d615b63 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -336, 800 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize File Summary -> Loop (output 0, input 0)
- Extract content & Path -> Loop (output 0, input 0)
- If -> Loop (output 1, input 0)

**Outgoing Connections**

- Loop -> Group by logical folder (output 0, input 0)
- Loop -> If (output 1, input 0)

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

### Loop Over Items

| Field | Value |
| --- | --- |
| Node ID | 6f10f729-0a8c-4469-a77e-3475f8c1cc65 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -1984, 944 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Define Github Repositories -> Loop Over Items (output 0, input 0)
- Parse LLM Response -> Loop Over Items (output 0, input 0)

**Outgoing Connections**

- Loop Over Items -> RepoMetaData + LLMresponse (output 0, input 1)
- Loop Over Items -> Get full repo tree (output 1, input 0)

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

### Merge

| Field | Value |
| --- | --- |
| Node ID | 0e4c2316-816d-4bbf-845f-5822a9373eb2 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -768, 800 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Download file contents -> Merge (output 0, input 0)
- Filter Relevant Files -> Merge (output 0, input 1)

**Outgoing Connections**

- Merge -> Extract content & Path (output 0, input 0)

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

### Normalize File Summary

| Field | Value |
| --- | --- |
| Node ID | 224f50a2-33db-4009-baf8-fd2400917719 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 400, 960 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- File Structure Summarizer -> Normalize File Summary (output 0, input 0)

**Outgoing Connections**

- Normalize File Summary -> Loop (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\n\nreturn items.map(item =\u003e {\n  const rawText = item.json.output?.[0]?.content?.[0]?.text;\n\n  if (!rawText) {\n    return { json: { error: \"No summary returned\" } };\n  }\n\n  let parsed;\n\n  try {\n    parsed = JSON.parse(rawText);\n  } catch (e) {\n    return { json: { error: \"Invalid JSON from LLM\", raw: rawText } };\n  }\n\n  return {\n    json: {\n      path: parsed.path,\n      summary: parsed.summary\n    }\n  };\n});\n"
}
```

### Normalize Folder Summary

| Field | Value |
| --- | --- |
| Node ID | 690594fb-5af8-4236-a931-f5f6506801c2 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1344, 928 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Folder Architecture Analyzer -> Normalize Folder Summary (output 0, input 0)

**Outgoing Connections**

- Normalize Folder Summary -> Split folders in batches (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const rawText = $json.output?.[0]?.content?.[0]?.text;\n\nif (!rawText) {\n  return [{ json: { error: \"No folder analysis returned\" } }];\n}\n\nlet parsed;\n\ntry {\n  parsed = JSON.parse(rawText);\n} catch (e) {\n  return [{ json: { error: \"Invalid JSON from Folder Analyzer\", raw: rawText } }];\n}\n\nreturn [{ json: parsed }];\n"
}
```

### Normalize System Architecture

| Field | Value |
| --- | --- |
| Node ID | 5d856d5d-45ff-43c6-8977-bc956d5857b6 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2368, 768 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- System Architecture Synthesizer -> Normalize System Architecture (output 0, input 0)

**Outgoing Connections**

- Normalize System Architecture -> HLD Generator (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const rawText = $json.output?.[0]?.content?.[0]?.text;\n\nif (!rawText) {\n  return [{ json: { error: \"No system architecture returned\" } }];\n}\n\nlet parsed;\n\ntry {\n  parsed = JSON.parse(rawText);\n} catch (e) {\n  return [{ json: { error: \"Invalid JSON from System Synthesizer\", raw: rawText } }];\n}\n\nreturn [{ json: parsed }];\n"
}
```

### Parse HLD JSON

| Field | Value |
| --- | --- |
| Node ID | af86d49f-f8c5-4454-b4ad-8501babfca9d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3136, 768 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Extract HLD JSON String -> Parse HLD JSON (output 0, input 0)

**Outgoing Connections**

- Parse HLD JSON -> Generate HLD Binary (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const raw = items[0].json.rawHldJson;\n\nlet parsed;\n\ntry {\n  parsed = JSON.parse(raw);\n} catch (err) {\n  throw new Error(\"HLD JSON parsing failed. Output likely truncated.\");\n}\n\nreturn [\n  {\n    json: parsed\n  }\n];\n"
}
```

### Parse LLM Response

| Field | Value |
| --- | --- |
| Node ID | 4401c9b9-4eea-4f4a-b622-a5218820736e |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1072, 1088 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Dynamic Files/Folders Filtering -> Parse LLM Response (output 0, input 0)

**Outgoing Connections**

- Parse LLM Response -> Loop Over Items (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// ==========================================\n// 1ï¸âƒ£ Extract raw LLM text safely\n// ==========================================\nconst rawText =\n  $json.output?.[0]?.content?.[0]?.text || \"\";\n\nif (!rawText) {\n  throw new Error(\"Empty LLM response.\");\n}\n\n// ==========================================\n// 2ï¸âƒ£ Remove Markdown + Comments\n// ==========================================\nlet cleaned = rawText\n  .replace(/```json/gi, \"\")\n  .replace(/```/g, \"\")\n  .trim()\n  // Remove block comments /* ... */\n  .replace(/\\/\\*[\\s\\S]*?\\*\\//g, \"\")\n  // Remove line comments //\n  .replace(/\\/\\/.*$/gm, \"\");\n\n// ==========================================\n// 3ï¸âƒ£ Extract JSON block safely\n// ==========================================\nconst jsonMatch = cleaned.match(/\\{[\\s\\S]*\\}/);\n\nif (!jsonMatch) {\n  throw new Error(\"No valid JSON object found in LLM output.\");\n}\n\nlet parsed;\n\ntry {\n  parsed = JSON.parse(jsonMatch[0]);\n} catch (err) {\n  throw new Error(\n    \"Failed to parse cleaned LLM JSON: \" + err.message\n  );\n}\n\n// ==========================================\n// 4ï¸âƒ£ Normalize + Clean Arrays\n// ==========================================\nfunction normalizeArray(value) {\n  if (!value) return [];\n  if (Array.isArray(value)) return value;\n  if (typeof value === \"string\") return [value];\n  return [];\n}\n\n// Remove invalid / noisy entries\nfunction cleanArray(arr) {\n  return [\n    ...new Set(\n      arr\n        .map(v =\u003e String(v).trim())\n        .filter(v =\u003e\n          v \u0026\u0026\n          !v.toLowerCase().includes(\"lint and formatting\") \u0026\u0026\n          !v.includes(\":\") // remove accidental explanation strings\n        )\n    )\n  ];\n}\n\nconst tierAConfigFiles = cleanArray(\n  normalizeArray(parsed.tierAConfigFiles)\n);\n\nconst ignoreFolders = cleanArray(\n  normalizeArray(parsed.ignoreFolders)\n);\n\nconst ignorePatterns = cleanArray(\n  normalizeArray(parsed.ignorePatterns)\n);\n\nconst codeExtensions = cleanArray(\n  normalizeArray(parsed.codeExtensions)\n);\n\n// ==========================================\n// 5ï¸âƒ£ Final Output (Stable Structure)\n// ==========================================\nreturn [\n  {\n    json: {\n      tierAConfigFiles,\n      ignoreFolders,\n      ignorePatterns,\n      codeExtensions,\n\n      counts: {\n        tierAConfigFiles: tierAConfigFiles.length,\n        ignoreFolders: ignoreFolders.length,\n        ignorePatterns: ignorePatterns.length,\n        codeExtensions: codeExtensions.length\n      }\n    }\n  }\n];\n"
}
```

### Repo Structure Profiler

| Field | Value |
| --- | --- |
| Node ID | f171735f-6b5d-4a03-96af-dc4babbc8ae9 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1584, 1088 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get full repo tree -> Repo Structure Profiler (output 0, input 0)

**Outgoing Connections**

- Repo Structure Profiler -> Dynamic Files/Folders Filtering (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const tree = $json.tree || [];\n\n// ===============================\n// DATA STRUCTURES\n// ===============================\nconst extensions = new Set();\nconst folders = new Set();\nconst fileNames = new Set();\n\nconst extensionFrequency = {};\nconst folderFileCount = {};\nconst unmatchedPaths = [];\n\nlet totalTreeItems = tree.length;\nlet totalBlobs = 0;\nlet skippedNonBlobs = 0;\nlet filesWithoutExtension = 0;\nlet rootLevelFiles = 0;\n\nlet minFileSize = Number.MAX_SAFE_INTEGER;\nlet maxFileSize = 0;\nlet totalFileSize = 0;\n\nlet maxDepth = 0;\n\n// ===============================\n// MAIN TRAVERSAL LOOP\n// ===============================\nfor (const file of tree) {\n\n  if (!file || file.type !== \"blob\") {\n    skippedNonBlobs++;\n    continue;\n  }\n\n  totalBlobs++;\n\n  const filePath = file.path || \"\";\n  const fileSize = file.size || 0;\n\n  // -------------------------------\n  // FILE SIZE STATS\n  // -------------------------------\n  minFileSize = Math.min(minFileSize, fileSize);\n  maxFileSize = Math.max(maxFileSize, fileSize);\n  totalFileSize += fileSize;\n\n  // -------------------------------\n  // DEPTH ANALYSIS\n  // -------------------------------\n  const parts = filePath.split(\"/\").filter(Boolean);\n  maxDepth = Math.max(maxDepth, parts.length);\n\n  // -------------------------------\n  // EXTENSION DETECTION\n  // More robust regex (avoids folder dot confusion)\n  // -------------------------------\n  const match = filePath.match(/\\.([^.\\/]+)$/);\n\n  if (match) {\n    const ext = match[1].toLowerCase();\n    extensions.add(ext);\n\n    extensionFrequency[ext] = (extensionFrequency[ext] || 0) + 1;\n  } else {\n    filesWithoutExtension++;\n    unmatchedPaths.push(filePath);\n  }\n\n  // -------------------------------\n  // FOLDER DETECTION\n  // -------------------------------\n  if (parts.length \u003e 1) {\n    const topFolder = parts[0];\n    folders.add(topFolder);\n\n    folderFileCount[topFolder] =\n      (folderFileCount[topFolder] || 0) + 1;\n  } else {\n    rootLevelFiles++;\n  }\n\n  // -------------------------------\n  // FILE NAME CAPTURE\n  // -------------------------------\n  const name = parts[parts.length - 1] || \"\";\n  fileNames.add(name);\n}\n\n// ===============================\n// FINAL STAT CALCULATIONS\n// ===============================\nconst avgFileSize =\n  totalBlobs \u003e 0\n    ? Math.round(totalFileSize / totalBlobs)\n    : 0;\n\nif (minFileSize === Number.MAX_SAFE_INTEGER) {\n  minFileSize = 0;\n}\n\n// ===============================\n// RETURN STRUCTURED OUTPUT\n// ===============================\nreturn [{\n  json: {\n\n    // ----------------------------------\n    // STRUCTURAL DATA (LLM INPUT)\n    // ----------------------------------\n    extensions: Array.from(extensions),\n    folders: Array.from(folders),\n    sampleFileNames: Array.from(fileNames).slice(0, 200),\n\n    extensionFrequency,\n    folderFileCount,\n\n    // ----------------------------------\n    // DIAGNOSTIC + VALIDATION DATA\n    // ----------------------------------\n    traversalStats: {\n      totalTreeItems,\n      totalBlobsProcessed: totalBlobs,\n      skippedNonBlobItems: skippedNonBlobs,\n      filesWithoutExtension,\n      rootLevelFiles,\n      uniqueExtensionCount: extensions.size,\n      uniqueFolderCount: folders.size,\n      uniqueFileNameCount: fileNames.size,\n      minFileSize,\n      maxFileSize,\n      avgFileSize,\n      maxFolderDepth: maxDepth\n    },\n\n    // Only return first 50 unmatched to avoid payload explosion\n    unmatchedPaths: unmatchedPaths.slice(0, 50),\n    // ----------------------------------\n    // INCLUDE FULL REPO TREE\n    // ----------------------------------\n    //fullRepoTree: tree\n  }\n}];\n"
}
```

### RepoMetaData + LLMresponse

| Field | Value |
| --- | --- |
| Node ID | fe5c38a7-b78d-4c55-9a5a-a8671045b31c |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -1392, 912 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop Over Items -> RepoMetaData + LLMresponse (output 0, input 1)
- Retain Repo Metadata -> RepoMetaData + LLMresponse (output 0, input 0)

**Outgoing Connections**

- RepoMetaData + LLMresponse -> Filter Relevant Files (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Retain Repo Metadata

| Field | Value |
| --- | --- |
| Node ID | 3dcbf0e1-3189-4984-b58e-17db9b88fa0f |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -1632, 800 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get full repo tree -> Retain Repo Metadata (output 0, input 1)
- Define Github Repositories -> Retain Repo Metadata (output 0, input 0)

**Outgoing Connections**

- Retain Repo Metadata -> RepoMetaData + LLMresponse (output 0, input 0)

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
                    "includeUnpaired":  false
                }
}
```

### Split folders in batches

| Field | Value |
| --- | --- |
| Node ID | a8f273f4-4902-4890-84f1-35463a220b11 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | 880, 784 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Group by logical folder -> Split folders in batches (output 0, input 0)
- Normalize Folder Summary -> Split folders in batches (output 0, input 0)

**Outgoing Connections**

- Split folders in batches -> Aggregate folder summaries (output 0, input 0)
- Split folders in batches -> Folder Architecture Analyzer (output 1, input 0)

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

### System Architecture Synthesizer

| Field | Value |
| --- | --- |
| Node ID | 5d5c29d6-e8dc-40af-b59d-b26b434cc45a |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | 2016, 768 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Aggregate Repo Intelligence -> System Architecture Synthesizer (output 0, input 0)

**Outgoing Connections**

- System Architecture Synthesizer -> Normalize System Architecture (output 0, input 0)

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
                    "value":  "gpt-4.1-mini",
                    "mode":  "list",
                    "cachedResultName":  "GPT-4.1-MINI"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "role":  "system",
                                         "content":  "You are a principal software architect.\n\nYou are given structured folder-level architectural analysis of a software repository.\n\nYour task is to infer the overall system architecture strictly from provided evidence.\n\nSTRICT RULES:\n- Base conclusions only on provided folder summaries\n- Do not hallucinate business context\n- If evidence is insufficient, explicitly state it\n- Do not assume repository name or ownership\n- Return valid JSON only\n- No markdown\n- No backticks\n\nReturn JSON in this schema:\n\n{\n  \"systemType\": \"\",\n  \"architectureStyle\": \"\",\n  \"majorComponents\": [\n    {\n      \"name\": \"\",\n      \"responsibility\": \"\",\n      \"evidence\": \"\",\n      \"interactsWith\": []\n    }\n  ],\n  \"dataFlowSummary\": \"\",\n  \"externalIntegrations\": [],\n  \"technologyStack\": [],\n  \"architecturalPatterns\": [],\n  \"observabilityMechanisms\": [],\n  \"testingStrategy\": \"\",\n  \"confidenceLevel\": \"\"\n}\n"
                                     },
                                     {
                                         "content":  "=Folder Intelligence:\n{{ JSON.stringify($json.folders) }}\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {

                }
}
```

### When clicking â€˜Execute workflowâ€™

| Field | Value |
| --- | --- |
| Node ID | 37cb23c3-7da7-44cf-b90b-d6ca83853514 |
| Type | n8n-nodes-base.manualTrigger |
| Type Version | 1 |
| Position | -2464, 784 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- When clicking â€˜Execute workflowâ€™ -> Define Github Repositories (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```
