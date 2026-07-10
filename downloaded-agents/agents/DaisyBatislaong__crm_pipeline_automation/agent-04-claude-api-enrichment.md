---
description: "Builds the Claude API enrichment pipeline in n8n — prompt builder, HTTP Request node, response parser, routing gate, and rate limit buffer."
---

---

## What This Agent Does

Builds the complete enrichment pipeline in n8n: three nodes that take a normalized lead, call the Claude API, parse the structured JSON response, and route the result to either a success or failure path. This is the AI heart of the pipeline.

---

## Trigger

Run this agent:
- After Agent 03 (normalization node complete and tested)
- Any time the prompt template changes (update Code node only — do not rebuild the whole chain)
- Any time the enrichment output contract changes (new field, changed enum)

---

## Pre-Flight Checks

1. Read `skills/claude-api-enrichment.md` in full — especially the prompt template, temperature setting, and parse node
2. Confirm the Anthropic API key is configured as an n8n credential (Header Auth, name: `x-api-key`)
3. Confirm Agent 03 is complete — pin a passing normalized record to use as test input
4. Read the `lead_enrichments` table definition in `database/schema.sql` — the enrichment output must map exactly to these columns

---

## Step-by-Step Instructions

### Step 1 — Add SplitInBatches node

Before the enrichment nodes, add a **SplitInBatches** node to avoid rate limit issues:

- **Name:** `Batch for Enrichment`
- **Batch Size:** 10
- Connect it to the TRUE output of the Deduplication node

This processes leads in groups of 10, preventing API rate limit errors at scale.

### Step 2 — Add the Build Enrichment Prompt Code node

- **Name:** `Build Enrichment Prompt`
- **Mode:** Run Once for Each Item

Copy the complete prompt code from `skills/claude-api-enrichment.md`. Do not abbreviate or paraphrase the prompt — the exact wording of classification rules matters.

Critical settings to verify in the code:
- `temperature` is NOT set here — it's set on the HTTP Request node
- Both `system_prompt` and `user_prompt` are built and passed through `$json`
- The original lead fields are spread onto the output (`...lead`) so downstream nodes have access

### Step 3 — Add the HTTP Request node (Claude API call)

- **Name:** `Call Claude API`
- **Method:** POST
- **URL:** `https://api.anthropic.com/v1/messages`
- **Authentication:** Generic Credential Type → Header Auth → select your Anthropic credential

**Headers** (add as fixed values):
```
anthropic-version: 2023-06-01
content-type: application/json
```

**Body** (JSON mode):
```json
{
  "model": "claude-haiku-4-5",
  "max_tokens": 200,
  "temperature": 0,
  "system": "={{ $json.system_prompt }}",
  "messages": [
    {
      "role": "user",
      "content": "={{ $json.user_prompt }}"
    }
  ]
}
```

**Options tab:**
- Timeout: 30000 (30 seconds)
- Retry on Fail: ON
- Max Tries: 3
- Wait Between Tries: 5000ms

**Critical:** `temperature: 0` is non-negotiable. Enrichment is a deterministic classification task. A non-zero temperature introduces randomness into a structured output task — the same lead will get different results on re-run.

### Step 4 — Add the Parse Enrichment Response Code node

- **Name:** `Parse Enrichment Response`
- **Mode:** Run Once for Each Item

Copy the complete parse code from `skills/claude-api-enrichment.md`. Do not simplify the validation section — it explicitly validates every enum value because the model can return values outside the allowed set even with a strict prompt.

The parse node must:
1. Extract `response.content[0].text`
2. Strip accidental markdown fences
3. `JSON.parse()` inside try/catch
4. Validate all four fields against allowed enums
5. Return `enrichment_failed: true` with an `error_message` on any failure
6. Return `enrichment_failed: false` with all enrichment fields on success

### Step 5 — Add the enrichment routing IF node

- **Name:** `Enrichment Gate`
- **Condition:** `{{ $json.enrichment_failed === false }}`

```
TRUE path  → write to lead_enrichments (Supabase upsert)
FALSE path → write to pipeline_errors (enrichment failure logged)
```

### Step 6 — Add the Format Enrichment Error Code node (FALSE path)

- **Name:** `Format Enrichment Error`
- **Mode:** Run Once for Each Item

```javascript
return {
  json: {
    pipeline_run_id: $node["Start Pipeline Run"].json.run_id,
    source: $json.source,
    raw_data: $json.raw_data,
    error_type: 'enrichment',
    error_message: $json.error_message || 'Unknown enrichment failure',
    failed_at: new Date().toISOString(),
  }
};
```

### Step 7 — Add a Wait node after the batch loop

After the Enrichment Gate (both paths eventually rejoin), add a **Wait node**:
- **Name:** `Rate Limit Buffer`
- **Wait Amount:** 2
- **Wait Unit:** Seconds

This runs after each batch of 10, preventing rate limit issues when processing large volumes.

### Step 8 — Test with pinned data

Pin one record from the Build Enrichment Prompt output. Run only the Call Claude API and Parse nodes. Verify:

- [ ] The HTTP request returns status 200
- [ ] `response.content[0].text` contains valid JSON
- [ ] The parse node extracts all four fields correctly
- [ ] `enrichment_failed` is `false` on a clean record
- [ ] Manually break the prompt (set user_prompt to empty string) — confirm `enrichment_failed: true` is returned, not a crash

Test these lead types specifically (vary the pinned input):
- [ ] Clear Enterprise lead → category: `Enterprise`, priority: `Hot`
- [ ] Individual with no company → category: `Freelancer`
- [ ] Vague message → priority: `Warm` or `Cold`
- [ ] Record with `message: null` → valid JSON returned, no crash

---

## Acceptance Criteria

This agent is done when:
- [ ] `Batch for Enrichment` SplitInBatches node is present
- [ ] `Build Enrichment Prompt` Code node produces correct system and user prompts
- [ ] `Call Claude API` HTTP Request node uses `temperature: 0`, correct headers, retry enabled
- [ ] `Parse Enrichment Response` validates all four enum fields and handles every failure mode
- [ ] `Enrichment Gate` IF node correctly routes success vs. failure
- [ ] `Format Enrichment Error` node produces correct `pipeline_errors` shape
- [ ] `Rate Limit Buffer` Wait node is present after the batch loop
- [ ] All test cases above pass with pinned data
- [ ] `prompt_version` is set to `v1.0` in the parse node output
- [ ] `docs/progress.md` updated

---

## Output

Produces (in n8n workflow):
- `Batch for Enrichment` node
- `Build Enrichment Prompt` Code node
- `Call Claude API` HTTP Request node
- `Parse Enrichment Response` Code node
- `Enrichment Gate` IF node
- `Format Enrichment Error` Code node
- `Rate Limit Buffer` Wait node

After completing, run Agent 01 to re-sync, then proceed to Agent 05.
