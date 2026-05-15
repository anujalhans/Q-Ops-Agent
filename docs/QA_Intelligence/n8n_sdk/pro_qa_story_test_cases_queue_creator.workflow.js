import { workflow, node, trigger, newCredential, ifElse } from '@n8n/workflow-sdk';

const postWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'POST /generate-story-test-cases',
    parameters: {
      httpMethod: 'POST',
      path: 'generate-story-test-cases',
      responseMode: 'responseNode',
      options: {},
    },
    position: [0, 0],
  },
  output: [{ headers: { authorization: 'Bearer token' }, body: { projectId: 'project-id', projectName: 'ShopSmart', documentType: 'story_test_cases', productOwner: 'PO', environment: 'local' } }],
});

const optionsWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'OPTIONS /generate-story-test-cases',
    parameters: {
      httpMethod: 'OPTIONS',
      path: 'generate-story-test-cases',
      responseMode: 'responseNode',
      options: {},
    },
    position: [0, 288],
  },
  output: [{}],
});

const prepareRequest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Prepare Story Test Case Queue Request',
    parameters: {
      jsCode: `const now = new Date();
const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
const jobId = \`STC-\${datePart}-\${randomPart}\`;
const headers = $json.headers || {};
const authHeader = headers.authorization || headers.Authorization || '';
const input = $json.body || {};
const retryJobId = String(input.retryJobId || input.jobId || '').trim();
const isRetry = Boolean(retryJobId);
if (!String(authHeader).toLowerCase().startsWith('bearer ')) {
  return [{ json: { ok: false, statusCode: 401, errorCode: 'UNAUTHORIZED', message: 'Missing bearer token' } }];
}
if (!String(input.projectName || '').trim()) {
  return [{ json: { ok: false, statusCode: 400, errorCode: 'INVALID_REQUEST', message: 'projectName is required' } }];
}
const documentType = String(input.documentType || '').trim().toLowerCase();
if (documentType !== 'story_test_cases') {
  return [{ json: { ok: false, statusCode: 400, errorCode: 'INVALID_REQUEST', message: 'documentType must be story_test_cases' } }];
}
return [{
  json: {
    ok: true,
    jobId: isRetry ? retryJobId : jobId,
    retryMode: isRetry,
    input: { ...input, retryJobId: undefined, jobId: undefined, generatorMode: 'professional_story_test_cases' },
    token: String(authHeader).replace(/^Bearer\\s+/i, ''),
    projectId: input.projectId || null,
    environment: input.environment || 'local'
  }
}];`,
    },
    position: [224, 0],
  },
  output: [{ ok: true, jobId: 'STC-260512-ABC123', retryMode: false, token: 'token', projectId: 'project-id', environment: 'local', input: { projectName: 'ShopSmart', documentType: 'story_test_cases', generatorMode: 'professional_story_test_cases' } }],
});

const validRequest = ifElse({
  version: 2.2,
  config: {
    name: 'Valid Story Test Case Request?',
    parameters: {
      conditions: {
        combinator: 'and',
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [
          {
            leftValue: '={{ $json.ok }}',
            rightValue: true,
            operator: { type: 'boolean', operation: 'true', singleValue: true },
          },
        ],
      },
    },
    position: [448, 0],
  },
});

const verifySupabaseUser = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Verify Supabase Auth User',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '={ "apikey": "sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt", "Authorization": "Bearer {{ $json.token }}" }',
      options: {},
    },
    position: [672, 0],
  },
  output: [{ id: 'auth-user-id', email: 'user@example.com' }],
});

const fetchUserProfile = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch Active Q-Ops User Profile',
    parameters: {
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id }}&status=eq.active&select=id,email,name,role,status&limit=1',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      options: {},
    },
    position: [896, 0],
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    alwaysOutputData: true,
  },
  output: [[{ id: 'qops-user-id', role: 'admin', status: 'active' }]],
});

const prepareRuntimeRequest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Prepare Story Test Case Runtime Request',
    parameters: {
      jsCode: `const profile = Array.isArray($json) ? $json[0] : $json;
const job = $('Prepare Story Test Case Queue Request').item.json;
if (!profile?.id || profile.status !== 'active') {
  return [{ json: { ok: false, statusCode: 403, errorCode: 'PROFILE_NOT_ACTIVE', message: 'Active Q-Ops user profile not found' } }];
}
return [{
  json: {
    ...job,
    requestedBy: profile.id,
    qopsUser: profile,
    runtimeRequest: {
      p_environment_key: job.environment || 'local',
      p_project_id: job.projectId || null,
      p_pipeline: 'generation',
      p_requested_by: profile.id
    }
  }
}];`,
    },
    position: [1120, 0],
  },
  output: [{ ok: true, jobId: 'STC-260512-ABC123', retryMode: false, requestedBy: 'qops-user-id', runtimeRequest: { p_environment_key: 'local', p_project_id: 'project-id', p_pipeline: 'generation', p_requested_by: 'qops-user-id' } }],
});

const runtimeReady = ifElse({
  version: 2.2,
  config: {
    name: 'Story Test Case Runtime Ready?',
    parameters: {
      conditions: {
        combinator: 'and',
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [
          {
            leftValue: '={{ $json.ok }}',
            rightValue: true,
            operator: { type: 'boolean', operation: 'true', singleValue: true },
          },
        ],
      },
    },
    position: [1344, 0],
  },
});

const resolveRuntimeConfig = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Resolve Runtime Config',
    parameters: {
      method: 'POST',
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/qops_resolve_runtime_config',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($json.runtimeRequest) }}',
      options: {},
    },
    position: [1568, 0],
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
  },
  output: [{ settingsVersion: 1, configSnapshot: { jira: { projectKey: 'KAN' }, models: { generationModel: 'gpt-4.1-mini' } } }],
});

const combineJobAndRuntime = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Combine Story Test Case Job And Runtime',
    parameters: {
      jsCode: `const runtimeRaw = $input.first().json || {};
const runtime = Array.isArray(runtimeRaw) ? runtimeRaw[0] : runtimeRaw;
const job = $('Prepare Story Test Case Runtime Request').item.json;
const settingsVersion = runtime.settingsVersion ?? runtime.settings_version ?? 1;
const configSnapshot = runtime.configSnapshot ?? runtime.config_snapshot ?? runtime ?? {};
return [{ json: { ...job, settingsVersion, configSnapshot } }];`,
    },
    position: [1792, 0],
  },
  output: [{ jobId: 'STC-260512-ABC123', retryMode: false, projectId: 'project-id', requestedBy: 'qops-user-id', settingsVersion: 1, configSnapshot: { jira: { projectKey: 'KAN' } }, input: { projectName: 'ShopSmart', documentType: 'story_test_cases', generatorMode: 'professional_story_test_cases' } }],
});

const insertJob = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Persist Story Test Case Job',
    parameters: {
      method: '={{ $json.retryMode ? "PATCH" : "POST" }}',
      url: '={{ $json.retryMode ? "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq." + encodeURIComponent($json.jobId) + "&status=eq.failed&requested_by=eq." + encodeURIComponent($json.requestedBy) : "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs" }}',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($json.retryMode ? { status: "pending", input: $json.input, output: null, error: null, project_id: $json.projectId, requested_by: $json.requestedBy, settings_version: $json.settingsVersion, config_snapshot: $json.configSnapshot, updated_at: $now.toISO() } : { job_id: $json.jobId, status: "pending", input: $json.input, project_id: $json.projectId, requested_by: $json.requestedBy, settings_version: $json.settingsVersion, config_snapshot: $json.configSnapshot }) }}',
      options: {},
    },
    position: [2016, 0],
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    alwaysOutputData: true,
  },
  output: [{ job_id: 'STC-260512-ABC123', status: 'pending' }],
});

const jobPersisted = ifElse({
  version: 2.2,
  config: {
    name: 'Story Test Case Job Persisted?',
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
    position: [2128, 0],
  },
});

const logQueued = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'LOG: Story Test Case Job Queued',
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
      jsonBody: '={{ JSON.stringify({ job_id: $("Combine Story Test Case Job And Runtime").item.json.jobId, project_name: $("Combine Story Test Case Job And Runtime").item.json.input.projectName, document_type: $("Combine Story Test Case Job And Runtime").item.json.input.documentType, pipeline: "generation", event: $("Combine Story Test Case Job And Runtime").item.json.retryMode ? "JOB_RETRIED" : "JOB_QUEUED", status: "info", project_id: $("Combine Story Test Case Job And Runtime").item.json.projectId, requested_by: $("Combine Story Test Case Job And Runtime").item.json.requestedBy, metadata: { generator_mode: "professional_story_test_cases", retry: Boolean($("Combine Story Test Case Job And Runtime").item.json.retryMode), product_owner: $("Combine Story Test Case Job And Runtime").item.json.input.productOwner, settings_version: $("Combine Story Test Case Job And Runtime").item.json.settingsVersion, environment: $("Combine Story Test Case Job And Runtime").item.json.environment } }) }}',
      options: {},
    },
    position: [2240, 0],
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
  },
  output: [{}],
});

const respondRetryUnavailable = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Story Test Case Retry Unavailable',
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify({ ok: false, error: { code: "RETRY_UNAVAILABLE", message: "The failed Story Test Case job could not be retried. It may already be running, completed, or owned by another user." } }) }}',
      options: {
        responseCode: 409,
        responseHeaders: {
          entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
        },
      },
    },
    position: [2240, 176],
  },
  output: [{}],
});

const respondQueued = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Queued',
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify({ jobId: $("Combine Story Test Case Job And Runtime").item.json.jobId, status: "queued", generatorMode: "professional_story_test_cases", retried: Boolean($("Combine Story Test Case Job And Runtime").item.json.retryMode) }) }}',
      options: {
        responseHeaders: {
          entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
        },
      },
    },
    position: [2464, 0],
  },
  output: [{}],
});

const respondInvalid = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Invalid Story Test Case Request',
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify({ ok: false, error: { code: $json.errorCode || "INVALID_REQUEST", message: $json.message || "Invalid request" } }) }}',
      options: {
        responseCode: '={{ $json.statusCode || 400 }}',
        responseHeaders: {
          entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
        },
      },
    },
    position: [672, 176],
  },
  output: [{}],
});

const respondRuntimeError = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Story Test Case Runtime Error',
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify({ ok: false, error: { code: $json.errorCode || "PROFILE_NOT_ACTIVE", message: $json.message || "Unable to resolve runtime context" } }) }}',
      options: {
        responseCode: '={{ $json.statusCode || 403 }}',
        responseHeaders: {
          entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
        },
      },
    },
    position: [1568, 176],
  },
  output: [{}],
});

const respondCors = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond Story Test Cases CORS',
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify({ ok: true }) }}',
      options: {
        responseCode: 204,
        responseHeaders: {
          entries: [
            { name: 'Access-Control-Allow-Origin', value: '*' },
            { name: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
            { name: 'Access-Control-Allow-Headers', value: 'authorization, content-type' },
            { name: 'Access-Control-Max-Age', value: '86400' },
          ],
        },
      },
    },
    position: [224, 288],
  },
  output: [{}],
});

export default workflow('pro-qa-story-test-cases-queue-creator', 'PRO QA Story Test Cases Queue Creator')
  .add(postWebhook)
  .to(prepareRequest)
  .to(validRequest.onTrue(
    verifySupabaseUser
      .to(fetchUserProfile)
      .to(prepareRuntimeRequest)
      .to(runtimeReady.onTrue(
          resolveRuntimeConfig
          .to(combineJobAndRuntime)
          .to(insertJob)
          .to(jobPersisted.onTrue(
            logQueued
              .to(respondQueued),
          ).onFalse(respondRetryUnavailable)),
      ).onFalse(respondRuntimeError)),
  ).onFalse(respondInvalid))
  .add(optionsWebhook)
  .to(respondCors);
