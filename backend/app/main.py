"""
PocketForge Phase 2 — FastAPI AI coach backend.

Run locally:
  cd backend && pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .inference import coach
from .schemas import (
    AnalyzeWeaknessRequest,
    AnalyzeWeaknessResponse,
    HealthResponse,
    RecommendTeammateRequest,
    RecommendTeammateResponse,
    SimulateBattleRequest,
    SimulateBattleResponse,
)

app = FastAPI(
    title="PocketForge AI Coach",
    description="Gemma-4-E2B edge coach API for PocketForge Phase 2",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def load_model() -> None:
    coach.load()


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=coach.is_loaded,
        stub_mode=settings.use_stub_responses,
    )


@app.post("/api/recommend-teammate", response_model=RecommendTeammateResponse)
def recommend_teammate(body: RecommendTeammateRequest) -> RecommendTeammateResponse:
    return coach.recommend_teammate(body)


@app.post("/api/analyze-weakness", response_model=AnalyzeWeaknessResponse)
def analyze_weakness(body: AnalyzeWeaknessRequest) -> AnalyzeWeaknessResponse:
    return coach.analyze_weakness(body)


@app.post("/api/simulate-battle", response_model=SimulateBattleResponse)
def simulate_battle(body: SimulateBattleRequest) -> SimulateBattleResponse:
    return coach.simulate_battle(body)