from __future__ import annotations

from typing import Iterable


def normalize_cell(value: object) -> str:
    text = "" if value is None else str(value)
    return " ".join(text.replace("\r", "\n").split()).strip()


def normalize_rows(rows: Iterable[Iterable[object]]) -> list[list[str]]:
    return [[normalize_cell(cell) for cell in row] for row in rows]


def table_rows_to_markdown(rows: Iterable[Iterable[object]]) -> str:
    normalized = normalize_rows(rows)
    normalized = [row for row in normalized if any(cell for cell in row)]
    if not normalized:
        return ""

    column_count = max(len(row) for row in normalized)
    padded = [row + [""] * (column_count - len(row)) for row in normalized]
    header = padded[0]
    separator = ["---"] * column_count
    body = padded[1:] or [[""] * column_count]
    lines = [
        "| " + " | ".join(header) + " |",
        "| " + " | ".join(separator) + " |",
    ]
    lines.extend("| " + " | ".join(row) + " |" for row in body)
    return "\n".join(lines)


def table_rows_to_plain_text(rows: Iterable[Iterable[object]]) -> str:
    normalized = normalize_rows(rows)
    lines = [" | ".join(cell for cell in row) for row in normalized if any(cell for cell in row)]
    return "\n".join(lines)
