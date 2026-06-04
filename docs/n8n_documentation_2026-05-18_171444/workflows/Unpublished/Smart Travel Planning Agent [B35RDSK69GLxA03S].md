# Smart Travel Planning Agent

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | B35RDSK69GLxA03S |
| Active | False |
| Archived | False |
| Created At | 2026-02-27T07:29:32.330Z |
| Updated At | 2026-03-06T18:34:13.312Z |
| Node Count | 6 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Smart Travel Planning Agent [B35RDSK69GLxA03S].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Submit Travel Details | n8n-nodes-base.formTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.openAi | 2 |
| n8n-nodes-base.code | 3 |
| n8n-nodes-base.formTrigger | 1 |

## Credentials Referenced

- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- None detected.

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- Submit Travel Details -> Context Enrichment for LLM (source output 0, target input 0)
- Context Enrichment for LLM -> Travel Planning Agent (source output 0, target input 0)
- Travel Planning Agent -> Travel Plan Validator Agent (source output 0, target input 0)
- Travel Plan Validator Agent -> Merge Travel Plan & Validation (source output 0, target input 0)
- Merge Travel Plan & Validation -> Parse Travel Details (source output 0, target input 0)

## Nodes

### Context Enrichment for LLM

| Field | Value |
| --- | --- |
| Node ID | 35212a1b-6909-4228-8e89-d5bc4cc0f710 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 208, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Submit Travel Details -> Context Enrichment for LLM (output 0, input 0)

**Outgoing Connections**

- Context Enrichment for LLM -> Travel Planning Agent (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Get Form Values\nconst origin = $json[\"Origin\"];\nconst destination = $json[\"Destination\"];\nconst startDate = new Date($json[\"Start Date\"]);\nconst endDate = new Date($json[\"End Date\"]);\n\nconst minBudgetRaw = $json[\"Minimum Budget\"];\nconst maxBudgetRaw = $json[\"Maximum Budget\"];\n\n// Remove currency symbols \u0026 commas\nconst minBudget = parseFloat(String(minBudgetRaw).replace(/[^0-9.]/g, \"\"));\nconst maxBudget = parseFloat(String(maxBudgetRaw).replace(/[^0-9.]/g, \"\"));\n\n// Calculate Trip Duration\n\nconst diffTime = Math.abs(endDate - startDate);\nconst diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));\n\nlet trip_duration;\n\nif (diffDays \u003c= 3) {\n  trip_duration = \"short\";\n} else if (diffDays \u003c= 7) {\n  trip_duration = \"medium\";\n} else {\n  trip_duration = \"long\";\n}\n\n// Return Enriched Context\n\nreturn [\n  {\n    json: {\n      ...$json,\n      total_trip_days: diffDays,\n      trip_duration\n    }\n  }\n];"
}
```

### Merge Travel Plan & Validation

| Field | Value |
| --- | --- |
| Node ID | 10294371-d80e-4210-b1ca-cbbe96eb625a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1152, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Travel Plan Validator Agent -> Merge Travel Plan & Validation (output 0, input 0)

**Outgoing Connections**

- Merge Travel Plan & Validation -> Parse Travel Details (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Extract the generated travel plan\nconst travelPlan =\n  $node[\"Travel Planning Agent\"].json.output?.[0]?.content?.[0]?.text || \"Travel plan not available.\";\n\n// Extract validation result\nconst validation =\n  $node[\"Travel Plan Validator Agent\"].json.output?.[0]?.content?.[0]?.text || \"Validation unavailable.\";\n\n// Extract form values\nconst destination = $node[\"Context Enrichment for LLM\"].json[\"Destination\"];\nconst origin = $node[\"Context Enrichment for LLM\"].json[\"Origin\"];\nconst startDate = $node[\"Context Enrichment for LLM\"].json[\"Start Date\"];\nconst endDate = $node[\"Context Enrichment for LLM\"].json[\"End Date\"];\nconst tripDays = $node[\"Context Enrichment for LLM\"].json[\"total_trip_days\"];\nconst style = $node[\"Context Enrichment for LLM\"].json[\"What is your Travel Style Preference?\"];\n\n// Markdown formatted report\nconst markdownReport = `\n# âœˆï¸ Smart Travel Plan\n\n## Route\n**${origin} â†’ ${destination}**\n\n## Travel Dates\n**${startDate} â†’ ${endDate} (${tripDays} days)**\n\n## Travel Style\n**${style}**\n\n---\n\n## Recommended Plan\n\n${travelPlan}\n\n---\n\n## Validation Check\n\n${validation}\n\n---\n\nðŸŒ **Enjoy your journey and travel safely!**\n`;\n\nreturn [\n  {\n    json: {\n      markdown: markdownReport\n    }\n  }\n];"
}
```

### Parse Travel Details

| Field | Value |
| --- | --- |
| Node ID | aa49250a-e096-4b5c-bec8-8655bf024fe3 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1360, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Travel Plan & Validation -> Parse Travel Details (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const markdown = $json.markdown;\n\n// helper function\nfunction extractBetween(text, start, end) {\n  const regex = new RegExp(`${start}([\\\\s\\\\S]*?)${end}`);\n  const match = text.match(regex);\n  return match ? match[1].trim() : \"\";\n}\n\n// Extract major sections\nconst route = extractBetween(markdown, \"## Route\", \"## Travel Dates\");\nconst dates = extractBetween(markdown, \"## Travel Dates\", \"## Travel Style\");\nconst style = extractBetween(markdown, \"## Travel Style\", \"---\");\nconst recommended = extractBetween(markdown, \"## Recommended Plan\", \"## Validation Check\");\nconst validationBlock = extractBetween(markdown, \"## Validation Check\", \"Enjoy your journey\");\n\n// Extract plan bullets\nfunction extractBullet(text, title) {\n  const regex = new RegExp(`\\\\*\\\\*${title}:\\\\*\\\\*[\\\\s\\\\n]*-?([\\\\s\\\\S]*?)(\\\\n\\\\n|$)`);\n  const match = text.match(regex);\n  return match ? match[1].trim() : \"\";\n}\n\nconst travelWindow = extractBullet(recommended, \"Travel Window\");\nconst stayArea = extractBullet(recommended, \"Recommended Stay Area\");\nconst activity = extractBullet(recommended, \"Must-Do Activity\");\nconst caution = extractBullet(recommended, \"Caution\");\nconst vibe = extractBullet(recommended, \"Overall Travel Vibe\");\n\n// Extract validation decision\nconst decisionMatch = validationBlock.match(/Decision:\\s*(YES|NO)/i);\nconst justificationMatch = validationBlock.match(/Justification:\\s*([^\\n]+)/i);\n\nconst decision = decisionMatch ? decisionMatch[1].toUpperCase() : \"\";\nconst justification = justificationMatch ? justificationMatch[1].trim() : \"\";\n\nreturn [\n{\njson: {\n\nroute: route.replace(/\\*\\*/g,\"\").trim(),\ntravel_dates: dates.replace(/\\*\\*/g,\"\").trim(),\ntravel_style: style.replace(/\\*\\*/g,\"\").trim(),\n\ntravel_window: travelWindow,\nrecommended_stay_area: stayArea,\nmust_do_activity: activity,\ncaution: caution,\ntravel_vibe: vibe,\n\ndecision: decision,\njustification: justification,\n\nfull_markdown: markdown\n}\n}\n];"
}
```

### Submit Travel Details

| Field | Value |
| --- | --- |
| Node ID | b1152d15-a225-4188-9a8d-0ec189171bb4 |
| Type | n8n-nodes-base.formTrigger |
| Type Version | 2.5 |
| Position | 0, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Submit Travel Details -> Context Enrichment for LLM (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "formTitle":  "Planning your Travel? Fill below details...",
    "formDescription":  "This form will take inputs such as travel dates, budget, travel type \u0026 destination etc.",
    "formFields":  {
                       "values":  [
                                      {
                                          "fieldLabel":  "Origin",
                                          "placeholder":  "Enter Start City",
                                          "requiredField":  true
                                      },
                                      {
                                          "fieldLabel":  "Destination",
                                          "placeholder":  "Enter End City",
                                          "requiredField":  true
                                      },
                                      {
                                          "fieldLabel":  "Start Date",
                                          "fieldType":  "date",
                                          "requiredField":  true
                                      },
                                      {
                                          "fieldLabel":  "End Date",
                                          "fieldType":  "date",
                                          "requiredField":  true
                                      },
                                      {
                                          "fieldLabel":  "Minimum Budget",
                                          "placeholder":  "e.g. $5000",
                                          "requiredField":  true
                                      },
                                      {
                                          "fieldLabel":  "Maximum Budget",
                                          "placeholder":  "e.g. $15000",
                                          "requiredField":  true
                                      },
                                      {
                                          "fieldLabel":  "What is your Travel Style Preference?",
                                          "fieldType":  "checkbox",
                                          "fieldOptions":  {
                                                               "values":  [
                                                                              {
                                                                                  "option":  "Relaxed"
                                                                              },
                                                                              {
                                                                                  "option":  "Adventure"
                                                                              },
                                                                              {
                                                                                  "option":  "Mixed"
                                                                              }
                                                                          ]
                                                           },
                                          "requiredField":  true
                                      }
                                  ]
                   },
    "options":  {

                }
}
```

### Travel Plan Validator Agent

| Field | Value |
| --- | --- |
| Node ID | 6a8a4407-54fc-4e67-ac92-dbb2b3e69896 |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2.1 |
| Position | 768, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Travel Planning Agent -> Travel Plan Validator Agent (output 0, input 0)

**Outgoing Connections**

- Travel Plan Validator Agent -> Merge Travel Plan & Validation (output 0, input 0)

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
                                         "role":  "system",
                                         "content":  "You are a travel plan validation assistant.\n\nYour responsibility is to review a proposed travel plan and determine whether it is appropriate for the traveler based on the provided trip details.\n\nFocus on two checks:\n\n1. Whether the plan appears reasonable for the provided budget range.\n2. Whether the suggested travel style matches the travelerâ€™s stated preference (relaxed, adventure, or mixed).\n\nYour response must be concise and objective.\n\nReturn only two items:\n\nDecision: YES or NO  \nJustification: one short sentence explaining your reasoning.\n\nDo not repeat the travel plan.  \nDo not return JSON.  \nDo not add extra commentary."
                                     },
                                     {
                                         "content":  "=Please review the following trip information and the proposed travel plan.\n\nTrip Details:\n{{ JSON.stringify($json, null, 2) }}\n\nProposed Travel Plan:\n{{ $json.output[0].content[0].text }}\n\nDetermine:\n\n1. Does the travel plan reasonably fit the given budget range?\n2. Does it align with the selected travel style?\n\nRespond in the following format:\n\nDecision: YES or NO\nJustification: \u003cone sentence explanation\u003e"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {

                }
}
```

### Travel Planning Agent

| Field | Value |
| --- | --- |
| Node ID | d8aaed99-7f7e-4de5-99b2-deb5505c3bb1 |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2.1 |
| Position | 416, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Context Enrichment for LLM -> Travel Planning Agent (output 0, input 0)

**Outgoing Connections**

- Travel Planning Agent -> Travel Plan Validator Agent (output 0, input 0)

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
                                         "role":  "system",
                                         "content":  "You are an experienced travel planning consultant.\n\nYour job is to analyse structured trip data and generate practical, realistic, experience-focused travel guidance.\n\nDo not recommend specific hotel names or flight numbers.\nFocus on areas, timing logic, and traveller suitability.\n\nKeep responses concise, structured, and actionable."
                                     },
                                     {
                                         "content":  "=Trip Details:\n{{ JSON.stringify($json, null, 2) }}\n\nTasks:\n\n1. Generate a sensible travel plan including:\n   - Best travel window within provided Start \u0026 end dates\n   - Recommended stay area (not a specific hotel)\n   - One must-do activity\n   - One thing to avoid as a caution\n   - Overall travel vibe\n\n2. Evaluate whether the plan is realistic given:\n   - Total Trip Days\n   - Origin City\n   - Destination City\n   - travel style preference\n   - Start \u0026 end dates\n\nIf it is not realistic, silently adjust the plan before returning it.\n\nReturn ONLY a clean, human-readable final plan.\nDo not return JSON.\nDo not explain internal reasoning."
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {

                }
}
```
