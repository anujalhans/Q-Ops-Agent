import json
import sqlite3
from datetime import datetime
from pathlib import Path


DB_PATH = Path.home() / ".n8n" / "database.sqlite"
BACKUP_DIR = Path("docs/test_data/n8n_workflow_backups")
ANALYTICS_WORKFLOW_ID = "tcKSeScJRiWtRx77"


def load_workflow(conn, workflow_id):
    row = conn.execute(
        'select id, name, nodes, connections, "versionId" from workflow_entity where id = ?',
        (workflow_id,),
    ).fetchone()
    if row is None:
        raise RuntimeError(f"Workflow {workflow_id} was not found")
    return row, json.loads(row["nodes"]), json.loads(row["connections"])


def backup_workflow(row, nodes, connections):
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = BACKUP_DIR / f"workflow_{row['id']}_before_recent_jobs_limit_patch_{timestamp}.json"
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


def main():
    if not DB_PATH.exists():
        raise FileNotFoundError(f"n8n database not found: {DB_PATH}")

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row, nodes, connections = load_workflow(conn, ANALYTICS_WORKFLOW_ID)
        backup = backup_workflow(row, nodes, connections)

        node = find_node(nodes, "Build Auth-Aware Analytics Response")
        js_code = node["parameters"]["jsCode"]
        old = "const recentJobs = completedRows.slice(0, 10).map(row => ({"
        new = "const recentJobs = completedRows.slice(0, 100).map(row => ({"
        if old not in js_code:
            raise RuntimeError("Expected recentJobs limit block was not found")
        node["parameters"]["jsCode"] = js_code.replace(old, new)

        save_workflow(conn, row, nodes, connections)
        conn.commit()

    print(f"Patched analytics workflow {ANALYTICS_WORKFLOW_ID}")
    print(f"Backup: {backup}")


if __name__ == "__main__":
    main()
