# Github->Jenkins Job Trigger

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | FAkgwawIgaG54lOY |
| Active | False |
| Archived | False |
| Created At | 2025-10-03T17:31:37.799Z |
| Updated At | 2026-03-10T12:37:24.964Z |
| Node Count | 10 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Github- Jenkins Job Trigger [FAkgwawIgaG54lOY].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Git-Push WebHook | n8n-nodes-base.webhook | POST | /github-webhook

Known webhook route hints:

- POST /webhook/github-webhook

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 4 |
| n8n-nodes-base.if | 2 |
| n8n-nodes-base.wait | 2 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpBasicAuth: Jenkins

## External Dependencies Detected

### URL Hints

- http://localhost:8080/job/Selenium-Automation-Tests/{{$json[\
- http://localhost:8080/job/Selenium-Automation-Tests/build?11aae15c077290bdeb52fb322cd0849bba
- http://localhost:8080/job/Selenium-Automation-Tests/lastBuild/api/json
- http://localhost:8080/job/Selenium-Automation-Tests/lastSuccessfulBuild/artifact/reports/extent-report.html

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- Git-Push WebHook -> Check Target Branch (source output 0, target input 0)
- Trigger Jenkins Job -> Wait for Jenkins Build to Start (source output 0, target input 0)
- Check Target Branch -> Trigger Jenkins Job (source output 0, target input 0)
- Poll Jenkins Build Status -> Check If Build In Progress (source output 0, target input 0)
- Check If Build In Progress -> Wait (source output 0, target input 0)
- Check If Build In Progress -> Check Build Result (source output 1, target input 0)
- Wait -> Poll Jenkins Build Status (source output 0, target input 0)
- Check Build Result -> Generate the Extent Report (source output 0, target input 0)
- Get Last Build Info -> Poll Jenkins Build Status (source output 0, target input 0)
- Wait for Jenkins Build to Start -> Get Last Build Info (source output 0, target input 0)

## Nodes

### Check Build Result

| Field | Value |
| --- | --- |
| Node ID | c1d205c2-7fe6-48de-9c8b-926bf7784362 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 1440, -384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Check If Build In Progress -> Check Build Result (output 1, input 0)

**Outgoing Connections**

- Check Build Result -> Generate the Extent Report (output 0, input 0)

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
                                              "id":  "00aead07-7d8e-48d4-80f9-fea59e2e7569",
                                              "leftValue":  "={{ $json[\"result\"] }}",
                                              "rightValue":  "SUCCESS",
                                              "operator":  {
                                                               "type":  "string",
                                                               "operation":  "equals",
                                                               "name":  "filter.operator.equals"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Check If Build In Progress

| Field | Value |
| --- | --- |
| Node ID | d59e6c19-6e62-4693-b727-a49c3fbb1cf6 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 1216, -336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Poll Jenkins Build Status -> Check If Build In Progress (output 0, input 0)

**Outgoing Connections**

- Check If Build In Progress -> Wait (output 0, input 0)
- Check If Build In Progress -> Check Build Result (output 1, input 0)

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
                                       "typeValidation":  "loose",
                                       "version":  2
                                   },
                       "conditions":  [
                                          {
                                              "id":  "3a12a5b9-743d-48c6-9dc5-02e92ecb4a57",
                                              "leftValue":  "={{ $json[\"building\"] }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "equals"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "looseTypeValidation":  true,
    "options":  {

                }
}
```

### Check Target Branch

| Field | Value |
| --- | --- |
| Node ID | 95e9fa14-b17a-43bb-bc10-a39cf75bc64b |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 112, -272 |
| Disabled |  |
| Always Output Data | False |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Git-Push WebHook -> Check Target Branch (output 0, input 0)

**Outgoing Connections**

- Check Target Branch -> Trigger Jenkins Job (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\nconst ref = items[0].json.body?.ref; // e.g., \"refs/heads/main\"\nconst branch = ref ? ref.split(\u0027/\u0027).pop() : \u0027\u0027;\n\nif (branch === \u0027main\u0027) {\n  // âœ… Return all input items as output\n  return items;\n} else {\n  console.log(`Push detected on non-main branch: ${branch}. Skipping Jenkins trigger.`);\n  // ðŸ›‘ Return empty array to stop workflow\n  return [];\n}\n"
}
```

### Generate the Extent Report

| Field | Value |
| --- | --- |
| Node ID | 59a4f05e-5681-462e-85b4-377e50c6cea1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 1664, -400 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Check Build Result -> Generate the Extent Report (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "jafTB364O8QBqOzJ",
                          "name":  "Jenkins"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "http://localhost:8080/job/Selenium-Automation-Tests/lastSuccessfulBuild/artifact/reports/extent-report.html",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "options":  {
                    "response":  {
                                     "response":  {
                                                      "responseFormat":  "file"
                                                  }
                                 }
                }
}
```

### Get Last Build Info

| Field | Value |
| --- | --- |
| Node ID | 7050adf8-8102-4cfe-9493-c539fee8fdeb |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 768, -272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Wait for Jenkins Build to Start -> Get Last Build Info (output 0, input 0)

**Outgoing Connections**

- Get Last Build Info -> Poll Jenkins Build Status (output 0, input 0)

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "jafTB364O8QBqOzJ",
                          "name":  "Jenkins"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "http://localhost:8080/job/Selenium-Automation-Tests/lastBuild/api/json",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "options":  {
                    "response":  {
                                     "response":  {
                                                      "responseFormat":  "json"
                                                  }
                                 }
                }
}
```

### Git-Push WebHook

| Field | Value |
| --- | --- |
| Node ID | 75a690f5-0781-4bf0-9483-6f9971004624 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | -112, -272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Git-Push WebHook -> Check Target Branch (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "/github-webhook",
    "options":  {

                }
}
```

### Poll Jenkins Build Status

| Field | Value |
| --- | --- |
| Node ID | 43241da3-1e1c-4d93-815c-56ccd7a785e3 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 992, -272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Wait -> Poll Jenkins Build Status (output 0, input 0)
- Get Last Build Info -> Poll Jenkins Build Status (output 0, input 0)

**Outgoing Connections**

- Poll Jenkins Build Status -> Check If Build In Progress (output 0, input 0)

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "jafTB364O8QBqOzJ",
                          "name":  "Jenkins"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "=http://localhost:8080/job/Selenium-Automation-Tests/{{$json[\"number\"]}}/api/json",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "options":  {
                    "response":  {
                                     "response":  {
                                                      "responseFormat":  "json"
                                                  }
                                 }
                }
}
```

### Trigger Jenkins Job

| Field | Value |
| --- | --- |
| Node ID | e3acbe2b-f192-4bb3-9801-3bd26c15dd15 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 336, -272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Check Target Branch -> Trigger Jenkins Job (output 0, input 0)

**Outgoing Connections**

- Trigger Jenkins Job -> Wait for Jenkins Build to Start (output 0, input 0)

**Credential References**

```json
{
    "httpBasicAuth":  {
                          "id":  "jafTB364O8QBqOzJ",
                          "name":  "Jenkins"
                      }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "http://localhost:8080/job/Selenium-Automation-Tests/build?11aae15c077290bdeb52fb322cd0849bba",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpBasicAuth",
    "options":  {

                }
}
```

### Wait

| Field | Value |
| --- | --- |
| Node ID | 5f4d496c-c120-4d72-a2a3-82c975bb8a27 |
| Type | n8n-nodes-base.wait |
| Type Version | 1.1 |
| Position | 1440, -176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Check If Build In Progress -> Wait (output 0, input 0)

**Outgoing Connections**

- Wait -> Poll Jenkins Build Status (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "amount":  15
}
```

### Wait for Jenkins Build to Start

| Field | Value |
| --- | --- |
| Node ID | 5e867f54-6fd1-4fe4-a612-084290d202ee |
| Type | n8n-nodes-base.wait |
| Type Version | 1.1 |
| Position | 544, -272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Trigger Jenkins Job -> Wait for Jenkins Build to Start (output 0, input 0)

**Outgoing Connections**

- Wait for Jenkins Build to Start -> Get Last Build Info (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "amount":  10
}
```

