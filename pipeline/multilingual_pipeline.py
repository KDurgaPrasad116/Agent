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

    is_legal = True
    illegal_reason = None
    for pattern, msg in _ILLEGAL_KW:
        if re.search(pattern, text, re.I):
            is_legal = False
            illegal_reason = msg
            risk += 3
            break

    if clause_type == "Negative":
        risk += 1

    risk_score    = max(1, min(10, risk))
    benefit_score = max(1, min(10, 10 - risk_score + (2 if clause_type == "Positive" else 0)))

    return {
        "risk_score":      risk_score,
        "benefit_score":   benefit_score,
        "is_legal":        is_legal,
        "illegal_reason":  illegal_reason,
        "risk_flags":      flags,
    }


# ── Try to import trained models; graceful fallback to rule-based ─────────────
def _load_classifier():
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

        logger.info("Loaded trained clause classifier.")
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

        logger.info("Loaded trained legality classifier.")
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
        scores        = _score_clause(eng, clause_type)

        # RAG context (optional)
        rag_context = None
        if rag_retriever:
            try:
                rag_context = rag_retriever.retrieve(eng, k=2)
            except Exception:
                pass

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
            "rag_context":     rag_context,
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
    }
