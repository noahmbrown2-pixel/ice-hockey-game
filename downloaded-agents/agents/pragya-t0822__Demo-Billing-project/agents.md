# 🤖 Agent Registry

All agents in this system. Every agent has a defined role, owns specific skills, and follows strict financial and architectural rules.

---

## Business Domain Agents

| Agent | File | Owned Skills | Primary Role |
|-------|------|-------------|-------------|
| `billing.agent` | [billing.agent.md](billing.agent.md) | `create_invoice` · `calculate_gst` · `apply_discount` · `process_payment` | POS billing, invoice lifecycle, payments |
| `accounting.agent` | [accounting.agent.md](accounting.agent.md) | `post_journal` · `generate_ledger` · `trial_balance` | Double-entry accounting, CoA, period close |
| `inventory.agent` | [inventory.agent.md](inventory.agent.md) | `update_stock` · `weight_handling` · `low_stock_alert` | Stock management, SKU + weight-based items |
| `reconciliation.agent` | [reconciliation.agent.md](reconciliation.agent.md) | `match_transactions` · `settlement_tracking` · `fee_calculation` | Bank reconciliation, gateway settlements |
| `recovery.agent` | [recovery.agent.md](recovery.agent.md) | `detect_overdue` · `send_reminder` · `generate_payment_link` | Collections, dunning, payment recovery |
| `reporting.agent` | [reporting.agent.md](reporting.agent.md) | `profit_loss` · `balance_sheet` · `cash_flow` | Financial reports, GST returns, analytics |

## Technical Agents

| Agent | File | Scope | Primary Role |
|-------|------|-------|-------------|
| `backend-developer.agent` | [backend-developer.agent.md](backend-developer.agent.md) | Backend codebase (`/backend`) | Laravel 12 API, services, repositories, migrations |
| `frontend-developer.agent` | [frontend-developer.agent.md](frontend-developer.agent.md) | Frontend codebase (`/frontend`) | React 19 modules, hooks, service layer, POS UI |
| `uiux-designer.agent` | [uiux-designer.agent.md](uiux-designer.agent.md) | Design system & all UI | Component design, user flows, accessibility, tokens |

---

## Agent Invocation Rules

1. **Always delegate** — business logic routes through the appropriate domain agent.
2. **Accounting is mandatory** — every financial event MUST call `accounting.agent → post_journal`. No exceptions.
3. **Skills are owned** — only the owning agent may invoke its skill. No cross-agent skill calls.
4. **Sequence matters** — follow the dependency chain in [workflows.md](../rules/workflows.md). Do not skip steps.
5. **Audit always** — every agent action that touches financial data emits an audit log entry.
6. **Technical agents implement** — `backend-developer.agent` and `frontend-developer.agent` implement what domain agents define. `uiux-designer.agent` designs what `frontend-developer.agent` builds.

---

## Agent Dependency Map

```
billing.agent
    │── calls ──► inventory.agent       → update_stock       (stock deduction on confirmed sale)
    │── calls ──► accounting.agent      → post_journal       (sales + payment journal entries)
    └── reads ──► recovery.agent        → detect_overdue     (credit sale overdue check)

reconciliation.agent
    └── calls ──► accounting.agent      → post_journal       (settlement + adjustment entries)

recovery.agent
    │── calls ──► billing.agent         → process_payment    (record recovered payment)
    └── calls ──► accounting.agent      → post_journal       (cash receipt on recovery)

reporting.agent
    │── calls ──► accounting.agent      → trial_balance      (pre-report validation)
    │── calls ──► accounting.agent      → generate_ledger    (account data reads)
    └── reads ──► all modules           (read-only access)

backend-developer.agent
    └── implements ──► all domain agent API specs, services, repositories, and DB migrations

frontend-developer.agent
    │── implements ──► all domain agent UI requirements and API service layer
    └── collaborates ──► uiux-designer.agent   (receives design handoff, implements components)

uiux-designer.agent
    └── designs for ──► frontend-developer.agent   (produces layouts, tokens, component specs)
```

---

## Mandatory Accounting Triggers

Any agent that causes a financial event **MUST** call `accounting.agent → post_journal`:

| Trigger Event | Calling Agent | Journal Entry |
|---------------|--------------|---------------|
| Invoice confirmed | `billing.agent` | DR A/R or Cash · CR Sales Revenue + CGST Payable + SGST Payable |
| Payment received | `billing.agent` | DR Cash / Bank / Clearing · CR Accounts Receivable |
| Invoice cancelled | `billing.agent` | Mirror reversal of original entry |
| Gateway settlement | `reconciliation.agent` | DR Bank + Fee Exp + GST ITC · CR Gateway Clearing |
| Inventory purchase (GRN) | `inventory.agent` | DR Inventory Asset · CR Accounts Payable or Cash |
| Recovery payment | `recovery.agent` | DR Cash / Bank · CR Accounts Receivable |
| Month-end accruals | `accounting.agent` | DR/CR appropriate accrual accounts |

---

## Skill-to-Agent Ownership Map

| Skill | Owned By | Skill File |
|-------|----------|-----------|
| `create_invoice` | `billing.agent` | [billing-skills.md](../skills/billing-skills.md) |
| `calculate_gst` | `billing.agent` | [billing-skills.md](../skills/billing-skills.md) |
| `apply_discount` | `billing.agent` | [billing-skills.md](../skills/billing-skills.md) |
| `process_payment` | `billing.agent` | [billing-skills.md](../skills/billing-skills.md) |
| `post_journal` | `accounting.agent` | [accounting-skills.md](../skills/accounting-skills.md) |
| `generate_ledger` | `accounting.agent` | [accounting-skills.md](../skills/accounting-skills.md) |
| `trial_balance` | `accounting.agent` | [accounting-skills.md](../skills/accounting-skills.md) |
| `update_stock` | `inventory.agent` | [inventory-skills.md](../skills/inventory-skills.md) |
| `weight_handling` | `inventory.agent` | [inventory-skills.md](../skills/inventory-skills.md) |
| `low_stock_alert` | `inventory.agent` | [inventory-skills.md](../skills/inventory-skills.md) |
| `match_transactions` | `reconciliation.agent` | [reconciliation-skills.md](../skills/reconciliation-skills.md) |
| `settlement_tracking` | `reconciliation.agent` | [reconciliation-skills.md](../skills/reconciliation-skills.md) |
| `fee_calculation` | `reconciliation.agent` | [reconciliation-skills.md](../skills/reconciliation-skills.md) |
| `detect_overdue` | `recovery.agent` | [recovery-skills.md](../skills/recovery-skills.md) |
| `send_reminder` | `recovery.agent` | [recovery-skills.md](../skills/recovery-skills.md) |
| `generate_payment_link` | `recovery.agent` | [recovery-skills.md](../skills/recovery-skills.md) |
| `profit_loss` | `reporting.agent` | [reporting-skills.md](../skills/reporting-skills.md) |
| `balance_sheet` | `reporting.agent` | [reporting-skills.md](../skills/reporting-skills.md) |
| `cash_flow` | `reporting.agent` | [reporting-skills.md](../skills/reporting-skills.md) |

## New Technical Agents

| Agent | File |
|-------|------|
| `backend-developer.agent` | [backend-developer.agent.md](backend-developer.agent.md) |
| `frontend-developer.agent` | [frontend-developer.agent.md](frontend-developer.agent.md) |
| `uiux-designer.agent` | [uiux-designer.agent.md](uiux-designer.agent.md) |
