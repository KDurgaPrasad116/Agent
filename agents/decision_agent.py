from schemas.schemas import DocumentReport

WEIGHTS = {
    "risk_score": 0.40,
    "benefit_score": 0.25,
    "illegal_penalty": 0.35,
}

class DecisionAgent:
    def run(self, clause_results: list) -> dict:
        if not clause_results:
            return {"decision": "Needs Review", "reasoning": "No clauses found."}

        n = len(clause_results)
        avg_risk    = sum(c["risk_score"]    for c in clause_results) / n
        avg_benefit = sum(c["benefit_score"] for c in clause_results) / n
        illegal_count = sum(1 for c in clause_results if not c["is_legal"])
        illegal_ratio = illegal_count / n

        # Weighted danger score (0–10, higher = more dangerous)
        danger = (
            avg_risk    * WEIGHTS["risk_score"] * 1.0 +
            (10 - avg_benefit) * WEIGHTS["benefit_score"] * 1.0 +
            illegal_ratio * 10 * WEIGHTS["illegal_penalty"]
        )

        if danger >= 7.0 or illegal_count >= 3:
            decision = "Do Not Sign"
            reasoning = (
                f"Danger score {danger:.1f}/10. "
                f"{illegal_count} illegal/unfair clauses detected. "
                f"Avg risk {avg_risk:.1f}, avg benefit {avg_benefit:.1f}."
            )
        elif danger >= 4.5 or illegal_count >= 1:
            decision = "Needs Review"
            reasoning = (
                f"Danger score {danger:.1f}/10. "
                f"Flagged clauses present. Legal review recommended before signing."
            )
        else:
            decision = "Safe to Sign"
            reasoning = (
                f"Danger score {danger:.1f}/10. "
                f"No illegal clauses found. Risk is within acceptable range."
            )

        return {
            "overall_risk_score": round(avg_risk, 1),
            "overall_benefit_score": round(avg_benefit, 1),
            "illegal_clause_count": illegal_count,
            "decision": decision,
            "decision_reasoning": reasoning
        }