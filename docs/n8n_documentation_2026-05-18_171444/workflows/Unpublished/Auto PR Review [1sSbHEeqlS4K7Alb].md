# Auto PR Review

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 1sSbHEeqlS4K7Alb |
| Active | False |
| Archived | False |
| Created At | 2025-09-23T18:19:40.814Z |
| Updated At | 2025-10-17T08:30:39.000Z |
| Node Count | 12 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Auto PR Review [1sSbHEeqlS4K7Alb].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- github-pr-review | n8n-nodes-base.webhook | POST | /github-pr-review

Known webhook route hints:

- POST /webhook/github-pr-review

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 5 |
| n8n-nodes-base.httpRequest | 5 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpBasicAuth: Jenkins
- httpBearerAuth: Bearer Auth account
- httpHeaderAuth: BotPAT
- httpHeaderAuth: GitHub Token Header Auth
- httpHeaderAuth: Header Auth account

## External Dependencies Detected

### URL Hints

- https://api.github.com/repos/{{
- https://api.github.com/repos/{{$json[\
- https://api.openai.com/v1/chat/completions

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- github-pr-review -> Check PR action is one of: opened, reopened, synchronize (source output 0, target input 0)
- OpenAI Review -> Parse LLM Response (source output 0, target input 0)
- Parse LLM Response -> If (source output 0, target input 0)
- If -> Request Changes in PR (source output 0, target input 0)
- If -> approve and trigger Jenkins (source output 1, target input 0)
- Request Changes in PR -> Post PR Review: REQUEST_CHANGES (source output 0, target input 0)
- approve and trigger Jenkins -> Post PR Review: APPROVE (source output 0, target input 0)
- Post PR Review: APPROVE -> Merge the PR in Main (source output 0, target input 0)
- Prompt LLM to extract clean summary of File name & Added/removed lines (diffs) -> OpenAI Review (source output 0, target input 0)
- Get PR Files -> Prompt LLM to extract clean summary of File name & Added/removed lines (diffs) (source output 0, target input 0)
- Check PR action is one of: opened, reopened, synchronize -> Get PR Files (source output 0, target input 0)

## Nodes

### approve and trigger Jenkins

| Field | Value |
| --- | --- |
| Node ID | 9d7fe994-f8ba-41b7-93e7-91b2f2378d05 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1552, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- If -> approve and trigger Jenkins (output 1, input 0)

**Outgoing Connections**

- approve and trigger Jenkins -> Post PR Review: APPROVE (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const r = $json.review;\nconst summary = `Automated Code Review: Passed âœ…. Calculated Score is: ${r.overall_score || \u0027N/A\u0027}. Here is the Review Summary: ${r.summary || \u0027\u0027}`;\nreturn [{ json: { body: summary } }];\n"
}
```

### Check PR action is one of: opened, reopened, synchronize

| Field | Value |
| --- | --- |
| Node ID | 2419a757-2f6f-4dfd-99ab-2a0a43b27762 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 208, 208 |
| Disabled |  |
| Always Output Data | False |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- github-pr-review -> Check PR action is one of: opened, reopened, synchronize (output 0, input 0)

**Outgoing Connections**

- Check PR action is one of: opened, reopened, synchronize -> Get PR Files (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Only continue if PR action is one of: opened, reopened, synchronize\nif (![\u0027opened\u0027, \u0027reopened\u0027, \u0027synchronize\u0027].includes($input.first().json.body.action)){\n  // Stop workflow execution for other actions\n  return [];\n}\n\n// Pass item forward for processing\nreturn $input.all();\n"
}
```

### Get PR Files

| Field | Value |
| --- | --- |
| Node ID | 18360506-4684-48d9-b458-3679434817c4 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 432, 208 |
| Disabled |  |
| Always Output Data | False |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Check PR action is one of: opened, reopened, synchronize -> Get PR Files (output 0, input 0)

**Outgoing Connections**

- Get PR Files -> Prompt LLM to extract clean summary of File name & Added/removed lines (diffs) (output 0, input 0)

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "jafTB364O8QBqOzJ",
                          "name":  "Jenkins"
                      },
    "httpBearerAuth":  {
                           "id":  "nTi01UwbEgCFVIlW",
                           "name":  "Bearer Auth account"
                       },
    "httpHeaderAuth":  {
                           "id":  "tXzP1GDAz6NZy7jT",
                           "name":  "GitHub Token Header Auth"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "=https://api.github.com/repos/{{ $json.body.pull_request.head.repo.full_name }}/pulls/{{ $json.body.pull_request.number }}/files\n",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpHeaderAuth",
    "sendHeaders":  true,
    "headerParameters":  {
                             "parameters":  [
                                                {
                                                    "name":  "Accept",
                                                    "value":  "application/vnd.github+json"
                                                }
                                            ]
                         },
    "options":  {
                    "response":  {
                                     "response":  {
                                                      "responseFormat":  "json"
                                                  }
                                 }
                }
}
```

### github-pr-review

| Field | Value |
| --- | --- |
| Node ID | 24e6b7ec-8ee7-4123-b9ea-34fb44a8ccf2 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- github-pr-review -> Check PR action is one of: opened, reopened, synchronize (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "/github-pr-review",
    "options":  {

                }
}
```

### If

| Field | Value |
| --- | --- |
| Node ID | 2b260962-bd59-4b2f-92b0-0a02fef23f3c |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 1328, 208 |
| Disabled |  |
| Always Output Data | False |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Parse LLM Response -> If (output 0, input 0)

**Outgoing Connections**

- If -> Request Changes in PR (output 0, input 0)
- If -> approve and trigger Jenkins (output 1, input 0)

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
                                              "id":  "e69b92f2-13f0-4501-9eff-54f107643995",
                                              "leftValue":  "={{($json.review.should_block)}}\n",
                                              "rightValue":  "true",
                                              "operator":  {
                                                               "type":  "string",
                                                               "operation":  "contains"
                                                           }
                                          },
                                          {
                                              "id":  "b4131c79-b7c6-4763-90b6-75d8f4bc879f",
                                              "leftValue":  "={{($json.review.overall_score)}}",
                                              "rightValue":  70,
                                              "operator":  {
                                                               "type":  "number",
                                                               "operation":  "lte"
                                                           }
                                          },
                                          {
                                              "id":  "29ab889c-5719-4d54-be50-adc990639456",
                                              "leftValue":  "={{($json.review.critical_issues.length)}}",
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

### Merge the PR in Main

| Field | Value |
| --- | --- |
| Node ID | c4e221a3-6719-466f-abd8-4b97e244abbb |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 2000, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Post PR Review: APPROVE -> Merge the PR in Main (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
{
    "httpHeaderAuth":  {
                           "id":  "tXzP1GDAz6NZy7jT",
                           "name":  "GitHub Token Header Auth"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PUT",
    "url":  "=https://api.github.com/repos/{{ $(\u0027github-pr-review\u0027).first().json.body.pull_request.head.repo.full_name }}/pulls/{{ $(\u0027github-pr-review\u0027).first().json.body.pull_request.number }}/merge",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpHeaderAuth",
    "sendHeaders":  true,
    "headerParameters":  {
                             "parameters":  [
                                                {
                                                    "name":  "Accept",
                                                    "value":  "application/vnd.github+json"
                                                },
                                                {
                                                    "name":  "Content-Type",
                                                    "value":  "application/json"
                                                }
                                            ]
                         },
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "{\n \"commit_title\": \"Auto-merged after n8n workflow AI approval on {{ new Date().toISOString() }}\",\n  \"merge_method\": \"merge\"\n}\n",
    "options":  {

                }
}
```

### OpenAI Review

| Field | Value |
| --- | --- |
| Node ID | b4ebeec3-d601-4498-86af-3304abc7780c |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 880, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prompt LLM to extract clean summary of File name & Added/removed lines (diffs) -> OpenAI Review (output 0, input 0)

**Outgoing Connections**

- OpenAI Review -> Parse LLM Response (output 0, input 0)

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "jafTB364O8QBqOzJ",
                          "name":  "Jenkins"
                      },
    "httpBearerAuth":  {
                           "id":  "nTi01UwbEgCFVIlW",
                           "name":  "Bearer Auth account"
                       },
    "httpHeaderAuth":  {
                           "id":  "skQ4rOdSijyBM3Yv",
                           "name":  "Header Auth account"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "https://api.openai.com/v1/chat/completions",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpHeaderAuth",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"model\": \"gpt-4o-mini\",\n  \"messages\": [\n    {\"role\": \"system\", \"content\": \"You are an expert automation test reviewer. Be concise and only return valid JSON as requested.\"},\n    {\"role\": \"user\", \"content\": {{ JSON.stringify($json.prompt) }}}\n  ],\n  \"temperature\": 0.0,\n  \"max_tokens\": 1500\n}\n",
    "options":  {
                    "response":  {
                                     "response":  {
                                                      "responseFormat":  "json"
                                                  }
                                 }
                }
}
```

### Parse LLM Response

| Field | Value |
| --- | --- |
| Node ID | 98225842-77b2-4b4f-b1c3-d2e0d530b038 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1104, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI Review -> Parse LLM Response (output 0, input 0)

**Outgoing Connections**

- Parse LLM Response -> If (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Get OpenAI response item (usually single)\nconst openaiItem = $input.all()[0].json;\n\n// Extract text content safely\nlet text = \"\";\n\nif (openaiItem.choices?.[0]?.message?.content) {\n  text = openaiItem.choices[0].message.content;\n} else if (openaiItem.choices?.[0]?.text) {\n  text = openaiItem.choices[0].text;\n} else {\n  text = JSON.stringify(openaiItem).slice(0, 1000);\n}\n\n// ðŸ§¹ Remove markdown fences if present (```json ... ```)\ntext = text.replace(/^```json\\s*/i, \"\").replace(/```$/i, \"\").trim();\n\n// Parse JSON output safely\nlet result;\ntry {\n  result = JSON.parse(text);\n} catch (err) {\n  result = {\n    should_block: false,\n    overall_score: 0,\n    critical_issues: [],\n    suggestions: [\"Failed to parse JSON from LLM output.\"],\n    summary: text.substring(0, 800)\n  };\n}\n\n// ðŸ§  Extract PR metadata (passed through input chain)\nconst meta = openaiItem; // if metadata was merged into same object earlier\n\nreturn [\n  {\n    json: {\n      review: result,\n      llm_raw: text,\n      repo: $(\u0027github-pr-review\u0027).first().json.body.pull_request.head.repo.full_name || null,\n      pr_number: $(\u0027github-pr-review\u0027).first().json.body.pull_request.number || null,\n      head_sha: $(\u0027Get PR Files\u0027).first().json.sha || null\n    }\n  }\n];\n"
}
```

### Post PR Review: APPROVE

| Field | Value |
| --- | --- |
| Node ID | c45cc7fc-4b13-47df-be1b-f48abb957abf |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 1776, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- approve and trigger Jenkins -> Post PR Review: APPROVE (output 0, input 0)

**Outgoing Connections**

- Post PR Review: APPROVE -> Merge the PR in Main (output 0, input 0)

**Credential References**

```json
{
    "httpBearerAuth":  {
                           "id":  "nTi01UwbEgCFVIlW",
                           "name":  "Bearer Auth account"
                       },
    "httpHeaderAuth":  {
                           "id":  "MyUgg1bWDrYoG7KS",
                           "name":  "BotPAT"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "=https://api.github.com/repos/{{ $(\u0027github-pr-review\u0027).first().json.body.pull_request.base.repo.full_name }}/pulls/{{ $(\u0027github-pr-review\u0027).first().json.body.pull_request.number }}/reviews",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpHeaderAuth",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"body\": \"={{$json.body}}\",\n  \"event\": \"APPROVE\",\n  \"commit_id\": \"{{ $(\u0027github-pr-review\u0027).first().json.body.pull_request.head.sha }}\"\n}\n",
    "options":  {

                }
}
```

### Post PR Review: REQUEST_CHANGES

| Field | Value |
| --- | --- |
| Node ID | 3d294845-f133-4f3f-ade9-b21c76bac992 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 1776, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Request Changes in PR -> Post PR Review: REQUEST_CHANGES (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
{
    "httpBearerAuth":  {
                           "id":  "nTi01UwbEgCFVIlW",
                           "name":  "Bearer Auth account"
                       },
    "httpHeaderAuth":  {
                           "id":  "MyUgg1bWDrYoG7KS",
                           "name":  "BotPAT"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "=https://api.github.com/repos/{{$json[\"repo\"]}}/pulls/{{$json[\"pr_number\"]}}/reviews",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpHeaderAuth",
    "sendHeaders":  true,
    "headerParameters":  {
                             "parameters":  [
                                                {
                                                    "name":  "Accept",
                                                    "value":  "application/vnd.github+json"
                                                }
                                            ]
                         },
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"body\": \"={{ $json.body.replace(/\\\\/g,\u0027\\\\\\\\\u0027).replace(/\\\"/g,\u0027\\\\\\\"\u0027).replace(/\\n/g,\u0027\\\\n\u0027) }}\",\n  \"event\": \"REQUEST_CHANGES\",\n  \"commit_id\": \"{{$json.head_sha}}\"\n}\n",
    "options":  {

                }
}
```

### Prompt LLM to extract clean summary of File name & Added/removed lines (diffs)

| Field | Value |
| --- | --- |
| Node ID | ecd1fc49-aa71-4a2d-bd08-9c426e1b02f0 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 656, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get PR Files -> Prompt LLM to extract clean summary of File name & Added/removed lines (diffs) (output 0, input 0)

**Outgoing Connections**

- Prompt LLM to extract clean summary of File name & Added/removed lines (diffs) -> OpenAI Review (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Function node set to \"Run Once for All Items\"\nconst MAX_FILES = 6;\nconst MAX_CHARS_PER_DIFF = 4000;\n\n// Get all PR files from previous node\nlet files = $input.all().map(i =\u003e i.json);\nif (files.length \u003e MAX_FILES) files = files.slice(0, MAX_FILES);\n\n// Build the review prompt\nlet prompt =\n\"ðŸ’¡ **Context**: You are a *Senior Automation Architect* with deep expertise in Selenium (Java), TestNG, Page Object Model (POM), Log4j, and Extent Reports.\\n\" +\n\"Perform a **fresh, context-independent code review** of the provided Selenium test files. \" +\n\"âš ï¸ Do NOT compare against any previous commits or diff context â€” instead, evaluate the code as if it is *entirely new*, using the following best practice guidelines.\\n\\n\" +\n\n\"---\\n\" +\n\"### ðŸ§­ Review Intent\\n\" +\n\"- Treat every code block as newly written. Do NOT reference or assume old code or deletions.\\n\" +\n\"- Focus solely on the *current implementation quality*, not historical changes.\\n\" +\n\"- Do NOT penalize removed code or renamed methods if the new version aligns with guidelines.\\n\" +\n\"---\\n\\n\" +\n\n\"### ðŸ“˜ Code Review Guidelines\\n\" +\n\"1. **Code Structure \u0026 Readability** â€“ Enforce Java/Selenium coding standards, naming conventions, consistent indentation, and removal of redundant logic.\\n\" +\n\"2. **Page Object Model (POM)** â€“ Ensure clear separation between locators, reusable methods, and test logic. Prefer explicit waits over Thread.sleep.\\n\" +\n\"3. **Selenium Best Practices** â€“ Validate driver setup/teardown logic, WebDriverManager usage, and avoidance of hard-coded data.\\n\" +\n\"4. **TestNG Implementation** â€“ Check use of annotations (@Test, @BeforeMethod, @AfterMethod), assertion logic, and grouping strategy.\\n\" +\n\"5. **Logging (Log4j)** â€“ Ensure proper log levels (INFO, DEBUG, ERROR) and avoid exposing sensitive data.\\n\" +\n\"6. **Extent Reports Integration** â€“ Validate report initialization, test log entries, screenshot capture, and final report flush.\\n\" +\n\"7. **Error Handling \u0026 Robustness** â€“ Highlight missing try/catch, poor exception handling, and lack of recovery for flaky tests.\\n\" +\n\"8. **Framework Design \u0026 Scalability** â€“ Assess modularity, package hierarchy (base/pages/tests/utils), and parallel test readiness.\\n\" +\n\"9. **Configuration Management** â€“ Ensure all environment data and URLs are externalized, not hardcoded.\\n\" +\n\"10. **CI/CD \u0026 Maintainability** â€“ Verify tests can run in headless mode, support parallel runs, and integrate with Jenkins or GitHub Actions.\\n\\n\" +\n\n\"### âš™ï¸ Review Focus Areas\\n\" +\n\"1. Maintainability â€“ No hard-coded waits; prefer explicit waits.\\n\" +\n\"2. Stability â€“ Avoid timing-based or order-dependent tests.\\n\" +\n\"3. Reusability â€“ Maximize reusable components and methods.\\n\" +\n\"4. Readability â€“ Clear test names, concise assertions.\\n\" +\n\"5. Scalability â€“ No duplicate locators; centralize selectors.\\n\" +\n\"6. Data Handling â€“ Externalize configuration and test data.\\n\" +\n\"7. Error Handling â€“ Proper try/catch with meaningful logs.\\n\" +\n\"8. Framework Standards â€“ Follow naming, folder, and reporting conventions.\\n\" +\n\"9. Performance â€“ Avoid unnecessary browser actions or sleeps.\\n\" +\n\"10. CI/CD Fit â€“ Ensure compatibility with headless mode and parallel execution.\\n\\n\" +\n\n\"### ðŸ§¾ Output Format\\n\" +\n\"Return ONLY valid JSON with these keys:\\n\" +\n\"- should_block: true/false (whether code violates critical standards)\\n\" +\n\"- overall_score: (0â€“100) based on code quality\\n\" +\n\"- critical_issues: array of {file, line, message}\\n\" +\n\"- suggestions: array of short actionable improvements\\n\" +\n\"- summary: a single concise paragraph summarizing your review\\n\\n\" +\n\n\"---\\n\" +\n\"### PR Metadata\\n\" +\n\"PR Number: \" + $(\u0027github-pr-review\u0027).first().json.body.pull_request.number +\n\"\\nRepository: \" + $(\u0027github-pr-review\u0027).first().json.body.pull_request.head.repo.full_name +\n\"\\nHead SHA: \" + $input.first().json.sha +\n\"\\n\\n\" +\n\"---\\n\" +\n\"### ðŸ” Files to Review (fresh evaluation)\\n\\n\";\n\nfor (const f of files) {\n    const filename = f.filename;\n    const diff = (f.patch || \u0027\u0027).substring(0, MAX_CHARS_PER_DIFF);\n    prompt += `ðŸ“„ FILE: ${filename}\\n\\nCODE:\\n${diff}\\n\\n---\\n\\n`;\n}\n\n// Grab PR metadata\nconst first = files[0] || {};\n\nreturn {\n    json: {\n        prompt,\n        repo: first?.body?.repository?.name || \u0027\u0027,\n        pr_number: first?.body?.pull_request?.number || 0,\n        head_sha: first?.body?.pull_request?.head?.sha || \u0027\u0027\n    }\n};\n"
}
```

### Request Changes in PR

| Field | Value |
| --- | --- |
| Node ID | 8591fe5e-ebe9-4532-9100-9a2b71e436cc |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1552, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- If -> Request Changes in PR (output 0, input 0)

**Outgoing Connections**

- Request Changes in PR -> Post PR Review: REQUEST_CHANGES (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Get review object from previous node\nconst input = $input.all()[0].json;\nconst r = input.review;\n\nlet lines = [];\nlines.push(\"### ðŸ¤– Automated Code Review\\n\");\nlines.push(`**Summary:** ${r.summary || \"No summary provided.\"}\\n`);\n\nif (r.critical_issues \u0026\u0026 r.critical_issues.length) {\n  lines.push(\"**Critical Issues:**\");\n  for (let c of r.critical_issues) {\n    lines.push(`- ${c.file || \u0027unknown\u0027}:${c.line || \u0027-\u0027} â€” ${c.message}`);\n  }\n}\n\nif (r.suggestions \u0026\u0026 r.suggestions.length) {\n  lines.push(\"\\n**Suggestions:**\");\n  for (let s of r.suggestions) {\n    lines.push(`- ${s}`);\n  }\n}\n\nreturn [\n  {\n    json: {\n      body: lines.join(\"\\n\"),\n      repo: $(\u0027github-pr-review\u0027).first().json.body.pull_request.head.repo.full_name,\n      pr_number: $(\u0027github-pr-review\u0027).first().json.body.pull_request.number,\n      head_sha: $(\u0027github-pr-review\u0027).first().json.body.pull_request.head.sha\n    }\n  }\n];\n"
}
```

