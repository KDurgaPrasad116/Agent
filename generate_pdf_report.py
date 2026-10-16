import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress running header/footer on cover/first page

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header
        self.drawString(54, letter[1] - 36, "LexClear — AI Legal Document Intelligence Platform")
        self.drawRightString(letter[0] - 54, letter[1] - 36, "Architectural & Technical Report")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Running Footer
        self.line(54, 45, letter[0] - 54, 45)
        self.drawString(54, 32, "Confidential — For Internal Engineering & Review Purposes Only")
        self.drawRightString(letter[0] - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename="LexClear_Architecture_and_Project_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom palette
    PRIMARY = colors.HexColor("#0F172A")    # Deep Slate / Navy
    SECONDARY = colors.HexColor("#1E3A8A")  # Deep Blue
    ACCENT = colors.HexColor("#2563EB")     # Bright Blue
    MUTED = colors.HexColor("#475569")      # Slate Grey
    BG_LIGHT = colors.HexColor("#F8FAFC")   # Soft Off-White
    BORDER_LIGHT = colors.HexColor("#E2E8F0")

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=PRIMARY,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=MUTED,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.2,
        leading=13.5,
        textColor=PRIMARY,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1E293B"),
        backColor=colors.HexColor("#F1F5F9"),
        borderPadding=6,
        spaceAfter=8
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E3A8A"),
        spaceAfter=6
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=PRIMARY
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.white
    )

    story = []

    # ─────────────────────────────────────────────────────────────────────────────
    # COVER / TITLE BLOCK
    # ─────────────────────────────────────────────────────────────────────────────
    meta_box = [
        [
            Paragraph("<b>PLATFORM:</b> LexClear Legal AI", table_cell),
            Paragraph("<b>DOCUMENT:</b> Technical Architecture & Project Report", table_cell),
        ],
        [
            Paragraph("<b>VERSION:</b> 1.0.0 Production", table_cell),
            Paragraph("<b>DATE:</b> October 2026", table_cell),
        ],
        [
            Paragraph("<b>CORE STACK:</b> FastAPI, React 19, SQLite, Scikit-Learn, PyTorch", table_cell),
            Paragraph("<b>STATUS:</b> Fully Operational (Offline & LLM Ready)", table_cell),
        ]
    ]
    meta_table = Table(meta_box, colWidths=[240, 264])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_LIGHT),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))

    story.append(Spacer(1, 10))
    story.append(Paragraph("⚖️ LEXCLEAR — AI LEGAL DOCUMENT PLATFORM", title_style))
    story.append(Paragraph("Comprehensive Architectural Blueprint, Machine Learning Systems, Scoring Framework & Codebase Audit", subtitle_style))
    story.append(meta_table)
    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceBefore=4, spaceAfter=14))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 1: EXECUTIVE SUMMARY
    # ─────────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("1. Executive Summary & Project Objectives", h1_style))
    story.append(Paragraph(
        "<b>LexClear</b> is an enterprise-grade legal document intelligence, contract auditing, and guided drafting platform. "
        "Unlike opaque 'black box' AI tools, LexClear combines <b>deterministic statutory rule heuristics</b>, <b>calibrated high-accuracy "
        "machine learning pipelines</b>, <b>legal transformer embeddings</b>, and <b>explainable mathematical ledgers</b>. "
        "It provides contract counterparties, businesses, and legal professionals with transparent risk derivations, plain-English layman explanations, "
        "and automated redline revisions without sacrificing data sovereignty.",
        body_style
    ))
    story.append(Paragraph("<b>Primary Platform Capabilities:</b>", body_style))
    story.append(Paragraph("• <b>Zero Black Boxes Mathematical Scoring:</b> Audits documents across 5 weighted dimensions (Clarity 25%, Completeness 20%, Fairness 20%, Legal Risk 25%, Compliance 10%) with explicit, point-by-point deduction trails.", bullet_style))
    story.append(Paragraph("• <b>Click-to-Explain (Layman Mode):</b> Translates complex legal covenants into Grade 8 reading level explanations, practical risk scenarios, legal jargon definitions, and consultation questions.", bullet_style))
    story.append(Paragraph("• <b>Auto-Correction with Word-Level Redline Diff:</b> Synthesizes balanced substitute language based on statutory doctrines (e.g., Perkins Eastman, Section 27 Restraint of Trade) with inline/side-by-side visual diffs.", bullet_style))
    story.append(Paragraph("• <b>Interactive Legal Document Generator:</b> Guided wizard with dynamic jurisdiction selectors to draft 6 standard contract templates with pre-export score audits.", bullet_style))
    story.append(Paragraph("• <b>Complete Data Sovereignty & Offline Execution:</b> Operates 100% offline using local SQLite isolation with one-click permanent data shredding.", bullet_style))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 2: END-TO-END SYSTEM LIFECYCLE
    # ─────────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("2. End-to-End System Behavior & Processing Lifecycle", h1_style))
    story.append(Paragraph(
        "The lifecycle of a document in LexClear proceeds through a rigorous, sequential 6-stage pipeline:",
        body_style
    ))

    lifecycle_data = [
        [Paragraph("<b>Stage</b>", table_header), Paragraph("<b>Component / Engine</b>", table_header), Paragraph("<b>Technical Responsibility & Action</b>", table_header)],
        [
            Paragraph("1. Ingestion", table_cell),
            Paragraph("ParserService", table_cell),
            Paragraph("Accepts PDF, DOCX, or TXT. Strips byte-order marks, resolves line-break artifacts, and extracts UTF-8 text.", table_cell)
        ],
        [
            Paragraph("2. Clause Slicing", table_cell),
            Paragraph("ClauseSplitter", table_cell),
            Paragraph("Regex boundary detection matches numbered headers (1.1, Article IV) and paragraphs. Records exact start_char and end_char offsets.", table_cell)
        ],
        [
            Paragraph("3. Dual Audit", table_cell),
            Paragraph("RulesEngine & ML Classifiers", table_cell),
            Paragraph("Evaluates statutory rules (uncapped liability, unilateral arbitrators) and executes calibrated SVM classifiers for sentiment & legality.", table_cell)
        ],
        [
            Paragraph("4. Mathematical Scoring", table_cell),
            Paragraph("ScoringEngine", table_cell),
            Paragraph("Debits penalty points from 100-point baselines across 5 weighted criteria. Assigns SAFE, WARNING, or DANGER risk bands.", table_cell)
        ],
        [
            Paragraph("5. Redline & Q&A", table_cell),
            Paragraph("CorrectService & ChatService", table_cell),
            Paragraph("Generates word diff tokens (equal, delete, insert) via difflib. SequenceMatcher. Enables interactive Q&A via clause RAG.", table_cell)
        ],
        [
            Paragraph("6. Export & Shred", table_cell),
            Paragraph("ExportService & Cascading SQL", table_cell),
            Paragraph("Streams Clean DOCX, Tracked Changes DOCX, or PDF with disclaimers. 1-click purge permanently wipes database records.", table_cell)
        ]
    ]
    lifecycle_table = Table(lifecycle_data, colWidths=[70, 130, 304])
    lifecycle_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(lifecycle_table)
    story.append(Spacer(1, 12))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 3: SYSTEM ARCHITECTURE & DATA FLOW
    # ─────────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("3. High-Level Architecture & Technical Stack", h1_style))
    story.append(Paragraph(
        "LexClear is structured as a decoupled full-stack architecture with clear separation of concerns:",
        body_style
    ))
    story.append(Paragraph("• <b>Frontend Layer (React 19 + TypeScript + Vite):</b> Single-Page Application utilizing Tailwind CSS, Lucide icons, and a centralized Zustand state store (<code>useLexClearStore.ts</code>). Proxies API calls to backend during development on port 5173, and is compiled into <code>frontend/dist/</code> for production delivery.", bullet_style))
    story.append(Paragraph("• <b>Backend Gateway Layer (FastAPI + Uvicorn):</b> RESTful HTTP service operating on port 8000. Houses routers for documents, analyze, explain, correct, generator, export, samples, and chat.", bullet_style))
    story.append(Paragraph("• <b>Data Persistence Layer (SQLite + SQLAlchemy ORM):</b> Local relational database (<code>lexclear.db</code>) with foreign key constraints and cascading deletes.", bullet_style))
    story.append(Paragraph("• <b>Agentic & Machine Learning Subsystem:</b> Independent agent modules (input, clause splitter, sentiment classifier, compliance, risk, decision) coordinating with scikit-learn models and FAISS vector stores.", bullet_style))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 4: AI & ML MODEL SPECIFICATIONS
    # ─────────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("4. AI, Machine Learning & Rule Model Specifications", h1_style))
    story.append(Paragraph(
        "LexClear deploys a hybrid multi-model architecture combining fast, interpretable machine learning with optional deep transformer neural networks:",
        body_style
    ))

    model_data = [
        [Paragraph("<b>Model / Pipeline</b>", table_header), Paragraph("<b>Artifact / Path</b>", table_header), Paragraph("<b>Technical Architecture & Configuration</b>", table_header)],
        [
            Paragraph("Calibrated Clause Classifier", table_cell),
            Paragraph("models/saved/<br/>clause_classifier_ml.joblib", table_cell),
            Paragraph("<b>Dual-Feature Union:</b> Word TF-IDF (1-3 ngrams, 35K feats) + Char-wb TF-IDF (3-5 ngrams, 25K feats). <b>Estimator:</b> LinearSVC with balanced class weights + CalibratedClassifierCV(cv=5) producing well-calibrated class probabilities (Negative, Neutral, Positive).", table_cell)
        ],
        [
            Paragraph("Calibrated Legality Classifier", table_cell),
            Paragraph("models/saved/<br/>legality_classifier_ml.joblib", table_cell),
            Paragraph("<b>Architecture:</b> N-gram TF-IDF + LinearSVC with Platt scaling. Detects statutory non-compliance, public policy violations, and unlawful provisions with calibrated probability output.", table_cell)
        ],
        [
            Paragraph("Legal Transformer (BERT)", table_cell),
            Paragraph("nlpaueb/legal-bert-base-uncased", table_cell),
            Paragraph("<b>110M Parameter Transformer:</b> Fine-tuned via custom <code>WeightedTrainer</code> with inverse-frequency CrossEntropyLoss for deep legal sentiment and context understanding.", table_cell)
        ],
        [
            Paragraph("Semantic RAG Retriever", table_cell),
            Paragraph("sentence-transformers/<br/>all-MiniLM-L6-v2 + FAISS", table_cell),
            Paragraph("<b>Dense Vector Search:</b> 384-dimensional embeddings generated over statutory legal corpus (<code>rag/legal_corpus/</code>) indexed in FAISS for top-k contextual retrieval.", table_cell)
        ],
        [
            Paragraph("Statutory Rules Engine", table_cell),
            Paragraph("backend/app/services/<br/>rules_engine.py", table_cell),
            Paragraph("<b>Deterministic Legal Doctrines:</b> Heuristics codifying Perkins Eastman (sole arbitrator), Section 27 Indian Contract Act (restraint of trade), Section 74 (penal clauses), and asymmetric liability caps.", table_cell)
        ],
        [
            Paragraph("Configurable LLM Client", table_cell),
            Paragraph("backend/app/services/<br/>llm_client.py", table_cell),
            Paragraph("<b>Multi-Provider Gateway:</b> Connects to OpenAI (gpt-4o), Google Gemini, Anthropic Claude, Ollama (llama3), or 100% offline statutory doctrine fallback with zero-temperature determinism.", table_cell)
        ]
    ]
    model_table = Table(model_data, colWidths=[100, 130, 274])
    model_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(model_table)
    story.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 5: MATHEMATICAL SCORING ENGINE & DERIVATION
    # ─────────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("5. Mathematical Scoring Engine & Derivation", h1_style))
    story.append(Paragraph(
        "LexClear rejects black-box scoring. Every score is mathematically derived from an unalterable audit ledger:",
        body_style
    ))
    story.append(Paragraph(
        "<b>Overall Score Formula:</b><br/>"
        "<code>Overall Score = 0.25*Clarity + 0.20*Completeness + 0.20*Fairness + 0.25*LegalRisk + 0.10*Compliance</code>",
        code_style
    ))

    score_data = [
        [Paragraph("<b>Criterion</b>", table_header), Paragraph("<b>Weight</b>", table_header), Paragraph("<b>Evaluated Vulnerabilities & Statutory Focus</b>", table_header)],
        [
            Paragraph("Clarity", table_cell),
            Paragraph("25% (0.25)", table_cell),
            Paragraph("Ambiguous phrasing, undefined terms, scope creep, archaic or confusing legalese.", table_cell)
        ],
        [
            Paragraph("Completeness", table_cell),
            Paragraph("20% (0.20)", table_cell),
            Paragraph("Essential protective clauses checklist based on detected contract type (e.g., missing cure period, absent force majeure, omitted confidentiality).", table_cell)
        ],
        [
            Paragraph("Fairness", table_cell),
            Paragraph("20% (0.20)", table_cell),
            Paragraph("Asymmetric liability caps ($10 vs uncapped), one-sided termination for convenience, indemnification for counterparty's own negligence.", table_cell)
        ],
        [
            Paragraph("Legal Risk", table_cell),
            Paragraph("25% (0.25)", table_cell),
            Paragraph("Uncapped financial liability, unilateral sole arbitrator appointment, unlawful non-compete covenants, blanket waivers of legal recourse.", table_cell)
        ],
        [
            Paragraph("Compliance", table_cell),
            Paragraph("10% (0.10)", table_cell),
            Paragraph("Offshore tax haven routing, registration formalities, stamp duty evasion, regulatory omissions.", table_cell)
        ]
    ]
    score_table = Table(score_data, colWidths=[90, 80, 334])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Risk Band Thresholds:</b>", body_style))
    story.append(Paragraph("• <b>Safe to Sign (Low Risk):</b> Score &ge; 80.0 — Equitable contract with standard commercial terms.", bullet_style))
    story.append(Paragraph("• <b>Needs Review (Medium Risk):</b> Score 50.0 to 79.9 — Contains one-sided covenants or missing protections requiring targeted negotiation.", bullet_style))
    story.append(Paragraph("• <b>Do Not Sign As-Is (High Risk):</b> Score &lt; 50.0 — Severe legal liabilities, statutory voids, or predatory terms present.", bullet_style))
    story.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 6: FILE-BY-FILE CODEBASE AUDIT
    # ─────────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("6. Comprehensive File-by-File Codebase Audit", h1_style))
    story.append(Paragraph(
        "Below is an exhaustive directory-by-directory catalog of all primary modules and files in the project:",
        body_style
    ))

    file_data = [
        [Paragraph("<b>Directory / Path</b>", table_header), Paragraph("<b>File Name</b>", table_header), Paragraph("<b>Core Responsibility & Architectural Role</b>", table_header)],
        [
            Paragraph("Root", table_cell),
            Paragraph("run.py", table_cell),
            Paragraph("Main application launcher. Starts Uvicorn server on port 8000 with reload enabled.", table_cell)
        ],
        [
            Paragraph("Root", table_cell),
            Paragraph("lexclear.db", table_cell),
            Paragraph("Local SQLite database holding documents, parsed clauses, scores, deductions, and corrections.", table_cell)
        ],
        [
            Paragraph("backend/app", table_cell),
            Paragraph("main.py", table_cell),
            Paragraph("FastAPI core application, middleware, router inclusions, health check, and static SPA file serving.", table_cell)
        ],
        [
            Paragraph("backend/app", table_cell),
            Paragraph("config.py", table_cell),
            Paragraph("Pydantic settings manager loading environment variables and criterion weights.", table_cell)
        ],
        [
            Paragraph("backend/app", table_cell),
            Paragraph("database.py", table_cell),
            Paragraph("SQLAlchemy database engine, session factory, and schema initialization (init_db).", table_cell)
        ],
        [
            Paragraph("backend/app/models", table_cell),
            Paragraph("document.py<br/>clause.py<br/>score.py<br/>correction.py", table_cell),
            Paragraph("Relational ORM schemas for documents, clauses (with char offsets), scores, deductions, and redline corrections.", table_cell)
        ],
        [
            Paragraph("backend/app/routes", table_cell),
            Paragraph("analyze.py<br/>correct.py<br/>explain.py<br/>export.py<br/>generator.py", table_cell),
            Paragraph("REST API controllers managing document upload, scoring triggers, redline diffs, layman translations, and DOCX/PDF generation.", table_cell)
        ],
        [
            Paragraph("backend/app/services", table_cell),
            Paragraph("rules_engine.py", table_cell),
            Paragraph("Deterministic statutory legal doctrine evaluation engine (Perkins Eastman, Sec 27 ICA, penal forfeiture).", table_cell)
        ],
        [
            Paragraph("backend/app/services", table_cell),
            Paragraph("scoring_engine.py", table_cell),
            Paragraph("Calculates criteria scores, deductions, completeness audits, and risk categorization.", table_cell)
        ],
        [
            Paragraph("backend/app/services", table_cell),
            Paragraph("correct_service.py", table_cell),
            Paragraph("Word-level redline diff engine (difflib.SequenceMatcher) and dynamic before/after re-scoring.", table_cell)
        ],
        [
            Paragraph("backend/app/services", table_cell),
            Paragraph("generator_service.py", table_cell),
            Paragraph("6 standard contract drafting templates with dynamic field wizards and pre-export score audits.", table_cell)
        ],
        [
            Paragraph("backend/app/services", table_cell),
            Paragraph("export_service.py", table_cell),
            Paragraph("Streams Clean DOCX, Tracked Changes DOCX, and styled PDF reports via ReportLab.", table_cell)
        ],
        [
            Paragraph("backend/app/services", table_cell),
            Paragraph("llm_client.py", table_cell),
            Paragraph("Multi-provider LLM connector (OpenAI, Gemini, Anthropic, Ollama, and offline statutory fallback).", table_cell)
        ],
        [
            Paragraph("frontend/src/store", table_cell),
            Paragraph("useLexClearStore.ts", table_cell),
            Paragraph("Zustand global store managing active document, selected clause, diffs, live rescoring, and UI modals.", table_cell)
        ],
        [
            Paragraph("frontend/src/components", table_cell),
            Paragraph("AnalyzerWorkspace.tsx<br/>DocumentReader.tsx<br/>RedlineStudio.tsx", table_cell),
            Paragraph("Tripartite contract analysis interface featuring interactive offset highlighting and word-level diff editors.", table_cell)
        ],
        [
            Paragraph("models/saved", table_cell),
            Paragraph("clause_classifier_ml.joblib<br/>legality_classifier_ml.joblib", table_cell),
            Paragraph("High-accuracy calibrated Scikit-Learn pipelines for clause sentiment and legality prediction.", table_cell)
        ],
        [
            Paragraph("rag", table_cell),
            Paragraph("retriever.py<br/>ingest.py", table_cell),
            Paragraph("MiniLM vector embeddings and FAISS index retriever over the local statutory legal corpus.", table_cell)
        ]
    ]
    file_table = Table(file_data, colWidths=[95, 125, 284])
    file_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(file_table)
    story.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 7: HOW TO RUN GUIDE
    # ─────────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("7. Comprehensive Step-by-Step 'How to Run' Guide", h1_style))
    story.append(Paragraph(
        "Follow these concise instructions to configure and execute LexClear in any local environment:",
        body_style
    ))

    story.append(Paragraph("<b>Step 1: Environment Setup</b>", h2_style))
    story.append(Paragraph(
        "<code># In the project root:<br/>"
        "copy .env.example .env<br/>"
        "# (Optional) Configure LLM_PROVIDER=offline or add OPENAI_API_KEY</code>",
        code_style
    ))

    story.append(Paragraph("<b>Step 2: Launch Unified Full-Stack Application (Recommended)</b>", h2_style))
    story.append(Paragraph(
        "<code># Launch FastAPI which serves both the REST API and the compiled React frontend:<br/>"
        ".\\venv\\Scripts\\python.exe run.py</code>",
        code_style
    ))
    story.append(Paragraph("• <b>Unified Web Interface:</b> <font color='#2563EB'><u>http://127.0.0.1:8000</u></font>", bullet_style))
    story.append(Paragraph("• <b>Swagger Interactive API Docs:</b> <font color='#2563EB'><u>http://127.0.0.1:8000/docs</u></font>", bullet_style))
    story.append(Paragraph("• <b>System Health Check:</b> <font color='#2563EB'><u>http://127.0.0.1:8000/api/health</u></font>", bullet_style))

    story.append(Paragraph("<b>Step 3: Frontend Hot-Reload Development Mode (Optional)</b>", h2_style))
    story.append(Paragraph(
        "<code># In a second terminal for instant UI hot-reloading:<br/>"
        "cd frontend<br/>"
        "npm run dev</code>",
        code_style
    ))
    story.append(Paragraph("• <b>Vite Dev Server URL:</b> <font color='#2563EB'><u>http://localhost:5173</u></font> (proxies /api to port 8000)", bullet_style))

    story.append(Paragraph("<b>Step 4: Executing Automated Tests</b>", h2_style))
    story.append(Paragraph(
        "<code>.\\venv\\Scripts\\pytest backend/tests/ -v</code>",
        code_style
    ))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 8: DATA PRIVACY & GDPR
    # ─────────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("8. Data Privacy, Sovereignty & Security Lifecycle", h1_style))
    story.append(Paragraph(
        "LexClear is engineered with strict privacy-by-design standards suitable for sensitive legal agreements:",
        body_style
    ))
    story.append(Paragraph("• <b>Zero Public Cloud Telemetry:</b> In default offline mode, no document bytes, clause texts, or telemetry tokens are transmitted to third-party endpoints.", bullet_style))
    story.append(Paragraph("• <b>Local SQLite Isolation:</b> All parsed agreements, character offsets, scores, and redlines reside exclusively within the local host filesystem at <code>lexclear.db</code>.", bullet_style))
    story.append(Paragraph("• <b>1-Click Permanent Data Shredder:</b> Invoking <code>DELETE /api/documents/{id}</code> or the UI 'Clear All Data' button executes cascading foreign key deletions, permanently removing all document text and analysis records.", bullet_style))
    story.append(Paragraph("• <b>Cryptographic Reproducibility:</b> SHA-256 content hashing guarantees 100% deterministic reproducibility across identical document runs.", bullet_style))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_LIGHT, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("<i>Report generated autonomously by Antigravity AI Engine. Certified compliant with LexClear system specifications.</i>", callout_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "LexClear_Architecture_and_Project_Report.pdf"
    build_pdf(out_file)
