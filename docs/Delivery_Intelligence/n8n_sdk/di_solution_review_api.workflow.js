import { workflow, node, trigger, ifElse, newCredential } from '@n8n/workflow-sdk';

const patchReview = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'PATCH /di/solutions/review',
    parameters: {
      httpMethod: 'PATCH',
      path: 'di/solutions/review',
      responseMode: 'responseNode',
      options: {},
    },
    position: [0, 0],
  },
  output: [{ headers: { authorization: 'Bearer token' }, body: { solutionId: 'solution-id', decision: 'review' } }],
});

const optionsReview = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'OPTIONS /di/solutions/review',
    parameters: {
      httpMethod: 'OPTIONS',
      path: 'di/solutions/review',
      responseMode: 'responseNode',
      options: {},
    },
    position: [0, 304],
  },
  output: [{}],
});

const prepareReview = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Prepare DI Solution Review Request',
    parameters: {
      jsCode: `const headers = $json.headers || {};
const authHeader = headers.authorization || headers.Authorization || '';
const body = $json.body || {};
const decisionMap = { submitted: 'submitted', review: 'review', reviewed: 'review', publish: 'published', published: 'published', archive: 'archived', archived: 'archived' };
const solutionId = body.solutionId || body.solution_id || body.id;
const decision = decisionMap[String(body.decision || body.action || '').toLowerCase()];
if (!String(authHeader).toLowerCase().startsWith('bearer ')) {
  return [{ json: { ok: false, statusCode: 401, errorCode: 'UNAUTHORIZED', message: 'Missing bearer token', token: '', solutionId: solutionId || '', decision: decision || '', projectId: body.projectId || body.project_id || null } }];
}
if (!solutionId || !decision) {
  return [{ json: { ok: false, statusCode: 400, errorCode: 'INVALID_REVIEW_REQUEST', message: 'solutionId and decision are required', token: String(authHeader).replace(/^Bearer\\s+/i, ''), solutionId: solutionId || '', decision: decision || '', projectId: body.projectId || body.project_id || null } }];
}
return [{ json: { ok: true, token: String(authHeader).replace(/^Bearer\\s+/i, ''), solutionId, decision, projectId: body.projectId || body.project_id || null, reviewNotes: body.reviewNotes || body.review_notes || '', governanceTags: Array.isArray(body.governanceTags) ? body.governanceTags : [], visibilityOverride: body.visibilityOverride || body.visibility_override || '', publishedTitle: body.publishedTitle || body.published_title || '', publishedSummary: body.publishedSummary || body.published_summary || '' } }];`,
    },
    position: [224, 0],
  },
  output: [{ ok: true, solutionId: 'solution-id', decision: 'review' }],
});

const verifyReviewAuth = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Verify Review Supabase Auth User',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '={ "apikey": "sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt", "Authorization": "Bearer {{ $json.token }}" }',
      options: {},
    },
    position: [448, 0],
  },
  output: [{ id: 'auth-user-id', email: 'user@example.com' }],
});

const fetchReviewProfile = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch Review Q-Ops User Profile',
    parameters: {
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id || "00000000-0000-0000-0000-000000000000" }}&status=eq.active&select=id,email,name,role,status&limit=1',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [672, 0],
  },
  output: [[{ id: 'qops-user-id', role: 'admin', status: 'active' }]],
});

const fetchSolution = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch DI Solution For Review',
    parameters: {
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?id=eq.{{ encodeURIComponent($("Prepare DI Solution Review Request").item.json.solutionId || "00000000-0000-0000-0000-000000000000") }}&select=id,title,status,summary,visibility_level,source_project_id&limit=1',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [896, 0],
  },
  output: [[{ id: 'solution-id', title: 'Reusable Solution', source_project_id: 'project-id' }]],
});

const fetchReviewMemberships = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch Review Project Memberships',
    parameters: {
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ Array.isArray($("Fetch Review Q-Ops User Profile").item.json) ? ($("Fetch Review Q-Ops User Profile").item.json[0]?.id || "00000000-0000-0000-0000-000000000000") : ($("Fetch Review Q-Ops User Profile").item.json.id || "00000000-0000-0000-0000-000000000000") }}&select=project_id,project_role',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [1120, 0],
    executeOnce: true,
  },
  output: [{ project_id: 'project-id', project_role: 'owner' }],
});

const authorizeReview = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Authorize DI Solution Review',
    parameters: {
      jsCode: `const req = $('Prepare DI Solution Review Request').first().json;
if (!req.ok) return [{ json: req }];
const auth = $('Verify Review Supabase Auth User').first().json || {};
const rawProfile = $('Fetch Review Q-Ops User Profile').first().json;
const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
const rawSolution = $('Fetch DI Solution For Review').first().json;
const solution = Array.isArray(rawSolution) ? rawSolution[0] : rawSolution;
if (!auth.id) return [{ json: { ok: false, statusCode: 401, errorCode: 'UNAUTHORIZED', message: 'Invalid Supabase Auth token' } }];
if (!profile?.id || profile.status !== 'active') return [{ json: { ok: false, statusCode: 403, errorCode: 'PROFILE_NOT_ACTIVE', message: 'Active Q-Ops user profile not found' } }];
if (!solution?.id) return [{ json: { ok: false, statusCode: 404, errorCode: 'SOLUTION_NOT_FOUND', message: 'Reusable solution not found' } }];
const memberships = $items('Fetch Review Project Memberships').map((item) => item.json);
const memberRole = memberships.find((row) => row.project_id === solution.source_project_id)?.project_role || null;
const canReview = profile.role === 'admin' || memberRole === 'owner' || memberRole === 'editor';
if (!canReview) return [{ json: { ok: false, statusCode: 403, errorCode: 'SOLUTION_REVIEW_ACCESS_DENIED', message: 'User cannot review or publish this solution' } }];
const reviewPayload = {
  solution_id: solution.id,
  project_id: solution.source_project_id,
  reviewer_user_id: profile.id,
  decision: req.decision,
  review_notes: req.reviewNotes || null,
  governance_tags: req.governanceTags || [],
  visibility_override: req.visibilityOverride || null,
  published_title: req.publishedTitle || null,
  published_summary: req.publishedSummary || null,
};
const solutionPatch = {
  status: req.decision === 'submitted' ? 'review' : req.decision,
  updated_at: new Date().toISOString(),
};
if (req.visibilityOverride) solutionPatch.visibility_level = req.visibilityOverride;
if (req.publishedTitle) solutionPatch.title = req.publishedTitle;
if (req.publishedSummary) solutionPatch.summary = req.publishedSummary;
const audit = {
  action: 'DI_SOLUTION_REVIEW_' + req.decision.toUpperCase(),
  entity_type: 'di_solution',
  entity_id: solution.id,
  project_id: solution.source_project_id,
  actor_user_id: profile.id,
  actor_name: profile.email,
  status: 'success',
  details: req.decision + ': ' + solution.title,
  metadata: {
    solution_id: solution.id,
    previous_status: solution.status,
    new_status: solutionPatch.status,
    visibility_override: req.visibilityOverride || null,
  },
};
return [{ json: { ok: true, solutionId: solution.id, reviewPayload, solutionPatch, audit, decision: req.decision } }];`,
    },
    position: [1344, 0],
  },
  output: [{ ok: true, solutionId: 'solution-id' }],
});

const reviewAuthorized = ifElse({
  version: 2.3,
  config: {
    name: 'DI Solution Review Authorized?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [{ leftValue: '={{ $json.ok }}', rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }],
        combinator: 'and',
      },
      options: {},
    },
    position: [1568, 0],
  },
});

const insertReview = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Insert DI Solution Review',
    parameters: {
      method: 'POST',
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_reviews',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($json.reviewPayload) }}',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [1792, -64],
  },
  output: [[{ id: 'review-id', solution_id: 'solution-id' }]],
});

const updateSolution = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Update DI Solution Status',
    parameters: {
      method: 'PATCH',
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?id=eq.{{ encodeURIComponent($json.solutionId) }}',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($json.solutionPatch) }}',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [2016, -64],
  },
  output: [[{ id: 'solution-id', status: 'review' }]],
});

const insertAudit = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Insert DI Solution Review Audit',
    parameters: {
      method: 'POST',
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=minimal" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($("Authorize DI Solution Review").item.json.audit) }}',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [2240, -64],
  },
  output: [{}],
});

const mapReviewSuccess = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Map DI Solution Review Success',
    parameters: {
      jsCode: `const review = $('Insert DI Solution Review').first().json || {};
const updated = $('Update DI Solution Status').first().json || {};
const auth = $('Authorize DI Solution Review').first().json || {};
return [{ json: { ok: true, solutionId: auth.solutionId, reviewId: review.id || null, status: updated.status || auth.decision, decision: auth.decision } }];`,
    },
    position: [2464, -64],
  },
  output: [{ ok: true, solutionId: 'solution-id', status: 'review' }],
});

const respondReview = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond DI Solution Review',
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify($json.ok ? $json : { ok: false, error: { code: $json.errorCode || "DI_SOLUTION_REVIEW_ERROR", message: $json.message || "Unable to review Delivery Intelligence solution" } }) }}',
      options: {
        responseCode: '={{ $json.statusCode || 200 }}',
        responseHeaders: {
          entries: [
            { name: 'Access-Control-Allow-Origin', value: '*' },
          ],
        },
      },
    },
    position: [2688, 96],
  },
  output: [{ ok: true }],
});

const respondReviewCors = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond DI Solution Review CORS',
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify({ ok: true }) }}',
      options: {
        responseCode: 204,
        responseHeaders: {
          entries: [
            { name: 'Access-Control-Allow-Origin', value: '*' },
            { name: 'Access-Control-Allow-Methods', value: 'PATCH, OPTIONS' },
            { name: 'Access-Control-Allow-Headers', value: 'authorization, content-type' },
            { name: 'Access-Control-Max-Age', value: '86400' },
          ],
        },
      },
    },
    position: [224, 304],
  },
  output: [{ ok: true }],
});

export default workflow('di-solution-review-api', 'DI - Solution Review API')
  .add(patchReview)
  .to(prepareReview)
  .to(verifyReviewAuth)
  .to(fetchReviewProfile)
  .to(fetchSolution)
  .to(fetchReviewMemberships)
  .to(authorizeReview)
  .to(
    reviewAuthorized
      .onTrue(insertReview.to(updateSolution.to(insertAudit.to(mapReviewSuccess.to(respondReview)))))
      .onFalse(respondReview),
  )
  .add(optionsReview)
  .to(respondReviewCors);
