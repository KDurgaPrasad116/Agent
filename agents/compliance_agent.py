# agents/compliance_agent.py
import re

ILLEGAL_PATTERNS = [
    (r"waives?\s+all\s+rights",            "Blanket rights waiver"),
    (r"unlimited\s+indemnif",              "Unlimited indemnification"),
    (r"no\s+class\s+action",               "Class action waiver"),
    (r"unilateral(ly)?\s+(amend|modify)",  "Unilateral amendment right"),
    (r"no\s+refund",                       "No-refund clause"),
    (r"perpetual.*irrevocable",            "Perpetual + irrevocable grant"),
    (r"personal\s+(data|info).*sell",      "Sale of personal data"),
    (r"arbitration\s+only",               "Mandatory arbitration only"),
]

class ComplianceAgent:
    def __init__(self):
        self._rag = None

    def _get_rag(self):
        if self._rag is None:
            try:
                from rag.retriever import RAGRetriever
                self._rag = RAGRetriever()
            except Exception:
                self._rag = "unavailable"
        return self._rag if self._rag != "unavailable" else None

    def run(self, clause: str) -> dict:
        is_legal = True
        reason   = None

        for pattern, msg in ILLEGAL_PATTERNS:
            if re.search(pattern, clause, re.IGNORECASE):
                is_legal = False
                reason   = msg
                break

        rag_context = None
        rag = self._get_rag()
        if rag:
            try:
                rag_context = rag.retrieve(clause)
            except Exception:
                pass

        return {
            "is_legal":          is_legal,
            "illegality_reason": reason,
        }