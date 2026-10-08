from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.app.database import get_db
from backend.app.schemas.correct import CorrectionResponse, RescoreRequest, RescoreResponse
from backend.app.services.correct_service import CorrectService

router = APIRouter(prefix="/api", tags=["correct"])

@router.post("/correct", response_model=CorrectionResponse)
def generate_corrections(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Generates balanced, legally enforceable suggested edits and word-level diffs
    for all flagged clauses in the document.
    """
    document_id = payload.get("document_id")
    if not document_id:
        raise HTTPException(status_code=400, detail="document_id is required.")

    return CorrectService.generate_corrections(document_id, db)

@router.post("/rescore", response_model=RescoreResponse)
def rescore_document(
    request: RescoreRequest,
    db: Session = Depends(get_db)
):
    """
    Re-scores the document based on accepted revised clauses.
    Returns before score, after score, delta, updated criteria, and change log.
    """
    return CorrectService.rescore_document(request.document_id, request.updated_clauses, db)
