import io
import hashlib
from typing import Tuple
from docx import Document as DocxDocument
import pdfplumber
import PyPDF2

class ParserService:
    @staticmethod
    def compute_sha256(text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    @staticmethod
    def parse_txt(file_bytes: bytes) -> str:
        for encoding in ["utf-8", "utf-8-sig", "latin-1", "cp1252"]:
            try:
                return file_bytes.decode(encoding)
            except UnicodeDecodeError:
                continue
        return file_bytes.decode("utf-8", errors="replace")

    @staticmethod
    def parse_pdf(file_bytes: bytes) -> str:
        text_parts = []
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text.strip())
        except Exception:
            # Fallback to PyPDF2
            try:
                reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    extract = page.extract_text()
                    if extract:
                        text_parts.append(extract.strip())
            except Exception as e:
                raise ValueError(f"Failed to parse PDF document: {str(e)}")

        full_text = "\n\n".join(text_parts)
        if not full_text.strip():
            raise ValueError("Parsed PDF document contains no readable text.")
        return full_text

    @staticmethod
    def parse_docx(file_bytes: bytes) -> str:
        try:
            doc = DocxDocument(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            full_text = "\n\n".join(paragraphs)
            if not full_text.strip():
                raise ValueError("Parsed DOCX document contains no readable text.")
            return full_text
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX document: {str(e)}")

    @classmethod
    def parse_file(cls, filename: str, file_bytes: bytes) -> Tuple[str, str, str]:
        """
        Parses uploaded file bytes.
        Returns: (raw_text, file_type, sha256_hash)
        """
        lower = filename.lower()
        if lower.endswith(".pdf"):
            file_type = "pdf"
            raw_text = cls.parse_pdf(file_bytes)
        elif lower.endswith(".docx"):
            file_type = "docx"
            raw_text = cls.parse_docx(file_bytes)
        elif lower.endswith(".txt") or lower.endswith(".text") or lower.endswith(".md"):
            file_type = "txt"
            raw_text = cls.parse_txt(file_bytes)
        else:
            # Default to text parse
            file_type = "txt"
            raw_text = cls.parse_txt(file_bytes)

        # Normalize line endings to \n
        raw_text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
        sha256 = cls.compute_sha256(raw_text)
        return raw_text, file_type, sha256
