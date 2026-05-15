import json
import sqlite3
from datetime import datetime
from pathlib import Path


DB_PATH = Path.home() / ".n8n" / "database.sqlite"
BACKUP_DIR = Path("docs/test_data/n8n_workflow_backups")
C9_WORKFLOW_ID = "C9oZfZxpGFakzlB3"
WORKER_WORKFLOW_ID = "mlelxUdlNcoBIyru"


def load_workflow(conn, workflow_id):
    row = conn.execute(
        'select id, name, nodes, connections, "versionId" from workflow_entity where id = ?',
        (workflow_id,),
    ).fetchone()
    if row is None:
        raise RuntimeError(f"Workflow {workflow_id} was not found")
    return row, json.loads(row["nodes"]), json.loads(row["connections"])


def backup_workflow(row, nodes, connections, suffix):
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = BACKUP_DIR / f"workflow_{row['id']}_before_{suffix}_{timestamp}.json"
    path.write_text(
        json.dumps(
            {
                "id": row["id"],
                "name": row["name"],
                "versionId": row["versionId"],
                "nodes": nodes,
                "connections": connections,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    return path


def find_node(nodes, name):
    node = next((item for item in nodes if item.get("name") == name), None)
    if node is None:
        raise RuntimeError(f"Node {name!r} was not found")
    return node


def save_workflow(conn, row, nodes, connections):
    nodes_json = json.dumps(nodes, ensure_ascii=False)
    connections_json = json.dumps(connections, ensure_ascii=False)
    workflow_id = row["id"]
    conn.execute(
        'update workflow_entity set nodes = ?, connections = ?, "updatedAt" = CURRENT_TIMESTAMP where id = ?',
        (nodes_json, connections_json, workflow_id),
    )
    version_id = row["versionId"]
    if version_id:
        conn.execute(
            'update workflow_history set nodes = ?, connections = ?, "updatedAt" = CURRENT_TIMESTAMP where "workflowId" = ? and "versionId" = ?',
            (nodes_json, connections_json, workflow_id, version_id),
        )


def patch_worker(nodes):
    lock_node = find_node(nodes, "Lock Pending Job picked for processing")
    lock_params = lock_node.setdefault("parameters", {})
    body_parameters = lock_params.setdefault("bodyParameters", {}).setdefault("parameters", [])
    if not any(param.get("name") == "updated_at" for param in body_parameters):
        body_parameters.append({"name": "updated_at", "value": "={{ new Date().toISOString() }}"})

    prepare_node = find_node(nodes, "Prepare Job Input")
    prepare_node["parameters"]["jsCode"] = """const job = Array.isArray($json) ? $json[0] : $json;
const input = job.input || {};

return [{
  json: {
    jobId: job.job_id,
    projectName: input.projectName,
    status: job.status,
    files: input.files || {},
    projectId: job.project_id || null,
    requestedBy: job.requested_by || null,
    settingsVersion: job.settings_version || null,
    configSnapshot: job.config_snapshot || {},
    processingStartedAt: job.updated_at || new Date().toISOString()
  }
}];"""

    convert_node = find_node(nodes, "Convert Files Object â†’ Array")
    convert_node["parameters"]["jsCode"] = """const files = $json.files || {};

return Object.entries(files).map(([key, url]) => {
  return {
    json: {
      fileKey: key,
      fileUrl: url,
      projectName: $json.projectName,
      status: $json.status,
      jobId: $json.jobId,
      projectId: $json.projectId || null,
      requestedBy: $json.requestedBy || null,
      settingsVersion: $json.settingsVersion || null,
      configSnapshot: $json.configSnapshot || {},
      processingStartedAt: $json.processingStartedAt || null
    }
  };
});"""

    combine_node = find_node(nodes, "Convert ALL binaries inside ONE item")
    combine_node["parameters"]["jsCode"] = """const allItems = $input.all();

let combinedBinary = {};
let combinedJson = [];

allItems.forEach((item, index) => {
  combinedJson.push(item.json);
  if (item.binary && item.binary.data) {
    combinedBinary['data' + index] = item.binary.data;
  }
});

const first = allItems[0]?.json || {};

return [
  {
    json: {
      files: combinedJson,
      jobId: first.jobId,
      projectName: first.projectName,
      status: first.status,
      projectId: first.projectId || null,
      requestedBy: first.requestedBy || null,
      settingsVersion: first.settingsVersion || null,
      configSnapshot: first.configSnapshot || {},
      processingStartedAt: first.processingStartedAt || null
    },
    binary: combinedBinary
  }
];"""


def patch_c9(nodes):
    log_node = find_node(nodes, "LOG")
    log_node["parameters"]["jsCode"] = """const data = $json;
const trigger = $('When Executed by Another Workflow').first().json;

function firstFileKey(files) {
  const keys = Object.keys(files || {});
  return keys[0] || 'unknown';
}

function documentTypeFromFileKey(key) {
  const value = String(key || '').toLowerCase();
  if (['brd', 'frd', 'hld', 'lld'].includes(value)) return value.toUpperCase();
  if (value.startsWith('transcript')) return 'TRANSCRIPT';
  if (value === 'image' || value.startsWith('image')) return 'UI_DESIGN';
  return value ? value.toUpperCase() : 'UNKNOWN';
}

function toDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

const jobId = data.job_id;
const projectName = data.input?.projectName;
const files = data.input?.files || {};
const fileKeys = Object.keys(files);
const totalFiles = fileKeys.length;
const fileKey = firstFileKey(files);
const documentType = documentTypeFromFileKey(fileKey);
const configSnapshot = data.config_snapshot || trigger.configSnapshot || trigger.config_snapshot || {};
const tokenUsage = data.output?.tokenUsage || {};
const completedAt = new Date();
const processingStartedAt = toDate(trigger.processingStartedAt || trigger.processing_started_at);
const createdAt = toDate(data.created_at);
const startedAt = processingStartedAt || createdAt;
const durationMs = startedAt ? Math.max(0, completedAt.getTime() - startedAt.getTime()) : null;
const embeddedCharacterCount = Number(tokenUsage.embeddedCharacterCount) || 0;
const wordCount = embeddedCharacterCount ? Math.max(1, Math.round(embeddedCharacterCount / 5)) : null;

console.log("INGESTION COMPLETED:", {
  jobId,
  projectName,
  totalFiles,
  fileKeys,
  documentType,
  durationMs,
  wordCount,
  projectId: data.project_id || trigger.projectId || trigger.project_id || null,
  requestedBy: data.requested_by || trigger.requestedBy || trigger.requested_by || null,
  tokensTotal: tokenUsage.tokensTotal || 0,
  estimatedCostUsd: tokenUsage.estimatedCostUsd || 0
});

return [
  {
    json: {
      jobId,
      projectName,
      totalFiles,
      fileKeys,
      fileKey,
      documentType,
      logType: "INGESTION_COMPLETED",
      totalChunksStored: data.output?.totalChunksStored || 0,
      durationMs,
      wordCount,
      tokensInput: Number(tokenUsage.tokensInput) || 0,
      tokensOutput: Number(tokenUsage.tokensOutput) || 0,
      tokensTotal: Number(tokenUsage.tokensTotal) || 0,
      estimatedCostUsd: Number(tokenUsage.estimatedCostUsd) || 0,
      tokenUsage,
      projectId: data.project_id || trigger.projectId || trigger.project_id || null,
      requestedBy: data.requested_by || trigger.requestedBy || trigger.requested_by || null,
      settingsVersion: data.settings_version || trigger.settingsVersion || trigger.settings_version || null,
      configSnapshot,
      environmentKey: configSnapshot.environment?.key || trigger.environment || 'local',
      completedAt: completedAt.toISOString()
    }
  }
];"""

    metric_node = find_node(nodes, "LOG: Job Completed")
    metric_node["parameters"]["jsonBody"] = """={
  "job_id":       "{{ $json.jobId }}",
  "project_name": "{{ $json.projectName }}",
  "document_type": "{{ $json.documentType || 'UNKNOWN' }}",
  "pipeline":     "ingestion",
  "event":        "JOB_COMPLETED",
  "status":       "info",
  "project_id": {{ $json.projectId ? JSON.stringify($json.projectId) : 'null' }},
  "requested_by": {{ $json.requestedBy ? JSON.stringify($json.requestedBy) : 'null' }},
  "duration_ms":  {{ Number($json.durationMs) || 0 }},
  "word_count": {{ Number($json.wordCount) || 0 }},
  "chunk_count":  {{ parseInt($json.totalChunksStored) || 0 }},
  "total_files":  {{ $json.totalFiles || 0 }},
  "tokens_input": {{ Number($json.tokensInput) || 0 }},
  "tokens_output": {{ Number($json.tokensOutput) || 0 }},
  "tokens_total": {{ Number($json.tokensTotal) || 0 }},
  "estimated_cost_usd": {{ Number($json.estimatedCostUsd) || 0 }},
  "metadata": {
    "file_keys": {{ JSON.stringify($json.fileKeys || []) }},
    "file_key": {{ JSON.stringify($json.fileKey || null) }},
    "document_type": {{ JSON.stringify($json.documentType || 'UNKNOWN') }},
    "settings_version": {{ $json.settingsVersion || 'null' }},
    "project_id": {{ $json.projectId ? JSON.stringify($json.projectId) : 'null' }},
    "requested_by": {{ $json.requestedBy ? JSON.stringify($json.requestedBy) : 'null' }},
    "environment": "{{ $json.environmentKey || 'local' }}",
    "chroma_collection": "{{ $json.configSnapshot?.chroma?.collection || 'qa-chunks-batches' }}",
    "token_usage": {{ JSON.stringify($json.tokenUsage || {}) }}
  }
}"""


def main():
    if not DB_PATH.exists():
        raise FileNotFoundError(f"n8n database not found: {DB_PATH}")

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row

        worker_row, worker_nodes, worker_connections = load_workflow(conn, WORKER_WORKFLOW_ID)
        c9_row, c9_nodes, c9_connections = load_workflow(conn, C9_WORKFLOW_ID)

        worker_backup = backup_workflow(worker_row, worker_nodes, worker_connections, "metrics_enrichment_patch")
        c9_backup = backup_workflow(c9_row, c9_nodes, c9_connections, "metrics_enrichment_patch")

        patch_worker(worker_nodes)
        patch_c9(c9_nodes)

        save_workflow(conn, worker_row, worker_nodes, worker_connections)
        save_workflow(conn, c9_row, c9_nodes, c9_connections)
        conn.commit()

    print(f"Patched worker workflow {WORKER_WORKFLOW_ID}")
    print(f"Patched C9 workflow {C9_WORKFLOW_ID}")
    print(f"Worker backup: {worker_backup}")
    print(f"C9 backup: {c9_backup}")


if __name__ == "__main__":
    main()
