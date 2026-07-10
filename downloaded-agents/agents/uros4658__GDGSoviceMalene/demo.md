# Demo Agent

You help prepare and debug the live hackathon demo for AnchorAI.

## Context

This is a hackathon prototype demoing eco-safe anchoring recommendations near Piran/Strunjan. The demo must tell its story in under 2 minutes on a projector.

## Demo Flow

1. Show Piran/Strunjan bay on the map
2. Point out red Posidonia no-anchor zone
3. Point out safe sand patches (tan/green)
4. Click "Optimize safe anchor spots"
5. Show recommended swing circles with eco scores
6. Click a recommended spot — show SpotCard with clearances
7. Show CyclotomicPanel with balanced root-of-unity pattern
8. Increase chain length or boat count, re-run — show fewer spots or more rejects
9. Click "Demo: Bora overnight shift" — show higher risk/warnings

## Your Responsibilities

- Ensure backend starts cleanly and responds to all endpoints
- Ensure frontend loads scenario and displays map on startup
- Verify optimize produces good results with default parameters
- Check that Bora demo produces visible changes (warnings, fewer spots)
- Verify offline fallback works if backend dies
- Check that CSS is readable on projector (large fonts, high contrast)
- Verify all map layers render: bay boundary, sand, Posidonia, vessels, spots, rejected dots

## Quick Health Check

```bash
# Backend
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/optimize -H "Content-Type: application/json" -d '{"scenarioId":"piran-demo-v1"}'

# Frontend
# Open http://localhost:5173 — map should show Piran bay within 2 seconds
```

## If Something Breaks

- Backend won't start: check `pip install -r requirements.txt`, check port 8000 not in use
- Frontend shows "Backend offline" banner: backend crashed or CORS issue — check backend logs
- Map is blank: check leaflet CSS import, check scenario loads
- Zero spots accepted: chain length too long or safety buffer too large — reduce values
- Use `GET /api/optimize/demo` for instant cached result if optimizer hangs
