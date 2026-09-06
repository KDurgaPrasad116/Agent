"""
Unified file parser for various formats.
"""

import io
from PyPDF2 import PdfReader
from docx import Document
import pandas as pd
from bs4 import BeautifulSoup

# Lazy load easyocr since it can be heavy
_reader = None
def get_ocr_reader():
    global _reader
    if _reader is None:
        import easyocr
        _reader = easyocr.Reader(['en'])
    return _reader

def parse_file(file) -> str:
    """
    Extract plain text from an uploaded FastAPI UploadFile.
    """
    content = file.file.read()
    return parse_bytes(content, file.filename)

def parse_bytes(content: bytes, filename: str) -> str:
    """
    Extract plain text from raw bytes.
    Useful when the file has already been read into memory.
    """
    filename = filename.lower()

    if filename.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        return "".join(p.extract_text() or "" for p in reader.pages)

    elif filename.endswith(".docx"):
        doc = Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)

    elif filename.endswith((".txt", ".md", ".json")):
        try:
            return content.decode("utf-8")
        except UnicodeDecodeError:
            return content.decode("latin-1")

    elif filename.endswith((".csv", ".xlsx", ".xls")):
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
        return df.to_string(index=False)

    elif filename.endswith(".html"):
        soup = BeautifulSoup(content, "html.parser")
        return soup.get_text(separator="\n")

    elif filename.endswith((".png", ".jpg", ".jpeg")):
        reader = get_ocr_reader()
        result = reader.readtext(content, detail=0)
        return "\n".join(result)

    else:
        raise ValueError(
            f"Unsupported file format '{filename}'. "
            "Accepted formats: .pdf, .docx, .txt, .md, .json, .csv, .xlsx, .xls, .html, .png, .jpg, .jpeg"
        )
