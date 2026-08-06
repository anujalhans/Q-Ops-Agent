param(
  [string]$SourceDir = "docs\n8n_workflows_2026-05-08\Published",
  [string]$OutputDir = "docs\n8n_documentation_2026-05-08",
  [string]$GeneratedAt = "",
  [string]$GeneratedTitle = "",
  [string]$SourceWorkflowBackup = "",
  [string]$WorkflowStatus = "Published"
)

$ErrorActionPreference = "Stop"

if (-not $GeneratedAt) {
  $GeneratedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss K")
}

if (-not $GeneratedTitle) {
  $GeneratedTitle = "n8n Workflow Documentation - $GeneratedAt"
}

if (-not $SourceWorkflowBackup) {
  $SourceWorkflowBackup = $SourceDir
}

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
  $json = ($Value | ConvertTo-Json -Depth $Depth)
  $json = $json -replace '(?i)("?(?:password|token|secret|api[_-]?key|authorization|bearer)"?\s*:\s*")([^"]+)(")', '$1[REDACTED]$3'
  $json = $json -replace '(?i)(Bearer\s+)[A-Za-z0-9._~+/\-=]+', '$1[REDACTED]'
  $json = $json -replace '(?i)(Basic\s+)[A-Za-z0-9._~+/\-=]+', '$1[REDACTED]'
  return $json
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

function Write-Utf8File {
  param([string]$Path, [string]$Value)
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Resolve-Path -LiteralPath (Split-Path -Parent $Path)).Path + [System.IO.Path]::DirectorySeparatorChar + (Split-Path -Leaf $Path), $Value, $encoding)
}

function Read-TextFile {
  param([string]$Path)
  return [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $Path).Path)
}

function Get-SupabaseTableHints {
  param([string]$Text)
  $tables = New-Object System.Collections.Generic.List[string]
  foreach ($match in [Regex]::Matches($Text, '/rest/v1/([A-Za-z_][A-Za-z0-9_]*)')) {
    $name = $match.Groups[1].Value
    if ($name -and $name -ne "rpc") { $tables.Add($name) }
  }
  foreach ($match in [Regex]::Matches($Text, '/rest/v1/rpc/([A-Za-z_][A-Za-z0-9_]*)')) {
    $tables.Add("rpc/$($match.Groups[1].Value)")
  }
  foreach ($name in [Regex]::Matches($Text, '\b(?:qa|qops|doc_ingestion|di)_[A-Za-z0-9_]+\b') | ForEach-Object { $_.Value }) {
    $tables.Add($name)
  }
  return @($tables | Sort-Object -Unique)
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
$statusDocDir = Join-Path $workflowDocDir $WorkflowStatus
New-Item -ItemType Directory -Force -Path $statusDocDir | Out-Null

$workflowFiles = Get-ChildItem -Path $SourceDir -Filter "*.json" | Sort-Object Name
$manifest = New-Object System.Collections.Generic.List[object]
$dependencyRows = New-Object System.Collections.Generic.List[string]
$indexRows = New-Object System.Collections.Generic.List[string]

foreach ($file in $workflowFiles) {
  $workflow = Read-TextFile -Path $file.FullName | ConvertFrom-Json
  $safe = ConvertTo-SafeFileName $workflow.name
  $docName = "$safe [$($workflow.id)].md"
  $docPath = Join-Path $statusDocDir $docName
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
  $doc.Add("Generated from the $($WorkflowStatus.ToLowerInvariant()) workflow JSON backup on $GeneratedAt.")
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

  Write-Utf8File -Path $docPath -Value ($doc -join "`n")

  $manifest.Add([pscustomobject]@{
    id = $workflow.id
    name = $workflow.name
    active = $workflow.active
    folder = $WorkflowStatus
    createdAt = $workflow.createdAt
    updatedAt = $workflow.updatedAt
    nodeCount = $nodes.Count
    sourceJson = $file.FullName
    documentation = $docPath
    webhooks = @($webhooks | Sort-Object -Unique)
    credentialReferences = @($credentialTypes)
  })

  $webhookCell = $webhooks -join "<br>"
  $indexRows.Add("| $WorkflowStatus | [$($workflow.name)](workflows/$WorkflowStatus/$docName) | $($workflow.id) | $($nodes.Count) | $webhookCell |")

  foreach ($node in $nodes) {
    $paramText = ConvertTo-MarkdownJson $node.parameters 30
    foreach ($match in [Regex]::Matches($paramText, 'https?://[^"''\s]+|/webhook/[A-Za-z0-9_./:-]+')) {
      $dependencyRows.Add("| $(Format-MarkdownCell $workflow.name) | $(Format-MarkdownCell $node.name) | URL/Webhook | $(Format-MarkdownCell $match.Value) |")
    }
    foreach ($table in (Get-SupabaseTableHints $paramText)) {
      $dependencyRows.Add("| $(Format-MarkdownCell $workflow.name) | $(Format-MarkdownCell $node.name) | Supabase/Data Table | $table |")
    }
    if ($node.credentials) {
      foreach ($prop in $node.credentials.PSObject.Properties) {
        $dependencyRows.Add("| $(Format-MarkdownCell $workflow.name) | $(Format-MarkdownCell $node.name) | Credential Reference | $(Format-MarkdownCell "$($prop.Name): $($prop.Value.name)") |")
      }
    }
  }
}

$readme = New-Object System.Collections.Generic.List[string]
$readme.Add("# $GeneratedTitle")
$readme.Add("")
$readme.Add("This folder documents the $($WorkflowStatus.ToLowerInvariant()) n8n workflows exported from ``$SourceWorkflowBackup``. It intentionally excludes unpublished/inactive workflows so this snapshot remains focused on the currently production-active surface.")
$readme.Add("")
$readme.Add("## Contents")
$readme.Add("")
$readme.Add("- ``workflows/$WorkflowStatus/``: one detailed markdown document per $($WorkflowStatus.ToLowerInvariant()) workflow.")
$readme.Add("- ``manifest.json``: machine-readable workflow inventory and documentation paths.")
$readme.Add("- ``dependency-map.md``: inferred external URLs/webhooks, credential references, and Supabase/data table references.")
$readme.Add("")
$readme.Add("## Summary")
$readme.Add("")
$readme.Add("- Total workflows documented: $($manifest.Count)")
$readme.Add("- $WorkflowStatus workflows: $($manifest.Count)")
$readme.Add("")
$readme.Add("## Workflow Index")
$readme.Add("")
$readme.Add("| Status | Workflow | ID | Nodes | Webhook Hints |")
$readme.Add("| --- | --- | --- | ---: | --- |")
foreach ($row in $indexRows) { $readme.Add($row) }
$readme.Add("")
$readme.Add("## Notes")
$readme.Add("")
$readme.Add("- Credential values and secrets are not exported by n8n; only credential references are documented.")
$readme.Add("- Full node parameter snapshots are included in each workflow document for future context setting.")
$readme.Add("- Raw JSON backups remain the source of truth for exact workflow re-import.")

Write-Utf8File -Path (Join-Path $OutputDir "README.md") -Value ($readme -join "`n")

$dep = New-Object System.Collections.Generic.List[string]
$dep.Add("# n8n Dependency Map - $GeneratedAt")
$dep.Add("")
$dep.Add("Inferred from node parameter JSON across $($WorkflowStatus.ToLowerInvariant()) workflow backups. Review manually before using this as a security or architecture source of truth.")
$dep.Add("")
$dep.Add("| Workflow | Node | Dependency Type | Value |")
$dep.Add("| --- | --- | --- | --- |")
foreach ($row in ($dependencyRows | Sort-Object -Unique)) { $dep.Add($row) }
Write-Utf8File -Path (Join-Path $OutputDir "dependency-map.md") -Value ($dep -join "`n")

Write-Utf8File -Path (Join-Path $OutputDir "manifest.json") -Value ($manifest | ConvertTo-Json -Depth 20)
