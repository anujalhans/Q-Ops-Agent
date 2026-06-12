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
    path = backup_dir / f"workflow_{WORKFLOW_ID}_before_analytics_terminal_failure_dedupe_v2_{stamp}.json"
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
        if "function dedupeFailedRows(items)" in code:
            return False

        old_failed = """const failedRows = rows.filter(row =>
  row.event === 'JOB_FAILED' ||
  row.event === 'QUALITY_GATE_FAILED' ||
  row.status === 'error'
);
"""
        new_failed = """const failedRowsRaw = rows.filter(row =>
  row.event === 'JOB_FAILED' ||
  row.event === 'QUALITY_GATE_FAILED' ||
  row.status === 'error'
);

function failedRank(row) {
  if (row.event === 'JOB_FAILED') return 4;
  if (row.event === 'QUALITY_GATE_FAILED') return 3;
  if (row.status === 'error') return 2;
  return 0;
}

function dedupeFailedRows(items) {
  const byJob = new Map();
  for (const row of items) {
    if (!row || !row.job_id) continue;
    const key = `${row.pipeline || 'unknown'}|${row.job_id}`;
    const existing = byJob.get(key);
    const rank = failedRank(row);
    const existingRank = existing ? failedRank(existing) : -1;
    const isNewer = String(row.created_at || '') > String(existing?.created_at || '');
    if (!existing || rank > existingRank || (rank === existingRank && isNewer)) {
      byJob.set(key, row);
    }
  }
  return Array.from(byJob.values());
}

const failedRows = dedupeFailedRows(failedRowsRaw);
"""
        if old_failed not in code:
            raise RuntimeError("failedRows block not found")
        code = code.replace(old_failed, new_failed)

        old_overview = """      totalJobsFailed: failedRows.length,
      successRate,
      totalCostUsd: roundMoney(sumNumber(meteredRows, 'estimated_cost_usd')),
      avgCostPerDocument: generationCompleted.length ? roundMoney(sumNumber(generationCompleted, 'estimated_cost_usd') / generationCompleted.length) : 0,
      totalTokensConsumed: sumNumber(meteredRows, 'tokens_total'),
      totalChunksIngested: sumNumber(rows, 'chunk_count'),
      totalWordsProcessed: sumNumber(completedRows, 'word_count'),
      avgDurationMs: avgNumber(completedRows, 'duration_ms'),
      avgIngestionDurationMs: avgNumber(ingestionCompleted, 'duration_ms'),
"""
        new_overview = """      totalJobsFailed: failedRows.length,
      totalJobsFailedHistorical: failedRows.length,
      successRate,
      successRateHistorical: successRate,
      totalCostUsd: roundMoney(sumNumber(meteredRows, 'estimated_cost_usd')),
      avgCostPerDocument: generationCompleted.length ? roundMoney(sumNumber(generationCompleted, 'estimated_cost_usd') / generationCompleted.length) : 0,
      totalTokensConsumed: sumNumber(meteredRows, 'tokens_total'),
      totalChunksIngested: sumNumber(rows, 'chunk_count'),
      totalWordsProcessed: sumNumber(completedRows, 'word_count'),
      avgDurationMs: avgNumber(completedRows, 'duration_ms'),
      avgGenerationDurationMs: avgNumber(generationCompleted, 'duration_ms'),
      avgIngestionDurationMs: avgNumber(ingestionCompleted, 'duration_ms'),
"""
        if old_overview not in code:
            raise RuntimeError("overview metrics block not found")
        code = code.replace(old_overview, new_overview)

        node["parameters"]["jsCode"] = code
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
