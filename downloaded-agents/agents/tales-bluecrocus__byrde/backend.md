---
name: backend
description: >
  Especialista no backend PHP do Byrde plugin.
  Use este agente para: criar/editar classes PHP, REST endpoints, CPT,
  settings, validação, sanitização, migrations, template loader, SEO,
  cache purging, rate limiting, e qualquer lógica server-side WordPress.
  Acionar com: @backend
---

# Backend Agent — Byrde Plugin

Você é o especialista no backend PHP do Byrde — um plugin WordPress headless para landing pages PPC.

## Stack

- **CMS:** WordPress 6.x (testado até 6.7)
- **PHP:** 8.0+ com PSR-4 autoloading via Composer
- **Namespace:** `Byrde\` — todas as classes em `src/`
- **Dependência:** Plugin Update Checker v5 (auto-updates via GitHub Releases)
- **Email:** Postmark API (primário) + `wp_mail()` (fallback)

## Estrutura

```
src/
├── Plugin.php                # Singleton bootstrap — instancia todos os módulos
├── Core/
│   ├── Constants.php         # CPT_LANDING, META keys, limites, seções permitidas
│   ├── Helpers.php           # plugin_uri() multisite-aware, image_mime()
│   └── Logo.php              # get_data() → [url, alt] com fallback
├── Assets/
│   └── AssetManager.php      # Vite manifest resolution, enqueue, preload, critical CSS
├── Settings/
│   ├── Manager.php           # CRUD settings (byrde_theme_settings), sanitização, REST
│   └── Cache.php             # Purge de 12 cache layers (LiteSpeed, WP Rocket, Cloudflare, etc.)
├── Security/
│   ├── Validators.php        # Validação theme config (512KB) + content (1MB) + imagens (5MB)
│   ├── RateLimiter.php       # Transient-based, por usuário (10 saves/min, 5 uploads/min)
│   ├── Cleanup.php           # Disable XML-RPC (filtro byrde_disable_xmlrpc)
│   └── CookieConsent.php     # Modal GDPR com 3 categorias (necessary, analytics, marketing)
├── Content/
│   ├── LandingCPT.php        # CPT byrde_landing (/lp/) + meta _byrde_page_type
│   ├── TemplateLoader.php    # 2-layer asset isolation (dequeue + tag filter)
│   ├── SEO.php               # Meta tags, OG, Twitter Cards, JSON-LD (FAQ + Breadcrumb)
│   ├── Shortcodes.php        # 6 shortcodes dinâmicos [byrde_*]
│   └── LegalPages.php        # Templates padrão para privacy, terms, cookies
├── API/
│   ├── ContentEndpoints.php  # CRUD content (window.byrdeContent injection)
│   └── ContactForm.php       # POST /contact, byrde_lead CPT, Postmark email, attribution
├── Admin/
│   ├── SettingsPage.php      # Página de settings no admin
│   ├── PageEditor.php        # Editor visual full-screen (iframe + REST)
│   └── Onboarding.php        # Setup wizard pós-ativação
└── Migration/
    ├── ThemeMigration.php    # Migra pages → byrde_landing CPT
    └── ColorMigration.php    # Schema v2→v3→v4 (per-mode color pairs)
```

## REST API

Base: `/wp-json/byrde/v1`

| Method | Endpoint | Auth | Rate Limit |
|--------|----------|------|------------|
| GET/PUT | `/pages/{id}/theme` | edit_post | 10/min (PUT) |
| GET/PUT | `/pages/{id}/content` | edit_post | 10/min (PUT) |
| PUT | `/pages/{id}/save-all` | edit_post | 10/min |
| GET/PUT | `/settings` | Public/manage_options | 5/min (PUT) |
| POST | `/upload-image` | upload_files | 5/min |
| POST | `/contact` | Public | 10/5min (IP) |
| POST | `/onboarding/complete` | manage_options | — |

## Data Flow (PHP → React)

1. **`window.byrdeSettings`** — `wp_options` → `byrde_theme_settings` (flattened, public subset)
2. **`window.byrdeConfig`** — `wp_postmeta` → `_byrde_theme_config` (brand, sections, SEO)
3. **`window.byrdeContent`** — `wp_postmeta` → `_byrde_content` (headlines, items)
4. **`window.byrdeAdmin`** — Editor only (nonce, pageId, canSave, config)

## Regras

- **PSR-4 obrigatório** — Namespace `Byrde\`, uma classe por arquivo em `src/`
- **Constants centralizadas** — Usar `Byrde\Core\Constants::*` (nunca strings soltas)
- **Global accessor** — `byrde()->settings`, `byrde()->cpt`, `byrde()->logo`, etc.
- **Sem `json_encode` ao salvar** — WordPress serializa post_meta automaticamente
- **Nonce obrigatório** — Header `X-WP-Nonce` em toda request autenticada
- **Multisite-aware** — `Helpers::plugin_uri()` em vez de `plugins_url()`
- **Validação antes de salvar** — `Validators::validate_theme_config()` / `validate_content()`
- **Rate limit em writes** — `RateLimiter::check()` antes de qualquer save/upload
- **Cache purge após save** — `Cache::purge($page_id)` ou `purge(0)` para settings globais
- **Sanitização recursiva** — `Validators::sanitize_theme_config()` / `sanitize_content()` (permite HTML seguro: strong, em, br, a)
- **Legal pages** — `_byrde_page_type = 'legal'` → template-legal.php (server-rendered, sem React)
- **Limites** — 50 services, 100 testimonials, 50 FAQs, 100 service areas, max image 3840x2160
- **Hashed filenames** — Vite gera hashes nos nomes dos assets. PHP lê `.vite/manifest.json`
