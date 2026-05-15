from __future__ import annotations

import base64
from typing import Any

import fitz


def extract_pdf_document(*, content: bytes, context: dict[str, Any]) -> dict[str, Any]:
    file_name = context["fileName"]
    doc_type = context["docType"]

    raw_text_parts: list[str] = []
    images: list[dict[str, Any]] = []

    pdf = fitz.open(stream=content, filetype="pdf")
    page_count = len(pdf)
    try:
        for page_index in range(page_count):
            page = pdf[page_index]
            page_number = page_index + 1

            page_text = page.get_text("text") or ""
            if page_text.strip():
                raw_text_parts.append(page_text.strip())

            seen_xrefs: set[int] = set()
            for image_index, image in enumerate(page.get_images(full=True) or []):
                xref = image[0]
                if xref in seen_xrefs:
                    continue
                seen_xrefs.add(xref)

                extracted = pdf.extract_image(xref)
                image_bytes = extracted["image"]
                extension = extracted.get("ext", "png")
                images.append(
                    {
                        "fileName": f"{file_name}_page{page_index}_{image_index}.{extension}",
                        "imageId": f"{file_name}_page{page_index}_img{image_index}",
                        "base64": base64.b64encode(image_bytes).decode(),
                        "docType": f"{doc_type}-IMAGE" if doc_type != "UNKNOWN" else "IMAGE",
                        "imageSource": "embedded-image",
                        "pageNumber": page_number,
                        "visualReason": ["embedded_image"],
                        "mimeType": f"image/{extension}",
                    }
                )
    finally:
        pdf.close()

    return {
        "fileType": "pdf",
        "pageCount": page_count,
        "rawText": "\n\n".join(raw_text_parts),
        "images": images,
        "renderedPages": [],
        "tables": [],
        "annotations": [],
        "links": [],
        "warnings": [],
        "extractionStats": {
            "compatibilityMode": True,
            "pagesProcessed": page_count,
            "embeddedImagesExtracted": len(images),
            "renderedPagesGenerated": 0,
            "tablesExtracted": 0,
            "annotationsExtracted": 0,
            "linksExtracted": 0,
        },
    }
