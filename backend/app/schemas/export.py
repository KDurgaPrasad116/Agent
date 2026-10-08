from pydantic import BaseModel
from typing import Optional

class ExportRequest(BaseModel):
    document_id: str
    export_format: str = "docx"  # "docx" or "pdf"
    mode: str = "clean"  # "clean" or "tracked_changes"
    include_disclaimer: bool = True
