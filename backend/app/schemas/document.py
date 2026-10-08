from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentUploadResponse(BaseModel):
    document_id: str
    file_name: str
    file_type: str
    char_count: int
    clause_count: int
    sha256_hash: str
    message: str = "Document successfully parsed and segmented"

class DocumentInfo(BaseModel):
    id: str
    file_name: str
    file_type: str
    char_length: int
    created_at: datetime
    status: str
