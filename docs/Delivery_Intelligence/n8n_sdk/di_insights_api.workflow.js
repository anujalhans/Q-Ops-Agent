import { workflow, node, trigger, newCredential } from '@n8n/workflow-sdk';

const getInsights = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'GET /di/insights',
    parameters: {
      path: 'di/insights',
      responseMode: 'responseNode',
      options: {},
    },
    position: [0, 0],
  },
  output: [{ headers: { authorization: 'Bearer token' }, query: { projectId: 'project-id' } }],
});

const optionsInsights = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'OPTIONS /di/insights',
    parameters: {
      httpMethod: 'OPTIONS',
      path: 'di/insights',
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
    name: 'Prepare DI Insights Request',
    parameters: {
      jsCode: `const headers = $json.headers || {};
const authHeader = headers.authorization || headers.Authorization || '';
const query = $json.query || {};
if (!String(authHeader).toLowerCase().startsWith('bearer ')) {
  return [{ json: { ok: false, statusCode: 401, errorCode: 'UNAUTHORIZED', message: 'Missing bearer token', token: '', projectId: query.projectId || query.project_id || null, limit: Math.min(Number(query.limit || 25), 100) } }];
}
return [{ json: { ok: true, token: String(authHeader).replace(/^Bearer\\s+/i, ''), projectId: query.projectId || query.project_id || null, limit: Math.min(Number(query.limit || 25), 100) } }];`,
    },
    position: [224, 0],
  },
  output: [{ ok: true, token: 'token', projectId: 'project-id', limit: 25 }],
});

const verifySupabaseUser = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Verify Insights Supabase Auth User',
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

const fetchUserProfile = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch Insights Q-Ops User Profile',
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

const fetchProjectMemberships = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch Insights Project Memberships',
    parameters: {
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ Array.isArray($json) ? ($json[0]?.id || "00000000-0000-0000-0000-000000000000") : ($json.id || "00000000-0000-0000-0000-000000000000") }}&select=project_id,project_role',
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
    executeOnce: true,
  },
  output: [{ project_id: 'project-id', project_role: 'owner' }],
});

const fetchProjects = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch Insights Projects',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?select=id,name,description,owner,module,release,status,tags,updated_at&limit=500',
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
  output: [{ id: 'project-id', name: 'Sample Project' }],
});

const fetchProfiles = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch DI Project Profiles',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_project_profiles?select=*&order=updated_at.desc&limit=100',
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
    position: [1344, 0],
    executeOnce: true,
  },
  output: [{ project_id: 'project-id', project_name: 'Sample Project' }],
});

const fetchOnboarding = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch DI Onboarding Guides',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_onboarding_guides?select=*&order=updated_at.desc&limit=100',
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
    position: [1568, 0],
    executeOnce: true,
  },
  output: [{ project_id: 'project-id', title: 'Onboarding Guide' }],
});

const fetchSimilarities = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch DI Similarity Matches',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_similarity_matches?select=*&order=confidence_score.desc,updated_at.desc&limit=200',
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
    position: [1792, 0],
    executeOnce: true,
  },
  output: [{ project_id: 'project-id', related_project_id: 'other-project-id', confidence_score: 0.8 }],
});

const fetchJobMetrics = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch DI Job Metrics',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_job_metrics?select=*&order=updated_at.desc&limit=200',
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
    position: [2016, 0],
    executeOnce: true,
  },
  output: [{ job_id: 'DI-1', project_id: 'project-id', job_type: 'project_intelligence_extract' }],
});

const fetchSolutions = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch DI Solutions For Governance',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?select=id,title,summary,implementation_complexity,visibility_level,status,source_project_id,updated_at&order=updated_at.desc&limit=200',
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
    position: [2240, 0],
    executeOnce: true,
  },
  output: [{ id: 'solution-id', title: 'Reusable Solution', status: 'draft', source_project_id: 'project-id' }],
});

const fetchReviews = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch DI Solution Reviews',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_reviews?select=*&order=updated_at.desc&limit=300',
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
    position: [2464, 0],
    executeOnce: true,
  },
  output: [{ solution_id: 'solution-id', decision: 'submitted' }],
});

const fetchRecommendations = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch DI Recommendations Snapshot',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?select=id,project_id,title,summary,recommendation_type,status,confidence_score,updated_at&order=updated_at.desc&limit=200',
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
    position: [2688, 0],
    executeOnce: true,
  },
  output: [{ id: 'recommendation-id', project_id: 'project-id', title: 'Recommendation' }],
});

const mapResponse = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Map DI Insights Response',
    parameters: {
      jsCode: `const req = $('Prepare DI Insights Request').first().json;
const auth = $('Verify Insights Supabase Auth User').first().json || {};
const rawProfile = $('Fetch Insights Q-Ops User Profile').first().json;
const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
if (!auth.id) return [{ json: { ok: false, statusCode: req.statusCode || 401, errorCode: req.errorCode || 'UNAUTHORIZED', message: req.message || 'Invalid Supabase Auth token' } }];
if (!profile?.id || profile.status !== 'active') return [{ json: { ok: false, statusCode: 403, errorCode: 'PROFILE_NOT_ACTIVE', message: 'Active Q-Ops user profile not found' } }];
const rows = (name) => $items(name).map((item) => item.json).filter((row) => row && Object.keys(row).length);
const memberships = rows('Fetch Insights Project Memberships');
const memberProjectIds = memberships.map((row) => row.project_id).filter(Boolean);
const isAdmin = profile.role === 'admin';
const canProject = (id) => isAdmin || !id || memberProjectIds.includes(id);
const projects = rows('Fetch Insights Projects').filter((project) => canProject(project.id));
const requestedProjectId = req.projectId || projects[0]?.id || null;
if (requestedProjectId && !canProject(requestedProjectId)) {
  return [{ json: { ok: false, statusCode: 403, errorCode: 'PROJECT_ACCESS_DENIED', message: 'User cannot access this Delivery Intelligence project' } }];
}
const projectMap = Object.fromEntries(projects.map((project) => [project.id, project]));
const profileRows = rows('Fetch DI Project Profiles').filter((row) => !requestedProjectId || row.project_id === requestedProjectId);
const onboardingRows = rows('Fetch DI Onboarding Guides').filter((row) => !requestedProjectId || row.project_id === requestedProjectId);
const similarityRows = rows('Fetch DI Similarity Matches').filter((row) => !requestedProjectId || row.project_id === requestedProjectId || row.related_project_id === requestedProjectId);
const metricRows = rows('Fetch DI Job Metrics').filter((row) => !requestedProjectId || row.project_id === requestedProjectId).slice(0, req.limit);
const solutionRows = rows('Fetch DI Solutions For Governance').filter((row) => canProject(row.source_project_id) && (!requestedProjectId || row.source_project_id === requestedProjectId));
const reviewRows = rows('Fetch DI Solution Reviews');
const recommendationRows = rows('Fetch DI Recommendations Snapshot').filter((row) => canProject(row.project_id) && (!requestedProjectId || row.project_id === requestedProjectId));
const reviewsBySolution = reviewRows.reduce((acc, row) => {
  (acc[row.solution_id] ||= []).push(row);
  return acc;
}, {});
const normalizedSolutions = solutionRows.map((solution) => {
  const latestReview = (reviewsBySolution[solution.id] || [])[0] || null;
  return {
    id: solution.id,
    title: solution.title,
    summary: solution.summary || 'Reusable solution candidate synthesized from internal DI signals.',
    status: solution.status,
    visibility: solution.visibility_level,
    implementationComplexity: solution.implementation_complexity,
    sourceProjectId: solution.source_project_id,
    latestReview,
    reviewCount: (reviewsBySolution[solution.id] || []).length,
    updatedAt: solution.updated_at,
  };
});
const normalizedSimilarities = similarityRows.map((match) => ({
  id: match.id,
  projectId: match.project_id,
  relatedProjectId: match.related_project_id,
  relatedProjectName: projectMap[match.related_project_id]?.name || match.related_project_id,
  confidenceScore: match.confidence_score,
  rationale: match.rationale,
  overlappingTechnologies: match.overlapping_technologies || [],
  overlappingSolutions: match.overlapping_solutions || [],
  overlappingLearningCategories: match.overlapping_learning_categories || [],
  evidence: match.evidence || [],
  status: match.status,
  updatedAt: match.updated_at,
})).sort((a, b) => Number(b.confidenceScore || 0) - Number(a.confidenceScore || 0));
const normalizedMetrics = metricRows.map((metric) => ({
  id: metric.id,
  jobId: metric.job_id,
  jobType: metric.job_type,
  status: metric.status,
  durationMs: metric.duration_ms,
  counts: metric.counts || {},
  warnings: metric.warnings || [],
  updatedAt: metric.updated_at,
}));
const activeProfile = profileRows[0] || null;
const activeGuide = onboardingRows[0] || null;
const governanceSummary = {
  totalSolutions: normalizedSolutions.length,
  drafts: normalizedSolutions.filter((solution) => solution.status === 'draft').length,
  inReview: normalizedSolutions.filter((solution) => solution.status === 'review').length,
  published: normalizedSolutions.filter((solution) => solution.status === 'published').length,
  reviewedSolutions: normalizedSolutions.filter((solution) => solution.reviewCount > 0).length,
};
const payload = {
  projectId: requestedProjectId,
  generatedAt: new Date().toISOString(),
  profile: activeProfile,
  onboardingGuide: activeGuide,
  similarityMatches: normalizedSimilarities.slice(0, req.limit),
  jobMetrics: normalizedMetrics,
  governance: {
    summary: governanceSummary,
    solutions: normalizedSolutions.slice(0, req.limit),
  },
  recommendations: recommendationRows.slice(0, req.limit),
  accessibleProjects: projects.map((project) => ({
    id: project.id,
    name: project.name,
    owner: project.owner,
    status: project.status,
    module: project.module,
    release: project.release,
  })),
};
return [{ json: { ok: true, ...payload } }];`,
    },
    position: [2912, 0],
  },
  output: [{ ok: true, projectId: 'project-id' }],
});

const respondInsights = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond DI Insights',
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify($json.ok ? $json : { ok: false, error: { code: $json.errorCode || "DI_INSIGHTS_ERROR", message: $json.message || "Unable to load Delivery Intelligence insights" } }) }}',
      options: {
        responseCode: '={{ $json.statusCode || 200 }}',
        responseHeaders: {
          entries: [
            { name: 'Access-Control-Allow-Origin', value: '*' },
          ],
        },
      },
    },
    position: [3136, 0],
  },
  output: [{ ok: true }],
});

const respondCors = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond DI Insights CORS',
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify({ ok: true }) }}',
      options: {
        responseCode: 204,
        responseHeaders: {
          entries: [
            { name: 'Access-Control-Allow-Origin', value: '*' },
            { name: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
            { name: 'Access-Control-Allow-Headers', value: 'authorization, content-type' },
            { name: 'Access-Control-Max-Age', value: '86400' },
          ],
        },
      },
    },
    position: [224, 288],
  },
  output: [{ ok: true }],
});

export default workflow('di-insights-api', 'DI - Insights API')
  .add(getInsights)
  .to(prepareRequest)
  .to(verifySupabaseUser)
  .to(fetchUserProfile)
  .to(fetchProjectMemberships)
  .to(fetchProjects)
  .to(fetchProfiles)
  .to(fetchOnboarding)
  .to(fetchSimilarities)
  .to(fetchJobMetrics)
  .to(fetchSolutions)
  .to(fetchReviews)
  .to(fetchRecommendations)
  .to(mapResponse)
  .to(respondInsights)
  .add(optionsInsights)
  .to(respondCors);
