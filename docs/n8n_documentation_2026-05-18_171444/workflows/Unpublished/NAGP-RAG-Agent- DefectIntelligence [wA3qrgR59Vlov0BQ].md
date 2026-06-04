# NAGP-RAG-Agent- DefectIntelligence

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | wA3qrgR59Vlov0BQ |
| Active | False |
| Archived | False |
| Created At | 2026-03-31T07:44:39.701Z |
| Updated At | 2026-03-31T07:45:27.896Z |
| Node Count | 6 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\NAGP-RAG-Agent- DefectIntelligence [wA3qrgR59Vlov0BQ].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- When chat message received | @n8n/n8n-nodes-langchain.chatTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.agent | 1 |
| @n8n/n8n-nodes-langchain.chatTrigger | 1 |
| @n8n/n8n-nodes-langchain.embeddingsOpenAi | 1 |
| @n8n/n8n-nodes-langchain.lmChatOpenAi | 1 |
| @n8n/n8n-nodes-langchain.memoryBufferWindow | 1 |
| @n8n/n8n-nodes-langchain.vectorStorePinecone | 1 |

## Credentials Referenced

- openAiApi: OpenAi Paid Account (Aonu)
- pineconeApi: My PineconeApi account

## External Dependencies Detected

### URL Hints

- None detected.

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- When chat message received -> AI Agent (source output 0, target input 0)
- OpenAI Chat Model -> AI Agent (source output 0, target input 0)
- Simple Memory -> AI Agent (source output 0, target input 0)
- Pinecone Vector Store -> AI Agent (source output 0, target input 0)
- Embeddings OpenAI -> Pinecone Vector Store (source output 0, target input 0)

## Nodes

### AI Agent

| Field | Value |
| --- | --- |
| Node ID | f8b0e141-4796-4e03-988e-53ccbb1db568 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3.1 |
| Position | 96, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- When chat message received -> AI Agent (output 0, input 0)
- OpenAI Chat Model -> AI Agent (output 0, input 0)
- Simple Memory -> AI Agent (output 0, input 0)
- Pinecone Vector Store -> AI Agent (output 0, input 0)

**Outgoing Connections**

- None

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

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | b758005a-312b-4751-a621-72f6a9268dbd |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | 512, 432 |
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

### OpenAI Chat Model

| Field | Value |
| --- | --- |
| Node ID | 67c196e2-e792-431b-a20e-0a29835a68c9 |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.3 |
| Position | -144, 352 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OpenAI Chat Model -> AI Agent (output 0, input 0)

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
                  "value":  "gpt-4o-mini",
                  "mode":  "list",
                  "cachedResultName":  "gpt-4o-mini"
              },
    "builtInTools":  {

                     },
    "options":  {

                }
}
```

### Pinecone Vector Store

| Field | Value |
| --- | --- |
| Node ID | 8e04420d-3584-45a2-ba86-96535666ab6e |
| Type | @n8n/n8n-nodes-langchain.vectorStorePinecone |
| Type Version | 1.3 |
| Position | 256, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Embeddings OpenAI -> Pinecone Vector Store (output 0, input 0)

**Outgoing Connections**

- Pinecone Vector Store -> AI Agent (output 0, input 0)

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
    "mode":  "retrieve-as-tool",
    "toolDescription":  "You MUST search this vector database before answering any question about the defects related questions",
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

### Simple Memory

| Field | Value |
| --- | --- |
| Node ID | 5da13c55-5835-4067-bdcc-de781ebb9301 |
| Type | @n8n/n8n-nodes-langchain.memoryBufferWindow |
| Type Version | 1.3 |
| Position | 32, 368 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Simple Memory -> AI Agent (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{

}
```

### When chat message received

| Field | Value |
| --- | --- |
| Node ID | bad722b7-32ad-4d2a-81a8-45aefa50bad1 |
| Type | @n8n/n8n-nodes-langchain.chatTrigger |
| Type Version | 1.4 |
| Position | -112, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- When chat message received -> AI Agent (output 0, input 0)

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
