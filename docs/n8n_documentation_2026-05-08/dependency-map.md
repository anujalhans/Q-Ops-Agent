# n8n Dependency Map - 2026-05-08

Inferred from node parameter JSON across active/published workflow backups.

| Workflow | Node | Dependency Type | Value |
| --- | --- | --- | --- |
| INGEST API Queue Creator - SaaS - Attributed Draft | Build File URL Map | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/public/uploaded-project-docs/${projectName}/${jobId}/${encodedFileName}`;\n}\nreturn |
| INGEST API Queue Creator - SaaS - Attributed Draft | Fetch Q-Ops User Profile | Supabase Table | qops_users |
| INGEST API Queue Creator - SaaS - Attributed Draft | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| INGEST API Queue Creator - SaaS - Attributed Draft | Insert JobID into Supabase DB | Supabase Table | doc_ingestion_jobs |
| INGEST API Queue Creator - SaaS - Attributed Draft | Insert JobID into Supabase DB | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| INGEST API Queue Creator - SaaS - Attributed Draft | LOG: Job Queued | Supabase Table | qa_job_metrics |
| INGEST API Queue Creator - SaaS - Attributed Draft | LOG: Job Queued | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| INGEST API Queue Creator - SaaS - Attributed Draft | Resolve Runtime Config | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/qops_resolve_runtime_config |
| INGEST API Queue Creator - SaaS - Attributed Draft | Store LOGS in Supabase | Supabase Table | doc_ingestion_queuecreator_logs |
| INGEST API Queue Creator - SaaS - Attributed Draft | Store LOGS in Supabase | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs |
| INGEST API Queue Creator - SaaS - Attributed Draft | Upload Files to Supabase Storage | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/uploaded-project-docs/{{ |
| INGEST API Queue Creator - SaaS - Attributed Draft | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Get Pending Jobs | Supabase Table | doc_ingestion_jobs |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Get Pending Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?status=eq.pending\u0026order=created_at.asc\u0026limit=1\u0026select=job_id,status,input,project_id,requested_by,settings_version,config_snapshot,created_at |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Lock Pending Job picked for processing | Supabase Table | doc_ingestion_jobs |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Lock Pending Job picked for processing | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Store LOGS in Supabase | Supabase Table | doc_ingestion_queuecreator_logs |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Store LOGS in Supabase | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs?job_id=eq.{{ |
| INGEST Workflow-Status-Check | Check Status | Supabase Table | doc_ingestion_jobs |
| INGEST Workflow-Status-Check | Check Status | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | Extract Text + Image | URL/Webhook | http://127.0.0.1:8000/process-document\u0027 |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | LOG: Job Completed | Supabase Table | qa_job_metrics |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | LOG: Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | Store LOGS in Supabase | Supabase Table | doc_ingestion_queuecreator_logs |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | Store LOGS in Supabase | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs?job_id=eq.{{ |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | Update Job Status as Completed | Supabase Table | doc_ingestion_jobs |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | Update Job Status as Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | Update Job Status as Failed | Supabase Table | doc_ingestion_jobs |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | Update Job Status as Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | Update Project Status as Ready | Supabase Table | qops_projects |
| Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft | Update Project Status as Ready | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?id=eq.{{ |
| Q-Ops Agent Artifact Reprocess API | Fetch Current User Project Memberships | Supabase Table | qops_project_members |
| Q-Ops Agent Artifact Reprocess API | Fetch Current User Project Memberships | Supabase Table | qops_projects |
| Q-Ops Agent Artifact Reprocess API | Fetch Current User Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent Artifact Reprocess API | Fetch Q-Ops User Profile | Supabase Table | qops_users |
| Q-Ops Agent Artifact Reprocess API | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Artifact Reprocess API | Fetch Reprocess Source Job | Supabase Table | doc_ingestion_jobs |
| Q-Ops Agent Artifact Reprocess API | Fetch Reprocess Source Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| Q-Ops Agent Artifact Reprocess API | Insert Reprocess Ingestion Job | Supabase Table | doc_ingestion_jobs |
| Q-Ops Agent Artifact Reprocess API | Insert Reprocess Ingestion Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| Q-Ops Agent Artifact Reprocess API | Insert Reprocess Metric | Supabase Table | qa_job_metrics |
| Q-Ops Agent Artifact Reprocess API | Insert Reprocess Metric | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| Q-Ops Agent Artifact Reprocess API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Artifacts API | Fetch Ingestion Jobs | Supabase Table | doc_ingestion_jobs |
| Q-Ops Agent Artifacts API | Fetch Ingestion Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| Q-Ops Agent Audit Events API | Fetch Current User Project Memberships | Supabase Table | qops_project_members |
| Q-Ops Agent Audit Events API | Fetch Current User Project Memberships | Supabase Table | qops_projects |
| Q-Ops Agent Audit Events API | Fetch Current User Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent Audit Events API | Fetch QA Job Metrics For Audit | Supabase Table | qa_job_metrics |
| Q-Ops Agent Audit Events API | Fetch QA Job Metrics For Audit | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| Q-Ops Agent Audit Events API | Fetch Q-Ops Audit Events | Supabase Table | qops_audit_events |
| Q-Ops Agent Audit Events API | Fetch Q-Ops Audit Events | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent Audit Events API | Fetch Q-Ops User Profile | Supabase Table | qops_users |
| Q-Ops Agent Audit Events API | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Audit Events API | Map Audit Events Response | Supabase Table | qops_projects |
| Q-Ops Agent Audit Events API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Auth Me API | Fetch Current User Project Memberships | Supabase Table | qops_project_members |
| Q-Ops Agent Auth Me API | Fetch Current User Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent Auth Me API | Fetch Q-Ops User Profile | Supabase Table | qops_users |
| Q-Ops Agent Auth Me API | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Auth Me API | Map Current User Response | Supabase Table | qops_users |
| Q-Ops Agent Auth Me API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Generated Documents API | Fetch QA Jobs | Supabase Table | qa_jobs |
| Q-Ops Agent Generated Documents API | Fetch QA Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| Q-Ops Agent Infrastructure Load API | Fetch Connection Results | Supabase Table | qops_connection_test_results |
| Q-Ops Agent Infrastructure Load API | Fetch Connection Results | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results |
| Q-Ops Agent Infrastructure Load API | Fetch Current User Project Memberships | Supabase Table | qops_project_members |
| Q-Ops Agent Infrastructure Load API | Fetch Current User Project Memberships | Supabase Table | qops_projects |
| Q-Ops Agent Infrastructure Load API | Fetch Current User Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent Infrastructure Load API | Fetch Generation Jobs | Supabase Table | qa_jobs |
| Q-Ops Agent Infrastructure Load API | Fetch Generation Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| Q-Ops Agent Infrastructure Load API | Fetch Ingestion Jobs | Supabase Table | doc_ingestion_jobs |
| Q-Ops Agent Infrastructure Load API | Fetch Ingestion Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| Q-Ops Agent Infrastructure Load API | Fetch Q-Ops User Profile | Supabase Table | qops_users |
| Q-Ops Agent Infrastructure Load API | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Infrastructure Load API | Fetch Recent Metrics | Supabase Table | qa_job_metrics |
| Q-Ops Agent Infrastructure Load API | Fetch Recent Metrics | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| Q-Ops Agent Infrastructure Load API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Integration Test API | Fetch Integration For Test | Supabase Table | qops_integration_settings |
| Q-Ops Agent Integration Test API | Fetch Integration For Test | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings |
| Q-Ops Agent Integration Test API | Fetch Live Health Snapshot | URL/Webhook | http://localhost:5678/webhook/health |
| Q-Ops Agent Integration Test API | Insert Connection Test Result | Supabase Table | qops_connection_test_results |
| Q-Ops Agent Integration Test API | Insert Connection Test Result | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results |
| Q-Ops Agent Integration Test API | Patch Integration Test Metadata | Supabase Table | qops_integration_settings |
| Q-Ops Agent Integration Test API | Patch Integration Test Metadata | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings?environment_key=eq.\ |
| Q-Ops Agent Integrations Status API | Fetch Integrations | Supabase Table | qops_integration_settings |
| Q-Ops Agent Integrations Status API | Fetch Integrations | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings |
| Q-Ops Agent Integrations Status API | Fetch Recent Test Results | Supabase Table | qops_connection_test_results |
| Q-Ops Agent Integrations Status API | Fetch Recent Test Results | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results |
| Q-Ops Agent Integrations Test All API | Fetch Integrations For Test All | Supabase Table | qops_integration_settings |
| Q-Ops Agent Integrations Test All API | Fetch Integrations For Test All | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings |
| Q-Ops Agent Integrations Test All API | Fetch Live Health Snapshot | URL/Webhook | http://localhost:5678/webhook/health |
| Q-Ops Agent Integrations Test All API | Insert All Connection Test Results | Supabase Table | qops_connection_test_results |
| Q-Ops Agent Integrations Test All API | Insert All Connection Test Results | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results |
| Q-Ops Agent Projects API - Wired | Fetch Projects | Supabase Table | qops_projects |
| Q-Ops Agent Projects API - Wired | Fetch Projects | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects |
| Q-Ops Agent Projects API - Wired | Fetch Projects For Upsert | Supabase Table | qops_projects |
| Q-Ops Agent Projects API - Wired | Fetch Projects For Upsert | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects |
| Q-Ops Agent Projects API - Wired | Insert Project Audit Event | Supabase Table | qops_audit_events |
| Q-Ops Agent Projects API - Wired | Insert Project Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent Projects API - Wired | Prepare Project Upsert | Supabase Table | qops_projects |
| Q-Ops Agent Projects API - Wired | Prepare Project Upsert | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1\u0027; |
| Q-Ops Agent Settings API | Fetch Environment Settings | Supabase Table | qops_environment_settings |
| Q-Ops Agent Settings API | Fetch Environment Settings | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_environment_settings |
| Q-Ops Agent Settings API | Fetch Integration Settings | Supabase Table | qops_integration_settings |
| Q-Ops Agent Settings API | Fetch Integration Settings | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings |
| Q-Ops Agent Settings API | Fetch Latest Connection Results | Supabase Table | qops_connection_test_results |
| Q-Ops Agent Settings API | Fetch Latest Connection Results | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results |
| Q-Ops Agent Settings Write API | Insert Settings Audit Event | Supabase Table | qops_audit_events |
| Q-Ops Agent Settings Write API | Insert Settings Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent Settings Write API | Prepare Settings Patch | Supabase Table | qops_environment_settings |
| Q-Ops Agent Settings Write API | Prepare Settings Patch | Supabase Table | qops_integration_settings |
| Q-Ops Agent Settings Write API | Prepare Settings Patch | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1\u0027;\nconst |
| Q-Ops Agent User Accept Invite API | Activate Q-Ops User | Supabase Table | qops_users |
| Q-Ops Agent User Accept Invite API | Activate Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?id=eq.\ |
| Q-Ops Agent User Accept Invite API | Fetch Invited Q-Ops User | Supabase Table | qops_users |
| Q-Ops Agent User Accept Invite API | Fetch Invited Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent User Accept Invite API | Insert Invite Accepted Audit Event | Supabase Table | qops_audit_events |
| Q-Ops Agent User Accept Invite API | Insert Invite Accepted Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent User Accept Invite API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent User Invite API | Fetch Current Q-Ops User | Supabase Table | qops_users |
| Q-Ops Agent User Invite API | Fetch Current Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent User Invite API | Insert User Invite Audit Event | Supabase Table | qops_audit_events |
| Q-Ops Agent User Invite API | Insert User Invite Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent User Invite API | Invite Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/invite?redirect_to=\ |
| Q-Ops Agent User Invite API | Prepare Invite Request | Supabase Table | qops_users |
| Q-Ops Agent User Invite API | Prepare Invite Request | URL/Webhook | http://127.0.0.1:5175/auth/callback\u0027).trim();\nconst |
| Q-Ops Agent User Invite API | Upsert Q-Ops User | Supabase Table | qops_users |
| Q-Ops Agent User Invite API | Upsert Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?on_conflict=email |
| Q-Ops Agent User Invite API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent User Password Reset Audit API | Fetch Q-Ops User | Supabase Table | qops_users |
| Q-Ops Agent User Password Reset Audit API | Fetch Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| Q-Ops Agent User Password Reset Audit API | Insert Password Reset Audit Event | Supabase Table | qops_audit_events |
| Q-Ops Agent User Password Reset Audit API | Insert Password Reset Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent User Password Reset Audit API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent User Project Assignments API | Delete Existing Project Assignments | Supabase Table | qops_project_members |
| Q-Ops Agent User Project Assignments API | Delete Existing Project Assignments | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| Q-Ops Agent User Project Assignments API | Fetch Current Q-Ops Admin | Supabase Table | qops_users |
| Q-Ops Agent User Project Assignments API | Fetch Current Q-Ops Admin | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent User Project Assignments API | Fetch Projects | Supabase Table | qops_projects |
| Q-Ops Agent User Project Assignments API | Fetch Projects | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects |
| Q-Ops Agent User Project Assignments API | Fetch Target Q-Ops User | Supabase Table | qops_users |
| Q-Ops Agent User Project Assignments API | Fetch Target Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent User Project Assignments API | Insert Assignment Audit Event | Supabase Table | qops_audit_events |
| Q-Ops Agent User Project Assignments API | Insert Assignment Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent User Project Assignments API | Insert Project Assignments | Supabase Table | qops_project_members |
| Q-Ops Agent User Project Assignments API | Insert Project Assignments | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent User Project Assignments API | Prepare Project Assignments | Supabase Table | qops_users |
| Q-Ops Agent User Project Assignments API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent User Update API | Fetch Current Q-Ops User | Supabase Table | qops_users |
| Q-Ops Agent User Update API | Fetch Current Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent User Update API | Insert User Update Audit Event | Supabase Table | qops_audit_events |
| Q-Ops Agent User Update API | Insert User Update Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent User Update API | Patch Q-Ops User | Supabase Table | qops_users |
| Q-Ops Agent User Update API | Patch Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?id=eq.{{ |
| Q-Ops Agent User Update API | Prepare User Update Request | Supabase Table | qops_users |
| Q-Ops Agent User Update API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Users API | Fetch Current Q-Ops User | Supabase Table | qops_users |
| Q-Ops Agent Users API | Fetch Current Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Users API | Fetch Project Memberships | Supabase Table | qops_project_members |
| Q-Ops Agent Users API | Fetch Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent Users API | Fetch Users | Supabase Table | qops_users |
| Q-Ops Agent Users API | Fetch Users | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Users API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops-Agent-Analytics-Summary | Build Scoped Metrics Query | Supabase Table | qa_job_metrics |
| Q-Ops-Agent-Analytics-Summary | Build Scoped Metrics Query | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics?${pairs.join(\u0027\u0026\u0027)}`,\n |
| Q-Ops-Agent-Analytics-Summary | Fetch Current User Project Memberships | Supabase Table | qops_project_members |
| Q-Ops-Agent-Analytics-Summary | Fetch Current User Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| Q-Ops-Agent-Analytics-Summary | Fetch Q-Ops User Profile | Supabase Table | qops_users |
| Q-Ops-Agent-Analytics-Summary | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| Q-Ops-Agent-Analytics-Summary | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/analytics-summary |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/artifacts |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/audit-events |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/generated-documents |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/generate-qa-doc |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/health |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/integrations/ |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/integrations/status |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/integrations/test-all |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/job-status |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/job-status-retrieve |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/projects |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/settings |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | /webhook/upload-test-artifacts |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | http://127.0.0.1:5050\u0027 |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | http://127.0.0.1:8000\u0027 |
| Q-Ops-Agent-Health-Status | Check: ChromaDB | URL/Webhook | https://api.trychroma.com/api/v2/tenants/14e8907a-74b1-4590-b394-2b32e9e0b03f/databases/QA-Documents-Chunk/collections/qa-chunks-batches |
| Q-Ops-Agent-Health-Status | Check: FastAPI Image Extractor | URL/Webhook | http://127.0.0.1:8000/health |
| Q-Ops-Agent-Health-Status | Check: MD->DOCX Converter Service | URL/Webhook | http://127.0.0.1:5050/health |
| Q-Ops-Agent-Health-Status | Check: Supabase DB | Supabase Table | qa_job_metrics |
| Q-Ops-Agent-Health-Status | Check: Supabase DB | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| Q-Ops-Agent-Health-Status | Check: Supabase Storage | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/bucket/uploaded-project-docs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Check Existing Page | URL/Webhook | https://anujalhans1.atlassian.net/wiki/rest/api/content?spaceKey=TD\u0026title={{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Convert md -> DOCX & Confluence Format | URL/Webhook | http://127.0.0.1:5050/convert\u0027 |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Get Page Details | URL/Webhook | https://anujalhans1.atlassian.net/wiki/rest/api/content/{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Confluence Job Completed | Supabase Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Confluence Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Confluence Job Failed | Supabase Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Confluence Job Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Generator Agent Failed | Supabase Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Generator Agent Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: JIRA Job Completed | Supabase Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: JIRA Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Log: Job Started | Supabase Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Log: Job Started | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Quality Gate Failed | Supabase Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Quality Gate Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Quality Gate Passed | Supabase Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Quality Gate Passed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Update Confluence Job Completed | Supabase Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Update Confluence Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Mark Job Status as Completed | Supabase Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Mark Job Status as Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Search Epic in JIRA | URL/Webhook | https://anujalhans1.atlassian.net/rest/api/3/search/jql |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Search existence of Epics in JIRA | URL/Webhook | https://anujalhans1.atlassian.net/rest/api/3/search/jql |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Search Story in JIRA | URL/Webhook | https://anujalhans1.atlassian.net/rest/api/3/search/jql |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update existing Document on Confluence | URL/Webhook | https://anujalhans1.atlassian.net/wiki/rest/api/content/{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Completed | Supabase Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Completed1 | Supabase Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Completed1 | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Failed | Supabase Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Failed1 | Supabase Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Failed1 | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status: Generator Agent Failed | Supabase Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status: Generator Agent Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Upload Document on Confluence | URL/Webhook | https://anujalhans1.atlassian.net/wiki/rest/api/content |
| RETRIEVAL Job Queue Creator - SaaS - Attributed Draft | Fetch Q-Ops User Profile | Supabase Table | qops_users |
| RETRIEVAL Job Queue Creator - SaaS - Attributed Draft | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| RETRIEVAL Job Queue Creator - SaaS - Attributed Draft | Insert JobID into Supabase DB | Supabase Table | qa_jobs |
| RETRIEVAL Job Queue Creator - SaaS - Attributed Draft | Insert JobID into Supabase DB | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| RETRIEVAL Job Queue Creator - SaaS - Attributed Draft | LOG: Job Queued | Supabase Table | qa_job_metrics |
| RETRIEVAL Job Queue Creator - SaaS - Attributed Draft | LOG: Job Queued | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Job Queue Creator - SaaS - Attributed Draft | Resolve Runtime Config | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/qops_resolve_runtime_config |
| RETRIEVAL Job Queue Creator - SaaS - Attributed Draft | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft | Get Pending Jobs | Supabase Table | qa_jobs |
| RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft | Get Pending Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?status=eq.pending\u0026order=created_at.asc\u0026limit=1\u0026select=job_id,status,input,project_id,requested_by,settings_version,config_snapshot,created_at |
| RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft | Lock Pending Job picked for processing | Supabase Table | qa_jobs |
| RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft | Lock Pending Job picked for processing | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVE Workflow-status-check | Check Status | Supabase Table | qa_jobs |
| RETRIEVE Workflow-status-check | Check Status | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
