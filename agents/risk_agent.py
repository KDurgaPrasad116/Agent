<<<<<<< HEAD
import re

HIGH_RISK = [
    "penalty", "termination", "liability", "indemnif",
    "breach", "forfeit", "liquidated damages", "consequential"
]
MED_RISK = [
    "warranty", "representation", "confidential",
    "exclusiv", "intellectual property", "non-compete"
]
LOW_RISK = ["notice", "payment", "delivery", "schedule"]

class RiskAgent:
    def run(self, clause: str, clause_type: str, is_legal: bool) -> dict:
        text = clause.lower()
        factors = []
        score = 5  # baseline

        for kw in HIGH_RISK:
            if kw in text:
                score += 2
                factors.append(f"High-risk term: '{kw}'")

        for kw in MED_RISK:
            if kw in text:
                score += 1
                factors.append(f"Medium-risk term: '{kw}'")

        for kw in LOW_RISK:
            if kw in text:
                score -= 1

        if not is_legal:
            score += 3
            factors.append("Contains potentially illegal clause")

        if clause_type == "Negative":
            score += 1

        # Benefit score (inverse of risk for unfair clauses, else from type)
        benefit = max(1, 10 - score) if clause_type == "Negative" else \
                  min(10, 10 - score + 4) if clause_type == "Positive" else 5

        return {
            "risk_score": max(1, min(10, score)),
            "benefit_score": max(1, min(10, benefit)),
            "risk_factors": factors
        }
=======
import re

HIGH_RISK = [
    "penalty", "termination", "liability", "indemnif",
    "breach", "forfeit", "liquidated damages", "consequential",
    "unilateral", "waive", "irrevocable", "perpetual", "no refund"
]
MED_RISK = [
    "warranty", "representation", "confidential",
    "exclusiv", "intellectual property", "non-compete",
    "arbitration", "dispute", "governing law", "jurisdiction"
]
LOW_RISK = ["notice", "payment", "delivery", "schedule", "invoice", "receipt"]

class RiskAgent:
    def run(self, clause: str, clause_type: str, is_legal: bool) -> dict:
        text = clause.lower()
        factors = []
        score = 5  # baseline

        for kw in HIGH_RISK:
            if kw in text:
                score += 2
                factors.append(f"High-risk term: '{kw}'")

        for kw in MED_RISK:
            if kw in text:
                score += 1
                factors.append(f"Medium-risk term: '{kw}'")

        for kw in LOW_RISK:
            if kw in text:
                score -= 1

        if not is_legal:
            score += 3
            factors.append("Illegal or predatory clause detected")

        if clause_type == "Negative":
            score += 1
            factors.append("Negative/restrictive obligation")
        elif clause_type == "Positive":
            score -= 1

        score = max(1, min(10, score))

        # Benefit score
        if not is_legal:
            benefit = 1
        elif clause_type == "Negative":
            benefit = max(1, 10 - score)
        elif clause_type == "Positive":
            benefit = min(10, max(6, 11 - score))
        else:
            benefit = 5

        return {
            "risk_score": score,
            "benefit_score": benefit,
            "risk_factors": factors
        }
>>>>>>> 3a27112 (Pushing major agent changes)
