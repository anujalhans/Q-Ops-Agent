import json
import sqlite3
from datetime import datetime
from pathlib import Path


DB_PATH = Path.home() / ".n8n" / "database.sqlite"
BACKUP_DIR = Path("docs/test_data/n8n_workflow_backups")
C9_WORKFLOW_ID = "C9oZfZxpGFakzlB3"


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
    path = BACKUP_DIR / f"workflow_{row['id']}_before_exact_word_count_patch_{timestamp}.json"
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


def patch_c9(nodes):
    count_node = find_node(nodes, "Count Stored Chunks")
    count_node["parameters"]["jsCode"] = """const chunks = $items(\"Chunking Raw Data\").map(item => item.json);
const semanticDocs = $items(\"Build Semantic Content\").map(item => item.json);
const trigger = $('When Executed by Another Workflow').first().json;
const configSnapshot = trigger.configSnapshot || trigger.config_snapshot || {};

function countWords(text) {
  const matches = String(text || '').match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g);
  return matches ? matches.length : 0;
}

const embeddedCharacterCount = chunks.reduce((total, chunk) => {
  return total + String(chunk.pageContent || '').length;
}, 0);

const embeddedWordCount = chunks.reduce((total, chunk) => {
  return total + countWords(chunk.pageContent);
}, 0);

const estimatedEmbeddingTokens = Math.ceil(embeddedCharacterCount / 4);
const embeddingModel = configSnapshot.models?.embeddingModel || 'text-embedding-3-small';
const embeddingCostPerToken = String(embeddingModel).includes('large')
  ? 0.13 / 1_000_000
  : 0.02 / 1_000_000;
const embeddingCostUsd = estimatedEmbeddingTokens * embeddingCostPerToken;

const visionTokensInput = semanticDocs.reduce((total, doc) => total + (Number(doc.visionTokensInput) || 0), 0);
const visionTokensOutput = semanticDocs.reduce((total, doc) => total + (Number(doc.visionTokensOutput) || 0), 0);
const visionCostUsd = semanticDocs.reduce((total, doc) => total + (Number(doc.visionCostUsd) || 0), 0);
const visionUsageEstimated = semanticDocs.some(doc => Boolean(doc.visionUsageEstimated));

const tokensInput = visionTokensInput + estimatedEmbeddingTokens;
const tokensOutput = visionTokensOutput;
const tokensTotal = tokensInput + tokensOutput;
const estimatedCostUsd = visionCostUsd + embeddingCostUsd;

return [
  {
    json: {
      totalChunksStored: chunks.length,
      tokensInput,
      tokensOutput,
      tokensTotal,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      tokenUsage: {
        accounting: 'actual_vision_when_available_plus_estimated_embeddings',
        visionModel: 'gpt-4o-mini',
        visionTokensInput,
        visionTokensOutput,
        visionTokensTotal: visionTokensInput + visionTokensOutput,
        visionCostUsd: Number(visionCostUsd.toFixed(6)),
        visionUsageEstimated,
        embeddingModel,
        embeddedCharacterCount,
        embeddedWordCount,
        estimatedEmbeddingTokens,
        embeddingCostUsd: Number(embeddingCostUsd.toFixed(6)),
        tokensInput,
        tokensOutput,
        tokensTotal,
        estimatedCostUsd: Number(estimatedCostUsd.toFixed(6))
      }
    }
  }
];"""

    log_node = find_node(nodes, "LOG")
    js_code = log_node["parameters"]["jsCode"]
    old = "const embeddedCharacterCount = Number(tokenUsage.embeddedCharacterCount) || 0;\nconst wordCount = embeddedCharacterCount ? Math.max(1, Math.round(embeddedCharacterCount / 5)) : null;"
    new = "const embeddedWordCount = Number(tokenUsage.embeddedWordCount) || 0;\nconst wordCount = embeddedWordCount || null;"
    if old not in js_code:
        raise RuntimeError("Expected approximate word-count block was not found in LOG node")
    log_node["parameters"]["jsCode"] = js_code.replace(old, new)


def main():
    if not DB_PATH.exists():
        raise FileNotFoundError(f"n8n database not found: {DB_PATH}")

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row, nodes, connections = load_workflow(conn, C9_WORKFLOW_ID)
        backup = backup_workflow(row, nodes, connections)
        patch_c9(nodes)
        save_workflow(conn, row, nodes, connections)
        conn.commit()

    print(f"Patched C9 workflow {C9_WORKFLOW_ID}")
    print(f"Backup: {backup}")


if __name__ == "__main__":
    main()
