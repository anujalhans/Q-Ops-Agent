# NAGP-Data-preprocssor - Defect Intelligence

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | ij7m4kdXx4KFWfOz |
| Active | False |
| Archived | False |
| Created At | 2026-03-31T07:42:31.552Z |
| Updated At | 2026-03-31T07:47:44.258Z |
| Node Count | 9 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\NAGP-Data-preprocssor - Defect Intelligence [ij7m4kdXx4KFWfOz].json |

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
| n8n-nodes-base.noOp | 1 |
| n8n-nodes-base.splitInBatches | 1 |

## Credentials Referenced

- googleDriveOAuth2Api: Google Drive account
- openAiApi: OpenAi Paid Account (Aonu)
- pineconeApi: My PineconeApi account

## External Dependencies Detected

### URL Hints

- https://drive.google.com/drive/folders/1_hCicqKnOv_5ZlRCoiN3-eOxrsQKIrSU

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- Download file -> Pinecone Vector Store (source output 0, target input 0)
- Embeddings OpenAI -> Pinecone Vector Store (source output 0, target input 0)
- Default Data Loader -> Pinecone Vector Store (source output 0, target input 0)
- Recursive Character Text Splitter -> Default Data Loader (source output 0, target input 0)
- Loop Over Items -> Download file (source output 0, target input 0)
- Loop Over Items -> Replace Me (source output 1, target input 0)
- Replace Me -> Loop Over Items (source output 0, target input 0)
- When clicking â€˜Execute workflowâ€™ -> Search files and folders (source output 0, target input 0)
- Search files and folders -> Loop Over Items (source output 0, target input 0)

## Nodes

### Default Data Loader

| Field | Value |
| --- | --- |
| Node ID | a5180908-3933-4f83-853f-0465b664ba13 |
| Type | @n8n/n8n-nodes-langchain.documentDefaultDataLoader |
| Type Version | 1.1 |
| Position | -48, 336 |
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
                    "metadata":  {
                                     "metadataValues":  [
                                                            {
                                                                "name":  "filename",
                                                                "value":  "={{ $(\u0027Download file\u0027).item.json.name }}"
                                                            }
                                                        ]
                                 }
                }
}
```

### Download file

| Field | Value |
| --- | --- |
| Node ID | 44e66151-b645-4a7b-a994-cc8c8a583c3e |
| Type | n8n-nodes-base.googleDrive |
| Type Version | 3 |
| Position | -448, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Loop Over Items -> Download file (output 0, input 0)

**Outgoing Connections**

- Download file -> Pinecone Vector Store (output 0, input 0)

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
                   "value":  "={{ $json.id }}",
                   "mode":  "id"
               },
    "options":  {

                }
}
```

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | d973d4b5-c251-4957-ba40-ecdd7d485f44 |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | -320, 416 |
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

### Loop Over Items

| Field | Value |
| --- | --- |
| Node ID | f370fdd6-4ff5-47b8-b1e1-f0bab0b452fe |
| Type | n8n-nodes-base.splitInBatches |
| Type Version | 3 |
| Position | -896, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Replace Me -> Loop Over Items (output 0, input 0)
- Search files and folders -> Loop Over Items (output 0, input 0)

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

### Pinecone Vector Store

| Field | Value |
| --- | --- |
| Node ID | d6d8d02a-e1f2-4e17-a48c-afdd8b850cea |
| Type | @n8n/n8n-nodes-langchain.vectorStorePinecone |
| Type Version | 1.3 |
| Position | -144, 144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Download file -> Pinecone Vector Store (output 0, input 0)
- Embeddings OpenAI -> Pinecone Vector Store (output 0, input 0)
- Default Data Loader -> Pinecone Vector Store (output 0, input 0)

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
                          "value":  "defect-intelligence",
                          "mode":  "list",
                          "cachedResultName":  "defect-intelligence"
                      },
    "options":  {

                }
}
```

### Recursive Character Text Splitter

| Field | Value |
| --- | --- |
| Node ID | 24bc59a1-73e5-4510-b3f5-0d292b8b90d6 |
| Type | @n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter |
| Type Version | 1 |
| Position | 80, 496 |
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
| Node ID | c8c4d095-96e1-458d-8f5a-e9e6db097c17 |
| Type | n8n-nodes-base.noOp |
| Type Version | 1 |
| Position | -672, 512 |
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
| Node ID | 9e5dc9ee-c4d4-4152-9226-8170c3bd295c |
| Type | n8n-nodes-base.googleDrive |
| Type Version | 3 |
| Position | -1104, 304 |
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
    "filter":  {
                   "folderId":  {
                                    "__rl":  true,
                                    "value":  "1_hCicqKnOv_5ZlRCoiN3-eOxrsQKIrSU",
                                    "mode":  "list",
                                    "cachedResultName":  "NAGP - Defect Intelligence",
                                    "cachedResultUrl":  "https://drive.google.com/drive/folders/1_hCicqKnOv_5ZlRCoiN3-eOxrsQKIrSU"
                                }
               },
    "options":  {

                }
}
```

### When clicking â€˜Execute workflowâ€™

| Field | Value |
| --- | --- |
| Node ID | ad3fc1fb-3d05-46c1-8fd7-f0ea2153389b |
| Type | n8n-nodes-base.manualTrigger |
| Type Version | 1 |
| Position | -1360, 304 |
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
