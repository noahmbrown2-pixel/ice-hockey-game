# Diagram Type: Entity-Relationship (ER) Diagram

> Layer: TYPE recipe. Composes primitives from [`../../patterns/`](../../patterns/README.md) and the shared [`compartmented-box.md`](../compartmented-box.md) construction; does not re-derive their geometry. Indexed in [`README.md`](../README.md).

## Purpose

An **Entity-Relationship (ER) diagram** models a relational data domain in terms of
**entities** (things of interest — tables or concepts), their **attributes** (columns,
with primary-key and foreign-key rows marked explicitly), and the **cardinality of
relationships** between entities (one-to-one, one-to-many, many-to-many).

Use an ER diagram when:
- Designing or documenting a relational database schema and you need to show table
  structure alongside relationship semantics (not just table names).
- Communicating cardinality constraints (e.g. "one customer places zero-or-more orders")
  to developers, DBAs, or stakeholders.
- Reviewing a schema for normalization correctness — the PK/FK prefix rows make key
  columns visible at a glance.
- Distinguishing a physical ER model (real table columns, PK/FK annotations) from a
  conceptual domain model (which uses a class diagram instead).

Reach for an ER diagram specifically when a request mentions: entity-relationship,
database schema, PK/FK columns, cardinality (one-to-many, many-to-many), relational
model, ERD, or data model with key annotations.

## How to draw it

### Step 1 — Build entity boxes (compartmented-box construction)

Every entity is a **2-compartment compartmented box** per
[`@../compartmented-box.md`](../compartmented-box.md): a title compartment (entity name)
over an attribute compartment (PK/FK and regular column rows).

ALL parametric offsets are **VERBATIM** from `@../compartmented-box.md` — do NOT
re-derive any numbers here:

- **Header height:** 40px (title compartment)
- **Row pitch:** 20px (vertical spacing between successive row texts)
- **Left-pad:** 12px (x offset for all title and row texts)
- **fontSize:** 16, fontFamily: 3 (monospace — Cascadia)
- **Box width rule:** `max_over_rows(len(row.text) * 0.6 * 16)`, rounded UP to the next
  20-grid value. Size to the LONGEST row to pass `text_overflow_static`.
- **Box height:** `40 (header) + rows*20 + 10` bottom-pad, rounded up to 20-grid.
- **Header divider:** a `line` element at `y = box.y + 40`, `x == box.x`,
  `points = [[0,0],[width,0]]` spanning the FULL box width.

Each entity box groups ALL its elements (rectangle + line divider + title text + all row
texts) under ONE shared `groupIds` id.

### Step 2 — Mark PK and FK rows (monospace text-prefix rows)

Key columns are plain monospace text elements with a **two-space prefix**:

- Primary key rows: `PK  column_name` (two spaces between `PK` and the column name)
- Foreign key rows: `FK  column_name` (two spaces between `FK` and the column name)
- Regular attribute rows: no prefix — just the column name

Rules:
- Each row is its OWN separate `text` element — NEVER a multi-line `\n`-packed block
  (Pitfall 2 in compartmented-box.md).
- Use `fontFamily: 3` (monospace) on every row text so columns align.
- Do NOT use a key emoji (`🔑`) — it renders as a tofu box under `fontFamily: 3`
  (Pitfall 5). The plain `PK` / `FK` two-space prefix is the committed convention.

### Step 3 — Encode cardinality (notation-conventions committed encodings)

Use ONLY the committed encodings from [`@../notation-conventions.md`](../notation-conventions.md).
The three ER-relevant cardinality values:

| Cardinality | Committed encoding | Arrowhead token |
|---|---|---|
| **One** ("exactly one") | `endArrowhead: "bar"` (or `startArrowhead: "bar"`) | `bar` |
| **Zero / Optional** ("zero or one") | `endArrowhead: "dot"` — preferred; or a small composed `ellipse` glyph (10px x 10px) at the endpoint | `dot` |
| **Many** ("zero-or-more / one-or-more") | A free `text` label (`"0..*"` or `"1..*"`) placed OUTSIDE every entity box's bounding box — NOT a crow's-foot glyph | `null` (no arrowhead glyph on the connector) |

The committed default for "many" is a **textual multiplicity label** (`0..*` / `1..*`),
per notation-conventions.md. The grouped 3-line crow's-foot glyph is explicitly NOT used
so cardinality reads consistently across all ER diagrams and never collapses to a plain
line.

Multiplicity label placement: see glyph geometry in `@../../patterns/relationship-endpoint.md`.

### Step 4 — Draw relationship connectors (binding rules — LOCKED)

Every relationship connector is an **elbow arrow** subject to these locked rules:

1. **Type:** `"type": "arrow"` only (not `line`).
2. **Elbowed:** `"elbowed": true` always. A non-elbow connector triggers
   `arrow_not_elbow` in the structural verifier.
3. **Roundness:** `"roundness": null` always on connectors.
4. **Points:** orthogonal segments (elbowed layout handles this automatically).
5. **Legal arrowhead tokens** — the ONLY five values allowed anywhere in authored JSON:

       arrow | bar | dot | triangle | null

   Tokens ILLEGAL and MUST NEVER appear: `crowsfoot`, `diamond`, `hollow`, `open`
   (and any other invented name). They render silently as a plain bare line in
   Excalidraw 0.17.3 — no error, no warning (Pitfall 1). The Phase-1 validator will
   reject the file with exit code 1 if any illegal token is found.

6. **Binding:** Every connector's start and end points MUST land within 8px of a box
   RECTANGLE border. Bind via `startBinding`/`endBinding` to the entity box rectangle
   ids (gap 4). NEVER bind to a row text element, a line divider element, or a glyph
   element.

### Step 5 — Place cardinality labels and composed glyphs

- **Bar end (one):** set `endArrowhead: "bar"` — no separate element needed.
- **Dot end (optional):** set `endArrowhead: "dot"` — no separate element needed.
- **Textual label (many):** add a separate `text` element (`fontFamily: 3`, `fontSize: 16`,
  `strokeColor: "#1e1e1e"`) placed 20-40px from the endpoint OUTSIDE all entity box
  bboxes. Exact font, offset, and strokeColor values come from
  `@../../patterns/relationship-endpoint.md` — do NOT re-derive them here.
- **Ellipse glyph (optional alternative):** if a composed `ellipse` is preferred over the
  `dot` arrowhead for the "zero/optional" end, the glyph geometry (10px x 10px, placement
  offset) is defined in `@../../patterns/relationship-endpoint.md` — do NOT re-derive here.

Any composed glyph element (ellipse) must be added to the connector's `groupIds` so it
travels with the connector as a unit.

## Composes (primitive layer)

- [`@../compartmented-box.md`](../compartmented-box.md) — the FINALIZED box offsets used
  verbatim: header 40px, row pitch 20px, left-pad 12px, fontSize 16, box-width formula,
  box height formula, divider placement, grouping requirement. Do NOT re-derive any of
  these numbers.
- [`@../../patterns/relationship-endpoint.md`](../../patterns/relationship-endpoint.md) — the shared
  endpoint-glyph primitive: bar/dot arrowhead semantics, ellipse glyph geometry (10px x
  10px), textual multiplicity label geometry (fontFamily 3, fontSize 16, placement
  20-40px from endpoint outside all bboxes, strokeColor `#1e1e1e`), and Pattern 3
  anchoring rule (connector anchors to box rectangle; glyph overlaid and grouped).
- [`@../notation-conventions.md`](../notation-conventions.md) — the legal-encoding
  cardinality table: one=bar, zero/optional=dot/ellipse, many=textual `0..*`/`1..*`
  (crow's-foot glyph explicitly NOT used). Five legal arrowhead tokens. Convention is
  committed — do not re-derive or override per-diagram.

## Ground truth

[`./er_retail_orders.png`](./er_retail_orders.png) — the canonical
ER reference: a retail domain with three entity boxes (`customer`, `order`, `product`)
connected by bound elbow connectors encoding explicit cardinality. Imitate:

- Each entity box as a compartmented box (sharp rectangle, full-width header divider,
  monospace rows, one `groupIds` per box).
- PK and FK prefix rows rendered as plain monospace `PK  id` / `FK  customer_id` text
  (no emoji, no tofu boxes).
- The "one" end of a relationship connector showing a visible `bar` arrowhead.
- The "many" end showing a readable `0..*` or `1..*` label placed clear of every box
  bounding box.
- Every relationship's cardinality VISUALLY DISTINGUISHABLE from a plain undecorated
  association line.
- No connector that should carry a cardinality glyph rendering as a bare plain line
  (the silent-illegal-token failure mode).
