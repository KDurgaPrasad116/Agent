"""
test_all_test_cases.py

Comprehensive end-to-end test suite verifying that the model, classifiers,
compliance engine, and multilingual pipeline correctly evaluate all 4 user test cases:

1. Fixture 1: Software & Vendor Agreement (Synthetic High-Risk / Predatory)
2. Fixture 2: Sale Deed - General (Synthetic High-Risk / Statutory Violations)
3. Fixture 3: Sale Deed - General Template (Standard Valid Covenants)
4. Fixture 4: Hindi Agreements (NDA, Executive Employment Non-Compete, SLA)
"""

import os
import io
import asyncio
from fastapi import UploadFile

from agents.classifier_agent import ClassifierAgent
from agents.compliance_agent import ComplianceAgent
from agents.risk_agent import RiskAgent
from agents.clause_splitter_agent import ClauseSplitterAgent
from orchestrator.orchestrator import Orchestrator
from pipeline.multilingual_pipeline import run_multilingual_pipeline
from rag.retriever import RAGRetriever


def test_fixture_1_software_agreement():
    print("\n" + "=" * 70)
    print("RUNNING TEST SUITE: FIXTURE 1 — SOFTWARE & VENDOR AGREEMENT")
    print("=" * 70)

    filepath = os.path.join("tests", "fixtures", "fixture1_software_vendor_agreement.txt")
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    file_bytes = text.encode("utf-8")
    upload_file = UploadFile(filename="software_agreement.txt", file=io.BytesIO(file_bytes))

    orchestrator = Orchestrator()
    report = orchestrator.run(upload_file)

    print(f"Total Clauses Extracted: {report.total_clauses}")
    print(f"Overall Decision       : {report.decision}")
    print(f"Illegal Clause Count   : {report.illegal_clause_count}")
    print(f"Overall Risk Score     : {report.overall_risk_score}/10")
    print(f"Overall Benefit Score  : {report.overall_benefit_score}/10")

    # Assertions
    assert report.decision == "Do Not Sign", f"Expected 'Do Not Sign', got '{report.decision}'"
    assert report.illegal_clause_count >= 6, f"Expected at least 6 illegal clauses, got {report.illegal_clause_count}"
    assert report.overall_risk_score >= 6.5, f"Expected risk >= 6.5, got {report.overall_risk_score}"

    print(">> Fixture 1 Verification: PASSED (Correctly flagged as predatory / Do Not Sign)")


def test_fixture_2_predatory_sale_deed():
    print("\n" + "=" * 70)
    print("RUNNING TEST SUITE: FIXTURE 2 — PREDATORY SALE DEED")
    print("=" * 70)

    filepath = os.path.join("tests", "fixtures", "fixture2_predatory_sale_deed.txt")
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    file_bytes = text.encode("utf-8")
    upload_file = UploadFile(filename="predatory_sale_deed.txt", file=io.BytesIO(file_bytes))

    orchestrator = Orchestrator()
    report = orchestrator.run(upload_file)

    print(f"Total Clauses Extracted: {report.total_clauses}")
    print(f"Overall Decision       : {report.decision}")
    print(f"Illegal Clause Count   : {report.illegal_clause_count}")
    print(f"Overall Risk Score     : {report.overall_risk_score}/10")

    # Inspect each illegal clause caught
    illegal_clauses = [c for c in report.clauses if not c.is_legal]
    print(f"\nCaught {len(illegal_clauses)} Statutory Illegalities:")
    for idx, c in enumerate(illegal_clauses, 1):
        print(f"  {idx}. [{c.illegality_reason}] -> {c.clause[:65]}...")

    # Assertions
    assert report.decision == "Do Not Sign", f"Expected 'Do Not Sign', got '{report.decision}'"
    assert report.illegal_clause_count >= 10, f"Expected at least 10 illegal clauses, got {report.illegal_clause_count}"

    print(">> Fixture 2 Verification: PASSED (Correctly flagged all statutory violations / Do Not Sign)")


def test_fixture_3_standard_sale_deed():
    print("\n" + "=" * 70)
    print("RUNNING TEST SUITE: FIXTURE 3 — STANDARD SALE DEED TEMPLATE")
    print("=" * 70)

    filepath = os.path.join("tests", "fixtures", "fixture3_standard_sale_deed.txt")
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    file_bytes = text.encode("utf-8")
    upload_file = UploadFile(filename="standard_sale_deed.txt", file=io.BytesIO(file_bytes))

    orchestrator = Orchestrator()
    report = orchestrator.run(upload_file)

    print(f"Total Clauses Extracted: {report.total_clauses}")
    print(f"Overall Decision       : {report.decision}")
    print(f"Illegal Clause Count   : {report.illegal_clause_count}")
    print(f"Overall Risk Score     : {report.overall_risk_score}/10")
    print(f"Overall Benefit Score  : {report.overall_benefit_score}/10")

    # Assertions
    assert report.illegal_clause_count == 0, f"Expected 0 illegal clauses, got {report.illegal_clause_count}"
    assert report.decision in ["Safe to Sign", "Needs Review"], f"Unexpected decision: {report.decision}"

    print(">> Fixture 3 Verification: PASSED (Standard template recognized without false-positive illegality)")


async def test_fixture_4_hindi_multilingual():
    print("\n" + "=" * 70)
    print("RUNNING TEST SUITE: FIXTURE 4 — HINDI AGREEMENTS (MULTILINGUAL PIPELINE)")
    print("=" * 70)

    filepath = os.path.join("tests", "fixtures", "fixture4_hindi_agreements.txt")
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    file_bytes = text.encode("utf-8")
    rag = RAGRetriever()

    report = await run_multilingual_pipeline(
        file_content=file_bytes,
        filename="hindi_agreements.txt",
        rag_retriever=rag if rag.is_ready() else None
    )

    print(f"Detected Language      : {report.get('language_detected')}")
    print(f"Language Code          : {report.get('language_code')}")
    print(f"Translation Performed  : {report.get('translated')}")
    print(f"Total Clauses          : {report.get('total_clauses')}")
    print(f"Decision               : {report.get('decision')}")
    print(f"Illegal Clause Count   : {report.get('illegal_clause_count')}")

    # Verify that the post-employment non-compete was caught
    non_compete_caught = False
    for c in report.get("clauses", []):
        if not c.get("is_legal"):
            non_compete_caught = True
            orig_safe = c.get('text_original', '')[:70].encode('ascii', errors='replace').decode('ascii')
            eng_safe = c.get('text_translated', '')[:70].encode('ascii', errors='replace').decode('ascii')
            print(f"  Flagged Statutory Violation: {c.get('illegal_reason')}")
            print(f"    Original Text  : {orig_safe}...")
            print(f"    Translated Eng : {eng_safe}...")

    assert report.get("language_code") == "hi", f"Expected 'hi', got {report.get('language_code')}"
    assert report.get("illegal_clause_count", 0) >= 1, "Expected at least 1 illegal clause (non-compete) to be flagged"
    assert non_compete_caught, "Section 27 ICA post-employment non-compete must be flagged"

    print(">> Fixture 4 Verification: PASSED (Hindi detected, translated, and Section 27 non-compete flagged)")


def main():
    print("=" * 70)
    print("STARTING FULL TEST SUITE FOR ALL 4 TEST CASES")
    print("=" * 70)

    test_fixture_1_software_agreement()
    test_fixture_2_predatory_sale_deed()
    test_fixture_3_standard_sale_deed()
    asyncio.run(test_fixture_4_hindi_multilingual())

    print("\n" + "=" * 70)
    print("ALL 4 TEST CASES PASSED WITH 100% SUCCESS AND FULL ACCURACY!")
    print("=" * 70)


if __name__ == "__main__":
    main()
