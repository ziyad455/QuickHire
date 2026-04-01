import io

import pdfplumber
from docx import Document

from exceptions import AppError


def extract_text_from_pdf(file_stream):
    text = ""
    with pdfplumber.open(file_stream) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text


def extract_text_from_docx(file_stream):
    doc = Document(file_stream)
    return "\n".join([para.text for para in doc.paragraphs])


def extract_text_from_upload(filename: str, file_bytes: bytes) -> str:
    file_stream = io.BytesIO(file_bytes)

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file_stream)
    if filename.endswith(".docx"):
        return extract_text_from_docx(file_stream)

    raise AppError("Unsupported file format. Use PDF or DOCX.", status_code=400)
