import json
import sqlite3
from datetime import datetime
from pathlib import Path


WORKFLOW_ID = "C9oZfZxpGFakzlB3"
DB_PATH = Path.home() / ".n8n" / "database.sqlite"
BACKUP_DIR = Path("docs/test_data/n8n_workflow_backups")

KEEP_METADATA_KEYS = [
    "project",
    "projectId",
    "requestedBy",
    "jobId",
    "documentId",
    "chunkId",
    "docType",
    "documentCategory",
    "artifactType",
    "fileName",
    "fileType",
    "pageCount",
    "contentMode",
    "containsImages",
    "containsText",
    "hasVisionContent",
    "sectionTitle",
    "sectionIndex",
    "chunkIndex",
    "structuralType",
    "contentSource",
    "compositeKey",
    "imageId",
    "sectionPageReferences",
    "tableIds",
    "annotationIds",
    "linkIds",
    "linkUris",
    "imageSources",
    "visualReasons",
    "visualLocators",
]

CHROMA_SAFE_METADATA_KEYS = [
    "project",
    "projectId",
    "requestedBy",
    "jobId",
    "documentId",
    "chunkId",
    "docType",
    "documentCategory",
    "artifactType",
    "fileName",
    "fileType",
    "pageCount",
    "contentMode",
    "containsImages",
    "containsText",
    "hasVisionContent",
    "sectionTitle",
    "sectionIndex",
    "chunkIndex",
    "structuralType",
    "contentSource",
    "compositeKey",
    "imageId",
    "sectionPageReferences",
    "imageSources",
    "visualReasons",
    "visualLocators",
]


def find_node(nodes, name):
    return next((node for node in nodes if node.get("name") == name), None)


def ensure_has_images_node(nodes):
    node = find_node(nodes, "Has Images?")
    if node is None:
        node = {
            "parameters": {},
            "type": "n8n-nodes-base.if",
            "typeVersion": 2.3,
            "position": [-3200, 96],
            "id": "has-images-route",
            "name": "Has Images?",
        }
        nodes.append(node)

    node["parameters"] = {
        "conditions": {
            "options": {
                "caseSensitive": True,
                "leftValue": "",
                "typeValidation": "strict",
                "version": 3,
            },
            "conditions": [
                {
                    "id": "has-extracted-images",
                    "leftValue": "={{ Array.isArray($json.images) ? $json.images.length : 0 }}",
                    "rightValue": 0,
                    "operator": {
                        "type": "number",
                        "operation": "gt",
                    },
                }
            ],
            "combinator": "and",
        },
        "options": {},
    }
    return node


def patch_connections(connections):
    connections["Extract Text + Image"] = {
        "main": [[{"node": "Has Images?", "type": "main", "index": 0}]]
    }
    connections["Has Images?"] = {
        "main": [
            [{"node": "Split images for Vision Extraction", "type": "main", "index": 0}],
            [{"node": "Build Semantic Content", "type": "main", "index": 0}],
        ]
    }


def patch_default_data_loader(nodes):
    node = find_node(nodes, "Default Data Loader")
    if node is None:
        raise RuntimeError("Default Data Loader node was not found")

    parameters = node.setdefault("parameters", {})
    options = parameters.setdefault("options", {})
    metadata = options.setdefault("metadata", {})
    metadata["metadataValues"] = [
        {"name": key, "value": f"={{$json.metadata.{key}}}"}
        for key in CHROMA_SAFE_METADATA_KEYS
    ]


def main():
    if not DB_PATH.exists():
        raise FileNotFoundError(f"n8n database not found: {DB_PATH}")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"workflow_{WORKFLOW_ID}_before_has_images_metadata_patch_{timestamp}.json"

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            'select id, name, nodes, connections, "versionId" from workflow_entity where id = ?',
            (WORKFLOW_ID,),
        ).fetchone()
        if row is None:
            raise RuntimeError(f"Workflow {WORKFLOW_ID} was not found")

        nodes = json.loads(row["nodes"])
        connections = json.loads(row["connections"])

        backup_path.write_text(
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

        ensure_has_images_node(nodes)
        patch_connections(connections)
        patch_default_data_loader(nodes)

        nodes_json = json.dumps(nodes, ensure_ascii=False)
        connections_json = json.dumps(connections, ensure_ascii=False)

        conn.execute(
            'update workflow_entity set nodes = ?, connections = ?, "updatedAt" = CURRENT_TIMESTAMP where id = ?',
            (nodes_json, connections_json, WORKFLOW_ID),
        )

        version_id = row["versionId"]
        if version_id:
            conn.execute(
                'update workflow_history set nodes = ?, connections = ?, "updatedAt" = CURRENT_TIMESTAMP where "workflowId" = ? and "versionId" = ?',
                (nodes_json, connections_json, WORKFLOW_ID, version_id),
            )

        conn.commit()

    print(f"Patched workflow {WORKFLOW_ID}")
    print(f"Backup written to {backup_path}")
    print(f"Default Data Loader custom metadata keys: {len(CHROMA_SAFE_METADATA_KEYS)}")
    print("Default Data Loader adds source/blobType/line/loc automatically, giving Chroma 32 keys total.")


if __name__ == "__main__":
    main()
