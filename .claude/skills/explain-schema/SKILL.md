---
name: explain-schema
description: Explain the structure, cardinality, primary key, and canonical count method for a data store. Citizen-Dev Controls Cat 15 empowerment shortcut. Surfaces relationship-literacy knowledge before agents query unfamiliar stores.
allowed-tools: [Bash, Read]
---

# explain-schema

**Role:** You are the schema explainer — you describe a data store's structure, cardinality, primary key, and canonical count method before an agent writes an aggregation. You explain only; you do not run mutations or write to the store.

**Output / Termination:** Return one schema brief — `{store, primary_key, cardinality, canonical_count_method}` — and stop. Do not query or modify data.

Explain a data store's schema, cardinality, and canonical query method. Useful when an agent (or operator) is about to write a new aggregation against an unfamiliar store.

## When to use

- Before writing a `jq` or SQL query against a store you haven't touched recently
- When an aggregation result feels wrong and you want to check the cardinality
- When onboarding a new agent to a citizen-dev workflow

## Usage

```
/explain-schema <store-name>
/explain-schema --list   # list all known stores
```

Examples:
- `/explain-schema crm_ledger`
- `/explain-schema treasury_state`
- `/explain-schema --list`

## Implementation

```bash
STORE="${1:-}"

if [ "$STORE" = "--list" ] || [ -z "$STORE" ]; then
  python3 -c "
import yaml
d = yaml.safe_load(open('data/schema_relationships.yaml'))
print('Known data stores:')
for k, v in d.get('stores', {}).items():
  card = v.get('cardinality', '?')
  path = v.get('path', '?')
  print(f'  {k:<25} {card:<6} {path}')
"
  exit 0
fi

python3 - <<EOF
import yaml
d = yaml.safe_load(open('data/schema_relationships.yaml'))
store = d.get('stores', {}).get('$STORE')
if not store:
  print(f"Unknown store '$STORE'. Run /explain-schema --list to see available stores.")
  exit(1)

print(f"Store: $STORE")
print(f"Path:        {store.get('path')}")
print(f"Format:      {store.get('format')}")
print(f"Primary key: {store.get('primary_key')}")
print(f"Cardinality: {store.get('cardinality')}")
print(f"Last verified: {store.get('last_verified')}")
print()
print(f"Dedupe rule:")
print(f"  {store.get('dedupe_rule')}")
print()
print(f"Canonical count query:")
for line in store.get('canonical_count_query', '').split('\n'):
  print(f"  {line}")
print()
print(f"Business definitions backed by this store:")
for bd in store.get('business_definitions', []):
  print(f"  - {bd}")
if store.get('notes'):
  print()
  print(f"NOTES:")
  for line in store.get('notes', '').split('\n'):
    print(f"  {line}")
EOF
```

## Related

- Source: `data/schema_relationships.yaml`
- Companion doc: `v5_memory/knowledge/domains/schema_relationships.md`
