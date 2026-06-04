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
    path = backup_dir / f"workflow_{WORKFLOW_ID}_before_dedup_token_costs_{stamp}.json"
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

        marker = "function meteredRank(row) {"
        if marker in code:
            return False

        anchor = """function metadataFileCount(row) {
  const fileKeys = row.metadata?.file_keys;
  if (Array.isArray(fileKeys)) return fileKeys.length;
  if (typeof fileKeys === 'string' && fileKeys.trim()) {
    return fileKeys.split(',').map(item => item.trim()).filter(Boolean).length;
  }
  return Number(row.total_files) || 0;
}
"""
        insert = anchor + """
function meteredRank(row) {
  if (isCompletedEvent(row)) return 5;
  if (row.event === 'JOB_FAILED') return 4;
  if (row.event === 'QUALITY_GATE_FAILED') return 3;
  if (row.event === 'QUALITY_GATE_PASSED') return 2;
  if ((Number(row.tokens_total) || 0) || (Number(row.estimated_cost_usd) || 0)) return 1;
  return 0;
}

function meteredRowsFor(items) {
  const byJob = new Map();
  for (const row of items) {
    if (!row || !row.job_id) continue;
    const rank = meteredRank(row);
    if (!rank) continue;
    const key = `${row.pipeline || 'unknown'}|${row.job_id}`;
    const existing = byJob.get(key);
    const existingRank = existing ? meteredRank(existing) : -1;
    const isNewer = String(row.created_at || '') > String(existing?.created_at || '');
    if (!existing || rank > existingRank || (rank === existingRank && isNewer)) {
      byJob.set(key, row);
    }
  }
  return Array.from(byJob.values());
}

const meteredRows = meteredRowsFor(rows);
"""
        if anchor not in code:
            raise RuntimeError("metadataFileCount anchor not found")
        code = code.replace(anchor, insert)

        old_pipeline = """const costByPipelineMap = new Map();
for (const row of rows) {
  const key = row.pipeline || 'unknown';
  const current = costByPipelineMap.get(key) || {
    pipeline: key,
    jobs: 0,
    tokensTotal: 0,
    estimatedCostUsd: 0,
    avgCostUsd: 0
  };
  current.jobs += isCompletedEvent(row) ? 1 : 0;
  current.tokensTotal += Number(row.tokens_total) || 0;
  current.estimatedCostUsd += Number(row.estimated_cost_usd) || 0;
  costByPipelineMap.set(key, current);
}
"""
        new_pipeline = """const completedJobsByPipeline = new Map();
for (const row of completedRows) {
  const key = row.pipeline || 'unknown';
  completedJobsByPipeline.set(key, (completedJobsByPipeline.get(key) || 0) + 1);
}

const costByPipelineMap = new Map();
for (const row of meteredRows) {
  const key = row.pipeline || 'unknown';
  const current = costByPipelineMap.get(key) || {
    pipeline: key,
    jobs: completedJobsByPipeline.get(key) || 0,
    tokensTotal: 0,
    estimatedCostUsd: 0,
    avgCostUsd: 0
  };
  current.tokensTotal += Number(row.tokens_total) || 0;
  current.estimatedCostUsd += Number(row.estimated_cost_usd) || 0;
  costByPipelineMap.set(key, current);
}
for (const [key, jobs] of completedJobsByPipeline.entries()) {
  if (!costByPipelineMap.has(key)) {
    costByPipelineMap.set(key, { pipeline: key, jobs, tokensTotal: 0, estimatedCostUsd: 0, avgCostUsd: 0 });
  }
}
"""
        if old_pipeline not in code:
            raise RuntimeError("costByPipeline block not found")
        code = code.replace(old_pipeline, new_pipeline)

        old_project = """const costByProjectMap = new Map();
for (const row of rows) {
  const key = row.project_id || row.project_name || 'unknown';
  const current = costByProjectMap.get(key) || {
    projectId: row.project_id || null,
    projectName: row.project_name || 'Unknown project',
    jobs: 0,
    tokensTotal: 0,
    estimatedCostUsd: 0,
    avgCostUsd: 0
  };
  current.jobs += isCompletedEvent(row) ? 1 : 0;
  current.tokensTotal += Number(row.tokens_total) || 0;
  current.estimatedCostUsd += Number(row.estimated_cost_usd) || 0;
  costByProjectMap.set(key, current);
}
"""
        new_project = """const completedJobsByProject = new Map();
for (const row of completedRows) {
  const key = row.project_id || row.project_name || 'unknown';
  completedJobsByProject.set(key, (completedJobsByProject.get(key) || 0) + 1);
}

const costByProjectMap = new Map();
for (const row of meteredRows) {
  const key = row.project_id || row.project_name || 'unknown';
  const current = costByProjectMap.get(key) || {
    projectId: row.project_id || null,
    projectName: row.project_name || 'Unknown project',
    jobs: completedJobsByProject.get(key) || 0,
    tokensTotal: 0,
    estimatedCostUsd: 0,
    avgCostUsd: 0
  };
  current.tokensTotal += Number(row.tokens_total) || 0;
  current.estimatedCostUsd += Number(row.estimated_cost_usd) || 0;
  costByProjectMap.set(key, current);
}
for (const [key, jobs] of completedJobsByProject.entries()) {
  if (!costByProjectMap.has(key)) {
    const row = completedRows.find(item => (item.project_id || item.project_name || 'unknown') === key) || {};
    costByProjectMap.set(key, {
      projectId: row.project_id || null,
      projectName: row.project_name || 'Unknown project',
      jobs,
      tokensTotal: 0,
      estimatedCostUsd: 0,
      avgCostUsd: 0
    });
  }
}
"""
        if old_project not in code:
            raise RuntimeError("costByProject block not found")
        code = code.replace(old_project, new_project)

        code = code.replace(
            "totalCostUsd: roundMoney(sumNumber(rows, 'estimated_cost_usd')),",
            "totalCostUsd: roundMoney(sumNumber(meteredRows, 'estimated_cost_usd')),",
        )
        code = code.replace(
            "totalTokensConsumed: sumNumber(rows, 'tokens_total'),",
            "totalTokensConsumed: sumNumber(meteredRows, 'tokens_total'),",
        )
        code = code.replace(
            "avgDurationMs: avgNumber(rows, 'duration_ms'),",
            "avgDurationMs: avgNumber(completedRows, 'duration_ms'),",
        )

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
