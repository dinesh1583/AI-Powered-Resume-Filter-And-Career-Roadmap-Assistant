from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.database import connect_to_mongo, close_mongo_connection
from backend.routers import (
    auth,
    user,
    resume,
    roadmap,
    recommendations,
    jobs,
    passion,
    chat,
    trends,
    salary,
    creator
)

import logging
import webbrowser
import threading
import os

# =========================
# LOGGING CONFIG
# =========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-18s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S"
)

logger = logging.getLogger("MAIN")

# =========================
# BASE DIRECTORY
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

STATIC_DIR = os.path.join(BASE_DIR, "static")

# =========================
# AUTO OPEN BROWSER
# =========================
def open_browser():
    webbrowser.open("http://127.0.0.1:8000")


# =========================
# LIFESPAN
# =========================
@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("🚀 Starting AI Career Roadmap Platform v2.0")

    connect_to_mongo()

    # Auto open browser
    threading.Timer(2, open_browser).start()

    # NLP preload
    try:
        from backend.services.nlp_service import init_nlp
        init_nlp()
        logger.info("✅ NLP service initialized")
    except Exception as e:
        logger.warning(f"⚠️ NLP preload failed: {e}")

    # Career preload
    try:
        from backend.services.career_service import init_career_data
        init_career_data()
        logger.info("✅ Career data cached")
    except Exception as e:
        logger.warning(f"⚠️ Career preload failed: {e}")

    logger.info("✅ Platform Ready")

    yield

    close_mongo_connection()

    logger.info("👋 Platform shutdown complete")


# =========================
# FASTAPI APP
# =========================
app = FastAPI(
    title="AI Career Roadmap Platform",
    version="2.0.0",
    lifespan=lifespan
)

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# API ROUTES
# =========================
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(resume.router, prefix="/resume", tags=["Resume"])
app.include_router(roadmap.router, prefix="/roadmap", tags=["Roadmap"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(passion.router, prefix="/passion", tags=["Passion"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(trends.router, prefix="/trends", tags=["Trends"])
app.include_router(salary.router, prefix="/salary", tags=["Salary"])
app.include_router(creator.router, prefix="/creator", tags=["Creator"])

# =========================
# HEALTH CHECK
# =========================
@app.get("/health")
async def health_check():

    from backend.database import get_database

    db = get_database()
    db_status = "connected" if db is not None else "disconnected"

    models_dir = os.path.join(BASE_DIR, "ml", "trained_models")
    ml_models = "loaded" if os.path.exists(os.path.join(models_dir, "tfidf_vectorizer.pkl")) else "not_found"

    return {
        "status": "healthy",
        "database": db_status,
        "ml_models": ml_models,
        "version": "2.0.0"
    }


# =========================
# STATIC FRONTEND
# =========================
if os.path.exists(STATIC_DIR):

    logger.info(f"✅ Static frontend found at: {STATIC_DIR}")

    assets_path = os.path.join(STATIC_DIR, "assets")

    if os.path.exists(assets_path):
        app.mount(
            "/assets",
            StaticFiles(directory=assets_path),
            name="assets"
        )

    # Main frontend route
    @app.get("/")
    async def serve_frontend():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

    # React/Vite route handling — must be last
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):

        file_path = os.path.join(STATIC_DIR, full_path)

        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

else:
    logger.warning(f"⚠️ Static folder NOT found: {STATIC_DIR}")