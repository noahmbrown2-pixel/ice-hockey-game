# STAGETEK CRM - Agents Configuration

**Specialized agents for accelerated development**

---

## 🤖 Available Agents

### 1. **@frontend-specialist**
**Especialidade**: UI/UX, Components, Protocol Notecraft™

**Use para**:
- Criar componentes (Atoms, Molecules, Organisms, Templates)
- Implementar páginas HTML/CSS/JS
- Garantir responsividade e dark mode
- Verificar compliance com Protocol Notecraft™

**Exemplo**:
```
@frontend-specialist "Create OpportunityCard organism (≤50 lines) with drag-and-drop support"
```

---

### 2. **@backend-specialist**
**Especialidade**: Supabase, Database, API, RLS

**Use para**:
- Criar tabelas e migrations
- Configurar Row Level Security (RLS)
- Implementar service layer (CRUD)
- Setup de autenticação

**Exemplo**:
```
@backend-specialist "Create opportunities table with RLS policies for admin/manager/salesperson"
```

---

### 3. **@qa-specialist**
**Especialidade**: Testing, Quality, Performance, Accessibility

**Use para**:
- Verificar Protocol Notecraft™ compliance
- Testar funcionalidades (edge cases)
- Rodar Lighthouse/axe audits
- Code review de qualidade

**Exemplo**:
```
@qa-specialist "Review pages/funil-vendas.html for Protocol compliance and accessibility"
```

---

### 4. **@product-manager**
**Especialidade**: Roadmap, Priorização, User Stories, Metrics

**Use para**:
- Escrever user stories (formato INVEST)
- Priorizar backlog (RICE score)
- Definir acceptance criteria
- Planejar sprints

**Exemplo**:
```
@product-manager "Create user story for 'Mark Opportunity as Won' with acceptance criteria"
```

---

## 🚀 Workflows Recomendados

### Workflow 1: Criar Nova Feature

1. **@product-manager** define user story e acceptance criteria
2. **@frontend-specialist** cria componentes UI
3. **@backend-specialist** implementa API e database
4. **@qa-specialist** testa e valida

**Comando**:
```
@product-manager "US: Vendedor quer marcar venda para contabilizar meta"
@frontend-specialist "Create 'Mark Won' button + modal with celebration animation"
@backend-specialist "Create markAsWon() service method with won_at timestamp"
@qa-specialist "Test mark won flow + verify reports update correctly"
```

---

### Workflow 2: Criar Página Completa

1. **@product-manager** define wireframe e user flows
2. **@frontend-specialist** implementa layout + organisms
3. **@backend-specialist** conecta com Supabase
4. **@qa-specialist** valida responsividade + accessibility

**Comando**:
```
@product-manager "Define Clientes page: DataTable + CRUD modal + filters"
@frontend-specialist "Implement pages/clientes.html following Protocol Notecraft"
@backend-specialist "Create clientsService with getAll/create/update/delete"
@qa-specialist "Verify WCAG AA + mobile responsive + line limits"
```

---

### Workflow 3: Code Review

1. **@qa-specialist** roda checklist completo
2. **@frontend-specialist** valida Protocol Notecraft™
3. **@backend-specialist** valida RLS e SQL

**Comando**:
```
@qa-specialist "Full code review of pages/dashboard.html"
```

---

### Workflow 4: Sprint Planning

1. **@product-manager** prioriza backlog com RICE
2. **@product-manager** escreve user stories para sprint
3. Agents distribuem tarefas por especialidade

**Comando**:
```
@product-manager "Plan Sprint 2 (Week 2) with RICE prioritization"
```

---

## 📋 Agent Coordination Checklist

### Daily Standup (Async)
- [ ] **@product-manager**: O que foi entregue ontem?
- [ ] **@frontend-specialist**: Quantos componentes criados?
- [ ] **@backend-specialist**: Quantas migrations aplicadas?
- [ ] **@qa-specialist**: Quantos bugs encontrados?
- [ ] **All**: Há blockers?

### Pre-Deploy Checklist
- [ ] **@qa-specialist**: Protocol Notecraft™ compliance (line limits, no emojis, CSS vars)
- [ ] **@qa-specialist**: Lighthouse score ≥ 90
- [ ] **@qa-specialist**: WCAG AA compliance
- [ ] **@backend-specialist**: RLS policies testadas
- [ ] **@backend-specialist**: Migrations aplicadas em staging
- [ ] **@frontend-specialist**: Dark mode funcional
- [ ] **@frontend-specialist**: Mobile responsive
- [ ] **@product-manager**: Acceptance criteria atendidos

### Post-Sprint Review
- [ ] **@product-manager**: User stories completadas?
- [ ] **@product-manager**: Metrics atingiram target?
- [ ] **@qa-specialist**: Bugs críticos resolvidos?
- [ ] **All**: Retrospectiva (what went well, what to improve)

---

## 🎯 Quick Commands

### Check Protocol Compliance
```bash
@qa-specialist "Verify all atoms ≤20 lines, molecules ≤35 lines, organisms ≤50 lines"
```

### Count Lines
```bash
for file in components/atoms/*.js; do
  lines=$(grep -v '^[[:space:]]*$' "$file" | wc -l)
  echo "$file: $lines linhas"
done
```

### Find Hardcoded Colors
```bash
@qa-specialist "Find all hardcoded colors (search for 'color: #' and 'background: #')"
```

### Find Emojis
```bash
@qa-specialist "Find all emojis used as icons (🚀, 🎨, 📱, etc.)"
```

### Lighthouse Audit
```bash
@qa-specialist "Run Lighthouse audit on pages/dashboard.html"
```

### Database Schema Review
```bash
@backend-specialist "Review all tables for missing RLS policies"
```

---

## 📚 Agent Handbooks

Each agent has a detailed handbook in `.claude/agents/`:

- `frontend-specialist.md` - Component creation, Protocol Notecraft™ compliance
- `backend-specialist.md` - Database design, Supabase, RLS, API
- `qa-specialist.md` - Testing checklists, quality metrics, tools
- `product-manager.md` - Roadmap, user stories, RICE prioritization

**Recomendação**: Leia o handbook do agent antes de delegar tarefas complexas.

---

## 🔧 MCP Servers Configuration

### GitHub MCP
Permite agents interagirem com GitHub (criar issues, PRs, etc.)

**Configuração**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

**Usage by agents**:
```
@backend-specialist "Create GitHub issue: 'Add RLS to opportunities table'"
```

### Supabase MCP (Future)
Permite agents rodarem queries SQL diretamente

### Slack MCP (Future)
Permite agents enviarem notificações para Slack

---

## 🎓 Best Practices

### 1. **Single Responsibility por Agent**
Cada agent foca em sua especialidade. Não peça para @frontend criar database schemas.

### 2. **Sempre Mencione Protocol Notecraft™**
Ao delegar para @frontend-specialist, sempre reforce os limites de linhas.

**✅ Good**:
```
@frontend-specialist "Create StatCard molecule (≤35 lines) following Protocol Notecraft™"
```

**❌ Bad**:
```
@frontend-specialist "Create StatCard"
```

### 3. **Forneça Contexto**
Agents não compartilham memória. Forneça contexto necessário.

**✅ Good**:
```
@backend-specialist "Create opportunities table. Schema in /protocol/ARCHITECTURE.md. Use UUID primary key, add RLS for admin/manager/salesperson"
```

**❌ Bad**:
```
@backend-specialist "Create opportunities table"
```

### 4. **Valide com QA antes de Deploy**
Sempre passe por @qa-specialist antes de considerar algo pronto.

```
@qa-specialist "Final review before deploy: pages/funil-vendas.html"
```

### 5. **Use Product Manager para Decisões**
Dúvidas sobre priorização? Pergunte ao @product-manager.

```
@product-manager "Should we implement 'Temporary Loss' status or keep only Won/Lost?"
```

---

## 🚨 Escalation Matrix

### Blockers Técnicos
**@frontend-specialist** ↔ **@backend-specialist** (pair programming)

### Decisões de Produto
**@product-manager** (final say)

### Quality Gates Failed
**@qa-specialist** bloqueia deploy até fix

### Security Issues
**@backend-specialist** + **@qa-specialist** (priority P0)

---

## 📊 Agent Performance Metrics

### @frontend-specialist
- Components created per sprint
- Protocol compliance rate (%)
- Lighthouse score average

### @backend-specialist
- Tables created per sprint
- RLS policies coverage (%)
- API response time (< 200ms)

### @qa-specialist
- Bugs found per sprint
- Critical bugs found before prod
- Test coverage (%)

### @product-manager
- User stories delivered per sprint
- Velocity (story points/sprint)
- NPS score

---

**Built with ❤️ following Protocol Notecraft™**
**STAGETEK Engineering Team**
