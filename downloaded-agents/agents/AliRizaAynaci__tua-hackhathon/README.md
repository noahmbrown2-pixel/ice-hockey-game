# AI Core Team - Parallel Agent System

Bu sistem, Claude Code'un paralel agent'lar çalıştırabilmesi için tasarlanmıştır. Her agent kendi sorumluluk alanında bağımsız çalışır ve lifecycle boyunca belirli state'lerden geçer.

## 📁 Yapı

```
.claude/
├── agents/              # Agent tanımları
│   ├── config.json      # Agent ve workflow konfigürasyonu
│   ├── product_manager.md
│   ├── team_lead.md
│   ├── developer.md
│   └── qa_engineer.md
├── workflows/
│   └── task-lifecycle.md    # State machine dokümantasyonu
├── state/
│   ├── task-template.md     # Yeni task için template
│   └── tasks/               # Aktif task'lerin durumu
│       ├── TASK-001.json
│       └── TASK-002.json
└── team/                  # Mevcut rol tanımları (referans)
    ├── developer.md
    ├── team_lead.md
    └── qa_engineer.md
```

## 🔄 State Lifecycle

```
BACKLOG → ANALYSIS → PLANNING → IMPLEMENTATION → REVIEW → QA → APPROVED → DONE
                                              ↕
                                       CHANGES_REQUESTED
```

| State | Agent | Açıklama |
|-------|-------|----------|
| `BACKLOG` | - | Yeni task, henüz başlanmamış |
| `ANALYSIS` | Product Manager | Requirements, acceptance criteria |
| `PLANNING` | Team Lead | Teknik plan, architecture |
| `IMPLEMENTATION` | Developer | Kod yazımı |
| `REVIEW` | Team Lead | Teknik review |
| `QA` | QA Engineer | Kalite, security, edge case'ler |
| `APPROVED` | - | Onaylandı, merge edilebilir |
| `DONE` | - | Tamamlandı |

## 🚀 Kullanım

### 1. Yeni Task Oluşturma

```bash
# Task template'ini kopyala
cp .claude/state/task-template.md .claude/state/tasks/TASK-XXX.json

# State'i güncelle - BACKLOG → ANALYSIS
# product-manager agent'ını çalıştır
```

### 2. Product Manager Analizi

Agent role: **Product Manager**
- Kullanıcı isteğini analiz et
- Acceptance criteria yaz
- Sub-tasks belirle
- State: `ANALYSIS` → `PLANNING`

### 3. Team Lead Planlaması

Agent role: **Team Lead**
- Teknik plan oluştur
- Risk analizi yap
- Developer'ları ata
- State: `PLANNING` → `IMPLEMENTATION`

### 4. Paralel Implementation

Agent role: **Developer**
- Backend, Frontend, DevOps aynı anda çalışabilir
- Her developer kendi scope'unu alır
- Tamamlandığında state: `IMPLEMENTATION` → `REVIEW`

### 5. Review & QA

Agent role: **Team Lead** → **QA Engineer**
- Team Lead teknik review yapar
- QA Engineer kalite kontrolü yapar
- State: `QA` → `APPROVED` veya `CHANGES_REQUESTED`

### 6. Completion

- QA onayı alınınca: `APPROVED` → `DONE`

## 📋 Task State Format

Her task bir JSON dosyası olarak saklanır:

```json
{
  "taskId": "TASK-001",
  "title": "Feature name",
  "currentState": "IMPLEMENTATION",
  "currentAgent": "backend-developer",
  "assignments": {
    "backend": "backend-developer",
    "frontend": "frontend-developer",
    "qa": null
  },
  "artifacts": {
    "analysis": ".claude/state/tasks/TASK-001/analysis.md",
    "plan": ".claude/state/tasks/TASK-001/plan.md"
  }
}
```

## 🤝 Parallel Execution

Aynı task üzerinde paralel çalışabilir:

- ✅ **Backend + Frontend**: Aynı anda bağımsız geliştirilebilir
- ✅ **Multiple Tasks**: Farklı task'ler farklı state'lerde olabilir
- ❌ **Sequential**: Review → QA sıralı olmalı

## 📝 Agent Handoff

1. Current agent çalışmayı tamamlar
2. State file'ı günceller
3. Next state ve agent belirler
4. Bir sonraki agent state file'dan okuyarak devam eder

## 🔧 Konfigürasyon

Agent davranışları `.claude/agents/config.json` içinde tanımlanır:

```json
{
  "agents": {
    "product-manager": { ... },
    "team-lead": { ... },
    "developer": { ... },
    "qa-engineer": { ... }
  },
  "workflow": {
    "states": [ ... ],
    "transitions": { ... }
  }
}
```

## 🎯 Best Practices

1. **Her agent sadece kendi state'inde çalışır**
2. **State file tek source of truth'dur**
3. **Review aşamasında Team Lead teknik, QA kalite kontrolü yapar**
4. **CHANGES_REQUESTED durumunda Developer'a geri döner**
5. **APPROVED durumunda task tamamlanmış sayılır**

## 📊 Örnek Task Akışı

Task: "Kullanıcı login sistemi"

1. **BACKLOG** → User request
2. **ANALYSIS** → PM: Requirements, acceptance criteria
3. **PLANNING** → TL: JWT auth, bcrypt hashing, login endpoint
4. **IMPLEMENTATION** → Backend + Frontend parallel
   - Backend: `/api/login` endpoint
   - Frontend: Login form component
5. **REVIEW** → TL: Code review
6. **QA** → QA: Security, edge cases, test coverage
7. **APPROVED** → Ready to merge
8. **DONE** → Complete

---

**Not**: Bu sistem manuel veya otomatik agent çağrılarıyla kullanılabilir. Her agent kendi role dosyasını okuyarak çalışır.
