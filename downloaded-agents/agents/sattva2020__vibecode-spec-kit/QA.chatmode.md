---
description: 'QA Mode - Technical validation, dependency checks, config verification (can be called from any mode)'
tools: [read_file, list_dir, run_in_terminal, grep_search, semantic_search]
---

# 🔍 QA MODE - Technical Validation

> **Memory Bank System for VS Code** | Quality Assurance

QA — не отдельный custom mode, а набор validation functions, которые можно вызвать из ЛЮБОГО режима для технической проверки.

## Когда пользователь пишет "QA"

1. **Immediate Response**: Ответь `OK QA`

2. **Rule Loading**:
   - Загрузи `.vscode/rules/isolation_rules/visual-maps/qa-mode-map.mdc`
   - Загрузи QA checks:
     - `.vscode/rules/isolation_rules/visual-maps/van_mode_split/van-qa-checks/dependency-check.mdc`
     - `.vscode/rules/isolation_rules/visual-maps/van_mode_split/van-qa-checks/config-check.mdc`
     - `.vscode/rules/isolation_rules/visual-maps/van_mode_split/van-qa-checks/environment-check.mdc`

3. **QA Validation Process**:

   **Check 1: Dependencies**
   - Verify package.json / requirements.txt / etc.
   - Check for missing dependencies
   - Validate versions compatibility
   ```powershell
   npm list --depth=0
   # or
   pip list
   ```

   **Check 2: Configuration**
   - Verify config files (tsconfig.json, .env, etc.)
   - Check for missing environment variables
   - Validate settings consistency

   **Check 3: Environment**
   - Check Node version / Python version
   - Verify installed tools (git, docker, etc.)
   - Platform-specific checks (Windows/Mac/Linux)
   ```powershell
   node --version
   npm --version
   git --version
   ```

   **Check 4: Build Test**
   - Attempt build (npm run build, etc.)
   - Check for compilation errors
   - Verify output artifacts
   ```powershell
   npm run build
   # or
   python -m build
   ```

   **Check 5: Test Execution**
   - Run unit tests
   - Check test coverage
   - Verify all tests passing
   ```powershell
   npm test
   # or
   pytest
   ```

4. **QA Report Format**:
   ```markdown
   # QA Validation Report
   **Date**: YYYY-MM-DD
   **Task**: [TASK_ID]

   ## Validation Results

   ### ✅ Dependencies
   - All dependencies installed: ✓
   - Version compatibility: ✓
   - No security vulnerabilities: ✓

   ### ✅ Configuration
   - Config files present: ✓
   - Environment variables set: ✓
   - Settings valid: ✓

   ### ✅ Environment
   - Node.js: v18.17.0 ✓
   - npm: 9.6.7 ✓
   - git: 2.40.0 ✓
   - Platform: Windows 11 ✓

   ### ✅ Build
   - Build successful: ✓
   - No compilation errors: ✓
   - Artifacts generated: dist/ ✓

   ### ✅ Tests
   - Unit tests: 15/15 passing ✓
   - Integration tests: 5/5 passing ✓
   - Coverage: 95% ✓

   ## Issues Found
   - None

   ## Recommendations
   - Consider updating package X to latest version
   - Add integration test for feature Y

   ## Validation Status
   ✅ **PASSED** - Ready to proceed with implementation
   ```

5. **Common Fixes** (auto-suggest):
   - Missing dependencies: `npm install` / `pip install -r requirements.txt`
   - Outdated packages: `npm update` / `pip install --upgrade`
   - Config issues: Check .env.example, copy to .env
   - Test failures: Review test output, fix code

6. **Mode Transition**:
   - If QA passed → Continue with current mode (IMPLEMENT, etc.)
   - If QA failed → Fix issues, re-run QA

## Platform-Specific Commands

**Windows (PowerShell)**:
```powershell
# Check versions
node --version
python --version
git --version

# Install dependencies
npm install
pip install -r requirements.txt

# Run tests
npm test
pytest

# Build
npm run build
python -m build
```

**Git Bash (Windows)**:
```bash
# Same commands work in Git Bash
node --version
npm install
npm test
```

## QA Flexibility

QA можно вызвать из любого режима:
- **VAN** → QA (проверить environment перед началом)
- **PLAN** → QA (проверить dependencies before planning)
- **IMPLEMENT** → QA (validation во время/после implementation)
- **REFLECT** → QA (final validation перед reflection)

## Verification Checklist

```
✓ QA VALIDATION CHECKPOINT
- Dependencies installed and compatible? [YES/NO]
- Configuration files valid? [YES/NO]
- Environment setup correct? [YES/NO]
- Build successful? [YES/NO]
- All tests passing? [YES/NO]

→ If all YES: Continue with current mode
→ If any NO: Fix issues and re-run QA
```

## Memory Bank Updates

После QA validation:
- Запиши результаты в progress.md (если в IMPLEMENT mode)
- Отметь QA status в tasks.md
- Update activeContext.md с blockers (если QA failed)

---

**Adapted from**: cursor-memory-bank v0.7-beta  
**VS Code**: Uses `.vscode/` instead of `.cursor/`  
**GitHub Copilot**: Activated via chat command "QA" (from any mode)
