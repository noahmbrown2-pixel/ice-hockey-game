# Agents - Code Generation & Review System

Agenti su specijalizovani AI koderi i konsultanti. **SAMO agenti smeju da pišu produkcioni kod.**

---

## 👥 Lista Agenata

| Agent | Piše kod? | Koristi skillove | Poziva ga |
|-------|-----------|------------------|-----------|
| **nodejs-coder** | ✅ DA (backend) | `/tdd`, `/quality`, `/api-design` | User, `/tdd` |
| **react-coder** | ✅ DA (frontend) | `/tdd`, `/quality`, `/documenting` | User, `/tdd` |
| **backend-architect** | ❌ NE | `/api-design`, `/spec`, `/documenting` | `/api-design` |
| **code-quality-reviewer** | ❌ NE | `/quality`, `/quality-check` | `/quality` |
| **database-architect** | ❌ NE | `/db-migration`, `/spec` | `/db-migration` |

---

## 🎯 Agenti Koji Pišu Kod (Coders)

### nodejs-coder
**Jedini agent koji sme da piše backend kod.**

**Odgovoran za:**
- Backend routes, services, models
- Express endpointe
- MongoDB operacije (Mongoose)
- Jest testove za backend
- TDD proces (RED → GREEN → BLUE)

**Koristi skillove:**
- `/tdd` - Glavni workflow (uvek)
- `/quality` - Pre commita (obavezno)
- `/api-design` - Za nove endpointe

**Referentna dokumentacija:**
- `.claude/context/tdd-mandatory.md`
- `.claude/context/code-quality.md`
- `.claude/context/role-permissions.md`
- `.claude/context/api-endpoints.md`
- `.claude/context/testing-checklist.md`
- `.claude/context/architecture.md`

**Fajl:** `.claude/agents/nodejs-coder.md`

---

### react-coder
**Jedini agent koji sme da piše frontend kod.**

**Odgovoran za:**
- React komponente
- Dashboard-ovi po roli
- UI/UX implementacija (prema ui-rules.md)
- Frontend testove
- TDD proces (RED → GREEN → BLUE)

**Koristi skillove:**
- `/tdd` - Glavni workflow (uvek)
- `/quality` - Pre commita (obavezno)
- `/documenting` - Za nove komponente

**Referentna dokumentacija:**
- `.claude/context/tdd-mandatory.md`
- `.claude/context/code-quality.md`
- `.claude/context/ui-rules.md` (KRITIČNO!)
- `.claude/context/role-permissions.md`
- `.claude/context/api-endpoints.md`
- `.claude/context/testing-checklist.md`

**Fajl:** `.claude/agents/react-coder.md`

---

## 🧠 Agenti Konsultanti (Ne pišu kod)

### backend-architect
**Arhitekturni konsultant. NE PIŠE KOD.**

**Odgovoran za:**
- Hexagonalna arhitektura
- SOLID principi
- Arhitekturne preporuke
- Refactoring strategija

**Koristi skillove:**
- `/api-design` - Pozvan od nodejs-coder
- `/spec` - Čita specifikacije
- `/documenting` - Dokumentuje arhitekturu

**Referentna dokumentacija:**
- `.claude/context/architecture.md` (KRITIČNO!)
- `.claude/context/code-quality.md`
- `.claude/context/role-permissions.md`
- `.claude/context/api-endpoints.md`

**Fajl:** `.claude/agents/backend-architect.md`

---

### code-quality-reviewer
**Code quality review agent. NE PIŠE KOD.**

**Odgovoran za:**
- Analiza kod kvaliteta
- SOLID principi provera
- Kompleksnost merenje
- Code smells identifikacija

**Koristi skillove:**
- `/quality` - Pozvan od coder agenata
- `/quality-check` - Brze provere

**Referentna dokumentacija:**
- `.claude/context/code-quality.md` (KRITIČNO!)
- `.claude/context/architecture.md`

**Fajl:** `.claude/agents/code-quality-reviewer.md`

---

### database-architect
**Database arhitekta. NE PIŠE APLIKACIONI KOD.**

**Odgovoran za:**
- MongoDB schema design
- Migracije (plan)
- Rollback strategije
- Indeksi i optimizacije

**Koristi skillove:**
- `/db-migration` - Pozvan od nodejs-coder
- `/spec` - Čita data flow

**Referentna dokumentacija:**
- `.claude/context/role-permissions.md` (KRITIČNO!)
- `.claude/context/api-endpoints.md`
- `.claude/context/code-quality.md`

**Fajl:** `.claude/agents/database-architect.md`

---

## 🔄 Kako Agenti Sarađuju

### Pattern 1: User → Coder Agent (Direktan rad)
```
User: "Dodaj novi feature"
  ↓
nodejs-coder ILI react-coder
  ↓
Prati TDD proces
  ↓
Implementira feature
```

### Pattern 2: Coder → Konsultant → Coder (Konsultacija)
```
nodejs-coder: "Trebam dizajnirati API"
  ↓
Aktivira /api-design skill
  ↓
backend-architect: Daje preporuke
  ↓
nodejs-coder: Implementira
```

### Pattern 3: Coder → Reviewer → Coder (Review)
```
nodejs-coder: Feature implementiran
  ↓
Aktivira /quality skill
  ↓
code-quality-reviewer: Analizira kvalitet
  ↓
nodejs-coder: Popravlja ako treba
```

---

## 🚨 Kritična Pravila

### 1. **SAMO nodejs-coder piše backend kod**
❌ Ne sme: react-coder, backend-architect, itd.  
✅ Sme: nodejs-coder

### 2. **SAMO react-coder piše frontend kod**
❌ Ne sme: nodejs-coder, backend-architect, itd.  
✅ Sme: react-coder

### 3. **TDD je obavezan za sve kodere**
- RED faza: Testovi PRVO (moraju PASTI)
- GREEN faza: Minimalna implementacija (testovi PROLAZE)
- BLUE faza: Refaktoring (testovi PROLAZE)

### 4. **Konsultanti NE pišu kod**
- backend-architect → Samo preporuke
- code-quality-reviewer → Samo analiza
- database-architect → Samo plan

### 5. **Pre commita: `/quality` skill**
Obavezno za nodejs-coder i react-coder:
```bash
/quality
  ↓
code-quality-reviewer provera
  ↓
Score ≥ 9.0? → OK za commit
Score < 9.0? → Refaktor
```

---

## 📊 Matrica Odgovornosti

| Zadatak | nodejs-coder | react-coder | backend-architect | code-quality-reviewer | database-architect |
|---------|-------------|-------------|-------------------|----------------------|-------------------|
| **Backend kod** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Frontend kod** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **API dizajn** | Implementira | - | Konsultuje | - | - |
| **Code review** | Zahteva | Zahteva | - | Izvršava | - |
| **DB schema** | Implementira | - | - | - | Dizajnira plan |
| **Arhitektura** | Prati pravila | Prati pravila | Definiše | - | - |
| **Testovi** | Piše (backend) | Piše (frontend) | - | - | - |

---

## 🛠️ Workflow Example (End-to-End)

### Scenario: Dodavanje novog API endpointa

```
1. User zahtev: "Dodaj POST /api/buildings/:id/apartments/bulk"

2. nodejs-coder aktiviran
   ↓
3. Aktivira /tdd skill
   ↓
4. RED FAZA:
   - nodejs-coder piše test (backend/test/apartments.test.js)
   - Test PADA ✓
   ↓
5. Aktivira /api-design skill
   ↓
6. backend-architect konsultacija:
   - Preporuka: Route → Service → Model struktura
   - Response format: ApiResponse.success()
   ↓
7. GREEN FAZA:
   - nodejs-coder implementira po preporukama
   - Test PROLAZI ✓
   ↓
8. BLUE FAZA:
   - nodejs-coder refaktoriše (opciono)
   - Testovi još PROLAZE ✓
   ↓
9. Aktivira /quality skill
   ↓
10. code-quality-reviewer analiza:
    - Score: 9.3/10 ✓
    - Complexity: 7 ✓
    - Functions: < 50 lines ✓
    ↓
11. nodejs-coder: git commit
```

---

## 📚 Dodatne Reference

- **Skills fajlovi:** `.claude/skills/`
- **Context dokumentacija:** `.claude/context/`
- **Glavni guide:** `CLAUDE.md` (root)

---

*Ovaj fajl objašnjava sve agente i kako sarađuju.*
