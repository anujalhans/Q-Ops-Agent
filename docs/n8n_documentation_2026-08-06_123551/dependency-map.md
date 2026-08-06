# n8n Dependency Map - 2026-08-06 12:35:51 +05:30

Inferred from node parameter JSON across published workflow backups. Review manually before using this as a security or architecture source of truth.

| Workflow | Node | Dependency Type | Value |
| --- | --- | --- | --- |
| DI - Catalog Read API | Fetch Catalog Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch Catalog Project Memberships | Supabase/Data Table | qops_project_members |
| DI - Catalog Read API | Fetch Catalog Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| DI - Catalog Read API | Fetch Catalog Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch Catalog Q-Ops User Profile | Supabase/Data Table | qops_users |
| DI - Catalog Read API | Fetch Catalog Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| DI - Catalog Read API | Fetch DI Catalog Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch DI Catalog Jobs | Supabase/Data Table | di_intelligence_jobs |
| DI - Catalog Read API | Fetch DI Catalog Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?select=job_id,status,job_type,project_id,input,output,error,created_at,updated_at\u0026order=updated_at.desc\u0026limit=200 |
| DI - Catalog Read API | Fetch DI Catalog Learnings | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch DI Catalog Learnings | Supabase/Data Table | di_organizational_learnings |
| DI - Catalog Read API | Fetch DI Catalog Learnings | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_organizational_learnings?select=id,title,category,source_project_id,learning_summary,impact_level,reusable_recommendation,visibility_level,source_ref,created_by_ai,created_at,updated_at\u0026order=updated_at.desc\u0026limit=300 |
| DI - Catalog Read API | Fetch DI Catalog Project Technologies | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch DI Catalog Project Technologies | Supabase/Data Table | di_project_technologies |
| DI - Catalog Read API | Fetch DI Catalog Project Technologies | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_project_technologies?select=id,project_id,technology_id,version,confidence_score,source_type,source_ref,created_at\u0026order=created_at.desc\u0026limit=500 |
| DI - Catalog Read API | Fetch DI Catalog Projects | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch DI Catalog Projects | Supabase/Data Table | qops_projects |
| DI - Catalog Read API | Fetch DI Catalog Projects | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?select=id,name,owner,status,updated_at\u0026limit=500 |
| DI - Catalog Read API | Fetch DI Catalog Recommendations | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch DI Catalog Recommendations | Supabase/Data Table | di_recommendations |
| DI - Catalog Read API | Fetch DI Catalog Recommendations | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?select=id,project_id,recommendation_type,title,summary,rationale,related_entity_type,related_entity_id,confidence_score,status,assigned_to,feedback,created_at,updated_at\u0026order=updated_at.desc\u0026limit=300 |
| DI - Catalog Read API | Fetch DI Catalog Relationships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch DI Catalog Relationships | Supabase/Data Table | di_knowledge_relationships |
| DI - Catalog Read API | Fetch DI Catalog Relationships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_knowledge_relationships?select=id,source_entity_type,source_entity_id,target_entity_type,target_entity_id,relationship_type,confidence_score,evidence,created_by_ai,visibility_level,created_at\u0026order=created_at.desc\u0026limit=500 |
| DI - Catalog Read API | Fetch DI Catalog Solution Assets | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch DI Catalog Solution Assets | Supabase/Data Table | di_solution_assets |
| DI - Catalog Read API | Fetch DI Catalog Solution Assets | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_assets?select=id,solution_id,asset_type,title,url,storage_path,description,visibility_level,created_at\u0026order=created_at.desc\u0026limit=500 |
| DI - Catalog Read API | Fetch DI Catalog Solution Technologies | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch DI Catalog Solution Technologies | Supabase/Data Table | di_solution_technologies |
| DI - Catalog Read API | Fetch DI Catalog Solution Technologies | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_technologies?select=id,solution_id,technology_id,created_at\u0026order=created_at.desc\u0026limit=500 |
| DI - Catalog Read API | Fetch DI Catalog Solutions | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch DI Catalog Solutions | Supabase/Data Table | di_reusable_solutions |
| DI - Catalog Read API | Fetch DI Catalog Solutions | Supabase/Data Table | qa_approach |
| DI - Catalog Read API | Fetch DI Catalog Solutions | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?select=id,title,slug,summary,problem_statement,implementation_approach,qa_approach,risk_factors,production_learnings,implementation_complexity,applicability_tags,visibility_level,owner_team,source_project_id,ai_summary,status,created_at,updated_at\u0026order=updated_at.desc\u0026limit=300 |
| DI - Catalog Read API | Fetch DI Catalog Technologies | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Catalog Read API | Fetch DI Catalog Technologies | Supabase/Data Table | di_technologies |
| DI - Catalog Read API | Fetch DI Catalog Technologies | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_technologies?select=id,name,normalized_name,category,description,vendor,tags,created_at,updated_at\u0026order=updated_at.desc\u0026limit=500 |
| DI - Catalog Read API | Map DI Catalog Response | Supabase/Data Table | qa_approach |
| DI - Catalog Read API | Sticky Note be5abd38 | URL/Webhook | /webhook/di/catalog |
| DI - Catalog Read API | Verify Catalog Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| DI - Cross Project Search API | Fetch DI Learnings For Search | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Cross Project Search API | Fetch DI Learnings For Search | Supabase/Data Table | di_organizational_learnings |
| DI - Cross Project Search API | Fetch DI Learnings For Search | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_organizational_learnings?select=id,title,category,source_project_id,learning_summary,impact_level,reusable_recommendation,visibility_level,created_at\u0026order=created_at.desc\u0026limit=200 |
| DI - Cross Project Search API | Fetch DI Recommendations For Search | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Cross Project Search API | Fetch DI Recommendations For Search | Supabase/Data Table | di_recommendations |
| DI - Cross Project Search API | Fetch DI Recommendations For Search | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?select=id,project_id,recommendation_type,title,summary,rationale,related_entity_type,related_entity_id,confidence_score,status,created_at\u0026order=created_at.desc\u0026limit=200 |
| DI - Cross Project Search API | Fetch DI Solutions For Search | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Cross Project Search API | Fetch DI Solutions For Search | Supabase/Data Table | di_reusable_solutions |
| DI - Cross Project Search API | Fetch DI Solutions For Search | Supabase/Data Table | qa_approach |
| DI - Cross Project Search API | Fetch DI Solutions For Search | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?select=id,title,slug,summary,problem_statement,implementation_approach,qa_approach,applicability_tags,visibility_level,source_project_id,status,updated_at\u0026order=updated_at.desc\u0026limit=200 |
| DI - Cross Project Search API | Fetch DI Technologies For Search | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Cross Project Search API | Fetch DI Technologies For Search | Supabase/Data Table | di_technologies |
| DI - Cross Project Search API | Fetch DI Technologies For Search | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_technologies?select=id,name,normalized_name,category,description,vendor,tags,updated_at\u0026order=updated_at.desc\u0026limit=300 |
| DI - Cross Project Search API | Fetch Search Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Cross Project Search API | Fetch Search Project Memberships | Supabase/Data Table | qops_project_members |
| DI - Cross Project Search API | Fetch Search Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| DI - Cross Project Search API | Fetch Search Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Cross Project Search API | Fetch Search Q-Ops User Profile | Supabase/Data Table | qops_users |
| DI - Cross Project Search API | Fetch Search Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| DI - Cross Project Search API | Sticky Note 31360674 | URL/Webhook | /webhook/di/search |
| DI - Cross Project Search API | Verify Search Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| DI - Insights API | Fetch DI Job Metrics | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Insights API | Fetch DI Job Metrics | Supabase/Data Table | di_job_metrics |
| DI - Insights API | Fetch DI Job Metrics | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_job_metrics?select=*\u0026order=updated_at.desc\u0026limit=200 |
| DI - Insights API | Fetch DI Onboarding Guides | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Insights API | Fetch DI Onboarding Guides | Supabase/Data Table | di_onboarding_guides |
| DI - Insights API | Fetch DI Onboarding Guides | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_onboarding_guides?select=*\u0026order=updated_at.desc\u0026limit=100 |
| DI - Insights API | Fetch DI Project Profiles | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Insights API | Fetch DI Project Profiles | Supabase/Data Table | di_project_profiles |
| DI - Insights API | Fetch DI Project Profiles | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_project_profiles?select=*\u0026order=updated_at.desc\u0026limit=100 |
| DI - Insights API | Fetch DI Recommendations Snapshot | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Insights API | Fetch DI Recommendations Snapshot | Supabase/Data Table | di_recommendations |
| DI - Insights API | Fetch DI Recommendations Snapshot | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?select=id,project_id,title,summary,recommendation_type,status,confidence_score,updated_at\u0026order=updated_at.desc\u0026limit=200 |
| DI - Insights API | Fetch DI Similarity Matches | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Insights API | Fetch DI Similarity Matches | Supabase/Data Table | di_similarity_matches |
| DI - Insights API | Fetch DI Similarity Matches | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_similarity_matches?select=*\u0026order=confidence_score.desc,updated_at.desc\u0026limit=200 |
| DI - Insights API | Fetch DI Solution Reviews | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Insights API | Fetch DI Solution Reviews | Supabase/Data Table | di_solution_reviews |
| DI - Insights API | Fetch DI Solution Reviews | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_reviews?select=*\u0026order=updated_at.desc\u0026limit=300 |
| DI - Insights API | Fetch DI Solutions For Governance | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Insights API | Fetch DI Solutions For Governance | Supabase/Data Table | di_reusable_solutions |
| DI - Insights API | Fetch DI Solutions For Governance | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?select=id,title,summary,implementation_complexity,visibility_level,status,source_project_id,updated_at\u0026order=updated_at.desc\u0026limit=200 |
| DI - Insights API | Fetch Insights Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Insights API | Fetch Insights Project Memberships | Supabase/Data Table | qops_project_members |
| DI - Insights API | Fetch Insights Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| DI - Insights API | Fetch Insights Projects | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Insights API | Fetch Insights Projects | Supabase/Data Table | qops_projects |
| DI - Insights API | Fetch Insights Projects | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?select=id,name,description,owner,module,release,status,tags,updated_at\u0026limit=500 |
| DI - Insights API | Fetch Insights Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Insights API | Fetch Insights Q-Ops User Profile | Supabase/Data Table | qops_users |
| DI - Insights API | Fetch Insights Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| DI - Insights API | Verify Insights Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| DI - Intelligence Queue Creator and Status API | Fetch DI Job Status | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Queue Creator and Status API | Fetch DI Job Status | Supabase/Data Table | di_intelligence_jobs |
| DI - Intelligence Queue Creator and Status API | Fetch DI Job Status | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{ |
| DI - Intelligence Queue Creator and Status API | Fetch Existing DI Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Queue Creator and Status API | Fetch Existing DI Job | Supabase/Data Table | di_intelligence_jobs |
| DI - Intelligence Queue Creator and Status API | Fetch Existing DI Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{ |
| DI - Intelligence Queue Creator and Status API | Fetch Queue Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Queue Creator and Status API | Fetch Queue Project Memberships | Supabase/Data Table | qops_project_members |
| DI - Intelligence Queue Creator and Status API | Fetch Queue Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| DI - Intelligence Queue Creator and Status API | Fetch Queue Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Queue Creator and Status API | Fetch Queue Q-Ops User Profile | Supabase/Data Table | qops_users |
| DI - Intelligence Queue Creator and Status API | Fetch Queue Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| DI - Intelligence Queue Creator and Status API | Fetch Status Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Queue Creator and Status API | Fetch Status Q-Ops User Profile | Supabase/Data Table | qops_users |
| DI - Intelligence Queue Creator and Status API | Fetch Status Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| DI - Intelligence Queue Creator and Status API | Insert DI Intelligence Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Queue Creator and Status API | Insert DI Intelligence Job | Supabase/Data Table | di_intelligence_jobs |
| DI - Intelligence Queue Creator and Status API | Insert DI Intelligence Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs |
| DI - Intelligence Queue Creator and Status API | Sticky Note 81492c41 | Supabase/Data Table | di_intelligence_jobs |
| DI - Intelligence Queue Creator and Status API | Sticky Note 81492c41 | URL/Webhook | /webhook/di/jobs |
| DI - Intelligence Queue Creator and Status API | Verify Queue Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| DI - Intelligence Queue Creator and Status API | Verify Status Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| DI - Intelligence Worker | Build DI Extraction Payload | Supabase/Data Table | qa_approach |
| DI - Intelligence Worker | Fetch DI Project Context | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Worker | Fetch DI Project Context | Supabase/Data Table | qops_projects |
| DI - Intelligence Worker | Fetch DI Project Context | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?id=eq.{{ |
| DI - Intelligence Worker | Fetch Read Only QA Context | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Worker | Fetch Read Only QA Context | Supabase/Data Table | qa_jobs |
| DI - Intelligence Worker | Fetch Read Only QA Context | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?project_id=eq.{{ |
| DI - Intelligence Worker | Get Pending DI Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Worker | Get Pending DI Jobs | Supabase/Data Table | di_intelligence_jobs |
| DI - Intelligence Worker | Get Pending DI Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs |
| DI - Intelligence Worker | Lock DI Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Worker | Lock DI Job | Supabase/Data Table | di_intelligence_jobs |
| DI - Intelligence Worker | Lock DI Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{ |
| DI - Intelligence Worker | Mark DI Job Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Worker | Mark DI Job Completed | Supabase/Data Table | di_intelligence_jobs |
| DI - Intelligence Worker | Mark DI Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{ |
| DI - Intelligence Worker | Mark DI Job Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Worker | Mark DI Job Failed | Supabase/Data Table | di_intelligence_jobs |
| DI - Intelligence Worker | Mark DI Job Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{ |
| DI - Intelligence Worker | Persist DI Extraction | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Intelligence Worker | Persist DI Extraction | Supabase/Data Table | di_persist_extraction |
| DI - Intelligence Worker | Persist DI Extraction | Supabase/Data Table | rpc/di_persist_extraction |
| DI - Intelligence Worker | Persist DI Extraction | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/di_persist_extraction |
| DI - Intelligence Worker | Sticky Note 0c4e72a9 | Supabase/Data Table | di_intelligence_jobs |
| DI - Intelligence Worker | Sticky Note 0c4e72a9 | Supabase/Data Table | di_persist_extraction |
| DI - Intelligence Worker | Sticky Note 0c4e72a9 | Supabase/Data Table | qa_jobs |
| DI - Recommendation Feedback API | Fetch DI Recommendation For Feedback | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Recommendation Feedback API | Fetch DI Recommendation For Feedback | Supabase/Data Table | di_recommendations |
| DI - Recommendation Feedback API | Fetch DI Recommendation For Feedback | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?id=eq.{{ |
| DI - Recommendation Feedback API | Fetch Feedback Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Recommendation Feedback API | Fetch Feedback Project Memberships | Supabase/Data Table | qops_project_members |
| DI - Recommendation Feedback API | Fetch Feedback Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| DI - Recommendation Feedback API | Fetch Feedback Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Recommendation Feedback API | Fetch Feedback Q-Ops User Profile | Supabase/Data Table | qops_users |
| DI - Recommendation Feedback API | Fetch Feedback Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| DI - Recommendation Feedback API | Insert DI Feedback Audit Event | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Recommendation Feedback API | Insert DI Feedback Audit Event | Supabase/Data Table | qops_audit_events |
| DI - Recommendation Feedback API | Insert DI Feedback Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| DI - Recommendation Feedback API | Sticky Note 4c0fce28 | Supabase/Data Table | di_recommendations |
| DI - Recommendation Feedback API | Sticky Note 4c0fce28 | Supabase/Data Table | qops_audit_events |
| DI - Recommendation Feedback API | Sticky Note 4c0fce28 | URL/Webhook | /webhook/di/recommendations/feedback |
| DI - Recommendation Feedback API | Update DI Recommendation Feedback | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Recommendation Feedback API | Update DI Recommendation Feedback | Supabase/Data Table | di_recommendations |
| DI - Recommendation Feedback API | Update DI Recommendation Feedback | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?id=eq.{{ |
| DI - Recommendation Feedback API | Verify Feedback Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| DI - Solution Review API | Fetch DI Solution For Review | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Solution Review API | Fetch DI Solution For Review | Supabase/Data Table | di_reusable_solutions |
| DI - Solution Review API | Fetch DI Solution For Review | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?id=eq.{{ |
| DI - Solution Review API | Fetch Review Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Solution Review API | Fetch Review Project Memberships | Supabase/Data Table | qops_project_members |
| DI - Solution Review API | Fetch Review Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| DI - Solution Review API | Fetch Review Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Solution Review API | Fetch Review Q-Ops User Profile | Supabase/Data Table | qops_users |
| DI - Solution Review API | Fetch Review Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| DI - Solution Review API | Insert DI Solution Review | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Solution Review API | Insert DI Solution Review | Supabase/Data Table | di_solution_reviews |
| DI - Solution Review API | Insert DI Solution Review | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_reviews |
| DI - Solution Review API | Insert DI Solution Review Audit | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Solution Review API | Insert DI Solution Review Audit | Supabase/Data Table | qops_audit_events |
| DI - Solution Review API | Insert DI Solution Review Audit | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| DI - Solution Review API | Update DI Solution Status | Credential Reference | httpCustomAuth: supabase-service-role-key |
| DI - Solution Review API | Update DI Solution Status | Supabase/Data Table | di_reusable_solutions |
| DI - Solution Review API | Update DI Solution Status | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?id=eq.{{ |
| DI - Solution Review API | Verify Review Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| INGEST API Queue Creator - SaaS - Attributed Draft | Build File URL Map | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/public/uploaded-project-docs/${storageProjectSegment}/${jobId}/${encodedFileName}`;\n}\nreturn |
| INGEST API Queue Creator - SaaS - Attributed Draft | Fetch Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| INGEST API Queue Creator - SaaS - Attributed Draft | Fetch Q-Ops User Profile | Supabase/Data Table | qops_users |
| INGEST API Queue Creator - SaaS - Attributed Draft | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| INGEST API Queue Creator - SaaS - Attributed Draft | Insert JobID into Supabase DB | Credential Reference | httpCustomAuth: supabase-service-role-key |
| INGEST API Queue Creator - SaaS - Attributed Draft | Insert JobID into Supabase DB | Supabase/Data Table | doc_ingestion_jobs |
| INGEST API Queue Creator - SaaS - Attributed Draft | Insert JobID into Supabase DB | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| INGEST API Queue Creator - SaaS - Attributed Draft | LOG: Job Queued | Credential Reference | httpCustomAuth: supabase-service-role-key |
| INGEST API Queue Creator - SaaS - Attributed Draft | LOG: Job Queued | Supabase/Data Table | qa_job_metrics |
| INGEST API Queue Creator - SaaS - Attributed Draft | LOG: Job Queued | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| INGEST API Queue Creator - SaaS - Attributed Draft | Resolve Runtime Config | Credential Reference | httpCustomAuth: supabase-service-role-key |
| INGEST API Queue Creator - SaaS - Attributed Draft | Resolve Runtime Config | Supabase/Data Table | qops_resolve_runtime_config |
| INGEST API Queue Creator - SaaS - Attributed Draft | Resolve Runtime Config | Supabase/Data Table | rpc/qops_resolve_runtime_config |
| INGEST API Queue Creator - SaaS - Attributed Draft | Resolve Runtime Config | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/qops_resolve_runtime_config |
| INGEST API Queue Creator - SaaS - Attributed Draft | Store LOGS in Supabase | Credential Reference | httpCustomAuth: supabase-anon-key |
| INGEST API Queue Creator - SaaS - Attributed Draft | Store LOGS in Supabase | Supabase/Data Table | doc_ingestion_queuecreator_logs |
| INGEST API Queue Creator - SaaS - Attributed Draft | Store LOGS in Supabase | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs |
| INGEST API Queue Creator - SaaS - Attributed Draft | Upload Files to Supabase Storage | Credential Reference | httpCustomAuth: supabase-service-role-key |
| INGEST API Queue Creator - SaaS - Attributed Draft | Upload Files to Supabase Storage | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/uploaded-project-docs/{{ |
| INGEST API Queue Creator - SaaS - Attributed Draft | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Download Files (Convert URL â†’ Binary) | Credential Reference | httpCustomAuth: supabase-service-role-key |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Get Pending Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Get Pending Jobs | Supabase/Data Table | doc_ingestion_jobs |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Get Pending Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?status=eq.pending\u0026order=created_at.asc\u0026limit=1\u0026select=job_id,status,input,project_id,requested_by,settings_version,config_snapshot,created_at |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Lock Pending Job picked for processing | Credential Reference | httpCustomAuth: supabase-service-role-key |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Lock Pending Job picked for processing | Supabase/Data Table | doc_ingestion_jobs |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Lock Pending Job picked for processing | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Mark Ingestion Job Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Mark Ingestion Job Failed | Supabase/Data Table | doc_ingestion_jobs |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Mark Ingestion Job Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Store LOGS in Supabase | Credential Reference | httpCustomAuth: supabase-service-role-key |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Store LOGS in Supabase | Supabase/Data Table | doc_ingestion_queuecreator_logs |
| INGEST Worker Engine (Queue Processor) - Attributed Draft | Store LOGS in Supabase | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs?job_id=eq.{{ |
| INGEST Workflow-Status-Check | Check Status | Supabase/Data Table | doc_ingestion_jobs |
| INGEST Workflow-Status-Check | Check Status | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Chroma Vector Store | Credential Reference | chromaCloudApi: ChromaDB Self-Hosted account |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Embeddings OpenAI | Credential Reference | openAiApi: OpenAi Paid Account (Aonu) |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Extract Text + Image | URL/Webhook | http://127.0.0.1:8001/process-document-v2\u0027 |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | LOG: Job Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | LOG: Job Completed | Supabase/Data Table | qa_job_metrics |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | LOG: Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Store Ingestion Audit Event | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Store Ingestion Audit Event | Supabase/Data Table | qops_audit_events |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Store Ingestion Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Store LOGS in Supabase | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Store LOGS in Supabase | Supabase/Data Table | doc_ingestion_queuecreator_logs |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Store LOGS in Supabase | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs?on_conflict=job_id |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Update Job Status as Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Update Job Status as Completed | Supabase/Data Table | doc_ingestion_jobs |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Update Job Status as Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Update Job Status as Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Update Job Status as Failed | Supabase/Data Table | doc_ingestion_jobs |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Update Job Status as Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Update Project Status as Ready | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Update Project Status as Ready | Supabase/Data Table | qops_projects |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Update Project Status as Ready | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?id=eq.{{ |
| Multimodal Knowledge Ingestion & Vectorization Engine - In Progress | Vision Extraction | Credential Reference | openAiApi: OpenAi Paid Account (Aonu) |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Build Live Update Snapshot Request | URL/Webhook | https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Build Live Update Snapshot Request | URL/Webhook | https://anujalhans1.atlassian.net\u0027).replace(/\\/$/, |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Check Chroma Retrieval Quality | Supabase/Data Table | qa_document |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Create Confluence Page | Credential Reference | httpBasicAuth: JIRA |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Create Missing Epic in Jira | Credential Reference | httpBasicAuth: JIRA |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Create Missing Story Linked to Epic | Credential Reference | httpBasicAuth: JIRA |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Embeddings OpenAI | Credential Reference | openAiApi: OpenAi Paid Account (Aonu) |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Normalize Team Managed Request | Supabase/Data Table | qa_document |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Normalize Team Managed Request | URL/Webhook | https://anujalhans1.atlassian.net/wiki\u0027),\n |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Normalize Team Managed Request | URL/Webhook | https://anujalhans1.atlassian.net\u0027),\n |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | OpenAI Chat Model | Credential Reference | openAiApi: OpenAi Paid Account (Aonu) |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Preflight Project Knowledge Search | Credential Reference | chromaCloudApi: ChromaDB Self-Hosted account |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Project Knowledge Vector Search | Credential Reference | chromaCloudApi: ChromaDB Self-Hosted account |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Search Existing Confluence Page | Credential Reference | httpBasicAuth: JIRA |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Search Existing Epic in Jira | Credential Reference | httpBasicAuth: JIRA |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Search Existing Story in Jira | Credential Reference | httpBasicAuth: JIRA |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Search Live Confluence Backlog | Credential Reference | httpBasicAuth: JIRA |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Search Live Confluence Backlog | URL/Webhook | https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Search Live Jira Backlog | Credential Reference | httpBasicAuth: JIRA |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Search Live Jira Backlog | URL/Webhook | https://anujalhans1.atlassian.net\u0027).replace(/\\/$/, |
| PRO QA Backlog, Jira & Confluence Generator - Team Managed Ready | Update Existing Confluence Page | Credential Reference | httpBasicAuth: JIRA |
| PRO QA Generation Queue Creator - Ready Draft | Build RTM Traceability Context | Supabase/Data Table | qa_story_testcase_links |
| PRO QA Generation Queue Creator - Ready Draft | Fetch Active Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | Fetch Active Q-Ops User Profile | Supabase/Data Table | qops_users |
| PRO QA Generation Queue Creator - Ready Draft | Fetch Active Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| PRO QA Generation Queue Creator - Ready Draft | Fetch Retry Source QA Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | Fetch Retry Source QA Job | Supabase/Data Table | qa_jobs |
| PRO QA Generation Queue Creator - Ready Draft | Fetch Retry Source QA Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?project_id=eq.{{ |
| PRO QA Generation Queue Creator - Ready Draft | Fetch RTM Completed Ingestion Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | Fetch RTM Completed Ingestion Jobs | Supabase/Data Table | doc_ingestion_jobs |
| PRO QA Generation Queue Creator - Ready Draft | Fetch RTM Completed Ingestion Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?project_id=eq.{{ |
| PRO QA Generation Queue Creator - Ready Draft | Fetch RTM Prerequisite Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | Fetch RTM Prerequisite Jobs | Supabase/Data Table | qa_jobs |
| PRO QA Generation Queue Creator - Ready Draft | Fetch RTM Prerequisite Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?project_id=eq.{{ |
| PRO QA Generation Queue Creator - Ready Draft | Fetch RTM Story Testcase Links | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | Fetch RTM Story Testcase Links | Supabase/Data Table | qa_story_testcase_links |
| PRO QA Generation Queue Creator - Ready Draft | Fetch RTM Story Testcase Links | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links?project_id=eq.{{ |
| PRO QA Generation Queue Creator - Ready Draft | LOG: Professional Job Queued | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | LOG: Professional Job Queued | Supabase/Data Table | qa_job_metrics |
| PRO QA Generation Queue Creator - Ready Draft | LOG: Professional Job Queued | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Generation Queue Creator - Ready Draft | Mark RTM Preparing Job Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | Mark RTM Preparing Job Failed | Supabase/Data Table | qa_jobs |
| PRO QA Generation Queue Creator - Ready Draft | Mark RTM Preparing Job Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Generation Queue Creator - Ready Draft | Persist Professional Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | Persist Professional Job | Supabase/Data Table | qa_jobs |
| PRO QA Generation Queue Creator - Ready Draft | Persist Professional Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| PRO QA Generation Queue Creator - Ready Draft | Persist RTM Preparing Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | Persist RTM Preparing Job | Supabase/Data Table | qa_jobs |
| PRO QA Generation Queue Creator - Ready Draft | Persist RTM Preparing Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| PRO QA Generation Queue Creator - Ready Draft | Promote RTM Preparing Job to Pending | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | Promote RTM Preparing Job to Pending | Supabase/Data Table | qa_jobs |
| PRO QA Generation Queue Creator - Ready Draft | Promote RTM Preparing Job to Pending | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Generation Queue Creator - Ready Draft | Resolve Runtime Config | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Creator - Ready Draft | Resolve Runtime Config | Supabase/Data Table | qops_resolve_runtime_config |
| PRO QA Generation Queue Creator - Ready Draft | Resolve Runtime Config | Supabase/Data Table | rpc/qops_resolve_runtime_config |
| PRO QA Generation Queue Creator - Ready Draft | Resolve Runtime Config | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/qops_resolve_runtime_config |
| PRO QA Generation Queue Creator - Ready Draft | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| PRO QA Generation Queue Worker - Ready Draft | Get Pending Professional Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Worker - Ready Draft | Get Pending Professional Jobs | Supabase/Data Table | qa_jobs |
| PRO QA Generation Queue Worker - Ready Draft | Get Pending Professional Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| PRO QA Generation Queue Worker - Ready Draft | Lock Professional Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Worker - Ready Draft | Lock Professional Job | Supabase/Data Table | qa_jobs |
| PRO QA Generation Queue Worker - Ready Draft | Lock Professional Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Backlog Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Backlog Completed | Supabase/Data Table | qa_job_metrics |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Backlog Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Backlog Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Backlog Failed | Supabase/Data Table | qa_job_metrics |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Backlog Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Job Started | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Job Started | Supabase/Data Table | qa_job_metrics |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Job Started | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Quality Gate Passed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Quality Gate Passed | Supabase/Data Table | qa_job_metrics |
| PRO QA Generation Queue Worker - Ready Draft | LOG: Professional Quality Gate Passed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Generation Queue Worker - Ready Draft | Mark Professional Backlog Job Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Worker - Ready Draft | Mark Professional Backlog Job Completed | Supabase/Data Table | qa_jobs |
| PRO QA Generation Queue Worker - Ready Draft | Mark Professional Backlog Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Generation Queue Worker - Ready Draft | Mark Professional Backlog Job Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Generation Queue Worker - Ready Draft | Mark Professional Backlog Job Failed | Supabase/Data Table | qa_jobs |
| PRO QA Generation Queue Worker - Ready Draft | Mark Professional Backlog Job Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Jira Story Test Case Generator | Create Jira Test Case | Credential Reference | jiraSoftwareCloudApi: Jira SW Cloud account |
| PRO QA Jira Story Test Case Generator | Fetch Completed User Story Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Fetch Completed User Story Jobs | Supabase/Data Table | qa_jobs |
| PRO QA Jira Story Test Case Generator | Fetch Completed User Story Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| PRO QA Jira Story Test Case Generator | Fetch Existing Test Case Story Links | Credential Reference | jiraSoftwareCloudApi: Jira SW Cloud account |
| PRO QA Jira Story Test Case Generator | Fetch Jira Story Issue | Credential Reference | jiraSoftwareCloudApi: Jira SW Cloud account |
| PRO QA Jira Story Test Case Generator | Fetch Published Story Test Case Links | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Fetch Published Story Test Case Links | Supabase/Data Table | qa_story_testcase_links |
| PRO QA Jira Story Test Case Generator | Fetch Published Story Test Case Links | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links |
| PRO QA Jira Story Test Case Generator | Link Created Test Case To Story | Credential Reference | jiraSoftwareCloudApi: Jira SW Cloud account |
| PRO QA Jira Story Test Case Generator | LOG: Direct Story Test Case Job Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | LOG: Direct Story Test Case Job Completed | Supabase/Data Table | qa_job_metrics |
| PRO QA Jira Story Test Case Generator | LOG: Direct Story Test Case Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Jira Story Test Case Generator | Mark Direct Story Test Case Job Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Mark Direct Story Test Case Job Completed | Supabase/Data Table | qa_jobs |
| PRO QA Jira Story Test Case Generator | Mark Direct Story Test Case Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Jira Story Test Case Generator | Normalize Story Test Case Request | URL/Webhook | https://anujalhans1.atlassian.net\u0027),\n |
| PRO QA Jira Story Test Case Generator | OpenAI Chat Model - Batch | Credential Reference | openAiApi: OpenAi Paid Account (Aonu) |
| PRO QA Jira Story Test Case Generator | OpenAI Chat Model - Batch Retry | Credential Reference | openAiApi: OpenAi Paid Account (Aonu) |
| PRO QA Jira Story Test Case Generator | OpenAI Chat Model | Credential Reference | openAiApi: OpenAi Paid Account (Aonu) |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Finalizing Coverage | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Finalizing Coverage | Supabase/Data Table | qa_jobs |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Finalizing Coverage | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Generating Test Cases | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Generating Test Cases | Supabase/Data Table | qa_jobs |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Generating Test Cases | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Linking Traceability | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Linking Traceability | Supabase/Data Table | qa_jobs |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Linking Traceability | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Planning Coverage | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Planning Coverage | Supabase/Data Table | qa_jobs |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Planning Coverage | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Planning Scope | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Planning Scope | Supabase/Data Table | qa_jobs |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Planning Scope | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Updating Existing Jira | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Updating Existing Jira | Supabase/Data Table | qa_jobs |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Progress - Updating Existing Jira | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Usage Checkpoint | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Usage Checkpoint | Supabase/Data Table | qa_jobs |
| PRO QA Jira Story Test Case Generator | Persist Story Test Case Usage Checkpoint | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Jira Story Test Case Generator | Repair Direct Story Test Case Completion Metric Attribution | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Repair Direct Story Test Case Completion Metric Attribution | Supabase/Data Table | qa_job_metrics |
| PRO QA Jira Story Test Case Generator | Repair Direct Story Test Case Completion Metric Attribution | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics?job_id=eq.{{ |
| PRO QA Jira Story Test Case Generator | Search Existing Test Case By Stable Label | Credential Reference | jiraSoftwareCloudApi: Jira SW Cloud account |
| PRO QA Jira Story Test Case Generator | Update Existing Jira Test Case | Credential Reference | jiraSoftwareCloudApi: Jira SW Cloud account |
| PRO QA Jira Story Test Case Generator | Upsert Story Test Case Mapping | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Upsert Story Test Case Mapping | Supabase/Data Table | qa_story_testcase_links |
| PRO QA Jira Story Test Case Generator | Upsert Story Test Case Mapping | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links?on_conflict=story_jira_key,testcase_jira_key |
| PRO QA Jira Story Test Case Generator | Upsert Story Test Case Publish Checkpoint | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Jira Story Test Case Generator | Upsert Story Test Case Publish Checkpoint | Supabase/Data Table | qa_story_testcase_links |
| PRO QA Jira Story Test Case Generator | Upsert Story Test Case Publish Checkpoint | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links?on_conflict=story_jira_key,testcase_jira_key |
| PRO QA Story Test Cases Queue Creator | Fetch Active Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Queue Creator | Fetch Active Q-Ops User Profile | Supabase/Data Table | qops_users |
| PRO QA Story Test Cases Queue Creator | Fetch Active Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| PRO QA Story Test Cases Queue Creator | LOG: Story Test Case Job Queued | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Queue Creator | LOG: Story Test Case Job Queued | Supabase/Data Table | qa_job_metrics |
| PRO QA Story Test Cases Queue Creator | LOG: Story Test Case Job Queued | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Story Test Cases Queue Creator | Persist Story Test Case Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Queue Creator | Persist Story Test Case Job | Supabase/Data Table | qa_jobs |
| PRO QA Story Test Cases Queue Creator | Persist Story Test Case Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| PRO QA Story Test Cases Queue Creator | Resolve Runtime Config | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Queue Creator | Resolve Runtime Config | Supabase/Data Table | qops_resolve_runtime_config |
| PRO QA Story Test Cases Queue Creator | Resolve Runtime Config | Supabase/Data Table | rpc/qops_resolve_runtime_config |
| PRO QA Story Test Cases Queue Creator | Resolve Runtime Config | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/qops_resolve_runtime_config |
| PRO QA Story Test Cases Queue Creator | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| PRO QA Story Test Cases Worker | Fetch Story Test Case Usage Checkpoint | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | Fetch Story Test Case Usage Checkpoint | Supabase/Data Table | qa_jobs |
| PRO QA Story Test Cases Worker | Fetch Story Test Case Usage Checkpoint | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Story Test Cases Worker | Get Pending Story Test Case Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | Get Pending Story Test Case Jobs | Supabase/Data Table | qa_jobs |
| PRO QA Story Test Cases Worker | Get Pending Story Test Case Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| PRO QA Story Test Cases Worker | Get Stale Story Test Case Processing Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | Get Stale Story Test Case Processing Jobs | Supabase/Data Table | qa_jobs |
| PRO QA Story Test Cases Worker | Get Stale Story Test Case Processing Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| PRO QA Story Test Cases Worker | Lock Story Test Case Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | Lock Story Test Case Job | Supabase/Data Table | qa_jobs |
| PRO QA Story Test Cases Worker | Lock Story Test Case Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Story Test Cases Worker | LOG: Stale Story Test Case Job Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | LOG: Stale Story Test Case Job Failed | Supabase/Data Table | qa_job_metrics |
| PRO QA Story Test Cases Worker | LOG: Stale Story Test Case Job Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Story Test Cases Worker | LOG: Story Test Case Job Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | LOG: Story Test Case Job Completed | Supabase/Data Table | qa_job_metrics |
| PRO QA Story Test Cases Worker | LOG: Story Test Case Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Story Test Cases Worker | LOG: Story Test Case Job Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | LOG: Story Test Case Job Failed | Supabase/Data Table | qa_job_metrics |
| PRO QA Story Test Cases Worker | LOG: Story Test Case Job Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Story Test Cases Worker | LOG: Story Test Case Job Started | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | LOG: Story Test Case Job Started | Supabase/Data Table | qa_job_metrics |
| PRO QA Story Test Cases Worker | LOG: Story Test Case Job Started | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| PRO QA Story Test Cases Worker | Mark Stale Story Test Case Job Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | Mark Stale Story Test Case Job Failed | Supabase/Data Table | qa_jobs |
| PRO QA Story Test Cases Worker | Mark Stale Story Test Case Job Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Story Test Cases Worker | Mark Story Test Case Job Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | Mark Story Test Case Job Completed | Supabase/Data Table | qa_jobs |
| PRO QA Story Test Cases Worker | Mark Story Test Case Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| PRO QA Story Test Cases Worker | Mark Story Test Case Job Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| PRO QA Story Test Cases Worker | Mark Story Test Case Job Failed | Supabase/Data Table | qa_jobs |
| PRO QA Story Test Cases Worker | Mark Story Test Case Job Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| Q-Ops Agent Artifact Reprocess API | Fetch Current User Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Artifact Reprocess API | Fetch Current User Project Memberships | Supabase/Data Table | qops_project_members |
| Q-Ops Agent Artifact Reprocess API | Fetch Current User Project Memberships | Supabase/Data Table | qops_projects |
| Q-Ops Agent Artifact Reprocess API | Fetch Current User Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent Artifact Reprocess API | Fetch Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Artifact Reprocess API | Fetch Q-Ops User Profile | Supabase/Data Table | qops_users |
| Q-Ops Agent Artifact Reprocess API | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Artifact Reprocess API | Fetch Reprocess Source Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Artifact Reprocess API | Fetch Reprocess Source Job | Supabase/Data Table | doc_ingestion_jobs |
| Q-Ops Agent Artifact Reprocess API | Fetch Reprocess Source Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| Q-Ops Agent Artifact Reprocess API | Insert Reprocess Ingestion Job | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Artifact Reprocess API | Insert Reprocess Ingestion Job | Supabase/Data Table | doc_ingestion_jobs |
| Q-Ops Agent Artifact Reprocess API | Insert Reprocess Ingestion Job | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| Q-Ops Agent Artifact Reprocess API | Insert Reprocess Metric | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Artifact Reprocess API | Insert Reprocess Metric | Supabase/Data Table | qa_job_metrics |
| Q-Ops Agent Artifact Reprocess API | Insert Reprocess Metric | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| Q-Ops Agent Artifact Reprocess API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Artifacts API | Fetch Ingestion Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Artifacts API | Fetch Ingestion Jobs | Supabase/Data Table | doc_ingestion_jobs |
| Q-Ops Agent Artifacts API | Fetch Ingestion Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| Q-Ops Agent Audit Events API | Fetch Current User Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Audit Events API | Fetch Current User Project Memberships | Supabase/Data Table | qops_project_members |
| Q-Ops Agent Audit Events API | Fetch Current User Project Memberships | Supabase/Data Table | qops_projects |
| Q-Ops Agent Audit Events API | Fetch Current User Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent Audit Events API | Fetch QA Job Metrics For Audit | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Audit Events API | Fetch QA Job Metrics For Audit | Supabase/Data Table | qa_job_metrics |
| Q-Ops Agent Audit Events API | Fetch QA Job Metrics For Audit | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| Q-Ops Agent Audit Events API | Fetch Q-Ops Audit Events | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Audit Events API | Fetch Q-Ops Audit Events | Supabase/Data Table | qops_audit_events |
| Q-Ops Agent Audit Events API | Fetch Q-Ops Audit Events | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent Audit Events API | Fetch Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Audit Events API | Fetch Q-Ops User Profile | Supabase/Data Table | qops_users |
| Q-Ops Agent Audit Events API | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Audit Events API | Map Audit Events Response | Supabase/Data Table | qops_projects |
| Q-Ops Agent Audit Events API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Auth Me API | Fetch Current User Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Auth Me API | Fetch Current User Project Memberships | Supabase/Data Table | qops_project_members |
| Q-Ops Agent Auth Me API | Fetch Current User Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent Auth Me API | Fetch Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Auth Me API | Fetch Q-Ops User Profile | Supabase/Data Table | qops_users |
| Q-Ops Agent Auth Me API | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Auth Me API | Map Current User Response | Supabase/Data Table | qops_users |
| Q-Ops Agent Auth Me API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Generated Documents API | Fetch QA Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Generated Documents API | Fetch QA Jobs | Supabase/Data Table | qa_jobs |
| Q-Ops Agent Generated Documents API | Fetch QA Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| Q-Ops Agent Infrastructure Load API | Fetch Connection Results | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Infrastructure Load API | Fetch Connection Results | Supabase/Data Table | qops_connection_test_results |
| Q-Ops Agent Infrastructure Load API | Fetch Connection Results | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results |
| Q-Ops Agent Infrastructure Load API | Fetch Current User Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Infrastructure Load API | Fetch Current User Project Memberships | Supabase/Data Table | qops_project_members |
| Q-Ops Agent Infrastructure Load API | Fetch Current User Project Memberships | Supabase/Data Table | qops_projects |
| Q-Ops Agent Infrastructure Load API | Fetch Current User Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent Infrastructure Load API | Fetch Generation Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Infrastructure Load API | Fetch Generation Jobs | Supabase/Data Table | qa_jobs |
| Q-Ops Agent Infrastructure Load API | Fetch Generation Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |
| Q-Ops Agent Infrastructure Load API | Fetch Ingestion Jobs | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Infrastructure Load API | Fetch Ingestion Jobs | Supabase/Data Table | doc_ingestion_jobs |
| Q-Ops Agent Infrastructure Load API | Fetch Ingestion Jobs | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs |
| Q-Ops Agent Infrastructure Load API | Fetch Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Infrastructure Load API | Fetch Q-Ops User Profile | Supabase/Data Table | qops_users |
| Q-Ops Agent Infrastructure Load API | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Infrastructure Load API | Fetch Recent Metrics | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Infrastructure Load API | Fetch Recent Metrics | Supabase/Data Table | qa_job_metrics |
| Q-Ops Agent Infrastructure Load API | Fetch Recent Metrics | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| Q-Ops Agent Infrastructure Load API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Integration Test API | Fetch Integration For Test | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Integration Test API | Fetch Integration For Test | Supabase/Data Table | qops_integration_settings |
| Q-Ops Agent Integration Test API | Fetch Integration For Test | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings |
| Q-Ops Agent Integration Test API | Fetch Live Health Snapshot | URL/Webhook | http://localhost:5678/webhook/health |
| Q-Ops Agent Integration Test API | Insert Connection Test Result | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Integration Test API | Insert Connection Test Result | Supabase/Data Table | qops_connection_test_results |
| Q-Ops Agent Integration Test API | Insert Connection Test Result | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results |
| Q-Ops Agent Integration Test API | Patch Integration Test Metadata | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Integration Test API | Patch Integration Test Metadata | Supabase/Data Table | qops_integration_settings |
| Q-Ops Agent Integration Test API | Patch Integration Test Metadata | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings?environment_key=eq.\ |
| Q-Ops Agent Integrations Status API | Fetch Integrations | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Integrations Status API | Fetch Integrations | Supabase/Data Table | qops_integration_settings |
| Q-Ops Agent Integrations Status API | Fetch Integrations | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings |
| Q-Ops Agent Integrations Status API | Fetch Recent Test Results | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Integrations Status API | Fetch Recent Test Results | Supabase/Data Table | qops_connection_test_results |
| Q-Ops Agent Integrations Status API | Fetch Recent Test Results | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results |
| Q-Ops Agent Integrations Test All API | Fetch Integrations For Test All | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Integrations Test All API | Fetch Integrations For Test All | Supabase/Data Table | qops_integration_settings |
| Q-Ops Agent Integrations Test All API | Fetch Integrations For Test All | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings |
| Q-Ops Agent Integrations Test All API | Fetch Live Health Snapshot | URL/Webhook | http://localhost:5678/webhook/health |
| Q-Ops Agent Integrations Test All API | Insert All Connection Test Results | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Integrations Test All API | Insert All Connection Test Results | Supabase/Data Table | qops_connection_test_results |
| Q-Ops Agent Integrations Test All API | Insert All Connection Test Results | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results |
| Q-Ops Agent Projects API - Wired | Fetch Projects | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Projects API - Wired | Fetch Projects | Supabase/Data Table | qops_projects |
| Q-Ops Agent Projects API - Wired | Fetch Projects | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects |
| Q-Ops Agent Projects API - Wired | Fetch Projects For Upsert | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Projects API - Wired | Fetch Projects For Upsert | Supabase/Data Table | qops_projects |
| Q-Ops Agent Projects API - Wired | Fetch Projects For Upsert | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects |
| Q-Ops Agent Projects API - Wired | Insert Project Audit Event | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Projects API - Wired | Insert Project Audit Event | Supabase/Data Table | qops_audit_events |
| Q-Ops Agent Projects API - Wired | Insert Project Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent Projects API - Wired | Prepare Project Upsert | Supabase/Data Table | qops_projects |
| Q-Ops Agent Projects API - Wired | Prepare Project Upsert | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1\u0027; |
| Q-Ops Agent Projects API - Wired | Upsert Project | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings API | Fetch Current Settings Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings API | Fetch Current Settings Project Memberships | Supabase/Data Table | qops_project_members |
| Q-Ops Agent Settings API | Fetch Current Settings Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| Q-Ops Agent Settings API | Fetch Current Settings User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings API | Fetch Current Settings User Profile | Supabase/Data Table | qops_users |
| Q-Ops Agent Settings API | Fetch Current Settings User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| Q-Ops Agent Settings API | Fetch Environment Settings | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings API | Fetch Environment Settings | Supabase/Data Table | qops_environment_settings |
| Q-Ops Agent Settings API | Fetch Environment Settings | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_environment_settings |
| Q-Ops Agent Settings API | Fetch Integration Settings | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings API | Fetch Integration Settings | Supabase/Data Table | qops_integration_settings |
| Q-Ops Agent Settings API | Fetch Integration Settings | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings |
| Q-Ops Agent Settings API | Fetch Latest Connection Results | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings API | Fetch Latest Connection Results | Supabase/Data Table | qops_connection_test_results |
| Q-Ops Agent Settings API | Fetch Latest Connection Results | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results |
| Q-Ops Agent Settings API | Fetch Project Integration Overrides | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings API | Fetch Project Integration Overrides | Supabase/Data Table | qops_project_integration_overrides |
| Q-Ops Agent Settings API | Fetch Project Integration Overrides | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_integration_overrides |
| Q-Ops Agent Settings API | Fetch User Integration Settings | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings API | Fetch User Integration Settings | Supabase/Data Table | qops_user_integration_settings |
| Q-Ops Agent Settings API | Fetch User Integration Settings | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_user_integration_settings?user_id=eq.{{ |
| Q-Ops Agent Settings API | Verify Settings Read Supabase User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Settings Write API | Fetch Settings Write Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings Write API | Fetch Settings Write Project Memberships | Supabase/Data Table | qops_project_members |
| Q-Ops Agent Settings Write API | Fetch Settings Write Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| Q-Ops Agent Settings Write API | Fetch Settings Write User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings Write API | Fetch Settings Write User Profile | Supabase/Data Table | qops_users |
| Q-Ops Agent Settings Write API | Fetch Settings Write User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| Q-Ops Agent Settings Write API | Insert Settings Audit Event | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings Write API | Insert Settings Audit Event | Supabase/Data Table | qops_audit_events |
| Q-Ops Agent Settings Write API | Insert Settings Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent Settings Write API | Patch Settings Row | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Settings Write API | Prepare Settings Patch | Supabase/Data Table | qops_environment_settings |
| Q-Ops Agent Settings Write API | Prepare Settings Patch | Supabase/Data Table | qops_integration_settings |
| Q-Ops Agent Settings Write API | Prepare Settings Patch | Supabase/Data Table | qops_project_integration_overrides |
| Q-Ops Agent Settings Write API | Prepare Settings Patch | Supabase/Data Table | qops_user_integration_settings |
| Q-Ops Agent Settings Write API | Prepare Settings Patch | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1\u0027;\nconst |
| Q-Ops Agent Settings Write API | Verify Settings Write Supabase User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent User Accept Invite API | Activate Q-Ops User | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Accept Invite API | Activate Q-Ops User | Supabase/Data Table | qops_users |
| Q-Ops Agent User Accept Invite API | Activate Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?id=eq.\ |
| Q-Ops Agent User Accept Invite API | Fetch Invited Q-Ops User | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Accept Invite API | Fetch Invited Q-Ops User | Supabase/Data Table | qops_users |
| Q-Ops Agent User Accept Invite API | Fetch Invited Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent User Accept Invite API | Insert Invite Accepted Audit Event | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Accept Invite API | Insert Invite Accepted Audit Event | Supabase/Data Table | qops_audit_events |
| Q-Ops Agent User Accept Invite API | Insert Invite Accepted Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent User Accept Invite API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent User Invite API | Fetch Current Q-Ops User | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Invite API | Fetch Current Q-Ops User | Supabase/Data Table | qops_users |
| Q-Ops Agent User Invite API | Fetch Current Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent User Invite API | Insert User Invite Audit Event | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Invite API | Insert User Invite Audit Event | Supabase/Data Table | qops_audit_events |
| Q-Ops Agent User Invite API | Insert User Invite Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent User Invite API | Invite Supabase Auth User | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Invite API | Invite Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/invite?redirect_to=\ |
| Q-Ops Agent User Invite API | Prepare Invite Request | Supabase/Data Table | qops_role |
| Q-Ops Agent User Invite API | Prepare Invite Request | Supabase/Data Table | qops_users |
| Q-Ops Agent User Invite API | Prepare Invite Request | URL/Webhook | http://127.0.0.1:5175/auth/callback\u0027).trim();\nconst |
| Q-Ops Agent User Invite API | Upsert Q-Ops User | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Invite API | Upsert Q-Ops User | Supabase/Data Table | qops_users |
| Q-Ops Agent User Invite API | Upsert Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?on_conflict=email |
| Q-Ops Agent User Invite API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent User Password Reset Audit API | Fetch Q-Ops User | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Password Reset Audit API | Fetch Q-Ops User | Supabase/Data Table | qops_users |
| Q-Ops Agent User Password Reset Audit API | Fetch Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| Q-Ops Agent User Password Reset Audit API | Insert Password Reset Audit Event | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Password Reset Audit API | Insert Password Reset Audit Event | Supabase/Data Table | qops_audit_events |
| Q-Ops Agent User Password Reset Audit API | Insert Password Reset Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent User Password Reset Audit API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent User Project Assignments API | Delete Existing Project Assignments | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Project Assignments API | Delete Existing Project Assignments | Supabase/Data Table | qops_project_members |
| Q-Ops Agent User Project Assignments API | Delete Existing Project Assignments | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| Q-Ops Agent User Project Assignments API | Fetch Current Q-Ops Admin | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Project Assignments API | Fetch Current Q-Ops Admin | Supabase/Data Table | qops_users |
| Q-Ops Agent User Project Assignments API | Fetch Current Q-Ops Admin | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent User Project Assignments API | Fetch Projects | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Project Assignments API | Fetch Projects | Supabase/Data Table | qops_projects |
| Q-Ops Agent User Project Assignments API | Fetch Projects | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects |
| Q-Ops Agent User Project Assignments API | Fetch Target Q-Ops User | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Project Assignments API | Fetch Target Q-Ops User | Supabase/Data Table | qops_users |
| Q-Ops Agent User Project Assignments API | Fetch Target Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent User Project Assignments API | Insert Assignment Audit Event | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Project Assignments API | Insert Assignment Audit Event | Supabase/Data Table | qops_audit_events |
| Q-Ops Agent User Project Assignments API | Insert Assignment Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent User Project Assignments API | Insert Project Assignments | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Project Assignments API | Insert Project Assignments | Supabase/Data Table | qops_project_members |
| Q-Ops Agent User Project Assignments API | Insert Project Assignments | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent User Project Assignments API | Prepare Project Assignments | Supabase/Data Table | qops_users |
| Q-Ops Agent User Project Assignments API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent User Update API | Fetch Current Q-Ops User | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Update API | Fetch Current Q-Ops User | Supabase/Data Table | qops_users |
| Q-Ops Agent User Update API | Fetch Current Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent User Update API | Insert User Update Audit Event | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Update API | Insert User Update Audit Event | Supabase/Data Table | qops_audit_events |
| Q-Ops Agent User Update API | Insert User Update Audit Event | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events |
| Q-Ops Agent User Update API | Patch Q-Ops User | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent User Update API | Patch Q-Ops User | Supabase/Data Table | qops_users |
| Q-Ops Agent User Update API | Patch Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?id=eq.{{ |
| Q-Ops Agent User Update API | Prepare User Update Request | Supabase/Data Table | qops_users |
| Q-Ops Agent User Update API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops Agent Users API | Fetch Current Q-Ops User | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Users API | Fetch Current Q-Ops User | Supabase/Data Table | qops_users |
| Q-Ops Agent Users API | Fetch Current Q-Ops User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Users API | Fetch Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Users API | Fetch Project Memberships | Supabase/Data Table | qops_project_members |
| Q-Ops Agent Users API | Fetch Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members |
| Q-Ops Agent Users API | Fetch Users | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops Agent Users API | Fetch Users | Supabase/Data Table | qops_users |
| Q-Ops Agent Users API | Fetch Users | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users |
| Q-Ops Agent Users API | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops-Agent-Analytics-Summary | Build Scoped Metrics Query | Supabase/Data Table | qa_job_metrics |
| Q-Ops-Agent-Analytics-Summary | Build Scoped Metrics Query | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics?${pairs.join(\u0027\u0026\u0027)}`,\n |
| Q-Ops-Agent-Analytics-Summary | Fetch Current User Project Memberships | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops-Agent-Analytics-Summary | Fetch Current User Project Memberships | Supabase/Data Table | qops_project_members |
| Q-Ops-Agent-Analytics-Summary | Fetch Current User Project Memberships | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ |
| Q-Ops-Agent-Analytics-Summary | Fetch Q-Ops User Profile | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops-Agent-Analytics-Summary | Fetch Q-Ops User Profile | Supabase/Data Table | qops_users |
| Q-Ops-Agent-Analytics-Summary | Fetch Q-Ops User Profile | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ |
| Q-Ops-Agent-Analytics-Summary | Fetch Scoped Metrics | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops-Agent-Analytics-Summary | Verify Supabase Auth User | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user |
| Q-Ops-Agent-Health-Status | Build Chroma Health URL | URL/Webhook | https://api.trychroma.com\u0027).replace(/\\/+$/, |
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
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | http://127.0.0.1:8001\u0027 |
| Q-Ops-Agent-Health-Status | Build Health Response | URL/Webhook | http://127.0.0.1:8001\u0027, |
| Q-Ops-Agent-Health-Status | Check: ChromaDB | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops-Agent-Health-Status | Check: ChromaDB | Credential Reference | httpHeaderAuth: chromadb-cloud-key |
| Q-Ops-Agent-Health-Status | Check: Extractor Service | URL/Webhook | http://127.0.0.1:8001/health |
| Q-Ops-Agent-Health-Status | Check: MD->DOCX Converter Service | URL/Webhook | http://127.0.0.1:5050/health |
| Q-Ops-Agent-Health-Status | Check: Supabase DB | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops-Agent-Health-Status | Check: Supabase DB | Supabase/Data Table | qa_job_metrics |
| Q-Ops-Agent-Health-Status | Check: Supabase DB | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| Q-Ops-Agent-Health-Status | Check: Supabase Storage | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops-Agent-Health-Status | Check: Supabase Storage | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/bucket/uploaded-project-docs |
| Q-Ops-Agent-Health-Status | Fetch Chroma Settings | Credential Reference | httpCustomAuth: supabase-service-role-key |
| Q-Ops-Agent-Health-Status | Fetch Chroma Settings | Supabase/Data Table | qops_integration_settings |
| Q-Ops-Agent-Health-Status | Fetch Chroma Settings | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Check Existing Page | Credential Reference | httpBasicAuth: Confluence |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Check Existing Page | URL/Webhook | https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Chroma Vector Store | Credential Reference | chromaCloudApi: ChromaDB Self-Hosted account |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Convert md -> DOCX & Confluence Format | URL/Webhook | http://127.0.0.1:5050/convert\u0027 |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Create Epics in JIRA | Credential Reference | jiraSoftwareCloudApi: Jira SW Cloud account |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Create User Stories in JIRA1 | Credential Reference | jiraSoftwareCloudApi: Jira SW Cloud account |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Embeddings OpenAI | Credential Reference | openAiApi: OpenAi Paid Account (Aonu) |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Get Page Details | Credential Reference | httpBasicAuth: Confluence |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Get Page Details | URL/Webhook | https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Confluence Job Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Confluence Job Completed | Supabase/Data Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Confluence Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Confluence Job Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Confluence Job Failed | Supabase/Data Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Confluence Job Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Generator Agent Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Generator Agent Failed | Supabase/Data Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Generator Agent Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: JIRA Job Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: JIRA Job Completed | Supabase/Data Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: JIRA Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Log: Job Started | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Log: Job Started | Supabase/Data Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Log: Job Started | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Quality Gate Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Quality Gate Failed | Supabase/Data Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Quality Gate Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Quality Gate Passed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Quality Gate Passed | Supabase/Data Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Quality Gate Passed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Update Confluence Job Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Update Confluence Job Completed | Supabase/Data Table | qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | LOG: Update Confluence Job Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Mark Job Status as Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Mark Job Status as Completed | Supabase/Data Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Mark Job Status as Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | OpenAI Chat Model | Credential Reference | openAiApi: OpenAi Paid Account (Aonu) |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Search Epic in JIRA | Credential Reference | httpBasicAuth: JIRA |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Search Epic in JIRA | URL/Webhook | https://anujalhans1.atlassian.net\u0027).replace(/\\/$/, |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Search existence of Epics in JIRA | Credential Reference | httpBasicAuth: JIRA |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Search existence of Epics in JIRA | URL/Webhook | https://anujalhans1.atlassian.net\u0027).replace(/\\/$/, |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Search Story in JIRA | Credential Reference | httpBasicAuth: JIRA |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Search Story in JIRA | URL/Webhook | https://anujalhans1.atlassian.net\u0027).replace(/\\/$/, |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update existing Document on Confluence | Credential Reference | httpBasicAuth: Confluence |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update existing Document on Confluence | URL/Webhook | https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Completed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Completed | Supabase/Data Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Completed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Completed1 | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Completed1 | Supabase/Data Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Completed1 | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Failed | Supabase/Data Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Failed1 | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Failed1 | Supabase/Data Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status as Failed1 | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status: Generator Agent Failed | Credential Reference | httpCustomAuth: supabase-service-role-key |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status: Generator Agent Failed | Supabase/Data Table | qa_jobs |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Update Job Status: Generator Agent Failed | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Upload Document on Confluence | Credential Reference | httpBasicAuth: Confluence |
| RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft | Upload Document on Confluence | URL/Webhook | https://anujalhans1.atlassian.net/wiki\u0027).replace(/\\/$/, |
| RETRIEVE Workflow-status-check | Check Status | Supabase/Data Table | qa_jobs |
| RETRIEVE Workflow-status-check | Check Status | URL/Webhook | https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs |