# Markdown to DOCX Converter

Repo-owned copy of the local markdown-to-DOCX and Confluence-format converter.

The HTTP contract is intentionally unchanged:

- `GET /health`
- `GET /ready`
- `POST /convert`
- Default response type: DOCX
- JSON response type: send `"responseType": "json"` to receive the existing response shape with `confluenceContent`

## Run

From this folder:

```powershell
python .\app.py
```

Compatibility launcher, if you want to use the old script name:

```powershell
python ".\convertMDToDocx&ConfluenceFormat-17-03-2026.py"
```

Both run on `http://127.0.0.1:5050`, so n8n and UI settings do not need to change.

## Test

From the repository root:

```powershell
python -m unittest services.md_docx_converter.tests.test_converter_phase1 -v
```

## Notes

- The default logo path is `assets/royal_enfield_logo.png`.
- Override it with `CONVERTER_LOGO_PATH` if needed.
- Request guards are intentionally conservative: 2 MB HTTP payload and 1,000,000 markdown characters.
