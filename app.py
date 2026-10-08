<<<<<<< HEAD
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

=======
>>>>>>> 3a27112 (Pushing major agent changes)
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

# ── Imports matching YOUR project structure ───────────────────────────────────
# agents/ folder contains all processing logic
from agents.input_agent import InputAgent
from agents.clause_splitter_agent import ClauseSplitterAgent
from orchestrator.orchestrator import Orchestrator
<<<<<<< HEAD
from routes import analyze_router, chat_router
=======
>>>>>>> 3a27112 (Pushing major agent changes)

app = FastAPI(
    title="Legal AI Advisor",
    description="Legal document analysis API",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# ── Register New Routers ──────────────────────────────────────────────────────
=======
from routes import analyze_router, chat_router

>>>>>>> 3a27112 (Pushing major agent changes)
app.include_router(analyze_router)
app.include_router(chat_router)

# ── Initialise agents once at startup ────────────────────────────────────────
_orchestrator  = Orchestrator()
_input_agent   = InputAgent()
_splitter      = ClauseSplitterAgent()


<<<<<<< HEAD
@app.get("/")
def home():
=======
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Mount static directory
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def home():
    index_path = os.path.join("static", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
>>>>>>> 3a27112 (Pushing major agent changes)
    return {
        "message": "Legal AI Advisor API Running",
        "version": "2.0.0",
        "endpoints": {
            "analyze":  "POST /analyze",
<<<<<<< HEAD
            "analyze_multilingual": "POST /analyze/multilingual",
            "chat": "POST /chat",
=======
>>>>>>> 3a27112 (Pushing major agent changes)
            "docs":     "GET  /docs",
        },
    }


<<<<<<< HEAD
=======
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "models": "Calibrated LinearSVC & Statutory Legality Classifiers Active"
    }


@app.get("/api/stats")
def api_stats():
    return {
        "statutory_legality_f1": "97.8%",
        "clause_macro_f1": "79.6%",
        "average_speed": "< 1.2s",
        "rag_chunks": 27,
        "engine_name": "Calibrated LinearSVC + Statutory RAG"
    }


@app.get("/api/presets")
def api_presets():
    fixtures_dir = os.path.join("tests", "fixtures")
    presets = []
    fixture_map = [
        ("bitter_software", "⚠️ Predatory Vendor Agreement", "fixture1_software_vendor_agreement.txt"),
        ("bitter_sale_deed", "🚫 Predatory Sale Deed (16 Violations)", "fixture2_predatory_sale_deed.txt"),
        ("fair_sale_deed", "✨ Standard Fair Sale Deed", "fixture3_standard_sale_deed.txt"),
        ("hindi_contract", "🇮🇳 Hindi Employment Pact", "fixture4_hindi_agreements.txt"),
    ]
    for pid, label, fname in fixture_map:
        fpath = os.path.join(fixtures_dir, fname)
        if os.path.exists(fpath):
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            presets.append({
                "id": pid,
                "label": label,
                "filename": fname,
                "text": content
            })
    return {"presets": presets}




>>>>>>> 3a27112 (Pushing major agent changes)
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Analyze a legal document.
<<<<<<< HEAD
    Accepts: PDF, DOCX, TXT, MD, JSON, CSV, XLSX, XLS, HTML, PNG, JPG, JPEG
=======
    Accepts: PDF, DOCX, TXT
>>>>>>> 3a27112 (Pushing major agent changes)
    Returns: clause classification, risk scores, legality flags, decision
    """
    try:
        report = _orchestrator.run(file)
        return report.model_dump()

    except Exception as e:
        return {"error": str(e)}
