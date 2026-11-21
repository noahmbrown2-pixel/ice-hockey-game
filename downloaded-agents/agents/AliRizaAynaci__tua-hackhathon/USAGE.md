# Parallel Agent Kullanım Kılavuzu

## 🎯 Hızlı Başlangıç

### 1. Yeni Task Başlat

```bash
# Task oluştur
cp .claude/state/task-template.md .claude/state/tasks/TASK-002.md

# State'i ANALYSIS yap
# Product Manager agent'ını çalıştır
```

### 2. Agent'ları Çalıştır

```python
# Örnek: Claude API ile agent çalıştırma
import anthropic

client = anthropic.Anthropic()

# Agent role dosyasını oku
with open(".claude/agents/product_manager.md", "r") as f:
    system_prompt = f.read()

# Task state'ini oku
with open(".claude/state/tasks/TASK-001.json", "r") as f:
    task_context = f.read()

# Agent'ı çalıştır
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    system=system_prompt,
    messages=[
        {"role": "user", "content": f"Task: {task_context}\n\nPlease perform your role."}
    ],
    max_tokens=4096
)

# State'i güncelle
# Sonraki agent'a handoff
```

## 📋 Manuel Kullanım

### Adım 1: Product Manager (Analiz)

```markdown
Sen **Product Manager** rolündesin.

Görev: ".claude/state/tasks/TASK-001.json" dosyasını oku ve:
1. Kullanıcı ihtiyacını analiz et
2. Acceptance criteria yaz
3. Sub-tasks belirle

Sonuçları state dosyasına kaydet.
```

### Adım 2: Team Lead (Planlama)

```markdown
Sen **Team Lead** rolündesin.

Analiz tamamlandı. Şimdi:
1. Teknik plan oluştur
2. Risk analizi yap
3. Developer'ları ata

State: PLANNING → IMPLEMENTATION
```

### Adım 3: Developer'lar (Paralel)

**Backend Developer:**
```markdown
Sen **Backend Developer** rolündesin.

Görev: API endpoint ve database schema

State dosyasını oku, implementasyon yap.
Tamamlandığında state'i güncelle.
```

**Frontend Developer:**
```markdown
Sen **Frontend Developer** rolündesin.

Görev: UI components ve state management

Backend API hazır olmadan mock data kullanabilirsin.
Tamamlandığında state'i güncelle.
```

### Adım 4: Review (Team Lead)

```markdown
Sen **Team Lead** rolündesin.

Her iki implementasyon da tamamlandı:
1. Kod review yap
2. Standartlara uygunluğu kontrol et
3. Review report yaz

State: REVIEW → QA
```

### Adım 5: QA Engineer

```markdown
Sen **QA Engineer** rolündesin.

Review tamamlandı. Şimdi:
1. Code quality kontrolü
2. Security review
3. Edge case analizi
4. Final report

State: QA → APPROVED veya CHANGES_REQUESTED
```

## 🔄 State İlerletme

### State Machine

```javascript
// Geçerli state'ler
const states = {
  BACKLOG: {
    next: ['ANALYSIS'],
    agent: null
  },
  ANALYSIS: {
    next: ['PLANNING'],
    agent: 'product-manager'
  },
  PLANNING: {
    next: ['IMPLEMENTATION'],
    agent: 'team-lead'
  },
  IMPLEMENTATION: {
    next: ['REVIEW'],
    agent: 'developer',
    parallel: true  // Birden fazla dev aynı anda
  },
  REVIEW: {
    next: ['QA', 'CHANGES_REQUESTED'],
    agent: 'team-lead'
  },
  QA: {
    next: ['APPROVED', 'CHANGES_REQUESTED'],
    agent: 'qa-engineer'
  },
  CHANGES_REQUESTED: {
    next: ['IMPLEMENTATION'],
    agent: 'developer'
  },
  APPROVED: {
    next: ['DONE'],
    agent: null
  }
};
```

## 📁 File Structure

Task dosyası yapısı:

```
.claude/state/tasks/
├── TASK-001/
│   ├── meta.json              # Task metadata
│   ├── analysis.md            # PM output
│   ├── plan.md                # TL output
│   ├── backend/
│   │   └── implementation.md  # Backend dev output
│   ├── frontend/
│   │   └── implementation.md  # Frontend dev output
│   ├── review.md              # TL review
│   └── qa.md                  # QA report
└── TASK-002/
    └── ...
```

## 🎛️ Konfigürasyon

### Agent Config

`.claude/agents/config.json`:

```json
{
  "agents": {
    "product-manager": {
      "systemPrompt": ".claude/agents/product_manager.md",
      "model": "claude-3-5-sonnet-20241022",
      "maxTokens": 4096
    },
    "team-lead": {
      "systemPrompt": ".claude/agents/team_lead.md",
      "model": "claude-3-5-sonnet-20241022",
      "maxTokens": 4096
    },
    "developer": {
      "systemPrompt": ".claude/agents/developer.md",
      "model": "claude-3-5-sonnet-20241022",
      "maxTokens": 8192
    },
    "qa-engineer": {
      "systemPrompt": ".claude/agents/qa_engineer.md",
      "model": "claude-3-5-sonnet-20241022",
      "maxTokens": 4096
    }
  }
}
```

## 🧪 Örnek: Komple Task

```bash
# 1. Task oluştur
echo '{
  "taskId": "TASK-002",
  "title": "Add workout templates",
  "description": "Users can save workouts as templates",
  "currentState": "BACKLOG"
}' > .claude/state/tasks/TASK-002.json

# 2. Product Manager agent çalıştır
# Output: acceptance criteria, sub-tasks

# 3. State'i ANALYSIS → PLANNING yap

# 4. Team Lead agent çalıştır
# Output: technical plan, assignments

# 5. State'i PLANNING → IMPLEMENTATION yap

# 6. Backend ve Frontend agent'ları parallel çalıştır
# Backend: API + DB schema
# Frontend: UI components

# 7. Her iki impl tamamlandığında:
# State'i IMPLEMENTATION → REVIEW yap

# 8. Team Lead review yap

# 9. State'i REVIEW → QA yap

# 10. QA Engineer review yap

# 11. State'i QA → APPROVED yap
# Done! ✅
```

## 📝 State File Format

```json
{
  "taskId": "TASK-001",
  "title": "Feature name",
  "description": "Feature description",
  "currentState": "IMPLEMENTATION",
  "currentAgent": "backend-developer",
  "assignments": {
    "analysis": {
      "agent": "product-manager",
      "status": "COMPLETED",
      "completedAt": "2024-03-24T10:00:00Z",
      "artifact": ".claude/state/tasks/TASK-001/analysis.md"
    },
    "planning": {
      "agent": "team-lead",
      "status": "COMPLETED",
      "completedAt": "2024-03-24T11:00:00Z",
      "artifact": ".claude/state/tasks/TASK-001/plan.md"
    },
    "backend": {
      "agent": "backend-developer",
      "status": "IN_PROGRESS",
      "startedAt": "2024-03-24T12:00:00Z",
      "artifact": null
    },
    "frontend": {
      "agent": "frontend-developer",
      "status": "IN_PROGRESS",
      "startedAt": "2024-03-24T12:00:00Z",
      "artifact": null
    }
  },
  "history": [
    {"state": "BACKLOG", "timestamp": "2024-03-24T09:00:00Z"},
    {"state": "ANALYSIS", "timestamp": "2024-03-24T10:00:00Z"},
    {"state": "PLANNING", "timestamp": "2024-03-24T11:00:00Z"},
    {"state": "IMPLEMENTATION", "timestamp": "2024-03-24T12:00:00Z"}
  ],
  "metadata": {
    "createdAt": "2024-03-24T09:00:00Z",
    "lastUpdated": "2024-03-24T12:00:00Z",
    "priority": "high"
  }
}
```

## 🚨 En Sık Karşılaşılan Hatalar

1. **State geçişleri sırayla olmalı**
   - ❌ BACKLOG → IMPLEMENTATION
   - ✅ BACKLOG → ANALYSIS → PLANNING → IMPLEMENTATION

2. **Review başlamadan önce tüm implementasyonlar bitmeli**
   - Backend ve Frontend aynı anda çalışabilir
   - Ama Review'a geçmeden önce ikisi de tamamlanmalı

3. **CHANGES_REQUESTED durumunda Developer'a geri dön**
   - Developer revize yapar
   - Tekrar Review'a gider

## 📊 Monitoring

```bash
# Tüm task'lerin durumu
ls -la .claude/state/tasks/

# Belirli state'teki task'ler
jq '.[] | select(.currentState == "IMPLEMENTATION")' .claude/state/tasks/*.json

# Biten task'ler
jq '.[] | select(.currentState == "DONE")' .claude/state/tasks/*.json
```

---

Bu sistem ile artık task'leri parallel olarak yönetebilirsiniz! 🚀
