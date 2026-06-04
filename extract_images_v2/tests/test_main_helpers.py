import unittest

from extract_images_v2.main import (
    _build_vision_config,
    _determine_content_mode,
    infer_artifact_type,
    infer_doc_type,
    infer_document_category,
    refine_doc_type_from_content,
)
from extract_images_v2.extractors.visual_detection import annotate_visual_candidate, limit_visual_candidates


class MainHelperTests(unittest.TestCase):
    def test_infer_doc_type(self) -> None:
        self.assertEqual(infer_doc_type("sample_brd.pdf"), "BRD")
        self.assertEqual(infer_doc_type("grooming_session.txt"), "TRANSCRIPT")
        self.assertEqual(infer_doc_type("payment_gateway_openapi_spec.pptx", "supporting"), "API_SPEC")
        self.assertEqual(infer_doc_type("checkout_data_dictionary.csv", "supporting"), "DATA_MODEL")
        self.assertEqual(infer_doc_type("notes.docx", "supporting"), "SUPPORTING")
        self.assertEqual(infer_doc_type("requirements.pdf", "brd"), "BRD")
        self.assertEqual(infer_doc_type("notes.docx"), "UNKNOWN")

    def test_infer_supporting_metadata(self) -> None:
        self.assertEqual(infer_document_category("API_SPEC"), "technical_design")
        self.assertEqual(infer_artifact_type("API_SPEC"), "api_specification")
        self.assertEqual(infer_document_category("SUPPORTING"), "supporting_context")
        self.assertEqual(infer_artifact_type("SUPPORTING"), "supporting_document")

    def test_refine_supporting_doc_type_from_content(self) -> None:
        self.assertEqual(refine_doc_type_from_content("SUPPORTING", "OpenAPI endpoint request payload response payload"), "API_SPEC")
        self.assertEqual(refine_doc_type_from_content("UNKNOWN", "Entity relationship and database schema notes"), "DATA_MODEL")
        self.assertEqual(refine_doc_type_from_content("BRD", "OpenAPI endpoint"), "BRD")

    def test_determine_content_mode(self) -> None:
        self.assertEqual(_determine_content_mode("hello", []), "text-only")
        self.assertEqual(_determine_content_mode("", [{"imageId": "1"}]), "image-only")
        self.assertEqual(_determine_content_mode("hello", [{"imageId": "1"}]), "hybrid")

    def test_build_vision_config_defaults_and_bounds(self) -> None:
        config = _build_vision_config(
            max_images_per_job="250",
            vision_batch_size="0",
            max_rendered_pages_per_document="18",
            max_embedded_images_per_document=None,
            max_standalone_images_per_document="-2",
            vision_render_dpi="999",
            defer_overflow_visuals="false",
        )

        self.assertEqual(config["maxImagesPerJob"], 250)
        self.assertEqual(config["batchSize"], 5)
        self.assertEqual(config["maxRenderedPagesPerDocument"], 18)
        self.assertEqual(config["maxEmbeddedImagesPerDocument"], 20)
        self.assertEqual(config["maxStandaloneImagesPerDocument"], 10)
        self.assertEqual(config["renderDpi"], 600)
        self.assertFalse(config["deferOverflowVisuals"])

    def test_limit_visual_candidates_prefers_higher_priority(self) -> None:
        warnings: list[str] = []
        candidates = [
            annotate_visual_candidate(
                {
                    "imageId": "rendered-1",
                    "imageSource": "rendered-page",
                    "pageNumber": 3,
                    "visualReason": ["vector_drawings"],
                }
            ),
            annotate_visual_candidate(
                {
                    "imageId": "embedded-1",
                    "imageSource": "embedded-image",
                    "pageNumber": 1,
                    "visualReason": ["embedded_image"],
                }
            ),
        ]

        retained, deferred = limit_visual_candidates(
            candidates,
            max_items=1,
            overflow_label="test",
            warnings=warnings,
        )

        self.assertEqual(deferred, 1)
        self.assertEqual(retained[0]["imageId"], "embedded-1")
        self.assertTrue(warnings)


if __name__ == "__main__":
    unittest.main()
