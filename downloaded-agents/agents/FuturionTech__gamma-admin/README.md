# Agents Experts Gamma Admin

Ce dossier contient les agents Claude spécialisés pour le développement parallèle du système Gamma Neutral Admin. Chaque agent est un expert dans son domaine spécifique de gestion de contenu.

## 🎯 Concept

Au lieu d'un seul développeur généraliste, nous avons **18 agents experts** qui travaillent en parallèle:

### Agents Consultants
1. **graphql-backend-expert** - Expert API GraphQL (consultant pour tous)
2. **keen-ui-advisor** - Expert UI/UX Keen template (consultant design)

### Agents Content Management (Builders)
3. **services-expert** - Services (AI, Data Engineering, Cybersecurity)
4. **solutions-expert** - Solutions par secteur + Features + Benefits
5. **partners-expert** - Partenaires d'entreprise
6. **clients-expert** - Logos/témoignages clients
7. **testimonials-expert** - Témoignages avec ratings
8. **banners-expert** - Bannières hero homepage
9. **stats-expert** - Statistiques homepage

### Agents About & Team
10. **team-expert** - Membres équipe + réseaux sociaux
11. **certifications-expert** - Certifications/récompenses

### Agents Careers & Engagement
12. **careers-expert** - Offres d'emploi (Job Positions)
13. **blog-expert** - Articles de blog
14. **projects-expert** - Études de cas/portfolio

### Agents Support
15. **contact-requests-expert** - Demandes de contact
16. **faqs-expert** - Questions fréquentes

### Agent Dashboard
17. **dashboard-expert** - Agrégation métriques multi-domaines

## 🚀 Comment Utiliser les Agents

### Méthode 1: Invocation Directe

Dans Claude Code, mentionnez l'agent dans votre demande:

```
@services-expert je veux créer la page de liste des services avec filtres et statistiques
```

Ou utilisez le Task tool:
```
Utilisez l'agent services-expert pour créer les pages CRUD Services
```

### Méthode 2: Collaboration entre Agents

Les agents collaborent automatiquement:

```
services-expert → demande schéma → graphql-backend-expert
services-expert → demande UI → keen-ui-advisor
services-expert → utilise réponses → crée pages CRUD
```

### Méthode 3: Parallélisation

Lancez plusieurs agents en même temps pour développement parallèle:

```
Agent 1: services-expert → Créer domaine Services
Agent 2: solutions-expert → Créer domaine Solutions
Agent 3: blog-expert → Créer domaine Blog
Agent 4: dashboard-expert → Créer dashboard overview
```

## 📋 Workflow Type

### Créer un nouveau Domaine

**Étape 1:** Invoquer l'agent de domaine
```
@solutions-expert créer les pages CRUD Solutions avec gestion Features et Benefits
```

**Étape 2:** L'agent consulte automatiquement graphql-backend-expert
```
solutions-expert demande le schéma Solution à graphql-backend-expert
graphql-backend-expert → lit gamma-api/graphql/solutions.graphql
graphql-backend-expert → retourne schéma complet avec relations
```

**Étape 3:** L'agent peut consulter keen-ui-advisor
```
solutions-expert demande recommandations UI à keen-ui-advisor
keen-ui-advisor → suggère composants Keen appropriés
keen-ui-advisor → fournit exemples de code
```

**Étape 4:** L'agent crée les fichiers
```
- domains/solutions/index.ts
- domains/solutions/types/index.ts
- domains/solutions/graphql/queries.ts
- domains/solutions/graphql/mutations.ts
- domains/solutions/stores/useSolutionsStore.ts
- domains/solutions/composables/...
- domains/solutions/components/...
- domains/solutions/pages/SolutionsList.vue
- domains/solutions/pages/SolutionsCreate.vue
- domains/solutions/pages/SolutionsEdit.vue
- domains/solutions/pages/SolutionFeatures.vue
- domains/solutions/pages/SolutionBenefits.vue
```

**Étape 5:** L'agent enregistre le module
```
Ajoute le domaine dans nuxt.config.ts:
modules: [
  '~/domains/solutions/index.ts',
  // ...
]

Ajoute Solutions au menu dans assets/data/menu-config.json
```

**Étape 6:** Test et validation
```
L'agent teste que tout fonctionne:
- Routes accessibles
- GraphQL queries fonctionnelles
- CRUD operations complètes
- UI responsive
- i18n fr/en
```

## 🎭 Rôles des Agents

### graphql-backend-expert (Consultant)

**Quand l'utiliser:**
- AVANT de créer toute fonctionnalité GraphQL
- Pour valider des queries/mutations
- Pour comprendre le schéma backend
- Pour résoudre des erreurs GraphQL
- Pour optimiser les performances

**Ne l'utilise PAS pour:**
- Créer des pages Vue
- Écrire du code TypeScript UI
- Gérer le state Pinia
- Implémenter des composants

**Localisation schémas:** `/Users/acompaore/Documents/Futurion/Development/Web/gamma-api/graphql/`

### keen-ui-advisor (Consultant)

**Quand l'utiliser:**
- Choisir composants UI appropriés
- Implémenter layouts professionnels
- Résoudre problèmes de design
- Optimiser responsive design
- Sélectionner icônes et couleurs
- Créer forms et tables

**Ne l'utilise PAS pour:**
- Écrire queries GraphQL
- Gérer la logique métier
- Créer stores Pinia

### Domain Experts (Builders)

Chaque domain expert est responsable de:
- Créer et maintenir SON domaine uniquement
- Types TypeScript
- GraphQL queries & mutations
- Pinia store
- Composables
- Composants Vue
- Pages CRUD
- Routes
- i18n translations
- Tests

**Collabore avec:**
- **graphql-backend-expert**: Pour schéma et queries
- **keen-ui-advisor**: Pour UI et design
- **Autres domain experts**: Pour relations (ex: blog-expert → team-expert pour authors)

### dashboard-expert (Aggregator)

**Responsabilité unique:**
- Agréger données de TOUS les domaines
- Créer widgets multi-domaines
- Métriques overview
- Recent activity
- Charts et visualisations

**Collabore avec:**
- TOUS les domain experts pour données
- graphql-backend-expert pour queries dashboard
- keen-ui-advisor pour layout widgets

## 🔄 Exemples Pratiques

### Exemple 1: Créer Services

```
Utilisateur: "Créer les pages CRUD pour les Services"

Claude Code:
1. Invoque services-expert
2. services-expert → demande schéma à graphql-backend-expert
3. graphql-backend-expert → lit gamma-api/graphql/services.graphql
4. graphql-backend-expert → retourne schéma Service complet
5. services-expert → demande UI à keen-ui-advisor (optionnel)
6. keen-ui-advisor → suggère table, cards, forms
7. services-expert → crée tous les fichiers
8. services-expert → enregistre module et routes
9. services-expert → confirme création
```

### Exemple 2: Créer Dashboard

```
Utilisateur: "Créer le dashboard avec métriques de tous les domaines"

Claude Code:
1. Invoque dashboard-expert
2. dashboard-expert → consulte tous les domain experts pour structure données
3. dashboard-expert → demande queries à graphql-backend-expert
4. graphql-backend-expert → fournit queries pour chaque domaine
5. dashboard-expert → demande UI widgets à keen-ui-advisor
6. keen-ui-advisor → suggère cartes métriques, charts, layouts
7. dashboard-expert → crée composable useDashboardData (agrégation)
8. dashboard-expert → crée metric cards (8+)
9. dashboard-expert → crée widgets (activity, overview, engagement)
10. dashboard-expert → crée page dashboard.vue
11. dashboard-expert → confirme création
```

### Exemple 3: Travail Parallèle

```
Utilisateur: "Créer en parallèle: Services, Solutions, Partners, et Dashboard"

Claude Code (lance 4 agents en parallèle):
Agent 1: services-expert → Domaine Services
Agent 2: solutions-expert → Domaine Solutions (plus complexe avec Features/Benefits)
Agent 3: partners-expert → Domaine Partners
Agent 4: dashboard-expert → Dashboard (attend que 1-3 soient prêts)

Les 4 agents travaillent simultanément et rapportent leurs résultats.
Dashboard-expert peut commencer structure même si autres pas finis.
```

### Exemple 4: Résoudre un Bug

```
Utilisateur: "Le formulaire de création de Solutions ne valide pas le champ icon_color"

Claude Code:
1. Invoque solutions-expert (domaine concerné)
2. solutions-expert → analyse SolutionsCreate.vue
3. solutions-expert → identifie problème validation
4. solutions-expert → consulte graphql-backend-expert si besoin (schéma)
5. solutions-expert → corrige validation (hex color regex)
6. solutions-expert → teste le fix
7. solutions-expert → confirme résolution
```

## ⚡ Avantages du Système Multi-Agents

1. **Expertise Spécialisée**: Chaque agent connaît parfaitement SON domaine
2. **Cohérence**: Patterns uniformes au sein de chaque domaine
3. **Parallélisation**: Plusieurs features en développement simultané
4. **Qualité**: Validation automatique via consultants (graphql-backend-expert, keen-ui-advisor)
5. **Maintenance**: Un agent = Un domaine = Responsabilité claire
6. **Évolution**: Chaque agent évolue indépendamment
7. **Scalabilité**: Ajouter de nouveaux domaines = créer nouvel agent
8. **Debugging**: Bug dans Services? → services-expert uniquement

## 📝 Conventions

### Nommage Agents
- Format: `[domain]-expert` pour domaines
- Préfixe `-expert` pour tous les agents builders
- Suffixe `-advisor` pour consultants
- Toujours en anglais avec tirets

### Frontmatter
```yaml
---
name: domain-expert
description: Description courte avec cas d'usage spécifiques
model: sonnet
---
```

### Structure Agent

1. **Titre H1**: Nom clair
2. **Responsabilité**: Localisation domaine + backend
3. **Structure domaine**: Arborescence fichiers
4. **Entités**: Types GraphQL/TypeScript
5. **GraphQL Operations**: Queries & Mutations
6. **Pages à créer**: Description détaillée
7. **Règles métier**: Validation, logique
8. **State Management**: Structure Pinia
9. **Composables**: Fonctions réutilisables
10. **Collaboration**: Quels agents consulter
11. **Patterns de code**: Exemples concrets
12. **i18n**: Keys translations
13. **Checklist**: Avant implémentation

## 🔧 Création de Nouveaux Agents

Si besoin d'ajouter un nouveau domaine (ex: "News" ou "Events"):

1. Copier un agent existant similaire (ex: blog-expert)
2. Adapter le frontmatter (name, description)
3. Définir l'entité et ses champs
4. Lister les queries/mutations GraphQL
5. Documenter les pages à créer
6. Définir les règles métier
7. Identifier les collaborations
8. Ajouter exemples concrets
9. Créer checklist implémentation

Template:
```bash
cp .claude/agents/blog-expert.md .claude/agents/news-expert.md
# Éditer news-expert.md avec spécificités
```

## 📚 Architecture Gamma Admin

### Structure Projet
```
gamma-admin/
├── domains/
│   ├── services/
│   ├── solutions/
│   ├── partners/
│   ├── clients/
│   ├── testimonials/
│   ├── banners/
│   ├── stats/
│   ├── team/
│   ├── certifications/
│   ├── careers/
│   ├── blog/
│   ├── projects/
│   ├── contact-requests/
│   ├── faqs/
│   ├── dashboard/
│   ├── authentication/
│   └── shared/
├── .claude/
│   └── agents/         # Tous les agents experts
├── assets/
│   └── data/
│       └── menu-config.json
├── components/
│   └── shared/         # Composants globaux (CardSkeleton, etc.)
├── locales/
│   ├── fr.json
│   └── en.json
└── nuxt.config.ts
```

### Pattern Domaine Standard

Chaque domaine suit cette structure:
```
domains/[domain]/
├── index.ts              # Nuxt module registration
├── types/
│   └── index.ts          # TypeScript types
├── graphql/
│   ├── queries.ts        # GraphQL queries
│   └── mutations.ts      # GraphQL mutations
├── stores/
│   └── use[Domain]Store.ts  # Pinia store
├── composables/
│   ├── use[Domain]Formatters.ts
│   └── use[Domain]Actions.ts
├── components/
│   ├── [Domain]Card.vue
│   ├── [Domain]CardSkeleton.vue
│   └── [Domain]Form*.vue
└── pages/
    ├── [Domain]List.vue
    ├── [Domain]Create.vue
    └── [Domain]Edit.vue
```

## 🔍 Matrice de Collaboration

| Agent | Consulte GraphQL Expert | Consulte Keen Advisor | Consulte Autres |
|-------|------------------------|---------------------|----------------|
| services-expert | ✅ Toujours | ✅ Souvent | - |
| solutions-expert | ✅ Toujours | ✅ Souvent | - |
| partners-expert | ✅ Toujours | ✅ Parfois | - |
| clients-expert | ✅ Toujours | ✅ Parfois | - |
| testimonials-expert | ✅ Toujours | ✅ Parfois | - |
| banners-expert | ✅ Toujours | ✅ Souvent | - |
| stats-expert | ✅ Toujours | ✅ Parfois | - |
| team-expert | ✅ Toujours | ✅ Souvent | - |
| certifications-expert | ✅ Toujours | ✅ Parfois | - |
| careers-expert | ✅ Toujours | ✅ Souvent | - |
| blog-expert | ✅ Toujours | ✅ Souvent | ✅ team-expert (authors) |
| projects-expert | ✅ Toujours | ✅ Souvent | - |
| contact-requests-expert | ✅ Toujours | ✅ Parfois | - |
| faqs-expert | ✅ Toujours | ✅ Parfois | - |
| dashboard-expert | ✅ Toujours | ✅ Toujours | ✅ TOUS (données) |

## 🆘 Support et Debugging

### Si un agent ne fonctionne pas:

1. **Vérifier le frontmatter** (name, description, model)
2. **Vérifier les chemins** (gamma-api/graphql correctement référencé)
3. **Relire la description** (cas d'usage clairs?)
4. **Tester invocation**: Mentionner @agent-name dans message
5. **Consulter logs** Claude Code pour erreurs
6. **Mettre à jour**: Améliorer description si ambiguë

### Si collaboration échoue:

1. **Vérifier ordre**: GraphQL expert AVANT builder expert
2. **Vérifier dépendances**: Blog → Team (authors) nécessite team-expert opérationnel
3. **Forcer consultation**: Mentionner explicitement "consulter graphql-backend-expert d'abord"

### Pattern de débogage:

```
Problème: Solutions ne s'affichent pas dans le dashboard

Étape 1: @solutions-expert vérifier que les données se chargent correctement
Étape 2: @dashboard-expert vérifier l'agrégation des solutions
Étape 3: Si GraphQL errors → @graphql-backend-expert vérifier schéma
Étape 4: Si UI broken → @keen-ui-advisor suggestions fixes
```

## 📊 Métriques de Qualité

Chaque agent doit garantir:
- ✅ **Types TypeScript stricts** (pas de `any`)
- ✅ **GraphQL queries validées** (via graphql-backend-expert)
- ✅ **UI professionnelle** (via keen-ui-advisor)
- ✅ **i18n complet** (fr + en)
- ✅ **Shimmer loading states** (pas de spinners)
- ✅ **Error handling** (messages utilisateur clairs)
- ✅ **Responsive design** (mobile-first)
- ✅ **Tests manuels CRUD** complets

## 🎯 Prochaines Étapes

### Phase 1: Core Content (Prioritaire)
- [x] services-expert → Créer Services (FAIT)
- [ ] solutions-expert → Créer Solutions + Features + Benefits
- [ ] dashboard-expert → Créer Dashboard overview

### Phase 2: Public Engagement
- [ ] blog-expert → Créer Blog
- [ ] projects-expert → Créer Projects
- [ ] testimonials-expert → Créer Testimonials

### Phase 3: About & Team
- [ ] team-expert → Créer Team
- [ ] certifications-expert → Créer Certifications
- [ ] partners-expert → Créer Partners
- [ ] clients-expert → Créer Clients

### Phase 4: Support & Misc
- [ ] contact-requests-expert → Créer Contact Requests
- [ ] faqs-expert → Créer FAQs
- [ ] careers-expert → Créer Careers
- [ ] banners-expert → Créer Banners
- [ ] stats-expert → Créer Stats

## 📖 Documentation Complète

- [Implementation Docs](../../docs/implementation.md) - Backend specs
- [Nuxt Config](../../nuxt.config.ts) - Configuration projet
- [Menu Config](../../assets/data/menu-config.json) - Navigation
- [i18n FR](../../locales/fr.json) - Traductions françaises
- [i18n EN](../../locales/en.json) - Traductions anglaises

## 🔗 Liens Utiles

- **Backend API**: `/Users/acompaore/Documents/Futurion/Development/Web/gamma-api/graphql`
- **Keen Docs**: https://preview.keenthemes.com/html/keen/docs/index
- **Nuxt 3 Docs**: https://nuxt.com/docs
- **Pinia Docs**: https://pinia.vuejs.org
- **Apollo Client**: https://apollo.vuejs.org

---

**Version:** 1.0.0
**Dernière mise à jour:** 2025-01-19
**Créé par:** Claude Code - Gamma Admin Team
