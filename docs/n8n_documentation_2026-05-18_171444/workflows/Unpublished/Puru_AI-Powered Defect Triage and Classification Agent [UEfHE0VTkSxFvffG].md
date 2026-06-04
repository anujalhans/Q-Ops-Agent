# Puru_AI-Powered Defect Triage and Classification Agent

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | UEfHE0VTkSxFvffG |
| Active | False |
| Archived | False |
| Created At | 2026-03-31T06:42:06.320Z |
| Updated At | 2026-03-31T07:20:26.503Z |
| Node Count | 6 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Puru_AI-Powered Defect Triage and Classification Agent [UEfHE0VTkSxFvffG].json |

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
| Node ID | 2c38e52f-0fdd-476a-a50a-68e20cbc2ec5 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3.1 |
| Position | 192, 16 |
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
    "hasOutputParser":  true,
    "options":  {
                    "systemMessage":  "You are a defect triage assistant. When a user reports a defect, analyze it thoroughly and provide a structured response.\n\nYour analysis should include:\n1. Search the vector store for similar or duplicate defects (similarity \u003e 90% indicates duplicate)\n2. Suggest appropriate severity level (Critical/High/Medium/Low) with clear reasoning\n3. Suggest priority level (P0/P1/P2/P3/P4) with justification\n4. Identify probable root cause based on similar defects and patterns\n5. Assess your confidence level in the analysis\n6. Reference all sources used in your analysis\n\nFor similar_defects_found:\n- Mark is_duplicate as true if similarity \u003e 90%\n- Include defect_id, description, and similarity_score for each match\n- If no similar defects found, return empty array\n\nBe thorough in your reasoning and always explain WHY you\u0027re making each suggestion."
                }
}
```

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | 4553c2d8-bba3-4c88-a432-3fd53633b9b6 |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | 368, 512 |
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

### OpenAI Chat Model

| Field | Value |
| --- | --- |
| Node ID | badaef1e-e51f-4b96-ba6d-0c2b1d718b99 |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.3 |
| Position | -48, 240 |
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
None
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
| Node ID | aa20f592-48d1-41e7-a399-3be72a22e72f |
| Type | @n8n/n8n-nodes-langchain.vectorStorePinecone |
| Type Version | 1.3 |
| Position | 288, 304 |
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
    "toolDescription":  "When a new defect is submitted, the AI agent should:\nâ€¢Suggest probable severity\nâ€¢Suggest probable priority\nâ€¢Identify similar/duplicate defects\nâ€¢Suggest possible root cause category\nâ€¢Recommend impacted module\nâ€¢Provide reasoning behind suggestions",
    "pineconeIndex":  {
                          "__rl":  true,
                          "value":  "nagpdatapreprocessor",
                          "mode":  "list",
                          "cachedResultName":  "nagpdatapreprocessor"
                      },
    "topK":  10,
    "options":  {

                }
}
```

### Simple Memory

| Field | Value |
| --- | --- |
| Node ID | ed55942b-773f-4be3-a732-f3bb9ccc9a7f |
| Type | @n8n/n8n-nodes-langchain.memoryBufferWindow |
| Type Version | 1.3 |
| Position | 144, 256 |
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
| Node ID | bc39e926-2deb-4fdf-bbe6-833019825635 |
| Type | @n8n/n8n-nodes-langchain.chatTrigger |
| Type Version | 1.4 |
| Position | -192, 16 |
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
