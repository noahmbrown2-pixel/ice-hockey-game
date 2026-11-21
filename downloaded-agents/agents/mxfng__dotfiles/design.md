# Design defaults and the quality bar

Read when building anything a user sees. This is the **portable craft floor** - the general
design habits and finish level Max holds on every project. A specific *visual language* (a
particular palette, elevation feel, shell layout, motion signature) is a per-product choice
layered on top of this; do not bake one product's aesthetic into a general build.

## Design defaults

- **Token discipline.** Colors, spacing, radii, and shadows come from semantic tokens (see
  `styling.md`), never scattered literals. Name tokens by role (`--primary`, `--card`,
  `--selected`), not by hue.
- **OKLCH** for color - perceptually uniform, so tints/shades and alpha steps stay even.
- **Restraint.** Let content, type, and negative space carry the design; every element earns
  its place or is cut. Minimalism is the result of deciding what the thing should be, not a
  coat of paint.
- **Dense and legible.** His UIs lean toward a compact, information-rich scale (roughly one
  step below Tailwind's defaults) with tight control heights - they should read as a tool, not
  a marketing page. Set base typography once, globally, in `@layer base`.
- **Type as a system.** A geometric grotesque for UI is the common base; a mono/technical face
  earns its place wherever precise values appear (numbers, IDs, code, measurements).

## Motion

- **Always driven by named constants, never magic numbers** (`const SPRING = { stiffness: 120, damping: 20 }`,
  a house transition like `150ms ease-out`). This keeps motion consistent and tunable.
- CSS transitions for most things; framer-motion for continuous/interactive motion (drag,
  rotation). `filter: brightness()` pulses read well over gradients where a color transition
  would not. Add `will-change` for an animation, then remove it to free GPU memory.
- Motion should be fast and purposeful - feedback, not decoration.

## The quality bar (budget for these up front)

These are not extras; they are what separates finished work from a scaffold.

- **Branded loading / empty / error states**, not a generic spinner. Skeletons for
  content-shaped loading. Even an internal tool deserves a face.
- **Granular error boundaries** (e.g. around a risky subsystem and around the router) plus
  Suspense fallbacks on lazy boundaries - not a single boundary around the whole app.
- **Real accessibility**: proper ARIA on any custom control (`role`, `aria-*`, keyboard
  handling), and **one global `:focus-visible` ring** applied consistently. Do not strip focus
  rings for looks - that is a regression, and a tempting one.
- **Optimistic, instant-feeling UI where it applies**: the interface should stay ahead of the
  backend. Reflect the user's intent immediately and reconcile with the server after; on
  failure, roll back and tell them. (The exact mechanism is product-specific - keep the
  machinery in the product, keep the *instinct* here.)
- A **typed toast/notification wrapper** (`showError/Success/Warning/Info`) over whatever
  toast lib, so call sites stay uniform.

## The through-line

Build for the person whose hands are full - the operator, the picker, the user at the edge of
the workflow who usually gets the worst interface. Meet them where they are (a QR code that
opens a PWA beats a native app they will not install). Give even unglamorous or internal tools
"a face and a soul." That conviction is why the quality bar above is non-negotiable, not
gold-plating.
