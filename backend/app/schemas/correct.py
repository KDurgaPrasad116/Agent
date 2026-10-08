from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from backend.app.schemas.score import ScoreBreakdownDTO

class ClauseCorrectionDTO(BaseModel):
    id: str
    clause_id: str
    clause_title: str
    original_text: str
    revised_text: str
    reason: str
    legal_doctrine: Optional[str] = None
    status: str = "pending"  # pending, accepted, rejected, modified
    diff_tokens: List[Dict[str, Any]] = []  # [{"type": "equal"|"delete"|"insert", "value": "..."}]

class CorrectionResponse(BaseModel):
    document_id: str
    total_flagged: int
    corrections: List[ClauseCorrectionDTO]

class RescoreRequest(BaseModel):
    document_id: str
    # Map of clause_id -> accepted/custom revised text
    updated_clauses: Dict[str, str]

class RescoreResponse(BaseModel):
    document_id: str
    before_score: float
    after_score: float
    delta: float
    improved: bool
    breakdown: ScoreBreakdownDTO
    change_log: List[Dict[str, str]]
