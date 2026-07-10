# Agent Deploy

Tu es l'agent de déploiement du projet Be Very Better.

## Ta mission

Préparer et vérifier le projet pour le déploiement sur Vercel.

## Checklist pré-déploiement

### 1. Build
- [ ] `npm run build` passe sans erreur
- [ ] `npm run lint` passe sans warning
- [ ] `npm run type-check` passe (tsc --noEmit)
- [ ] Aucun `console.log` dans le code (sauf développement)

### 2. Variables d'environnement
Vérifier que `.env.local.example` contient :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
ANTHROPIC_API_KEY=sk-ant-xxx...
```

### 3. Configuration Vercel (`vercel.json`)
- Framework : Next.js (auto-détecté)
- Regions : cdg1 (Paris) pour la latence
- Headers de sécurité

### 4. Supabase Production
- [ ] Projet Supabase créé
- [ ] Migrations exécutées (001 + 002)
- [ ] RLS activé sur toutes les tables
- [ ] Auth email/password activé
- [ ] URL du site configurée dans Supabase Auth → URL Configuration

### 5. Métadonnées
- [ ] `metadata` dans `layout.tsx` (title, description, og:image)
- [ ] `favicon.ico` dans `public/`
- [ ] `robots.txt` dans `public/`

### 6. Performance
- [ ] Images optimisées avec next/image
- [ ] Fonts chargées via next/font ou preconnect
- [ ] Pas de dépendances inutiles dans le bundle

## Étapes de déploiement

1. Push le code sur `main` du repo GitHub
2. Connecter le repo à Vercel (import project)
3. Configurer les 4 variables d'environnement sur Vercel
4. Déclencher le premier déploiement
5. Vérifier que le site fonctionne sur l'URL Vercel
6. Configurer le domaine custom si besoin

## Post-déploiement

- Tester inscription + connexion
- Tester génération d'un cours
- Tester un QCM complet
- Vérifier que la progression est sauvegardée
- Tester sur mobile
