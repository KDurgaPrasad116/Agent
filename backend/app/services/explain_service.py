from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.clause import ClauseModel
from backend.app.models.score import DeductionModel
from backend.app.schemas.explain import ClauseExplanationDTO, LegalTermDTO
from backend.app.services.llm_client import LLMClient

class ExplainService:
    @classmethod
    def explain_clause(cls, clause_id: str, lang: str, db: Session) -> ClauseExplanationDTO:
        clause = db.query(ClauseModel).filter(ClauseModel.id == clause_id).first()
        if not clause:
            raise ValueError(f"Clause with ID {clause_id} not found.")

        # Fetch deductions for this clause
        deductions = db.query(DeductionModel).filter(DeductionModel.clause_id == clause_id).all()
        issue_descriptions = [f"{d.criterion.upper()}: {d.reason}" for d in deductions]

        llm = LLMClient()
        data = llm.generate_clause_explanation(clause.text, clause.title, issue_descriptions)

        legal_terms = [
            LegalTermDTO(
                term=t["term"],
                definition=t["definition"],
                context=t.get("context", "Legal concept")
            )
            for t in data.get("legal_terms", [])
        ]

        # Handle language toggle
        plain_english = data.get("plain_english", "")
        regional = data.get("regional_language_translation", {})
        
        # If user explicitly requested Hindi and we have it
        if lang == "hi" and regional and "hi" in regional:
            display_text = regional["hi"]
        else:
            display_text = plain_english

        return ClauseExplanationDTO(
            clause_id=clause.id,
            clause_title=clause.title,
            plain_english=display_text,
            what_this_means_for_you=data.get("what_this_means_for_you", ""),
            risk_flag=clause.risk_level,
            risk_reason="; ".join(issue_descriptions) if issue_descriptions else "No high-risk statutory violations detected in this clause.",
            legal_terms=legal_terms,
            questions_for_lawyer=data.get("questions_for_lawyer", []),
            regional_language_translation=regional
        )
