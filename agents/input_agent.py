from PyPDF2 import PdfReader
from docx import Document
import json
import csv
import io
import pandas as pd
from bs4 import BeautifulSoup
import numpy as np
from PIL import Image

class InputAgent:
    def __init__(self):
        self.ocr_reader = None

    def run(self, file) -> str:
        name = file.filename.lower()
        if name.endswith(".pdf"):
            return self._pdf(file)
        elif name.endswith(".docx"):
            return self._docx(file)
        elif name.endswith((".txt", ".md")):
            return file.file.read().decode("utf-8", errors="replace")
        elif name.endswith(".json"):
            return self._json(file)
        elif name.endswith(".csv"):
            return self._csv(file)
        elif name.endswith((".xlsx", ".xls")):
            return self._excel(file)
        elif name.endswith((".htm", ".html")):
            return self._html(file)
        elif name.endswith((".png", ".jpg", ".jpeg")):
            return self._image(file)
        raise ValueError(f"Unsupported format. Cannot process file '{name}'.")

    def _pdf(self, file) -> str:
        reader = PdfReader(file.file)
        return "".join(p.extract_text() or "" for p in reader.pages)

    def _docx(self, file) -> str:
        doc = Document(file.file)
        return "\n".join(p.text for p in doc.paragraphs)

    def _json(self, file) -> str:
        data = json.loads(file.file.read().decode("utf-8", errors="replace"))
        return json.dumps(data, indent=2)
        
    def _csv(self, file) -> str:
        content = file.file.read().decode("utf-8", errors="replace")
        reader = csv.reader(io.StringIO(content))
        return "\n".join(", ".join(row) for row in reader)

    def _excel(self, file) -> str:
        df = pd.read_excel(file.file)
        return df.to_string(index=False)
        
    def _html(self, file) -> str:
        content = file.file.read().decode("utf-8", errors="replace")
        soup = BeautifulSoup(content, "html.parser")
        return soup.get_text(separator="\n")
        
    def _image(self, file) -> str:
        import easyocr
        if self.ocr_reader is None:
            self.ocr_reader = easyocr.Reader(['en'], gpu=False)
        
        img = Image.open(file.file).convert('RGB')
        img_array = np.array(img)
        results = self.ocr_reader.readtext(img_array, detail=0)
        return "\n".join(results)