import json
import sqlite3
from datetime import datetime
from pathlib import Path


DB_PATH = Path.home() / ".n8n" / "database.sqlite"
BACKUP_DIR = Path("docs/test_data/n8n_workflow_backups")
C9_WORKFLOW_ID = "C9oZfZxpGFakzlB3"
ANALYTICS_WORKFLOW_ID = "tcKSeScJRiWtRx77"


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


def patch_c9_duration(nodes):
    log_node = find_node(nodes, "LOG")
    js_code = log_node["parameters"]["jsCode"]
    old = """const completedAt = new Date();
const processingStartedAt = toDate(trigger.processingStartedAt || trigger.processing_started_at);
const createdAt = toDate(data.created_at);
const startedAt = processingStartedAt || createdAt;
const durationMs = startedAt ? Math.max(0, completedAt.getTime() - startedAt.getTime()) : null;"""
    new = """const completedAt = new Date();
const completedAtFromDb = toDate(data.updated_at);
const createdAt = toDate(data.created_at);
const durationMs = createdAt ? Math.max(0, (completedAtFromDb || completedAt).getTime() - createdAt.getTime()) : null;"""
    if old not in js_code:
        raise RuntimeError("Expected duration block was not found in C9 LOG node")
    log_node["parameters"]["jsCode"] = js_code.replace(old, new)


def patch_analytics_words(nodes):
    analytics_node = find_node(nodes, "Build Auth-Aware Analytics Response")
    js_code = analytics_node["parameters"]["jsCode"]
    replacements = {
        "      totalChunksIngested: sumNumber(rows, 'chunk_count'),\n      avgDurationMs: avgNumber(rows, 'duration_ms'),":
            "      totalChunksIngested: sumNumber(rows, 'chunk_count'),\n      totalWordsProcessed: sumNumber(completedRows, 'word_count'),\n      avgDurationMs: avgNumber(rows, 'duration_ms'),",
        "      totalChunksIngested: sumNumber(ingestionCompleted, 'chunk_count'),\n      avgProcessingDurationMs: avgNumber(ingestionCompleted, 'duration_ms'),":
            "      totalChunksIngested: sumNumber(ingestionCompleted, 'chunk_count'),\n      totalWordsProcessed: sumNumber(ingestionCompleted, 'word_count'),\n      avgProcessingDurationMs: avgNumber(ingestionCompleted, 'duration_ms'),",
    }
    for old, new in replacements.items():
        if old not in js_code:
            raise RuntimeError("Expected analytics summary block was not found")
        js_code = js_code.replace(old, new)
    analytics_node["parameters"]["jsCode"] = js_code


def main():
    if not DB_PATH.exists():
        raise FileNotFoundError(f"n8n database not found: {DB_PATH}")

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row

        c9_row, c9_nodes, c9_connections = load_workflow(conn, C9_WORKFLOW_ID)
        analytics_row, analytics_nodes, analytics_connections = load_workflow(conn, ANALYTICS_WORKFLOW_ID)

        c9_backup = backup_workflow(c9_row, c9_nodes, c9_connections, "duration_db_timestamp_patch")
        analytics_backup = backup_workflow(analytics_row, analytics_nodes, analytics_connections, "analytics_word_count_patch")

        patch_c9_duration(c9_nodes)
        patch_analytics_words(analytics_nodes)

        save_workflow(conn, c9_row, c9_nodes, c9_connections)
        save_workflow(conn, analytics_row, analytics_nodes, analytics_connections)
        conn.commit()

    print(f"Patched C9 workflow {C9_WORKFLOW_ID}")
    print(f"Patched analytics workflow {ANALYTICS_WORKFLOW_ID}")
    print(f"C9 backup: {c9_backup}")
    print(f"Analytics backup: {analytics_backup}")


if __name__ == "__main__":
    main()
