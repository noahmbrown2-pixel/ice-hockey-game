---
name: verify-count
description: Verify a numeric claim ("we have N X") against ProofDB and the canonical schema source-of-truth. Returns OK / WARN-within-10% / BLOCK-off-by->10%. Citizen-Dev Controls Cat 15 empowerment shortcut. Pre-send sanity check for any outbound artifact citing counts.
allowed-tools: [Bash, Read]
---

# verify-count

**Role:** You are the count verifier — you parse a numeric claim, run the entity's canonical query, compute drift, and return a verdict. You verify the number only; you do not edit the artifact making the claim.

**Termination:** Return exactly one verdict — OK / WARN / BLOCK — with the canonical number, then stop. Do not suggest rewrites.

Verify a numeric claim against canonical source-of-truth. Use before pasting a count into outbound.

## When to use

- "We have 17 marketplace customers" — verify against agent_passports
- "5K signups this week" — verify against canonical signup store
- "Revenue this month: $200" — split into booked vs settled per `feedback_bo_revenue_verify_live.md`

## Usage

```
/verify-count "<claim text>"
```

Examples:
- `/verify-count "we have 17 marketplace customers"`
- `/verify-count "currently 130 agents"`
- `/verify-count "5K signups this week"`

## How it works

1. Parses claim to extract `{entity, number}` via regex
2. Looks up entity's canonical query in `data/schema_relationships.yaml`
3. Runs canonical query
4. Computes drift: `|claim - actual| / max(claim, actual)`
5. Returns one of:
   - **OK** (drift ≤ 10%): claim is within tolerance
   - **WARN** (10% < drift ≤ 25%): suggests canonical number
   - **BLOCK** (drift > 25%): refuses unless `--override`

## Implementation

```bash
CLAIM="${1:-}"
if [ -z "$CLAIM" ]; then
  echo "Usage: /verify-count \"we have N entity\""
  exit 1
fi

python3 - <<EOF
import re, yaml, subprocess

claim = "$CLAIM"

# Parse "we have N <entity>" or "currently N <entity>" or "N <entity>"
m = re.search(r'\b(?:we have|currently|are|is|got)?\s*(\d[\d,]*\.?\d*[KMB]?)\s+(\w+)\b', claim, re.IGNORECASE)
if not m:
  print(f"Cannot parse claim: {claim}")
  print("Expected format: 'we have N entity' or 'currently N entity'")
  exit(1)

num_str, entity = m.group(1).replace(',', ''), m.group(2).lower().rstrip('s')

# Handle K/M/B suffix
multiplier = 1
if num_str.endswith('K'): multiplier, num_str = 1000, num_str[:-1]
elif num_str.endswith('M'): multiplier, num_str = 1_000_000, num_str[:-1]
elif num_str.endswith('B'): multiplier, num_str = 1_000_000_000, num_str[:-1]
claim_num = int(float(num_str) * multiplier)

d = yaml.safe_load(open('data/schema_relationships.yaml'))
entry = d.get('glossary', {}).get(entity)
if not entry:
  # try plural→singular variations
  for k in d.get('glossary', {}):
    if entity == k or entity == k + 's' or entity == k[:-1]:
      entry = d['glossary'][k]; entity = k; break

if not entry:
  print(f"VERIFY: UNKNOWN entity '{entity}'. Available: {list(d.get('glossary',{}).keys())}")
  exit(2)

query = entry['canonical_query']
if 'see scripts/' in query:
  print(f"VERIFY: MANUAL — {query}")
  exit(0)

try:
  result = subprocess.run(['bash', '-c', query], capture_output=True, text=True, timeout=30)
  actual = int(result.stdout.strip().split('\n')[-1])
except Exception as e:
  print(f"VERIFY: ERROR running canonical query: {e}")
  exit(3)

drift = abs(claim_num - actual) / max(claim_num, actual, 1)
verdict = "OK" if drift <= 0.10 else ("WARN" if drift <= 0.25 else "BLOCK")

print(f"Claim:     {claim_num} {entity}")
print(f"Canonical: {actual} {entity}")
print(f"Drift:     {drift:.1%}")
print(f"Verdict:   {verdict}")
print(f"Source:    {entry['canonical_store']}")
print(f"Definition: {entry['canonical_definition'][:150]}")

if verdict in ('WARN', 'BLOCK'):
  print(f"\nSuggested replacement: '{actual} {entity}'")
EOF
```

## Related

- `.claude/skills/canonical-count/SKILL.md` — the upstream query lookup
- `.claude/agents/aggregation-truth-critic.md` — the in-pipeline critic version
- `data/schema_relationships.yaml` — canonical query source
- `tests/test_aggregation_truth.py` — golden cases
