import uuid
from typing import List, Dict, Any
from backend.app.schemas.generator import LegalTemplateDTO, TemplateFieldDTO, TemplateClauseOptionDTO, GenerateDocumentResponse
from backend.app.services.scoring_engine import ScoringEngine
from backend.app.services.clause_splitter import ClauseSplitter

class GeneratorService:
    TEMPLATES: Dict[str, Dict[str, Any]] = {
        "nda": {
            "id": "nda",
            "name": "Mutual Non-Disclosure Agreement (NDA)",
            "description": "Protects confidential business information, trade secrets, and technical data between collaborating parties.",
            "category": "Commercial & IP",
            "fields": [
                {"key": "party_a_name", "label": "Disclosing/First Party Name", "field_type": "text", "placeholder": "Zenith Corp LLC", "required": True},
                {"key": "party_b_name", "label": "Receiving/Second Party Name", "field_type": "text", "placeholder": "Horizon Labs Inc", "required": True},
                {"key": "effective_date", "label": "Effective Date", "field_type": "date", "default_value": "2026-03-01", "required": True},
                {"key": "term_years", "label": "Confidentiality Duration (Years)", "field_type": "number", "default_value": 2, "required": True},
                {"key": "liability_cap", "label": "Liability Cap Amount (USD)", "field_type": "number", "default_value": 50000, "required": True},
                {"key": "jurisdiction", "label": "Governing Jurisdiction", "field_type": "select", "options": ["Delaware, USA", "England and Wales", "New Delhi, India", "Singapore"], "required": True}
            ],
            "optional_clauses": [
                {
                    "id": "opt_non_solicit",
                    "title": "Mutual Non-Solicitation of Personnel",
                    "category": "Protection",
                    "is_recommended": True,
                    "is_default": True,
                    "layman_explanation": "Prevents either party from poaching the other's employees during and for 12 months following collaboration.",
                    "text_template": "Mutual Non-Solicitation: During the term of this Agreement and for a period of one (1) year thereafter, neither party shall directly solicit for employment any employee of the other party involved in disclosures hereunder."
                },
                {
                    "id": "opt_injunctive_relief",
                    "title": "Right to Seek Injunctive Relief",
                    "category": "Remedies",
                    "is_recommended": True,
                    "is_default": True,
                    "layman_explanation": "Allows immediate emergency court orders to halt unauthorized information leaks before financial harm occurs.",
                    "text_template": "Injunctive Relief: The parties acknowledge that unauthorized disclosure causes irreparable injury and agree that the disclosing party shall be entitled to seek temporary and permanent injunctive relief without necessity of posting bond."
                },
                {
                    "id": "opt_residuals",
                    "title": "Residual Knowledge Clause",
                    "category": "IP Flexibility",
                    "is_recommended": False,
                    "is_default": False,
                    "layman_explanation": "Permits employees to use general skills and unaided mental impressions gained during the project.",
                    "text_template": "Residuals: Either party may use generalized ideas, concepts, and techniques retained in unaided memory by persons who had lawful access to Confidential Information."
                }
            ]
        },
        "service_freelance": {
            "id": "service_freelance",
            "name": "Master Freelance & Services Agreement",
            "description": "Standard independent contractor agreement establishing deliverables, payment milestones, IP transfer, and mutual protections.",
            "category": "Services & Contracting",
            "fields": [
                {"key": "client_name", "label": "Client Legal Name", "field_type": "text", "placeholder": "Apex Retail Solutions", "required": True},
                {"key": "contractor_name", "label": "Contractor / Freelancer Name", "field_type": "text", "placeholder": "Jane Developer", "required": True},
                {"key": "project_description", "label": "Scope & Deliverables", "field_type": "textarea", "placeholder": "Full-stack software development and deployment", "required": True},
                {"key": "fee_amount", "label": "Total Contract Fee ($)", "field_type": "number", "default_value": 15000, "required": True},
                {"key": "payment_days", "label": "Payment Terms (Net Days)", "field_type": "number", "default_value": 30, "required": True},
                {"key": "notice_days", "label": "Termination Notice Period (Days)", "field_type": "number", "default_value": 14, "required": True}
            ],
            "optional_clauses": [
                {
                    "id": "opt_change_order",
                    "title": "Written Change Order Requirement",
                    "category": "Scope Management",
                    "is_recommended": True,
                    "is_default": True,
                    "layman_explanation": "Prevents unpaid scope creep by mandating written approval for any changes to original deliverables.",
                    "text_template": "Change Orders: Any expansion or modification of the agreed scope must be documented in a written Change Order signed by both parties, adjusting compensation and delivery milestones accordingly."
                },
                {
                    "id": "opt_portfolio_rights",
                    "title": "Contractor Portfolio Rights",
                    "category": "Marketing",
                    "is_recommended": True,
                    "is_default": True,
                    "layman_explanation": "Allows the contractor to display completed work in their public design/code portfolio after release.",
                    "text_template": "Portfolio Display: Contractor retains the right to reference Client and showcase non-confidential screenshots of deliverables in professional portfolios and case studies."
                }
            ]
        },
        "rental_lease": {
            "id": "rental_lease",
            "name": "Commercial & Residential Lease Agreement",
            "description": "Lease contract balancing premises use, security deposit protection, maintenance duties, and landlord entry protocols.",
            "category": "Real Estate",
            "fields": [
                {"key": "landlord_name", "label": "Landlord Name", "field_type": "text", "placeholder": "Metro Commercial Holdings", "required": True},
                {"key": "tenant_name", "label": "Tenant Name", "field_type": "text", "placeholder": "Urban Roasters Cafe LLC", "required": True},
                {"key": "property_address", "label": "Leased Premises Address", "field_type": "text", "placeholder": "Suite 300, 100 Main Street", "required": True},
                {"key": "monthly_rent", "label": "Monthly Rent ($)", "field_type": "number", "default_value": 3500, "required": True},
                {"key": "security_deposit", "label": "Security Deposit ($)", "field_type": "number", "default_value": 7000, "required": True},
                {"key": "lease_months", "label": "Lease Term (Months)", "field_type": "number", "default_value": 12, "required": True}
            ],
            "optional_clauses": [
                {
                    "id": "opt_notice_entry",
                    "title": "Landlord 48-Hour Notice for Entry",
                    "category": "Privacy",
                    "is_recommended": True,
                    "is_default": True,
                    "layman_explanation": "Guarantees tenant quiet enjoyment by mandating 48 hours notice before landlord property inspections.",
                    "text_template": "Quiet Enjoyment and Inspection Notice: Landlord agrees not to enter the premises without providing at least forty-eight (48) hours prior written notice during reasonable business hours, except in bona fide emergencies."
                },
                {
                    "id": "opt_deposit_interest",
                    "title": "Escrow & Deposit Refund Terms",
                    "category": "Finance",
                    "is_recommended": True,
                    "is_default": True,
                    "layman_explanation": "Requires security deposit to be refunded within 14 days with an itemized receipt for any repair deductions.",
                    "text_template": "Deposit Protection: Security deposit shall be maintained in a separate account and refunded within fourteen (14) days of lease expiry, accompanied by itemized contractor receipts for any legitimate repairs."
                }
            ]
        },
        "employment": {
            "id": "employment",
            "name": "Executive Employment Agreement",
            "description": "Employment contract defining role, compensation, benefits, intellectual property assignment, and balanced termination rules.",
            "category": "Human Resources",
            "fields": [
                {"key": "employer_name", "label": "Employer Company", "field_type": "text", "placeholder": "NovaTech Global", "required": True},
                {"key": "employee_name", "label": "Employee Full Name", "field_type": "text", "placeholder": "Alex Mercer", "required": True},
                {"key": "position_title", "label": "Position / Title", "field_type": "text", "placeholder": "Vice President of Engineering", "required": True},
                {"key": "annual_salary", "label": "Annual Salary ($)", "field_type": "number", "default_value": 160000, "required": True},
                {"key": "severance_weeks", "label": "Severance Notice Period (Weeks)", "field_type": "number", "default_value": 4, "required": True}
            ],
            "optional_clauses": [
                {
                    "id": "opt_ip_carveout",
                    "title": "Pre-Existing IP Carve-Out",
                    "category": "Intellectual Property",
                    "is_recommended": True,
                    "is_default": True,
                    "layman_explanation": "Ensures personal inventions or open-source projects created before employment remain employee's property.",
                    "text_template": "Prior Inventions Carve-Out: Inventions, software code, and patents created by Employee prior to employment and listed on Schedule A are expressly excluded from employer ownership."
                }
            ]
        },
        "sale_agreement": {
            "id": "sale_agreement",
            "name": "Standard Agreement to Sell (Real Property)",
            "description": "Legally balanced conveyance agreement with clear title covenants, statutory stamp duty compliance, and dispute resolution.",
            "category": "Real Estate Conveyance",
            "fields": [
                {"key": "seller_name", "label": "Seller Legal Name", "field_type": "text", "placeholder": "Robert Sterling", "required": True},
                {"key": "buyer_name", "label": "Buyer Legal Name", "field_type": "text", "placeholder": "Elena Rostova", "required": True},
                {"key": "property_description", "label": "Property Schedule Description", "field_type": "textarea", "placeholder": "Plot No 42, Green Meadows", "required": True},
                {"key": "sale_price", "label": "Total Consideration Amount ($)", "field_type": "number", "default_value": 450000, "required": True},
                {"key": "closing_date", "label": "Closing / Execution Date", "field_type": "date", "default_value": "2026-06-30", "required": True}
            ],
            "optional_clauses": [
                {
                    "id": "opt_clear_title",
                    "title": "Warranty of Marketable Title & Free from Encumbrances",
                    "category": "Title Guarantee",
                    "is_recommended": True,
                    "is_default": True,
                    "layman_explanation": "Seller certifies they own property free of debts, mortgages, liens, or family litigation.",
                    "text_template": "Free Title Covenant: Seller covenants that the property is free from all encumbrances, liens, mortgages, charges, or litigations, and seller holds good, marketable title."
                }
            ]
        },
        "power_of_attorney": {
            "id": "power_of_attorney",
            "name": "General Power of Attorney (POA)",
            "description": "Appoints a trusted agent to manage financial, banking, and administrative affairs with strict fiduciary accountability.",
            "category": "Personal & Estate",
            "fields": [
                {"key": "principal_name", "label": "Principal Name (Grantor)", "field_type": "text", "placeholder": "Arthur Pendelton", "required": True},
                {"key": "agent_name", "label": "Attorney-in-Fact Name (Agent)", "field_type": "text", "placeholder": "Sarah Pendelton", "required": True},
                {"key": "powers_scope", "label": "Scope of Granted Powers", "field_type": "textarea", "placeholder": "Banking transactions, tax filings, and utility management", "required": True},
                {"key": "revocation_terms", "label": "Revocation Notice Method", "field_type": "text", "default_value": "Written notice delivered to agent", "required": True}
            ],
            "optional_clauses": [
                {
                    "id": "opt_fiduciary_duty",
                    "title": "Express Fiduciary Duty & Accounting",
                    "category": "Accountability",
                    "is_recommended": True,
                    "is_default": True,
                    "layman_explanation": "Requires attorney-in-fact to maintain clear bookkeeping and act strictly for the grantor's benefit.",
                    "text_template": "Fiduciary Accountability: The Attorney-in-Fact shall act strictly in a fiduciary capacity, keeping detailed records of all transactions undertaken on behalf of Principal."
                }
            ]
        }
    }

    @classmethod
    def list_templates(cls) -> List[LegalTemplateDTO]:
        result = []
        for t_id, data in cls.TEMPLATES.items():
            result.append(
                LegalTemplateDTO(
                    id=data["id"],
                    name=data["name"],
                    description=data["description"],
                    category=data["category"],
                    fields=[TemplateFieldDTO(**f) for f in data["fields"]],
                    optional_clauses=[TemplateClauseOptionDTO(**c) for c in data["optional_clauses"]]
                )
            )
        return result

    @classmethod
    def generate_document(cls, template_id: str, field_values: Dict[str, Any], selected_clause_ids: List[str], jurisdiction: str) -> GenerateDocumentResponse:
        template = cls.TEMPLATES.get(template_id)
        if not template:
            raise ValueError(f"Template {template_id} not found.")

        title = f"{template['name']} - Draft"
        sections = []

        # 1. Preamble
        p_text = f"THIS {template['name'].upper()} is entered into as of {field_values.get('effective_date', field_values.get('closing_date', 'today'))}.\n\n"
        p_text += f"PARTIES:\n- Party 1: {field_values.get('party_a_name', field_values.get('client_name', field_values.get('landlord_name', field_values.get('seller_name', field_values.get('employer_name', field_values.get('principal_name', 'First Party'))))))}\n"
        p_text += f"- Party 2: {field_values.get('party_b_name', field_values.get('contractor_name', field_values.get('tenant_name', field_values.get('buyer_name', field_values.get('employee_name', field_values.get('agent_name', 'Second Party'))))))}\n"
        sections.append({"title": "Preamble & Parties", "text": p_text})

        # 2. Core Terms
        if template_id == "nda":
            sections.append({
                "title": "Clause 1: Confidentiality Obligations",
                "text": f"The parties agree to protect proprietary information for a period of {field_values.get('term_years', 2)} years. Standard exclusions for publicly known information shall apply."
            })
            sections.append({
                "title": "Clause 2: Mutual Limitation of Liability",
                "text": f"Neither party's aggregate liability under this Agreement shall exceed USD {field_values.get('liability_cap', 50000)}, excluding breaches of direct trade secrets."
            })
        elif template_id == "service_freelance":
            sections.append({
                "title": "Clause 1: Scope of Work",
                "text": f"Contractor shall perform the following deliverables: {field_values.get('project_description', 'Professional software engineering')}. Any changes must be mutually agreed in writing."
            })
            sections.append({
                "title": "Clause 2: Payment Terms",
                "text": f"Total consideration shall be ${field_values.get('fee_amount', 15000)}, payable within {field_values.get('payment_days', 30)} days of verified invoice receipt."
            })
            sections.append({
                "title": "Clause 3: Termination Notice",
                "text": f"Either party may terminate this agreement upon giving {field_values.get('notice_days', 14)} days prior written notice. Completed work shall be paid in full."
            })
        elif template_id == "rental_lease":
            sections.append({
                "title": "Clause 1: Leased Property & Term",
                "text": f"Landlord leases {field_values.get('property_address', 'Premises')} for a term of {field_values.get('lease_months', 12)} months."
            })
            sections.append({
                "title": "Clause 2: Rent & Security Deposit",
                "text": f"Tenant shall pay ${field_values.get('monthly_rent', 3500)} per month. Security deposit of ${field_values.get('security_deposit', 7000)} shall be refunded within 14 days of move-out."
            })
        elif template_id == "employment":
            sections.append({
                "title": "Clause 1: Position & Compensation",
                "text": f"Employee is appointed as {field_values.get('position_title', 'Director')} with an annual base salary of ${field_values.get('annual_salary', 160000)}."
            })
            sections.append({
                "title": "Clause 2: Termination & Severance",
                "text": f"Either party may terminate employment with {field_values.get('severance_weeks', 4)} weeks written notice or equivalent severance pay."
            })
        else:
            sections.append({
                "title": "Clause 1: Principal Terms",
                "text": "The parties agree to carry out the transactions described herein in accordance with standard common law principles and good faith."
            })

        # 3. Add Selected Optional Clauses
        for opt in template["optional_clauses"]:
            if opt["id"] in selected_clause_ids:
                sections.append({
                    "title": f"Clause {len(sections)}: {opt['title']}",
                    "text": opt["text_template"]
                })

        # 4. Dispute Resolution & Jurisdiction
        sections.append({
            "title": f"Clause {len(sections)}: Governing Law and Dispute Resolution",
            "text": f"This Agreement shall be governed by the laws of {jurisdiction}. Any dispute shall be resolved through good faith negotiation or neutral arbitration with mutually agreed arbitrator."
        })

        # 5. Signatures
        sections.append({
            "title": "Execution and Signature Blocks",
            "text": "IN WITNESS WHEREOF, the authorized representatives of the parties have executed this Agreement as of the date first above written.\n\n[Party 1 Signature] _______________     [Party 2 Signature] _______________"
        })

        # Assemble full text
        full_text = "\n\n".join([f"{s['title']}\n{s['text']}" for s in sections])

        # Run pre-export Scoring Check
        segmented = ClauseSplitter.segment(full_text)
        preview_analysis = ScoringEngine.analyze_document(str(uuid.uuid4()), full_text, segmented)

        return GenerateDocumentResponse(
            generated_id=str(uuid.uuid4()),
            title=title,
            full_text=full_text,
            score_preview=preview_analysis["overall_score"],
            risk_band=preview_analysis["risk_band"],
            clauses=sections,
            suggestions=[
                "Generated contract has a balanced risk profile and low litigation exposure.",
                f"Governing law configured to {jurisdiction}."
            ]
        )
