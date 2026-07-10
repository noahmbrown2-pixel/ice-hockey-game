---
name: frontend-business-dashboard-agent
description: "CityOS merchant and operator web portal specialist. Owns:
  apps/business-dashboard (merchant analytics + KPIs), apps/merchant-app
  (merchant management portal). Handles: product/inventory management, order
  management, revenue analytics, commission reporting, vendor approval, and
  operator ops dashboards. Reports to frontend-web-orchestrator."
color: blue
triggers:
  keywords:
    - business dashboard
    - merchant portal
    - merchant app
    - operator dashboard
    - merchant analytics
    - product management
    - inventory web
    - order management web
    - commission report
    - vendor management
  file_patterns:
    - apps/business-dashboard/**
    - apps/merchant-app/**
---

# Frontend — Business Dashboard Agent

Merchant and operator portal specialist. Reports to `frontend-web-orchestrator`.

## Apps Owned

| App | Path | Audience | Key Features |
|---|---|---|---|
| Business Dashboard | `apps/business-dashboard/` | Merchants, operators | KPIs, revenue, analytics |
| Merchant App | `apps/merchant-app/` | Merchants | Product, inventory, orders |

## Route Structure

```
apps/merchant-app/src/app/
  (merchant)/[tenant]/[locale]/merchant/
    dashboard/           Revenue KPIs, order velocity, conversion rate
    inventory/           Product catalog, stock levels, variants
    inventory/[id]/      Product detail editor
    orders/              Order queue, fulfillment status
    orders/[id]/         Order detail + fulfillment actions
    analytics/           Revenue charts, top products, customer segments
    payouts/             Payout history, pending balance
    settings/            Store config, logo, operating hours
    staff/               Employee accounts (sub-merchant users)
```

## BFF Data Sources

| Data | BFF Route | Notes |
|---|---|---|
| Products | `GET /api/bff/commerce/products` | Medusa products, Payload enriched |
| Orders | `GET /api/bff/commerce/orders` | Medusa orders filtered by vendor |
| Wallet/Payouts | `GET /api/bff/commerce/wallet` | Medusa + Moyasar balance |
| Analytics | `GET /api/bff/analytics/merchant` | Payload analytics collection |
| Commissions | `GET /api/bff/partner/commissions` | Payload partner commission records |

## Inventory Variant Access Pattern

```typescript
// Payload returns typed Product docs — variant needs double-cast:
const product = doc as unknown as Record<string, unknown>
const variant = product.variant as unknown as Record<string, unknown>
const sku = variant?.sku as string | undefined
const price = variant?.price as number | undefined
```

## Auth Pattern

```typescript
// Merchant routes require 'merchant' or 'vendor' role
import { withAuth } from '@cityos/auth/next'

export default withAuth(InventoryPage, {
  requiredRoles: ['merchant', 'vendor'],
})
```

## Rules
- All BFF calls go via `/api/bff/*` — never call Medusa directly from the browser
- Payout data always fetch fresh — never cache wallet balance beyond 60s
- Inventory edits must optimistically update UI, then confirm via BFF response
- Commission reports: always show in SAR with VAT breakdown (15% ZATCA)
- RTL: Arabic product names must right-align in tables
