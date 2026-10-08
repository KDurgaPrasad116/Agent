import difflib
import uuid
import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from backend.app.models.clause import ClauseModel
from backend.app.models.score import DeductionModel, ScoreModel
from backend.app.models.correction import CorrectionModel
from backend.app.schemas.correct import ClauseCorrectionDTO, CorrectionResponse, RescoreResponse, ScoreBreakdownDTO
from backend.app.services.llm_client import LLMClient
from backend.app.services.scoring_engine import ScoringEngine

class CorrectService:
    @classmethod
    def compute_diff_tokens(cls, original: str, revised: str) -> List[Dict[str, str]]:
        """
        Calculates word-level diff between original and revised text.
        Returns array of tokens tagged with 'equal', 'delete', or 'insert'.
        """
        orig_words = original.split()
        rev_words = revised.split()

        matcher = difflib.SequenceMatcher(None, orig_words, rev_words)
        tokens = []

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                tokens.append({
                    "type": "equal",
                    "value": " ".join(orig_words[i1:i2]) + " "
                })
            elif tag == 'delete':
                tokens.append({
                    "type": "delete",
                    "value": " ".join(orig_words[i1:i2]) + " "
                })
            elif tag == 'insert':
                tokens.append({
                    "type": "insert",
                    "value": " ".join(rev_words[j1:j2]) + " "
                })
            elif tag == 'replace':
                tokens.append({
                    "type": "delete",
                    "value": " ".join(orig_words[i1:i2]) + " "
                })
                tokens.append({
                    "type": "insert",
                    "value": " ".join(rev_words[j1:j2]) + " "
                })

        return tokens

    @classmethod
    def generate_corrections(cls, document_id: str, db: Session) -> CorrectionResponse:
        """
        Generates balanced auto-corrections and word diffs for all flagged clauses.
        """
        clauses = db.query(ClauseModel).filter(ClauseModel.document_id == document_id).order_by(ClauseModel.clause_index).all()
        flagged_clauses = [c for c in clauses if c.risk_level in ["WARNING", "DANGER"]]

        llm = LLMClient()
        correction_dtos = []

        for c in flagged_clauses:
            deductions = db.query(DeductionModel).filter(DeductionModel.clause_id == c.id).all()
            reasons = "; ".join([d.reason for d in deductions]) if deductions else "Unbalanced terms"

            corr_data = llm.generate_clause_correction(c.text, c.title, reasons)
            revised_text = corr_data["revised_text"]
            diff_tokens = cls.compute_diff_tokens(c.text, revised_text)

            # Persist or update correction record
            existing = db.query(CorrectionModel).filter(CorrectionModel.clause_id == c.id).first()
            if not existing:
                corr_rec = CorrectionModel(
                    id=str(uuid.uuid4()),
                    document_id=document_id,
                    clause_id=c.id,
                    original_text=c.text,
                    revised_text=revised_text,
                    reason=corr_data["reason"],
                    legal_doctrine=corr_data.get("legal_doctrine"),
                    status="pending",
                    diff_json=json.dumps(diff_tokens)
                )
                db.add(corr_rec)
                corr_id = corr_rec.id
            else:
                existing.revised_text = revised_text
                existing.reason = corr_data["reason"]
                existing.legal_doctrine = corr_data.get("legal_doctrine")
                existing.diff_json = json.dumps(diff_tokens)
                corr_id = existing.id

            correction_dtos.append(
                ClauseCorrectionDTO(
                    id=corr_id,
                    clause_id=c.id,
                    clause_title=c.title,
                    original_text=c.text,
                    revised_text=revised_text,
                    reason=corr_data["reason"],
                    legal_doctrine=corr_data.get("legal_doctrine"),
                    status="pending",
                    diff_tokens=diff_tokens
                )
            )

        db.commit()

        return CorrectionResponse(
            document_id=document_id,
            total_flagged=len(correction_dtos),
            corrections=correction_dtos
        )

    @classmethod
    def rescore_document(cls, document_id: str, updated_clauses: Dict[str, str], db: Session) -> RescoreResponse:
        """
        Re-scores document with accepted revised clause text.
        Calculates before and after scores, delta, and updated criteria breakdown.
        """
        # Fetch current score
        score_rec = db.query(ScoreModel).filter(ScoreModel.document_id == document_id).first()
        before_score = score_rec.overall_score if score_rec else 50.0

        clauses = db.query(ClauseModel).filter(ClauseModel.document_id == document_id).order_by(ClauseModel.clause_index).all()
        change_log = []

        clause_dicts = []
        for c in clauses:
            text = c.text
            if c.id in updated_clauses:
                new_text = updated_clauses[c.id]
                change_log.append({
                    "clause_title": c.title,
                    "summary": f"Accepted revised text for {c.title}",
                    "original_snippet": c.text[:60] + "...",
                    "revised_snippet": new_text[:60] + "..."
                })
                text = new_text

            clause_dicts.append({
                "id": c.id,
                "index": c.clause_index,
                "title": c.title,
                "text": text,
                "start_char": c.start_char,
                "end_char": c.end_char,
                "clause_type": c.clause_type,
                "score": c.score,
                "risk_level": c.risk_level
            })

        # Assemble full updated text
        full_updated_text = "\n\n".join([f"{c['title']}\n{c['text']}" for c in clause_dicts])

        # Run re-analysis
        analysis = ScoringEngine.analyze_document(document_id, full_updated_text, clause_dicts)
        after_score = analysis["overall_score"]
        delta = round(after_score - before_score, 1)

        from backend.app.schemas.score import CriterionScoreDTO, DeductionDTO
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

        return RescoreResponse(
            document_id=document_id,
            before_score=before_score,
            after_score=after_score,
            delta=delta,
            improved=after_score >= before_score,
            breakdown=breakdown_dto,
            change_log=change_log
        )
