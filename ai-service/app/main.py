from __future__ import annotations

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import ai, research, shopping, travel, voice

logger = structlog.get_logger()

app = FastAPI(title="AURA AI Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router)
app.include_router(voice.router)
app.include_router(shopping.router)
app.include_router(travel.router)
app.include_router(research.router)


@app.get("/")
async def root():
    return {"service": "aura-python-ai", "status": "running", "environment": settings.environment}
