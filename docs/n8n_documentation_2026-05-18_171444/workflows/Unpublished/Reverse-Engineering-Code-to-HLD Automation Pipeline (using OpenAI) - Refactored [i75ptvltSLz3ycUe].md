# Reverse-Engineering-Code-to-HLD Automation Pipeline (using OpenAI) - Refactored

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | i75ptvltSLz3ycUe |
| Active | False |
| Archived | False |
| Created At | 2026-02-18T08:08:15.491Z |
| Updated At | 2026-02-18T11:14:08.260Z |
| Node Count | 31 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Reverse-Engineering-Code-to-HLD Automation Pipeline (using OpenAI) - Refactored [i75ptvltSLz3ycUe].json |

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
| n8n-nodes-base.code | 14 |
| n8n-nodes-base.httpRequest | 3 |
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
- https://api.github.com/repos/{{$json.owner}}/{{$json.repo}}/branches/{{$json.branch}}
- https://raw.githubusercontent.com/{{$json.owner}}/{{$json.repo}}/{{$json.branch}}/{{$json.path}}

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- Get full repo tree1 -> Code in JavaScript (source output 0, target input 0)
- Code in JavaScript -> Get full repo tree (source output 0, target input 0)
- Parse LLM Response -> Loop Over Items (source output 0, target input 0)
- Dynamic Files/Folders Filtering -> Parse LLM Response (source output 0, target input 0)
- Repo Structure Profiler -> Dynamic Files/Folders Filtering (source output 0, target input 0)
- RepoMetaData + LLMresponse -> Filter Relevant Files (source output 0, target input 0)
- If -> File Structure Summarizer (source output 0, target input 0)
- If -> Loop (source output 1, target input 0)
- Extract HLD JSON String -> Parse HLD JSON (source output 0, target input 0)
- Parse HLD JSON -> Generate HLD Binary (source output 0, target input 0)
- HLD Generator -> Extract HLD JSON String (source output 0, target input 0)
- Normalize System Architecture -> HLD Generator (source output 0, target input 0)
- System Architecture Synthesizer -> Normalize System Architecture (source output 0, target input 0)
- Aggregate Repo Intelligence -> System Architecture Synthesizer (source output 0, target input 0)
- Normalize Folder Summary -> Split folders in batches (source output 0, target input 0)
- Loop -> Group by logical folder (source output 0, target input 0)
- Loop -> If (source output 1, target input 0)
- Folder Architecture Analyzer -> Normalize Folder Summary (source output 0, target input 0)
- File Structure Summarizer -> Normalize File Summary (source output 0, target input 0)
- Normalize File Summary -> Loop (source output 0, target input 0)
- Retain Repo Metadata -> RepoMetaData + LLMresponse (source output 0, target input 0)
- Loop Over Items -> RepoMetaData + LLMresponse (source output 0, target input 1)
- Loop Over Items -> Get full repo tree1 (source output 1, target input 0)
- Define Github Repositories -> Retain Repo Metadata (source output 0, target input 0)
- Define Github Repositories -> Loop Over Items (source output 0, target input 0)
- Split folders in batches -> Aggregate folder summaries (source output 0, target input 0)
- Split folders in batches -> Folder Architecture Analyzer (source output 1, target input 0)
- Aggregate folder summaries -> Aggregate Repo Intelligence (source output 0, target input 0)
- Extract content & Path -> Loop (source output 0, target input 0)
- Merge -> Extract content & Path (source output 0, target input 0)
- Group by logical folder -> Split folders in batches (source output 0, target input 0)
- Filter Relevant Files -> Merge (source output 0, target input 1)
- Filter Relevant Files -> Download file contents (source output 0, target input 0)
- Get full repo tree -> Retain Repo Metadata (source output 0, target input 1)
- Get full repo tree -> Repo Structure Profiler (source output 0, target input 0)
- Download file contents -> Merge (source output 0, target input 0)
- When clicking â€˜Execute workflowâ€™ -> Define Github Repositories (source output 0, target input 0)

## Nodes

### Aggregate folder summaries

| Field | Value |
| --- | --- |
| Node ID | 71601cb9-69bc-402f-ba6e-a78b2469c037 |
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
| Node ID | 42dd32ed-cdc3-4bc9-b462-bf038646c850 |
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

### Code in JavaScript

| Field | Value |
| --- | --- |
| Node ID | aec6f59b-ca33-4466-8cb8-c815da4117d5 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -2256, 1120 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get full repo tree1 -> Code in JavaScript (output 0, input 0)

**Outgoing Connections**

- Code in JavaScript -> Get full repo tree (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [\n  {\n    json: {\n      ...$json,\n      treeSha: $json.commit.commit.tree.sha\n    }\n  }\n];\n"
}
```

### Define Github Repositories

| Field | Value |
| --- | --- |
| Node ID | 57745654-0cd2-41af-a3b1-691a59438808 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -2944, 784 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- When clicking â€˜Execute workflowâ€™ -> Define Github Repositories (output 0, input 0)

**Outgoing Connections**

- Define Github Repositories -> Retain Repo Metadata (output 0, input 0)
- Define Github Repositories -> Loop Over Items (output 0, input 0)

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
| Node ID | 8de327c1-728d-4f38-97ff-60a0d448622c |
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
| Node ID | 79e6baed-9ef1-4769-9164-e5b78623d0dd |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2.1 |
| Position | -1552, 1120 |
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
                    "value":  "gpt-5-mini",
                    "mode":  "list",
                    "cachedResultName":  "GPT-5-MINI"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "role":  "system",
                                         "content":  "You are a senior software architect.\n\nYou are analyzing repository structure metadata.\n\nYour task:\nBased on file extensions, folder names, and sample file names,\ninfer intelligent filtering rules for architectural reverse engineering.\n\nSTRICT RULES:\n- Do not hallucinate files not present\n- Base decisions only on provided structure\n- Infer typical config files based on patterns\n- Infer test folders and build artifacts\n- Infer code file extensions relevant for architecture understanding\n- Return ONLY strict JSON.\n- Do NOT include comments.\n- Do NOT include explanations.\n- Do NOT include markdown fences.\n- JSON must be valid and parsable.\n- If an item is not explicitly supported by the provided data, exclude it.\n- Do not guess typical framework defaults unless visible in extensions or file names.\n- Do not add common ignores unless observed in input.\n\nReturn JSON only in this schema:\n\n{\n  \"tierAConfigFiles\": [],\n  \"ignoreFolders\": [],\n  \"ignorePatterns\": [],\n  \"codeExtensions\": []\n}\n"
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
| Node ID | 74b64607-ccf7-44d3-a7ad-abbc7985a491 |
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
| Node ID | a0169a51-588e-44f7-b2e4-9aa961461f57 |
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
    "jsCode":  "return [{ json: $json }];"
}
```

### File Structure Summarizer

| Field | Value |
| --- | --- |
| Node ID | 2f2e2264-7982-4521-a310-a889f3b8c75c |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | 64, 960 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
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
                    "value":  "gpt-5-mini",
                    "mode":  "list",
                    "cachedResultName":  "GPT-5-MINI"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "content":  "=File: {{$json.path}}\n\nCode:\n{{$json.content.slice(0,4000)}}\n"
                                     },
                                     {
                                         "role":  "system",
                                         "content":  "You are a senior software engineer.\n\nAnalyze ONE file and summarize in 5-8 bullet points:\n- What this file does\n- Key propose\n- External libraries used (if any)\n- Architectural role\n\nBe concise.\nNo hallucination.\nNo code repetition.\n\nRULES:\n- Be 5â€“8 bullet points\n- Each bullet must start with \"- \"\n- No paragraph text\n- No markdown\n- No code blocks\n- No extra explanations\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  350,
                    "textFormat":  {
                                       "textOptions":  {
                                                           "type":  "json_schema",
                                                           "schema":  "{\n  \"type\": \"object\",\n  \"additionalProperties\": false,\n  \"required\": [\n    \"path\",\n    \"summary\"\n  ],\n  \"properties\": {\n    \"path\": {\n      \"type\": \"string\",\n      \"description\": \"File path within the repository\"\n    },\n    \"summary\": {\n      \"type\": \"string\",\n      \"description\": \"Concise architectural or functional summary of the file\"\n    }\n  }\n}\n"
                                                       }
                                   }
                }
}
```

### Filter Relevant Files

| Field | Value |
| --- | --- |
| Node ID | 6b8bc622-2399-4c36-a06d-77c6eee2be23 |
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

- Filter Relevant Files -> Merge (output 0, input 1)
- Filter Relevant Files -> Download file contents (output 0, input 0)

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
| Node ID | befb7b21-c248-486d-a8eb-f660cb0f60ae |
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
                    "value":  "gpt-5.1",
                    "mode":  "list",
                    "cachedResultName":  "GPT-5.1"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "content":  "=Folder: {{$json.folder}}\nFile count: {{$json.files.length}}\n\nFiles:\n{{ $json.files.map(f =\u003e `File: ${f.path}\\nSummary: ${f.summary}`).join(\"\\n\\n\") }}\n"
                                     },
                                     {
                                         "role":  "system",
                                         "content":  "You are a senior software architect.\n\nYou are analyzing ONE logical folder of a repository.\n\nYou are given:\n- Folder name\n- File count\n- List of files with structured summaries (not raw code)\n\nBase your analysis strictly on the provided summaries.\nIf evidence is insufficient, state that explicitly.\n\nPerform static architectural inference only for this folder.\n\nInfer:\n- Architectural responsibility of this folder\n- Key components defined here\n- Internal patterns (state management, routing, business logic, etc.)\n- External APIs used in this folder\n- Dependencies on other layers\n\nSTRICT:\n- No hallucination\n- No assumptions without summary evidence\n- Do not infer global architecture\n- Analyze this folder in isolation\n- Return valid JSON only\n- Do not use markdown\n- Do not wrap in backticks\n- If file count is 0, return empty arrays and state that no evidence was available.\n- If response exceeds limit, compress instead of truncating.\n\nOutput JSON only in this schema:\n\n\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  4000,
                    "textFormat":  {
                                       "textOptions":  {
                                                           "type":  "json_schema",
                                                           "name":  "my_schema_2",
                                                           "schema":  "{\n  \"type\": \"object\",\n  \"additionalProperties\": false,\n  \"required\": [\n    \"folder\",\n    \"architecturalSummary\",\n    \"detectedComponents\",\n    \"detectedAPIs\",\n    \"layerDependencies\"\n  ],\n  \"properties\": {\n    \"folder\": {\n      \"type\": \"string\",\n      \"description\": \"Name or path of the folder being analyzed\"\n    },\n    \"architecturalSummary\": {\n      \"type\": \"string\",\n      \"description\": \"High-level architectural summary of this folder\"\n    },\n    \"detectedComponents\": {\n      \"type\": \"array\",\n      \"description\": \"List of components detected inside the folder\",\n      \"items\": {\n        \"type\": \"object\",\n        \"additionalProperties\": false,\n        \"required\": [\"name\", \"responsibility\"],\n        \"properties\": {\n          \"name\": {\n            \"type\": \"string\",\n            \"description\": \"Component name\"\n          },\n          \"responsibility\": {\n            \"type\": \"string\",\n            \"description\": \"What this component is responsible for\"\n          }\n        }\n      }\n    },\n    \"detectedAPIs\": {\n      \"type\": \"array\",\n      \"description\": \"APIs detected inside this folder\",\n      \"items\": {\n        \"type\": \"object\",\n        \"additionalProperties\": false,\n        \"required\": [\"name\", \"evidence\"],\n        \"properties\": {\n          \"name\": {\n            \"type\": \"string\",\n            \"description\": \"API name\"\n          },\n          \"evidence\": {\n            \"type\": \"string\",\n            \"description\": \"Code-level evidence or file reference proving API existence\"\n          }\n        }\n      }\n    },\n    \"layerDependencies\": {\n      \"type\": \"array\",\n      \"description\": \"Architectural layers or folders this folder depends on\",\n      \"items\": {\n        \"type\": \"string\"\n      }\n    }\n  }\n}\n"
                                                       }
                                   }
                }
}
```

### Generate HLD Binary

| Field | Value |
| --- | --- |
| Node ID | bf8d0322-cff9-4e33-9206-8643eb1fafd3 |
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
| Node ID | 658eb9f4-f040-45e3-abb7-e65379f4ef89 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | -2016, 1120 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Code in JavaScript -> Get full repo tree (output 0, input 0)

**Outgoing Connections**

- Get full repo tree -> Retain Repo Metadata (output 0, input 1)
- Get full repo tree -> Repo Structure Profiler (output 0, input 0)

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
    "url":  "=https://api.github.com/repos/{{ $(\u0027Define Github Repositories\u0027).item.json.owner }}/{{ $(\u0027Define Github Repositories\u0027).item.json.repo }}/git/trees/{{$json.treeSha}}?recursive=1",
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

### Get full repo tree1

| Field | Value |
| --- | --- |
| Node ID | 0efa2a29-6ed7-4832-8da3-8a400a207f8b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | -2480, 1120 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop Over Items -> Get full repo tree1 (output 1, input 0)

**Outgoing Connections**

- Get full repo tree1 -> Code in JavaScript (output 0, input 0)

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
    "url":  "=https://api.github.com/repos/{{$json.owner}}/{{$json.repo}}/branches/{{$json.branch}}",
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
| Node ID | 402168f1-faa9-4687-891c-f077f351a68f |
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
| Node ID | ffbf9f58-c987-48f3-9990-a29a93f88619 |
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
                    "value":  "gpt-5.1",
                    "mode":  "list",
                    "cachedResultName":  "GPT-5.1"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "role":  "system",
                                         "content":  "You are a principal software architect specializing in reverse-engineering architecture from source code intelligence.\n\nYou must:\n\n- Produce a High Level Design (HLD)\n- Base all reasoning strictly on provided evidence\n- Never hallucinate missing layers or components\n- Never invent infrastructure or business context\n- Only describe what can be inferred\n\nSTRICT OUTPUT RULES:\n- Return as per defined JSON schema\n- No markdown\n- No explanation outside JSON\n- Mermaid syntax must be valid\n- Do not wrap Mermaid in backticks\n- Do not fabricate deployment tools or cloud providers.\n- Do not assume containerization unless directly observed."
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
                    "textFormat":  {
                                       "textOptions":  {
                                                           "type":  "json_schema",
                                                           "name":  "my_schema-4",
                                                           "schema":  "{\n  \"type\": \"object\",\n  \"additionalProperties\": false,\n  \"required\": [\n    \"overview\",\n    \"majorComponents\",\n    \"externalIntegrations\",\n    \"dataFlow\",\n    \"architecturePatterns\",\n    \"deploymentConsiderations\",\n    \"mermaidDiagram\"\n  ],\n  \"properties\": {\n    \"overview\": {\n      \"type\": \"string\",\n      \"description\": \"High-level architectural overview of the system\"\n    },\n    \"majorComponents\": {\n      \"type\": \"array\",\n      \"description\": \"Core architectural components of the system\",\n      \"items\": {\n        \"type\": \"object\",\n        \"additionalProperties\": false,\n        \"required\": [\"name\", \"description\"],\n        \"properties\": {\n          \"name\": {\n            \"type\": \"string\",\n            \"description\": \"Component name\"\n          },\n          \"description\": {\n            \"type\": \"string\",\n            \"description\": \"Responsibility and role of the component\"\n          }\n        }\n      }\n    },\n    \"externalIntegrations\": {\n      \"type\": \"array\",\n      \"description\": \"External systems or services the application interacts with\",\n      \"items\": {\n        \"type\": \"object\",\n        \"additionalProperties\": false,\n        \"required\": [\"name\", \"purpose\"],\n        \"properties\": {\n          \"name\": {\n            \"type\": \"string\",\n            \"description\": \"External service name\"\n          },\n          \"purpose\": {\n            \"type\": \"string\",\n            \"description\": \"Why the integration exists\"\n          }\n        }\n      }\n    },\n    \"dataFlow\": {\n      \"type\": \"string\",\n      \"description\": \"Narrative description of how data moves through the system\"\n    },\n    \"architecturePatterns\": {\n      \"type\": \"array\",\n      \"description\": \"Architectural or design patterns detected in the system\",\n      \"items\": {\n        \"type\": \"string\"\n      }\n    },\n    \"deploymentConsiderations\": {\n      \"type\": \"string\",\n      \"description\": \"Deployment architecture, scaling, hosting and infrastructure considerations\"\n    },\n    \"mermaidDiagram\": {\n      \"type\": \"string\",\n      \"description\": \"Valid Mermaid diagram code representing system architecture\"\n    }\n  }\n}\n"
                                                       }
                                   }
                }
}
```

### If

| Field | Value |
| --- | --- |
| Node ID | 65d5aebb-1583-4a15-b5f1-ae9c3fae419d |
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
| Node ID | 7496ec4a-2555-4727-92b1-c5a2ca7c99e6 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -336, 800 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- If -> Loop (output 1, input 0)
- Normalize File Summary -> Loop (output 0, input 0)
- Extract content & Path -> Loop (output 0, input 0)

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
| Node ID | 425f55a3-231a-4c3e-a3c5-fa18dc101b92 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -2672, 944 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Parse LLM Response -> Loop Over Items (output 0, input 0)
- Define Github Repositories -> Loop Over Items (output 0, input 0)

**Outgoing Connections**

- Loop Over Items -> RepoMetaData + LLMresponse (output 0, input 1)
- Loop Over Items -> Get full repo tree1 (output 1, input 0)

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
| Node ID | 0e9bddcb-06b8-4c27-972a-b8abf07b45a6 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -768, 800 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Filter Relevant Files -> Merge (output 0, input 1)
- Download file contents -> Merge (output 0, input 0)

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
| Node ID | fbce944c-153b-447f-9d64-dbaddf3e97f0 |
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
    "jsCode":  "const items = $input.all();\n\nreturn items.map(item =\u003e {\n\n  // When using json_schema, parsed JSON is directly in item.json\n  const structured = item.json;\n\n  if (!structured.path || !structured.summary) {\n    return { json: { error: \"Invalid structured summary\", raw: item.json } };\n  }\n\n  return {\n    json: {\n      path: structured.path,\n      summary: structured.summary\n    }\n  };\n});\n"
}
```

### Normalize Folder Summary

| Field | Value |
| --- | --- |
| Node ID | d770d578-cf64-41c5-8056-7ea246ff4d6d |
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
    "jsCode":  "const requiredFields = [\n  \"folder\",\n  \"architecturalSummary\",\n  \"detectedComponents\",\n  \"detectedAPIs\",\n  \"layerDependencies\"\n];\n\nfor (const field of requiredFields) {\n  if (!$json.hasOwnProperty(field)) {\n    return [{ json: { error: `Missing field: ${field}` } }];\n  }\n}\n\nreturn [{ json: $json }];"
}
```

### Normalize System Architecture

| Field | Value |
| --- | --- |
| Node ID | b3ff3aee-41cd-4747-ac34-527ae188f954 |
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
    "jsCode":  "// If Output Format is enabled,\n// the JSON is already structured\n\nif (!$json || Object.keys($json).length === 0) {\n  return [{\n    json: {\n      error: \"No system architecture returned\"\n    }\n  }];\n}\n\nconst validConfidence = [\"HIGH\", \"MEDIUM\", \"LOW\"];\n\nfunction safeArray(v) {\n  return Array.isArray(v) ? v : [];\n}\n\nconst normalized = {\n  systemType: $json.systemType || \"\",\n  architectureStyle: $json.architectureStyle || \"\",\n  majorComponents: safeArray($json.majorComponents).map(c =\u003e ({\n    name: c?.name || \"\",\n    responsibility: c?.responsibility || \"\",\n    evidence: c?.evidence || \"\",\n    interactsWith: safeArray(c?.interactsWith)\n  })),\n  dataFlowSummary: $json.dataFlowSummary || \"\",\n  externalIntegrations: safeArray($json.externalIntegrations),\n  technologyStack: safeArray($json.technologyStack),\n  architecturalPatterns: safeArray($json.architecturalPatterns),\n  observabilityMechanisms: safeArray($json.observabilityMechanisms),\n  testingStrategy: $json.testingStrategy || \"\",\n  confidenceLevel: validConfidence.includes($json.confidenceLevel)\n    ? $json.confidenceLevel\n    : \"LOW\"\n};\n\nreturn [{ json: normalized }];\n"
}
```

### Parse HLD JSON

| Field | Value |
| --- | --- |
| Node ID | 95da29da-0317-4ae1-8da7-d3d3503697a2 |
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
    "jsCode":  "return [{ json: $json }];"
}
```

### Parse LLM Response

| Field | Value |
| --- | --- |
| Node ID | 5e0350fe-8d0b-4532-bf34-a449c6b0cf52 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1248, 1120 |
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
| Node ID | 33ecebee-1a90-4625-b549-354915c518a1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -1760, 1120 |
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
| Node ID | 8499202c-888e-4f69-8b7e-9409cf0bc26c |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -1392, 912 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Retain Repo Metadata -> RepoMetaData + LLMresponse (output 0, input 0)
- Loop Over Items -> RepoMetaData + LLMresponse (output 0, input 1)

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
| Node ID | 26d284de-01bf-4186-9f25-c4e7b8cdd4df |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | -1632, 800 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Define Github Repositories -> Retain Repo Metadata (output 0, input 0)
- Get full repo tree -> Retain Repo Metadata (output 0, input 1)

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
| Node ID | 04e15ae1-5b6e-4e3e-96d9-d7606860dc9a |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | 880, 784 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Folder Summary -> Split folders in batches (output 0, input 0)
- Group by logical folder -> Split folders in batches (output 0, input 0)

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
| Node ID | 777493e2-9676-40cf-9232-512d6ff89472 |
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
                    "value":  "gpt-5.1",
                    "mode":  "list",
                    "cachedResultName":  "GPT-5.1"
                },
    "responses":  {
                      "values":  [
                                     {
                                         "role":  "system",
                                         "content":  "You are a principal software architect.\n\nYou are given structured folder-level architectural analysis of a software repository.\n\nYour task is to infer the overall system architecture strictly from provided evidence.\n\nSTRICT RULES:\n- Base conclusions only on provided folder summaries\n- Do not hallucinate business context\n- If evidence is insufficient, explicitly state it\n- Do not assume repository name or ownership\n- Return valid JSON only\n- No markdown\n- No backticks\n"
                                     },
                                     {
                                         "content":  "=Folder Intelligence:\n{{ JSON.stringify($json.folders) }}\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "textFormat":  {
                                       "textOptions":  {
                                                           "type":  "json_schema",
                                                           "name":  "my_schema-3",
                                                           "schema":  "{\n  \"name\": \"architecture_analysis\",\n  \"schema\": {\n    \"type\": \"object\",\n    \"additionalProperties\": false,\n    \"required\": [\n      \"systemType\",\n      \"architectureStyle\",\n      \"majorComponents\",\n      \"dataFlowSummary\",\n      \"externalIntegrations\",\n      \"technologyStack\",\n      \"architecturalPatterns\",\n      \"observabilityMechanisms\",\n      \"testingStrategy\",\n      \"confidenceLevel\"\n    ],\n    \"properties\": {\n      \"systemType\": {\n        \"type\": \"string\",\n        \"description\": \"Type of system (e.g., e-commerce storefront, microservice, backend API, monolith, frontend SPA).\"\n      },\n      \"architectureStyle\": {\n        \"type\": \"string\",\n        \"description\": \"Overall architectural style (e.g., layered, modular monolith, microservices, clean architecture).\"\n      },\n      \"majorComponents\": {\n        \"type\": \"array\",\n        \"description\": \"Core architectural components detected in the system.\",\n        \"items\": {\n          \"type\": \"object\",\n          \"additionalProperties\": false,\n          \"required\": [\n            \"name\",\n            \"responsibility\",\n            \"evidence\",\n            \"interactsWith\"\n          ],\n          \"properties\": {\n            \"name\": {\n              \"type\": \"string\"\n            },\n            \"responsibility\": {\n              \"type\": \"string\"\n            },\n            \"evidence\": {\n              \"type\": \"string\",\n              \"description\": \"File/folder or code evidence supporting this component.\"\n            },\n            \"interactsWith\": {\n              \"type\": \"array\",\n              \"items\": {\n                \"type\": \"string\"\n              },\n              \"description\": \"Other components this component interacts with.\"\n            }\n          }\n        }\n      },\n      \"dataFlowSummary\": {\n        \"type\": \"string\",\n        \"description\": \"High-level explanation of how data flows across components.\"\n      },\n      \"externalIntegrations\": {\n        \"type\": \"array\",\n        \"items\": {\n          \"type\": \"string\"\n        },\n        \"description\": \"External APIs, services, or third-party integrations detected.\"\n      },\n      \"technologyStack\": {\n        \"type\": \"array\",\n        \"items\": {\n          \"type\": \"string\"\n        },\n        \"description\": \"Primary frameworks, languages, or libraries used.\"\n      },\n      \"architecturalPatterns\": {\n        \"type\": \"array\",\n        \"items\": {\n          \"type\": \"string\"\n        },\n        \"description\": \"Architectural patterns identified (e.g., MVC, CQRS, repository pattern).\"\n      },\n      \"observabilityMechanisms\": {\n        \"type\": \"array\",\n        \"items\": {\n          \"type\": \"string\"\n        },\n        \"description\": \"Logging, monitoring, tracing, metrics, etc.\"\n      },\n      \"testingStrategy\": {\n        \"type\": \"string\",\n        \"description\": \"Detected or inferred testing approach.\"\n      },\n      \"confidenceLevel\": {\n        \"type\": \"string\",\n        \"enum\": [\n          \"HIGH\",\n          \"MEDIUM\",\n          \"LOW\"\n        ],\n        \"description\": \"Confidence in architectural detection.\"\n      }\n    }\n  }\n}\n"
                                                       }
                                   }
                }
}
```

### When clicking â€˜Execute workflowâ€™

| Field | Value |
| --- | --- |
| Node ID | 1f59794f-fbc7-4d67-8c77-0a8886bbfe19 |
| Type | n8n-nodes-base.manualTrigger |
| Type Version | 1 |
| Position | -3152, 784 |
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
