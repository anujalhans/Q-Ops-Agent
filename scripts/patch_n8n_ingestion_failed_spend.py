import json
import sqlite3
from datetime import datetime
from pathlib import Path


N8N_DB = Path.home() / ".n8n" / "database.sqlite"
BACKUP_DIR = Path("docs/test_data/n8n_workflow_backups")
STAMP = datetime.now().strftime("%Y%m%d-%H%M%S")

WORKFLOWS = {
    "ingest_full": "C9oZfZxpGFakzlB3",
    "ingest_worker": "mlelxUdlNcoBIyru",
    "analytics": "tcKSeScJRiWtRx77",
}


def node_by_name(nodes, name):
    for node in nodes:
        if node.get("name") == name:
            return node
    raise RuntimeError(f"Node not found: {name}")


def update_workflow(conn, workflow_id, patcher, label):
    row = conn.execute(
        "select id, name, nodes from workflow_entity where id = ?",
        (workflow_id,),
    ).fetchone()
    if not row:
        raise RuntimeError(f"Workflow not found: {workflow_id}")

    nodes = json.loads(row["nodes"])
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup_path = BACKUP_DIR / f"workflow_{workflow_id}_before_{label}_{STAMP}.json"
    backup_path.write_text(json.dumps(nodes, indent=2), encoding="utf-8")

    patcher(nodes)
    nodes_json = json.dumps(nodes, separators=(",", ":"))
    now = datetime.now().isoformat(timespec="milliseconds")
    conn.execute("update workflow_entity set nodes = ?, updatedAt = ? where id = ?", (nodes_json, now, workflow_id))

    history = conn.execute(
        """
        select versionId
        from workflow_history
        where workflowId = ?
        order by datetime(updatedAt) desc, datetime(createdAt) desc
        limit 1
        """,
        (workflow_id,),
    ).fetchone()
    if history:
        conn.execute(
            "update workflow_history set nodes = ?, updatedAt = ? where versionId = ?",
            (nodes_json, now, history["versionId"]),
        )

    return backup_path


def patch_ingest_full(nodes):
    data_loader = node_by_name(nodes, "Handle Data Loader Errors")
    data_loader["parameters"]["jsCode"] = r"""return $input.all().map(item => {
  const err = item.json?.error || {};
  const pageContent = String(item.json?.pageContent || '');
  const wordMatches = pageContent.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g);
  const wordCount = wordMatches ? wordMatches.length : 0;
  const estimatedEmbeddingTokens = Math.ceil(pageContent.length / 4);
  const trigger = $('When Executed by Another Workflow').first().json || {};
  const embeddingModel = trigger.configSnapshot?.models?.embeddingModel || trigger.config_snapshot?.models?.embeddingModel || 'text-embedding-3-small';
  const embeddingCostPerToken = String(embeddingModel).includes('large') ? 0.13 / 1_000_000 : 0.02 / 1_000_000;
  const estimatedCostUsd = estimatedEmbeddingTokens * embeddingCostPerToken;

  return {
    json: {
      error: true,
      source: "Default Data Loader",
      failureStage: "data_loader",
      message: err.message || "Unknown Loader Error",
      stack: err.stack || null,
      projectName: item.json?.metadata?.project || trigger.projectName || "unknown",
      projectId: trigger.projectId || trigger.project_id || null,
      requestedBy: trigger.requestedBy || trigger.requested_by || null,
      fileName: item.json?.metadata?.fileName || "unknown",
      docType: item.json?.metadata?.docType || "unknown",
      sectionTitle: item.json?.metadata?.sectionTitle || "unknown",
      chunkIndex: item.json?.metadata?.chunkIndex ?? -1,
      preview: pageContent.slice(0, 200),
      wordCount,
      chunkCount: pageContent ? 1 : 0,
      totalChunksStored: 0,
      tokensInput: estimatedEmbeddingTokens,
      tokensOutput: 0,
      tokensTotal: estimatedEmbeddingTokens,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      tokenUsage: {
        accounting: "failed_ingestion_partial_text_embedding_estimate",
        embeddingModel,
        embeddedCharacterCount: pageContent.length,
        embeddedWordCount: wordCount,
        estimatedEmbeddingTokens,
        tokensInput: estimatedEmbeddingTokens,
        tokensOutput: 0,
        tokensTotal: estimatedEmbeddingTokens,
        estimatedCostUsd: Number(estimatedCostUsd.toFixed(6))
      },
      extractionObservability: {
        warningCount: 0,
        failedChunkPreviewAvailable: Boolean(pageContent),
        failureStage: "data_loader"
      },
      timestamp: new Date().toISOString()
    }
  };
});"""

    vision_errors = node_by_name(nodes, "Handle Vision Errors")
    vision_errors["parameters"]["jsCode"] = r"""const originalItems = $items("Prepare Vision Payload");

return $input.all().map((item) => {
  const pairedIndex = item.pairedItem?.item;
  const original = originalItems[pairedIndex];
  const trigger = $('When Executed by Another Workflow').first().json || {};

  return {
    json: {
      error: true,
      source: "Vision Extraction",
      failureStage: "vision_extraction",
      message: item.json?.error?.message || "Unknown Vision Error",
      jobId: original?.json?.jobId || trigger.jobId || "unknown",
      projectName: original?.json?.projectName || trigger.projectName || "unknown",
      projectId: trigger.projectId || trigger.project_id || null,
      requestedBy: trigger.requestedBy || trigger.requested_by || null,
      imageId: original?.json?.imageId || "unknown",
      imageFileName: original?.json?.imageFileName || "unknown",
      parentFileName: original?.json?.parentFileName || "unknown",
      fileName: original?.json?.parentFileName || original?.json?.imageFileName || null,
      docType: original?.json?.docType || null,
      totalChunksStored: 0,
      wordCount: 0,
      tokensInput: 0,
      tokensOutput: 0,
      tokensTotal: 0,
      estimatedCostUsd: 0,
      tokenUsage: {
        accounting: "failed_ingestion_vision_error_no_usage_returned",
        tokensInput: 0,
        tokensOutput: 0,
        tokensTotal: 0,
        estimatedCostUsd: 0
      },
      extractionObservability: {
        warningCount: 1,
        failureStage: "vision_extraction",
        failedImageId: original?.json?.imageId || "unknown"
      },
      timestamp: new Date().toISOString()
    }
  };
});"""

    failed = node_by_name(nodes, "Update Job Status as Failed")
    failed["parameters"]["jsonBody"] = r"""={
  "status": "failed",
  "error": {{ JSON.stringify($json.message || $json.error?.message || "Ingestion workflow failed") }},
  "output": {
    "error": true,
    "message": {{ JSON.stringify($json.message || $json.error?.message || "Ingestion workflow failed") }},
    "source": {{ JSON.stringify($json.error?.node?.name || $json.source || "Multimodal ingestion full clone") }},
    "failureStage": {{ JSON.stringify($json.failureStage || "ingestion_workflow") }},
    "timestamp": {{ JSON.stringify($json.timestamp || new Date().toISOString()) }},
    "projectName": {{ JSON.stringify($json.projectName || $('When Executed by Another Workflow').first().json.projectName || null) }},
    "projectId": {{ JSON.stringify($json.projectId || $('When Executed by Another Workflow').first().json.projectId || $('When Executed by Another Workflow').first().json.project_id || null) }},
    "requestedBy": {{ JSON.stringify($json.requestedBy || $('When Executed by Another Workflow').first().json.requestedBy || $('When Executed by Another Workflow').first().json.requested_by || null) }},
    "settingsVersion": {{ $('When Executed by Another Workflow').first().json.settingsVersion || $('When Executed by Another Workflow').first().json.settings_version || 'null' }},
    "fileName": {{ JSON.stringify($json.fileName || null) }},
    "docType": {{ JSON.stringify($json.docType || null) }},
    "chunkId": {{ JSON.stringify($json.chunkId || null) }},
    "chunkIndex": {{ $json.chunkIndex === undefined || $json.chunkIndex === null ? 'null' : Number($json.chunkIndex) }},
    "totalChunksStored": {{ Number($json.totalChunksStored || $json.chunkCount || 0) || 0 }},
    "chunkCount": {{ Number($json.chunkCount || $json.totalChunksStored || 0) || 0 }},
    "wordCount": {{ Number($json.wordCount || $json.tokenUsage?.embeddedWordCount || 0) || 0 }},
    "tokensInput": {{ Number($json.tokensInput || $json.tokenUsage?.tokensInput || 0) || 0 }},
    "tokensOutput": {{ Number($json.tokensOutput || $json.tokenUsage?.tokensOutput || 0) || 0 }},
    "tokensTotal": {{ Number($json.tokensTotal || $json.tokenUsage?.tokensTotal || 0) || 0 }},
    "estimatedCostUsd": {{ Number($json.estimatedCostUsd || $json.tokenUsage?.estimatedCostUsd || 0) || 0 }},
    "tokenUsage": {{ JSON.stringify($json.tokenUsage || { accounting: 'failed_ingestion_no_token_usage_available', tokensInput: 0, tokensOutput: 0, tokensTotal: 0, estimatedCostUsd: 0 }) }},
    "extractionObservability": {{ JSON.stringify($json.extractionObservability || {}) }},
    "chromaCollection": {{ JSON.stringify($json.chromaCollection || $('When Executed by Another Workflow').first().json.configSnapshot?.chroma?.collection || $('When Executed by Another Workflow').first().json.config_snapshot?.chroma?.collection || null) }},
    "stack": {{ JSON.stringify($json.stack || null) }},
    "details": {{ JSON.stringify($json.errorDetails || null) }}
  },
  "updated_at": "{{$now}}"
}"""


def patch_ingest_worker(nodes):
    handler = node_by_name(nodes, "Handle Vectorization Subworkflow Error")
    handler["parameters"]["jsCode"] = r"""const source = $('Convert ALL binaries inside ONE item').first().json || {};

function clean(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value.trim() || fallback;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function pickMessage(json) {
  return clean(
    json.error?.message ||
    json.errorMessage ||
    json.message ||
    json.description ||
    'Ingestion vectorization failed before chunks could be stored in ChromaDB'
  );
}

return $input.all().map((item) => {
  const json = item.json || {};
  const output = json.output || {};
  const tokenUsage = json.tokenUsage || output.tokenUsage || {};
  const message = pickMessage(json);
  return {
    json: {
      jobId: clean(source.jobId || json.jobId),
      projectName: clean(source.projectName || json.projectName),
      projectId: clean(source.projectId || json.projectId),
      requestedBy: clean(source.requestedBy || json.requestedBy),
      settingsVersion: source.settingsVersion ?? json.settingsVersion ?? null,
      failureStage: json.failureStage || output.failureStage || 'full_ingest_vectorization_subworkflow',
      source: json.source || output.source || 'fullIngestDraft01',
      message,
      wordCount: Number(json.wordCount || output.wordCount || tokenUsage.embeddedWordCount || 0) || 0,
      totalChunksStored: Number(json.totalChunksStored || output.totalChunksStored || json.chunkCount || output.chunkCount || 0) || 0,
      chunkCount: Number(json.chunkCount || output.chunkCount || json.totalChunksStored || output.totalChunksStored || 0) || 0,
      tokensInput: Number(json.tokensInput || output.tokensInput || tokenUsage.tokensInput || 0) || 0,
      tokensOutput: Number(json.tokensOutput || output.tokensOutput || tokenUsage.tokensOutput || 0) || 0,
      tokensTotal: Number(json.tokensTotal || output.tokensTotal || tokenUsage.tokensTotal || 0) || 0,
      estimatedCostUsd: Number(json.estimatedCostUsd || output.estimatedCostUsd || tokenUsage.estimatedCostUsd || 0) || 0,
      tokenUsage: Object.keys(tokenUsage).length ? tokenUsage : {
        accounting: 'failed_ingestion_no_token_usage_available',
        tokensInput: 0,
        tokensOutput: 0,
        tokensTotal: 0,
        estimatedCostUsd: 0
      },
      extractionObservability: json.extractionObservability || output.extractionObservability || {},
      errorDetails: json.errorDetails || json.error || null,
      timestamp: new Date().toISOString()
    }
  };
});"""

    mark_failed = node_by_name(nodes, "Mark Ingestion Job Failed")
    mark_failed["parameters"]["jsonBody"] = r"""={
  "status": "failed",
  "error": {{ JSON.stringify($json.message || "Ingestion failed before chunks could be stored in ChromaDB") }},
  "output": {
    "error": true,
    "message": {{ JSON.stringify($json.message || "Ingestion failed before chunks could be stored in ChromaDB") }},
    "source": {{ JSON.stringify($json.source || "fullIngestDraft01") }},
    "failureStage": {{ JSON.stringify($json.failureStage || "full_ingest_vectorization_subworkflow") }},
    "timestamp": {{ JSON.stringify($json.timestamp || new Date().toISOString()) }},
    "projectName": {{ JSON.stringify($json.projectName || null) }},
    "projectId": {{ JSON.stringify($json.projectId || null) }},
    "requestedBy": {{ JSON.stringify($json.requestedBy || null) }},
    "settingsVersion": {{ $json.settingsVersion === undefined || $json.settingsVersion === null ? 'null' : Number($json.settingsVersion) }},
    "totalChunksStored": {{ Number($json.totalChunksStored || $json.chunkCount || 0) || 0 }},
    "chunkCount": {{ Number($json.chunkCount || $json.totalChunksStored || 0) || 0 }},
    "wordCount": {{ Number($json.wordCount || $json.tokenUsage?.embeddedWordCount || 0) || 0 }},
    "tokensInput": {{ Number($json.tokensInput || $json.tokenUsage?.tokensInput || 0) || 0 }},
    "tokensOutput": {{ Number($json.tokensOutput || $json.tokenUsage?.tokensOutput || 0) || 0 }},
    "tokensTotal": {{ Number($json.tokensTotal || $json.tokenUsage?.tokensTotal || 0) || 0 }},
    "estimatedCostUsd": {{ Number($json.estimatedCostUsd || $json.tokenUsage?.estimatedCostUsd || 0) || 0 }},
    "tokenUsage": {{ JSON.stringify($json.tokenUsage || { accounting: 'failed_ingestion_no_token_usage_available', tokensInput: 0, tokensOutput: 0, tokensTotal: 0, estimatedCostUsd: 0 }) }},
    "extractionObservability": {{ JSON.stringify($json.extractionObservability || {}) }},
    "details": {{ JSON.stringify($json.errorDetails || null) }}
  },
  "updated_at": "{{$now}}"
}"""


def patch_analytics(nodes):
    builder = node_by_name(nodes, "Build Auth-Aware Analytics Response")
    code = builder["parameters"]["jsCode"]

    if "const ingestionFailedMeteredRows" not in code:
        code = code.replace(
            """const generationFailedMeteredRows = meteredRows.filter(row => row.pipeline === 'generation' && (
  row.event === 'JOB_FAILED' ||
  row.event === 'QUALITY_GATE_FAILED' ||
  row.status === 'error'
));""",
            """const generationFailedMeteredRows = meteredRows.filter(row => row.pipeline === 'generation' && (
  row.event === 'JOB_FAILED' ||
  row.event === 'QUALITY_GATE_FAILED' ||
  row.status === 'error'
));
const ingestionFailedMeteredRows = meteredRows.filter(row => row.pipeline === 'ingestion' && (
  row.event === 'JOB_FAILED' ||
  row.status === 'error'
));"""
        )

    if "tokensTotal: sumNumber(ingestionCompleted, 'tokens_total')" not in code:
        code = code.replace(
            """      totalFilesProcessed: ingestionCompleted.reduce((total, row) => total + metadataFileCount(row), 0),
      filesByKnowledgeBase""",
            """      totalFilesProcessed: ingestionCompleted.reduce((total, row) => total + metadataFileCount(row), 0),
      tokensTotal: sumNumber(ingestionCompleted, 'tokens_total'),
      estimatedCostUsd: roundMoney(sumNumber(ingestionCompleted, 'estimated_cost_usd')),
      filesByKnowledgeBase"""
        )

    if "ingestion: {" not in code.split("failedSpend:", 1)[-1]:
        code = code.replace(
            """    failedSpend: {
      generation: {
        attempts: generationFailedMeteredRows.length,
        wordCount: sumNumber(generationFailedMeteredRows, 'word_count'),
        tokensTotal: sumNumber(generationFailedMeteredRows, 'tokens_total'),
        estimatedCostUsd: roundMoney(sumNumber(generationFailedMeteredRows, 'estimated_cost_usd')),
        avgDurationMs: avgNumber(generationFailedMeteredRows, 'duration_ms')
      }
    },""",
            """    failedSpend: {
      generation: {
        attempts: generationFailedMeteredRows.length,
        wordCount: sumNumber(generationFailedMeteredRows, 'word_count'),
        tokensTotal: sumNumber(generationFailedMeteredRows, 'tokens_total'),
        estimatedCostUsd: roundMoney(sumNumber(generationFailedMeteredRows, 'estimated_cost_usd')),
        avgDurationMs: avgNumber(generationFailedMeteredRows, 'duration_ms')
      },
      ingestion: {
        attempts: ingestionFailedMeteredRows.length,
        filesAttempted: sumNumber(ingestionFailedMeteredRows, 'total_files'),
        chunksCreated: sumNumber(ingestionFailedMeteredRows, 'chunk_count'),
        wordCount: sumNumber(ingestionFailedMeteredRows, 'word_count'),
        tokensTotal: sumNumber(ingestionFailedMeteredRows, 'tokens_total'),
        estimatedCostUsd: roundMoney(sumNumber(ingestionFailedMeteredRows, 'estimated_cost_usd')),
        avgDurationMs: avgNumber(ingestionFailedMeteredRows, 'duration_ms')
      }
    },"""
        )

    builder["parameters"]["jsCode"] = code


def main():
    conn = sqlite3.connect(N8N_DB)
    conn.row_factory = sqlite3.Row
    try:
        backups = [
            update_workflow(conn, WORKFLOWS["ingest_full"], patch_ingest_full, "ingestion_failed_spend"),
            update_workflow(conn, WORKFLOWS["ingest_worker"], patch_ingest_worker, "ingestion_failed_spend"),
            update_workflow(conn, WORKFLOWS["analytics"], patch_analytics, "ingestion_failed_spend"),
        ]
        conn.commit()
        print("Patched ingestion failed spend workflows:")
        for path in backups:
            print(path)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
