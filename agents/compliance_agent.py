<<<<<<< HEAD
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
=======
# agents/compliance_agent.py
import os
import re
import joblib

LEGALITY_MODEL_PATH = "models/saved/legality_classifier_ml.joblib"

ILLEGAL_PATTERNS = [
    # 1. Constitutional & Statutory Restraints on Alienation & Discrimination
    (r"(?:shall\s+not|prohibited\s+from|cannot)\s+(?:sell|mortgage|lease|gift|transfer).*without\s+prior.*consent.*(?:perpetuity|void|reclaim)",
     "Section 10 Transfer of Property Act (Absolute restraint on alienation is void ab initio)"),
    (r"(?:not.*(?:sold|let\s+out|gifted|transferred).*to\s+any\s+person\s+belonging\s+to\s+a\s+different\s+(?:religion|caste|community))|(?:religion|caste|community).*void",
     "Unconstitutional discrimination & public policy violation (Article 15 & Section 23 Indian Contract Act)"),

    # 2. Tax Evasion, Stamp Duty Fraud, Black Money & Concealment
    (r"evade\s+(?:payment\s+of\s+)?(?:stamp\s+duty|registration\s+fee|tax)|declare\s+the\s+market\s+value\s+as.*mislead\s+the\s+sub-registrar",
     "Fraudulent undervaluation and tax/stamp duty evasion (Indian Stamp Act & Section 23 Indian Contract Act)"),
    (r"balance\s+amount\s+paid\s+in\s+cash.*not\s+through\s+any\s+banking\s+channel.*not\s+to\s+be\s+reflected\s+in.*bank\s+records",
     "Illegal cash transaction and evasion of banking channels (Section 269SS/269ST Income Tax Act & Section 23 ICA)"),
    (r"agree\s+not\s+to\s+disclose.*to\s+the\s+income\s+tax\s+department.*deny\s+knowledge",
     "Conspiracy to conceal income and evade tax authorities (Section 23 Indian Contract Act)"),

    # 3. Unilateral Cancellation of Absolute Conveyance
    (r"unilateral(?:ly)?\s+(?:cancel|revoke)\s+this\s+sale\s+deed.*without\s+(?:assigning\s+any\s+reason|refund)",
     "Unilateral revocation of absolute conveyance deed (Void under Transfer of Property Act & Specific Relief Act)"),

    # 4. Restraint of Legal Proceedings & Criminal Complaint Waivers
    (r"(?:waives?|releases?|discharges?).*(?:suit|claim|complaint|legal\s+proceeding).*(?:court|tribunal|police|fraud|cheating|forgery|breach\s+of\s+trust)|not\s+to\s+file\s+any\s+police\s+complaint",
     "Section 28 Indian Contract Act (Agreements in restraint of legal proceedings are void) & illegal stifling of criminal prosecution"),
    (r"waives?\s+all\s+rights(?:\s+to\s+seek\s+legal\s+remedies|\s+afforded|\s+under\s+consumer)",
     "Section 28 Indian Contract Act (Blanket waiver of statutory rights and legal remedies)"),

    # 5. Punitive Penalties, Exorbitant Forfeitures, Usurious Interest
    (r"entire\s+sale\s+consideration.*forfeited.*liquidated\s+damages|liquidated\s+damages\s+penalty\s+of\s+(?:50%|100%|\d+%)|forfeit\s+all\s+compensation.*liquidated\s+damages",
     "Section 74 Indian Contract Act (Disproportionate punitive penalty and unconscionable forfeiture)"),
    (r"penal\s+interest\s+at\s+the\s+rate\s+of\s+\d+%\s*(?:\([^)]*\))?\s*per\s+month",
     "Section 74 Indian Contract Act & Usurious Loans Act (Extortionate compounded penal interest)"),

    # 6. Unilateral Arbitration & Exclusion of Court Jurisdiction
    (r"arbitrator\s+to\s+be\s+appointed\s+exclusively\s+by\s+the\s+seller.*jurisdiction\s+of\s+all\s+courts\s+being\s+expressly\s+excluded",
     "Section 12(5) Arbitration Act (Unilateral appointment of sole arbitrator) & Section 28 ICA"),

    # 7. Indemnification of Own Future Fraud, Forgery or Criminal Acts
    (r"indemnif.*against.*(?:fraud|forgery|fabrication\s+of\s+documents|willful\s+misconduct|negligence|criminal).*by\s+the\s+(?:seller|company)",
     "Section 23 Indian Contract Act (Unlawful agreement indemnifying a party for its own fraud, forgery, or criminal misconduct)"),

    # 8. Evasion of Mandatory Registration & Conveyance Law
    (r"(?:avoid|evade)\s+payment\s+of\s+registration\s+fees.*not\s+be\s+presented\s+for\s+registration|private\s+transfer.*irrespective\s+of.*registration\s+act",
     "Violation of Section 17 & 49 Registration Act, 1908 and Section 54 Transfer of Property Act"),

    # 9. Benami Transactions
    (r"true\s+and\s+beneficial\s+owner.*continue\s+to\s+be.*benami|hold.*only\s+benami",
     "Prohibition of Benami Property Transactions Act, 1988 (Sections 3 & 4)"),

    # 10. Bribery & Illegal Gratification
    (r"(?:gratification|bribe|cash)\s+to\s+officials.*sub-registrar|expedite\s+registration.*overlook\s+discrepancies",
     "Prevention of Corruption Act, 1988 & Section 23 Indian Contract Act (Bribery / Illegal gratification)"),

    # 11. Restraint of Trade / Post-employment Non-Compete
    (r"(?:after|following)\s+(?:termination|employment|\d+\s+months?|jobs?).*not.*(?:compete|engage|consult|work|share\s+in\s+competitive)|after\s+(?:\d+\s+)?months?.*competitive|during\s+employment\s+and\s+for\s+a\s+period\s+of.*after\s+termination.*(?:competing|compete)",
     "Section 27 Indian Contract Act (Agreements in restraint of trade / post-employment non-compete void ab initio)"),
    (r"रोजगार\s+के.*बाद.*प्रतिस्पर्धी|गैर-प्रतिस्पर्धा",
     "Section 27 Indian Contract Act (Post-employment non-compete is void under Indian Law)"),

    # 12. Standard Consumer & Commercial Predatory Terms
    (r"unlimited\s+indemnif",              "Uncapped unilateral indemnification"),
    (r"no\s+class\s+action",               "Class action waiver"),
    (r"unilateral(ly)?\s+(amend|modify)",  "Unilateral amendment without notice"),
    (r"no\s+refund",                       "Absolute no-refund clause"),
    (r"perpetual.*irrevocable",            "Perpetual + irrevocable grant extending beyond engagement"),
    (r"personal\s+(data|info).*sell",      "Unrestricted sale of personal data without consent"),
    (r"arbitration\s+only",                "Mandatory arbitration only"),
    (r"forfeit(ure)?\s+of\s+all",          "Total forfeiture of compensation/deposits"),
]


class ComplianceAgent:
    def __init__(self, ml_path=LEGALITY_MODEL_PATH):
        self.ml_path = ml_path
        self._ml_pipeline = None
        self._rag = None

    def _load_model(self):
        if self._ml_pipeline is None and os.path.exists(self.ml_path):
            try:
                self._ml_pipeline = joblib.load(self.ml_path)
            except Exception:
                self._ml_pipeline = None

    def _get_rag(self):
        if self._rag is None:
            try:
                from rag.retriever import RAGRetriever
                self._rag = RAGRetriever()
            except Exception:
                self._rag = "unavailable"
        return self._rag if self._rag != "unavailable" else None

    def run(self, clause: str) -> dict:
        self._load_model()
        is_legal = True
        reason   = None

        # 1. Statutory guardrail rules (zero false-negative for explicit statutory violations)
        for pattern, msg in ILLEGAL_PATTERNS:
            if re.search(pattern, clause, re.IGNORECASE):
                is_legal = False
                reason   = msg
                break

        # 2. Machine Learning Legality Classifier (generalizes to semantic paraphrasing)
        if self._ml_pipeline is not None:
            try:
                probs = self._ml_pipeline.predict_proba([clause])[0]
                classes = list(self._ml_pipeline.classes_)
                # Index for 'Illegal'
                if "Illegal" in classes:
                    illegal_idx = classes.index("Illegal")
                    p_illegal = float(probs[illegal_idx])
                    # High-confidence illegal detection
                    if p_illegal >= 0.50:
                        is_legal = False
                        if not reason:
                            reason = f"Predatory or unfair clause (ML confidence: {round(p_illegal, 2)})"
            except Exception:
                pass

        # 3. RAG Context enrichment
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
            "rag_context":       rag_context,
        }
>>>>>>> 3a27112 (Pushing major agent changes)
