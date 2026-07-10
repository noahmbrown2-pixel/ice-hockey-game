# Claude Code Agents

Agentes de proyecto en formato Claude Code (Markdown + frontmatter YAML), equivalentes a los definidos en `agents/*.toml` para Codex.

## Agentes disponibles

| Agente | Modelo | Rol |
|--------|--------|-----|
| `app-orchestrator` | opus | Orquestador principal: planificación, descomposición y coordinación |
| `frontend-surface` | sonnet | Especialista UI/UX: layout, jerarquía visual, componentes |
| `catalog-platform` | opus | Especialista datos/backend: discovery, APIs, empaquetado |
| `content-governance` | haiku | Especialista contenido: taxonomía, labels, copy |
| `quality-guardian` | opus | Especialista QA: confianza, regresiones, accesibilidad |
| `playwright-qa` | opus | QA en navegador: journeys E2E, interacciones |
| `security-audit` | opus | Seguridad: paths, packaging, superficie admin |
| `data-migration` | opus | Evolución de datos: migraciones, normalización de esquema |

## Cómo invocar un agente

Hay tres formas:

```text
# 1. Mención directa (garantiza invocación)
@"app-orchestrator (agent)" rediseña la arquitectura del portal

# 2. Lenguaje natural (Claude decide si delegar)
Usa el agente security-audit para revisar el servidor

# 3. Flag de sesión (el agente controla toda la sesión)
claude --agent app-orchestrator
```

## Ejemplos de uso del orquestador

### Planificar una nueva funcionalidad completa

```text
@"app-orchestrator (agent)" Necesito añadir un sistema de valoraciones
(rating 1-5 estrellas) a las skills del catálogo. Planifica qué cambios
hacen falta en backend, frontend y datos, y define el orden de ejecución.
```

El orquestador devolverá un plan con secciones claras: cambios en el modelo de datos, nuevo endpoint API, componente UI, y delegará a `catalog-platform` para el backend, `frontend-surface` para la UI, y `data-migration` para actualizar el catálogo existente.

### Coordinar una refactorización transversal

```text
@"app-orchestrator (agent)" Los filtros del catálogo mezclan categorías
reales con labels genéricos como "Projects / repo". Necesito que se limpie
la taxonomía, se actualicen los datos y se ajuste la UI. Coordina el trabajo.
```

El orquestador descompondrá en: `content-governance` para definir las nuevas categorías, `data-migration` para normalizar el catálogo, `frontend-surface` para ajustar los selectores, y `quality-guardian` para validar que no se rompa nada.

### Rediseñar una sección del portal

```text
@"app-orchestrator (agent)" La sección de admin está mezclada con el flujo
de browsing. Sepáralas en experiencias claramente diferenciadas. Define la
estructura y delega la implementación.
```

### Auditar el estado general del producto

```text
@"app-orchestrator (agent)" Haz una revisión completa del portal: ¿el flujo
de usuario es coherente? ¿Las labels coinciden con los datos reales?
¿Hay secciones que sobran o duplican funcionalidad? Dame un diagnóstico
y un plan de acción priorizado.
```

### Orquestar después de un cambio en el modelo de datos

```text
@"app-orchestrator (agent)" Acabo de añadir el campo "repository" al
esquema de skills. Necesito que se propague a: discovery, catálogo
persistido, filtros de la UI, cards, y modal de detalle. Coordina
la propagación en el orden correcto.
```

## Patrón de delegación recomendado

1. **`app-orchestrator`** define la estructura y el plan.
2. **`frontend-surface`**, **`catalog-platform`** y **`content-governance`** ejecutan en paralelo cuando sus áreas de escritura no se solapan.
3. **`playwright-qa`** y **`quality-guardian`** validan después de que la implementación se estabilice.
4. **`security-audit`** interviene cuando cambian downloads, paths o acciones admin.
5. **`data-migration`** actúa cuando cambia el esquema del catálogo o las reglas de agrupación.

## Cuándo NO usar agentes

- No lances múltiples agentes para un cambio de una línea de CSS.
- No ejecutes QA antes de que el modelo de datos esté estable.
- No pidas a agentes de contenido que resuelvan lógica de backend.
- No dejes que un agente de revisión defina la estructura del producto.
