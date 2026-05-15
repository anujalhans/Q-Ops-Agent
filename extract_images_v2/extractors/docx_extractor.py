from __future__ import annotations

import base64
import io
from typing import Any

from docx import Document


def extract_docx_document(*, content: bytes, context: dict[str, Any]) -> dict[str, Any]:
    file_name = context["fileName"]
    doc_type = context["docType"]

    document = Document(io.BytesIO(content))
    raw_text_parts = [
        paragraph.text.strip()
        for paragraph in document.paragraphs
        if paragraph.text and paragraph.text.strip()
    ]

    images: list[dict[str, Any]] = []
    image_index = 0
    for rel in document.part.rels.values():
        if "image" not in rel.target_ref:
            continue

        image_bytes = rel.target_part.blob
        extension = rel.target_ref.rsplit(".", 1)[-1].lower()
        images.append(
            {
                "fileName": f"{file_name}_image_{image_index}.{extension}",
                "imageId": f"{file_name}_img_{image_index}",
                "base64": base64.b64encode(image_bytes).decode(),
                "docType": f"{doc_type}-IMAGE" if doc_type != "UNKNOWN" else "IMAGE",
                "imageSource": "embedded-image",
                "pageNumber": None,
                "visualReason": ["embedded_image"],
                "mimeType": f"image/{extension}",
            }
        )
        image_index += 1

    return {
        "fileType": "docx",
        "pageCount": 0,
        "rawText": "\n".join(raw_text_parts),
        "images": images,
        "renderedPages": [],
        "tables": [],
        "annotations": [],
        "links": [],
        "warnings": [],
        "extractionStats": {
            "compatibilityMode": True,
            "paragraphsExtracted": len(raw_text_parts),
            "embeddedImagesExtracted": len(images),
            "renderedPagesGenerated": 0,
            "tablesExtracted": 0,
            "annotationsExtracted": 0,
            "linksExtracted": 0,
        },
    }
