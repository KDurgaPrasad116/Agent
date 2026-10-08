from pydantic import BaseModel
from typing import List, Literal, Optional

class ClauseResult(BaseModel):
    clause: str
    type: Literal["Positive", "Negative", "Neutral"]
    is_legal: bool
    illegality_reason: Optional[str]
    risk_score: int          # 1–10
    benefit_score: int       # 1–10
    risk_factors: List[str]
<<<<<<< HEAD
=======
    rag_context: Optional[str]
>>>>>>> 3a27112 (Pushing major agent changes)
    explanation: str
    action: Literal["Accept", "Review", "Reject"]

class DocumentReport(BaseModel):
    total_clauses: int
    overall_risk_score: float
    overall_benefit_score: float
    illegal_clause_count: int
    decision: Literal["Safe to Sign", "Needs Review", "Do Not Sign"]
    decision_reasoning: str
    clauses: List[ClauseResult]