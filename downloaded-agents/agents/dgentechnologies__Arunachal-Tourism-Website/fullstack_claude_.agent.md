# Arunachal Explore — Full-Stack Agent
# Location: .claude/agents/arunachal-explore-fullstack.md

> **Reviewer:** ChatGPT 5.4  
> **Live URL:** https://apt-website-v2.vercel.app  
> **AI Models:** `gemini-3.1-flash-lite-preview` · `gemini-3.1-flash-live-preview` . `gemini-2.5-flash`
> **Scope:** Full-stack — Next.js 15, Firebase, Firestore (3 DBs), Genkit, booking engine, auth, PWA, API routes

---

## 1. Project Identity

**Arunachal Explore** (`apt-website-v1.vercel.app`) is the ground-up reimagination of `arunachaltourism.com` — a static WordPress CMS with no search, no booking, no offline, English-only. This platform replaces it with a serverless, AI-powered, multilingual, offline-capable tourism ecosystem.

---

## 2. Verified Tech Stack

```raw
Framework:       Next.js 15.5.9 (App Router, Turbopack in dev)
React:           19.2.1
Styling:         Tailwind CSS 3.4 + tailwindcss-animate
UI Primitives:   ShadCN UI (Radix UI)
Auth:            Firebase 11.9.1 — Google OAuth + Email/Password
Database:        Cloud Firestore — 3 named instances
Storage:         Firebase Storage
AI:              Google Genkit 1.28.0 + @genkit-ai/google-genai 1.28.0
AI Models:       gemini-3.1-flash-lite-preview   (default — non-streaming flows)
                 gemini-3.1-flash-live-preview    (streaming / live chat flows)
Forms:           React Hook Form 7.54 + Zod 3.24
Animation:       Framer Motion 12.35
Icons:           Lucide React 0.475 + @tabler/icons-react 3.38
Hosting:         Vercel — https://apt-website-v1.vercel.app
CI/CD:           GitHub Actions (.github/workflows/ci.yml)
TypeScript:      5.9.3 strict (ignoreBuildErrors: true in next.config.ts)
Node:            20+
```

---

## 3. Genkit AI Configuration

```typescript
// src/ai/genkit.ts — use exactly these model strings
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Pick one per flow:
  model: 'googleai/gemini-3.1-flash-lite-preview',  // cost-efficient, non-streaming
  // model: 'googleai/gemini-3.1-flash-live-preview', // streaming / live responses
});
```

**Model selection:**
- `gemini-3.1-flash-lite-preview` — permit pre-check, itinerary generation, standard chatbot
- `gemini-3.1-flash-live-preview` — streaming itinerary builder, live AI chat widget

**Existing flows in `src/ai/flows/`:**
- `personalized-itinerary-generator-flow.ts` — day-by-day plans from interests/duration/activities
- `permit-plan-completeness-check.ts` — ILP application validator, returns missing info + issues
- `itinerary-chat-flow.ts` — conversational assistant for pre-made itinerary customization

**Rate limiting wrapper (always use):**
```typescript
// From src/ai/genkit.ts — NEVER remove or bypass
export const tryAcquireAiRequestSlot = () => { /* concurrency guard */ };
export const handleAiRequestError = (error: unknown) => { /* quota handling */ };

// Every AI call pattern:
const release = tryAcquireAiRequestSlot();
try {
  return await someFlow(input);
} catch (error) {
  handleAiRequestError(error);
  throw error;
} finally {
  release();
}
```

---

## 4. Firebase Architecture

### 4.1 Auth (src/lib/auth-context.tsx)

```typescript
// Providers active: Google OAuth, Email/Password
// useAuth() hook from AuthProvider — verified working in repo
// User doc upserted to Firestore on every auth state change (upsertUserDoc)
// Custom claims to set via Admin SDK:
{ nationality: "indian" | "foreign", role: "user" | "operator" | "admin" }
```

### 4.2 Three Firestore Instances

```typescript
// Extend src/lib/firebase.ts with named databases:
import { getFirestore } from 'firebase/firestore';

export const dbEnterprise = getFirestore(app, 'arunachal-explore-enterprise'); // DB1
export const dbUsers      = getFirestore(app, 'arunachal-explore-users');      // DB2
export const dbCms        = getFirestore(app, 'arunachal-explore-cms');        // DB3
```

Required `.env` additions:
```env
NEXT_PUBLIC_FIRESTORE_DB_ENTERPRISE=default
NEXT_PUBLIC_FIRESTORE_DB_USERS=arunachal-explore-users
NEXT_PUBLIC_FIRESTORE_DB_CMS=arunachal-explore-cms
```

### 4.3 DB1 — Enterprise (Hotels / Vehicles / Operators / Bookings)

```raw
/hotels/{hotelId}
  name, circuit, district, type, address, coordinates: GeoPoint
  contact: { phone, email, whatsapp }
  amenities: string[], images: string[], starRating: number
  priceRange: { min, max, currency: "INR" }
  govRegistrationNo, bookingEnabled: boolean
  availability: subcollection /availability/{YYYY-MM-DD}
    available: boolean, price: number
  rooms: subcollection /rooms/{roomId}
    type, capacity, pricePerNight, images: string[]
  reviews: subcollection /reviews/{reviewId}
    userId, rating, comment, createdAt

/vehicles/{vehicleId}
  name, type ("Car"|"Bike"|"Taxi"|"Bus"), category
  capacity, fuel, price, priceUnit: "/day"
  features: string[], specs: {label,value}[], includes: string[]
  route, images: string[], operator, verified: boolean
  availability: subcollection

/tour_operators/{operatorId}
  name, registrationNo, govApproved: boolean
  specialtyCircuits: string[], languages: string[]
  contact: { phone, email, website }
  packages: subcollection, rating, reviewCount

/bookings/{bookingId}
  userId, type ("hotel"|"vehicle"|"package"), listingId
  checkIn, checkOut: Timestamp, guests: number
  totalAmount, taxes: number
  status: "pending"|"confirmed"|"cancelled"|"completed"
  paymentId, permitVerified: boolean
  guestDetails: { firstName, lastName, email, phone }
  specialRequests, createdAt
```

### 4.4 DB2 — Standard (Users)

```raw
/users/{userId}
  uid, displayName, email, photoURL
  nationality: "indian"|"foreign"
  preferredLanguage: "en"|"hi"|"bn"|"as"
  savedItineraries: string[], bookingHistory: string[]
  permitStatus: {
    ilp: { status: "none"|"pending"|"approved", validUntil, docUrl }
    pap: { status: "none"|"pending"|"approved", groupSize, operatorId }
  }
  createdAt, updatedAt

/users/{userId}/trips/{tripId}
  title, circuit, durationDays, generatedByAI: boolean
  planData: object  // PersonalizedItineraryGeneratorOutput
  sharedToken, createdAt

/users/{userId}/permits/{permitId}
  type: "ilp"|"pap"
  status: "draft"|"submitted"|"approved"|"expired"
  formData: object     // PermitPlanInput
  aiReviewResult: object  // PermitPlanOutput
  submittedAt, approvedAt, expiresAt
```

### 4.5 DB3 — Standard (CMS / Static Content)

```raw
/circuits/{circuitId}
  slug, name, region, description
  keyAttractions: string[], bestSeason
  heroImage, galleryImages: string[]
  mapCoordinates: GeoPoint[], relatedItineraryId
  districts: string[], updatedAt

/activities/{activityId}
  slug, title, description
  seasons, circuits: string[]
  permitRequired, guideRequired: boolean

/festivals/{festivalId}
  name, tribe, startDate, endDate: Timestamp
  circuit, location, description, image
  highlights: string[]

/emergencyContacts/{districtId}
  district, hospital: {name, phone}
  police: {name, phone}
  tourismOffice: {name, phone}
  ilpCheckpost, coordinates: GeoPoint

/permitInfo/{permitType}        // "ilp" | "pap" | "rap"
  title, content, requiredDocuments: string[]
  checkpoints: string[], externalPortalUrl
  lastVerifiedAt

/notices/{noticeId}             // replaces hardcoded COVID notice
  type: "info"|"warning"|"urgent"
  title, body, active: boolean
  expiresAt: Timestamp|null
  pages: string[]               // ["permits", "arrival", "all"]
```

---

## 5. App Router — Current Routes (Verified)

```raw
EXISTING PAGES (working):
/                               homepage — Hero, ScrollyTelling, Destinations, Testimonials
/guides                         ArunachalMap interactive SVG (full-screen)
/hotels                         hotel listing (hotelsData static)
/hotels/[id]                    hotel detail
/hotels/[id]/book               booking form (mock submit — needs DB wiring)
/transport                      vehicle listing (vehiclesData static)
/transport/[id]                 vehicle detail
/transport/[id]/book            transport booking (mock submit — needs DB wiring)
/itinerary                      AI itinerary + pre-made plans with chat
/permit                         ILP form + Genkit AI pre-check
/permit/foreign                 PAP information page (full)
/safety                         emergency contacts directory
/tribes                         tribes listing (i18n)
/entrepreneurs                  entrepreneurs listing (i18n)
/adventures                     adventure hub
/adventures/trekking            trekking routes + Framer Motion
/adventures/rafting             river rafting
/adventures/angling             angling spots
/adventures/paragliding         paragliding sites
/wildlife                       wildlife & biodiversity
/heritage                       heritage sites
/events                         festivals & events
/account                        user dashboard (Firebase Auth gated)
/login                          sign in (Google + Email)
/signup                         create account
/login/forgot-password          password reset
/app-preview                    mobile app preview (mobile-only UA check)

STUBS (exist, need implementation):
/permit/check                   → AI permit pre-check interactive UI
/account/permits                → permit tracker from DB2
/account/trips                  → saved trips from DB2
/plan/ai                        → enhanced AI trip builder
/map                            → interactive district map page
/media                          → video gallery
/newsletter                     → subscription form
/guides/ebooks                  → in-browser brochure reader
/about                          → facts & statistics page

API ROUTES:
/api/mobile-app                 ✅ Bearer-auth mobile data endpoint

TO BUILD:
/api/booking/create             POST — write DB1/bookings + DB2/users/{id}/bookings
/api/booking/confirm            POST — payment webhook handler
/api/booking/cancel             POST — cancellation handler
/api/revalidate                 POST — ISR revalidation webhook for DB3 changes
```

---

## 6. Static Data → Firestore Migration

```raw
hotels-data.ts     → DB1/hotels        (4 hotels currently, seed then fetch)
transport-data.ts  → DB1/vehicles      (4 vehicles currently)
itinerary-data.ts  → DB3/circuits+itineraries  (5 premade itineraries)
guides-data.ts     → DB3/circuits      (9 Location objects for ArunachalMap)
```

**Rule:** Keep static files as seed data + offline fallback until Firestore is live and seeded. Do not delete.

---

## 7. Booking Engine — Current State → Target

**Current:** Forms in `/hotels/[id]/book` and `/transport/[id]/book` are complete UI but call `setSubmitted(true)` with no persistence.

**Target sequence:**
```raw
1. Date + guest picker (UI exists)
2. Auth gate — sign in if anonymous (Firebase Auth exists)
3. Permit pre-check — query DB2/users/{id}/permitStatus
4. Availability check — query DB1/hotels/{id}/availability/{date}
5. Payment — Razorpay (INR) / Stripe (foreign cards)
6. POST /api/booking/create
   → Write DB1/bookings/{bookingId}
   → Write DB2/users/{userId}/bookings ref
   → Update DB1/hotels/{id}/availability
7. BookingConfirmation component with bookingId
```

---

## 8. i18n System (Verified)

```typescript
// src/lib/language-context.tsx — full implementation exists
// Languages: en, hi, bn, as
// Translations interface has 200+ keys covering all pages
// useLanguage() hook returns { language, setLanguage, t }
// Persists to localStorage key: "arunachal-language"

// RULE: Before adding any new UI string:
// 1. Add key to Translations interface
// 2. Add string to all 4 locale objects (en, hi, bn, as)
// 3. Use t('yourKey') in JSX — never hardcode English
```

---

## 9. Design System (Verified from globals.css + tailwind.config.ts)

```raw
Primary:         hsl(176, 100%, 21%) = #006a62  (deep turquoise)
Secondary:       hsl(46, 97%, 60%)  = #fccc38   (saffron)
Accent:          hsl(176, 68%, 56%) = #40e0d0   (light turquoise)
Background:      hsl(10, 33%, 98%) = #fcf9f8    (warm off-white)
On-surface:      hsl(0, 5%, 11%)   = #1c1b1b    (near-black)
Surface-low:     #f6f3f2
Muted-fg:        hsl(0, 5%, 40%)

Font headline:   Space Grotesk (loaded via Google Fonts in layout.tsx)
Font body:       Manrope + Noto Sans Devanagari + Noto Sans Bengali
Radius:          xl=3rem · lg/md=1.5rem · sm=0.5rem

Key shadows: soft (0 8px 40px rgba(0,106,98,0.08))
             float (0 16px 60px rgba(0,106,98,0.12))
             glow  (0 4px 24px rgba(64,224,208,0.25))
```

**DESIGN.md rules:**
- No 1px solid borders between sections — use background color shifts
- Ghost borders: `outline-variant` at 15% opacity only
- Cards: `xl` (3rem) on one corner, `md` (1.5rem) on others = organic topography
- No pure black shadows — use primary color tints

---

## 10. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml — verified in repo
steps:
  - npm ci
  - npm run lint         # next lint (ESLint next/core-web-vitals + next/typescript)
  - npm run typecheck    # tsc --noEmit
  - npm run build        # NODE_ENV=production
env:
  NEXT_PUBLIC_SITE_URL: https://apt-website-v1.vercel.app
```

**All code must pass all three checks before merge.**

---

## 11. Firestore Security Rules

```javascript
// firestore.rules (extend current file)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // DB1 Enterprise
    match /hotels/{id}          { allow read: if true; allow write: if request.auth.token.role in ['admin','operator']; }
    match /vehicles/{id}        { allow read: if true; allow write: if request.auth.token.role == 'admin'; }
    match /tour_operators/{id}  { allow read: if true; allow write: if request.auth.token.role == 'admin'; }
    match /bookings/{id} {
      allow read:   if request.auth != null &&
        (request.auth.uid == resource.data.userId || request.auth.token.role in ['admin','operator']);
      allow create: if request.auth != null;
      allow update: if request.auth.token.role in ['admin','operator'];
    }

    // DB2 Users
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.token.role == 'admin';
    }
    match /users/{userId}/{sub=**} {
      allow read, write: if request.auth.uid == userId;
    }

    // DB3 CMS
    match /circuits/{id}          { allow read: if true; allow write: if request.auth.token.role == 'admin'; }
    match /activities/{id}        { allow read: if true; allow write: if request.auth.token.role == 'admin'; }
    match /festivals/{id}         { allow read: if true; allow write: if request.auth.token.role == 'admin'; }
    match /emergencyContacts/{id} { allow read: if true; allow write: if request.auth.token.role == 'admin'; }
    match /permitInfo/{id}        { allow read: if true; allow write: if request.auth.token.role == 'admin'; }
    match /notices/{id}           { allow read: if true; allow write: if request.auth.token.role == 'admin'; }

    match /{document=**} { allow read, write: if false; }
  }
}
```

---

## 12. PWA / Offline

```raw
/public/manifest.json:
  name: "Arunachal Explore"
  short_name: "ArunExplore"
  start_url: "/"
  display: "standalone"
  theme_color: "#006a62"
  background_color: "#fcf9f8"
  shortcuts:
    - ILP Apply → /permit/ilp
    - Emergency → /safety
    - Plan Trip  → /itinerary

/public/sw.js cache strategy:
  cache-first:            /safety, /permit, /permit/ilp, /permit/foreign
  network-only:           /api/booking/*, /api/payment/*
  stale-while-revalidate: /guides/*, /adventures/*, /itinerary/*
  
/app/api/mobile-app/route.ts already returns offline feature metadata.
Register SW in root layout.tsx via "use client" wrapper component.
```

---

## 13. What Must Never Be Rebuilt

| Removed From Old Site | Replacement |
|-----------------------|-------------|
| COVID vaccine notice (hardcoded HTML) | DB3/notices with active flag — admin toggleable |
| GIF hit counter | `@vercel/analytics` + `@vercel/speed-insights` |
| Static JPEG district map + JS `<area>` | `ArunachalMap` SVG in `/guides` — already done |
| Duplicate Facebook widget | Single social section, no repeated embeds |
| Tour Operators page (403 error) | DB1/tour_operators — verified directory |
| Text-only accommodation listings | DB1/hotels with full booking widget |
| Events page showing "No Events" | DB3/festivals with live countdown |
| PDF direct links | react-pdf in-browser viewer + download button |
| English-only hardcoded strings | language-context.tsx `t('key')` system |

---

## 14. Behavioral Rules

1. **Model strings:** Only `'googleai/gemini-3.1-flash-lite-preview'` or `'googleai/gemini-3.1-flash-live-preview'`
2. **AI slot:** Always wrap with `tryAcquireAiRequestSlot()` / `handleAiRequestError()` from `src/ai/genkit.ts`
3. **Three-DB rule:** Hotels/vehicles → DB1 only. User data → DB2 only. Content/CMS → DB3 only
4. **Static data as seed:** Never delete `hotels-data.ts`, `transport-data.ts`, `itinerary-data.ts` until Firestore seeded
5. **firebase-admin server-only:** Import only in `/api/*` routes or Server Actions, never in client components
6. **ISR on CMS pages:** `export const revalidate = 3600;` on every page reading from DB3
7. **`"use client"` discipline:** Only for event handlers, hooks, browser APIs, Firebase Auth state
8. **CI must pass:** `npm run lint && npm run typecheck && npm run build` before any PR
9. **Booking is sequential:** availability → auth → permit check → payment — no skipping
10. **i18n first:** Add keys to `Translations` interface + all 4 locale objects before using in JSX

---

*Arunachal Explore · Full-Stack Agent*  
*Live: https://apt-website-v1.vercel.app · Reviewed by: ChatGPT 5.4*