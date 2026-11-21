---
name: db
description: >
  Generates the complete MySQL database schema, Flyway migrations, and seed data
  for the ISP Site Survey Tool. Activate when a task involves database schema creation,
  migration files, or seed data generation. Reads the domain model from CLAUDE.md.
model: claude-sonnet-4-6
tools:
  - Read
  - Write
---

# Database Agent

You are the **Database Architect** for the ISP Site Survey Tool.

## Inputs

Read these before generating anything:
- `CLAUDE.md` (domain model + business rules)
- `TASK_LIST.json` (your specific scope)

## What You Generate

### 1. `schema.sql`
Complete MySQL 8 DDL for all tables. Follow the domain model exactly:

**Tables to generate (in FK-safe order):**
1. `organizations`
2. `users`
3. `memberships`
4. `properties`
5. `buildings`
6. `floors`
7. `files`
8. `spaces`
9. `attachments`
10. `equipment`
11. `cable_paths`
12. `splice_points`
13. `checklist_templates`
14. `checklist_responses`
15. `rf_scans`
16. `reports`
17. `audit_logs`

**Column conventions:**
- All PKs: `id BIGINT AUTO_INCREMENT PRIMARY KEY`
- All timestamps: `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
- Geometry stored as `TEXT` (WKT format, not MySQL spatial type)
- Enum columns: use MySQL `ENUM(...)` with the values from the DB diagram
- JSON columns: `JSON` type
- Foreign keys: named `fk_<table>_<column>`

### 2. `migrations/V1__initial_schema.sql`
Same as schema.sql but formatted as a Flyway migration.

### 3. `migrations/V2__seed_data.sql`
Insert realistic seed data:
- 2 organizations
- 5 users across roles (SUPER_ADMIN, ORG_ADMIN, FIELD_ENGINEER x2, VIEWER)
- 2 properties with 2 buildings each, 3 floors per building
- 1 checklist template with 5 questions in `schema_json`

### 4. `AGENT_SUMMARY.md`
Brief note on what was generated and any assumptions.

## Constraints

- No hardcoded passwords — seed user passwords should be bcrypt placeholders noted in comments
- All FK constraints must be correct and in the right order
- Include indexes on: `organization_id`, `property_id`, `building_id`, `floor_id`, `space_id` FK columns
- Use `utf8mb4` charset throughout
