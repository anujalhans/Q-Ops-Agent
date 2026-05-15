from __future__ import annotations

import base64
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import fitz


SOFFICE_CANDIDATES = (
    "soffice",
    "soffice.exe",
    r"C:\Program Files\LibreOffice\program\soffice.exe",
    r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
)

DEFAULT_VISION_CONFIG = {
    "maxRenderedPagesPerDocument": 12,
    "maxEmbeddedImagesPerDocument": 20,
    "maxStandaloneImagesPerDocument": 10,
    "renderDpi": 144,
    "maxImagesPerJob": 80,
    "batchSize": 5,
    "deferOverflowVisuals": True,
}


def _as_positive_int(value: Any, default: int, *, minimum: int = 1, maximum: int = 500) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    if parsed < minimum:
        return default
    return min(maximum, parsed)


def _as_bool(value: Any, default: bool) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "1", "yes", "on"}:
            return True
        if normalized in {"false", "0", "no", "off"}:
            return False
    return default


def resolve_vision_config(context: dict[str, Any]) -> dict[str, Any]:
    provided = context.get("visionConfig") or {}
    return {
        "maxRenderedPagesPerDocument": _as_positive_int(
            provided.get("maxRenderedPagesPerDocument"),
            DEFAULT_VISION_CONFIG["maxRenderedPagesPerDocument"],
        ),
        "maxEmbeddedImagesPerDocument": _as_positive_int(
            provided.get("maxEmbeddedImagesPerDocument"),
            DEFAULT_VISION_CONFIG["maxEmbeddedImagesPerDocument"],
        ),
        "maxStandaloneImagesPerDocument": _as_positive_int(
            provided.get("maxStandaloneImagesPerDocument"),
            DEFAULT_VISION_CONFIG["maxStandaloneImagesPerDocument"],
        ),
        "renderDpi": _as_positive_int(
            provided.get("renderDpi"),
            DEFAULT_VISION_CONFIG["renderDpi"],
            maximum=600,
        ),
        "maxImagesPerJob": _as_positive_int(
            provided.get("maxImagesPerJob"),
            DEFAULT_VISION_CONFIG["maxImagesPerJob"],
        ),
        "batchSize": _as_positive_int(
            provided.get("batchSize"),
            DEFAULT_VISION_CONFIG["batchSize"],
            maximum=50,
        ),
        "deferOverflowVisuals": _as_bool(
            provided.get("deferOverflowVisuals"),
            DEFAULT_VISION_CONFIG["deferOverflowVisuals"],
        ),
    }


def build_visual_locator(item: dict[str, Any]) -> str:
    source = str(item.get("imageSource") or "visual").strip() or "visual"
    page_number = item.get("pageNumber")
    page_label = f"page-{page_number}" if page_number not in (None, "", 0) else "page-na"
    image_id = str(item.get("imageId") or item.get("fileName") or "unknown").strip() or "unknown"
    return f"{page_label}:{source}:{image_id}"


def score_visual_candidate(item: dict[str, Any]) -> int:
    image_source = str(item.get("imageSource") or "").strip().lower()
    reasons = [str(reason).strip().lower() for reason in item.get("visualReason", []) if str(reason).strip()]

    score = 0
    if image_source == "standalone-image":
        score += 130
    elif image_source == "embedded-image":
        score += 120
    elif image_source == "rendered-page":
        score += 95
    else:
        score += 80

    weights = {
        "table_shapes": 15,
        "chart": 14,
        "vector_drawings": 12,
        "smartart_or_diagram": 12,
        "diagram_shapes": 10,
        "drawingml_shapes": 10,
        "form_widgets": 9,
        "form_controls": 9,
        "annotations": 8,
        "low_text_density": 7,
        "landscape_page": 4,
        "rotated_page": 4,
        "embedded_image": 3,
        "standalone_image": 3,
        "vector_media": 10,
    }
    for reason in reasons:
        score += weights.get(reason, 2)

    return score


def annotate_visual_candidate(item: dict[str, Any]) -> dict[str, Any]:
    annotated = dict(item)
    annotated["visualReason"] = [reason for reason in annotated.get("visualReason", []) if str(reason).strip()]
    annotated["priorityScore"] = score_visual_candidate(annotated)
    annotated["priorityClass"] = (
        "critical"
        if annotated["priorityScore"] >= 130
        else "high"
        if annotated["priorityScore"] >= 110
        else "medium"
        if annotated["priorityScore"] >= 90
        else "low"
    )
    annotated["visualLocator"] = build_visual_locator(annotated)
    return annotated


def annotate_visual_candidates(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [annotate_visual_candidate(item) for item in items]


def limit_visual_candidates(
    items: list[dict[str, Any]],
    *,
    max_items: int,
    overflow_label: str,
    warnings: list[str],
) -> tuple[list[dict[str, Any]], int]:
    if max_items <= 0:
        if items:
            warnings.append(f"{overflow_label}: 0 of {len(items)} visual candidates were retained due to the configured limit.")
        return [], len(items)

    ordered = sorted(
        items,
        key=lambda item: (
            -int(item.get("priorityScore") or 0),
            int(item.get("pageNumber") or 0),
            str(item.get("imageId") or item.get("fileName") or ""),
        ),
    )

    if len(ordered) <= max_items:
        return ordered, 0

    deferred_count = len(ordered) - max_items
    warnings.append(
        f"{overflow_label}: retained {max_items} of {len(ordered)} visual candidates based on priority; deferred {deferred_count}."
    )
    return ordered[:max_items], deferred_count


def detect_pdf_visual_indicators(page: fitz.Page, *, embedded_image_count: int, table_count: int) -> list[str]:
    reasons: list[str] = []

    try:
        drawings = page.get_drawings()
        if drawings:
            reasons.append("vector_drawings")
    except Exception:
        drawings = []

    try:
        if page.first_widget is not None:
            reasons.append("form_widgets")
    except Exception:
        pass

    try:
        annotations = list(page.annots() or [])
        if annotations:
            reasons.append("annotations")
    except Exception:
        pass

    text = ""
    try:
        text = (page.get_text("text") or "").strip()
    except Exception:
        pass

    if table_count > 0:
        reasons.append("table_shapes")

    if not text and (drawings or embedded_image_count > 0):
        reasons.append("low_text_density")

    rotation = 0
    try:
        rotation = int(page.rotation or 0)
    except Exception:
        rotation = 0

    if rotation:
        reasons.append("rotated_page")

    rect = page.rect
    if rect.width > rect.height:
        reasons.append("landscape_page")

    deduped: list[str] = []
    for reason in reasons:
        if reason not in deduped:
            deduped.append(reason)
    return deduped


def find_soffice_binary() -> str | None:
    for candidate in SOFFICE_CANDIDATES:
        resolved = shutil.which(candidate) if "\\" not in candidate and "/" not in candidate else candidate
        if resolved and Path(resolved).exists():
            return resolved
    return None


def convert_office_bytes_to_pdf_bytes(content: bytes, *, suffix: str) -> tuple[bytes | None, str | None]:
    soffice = find_soffice_binary()
    if not soffice:
        return None, "LibreOffice was not found, so DOCX/PPTX visual page rendering was skipped."

    with tempfile.TemporaryDirectory(prefix="extract-images-v2-") as tmp_dir:
        tmp_path = Path(tmp_dir)
        source_path = tmp_path / f"input{suffix}"
        output_path = tmp_path / "input.pdf"
        source_path.write_bytes(content)

        command = [
            soffice,
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            str(tmp_path),
            str(source_path),
        ]

        completed = subprocess.run(command, capture_output=True, text=True, timeout=120, check=False)
        if completed.returncode != 0 or not output_path.exists():
            stderr = completed.stderr.strip() or completed.stdout.strip() or "unknown conversion failure"
            return None, f"LibreOffice conversion failed: {stderr}"

        return output_path.read_bytes(), None


def render_pdf_bytes(
    pdf_bytes: bytes,
    *,
    file_name: str,
    doc_type: str,
    visual_reason: list[str],
    prefix: str,
    dpi: int = 144,
) -> list[dict[str, Any]]:
    rendered_pages: list[dict[str, Any]] = []
    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        for page_index, page in enumerate(pdf):
            pixmap = page.get_pixmap(dpi=dpi, alpha=False)
            image_bytes = pixmap.tobytes("png")
            rendered_pages.append(
                annotate_visual_candidate(
                    {
                        "fileName": f"{file_name}_{prefix}{page_index}.png",
                        "imageId": f"{file_name}_{prefix}{page_index}",
                        "base64": base64.b64encode(image_bytes).decode(),
                        "docType": f"{doc_type}-IMAGE" if doc_type != "UNKNOWN" else "IMAGE",
                        "imageSource": "rendered-page",
                        "pageNumber": page_index + 1,
                        "visualReason": visual_reason,
                        "mimeType": "image/png",
                    }
                )
            )
    finally:
        pdf.close()

    return rendered_pages
