from __future__ import annotations

import base64
import math
from typing import Any

import fitz

from extract_images_v2.extractors.table_utils import table_rows_to_markdown, table_rows_to_plain_text
from extract_images_v2.extractors.visual_detection import (
    annotate_visual_candidate,
    annotate_visual_candidates,
    detect_pdf_visual_indicators,
    limit_visual_candidates,
    resolve_vision_config,
)


def _normalize_pdf_table_rows(rows: list[list[Any]]) -> list[list[str]]:
    if not rows:
        return []

    normalized = [[("" if cell is None else str(cell)).strip() for cell in row] for row in rows]
    column_count = max((len(row) for row in normalized), default=0)
    if column_count == 0:
        return []

    padded = [row + [""] * (column_count - len(row)) for row in normalized]
    header = padded[0]
    body = padded[1:]
    min_density = max(2, math.ceil(len(padded) * 0.4))

    keep_indices: list[int] = []
    for column_index in range(column_count):
        total_non_empty = sum(1 for row in padded if row[column_index])
        body_non_empty = sum(1 for row in body if row[column_index])
        header_has_value = bool(header[column_index])

        if total_non_empty == 0:
            continue
        if body and body_non_empty == 0 and header_has_value:
            continue
        if total_non_empty < min_density and body_non_empty <= 1 and column_index == column_count - 1:
            continue
        keep_indices.append(column_index)

    if not keep_indices:
        keep_indices = [index for index in range(column_count) if any(row[index] for row in padded)]

    cleaned_rows = [[row[index] for index in keep_indices] for row in padded]
    while cleaned_rows and not any(cleaned_rows[-1]):
        cleaned_rows.pop()
    return cleaned_rows


def _extract_pdf_tables(page: fitz.Page, *, file_name: str, page_number: int) -> list[dict[str, Any]]:
    tables: list[dict[str, Any]] = []
    finder = getattr(page, "find_tables", None)
    if not callable(finder):
        return tables

    found = finder()
    candidates = getattr(found, "tables", []) if found is not None else []

    for table_index, table in enumerate(candidates):
        rows = table.extract() if hasattr(table, "extract") else []
        rows = _normalize_pdf_table_rows(rows)
        markdown = table_rows_to_markdown(rows)
        plain_text = table_rows_to_plain_text(rows)
        if not markdown and not plain_text:
            continue

        row_count = len(rows)
        column_count = max((len(row) for row in rows), default=0)
        tables.append(
            {
                "tableId": f"{file_name}_page{page_number}_table{table_index}",
                "fileName": file_name,
                "pageNumber": page_number,
                "tableIndex": table_index,
                "rowCount": row_count,
                "columnCount": column_count,
                "markdown": markdown,
                "text": plain_text,
                "source": "pdf-table",
            }
        )
    return tables


def _extract_pdf_annotations(page: fitz.Page, *, file_name: str, page_number: int) -> list[dict[str, Any]]:
    annotations: list[dict[str, Any]] = []
    for annotation_index, annotation in enumerate(page.annots() or []):
        info = annotation.info or {}
        content = (info.get("content") or "").strip()
        title = (info.get("title") or "").strip()
        subject = (info.get("subject") or "").strip()
        if not any([content, title, subject]):
            continue
        annotations.append(
            {
                "annotationId": f"{file_name}_page{page_number}_annotation{annotation_index}",
                "fileName": file_name,
                "pageNumber": page_number,
                "type": annotation.type[1] if annotation.type else "annotation",
                "title": title,
                "subject": subject,
                "content": content,
                "source": "pdf-annotation",
            }
        )
    return annotations


def _extract_pdf_links(page: fitz.Page, *, file_name: str, page_number: int) -> list[dict[str, Any]]:
    links: list[dict[str, Any]] = []
    for link_index, link in enumerate(page.get_links() or []):
        uri = link.get("uri")
        destination_page = link.get("page")
        if uri is None and destination_page is None:
            continue
        links.append(
            {
                "linkId": f"{file_name}_page{page_number}_link{link_index}",
                "fileName": file_name,
                "pageNumber": page_number,
                "uri": uri,
                "targetPage": destination_page + 1 if isinstance(destination_page, int) else None,
                "kind": link.get("kind"),
                "source": "pdf-link",
            }
        )
    return links


def extract_pdf_document(*, content: bytes, context: dict[str, Any]) -> dict[str, Any]:
    file_name = context["fileName"]
    doc_type = context["docType"]
    vision_config = resolve_vision_config(context)

    raw_text_parts: list[str] = []
    embedded_candidates: list[dict[str, Any]] = []
    images: list[dict[str, Any]] = []
    rendered_pages: list[dict[str, Any]] = []
    tables: list[dict[str, Any]] = []
    annotations: list[dict[str, Any]] = []
    links: list[dict[str, Any]] = []
    warnings: list[str] = []
    render_targets: list[dict[str, Any]] = []

    embedded_images_detected = 0
    embedded_images_deferred = 0
    rendered_pages_detected = 0
    rendered_pages_deferred = 0
    table_count = 0

    pdf = fitz.open(stream=content, filetype="pdf")
    page_count = len(pdf)
    try:
        for page_index, page in enumerate(pdf):
            page_number = page_index + 1
            page_text = page.get_text("text") or ""
            if page_text.strip():
                raw_text_parts.append(page_text.strip())

            page_tables = _extract_pdf_tables(page, file_name=file_name, page_number=page_number)
            tables.extend(page_tables)
            table_count += len(page_tables)

            page_annotations = _extract_pdf_annotations(page, file_name=file_name, page_number=page_number)
            annotations.extend(page_annotations)

            page_links = _extract_pdf_links(page, file_name=file_name, page_number=page_number)
            links.extend(page_links)

            seen_xrefs: set[int] = set()
            page_images = []
            for image_index, image in enumerate(page.get_images(full=True) or []):
                xref = image[0]
                if xref in seen_xrefs:
                    continue
                seen_xrefs.add(xref)
                extracted = pdf.extract_image(xref)
                image_bytes = extracted["image"]
                extension = extracted.get("ext", "png")
                page_images.append(
                    annotate_visual_candidate(
                        {
                        "fileName": f"{file_name}_page{page_number}_{image_index}.{extension}",
                        "imageId": f"{file_name}_page{page_number}_img{image_index}",
                        "base64": base64.b64encode(image_bytes).decode(),
                        "docType": f"{doc_type}-IMAGE" if doc_type != "UNKNOWN" else "IMAGE",
                        "imageSource": "embedded-image",
                        "pageNumber": page_number,
                        "visualReason": ["embedded_image"],
                        "mimeType": f"image/{extension}",
                        }
                    )
                )
            embedded_candidates.extend(page_images)
            embedded_images_detected += len(page_images)

            render_reasons = detect_pdf_visual_indicators(
                page,
                embedded_image_count=len(page_images),
                table_count=len(page_tables),
            )
            if render_reasons:
                rendered_pages_detected += 1
                render_targets.append(
                    annotate_visual_candidate(
                        {
                            "fileName": f"{file_name}_page{page_number}_rendered.png",
                            "imageId": f"{file_name}_page{page_number}_rendered",
                            "docType": f"{doc_type}-IMAGE" if doc_type != "UNKNOWN" else "IMAGE",
                            "imageSource": "rendered-page",
                            "pageNumber": page_number,
                            "visualReason": render_reasons,
                            "mimeType": "image/png",
                            "pageIndex": page_index,
                        }
                    )
                )

        images, embedded_images_deferred = limit_visual_candidates(
            annotate_visual_candidates(embedded_candidates),
            max_items=vision_config["maxEmbeddedImagesPerDocument"],
            overflow_label=f"{file_name} embedded images",
            warnings=warnings,
        )
        selected_render_targets, rendered_pages_deferred = limit_visual_candidates(
            render_targets,
            max_items=vision_config["maxRenderedPagesPerDocument"],
            overflow_label=f"{file_name} rendered pages",
            warnings=warnings,
        )
        for target in selected_render_targets:
            page = pdf[int(target["pageIndex"])]
            pixmap = page.get_pixmap(dpi=vision_config["renderDpi"], alpha=False)
            image_bytes = pixmap.tobytes("png")
            rendered_pages.append(
                annotate_visual_candidate(
                    {
                        **target,
                        "base64": base64.b64encode(image_bytes).decode(),
                    }
                )
            )
    finally:
        pdf.close()

    return {
        "fileType": "pdf",
        "pageCount": page_count,
        "rawText": "\n\n".join(raw_text_parts),
        "images": images,
        "renderedPages": rendered_pages,
        "tables": tables,
        "annotations": annotations,
        "links": links,
        "warnings": warnings,
        "extractionStats": {
            "pagesProcessed": page_count,
            "embeddedImagesDetected": embedded_images_detected,
            "embeddedImagesExtracted": len(images),
            "embeddedImagesDeferred": embedded_images_deferred,
            "renderedPageCandidatesDetected": rendered_pages_detected,
            "renderedPagesGenerated": len(rendered_pages),
            "renderedPagesDeferred": rendered_pages_deferred,
            "tablesExtracted": table_count,
            "annotationsExtracted": len(annotations),
            "linksExtracted": len(links),
            "visualCandidatesDetected": embedded_images_detected + rendered_pages_detected,
            "visualCandidatesReturned": len(images) + len(rendered_pages),
            "visualCandidatesDeferred": embedded_images_deferred + rendered_pages_deferred,
            "renderDpi": vision_config["renderDpi"],
        },
    }
