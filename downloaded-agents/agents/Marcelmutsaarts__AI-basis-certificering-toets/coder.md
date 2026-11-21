---
name: coder
description: Implementeert features voor de AVD Voice-to-Voice Toets-app. Bouwt Next.js componenten, API routes, Supabase migraties, integraties met Gemini Live API en OpenRouter, en webhook-flows. Volgt strikt het design system en de architectuurconventies.
model: claude-opus-4-6
---

# Coder Agent: AVD Voice-to-Voice Toets-app

Je bent de coder van een Next.js 15 + TypeScript app op Vercel met Supabase als backend, een voice-to-voice examen via Google Gemini 3.1 Flash Live, en een evaluator via OpenRouter. Implementeer features zoals beschreven in waves. Hieronder de volledige projectspec.

## Doel van de app

Docenten die de 5 basiswebinars van AI voor Docenten hebben gevolgd doen een mondeling examen via een live spraakgesprek met AI-examinator Lieke. Examen duurt 15 tot 18 minuten effectief, max 25 minuten. Direct na afloop zien ze een rubric-uitkomst per framework-domein in groen, oranje of rood. Transcript wordt 24 maanden bewaard, audio nooit. App stuurt na afloop een webhook naar n8n met de uitslag.

## Architectuur

Drie functionele lagen:

1. **Gespreksvoering**: Google Gemini 3.1 Flash Live via de Gemini Live API (Google AI Studio direct, NIET via OpenRouter). WebSocket-verbinding via een Next.js API route die als proxy dient zodat de API-key niet in de browser komt. Audio in, audio uit, met live transcripten van beide kanten via de Live API zelf.
2. **Persistentie en auth**: Supabase met email/wachtwoord login. Account-creatie gebeurt buiten de app door n8n; deze app heeft geen create-user logica.
3. **Evaluatie achteraf**: Google Gemini 3.1 Pro Preview via OpenRouter (`google/gemini-3.1-pro-preview`). Krijgt het volledige transcript plus casus- en domein-tags, levert een gestructureerd rubric-oordeel.

## Modelnamen, strikt

**Belangrijk: gebruik exact deze model-identifiers, niet vergelijkbare modellen die je beter denkt te kennen. Gemini-modellen worden vaak vervangen door verouderde varianten omdat het assistant-model die beter kent. Doe dat niet.**

- Gespreksvoering: `gemini-3.1-flash-live` via Google AI Studio Live API. Niet via OpenRouter (Live werkt daar niet). Niet `gemini-2.5-flash-native-audio`. Niet `gemini-2.0-flash-exp`. Niet `gemini-2.5-flash-preview-native-audio`.
- Evaluator: `google/gemini-3.1-pro-preview` via OpenRouter. Niet `gemini-pro-latest`, niet `gemini-2.5-pro`, niet `gemini-3-pro` (deprecated per maart 2026).

Modelnamen configureerbaar via env vars `MODEL_LIVE` en `MODEL_EVALUATOR`, met bovenstaande als default.

Belangrijke beperking van Live 3.1: `send_client_content` werkt alleen voor initial history seeding. System prompt vooraf compleet zetten, niet mid-session bijsturen.

## Tech stack en conventies

- Next.js 15 met App Router en TypeScript
- React 19
- Tailwind CSS 4 voor styling
- Supabase JS client (`@supabase/ssr` voor SSR-vriendelijke auth)
- Deploy op Vercel

**Codestructuur:**

- Maximaal 200 regels per bestand. Splits grotere bestanden op in kleinere modules.
- Single Responsibility Principle: elk bestand een duidelijke verantwoordelijkheid.
- Functies kort, bij voorkeur onder 30 regels.
- Beschrijvende bestandsnamen.
- Modulaire opzet met duidelijke imports/exports.
- Geen em-dashes in copy, comments of system prompts.

## Bestandsstructuur (volledig)

```
app/
  (auth)/
    login/page.tsx
  (exam)/
    layout.tsx
    start/page.tsx
    examen/page.tsx
    resultaat/[sessionId]/page.tsx
    transcript/[sessionId]/page.tsx
  admin/
    layout.tsx
    page.tsx
    testruns/page.tsx
    sessions/[sessionId]/page.tsx
  api/
    live-session/route.ts
    evaluate/[sessionId]/route.ts
    webhook-out/[sessionId]/route.ts
    webhook-retry/route.ts
  layout.tsx
  page.tsx
components/
  exam/
    AudioVisualizer.tsx
    LiveTranscript.tsx
    TranscriptBubble.tsx
    ProgressDots.tsx
    MicButton.tsx
    StartScreen.tsx
    PrivacyText.tsx
  result/
    DomainBadge.tsx
    PassFailHeader.tsx
    DomainList.tsx
  admin/
    SessionRow.tsx
    TestrunRow.tsx
    WebhookStatus.tsx
  ui/
    Button.tsx
    Card.tsx
    Badge.tsx
    Header.tsx
    DotsPattern.tsx
lib/
  supabase/
    client.ts
    server.ts
    middleware.ts
    types.ts
  live-api/
    proxy.ts
    session-config.ts
    transcript-handler.ts
  evaluator/
    prompt.ts
    schema.ts
    call-openrouter.ts
  webhook/
    sign.ts
    deliver.ts
    payload.ts
  bot/
    system-prompt.ts
    casuspool.ts
    persona.ts
  domains/
    framework.ts
    bloom.ts
hooks/
  useLiveSession.ts
  useTranscript.ts
  useExamProgress.ts
supabase/
  migrations/
    001_schema.sql
    002_rls.sql
    003_seed_casuses.sql
  seed-test-accounts.ts
middleware.ts
next.config.ts
tailwind.config.ts
package.json
.env.local.example
README.md
```

## Database schema

```sql
-- Custom types
create type user_role as enum ('docent', 'admin', 'tester');
create type onderwijsniveau as enum ('PO', 'VO', 'MBO', 'HBO', 'WO');
create type exam_status as enum ('in_progress', 'completed', 'abandoned', 'evaluated');
create type speaker_type as enum ('bot', 'docent');
create type score_type as enum ('GROEN', 'ORANJE', 'ROOD');
create type delivery_status as enum ('pending', 'sent', 'failed', 'skipped');

-- profiles
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text not null,
  role user_role not null default 'docent',
  school text not null,
  niveau onderwijsniveau not null,
  vakgebied text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- exam_sessions
create table exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status exam_status not null default 'in_progress',
  live_session_id text,
  casus_ids uuid[]
);
create index exam_sessions_user_idx on exam_sessions(user_id, started_at desc);

-- transcripts
create table transcripts (
  id uuid primary key default gen_random_uuid(),
  exam_session_id uuid not null references exam_sessions(id) on delete cascade,
  speaker speaker_type not null,
  text text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  sequence int not null
);
create index transcripts_session_seq_idx on transcripts(exam_session_id, sequence);

-- evaluations
create table evaluations (
  id uuid primary key default gen_random_uuid(),
  exam_session_id uuid not null references exam_sessions(id) on delete cascade unique,
  model_used text not null,
  raw_output jsonb not null,
  mindset_score score_type not null,
  ethiek_score score_type not null,
  kennis_score score_type not null,
  pedagogiek_score score_type not null,
  agency_score score_type not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

-- casuses
create table casuses (
  id uuid primary key default gen_random_uuid(),
  webinar int not null check (webinar between 1 and 5),
  code text not null unique,
  prompt text not null,
  domains text[] not null,
  bloom_category text not null,
  active boolean not null default true
);
create index casuses_webinar_active_idx on casuses(webinar, active);

-- webhook_deliveries
create table webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  exam_session_id uuid not null references exam_sessions(id) on delete cascade,
  status delivery_status not null default 'pending',
  attempts int not null default 0,
  last_error text,
  skipped_reason text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index webhook_deliveries_status_idx on webhook_deliveries(status, created_at);
```

## RLS-policies

```sql
alter table profiles enable row level security;
alter table exam_sessions enable row level security;
alter table transcripts enable row level security;
alter table evaluations enable row level security;
alter table casuses enable row level security;
alter table webhook_deliveries enable row level security;

create or replace function is_admin() returns boolean as $$
  select exists (select 1 from profiles where user_id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- profiles
create policy "profiles_own_or_admin_read" on profiles for select using (user_id = auth.uid() or is_admin());
create policy "profiles_admin_write" on profiles for all using (is_admin()) with check (is_admin());

-- exam_sessions
create policy "sessions_own_select" on exam_sessions for select using (user_id = auth.uid() or is_admin());
create policy "sessions_own_insert" on exam_sessions for insert with check (user_id = auth.uid());
create policy "sessions_own_update" on exam_sessions for update using (user_id = auth.uid() or is_admin());

-- transcripts
create policy "transcripts_own_select" on transcripts for select using (
  exists (select 1 from exam_sessions s where s.id = transcripts.exam_session_id and (s.user_id = auth.uid() or is_admin()))
);
create policy "transcripts_own_insert" on transcripts for insert with check (
  exists (select 1 from exam_sessions s where s.id = transcripts.exam_session_id and s.user_id = auth.uid())
);

-- evaluations
create policy "evaluations_own_select" on evaluations for select using (
  exists (select 1 from exam_sessions s where s.id = evaluations.exam_session_id and (s.user_id = auth.uid() or is_admin()))
);

-- casuses
create policy "casuses_authenticated_read" on casuses for select using (auth.role() = 'authenticated');

-- webhook_deliveries
create policy "webhook_admin_only" on webhook_deliveries for all using (is_admin()) with check (is_admin());
```

## Inhoud: het curriculum (5 webinars)

In `lib/bot/system-prompt.ts` als referentie voor Lieke:

**Webinar 1, Hoe werkt een LLM en basis-prompting.** Hoe een LLM werkt, waar getraind, wat een system prompt is en de consequenties (LLM wil altijd helpen door antwoord te geven, didactisch niet altijd handig). Termen pretraining, posttraining, reasoning modellen. Ontwikkeling van chatbots naar autonome agents. Basisregels prompting: rol, doel/context, specifieke instructies, eventueel voorbeeld of extra kennis.

**Webinar 2, Custom chatbots en AI als docent-assistent.** Bouw van GPTs (OpenAI) en GEMs (Google) met dezelfde prompting-strategie. Per docenttaak (lesvoorbereiding, lesgeven, beoordelen, administratie, professionalisering, begeleiding) best practices, custom chatbots, agentic opdrachten met Word/Excel/PowerPoint output.

**Webinar 3, Van AI-proof naar AI-ready toetsen en onderwijsontwerp.** Disruptie van asynchroon schriftelijk werk. Beweging van AI-proof (controlemaatregelen zoals mondeling) naar AI-ready (AI versterkt het onderwijsontwerp). Voorbeeld profielwerkstuk: nadruk verschuift van eindproduct naar proces.

**Webinar 4, AI om het leren te verrijken.** Mollick rollen: tutor of Socratisch, simulator (incl. voice-to-voice), hulpmiddel, mentor, coach, procesbegeleider. Custom chatbots als voorbeeld. NotebookLM behandeld.

**Webinar 5, Risico's van AI.** Cognitive offloading als fenomeen, privacy, auteursrecht, duurzaamheid. Met nuance en onderbouwing.

## Het AI-geletterdheidsraamwerk (5 domeinen)

In `lib/domains/framework.ts`:

1. **Mindset**: Bewuste keuzes vanuit eigen professionele waarden. AI als gereedschap, niet als vervanging.
2. **Ethiek**: Privacy, bias, transparantie en verantwoordelijkheid verweven door elke AI-beslissing.
3. **Kennis**: Begrijpen hoe AI werkt, effectief prompten, tools vergelijken, output kritisch beoordelen.
4. **Pedagogiek**: Wanneer versterkt AI het leerproces. Leerlingen begeleiden bij kritisch en bewust AI-gebruik.
5. **Agency**: Handelingsvermogen als overkoepelende houding: regie houden over hoe AI je werk raakt.

Elk domein moet door minstens twee casussen geraakt worden in een examen.

## Bloom: categorieen van cognitieve processen

In `lib/domains/bloom.ts`:

- Zwaartepunt op vier categorieen: **begrijpen, toepassen, analyseren, evalueren**.
- Onthouden wordt niet getoetst (te googelbaar).
- Creeren hoort bij Kartrekker (praktijkopdracht), niet hier.
- Spreek nooit over Bloom-niveaus of hogere/lagere orde, alleen over categorieen van cognitieve processen.

Examen-mix indicatief: 2 begrijpen, 3 toepassen, 3 analyseren, 2 evalueren.

## Casuspool (20 casussen, seed in 003_seed_casuses.sql)

### Webinar 1
- 1A: "Een collega zegt: ChatGPT verzint dingen, ik gebruik het niet meer. Wat is jouw reactie?" [Begrijpen, Evalueren / Kennis, Mindset]
- 1B: "Geef een voorbeeld van een prompt die jij vaak gebruikt en leg uit waarom je hem zo hebt opgebouwd." [Toepassen, Analyseren / Kennis]
- 1C: "Wat verandert er in de onderwijspraktijk volgens jou als we van chatbots naar autonome agents gaan?" [Begrijpen, Evalueren / Kennis, Agency]
- 1D: "Een leerling vraagt: hoe weet ChatGPT dingen? Hoe leg jij dat uit op haar of zijn niveau?" [Toepassen, Analyseren / Kennis, Pedagogiek]

### Webinar 2
- 2A: "Beschrijf een GPT of GEM die jij hebt gebouwd of zou bouwen voor een van je docenttaken. Welke rol, welk doel, welke instructies geef je hem?" [Toepassen, Analyseren / Kennis, Mindset]
- 2B: "Voor welke docenttaak is AI volgens jou geen handige assistent? Waarom niet?" [Analyseren, Evalueren / Mindset, Agency]
- 2C: "Een collega laat AI rapportages schrijven en zet zijn naam eronder. Wat vind je daarvan?" [Evalueren / Ethiek, Agency]
- 2D: "Hoe voorkom je dat je AI-assistent-workflow leidt tot gemiddelde of inwisselbare output?" [Analyseren / Mindset, Kennis]

### Webinar 3
- 3A: "Een docent zegt: vanaf nu mag in mijn vak alleen nog mondeling getoetst worden. Wat is je reactie?" [Evalueren / Pedagogiek]
- 3B: "Geef een voorbeeld uit jouw vak van een opdracht die niet AI-ready is. Wat zou je veranderen?" [Analyseren, Toepassen / Pedagogiek]
- 3C: "Hoe verschuif je bij een profielwerkstuk de nadruk van eindproduct naar proces?" [Toepassen / Pedagogiek]
- 3D: "Wanneer is AI-proof toetsen volgens jou alsnog gerechtvaardigd?" [Evalueren / Pedagogiek, Ethiek]

### Webinar 4
- 4A: "Welke van Mollicks rollen (tutor of Socratisch, simulator, hulpmiddel, mentor, coach, procesbegeleider) zou jij in jouw vak inzetten en hoe?" [Toepassen, Analyseren / Pedagogiek, Kennis]
- 4B: "Een leerling gebruikt een tutorbot om zich op een toets voor te bereiden. Wat is hier wel en niet wenselijk aan?" [Evalueren / Pedagogiek, Ethiek]
- 4C: "Hoe zou je NotebookLM inzetten in jouw lespraktijk?" [Toepassen / Pedagogiek, Kennis]
- 4D: "Wat is het didactische verschil tussen een tutorbot en een Socratische bot?" [Analyseren / Pedagogiek, Kennis]

### Webinar 5
- 5A: "Wat is cognitive offloading en wanneer is het volgens jou wel of niet schadelijk in het leren?" [Begrijpen, Analyseren / Pedagogiek, Mindset]
- 5B: "Een docent voert leerlingdata in ChatGPT om feedbackbrieven te genereren. Beoordeel deze keuze." [Evalueren / Ethiek, Agency]
- 5C: "Hoe weeg jij duurzaamheid mee in je AI-keuzes als docent?" [Evalueren / Ethiek]
- 5D: "Wat betekent EU AI Act artikel 4 voor jou als docent concreet?" [Begrijpen, Toepassen / Ethiek, Agency]

## Pass-criterium (mild)

Geslaagd als alle vijf domeinen op zijn minst "basis aangetoond" (oranje of groen) hebben. Een domein op "onvoldoende" (rood) is niet geslaagd.

Score-anker per domein:
- **GROEN (ruim aangetoond)**: begrip, vakterminologie correct, concreet praktijkvoorbeeld, verbinding tussen concept en didactische keuze, eigen positie onderbouwd.
- **ORANJE (basis aangetoond)**: begrip op hoofdlijnen, deels vakterminologie, minstens een voorbeeld of concretisering, keuze onderbouwd ook al niet diepgaand.
- **ROOD (onvoldoende)**: geen begrip, geen voorbeelden, geen vakterminologie, gemeenplaatsen of niet ter zake.

## Prompts en kennisbasis (contentverankerd)

De prompts voor Lieke en de beoordelaar zijn verrijkt met de inhoud van de vijf basiswebinars en wonen niet meer als losse tekstblok in deze spec. Volledige spiegels staan in `prompts/lieke-voice-prompt.md` en `prompts/beoordelaar-prompt.md`. Plak de prompts hier niet opnieuw in; werk in de codebestanden hieronder.

**Kennisbasis en kennismodule.** `prompts/kennisbasis/webinar-1..5.md` bevat per webinar de ground truth (kernbegrippen, leerdoelen, praktijkvoorbeelden, misvattingen en rode vlaggen, en per casus een beoordelingsaanwijzing in sectie 7). `lib/knowledge/` destilleert dat tot data: `casus-cards.ts` (1A t/m 5D) met per vraag `waarOpLetten`, `goedAntwoord` en `misvatting`, en `webinar-ground.ts` met per webinar `kernpunten` en `rodeVlaggen`. `lib/knowledge/index.ts` biedt `getCasusCard(code)` en `getWebinarGround(webinar)`. Voeg niets toe wat niet uit de kennisbasis komt.

## System prompt voor Lieke (in `lib/bot/system-prompt.ts` en `lib/bot/lieke-instructions.ts`)

De statische tekstblokken staan in `lib/bot/lieke-instructions.ts`; `buildSystemPrompt` in `lib/bot/system-prompt.ts` voegt ze samen in deze volgorde: INTRO, DOCENTCONTEXT, GESPREKSVERLOOP, DOORVRAGEN, GENOEG GEHOORD, WAT JE NIET DOET, WAT JE WEL DOET, STUREN, ONDERWERPEN. De prompt wordt vooraf compleet opgebouwd (Live 3.1 staat geen mid-session updates van de system instruction toe).

Kern van de verrijking:
- Lieke spreekt over "onderwerpen", niet over "casus", en kondigt geen nummers, domeinen of structuur aan.
- Per onderwerp voegt `buildSystemPrompt` via `getCasusCard` een prive aanwijzing in (waar op te letten, waar een sterk antwoord op uitkomt, een veelvoorkomend misverstand). Lieke leest die nooit voor en verklapt nooit wat een goed antwoord is.
- DOORVRAGEN bevat metacognitieve vragen (laat de docent over het eigen denken nadenken) en een anti-misleiding lijn; STUREN beschrijft hoe Lieke in haar rol blijft als de docent stuurt, vleit of om het antwoord vraagt.
- GENOEG GEHOORD: bij een voldoende antwoord gaat Lieke stil door naar het volgende onderwerp, zonder te bevestigen.

## Evaluator-prompt (in `lib/evaluator/prompt.ts` en `lib/evaluator/system-prompt-text.ts`)

De vaste system prompt staat in `lib/evaluator/system-prompt-text.ts` (constante `SYSTEM_PROMPT`); `buildEvaluatorPrompt` in `lib/evaluator/prompt.ts` bouwt de user prompt. Input: docentgegevens, gestelde casussen met domein- en cognitief-proces-tags, en het volledige transcript als `Bot:` / `Docent:`.

Kern van de verrijking:
- De system prompt heeft een blok **omgaan met holle taal en ingestudeerde antwoorden** met drie korte ijkvoorbeelden (GROEN, ORANJE, ROOD), en een instructie dat het **ontwikkeladvies formatief** is (tweede persoon enkelvoud, concrete suggesties, verwijzing naar het betreffende onderwerp, ook bij geslaagd).
- De user prompt injecteert twee extra secties uit `lib/knowledge`: **beoordelingsaanwijzingen per gestelde vraag** (`getCasusCard`) en **ground truth plus rode vlaggen per onderwerp** (`getWebinarGround`).
- Het **JSON-schema is ongewijzigd** en blijft letterlijk gelijk aan `lib/evaluator/schema.ts`. Wijzig het output-contract niet.

## Webhook out (in `lib/webhook/`)

Triggert na succesvolle evaluatie, behalve voor `role = 'tester'` (dan registreren in webhook_deliveries met status 'skipped' en `skipped_reason = 'test_account'`).

Endpoint: configureerbaar via `N8N_RESULT_WEBHOOK_URL`.
Authenticatie: HMAC-SHA256 van de body in header `X-AVD-Signature`, secret uit `N8N_WEBHOOK_SECRET`.

Payload:

```json
{
  "event": "exam_completed",
  "exam_session_id": "uuid",
  "completed_at": "2026-05-01T14:32:00Z",
  "docent": {
    "user_id": "uuid",
    "full_name": "...",
    "email": "...",
    "school": "...",
    "niveau": "PO|VO|MBO|HBO|WO",
    "vakgebied": "..."
  },
  "result": {
    "passed": true,
    "domain_scores": {
      "mindset": "GROEN",
      "ethiek": "ORANJE",
      "kennis": "GROEN",
      "pedagogiek": "GROEN",
      "agency": "ORANJE"
    },
    "samenvatting": "...",
    "ontwikkeladvies": "..."
  },
  "transcript_admin_url": "https://exam.aivoordocenten.nl/admin/sessions/{id}"
}
```

Retry: bij niet-200 of timeout, status `pending`, exponentieel retry (1m, 5m, 30m, 2h, 12h), max 5 pogingen, daarna `failed`. Implementeer als Vercel Cron op `/api/webhook-retry` elke 5 minuten.

## Privacy-tekst (in `components/exam/PrivacyText.tsx`)

Voor de Start-knop:

> Tijdens dit examen worden je antwoorden als tekstueel transcript bewaard. Audio wordt niet opgeslagen. Doel: beoordeling, kwaliteitsborging, en mogelijke heroverweging bij bezwaar. Bewaartermijn: 24 maanden, gelijk aan de geldigheidsduur van je certificaat. Daarna anonimiseren we je gegevens. Inzage: alleen jij en de examencommissie van AI voor Docenten. Door op Start te klikken stem je hiermee in. Je kunt het examen op elk moment afbreken; het transcript wordt dan gemarkeerd als afgebroken.

## Resultaatscherm (in `app/(exam)/resultaat/[sessionId]/page.tsx`)

- Pass/fail kop. Bij geslaagd: "Gefeliciteerd, je hebt het basiscertificaat behaald. Je ontvangt het certificaat zo snel mogelijk per e-mail." Bij gezakt: "Helaas, dit keer nog niet. Je kunt je opnieuw inschrijven voor een herkansing. Je ontvangt zo een mail met de uitslag en de inschrijflink."
- Vijf domein-badges met groen/oranje/rood, elk met onderbouwing (3-5 zinnen) en een citaat uit het transcript.
- Knop "Bekijk volledig transcript".
- Geen download-knop voor certificaat.

## Live transcriptie UX

Doorlopende chat-stream onder de visualizer. Bot-bubbles links (paars), docent-bubbles rechts (lichtpaars). Tekst verschijnt woord-voor-woord terwijl gesproken wordt (gebruik de `inputTranscription` en `outputTranscription` callbacks van de Live API). Auto-scroll naar laatste bubble. Indicator wie nu spreekt via pulserende kleur in de visualizer. Huidige vraag blijft in beeld tot een nieuwe is gesteld.

## Testaccounts (seed via `supabase/seed-test-accounts.ts`)

Tien testaccounts via Supabase Auth admin API:
- Email: `marcelentom1@avd-test.nl` t/m `marcelentom10@avd-test.nl`
- Wachtwoord: uit env var `TEST_ACCOUNT_PASSWORD` (default in README, te overschrijven)
- Profiles: `full_name` "Marcel en Tom Test {n}", `school` "AVD Test", `niveau` 'VO', `vakgebied` "Test", `role` 'tester'

Eigenschappen tester-rol:
- Onbeperkt examens.
- Webhook out wordt geskipped (registreer wel in webhook_deliveries met status 'skipped').
- Geel "TEST" label in admin-dashboard.

## Admin dashboard (in `app/admin/`)

Alleen toegankelijk voor `role = 'admin'`. Tabs:
- **Examens**: alle echte docent-examens, gesorteerd op datum, filters op pass/fail en niveau.
- **Testruns**: alleen rol 'tester' examens, zelfde layout maar geel gemarkeerd.
- **Webhooks**: alle webhook_deliveries, filter op status, retry-knop voor failed deliveries.
- **Sessie-detail**: per session id het volledige transcript, evaluator JSON, webhook status.

## Branding tokens (in `tailwind.config.ts`)

Definieer:
- `purple-primary`: #a15df5
- `purple-light-bg`: #ebdfff
- `purple-dark`: #7947ba
- `purple-medium`: #814bc6
- `text-body`: #4a5568
- `border-radius` op buttons en cards: 8-12px
- Sans-serif headings (Inter of equivalent als Cocogoose niet beschikbaar via web font)

Hero-achtergrond op start-, resultaat- en login-scherm: `purple-light-bg`. Buttons primair: `purple-primary` met witte tekst, hover `purple-dark`. Royale witruimte. Optioneel paars stippenpatroon rechts in beeld op start- en resultaatscherm.

## Niet doen

- Geen em-dashes in copy of code-comments. Komma's of nieuwe zinnen.
- Geen "Bloom-niveaus" terminologie. Alleen "categorieen van cognitieve processen".
- Geen `<form>` met action-attributes. Gebruik onSubmit handlers met preventDefault.
- Geen browser localStorage in artifact-componenten (niet relevant hier, maar weet je het).
- Niet zelf account-creatie endpoints bouwen, dat doet n8n direct via Supabase admin API.
- Geen audio-opslag.

## Werkwijze

Wanneer je een wave-opdracht krijgt:
1. Lees deze hele agent-spec opnieuw door om context te bevestigen.
2. Implementeer alle bestanden uit de wave-lijst.
3. Bewaar bestanden onder 200 regels.
4. Aan het einde van de wave: leg kort uit wat je hebt gebouwd, welke bestanden zijn aangemaakt of gewijzigd, en wat eventueel nog open staat.
