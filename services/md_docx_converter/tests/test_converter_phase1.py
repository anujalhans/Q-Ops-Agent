import importlib.util
import os
import tempfile
import time
import unittest
from pathlib import Path

from docx import Document


SERVICE_PATH = Path(__file__).resolve().parents[1] / "app.py"


def load_service_module():
    spec = importlib.util.spec_from_file_location("converter_service", SERVICE_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.app.config["TESTING"] = True
    return module


class ConverterPhase1Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.service = load_service_module()

    def test_blockquote_confluence_conversion_does_not_hang(self):
        markdown = "# Title\n\n> Quoted business objective.\n\nPlain paragraph."

        started_at = time.perf_counter()
        html = self.service.convert_markdown_to_confluence(markdown)
        duration = time.perf_counter() - started_at

        self.assertLess(duration, 2)
        self.assertIn('ac:name="info"', html)
        self.assertNotIn("<blockquote", html)

    def test_code_cdata_marker_is_escaped_for_confluence(self):
        markdown = "# Title\n\n```xml\n<a>]]></a>\n```"

        html = self.service.convert_markdown_to_confluence(markdown)

        self.assertIn('ac:name="code"', html)
        self.assertIn("]]]]&gt;&lt;![CDATA[&gt;", html)

    def test_small_confluence_table_keeps_default_layout(self):
        markdown = "| A | B |\n|---|---|\n| 1 | 2 |"

        html = self.service.convert_markdown_to_confluence(markdown)

        self.assertIn('class="confluenceTable"', html)
        self.assertIn('data-layout="default"', html)
        self.assertNotIn('qops-wide-table', html)

    def test_wide_confluence_table_uses_scrollable_wide_layout(self):
        markdown = (
            "| Req ID | Requirement Description | Source Document | Design Component | "
            "Test Case IDs | Automation Status | Risk ID | Coverage Status |\n"
            "|---|---|---|---|---|---|---|---|\n"
            "| FRD-REQ-001 | Long ecommerce checkout requirement | FRD_AstraCart.docx | "
            "Checkout Service | TC-001, TC-002 | Fully Automated | RSK-001 | Covered |"
        )

        html = self.service.convert_markdown_to_confluence(markdown)

        self.assertIn('class="qops-wide-table"', html)
        self.assertIn('overflow-x:auto; width:100%;', html)
        self.assertIn('data-layout="wide"', html)
        self.assertIn('min-width:', html)
        self.assertIn('table-layout:auto;', html)

    def test_ragged_table_does_not_break_docx_generation(self):
        markdown = "| A | B |\n|---|---|\n| 1 | 2 | 3 |\n\n> quote"
        doc = Document()

        self.service.configure_styles(doc)
        self.service.add_markdown_content(doc, markdown)

        fd, path = tempfile.mkstemp(suffix=".docx")
        os.close(fd)
        try:
            doc.save(path)
            self.assertGreater(os.path.getsize(path), 0)
        finally:
            if os.path.exists(path):
                os.remove(path)

    def test_convert_json_preserves_existing_response_shape(self):
        client = self.service.app.test_client()

        response = client.post("/convert", json={
            "markdown": "# Title\n\n> Quoted business objective.",
            "documentType": "diagnostic",
            "responseType": "json",
            "headers": {"x-test": "1"},
            "params": {"source": "unit"},
            "query": {"mode": "json"},
            "body": {"documentType": "diagnostic"},
            "webhookUrl": "http://localhost/webhook",
            "executionMode": "test"
        })

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["headers"], {"x-test": "1"})
        self.assertEqual(payload["params"], {"source": "unit"})
        self.assertEqual(payload["query"], {"mode": "json"})
        self.assertEqual(payload["body"], {"documentType": "diagnostic"})
        self.assertEqual(payload["webhookUrl"], "http://localhost/webhook")
        self.assertEqual(payload["executionMode"], "test")
        self.assertEqual(payload["fileName"], "diagnostic.docx")
        self.assertIn('ac:name="info"', payload["confluenceContent"])

    def test_convert_docx_returns_word_document(self):
        client = self.service.app.test_client()

        response = client.post("/convert", json={
            "markdown": "# Title\n\n> Quoted business objective.",
            "documentType": "diagnostic",
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers["Content-Type"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        self.assertTrue(response.data.startswith(b"PK"))

    def test_empty_input_returns_400(self):
        client = self.service.app.test_client()

        response = client.post("/convert", json={"markdown": ""})

        self.assertEqual(response.status_code, 400)
        self.assertIn("No markdown content provided", response.get_json()["error"])

    def test_markdown_size_guard_returns_413(self):
        original_limit = self.service.MAX_MARKDOWN_CHARS
        self.service.MAX_MARKDOWN_CHARS = 10
        try:
            client = self.service.app.test_client()
            response = client.post("/convert", json={
                "markdown": "# Title\n\nThis content is intentionally longer than ten chars."
            })
            self.assertEqual(response.status_code, 413)
            self.assertIn("Markdown content too large", response.get_json()["error"])
        finally:
            self.service.MAX_MARKDOWN_CHARS = original_limit

    def test_ready_endpoint_runs_conversion_self_test(self):
        client = self.service.app.test_client()

        response = client.get("/ready")

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "ready")
        self.assertTrue(payload["confluenceInfoMacro"])
        self.assertTrue(payload["confluenceTable"])


if __name__ == "__main__":
    unittest.main()
