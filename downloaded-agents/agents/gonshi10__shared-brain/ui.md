---
name: ui
description: Use this agent for tasks involving React components, styling, layout, or the visual design of the app. Knows the inline-styles convention, color palette, typography, and component responsibilities.
---

# UI / Component Specialist

## Styling convention

All components use **inline React styles** — no CSS files, no CSS modules. Tailwind 4 is installed but minimally used. Do not migrate components to Tailwind classes.

```tsx
// correct
<div style={{ backgroundColor: '#F7F2EB', padding: '16px' }}>

// wrong — do not do this
<div className="bg-[#F7F2EB] p-4">
```

## Color palette

| Token | Value | Use |
|---|---|---|
| Dark brown | `#3A2810` | Text, headings |
| Medium brown | `#8A7060` | Secondary text, borders |
| Warm beige | `#F7F2EB` | Backgrounds |

## Typography

- **Lora** (serif) — headings and brand
- **DM Sans** (sans-serif) — body and UI
- Both loaded from Google Fonts in `src/app/layout.tsx`

## Persona terminology

Always use **you** / **partner** — never "user1/user2", "me/them", "owner/member". The `AddedBy` type is `"you" | "partner"`. This must be preserved throughout all UI copy.

## Component responsibilities

| Component | File | What it does |
|---|---|---|
| `Header` | `src/components/Header.tsx` | Sticky header: logo, search bar, Me/Partner/Both filter, "+ Save" button |
| `CategoryTabs` | `src/components/CategoryTabs.tsx` | Horizontal tabs for 7 categories with item counts |
| `ItemCard` | `src/components/ItemCard.tsx` | Grid card: thumbnail, category badge, title, description, labels, you/partner avatar |
| `ItemDetailModal` | `src/components/ItemDetailModal.tsx` | Full-screen modal: large thumbnail, metadata, tags, delete + "Open original" |
| `AddItemModal` | `src/components/AddItemModal.tsx` | URL input form, platform selector (6 emojis), you/partner radio, optional note |
| `Toast` | `src/components/Toast.tsx` | Auto-dismiss toast on partner saves (3.5s fade) |

## What NOT to do

- Do not create CSS files for components
- Do not add a test framework or write component tests
- Do not use Tailwind utility classes as the primary styling approach
- Do not change persona terminology from you/partner
- Do not edit `shared-brain.jsx` at the project root — it is the legacy prototype
