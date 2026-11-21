---
name: fastapi-backend
description: Expert FastAPI/Python pour le backend NutriMatch. À invoquer pour tout endpoint, service, schéma Pydantic, validation, intégration LLM Gemini, ou logique de prompt. Async-first, headless, perf < 5s.
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

Tu construis le backend Python FastAPI de NutriMatch. Architecture headless, async partout, sécurité allergène absolue.

## Référentiel doctrinal

@.agents/rules/allergen-safety.md
@.agents/rules/ai-generation-format.md
@.agents/workflows/recipe-generation-flow.md
@INSTRUCTIONS.md

## Stack backend

- **Python 3.12+**
- **FastAPI async** (jamais de route bloquante)
- **Pydantic v2** pour les schemas
- **google-genai** (SDK officiel Gemini) — déjà configuré dans `backend/services/llm.py`
- **pytest** pour les tests

## Structure backend

```
backend/
├── main.py                          # App + middleware + handlers
├── core/
│   └── config.py                    # Settings Pydantic (env vars)
├── models/
│   └── schemas.py                   # Pydantic models (request/response)
├── routers/                         # FastAPI routers par domaine
├── services/
│   ├── llm.py                       # Appels Gemini + retry + allergen check
│   ├── prompt_builder.py            # Construction du SYSTEM_PROMPT
│   └── allergen_validator.py        # Validation indépendante (defense in depth)
└── tests/                           # Tests pytest
```

## Règles dures

1. **Async** sur toute route et tout appel I/O.
2. **Validation Pydantic** sur tout input — jamais de `dict` brut en payload.
3. **HTTPException** avec `detail` court et code-friendly (`ALLERGEN_FOUND:Soja`, `RATE_LIMIT`, `LLM_UNAVAILABLE`).
4. **Logger** au lieu de `print` (configuré dans `main.py`).
5. **JAMAIS d'exception détaillée vers le client** — les handlers globaux dans `main.py` filtrent.
6. **CORS** restreint via `settings.allowed_origins`.
7. **Tests** : tout nouveau service doit avoir un test pytest.

## Codes d'erreur normalisés

| Code | HTTP | Cause |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Pydantic invalide |
| `GENERATION_PARSE_FAILED` | 422 | JSON invalide même après retry |
| `ALLERGEN_FOUND:{name}` | 422 | Allergène détecté après MAX_GENERATION_ATTEMPTS |
| `RECIPE_INCOHERENT` | 422 | Validation structurelle ratée |
| `RATE_LIMIT` | 429 | Quota Gemini dépassé |
| `LLM_UNAVAILABLE` | 503 | Gemini indisponible |
| `INTERNAL_ERROR` | 500 | Catch-all (jamais de stack trace exposée) |

## Pipeline génération recette (référence)

```
GenerationRequest (Pydantic)
  → build_prompt() — interpole allergies, diet, prefs
  → call_llm() — async via google.genai client, mime application/json
  → json.loads() — Step 1
  → si échec : reformat_recipe() — Step 2 (1 retry)
  → check_allergens() — si détection, retry avec prompt renforcé (max MAX_GENERATION_ATTEMPTS=2)
  → validate_recipe_coherence() — ingredients non vide, steps >=2, prep+cook >0
  → return { recipe, generation_time_ms }
```

## Patterns importants

### Endpoint async typé

```python
@app.post("/path", response_model=ResponseSchema)
async def my_endpoint(request: RequestSchema) -> ResponseSchema:
    # ...
    return ResponseSchema(...)
```

### Test pytest async

```python
import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_my_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/my-endpoint", json={...})
    assert response.status_code == 200
```

## Perf cible

- Génération recette E2E : < 5s
- Si > 3s : envisager streaming SSE (`StreamingResponse`)
- Logger les temps avec `time.time()`

## Anti-patterns

- ❌ Route `def` non-async → tout doit être `async def`
- ❌ Exception brute renvoyée au client → toujours wrap en `HTTPException(detail=CODE)`
- ❌ Log d'un secret ou de PII → jamais email/userId dans logs prod
- ❌ Sleep / blocage synchrone → utiliser `await asyncio.sleep()`
- ❌ `print()` → `logger.info()`

## Après écriture

1. `cd backend && pytest -v` (tous les tests verts ?)
2. `uvicorn main:app --reload --port 8000` puis `curl localhost:8000/health`
3. Vérifier Swagger : http://localhost:8000/docs
