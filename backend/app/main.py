from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from backend.app.database import init_db
from backend.app.config import settings
from backend.app.routes.documents import router as documents_router
from backend.app.routes.analyze import router as analyze_router
from backend.app.routes.explain import router as explain_router
from backend.app.routes.correct import router as correct_router
from backend.app.routes.generator import router as generator_router
from backend.app.routes.export import router as export_router

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="LexClear - AI Legal Document Analyzer & Corrector",
    description="Explainable, transparent, AI-powered legal document analysis, correction, and generation platform.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register core routers
app.include_router(documents_router)
app.include_router(analyze_router)
app.include_router(explain_router)
app.include_router(correct_router)
app.include_router(generator_router)
app.include_router(export_router)

try:
    from routes.chat import router as chat_router
    app.include_router(chat_router, prefix="/api")
except Exception as e:
    print(f"Chat router optional load: {e}")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LexClear Core API",
        "version": "1.0.0",
        "llm_provider": settings.LLM_PROVIDER,
        "weights": settings.weights_dict,
        "disclaimer": "This tool provides informational analysis, not legal advice."
    }

# Mount static frontend assets if available
if os.path.exists("frontend/dist/assets"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

@app.get("/")
def serve_index():
    if os.path.exists("frontend/dist/index.html"):
        return FileResponse("frontend/dist/index.html")
    return {
        "message": "LexClear API running",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/{full_path:path}")
async def serve_spa_and_static(full_path: str):
    # Pass through API and docs
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        return {"error": "Resource not found"}
    static_file_path = os.path.join("frontend/dist", full_path)
    if os.path.isfile(static_file_path):
        return FileResponse(static_file_path)
    if os.path.exists("frontend/dist/index.html"):
        return FileResponse("frontend/dist/index.html")
    return {"error": "Not found"}
