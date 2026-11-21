# Enhanced Deliberation Debate

Run a budget/time-constrained multi-agent debate with forced decision-making, operator context from all channels, and APOS plan generation.

## Usage

```
/deliberate [topic] [options]
```

## Examples

```
/deliberate "Should we pursue AI consulting as primary revenue?"
/deliberate "Best platform for first paid gig" --tier quick
/deliberate "Fedimint vs Lightning for agent payments" --agents 7 --budget 10 --time 5
```

## Options

- `--agents 5|7|9|11` - Panel size (odd only, default 5)
- `--budget 1.00-20.00` - USD limit (default 5.00)
- `--time 1-10` - Minutes limit (default 2)
- `--rounds 3-10` - Max debate rounds (default 5)
- `--tier quick|standard|deep|executive` - Budget/time preset
- `--no-gather` - Skip context collection phase

## How It Works

### 6-Phase Pipeline

**Phase 0: CONFIGURE + MODEL PROBE**
- Parse args, enforce odd panel count
- Probe all 11 models in pool concurrently (5s timeout each via nano-agent MCP)
- Only models that respond are eligible for random assignment
- Abort if fewer than 5 models available

**Phase 1: GATHER (Context Collector)**
- Sweep all 13+ input channels in parallel: email, lifelog (TB mentions with 2-min window), GitHub stars, CC sessions, WhatsApp, X bookmarks, Nostr, YouTube, ElevenLabs, Discord, Telegram, ProofDB, Hustle-GPT
- Generate shared_memory brief (~2000 tokens) from all channels
- Channels without inbound adapters return gracefully empty

**Phase 2: ASSEMBLE (Panel + Random Models)**
- Seat 1: Devil's Advocate (mandatory)
- Seat 2: Moonshot Agent (mandatory)
- Seats 3-N: Topic-relevant personas from 57-persona pool
- Each agent randomly assigned a different model/provider from confirmed-available pool
- All agents receive identical shared_memory (operator context)

**Phase 3: DELIBERATE (Multi-round debate)**
- Agents argue in parallel via nano-agents using their assigned model
- INFO_REQUEST protocol: agents can request info, Research Clerk fulfills (Exa primary, Tavily backup)
- Per-round budget/time checkpoint (85% = last round, 100% = terminate)

**Phase 4: DECIDE (Forced Vote)**
- Odd panel guarantees majority (no ties)
- Each agent submits: decision, confidence, key argument, conditions
- Decision package includes Moonshot recommendation + DA warning

**Phase 5: DELIVER + APOS HANDOFF**
- Archive JSON to data/deliberations/
- Generate dark-mode HTML dashboard
- Convert decision into plan spec at specs/plan-deliberation-{slug}.md
- Queue to pending_approvals.json (NOT auto-approved)
- Email decision + plan approval instructions
- WhatsApp P0 notification with TinyURL

## Budget Tiers

| Tier | Budget | Time | Rounds | Panel |
|------|--------|------|--------|-------|
| quick | $2.00 | 1 min | 3 | 5 |
| standard | $5.00 | 2 min | 5 | 5 |
| deep | $10.00 | 5 min | 7 | 7 |
| executive | $20.00 | 10 min | 10 | 9 |

## Output

- `data/deliberations/{debate_id}.json` - Full archive
- `html-output/YYYYMMDD-deliberation-{topic_slug}.html` - Dashboard
- `specs/plan-deliberation-{slug}.md` - APOS plan spec (pending approval)
- `plan_operationalization/pending_approvals.json` - Queued for operator review

## Implementation

The command invokes `scripts/enhanced_deliberation.py` as the orchestrator, which coordinates:
- `scripts/debate_context_collector.py` - Channel sweep
- `scripts/debate_research_clerk.py` - Mid-debate info requests
- `scripts/debate_voting_protocol.py` - Forced voting + decision packaging

## Related Commands

- `/debate` - Standard persona debate (no forced decision, no context gathering)
- `/debate-status` - Check active debates
- `/debate-monitor` - Real-time monitoring

$ARGUMENTS
