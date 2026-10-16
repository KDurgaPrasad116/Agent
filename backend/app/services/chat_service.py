from typing import Dict, Any, List
from sqlalchemy.orm import Session

from backend.app.models.document import DocumentModel
from backend.app.models.clause import ClauseModel
from backend.app.models.score import DeductionModel


class ChatService:
    _history: Dict[str, List[Dict[str, str]]] = {}

    @classmethod
    def chat(cls, session_id: str, question: str, db: Session) -> Dict[str, Any]:
        history = cls._history.setdefault(session_id, [])
        turn = len(history) // 2 + 1

        doc = db.query(DocumentModel).filter(DocumentModel.id == session_id).first()
        clauses = (
            db.query(ClauseModel)
            .filter(ClauseModel.document_id == session_id)
            .order_by(ClauseModel.clause_index)
            .all()
            if doc
            else []
        )
        deductions = (
            db.query(DeductionModel)
            .filter(DeductionModel.document_id == session_id)
            .all()
            if doc
            else []
        )

        ranked = cls._rank_clauses(question, clauses)
        context_bits = []
        for clause in ranked[:3]:
            excerpt = clause.text.strip().replace("\n", " ")
            if len(excerpt) > 280:
                excerpt = excerpt[:277] + "…"
            context_bits.append(f"{clause.title}: {excerpt}")
        context_used = " | ".join(context_bits) if context_bits else "No matching clause found."

        answer = cls._compose_answer(question, doc, ranked, deductions)
        history.append({"role": "user", "content": question})
        history.append({"role": "assistant", "content": answer})

        return {
            "session_id": session_id,
            "question": question,
            "answer": answer,
            "context_used": context_used,
            "turn": turn,
            "source": "document",
        }

    @classmethod
    def history(cls, session_id: str) -> List[Dict[str, str]]:
        return cls._history.get(session_id, [])

    @classmethod
    def clear(cls, session_id: str) -> None:
        cls._history.pop(session_id, None)

    @staticmethod
    def _rank_clauses(question: str, clauses: List[ClauseModel]) -> List[ClauseModel]:
        words = [w for w in question.lower().split() if len(w) > 3]
        scored = []
        for clause in clauses:
            hay = f"{clause.title} {clause.text}".lower()
            score = sum(1 for w in words if w in hay)
            if clause.risk_level in ("DANGER", "WARNING"):
                score += 0.4
            scored.append((score, clause))
        scored.sort(key=lambda pair: pair[0], reverse=True)
        if scored and scored[0][0] > 0:
            return [c for s, c in scored if s > 0]
        return [c for _, c in scored]

    @staticmethod
    def _compose_answer(question: str, doc, clauses: List[ClauseModel], deductions) -> str:
        if not doc:
            return (
                "I don't have a document loaded for this chat yet. "
                "Open a contract in the workspace, then ask again."
            )

        q = question.lower()
        risky = [c for c in clauses if c.risk_level in ("DANGER", "WARNING")]
        lines = []

        if any(k in q for k in ("liability", "cap", "damages", "indemnif")):
            focus = next((c for c in clauses if "liab" in (c.title + c.text).lower() or "indemn" in (c.title + c.text).lower()), None)
            if focus:
                lines.append(f"Look at {focus.title}. It sets who pays if something goes wrong.")
                lines.append(focus.text.strip()[:420])
            elif risky:
                lines.append(f"The riskiest related clause is {risky[0].title}.")
                lines.append(risky[0].text.strip()[:420])
        elif any(k in q for k in ("terminat", "notice", "cancel", "exit")):
            focus = next((c for c in clauses if "terminat" in (c.title + c.text).lower()), None)
            if focus:
                lines.append(f"{focus.title} covers how either side can end the deal.")
                lines.append(focus.text.strip()[:420])
        elif any(k in q for k in ("non-compete", "noncompete", "compete", "solicit")):
            focus = next((c for c in clauses if "compete" in (c.title + c.text).lower() or "solicit" in (c.title + c.text).lower()), None)
            if focus:
                lines.append(f"{focus.title} restricts future work. Broad or long restraints are often hard to enforce.")
                lines.append(focus.text.strip()[:420])
        elif clauses:
            top = clauses[0]
            lines.append(f"Closest match is {top.title} (risk: {top.risk_level.replace('_', ' ').title()}).")
            lines.append(top.text.strip()[:420])

        if deductions:
            lines.append("")
            lines.append("Flags already noted on this file:")
            for d in deductions[:4]:
                lines.append(f"• {d.reason}")

        lines.append("")
        lines.append("This is a reading aid, not legal advice. If money or liability is at stake, have a lawyer review it.")
        return "\n".join(lines).strip()
