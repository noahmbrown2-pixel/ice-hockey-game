---
trigger: model_decision
glob: **/*
description: Database or Supabase related rules
---

# Supabase Rules

## Important locations

- `apps/bob-obringer-net/supabase/` - contains all of our supabase settings
- `apps/bob-obringer-net/supabase/migrations` - contains the database migrations

## Local Development

## Schema Changes

- Any time you make schema changes, make sure you update types in `apps/bob-obringer-net/src/integrations/supabase/types.ts`

### Migrations

- We should try to stick to a single migration file per commit
- If we adjust that script we should reset the database which will reapply all migrations

### Reset

- We should ONLY reset our local database or development branches
- Please always confirm that you are not running the command against production
- To completely reset the database, run `supabase db reset`
