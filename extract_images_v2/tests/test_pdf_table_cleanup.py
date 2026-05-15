import unittest

from extract_images_v2.extractors.pdf_extractor import _normalize_pdf_table_rows


class PdfTableCleanupTests(unittest.TestCase):
    def test_drops_header_only_noise_columns(self) -> None:
        rows = [
            ["Step", "Validation", "Owner", "", "Gateway Router"],
            ["Auth", "3DS + fraud check", "Gateway", "", None],
            ["Capture", "Partial capture allowed", "OMS", "", None],
            ["Refund", "Async webhook update", "Finance", None, None],
        ]

        cleaned = _normalize_pdf_table_rows(rows)

        self.assertEqual(
            cleaned,
            [
                ["Step", "Validation", "Owner"],
                ["Auth", "3DS + fraud check", "Gateway"],
                ["Capture", "Partial capture allowed", "OMS"],
                ["Refund", "Async webhook update", "Finance"],
            ],
        )


if __name__ == "__main__":
    unittest.main()
