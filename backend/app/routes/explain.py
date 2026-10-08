from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import json

from backend.app.database import get_db
from backend.app.models.score import ScoreModel
from backend.app.schemas.explain import ClauseExplanationDTO, DocumentSummaryDTO
from backend.app.services.explain_service import ExplainService

router = APIRouter(prefix="/api", tags=["explain"])

@router.get("/clauses/{clause_id}/explain", response_model=ClauseExplanationDTO)
def explain_clause(
    clause_id: str,
    lang: str = Query("en", description="Language code (en or hi)"),
    db: Session = Depends(get_db)
):
    """
    Layman Mode: Generates Grade 8 plain-English explanation, practical impact,
    real-life scenario, legal glossary tooltips, and lawyer consultation questions.
    """
    try:
        return ExplainService.explain_clause(clause_id, lang, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate explanation: {str(e)}")

@router.get("/documents/{document_id}/summary", response_model=DocumentSummaryDTO)
def get_document_summary(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns global executive summary: purpose, identified parties,
    key obligations, key dates/amounts, and high-risk red flags.
    """
    score_rec = db.query(ScoreModel).filter(ScoreModel.document_id == document_id).first()
    if not score_rec or not score_rec.global_summary_json:
        raise HTTPException(status_code=404, detail="Document summary not found. Analyze document first.")
    
    summary = json.loads(score_rec.global_summary_json)
    return DocumentSummaryDTO(
        document_id=document_id,
        purpose=summary.get("purpose", "Commercial agreement"),
        parties_identified=summary.get("parties_identified", []),
        key_obligations=summary.get("key_obligations", []),
        key_dates_and_amounts=summary.get("key_dates_and_amounts", []),
        red_flags=summary.get("red_flags", []),
        governing_law_detected=summary.get("governing_law_detected")
    )
