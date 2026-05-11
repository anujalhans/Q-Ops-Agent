import fs from 'node:fs';

const filePath = process.argv[2];
if (!filePath) throw new Error('Usage: node tools/patch-generation-token-output.mjs <workflow-json>');

const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const nodes = Array.isArray(workflow) ? workflow[0].nodes : workflow.nodes;
if (!Array.isArray(nodes)) throw new Error('Workflow JSON does not contain a nodes array');

function findNode(name) {
  const node = nodes.find((item) => item.name === name);
  if (!node?.parameters) throw new Error(`Could not find node ${name}`);
  return node;
}

const validate = findNode('Validate AI Agent Output');
validate.parameters.jsCode = `// Detect AI output safely across all n8n versions

let text = "";
let tokensInput = 0;
let tokensOutput = 0;

if ($json.output_text) {
  text = $json.output_text;
} else if (typeof $json.output === "string") {
  text = $json.output;
} else if ($json.output?.[0]?.content?.[0]?.text) {
  text = $json.output[0].content[0].text;
} else if ($json.message?.content) {
  text = $json.message.content;
}

tokensInput = $json.usage?.prompt_tokens ||
  $json.usage?.input_tokens ||
  $json.llmUsage?.promptTokens ||
  $json.tokenUsage?.promptTokens ||
  0;

tokensOutput = $json.usage?.completion_tokens ||
  $json.usage?.output_tokens ||
  $json.llmUsage?.completionTokens ||
  $json.tokenUsage?.completionTokens ||
  0;

if (!text || text.trim().length < 50) {
  throw new Error("AI returned unexpected structure: " + JSON.stringify($json));
}

const wordCount = text.trim().split(/\\s+/).length;
const charCount = text.trim().length;
const jobId = $('Prompt Library').item.json.jobId;
const systemPrompt = $('Prompt Library').item.json.system || "";
const userPrompt = $('Prompt Library').item.json.user || "";
const usageSource = tokensInput || tokensOutput ? "provider_usage" : "estimated";

if (!tokensOutput) {
  tokensOutput = Math.max(1, Math.ceil(charCount / 4));
}

if (!tokensInput) {
  tokensInput = Math.max(1, Math.ceil((systemPrompt.length + userPrompt.length) / 4));
}

const INPUT_COST_PER_TOKEN = 0.40 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 1.60 / 1_000_000;
const estimatedCostUsd = (tokensInput * INPUT_COST_PER_TOKEN) + (tokensOutput * OUTPUT_COST_PER_TOKEN);

return [
  {
    json: {
      rawMarkdown: text,
      wordCount,
      charCount,
      jobId,
      tokensInput,
      tokensOutput,
      tokensTotal: tokensInput + tokensOutput,
      estimatedCostUsd: parseFloat(estimatedCostUsd.toFixed(6)),
      tokenUsage: {
        source: usageSource,
        input: tokensInput,
        output: tokensOutput,
        total: tokensInput + tokensOutput,
        estimatedCostUsd: parseFloat(estimatedCostUsd.toFixed(6)),
      },
    }
  }
];`;

function confluenceBody(sourceNode) {
  return `={
  "status": "completed",
  "output": {
    "settingsVersion": {{ $('Restore Job Context').item.json.settingsVersion || 'null' }},
    "destination": {
      "projectId": {{ $('Restore Job Context').item.json.projectId ? JSON.stringify($('Restore Job Context').item.json.projectId) : 'null' }},
      "type": "confluence"
    },
    "confluencePageId": "{{ $('${sourceNode}').item.json.id }}",
    "url": "{{ $('${sourceNode}').item.json._links.base + $('${sourceNode}').item.json._links.webui }}",
    "wordCount": "{{ parseInt($('Restore Quality Gate Output').item.json.wordCount) || 0 }}",
    "tokenUsage": {
      "source": "{{ $('Restore Quality Gate Output').item.json.tokenUsage?.source || 'estimated' }}",
      "input": "{{ $('Restore Quality Gate Output').item.json.tokensInput || 0 }}",
      "output": "{{ $('Restore Quality Gate Output').item.json.tokensOutput || 0 }}",
      "total": "{{ $('Restore Quality Gate Output').item.json.tokensTotal || 0 }}",
      "estimatedCostUsd": "{{ $('Restore Quality Gate Output').item.json.estimatedCostUsd || 0 }}"
    }
  },
  "updated_at": "{{ new Date().toISOString() }}"
}`;
}

findNode('Update Job Status as Completed').parameters.jsonBody = confluenceBody('Upload Document on Confluence');
findNode('Mark Job Status as Completed').parameters.jsonBody = confluenceBody('Update existing Document on Confluence');

findNode('Update Job Status as Completed1').parameters.jsonBody = `={
  "status": "completed",
  "output": {
    "settingsVersion": {{ $('Restore Job Context').item.json.settingsVersion || 'null' }},
    "destination": {
      "projectId": {{ $('Restore Job Context').item.json.projectId ? JSON.stringify($('Restore Job Context').item.json.projectId) : 'null' }},
      "type": "jira"
    },
    "stories": {{ JSON.stringify($json.stories) }},
    "epics": {{ JSON.stringify($json.epics) }},
    "wordCount": "{{ parseInt($('Restore Quality Gate Output').item.json.wordCount) || 0 }}",
    "tokenUsage": {
      "source": "{{ $('Restore Quality Gate Output').item.json.tokenUsage?.source || 'estimated' }}",
      "input": "{{ $('Restore Quality Gate Output').item.json.tokensInput || 0 }}",
      "output": "{{ $('Restore Quality Gate Output').item.json.tokensOutput || 0 }}",
      "total": "{{ $('Restore Quality Gate Output').item.json.tokensTotal || 0 }}",
      "estimatedCostUsd": "{{ $('Restore Quality Gate Output').item.json.estimatedCostUsd || 0 }}"
    }
  },
  "updated_at": "{{ new Date().toISOString() }}"
}`;

const restore = findNode('Restore Quality Gate Output');
const assignments = restore.parameters.assignments.assignments;
if (!assignments.some((item) => item.name === 'tokenUsage')) {
  assignments.push({
    id: 'generation-token-usage-output',
    name: 'tokenUsage',
    value: "={{ $('Quality Gate').item.json.tokenUsage }}",
    type: 'object',
  });
}

fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
