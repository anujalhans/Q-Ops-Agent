from __future__ import annotations

import base64
import csv
import io
import re
from typing import Any
from xml.etree import ElementTree

from extract_images_v2.extractors.visual_detection import annotate_visual_candidates, limit_visual_candidates, resolve_vision_config


SVG_TEXT_TAGS = {"title", "desc", "text", "tspan", "textpath"}
SVG_ATTR_LABELS = (
    "aria-label",
    "aria-description",
    "alt",
    "title",
    "id",
    "class",
    "data-name",
    "href",
)
SVG_SHAPE_TAGS = {
    "svg",
    "g",
    "path",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "text",
    "image",
    "use",
}
MAX_SVG_LABELS = 120


def _clean_svg_text(value: Any) -> str:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    return text[:500]


def _svg_local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def _svg_attr(element: ElementTree.Element, name: str) -> str:
    value = element.attrib.get(name)
    if value is not None:
        return _clean_svg_text(value)

    for attr_name, attr_value in element.attrib.items():
        if attr_name.rsplit("}", 1)[-1].lower() == name.lower():
            return _clean_svg_text(attr_value)

    return ""


def _fallback_svg_text(decoded_text: str) -> tuple[list[str], dict[str, int], dict[str, str]]:
    labels = []
    for match in re.finditer(r">([^<>]+)<", decoded_text):
        label = _clean_svg_text(match.group(1))
        if label and label not in labels:
            labels.append(label)
            if len(labels) >= MAX_SVG_LABELS:
                break

    dimensions = {}
    for attr in ("width", "height", "viewBox"):
        match = re.search(rf"\b{attr}\s*=\s*['\"]([^'\"]+)['\"]", decoded_text, flags=re.IGNORECASE)
        if match:
            dimensions[attr] = _clean_svg_text(match.group(1))

    element_counts: dict[str, int] = {}
    for tag in SVG_SHAPE_TAGS:
        count = len(re.findall(rf"<\s*{tag}\b", decoded_text, flags=re.IGNORECASE))
        if count:
            element_counts[tag] = count

    return labels, element_counts, dimensions


def _extract_svg_summary(*, content: bytes, file_name: str) -> tuple[str, dict[str, Any], list[str]]:
    decoded_text = content.decode("utf-8-sig", errors="ignore")
    warnings: list[str] = []
    labels: list[str] = []
    element_counts: dict[str, int] = {}
    dimensions: dict[str, str] = {}

    contains_doctype = bool(re.search(r"<!\s*(doctype|entity)\b", decoded_text, flags=re.IGNORECASE))

    try:
        if contains_doctype:
            raise ElementTree.ParseError("doctype/entity declarations are not parsed")

        root = ElementTree.fromstring(decoded_text)
        dimensions = {
            "width": _svg_attr(root, "width"),
            "height": _svg_attr(root, "height"),
            "viewBox": _svg_attr(root, "viewBox"),
        }
        dimensions = {key: value for key, value in dimensions.items() if value}

        for element in root.iter():
            tag_name = _svg_local_name(element.tag)
            element_counts[tag_name] = element_counts.get(tag_name, 0) + 1

            if tag_name in SVG_TEXT_TAGS:
                label = _clean_svg_text(" ".join(element.itertext()))
                if label and label not in labels:
                    labels.append(label)

            for attr_name in SVG_ATTR_LABELS:
                label = _svg_attr(element, attr_name)
                if label and label not in labels:
                    labels.append(label)

            if len(labels) >= MAX_SVG_LABELS:
                break

    except ElementTree.ParseError:
        warnings.append(f"{file_name}: SVG XML could not be fully parsed; extracted a safe text fallback.")
        labels, element_counts, dimensions = _fallback_svg_text(decoded_text)

    visible_counts = {tag: count for tag, count in element_counts.items() if tag in SVG_SHAPE_TAGS and count}
    lines = [
        f"SVG Document: {file_name}",
        "Format: SVG vector markup",
        "Processing: parsed as text and metadata; raw SVG was not sent to vision extraction.",
    ]

    if dimensions:
        lines.append("Dimensions: " + ", ".join(f"{key}={value}" for key, value in dimensions.items()))

    if labels:
        lines.append("Extracted Labels:")
        lines.extend(f"- {label}" for label in labels[:MAX_SVG_LABELS])
    else:
        lines.append("Extracted Labels: none detected")

    if visible_counts:
        lines.append("Element Summary: " + ", ".join(f"{tag}={count}" for tag, count in sorted(visible_counts.items())))

    stats = {
        "svgTextCharacters": len(decoded_text),
        "svgLabelsExtracted": len(labels),
        "svgElementTypesDetected": len(element_counts),
        "svgVisionSkipped": True,
    }
    return "\n".join(lines), stats, warnings


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

    if file_name_lower.endswith(".svg"):
        raw_text, stats, warnings = _extract_svg_summary(content=content, file_name=file_name)
        return {
            "fileType": "svg",
            "pageCount": 1,
            "rawText": raw_text,
            "images": [],
            "renderedPages": [],
            "tables": [],
            "annotations": [],
            "links": [],
            "warnings": warnings,
            "extractionStats": stats,
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
