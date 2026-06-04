import json
import os
import sqlite3
from datetime import datetime
from pathlib import Path


WORKFLOW_ID = "tcKSeScJRiWtRx77"
WORKFLOW_NAME = "Q-Ops-Agent-Analytics-Summary"
TARGET_NODE = "Build Auth-Aware Analytics Response"


def backup_workflow(cur, backup_dir: Path) -> Path:
    cur.execute(
        "select id, name, nodes, connections, settings, staticData, pinData, versionId, activeVersionId from workflow_entity where id = ?",
        (WORKFLOW_ID,),
    )
    row = cur.fetchone()
    if not row:
        raise RuntimeError(f"Workflow {WORKFLOW_ID} not found")

    backup_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = backup_dir / f"workflow_{WORKFLOW_ID}_before_recent_failed_jobs_{stamp}.json"
    path.write_text(
        json.dumps(
            {
                "id": row[0],
                "name": row[1],
                "nodes": json.loads(row[2]),
                "connections": json.loads(row[3]),
                "settings": json.loads(row[4] or "{}"),
                "staticData": json.loads(row[5] or "{}"),
                "pinData": json.loads(row[6] or "{}"),
                "versionId": row[7],
                "activeVersionId": row[8],
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    return path


def patch_nodes(nodes):
    for node in nodes:
        if node.get("name") != TARGET_NODE:
            continue
        code = node.get("parameters", {}).get("jsCode", "")
        old = """const recentJobs = completedRows.slice(0, 100).map(row => ({
  jobId: row.job_id,
  projectName: row.project_name,
  documentType: row.document_type,
  pipeline: row.pipeline,
  status: row.status,
  durationMs: row.duration_ms,
  wordCount: row.word_count,
  chunkCount: row.chunk_count,
  totalFiles: row.total_files,
  tokensTotal: row.tokens_total || 0,
  estimatedCostUsd: Number(row.estimated_cost_usd) || 0,
  createdAt: row.created_at,
  requestedBy: row.requested_by || null,
  projectId: row.project_id || null
}));"""
        new = """const terminalRows = rows
  .filter(row => isCompletedEvent(row) || failedRows.includes(row))
  .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));

const recentJobs = terminalRows.slice(0, 100).map(row => {
  const failed = failedRows.includes(row);
  return {
    jobId: row.job_id,
    projectName: row.project_name,
    documentType: row.document_type,
    pipeline: row.pipeline,
    event: row.event,
    status: failed ? 'failed' : row.status,
    durationMs: row.duration_ms,
    wordCount: row.word_count,
    chunkCount: row.chunk_count,
    totalFiles: row.total_files,
    tokensTotal: row.tokens_total || 0,
    estimatedCostUsd: Number(row.estimated_cost_usd) || 0,
    errorMessage: failed ? (row.error_message || row.metadata?.message || row.metadata?.error || null) : null,
    createdAt: row.created_at,
    requestedBy: row.requested_by || null,
    projectId: row.project_id || null
  };
});"""
        if new in code:
            return False
        if old not in code:
            raise RuntimeError("Expected recentJobs block not found")
        node["parameters"]["jsCode"] = code.replace(old, new)
        return True
    raise RuntimeError(f"Node {TARGET_NODE} not found")


def main():
    db_path = Path(os.path.expanduser(r"~\.n8n\database.sqlite"))
    backup_dir = Path("docs/test_data/n8n_workflow_backups")

    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        backup_path = backup_workflow(cur, backup_dir)

        cur.execute("select nodes, activeVersionId from workflow_entity where id = ?", (WORKFLOW_ID,))
        nodes_raw, active_version_id = cur.fetchone()
        nodes = json.loads(nodes_raw)
        changed = patch_nodes(nodes)
        if not changed:
            print("Workflow already patched")
            return

        nodes_json = json.dumps(nodes, separators=(",", ":"))
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        cur.execute(
            "update workflow_entity set nodes = ?, updatedAt = ? where id = ?",
            (nodes_json, now, WORKFLOW_ID),
        )
        if active_version_id:
            cur.execute(
                "update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?",
                (nodes_json, now, WORKFLOW_ID, active_version_id),
            )
        conn.commit()
        print(f"Patched {WORKFLOW_NAME}; backup: {backup_path}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
