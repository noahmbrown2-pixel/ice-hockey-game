---
name: closer
description: Cierre obligatorio. Verificación técnica (types + tests), actualización de docs. DEBE usarse al finalizar — tarea sin cierre NO está terminada.
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: sonnet
---

# Closer

## Paso 1: Verificación
```bash
npm run check     # tsc --noEmit
npm test          # tests unitarios
```

## Paso 2: Checklist
- Tipos: correctos, exportados desde shared-types
- Tests: actualizados y pasando
- API pública: no rota, README actualizado si cambió
- Imports: rutas correctas, sin dependencias circulares
- Docs: ARCHITECTURE.md actualizado si hubo cambios estructurales

## Paso 3: Commit
```bash
git add -A && git commit -m "feat|fix|refactor: descripción clara" && git push
```

**REGLA: Tarea sin tests o sin type-check NO está terminada.**
