import re
from typing import List, Dict, Any, Optional

class RulesEngine:
    """
    Deterministic Legal Rules & Doctrine Engine.
    Executes regex and pattern heuristics to detect contractual flaws,
    statutory violations, one-sided provisions, and missing protective terms.
    """

    STATUTORY_RULES = [
        # LEGAL RISK
        {
            "id": "RULE_UNLIMITED_LIABILITY",
            "criterion": "legal_risk",
            "points": 20.0,
            "pattern": r"(?:unlimited\s+liability|no\s+limitation\s+of\s+liability|shall\s+have\s+unlimited\s+liability)",
            "reason": "Imposes uncapped, unlimited financial liability without risk ceiling.",
            "remedy": "Cap aggregate liability to fees paid in preceding 12 months or mutually agreed amount.",
            "clause_types": ["LIABILITY", "INDEMNITY", "GENERAL"]
        },
        {
            "id": "RULE_UNILATERAL_ARBITRATOR",
            "criterion": "legal_risk",
            "points": 15.0,
            "pattern": r"(?:sole\s+arbitrator\s+appointed\s+unilaterally|appointed\s+solely\s+by\s+(?:the\s+)?(?:client|employer|landlord)|unilateral\s+appointment\s+of\s+arbitrator)",
            "reason": "Unilateral appointment of a sole arbitrator violates neutral arbitration principles (e.g. Perkins Eastman doctrine).",
            "remedy": "Require mutual consensus on arbitrator appointment or appointment through an established arbitral body.",
            "clause_types": ["GOVERNING_LAW", "GENERAL"]
        },
        {
            "id": "RULE_RESTRAINT_OF_TRADE",
            "criterion": "legal_risk",
            "points": 20.0,
            "pattern": r"(?:not\s+(?:directly\s+or\s+indirectly\s+)?provide\s+any\s+(?:services|work)\s+to\s+any\s+competitor|(?:10|5|7)\s+years\s+following\s+termination|anywhere\s+in\s+the\s+world|perpetual\s+non-compete|restraint\s+of\s+trade)",
            "reason": "Overly broad post-termination non-compete covenants are void as unlawful restraint of trade in many jurisdictions (e.g., Sec 27 Indian Contract Act).",
            "remedy": "Limit non-compete strictly to the term of engagement or narrow geographic/temporal scope.",
            "clause_types": ["NON_COMPETE", "GENERAL"]
        },
        {
            "id": "RULE_WAIVER_OF_LEGAL_ACTION",
            "criterion": "legal_risk",
            "points": 25.0,
            "pattern": r"(?:prohibited\s+from\s+filing\s+any\s+complaint|waives\s+all\s+rights?\s+to\s+(?:sue|appeal|police|court)|perpetual\s+gag)",
            "reason": "Absolute restraint of legal proceedings or waiver of right to report fraud/crimes is void under public policy.",
            "remedy": "Remove litigation forfeiture clauses; permit standard access to legal remedies.",
            "clause_types": ["GOVERNING_LAW", "CONFIDENTIALITY", "GENERAL"]
        },
        {
            "id": "RULE_USURIOUS_PENALTY",
            "criterion": "legal_risk",
            "points": 15.0,
            "pattern": r"(?:deduct\s+15%\s+per\s+day|compound\s+interest\s+of\s+[1-9][0-9]%|punitive\s+damages\s+of\s+100%)",
            "reason": "Disproportionate liquidated damages operate as an unenforceable penal penalty.",
            "remedy": "Replace with a reasonable pre-estimate of direct losses capped at 5-10% of milestone value.",
            "clause_types": ["PAYMENT", "LIABILITY", "GENERAL"]
        },

        # FAIRNESS
        {
            "id": "RULE_INDEMNIFY_OWN_NEGLIGENCE",
            "criterion": "fairness",
            "points": 20.0,
            "pattern": r"(?:including\s+claims\s+caused\s+(?:solely\s+)?by\s+the\s+client'?s?\s+own\s+negligence|willful\s+misconduct|client'?s?\s+own\s+fraud)",
            "reason": "Grossly asymmetric indemnification requiring contractor to indemnify client against client's own fault or misconduct.",
            "remedy": "Exclude indemnified party's gross negligence, willful misconduct, or bad faith.",
            "clause_types": ["INDEMNITY", "GENERAL"]
        },
        {
            "id": "RULE_ASYMMETRIC_LIABILITY_CAP",
            "criterion": "fairness",
            "points": 20.0,
            "pattern": r"(?:not\s+exceed\s+the\s+sum\s+of\s+\$10|\bexceed\s+(?:the\s+sum\s+of\s+)?\$10(?:\.00)?\b|nominal\s+liability\s+of\s+\$1)",
            "reason": "Extreme liability imbalance where one party's liability is capped at a trivial nominal sum ($10) while the other remains uncapped.",
            "remedy": "Make liability caps mutual and tied to proportionate contract consideration.",
            "clause_types": ["LIABILITY", "GENERAL"]
        },
        {
            "id": "RULE_ASYMMETRIC_PAYMENT_TERMS",
            "criterion": "fairness",
            "points": 15.0,
            "pattern": r"(?:overdue\s+payments?\s+(?:owed\s+by\s+client\s+)?shall\s+bear\s+0%\s+interest|0%\s+interest\s+on\s+overdue)",
            "reason": "One-sided payment terms exempting client from default interest while penalizing service provider.",
            "remedy": "Include standard mutual statutory interest (e.g. 1.5% per month or prime rate) on undisputed overdue invoices.",
            "clause_types": ["PAYMENT", "GENERAL"]
        },
        {
            "id": "RULE_UNILATERAL_IMMEDIATE_TERMINATION",
            "criterion": "fairness",
            "points": 15.0,
            "pattern": r"(?:terminate\s+this\s+Agreement\s+immediately.*without\s+paying\s+for\s+any\s+completed|no\s+right\s+to\s+terminate\s+this\s+Agreement\s+under\s+any\s+circumstance)",
            "reason": "Unilateral termination without paying for completed work and depriving counterparty of reciprocal termination rights.",
            "remedy": "Provide mutual 30-day written notice and ensure payment for all bona fide deliverables completed prior to termination.",
            "clause_types": ["TERMINATION", "GENERAL"]
        },
        {
            "id": "RULE_IP_FORFEITURE",
            "criterion": "fairness",
            "points": 20.0,
            "pattern": r"(?:whether\s+developed\s+prior\s+to\s+this\s+Agreement\s+or\s+independently.*become\s+the\s+sole\s+and\s+exclusive\s+property|pre-existing\s+tools.*forfeited)",
            "reason": "Forces broad expropriation of contractor's background IP and pre-existing proprietary tools.",
            "remedy": "Retain ownership of background IP; grant client a non-exclusive license only to custom project deliverables.",
            "clause_types": ["INTELLECTUAL_PROPERTY", "GENERAL"]
        },
        {
            "id": "RULE_UNILATERAL_ENTRY",
            "criterion": "fairness",
            "points": 15.0,
            "pattern": r"(?:enter\s+premises\s+at\s+any\s+hour.*without\s+prior\s+notice|enter\s+at\s+any\s+time\s+without\s+explanation)",
            "reason": "Unrestricted landlord entry without notice breaches the covenant of quiet enjoyment.",
            "remedy": "Require minimum 24-48 hours advance written notice for inspection during normal business hours, except in emergencies.",
            "clause_types": ["GENERAL"]
        },
        {
            "id": "RULE_UNILATERAL_DEPOSIT_FORFEITURE",
            "criterion": "fairness",
            "points": 15.0,
            "pattern": r"(?:forfeit\s+the\s+entire\s+deposit\s+immediately\s+for\s+any\s+minor\s+covenant|forfeit\s+deposit\s+without\s+notice)",
            "reason": "Immediate forfeiture of security deposit for minor infractions without notice or cure opportunity.",
            "remedy": "Require 14-day written notice to cure default, with deductions limited strictly to actual documented repair costs.",
            "clause_types": ["PAYMENT", "GENERAL"]
        },

        # CLARITY
        {
            "id": "RULE_UNILATERAL_SCOPE_EXPANSION",
            "criterion": "clarity",
            "points": 15.0,
            "pattern": r"(?:unilaterally\s+expand\s+the\s+scope\s+at\s+any\s+point\s+without\s+adjusting|change\s+scope\s+without\s+fee\s+adjustment)",
            "reason": "Vague scope modification mechanism permitting unbounded scope creep without compensation adjustments.",
            "remedy": "Mandate written Change Orders signed by both parties specifying scope, schedule, and fee impact.",
            "clause_types": ["GENERAL"]
        },
        {
            "id": "RULE_AMBIGUOUS_LEGALESE",
            "criterion": "clarity",
            "points": 5.0,
            "pattern": r"(?:heretofore|wherefore|save\s+and\s+except|notwithstanding\s+anything\s+to\s+the\s+contrary\s+hereinbefore)",
            "reason": "Excessive archaic legalese that obfuscates contractual intent.",
            "remedy": "Rephrase in clear, modern, plain language.",
            "clause_types": ["GENERAL"]
        },

        # COMPLIANCE
        {
            "id": "RULE_OFFSHORE_TAX_HAVEN",
            "criterion": "compliance",
            "points": 10.0,
            "pattern": r"(?:laws\s+of\s+the\s+Cayman\s+Islands|courts\s+of\s+Bermuda|exclusive\s+personal\s+jurisdiction\s+of\s+courts\s+located\s+therein,\s+regardless\s+of)",
            "reason": "Imposes inaccessible offshore tax haven jurisdiction on domestic operational counterparty.",
            "remedy": "Set governing law and dispute forum to the jurisdiction where services are actually performed.",
            "clause_types": ["GOVERNING_LAW", "GENERAL"]
        },
        {
            "id": "RULE_TAX_OR_STAMP_EVASION",
            "criterion": "compliance",
            "points": 25.0,
            "pattern": r"(?:unrecorded\s+cash|evade\s+stamp\s+duty|undervalue\s+consideration|not\s+register\s+this\s+conveyance)",
            "reason": "Provisions attempting to evade statutory registration, transfer stamp duties, or mandatory tax disclosures.",
            "remedy": "Declare accurate market consideration and comply with statutory registration requirements.",
            "clause_types": ["GENERAL", "PAYMENT"]
        }
    ]

    REQUIRED_CLAUSES_BY_TYPE = {
        "NDA": [
            ("CONFIDENTIALITY", "Definition and treatment of Confidential Information"),
            ("EXCLUSIONS", "Standard exclusions from confidentiality (public info, independent dev)"),
            ("RETURN_MATERIALS", "Obligation to return or destroy confidential materials"),
            ("GOVERNING_LAW", "Governing law and jurisdiction")
        ],
        "SERVICES": [
            ("SCOPE", "Scope of work and deliverables"),
            ("PAYMENT", "Payment terms and invoicing"),
            ("TERMINATION", "Termination clause with notice and cure period"),
            ("LIABILITY", "Balanced limitation of liability"),
            ("GOVERNING_LAW", "Governing law and dispute resolution")
        ],
        "LEASE": [
            ("PREMISES", "Identification of leased premises and permitted use"),
            ("RENT", "Rent payment and escalation provisions"),
            ("SECURITY_DEPOSIT", "Security deposit return and deduction terms"),
            ("TERMINATION", "Default, notice, and termination remedies")
        ],
        "EMPLOYMENT": [
            ("DUTIES", "Position, role, and reporting structure"),
            ("COMPENSATION", "Compensation, benefits, and payment schedule"),
            ("TERMINATION", "Termination procedure and notice period")
        ]
    }

    @classmethod
    def evaluate_clause(cls, clause: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Runs all pattern rules against an individual clause.
        Returns list of triggered deduction objects.
        """
        deductions = []
        text = clause["text"]
        
        for rule in cls.STATUTORY_RULES:
            match = re.search(rule["pattern"], text, re.IGNORECASE)
            if match:
                trigger_snippet = match.group(0)
                # Extract surrounding context
                start_ctx = max(0, match.start() - 25)
                end_ctx = min(len(text), match.end() + 25)
                surrounding = text[start_ctx:end_ctx].strip()

                deductions.append({
                    "id": rule["id"],
                    "clause_id": clause.get("id"),
                    "clause_title": clause.get("title", f"Clause {clause.get('index', '')}"),
                    "criterion": rule["criterion"],
                    "points": rule["points"],
                    "reason": rule["reason"],
                    "trigger_text": f"...{surrounding}..." if len(surrounding) < len(text) else trigger_snippet,
                    "source": "rule",
                    "remedy_hint": rule["remedy"]
                })

        return deductions

    @classmethod
    def evaluate_completeness(cls, doc_type: str, present_types: List[str]) -> List[Dict[str, Any]]:
        """
        Checks missing essential clauses based on document type.
        """
        missing_deductions = []
        reqs = cls.REQUIRED_CLAUSES_BY_TYPE.get(doc_type.upper(), cls.REQUIRED_CLAUSES_BY_TYPE["SERVICES"])
        
        for c_id, description in reqs:
            if not any(c_id in pt.upper() for pt in present_types):
                missing_deductions.append({
                    "id": f"MISSING_{c_id}",
                    "clause_id": None,
                    "clause_title": "Document Completeness Checklist",
                    "criterion": "completeness",
                    "points": 15.0,
                    "reason": f"Missing standard protective clause: {description}",
                    "trigger_text": f"Absence of standard '{c_id}' provision in agreement",
                    "source": "rule",
                    "remedy_hint": f"Incorporate a standard '{description}' clause."
                })

        return missing_deductions
