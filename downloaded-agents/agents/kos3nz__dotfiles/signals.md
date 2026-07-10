# Signals — `pr-release-risk` Categorizer 1

Regex patterns for detecting Public API surface changes across stacks. Scan **added lines only** (`^\+`) in `git diff <base>...HEAD`. Exclude:

- `*.test.*`, `*.spec.*`, `__tests__/`
- `node_modules/`, `dist/`, `build/`, `.next/`, `.output/`, `.nuxt/`, `.svelte-kit/`

Regex syntax: ripgrep / PCRE-compatible. Use `rg -nP` for PCRE features.

---

## Category 1 — HTTP route handlers

Detect endpoint definitions that callers / clients hit over HTTP.

| Stack | Regex |
|---|---|
| Next.js App Router (`route.ts`) | `^\+\s*export\s+(async\s+)?(const\s+|function\s+)?(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\b` |
| Next.js Pages Router (`pages/api/*`) | `^\+\s*export\s+default\s+(async\s+)?(function\s+)?handler\b` |
| Remix v2 / React Router v7 | `^\+\s*export\s+(const\s+\|async\s+function\s+)?(loader\|action\|clientLoader\|clientAction)\b` |
| TanStack Start | `^\+.*\b(createFileRoute\|createServerFn\|createServerFileRoute)\s*\(` |
| Hono / Express / Koa (server) | `^\+.*\.(get\|post\|put\|delete\|patch)\s*\(\s*['"]` |
| Nuxt 3 / Nitro | `^\+.*defineEventHandler\s*\(` |
| Cloudflare Workers (Module) | `^\+\s*export\s+default\s+\{[^}]*\bfetch\b` |
| Cloudflare Workers (Service) | `^\+.*addEventListener\s*\(\s*['"]fetch['"]` |
| Bun.serve | `^\+.*\bBun\.serve\s*\(` |
| Deno.serve | `^\+.*\bDeno\.serve\s*\(` |
| Astro endpoints | `^\+\s*export\s+(const\s+\|async\s+function\s+)(GET\|POST\|PUT\|DELETE\|PATCH)\b` |
| SvelteKit endpoints | `^\+\s*export\s+(const\s+\|async\s+function\s+)?(GET\|POST\|PUT\|DELETE\|PATCH)\b` |

---

## Category 2 — RPC procedures

| Stack | Regex |
|---|---|
| tRPC v10+ procedure | `^\+.*\.(query\|mutation\|subscription)\s*\(` |
| tRPC v10+ router | `^\+.*\b(createTRPCRouter\|router)\s*\(\{` |
| tRPC procedure decoration | `^\+.*\b(publicProcedure\|protectedProcedure\|adminProcedure)\b` |
| Hono RPC client | `^\+.*\bhc\s*<` |
| Hono `.route()` mount | `^\+.*\.route\s*\(\s*['"]` |

---

## Category 3 — Shopify Functions / Extensions

| Stack | Regex / Path |
|---|---|
| Function entry (`run`) | `^\+\s*export\s+default\s+function\s+run\s*\(` |
| Function API-specific entries | `^\+\s*export\s+function\s+(run\|cartTransform\|deliveryCustomization\|paymentCustomization\|orderRoutingLocationRule)\s*\(` |
| Extension config touch | path matches `extensions/.*/shopify\.extension\.toml` |
| Function input/output schema | path matches `extensions/.*/(input\|schema)\.(graphql\|ts)` |

---

## Category 4 — Public exports (signature / surface changes)

| Pattern | Regex |
|---|---|
| Added exported function | `^\+\s*export\s+(async\s+)?function\s+\w+\s*\(` |
| Added exported const (function/arrow/object) | `^\+\s*export\s+const\s+\w+\s*[:=]` |
| Added exported class/interface/type | `^\+\s*export\s+(default\s+)?(class\|interface\|type)\s+\w+` |
| Removed public export | `^-\s*export\s+(default\s+)?(function\|const\|class\|interface\|type)\b` |
| Default export changed | added `^\+\s*export\s+default\b` paired with removed `^-\s*export\s+default\b` in same hunk |

**Rename detection**: removed + added export with same hunk index but different name → flag as **HIGH** (breaking for external consumers, see NEVER 4 in SKILL.md).

---

## Category 5 — Schema / contract validators

Validators that shape inbound/outbound data — changes here change API contracts even if endpoints look the same.

| Library | Regex |
|---|---|
| Zod | `^\+.*\b(z\.object\|z\.union\|z\.discriminatedUnion\|z\.enum\|z\.array\|z\.tuple\|z\.literal\|z\.\w+\(\))` |
| zod-form-data | `^\+.*\bzfd\.\w+\(` |
| Valibot | `^\+.*\bv\.object\(\|v\.union\(\|v\.array\(\|v\.string\(\|v\.number\(` |
| Yup | `^\+.*\byup\.object\(` |
| Joi | `^\+.*\bjoi\.object\(\|Joi\.object\(` |
| ArkType | `^\+.*\btype\s*\(\s*\{` |
| **Effect Schema** | `^\+.*\bSchema\.(Struct\|Class\|TaggedUnion\|Array\|String\|Number\|Boolean\|Literal\|Union)\b` |

---

## Category 6 — GraphQL / OpenAPI

| Pattern | Detection |
|---|---|
| GraphQL schema files | path matches `\.(graphql\|gql)$` |
| GraphQL TS schema | path matches `schema\.ts$` and contains `^\+.*\b(buildSchema\|makeExecutableSchema\|GraphQLObjectType\|builder\.objectType)\b` |
| GraphQL tagged template | `^[+-].*\b(gql\|graphql)\s*\`` |
| OpenAPI spec | path matches `(openapi\|swagger)\.(json\|yaml\|yml)$` |
| ts-rest contract | `^\+.*\b(initContract\|c\.router\|c\.query\|c\.mutation)\s*\(` |

---

## Database schemas (also Categorizer 2 in SKILL.md — Persistence)

Database / ORM schema changes are persistence concerns, but they often double as API surface changes for clients that read the same shape. Categorizer 2 owns these by path; this section is a cross-reference for awareness.

| ORM / Tool | Path / Regex |
|---|---|
| Prisma | path `prisma/.*\.prisma$`, regex `^[+-]\s*(model\|enum\|type)\s+\w+` |
| Drizzle | path `drizzle/.*\.(ts\|js)$` or `**/schema(\.ts\|\.js\|/.*)`, regex `^\+.*\b(pgTable\|mysqlTable\|sqliteTable\|integer\|text\|varchar\|serial\|boolean\|timestamp)\s*\(` |
| Drizzle config | path matches `drizzle\.config\.(ts\|js\|json)$` |
| Kysely codegen / migrations | path `kysely/.*\.(ts\|js)$` or `migrations/.*\.(ts\|js\|sql)$` |
| TypeORM entity | `^\+.*@Entity\s*\(` (decorator) |
| Mongoose schema | `^\+.*\bmongoose\.Schema\s*\(\|\bnew\s+Schema\s*\(` |

---

## Practical scan recipe

```bash
# Combined scan example (run inside repo)
BASE=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
BASE=${BASE:-main}

# All added lines from non-test source files
git diff "$BASE"...HEAD -- \
  ':(exclude)*.test.*' ':(exclude)*.spec.*' \
  ':(exclude)__tests__/**' ':(exclude)node_modules/**' \
  ':(exclude)dist/**' ':(exclude)build/**' \
  ':(exclude).next/**' ':(exclude).output/**' \
  | rg -nP '<pattern from above>'
```

Use `git diff --name-only <base>...HEAD` first to get the candidate path list, then filter and grep per category.

---

## How to use this file

The parent SKILL.md instructs the LLM to `Read assets/signals.md` before scanning. Iterate through Categories 1→6 in order. For each Category:

1. Run the relevant `rg` queries on the diff
2. Collect hits with file:line
3. Manually classify each hit (real API surface change vs. false positive like example/sample code)
4. Report **hit count per Category** in the final briefing (proves the LLM checked all 6)
