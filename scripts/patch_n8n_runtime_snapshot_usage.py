import datetime as dt
import json
import os
import sqlite3
from pathlib import Path


DB_PATH = Path.home() / ".n8n" / "database.sqlite"
BACKUP_DIR = Path("docs/test_data/n8n_workflow_backups")


def backup(workflow):
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    path = BACKUP_DIR / f"workflow_{workflow['id']}_before_runtime_snapshot_usage_{stamp}.json"
    path.write_text(json.dumps(workflow, indent=2), encoding="utf-8")
    return path


def load(cur, workflow_id):
    row = cur.execute("select id,name,nodes,connections from workflow_entity where id=?", (workflow_id,)).fetchone()
    if not row:
        raise RuntimeError(f"Workflow {workflow_id} not found")
    return {"id": row[0], "name": row[1], "nodes": json.loads(row[2]), "connections": json.loads(row[3])}


def save(cur, workflow):
    active = cur.execute("select activeVersionId, versionId from workflow_entity where id=?", (workflow["id"],)).fetchone()
    cur.execute(
        "update workflow_entity set nodes=?, updatedAt=strftime('%Y-%m-%d %H:%M:%f','now'), versionCounter=versionCounter+1 where id=?",
        (json.dumps(workflow["nodes"]), workflow["id"]),
    )
    for version_id in {active[0], active[1]} if active else set():
        if version_id:
            cur.execute(
                "update workflow_history set nodes=?, updatedAt=strftime('%Y-%m-%d %H:%M:%f','now') where versionId=? and workflowId=?",
                (json.dumps(workflow["nodes"]), version_id, workflow["id"]),
            )


def by_name(workflow, name):
    for node in workflow["nodes"]:
        if node.get("name") == name:
            return node
    raise RuntimeError(f"Node {name} not found in {workflow['name']}")


PUBLISHING_EXPR = "($json.configSnapshot || $('Prompt Library').item.json.configSnapshot || {}).publishing || {}"
JIRA_BASE = f"String(({PUBLISHING_EXPR}).jiraBaseUrl || 'https://anujalhans1.atlassian.net').replace(/\\/$/, '')"
CONF_BASE = f"String(({PUBLISHING_EXPR}).confluenceBaseUrl || 'https://anujalhans1.atlassian.net/wiki').replace(/\\/$/, '')"
JIRA_PROJECT_KEY = f"(({PUBLISHING_EXPR}).jiraProjectKey || 'KAN')"
JIRA_PROJECT_ID = f"(({PUBLISHING_EXPR}).jiraProjectId || '10001')"
JIRA_EPIC_TYPE = f"(({PUBLISHING_EXPR}).jiraEpicIssueTypeId || '10002')"
JIRA_STORY_TYPE = f"(({PUBLISHING_EXPR}).jiraStoryIssueTypeId || '10006')"
CONF_SPACE = f"(({PUBLISHING_EXPR}).confluenceSpaceKey || 'TD')"


def expr(js):
    return "={{ " + js + " }}"


def set_body_param(node, name, value):
    for param in node["parameters"].get("bodyParameters", {}).get("parameters", []):
        if param.get("name") == name:
            param["value"] = value
            return
    raise RuntimeError(f"Body parameter {name} not found in {node['name']}")


def set_query_param(node, name, value):
    for param in node["parameters"].get("queryParameters", {}).get("parameters", []):
        if param.get("name") == name:
            param["value"] = value
            return
    raise RuntimeError(f"Query parameter {name} not found in {node['name']}")


def patch_full_retrieval(workflow):
    upload = by_name(workflow, "Upload Document on Confluence")
    upload["parameters"]["url"] = expr(f"{CONF_BASE} + '/rest/api/content'")
    set_body_param(upload, "space.key", expr(CONF_SPACE))

    check = by_name(workflow, "Check Existing Page")
    check["parameters"]["url"] = (
        expr(f"{CONF_BASE} + '/rest/api/content?spaceKey=' + encodeURIComponent({CONF_SPACE}) + "
        " '&title=' + encodeURIComponent($json.documentType.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase()) + ' - ' + $json.projectName)")
    )

    update = by_name(workflow, "Update existing Document on Confluence")
    update["parameters"]["url"] = expr(f"{CONF_BASE} + '/rest/api/content/' + $json.pageId")

    details = by_name(workflow, "Get Page Details")
    details["parameters"]["url"] = expr(f"{CONF_BASE} + '/rest/api/content/' + $json.pageId + '?expand=version'")

    search_epic = by_name(workflow, "Search Epic in JIRA")
    search_epic["parameters"]["url"] = expr(f"{JIRA_BASE} + '/rest/api/3/search/jql'")
    set_query_param(search_epic, "jql", expr(f"'project = ' + {JIRA_PROJECT_KEY} + ' AND issuetype = Epic AND summary ~ \"' + $json.epicName + '\"'"))

    search_story = by_name(workflow, "Search Story in JIRA")
    search_story["parameters"]["url"] = expr(f"{JIRA_BASE} + '/rest/api/3/search/jql'")
    set_query_param(search_story, "jql", expr(f"'project = ' + {JIRA_PROJECT_KEY} + ' AND issuetype = Story AND labels IN (\"' + $json.idempotencyKey + '\")'"))

    search_epics = by_name(workflow, "Search existence of Epics in JIRA")
    search_epics["parameters"]["url"] = expr(f"{JIRA_BASE} + '/rest/api/3/search/jql'")
    set_query_param(
        search_epics,
        "jql",
        expr(f"'project = ' + {JIRA_PROJECT_KEY} + ' AND issuetype = Epic AND (' + $json.structuredData.epics.map(e => `summary ~ \"${{e.epicName.replace(/\"/g, '\\\\\"')}}\"`).join(' OR ') + ')'"),
    )

    create_epic = by_name(workflow, "Create Epics in JIRA")
    create_epic["parameters"]["project"] = {"__rl": True, "value": expr(JIRA_PROJECT_ID), "mode": "id", "cachedResultName": "Runtime snapshot Jira project"}
    create_epic["parameters"]["issueType"] = {"__rl": True, "value": expr(JIRA_EPIC_TYPE), "mode": "id", "cachedResultName": "Runtime snapshot Epic"}

    create_story = by_name(workflow, "Create User Stories in JIRA1")
    create_story["parameters"]["project"] = {"__rl": True, "value": expr(JIRA_PROJECT_ID), "mode": "id", "cachedResultName": "Runtime snapshot Jira project"}
    create_story["parameters"]["issueType"] = {"__rl": True, "value": expr(JIRA_STORY_TYPE), "mode": "id", "cachedResultName": "Runtime snapshot Story"}


def patch_backlog_normalize(workflow):
    normalize = by_name(workflow, "Normalize Team Managed Request")
    code = normalize["parameters"]["jsCode"]
    code = code.replace(
        "const jira = config.jira || {};\nconst confluence = config.confluence || {};",
        "const publishing = config.publishing || {};\nconst jira = config.jira || {\n  baseUrl: publishing.jiraBaseUrl,\n  projectKey: publishing.jiraProjectKey,\n  projectId: publishing.jiraProjectId,\n  epicIssueTypeId: publishing.jiraEpicIssueTypeId,\n  storyIssueTypeId: publishing.jiraStoryIssueTypeId,\n  idempotencyLabelPrefix: publishing.jiraIdempotencyLabelPrefix\n};\nconst confluence = config.confluence || {\n  baseUrl: publishing.confluenceBaseUrl,\n  spaceKey: publishing.confluenceSpaceKey,\n  parentPageId: publishing.confluenceParentPageId,\n  pageTitlePattern: publishing.confluencePageTitlePattern\n};",
    )
    normalize["parameters"]["jsCode"] = code


def patch_story_testcase_normalize(workflow):
    normalize = by_name(workflow, "Normalize Story Test Case Request")
    code = normalize["parameters"]["jsCode"]
    code = code.replace(
        "const jira = config.jira || {};\nconst models = config.models || {};",
        "const publishing = config.publishing || {};\nconst jira = config.jira || {\n  baseUrl: publishing.jiraBaseUrl,\n  projectKey: publishing.jiraProjectKey,\n  testCaseIssueTypeName: publishing.jiraTestCaseIssueTypeName,\n  idempotencyLabelPrefix: publishing.jiraIdempotencyLabelPrefix\n};\nconst models = config.models || {};",
    )
    normalize["parameters"]["jsCode"] = code


def patch_queue_metric(workflow, node_name):
    metric = by_name(workflow, node_name)
    body = metric["parameters"].get("jsonBody", "")
    if "config_source_priority" in body:
        return
    body = body.replace(
        '"environment": $("Combine Job And Runtime").first().json.environment }',
        '"environment": $("Combine Job And Runtime").first().json.environment, "config_source_priority": $("Combine Job And Runtime").first().json.configSnapshot?.scope?.sourcePriority || $("Combine Job And Runtime").first().json.configSnapshot?.sourcePriority || {} }',
    ).replace(
        '"environment": $("Combine Job And Runtime").item.json.environment }',
        '"environment": $("Combine Job And Runtime").item.json.environment, "config_source_priority": $("Combine Job And Runtime").item.json.configSnapshot?.scope?.sourcePriority || $("Combine Job And Runtime").item.json.configSnapshot?.sourcePriority || {} }',
    ).replace(
        'settings_version: $("Combine Job And Runtime").item.json.settingsVersion, environment: $("Combine Job And Runtime").item.json.environment }',
        'settings_version: $("Combine Job And Runtime").item.json.settingsVersion, environment: $("Combine Job And Runtime").item.json.environment, config_source_priority: $("Combine Job And Runtime").item.json.configSnapshot?.scope?.sourcePriority || $("Combine Job And Runtime").item.json.configSnapshot?.sourcePriority || {} }',
    )
    metric["parameters"]["jsonBody"] = body


def main():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    workflows = {
        "fullRetrievalD01": patch_full_retrieval,
        "Vwc6c8ehsRTF8svG": patch_backlog_normalize,
        "SG7khcKlhHst48WH": patch_story_testcase_normalize,
        "iiR8d9v5oI8WzBPX": lambda wf: patch_queue_metric(wf, "LOG: Job Queued"),
        "yPgr7mtUnL3E8QQP": lambda wf: patch_queue_metric(wf, "LOG: Professional Job Queued"),
    }
    backups = []
    for workflow_id, patcher in workflows.items():
        wf = load(cur, workflow_id)
        backups.append(backup(wf))
        patcher(wf)
        save(cur, wf)
        print(f"Patched {wf['name']}")
    con.commit()
    print("Backups:")
    for path in backups:
        print(path)


if __name__ == "__main__":
    main()
