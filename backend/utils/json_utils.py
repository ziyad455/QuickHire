import re

JSON_OBJECT_PATTERN = re.compile(
    r'\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}',
    re.DOTALL,
)


def extract_json_object(text: str) -> str | None:
    match = JSON_OBJECT_PATTERN.search(text or "")
    return match.group(0) if match else None
