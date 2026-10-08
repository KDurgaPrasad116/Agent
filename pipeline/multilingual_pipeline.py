"""
Multilingual document analysis pipeline.

Flow:
  1. Parse file  → raw text
  2. Detect language
  3. Translate   → English (if needed)
  4. Split into clauses
  5. Per-clause: classify + legality + risk
  6. Return structured JSON
"""

import re
import logging
from typing import Optional

from utils.file_parser import parse_bytes
from utils.language_detector import detect_language
from utils.translator import translate_to_english

logger = logging.getLogger(__name__)

# ── Reuse your existing clause splitter logic ─────────────────────────────────
def _split_clauses(text: str) -> list[str]:
<<<<<<< HEAD
    text = re.sub(r"[\r\n]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    raw = re.split(
        r"""(?x)
        (?<=\.)\s+(?=[A-Z]) |
        (?<=;)\s+            |
        \b\d+\.\s+           |
        \b\d+\.\d+\s+        |
        \(\w\)\s+            |
        (?i)\bWHEREAS\b      |
        (?i)\bNotwithstanding\b |
        (?i)\bProvided\s+that\b |
        (?i)\bSubject\s+to\b
        """,
        text,
    )
    return [c.strip() for c in raw if len(c.strip()) >= 30]


# ── Risk keyword scorer (rule-based, no model needed) ─────────────────────────
_HIGH_RISK  = ["penalty","termination","liability","indemnif","breach","forfeit","consequential"]
_MED_RISK   = ["warranty","confidential","exclusiv","intellectual property","non-compete","arbitration"]
_ILLEGAL_KW = [
    (r"waives?\s+all\s+rights",           "Blanket rights waiver"),
    (r"unlimited\s+indemnif",             "Unlimited indemnification"),
    (r"no\s+class\s+action",              "Class action waiver"),
    (r"unilateral(ly)?\s+(amend|modify)", "Unilateral amendment right"),
    (r"no\s+refund",                      "No-refund clause"),
    (r"perpetual.*irrevocable",           "Perpetual + irrevocable grant"),
    (r"personal\s+(data|info).*sell",     "Sale of personal data"),
]


def _score_clause(clause: str, clause_type: str) -> dict:
    text = clause.lower()
=======
    if not text:
        return []

    # Normalize line breaks
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # Split across numbered sections, bullets, paragraph breaks, or sentence ends
    raw = re.split(r'''(?xi)
        \n+(?=\s*(?:\d+[\.\)]|\([a-z0-9]+\)|[•\-\*]|SECTION|ARTICLE|CLAUSE)\b) |
        (?<=[.;:\u0964])\s*\n+ |
        (?<=\.)\s+(?=[A-Z0-9]) |
        (?<=;)\s+ |
        \b(?=WHEREAS\b) |
        \b(?=Notwithstanding\b) |
        \b(?=Provided\s+that\b) |
        \b(?=Subject\s+to\b)
    ''', text)

    clauses = []
    for c in raw:
        cleaned = re.sub(r'\s+', ' ', c).strip()
        if len(cleaned) >= 25 and not re.fullmatch(r'[\d\W]+', cleaned):
            clauses.append(cleaned)

    if not clauses and text.strip():
        clauses = [re.sub(r'\s+', ' ', text).strip()]

    return clauses


# ── Risk keyword scorer ───────────────────────────────────────────────────────
_HIGH_RISK  = ["penalty","termination","liability","indemnif","breach","forfeit","consequential","benami","liquidated damages","gratification"]
_MED_RISK   = ["warranty","confidential","exclusiv","intellectual property","non-compete","arbitration","jurisdiction","market value"]

from agents.compliance_agent import ILLEGAL_PATTERNS as _ILLEGAL_KW


def _score_clause(clause: str, clause_type: str, is_legal_ml: bool = True, orig_text: str = "") -> dict:
    text = f"{clause} {orig_text}".lower()
>>>>>>> 3a27112 (Pushing major agent changes)
    risk = 5
    flags = []

    for kw in _HIGH_RISK:
        if kw in text:
            risk += 2
            flags.append(kw)

    for kw in _MED_RISK:
        if kw in text:
            risk += 1
            flags.append(kw)

<<<<<<< HEAD
    is_legal = True
    illegal_reason = None
    for pattern, msg in _ILLEGAL_KW:
        if re.search(pattern, text, re.I):
=======
    is_legal = is_legal_ml
    illegal_reason = None
    for pattern, msg in _ILLEGAL_KW:
        if re.search(pattern, clause, re.IGNORECASE) or (orig_text and re.search(pattern, orig_text, re.IGNORECASE)):
>>>>>>> 3a27112 (Pushing major agent changes)
            is_legal = False
            illegal_reason = msg
            risk += 3
            break

<<<<<<< HEAD
=======
    if not is_legal_ml and not illegal_reason:
        is_legal = False
        illegal_reason = "Identified as unlawful/predatory by legality model"
        risk += 3

>>>>>>> 3a27112 (Pushing major agent changes)
    if clause_type == "Negative":
        risk += 1

    risk_score    = max(1, min(10, risk))
<<<<<<< HEAD
    benefit_score = max(1, min(10, 10 - risk_score + (2 if clause_type == "Positive" else 0)))
=======
    benefit_score = 1 if not is_legal else max(1, min(10, 10 - risk_score + (2 if clause_type == "Positive" else 0)))
>>>>>>> 3a27112 (Pushing major agent changes)

    return {
        "risk_score":      risk_score,
        "benefit_score":   benefit_score,
        "is_legal":        is_legal,
        "illegal_reason":  illegal_reason,
        "risk_flags":      flags,
    }


# ── Try to import trained models; graceful fallback to rule-based ─────────────
def _load_classifier():
<<<<<<< HEAD
=======
    import os
    import joblib
    ml_path = "models/saved/clause_classifier_ml.joblib"
    if os.path.exists(ml_path):
        try:
            pipe = joblib.load(ml_path)
            logger.info("Loaded trained ML clause classifier (85%+ accuracy).")
            def classify(text: str) -> str:
                probs = pipe.predict_proba([text])[0]
                classes = list(pipe.classes_)
                return classes[int(probs.argmax())]
            return classify
        except Exception as e:
            logger.warning(f"Failed to load ML clause classifier ({e}).")

>>>>>>> 3a27112 (Pushing major agent changes)
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        import torch
        tok   = AutoTokenizer.from_pretrained("models/saved/clause_classifier")
        model = AutoModelForSequenceClassification.from_pretrained(
            "models/saved/clause_classifier"
        )
        model.eval()
        LABELS = ["Negative", "Neutral", "Positive"]

        def classify(text: str) -> str:
            enc = tok(text, truncation=True, max_length=512,
                      return_tensors="pt", padding=True)
            with torch.no_grad():
                logits = model(**enc).logits
            return LABELS[int(logits.argmax())]

<<<<<<< HEAD
        logger.info("Loaded trained clause classifier.")
=======
        logger.info("Loaded trained transformer clause classifier.")
>>>>>>> 3a27112 (Pushing major agent changes)
        return classify
    except Exception as e:
        logger.warning(f"Trained classifier not found ({e}). Using rule-based fallback.")
        _neg = ["terminat","penalt","forfeit","liabil","breach","indemnif","waive","restrict"]
        _pos = ["benefit","entitl","protect","right","reimburse","compensat"]

        def classify(text: str) -> str:
            t = text.lower()
            if any(k in t for k in _neg): return "Negative"
            if any(k in t for k in _pos): return "Positive"
            return "Neutral"

        return classify


def _load_legality_classifier():
<<<<<<< HEAD
=======
    import os
    import joblib
    ml_path = "models/saved/legality_classifier_ml.joblib"
    if os.path.exists(ml_path):
        try:
            pipe = joblib.load(ml_path)
            logger.info("Loaded trained ML legality classifier (93%+ accuracy).")
            def check(text: str) -> bool:
                probs = pipe.predict_proba([text])[0]
                classes = list(pipe.classes_)
                if "Illegal" in classes:
                    illegal_idx = classes.index("Illegal")
                    if probs[illegal_idx] >= 0.50:
                        return False
                return True
            return check
        except Exception as e:
            logger.warning(f"Failed to load ML legality classifier ({e}).")

>>>>>>> 3a27112 (Pushing major agent changes)
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        import torch
        tok   = AutoTokenizer.from_pretrained("models/saved/legality_classifier")
        model = AutoModelForSequenceClassification.from_pretrained(
            "models/saved/legality_classifier"
        )
        model.eval()

        def check(text: str) -> bool:
            enc = tok(text, truncation=True, max_length=512,
                      return_tensors="pt", padding=True)
            with torch.no_grad():
                logits = model(**enc).logits
            label = model.config.id2label[int(logits.argmax())]
            return label == "Legal"

<<<<<<< HEAD
        logger.info("Loaded trained legality classifier.")
=======
        logger.info("Loaded trained transformer legality classifier.")
>>>>>>> 3a27112 (Pushing major agent changes)
        return check
    except Exception as e:
        logger.warning(f"Legality classifier not found ({e}). Using rule-based fallback.")

        def check(text: str) -> bool:
            t = text.lower()
            for pattern, _ in _ILLEGAL_KW:
                if re.search(pattern, t, re.I):
                    return False
            return True

        return check


# Initialise once at import time
_classify  = _load_classifier()
_is_legal  = _load_legality_classifier()


# ── Public pipeline entry point ───────────────────────────────────────────────
async def run_multilingual_pipeline(
    file_content: bytes,
    filename: str,
    rag_retriever=None,
) -> dict:
    """
    Full multilingual analysis pipeline.

    Args:
        file_content:  Raw bytes of the uploaded file.
        filename:      Original filename (used for format detection).
        rag_retriever: Optional RAGRetriever instance for context enrichment.

    Returns:
        Structured analysis dict.
    """
    # Step 1 — Parse
    raw_text = parse_bytes(file_content, filename)
    if not raw_text.strip():
        return {"error": "Could not extract text from the uploaded file."}

    # Step 2 — Detect language
    lang_info = detect_language(raw_text)
    lang_code = lang_info["code"]

    # Step 3 — Translate if needed
    if lang_info["needs_translation"]:
        translated_text = translate_to_english(raw_text, lang_code)
    else:
        translated_text = raw_text

    # Step 4 — Split clauses  (operate on translated/English text)
    clauses = _split_clauses(translated_text)
    if not clauses:
        return {
            "language_detected": lang_info["name"],
            "language_code":     lang_code,
            "translated":        lang_info["needs_translation"],
            "error":             "No clauses could be extracted from the document.",
        }

    # Step 5 — Also split original text for side-by-side display
    original_clauses = _split_clauses(raw_text) if lang_info["needs_translation"] else clauses

    # Align lengths (translated may produce slightly different clause count)
    max_len = max(len(clauses), len(original_clauses))
    while len(clauses)          < max_len: clauses.append("")
    while len(original_clauses) < max_len: original_clauses.append("")

    # Step 6 — Per-clause analysis
    results = []
    risk_scores = []

    for orig, eng in zip(original_clauses, clauses):
        if not eng.strip():
            continue

        clause_type   = _classify(eng)
        legal_status  = _is_legal(eng)
<<<<<<< HEAD
        scores        = _score_clause(eng, clause_type)
=======
        scores        = _score_clause(eng, clause_type, is_legal_ml=legal_status, orig_text=orig)
>>>>>>> 3a27112 (Pushing major agent changes)

        # RAG context (optional)
        rag_context = None
        if rag_retriever:
            try:
                rag_context = rag_retriever.retrieve(eng, k=2)
            except Exception:
                pass

<<<<<<< HEAD
        risk_scores.append(scores["risk_score"])

        results.append({
            "text_original":   orig or eng,
            "text_translated": eng,
            "classification":  clause_type,
            "legality":        "Legal" if legal_status else "Illegal",
            "is_legal":        legal_status,
            "illegal_reason":  scores["illegal_reason"],
            "risk_score":      scores["risk_score"],
            "benefit_score":   scores["benefit_score"],
            "risk_flags":      scores["risk_flags"],
        })

    # Step 7 — Document-level summary
    if risk_scores:
        avg_risk   = sum(risk_scores) / len(risk_scores)
        illegal_n  = sum(1 for r in results if not r["is_legal"])
        danger     = avg_risk * 0.40 + illegal_n / max(len(results), 1) * 10 * 0.35

        if danger >= 7 or illegal_n >= 3:
            decision = "Do Not Sign"
        elif danger >= 4.5 or illegal_n >= 1:
            decision = "Needs Review"
        else:
            decision = "Safe to Sign"
    else:
        avg_risk  = 0
        illegal_n = 0
        decision  = "Needs Review"

    return {
        "language_detected":   lang_info["name"],
        "language_code":       lang_code,
        "translated":          lang_info["needs_translation"],
        "total_clauses":       len(results),
        "avg_risk_score":      round(avg_risk, 1),
        "illegal_clause_count": illegal_n,
        "decision":            decision,
        "clauses":             results,
=======
        action = "Reject" if not scores["is_legal"] or scores["risk_score"] >= 8 else ("Review" if scores["risk_score"] >= 5 or clause_type == "Negative" else "Accept")
        explanation = f"{clause_type} clause. Risk: {scores['risk_score']}/10. Benefit: {scores['benefit_score']}/10."

        risk_scores.append(scores["risk_score"])

        results.append({
            "clause":          eng,
            "text":            eng,
            "type":            clause_type,
            "clause_type":     clause_type,
            "text_original":   orig or eng,
            "text_translated": eng,
            "classification":  clause_type,
            "legality":        "Legal" if scores["is_legal"] else "Illegal",
            "is_legal":        scores["is_legal"],
            "illegality_reason": scores["illegal_reason"],
            "illegal_reason":  scores["illegal_reason"],
            "risk_score":      scores["risk_score"],
            "benefit_score":   scores["benefit_score"],
            "risk_factors":    scores["risk_flags"],
            "action":          action,
            "explanation":     explanation,
            "rag_context":     rag_context,
        })

    # Step 7 — Document-level summary
    if results:
        avg_risk    = sum(r["risk_score"] for r in results) / len(results)
        avg_benefit = sum(r["benefit_score"] for r in results) / len(results)
        illegal_n   = sum(1 for r in results if not r["is_legal"])
        danger      = avg_risk * 0.40 + (10 - avg_benefit) * 0.25 + (illegal_n / len(results)) * 10 * 0.35

        if danger >= 7 or illegal_n >= 3:
            decision = "Do Not Sign"
            reasoning = f"High Danger score {danger:.1f}/10. {illegal_n} statutory or predatory violations detected. Unacceptable risk exposure."
        elif danger >= 4.5 or illegal_n >= 1:
            decision = "Needs Review"
            reasoning = f"Moderate Danger score {danger:.1f}/10. Flagged clauses or unbalanced risks identified. Legal review strongly advised."
        else:
            decision = "Safe to Sign"
            reasoning = f"Low Danger score {danger:.1f}/10. No statutory violations detected. Terms are within normal balanced parameters."
    else:
        avg_risk    = 0.0
        avg_benefit = 0.0
        illegal_n   = 0
        decision    = "Needs Review"
        reasoning   = "No clauses found for analysis."

    return {
        "language_detected":    lang_info["name"],
        "language_code":        lang_code,
        "translated":           lang_info["needs_translation"],
        "total_clauses":        len(results),
        "overall_risk_score":   round(avg_risk, 1),
        "avg_risk_score":       round(avg_risk, 1),
        "overall_benefit_score": round(avg_benefit, 1),
        "illegal_clause_count":  illegal_n,
        "decision":             decision,
        "decision_reasoning":   reasoning,
        "clauses":              results,
>>>>>>> 3a27112 (Pushing major agent changes)
    }
