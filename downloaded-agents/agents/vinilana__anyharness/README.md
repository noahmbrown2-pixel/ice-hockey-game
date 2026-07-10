# Harness MCP Agent Team

Time de 7 subagents especializados pra desenvolver o Harness MCP. Cada agente é dono de um bloco da `SPEC.md`.

| Agente | Escopo | Fonte na SPEC | Modelo |
|---|---|---|---|
| `harness-architect` | Coerência cross-cutting, ADRs, alinhamento `@dotcontext` | §5, §14 | opus |
| `harness-mcp-server` | Server stdio, registry, watcher, capabilities | §3, §4 | sonnet |
| `harness-sensors` | sensor.* + adapters (eslint, tsc, semgrep) + normalização | §3, §4, §9 | sonnet |
| `harness-judges` | judge.* + Anthropic + rubrics + fixtures | §3, §4, §7, §9 | opus |
| `harness-contracts` | Specs + Tasks + spec.validate (behaviour harness) | §10 | opus |
| `harness-sessions` | Sessions + steering log + steer.suggest | §8, §11 | opus |
| `harness-test-engineer` | Integration tests com cliente MCP real, e2e | §12 | sonnet |

## Como invocar

Os agentes são auto-disparáveis via `Task` tool com `subagent_type=<nome>`. Use o `harness-architect` pra tarefas que cruzam blocos ou têm dúvida de escopo.

## Mapa de ownership

```
src/server/                 → harness-mcp-server
src/sensors/                → harness-sensors
src/judges/                 → harness-judges
src/contracts/              → harness-contracts
src/sessions/               → harness-sessions
src/steering/               → harness-sessions
src/storage/                → harness-mcp-server (helpers compartilhados)
src/prompts/                → harness-mcp-server (registry; conteúdo é humano)
src/shared/schemas/         → harness-mcp-server (publica) + dono do domínio (define)
.harness/guides/            → humano + steering loop
.harness/sensors/           → harness-sensors (template) + humano
.harness/judges/            → harness-judges (template + prompts) + humano
.harness/contracts/         → harness-contracts (template) + humano
.harness/sessions/          → harness-sessions (write only via session.append)
.harness/.local/            → harness-sessions (steering log) + harness-judges (custos)
.harness/workflows/         → humano (markdown de prompts MCP)
tests/integration/          → harness-test-engineer
tests/e2e/                  → harness-test-engineer
docs/adr/                   → harness-architect
SPEC.md                     → harness-architect (com confirmação do usuário)
```

## Princípios compartilhados

Todos os agentes seguem os princípios de §5 e as convenções do `CLAUDE.md`:

1. **SPEC.md é source-of-truth.**
2. **Schemas first** (zod em todo input/output e formato persistido).
3. **Output normalizado de sensor/judge** (§9): mesmo schema permite ao agente tratar ambos uniformemente.
4. **Computational primeiro, inferential quando preciso.**
5. **Local-first em `.harness/`.** `.local/` gitignored.
6. **Sem lock-in de cliente.** Funciona em Claude Code, Cursor, Codex.
7. **Steering loop é entregável estratégico.** Sensores/judges geram log → `steer.suggest` propõe → humano aprova → vira guide.
