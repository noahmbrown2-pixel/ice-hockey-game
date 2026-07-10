# Agent Development & Validation

**AUTO-LOADED**: When working with or creating AI agents.

**See also**: `README.md` for complete agent overview and usage.

---

## 🚨 MANDATORY: Agent Self-Validation

**ALL code-generating agents MUST validate their output before committing.**

### The Rule

```
NEVER commit code that doesn't execute.
```

### The Workflow

```
1. Generate code/tests
2. Write to file
3. ✅ VALIDATE (run it!)
4. If errors → Fix → goto 3
5. Only commit when valid
```

### Why This Matters

AI agents commonly generate framework-incompatible code:

- `@/` path aliases (Wasp test builds don't support)
- Enum access in `vi.hoisted()` (undefined before imports)
- Ambiguous queries (`getByText` when text appears twice)

**These break RED phase** - tests can't run at all.

---

## Framework Constraints (Wasp/Vitest)

### Path Aliases ❌

```typescript
// ❌ NEVER - Agent mistake
import { X } from "@/constants/file";

// ✅ ALWAYS - Fix to relative path
import { X } from "../../constants/file";
```

**Auto-fix**: Replace `@/` with calculated relative path.

### Enum Hoisting ❌

```typescript
// ❌ NEVER - Undefined in hoisted scope
vi.hoisted(() => ({ role: DepartmentRole.MEMBER }));

// ✅ ALWAYS - String literal (runtime equivalent)
vi.hoisted(() => ({ role: "MEMBER" }));
```

**Auto-fix**: Replace enum access with string literal value.

### Query Selectors & User Interactions ⚠️

```typescript
// ❌ AVOID - Implementation-specific
screen.getByText("Title"); // Fails if duplicate text
user.selectOptions(select, "value"); // Assumes native <select>

// ✅ PREFER - Component-agnostic
screen.getByRole("heading", { name: "Title" });
// For dropdowns: click trigger, then option
user.click(screen.getByLabelText("Filter"));
user.click(screen.getByRole("option", { name: "Draft" }));
```

**Auto-fix**:

1. Upgrade to role-based queries
2. Detect `selectOptions()` → suggest click-based pattern
3. Check nested `beforeEach` doesn't override parent mock setup

---

## Type Safety Standards

**Reference:** [docs/LINTING-STANDARDS.md](../../docs/LINTING-STANDARDS.md)

**Key rules agents MUST follow:**

- Operations: Use Wasp generated types (`GetTask<Args, Return>`)
- Helper functions: Prefer delegate pattern, document if `context: any` needed
- Test mocks: Try `vi.mocked()` first, `as any` with inline comment as fallback
- See docs for complete 2-tier standard (production strict, tests pragmatic)

---

## Validation Command

```bash
# After generating tests, agent runs:
wasp test client run <test-file>
```

### Valid Outcomes

| Phase  | Result              | Status  | Meaning                          |
| ------ | ------------------- | ------- | -------------------------------- |
| RED    | Tests run, all FAIL | ✅ PASS | Expected - no implementation yet |
| GREEN  | Tests run, all PASS | ✅ PASS | Implementation complete          |
| Either | Syntax errors       | ❌ FAIL | **Fix before commit**            |

### Example Outputs

```bash
# ✅ VALID RED
❌ operations.test.ts (3 failed)
  ❌ should create org
    Cannot find module 'operations'  # Expected!

# ❌ INVALID - Must fix
Cannot resolve module '@/constants/...'
ReferenceError: Cannot access enum before initialization
```

---

## Error Recovery

When validation fails:

```
1. Parse error message
2. Identify type (path? enum? query?)
3. Apply fix
4. Re-run validation
5. Max 3 attempts → escalate to human
```

**Common fixes**:

| Error                     | Fix                      |
| ------------------------- | ------------------------ |
| `Cannot resolve '@/...'`  | Convert to relative path |
| `Cannot access enum...`   | Use string literal       |
| `Found multiple elements` | Use `getByRole()`        |

---

## Pre-Commit Checklist

**Agent verifies BEFORE committing:**

- [ ] Tests execute (no syntax errors)
- [ ] Tests fail appropriately (RED) or pass (GREEN)
- [ ] No `@/` paths in test files
- [ ] No enum in `vi.hoisted()`
- [ ] Role-based queries used
- [ ] 5 TDD quality criteria met

**ANY failure → DO NOT COMMIT**

---

## Example Implementation

```typescript
async function generateTests(spec) {
  let attempts = 0;

  while (attempts++ < 3) {
    // 1-2. Generate & write
    const code = await generateTestCode(spec);
    await writeFile(testPath, code);

    // 3. VALIDATE
    const result = await run(`wasp test client run ${testPath}`);

    // 4. Check outcome
    if (result.noSyntaxErrors) {
      return commit("test: add tests (RED)");
    }

    // 5. Auto-fix
    code = fixPathAliases(code);
    code = fixEnumHoisting(code);
    code = fixQuerySelectors(code);
  }

  throw new Error("Validation failed after 3 attempts");
}
```

---

## When Using Agents

**wasp-test-automator** (Haiku) - RED phase

```
"Use wasp-test-automator to generate tests for X"
```

**wasp-code-generator** (Haiku) - GREEN phase

```
"Use wasp-code-generator to implement operation X"
```

**wasp-refactor-executor** (Haiku) - REFACTOR phase

```
"Use wasp-refactor-executor to extract helper X"
```

**wasp-migration-helper** (Haiku) - Schema changes

```
"Use wasp-migration-helper to add field X to entity Y"
```

**All agents MUST follow validation workflow above.**

---

## References

- **Complete Agent Docs**: `.claude/agents/README.md`
- **TDD Workflow**: `docs/TDD-WORKFLOW.md`
- **Test Constraints**: `app/src/test/CLAUDE.md`
- **Real Case Study**: `reports/qa/2025-10-24-test-modifications-sprint-2-detail.md`

---

## Available MCP Servers

Agents kunnen MCP tools gebruiken via ToolSearch. Beschikbaar: **github**, **playwright**, **context7**, **jira**, **actionbook**.

**actionbook:** Pre-built browser workflows (deployment checks, screenshots, admin tasks)

- Usage: `ToolSearch("actionbook")` → `searchActions`, `getActionById`, `list_sources`
- 10x faster than Playwright, 100x token savings
- Use when: Standard web interactions, deployment verification, visual testing

**Zie:** `.claude/README.md` voor complete MCP documentatie en `.claude/skills/actionbook/SKILL.md` voor ActionBook patterns.

---

**Philosophy**: "Trust but verify" - Agents are powerful but must validate before committing.

**Critical**: Validation prevents syntax errors from reaching RED phase commits, maintaining TDD integrity.
