from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
import json
import uuid

from backend.app.database import get_db
from backend.app.models.document import DocumentModel
from backend.app.models.clause import ClauseModel
from backend.app.models.score import ScoreModel, DeductionModel
from backend.app.schemas.score import AnalyzeResponse, ScoreBreakdownDTO, CriterionScoreDTO, DeductionDTO
from backend.app.schemas.clause import ClauseDTO
from backend.app.services.scoring_engine import ScoringEngine

router = APIRouter(prefix="/api", tags=["analysis"])

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_document(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Analyzes an uploaded document:
    Evaluates 5 criteria, rolls up weighted scores, generates step-by-step mathematical derivation,
    and flags risky clauses with transparent reasons.
    """
    document_id = payload.get("document_id")
    if not document_id:
        raise HTTPException(status_code=400, detail="document_id is required in request body.")

    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    clauses = db.query(ClauseModel).filter(ClauseModel.document_id == document_id).order_by(ClauseModel.clause_index).all()
    if not clauses:
        raise HTTPException(status_code=400, detail="Document contains no clauses for analysis.")

    clause_dicts = [
        {
            "id": c.id,
            "index": c.clause_index,
            "title": c.title,
            "text": c.text,
            "start_char": c.start_char,
            "end_char": c.end_char,
            "clause_type": c.clause_type,
            "score": c.score,
            "risk_level": c.risk_level
        }
        for c in clauses
    ]

    analysis = ScoringEngine.analyze_document(document_id, doc.raw_text, clause_dicts)

    # Update database records
    # 1. Update ClauseModel scores and risk levels
    for c_model in clauses:
        updated = next((x for x in analysis["clauses"] if x["id"] == c_model.id), None)
        if updated:
            c_model.score = updated["score"]
            c_model.risk_level = updated["risk_level"]

    # 2. Clear old deductions & scores if re-analyzing
    db.query(DeductionModel).filter(DeductionModel.document_id == document_id).delete()
    db.query(ScoreModel).filter(ScoreModel.document_id == document_id).delete()

    # 3. Create Deduction records
    for crit_name, crit_data in analysis["criteria"].items():
        for d in crit_data["deductions"]:
            ded_rec = DeductionModel(
                id=str(uuid.uuid4()),
                document_id=document_id,
                clause_id=d.get("clause_id"),
                criterion=d["criterion"],
                points=d["points"],
                reason=d["reason"],
                trigger_text=d.get("trigger_text"),
                source=d.get("source", "rule"),
                remedy_hint=d.get("remedy_hint")
            )
            db.add(ded_rec)

    # 4. Create Score record
    score_rec = ScoreModel(
        id=str(uuid.uuid4()),
        document_id=document_id,
        overall_score=analysis["overall_score"],
        risk_band=analysis["risk_band"],
        formula=analysis["formula"],
        clarity_score=analysis["criteria"]["clarity"]["score"],
        completeness_score=analysis["criteria"]["completeness"]["score"],
        fairness_score=analysis["criteria"]["fairness"]["score"],
        legal_risk_score=analysis["criteria"]["legal_risk"]["score"],
        compliance_score=analysis["criteria"]["compliance"]["score"],
        derivation_json=json.dumps(analysis["step_by_step_derivation"]),
        global_summary_json=json.dumps(analysis["global_summary"])
    )
    db.add(score_rec)
    db.commit()

    # Format response DTO
    criteria_dtos = {}
    for c_key, c_val in analysis["criteria"].items():
        criteria_dtos[c_key] = CriterionScoreDTO(
            criterion=c_val["criterion"],
            score=c_val["score"],
            weight=c_val["weight"],
            weighted_score=c_val["weighted_score"],
            deductions=[
                DeductionDTO(
                    id=str(uuid.uuid4()),
                    clause_id=d.get("clause_id"),
                    clause_title=d.get("clause_title"),
                    criterion=d["criterion"],
                    points=d["points"],
                    reason=d["reason"],
                    trigger_text=d.get("trigger_text"),
                    source=d.get("source", "rule"),
                    remedy_hint=d.get("remedy_hint")
                )
                for d in c_val["deductions"]
            ]
        )

    breakdown_dto = ScoreBreakdownDTO(
        overall_score=analysis["overall_score"],
        risk_band=analysis["risk_band"],
        formula=analysis["formula"],
        step_by_step_derivation=analysis["step_by_step_derivation"],
        criteria=criteria_dtos,
        total_deductions_count=analysis["total_deductions_count"]
    )

    clause_dtos = [
        ClauseDTO(
            id=c["id"],
            document_id=document_id,
            index=c["index"],
            title=c["title"],
            text=c["text"],
            start_char=c["start_char"],
            end_char=c["end_char"],
            clause_type=c["clause_type"],
            risk_level=c["risk_level"],
            score=c["score"],
            flagged_issues=c.get("flagged_issues", [])
        )
        for c in analysis["clauses"]
    ]

    return AnalyzeResponse(
        document_id=document_id,
        overall_score=analysis["overall_score"],
        risk_band=analysis["risk_band"],
        breakdown=breakdown_dto,
        clauses=clause_dtos,
        global_summary=analysis["global_summary"]
    )
