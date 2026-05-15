from __future__ import annotations

import base64
import csv
import io
from typing import Any

from extract_images_v2.extractors.visual_detection import annotate_visual_candidates, limit_visual_candidates, resolve_vision_config


def extract_image_document(*, content: bytes, context: dict[str, Any]) -> dict[str, Any]:
    file_name = context["fileName"]
    doc_type = context["docType"]
    file_name_lower = file_name.lower()
    vision_config = resolve_vision_config(context)

    if file_name_lower.endswith((".txt", ".log", ".md")):
        decoded_text = content.decode("utf-8", errors="ignore")
        return {
            "fileType": "text",
            "pageCount": 0,
            "rawText": decoded_text,
            "images": [],
            "renderedPages": [],
            "tables": [],
            "annotations": [],
            "links": [],
            "warnings": [],
            "extractionStats": {"textCharacters": len(decoded_text)},
        }

    if file_name_lower.endswith(".csv"):
        decoded_text = content.decode("utf-8", errors="ignore")
        reader = csv.reader(io.StringIO(decoded_text))
        rows = [" | ".join(row) for row in reader]
        joined = "\n".join(rows)
        return {
            "fileType": "csv",
            "pageCount": 0,
            "rawText": joined,
            "images": [],
            "renderedPages": [],
            "tables": [],
            "annotations": [],
            "links": [],
            "warnings": [],
            "extractionStats": {"rowsExtracted": len(rows)},
        }

    image_base64 = base64.b64encode(content).decode()
    extension = file_name.rsplit(".", 1)[-1].lower()

    images = annotate_visual_candidates(
        [
            {
                "fileName": file_name,
                "imageId": f"{file_name}_img_0",
                "base64": image_base64,
                "docType": "UI/UX" if extension in {"png", "jpg", "jpeg", "webp", "svg"} else (f"{doc_type}-IMAGE" if doc_type != "UNKNOWN" else "IMAGE"),
                "imageSource": "standalone-image",
                "pageNumber": 1,
                "visualReason": ["standalone_image"],
                "mimeType": f"image/{extension}",
            }
        ]
    )
    warnings: list[str] = []
    images, deferred_count = limit_visual_candidates(
        images,
        max_items=vision_config["maxStandaloneImagesPerDocument"],
        overflow_label=f"{file_name} standalone images",
        warnings=warnings,
    )

    return {
        "fileType": "image",
        "pageCount": 1,
        "rawText": "",
        "images": images,
        "renderedPages": [],
        "tables": [],
        "annotations": [],
        "links": [],
        "warnings": warnings,
        "extractionStats": {
            "standaloneImagesDetected": 1,
            "standaloneImagesExtracted": len(images),
            "standaloneImagesDeferred": deferred_count,
            "visualCandidatesDetected": 1,
            "visualCandidatesReturned": len(images),
            "visualCandidatesDeferred": deferred_count,
        },
    }
