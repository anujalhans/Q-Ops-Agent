const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const queueWorkflowId = 'yPgr7mtUnL3E8QQP';
const workerWorkflowId = 'QApRBFSaJgINsdHN';
const backlogWorkflowId = 'Vwc6c8ehsRTF8svG';

function parseAny(value) {
  try { return JSON.parse(value); } catch { return flatted.parse(value); }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(err) {
    err ? reject(err) : resolve(this);
  }));
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => {
    err ? reject(err) : resolve(row);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function patchQueue(nodes) {
  const prepare = requireNode(nodes, 'Prepare Professional Queue Request');
  let code = prepare.parameters.jsCode;

  if (!code.includes('const requestedGenerationMode =')) {
    code = code.replace(
      `const retryOfJobId = String(input.retryJobId || input.retryOfJobId || '').trim();
const isRetry = Boolean(retryOfJobId);`,
      `const retryOfJobId = String(input.retryJobId || input.retryOfJobId || '').trim();
const isRetry = Boolean(retryOfJobId);
const requestedGenerationMode = String(input.generationMode || input.mode || '').trim().toLowerCase();
const updateContext = input.updateContext && typeof input.updateContext === 'object' ? input.updateContext : {};
const updateOfJobId = String(input.updateOfJobId || updateContext.previousJobId || updateContext.previous_job_id || '').trim();
const isUpdate = !isRetry && requestedGenerationMode === 'update';
const generationMode = isRetry ? 'retry' : isUpdate ? 'update' : 'create';`
    );
  }

  code = code.replace(
    `retryInstruction: input.retryInstruction || defaultRetryInstruction
};`,
    `retryInstruction: input.retryInstruction || defaultRetryInstruction
};

const normalizedUpdateContext = isUpdate ? {
  ...updateContext,
  previousJobId: updateOfJobId || updateContext.previousJobId || null,
  updateMode: true,
  preserveExistingBacklog: updateContext.preserveExistingBacklog !== false
} : {};`
  );

  code = code.replace(
    `retryMode: isRetry,
    retryOfJobId: isRetry ? retryOfJobId : null,
    retryInstruction: retryContext.retryInstruction,`,
    `retryMode: isRetry,
    generationMode,
    updateMode: isUpdate,
    updateOfJobId: isUpdate ? (updateOfJobId || null) : null,
    retryOfJobId: isRetry ? retryOfJobId : null,
    retryInstruction: retryContext.retryInstruction,`
  );

  code = code.replace(
    `retryContext,
      retryInstruction: retryContext.retryInstruction,
      documentType,`,
    `retryContext,
      retryInstruction: retryContext.retryInstruction,
      generationMode,
      updateMode: isUpdate,
      updateOfJobId: isUpdate ? (updateOfJobId || null) : null,
      updateContext: normalizedUpdateContext,
      documentType,`
  );

  prepare.parameters.jsCode = code;

  const log = requireNode(nodes, 'LOG: Professional Job Queued');
  log.parameters.jsonBody = log.parameters.jsonBody
    .replace(
      `event: $("Combine Job And Runtime").item.json.retryMode ? "JOB_RETRIED" : "JOB_QUEUED"`,
      `event: $("Combine Job And Runtime").item.json.retryMode ? "JOB_RETRIED" : ($("Combine Job And Runtime").item.json.generationMode === "update" ? "JOB_UPDATE_QUEUED" : "JOB_QUEUED")`
    )
    .replace(
      `retry: Boolean($("Combine Job And Runtime").item.json.retryMode), retry_of_job_id: $("Combine Job And Runtime").item.json.retryOfJobId || null, retry_instruction: $("Combine Job And Runtime").item.json.retryInstruction || null, product_owner:`,
      `retry: Boolean($("Combine Job And Runtime").item.json.retryMode), generation_mode: $("Combine Job And Runtime").item.json.generationMode || $("Combine Job And Runtime").item.json.input?.generationMode || "create", update: $("Combine Job And Runtime").item.json.generationMode === "update", update_of_job_id: $("Combine Job And Runtime").item.json.updateOfJobId || $("Combine Job And Runtime").item.json.input?.updateOfJobId || $("Combine Job And Runtime").item.json.input?.updateContext?.previousJobId || null, retry_of_job_id: $("Combine Job And Runtime").item.json.retryOfJobId || null, retry_instruction: $("Combine Job And Runtime").item.json.retryInstruction || null, product_owner:`
    );

  const response = requireNode(nodes, 'Respond Queued');
  response.parameters.responseBody = response.parameters.responseBody.replace(
    `retryOfJobId: $("Combine Job And Runtime").item.json.retryOfJobId || null })`,
    `retryOfJobId: $("Combine Job And Runtime").item.json.retryOfJobId || null, generationMode: $("Combine Job And Runtime").item.json.generationMode || $("Combine Job And Runtime").item.json.input?.generationMode || "create", updateOfJobId: $("Combine Job And Runtime").item.json.updateOfJobId || $("Combine Job And Runtime").item.json.input?.updateOfJobId || $("Combine Job And Runtime").item.json.input?.updateContext?.previousJobId || null })`
  );
}

function patchWorker(nodes) {
  const completion = requireNode(nodes, 'Build Backlog Completion Output');
  if (!completion.parameters.jsCode.includes('updateSummary')) {
    completion.parameters.jsCode = `
const result = $json || {};
const input = $('Prepare Generator Input').first().json;
const confluenceUrl = result.confluence?.url || result.confluenceUrl || result.url || null;
const generationMode = input.generationMode || (input.retryContext?.retryMode ? 'retry' : 'create');
const updateContext = input.updateContext || {};
const updateSummary = result.updateSummary || {
  mode: generationMode,
  updateOfJobId: updateContext.previousJobId || input.updateOfJobId || null,
  previousEpics: Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics.length : 0,
  previousStories: Array.isArray(updateContext.previousStories) ? updateContext.previousStories.length : 0,
  previousCoverageRows: Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger.length : 0
};
return [{
  json: {
    ...input,
    result,
    output: {
      settingsVersion: input.settingsVersion || null,
      destination: { type: 'jira_confluence', projectId: input.projectId || null },
      url: confluenceUrl,
      documentUrl: confluenceUrl,
      confluence: result.confluence || null,
      epics: result.epics || [],
      stories: result.stories || [],
      professionalGenerator: true,
      generationMode,
      updateContext: generationMode === 'update' ? {
        previousJobId: updateContext.previousJobId || input.updateOfJobId || null,
        previousConfluencePageId: updateContext.previousConfluencePageId || null,
        previousConfluenceUrl: updateContext.previousConfluenceUrl || null
      } : null,
      updateSummary,
      qualityGate: result.qualityGate || null,
      jira: result.jira || null,
      wordCount: result.wordCount || 0,
      tokensInput: result.tokensInput || 0,
      tokensOutput: result.tokensOutput || 0,
      tokensTotal: result.tokensTotal || 0,
      estimatedCostUsd: result.estimatedCostUsd || 0,
      promptLibraryVersion: result.promptLibraryVersion || null,
      sourceCoverage: result.sourceCoverage || [],
      retrievalEvidenceCount: result.retrievalEvidenceCount || 0,
      retrievalQuality: result.retrievalQuality || null
    }
  }
}];`;
  }

  const started = requireNode(nodes, 'LOG: Professional Job Started');
  started.parameters.jsonBody = started.parameters.jsonBody.replace(
    `metadata: { generator_mode: "professional", settings_version:`,
    `metadata: { generator_mode: "professional", generation_mode: $json.generationMode || "create", update_of_job_id: $json.updateContext?.previousJobId || $json.updateOfJobId || null, settings_version:`
  );

  const completed = requireNode(nodes, 'LOG: Professional Backlog Completed');
  completed.parameters.jsonBody = completed.parameters.jsonBody
    .replace(
      `generator_mode: "professional", output_type: "jira_confluence",`,
      `generator_mode: "professional", generation_mode: $json.output.generationMode || $json.generationMode || "create", update_of_job_id: $json.output.updateContext?.previousJobId || $json.updateOfJobId || null, output_type: "jira_confluence",`
    )
    .replace(
      `stories_reused: ($json.output.stories || []).filter(s => s.action === "reused").length,`,
      `stories_reused: ($json.output.stories || []).filter(s => s.action === "reused").length, epics_updated: ($json.output.epics || []).filter(e => e.action === "updated").length, stories_updated: ($json.output.stories || []).filter(s => s.action === "updated").length,`
    );
}

function patchBacklog(nodes) {
  const normalize = requireNode(nodes, 'Normalize Team Managed Request');
  let normalizeCode = normalize.parameters.jsCode;
  if (!normalizeCode.includes('const normalizedGenerationMode =')) {
    normalizeCode = normalizeCode.replace(
      `const documentType = normalizeDocumentType(input.documentType || input.document_type || 'user_stories');`,
      `const documentType = normalizeDocumentType(input.documentType || input.document_type || 'user_stories');
const normalizedGenerationMode = ['update', 'retry'].includes(String(input.generationMode || '').trim().toLowerCase())
  ? String(input.generationMode || '').trim().toLowerCase()
  : input.retryContext?.retryMode ? 'retry' : 'create';
const updateContext = input.updateContext && typeof input.updateContext === 'object' ? input.updateContext : {};`
    );
  }
  normalizeCode = normalizeCode.replace(
    `documentType,
  productOwner:`,
    `documentType,
  generationMode: normalizedGenerationMode,
  updateMode: normalizedGenerationMode === 'update',
  updateOfJobId: updateContext.previousJobId || input.updateOfJobId || null,
  updateContext,
  productOwner:`
  );
  normalize.parameters.jsCode = normalizeCode;

  const prompt = requireNode(nodes, 'Professional Prompt Library');
  let promptCode = prompt.parameters.jsCode;
  if (!promptCode.includes('const updateMode =')) {
    promptCode = promptCode.replace(
      `const retrievalProfile = request.retrievalProfile || {};`,
      `const retrievalProfile = request.retrievalProfile || {};
const updateContext = request.updateContext && typeof request.updateContext === 'object' ? request.updateContext : {};
const updateMode = String(request.generationMode || '').toLowerCase() === 'update' && Object.keys(updateContext).length > 0;`
    );

    promptCode = promptCode.replace(
      `].join('\\n');

const promptLibrary = {`,
      `].join('\\n');

const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
const unresolvedCoverage = previousCoverageLedger.filter(row => {
  const status = String(row.coverageStatus || row.status || '').toLowerCase();
  return status.includes('partial') || status.includes('missing') || status.includes('unknown') || status.includes('gap') || status.includes('review');
});
const previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];
const previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];
const updateContextSummary = updateMode ? [
  'UPDATE MODE: This request updates an existing generated backlog. It is not a fresh create.',
  'Previous job id: ' + (updateContext.previousJobId || request.updateOfJobId || 'not provided'),
  'Previous Confluence URL: ' + (updateContext.previousConfluenceUrl || 'not provided'),
  'Existing epics: ' + previousEpics.length,
  'Existing stories: ' + previousStories.length,
  'Previous coverage ledger rows: ' + previousCoverageLedger.length,
  'Unresolved coverage rows to resolve: ' + unresolvedCoverage.length,
  '',
  'Existing epics snapshot:',
  JSON.stringify(previousEpics.slice(0, 30)),
  '',
  'Existing stories snapshot:',
  JSON.stringify(previousStories.slice(0, 80)),
  '',
  'Previous coverage ledger:',
  JSON.stringify(previousCoverageLedger.slice(0, 40)),
  '',
  'Unresolved coverage focus:',
  JSON.stringify(unresolvedCoverage.slice(0, 20))
].join('\\n') : 'CREATE MODE: No previous generated backlog snapshot was supplied.';

const promptLibrary = {`
    );

    promptCode = promptCode.replace(
      `'This is a Team Managed Jira project. Stories will be linked to epics using parent.key after epics are created. Do not use the company-managed Epic Link custom field.',
      '',`,
      `'This is a Team Managed Jira project. Stories will be linked to epics using parent.key after epics are created. Do not use the company-managed Epic Link custom field.',
      updateMode ? 'Update mode is active. Preserve previous correlation IDs and stable labels, reuse unchanged backlog items, and create/update only content needed for unresolved or newly discovered coverage.' : 'Create mode is active. Generate a complete first backlog from project evidence.',
      '',`
    );

    promptCode = promptCode.replace(
      `'Project context:',
      '- Project name: ' + (request.projectName || 'Q-Ops Agent'),`,
      `'Project context:',
      '- Project name: ' + (request.projectName || 'Q-Ops Agent'),
      '- Generation mode: ' + (updateMode ? 'update existing backlog' : 'create new backlog'),`
    );

    promptCode = promptCode.replace(
      `'Retrieval profile configuration:',
      profileSummary,`,
      `'Update context:',
      updateContextSummary,
      '',
      'Retrieval profile configuration:',
      profileSummary,`
    );

    promptCode = promptCode.replace(
      `'16. Keep correlation IDs stable and label-safe for idempotent Jira search/reuse.',
      '17. Return only valid JSON matching the output parser schema.'`,
      `'16. Keep correlation IDs stable and label-safe for idempotent Jira search/reuse.',
      '17. In update mode, preserve every existing epic/story correlation ID and stable label from the prior snapshot unless the item is intentionally superseded.',
      '18. In update mode, do not re-plan already-covered modules. Reuse unchanged epics/stories with concise unchanged descriptions, and generate detailed content only for unresolved coverage, new evidence, or missing NFR/quality coverage.',
      '19. In update mode, the final JSON must still contain the full current backlog: reused existing items plus new/updated delta items. This preserves downstream RTM and Story Test Case context.',
      '20. In update mode, include document.updateSummary with previousJobId, reusedEpicCount, reusedStoryCount, createdEpicCount, createdStoryCount, updatedEpicCount, updatedStoryCount, resolvedCoverageIds, and unchangedCoverageIds.',
      '21. Return only valid JSON matching the output parser schema.'`
    );
  }
  prompt.parameters.jsCode = promptCode;

  const result = requireNode(nodes, 'Return Team Managed Professional Result');
  if (!result.parameters.jsCode.includes('updateSummary: root.generated?.document?.updateSummary')) {
    result.parameters.jsCode = result.parameters.jsCode.replace(
      `retrievalQuality: root.retrievalQuality || null } }];`,
      `retrievalQuality: root.retrievalQuality || null, generationMode: root.generationMode || 'create', updateContext: root.updateContext || null, updateSummary: root.generated?.document?.updateSummary || root.updateSummary || null } }];`
    );
  }
}

async function patchWorkflow(db, workflowId, patcher, label) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

  const nodes = parseAny(row.nodes);
  const connections = row.connections ? parseAny(row.connections) : {};
  patcher(nodes, connections);

  for (const node of nodes) {
    const code = node.parameters?.jsCode;
    if (code) {
      try { new Function(code); } catch (error) {
        throw new Error(`Code validation failed for ${workflowId} / ${node.name}: ${error.message}`);
      }
    }
  }

  const now = new Date().toISOString();
  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);
  if (historyRow) {
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId, row.activeVersionId]);
  }
  return { workflowId, workflowName: row.name, backupPath };
}

async function main() {
  fs.mkdirSync(backupDir, { recursive: true });
  const db = new sqlite3.Database(dbPath);
  try {
    const patched = [];
    patched.push(await patchWorkflow(db, queueWorkflowId, patchQueue, 'generation_update_mode_queue'));
    patched.push(await patchWorkflow(db, workerWorkflowId, patchWorker, 'generation_update_mode_worker'));
    patched.push(await patchWorkflow(db, backlogWorkflowId, patchBacklog, 'generation_update_mode_backlog'));
    console.log(JSON.stringify({
      patched,
      changes: [
        'queue creator persists generationMode/updateContext',
        'worker records generation/update mode in output and metrics',
        'backlog generator receives prior backlog snapshot and update-mode prompt rules'
      ]
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
