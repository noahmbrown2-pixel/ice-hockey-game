# Agent Tests & Couverture IronTrack — TDD/BDD 2026

**Expertise** : Vitest, Playwright, Testing Library, jest-axe, Lighthouse CI — seuil 90% couverture minimum

---

## Stack de Test IronTrack

```
Vitest 30+          → Tests unitaires & composants React
Playwright 1.55+    → E2E (Chrome headless via MCP Playwright)
jest-axe 10+        → Accessibilité automatisée (WCAG)
Lighthouse 12+      → Performance & Core Web Vitals
@testing-library/react → Rendu composants + user-event
```

---

## Seuils Obligatoires

```json
// vitest.config.ts — thresholds à respecter
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80
  }
}
```

**Vérifier la couverture :**
```bash
npm run test:coverage
# Rapport : coverage/index.html
```

---

## Patterns de Tests Unitaires

### Composant React (Testing Library)
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ExerciseCard2025 } from '@/components/exercises/ExerciseCard2025'

describe('ExerciseCard2025', () => {
  const mockExercise = {
    id: 1, name: 'Développé couché',
    type: 'Musculation', muscle_group: 'Pectoraux'
  }

  it('affiche le nom de l\'exercice', () => {
    render(<ExerciseCard2025 exercise={mockExercise} />)
    expect(screen.getByText('Développé couché')).toBeInTheDocument()
  })

  it('appelle onClick au clic', async () => {
    const onClick = vi.fn()
    render(<ExerciseCard2025 exercise={mockExercise} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(mockExercise)
  })
})
```

### Hook personnalisé
```typescript
import { renderHook, act } from '@testing-library/react'
import { useExerciseTimer } from '@/hooks/useExerciseTimer'

describe('useExerciseTimer', () => {
  it('démarre et arrête le timer', () => {
    const { result } = renderHook(() => useExerciseTimer())
    act(() => result.current.start(60))
    expect(result.current.isRunning).toBe(true)
    act(() => result.current.stop())
    expect(result.current.isRunning).toBe(false)
  })
})
```

### Service Supabase (avec mock)
```typescript
import { vi } from 'vitest'
// Mock Supabase — mais TOUJOURS doubler avec un test d'intégration réel
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    }))
  }))
}))
```

**⚠️ Règle : Jamais uniquement des mocks Supabase** — toujours un test d'intégration correspondant pour valider la vraie DB.

---

## Tests d'Accessibilité (jest-axe)

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'
import { render } from '@testing-library/react'

expect.extend(toHaveNoViolations)

it('n\'a pas de violations WCAG', async () => {
  const { container } = render(<ExerciseDetailsModal isOpen={true} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

**Règle : Chaque composant modal/dialog doit avoir ce test.**

---

## Tests E2E Playwright

### Flux critiques à couvrir obligatoirement
1. **Auth** : inscription → confirmation email → connexion → déconnexion
2. **Exercice** : création via wizard → ajout performance → modification → suppression
3. **Timer** : démarrage session → repos rapide → fin session
4. **Profil** : modification données → export RGPD

### Template Playwright
```typescript
// tests/e2e/exercise-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Flux création exercice', () => {
  test.beforeEach(async ({ page }) => {
    // Auth avec utilisateur de test
    await page.goto('/auth')
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL!)
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!)
    await page.click('button[type="submit"]')
    await page.waitForURL('/exercises')
  })

  test('crée un exercice via le wizard', async ({ page }) => {
    await page.click('[data-testid="create-exercise-btn"]')
    await page.fill('[name="name"]', 'Test Squat')
    await page.selectOption('[name="type"]', 'Musculation')
    await page.click('button:has-text("Suivant")')
    await expect(page.locator('[data-testid="exercise-card"]').filter({ hasText: 'Test Squat' })).toBeVisible()
  })
})
```

### Variables d'env pour tests
```bash
# .env.test.local (jamais committé)
TEST_USER_EMAIL=test@irontrack.local
TEST_USER_PASSWORD=TestPassword123!
```

---

## Lighthouse CI — Performance Budget

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.85 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
  },
}
```

---

## Commandes de Test

```bash
npm run test              # Tests unitaires watch mode
npm run test:run          # Tests unitaires une fois
npm run test:coverage     # Rapport couverture
npm run test:e2e          # Playwright headless
npm run test:e2e:ui       # Playwright avec UI
npx lighthouse https://iron-track-dusky.vercel.app --output html
```

---

## Checklist Tests Avant PR

- [ ] Couverture ≥ 80% sur les fichiers modifiés
- [ ] Tous les nouveaux composants ont un test jest-axe
- [ ] Flux E2E critiques passent
- [ ] Aucun `console.error` dans les tests
- [ ] Mocks Supabase doublés par un test d'intégration

---

## Utilisation Autonome

```bash
# Analyser un composant et générer ses tests
"Génère les tests unitaires et d'accessibilité pour ExerciseCard2025"

# Vérifier la couverture d'un module
"Quel est le taux de couverture de src/components/exercises/ ?"

# Créer les tests E2E d'un flux
"Crée les tests Playwright pour le flux de création d'exercice"

# Diagnostiquer un test qui échoue
"Le test ExerciseWizard.test.tsx échoue avec cette erreur : [erreur]"
```
