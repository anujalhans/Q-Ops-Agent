# NAGP_DataPreprocessor_Puru

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | jtTovk07OGHpS8UF |
| Active | False |
| Archived | False |
| Created At | 2026-03-31T06:41:18.186Z |
| Updated At | 2026-03-31T07:21:26.870Z |
| Node Count | 15 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\NAGP_DataPreprocessor_Puru [jtTovk07OGHpS8UF].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- When clicking â€˜Execute workflowâ€™ | n8n-nodes-base.manualTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.documentDefaultDataLoader | 1 |
| @n8n/n8n-nodes-langchain.embeddingsOpenAi | 1 |
| @n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter | 1 |
| @n8n/n8n-nodes-langchain.vectorStorePinecone | 1 |
| n8n-nodes-base.googleDrive | 2 |
| n8n-nodes-base.manualTrigger | 1 |
| n8n-nodes-base.merge | 1 |
| n8n-nodes-base.noOp | 1 |
| n8n-nodes-base.set | 4 |
| n8n-nodes-base.splitInBatches | 1 |
| n8n-nodes-base.switch | 1 |

## Credentials Referenced

- googleDriveOAuth2Api: Google Drive account
- pineconeApi: My PineconeApi account

## External Dependencies Detected

### URL Hints

- None detected.

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- Embeddings OpenAI -> Pinecone Vector Store (source output 0, target input 0)
- Default Data Loader -> Pinecone Vector Store (source output 0, target input 0)
- Recursive Character Text Splitter -> Default Data Loader (source output 0, target input 0)
- When clicking â€˜Execute workflowâ€™ -> Search files and folders (source output 0, target input 0)
- Search files and folders -> Loop Over Items (source output 0, target input 0)
- Loop Over Items -> Download file (source output 0, target input 0)
- Loop Over Items -> Replace Me (source output 1, target input 0)
- Replace Me -> Loop Over Items (source output 0, target input 0)
- Download file -> Switch (source output 0, target input 0)
- Switch -> Edit Fields (source output 0, target input 0)
- Switch -> Edit Fields1 (source output 1, target input 0)
- Switch -> Edit Fields2 (source output 2, target input 0)
- Switch -> Edit Fields3 (source output 3, target input 0)
- Edit Fields1 -> Merge (source output 0, target input 1)
- Edit Fields -> Merge (source output 0, target input 0)
- Edit Fields2 -> Merge (source output 0, target input 2)
- Edit Fields3 -> Merge (source output 0, target input 3)
- Merge -> Pinecone Vector Store (source output 0, target input 0)

## Nodes

### Default Data Loader

| Field | Value |
| --- | --- |
| Node ID | 24ea558d-4815-466c-92cc-9f768ecfe52a |
| Type | @n8n/n8n-nodes-langchain.documentDefaultDataLoader |
| Type Version | 1.1 |
| Position | 464, 480 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Recursive Character Text Splitter -> Default Data Loader (output 0, input 0)

**Outgoing Connections**

- Default Data Loader -> Pinecone Vector Store (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "dataType":  "binary",
    "textSplittingMode":  "custom",
    "options":  {

                }
}
```

### Download file

| Field | Value |
| --- | --- |
| Node ID | e081d1d2-6d6d-4038-82b9-47e9a58969ab |
| Type | n8n-nodes-base.googleDrive |
| Type Version | 3 |
| Position | -560, 352 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop Over Items -> Download file (output 0, input 0)

**Outgoing Connections**

- Download file -> Switch (output 0, input 0)

**Credential References**

```json
{
    "googleDriveOAuth2Api":  {
                                 "id":  "ag6O5VMcRb6uzeUo",
                                 "name":  "Google Drive account"
                             }
}
```

**Full Parameter Snapshot**

```json
{
    "operation":  "download",
    "fileId":  {
                   "__rl":  true,
                   "value":  "={{$json[\"id\"]}}",
                   "mode":  "id"
               },
    "options":  {

                }
}
```

### Edit Fields

| Field | Value |
| --- | --- |
| Node ID | 0418c94d-0b27-4ff5-a5e4-065a78640270 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -112, 64 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch -> Edit Fields (output 0, input 0)

**Outgoing Connections**

- Edit Fields -> Merge (output 0, input 0)

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
                                                "id":  "174015a8-2908-4997-8afa-4ce19af3627d",
                                                "name":  "source",
                                                "value":  "rca",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "47bae816-aff7-48a0-8c9c-96b3492e85c6",
                                                "name":  "document_type",
                                                "value":  "root_cause_analysis",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "3b967595-b088-48c9-91e1-70eed0dd88ed",
                                                "name":  "module",
                                                "value":  "payment",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "5fed7e8d-c9c2-4d01-8263-e64e895eb57b",
                                                "name":  "file_name",
                                                "value":  "={{$json[\"name\"]}}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "includeOtherFields":  true,
    "options":  {

                }
}
```

### Edit Fields1

| Field | Value |
| --- | --- |
| Node ID | 4f222924-a3ca-43ba-9c93-3293c79d7676 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -112, 256 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch -> Edit Fields1 (output 1, input 0)

**Outgoing Connections**

- Edit Fields1 -> Merge (output 0, input 1)

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
                                                "id":  "7f4ea80d-e592-4841-a6a7-37fbe9e0eabf",
                                                "name":  "source",
                                                "value":  "logs",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "805c9520-076c-4251-8cfb-32b701d9196d",
                                                "name":  "document_type ",
                                                "value":  "application_logs",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "b21af10c-18d5-43ba-a42c-344a1278170b",
                                                "name":  "file_name",
                                                "value":  "={{$json[\"name\"]}}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "includeOtherFields":  true,
    "options":  {

                }
}
```

### Edit Fields2

| Field | Value |
| --- | --- |
| Node ID | cfd70f31-165b-4d45-ae0a-500cb574bdfd |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -112, 448 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch -> Edit Fields2 (output 2, input 0)

**Outgoing Connections**

- Edit Fields2 -> Merge (output 0, input 2)

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
                                                "id":  "c9572083-d100-47c9-9223-d1bf3666df16",
                                                "name":  "source",
                                                "value":  "release_notes",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "3d76afc1-34af-4785-88e2-df7a51b1ef1b",
                                                "name":  "release_version",
                                                "value":  "1.6",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "ce2b4104-caf9-4c3e-bbca-e7d802f135e0",
                                                "name":  "document_type",
                                                "value":  "release_document",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "e55197d9-80bb-4955-b107-0284725698b7",
                                                "name":  "file_name",
                                                "value":  "={{$json[\"name\"]}}",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "8d445a0f-cfc7-4de5-97c6-a36a9b829765",
                                                "name":  "",
                                                "value":  "",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "includeOtherFields":  true,
    "options":  {

                }
}
```

### Edit Fields3

| Field | Value |
| --- | --- |
| Node ID | 9f1ba73c-615f-4020-8a3a-73f465b25ca6 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -112, 640 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Switch -> Edit Fields3 (output 3, input 0)

**Outgoing Connections**

- Edit Fields3 -> Merge (output 0, input 3)

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
                                                "id":  "09178f61-11e5-44fc-9c63-69af77e45a00",
                                                "name":  "source",
                                                "value":  "historical_defects",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "cfc14f0f-8dfe-401f-9264-27d8d933bceb",
                                                "name":  "document_type",
                                                "value":  "defect_dataset",
                                                "type":  "string"
                                            },
                                            {
                                                "id":  "02df520b-374b-4c9c-9705-c13842c98189",
                                                "name":  "file_name",
                                                "value":  "={{$json[\"name\"]}}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "includeOtherFields":  true,
    "options":  {

                }
}
```

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | 60ebfd36-2fa6-4699-8d49-ace9d8f45479 |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | 336, 480 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Embeddings OpenAI -> Pinecone Vector Store (output 0, input 0)

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
| Node ID | dc5d9d3d-5ec9-4d42-8a44-f7dd3df264e7 |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -784, 496 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search files and folders -> Loop Over Items (output 0, input 0)
- Replace Me -> Loop Over Items (output 0, input 0)

**Outgoing Connections**

- Loop Over Items -> Download file (output 0, input 0)
- Loop Over Items -> Replace Me (output 1, input 0)

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
| Node ID | f5a40152-ec37-4b38-8c61-3c971b82733b |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 112, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Edit Fields1 -> Merge (output 0, input 1)
- Edit Fields -> Merge (output 0, input 0)
- Edit Fields2 -> Merge (output 0, input 2)
- Edit Fields3 -> Merge (output 0, input 3)

**Outgoing Connections**

- Merge -> Pinecone Vector Store (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "numberInputs":  4
}
```

### Pinecone Vector Store

| Field | Value |
| --- | --- |
| Node ID | 97701157-70d3-4144-b3d0-8fe4973b9348 |
| Type | @n8n/n8n-nodes-langchain.vectorStorePinecone |
| Type Version | 1.3 |
| Position | 368, 256 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Embeddings OpenAI -> Pinecone Vector Store (output 0, input 0)
- Default Data Loader -> Pinecone Vector Store (output 0, input 0)
- Merge -> Pinecone Vector Store (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
{
    "pineconeApi":  {
                        "id":  "dRzUiwU07mfFG9fn",
                        "name":  "My PineconeApi account"
                    }
}
```

**Full Parameter Snapshot**

```json
{
    "mode":  "insert",
    "pineconeIndex":  {
                          "__rl":  true,
                          "value":  "nagpdatapreprocessor",
                          "mode":  "list",
                          "cachedResultName":  "nagpdatapreprocessor"
                      },
    "options":  {

                }
}
```

### Recursive Character Text Splitter

| Field | Value |
| --- | --- |
| Node ID | 6ac32933-2d6f-4c72-a095-430452dcd566 |
| Type | @n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter |
| Type Version | 1 |
| Position | 544, 688 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Recursive Character Text Splitter -> Default Data Loader (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "chunkSize":  500,
    "chunkOverlap":  200,
    "options":  {

                }
}
```

### Replace Me

| Field | Value |
| --- | --- |
| Node ID | 20c002ad-c91b-45ff-9381-2f55f7ab9ef4 |
| Type | n8n-nodes-base.noOp |
| Type Version | 1 |
| Position | -560, 544 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop Over Items -> Replace Me (output 1, input 0)

**Outgoing Connections**

- Replace Me -> Loop Over Items (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### Search files and folders

| Field | Value |
| --- | --- |
| Node ID | dc17fa5a-ad6d-4c99-87b2-e29a34f809cf |
| Type | n8n-nodes-base.googleDrive |
| Type Version | 3 |
| Position | -1008, 496 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- When clicking â€˜Execute workflowâ€™ -> Search files and folders (output 0, input 0)

**Outgoing Connections**

- Search files and folders -> Loop Over Items (output 0, input 0)

**Credential References**

```json
{
    "googleDriveOAuth2Api":  {
                                 "id":  "ag6O5VMcRb6uzeUo",
                                 "name":  "Google Drive account"
                             }
}
```

**Full Parameter Snapshot**

```json
{
    "resource":  "fileFolder",
    "searchMethod":  "query",
    "queryString":  "\u002713tbNeWdP5Ra5R4xp-TElBrwxVa77xMey\u0027 in parents",
    "returnAll":  true,
    "filter":  {

               },
    "options":  {

                }
}
```

### Switch

| Field | Value |
| --- | --- |
| Node ID | ba54732b-2e70-4669-ab13-426b0b487e21 |
| Type | n8n-nodes-base.switch |
| Type Version | 3.4 |
| Position | -336, 320 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Download file -> Switch (output 0, input 0)

**Outgoing Connections**

- Switch -> Edit Fields (output 0, input 0)
- Switch -> Edit Fields1 (output 1, input 0)
- Switch -> Edit Fields2 (output 2, input 0)
- Switch -> Edit Fields3 (output 3, input 0)

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
                                                                               "leftValue":  "={{$json[\"name\"]}}",
                                                                               "rightValue":  "RCA",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "contains"
                                                                                            },
                                                                               "id":  "f25e1ac8-3cd6-4b4d-9f01-4766bb53bdd0"
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
                                                                               "id":  "7729fd45-bc01-480b-8e76-fad198b4f57f",
                                                                               "leftValue":  "={{$json[\"name\"]}}",
                                                                               "rightValue":  "logs",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "contains"
                                                                                            }
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
                                                                               "id":  "8b1154a6-c9b6-48a2-9002-4bc4f540a0b6",
                                                                               "leftValue":  "={{$json[\"name\"]}}",
                                                                               "rightValue":  "Release",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "contains"
                                                                                            }
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
                                                                               "id":  "275ae780-ff30-4f83-a2a1-73fb102f2677",
                                                                               "leftValue":  "={{$json[\"name\"]}}",
                                                                               "rightValue":  "csv",
                                                                               "operator":  {
                                                                                                "type":  "string",
                                                                                                "operation":  "contains"
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

### When clicking â€˜Execute workflowâ€™

| Field | Value |
| --- | --- |
| Node ID | 687134ec-a79e-4270-83f3-3eb5f03c3ed0 |
| Type | n8n-nodes-base.manualTrigger |
| Type Version | 1 |
| Position | -1232, 496 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- When clicking â€˜Execute workflowâ€™ -> Search files and folders (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```
