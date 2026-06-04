AstraCart Ecommerce Platform - Fresh Synthetic Test Dataset

Purpose:
This dataset is designed for end-to-end Q-Ops Agent ingestion and generation testing. It covers registration, login, logout,
forgot/reset password, home page, product listing, product detail, checkout, payment gateway integration, payment success/failure,
order history, and order tracking.

Recommended upload mapping:
- BRD: pdf_documents/BRD_AstraCart_Ecommerce_Platform.pdf
- FRD: office_documents/FRD_AstraCart_Ecommerce_Platform.docx
- HLD: pdf_documents/HLD_AstraCart_Ecommerce_Platform.pdf
- LLD: office_documents/LLD_AstraCart_Ecommerce_Platform.docx
- Transcript files: transcripts/*.txt
- UI designs: ui_ux_images/*
- Other supporting documents: supporting_documents/*
- Supporting PPTX: office_documents/Workshop_AstraCart_Ecommerce_Grooming_and_Risks.pptx

Extractor coverage intentionally included:
- PDF text, tables, links, embedded images, and annotations.
- DOCX paragraphs, tables, embedded images, hyperlinks, comments.xml, footnotes.xml, and endnotes.xml.
- PPTX slide text, tables, embedded images, hyperlinks, vector shapes, and speaker notes.
- Standalone JPG, PNG, WebP, and SVG UI artifacts.
- TXT, MD, CSV, and LOG-like supporting files.

Note:
Rendered page image generation is not required for this dataset. Visual-heavy pages/slides exist so render-candidate detection can be
observed when enabled, but large rendered image payloads are intentionally not part of the expected flow.
