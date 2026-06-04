import json
import sqlite3
from datetime import datetime
from pathlib import Path


N8N_DB = Path.home() / ".n8n" / "database.sqlite"
BACKUP_DIR = Path("docs/test_data/n8n_workflow_backups")
STAMP = datetime.now().strftime("%Y%m%d-%H%M%S")


WORKFLOWS = {
    "queue": "yPgr7mtUnL3E8QQP",
    "generated_docs": "mucEtw68lUvv9T6f",
    "analytics": "tcKSeScJRiWtRx77",
    "retrieval": "fullRetrievalD01",
}


def node_by_name(nodes, name):
    for node in nodes:
        if node.get("name") == name:
            return node
    raise RuntimeError(f"Node not found: {name}")


def update_workflow(conn, workflow_id, patcher, label):
    row = conn.execute(
        "select id, name, nodes from workflow_entity where id = ?",
        (workflow_id,),
    ).fetchone()
    if not row:
        raise RuntimeError(f"Workflow not found: {workflow_id}")

    nodes = json.loads(row["nodes"])
    backup_path = BACKUP_DIR / f"workflow_{workflow_id}_before_{label}_{STAMP}.json"
    backup_path.write_text(json.dumps(nodes, indent=2), encoding="utf-8")

    patcher(nodes)
    nodes_json = json.dumps(nodes, separators=(",", ":"))
    now = datetime.now().isoformat(timespec="milliseconds")

    conn.execute(
        "update workflow_entity set nodes = ?, updatedAt = ? where id = ?",
        (nodes_json, now, workflow_id),
    )

    history = conn.execute(
        """
        select versionId
        from workflow_history
        where workflowId = ?
        order by datetime(updatedAt) desc, datetime(createdAt) desc
        limit 1
        """,
        (workflow_id,),
    ).fetchone()
    if history:
        conn.execute(
            "update workflow_history set nodes = ?, updatedAt = ? where versionId = ?",
            (nodes_json, now, history["versionId"]),
        )

    return backup_path


def patch_queue(nodes):
    prepare = node_by_name(nodes, "Prepare Professional Queue Request")
    prepare["parameters"]["jsCode"] = r"""const now = new Date();
const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
const jobId = `PRO-${datePart}-${randomPart}`;
const headers = $json.headers || {};
const authHeader = headers.authorization || headers.Authorization || '';
const input = $json.body || {};
const retryOfJobId = String(input.retryJobId || input.retryOfJobId || '').trim();
const isRetry = Boolean(retryOfJobId);
const documentTypes = new Set(['test_strategy', 'test_plan', 'risk_matrix', 'test_cases', 'user_stories', 'traceability_matrix']);
const documentType = String(input.documentType || '').trim().toLowerCase();
if (!String(authHeader).toLowerCase().startsWith('bearer ')) {
  return [{ json: { ok: false, statusCode: 401, errorCode: 'UNAUTHORIZED', message: 'Missing bearer token' } }];
}
if (!String(input.projectName || '').trim() || !documentTypes.has(documentType)) {
  return [{ json: { ok: false, statusCode: 400, errorCode: 'INVALID_REQUEST', message: 'projectName and supported documentType are required' } }];
}

const defaultRetryInstruction = isRetry
  ? [
      'This request is a regeneration retry for a failed generation attempt.',
      `Previous failed job id: ${retryOfJobId}.`,
      'Preserve the same document type and project scope.',
      'If the previous attempt failed a quality gate, expand the output with grounded project evidence, include all required sections, and meet the configured minimum word count.',
      'Do not fabricate requirements; cite retrieved source metadata where available.'
    ].join(' ')
  : '';

const retryContext = {
  ...(input.retryContext || {}),
  retryOfJobId: isRetry ? retryOfJobId : null,
  retryMode: isRetry,
  retryInstruction: input.retryInstruction || defaultRetryInstruction
};

return [{
  json: {
    ok: true,
    jobId,
    retryMode: isRetry,
    retryOfJobId: isRetry ? retryOfJobId : null,
    retryInstruction: retryContext.retryInstruction,
    input: {
      ...input,
      retryJobId: undefined,
      jobId: undefined,
      retryOfJobId: isRetry ? retryOfJobId : null,
      retryContext,
      retryInstruction: retryContext.retryInstruction,
      documentType,
      generatorMode: 'professional'
    },
    token: String(authHeader).replace(/^Bearer\s+/i, ''),
    projectId: input.projectId || null,
    environment: input.environment || 'local'
  }
}];"""

    persist = node_by_name(nodes, "Persist Professional Job")
    persist["parameters"]["url"] = "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs"
    persist["parameters"]["method"] = "POST"
    persist["parameters"]["jsonBody"] = r"""={{ JSON.stringify({ job_id: $json.jobId, status: "pending", input: $json.input, project_id: $json.projectId, requested_by: $json.requestedBy, settings_version: $json.settingsVersion, config_snapshot: $json.configSnapshot, retry_of_job_id: $json.retryOfJobId || null }) }}"""

    log = node_by_name(nodes, "LOG: Professional Job Queued")
    log["parameters"]["jsonBody"] = r"""={{ JSON.stringify({ job_id: $("Combine Job And Runtime").item.json.jobId, project_name: $("Combine Job And Runtime").item.json.input.projectName, document_type: $("Combine Job And Runtime").item.json.input.documentType, pipeline: "generation", event: $("Combine Job And Runtime").item.json.retryMode ? "JOB_RETRIED" : "JOB_QUEUED", status: "info", project_id: $("Combine Job And Runtime").item.json.projectId, requested_by: $("Combine Job And Runtime").item.json.requestedBy, metadata: { generator_mode: "professional", retry: Boolean($("Combine Job And Runtime").item.json.retryMode), retry_of_job_id: $("Combine Job And Runtime").item.json.retryOfJobId || null, retry_instruction: $("Combine Job And Runtime").item.json.retryInstruction || null, product_owner: $("Combine Job And Runtime").item.json.input.productOwner, settings_version: $("Combine Job And Runtime").item.json.settingsVersion, environment: $("Combine Job And Runtime").item.json.environment, config_source_priority: $("Combine Job And Runtime").item.json.configSnapshot?.scope?.sourcePriority || $("Combine Job And Runtime").item.json.configSnapshot?.sourcePriority || {} } }) }}"""

    respond = node_by_name(nodes, "Respond Queued")
    respond["parameters"]["responseBody"] = r"""={{ JSON.stringify({ jobId: $("Combine Job And Runtime").item.json.jobId, status: "queued", generatorMode: "professional", retried: Boolean($("Combine Job And Runtime").item.json.retryMode), retryOfJobId: $("Combine Job And Runtime").item.json.retryOfJobId || null }) }}"""


def patch_generated_docs(nodes):
    fetch = node_by_name(nodes, "Fetch QA Jobs")
    params = fetch["parameters"]["queryParameters"]["parameters"]
    for item in params:
      if item.get("name") == "select":
          item["value"] = "job_id,status,input,output,error,created_at,updated_at,project_id,requested_by,settings_version,retry_of_job_id,retried_by_job_id,retry_status,retry_attempt"

    mapper = node_by_name(nodes, "Map Generated Documents Response")
    mapper["parameters"]["jsCode"] = r"""const documents = $input.all()
  .map(i => i.json)
  .filter(j => j && j.job_id)
  .map(j => ({
    id: j.job_id,
    jobId: j.job_id,
    projectId: j.project_id || j.output?.destination?.projectId || null,
    projectName: j.input?.projectName || j.output?.projectName || 'Unknown project',
    documentType: j.input?.documentType || j.output?.documentType || '',
    artifactLabel: j.input?.documentType || j.output?.artifactLabel || '',
    createdAt: j.created_at,
    updatedAt: j.updated_at,
    status: j.status,
    url: j.output?.url || j.output?.confluenceUrl || '',
    output: j.output || null,
    error: j.error || null,
    requestedBy: j.requested_by || null,
    settingsVersion: j.settings_version || null,
    retryOfJobId: j.retry_of_job_id || null,
    retriedByJobId: j.retried_by_job_id || null,
    retryStatus: j.retry_status || null,
    retryAttempt: Number(j.retry_attempt) || 0
  }));
return [{ json: { documents } }];"""


def patch_analytics(nodes):
    builder = node_by_name(nodes, "Build Auth-Aware Analytics Response")
    code = builder["parameters"]["jsCode"]
    code = code.replace(
        """const terminalRows = rows
  .filter(row => isCompletedEvent(row) || failedRows.includes(row))
  .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));""",
        """const terminalRows = rows
  .filter(row => isCompletedEvent(row) || failedRows.includes(row))
  .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));

const generationFailedMeteredRows = meteredRows.filter(row => row.pipeline === 'generation' && (
  row.event === 'JOB_FAILED' ||
  row.event === 'QUALITY_GATE_FAILED' ||
  row.status === 'error'
));"""
    )
    code = code.replace(
        """    errorMessage: failed ? (row.error_message || row.metadata?.message || row.metadata?.error || null) : null,
    createdAt: row.created_at,
    requestedBy: row.requested_by || null,
    projectId: row.project_id || null""",
        """    errorMessage: failed ? (row.error_message || row.metadata?.message || row.metadata?.error || null) : null,
    retryOfJobId: row.metadata?.retry_of_job_id || null,
    retryAttempt: Number(row.metadata?.retry_attempt) || 0,
    createdAt: row.created_at,
    requestedBy: row.requested_by || null,
    projectId: row.project_id || null"""
    )
    code = code.replace(
        """    costs: {
      byPipeline: costByPipeline,
      byProject: costByProject
    },""",
        """    costs: {
      byPipeline: costByPipeline,
      byProject: costByProject
    },
    failedSpend: {
      generation: {
        attempts: generationFailedMeteredRows.length,
        wordCount: sumNumber(generationFailedMeteredRows, 'word_count'),
        tokensTotal: sumNumber(generationFailedMeteredRows, 'tokens_total'),
        estimatedCostUsd: roundMoney(sumNumber(generationFailedMeteredRows, 'estimated_cost_usd')),
        avgDurationMs: avgNumber(generationFailedMeteredRows, 'duration_ms')
      }
    },"""
    )
    builder["parameters"]["jsCode"] = code


def patch_retrieval(nodes):
    prompt = node_by_name(nodes, "Prompt Library")
    code = prompt["parameters"]["jsCode"]
    code = code.replace(
        "const jobId = $json.jobId;\n\nconst canonical = values => [...new Set(values.filter(Boolean))];",
        "const jobId = $json.jobId;\nconst retryContext = $json.retryContext || {};\nconst retryInstruction = String($json.retryInstruction || retryContext.retryInstruction || '').trim();\n\nconst canonical = values => [...new Set(values.filter(Boolean))];",
    )
    code = code.replace(
        """const enhancedUser = [
  retrievalProfileInstructions,
  selectedPrompt.user,
  '',
  'Additional Confluence generation requirement: organize the final document so that traceability is visible and useful. Where possible, cite source metadata in the format [docType | source file | sectionTitle | chunkId].'
].filter(Boolean).join('\\n\\n');""",
        """const retryGuidance = retryInstruction
  ? [
      '========================',
      'REGENERATION RETRY GUIDANCE',
      '========================',
      retryInstruction,
      'Before finalizing, self-check the output against the quality gate: minimum word count, required sections, traceability/source references, and document-specific table expectations.'
    ].join('\\n')
  : '';

const enhancedUser = [
  retrievalProfileInstructions,
  selectedPrompt.user,
  retryGuidance,
  '',
  'Additional Confluence generation requirement: organize the final document so that traceability is visible and useful. Where possible, cite source metadata in the format [docType | source file | sectionTitle | chunkId].'
].filter(Boolean).join('\\n\\n');"""
    )
    code = code.replace(
        """    environmentKey: $json.environmentKey || 'local'
  }
}];""",
        """    environmentKey: $json.environmentKey || 'local',
    retryOfJobId: retryContext.retryOfJobId || null,
    retryContext,
    retryInstruction
  }
}];""",
    )
    prompt["parameters"]["jsCode"] = code

    log_failed = node_by_name(nodes, "LOG: Quality Gate Failed")
    log_failed["parameters"]["jsonBody"] = r"""={
  "job_id":        {{ JSON.stringify($('Restore Job Context').item.json.jobId) }},
  "project_name":  {{ JSON.stringify($('Prompt Library').item.json.projectName) }},
  "document_type": {{ JSON.stringify($('Prompt Library').item.json.documentType) }},
  "pipeline":      "generation",
  "event":         "QUALITY_GATE_FAILED",
  "status":        "error",
  "project_id": {{ $('Restore Job Context').item.json.projectId ? JSON.stringify($('Restore Job Context').item.json.projectId) : 'null' }},
  "requested_by": {{ $('Restore Job Context').item.json.requestedBy ? JSON.stringify($('Restore Job Context').item.json.requestedBy) : 'null' }},
  "word_count": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.wordCount || 0) || 0 }},
  "tokens_input": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.tokensInput || 0) || 0 }},
  "tokens_output": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.tokensOutput || 0) || 0 }},
  "tokens_total": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.tokensTotal || 0) || 0 }},
  "estimated_cost_usd": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.estimatedCostUsd || 0) || 0 }},
  "error_message": {{ JSON.stringify($json.message || $json.error?.message || 'Quality Gate Failed') }},
  "metadata": {
    "settings_version": {{ $('Restore Job Context').item.json.settingsVersion || 'null' }},
    "project_id": {{ $('Restore Job Context').item.json.projectId ? JSON.stringify($('Restore Job Context').item.json.projectId) : 'null' }},
    "requested_by": {{ $('Restore Job Context').item.json.requestedBy ? JSON.stringify($('Restore Job Context').item.json.requestedBy) : 'null' }},
    "environment": {{ JSON.stringify($('Restore Job Context').item.json.environmentKey || 'local') }},
    "generation_model": {{ JSON.stringify($('Restore Job Context').item.json.configSnapshot?.models?.generationModel || 'gpt-4.1-mini') }},
    "chroma_collection": {{ JSON.stringify($('Restore Job Context').item.json.configSnapshot?.chroma?.collection || 'qa-chunks-batches') }},
    "word_count": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.wordCount || 0) || 0 }},
    "token_usage": {{ JSON.stringify((($items('Validate AI Agent Output')[0] || {}).json || {}).tokenUsage || {}) }},
    "retry_of_job_id": {{ $('Restore Job Context').item.json.retryOfJobId ? JSON.stringify($('Restore Job Context').item.json.retryOfJobId) : 'null' }}
  }
}"""

    failed_status = node_by_name(nodes, "Update Job Status as Failed1")
    failed_status["parameters"]["jsonBody"] = r"""={
  "status": "failed",
  "error": {{ JSON.stringify($json.message || $json.error?.message || 'Quality Gate Failed') }},
  "output": {
    "error": true,
    "message": {{ JSON.stringify($json.message || $json.error?.message || 'Quality Gate Failed') }},
    "projectName": {{ JSON.stringify($('Prompt Library').item.json.projectName) }},
    "documentType": {{ JSON.stringify($('Prompt Library').item.json.documentType) }},
    "wordCount": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.wordCount || 0) || 0 }},
    "tokensInput": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.tokensInput || 0) || 0 }},
    "tokensOutput": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.tokensOutput || 0) || 0 }},
    "tokensTotal": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.tokensTotal || 0) || 0 }},
    "estimatedCostUsd": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.estimatedCostUsd || 0) || 0 }},
    "tokenUsage": {{ JSON.stringify((($items('Validate AI Agent Output')[0] || {}).json || {}).tokenUsage || { source: 'estimated', input: 0, output: 0, total: 0, estimatedCostUsd: 0 }) }},
    "qualityGate": {
      "passed": false,
      "failureType": "QUALITY_GATE_FAILED",
      "message": {{ JSON.stringify($json.message || $json.error?.message || 'Quality Gate Failed') }},
      "wordCount": {{ Number(($items('Validate AI Agent Output')[0] || {}).json?.wordCount || 0) || 0 }},
      "minWordCount": {{ ({ test_strategy: 2000, test_plan: 1500, test_cases: 1000, user_stories: 500, risk_matrix: 800, traceability_matrix: 800 })[$('Prompt Library').item.json.documentType] || 500 }}
    },
    "settingsVersion": {{ $('Restore Job Context').item.json.settingsVersion || 'null' }},
    "retryOfJobId": {{ $('Restore Job Context').item.json.retryOfJobId ? JSON.stringify($('Restore Job Context').item.json.retryOfJobId) : 'null' }}
  },
  "updated_at": "{{ new Date().toISOString() }}"
}"""


def main():
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(N8N_DB)
    conn.row_factory = sqlite3.Row
    try:
        backups = [
            update_workflow(conn, WORKFLOWS["queue"], patch_queue, "generation_retry_transparency"),
            update_workflow(conn, WORKFLOWS["generated_docs"], patch_generated_docs, "generation_retry_transparency"),
            update_workflow(conn, WORKFLOWS["analytics"], patch_analytics, "generation_retry_transparency"),
            update_workflow(conn, WORKFLOWS["retrieval"], patch_retrieval, "generation_retry_transparency"),
        ]
        conn.commit()
        print("Patched generation retry transparency workflows:")
        for path in backups:
            print(path)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
