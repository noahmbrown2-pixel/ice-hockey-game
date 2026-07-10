# Agent: Developer (Desenvolvedor Frontend)

## Role
Desenvolvedor especializado em React/Next.js responsável por implementar os componentes conforme o planejamento do Planner.

## Responsibilities
1. Implementar componentes seguindo o PLAN.md
2. Criar a página `/aluguel` no projeto
3. Aplicar animações e efeitos visuais
4. Garantir responsividade (mobile-first)
5. Seguir as convenções do projeto

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- GSAP + ScrollTrigger
- Framer Motion
- Lucide React (ícones)

## Estrutura de Arquivos a Criar
```
web-app/src/
├── app/aluguel/
│   └── page.tsx
├── components/sections/
│   ├── HeroAluguel.tsx
│   ├── GearRenting.tsx
│   ├── StudioRenting.tsx
│   ├── CoworkPlans.tsx
│   └── AluguelContact.tsx
└── components/
    ├── pricing/
    │   ├── PriceCard.tsx
    │   ├── EquipmentItem.tsx
    │   └── PlanComparison.tsx
    └── ui/
        ├── SectionTitle.tsx
        └── AnimatedGrid.tsx
```

## Convenções de Código

### Imports
```typescript
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Camera, Drone, Sparkles } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
```

### Estrutura de Componente
```typescript
'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface ComponentProps {
  title: string;
  items: Item[];
}

export function ComponentName({ title, items }: ComponentProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // GSAP animations
  useEffect(() => {
    // Animation logic
  }, []);

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Content */}
    </section>
  );
}
```

### Animações Padrão
```typescript
// Fade up animation
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

// Stagger children
const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

## Cores do Projeto
- Background: `#000000` (black)
- Text Primary: `#FFFFFF` (white)
- Accent: `#FF10F0` (magenta/hot pink)
- Text Secondary: `rgba(255, 255, 255, 0.6)`
- Border: `rgba(255, 255, 255, 0.1)`

## Dados para a Página

### GEAR RENTING - Acessórios
- DJI RS4 Pro Combo (com mala) – 50€/dia
- Flash V480 Godox (Sony) – 10€/dia
- LED RGB MS60C – 15€/dia
- Smallrig RF10C – 5€/dia
- Camera Cooler Ulanzi – 10€/dia

### Drone
- Drone DJI Mini 4 Pro – 60€/dia

### Câmeras
- Sony A7 IV – 60€/dia
- Sony A6700 – 50€/dia
- DJI Osmo Pocket 3 Creator Combo (c/ Mic) – 30€/dia
- DJI Osmo Action 5 – 15€/dia

### Objetivas
- Sony 20mm G f1.8 – 25€/dia
- Sirui 85mm f1.4 – 45€/dia
- Samyang 35–150mm f2–2.8 – 60€/dia
- Sigma 17–40mm f1.8 – 55€/dia

### STUDIO RENTING
**Estúdio 1:**
- Equipado – 40€/h
- Com Apoio Técnico – 50€/h
- Com Apoio Criativo – sob orçamento

**Estúdio 2:**
- Equipado – 30€/h
- Com Apoio Técnico – 40€/h
- Com Apoio Criativo – sob orçamento

**Estúdio Podcast:**
- Apenas Espaço – 30€/h
- Equipado – 70€/h
- Gravação & Edição – 200€
- Pack 4 episódios – sob orçamento

### COWORK + ESTÚDIO 1
**Diária:**
- Prime – 30€ (1h)
- Starter – 25€ (1h)

**Semanal:**
- Premium – 130€ (7h)
- Prime – 110€ (4h)
- Starter – 90€ (3h)

**Mensal:**
- Premium – 280€ (12h)
- Prime – 240€ (10h)
- Starter – 200€ (8h)

**Planos:**
- Starter: Mesa 180x160cm partilhada + acessos
- Prime: Mesa de conferência partilhada + acessos
- Premium: Mesa elevatória privada + acessos

### CO-WORK
**Starter:**
- Diária: 12€
- Semanal: 45€
- Mensal: 120€

**Prime:**
- Diária: 15€
- Semanal: 60€
- Mensal: 150€

**Premium:**
- Semanal: 75€
- Mensal: 180€

## Checklist de Implementação
- [ ] Criar pasta `app/aluguel/page.tsx`
- [ ] Implementar HeroAluguel com título animado
- [ ] Implementar GearRenting com grid de equipamentos
- [ ] Implementar StudioRenting com cards de estúdios
- [ ] Implementar CoworkPlans com tabs/comparison
- [ ] Adicionar ícones apropriados (Lucide)
- [ ] Implementar animações GSAP ScrollTrigger
- [ ] Adicionar micro-interactions com Framer Motion
- [ ] Garantir responsividade mobile
- [ ] Testar no navegador
