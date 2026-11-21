---
name: medusa/verticals/professional-digital-services-agent
description: Leaf specialist for freelance, worker, saas, digital-product,
  creator-economy, rights-license, print-on-demand, employment-hr, and coworking
  modules. Manages gig economy contracts, SaaS subscriptions, digital downloads,
  content creator monetization, IP rights, POD fulfillment, job listings, and
  workspace bookings. Reports to professional-services-orchestrator.
color: purple
triggers:
  keywords:
    - freelance
    - gig work
    - digital product
    - saas
    - creator
    - content creator
    - rights
    - license
    - print on demand
    - employment
    - job listing
    - coworking
    - workspace
  file_patterns:
    - apps/medusa-backend/src/modules/freelance/**
    - apps/medusa-backend/src/modules/worker/**
    - apps/medusa-backend/src/modules/saas/**
    - apps/medusa-backend/src/modules/digital-product/**
    - apps/medusa-backend/src/modules/creator-economy/**
    - apps/medusa-backend/src/modules/rights-license/**
    - apps/medusa-backend/src/modules/print-on-demand/**
    - apps/medusa-backend/src/modules/employment-hr/**
    - apps/medusa-backend/src/modules/coworking/**
    - apps/medusa-backend/src/modules/worker/**
---

# Professional & Digital Services Leaf Agent

## Freelance/Worker — Gig Contracts
- Milestone-based contracts: scope → milestones → delivery → release payment
- Escrow: client funds held in wallet until milestone approved
- Dispute escalation: `dispute` module (risk cluster)
- Worker classification: Freelancer (`frelancer_vat_no` for VAT) vs. Employee (EOS entitlements)

## SaaS — Plan Management  
- Plan tiers: Starter / Pro / Enterprise (configurable per SaaS product)
- Usage limits enforced via `entitlements` module
- Metered billing components piped to `metering` module (financial cluster)
- Free trial: `entitlements` grant without payment; converts on trial end via Temporal

## Digital Product — Content Delivery
- Download tokens: time-limited (24h), single-use URL via `file-vercel-blob`
- License keys: generated on purchase, validated via `entitlements`
- Streaming access: JWT-gated with `identity-gate` validation per request

## Creator Economy — Monetization
- Tip jar: quick donation via wallet transfer
- Pay-per-view content: product in catalog, access via `entitlements` on purchase
- Creator payout: revenue share (creator %, platform %) via `commission` module; batch weekly

## Rights & License — IP Registry
- Rights records: copyright, trademark, patent references
- Licensing terms: exclusive vs. non-exclusive, territory, duration
- Takedown: creator flags violation → `legal` module issues DMCA notice → catalog item suspended

## Print on Demand — POD Jobs
- Variant creation: product + print design → POD supplier API (Printful/printify)
- Print job submitted on order capture → supplier ships directly (drop-ship model)
- Production status tracked via POD supplier webhook → Medusa fulfillment update

## Employment HR — Job Board
- Job listing as Medusa product (one listing = one product, `apply` = cart action)
- Candidate funnel: apply → screening → interview → offer → onboarding
- Payroll: salary records linked to ERP (Tryton); payslips via `invoice` module

## Coworking — Workspace Commerce
- Desk/office/meeting room catalog with real-time availability via `resource` module
- Day pass, weekly, monthly booking tiers
- Door access code issued as `digital-product` on booking confirmation
- Meeting room credits included in coworking membership (`subscription-benefits`)
