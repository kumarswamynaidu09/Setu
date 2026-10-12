import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.seed import init_db_and_seed
from app.routers import auth, classes, lessons, sessions, announcements, questions, coordinator, speech

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("setu")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed database and ensure tables exist
    logger.info("Starting SETU Accessible Classroom Platform...")
    init_db_and_seed()
    yield
    # Shutdown
    logger.info("Stopping SETU Platform...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal Classroom Accessibility Platform for SevaFirst Innovation Challenge 2026",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(classes.router, prefix=settings.API_V1_STR)
app.include_router(lessons.router, prefix=settings.API_V1_STR)
app.include_router(sessions.router, prefix=settings.API_V1_STR)
app.include_router(announcements.router, prefix=settings.API_V1_STR)
app.include_router(questions.router, prefix=settings.API_V1_STR)
app.include_router(coordinator.router, prefix=settings.API_V1_STR)
app.include_router(speech.router, prefix=settings.API_V1_STR)

# Also expose websocket router at root level if accessed directly
app.include_router(speech.router, prefix="")

# Explicit WebSocket route at /ws/live/{session_id}
@app.websocket("/ws/live/{session_id}")
async def websocket_ws_live(websocket: speech.WebSocket, session_id: str, role: str = "student", nickname: str = "Student"):
    await speech.websocket_live_channel(websocket, session_id, role=role, nickname=nickname)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SETU Inclusive Classroom Backend",
        "version": settings.VERSION,
        "stt_engine": settings.STT_ENGINE,
        "mode": "production-ready"
    }

# Serve static frontend build if dist directory exists
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
