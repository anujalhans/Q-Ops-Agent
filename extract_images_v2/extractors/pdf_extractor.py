from __future__ import annotations

import base64
import math
from typing import Any

import fitz

from extract_images_v2.extractors.table_utils import table_rows_to_markdown, table_rows_to_plain_text
from extract_images_v2.extractors.visual_detection import annotate_visual_candidate, detect_pdf_visual_indicators


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


def _extract_pdf_tables(page: fitz.Page, *, file_name: str, page_number: int, warnings: list[str]) -> list[dict[str, Any]]:
    tables: list[dict[str, Any]] = []
    try:
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
    except Exception as exc:
        warnings.append(f"PDF table extraction skipped on page {page_number}: {exc}")
    return tables


def _extract_pdf_annotations(page: fitz.Page, *, file_name: str, page_number: int, warnings: list[str]) -> list[dict[str, Any]]:
    annotations: list[dict[str, Any]] = []
    try:
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
    except Exception as exc:
        warnings.append(f"PDF annotation extraction skipped on page {page_number}: {exc}")
    return annotations


def _extract_pdf_links(page: fitz.Page, *, file_name: str, page_number: int, warnings: list[str]) -> list[dict[str, Any]]:
    links: list[dict[str, Any]] = []
    try:
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
    except Exception as exc:
        warnings.append(f"PDF link extraction skipped on page {page_number}: {exc}")
    return links


def _build_pdf_render_candidate(
    *,
    page: fitz.Page,
    file_name: str,
    doc_type: str,
    page_index: int,
    embedded_image_count: int,
    table_count: int,
) -> dict[str, Any] | None:
    page_number = page_index + 1
    reasons = detect_pdf_visual_indicators(page, embedded_image_count=embedded_image_count, table_count=table_count)
    meaningful_reasons = [reason for reason in reasons if reason not in {"landscape_page", "rotated_page"}]
    if not meaningful_reasons:
        return None

    return annotate_visual_candidate(
        {
            "fileName": f"{file_name}_render_candidate_page{page_index}.png",
            "imageId": f"{file_name}_render_candidate_page{page_index}",
            "docType": f"{doc_type}-IMAGE" if doc_type != "UNKNOWN" else "IMAGE",
            "imageSource": "rendered-page-candidate",
            "pageNumber": page_number,
            "visualReason": reasons,
            "mimeType": "image/png",
        }
    )


def extract_pdf_document(*, content: bytes, context: dict[str, Any]) -> dict[str, Any]:
    file_name = context["fileName"]
    doc_type = context["docType"]
    extraction_config = context.get("extractionConfig", {})
    extract_tables = bool(extraction_config.get("extractTables", True))
    extract_annotations = bool(extraction_config.get("extractAnnotations", True))
    extract_links = bool(extraction_config.get("extractLinks", True))
    detect_rendered_pages = bool(extraction_config.get("detectRenderedPages", False))
    render_pages = bool(extraction_config.get("renderPages", False))

    raw_text_parts: list[str] = []
    images: list[dict[str, Any]] = []
    tables: list[dict[str, Any]] = []
    annotations: list[dict[str, Any]] = []
    links: list[dict[str, Any]] = []
    visual_candidates: list[dict[str, Any]] = []
    warnings: list[str] = []

    pdf = fitz.open(stream=content, filetype="pdf")
    page_count = len(pdf)
    try:
        for page_index in range(page_count):
            page = pdf[page_index]
            page_number = page_index + 1

            page_text = page.get_text("text") or ""
            if page_text.strip():
                raw_text_parts.append(page_text.strip())

            page_tables: list[dict[str, Any]] = []
            if extract_tables:
                page_tables = _extract_pdf_tables(page, file_name=file_name, page_number=page_number, warnings=warnings)
                tables.extend(page_tables)
            if extract_annotations:
                annotations.extend(_extract_pdf_annotations(page, file_name=file_name, page_number=page_number, warnings=warnings))
            if extract_links:
                links.extend(_extract_pdf_links(page, file_name=file_name, page_number=page_number, warnings=warnings))

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

            if detect_rendered_pages:
                candidate = _build_pdf_render_candidate(
                    page=page,
                    file_name=file_name,
                    doc_type=doc_type,
                    page_index=page_index,
                    embedded_image_count=len(seen_xrefs),
                    table_count=len(page_tables),
                )
                if candidate:
                    visual_candidates.append(candidate)
    finally:
        pdf.close()

    return {
        "fileType": "pdf",
        "pageCount": page_count,
        "rawText": "\n\n".join(raw_text_parts),
        "images": images,
        "renderedPages": [],
        "visualCandidates": visual_candidates,
        "tables": tables,
        "annotations": annotations,
        "links": links,
        "warnings": warnings,
        "extractionStats": {
            "compatibilityMode": False,
            "safeTextRichMode": True,
            "renderingEnabled": False,
            "renderPagesRequested": render_pages,
            "renderDetectionEnabled": detect_rendered_pages,
            "extractTablesEnabled": extract_tables,
            "extractAnnotationsEnabled": extract_annotations,
            "extractLinksEnabled": extract_links,
            "pagesProcessed": page_count,
            "embeddedImagesExtracted": len(images),
            "renderedPagesGenerated": 0,
            "visualCandidatesDetected": len(visual_candidates),
            "visualCandidatePages": ", ".join(str(item.get("pageNumber")) for item in visual_candidates),
            "tablesExtracted": len(tables),
            "annotationsExtracted": len(annotations),
            "linksExtracted": len(links),
        },
    }
