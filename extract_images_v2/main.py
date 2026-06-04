from __future__ import annotations

import logging
import json
import time
from typing import Any
from urllib.parse import unquote, urlparse
from urllib.request import ProxyHandler, Request, build_opener
import uuid

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from extract_images_v2.extractors.docx_extractor import extract_docx_document
from extract_images_v2.extractors.image_extractor import extract_image_document
from extract_images_v2.extractors.pdf_extractor import extract_pdf_document
from extract_images_v2.extractors.pptx_extractor import extract_pptx_document
from extract_images_v2.extractors.visual_detection import resolve_vision_config

app = FastAPI()
logger = logging.getLogger("extract_images_v2")
logging.basicConfig(level=logging.INFO)


def _normalized_label(*values: str | None) -> str:
    return " ".join(" ".join(str(value or "").lower().replace("_", " ").replace("-", " ").split()) for value in values)


def infer_doc_type(file_name: str, file_key: str | None = None) -> str:
    name = _normalized_label(file_name)
    key = _normalized_label(file_key)
    combined = f"{name} {key}".strip()

    if "grooming" in name or "transcript" in name or key.startswith("transcript"):
        return "TRANSCRIPT"
    if "brd" in name or key == "brd":
        return "BRD"
    if "frd" in name or key == "frd":
        return "FRD"
    if "hld" in name or key == "hld":
        return "HLD"
    if "lld" in name or key == "lld":
        return "LLD"
    if any(token in combined for token in ("openapi", "swagger", "api spec", "api contract", "endpoint catalog")):
        return "API_SPEC"
    if any(token in combined for token in ("data model", "data dictionary", "erd", "schema mapping", "database schema")):
        return "DATA_MODEL"
    if any(token in combined for token in ("architecture", "deployment", "infrastructure", "solution design", "system design")):
        return "ARCHITECTURE"
    if any(token in combined for token in ("test case", "test cases", "test suite")):
        return "TEST_CASES"
    if any(token in combined for token in ("test plan", "test strategy", "qa strategy")):
        return "TEST_PLAN"
    if "supporting" in key:
        return "SUPPORTING"

    return "UNKNOWN"


def refine_doc_type_from_content(doc_type: str, raw_text: str) -> str:
    if doc_type not in {"UNKNOWN", "SUPPORTING"}:
        return doc_type

    text = _normalized_label(raw_text[:20000])
    if any(token in text for token in ("openapi", "swagger", "api endpoint", "request payload", "response payload")):
        return "API_SPEC"
    if any(token in text for token in ("data model", "data dictionary", "entity relationship", "erd", "database schema")):
        return "DATA_MODEL"
    if any(token in text for token in ("solution architecture", "system architecture", "deployment architecture", "component diagram")):
        return "ARCHITECTURE"
    if any(token in text for token in ("test case id", "preconditions", "expected result", "test scenario")):
        return "TEST_CASES"
    if any(token in text for token in ("test plan", "test strategy", "entry criteria", "exit criteria")):
        return "TEST_PLAN"
    return doc_type


def infer_document_category(doc_type: str) -> str:
    return {
        "BRD": "business_requirements",
        "FRD": "functional_requirements",
        "HLD": "technical_design",
        "LLD": "technical_design",
        "ARCHITECTURE": "technical_design",
        "TRANSCRIPT": "stakeholder_context",
        "UI/UX": "user_experience",
        "API_SPEC": "technical_design",
        "DATA_MODEL": "technical_design",
        "TEST_PLAN": "quality_assurance",
        "TEST_CASES": "quality_assurance",
        "SUPPORTING": "supporting_context",
    }.get(doc_type, "unclassified")


def infer_artifact_type(doc_type: str) -> str:
    return {
        "BRD": "business_requirements_document",
        "FRD": "functional_requirements_document",
        "HLD": "high_level_design",
        "LLD": "low_level_design",
        "ARCHITECTURE": "architecture_document",
        "TRANSCRIPT": "meeting_transcript",
        "UI/UX": "ui_ux_artifact",
        "API_SPEC": "api_specification",
        "DATA_MODEL": "data_model",
        "TEST_PLAN": "test_plan_document",
        "TEST_CASES": "test_cases",
        "SUPPORTING": "supporting_document",
    }.get(doc_type, "unclassified_document")


def infer_metadata_source(file_name: str, file_key: str | None, doc_type: str) -> str:
    if doc_type == "UNKNOWN":
        return "fallback_unknown"
    if file_key and doc_type == "SUPPORTING":
        return "file_key_supporting"
    if doc_type in {"API_SPEC", "DATA_MODEL", "ARCHITECTURE", "TEST_PLAN", "TEST_CASES"}:
        return "filename_keyword"
    return "filename_convention"


def metadata_source_for_refinement(original_doc_type: str, refined_doc_type: str, metadata_source: str) -> str:
    if refined_doc_type != original_doc_type:
        return "content_keyword"
    return metadata_source


def _append_rendered_pages_to_images(images: list[dict[str, Any]], rendered_pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    existing_ids = {item.get("imageId") for item in images}
    merged = list(images)
    for page in rendered_pages:
        if page.get("imageId") in existing_ids:
            continue
        merged.append(page)
    return merged


def _determine_content_mode(raw_text: str, images: list[dict[str, Any]]) -> str:
    contains_text = bool(raw_text and raw_text.strip())
    contains_images = len(images) > 0

    if contains_text and contains_images:
        return "hybrid"
    if contains_text:
        return "text-only"
    if contains_images:
        return "image-only"
    return "unknown"


def _build_vision_config(
    *,
    max_images_per_job: str | None,
    vision_batch_size: str | None,
    max_rendered_pages_per_document: str | None,
    max_embedded_images_per_document: str | None,
    max_standalone_images_per_document: str | None,
    vision_render_dpi: str | None,
    defer_overflow_visuals: str | None,
) -> dict[str, Any]:
    return resolve_vision_config(
        {
            "visionConfig": {
                "maxImagesPerJob": max_images_per_job,
                "batchSize": vision_batch_size,
                "maxRenderedPagesPerDocument": max_rendered_pages_per_document,
                "maxEmbeddedImagesPerDocument": max_embedded_images_per_document,
                "maxStandaloneImagesPerDocument": max_standalone_images_per_document,
                "renderDpi": vision_render_dpi,
                "deferOverflowVisuals": defer_overflow_visuals,
            }
        }
    )


def _parse_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    normalized = str(value).strip().lower()
    if not normalized:
        return default
    if normalized in {"1", "true", "yes", "y", "on"}:
        return True
    if normalized in {"0", "false", "no", "n", "off"}:
        return False
    return default


def _build_extraction_config(
    *,
    extract_tables: str | None,
    extract_annotations: str | None,
    extract_links: str | None,
    detect_rendered_pages: str | None,
    render_pages: str | None,
) -> dict[str, bool]:
    return {
        "extractTables": _parse_bool(extract_tables, True),
        "extractAnnotations": _parse_bool(extract_annotations, True),
        "extractLinks": _parse_bool(extract_links, True),
        "detectRenderedPages": _parse_bool(detect_rendered_pages, False),
        "renderPages": _parse_bool(render_pages, False),
    }


def _filename_from_url(file_url: str) -> str:
    parsed = urlparse(file_url)
    name = unquote(parsed.path.rsplit("/", 1)[-1]).strip()
    return name or "downloaded-document"


def _download_file_url(file_url: str) -> tuple[bytes, str]:
    parsed = urlparse(file_url)
    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(status_code=400, detail="fileUrl must be http or https")

    request = Request(file_url, headers={"User-Agent": "qops-document-extractor/1.0"})
    opener = build_opener(ProxyHandler({}))
    with opener.open(request, timeout=120) as response:
        content = response.read()
        content_disposition = response.headers.get("content-disposition", "")

    file_name = _filename_from_url(file_url)
    if "filename=" in content_disposition:
        disposition_name = content_disposition.split("filename=", 1)[1].strip().strip('"')
        if disposition_name:
            file_name = disposition_name

    return content, file_name


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "up and running"}


@app.post("/process-document-v2")
async def process_document_v2(
    file: UploadFile | None = File(None),
    fileUrl: str | None = Form(None),
    projectName: str = Form(...),
    status: str = Form(...),
    jobId: str = Form(...),
    projectId: str | None = Form(None),
    requestedBy: str | None = Form(None),
    settingsVersion: str | None = Form(None),
    fileKey: str | None = Form(None),
    maxImagesPerJob: str | None = Form(None),
    visionBatchSize: str | None = Form(None),
    maxRenderedPagesPerDocument: str | None = Form(None),
    maxEmbeddedImagesPerDocument: str | None = Form(None),
    maxStandaloneImagesPerDocument: str | None = Form(None),
    visionRenderDpi: str | None = Form(None),
    deferOverflowVisuals: str | None = Form(None),
    extractTables: str | None = Form(None),
    extractAnnotations: str | None = Form(None),
    extractLinks: str | None = Form(None),
    detectRenderedPages: str | None = Form(None),
    renderPages: str | None = Form(None),
) -> JSONResponse:
    request_id = str(uuid.uuid4())
    started_at = time.perf_counter()
    file_name = file.filename if file else (_filename_from_url(fileUrl) if fileUrl else "unknown")

    try:
        if file is None and not fileUrl:
            raise HTTPException(status_code=400, detail="Either file or fileUrl is required")

        logger.info(
            "process-document-v2 received request_id=%s job_id=%s project=%s file=%s",
            request_id,
            jobId,
            projectName,
            file_name,
        )
        if file is not None:
            content = await file.read()
        else:
            content, file_name = _download_file_url(fileUrl or "")

        file_name_lower = file_name.lower()
        doc_type = infer_doc_type(file_name, fileKey)
        if file_name_lower.endswith((".png", ".jpg", ".jpeg", ".webp", ".svg")):
            doc_type = "UI/UX"
        document_category = infer_document_category(doc_type)
        artifact_type = infer_artifact_type(doc_type)
        metadata_source = infer_metadata_source(file_name, fileKey, doc_type)
        logger.info(
            "process-document-v2 start request_id=%s job_id=%s project=%s file=%s bytes=%s",
            request_id,
            jobId,
            projectName,
            file_name,
            len(content),
        )
        vision_config = _build_vision_config(
            max_images_per_job=maxImagesPerJob,
            vision_batch_size=visionBatchSize,
            max_rendered_pages_per_document=maxRenderedPagesPerDocument,
            max_embedded_images_per_document=maxEmbeddedImagesPerDocument,
            max_standalone_images_per_document=maxStandaloneImagesPerDocument,
            vision_render_dpi=visionRenderDpi,
            defer_overflow_visuals=deferOverflowVisuals,
        )
        extraction_config = _build_extraction_config(
            extract_tables=extractTables,
            extract_annotations=extractAnnotations,
            extract_links=extractLinks,
            detect_rendered_pages=detectRenderedPages,
            render_pages=renderPages,
        )

        extraction_context = {
            "projectName": projectName,
            "status": status,
            "jobId": jobId,
            "projectId": projectId,
            "requestedBy": requestedBy,
            "settingsVersion": settingsVersion,
            "fileKey": fileKey,
            "docType": doc_type,
            "documentCategory": document_category,
            "artifactType": artifact_type,
            "metadataConfidence": 0.95 if doc_type != "UNKNOWN" else 0.25,
            "metadataSource": metadata_source,
            "fileName": file_name,
            "visionConfig": vision_config,
            "extractionConfig": extraction_config,
        }

        if file_name_lower.endswith(".pdf"):
            result = extract_pdf_document(content=content, context=extraction_context)
        elif file_name_lower.endswith(".docx"):
            result = extract_docx_document(content=content, context=extraction_context)
        elif file_name_lower.endswith(".pptx"):
            result = extract_pptx_document(content=content, context=extraction_context)
        elif file_name_lower.endswith((".txt", ".log", ".md", ".csv", ".png", ".jpg", ".jpeg", ".webp", ".svg")):
            result = extract_image_document(content=content, context=extraction_context)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        rendered_pages = result.get("renderedPages", [])
        visual_candidates = result.get("visualCandidates", [])
        images = _append_rendered_pages_to_images(result.get("images", []), rendered_pages)
        raw_text = result.get("rawText", "").strip()
        content_mode = _determine_content_mode(raw_text, images)
        original_doc_type = doc_type
        doc_type = refine_doc_type_from_content(doc_type, raw_text)
        document_category = infer_document_category(doc_type)
        artifact_type = infer_artifact_type(doc_type)
        metadata_source = metadata_source_for_refinement(original_doc_type, doc_type, metadata_source)
        document_id = str(uuid.uuid4())

        response_payload = {
            "projectName": projectName,
            "status": status,
            "jobId": jobId,
            "projectId": projectId,
            "requestedBy": requestedBy,
            "settingsVersion": settingsVersion,
            "fileKey": fileKey,
            "fileName": file_name,
            "fileType": result.get("fileType", "unknown"),
            "docType": doc_type,
            "documentCategory": document_category,
            "artifactType": artifact_type,
            "metadataConfidence": 0.95 if doc_type != "UNKNOWN" else 0.25,
            "metadataSource": metadata_source,
            "pageCount": result.get("pageCount", 0),
            "contentMode": content_mode,
            "containsText": bool(raw_text),
            "containsImages": len(images) > 0,
            "rawText": raw_text,
            "imageCount": len(images),
            "images": images,
            "tables": result.get("tables", []),
            "renderedPages": rendered_pages,
            "visualCandidates": visual_candidates,
            "annotations": result.get("annotations", []),
            "links": result.get("links", []),
            "warnings": result.get("warnings", []),
            "extractionStats": result.get("extractionStats", {}),
            "visionConfigApplied": vision_config,
            "extractionConfigApplied": extraction_config,
            "documentId": document_id,
        }

        duration_ms = int((time.perf_counter() - started_at) * 1000)
        stats = dict(response_payload.get("extractionStats") or {})
        stats.update(
            {
                "durationMs": duration_ms,
                "fileSizeBytes": len(content),
                "warningCount": len(response_payload["warnings"]),
                "tableCount": len(response_payload["tables"]),
                "annotationCount": len(response_payload["annotations"]),
                "linkCount": len(response_payload["links"]),
                "visualCandidatesDetected": len(response_payload["visualCandidates"]),
                "pageCount": response_payload["pageCount"],
            }
        )
        response_payload["extractionStats"] = stats
        response_payload["extractionStats"]["responseBytesEstimated"] = len(
            json.dumps(response_payload, default=str).encode("utf-8")
        )
        logger.info(
            "process-document-v2 success request_id=%s job_id=%s file=%s duration_ms=%s bytes=%s pages=%s images=%s visual_candidates=%s tables=%s annotations=%s links=%s warnings=%s response_bytes_estimated=%s",
            request_id,
            jobId,
            file_name,
            duration_ms,
            len(content),
            response_payload["pageCount"],
            response_payload["imageCount"],
            len(response_payload["visualCandidates"]),
            len(response_payload["tables"]),
            len(response_payload["annotations"]),
            len(response_payload["links"]),
            len(response_payload["warnings"]),
            response_payload["extractionStats"]["responseBytesEstimated"],
        )
        return JSONResponse(response_payload)
    except HTTPException:
        duration_ms = int((time.perf_counter() - started_at) * 1000)
        logger.exception(
            "process-document-v2 http_error request_id=%s job_id=%s file=%s duration_ms=%s",
            request_id,
            jobId,
            file_name,
            duration_ms,
        )
        raise
    except Exception as exc:  # pragma: no cover - endpoint safety net
        duration_ms = int((time.perf_counter() - started_at) * 1000)
        logger.exception(
            "process-document-v2 failed request_id=%s job_id=%s file=%s duration_ms=%s",
            request_id,
            jobId,
            file_name,
            duration_ms,
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": "Document processing failed",
                "details": str(exc),
            },
        )
