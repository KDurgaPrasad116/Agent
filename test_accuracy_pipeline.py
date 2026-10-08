import io
import json
from agents.classifier_agent import ClassifierAgent
from agents.compliance_agent import ComplianceAgent
from agents.risk_agent import RiskAgent
from agents.clause_splitter_agent import ClauseSplitterAgent
from orchestrator.orchestrator import Orchestrator
from fastapi import UploadFile

print("=" * 60)
print("TEST 1: ClassifierAgent with ML Pipeline")
classifier = ClassifierAgent()
c1 = classifier.run("Employee shall be entitled to full reimbursement of all incurred business expenses within 14 days.")
print("Positive clause:", c1)
assert c1["type"] == "Positive", f"Expected Positive, got {c1['type']}"

c2 = classifier.run("Company may terminate this agreement immediately and contractor shall forfeit all pending fees as penalty.")
print("Negative clause:", c2)
assert c2["type"] == "Negative", f"Expected Negative, got {c2['type']}"

c3 = classifier.run("This Agreement shall be governed by and construed in accordance with the laws of the State of California.")
print("Neutral clause:", c3)
assert c3["type"] == "Neutral", f"Expected Neutral, got {c3['type']}"

print("Classifier tests PASSED!")

print("=" * 60)
print("TEST 2: ComplianceAgent with Legality Classifier & RAG")
compliance = ComplianceAgent()
leg1 = compliance.run("Both parties agree to maintain mutual confidentiality regarding proprietary trade secrets.")
print("Legal clause:", leg1["is_legal"], leg1["illegality_reason"])
assert leg1["is_legal"] == True, f"Expected Legal, got {leg1}"

leg2 = compliance.run("The contractor hereby waives all rights to file legal claims and grants unlimited indemnification to company.")
print("Illegal clause (Statutory + ML):", leg2["is_legal"], leg2["illegality_reason"])
assert leg2["is_legal"] == False, f"Expected Illegal, got {leg2}"
print("RAG Context retrieved:", bool(leg2["rag_context"]))

print("Compliance tests PASSED!")

print("=" * 60)
print("TEST 3: End-to-End Orchestrator with Synthetic Contract")
sample_text = """
CONFIDENTIALITY AND SERVICES AGREEMENT

1. Services and Payment:
Company shall pay Contractor within 30 days of receiving a verified invoice. Contractor is entitled to reimbursement of approved travel expenses.

2. Confidentiality:
Both parties agree to protect proprietary and confidential information disclosed during the term of this agreement.

3. Unilateral Termination and Forfeiture:
Company reserves the right to unilaterally modify these terms without notice and impose a liquidated damages penalty of 100% with total forfeit of all fees.

4. Rights Waiver:
Contractor waives all rights to seek court remedies, and agrees to binding arbitration only with no class action permitted.
"""

file_bytes = sample_text.encode("utf-8")
upload_file = UploadFile(filename="sample_contract.txt", file=io.BytesIO(file_bytes))

orchestrator = Orchestrator()
report = orchestrator.run(upload_file)

print(f"Total Clauses Analyzed: {report.total_clauses}")
print(f"Decision: {report.decision}")
print(f"Decision Reasoning: {report.decision_reasoning}")
print(f"Illegal Clause Count: {report.illegal_clause_count}")
print(f"Overall Risk Score: {report.overall_risk_score}/10")
print(f"Overall Benefit Score: {report.overall_benefit_score}/10")

for idx, c in enumerate(report.clauses, 1):
    print(f"  [{idx}] Type={c.type:<8} Legal={c.is_legal!s:<5} Risk={c.risk_score} Action={c.action:<6} | {c.clause[:60]}...")

assert report.decision in ["Do Not Sign", "Needs Review"]
assert report.illegal_clause_count >= 1
print("=" * 60)
print("ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
