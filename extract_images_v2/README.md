# `extract_images_v2`

Separate enhanced document extraction service intended to live alongside the current FastAPI extractor without replacing it yet.

## What it adds

- `POST /process-document-v2`
- Backward-compatible core response fields for the current n8n ingestion workflow
- Richer extraction payload:
  - `tables`
  - `renderedPages`
  - `annotations`
  - `links`
  - `extractionStats`
  - `warnings`
- Rendered visual pages are also appended into `images[]` for compatibility with the existing vision branch in n8n

## Directory layout

```text
extract_images_v2/
  main.py
  extractors/
    pdf_extractor.py
    docx_extractor.py
    pptx_extractor.py
    image_extractor.py
    table_utils.py
    visual_detection.py
  tests/
  README.md
```

## Endpoint

`POST /process-document-v2`

Multipart form fields:

- `file`
- `projectName`
- `status`
- `jobId`
- `projectId` optional
- `requestedBy` optional
- `settingsVersion` optional

## Response highlights

```json
{
  "rawText": "...",
  "tables": [],
  "images": [],
  "renderedPages": [],
  "annotations": [],
  "links": [],
  "extractionStats": {},
  "warnings": []
}
```

Rendered pages are also mirrored into `images[]` using:

```json
{
  "imageSource": "rendered-page",
  "pageNumber": 3,
  "visualReason": ["vector_drawings", "table_shapes", "low_text_density"]
}
```

## Current behavior

- PDF:
  - extracts raw text
  - extracts embedded images
  - extracts tables using PyMuPDF table detection when available
  - extracts links and annotations
  - selectively renders pages when non-embedded visual indicators are detected

- DOCX:
  - extracts paragraphs
  - extracts tables
  - extracts embedded images
  - extracts hyperlinks, comments, footnotes, and endnotes where present
  - attempts page rendering for SmartArt or vector-heavy content through LibreOffice conversion if LibreOffice is available

- PPTX:
  - extracts slide text
  - extracts tables
  - extracts embedded images
  - extracts speaker notes and hyperlinks
  - attempts slide rendering for non-embedded visual content through LibreOffice conversion if LibreOffice is available

- Image files:
  - treated as standalone visual artifacts and returned in `images[]`

## Notes

- DOCX and PPTX rendered page generation depends on LibreOffice being installed and discoverable via `soffice`.
- If LibreOffice is not available, the service still returns text, tables, embedded images, and warnings instead of failing.
- This version is meant for parallel evaluation before any workflow cutover.
