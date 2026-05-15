from __future__ import annotations

import logging
import time
from typing import Any
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


def infer_doc_type(file_name: str) -> str:
    name = file_name.lower()

    if "grooming" in name or "transcript" in name:
        return "TRANSCRIPT"
    if "brd" in name:
        return "BRD"
    if "frd" in name:
        return "FRD"
    if "hld" in name:
        return "HLD"
    if "lld" in name:
        return "LLD"

    return "UNKNOWN"


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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "up and running"}


@app.post("/process-document-v2")
async def process_document_v2(
    file: UploadFile = File(...),
    projectName: str = Form(...),
    status: str = Form(...),
    jobId: str = Form(...),
    projectId: str | None = Form(None),
    requestedBy: str | None = Form(None),
    settingsVersion: str | None = Form(None),
    maxImagesPerJob: str | None = Form(None),
    visionBatchSize: str | None = Form(None),
    maxRenderedPagesPerDocument: str | None = Form(None),
    maxEmbeddedImagesPerDocument: str | None = Form(None),
    maxStandaloneImagesPerDocument: str | None = Form(None),
    visionRenderDpi: str | None = Form(None),
    deferOverflowVisuals: str | None = Form(None),
) -> JSONResponse:
    request_id = str(uuid.uuid4())
    started_at = time.perf_counter()
    file_name = file.filename or "unknown"

    try:
        content = await file.read()
        file_name_lower = file_name.lower()
        doc_type = infer_doc_type(file_name)
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

        extraction_context = {
            "projectName": projectName,
            "status": status,
            "jobId": jobId,
            "projectId": projectId,
            "requestedBy": requestedBy,
            "settingsVersion": settingsVersion,
            "docType": doc_type,
            "fileName": file_name,
            "visionConfig": vision_config,
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
        images = _append_rendered_pages_to_images(result.get("images", []), rendered_pages)
        raw_text = result.get("rawText", "").strip()
        content_mode = _determine_content_mode(raw_text, images)
        document_id = str(uuid.uuid4())

        response_payload = {
            "projectName": projectName,
            "status": status,
            "jobId": jobId,
            "projectId": projectId,
            "requestedBy": requestedBy,
            "settingsVersion": settingsVersion,
            "fileName": file_name,
            "fileType": result.get("fileType", "unknown"),
            "docType": doc_type,
            "pageCount": result.get("pageCount", 0),
            "contentMode": content_mode,
            "containsText": bool(raw_text),
            "containsImages": len(images) > 0,
            "rawText": raw_text,
            "imageCount": len(images),
            "images": images,
            "tables": result.get("tables", []),
            "renderedPages": rendered_pages,
            "annotations": result.get("annotations", []),
            "links": result.get("links", []),
            "warnings": result.get("warnings", []),
            "extractionStats": result.get("extractionStats", {}),
            "visionConfigApplied": vision_config,
            "documentId": document_id,
        }

        duration_ms = int((time.perf_counter() - started_at) * 1000)
        logger.info(
            "process-document-v2 success request_id=%s job_id=%s file=%s duration_ms=%s pages=%s images=%s warnings=%s",
            request_id,
            jobId,
            file_name,
            duration_ms,
            response_payload["pageCount"],
            response_payload["imageCount"],
            len(response_payload["warnings"]),
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
