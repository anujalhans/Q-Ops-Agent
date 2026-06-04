# My Sub-workflow

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | VlsQ96Ok64BoaQea |
| Active | False |
| Archived | True |
| Created At | 2026-02-23T10:48:37.164Z |
| Updated At | 2026-02-24T11:28:40.000Z |
| Node Count | 2 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\My Sub-workflow [VlsQ96Ok64BoaQea].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Start | n8n-nodes-base.executeWorkflowTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.embeddingsOpenAi | 1 |
| n8n-nodes-base.executeWorkflowTrigger | 1 |

## Credentials Referenced

- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- None detected.

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- No connections detected.

## Nodes

### Embeddings OpenAI1

| Field | Value |
| --- | --- |
| Node ID | 9fa41d82-97a4-4a86-83a4-566795f933a1 |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | -7712, -48 |
| Disabled | False |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

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
    "notice":  "",
    "model":  "text-embedding-3-small",
    "options":  {

                }
}
```

### Start

| Field | Value |
| --- | --- |
| Node ID | 8877081a-7de1-4009-960b-4277ca56e071 |
| Type | n8n-nodes-base.executeWorkflowTrigger |
| Type Version | 1.1 |
| Position | -7920, -48 |
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
    "inputSource":  "passthrough"
}
```
