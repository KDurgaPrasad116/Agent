from pydantic import BaseModel
from typing import List, Optional

class ClauseDTO(BaseModel):
    id: str
    document_id: str
    index: int
    title: str
    text: str
    start_char: int
    end_char: int
    clause_type: str
    risk_level: str  # SAFE, WARNING, DANGER
    score: float
    flagged_issues: List[str] = []

class ClauseListResponse(BaseModel):
    document_id: str
    total_clauses: int
    clauses: List[ClauseDTO]
