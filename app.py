import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

# ── Imports matching YOUR project structure ───────────────────────────────────
# agents/ folder contains all processing logic
from agents.input_agent import InputAgent
from agents.clause_splitter_agent import ClauseSplitterAgent
from orchestrator.orchestrator import Orchestrator
from routes import analyze_router, chat_router

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

# ── Register New Routers ──────────────────────────────────────────────────────
app.include_router(analyze_router)
app.include_router(chat_router)

# ── Initialise agents once at startup ────────────────────────────────────────
_orchestrator  = Orchestrator()
_input_agent   = InputAgent()
_splitter      = ClauseSplitterAgent()


@app.get("/")
def home():
    return {
        "message": "Legal AI Advisor API Running",
        "version": "2.0.0",
        "endpoints": {
            "analyze":  "POST /analyze",
            "analyze_multilingual": "POST /analyze/multilingual",
            "chat": "POST /chat",
            "docs":     "GET  /docs",
        },
    }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Analyze a legal document.
    Accepts: PDF, DOCX, TXT, MD, JSON, CSV, XLSX, XLS, HTML, PNG, JPG, JPEG
    Returns: clause classification, risk scores, legality flags, decision
    """
    try:
        report = _orchestrator.run(file)
        return report.model_dump()

    except Exception as e:
        return {"error": str(e)}
