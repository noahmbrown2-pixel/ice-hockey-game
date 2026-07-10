# Reviewer Agent Briefing - Phase 3 Features Review

**Agent Type:** Reviewer (Explore agent)
**Task ID:** #8
**Duration Estimate:** 15-20 minutes
**Complexity:** High (architectural analysis)

---

## 🎯 Your Mission

Review ported features (Session, Auth, Home, Health) for architecture compliance and code quality.

**Context:** All features just ported from reference (79 files). Tests are passing (42/42). Need to verify patterns and architecture before final QA.

**Working Directory:** `C:\Work Stuff Personal\Project\new-health-duel\health_duel\`

---

## 📚 Required Reading (In Order)

1. **`.claude/AGENT_CONTEXT.md`** (MASTER - read first)
2. **`.claude/PROGRESS.md`** (Phase 3 status)
3. **`health_duel/docs/02-architecture/ARCHITECTURE_OVERVIEW.md`** (Clean Architecture)
4. **`health_duel/docs/02-architecture/adr/0004-registry-based-ui-effect-flow-architecture.md`** (EffectBloc)
5. **`health_duel/docs/02-architecture/adr/0002-exception-isolation-strategy.md`** (Error handling)

---

## 🔍 Review Scope

### Features to Review:
1. **Session** (lib/data/session/) - 11 files
2. **Auth** (lib/features/auth/) - 27 files
3. **Home** (lib/features/home/) - 6 files
4. **Health** (lib/features/health/) - 33 files

### What NOT to Review:
- Core infrastructure (already reviewed in Phase 2, scored 99/100)
- Tests (already passed 42/42)
- Platform configs

---

## ✅ Review Checklist

### 1. Clean Architecture Boundaries (CRITICAL)

**Check Each Feature:**

**Auth Feature:**
- ❌ **CRITICAL:** `lib/features/auth/domain/` must NOT import Flutter
- ❌ **CRITICAL:** `lib/features/auth/domain/` must NOT import Firebase
- ✅ Domain entities are pure Dart (no external dependencies)
- ✅ Domain repositories are interfaces only
- ✅ Data layer can import Firebase/external packages
- ✅ Presentation layer can import Flutter/BLoC

**Health Feature:**
- ❌ **CRITICAL:** `lib/features/health/domain/` must NOT import `package:health/` plugin
- ❌ **CRITICAL:** Domain entities (StepCount) are pure Dart
- ✅ Health plugin used ONLY in data layer datasource
- ✅ Repository impl maps plugin data → domain entities

**Session:**
- ✅ Domain entities pure (User entity)
- ✅ Data layer handles Firestore serialization

**Spot Check Files:**
```
lib/features/auth/domain/entities/auth_user.dart
lib/features/auth/domain/repositories/auth_repository.dart
lib/features/health/domain/entities/step_count.dart
lib/features/health/domain/repositories/health_repository.dart
lib/data/session/domain/entities/user.dart
```

**Red Flags:**
- ❌ `import 'package:flutter/...'` in domain layer
- ❌ `import 'package:firebase_auth/...'` in domain layer
- ❌ `import 'package:health/...'` in health domain layer
- ❌ `import 'package:cloud_firestore/...'` in domain layer

---

### 2. EffectBloc Pattern Compliance

**Check Each BLoC:**

**AuthBloc** (`lib/features/auth/presentation/bloc/auth_bloc.dart`):
- ✅ Extends `EffectBloc<AuthEvent, AuthState>`
- ✅ Uses `emitWithEffect(emit, newState, effect)` for effects
- ✅ AuthState has `final UiEffect? effect` field
- ✅ AuthState mixin `EffectClearable<AuthState>`
- ✅ AuthState props EXCLUDES effect field
- ✅ AuthState custom `==` operator INCLUDES effect
- ✅ Effects have unique timestamps
- ✅ Stream subscription cancelled in `close()`

**HomeBloc** (`lib/features/home/presentation/bloc/home_bloc.dart`):
- Same checks as AuthBloc

**HealthBloc** (`lib/features/health/presentation/bloc/health_bloc.dart`):
- Same checks as AuthBloc
- ✅ EXTRA: Stream subscriptions properly managed (health data streams)

**Red Flags:**
- ❌ State props includes effect (breaks pattern)
- ❌ Direct `emit()` used instead of `emitWithEffect()`
- ❌ Missing `EffectClearable` mixin
- ❌ Stream subscriptions not cancelled in close()

---

### 3. Error Handling Pattern

**Check Repositories:**

**AuthRepositoryImpl** (`lib/features/auth/data/repositories/auth_repository_impl.dart`):
- ✅ All methods return `Either<Failure, T>`
- ✅ Try-catch wraps external calls
- ✅ Exceptions mapped via `ExceptionMapper.toFailure(e)`
- ✅ No raw exceptions thrown to caller

**HealthRepositoryImpl** (`lib/features/health/data/repositories/health_repository_impl.dart`):
- Same checks as AuthRepositoryImpl

**SessionRepositoryImpl** (`lib/data/session/data/repositories/session_repository_impl.dart`):
- Same checks as AuthRepositoryImpl

**Spot Check Pattern:**
```dart
@override
Future<Either<Failure, User>> getUser() async {
  try {
    final result = await dataSource.getUser();
    return Right(result);
  } on CoreException catch (e) {
    return Left(ExceptionMapper.toFailure(e));
  }
}
```

**Red Flags:**
- ❌ Methods return bare types (not Either)
- ❌ Raw exceptions thrown
- ❌ Empty catch blocks
- ❌ Exceptions not mapped to Failures

---

### 4. Dependency Injection

**Check DI Modules:**

**Verify Registration Order in Each Module:**

`lib/data/session/di/session_module.dart`:
- ✅ Data source registered first
- ✅ Repository registered second
- ✅ Use cases registered third

`lib/features/auth/di/auth_module.dart`:
- ✅ Data source → Repository → Use cases → BLoC
- ✅ BLoC as lazy singleton (not factory)

`lib/features/home/di/home_module.dart`:
- ✅ BLoC registration correct

`lib/features/health/di/health_module.dart`:
- ✅ Data sources (local + remote) → Repository → Use cases → BLoC

**Verify Integration:**
- ✅ All modules called from `lib/core/di/injection.dart`
- ✅ Order: session → auth → home → health

**Red Flags:**
- ❌ Wrong registration order (causes runtime errors)
- ❌ Circular dependencies
- ❌ BLoC as factory instead of lazy singleton

---

### 5. Import Path Verification

**Spot Check 10-15 Files:**

Sample files:
```
lib/features/auth/presentation/bloc/auth_bloc.dart
lib/features/auth/data/repositories/auth_repository_impl.dart
lib/features/health/domain/entities/step_count.dart
lib/features/health/presentation/bloc/health_bloc.dart
lib/data/session/data/models/user_model.dart
```

**Expected:**
- ✅ All imports use `package:health_duel/...`
- ✅ No relative imports for cross-module (`../../../`)
- ✅ External packages use proper package imports

**Red Flags:**
- ❌ Relative imports for core or other features
- ❌ Wrong package name (`fintrack_lite` instead of `health_duel`)

---

### 6. Code Quality (Spot Check)

**Check 5-8 Files for:**

- ✅ Documentation comments on public APIs
- ✅ Immutable classes (final fields, const constructors)
- ✅ Type safety (no dynamic where avoidable)
- ✅ Proper use of Equatable
- ✅ Consistent naming (camelCase variables, PascalCase classes)

**Sample Files:**
- `lib/features/auth/domain/entities/auth_user.dart`
- `lib/features/health/domain/usecases/get_daily_steps.dart`
- `lib/data/session/domain/entities/user.dart`

**Red Flags:**
- ❌ Missing docs on public APIs
- ❌ Mutable state in entities
- ❌ Excessive use of dynamic

---

### 7. Feature-Specific Checks

**Health Feature - Plugin Integration:**
- ✅ Health plugin used ONLY in `health_local_data_source.dart`
- ✅ Permission handling in data layer
- ✅ Domain layer receives clean `StepCount` entities

**Auth Feature - Firebase Integration:**
- ✅ FirebaseAuth used ONLY in `auth_remote_data_source.dart`
- ✅ Domain layer receives clean `AuthUser` entities
- ✅ User state stream properly managed

**Session Feature - User Entity:**
- ✅ User entity has validation logic
- ✅ UserModel handles Firestore serialization

---

## 📊 Reporting Template

```markdown
# Phase 3 Features Architecture Review

## Executive Summary
**Status:** [✅ APPROVED / ⚠️ APPROVED WITH NOTES / ❌ CHANGES REQUIRED]
**Score:** [X/100]
**Critical Issues:** [Count]
**Warnings:** [Count]

## 1. Clean Architecture Boundaries [✅/⚠️/❌]
### Auth Feature
- Domain layer purity: [✅/❌]
- [Details or issues found...]

### Health Feature
- Domain layer purity: [✅/❌]
- Plugin isolation: [✅/❌]
- [Details...]

### Session
- [Status and details...]

**Critical Issues Found:** [Count]
[List if any...]

## 2. EffectBloc Pattern [✅/⚠️/❌]
### AuthBloc
- Pattern compliance: [✅/❌]
- [Details...]

### HomeBloc
- [Status...]

### HealthBloc
- [Status...]
- Stream lifecycle: [✅/❌]

**Issues Found:** [Count]

## 3. Error Handling [✅/⚠️/❌]
- AuthRepository: [✅/❌]
- HealthRepository: [✅/❌]
- SessionRepository: [✅/❌]

**Issues Found:** [Count]

## 4. Dependency Injection [✅/⚠️/❌]
- Registration order: [✅/❌]
- Integration: [✅/❌]

**Issues Found:** [Count]

## 5. Import Paths [✅/⚠️/❌]
- Package imports correct: [✅/❌]
- No relative imports: [✅/❌]

**Issues Found:** [Count]

## 6. Code Quality [Score/10]
- Documentation: [X/10]
- Immutability: [X/10]
- Type safety: [X/10]

## 7. Feature-Specific [✅/⚠️/❌]
- Health plugin isolation: [✅/❌]
- Auth Firebase isolation: [✅/❌]

## Summary

**Critical Issues:** [List]
**Warnings:** [List]
**Recommendations:** [List]

**Ready for QA:** [YES/NO]
**Justification:** [Explain...]
```

---

## 🚨 Critical vs Warning

**Critical (Blocks QA):**
- Domain layer importing Flutter/Firebase/plugins
- EffectBloc pattern violations
- Missing error handling (no Either)
- DI circular dependencies

**Warning (Note but don't block):**
- Missing documentation on some methods
- Minor code style inconsistencies
- Info-level lint warnings

---

## 🎯 Success Criteria

Review is complete when you've:
- ✅ Verified Clean Architecture boundaries (all 4 features)
- ✅ Verified EffectBloc pattern (3 BLoCs)
- ✅ Verified error handling (3 repositories)
- ✅ Spot-checked imports (10-15 files)
- ✅ Spot-checked code quality (5-8 files)
- ✅ Generated comprehensive report with score
- ✅ Clear recommendation (approve for QA or require fixes)

---

**Focus on architecture and patterns, not perfection. Good luck!** 🏗️
