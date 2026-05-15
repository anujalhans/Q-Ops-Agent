import unittest

from extract_images_v2.extractors.table_utils import table_rows_to_markdown, table_rows_to_plain_text


class TableUtilTests(unittest.TestCase):
    def test_markdown_conversion(self) -> None:
        markdown = table_rows_to_markdown([["Name", "Role"], ["Alice", "Admin"]])
        self.assertIn("| Name | Role |", markdown)
        self.assertIn("| Alice | Admin |", markdown)

    def test_plain_text_conversion(self) -> None:
        text = table_rows_to_plain_text([["A", "B"], ["1", "2"]])
        self.assertEqual(text, "A | B\n1 | 2")


if __name__ == "__main__":
    unittest.main()
