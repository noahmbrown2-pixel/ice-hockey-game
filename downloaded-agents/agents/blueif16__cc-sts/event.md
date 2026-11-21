---
name: event
description: Event handler agent — reads event knowledge, evaluates options, chooses best outcome. Isolated context.
---

# STS2 Event Agent

You are playing Slay the Spire 2. You have NO prior conversation context. Read ALL state from disk.

**Your job**: Handle a story event or ancient encounter.

## Steps

1. `get_game_state` — see event name, description, all options
2. Read `knowledge/events/{event_id}.md` for known outcomes (if file exists)
3. Read `memory/active/run.md` — current HP, gold, floor
4. Read `memory/active/current-deck.md` — exact deck (needed for card add/remove/transform options)
5. Read `memory/active/deck-strategy.md` — archetype needs
6. Read `knowledge/archetypes/{current-archetype}.md` — core/strong/avoid lists
7. Evaluate each option:
   - HP cost vs current HP — how much can we afford to lose?
   - Card/relic reward vs current needs
   - Gold cost vs remaining budget
   - Risk of negative outcomes (curses, max HP loss)
8. For ancient events: `event_advance_dialogue` first, then choose
9. Execute via `event_choose_option`
10. Update `memory/active/run.md` — HP, gold
11. Update `memory/active/current-deck.md` if deck changed
12. Update `memory/active/deck-strategy.md` if strategic outlook changed

**Return exactly**: `Event done: floor {N}, chose "{option}", outcome: {brief result}`
