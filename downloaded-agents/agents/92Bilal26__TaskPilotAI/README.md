# TaskPilot Blueprint Subagents

**Location**: `.claude/agents/`
**Status**: ✅ Complete & Production Ready
**Total Files**: 4 subagent definitions (1,063 lines)
**Last Updated**: 2025-12-07

---

## Overview

This directory contains detailed specifications for the 4 specialized subagents used by the TaskPilot Blueprint Skill to generate production-ready task management applications.

Each subagent is designed to focus on a specific aspect of application generation and can work in parallel with others (after specifications are ready).

---

## Subagent Files

### 1. spec-generator.md (229 lines)

**Name**: spec-generator
**Model**: Claude Sonnet
**Type**: Specification Generation Expert
**Status**: Production Ready

**Purpose**: Generate comprehensive specifications for Phase 1 task management applications using spec-driven development principles.

**Responsibilities**:
- Create constitution with 8 quality gates
- Generate feature specifications (5 files)
- Create API contracts (5 files)
- Build implementation plan
- Define 31 actionable tasks with dependencies

**Output**:
- 7 specification files
- 6,000+ lines of specifications
- Ready for Code-Generator, Test-Generator, and Documentation-Generator

**Execution**: **Runs FIRST (Sequential)**
- Blocks until complete
- All other agents depend on this output

**Tools Available**:
- Read, Write, Glob, Grep

**Key Requirements**:
- All specs must be internally consistent
- Examples must be realistic and complete
- Validation rules must be testable
- Tasks must have clear dependencies
- No ambiguities in requirements

---

### 2. code-generator.md (231 lines)

**Name**: code-generator
**Model**: Claude Sonnet
**Type**: Python Code Generation Expert
**Status**: Production Ready

**Purpose**: Generate production-ready Python source code following best practices and specifications.

**Responsibilities**:
- Create 7 source files (1,100+ lines)
- Implement 5 core features
- Build interactive Terminal UI (optional)
- Implement in-memory storage
- Add comprehensive docstrings and type hints

**Output**:
- src/main.py (242 lines) - CLI interface
- src/tui.py (386 lines) - Interactive UI
- src/commands.py (235 lines) - Feature implementations
- src/models.py (90 lines) - Data model
- src/storage.py (35 lines) - Storage layer
- src/__init__.py - Package init
- src/py.typed - Type hints marker

**Execution**: **Runs AFTER Specs (Parallel)**
- Waits for Spec-Generator to complete
- Runs simultaneously with Test-Generator and Documentation-Generator

**Tools Available**:
- Write, Edit, Bash, Read, Glob

**Key Requirements**:
- 100% type hints (mypy strict compatible)
- 100% docstrings
- 0 style violations (flake8)
- No external runtime dependencies
- UTC timestamps with Z suffix (ISO 8601)
- Auto-incrementing IDs (never reused)
- Module-level storage variables

---

### 3. test-generator.md (295 lines)

**Name**: test-generator
**Model**: Claude Haiku
**Type**: Test Automation & QA Expert
**Status**: Production Ready

**Purpose**: Generate comprehensive test suites ensuring high code coverage and reliability.

**Responsibilities**:
- Create 84 comprehensive test cases
- Build 3 pytest fixtures for test isolation
- Test happy path, edge cases, and errors
- Ensure ~97.5% code coverage
- Verify 100% test pass rate

**Output**:
- tests/conftest.py (92 lines) - 3 fixtures
- tests/test_add_task.py (18 tests)
- tests/test_delete_task.py (13 tests)
- tests/test_update_task.py (18 tests)
- tests/test_view_tasks.py (22 tests)
- tests/test_mark_complete.py (13 tests)
- 1,300+ lines total, 84 test cases

**Execution**: **Runs AFTER Specs (Parallel)**
- Waits for Spec-Generator to complete
- Runs simultaneously with Code-Generator and Documentation-Generator

**Tools Available**:
- Write, Edit, Bash, Read, Grep

**Key Requirements**:
- All tests must pass (100% pass rate)
- Tests must be independent
- Tests must not modify shared state
- ~95%+ code coverage required
- Clear test descriptions
- Edge cases covered
- Error scenarios tested

---

### 4. documentation-generator.md (308 lines)

**Name**: documentation-generator
**Model**: Claude Haiku
**Type**: Technical Writing Expert
**Status**: Production Ready

**Purpose**: Generate comprehensive, clear user and developer documentation.

**Responsibilities**:
- Create 6+ documentation files
- Write user guides (README, Quick Start)
- Write developer guides (CLAUDE.md)
- Create UI walkthrough (TUI_GUIDE.md)
- Write testing instructions (TESTING_GUIDE.md)

**Output**:
- README.md (400+ lines) - Project overview
- CLAUDE.md (340+ lines) - Development guide
- QUICK_START.md (400+ lines) - Quick start
- TUI_GUIDE.md (400+ lines) - UI guide
- TESTING_GUIDE.md (475+ lines) - Testing guide
- PHASE_1_VERIFICATION.md - Requirements check
- 3,500+ lines total

**Execution**: **Runs AFTER Specs (Parallel)**
- Waits for Spec-Generator to complete
- Runs simultaneously with Code-Generator and Test-Generator

**Tools Available**:
- Write, Read, Glob

**Key Requirements**:
- Clear, concise language
- Multiple examples provided
- Code samples tested and working
- Professional formatting
- No missing information
- Troubleshooting guides included

---

## Execution Flow

```
User Command: /blueprint-generate MyApp
    ↓
Parse and Validate Inputs
    ↓
Create Project Structure
    ↓
Spec-Generator (Sequential)
├─ Creates 7 specification files
├─ Generates 6,000+ lines
└─ Blocks until complete
    ↓
┌─────────────────────────────────────────────────────────┐
│  After Specs (Parallel Execution)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Code-Generator        Test-Generator      Docs-Gen    │
│  (1,100+ lines)        (84 tests)          (3,500+ lines)
│  ├─ main.py            ├─ conftest.py      ├─ README
│  ├─ tui.py             ├─ test_add...      ├─ CLAUDE
│  ├─ commands.py        ├─ test_delete...   ├─ QUICK_START
│  ├─ models.py          ├─ test_update...   ├─ TUI_GUIDE
│  ├─ storage.py         ├─ test_view...     └─ TESTING_GUIDE
│  └─ __init__.py        └─ test_mark...
│                                                         │
└─────────────────────────────────────────────────────────┘
    ↓
Validate Project Output
    ↓
Initialize Git Repository
    ↓
Generate Summary Report
    ↓
Project Ready! (40+ files, ~8,400 lines)
```

---

## System Prompts

Each subagent has a detailed system prompt that guides its behavior:

### Spec-Generator System Prompt
Focuses on:
- Spec-driven development principles
- Clear specification formatting
- Comprehensive examples
- Testable validation rules
- Documentation of edge cases

### Code-Generator System Prompt
Focuses on:
- Production-ready Python code
- Type safety (mypy strict compatible)
- PEP 8 compliance
- Clear architecture
- Comprehensive docstrings

### Test-Generator System Prompt
Focuses on:
- Test-driven development
- High code coverage (95%+)
- Test isolation with fixtures
- Edge case coverage
- Error scenario testing

### Documentation-Generator System Prompt
Focuses on:
- Clear, user-friendly language
- Multiple examples
- Developer-friendly technical content
- Complete information
- Professional formatting

---

## Quality Standards

### All Subagents Must Deliver

**Code Quality**:
- ✅ 0 type errors (mypy strict mode)
- ✅ 0 style violations (flake8 PEP 8)
- ✅ 100% type hint coverage
- ✅ 100% docstring coverage
- ✅ Clean architecture

**Testing**:
- ✅ 84 passing tests (100% pass rate)
- ✅ ~97.5% code coverage
- ✅ Edge cases covered
- ✅ Error scenarios tested

**Documentation**:
- ✅ 3,500+ lines of docs
- ✅ Multiple examples
- ✅ Clear language
- ✅ Complete information

**Specifications**:
- ✅ 6,000+ lines of specs
- ✅ All features defined
- ✅ All contracts specified
- ✅ All tasks identified

---

## Integration with Blueprint Skill

These subagent definitions are used by:
- **Blueprint Skill**: `.claude/skills/taskpilot-blueprint/`
- **Slash Command**: `.claude/commands/blueprint-generate.md`
- **Manifest**: `.claude/skills/taskpilot-blueprint/manifest.json`

### How They Work Together

1. **User invokes**: `/blueprint-generate MyApp [options]`

2. **System processes**:
   - Parses command and validates inputs
   - Creates project structure
   - Invokes Spec-Generator (waits for completion)

3. **Spec-Generator produces**:
   - Constitution with 8 gates
   - 5 feature specifications
   - 5 API contracts
   - Implementation plan
   - 31 actionable tasks

4. **Parallel execution** (all run simultaneously):
   - **Code-Generator** uses specs → creates source code
   - **Test-Generator** uses specs → creates test suite
   - **Documentation-Generator** uses specs → creates guides

5. **Finalization**:
   - Validate all outputs
   - Initialize Git repository
   - Generate summary report
   - Project ready for use!

---

## Customization Points

Each subagent can be customized or extended:

### Adding New Features

1. **Spec-Generator**: Add feature specification template
2. **Code-Generator**: Add implementation code template
3. **Test-Generator**: Add test template
4. **Documentation-Generator**: Add documentation template

### Changing Models

- Spec-Generator: Currently Sonnet (high quality)
  - Could use: Opus (highest quality, slower)
  - Could use: Haiku (faster, lower quality)

- Code-Generator: Currently Sonnet (high quality)
  - Could use: Opus (highest quality, slower)
  - Could use: Haiku (faster, lower quality)

- Test-Generator: Currently Haiku (efficient)
  - Could use: Sonnet (higher quality, slower)
  - Good choice: Haiku works well for tests

- Documentation-Generator: Currently Haiku (efficient)
  - Could use: Sonnet (higher quality, slower)
  - Good choice: Haiku works well for docs

### Adjusting Output Size

Each subagent's output can be adjusted:
- Reduce specifications for minimal feature set
- Reduce tests for lower coverage requirements
- Reduce documentation for essential-only guides
- Scale up for comprehensive coverage

---

## Performance Characteristics

### Execution Timeline

- **Spec-Generator**: 2-5 minutes (sequential)
- **Code-Generator**: 3-5 minutes (parallel)
- **Test-Generator**: 2-3 minutes (parallel)
- **Documentation-Generator**: 1-2 minutes (parallel)
- **Validation & Git**: 2-3 minutes (sequential)

**Total**: 10-30 minutes (with parallelization)

### Resource Usage

- **Tokens**: ~50-100K per generation
- **Cost**: Medium (2 Sonnet + 2 Haiku)
- **Parallelization**: 3x speedup after specs

### Scalability

Can be scaled for:
- **Larger projects**: More features, more tests, more docs
- **Multiple variations**: Generate multiple versions in parallel
- **Different domains**: Adapt system prompts for new domains
- **Different technologies**: Extend for other languages (Phase 2+)

---

## Related Files

**Skill System**:
- `.claude/skills/taskpilot-blueprint/README.md` - Skill overview
- `.claude/skills/taskpilot-blueprint/SUBAGENTS.md` - Subagent specs (old format)
- `.claude/skills/taskpilot-blueprint/manifest.json` - Skill manifest
- `.claude/skills/taskpilot-blueprint/skill-definition.yaml` - Skill definition

**Commands**:
- `.claude/commands/blueprint-generate.md` - Slash command documentation

**Documentation**:
- `BLUEPRINT_SUMMARY.md` - Blueprint system overview
- `BLUEPRINT_USAGE_GUIDE.md` - Usage guide
- `BLUEPRINT_VERIFICATION.md` - Verification checklist
- `IMPLEMENTATION_COMPLETE.md` - Project completion summary

---

## Version History

**v1.0.0** (2025-12-07) - Initial Release
- 4 subagent definitions created
- All specifications and details included
- System prompts finalized
- Quality standards documented
- Integration verified

---

## Support & Maintenance

**For Questions About**:
- Spec-Generator: See `spec-generator.md`
- Code-Generator: See `code-generator.md`
- Test-Generator: See `test-generator.md`
- Documentation-Generator: See `documentation-generator.md`

**For Blueprint Usage**:
- See `.claude/skills/taskpilot-blueprint/README.md`

**For Slash Command**:
- See `.claude/commands/blueprint-generate.md`

**For Project Overview**:
- See `BLUEPRINT_SUMMARY.md`

---

**Status**: ✅ Production Ready
**All Agents**: Ready for immediate use
**Integration**: Complete with Blueprint Skill

