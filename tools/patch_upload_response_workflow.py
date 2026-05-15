from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path


DB_PATH = Path(r"C:\Users\anujalhans01\.n8n\database.sqlite")
WORKFLOW_ID = "iiR8d9v5oI8WzBPX"
BACKUP_PATH = Path("docs/test_data/extract_images_v2_smoke/workflow_iiR8d9v5oI8WzBPX_before_upload_response_patch.json")


def main() -> None:
    BACKUP_PATH.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "select nodes, versionId, versionCounter from workflow_entity where id = ?",
        (WORKFLOW_ID,),
    )
    row = cur.fetchone()
    if not row:
        raise RuntimeError(f"Workflow {WORKFLOW_ID} not found")

    nodes_json, version_id, version_counter = row
    BACKUP_PATH.write_text(nodes_json, encoding="utf-8")
    nodes = json.loads(nodes_json)

    target = next((node for node in nodes if node.get("name") == "LOG: Job Queued"), None)
    if target is None:
        raise RuntimeError("LOG: Job Queued node not found")

    options = target.setdefault("parameters", {}).setdefault("options", {})
    options["alwaysOutputData"] = True

    updated_nodes = json.dumps(nodes, ensure_ascii=False)
    timestamp = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

    cur.execute(
        "update workflow_entity set nodes = ?, updatedAt = ?, versionCounter = ? where id = ?",
        (updated_nodes, timestamp, int(version_counter or 0) + 1, WORKFLOW_ID),
    )
    cur.execute(
        "update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?",
        (updated_nodes, timestamp, WORKFLOW_ID, version_id),
    )

    conn.commit()
    conn.close()
    print(f"Patched workflow {WORKFLOW_ID} and wrote backup to {BACKUP_PATH}")


if __name__ == "__main__":
    main()
