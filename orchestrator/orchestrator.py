from agents.input_agent import InputAgent
from agents.clause_splitter_agent import ClauseSplitterAgent
from agents.classifier_agent import ClassifierAgent
from agents.compliance_agent import ComplianceAgent
from agents.risk_agent import RiskAgent
from agents.decision_agent import DecisionAgent
from schemas.schemas import ClauseResult, DocumentReport


class Orchestrator:
    def __init__(self):
        self.input_agent      = InputAgent()
        self.splitter_agent   = ClauseSplitterAgent()
        self.classifier_agent = ClassifierAgent()
        self.compliance_agent = ComplianceAgent()
        self.risk_agent       = RiskAgent()
        self.decision_agent   = DecisionAgent()

    def run(self, file) -> DocumentReport:
        # Stage 1 — Extract text
        text = self.input_agent.run(file)

        # Stage 2 — Split into clauses
        clauses = self.splitter_agent.run(text)

        results = []
        for clause in clauses:
            # Stage 3 — Classify
            classification = self.classifier_agent.run(clause)

            # Stage 4 — Compliance + RAG
            compliance = self.compliance_agent.run(clause)

            # Stage 5 — Risk scoring
            risk = self.risk_agent.run(
                clause,
                clause_type=classification["type"],
                is_legal=compliance["is_legal"],
            )

            # Stage 6 — Clause-level action
            if not compliance["is_legal"] or risk["risk_score"] >= 8:
                action = "Reject"
            elif risk["risk_score"] >= 5 or classification["type"] == "Negative":
                action = "Review"
            else:
                action = "Accept"

            results.append({
                "clause":            clause,
                "type":              classification["type"],
                "is_legal":          compliance["is_legal"],
                "illegality_reason": compliance["illegality_reason"],
                "risk_score":        risk["risk_score"],
                "benefit_score":     risk["benefit_score"],
                "risk_factors":      risk["risk_factors"],
<<<<<<< HEAD
=======
                "rag_context":       compliance["rag_context"],
>>>>>>> 3a27112 (Pushing major agent changes)
                "explanation": (
                    f"{classification['type']} clause. "
                    f"Risk: {risk['risk_score']}/10. "
                    f"{'ILLEGAL: ' + compliance['illegality_reason'] if not compliance['is_legal'] else 'Legal.'}"
                ),
                "action": action,
            })

        # Stage 7 — Final decision
        summary = self.decision_agent.run(results)

        return DocumentReport(
            total_clauses=len(results),
            clauses=[ClauseResult(**r) for r in results],
            **summary,
        )