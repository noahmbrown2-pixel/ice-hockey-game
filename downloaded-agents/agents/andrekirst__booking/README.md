# Sub-Agents für Booking-Projekt

## Übersicht
Spezialisierte Sub-Agents adaptiert aus https://github.com/wshobson/agents für unser Familien-Buchungssystem mit .NET 9, Next.js und PostgreSQL.

## Quick Start
```bash
# Setup und Installation
./scripts/setup-agents.sh

# Agent direkt verwenden
Als backend-architect: Entwerfe Event Sourcing API für Buchungshistorie
Als frontend-developer: Erstelle responsive Kalender mit Touch-Support
```

## Verfügbare Agents

### 🏗️ Core Development (Priority 1)
| Agent | Model | Spezialisierung |
|-------|-------|-----------------|
| `backend-architect` | sonnet | .NET 9 Native AOT, Event Sourcing, PostgreSQL |
| `frontend-developer` | sonnet | Next.js 15, TypeScript, Tailwind, Touch-UI |
| `sql-pro` | sonnet | PostgreSQL Optimierung, Event Store, EF Core |
| `security-auditor` | opus | JWT Auth, OWASP, GDPR, Raspberry Pi Security |
| `deployment-engineer` | sonnet | Docker Multi-Agent, CI/CD, ARM64 |

### 🔧 Quality & Performance (Priority 2)
| Agent | Model | Spezialisierung |
|-------|-------|-----------------|
| `code-reviewer` | sonnet | C# 12 Konventionen, Code-Qualität, Performance |
| `test-automator` | sonnet | xUnit, Jest, Playwright, Testcontainers |
| `performance-engineer` | opus | Native AOT, Bundle-Size, Pi-Optimierung |

### 🚀 Operations (Priority 3)
| Agent | Model | Spezialisierung |
|-------|-------|-----------------|
| `devops-troubleshooter` | sonnet | Incident Response, Docker Debugging |
| `api-documenter` | haiku | OpenAPI, TypeScript SDK, Developer Docs |

## Agent-Verwendung

### Direkte Ansprache
```
Als backend-architect: Entwerfe RESTful API für Buchungs-Verfügbarkeit mit Event Sourcing Pattern
Als frontend-developer: Erstelle responsive Kalender-Komponente mit Date-Range-Picker für Touch-Devices
Als sql-pro: Optimiere Verfügbarkeits-Query für überlappende Buchungszeiträume mit PostgreSQL CTEs
Als security-auditor: Überprüfe JWT-Token-Implementation auf OWASP Top 10 Vulnerabilities
```

### Multi-Agent Workflows
```
Verwende feature-development Workflow für Booking-Timeline mit Event Sourcing
Starte security-review Workflow für Admin-Approval-System
Führe performance-optimization Workflow für Raspberry Pi Deployment aus
```

## Workflow-Sequenzen

### 1. Feature Development
```
backend-architect → frontend-developer → sql-pro → test-automator → security-auditor → code-reviewer → deployment-engineer
```

### 2. Bug Fixing
```
devops-troubleshooter → performance-engineer → code-reviewer → test-automator → deployment-engineer
```

### 3. Security Review
```
security-auditor → code-reviewer → test-automator → deployment-engineer
```

### 4. Performance Optimization
```
performance-engineer → sql-pro → frontend-developer → deployment-engineer
```

## Koordinations-Matrix

| Agent | Koordiniert hauptsächlich mit |
|-------|--------------------------------|
| backend-architect | frontend-developer, sql-pro, security-auditor |
| frontend-developer | backend-architect, test-automator, performance-engineer |
| sql-pro | backend-architect, performance-engineer |
| security-auditor | code-reviewer, deployment-engineer |
| deployment-engineer | devops-troubleshooter, performance-engineer |

## Projektspezifische Anpassungen

### Alle Agents
- ✅ Deutsche Kommunikation, englische Fachbegriffe
- ✅ Booking-Domain Kontext (Familien-Buchungssystem)
- ✅ Raspberry Pi Zero 2 W Hardware-Constraints
- ✅ Multi-Agent Koordination über CLAUDE.md

### Backend-Specific
- ✅ .NET 9 Native AOT Performance-Constraints
- ✅ Entity Framework Core Event Sourcing Patterns
- ✅ PostgreSQL ARM64 Optimierungen
- ✅ C# 12 Primary Constructors, Expression-bodied Members

### Frontend-Specific
- ✅ Next.js 15 App Router (RSC, Server Actions)
- ✅ TypeScript Strict Mode mit Domain Types
- ✅ Tailwind Touch-optimierte UI für Familie
- ✅ Mobile-first Responsive Design

## Beispiel-Szenarien

### Neue Buchungs-Feature implementieren
```bash
# 1. Backend API Design
Als backend-architect: Entwerfe Command/Query Handler für Buchungs-Timeline mit Event Sourcing

# 2. Frontend UI erstellen
Als frontend-developer: Erstelle Timeline-Komponente mit Drag&Drop Buchungs-Verschiebung

# 3. Database Schema optimieren
Als sql-pro: Erstelle effiziente Queries für Timeline-Anzeige mit PostgreSQL Window Functions

# 4. Tests implementieren
Als test-automator: Erstelle Unit- und Integration-Tests für Timeline-Feature

# 5. Security Review
Als security-auditor: Überprüfe Timeline auf Authorization und Data Leakage

# 6. Code Review
Als code-reviewer: Überprüfe Timeline-Implementation auf C# 12 Konventionen

# 7. Deployment
Als deployment-engineer: Erstelle Docker-Pipeline für Timeline-Feature
```

### Performance-Problem lösen
```bash
# 1. Problem analysieren
Als devops-troubleshooter: Analysiere Performance-Bottleneck in Buchungs-Query

# 2. Optimierung implementieren
Als performance-engineer: Optimiere .NET Native AOT Memory-Usage für Raspberry Pi

# 3. Query optimieren
Als sql-pro: Erstelle Index-Strategie für langsame Verfügbarkeits-Queries

# 4. Frontend optimieren
Als frontend-developer: Implementiere Bundle-Splitting für schnellere Load-Zeit
```

## Datei-Struktur
```
.claude/agents/
├── README.md                    # Diese Datei
├── agents.json                  # Agent-Konfiguration & Workflows
├── backend-architect.md         # .NET 9 Backend Architekt
├── frontend-developer.md        # Next.js Frontend Entwickler
├── sql-pro.md                   # PostgreSQL Experte
├── security-auditor.md          # Security & GDPR Auditor
├── deployment-engineer.md       # Docker & CI/CD Engineer
├── code-reviewer.md             # Code-Qualität Reviewer
├── test-automator.md            # Test-Automation Spezialist
├── performance-engineer.md      # Performance-Optimierung
├── devops-troubleshooter.md     # DevOps Troubleshooter
└── api-documenter.md            # API-Dokumentation Spezialist
```

## Erwartete Verbesserungen
- 🚀 **25-40%** Entwicklungsgeschwindigkeit durch Spezialisierung
- ⚡ **Parallelisierung** von Frontend/Backend Development
- 🏗️ **Konsistente Architektur** durch backend-architect
- 🔒 **Security by Design** durch security-auditor  
- 📈 **Performance-Optimiert** für Raspberry Pi Hardware
- 🧪 **Höhere Testabdeckung** durch test-automator
- 📚 **Bessere Dokumentation** durch api-documenter

## Troubleshooting

### Agent nicht gefunden
```bash
# Agent-Installation prüfen
ls -la .claude/agents/
./scripts/setup-agents.sh
```

### Konflikt zwischen Agents
- **Priority-System**: 1 (highest) → 3 (lowest)
- **Eskalation**: Senior Developer bei Unklarheit
- **File-Separation**: Verschiedene Agents = verschiedene Dateien

### Claude Code erkennt Agents nicht
```bash
# Claude Settings prüfen
cat .claude/settings.json

# Agents-Verzeichnis prüfen
ls -la .claude/agents/*.md
```

## Integration mit bestehenden Workflows
- ✅ **Branch-Workflow**: Jeder Agent respektiert Git-Branch-Strategie
- ✅ **Issue-Tracking**: Agent-Arbeit wird in GitHub Issues dokumentiert
- ✅ **Multi-Agent Docker**: Integration mit bestehenden Agent2/3/4 Setup
- ✅ **CI/CD Pipeline**: Agents unterstützen GitHub Actions Workflows

## Weitere Informationen
- 📖 **Detaillierte Analyse**: `docs/SUB_AGENTS_ANALYSIS.md`
- 📋 **CLAUDE.md**: Vollständige Projektrichtlinien
- 🐳 **Docker Setup**: `docker-compose.agent*.yml`
- 🤖 **Original Repository**: https://github.com/wshobson/agents