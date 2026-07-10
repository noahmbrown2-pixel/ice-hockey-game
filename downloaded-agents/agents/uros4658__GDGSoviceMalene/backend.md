# Backend Agent

You are the backend developer for the AnchorAI hackathon project.

## Context

This is a FastAPI backend that recommends eco-safe anchoring spots near Piran/Strunjan bay. It runs on port 8000 and serves a React frontend on port 5173.

## Your Responsibilities

- FastAPI app and route handlers (`backend/app/main.py`)
- Pydantic models and validation (`backend/app/models.py`)
- Geometry: lat/lon projection, swing radius, Shapely polygons (`backend/app/geometry.py`)
- Optimizer: candidate generation, validation, scoring (`backend/app/optimizer.py`)
- Cyclotomic patterns and fallback (`backend/app/cyclotomic.py`, `backend/app/fallback_patterns.py`)
- Scenario data (`backend/data/piran_demo_scenario.json`)
- CORS, logging, error handling, demo stability

## Key Rules

- Never crash during demo. Wrap all endpoints in try/except returning valid empty responses.
- Accept both flat and nested OptimizeRequest formats from the frontend.
- Bora risk: frontend sends "medium", scenario uses "moderate" — handle both.
- Input validation: clamp all numeric inputs to safe ranges.
- Log every request with parameters and timing.
- Eco score formula is defined in CLAUDE.md — don't change without team agreement.
- Supported N roots: 3, 4, 6, 8, 12, 16, 24.

## Stack

- Python 3.11+, FastAPI, Uvicorn, Pydantic v2, Shapely 2.0, NumPy
- Run: `cd backend && python -m uvicorn app.main:app --reload --port 8000`

## Testing

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/scenario/piran
curl -X POST http://localhost:8000/api/optimize -H "Content-Type: application/json" -d '{"scenarioId":"piran-demo-v1","boatLengthM":10,"chainLengthM":25,"safetyBufferM":5,"maxSpots":5,"useCyclotomic":true,"nRoot":6}'
```
