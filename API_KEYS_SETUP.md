# API Keys Setup

Set these environment variables in Windows System Settings or your shell profile.

## Required

| Variable | Source | Used By |
|----------|--------|---------|
| `ANTHROPIC_API_KEY` | console.anthropic.com | claude-advanced-tools |

## Optional (enable more features)

| Variable | Source | Used By |
|----------|--------|---------|
| `OPENAI_API_KEY` | platform.openai.com | hooks-mastery TTS + LLM fallback |
| `ELEVENLABS_API_KEY` | elevenlabs.io | hooks-mastery TTS (best quality) |
| `BLINDORACLE_API_KEY` | craigmbrown.com/blindoracle | blindoracle-client |
| `BLINDORACLE_API_URL` | `https://api.craigmbrown.com/a2a` | blindoracle-client |
| `BLINDORACLE_AGENT_NAME` | your choice | blindoracle-client |
| `ENGINEER_NAME` | your name | hooks-mastery personalization |
| `BLINDORACLE_HUB_PRIVKEY` | nostr nsec key | agent passport Schnorr signing |

## How to set on Windows (permanent)

```
! setx ANTHROPIC_API_KEY "sk-ant-..."
! setx ENGINEER_NAME "Noah"
! setx BLINDORACLE_API_URL "https://api.craigmbrown.com/a2a"
```

Or set them in Windows > System > Environment Variables GUI.
