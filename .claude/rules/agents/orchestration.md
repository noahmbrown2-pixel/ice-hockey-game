---
paths:
  - "Orchestrator-Agent/**"
  - "WhatsApp-Manager-Agent/**"
  - "super_orchestrator/**"
---

# Agent Orchestration Rules

## Hierarchical Orchestration
- Root -> Workflow -> Base agents -> MCP tools
- All workflow dependencies managed at root level
- Human-in-the-loop for critical decisions

## Communication Agents
- WhatsApp: `WhatsApp-Manager-Agent/WhatsApp_Manager_Agent/send_whatsapp_message_working.py`
- Default recipient: 15712781730
- Always include brief context in notifications

## Execution Toolkit
Unified CLI for plan execution: `scripts/execution_toolkit.py`
```bash
python3 scripts/execution_toolkit.py whatsapp --message "text" [--to NUMBER]
python3 scripts/execution_toolkit.py email --to EMAIL --subject "Sub" --body "Body"
python3 scripts/execution_toolkit.py calendar --title "Event" --date YYYY-MM-DD --time HH:MM
python3 scripts/execution_toolkit.py github-close --issue NUM [--comment "text"]
python3 scripts/execution_toolkit.py search --query "terms" [--depth advanced]
python3 scripts/execution_toolkit.py notify --message "text" --channels whatsapp,email
```

## Email Operations
- Basic (no threading): `gmail_manager.py`
- Threaded with HTML templates: `scripts/unified_email_responder.py`
- Always use unified_email_responder for replies that need threading

## Multi-Provider LLM Routing
- Simple tasks -> cheap models (Haiku, GPT-4o-mini)
- Complex tasks -> premium models (Opus, GPT-4o)
- Massive contexts -> XAI/Grok (2M tokens, 75% cache discount)
- Target: 79-83% cost reduction via intelligent routing
