# Intelligent Quality Engineering Documentation Generator

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | jKI3mzjtDyezA3eP |
| Active | False |
| Archived | False |
| Created At | 2026-02-23T11:28:38.557Z |
| Updated At | 2026-03-11T05:58:16.168Z |
| Node Count | 11 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Intelligent Quality Engineering Documentation Generator [jKI3mzjtDyezA3eP].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Webhook | n8n-nodes-base.webhook | POST | generate-qa-doc

Known webhook route hints:

- POST /webhook/generate-qa-doc

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.agent | 1 |
| @n8n/n8n-nodes-langchain.embeddingsOpenAi | 1 |
| @n8n/n8n-nodes-langchain.lmChatOpenAi | 1 |
| @n8n/n8n-nodes-langchain.vectorStoreChromaDB | 1 |
| n8n-nodes-base.code | 3 |
| n8n-nodes-base.googleDrive | 1 |
| n8n-nodes-base.httpRequest | 1 |
| n8n-nodes-base.merge | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- chromaCloudApi: ChromaDB Self-Hosted account
- googleDriveOAuth2Api: Google Drive account
- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- http://127.0.0.1:5050/convert
- https://drive.google.com/drive/folders/1SNy6fJ4A-NvaHy9046n-UwC3UUPo4gwj

### Supabase/Data Table Hints

- None detected.

## Connection Graph

- OpenAI Chat Model -> Generator Agent (source output 0, target input 0)
- Chroma Vector Store -> Generator Agent (source output 0, target input 0)
- Embeddings OpenAI -> Chroma Vector Store (source output 0, target input 0)
- Convert md to docx -> Upload file (source output 0, target input 0)
- Clean Markdown Formatting -> Merge (source output 0, target input 1)
- Validate AI Agent Output -> Clean Markdown Formatting (source output 0, target input 0)
- Generator Agent -> Validate AI Agent Output (source output 0, target input 0)
- Webhook -> Prompt Library (source output 0, target input 0)
- Webhook -> Merge (source output 0, target input 0)
- Prompt Library -> Generator Agent (source output 0, target input 0)
- Merge -> Convert md to docx (source output 0, target input 0)

## Nodes

### Chroma Vector Store

| Field | Value |
| --- | --- |
| Node ID | 4e16a1e0-5120-4517-b143-dd5469ae0782 |
| Type | @n8n/n8n-nodes-langchain.vectorStoreChromaDB |
| Type Version | 1.3 |
| Position | 688, 176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Embeddings OpenAI -> Chroma Vector Store (output 0, input 0)

**Outgoing Connections**

- Chroma Vector Store -> Generator Agent (output 0, input 0)

**Credential References**

```json
{
    "chromaCloudApi":  {
                           "id":  "vFAjhz7sZ0XQGaUU",
                           "name":  "ChromaDB Self-Hosted account"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "mode":  "retrieve-as-tool",
    "toolDescription":  "Retrieves relevant data for document generation",
    "authentication":  "chromaCloudApi",
    "chromaCollection":  {
                             "__rl":  true,
                             "value":  "NQLB-Demo-DB",
                             "mode":  "list",
                             "cachedResultName":  "NQLB-Demo-DB"
                         },
    "topK":  30,
    "options":  {
                    "metadata":  {
                                     "metadataValues":  [
                                                            {
                                                                "name":  "projectName",
                                                                "value":  "={{ $(\u0027Prompt Library\u0027).item.json.projectName }}"
                                                            }
                                                        ]
                                 }
                }
}
```

### Clean Markdown Formatting

| Field | Value |
| --- | --- |
| Node ID | be83f4db-681e-455c-95cc-7fdf5f60a70d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1168, -48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Validate AI Agent Output -> Clean Markdown Formatting (output 0, input 0)

**Outgoing Connections**

- Clean Markdown Formatting -> Merge (output 0, input 1)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "let markdown = $json.rawMarkdown;\n\n// Remove ```markdown wrappers if present\nmarkdown = markdown.replace(/```markdown/g, \u0027\u0027);\nmarkdown = markdown.replace(/```/g, \u0027\u0027);\n\nreturn [{ json: { cleanedMarkdown: markdown } }];\n"
}
```

### Convert md to docx

| Field | Value |
| --- | --- |
| Node ID | da815bf2-8dc9-4b6c-b046-d2c6c5f9dc83 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.3 |
| Position | 1616, -208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge -> Convert md to docx (output 0, input 0)

**Outgoing Connections**

- Convert md to docx -> Upload file (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "http://127.0.0.1:5050/convert",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "markdown",
                                                  "value":  "={{ $json.cleanedMarkdown }}"
                                              },
                                              {
                                                  "name":  "documentType",
                                                  "value":  "={{ $json.body.documentType }}"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### Embeddings OpenAI

| Field | Value |
| --- | --- |
| Node ID | f6affcbe-1d3d-449c-b58b-53a78cbb2d38 |
| Type | @n8n/n8n-nodes-langchain.embeddingsOpenAi |
| Type Version | 1.2 |
| Position | 592, 352 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Embeddings OpenAI -> Chroma Vector Store (output 0, input 0)

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

### Generator Agent

| Field | Value |
| --- | --- |
| Node ID | 29511e68-bfe2-4c7c-afbc-659086687064 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3.1 |
| Position | 480, -48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OpenAI Chat Model -> Generator Agent (output 0, input 0)
- Chroma Vector Store -> Generator Agent (output 0, input 0)
- Prompt Library -> Generator Agent (output 0, input 0)

**Outgoing Connections**

- Generator Agent -> Validate AI Agent Output (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "promptType":  "define",
    "text":  "={{ $json.user }}",
    "options":  {
                    "systemMessage":  "={{ $json.system }}\n\nDocument Title: {{ $json.title }}\nGenerated On: {{ $now }}\nDocument Type: {{ $json.documentType }}"
                }
}
```

### Merge

| Field | Value |
| --- | --- |
| Node ID | 365b2d96-f550-4967-8819-51dd6076d5c6 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 1392, -208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Clean Markdown Formatting -> Merge (output 0, input 1)
- Webhook -> Merge (output 0, input 0)

**Outgoing Connections**

- Merge -> Convert md to docx (output 0, input 0)

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

### OpenAI Chat Model

| Field | Value |
| --- | --- |
| Node ID | f92aa0c3-78ae-41c9-9043-78c5a3adb7eb |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.3 |
| Position | 336, 176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OpenAI Chat Model -> Generator Agent (output 0, input 0)

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
                  "value":  "gpt-4.1-mini",
                  "mode":  "list",
                  "cachedResultName":  "gpt-4.1-mini"
              },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  8000
                }
}
```

### Prompt Library

| Field | Value |
| --- | --- |
| Node ID | 6eea39a7-b442-4613-bb1f-a14367369af0 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, -48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Prompt Library (output 0, input 0)

**Outgoing Connections**

- Prompt Library -> Generator Agent (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const type = $json.body.documentType;\nconst projectName = $json.body.projectName;\nconst productOwner = $json.body.productOwner;\n\nconst promptLibrary = {\n  test_strategy: {\n    title: \"Enterprise Test Strategy\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Strategy\nGenerated On: {{ $now }}\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Manager and Enterprise Test Strategy Consultant with more than 15 years of experience defining testing standards, quality governance frameworks, and automation-first transformation programs. \n\nYou specialize in:\n- Shift-Left \u0026 Shift-Right quality engineering approaches\n- CI/CD-integrated automated testing pipelines\n- Scalable test architecture across UI, API, performance, and security layers\n- Risk-based and metrics-driven software delivery governance\n\nYou excel at interpreting and synthesizing:\n- Business Requirement Documents (BRD)\n- Functional Requirement Documents (FRD)\n- Low-Level and High-Level Designs (LLD \u0026 HLD)\n- Grooming transcripts and stakeholder discussions\n\nYour outputs must demonstrate:\n- Strategic reasoning supported by traceable statements from the provided context\n- A strong linkage between **business intent â†’ architecture/design implications â†’ test strategy â†’ automation enablement â†’ risk mitigation**\n- A structured, enterprise-grade quality strategy suitable for CXO/leadership consumption\n- Deep elaboration, beyond basic bullet points, showing practical execution methodologies, governance layers, and measurable KPIs\n\nYour writing style should reflect:\n- Professional tone suitable for board-level review\n- Detailed, actionable, and solution-oriented content with clear justification\n- Balanced technical and managerial viewpoint\n`,\n    user: `You are provided with a vector store that combines information from BRD, FRD, HLD, LLD, UI/UX specifications, and grooming session transcripts. \nThis content includes requirements, workflows, data flows, system architecture, constraints, dependencies, and stakeholder expectations.\n\nYour task is to analyze and generate a **comprehensive and production-grade Test Strategy document**, aligned with **Shift-Left**, **Automation-First**, and **Quality Engineering** principles.\n\n=========================\nINSTRUCTIONS (MUST FOLLOW)\n=========================\n\n1. Use direct excerpts or paraphrased statements from the source materials where relevant.\n   - Quote key statements in italics or blockquotes to maintain authenticity.\n   - Cite origin using â€œAs mentioned in BRDâ€¦â€, â€œAccording to HLDâ€¦â€, etc.\n2. Provide deep explanation instead of generic bullet lists â€” elaborate how and why decisions are made.\n3. Demonstrate end-to-end traceability between:\n   **business requirements â†’ test strategy â†’ automation enablement â†’ quality metrics â†’ risk \u0026 mitigation**\n4. Include frameworks, methodology, and governance recommendations.\n5. Use tables, matrices, and hierarchical bullet structures where beneficial.\n6. Minimum expected length per major section: **900 â€“ 1500 words**.\n7. The output must be detailed enough to be presented to engineering leadership and auditors.\n\n====================\nDOCUMENT STRUCTURE\n====================\n\n### Test Strategy Document Structure\n\n1. **Introduction \u0026 Context**\n   - Problem statement \u0026 business need\n   - Strategic objectives of testing\n   - Alignment with enterprise quality vision and success criteria\n\n2. **Testing Scope**\n   - In-scope functional \u0026 non-functional areas (with references)\n   - Out-of-scope items \u0026 rationale\n\n3. **Strategic Testing Approach**\n   - Shift-Left adoption strategy\n   - Shift-Right validation strategy (where applicable)\n   - Testing model (Agile / DevOps / CI-CD-based)\n   - Test levels: Unit, Component, API, UI, E2E, UAT, NFR\n   - Governance and quality gates\n\n4. **Automation Strategy \u0026 Roadmap**\n   - Automation pyramid model alignment\n   - Tools, frameworks, CI/CD orchestration\n   - Prioritization matrix \u0026 ROI considerations\n   - In-sprint automation approach\n   - Resilience \u0026 maintainability standards\n\n5. **Test Environment \u0026 Infrastructure Strategy**\n   - Environment model \u0026 provisioning\n   - Service virtualization \u0026 mocks\n   - Data refresh, versioning \u0026 cloning strategies\n\n6. **Test Data Management Strategy**\n   - Data sourcing (synthetic, masked, production-like)\n   - Boundary / negative / chaos data\n   - Automation-driven data pipeline\n\n7. **Quality Metrics \u0026 Reporting Framework**\n   - KPIs, KRAs, SLAs (Defect density, leakage rate, DRE %, automation coverage etc.)\n   - Dashboards \u0026 transparency mechanisms\n\n8. **Risk-Based Testing \u0026 Mitigation Strategy**\n   - Identified risks + corresponding mitigation \u0026 contingency mapping\n   - Priority-based testing means: risk Ã— impact Ã— likelihood scoring\n\n9. **Roles, Collaboration \u0026 RACI Model**\n\n10. **Compliance, Security \u0026 Regulatory Considerations**\n    - OWASP, data privacy, audit logs, adherence requirements\n\n11. **Tooling \u0026 Integration Landscape**\n    - CI/CD, test frameworks, monitoring \u0026 observability\n\n12. **Communication \u0026 Governance Model**\n\n13. **Appendix / Traceability Matrix**\n    | Source Document | Key Insight | Test Strategy Implication | Automation Feasibility |\n`\n  },\n  test_plan: {\n    title: \"Enterprise Test Plan\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Plan\nGenerated On: {{ $now }}\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Manager with over 15 years of experience leading large-scale enterprise testing programs. \nYou specialize in Shift-Left Quality and Automation-First approaches, integrating QA deeply within CI/CD pipelines.\nYou have extensive experience in transforming raw business and technical documentation into actionable, data-driven, and traceable test strategies.\n\nYou are skilled at reading and interpreting:\n- Business Requirement Documents (BRD)\n- Functional Requirement Documents (FRD)\n- Low-Level Designs (LLD)\n- High-Level Designs (HLD)\n- Grooming session transcripts and stakeholder discussions\n\nYour outputs must demonstrate:\n- Analytical reasoning based directly on excerpts or statements from the provided context.\n- A clear connection between **requirement intent**, **test coverage**, **automation feasibility**, and **risk mitigation \u0026 risk contingency**.\n- A focus on measurable, proactive quality metrics, and early defect prevention.\n- Realistic and context-aware alignment with Shift-Left and Automation-First principles.\n`,\n    user: `You are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI specs, and stakeholder discussions via vector search.. It may include requirements, features, workflows, functional and non-functional details, and stakeholder discussions.\n\nYour task is to analyze the provided context carefully and generate a **comprehensive, professional, and context-grounded Test Plan** aligned with Shift-Left and Automation-First principles.\n\n### Instructions:\n1. Use **direct excerpts or paraphrased statements** from the provided context sources wherever applicable. \n   - Quote important phrases in italics or blockquotes to preserve authenticity.\n   - Reference their origin (e.g., â€œAs mentioned in BRDâ€¦â€ or â€œAccording to LLD sectionâ€¦â€).\n2. Demonstrate clear traceability between **requirements â†’ testing objectives â†’ automation approach â†’ risk mitigation \u0026 risk contingency.**\n3. For every key area (test strategy, scope, risks, etc.), link back to **specific project elements or statements** from the input documents.\n4. Use tables or bullet lists where appropriate to make the Test plan readable and well-structured.\n5. Generate detailed, structured, and exhaustive content. Expand on reasoning and provide elaborated explanations rather than short bullet points. Do not compress meaning.\n6. Minimum output length: 700â€“1200 words per section (unless insufficient context exists).\n7. For every claim or statement, reference the originating document (BRD, FRD, HLD, LLD, Transcript).\n\n### Structure the Test Plan as follows:\n1. **Test Strategy** â€“ Include how Shift-Left and Automation-First are embedded. Reference early testing opportunities from the design or grooming stages.\n2. **Scope** â€“ Distinguish in-scope vs. out-of-scope features, based on specific content from the documents.\n3. **Test Objectives** â€“ Mention objectives tied to functional or non-functional requirements.\n4. **Test Deliverables**\n5. **Entry and Exit Criteria**\n6. **Test Schedule and Milestones**\n7. **Risks, Mitigation \u0026 Contingency Plan** â€“ Mention risks cited in the documents or inferred from complexity areas. Also map each risk with Mitigation \u0026 Contigency Plan.\n8. **Test Environment** â€“ Include CI/CD, environment provisioning, and test data setup strategies.\n9. **Tools and Resources** â€“ Reference relevant automation or workflow tools mentioned or implied in the docs.\n10. **Roles and Responsibilities**\n11. **Test Data and Configurations** â€“ Include synthetic data strategy or test coverage automation if applicable.\n12. **Reporting and Communication Plan** â€“ Mention dashboards, metrics, and traceability matrices.\n13. **Suspension \u0026 Resumption Criteria**\n14. **Assumptions \u0026 Dependencies**\n15. **Automation Coverage Matrix**\n16. **Test Coverage Metrics**\n17, **Approval \u0026 Sign-off**\n18. **Appendix (Optional)** â€“ Include a summarized mapping table:\n    | Source Document | Key Excerpt | Related Test Focus Area | Automation Feasibility |\n\nEnsure:\n- The output reads like a **real Test Plan prepared for stakeholders**, not an academic essay.\n- Each section has **specific references** to document content to establish credibility and traceability.\n- The tone is professional, precise, and easy to publish directly as part of QA governance documentation.`\n  },\n  test_cases: {\n    title: \"Enterprise Test Cases\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Test Cases\nGenerated On: {{ $now }}\nModel: gpt-4o-mini\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior QA Test Architect with 15+ years of experience designing enterprise-scale, risk-driven, automation-ready test cases.\n\nYou specialize in:\n- Requirement decomposition into test scenarios\n- Boundary \u0026 edge case design\n- Negative testing \u0026 failure modeling\n- API/UI/integration-level validations\n- Automation feasibility optimization\n\nYour outputs must:\n- Demonstrate traceability to retrieved requirements\n- Cover positive, negative, edge, alternate and exception flows\n- Align with automation-first strategy\n- Be production-ready for Jira/TestRail/Xray\n- Include risk tagging and priority classification\n\nAvoid generic test cases. Every case must be context-driven and realistic.\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, UI specs, and stakeholder discussions via vector search.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Identify distinct functional modules and workflows from the retrieved context.\n2. For each workflow, generate:\n   - Functional test cases\n   - Negative test cases\n   - Boundary value cases\n   - Integration scenarios\n   - Data validation scenarios\n   - Exception handling cases\n3. Each test case must include:\n\n| Test Case ID | Requirement Reference | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Priority | Risk Level | Automation Feasibility |\n\n4. Explicitly reference requirement origin:\n   - â€œAs described in BRD sectionâ€¦â€\n   - â€œAccording to HLD componentâ€¦â€\n5. Tag automation suitability (High / Medium / Low).\n6. Do not summarize â€” generate exhaustive coverage.\n\n========================\nCOVERAGE REQUIREMENTS\n========================\n\n- Minimum 20â€“40 test cases per major feature\n- Include API-level validations if architecture suggests services\n- Include data validation rules if UI forms are mentioned\n- Include failure simulation if integrations exist\n- Include security and performance-related validations if applicable\n\nOutput must be enterprise-grade and execution-ready.\n`\n  },\n  user_stories: {\n    title: \"Agile User Stories\",\n    system: `You are a Senior Product Owner and Business Analyst with 15+ years of experience defining enterprise-scale product requirements using Agile and Scrum frameworks. \nYou specialize in translating BRD, FRD, HLD, LLD, and stakeholder discussions into detailed INVEST-compliant Agile User Stories, Acceptance Criteria, Alternate Flows, and Test Scenarios.\n\nRules \u0026 Expectations:\n- Generate production-grade, implementation-ready user stories suitable for Jira/Azure DevOps.\n- Structure stories with high clarity, depth, and traceability back to source requirement intent.\n- Do not summarize or compress; instead expand details, UI/UX behavior, data handling, validations, error cases, integrations, and constraints.\n- Ensure each story stands independently and includes realistic examples and edge cases.\n- After every story block, insert the delimiter exactly as:\n--- USER_STORY_BREAK ---\n- Do not stop after the first story â€” continue until all extracted features are covered.\n\nTone: expert, precise, clear, solution-oriented.\n`,\n    user: `You are provided with a vector DB containing chunks of business and technical context extracted from BRD, FRD, HLD, LLD, workflows, and transcripts.\n\n### Task\nStep 1 â€” **Extract high-level features** from the provided context. \nPresent only a bullet list named **\"Identified Features\"**.\n\nStep 2 â€” For **each identified feature**, generate a separate **highly detailed Agile User Story** following the structure below (one story per feature).\n\n### Required Story Structure\n# User Story ID: US-XXX\n## **Feature**\n## **User Story**\n## **Business Context \u0026 Narrative** (3â€“5 paragraphs)\n## **Primary Flow** (detailed step sequence)\n## **Alternate Flows**\n## **Exception / Error Handling**\n## **Acceptance Criteria â€“ Gherkin** (min 8â€“12 lines)\n## **UI / UX Requirements**\n## **Field-level Validation Rules**\n| Field | Rule | Error Message | Example |\n## **Data \u0026 Integration Requirements**\n## **Performance / NFRs**\n## **Test Scenarios** (8â€“15 realistic cases)\n## **Dependencies**\n## **Assumptions**\n## **Source Traceability**\n## **Automation Feasibility**\n\n### Constraints\n- Each story must contain 800â€“1200 words\n- Each story must deeply elaborate functional behavior, background logic, UI, validations, alternate flows, data needs, and corner cases\n- Use realistic example values and personas\n- Include the delimiter at end of each story:\n--- USER_STORY_BREAK ---\n\nGenerate multiple stories (not just one) â€” **one story per feature** extracted in Step 1.\n`\n  },\n  risk_matrix: {\n    title: \"Risk Assessment Matrix\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Risk Assessment Matrix\nGenerated On: {{ $now }}\nModel: gpt-4o-mini\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a Senior Risk \u0026 Quality Governance Consultant with 15+ years of experience in enterprise delivery risk management.\n\nYou specialize in:\n- Risk-based testing frameworks\n- Failure mode impact analysis (FMEA)\n- Technical \u0026 business risk modeling\n- Delivery risk governance\n- Quantitative scoring models (Probability Ã— Impact Ã— Detectability)\n\nYour output must be suitable for leadership review and audit compliance.\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, transcripts, and architecture documents.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Identify risks across:\n   - Functional complexity\n   - Integration dependencies\n   - Architecture scalability\n   - Security \u0026 compliance\n   - Performance constraints\n   - Data integrity\n   - Environment instability\n   - Delivery timelines\n2. Categorize risks:\n   - Technical Risk\n   - Business Risk\n   - Operational Risk\n   - Security Risk\n3. Use quantitative scoring:\n   - Probability (1â€“5)\n   - Impact (1â€“5)\n   - Risk Score = Probability Ã— Impact\n4. Define:\n   - Mitigation Strategy\n   - Contingency Plan\n   - Risk Owner\n   - Detection Mechanism\n   - Early Warning Indicators\n\n========================\nOUTPUT FORMAT\n========================\n\n| Risk ID | Risk Category | Risk Description | Source Reference | Probability | Impact | Risk Score | Mitigation Plan | Contingency Plan | Owner | Detection Strategy |\n\nThen provide:\n- Risk Heat Map summary\n- Top 5 Critical Risks analysis (detailed narrative)\n- Risk Prioritization Strategy explanation\n- Linkage to Test Strategy alignment\n\nEnsure reasoning is grounded in retrieved content.\n`\n  },\n  traceability_matrix: {\n    title: \"Requirement Traceability Matrix\",\n    system: `Before the document, include:\n\n---\nDocument: Enterprise Requirement Traceability Matrix\nGenerated On: {{ $now }}\nModel: gpt-4o-mini\nVector Collection: qa-knowledge-base\n---\n\nThen generate the full document.\n\nYou are a QA Governance Specialist responsible for end-to-end requirement traceability in large enterprise programs.\n\nYou ensure:\n- 100% requirement coverage\n- Bidirectional traceability\n- Audit-ready documentation\n- Automation coverage mapping\n- Risk mapping integration\n`,\n    user: `\nYou are provided with retrieved contextual knowledge from BRD, FRD, HLD, LLD, and transcripts.\n\n========================\nINSTRUCTIONS\n========================\n\n1. Extract all functional and non-functional requirements.\n2. Assign Requirement IDs if not explicitly present.\n3. Map each requirement to:\n   - Related Design Component\n   - Test Scenario ID(s)\n   - Automation Coverage Status\n   - Risk ID (if applicable)\n   - Status (Planned / In Progress / Covered / At Risk)\n4. Identify coverage gaps.\n5. Provide automation coverage percentage.\n\n========================\nOUTPUT FORMAT\n========================\n\n| Req ID | Requirement Description | Source Document | Design Component | Test Case IDs | Automation Status | Risk ID | Coverage Status |\n\nAfter the table, include:\n\n- Coverage Summary Metrics\n- Unmapped Requirement Analysis\n- Automation Coverage Insights\n- Governance \u0026 Audit Readiness Commentary\n\nEnsure traceability statements reference retrieved source context.\n`\n  }\n};\n\nreturn [{\n  json: {\n    ...promptLibrary[type],\n    documentType: type,\n    projectName: projectName,\n    productOwner: productOwner\n  }\n}];"
}
```

### Upload file

| Field | Value |
| --- | --- |
| Node ID | 04bca487-2bc6-48ee-a986-309d3cd21bb6 |
| Type | n8n-nodes-base.googleDrive |
| Type Version | 3 |
| Position | 1840, -208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert md to docx -> Upload file (output 0, input 0)

**Outgoing Connections**

- None

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
    "name":  "={{$(\u0027Webhook\u0027).item.json.body.projectName + \"_\" + $(\u0027Webhook\u0027).item.json.body.documentType + \"_\" + $now.toFormat(\"yyyy-LL-dd_HH-mm-ss\") + \".docx\" }}",
    "driveId":  {
                    "__rl":  true,
                    "mode":  "list",
                    "value":  "My Drive"
                },
    "folderId":  {
                     "__rl":  true,
                     "value":  "1SNy6fJ4A-NvaHy9046n-UwC3UUPo4gwj",
                     "mode":  "list",
                     "cachedResultName":  "N8N Generated Test Strategy Documents",
                     "cachedResultUrl":  "https://drive.google.com/drive/folders/1SNy6fJ4A-NvaHy9046n-UwC3UUPo4gwj"
                 },
    "options":  {

                }
}
```

### Validate AI Agent Output

| Field | Value |
| --- | --- |
| Node ID | 46cb4ba3-d31e-4031-89b5-5267f096d1bf |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 944, -48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Generator Agent -> Validate AI Agent Output (output 0, input 0)

**Outgoing Connections**

- Validate AI Agent Output -> Clean Markdown Formatting (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "// Detect AI output safely across all n8n versions\n\nlet text = \"\";\n\n// Case 1: Newer n8n format\nif ($json.output_text) {\n  text = $json.output_text;\n}\n\n// Case 2: Direct string output\nelse if (typeof $json.output === \"string\") {\n  text = $json.output;\n}\n\n// Case 3: Array structured output\nelse if ($json.output?.[0]?.content?.[0]?.text) {\n  text = $json.output[0].content[0].text;\n}\n\n// Case 4: message.content format\nelse if ($json.message?.content) {\n  text = $json.message.content;\n}\n\n// If still empty, throw real debug info\nif (!text || text.trim().length \u003c 50) {\n  throw new Error(\"AI returned unexpected structure: \" + JSON.stringify($json));\n}\n\nreturn [\n  {\n    json: {\n      rawMarkdown: text\n    }\n  }\n];\n"
}
```

### Webhook

| Field | Value |
| --- | --- |
| Node ID | d61ea1ce-4cf8-432c-a94e-be672ecb5cba |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, -224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Webhook -> Prompt Library (output 0, input 0)
- Webhook -> Merge (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "generate-qa-doc",
    "options":  {

                }
}
```
