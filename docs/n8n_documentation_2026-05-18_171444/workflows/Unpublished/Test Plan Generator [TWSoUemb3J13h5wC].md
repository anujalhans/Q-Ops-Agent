# Test Plan Generator

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | TWSoUemb3J13h5wC |
| Active | False |
| Archived | True |
| Created At | 2025-10-30T05:01:16.581Z |
| Updated At | 2026-04-16T10:16:15.000Z |
| Node Count | 7 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Test Plan Generator [TWSoUemb3J13h5wC].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Start | n8n-nodes-base.manualTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.openAi | 1 |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.extractFromFile | 1 |
| n8n-nodes-base.httpRequest | 1 |
| n8n-nodes-base.manualTrigger | 1 |
| n8n-nodes-base.readWriteFile | 2 |

## Credentials Referenced

- openAiApi: OpenAi Account 2

## External Dependencies Detected

### URL Hints

- http://127.0.0.1:8000/convert

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- Read BRD Document -> Extract BRD Content (source output 0, target input 0)
- Start -> Read BRD Document (source output 0, target input 0)
- Extract BRD Content -> OpenAI  (source output 0, target input 0)
- OpenAI  -> Prepare Markdown Content (source output 0, target input 0)
- Prepare Markdown Content -> Convert md to docx (source output 0, target input 0)
- Convert md to docx -> Read/Write Files from Disk (source output 0, target input 0)

## Nodes

### Convert md to docx

| Field | Value |
| --- | --- |
| Node ID | 77b72444-f032-4499-b9ae-8eeb9e301524 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | 1248, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Markdown Content -> Convert md to docx (output 0, input 0)

**Outgoing Connections**

- Convert md to docx -> Read/Write Files from Disk (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "http://127.0.0.1:8000/convert",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "markdown",
                                                  "value":  "={{ $(\u0027OpenAI \u0027).item.json.output[0].content[0].text }}"
                                              }
                                          ]
                       },
    "options":  {
                    "response":  {
                                     "response":  {
                                                      "responseFormat":  "file"
                                                  }
                                 }
                }
}
```

### Extract BRD Content

| Field | Value |
| --- | --- |
| Node ID | 0ca09b7a-ad5f-4cf5-9249-2f92d037176f |
| Type | n8n-nodes-base.extractFromFile |
| Type Version | 1 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Read BRD Document -> Extract BRD Content (output 0, input 0)

**Outgoing Connections**

- Extract BRD Content -> OpenAI  (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "pdf",
    "options":  {
                    "joinPages":  false
                }
}
```

### OpenAI 

| Field | Value |
| --- | --- |
| Node ID | a4697ec5-b24e-4eb5-b2ff-22dd101dec10 |
| Type | @n8n/n8n-nodes-langchain.openAi |
| Type Version | 2 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Extract BRD Content -> OpenAI  (output 0, input 0)

**Outgoing Connections**

- OpenAI  -> Prepare Markdown Content (output 0, input 0)

**Credential References**

```json
{
    "openAiApi":  {
                      "id":  "rdVg2Kks1mUCJf4R",
                      "name":  "OpenAi Account 2"
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
                                         "content":  "You are an experienced QA Test Manager responsible for creating professional Test Plans from Business Requirement Documents (BRDs). \nYour goal is to analyze the input text from the BRD and generate a detailed, structured Test Plan.\n"
                                     },
                                     {
                                         "content":  "=Create a comprehensive Test Plan based on the below extracted BRD content.\nInclude all standard Test Plan sections:\n1. Test Strategy\n2. Scope\n3. Test Objectives\n4. Test Deliverables\n5. Entry and Exit Criteria\n6. Test Schedule and Milestones\n7. Risks and Mitigation Plan\n8. Test Environment\n9. Tools and Resources\n10. Roles and Responsibilities\n11. Test Data and Configurations\n12. Reporting and Communication Plan\n\nBRD Content:\n{{$json[\"text\"]}}\n"
                                     }
                                 ]
                  },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  4000,
                    "temperature":  0.7
                }
}
```

### Prepare Markdown Content

| Field | Value |
| --- | --- |
| Node ID | 1baf9417-bc18-4c09-9727-7a508f6888ea |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1024, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI  -> Prepare Markdown Content (output 0, input 0)

**Outgoing Connections**

- Prepare Markdown Content -> Convert md to docx (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [\n  {\n    json: {},\n    binary: {\n      data: {\n        data: Buffer.from($input.first().json.output[0].content[0].text, \"utf8\"),\n        mimeType: \"text/markdown\",\n        fileName: \"BRD-TO-TEST-PLAN.md\"\n      }\n    }\n  }\n];\n"
}
```

### Read BRD Document

| Field | Value |
| --- | --- |
| Node ID | 641a70ff-17b4-4973-8444-be72c098ec9c |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Start -> Read BRD Document (output 0, input 0)

**Outgoing Connections**

- Read BRD Document -> Extract BRD Content (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "fileSelector":  "C:\\\\Users\\\\anujalhans01\\\\Downloads\\\\Business-Requirements-Document-BRD-Template.pdf",
    "options":  {

                }
}
```

### Read/Write Files from Disk

| Field | Value |
| --- | --- |
| Node ID | fc3a7c6a-309c-4d72-8a0b-f355def9dd1a |
| Type | n8n-nodes-base.readWriteFile |
| Type Version | 1 |
| Position | 1472, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert md to docx -> Read/Write Files from Disk (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "operation":  "write",
    "fileName":  "C:\\Users\\anujalhans01\\Downloads\\Generated-Test-Plan.docx",
    "options":  {

                }
}
```

### Start

| Field | Value |
| --- | --- |
| Node ID | e74ab976-80f6-4318-945e-8241dbf587e1 |
| Type | n8n-nodes-base.manualTrigger |
| Type Version | 1 |
| Position | 0, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Start -> Read BRD Document (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```
