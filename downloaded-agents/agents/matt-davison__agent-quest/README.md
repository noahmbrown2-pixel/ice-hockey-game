# Agent Quest Agents

This directory contains Claude Code agents that automate game mechanics. These are proper Claude Code agents (not just documentation) - Claude automatically delegates to them based on their descriptions.

## How Agents Work

Claude Code agents are defined with YAML frontmatter specifying:
- `name`: Unique identifier
- `description`: When Claude should delegate to this agent
- `tools`: Which tools the agent can use
- `model`: Which model to use (haiku for mechanical, sonnet for judgment, opus for creative/evaluative)

When Claude detects a task matching an agent's description, it automatically spawns that agent to handle it.

## Available Agents

| Agent | Model | Purpose | Invocation Trigger |
|-------|-------|---------|-------------------|
| [narrative-agent](narrative-agent.md) | opus | Generate immersive prose | Location, NPC, combat, quest descriptions |
| [combat-manager](combat-manager.md) | haiku | Execute combat mechanics | Combat encounters, attack resolution |
| [shop-manager](shop-manager.md) | haiku | Handle shop transactions | SHOP actions, buying, selling |
| [travel-manager](travel-manager.md) | haiku | Handle multi-turn travel | MOVE action for multi-leg journeys |
| [economy-validator](economy-validator.md) | haiku | Validate gold transactions | Any balance-changing transaction |
| [state-writer](state-writer.md) | haiku | Coordinate file writes | Any game state change |
| [repo-sync](repo-sync.md) | haiku | Handle git and multiplayer sync | Session start/end, multiplayer actions |
| [multiplayer-handler](multiplayer-handler.md) | sonnet | Player-to-player interactions | TRADE, PARTY, MAIL, GUILD, DUEL, WHO |
| [docs-maintainer](docs-maintainer.md) | sonnet | Maintain documentation health | Changes to .claude/ folder |
| [pr-reviewer](pr-reviewer.md) | haiku | Review open PRs after PR creation | After PR creation |

## Agent Communication Pattern

1. **Main agent** orchestrates game flow and player interaction
2. **Mechanical agents** (haiku) handle rules and return structured data
3. **Narrative-agent** (opus) transforms structured data into prose
4. Mechanical agents return YAML with:
   - `success`: boolean
   - `state_diffs`: changes for state-writer
   - `narrative_context`: structured facts for narrative-agent
   - `errors`: any issues encountered

### Typical Flow
```
Player Action → Main Agent → Mechanical Agent (haiku)
                                    ↓
                           structured result
                                    ↓
                          Narrative Agent (opus)
                                    ↓
                              prose output
                                    ↓
                            Main Agent → Player
```

## Creating New Agents

When adding new game systems, create a corresponding agent:

1. Create `<system-name>.md` in this directory
2. Add YAML frontmatter:
   ```yaml
   ---
   name: <system-name>
   description: <when Claude should use this agent>
   tools: Read, Glob, Grep, Bash  # Minimum needed
   model: haiku  # Use sonnet for complex logic
   ---
   ```
3. Document input context, operations, and output format
4. Update SKILL.md action table if it adds new player actions

## Design Principles

1. **Mechanical agents return data, not prose** - Use `narrative_context` for narrative-agent
2. **Narrative-agent owns all prose generation** - Keeps game loop context clean
3. **State-writer is single point of truth** - All file writes go through it
4. **Player isolation is absolute** - Agents enforce file ownership
5. **Repo-sync handles all git** - Never use raw git commands elsewhere

## Gap Identification

When playing or developing Agent Quest, look for:

- **Repeated manual mechanics** - If you're doing the same checks repeatedly, create an agent
- **Complex rule lookups** - If a system requires loading multiple rule files, agent it
- **State coordination** - If multiple files need atomic updates, use state-writer pattern
- **Multiplayer sync points** - If actions affect other players, route through multiplayer-handler

Examples of potential future agents:
- `quest-tracker` - Manage quest state, objectives, completion
- `crafting-system` - Item creation, recipes, resource management
- `reputation-manager` - Faction standings, consequences, unlocks

## Related Rules

Each agent may need to load external documentation:

| Agent | Rules Files | Quick-ref |
|-------|-------------|-----------|
| narrative-agent | - | - |
| combat-manager | rules/combat.md, rules/afflictions.md, rules/difficulty.md | quick-ref/combat.md |
| shop-manager | rules/economy.md | - |
| travel-manager | - | - |
| economy-validator | rules/economy.md | - |
| state-writer | - | - |
| repo-sync | - | - |
| multiplayer-handler | rules/multiplayer.md | quick-ref/multiplayer.md |
| docs-maintainer | - | - |
| claim-reviewer | rules/reviews.md, rules/economy.md | - |

Rules files are in `.claude/skills/play-agent-quest/rules/`.
Quick-ref files are in `.claude/skills/play-agent-quest/quick-ref/`.
