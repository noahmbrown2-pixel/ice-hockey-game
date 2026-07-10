# AGENTS.md — Code Mode

This file provides coding-specific guidance for agents working in this repository.

## Critical Gotchas

- **Dirty-item guard**: Call `markItemDirty(id)` when queuing local changes, `clearItemDirty(id)` after successful persistence. Remote updates to dirty items are skipped to prevent snap-back.
- **Realtime guard**: Every store mutation triggered by a remote event MUST be wrapped with `isApplyingRemote()` check to prevent feedback loops.
- **Board store vs UI store**: `board-store` is for persisted data only. Selection, viewport, drawing state, and overlays go in `ui-store` only.
- **Env accessors**: Never hardcode collection/bucket IDs — use `getCollectionId()` and `getBucketId()` from `src/env.ts`.

## Custom Utilities

| Utility                                                          | File                                   | Purpose                                |
| ---------------------------------------------------------------- | -------------------------------------- | -------------------------------------- |
| `markItemDirty` / `isItemDirty` / `clearItemDirty`               | `src/lib/dirty-items.ts`               | Prevent snap-back during realtime sync |
| `isApplyingRemote` / `markApplyingRemoteUpdate`                  | `src/lib/realtime/realtime-service.ts` | Feedback loop prevention               |
| `roleRank` / `canInviteToWorkspace` / `canManageWorkspaceMember` | `src/lib/authorization.ts`             | Role-based permission checks           |
| `getCollectionId` / `getBucketId` / `getDatabaseId`              | `src/env.ts`                           | Centralized env access                 |

## State Management

- **Board state** (persisted): `src/stores/board-store.ts` — layers, items, board metadata, isDirty flag
- **UI state** (transient): `src/stores/ui-store.ts` — selection, activeTool, viewport, gestures, overlays
- **Never** put selection or viewport in board-store

## API Routes

- API routes under `src/app/api/` use server-side Appwrite client
- Validate with `validateServerEnv()` in server-only contexts
- Share links use server API key for unauthenticated access via `/api/share/[token]`
