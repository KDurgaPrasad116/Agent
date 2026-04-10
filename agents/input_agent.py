from PyPDF2 import PdfReader
from docx import Document

class InputAgent:
    def run(self, file) -> str:
        name = file.filename.lower()
        if name.endswith(".pdf"):
            return self._pdf(file)
        elif name.endswith(".docx"):
            return self._docx(file)
        elif name.endswith(".txt"):
            return file.file.read().decode("utf-8", errors="replace")
        raise ValueError("Unsupported format. Use PDF, DOCX, or TXT.")

    def _pdf(self, file) -> str:
        reader = PdfReader(file.file)
        return "".join(p.extract_text() or "" for p in reader.pages)

    def _docx(self, file) -> str:
        doc = Document(file.file)
        return "\n".join(p.text for p in doc.paragraphs)