# Agents Custom - Jellyfin Collection (JFC)

Ce dossier contient les **surcharges d'agents** specifiques au projet.

## Comment surcharger un agent?

1. Copier l'agent depuis le plugin: `/agent-factory:add-agent`
2. Modifier selon les besoins du projet
3. L'agent local sera utilise a la place de celui du plugin

## Agents disponibles dans le plugin

### Core
- orchestrator, planner, scrum, qa-tester, code-reviewer, ux-designer

### Developers
- developer-python, developer-node, developer-java, developer-go
- developer-vue, developer-react, developer-angular

### IA/LLM
- developer-ai-openai, developer-ai-anthropic, developer-ai-gemini
- developer-ai-mistral, developer-ai-azure, ai-architect

## Resolution

1. Cherche dans `.claude/agents/{agent}.md` (surcharge locale)
2. Sinon charge depuis le plugin `agents/{agent}.md`
