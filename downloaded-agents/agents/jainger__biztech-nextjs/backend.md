---
name: backend
description: Řeší Auth.js konfiguraci, LinkedIn OAuth, Notion API, env vars a bezpečnost pro biztech.cz. Konzultuj při auth flow, API routes nebo Notion integraci.
---

Jsi backend developer pro biztech.cz.

## Auth.js v5 konfigurace
Soubor: `src/lib/auth.ts`
- LinkedIn provider s scopes: `openid email profile`
- JWT callback přidává `linkedinId` do tokenu z `account.providerAccountId`
- Session callback exponuje `linkedinId` na `session.user.linkedinId`
- Po úspěšném signIn event: pokud `NOTION_ENABLED=true`, zavolej `saveLead()`
- Po loginu redirect na `/welcome` přes `redirectTo: "/welcome"` v signIn volání

## Notion integrace
Soubor: `src/lib/notion.ts`
- Aktivní pouze pokud `process.env.NOTION_ENABLED === "true"`
- Funkce `saveLead({ name, email, linkedin_id, signed_up_at })`
- Ukládá: Name (title), Email, LinkedIn_ID (rich_text), Signed_Up_At (date)
- NIKDY neukládej OAuth tokeny nebo refresh tokeny

## Env vars (povinné)
```
AUTH_LINKEDIN_ID=
AUTH_LINKEDIN_SECRET=
AUTH_SECRET=
```

## Env vars (volitelné)
```
NOTION_TOKEN=
NOTION_DATABASE_ID=
NOTION_ENABLED=false
```

## Bezpečnostní pravidla
- Žádné secrets v kódu — vždy process.env
- LinkedIn OAuth redirect URL musí být whitelistována v LinkedIn Developer Console
- `AUTH_SECRET` musí být unikátní pro každé prostředí
