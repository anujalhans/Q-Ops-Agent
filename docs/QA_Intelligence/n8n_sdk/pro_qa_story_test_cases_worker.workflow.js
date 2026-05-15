import { workflow, node, trigger, newCredential, ifElse } from '@n8n/workflow-sdk';

const schedule = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.3,
  config: {
    name: 'Schedule Trigger',
    parameters: {
      rule: {
        interval: [{ field: 'seconds', secondsInterval: 20 }],
      },
    },
    position: [0, 0],
  },
  output: [{}],
});

const getPendingJobs = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Get Pending Story Test Case Jobs',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendQuery: true,
      queryParameters: {
        parameters: [
          { name: 'status', value: 'eq.pending' },
          { name: 'input->>generatorMode', value: 'eq.professional_story_test_cases' },
          { name: 'order', value: 'created_at.asc' },
          { name: 'limit', value: '1' },
          { name: 'select', value: 'job_id,status,input,project_id,requested_by,settings_version,config_snapshot,created_at' },
        ],
      },
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [224, 0],
    alwaysOutputData: true,
  },
  output: [{ job_id: 'STC-260512-ABC123', status: 'pending', input: { projectName: 'ShopSmart', documentType: 'story_test_cases', generatorMode: 'professional_story_test_cases' }, project_id: 'project-id', requested_by: 'qops-user-id', settings_version: 1, config_snapshot: {} }],
});

const hasPendingJob = ifElse({
  version: 2.2,
  config: {
    name: 'Pending Story Test Case Job Exists?',
    parameters: {
      conditions: {
        combinator: 'and',
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [
          {
            leftValue: '={{ Object.keys($json).length }}',
            rightValue: 0,
            operator: { type: 'number', operation: 'gt' },
          },
        ],
      },
    },
    position: [448, 0],
  },
});

const noPendingJobs = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'No Pending Story Test Case Jobs',
    parameters: {
      jsCode: 'return [{ json: { ok: true, skipped: true } }];',
    },
    position: [672, 128],
  },
  output: [{ ok: true, skipped: true }],
});

const lockJob = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Lock Story Test Case Job',
    parameters: {
      method: 'PATCH',
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.job_id }}&status=eq.pending',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '{ "status": "processing" }',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [672, 0],
    alwaysOutputData: true,
  },
  output: [{ job_id: 'STC-260512-ABC123', status: 'processing', input: { projectName: 'ShopSmart', documentType: 'story_test_cases', generatorMode: 'professional_story_test_cases' }, project_id: 'project-id', requested_by: 'qops-user-id', settings_version: 1, config_snapshot: {} }],
});

const lockAcquired = ifElse({
  version: 2.2,
  config: {
    name: 'Story Test Case Lock Acquired?',
    parameters: {
      conditions: {
        combinator: 'and',
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [
          {
            leftValue: '={{ Object.keys($json).length }}',
            rightValue: 0,
            operator: { type: 'number', operation: 'gt' },
          },
        ],
      },
    },
    position: [896, 0],
  },
});

const lockNotAcquired = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Lock Not Acquired',
    parameters: {
      jsCode: 'return [{ json: { ok: true, skipped: true } }];',
    },
    position: [1120, 128],
  },
  output: [{ ok: true, skipped: true }],
});

const prepareGeneratorInput = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Prepare Story Test Case Generator Input',
    parameters: {
      jsCode: `const job = Array.isArray($json) ? $json[0] : $json;
const input = job.input || {};
return [{
  json: {
    jobId: job.job_id,
    originalJobStatus: job.status,
    projectId: job.project_id || null,
    requestedBy: job.requested_by || null,
    settingsVersion: job.settings_version || null,
    configSnapshot: job.config_snapshot || {},
    createdAt: job.created_at || new Date().toISOString(),
    startedAt: new Date().toISOString(),
    ...input
  }
}];`,
    },
    position: [1120, 0],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectId: 'project-id', requestedBy: 'qops-user-id', settingsVersion: 1, configSnapshot: {}, projectName: 'ShopSmart', documentType: 'story_test_cases', generatorMode: 'professional_story_test_cases', createdAt: '2026-05-12T00:00:00.000Z', startedAt: '2026-05-12T00:00:10.000Z' }],
});

const logStarted = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'LOG: Story Test Case Job Started',
    parameters: {
      method: 'POST',
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Prefer": "return=minimal" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: "generation", event: "JOB_STARTED", status: "info", project_id: $json.projectId, requested_by: $json.requestedBy, metadata: { generator_mode: "professional_story_test_cases", settings_version: $json.settingsVersion, environment: $json.environment || $json.configSnapshot?.environment?.key || "local" } }) }}',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [1344, 0],
  },
  output: [{}],
});

const restoreGeneratorInput = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Restore Story Test Case Input After Start Log',
    parameters: {
      jsCode: 'return [{ json: $(\"Prepare Story Test Case Generator Input\").first().json }];',
    },
    position: [1568, 0],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectName: 'ShopSmart', documentType: 'story_test_cases' }],
});

const callGenerator = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.3,
  config: {
    name: 'Call Story Test Case Generator',
    onError: 'continueErrorOutput',
    parameters: {
      workflowId: {
        __rl: true,
        value: 'SG7khcKlhHst48WH',
        mode: 'id',
        cachedResultName: 'PRO QA Jira Story Test Case Generator',
      },
      workflowInputs: {
        mappingMode: 'defineBelow',
        value: {},
        matchingColumns: [],
        schema: [],
        attemptToConvertTypes: false,
        convertFieldsToString: true,
      },
      options: {
        waitForSubWorkflow: true,
      },
    },
    position: [1792, -96],
  },
  output: [{ documentType: 'story_test_cases', stories: [{ storyKey: 'KAN-428', storyLink: 'https://anujalhans1.atlassian.net/browse/KAN-428' }], testCases: [{ testcaseKey: 'KAN-500', testcaseLink: 'https://anujalhans1.atlassian.net/browse/KAN-500', storyKey: 'KAN-428' }], sourceUserStoryJobId: 'PRO-260512-RDR2ZR', wordCount: 1200, tokensInput: 2000, tokensOutput: 1500, tokensTotal: 3500, estimatedCostUsd: 0.01 }],
});

const buildCompletionOutput = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Story Test Case Completion Output',
    parameters: {
      jsCode: `const result = $json || {};
const input = $('Prepare Story Test Case Generator Input').first().json;
return [{
  json: {
    ...input,
    output: {
      documentType: 'story_test_cases',
      destination: { type: 'jira_test_cases', projectId: input.projectId || null },
      sourceUserStoryJobId: result.sourceUserStoryJobId || null,
      stories: Array.isArray(result.stories) ? result.stories : [],
      testCases: Array.isArray(result.testCases) ? result.testCases : [],
      mappings: Array.isArray(result.mappings) ? result.mappings : [],
      jira: result.jira || null,
      wordCount: result.wordCount || 0,
      tokensInput: result.tokensInput || 0,
      tokensOutput: result.tokensOutput || 0,
      tokensTotal: result.tokensTotal || 0,
      estimatedCostUsd: result.estimatedCostUsd || 0
    }
  }
}];`,
    },
    position: [2016, -192],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectName: 'ShopSmart', output: { documentType: 'story_test_cases', stories: [{ storyKey: 'KAN-428' }], testCases: [{ testcaseKey: 'KAN-500' }], mappings: [], wordCount: 1200, tokensInput: 2000, tokensOutput: 1500, tokensTotal: 3500, estimatedCostUsd: 0.01 } }],
});

const logCompleted = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'LOG: Story Test Case Job Completed',
    parameters: {
      method: 'POST',
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Prefer": "return=minimal" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: "generation", event: "JOB_COMPLETED", status: "info", project_id: $json.projectId, requested_by: $json.requestedBy, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), word_count: $json.output.wordCount || 0, tokens_input: $json.output.tokensInput || 0, tokens_output: $json.output.tokensOutput || 0, tokens_total: $json.output.tokensTotal || 0, estimated_cost_usd: $json.output.estimatedCostUsd || 0, metadata: { generator_mode: "professional_story_test_cases", source_user_story_job_id: $json.output.sourceUserStoryJobId, story_count: ($json.output.stories || []).length, testcase_count: ($json.output.testCases || []).length, mapping_count: ($json.output.mappings || []).length, settings_version: $json.settingsVersion } }) }}',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [2240, -192],
  },
  output: [{}],
});

const restoreCompletion = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Restore Story Test Case Completion',
    parameters: {
      jsCode: 'return [{ json: $(\"Build Story Test Case Completion Output\").first().json }];',
    },
    position: [2464, -192],
  },
  output: [{ jobId: 'STC-260512-ABC123', output: { documentType: 'story_test_cases' } }],
});

const markCompleted = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Mark Story Test Case Job Completed',
    parameters: {
      method: 'PATCH',
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}&status=eq.processing',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ status: "completed", output: $json.output, updated_at: $now.toISO() }) }}',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [2688, -192],
  },
  output: [{ job_id: 'STC-260512-ABC123', status: 'completed' }],
});

const buildFailureOutput = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Story Test Case Failure Output',
    parameters: {
      jsCode: `const input = $('Prepare Story Test Case Generator Input').first().json;
const rawError = $json.error || $json;

function clean(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  try { return JSON.stringify(value); } catch { return String(value); }
}

function collectMessages(value, depth = 0, seen = new Set()) {
  if (value === null || value === undefined || depth > 8) return [];
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  if (typeof value !== 'object') return [];
  if (seen.has(value)) return [];
  seen.add(value);
  const priorityKeys = ['message', 'errorMessage', 'errorDescription', 'description', 'stack'];
  const messages = [];
  for (const key of priorityKeys) {
    if (value[key]) messages.push(clean(value[key]));
  }
  for (const nested of Object.values(value)) {
    messages.push(...collectMessages(nested, depth + 1, seen));
  }
  return messages.filter(Boolean);
}

const allMessages = [...new Set(collectMessages(rawError))];
const message = allMessages.find(text => !/workflow failed|execution failed/i.test(text)) || allMessages[0] || 'Story Test Case generator failed';

return [{
  json: {
    ...input,
    errorMessage: message,
    output: {
      error: true,
      errorType: 'STORY_TEST_CASES_FAILED',
      message,
      failed_at: new Date().toISOString(),
      details: {
        source: rawError.node?.name || rawError.error?.node?.name || rawError.nodeName || 'Call Story Test Case Generator',
        description: allMessages.slice(0, 5).join(' | '),
        itemIndex: rawError.itemIndex ?? rawError.error?.itemIndex ?? null
      }
    }
  }
}];`,
    },
    position: [2016, 32],
  },
  output: [{ jobId: 'STC-260512-ABC123', errorMessage: 'Story Test Case generator failed', output: { error: true, errorType: 'STORY_TEST_CASES_FAILED', message: 'Story Test Case generator failed', failed_at: '2026-05-12T00:00:00.000Z', details: { source: 'Call Story Test Case Generator' } } }],
});

const logFailed = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'LOG: Story Test Case Job Failed',
    parameters: {
      method: 'POST',
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Prefer": "return=minimal" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: "generation", event: "JOB_FAILED", status: "error", project_id: $json.projectId, requested_by: $json.requestedBy, error_message: $json.errorMessage, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), metadata: { generator_mode: "professional_story_test_cases", error_type: "STORY_TEST_CASES_FAILED", settings_version: $json.settingsVersion } }) }}',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [2240, 32],
  },
  output: [{}],
});

const restoreFailure = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Restore Story Test Case Failure',
    parameters: {
      jsCode: 'return [{ json: $(\"Build Story Test Case Failure Output\").first().json }];',
    },
    position: [2464, 32],
  },
  output: [{ jobId: 'STC-260512-ABC123', errorMessage: 'Story Test Case generator failed', output: { error: true } }],
});

const markFailed = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Mark Story Test Case Job Failed',
    parameters: {
      method: 'PATCH',
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}&status=eq.processing',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ status: "failed", output: $json.output, error: $json.errorMessage, updated_at: $now.toISO() }) }}',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [2688, 32],
  },
  output: [{ job_id: 'STC-260512-ABC123', status: 'failed' }],
});

export default workflow('pro-qa-story-test-cases-worker', 'PRO QA Story Test Cases Worker')
  .add(schedule)
  .to(getPendingJobs)
  .to(hasPendingJob.onTrue(
    lockJob
      .to(lockAcquired.onTrue(
        prepareGeneratorInput
          .to(logStarted)
          .to(restoreGeneratorInput)
          .to(callGenerator)
          .to(buildCompletionOutput)
          .to(logCompleted)
          .to(restoreCompletion)
          .to(markCompleted))
      .onFalse(lockNotAcquired))
  ).onFalse(noPendingJobs))
  .add(callGenerator.onError(buildFailureOutput.to(logFailed).to(restoreFailure).to(markFailed)));
