import base64
import unittest

from extract_images_v2.extractors.image_extractor import extract_image_document


def _context(file_name: str) -> dict:
    return {
        "fileName": file_name,
        "docType": "UI/UX",
        "visionConfig": {},
    }


class ImageExtractorTests(unittest.TestCase):
    def test_svg_is_extracted_as_text_without_vision_image(self) -> None:
        svg = b"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="640" height="480" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
  <title>AstraCart checkout flow</title>
  <desc>Cart to payment success and failure states</desc>
  <g id="cart-state-diagram" aria-label="Checkout state machine">
    <rect id="cart" width="120" height="48" />
    <text x="24" y="28">Cart Review</text>
    <text x="220" y="28">Payment Gateway</text>
  </g>
</svg>"""

        result = extract_image_document(content=svg, context=_context("08_cart_state_diagram.svg"))

        self.assertEqual(result["fileType"], "svg")
        self.assertEqual(result["pageCount"], 1)
        self.assertEqual(result["images"], [])
        self.assertEqual(result["renderedPages"], [])
        self.assertEqual(result["warnings"], [])
        self.assertIn("AstraCart checkout flow", result["rawText"])
        self.assertIn("Checkout state machine", result["rawText"])
        self.assertIn("Cart Review", result["rawText"])
        self.assertIn("Payment Gateway", result["rawText"])
        self.assertTrue(result["extractionStats"]["svgVisionSkipped"])

    def test_svg_parse_failure_uses_safe_text_fallback(self) -> None:
        svg = b"<svg width=\"320\"><text>Broken SVG Label</text>"

        result = extract_image_document(content=svg, context=_context("broken.svg"))

        self.assertEqual(result["images"], [])
        self.assertIn("Broken SVG Label", result["rawText"])
        self.assertTrue(result["warnings"])
        self.assertTrue(result["extractionStats"]["svgVisionSkipped"])

    def test_raster_image_behavior_is_unchanged(self) -> None:
        png_bytes = b"\x89PNG\r\n\x1a\nsample"

        result = extract_image_document(content=png_bytes, context=_context("screen.png"))

        self.assertEqual(result["fileType"], "image")
        self.assertEqual(len(result["images"]), 1)
        self.assertEqual(result["images"][0]["base64"], base64.b64encode(png_bytes).decode())
        self.assertEqual(result["images"][0]["mimeType"], "image/png")


if __name__ == "__main__":
    unittest.main()
