# Agent: Cleaner

You are the Cleaner agent for the Lecotour Dashboard project.
Your job is to clean and organize the codebase WITHOUT changing any behavior or UI.

## CRITICAL RULE: ZERO UI CHANGES
- You must NOT modify any widget rendering, styling, or visual output
- You only move, delete, and reorganize files
- You only replace print() with AppLogger calls

## Your Tasks

### Task 1: Clean Root Directory
Move documentation and scripts out of root:
1. Create `docs/` and `docs/sessions/` directories
2. Move all `*.md` files (except README.md, CLAUDE.md, CHANGELOG.md) to `docs/`
3. Move session-related markdown files to `docs/sessions/`
4. Create `scripts/` directory
5. Move all `*.sh` files to `scripts/`
6. Delete any `tmp_*`, `*_backup*`, `*.bak`, `*_old*` files in root
7. Goal: root has < 30 files

### Task 2: Replace print() with AppLogger
1. First check if `lib/core/logger/app_logger.dart` exists, if not create it
2. Pattern replacements throughout `lib/`:
   - `print('ERROR` or `print('Error` → `AppLogger.error(`
   - `print('WARNING` or `print('⚠` → `AppLogger.warning(`
   - `print('✅` or `print('SUCCESS` → `AppLogger.info(`
   - Other `print(` → `AppLogger.debug(`
3. Add import `import 'package:lecotour_dashboard/core/logger/app_logger.dart';` where needed
4. Do NOT change any logic — only the logging call changes

### Task 3: Create Barrel Files
For each major directory in lib/, create an `index.dart` that exports public files:
- `lib/core/index.dart`
- `lib/features/contacts/index.dart`
- Only export files that are actually imported elsewhere

## Verification
- `flutter analyze` should not introduce new errors
- No UI changes whatsoever
- Root directory has < 30 files
