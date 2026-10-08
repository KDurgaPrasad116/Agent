from typing import List, Dict, Any, Tuple
from backend.app.config import settings
from backend.app.services.rules_engine import RulesEngine
from backend.app.services.llm_client import LLMClient

class ScoringEngine:
    """
    Explainable, Transparent Legal Scoring Engine.
    Computes mathematical criterion scores, audit trails, and risk bands.
    """

    CRITERIA = ["clarity", "completeness", "fairness", "legal_risk", "compliance"]

    @classmethod
    def analyze_document(cls, document_id: str, raw_text: str, clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        weights = settings.weights_dict
        
        # 1. Run clause-level evaluations
        all_deductions = []
        clause_scores = {}
        present_types = []

        llm = LLMClient()

        for c in clauses:
            present_types.append(c.get("clause_type", "GENERAL"))
            
            # Rule deductions
            rule_deductions = RulesEngine.evaluate_clause(c)
            # Deduplicate by rule id
            seen_rules = set()
            clause_deductions = []
            for d in rule_deductions:
                if d["id"] not in seen_rules:
                    seen_rules.add(d["id"])
                    clause_deductions.append(d)

            # LLM semantic evaluation (if active)
            llm_deductions = llm.analyze_clause_semantics(c["text"], c.get("title", ""))
            for ld in llm_deductions:
                if ld["id"] not in seen_rules:
                    seen_rules.add(ld["id"])
                    clause_deductions.append(ld)

            all_deductions.extend(clause_deductions)

            # Clause-level score
            clause_loss = sum(d["points"] for d in clause_deductions)
            c_score = max(0.0, 100.0 - clause_loss)
            
            # Assign risk level
            if c_score >= 80.0:
                risk_lvl = "SAFE"
            elif c_score >= 50.0:
                risk_lvl = "WARNING"
            else:
                risk_lvl = "DANGER"

            c["score"] = round(c_score, 1)
            c["risk_level"] = risk_lvl
            c["flagged_issues"] = [f"{d['criterion'].upper()}: {d['reason']}" for d in clause_deductions]

        # 2. Document completeness check
        detected_doc_type = cls._infer_doc_type(raw_text, clauses)
        completeness_deductions = RulesEngine.evaluate_completeness(detected_doc_type, present_types)
        all_deductions.extend(completeness_deductions)

        # 3. Aggregate deductions per criterion
        criterion_breakdown = {}
        step_by_step = []

        for crit in cls.CRITERIA:
            crit_deductions = [d for d in all_deductions if d["criterion"] == crit]
            total_loss = sum(d["points"] for d in crit_deductions)
            base_score = 100.0
            crit_score = max(0.0, base_score - total_loss)
            w = weights.get(crit, 0.20)
            weighted_score = round(crit_score * w, 2)

            criterion_breakdown[crit] = {
                "criterion": crit,
                "score": round(crit_score, 1),
                "weight": w,
                "weighted_score": weighted_score,
                "deductions": crit_deductions
            }

            # Derivation trail for this criterion
            if crit_deductions:
                steps = [f"Base 100.0"]
                for d in crit_deductions:
                    target = f"[{d.get('clause_title', 'General')}]"
                    steps.append(f"-{d['points']} ({d['reason']} {target})")
                steps.append(f"= {round(crit_score, 1)}")
                step_by_step.append(f"{crit.upper()}: " + " → ".join(steps))
            else:
                step_by_step.append(f"{crit.upper()}: Base 100.0 (No violations detected) = 100.0")

        # 4. Overall score computation
        overall = sum(criterion_breakdown[c]["weighted_score"] for c in cls.CRITERIA)
        overall = round(max(0.0, min(100.0, overall)), 1)

        # 5. Risk classification
        if overall >= 80.0:
            risk_band = "LOW_RISK"
        elif overall >= 50.0:
            risk_band = "MEDIUM_RISK"
        else:
            risk_band = "HIGH_RISK"

        # Formula representation
        formula = (
            f"Overall = {weights['clarity']}*Clarity + {weights['completeness']}*Completeness + "
            f"{weights['fairness']}*Fairness + {weights['legal_risk']}*LegalRisk + {weights['compliance']}*Compliance"
        )

        global_summary = cls._generate_document_summary(raw_text, detected_doc_type, all_deductions)

        return {
            "document_id": document_id,
            "overall_score": overall,
            "risk_band": risk_band,
            "formula": formula,
            "step_by_step_derivation": step_by_step,
            "criteria": criterion_breakdown,
            "total_deductions_count": len(all_deductions),
            "clauses": clauses,
            "global_summary": global_summary
        }

    @classmethod
    def _infer_doc_type(cls, text: str, clauses: List[Dict[str, Any]]) -> str:
        lower = text.lower()
        if "non-disclosure" in lower or "confidentiality agreement" in lower or "nda" in lower:
            return "NDA"
        if "lease agreement" in lower or "rental agreement" in lower or "landlord" in lower:
            return "LEASE"
        if "employment agreement" in lower or "employee" in lower or "job offer" in lower:
            return "EMPLOYMENT"
        if "sale deed" in lower or "sale agreement" in lower or "conveyance" in lower:
            return "SALE"
        return "SERVICES"

    @classmethod
    def _generate_document_summary(cls, text: str, doc_type: str, deductions: List[Dict[str, Any]]) -> Dict[str, Any]:
        lower = text.lower()
        parties = []
        if "between" in lower and "and" in lower:
            # Extract basic party names if possible
            import re
            m = re.search(r'between\s+([^,\n\(\"]+)[^a-zA-Z0-9]+and\s+([^,\n\(\"]+)', text, re.IGNORECASE)
            if m:
                parties = [m.group(1).strip(), m.group(2).strip()]
            else:
                parties = ["Party 1", "Party 2"]
        else:
            parties = ["Signatory Parties"]

        key_obligations = [
            f"Performance of agreed obligations under {doc_type} standards",
            "Adherence to confidentiality, dispute, and statutory compliance clauses"
        ]

        key_dates_and_amounts = []
        import re
        amounts = re.findall(r'(\$\s?[0-9,]+(?:\.[0-9]{2})?|\b[0-9,]+\s?(?:USD|INR|EUR|Dollars|Rupees))', text)
        if amounts:
            key_dates_and_amounts.extend(amounts[:4])
        else:
            key_dates_and_amounts.append("Specified in individual contract schedules")

        red_flags = [f"[{d.get('clause_title', 'General')}] {d['reason']}" for d in deductions if d['points'] >= 15.0]

        governing_law = "Detected: Standard Domestic Common Law"
        if "cayman islands" in lower:
            governing_law = "Detected: Cayman Islands (Offshore Jurisdiction)"
        elif "delaware" in lower:
            governing_law = "Detected: State of Delaware, USA"
        elif "india" in lower or "new delhi" in lower or "mumbai" in lower:
            governing_law = "Detected: Laws of India"

        return {
            "purpose": f"{doc_type} Agreement governing commercial and operational relationship between the parties.",
            "parties_identified": parties,
            "key_obligations": key_obligations,
            "key_dates_and_amounts": key_dates_and_amounts,
            "red_flags": red_flags[:6],
            "governing_law_detected": governing_law
        }
