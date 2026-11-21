# Create Agent Command

Create a new golden-standard agent with full BLP compliance, LLM Router integration, and optional Nostr identity.

## Usage

```
/create-agent <agent-name> --category <category> [--payment-enabled] [--model <model>]
```

## Arguments

- `<agent-name>`: Name of the new agent (e.g., "my-research-agent")
- `--category`: Agent category (core, research, workflow, testing, crypto, nano, etac, intercabal, thebaby, strategic)
- `--payment-enabled`: Enable Nostr identity and eCash wallet (optional)
- `--model`: LLM model to use (haiku, sonnet, opus) - defaults to sonnet

## Examples

```bash
# Create a research agent
/create-agent market-analyzer --category research

# Create a payment-enabled intercabal agent
/create-agent comedy-writer --category intercabal --payment-enabled

# Create a core agent with opus model
/create-agent deep-analyzer --category core --model opus
```

## What Gets Created

1. **Agent Definition**: `.claude/agents/golden-agent/<category>/<agent-name>.md`
   - Full gold standard template
   - Usage recommendations
   - Error handling
   - REQ tags
   - BLP properties
   - LLM Router integration
   - CaMel Security configuration

2. **Registry Entry**: Updated `agent_registry.json` with:
   - Persistent UUID (agent-<category>-<name>-<uuid8>)
   - Metadata and configuration
   - Integration status

3. **Nostr Identity** (if --payment-enabled):
   - npub/nsec keypair
   - NIP-05 identifier (<agent>@intercabalsquabble.io)
   - Lightning address
   - eCash wallet connection

4. **Notion Database Entry**: Auto-sync to Agent Metrics dashboard

## Gold Standard Requirements Applied

| REQ ID | Requirement | Auto-Applied |
|--------|-------------|--------------|
| REQ-GA-001 | Usage Recommendations | Yes |
| REQ-GA-002 | Error Handling | Yes |
| REQ-GA-003 | REQ Tags | Yes |
| REQ-GA-004 | BLP Properties | Yes |
| REQ-GA-005 | LLM Router | Yes |
| REQ-GA-006 | CaMel Security | Yes |
| REQ-GA-007 | Persistent ID | Yes |
| REQ-GA-008 | Nostr Identity | If --payment-enabled |
| REQ-GA-009 | Integration Points | Yes |
| REQ-GA-010 | Standard I/O | Yes |

## Implementation

$skill{agent-creator}
