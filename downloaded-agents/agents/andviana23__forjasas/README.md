# FORJA - Claude Code Agents

Agents especializados para desenvolvimento do FORJA (Sistema SaaS de gestão para barbearias).

## Agents Disponíveis

### 1. **Backend Go** (`backend-go.md`)
Especialista em Go 1.24, Echo v4, Clean Architecture, DDD e multi-tenant.

**Use quando:**
- Criar/modificar handlers, use cases ou entidades
- Implementar regras de negócio
- Garantir isolamento multi-tenant
- Trabalhar com SQLC

**Comando:**
```bash
# Usar agent diretamente
claude --agent backend-go "implementar use case de criar cliente"
```

### 2. **Frontend Next.js** (`frontend-next.md`)
Especialista em Next.js 16, shadcn/ui, TanStack Query e Design System.

**Use quando:**
- Criar/modificar componentes UI
- Implementar hooks com TanStack Query
- Garantir acessibilidade e responsividade
- Seguir Design System

**Comando:**
```bash
claude --agent frontend-next "criar modal de cadastro de cliente"
```

### 3. **Database PostgreSQL** (`database-postgres.md`)
Especialista em PostgreSQL, migrations, SQLC e modelagem multi-tenant.

**Use quando:**
- Criar/modificar migrations
- Escrever queries SQLC
- Modelar tabelas com isolamento multi-tenant
- Otimizar performance de queries

**Comando:**
```bash
claude --agent database-postgres "criar migration para adicionar campo unit_id em produtos"
```

### 4. **Security RBAC** (`security-rbac.md`)
Especialista em segurança, JWT, RBAC e isolamento multi-tenant.

**Use quando:**
- Implementar/validar autenticação
- Adicionar RBAC em endpoints
- Auditar segurança de código
- Garantir isolamento multi-tenant

**Comando:**
```bash
claude --agent security-rbac "auditar endpoint /financeiro/dre para RBAC"
```

### 5. **Bug Hunter** (`bug-hunter.md`)
Especialista em encontrar bugs críticos de segurança e multi-tenant.

**Use quando:**
- Auditar código em busca de bugs
- Identificar vazamentos cross-tenant
- Validar RBAC
- Encontrar vulnerabilidades

**Comando:**
```bash
claude --agent bug-hunter "auditar módulo de agendamentos para bugs de segurança"
```

## Como Usar

### Uso Básico
```bash
# Invocar agent específico
claude --agent <agent-name> "<tarefa>"

# Exemplos
claude --agent backend-go "criar use case de criar cliente"
claude --agent frontend-next "criar componente de tabela de clientes"
claude --agent database-postgres "criar migration para tabela de produtos"
```

### Uso no Chat
```bash
# Iniciar chat com agent
claude chat --agent backend-go

# No chat, o agent já terá contexto especializado
> implementar handler de criar cliente
```

### Combinar Agents
```bash
# Para tarefas full-stack, use múltiplos agents
claude --agent backend-go "criar use case de criar cliente" && \
claude --agent database-postgres "criar migration para tabela de clientes" && \
claude --agent frontend-next "criar modal de cadastro de cliente"
```

## Estrutura de Agent

Cada agent segue o padrão:

```markdown
# {Nome do Agent}

{Descrição curta}

## Responsabilidades
- {O que o agent faz}

## Contexto Obrigatório
- {Arquivos que deve ler antes}

## Regras Invioláveis
- {Regras de negócio e arquitetura}

## Exemplos de Código
- {Code snippets de boas práticas}

## Checklist
- {Validações antes de commit}

## Proibições
- {O que NUNCA fazer}

## Referências
- {Links para docs}
```

## Regras Gerais (Todos os Agents)

### Fonte de Verdade (Ordem de Prioridade)
1. `docs/ESTADO_ATUAL_DO_SISTEMA.md` - Estado atual validado
2. Código/config/migrations/workflows - Evidência de implementação
3. `.github/copilot-instructions.md` - Regras gerais
4. Docs em `docs/` - Podem ser históricos

### Stack Principal
- **Backend:** Go 1.24 + Echo v4
- **Frontend:** Next.js 16 + React 19
- **Database:** PostgreSQL (Neon/Supabase)
- **ORM:** SQLC (queries tipadas)
- **State:** TanStack Query + Zustand
- **UI:** shadcn/ui + Tailwind CSS v4

### Multi-Tenant (CRÍTICO)
- `tenant_id` vem do **JWT claim** (NUNCA do payload)
- **TODA query DEVE** filtrar por `tenant_id`
- DTOs usam `snake_case` e **NUNCA** incluem `tenant_id`

### Clean Architecture
- Presentation → Application → Domain → Infrastructure
- Domain é puro (sem deps externas)
- Handlers não têm lógica de negócio
- Use Cases validam tenant, RBAC e executam regras

### Proibições Absolutas
❌ SQL manual em código Go
❌ Payload contendo `tenant_id`
❌ Cores e espaçamentos hardcoded
❌ CSS inline
❌ useState para dados de API
❌ Componentes fora do Design System
❌ Lógica de negócio em handlers
❌ Float para valores financeiros
❌ Ignorar RBAC ou `tenant_id`

## Desenvolvimento Local

### Backend
```bash
cd backend

# Rodar com hot reload
air

# Rodar migrations
./cmd/migrate/migrate up

# Gerar código SQLC
sqlc generate

# Rodar testes
go test ./...
```

### Frontend
```bash
cd frontend

# Rodar dev server
npm run dev

# Rodar testes
npm test

# Rodar type check
npm run typecheck

# Build de produção
npm run build
```

## Troubleshooting

### Agent não encontra arquivo
```bash
# Verificar se está no diretório correto
pwd # Deve estar em /home/andrey/forja

# Listar agents disponíveis
ls .claude/agents/
```

### Agent não segue regras
```bash
# Agents leem automaticamente:
# 1. .github/copilot-instructions.md
# 2. docs/ESTADO_ATUAL_DO_SISTEMA.md
# 3. Arquivos específicos mencionados no agent

# Verificar se arquivos existem
cat .github/copilot-instructions.md | head
cat docs/ESTADO_ATUAL_DO_SISTEMA.md | head
```

### Erro de contexto
```bash
# Agents precisam de contexto do repo
# Certifique-se de estar no diretório do projeto
cd /home/andrey/forja
```

## Contribuindo

### Criar Novo Agent

1. Criar arquivo em `.claude/agents/{nome}.md`
2. Seguir template de agent existente
3. Adicionar referências a este README
4. Testar com comando:
   ```bash
   claude --agent {nome} "tarefa de teste"
   ```

### Atualizar Agent Existente

1. Editar arquivo `.claude/agents/{nome}.md`
2. Atualizar seção de exemplos se necessário
3. Testar mudanças

## Referências

- **Documentação Principal:** `docs/ESTADO_ATUAL_DO_SISTEMA.md`
- **Regras Gerais:** `.github/copilot-instructions.md`
- **Arquitetura:** `docs/02-arquitetura/ARQUITETURA.md`
- **Design System:** `.github/instructions/frontend-ui.instructions.md`

---

**Última atualização:** 2026-01-22
**Versão:** 1.0.0
**Agents:** 5 (backend-go, frontend-next, database-postgres, security-rbac, bug-hunter)
