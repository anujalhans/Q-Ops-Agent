from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path


DB_PATH = Path(r"C:\Users\anujalhans01\.n8n\database.sqlite")
WORKFLOW_ID = "C9oZfZxpGFakzlB3"
BACKUP_PATH = Path("docs/test_data/n8n_workflow_backups/workflow_C9oZfZxpGFakzlB3_before_file_url_extract_patch.json")


def body_param(name: str, value: str) -> dict[str, str]:
    return {"parameterType": "formData", "name": name, "value": value}


def string_expr(expression: str) -> str:
    return "={{ String((" + expression + ") || '') }}"


def main() -> None:
    BACKUP_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    row = cur.execute(
        "select nodes, versionId, versionCounter from workflow_entity where id = ?",
        (WORKFLOW_ID,),
    ).fetchone()
    if not row:
        raise RuntimeError(f"Workflow {WORKFLOW_ID} not found")

    nodes_json, version_id, version_counter = row
    BACKUP_PATH.write_text(nodes_json, encoding="utf-8")
    nodes = json.loads(nodes_json)

    for workflow_node in nodes:
        if workflow_node.get("name") != "Extract Text + Image":
            continue

        parameters = workflow_node.setdefault("parameters", {})
        parameters["sendBody"] = True
        parameters["contentType"] = "multipart-form-data"
        parameters["bodyParameters"] = {
            "parameters": [
                body_param("fileUrl", "={{ $json.files[0].fileUrl }}"),
                body_param("projectName", string_expr("$json.files[0].projectName")),
                body_param("status", string_expr("$json.files[0].status")),
                body_param("jobId", string_expr("$json.files[0].jobId")),
                body_param("projectId", string_expr("$('When Executed by Another Workflow').first().json.projectId || $('When Executed by Another Workflow').first().json.project_id")),
                body_param("requestedBy", string_expr("$('When Executed by Another Workflow').first().json.requestedBy || $('When Executed by Another Workflow').first().json.requested_by")),
                body_param("settingsVersion", string_expr("$('When Executed by Another Workflow').first().json.settingsVersion || $('When Executed by Another Workflow').first().json.settings_version")),
                body_param("maxImagesPerJob", string_expr("$('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.maxImagesPerJob || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.maxImagesPerJob")),
                body_param("visionBatchSize", string_expr("$('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.batchSize || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.batchSize")),
                body_param("maxRenderedPagesPerDocument", string_expr("$('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.maxRenderedPagesPerDocument || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.maxRenderedPagesPerDocument")),
                body_param("maxEmbeddedImagesPerDocument", string_expr("$('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.maxEmbeddedImagesPerDocument || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.maxEmbeddedImagesPerDocument")),
                body_param("maxStandaloneImagesPerDocument", string_expr("$('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.maxStandaloneImagesPerDocument || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.maxStandaloneImagesPerDocument")),
                body_param("visionRenderDpi", string_expr("$('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.renderDpi || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.renderDpi")),
                body_param("deferOverflowVisuals", string_expr("$('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.deferOverflowVisuals || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.deferOverflowVisuals")),
            ]
        }
        workflow_node["retryOnFail"] = True
        workflow_node["maxTries"] = 3
        workflow_node["waitBetweenTries"] = 5000
        parameters.setdefault("options", {}).setdefault("timeout", 300000)
        break
    else:
        raise RuntimeError("Extract Text + Image node not found")

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
    print(f"Patched workflow {WORKFLOW_ID}; backup written to {BACKUP_PATH}")


if __name__ == "__main__":
    main()
