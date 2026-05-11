param(
  [string]$SourceDir = "docs\n8n_workflows_2026-05-08\Published",
  [string]$OutputDir = "docs\n8n_documentation_2026-05-08"
)

$ErrorActionPreference = "Stop"

function ConvertTo-SafeFileName {
  param([string]$Name)
  $invalid = [System.IO.Path]::GetInvalidFileNameChars() -join ''
  $regex = "[{0}]" -f [Regex]::Escape($invalid)
  return (($Name -replace $regex, "_") -replace "\s+", " ").Trim()
}

function ConvertTo-MarkdownJson {
  param($Value, [int]$Depth = 20)
  if ($null -eq $Value) {
    return "null"
  }
  return ($Value | ConvertTo-Json -Depth $Depth)
}

function Get-NodePosition {
  param($Node)
  if ($Node.position -and $Node.position.Count -ge 2) {
    return "$($Node.position[0]), $($Node.position[1])"
  }
  return ""
}

function Get-WebhookPath {
  param($Node)
  $p = $Node.parameters
  if ($null -eq $p) { return "" }
  if ($p.path) { return [string]$p.path }
  if ($p.httpMethod -or $p.responseMode) { return "" }
  return ""
}

function Format-WebhookRoute {
  param([string]$Method, [string]$Path)
  if (-not $Path) { return "" }
  $cleanPath = $Path.Trim()
  while ($cleanPath.StartsWith("/")) {
    $cleanPath = $cleanPath.Substring(1)
  }
  if (-not $Method) { $Method = "GET/POST" }
  return "$Method /webhook/$cleanPath"
}

function Format-MarkdownCell {
  param([string]$Value)
  if ($null -eq $Value) { return "" }
  return (($Value -replace "\r?\n", " ") -replace "\|", "\|").Trim()
}

function Get-TriggerSummary {
  param($Workflow)
  $triggerNodes = @($Workflow.nodes | Where-Object { $_.type -match "trigger|webhook" -or $_.name -match "Webhook|Schedule|Trigger" })
  if ($triggerNodes.Count -eq 0) { return "No trigger node in this workflow definition." }
  $lines = New-Object System.Collections.Generic.List[string]
  foreach ($node in $triggerNodes) {
    $method = if ($node.parameters.httpMethod) { $node.parameters.httpMethod } else { "" }
    $path = Get-WebhookPath $node
    $schedule = ""
    if ($node.parameters.rule) {
      $schedule = " rule=" + ((ConvertTo-MarkdownJson $node.parameters.rule 12) -replace "`r?`n", " ")
    }
    $bits = @($node.name, $node.type, $method, $path, $schedule) | Where-Object { $_ -and ([string]$_).Trim().Length -gt 0 }
    $lines.Add("- " + ($bits -join " | "))
  }
  return ($lines -join "`n")
}

function Get-NodeMarkdown {
  param($Node, $Workflow)

  $incoming = New-Object System.Collections.Generic.List[string]
  $outgoing = New-Object System.Collections.Generic.List[string]

  foreach ($sourceProp in $Workflow.connections.PSObject.Properties) {
    $sourceName = $sourceProp.Name
    $main = $sourceProp.Value.main
    if ($null -eq $main) { continue }
    for ($i = 0; $i -lt $main.Count; $i++) {
      foreach ($target in @($main[$i])) {
        if ($target.node -eq $Node.name) {
          $incoming.Add("$sourceName -> $($Node.name) (output $i, input $($target.index))")
        }
        if ($sourceName -eq $Node.name) {
          $outgoing.Add("$($Node.name) -> $($target.node) (output $i, input $($target.index))")
        }
      }
    }
  }

  $credJson = if ($Node.credentials) { ConvertTo-MarkdownJson $Node.credentials 12 } else { "None" }
  $paramJson = ConvertTo-MarkdownJson $Node.parameters 30

  $text = New-Object System.Collections.Generic.List[string]
  $text.Add("### $($Node.name)")
  $text.Add("")
  $text.Add("| Field | Value |")
  $text.Add("| --- | --- |")
  $text.Add("| Node ID | $($Node.id) |")
  $text.Add("| Type | $($Node.type) |")
  $text.Add("| Type Version | $($Node.typeVersion) |")
  $text.Add("| Position | $(Get-NodePosition $Node) |")
  $text.Add("| Disabled | $($Node.disabled) |")
  $text.Add("| Always Output Data | $($Node.alwaysOutputData) |")
  $text.Add("| Retry On Fail | $($Node.retryOnFail) |")
  $text.Add("| Continue On Fail | $($Node.continueOnFail) |")
  $text.Add("")
  $text.Add("**Incoming Connections**")
  $text.Add("")
  if ($incoming.Count -gt 0) { foreach ($line in $incoming) { $text.Add("- $line") } } else { $text.Add("- None") }
  $text.Add("")
  $text.Add("**Outgoing Connections**")
  $text.Add("")
  if ($outgoing.Count -gt 0) { foreach ($line in $outgoing) { $text.Add("- $line") } } else { $text.Add("- None") }
  $text.Add("")
  $text.Add("**Credential References**")
  $text.Add("")
  $text.Add('```json')
  $text.Add($credJson)
  $text.Add('```')
  $text.Add("")
  $text.Add("**Full Parameter Snapshot**")
  $text.Add("")
  $text.Add('```json')
  $text.Add($paramJson)
  $text.Add('```')
  $text.Add("")
  return ($text -join "`n")
}

if (-not (Test-Path $SourceDir)) {
  throw "Source directory not found: $SourceDir"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$workflowDocDir = Join-Path $OutputDir "workflows"
New-Item -ItemType Directory -Force -Path $workflowDocDir | Out-Null

$workflowFiles = Get-ChildItem -Path $SourceDir -Filter "*.json" | Sort-Object Name
$manifest = New-Object System.Collections.Generic.List[object]
$dependencyRows = New-Object System.Collections.Generic.List[string]
$indexRows = New-Object System.Collections.Generic.List[string]

foreach ($file in $workflowFiles) {
  $workflow = Get-Content -Path $file.FullName -Raw | ConvertFrom-Json
  $safe = ConvertTo-SafeFileName $workflow.name
  $docName = "$safe.md"
  $docPath = Join-Path $workflowDocDir $docName
  $nodes = @($workflow.nodes)
  $connections = $workflow.connections
  $triggerSummary = Get-TriggerSummary $workflow
  $nodeTypes = ($nodes | Group-Object type | Sort-Object Count -Descending | ForEach-Object { "$($_.Name) ($($_.Count))" }) -join ", "
  $webhookNodes = @($nodes | Where-Object { $_.type -match "webhook" -or $_.parameters.path })
  $webhooks = @()
  foreach ($node in $webhookNodes) {
    $method = if ($node.parameters.httpMethod) { $node.parameters.httpMethod } else { "GET/POST" }
    $path = Get-WebhookPath $node
    if ($path) { $webhooks += (Format-WebhookRoute $method $path) }
  }
  $credentialTypes = @()
  foreach ($node in $nodes) {
    if ($node.credentials) {
      foreach ($prop in $node.credentials.PSObject.Properties) {
        $credentialTypes += "$($prop.Name): $($prop.Value.name)"
      }
    }
  }
  $credentialTypes = $credentialTypes | Sort-Object -Unique

  $doc = New-Object System.Collections.Generic.List[string]
  $doc.Add("# $($workflow.name)")
  $doc.Add("")
  $doc.Add("Generated from the active/published workflow JSON backup on 2026-05-08.")
  $doc.Add("")
  $doc.Add("## Workflow Metadata")
  $doc.Add("")
  $doc.Add("| Field | Value |")
  $doc.Add("| --- | --- |")
  $doc.Add("| Workflow ID | $($workflow.id) |")
  $doc.Add("| Active | $($workflow.active) |")
  $doc.Add("| Created At | $($workflow.createdAt) |")
  $doc.Add("| Updated At | $($workflow.updatedAt) |")
  $doc.Add("| Node Count | $($nodes.Count) |")
  $doc.Add("| JSON Source | $($file.FullName) |")
  $doc.Add("")
  $doc.Add("## Description")
  $doc.Add("")
  if ($workflow.description) { $doc.Add($workflow.description) } else { $doc.Add("No workflow description is set in n8n.") }
  $doc.Add("")
  $doc.Add("## Trigger And Entry Contract")
  $doc.Add("")
  $doc.Add($triggerSummary)
  $doc.Add("")
  if ($webhooks.Count -gt 0) {
    $doc.Add("Known webhook route hints:")
    $doc.Add("")
    foreach ($hook in ($webhooks | Sort-Object -Unique)) { $doc.Add("- $hook") }
    $doc.Add("")
  }
  $doc.Add("## Node Type Inventory")
  $doc.Add("")
  $doc.Add("| Node Type | Count |")
  $doc.Add("| --- | ---: |")
  foreach ($group in ($nodes | Group-Object type | Sort-Object Name)) {
    $doc.Add("| $($group.Name) | $($group.Count) |")
  }
  $doc.Add("")
  $doc.Add("## Credentials Referenced")
  $doc.Add("")
  if ($credentialTypes.Count -gt 0) {
    foreach ($cred in $credentialTypes) { $doc.Add("- $cred") }
  } else {
    $doc.Add("- None")
  }
  $doc.Add("")
  $doc.Add("## Connection Graph")
  $doc.Add("")
  if ($connections) {
    foreach ($sourceProp in $connections.PSObject.Properties) {
      $sourceName = $sourceProp.Name
      $main = $sourceProp.Value.main
      if ($null -eq $main) { continue }
      for ($i = 0; $i -lt $main.Count; $i++) {
        foreach ($target in @($main[$i])) {
          $doc.Add("- $sourceName -> $($target.node) (source output $i, target input $($target.index))")
        }
      }
    }
  } else {
    $doc.Add("- No connections found.")
  }
  $doc.Add("")
  $doc.Add("## Nodes")
  $doc.Add("")
  foreach ($node in ($nodes | Sort-Object name)) {
    $doc.Add((Get-NodeMarkdown $node $workflow))
  }

  Set-Content -Path $docPath -Value ($doc -join "`n") -Encoding UTF8

  $manifest.Add([pscustomobject]@{
    id = $workflow.id
    name = $workflow.name
    active = $workflow.active
    createdAt = $workflow.createdAt
    updatedAt = $workflow.updatedAt
    nodeCount = $nodes.Count
    sourceJson = $file.FullName
    documentation = $docPath
    webhooks = @($webhooks | Sort-Object -Unique)
    credentialReferences = @($credentialTypes)
  })

  $webhookCell = $webhooks -join "<br>"
  $indexRows.Add("| [$($workflow.name)](workflows/$docName) | $($workflow.id) | $($nodes.Count) | $webhookCell |")

  foreach ($node in $nodes) {
    $paramText = ConvertTo-MarkdownJson $node.parameters 30
    foreach ($match in [Regex]::Matches($paramText, 'https?://[^"''\s]+|/webhook/[A-Za-z0-9_./:-]+')) {
      $dependencyRows.Add("| $(Format-MarkdownCell $workflow.name) | $(Format-MarkdownCell $node.name) | URL/Webhook | $(Format-MarkdownCell $match.Value) |")
    }
    foreach ($table in @("qa_jobs","doc_ingestion_jobs","doc_ingestion_queuecreator_logs","qa_job_metrics","qops_projects","qops_users","qops_project_members","qops_environment_settings","qops_integration_settings","qops_project_integration_overrides","qops_connection_test_results","qops_user_preferences","qops_audit_events")) {
      if ($paramText -match [Regex]::Escape($table)) {
        $dependencyRows.Add("| $(Format-MarkdownCell $workflow.name) | $(Format-MarkdownCell $node.name) | Supabase Table | $table |")
      }
    }
  }
}

$readme = New-Object System.Collections.Generic.List[string]
$readme.Add("# n8n Active Workflow Documentation - 2026-05-08")
$readme.Add("")
$readme.Add("This folder documents all workflows that were active/published and available through the n8n MCP inventory on 2026-05-08. The markdown files were generated from the exported workflow JSON files in `docs/n8n_workflows_2026-05-08/Published`.")
$readme.Add("")
$readme.Add("## Contents")
$readme.Add("")
$readme.Add("- `workflows/`: one detailed markdown document per active workflow.")
$readme.Add("- `manifest.json`: machine-readable workflow inventory and documentation paths.")
$readme.Add("- `dependency-map.md`: inferred external URLs/webhooks and Supabase table references.")
$readme.Add("")
$readme.Add("## Workflow Index")
$readme.Add("")
$readme.Add("| Workflow | ID | Nodes | Webhook Hints |")
$readme.Add("| --- | --- | ---: | --- |")
foreach ($row in $indexRows) { $readme.Add($row) }
$readme.Add("")
$readme.Add("## Notes")
$readme.Add("")
$readme.Add("- Credential values and secrets are not exported by n8n; only credential references are documented.")
$readme.Add("- Full node parameter snapshots are included in each workflow document for future context setting.")
$readme.Add("- Raw JSON backups remain the source of truth for exact workflow re-import.")

Set-Content -Path (Join-Path $OutputDir "README.md") -Value ($readme -join "`n") -Encoding UTF8

$dep = New-Object System.Collections.Generic.List[string]
$dep.Add("# n8n Dependency Map - 2026-05-08")
$dep.Add("")
$dep.Add("Inferred from node parameter JSON across active/published workflow backups.")
$dep.Add("")
$dep.Add("| Workflow | Node | Dependency Type | Value |")
$dep.Add("| --- | --- | --- | --- |")
foreach ($row in ($dependencyRows | Sort-Object -Unique)) { $dep.Add($row) }
Set-Content -Path (Join-Path $OutputDir "dependency-map.md") -Value ($dep -join "`n") -Encoding UTF8

$manifest | ConvertTo-Json -Depth 20 | Set-Content -Path (Join-Path $OutputDir "manifest.json") -Encoding UTF8
