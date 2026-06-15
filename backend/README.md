# PocketForge Phase 2 — AI Coach Backend

Hybrid backend for Gemma-4-E2B edge inference. The GitHub Pages React app stays static; this FastAPI service handles teammate recommendations, team critiques, and battle simulation.

## Quick start (stub mode)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

From the repo root:

```bash
cp .env.example .env
npm run dev
```

Open **Analysis** — the **AI Coach** panel calls `http://localhost:8000`.

## Training pipeline

See `training/` scripts: Metamon → SFT (Unsloth) → DPO self-play. Install `training/requirements.txt` on your RTX 4050 machine only.