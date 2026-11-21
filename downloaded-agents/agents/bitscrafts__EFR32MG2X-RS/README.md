# Custom Prompts and Agents for EFR32MG24 HAL Development

This directory contains documentation for custom agents and prompts used in HAL development.

## Agent Location

The Rust Embedded Orchestrator agent is located in:
- **Agent file**: `.claude/agents/rust-embedded-orchestrator.md`
- **Slash command**: `.claude/commands/orchestrator.md`

## Rust Embedded Orchestrator

**Purpose**: Enforces skill usage and quality standards for HAL development

**Activates via**:
- `/orchestrator` slash command
- `/agents` command (select rust-embedded-orchestrator)

**What it does**:
- Automatically applies rust-hal-expert skill for code reviews
- Enforces markdown-edit skill for all documentation changes
- Implements quality gates before marking work complete
- Applies STM32 chief engineer review standards
- Ensures .archive backups for all documentation edits

**Use when**:
- Implementing new peripherals
- Conducting code reviews
- Updating documentation
- Completing development phases
- Any production-quality work

**Activation**:
```bash
# From project root
/orchestrator
```

**Expected behavior after activation**:
- All code reviews use rust-hal-expert scripts
- All documentation edits use markdown-edit scripts
- Automatic .archive backups created
- Expert-level verdicts (SHIP IT / FIX IT / BLOCK IT)
- Quality gates enforced before completion

## Usage Examples

### Example 1: New Peripheral Development

```
User: Add SPI peripheral support
Orchestrator:
1. Checks PAC registers first
2. Implements src/spi/mod.rs
3. Runs review-module.sh automatically
4. Fixes issues found
5. Uses markdown-edit to create README.md
6. Applies expert review persona
7. Updates docs/STATUS.md via markdown-edit
8. Reports verdict with grade
```

### Example 2: Documentation Update

```
User: Update all module READMEs from "Phase 5" to "Phase A"
Orchestrator:
1. Uses markdown-edit bulk-update.sh with --dry-run
2. Shows what will change
3. Executes bulk update
4. Creates .archive backups automatically
5. Verifies with git diff
6. Reports completion
```

### Example 3: Code Review

```
User: Review the timer module
Orchestrator:
1. Runs review-module.sh on src/timer/mod.rs
2. Runs check-unsafe.sh on src/timer/
3. Runs compare-patterns.sh for timer
4. Applies rust-hal-expert persona
5. Provides comprehensive review with grade
6. Clear verdict: SHIP IT / FIX IT / BLOCK IT
```

## Quality Gates Checklist

The orchestrator enforces these gates before completion:

- [ ] All unsafe blocks have Safety comments
- [ ] No panics in library code
- [ ] Critical sections used correctly
- [ ] Zero-cost abstractions verified (#[inline])
- [ ] Module README.md updated (via markdown-edit)
- [ ] Examples compile and build
- [ ] Expert review conducted (rust-hal-expert)
- [ ] Git diff reviewed
- [ ] .archive backups created for docs

## Skills Integration

The orchestrator automatically uses:

**rust-hal-expert** (.claude/skills/rust-hal-expert/):
- Scripts: check-unsafe.sh, review-module.sh, compare-patterns.sh
- Expert persona for comprehensive reviews
- Industry comparison to stm32-rs patterns

**markdown-edit** (.claude/skills/markdown-edit/):
- Scripts: replace-in-section.sh, update-section.sh, smart-replace.sh, bulk-update.sh, append-to-section.sh, prepend-to-section.sh
- Automatic .archive backups with timestamps
- Safe bulk operations with --dry-run

**search-markdown** (~/.claude/skills/search-markdown/):
- Read-only operations for research
- Section extraction and analysis

## Deactivation

The orchestrator mode persists for the conversation. To reset to normal mode, start a new conversation or explicitly request:

```
User: Deactivate orchestrator mode
```

## Best Practices

1. **Always activate orchestrator for production work**
2. **Trust the expert verdicts** - they're based on STM32 experience
3. **Review .archive backups** - they're your safety net
4. **Run quality gates** - don't skip them
5. **Use --dry-run** - for bulk documentation changes

## File Locations

- Orchestrator agent: `.claude/agents/rust-embedded-orchestrator.md`
- Slash command: `.claude/commands/orchestrator.md`
- rust-hal-expert skill: `.claude/skills/rust-hal-expert/`
- markdown-edit skill: `.claude/skills/markdown-edit/`

## Customization

To modify orchestrator behavior:
1. Edit `.claude/agents/rust-embedded-orchestrator.md`
2. Restart Claude Code session for changes to load
3. Changes apply to all future agent invocations

## Support

For issues or enhancements:
- Check skill documentation in respective SKILL.md files
- Review script source in skills/*/scripts/
- Refer to CLAUDE.md for project context
