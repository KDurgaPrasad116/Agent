from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from backend.app.schemas.clause import ClauseDTO

class DeductionDTO(BaseModel):
    id: str
    clause_id: Optional[str] = None
    clause_title: Optional[str] = None
    criterion: str  # clarity, completeness, fairness, legal_risk, compliance
    points: float
    reason: str
    trigger_text: Optional[str] = None
    source: str  # rule, llm
    remedy_hint: Optional[str] = None

class CriterionScoreDTO(BaseModel):
    criterion: str
    score: float
    weight: float
    weighted_score: float
    deductions: List[DeductionDTO] = []

class ScoreBreakdownDTO(BaseModel):
    overall_score: float
    risk_band: str  # LOW_RISK, MEDIUM_RISK, HIGH_RISK
    formula: str
    step_by_step_derivation: List[str]
    criteria: Dict[str, CriterionScoreDTO]
    total_deductions_count: int

class AnalyzeResponse(BaseModel):
    document_id: str
    overall_score: float
    risk_band: str
    breakdown: ScoreBreakdownDTO
    clauses: List[ClauseDTO]
    global_summary: Dict[str, Any]
