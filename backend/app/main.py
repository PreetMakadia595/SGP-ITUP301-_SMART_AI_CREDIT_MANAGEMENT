"""
Smart AI Credit Advisor – FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, SessionLocal
import app.models
from app.models import AIService
from app.models.service import AI_SERVICES
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup: Create tables automatically ──────────────────────────────────
    Base.metadata.create_all(bind=engine)

    # Auto-add notes column to user_platforms if missing in pre-existing DB
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE user_platforms ADD COLUMN notes TEXT"))
            conn.commit()
            print("[Info] Added missing 'notes' column to user_platforms table.")
    except Exception:
        pass
    
    # Seed AI services if empty
    db: Session = SessionLocal()
    try:
        if db.query(AIService).count() == 0:
            for s in AI_SERVICES:
                db.add(AIService(**s))
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Warning] Seeding AI services failed: {e}")
    finally:
        db.close()
    
    yield


# ── App Factory ──────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    application = FastAPI(
        title=settings.APP_NAME,
        description="AI-powered credit management and utilization advisor",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS Middleware ──────────────────────────────────────────────────────
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── API v1 Router ────────────────────────────────────────────────────────
    application.include_router(api_router, prefix="/api/v1")

    # ── Health Check ─────────────────────────────────────────────────────────
    @application.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "ok", "version": "1.0.0", "app": settings.APP_NAME}

    return application


app = create_app()
