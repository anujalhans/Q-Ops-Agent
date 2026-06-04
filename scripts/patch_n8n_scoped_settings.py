import datetime as dt
import json
import os
import sqlite3
import uuid
from pathlib import Path


DB_PATH = Path.home() / ".n8n" / "database.sqlite"
BACKUP_DIR = Path("docs/test_data/n8n_workflow_backups")
REST_BASE = "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1"
SUPABASE_URL = "https://ifnznfspkjayhnooncrv.supabase.co"
PUBLISHABLE_KEY = "sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt"
SERVICE_CREDENTIAL = {
    "httpCustomAuth": {
        "id": "DpZbhUxkEbKeXIiJ",
        "name": "supabase-service-role-key",
    }
}


def node(name, node_type, position, parameters, type_version=4.4, credentials=None, execute_once=True, always_output=True):
    item = {
        "parameters": parameters,
        "id": str(uuid.uuid4()),
        "name": name,
        "type": node_type,
        "typeVersion": type_version,
        "position": position,
    }
    if execute_once:
        item["executeOnce"] = True
    if always_output:
        item["alwaysOutputData"] = True
    if credentials:
        item["credentials"] = credentials
    return item


def code_node(name, position, js_code):
    return node(
        name,
        "n8n-nodes-base.code",
        position,
        {"jsCode": js_code},
        type_version=2,
        execute_once=False,
        always_output=False,
    )


def if_node(name, position, expression):
    return node(
        name,
        "n8n-nodes-base.if",
        position,
        {
            "conditions": {
                "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"},
                "conditions": [
                    {
                        "id": str(uuid.uuid4()),
                        "leftValue": expression,
                        "rightValue": True,
                        "operator": {"type": "boolean", "operation": "equals"},
                    }
                ],
                "combinator": "and",
            },
            "options": {},
        },
        type_version=2,
        execute_once=False,
        always_output=False,
    )


def http_node(name, position, parameters):
    return node(
        name,
        "n8n-nodes-base.httpRequest",
        position,
        parameters,
        type_version=4.4,
        credentials=SERVICE_CREDENTIAL,
    )


def respond_node(name, position, response_body, status_code=None):
    options = {
        "responseHeaders": {
            "entries": [
                {"name": "Access-Control-Allow-Origin", "value": "*"},
                {"name": "Access-Control-Allow-Headers", "value": "authorization, content-type"},
            ]
        }
    }
    if status_code:
        options["responseCode"] = status_code
    return node(
        name,
        "n8n-nodes-base.respondToWebhook",
        position,
        {"respondWith": "json", "responseBody": response_body, "options": options},
        type_version=1.1,
        execute_once=False,
        always_output=False,
    )


READ_PREPARE = r"""const headers = $json.headers || {};
const query = $json.query || {};
const authHeader = headers.authorization || headers.Authorization || '';
if (!String(authHeader).toLowerCase().startsWith('bearer ')) {
  return [{ json: { ok: false, statusCode: 401, error: { code: 'UNAUTHORIZED', message: 'Missing bearer token' } } }];
}
return [{
  json: {
    ok: true,
    token: String(authHeader).replace(/^Bearer\s+/i, ''),
    environmentKey: String(query.environmentKey || 'local'),
    selectedProjectId: query.projectId || null
  }
}];"""


READ_MAP = r"""const envs = $items('Fetch Environment Settings').map(i => i.json).filter(r => r && r.environment_key);
const integrations = $items('Fetch Integration Settings').map(i => i.json).filter(r => r && r.integration_key);
const userIntegrationsRaw = $items('Fetch User Integration Settings').map(i => i.json).filter(r => r && r.integration_key);
const projectOverridesRaw = $items('Fetch Project Integration Overrides').map(i => i.json).filter(r => r && r.integration_key);
const rawResults = $items('Fetch Latest Connection Results').map(i => i.json).filter(r => r && r.integration_key);
const profileRaw = $('Fetch Current Settings User Profile').first().json || {};
const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
const memberships = $items('Fetch Current Settings Project Memberships').map(i => i.json).filter(r => r && r.project_id);
const isAdmin = profile?.role === 'admin';
const allowedProjectIds = new Set(memberships.map(m => m.project_id));
const latestByKey = {};
for (const result of rawResults) {
  const key = `${result.environment_key}:${result.integration_key}`;
  if (!latestByKey[key]) latestByKey[key] = result;
}
function normalizeIntegration(row, scope, extra = {}) {
  const latest = latestByKey[`${row.environment_key}:${row.integration_key}`] || null;
  return {
    ...extra,
    scope,
    environmentKey: row.environment_key,
    integrationKey: row.integration_key,
    displayName: row.display_name,
    enabled: Boolean(row.enabled),
    config: row.config || row.override_config || {},
    secretRefs: row.secret_refs || {},
    status: row.status || 'not_configured',
    lastTestedAt: row.last_tested_at,
    lastTestedBy: row.last_tested_by,
    settingsVersion: row.settings_version || 1,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    latestTest: latest ? { status: latest.status, latencyMs: latest.latency_ms, message: latest.message, checkedAt: latest.checked_at, checkedBy: latest.checked_by } : null,
  };
}
const userIntegrations = userIntegrationsRaw.map(row => normalizeIntegration(row, 'user', { userId: row.user_id }));
const projectOverrides = projectOverridesRaw
  .filter(row => isAdmin || allowedProjectIds.has(row.project_id))
  .map(row => normalizeIntegration(row, 'project', { projectId: row.project_id }));
const byEnvironment = envs.map(env => {
  const scoped = integrations.filter(integration => integration.environment_key === env.environment_key).map(integration => normalizeIntegration(integration, 'workspace'));
  return {
    environmentKey: env.environment_key,
    displayName: env.display_name,
    apiBaseUrl: env.api_base_url,
    n8nBaseUrl: env.n8n_base_url,
    webhookPaths: env.webhook_paths || {},
    isActive: Boolean(env.is_active),
    updatedAt: env.updated_at,
    updatedBy: env.updated_by,
    integrations: scoped,
  };
});
return [{
  json: {
    environments: byEnvironment,
    environmentSettings: envs,
    integrations,
    userIntegrations,
    projectOverrides,
    currentUser: profile ? { id: profile.id, email: profile.email, name: profile.name, role: profile.role, status: profile.status } : null,
    projectMemberships: memberships,
    latestResults: rawResults,
  }
}];"""


WRITE_PREPARE_AUTH = r"""const headers = $json.headers || {};
const authHeader = headers.authorization || headers.Authorization || '';
if (!String(authHeader).toLowerCase().startsWith('bearer ')) {
  return [{ json: { ok: false, statusCode: 401, error: { code: 'UNAUTHORIZED', message: 'Missing bearer token' }, body: $json.body || {} } }];
}
return [{
  json: {
    ok: true,
    token: String(authHeader).replace(/^Bearer\s+/i, ''),
    body: $json.body || {}
  }
}];"""


WRITE_PREPARE_PATCH = r"""const restBase = 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1';
const body = $('Prepare Settings Write Auth').first().json.body || {};
const profileRaw = $('Fetch Settings Write User Profile').first().json || {};
const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
const memberships = $items('Fetch Settings Write Project Memberships').map(i => i.json).filter(r => r && r.project_id);
if (!profile?.id || profile.status !== 'active') {
  throw new Error('Active Q-Ops user profile not found');
}
const envKey = String(body.environmentKey || body.environment?.environmentKey || 'local');
const requestedScope = String(body.scope || body.settingsScope || body.integration?.scope || 'workspace').toLowerCase();
const scope = requestedScope === 'admin' || requestedScope === 'workspace_default' ? 'workspace' : requestedScope;
const projectId = String(body.projectId || body.integration?.projectId || '').trim();
const integrationBody = body.integration || {};
const integrationKey = String(body.integrationKey || integrationBody.integrationKey || '').trim();
const now = new Date().toISOString();
const actor = profile.name || profile.email || body.actorName || 'n8n';
const changedBy = profile.id;
const canWriteProject = profile.role === 'admin' || memberships.some(m => m.project_id === projectId && ['owner', 'editor'].includes(String(m.project_role || '').toLowerCase()));
function cleanConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const blocked = /(secret|token|password|api[_-]?key|authorization|service[_-]?role|bearer)/i;
  const out = {};
  for (const [key, inner] of Object.entries(value)) {
    if (blocked.test(key)) continue;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) out[key] = cleanConfig(inner);
    else out[key] = inner;
  }
  return out;
}
function changedKeys(payload) {
  return Object.keys(payload).filter(k => !['updated_at', 'updated_by'].includes(k));
}
if (integrationKey) {
  const enabled = typeof body.enabled === 'boolean' ? body.enabled : typeof integrationBody.enabled === 'boolean' ? integrationBody.enabled : true;
  const config = cleanConfig((body.config && typeof body.config === 'object') ? body.config : (integrationBody.config && typeof integrationBody.config === 'object') ? integrationBody.config : {});
  const secretRefs = (body.secretRefs && typeof body.secretRefs === 'object') ? body.secretRefs : (integrationBody.secretRefs && typeof integrationBody.secretRefs === 'object') ? integrationBody.secretRefs : {};
  const status = String(body.status || integrationBody.status || 'backend_managed');
  if (scope === 'workspace') {
    if (profile.role !== 'admin') throw new Error('Only admins can update workspace default integration settings');
    const payload = { updated_at: now, updated_by: changedBy, enabled, config, secret_refs: secretRefs, status };
    return [{ json: { method: 'PATCH', target: 'integration', scope, url: `${restBase}/qops_integration_settings?environment_key=eq.${encodeURIComponent(envKey)}&integration_key=eq.${encodeURIComponent(integrationKey)}`, payload, audit: { actor_user_id: changedBy, actor_name: actor, action: 'SETTINGS_INTEGRATION_UPDATED', entity_type: 'integration_settings', entity_id: integrationKey, status: 'success', details: `Updated workspace ${integrationKey} settings for ${envKey}`, metadata: { source: 'ui', scope, environmentKey: envKey, integrationKey, changedKeys: changedKeys(payload) } } } }];
  }
  if (scope === 'user') {
    const payload = { environment_key: envKey, user_id: profile.id, integration_key: integrationKey, display_name: integrationBody.displayName || body.displayName || integrationKey, updated_at: now, updated_by: changedBy, enabled, config, secret_refs: secretRefs, status };
    return [{ json: { method: 'POST', target: 'integration', scope, url: `${restBase}/qops_user_integration_settings?on_conflict=environment_key,user_id,integration_key`, payload, audit: { actor_user_id: changedBy, actor_name: actor, action: 'SETTINGS_USER_INTEGRATION_UPDATED', entity_type: 'user_integration_settings', entity_id: integrationKey, status: 'success', details: `Updated user ${integrationKey} settings for ${envKey}`, metadata: { source: 'ui', scope, environmentKey: envKey, integrationKey, changedKeys: changedKeys(payload) } } } }];
  }
  if (scope === 'project') {
    if (!projectId) throw new Error('projectId is required for project-scoped integration settings');
    if (!canWriteProject) throw new Error('Only admins, project owners, or project editors can update project integration overrides');
    const payload = { project_id: projectId, integration_key: integrationKey, override_config: config, updated_at: now, updated_by: changedBy, enabled, secret_refs: secretRefs, status };
    return [{ json: { method: 'POST', target: 'integration', scope, projectId, url: `${restBase}/qops_project_integration_overrides?on_conflict=project_id,integration_key`, payload, audit: { actor_user_id: changedBy, actor_name: actor, action: 'SETTINGS_PROJECT_INTEGRATION_UPDATED', entity_type: 'project_integration_overrides', entity_id: integrationKey, project_id: projectId, status: 'success', details: `Updated project ${integrationKey} override`, metadata: { source: 'ui', scope, projectId, environmentKey: envKey, integrationKey, changedKeys: changedKeys(payload) } } } }];
  }
  throw new Error(`Unsupported settings scope: ${scope}`);
}
if (profile.role !== 'admin') throw new Error('Only admins can update environment settings');
const environment = body.environment || body;
const payload = { updated_at: now, updated_by: changedBy };
if (environment.displayName !== undefined) payload.display_name = environment.displayName;
if (environment.apiBaseUrl !== undefined) payload.api_base_url = environment.apiBaseUrl;
if (environment.n8nBaseUrl !== undefined) payload.n8n_base_url = environment.n8nBaseUrl;
if (environment.webhookPaths !== undefined) payload.webhook_paths = environment.webhookPaths;
if (environment.isActive !== undefined) payload.is_active = Boolean(environment.isActive);
if (Object.keys(payload).length <= 2) throw new Error('No supported environment settings fields were provided');
return [{ json: { method: 'PATCH', target: 'environment', scope: 'workspace', url: `${restBase}/qops_environment_settings?environment_key=eq.${encodeURIComponent(envKey)}`, payload, audit: { actor_user_id: changedBy, actor_name: actor, action: 'SETTINGS_ENVIRONMENT_UPDATED', entity_type: 'environment_settings', entity_id: envKey, status: 'success', details: `Updated environment settings for ${envKey}`, metadata: { source: 'ui', scope: 'workspace', environmentKey: envKey, changedKeys: changedKeys(payload) } } } }];"""


def patch_settings_read(workflow):
    nodes = [n for n in workflow["nodes"] if n["name"] not in {
        "Prepare Settings Read Auth",
        "Settings Read Authorized?",
        "Verify Settings Read Supabase User",
        "Fetch Current Settings User Profile",
        "Fetch Current Settings Project Memberships",
        "Fetch User Integration Settings",
        "Fetch Project Integration Overrides",
        "Respond Settings Unauthorized",
    }]
    by_name = {n["name"]: n for n in nodes}
    nodes.extend([
        code_node("Prepare Settings Read Auth", [224, 0], READ_PREPARE),
        if_node("Settings Read Authorized?", [448, 0], "={{ $json.ok }}"),
        node(
            "Verify Settings Read Supabase User",
            "n8n-nodes-base.httpRequest",
            [672, -80],
            {
                "url": f"{SUPABASE_URL}/auth/v1/user",
                "sendHeaders": True,
                "headerParameters": {
                    "parameters": [
                        {"name": "apikey", "value": PUBLISHABLE_KEY},
                        {"name": "Authorization", "value": "={{ 'Bearer ' + $json.token }}"},
                    ],
                },
                "options": {},
            },
            type_version=4.4,
        ),
        http_node(
            "Fetch Current Settings User Profile",
            [896, -80],
            {
                "url": "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id }}&status=eq.active&select=id,email,name,role,status&limit=1",
                "sendHeaders": True,
                "specifyHeaders": "json",
                "jsonHeaders": "{ \"Content-Type\": \"application/json\" }",
                "options": {},
            },
        ),
        http_node(
            "Fetch Current Settings Project Memberships",
            [1120, -80],
            {
                "url": "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ (Array.isArray($json) ? $json[0] : $json).id }}&select=project_id,project_role",
                "sendHeaders": True,
                "specifyHeaders": "json",
                "jsonHeaders": "{ \"Content-Type\": \"application/json\" }",
                "options": {"alwaysOutputData": True},
            },
        ),
        http_node(
            "Fetch User Integration Settings",
            [2016, -80],
            {
                "url": "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_user_integration_settings?user_id=eq.{{ (Array.isArray($(\"Fetch Current Settings User Profile\").first().json) ? $(\"Fetch Current Settings User Profile\").first().json[0] : $(\"Fetch Current Settings User Profile\").first().json).id }}&select=environment_key,user_id,integration_key,display_name,enabled,config,secret_refs,status,settings_version,created_at,updated_at,updated_by&order=environment_key.asc,integration_key.asc",
                "sendHeaders": True,
                "specifyHeaders": "json",
                "jsonHeaders": "{ \"Content-Type\": \"application/json\" }",
                "options": {"alwaysOutputData": True},
            },
        ),
        http_node(
            "Fetch Project Integration Overrides",
            [2240, -80],
            {
                "url": f"{REST_BASE}/qops_project_integration_overrides",
                "sendQuery": True,
                "queryParameters": {
                    "parameters": [
                        {"name": "select", "value": "project_id,integration_key,override_config,enabled,secret_refs,status,settings_version,created_at,updated_at,updated_by"},
                        {"name": "order", "value": "project_id.asc,integration_key.asc"},
                    ]
                },
                "sendHeaders": True,
                "specifyHeaders": "json",
                "jsonHeaders": "{ \"Content-Type\": \"application/json\" }",
                "options": {"alwaysOutputData": True},
            },
        ),
        respond_node("Respond Settings Unauthorized", [672, 160], "={{ $json }}", 401),
    ])
    by_name = {n["name"]: n for n in nodes}
    by_name["Fetch Environment Settings"]["position"] = [1344, -80]
    by_name["Fetch Integration Settings"]["position"] = [1568, -80]
    by_name["Fetch Latest Connection Results"]["position"] = [1792, -80]
    by_name["Map Settings Response"]["position"] = [2464, -80]
    by_name["Map Settings Response"]["parameters"]["jsCode"] = READ_MAP
    by_name["Respond Settings"]["position"] = [2688, -80]
    workflow["nodes"] = nodes
    workflow["connections"] = {
        "GET /settings": {"main": [[{"node": "Prepare Settings Read Auth", "type": "main", "index": 0}]]},
        "Prepare Settings Read Auth": {"main": [[{"node": "Settings Read Authorized?", "type": "main", "index": 0}]]},
        "Settings Read Authorized?": {"main": [
            [{"node": "Verify Settings Read Supabase User", "type": "main", "index": 0}],
            [{"node": "Respond Settings Unauthorized", "type": "main", "index": 0}],
        ]},
        "Verify Settings Read Supabase User": {"main": [[{"node": "Fetch Current Settings User Profile", "type": "main", "index": 0}]]},
        "Fetch Current Settings User Profile": {"main": [[{"node": "Fetch Current Settings Project Memberships", "type": "main", "index": 0}]]},
        "Fetch Current Settings Project Memberships": {"main": [[{"node": "Fetch Environment Settings", "type": "main", "index": 0}]]},
        "Fetch Environment Settings": {"main": [[{"node": "Fetch Integration Settings", "type": "main", "index": 0}]]},
        "Fetch Integration Settings": {"main": [[{"node": "Fetch Latest Connection Results", "type": "main", "index": 0}]]},
        "Fetch Latest Connection Results": {"main": [[{"node": "Fetch User Integration Settings", "type": "main", "index": 0}]]},
        "Fetch User Integration Settings": {"main": [[{"node": "Fetch Project Integration Overrides", "type": "main", "index": 0}]]},
        "Fetch Project Integration Overrides": {"main": [[{"node": "Map Settings Response", "type": "main", "index": 0}]]},
        "Map Settings Response": {"main": [[{"node": "Respond Settings", "type": "main", "index": 0}]]},
    }


def patch_settings_write(workflow):
    nodes = [n for n in workflow["nodes"] if n["name"] not in {
        "Prepare Settings Write Auth",
        "Settings Write Authorized?",
        "Verify Settings Write Supabase User",
        "Fetch Settings Write User Profile",
        "Fetch Settings Write Project Memberships",
        "Respond Settings Write Unauthorized",
    }]
    by_name = {n["name"]: n for n in nodes}
    nodes.extend([
        code_node("Prepare Settings Write Auth", [224, 0], WRITE_PREPARE_AUTH),
        if_node("Settings Write Authorized?", [448, 0], "={{ $json.ok }}"),
        node(
            "Verify Settings Write Supabase User",
            "n8n-nodes-base.httpRequest",
            [672, -80],
            {
                "url": f"{SUPABASE_URL}/auth/v1/user",
                "sendHeaders": True,
                "headerParameters": {
                    "parameters": [
                        {"name": "apikey", "value": PUBLISHABLE_KEY},
                        {"name": "Authorization", "value": "={{ 'Bearer ' + $json.token }}"},
                    ],
                },
                "options": {},
            },
            type_version=4.4,
        ),
        http_node(
            "Fetch Settings Write User Profile",
            [896, -80],
            {
                "url": "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id }}&status=eq.active&select=id,email,name,role,status&limit=1",
                "sendHeaders": True,
                "specifyHeaders": "json",
                "jsonHeaders": "{ \"Content-Type\": \"application/json\" }",
                "options": {},
            },
        ),
        http_node(
            "Fetch Settings Write Project Memberships",
            [1120, -80],
            {
                "url": "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ (Array.isArray($json) ? $json[0] : $json).id }}&select=project_id,project_role",
                "sendHeaders": True,
                "specifyHeaders": "json",
                "jsonHeaders": "{ \"Content-Type\": \"application/json\" }",
                "options": {"alwaysOutputData": True},
            },
        ),
        respond_node("Respond Settings Write Unauthorized", [672, 160], "={{ $json }}", 401),
    ])
    by_name = {n["name"]: n for n in nodes}
    by_name["Prepare Settings Patch"]["position"] = [1344, -80]
    by_name["Prepare Settings Patch"]["parameters"]["jsCode"] = WRITE_PREPARE_PATCH
    by_name["Patch Settings Row"]["position"] = [1568, -80]
    by_name["Patch Settings Row"]["parameters"]["method"] = "={{ $json.method }}"
    by_name["Patch Settings Row"]["parameters"]["jsonHeaders"] = "{ \"Content-Type\": \"application/json\", \"Prefer\": \"resolution=merge-duplicates,return=representation\" }"
    by_name["Map Settings Write Response"]["position"] = [1792, -80]
    by_name["Insert Settings Audit Event"]["position"] = [2016, -80]
    by_name["Respond Settings Write"]["position"] = [2240, -80]
    workflow["nodes"] = nodes
    workflow["connections"] = {
        "PATCH /settings": {"main": [[{"node": "Prepare Settings Write Auth", "type": "main", "index": 0}]]},
        "Prepare Settings Write Auth": {"main": [[{"node": "Settings Write Authorized?", "type": "main", "index": 0}]]},
        "Settings Write Authorized?": {"main": [
            [{"node": "Verify Settings Write Supabase User", "type": "main", "index": 0}],
            [{"node": "Respond Settings Write Unauthorized", "type": "main", "index": 0}],
        ]},
        "Verify Settings Write Supabase User": {"main": [[{"node": "Fetch Settings Write User Profile", "type": "main", "index": 0}]]},
        "Fetch Settings Write User Profile": {"main": [[{"node": "Fetch Settings Write Project Memberships", "type": "main", "index": 0}]]},
        "Fetch Settings Write Project Memberships": {"main": [[{"node": "Prepare Settings Patch", "type": "main", "index": 0}]]},
        "Prepare Settings Patch": {"main": [[{"node": "Patch Settings Row", "type": "main", "index": 0}]]},
        "Patch Settings Row": {"main": [[{"node": "Map Settings Write Response", "type": "main", "index": 0}]]},
        "Map Settings Write Response": {"main": [[{"node": "Insert Settings Audit Event", "type": "main", "index": 0}]]},
        "Insert Settings Audit Event": {"main": [[{"node": "Respond Settings Write", "type": "main", "index": 0}]]},
    }


def load_workflow(cur, workflow_id):
    row = cur.execute(
        "select id,name,nodes,connections,versionCounter from workflow_entity where id=?",
        (workflow_id,),
    ).fetchone()
    if not row:
        raise RuntimeError(f"Workflow {workflow_id} not found")
    return {
        "id": row[0],
        "name": row[1],
        "nodes": json.loads(row[2]),
        "connections": json.loads(row[3]),
        "versionCounter": row[4],
    }


def backup_workflow(workflow):
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    path = BACKUP_DIR / f"workflow_{workflow['id']}_before_scoped_settings_{stamp}.json"
    path.write_text(json.dumps(workflow, indent=2), encoding="utf-8")
    return path


def save_workflow(cur, workflow):
    active = cur.execute("select activeVersionId, versionId from workflow_entity where id=?", (workflow["id"],)).fetchone()
    cur.execute(
        "update workflow_entity set nodes=?, connections=?, updatedAt=strftime('%Y-%m-%d %H:%M:%f','now'), versionCounter=versionCounter+1 where id=?",
        (json.dumps(workflow["nodes"]), json.dumps(workflow["connections"]), workflow["id"]),
    )
    for version_id in {active[0], active[1]} if active else set():
        if version_id:
            cur.execute(
                "update workflow_history set nodes=?, connections=?, updatedAt=strftime('%Y-%m-%d %H:%M:%f','now') where versionId=? and workflowId=?",
                (json.dumps(workflow["nodes"]), json.dumps(workflow["connections"]), version_id, workflow["id"]),
            )


def main():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    read_workflow = load_workflow(cur, "ZuXZfzhWr8Fcep5a")
    write_workflow = load_workflow(cur, "u3klCtPvbFd01ds4")
    read_backup = backup_workflow(read_workflow)
    write_backup = backup_workflow(write_workflow)
    patch_settings_read(read_workflow)
    patch_settings_write(write_workflow)
    save_workflow(cur, read_workflow)
    save_workflow(cur, write_workflow)
    con.commit()
    print(f"Patched {read_workflow['name']} and {write_workflow['name']}")
    print(f"Backups: {read_backup}, {write_backup}")


if __name__ == "__main__":
    main()
