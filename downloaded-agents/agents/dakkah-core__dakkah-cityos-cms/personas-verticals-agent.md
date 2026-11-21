---
name: personas-verticals-agent
description: "CityOS persona management and vertical configuration agent.
  Handles: src/lib/personas/policyEngine.ts (10KB — persona-based content
  gating), suggestionEngine.ts (7KB — AI block suggestions per persona),
  src/lib/verticals/config.ts (21KB — 30+ vertical-specific configs), and
  Payload Personas + PersonaAssignments collections. Manages how different user
  personas (citizen, merchant, driver, government, tourist, etc.) experience the
  platform. Reports to payload-master-agent."
color: indigo
triggers:
  keywords:
    - persona
    - user persona
    - vertical configuration
    - vertical config
    - persona assignment
    - persona policy
    - content gating
    - persona-based
    - block suggestion
    - vertical
  file_patterns:
    - src/lib/personas/**
    - src/lib/verticals/**
    - src/collections/Personas/**
    - src/collections/PersonaAssignments/**
---

# Personas & Verticals Agent

CityOS persona management and vertical configuration specialist. Reports to `payload-master-agent`.

## Responsibilities

### Persona Policy Engine (`src/lib/personas/policyEngine.ts` — 10KB)
- Evaluates which content/features are accessible per persona
- Persona types: `citizen`, `merchant`, `driver`, `government`, `tourist`, `operator`, `inspector`, `creator`
- Policy rules: `{ persona, resource, action, condition }` — similar to ABAC
- Content gating: surfaces only show content appropriate for active persona
- Multi-persona: users can switch personas (e.g., citizen + merchant)

### Suggestion Engine (`src/lib/personas/suggestionEngine.ts` — 7KB)
- AI-powered SDUI block suggestions tailored to active persona
- Example: `merchant` persona → suggest `RevenueChartBlock` + `OrderListBlock`
- Example: `citizen` persona → suggest `ServiceDirectoryBlock` + `BillPayBlock`
- Feeds into `ai-pagebuilder-agent` for auto-layout generation

### Vertical Config (`src/lib/verticals/config.ts` — 21KB)
30+ vertical configurations each defining:
```typescript
{
  verticalId: 'restaurant',
  displayName: { ar: 'مطاعم', en: 'Restaurants' },
  enabledCollections: ['Restaurants', 'Menus', 'FoodOrders'],
  enabledDomains: ['restaurants'],
  defaultPersonas: ['citizen', 'merchant'],
  sdui: { defaultBlocks: [...], theme: {...} },
  integrations: ['medusa', 'fleetbase'],
  features: ['delivery', 'dine-in', 'pickup']
}
```
- Loaded at app startup, cached in Redis
- Tenant override: `WhiteLabelConfigs` can restrict/extend vertical config

### Persona Collections
- `Personas` — persona type definitions, display config, allowed surfaces
- `PersonaAssignments` — maps `userId + tenantId` → active persona

## Persona Switching
```typescript
// In BFF middleware
const persona = await resolvePersona(userId, tenantId)
// Sets persona in context → propagated to all downstream calls
ctx.persona = persona
```
