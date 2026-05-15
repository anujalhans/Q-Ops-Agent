from __future__ import annotations

import base64
import io
from typing import Any

from pptx import Presentation


PICTURE_SHAPE_TYPE = 13


def extract_pptx_document(*, content: bytes, context: dict[str, Any]) -> dict[str, Any]:
    file_name = context["fileName"]
    doc_type = context["docType"]

    presentation = Presentation(io.BytesIO(content))
    raw_text_parts: list[str] = []
    images: list[dict[str, Any]] = []

    for slide_index, slide in enumerate(presentation.slides):
        slide_number = slide_index + 1
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text and shape.text.strip():
                raw_text_parts.append(shape.text.strip())

            if shape.shape_type != PICTURE_SHAPE_TYPE:
                continue

            extension = shape.image.ext
            images.append(
                {
                    "fileName": f"{file_name}_slide{slide_index}.{extension}",
                    "imageId": f"{file_name}_slide{slide_index}_img",
                    "base64": base64.b64encode(shape.image.blob).decode(),
                    "docType": f"{doc_type}-IMAGE" if doc_type != "UNKNOWN" else "IMAGE",
                    "imageSource": "embedded-image",
                    "pageNumber": slide_number,
                    "visualReason": ["embedded_image"],
                    "mimeType": f"image/{extension}",
                }
            )

    return {
        "fileType": "pptx",
        "pageCount": len(presentation.slides),
        "rawText": "\n".join(raw_text_parts),
        "images": images,
        "renderedPages": [],
        "tables": [],
        "annotations": [],
        "links": [],
        "warnings": [],
        "extractionStats": {
            "compatibilityMode": True,
            "slidesProcessed": len(presentation.slides),
            "embeddedImagesExtracted": len(images),
            "renderedPagesGenerated": 0,
            "tablesExtracted": 0,
            "annotationsExtracted": 0,
            "linksExtracted": 0,
        },
    }
