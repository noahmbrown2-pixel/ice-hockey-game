---
name: canonical-count
description: Look up the canonical distinct-count query for a business entity (customer, agent, lead, etc) from the schema-relationships KB and run it. Use BEFORE citing any count in outbound artifacts. Citizen-Dev Controls Cat 15 empowerment shortcut. Avoids the row-count-on-de-normalized-data trap (Kozyrkov / Daffron).
allowed-tools: [Bash, Read]
---

# canonical-count

**Role:** You are the canonical-count resolver — you look up an entity's distinct-count query in `data/schema_relationships.yaml` and run it. You return the canonical number only; you do not estimate or row-count de-normalized data.

**Termination:** Return exactly `{entity}: {count} (via {store})` and stop — do not add commentary or trend analysis.

Look up and execute the canonical distinct-count query for a business entity, defined in `data/schema_relationships.yaml`.

## When to use

- Before drafting a sentence like "we have N customers / agents / signups / leads"
- When validating a count claim already in a draft outbound artifact
- When an analyst asks "how many X do we have?"

## Usage

```
/canonical-count <entity>
```

Examples:
- `/canonical-count customer`
- `/canonical-count agent`
- `/canonical-count marketplace_customer`
- `/canonical-count active_user`

## How it works

1. Reads `data/schema_relationships.yaml`
2. Looks up `glossary.<entity>` for the canonical query
3. Runs the canonical query via Bash
4. Returns: `{entity}: {count} (via {canonical_store}, definition: {canonical_definition})`

If the entity isn't in the glossary, returns: `Unknown entity. Available: <list>. Add to data/schema_relationships.yaml glossary section.`

## Reference

- Schema KB: `data/schema_relationships.yaml`
- Human doc: `v5_memory/knowledge/domains/schema_relationships.md`
- Aggregation critic: `.claude/agents/aggregation-truth-critic.md`
- Test: `tests/test_aggregation_truth.py`

## Implementation

```bash
ENTITY="${1:-}"
if [ -z "$ENTITY" ]; then
  echo "Usage: /canonical-count <entity>"
  python3 -c "
import yaml
d = yaml.safe_load(open('data/schema_relationships.yaml'))
print('Available entities:')
for k in d.get('glossary', {}):
  print(f'  - {k}')
"
  exit 1
fi

python3 - <<EOF
import yaml, subprocess
d = yaml.safe_load(open('data/schema_relationships.yaml'))
entry = d.get('glossary', {}).get('$ENTITY')
if not entry:
  print(f'Unknown entity "$ENTITY". Available: {list(d.get("glossary", {}).keys())}')
  exit(1)
print(f'Canonical store: {entry["canonical_store"]}')
print(f'Definition: {entry["canonical_definition"]}')
print()
print('Running canonical query...')
query = entry['canonical_query']
if 'see scripts/' in query:
  print(f'MANUAL: {query}')
else:
  result = subprocess.run(['bash', '-c', query], capture_output=True, text=True, timeout=30)
  print(f'Result: {result.stdout.strip()}')
  if result.stderr:
    print(f'(stderr: {result.stderr.strip()[:200]})')
EOF
```
