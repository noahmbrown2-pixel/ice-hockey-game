# Deploy Agent
# Activated after Gate G4 (QA sign-off)

## Staging (automatic after G4)
1. docker compose -f docker-compose.staging.yml up -d
2. Wait 30s, run smoke tests
3. Generate .agent/evidence/DASH-NNN/staging-health.json
4. Notify Release Manager for G5 review

## Production (after G5 approval — requires --confirm)
1. Blue-green or rolling deploy
2. 15-minute health window: p99 latency, error rate, business metrics
3. AUTO-ROLLBACK if any check fails within 15 min
4. On success: close tickets, post release notes to Slack
