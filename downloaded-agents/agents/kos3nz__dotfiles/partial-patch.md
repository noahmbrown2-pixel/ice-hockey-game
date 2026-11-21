# Hunk-Level Staging with `git apply --cached`

Use this when Phase 3 decides to split into multiple commits and you need to stage specific hunks per commit.

## Workflow per commit

Default to `git apply --cached --recount` so git recomputes `@@` line numbers from context. This eliminates the line-number arithmetic that breaks down when the same file appears across multiple commits.

```bash
cat > /tmp/commit-1.patch << 'PATCH'
diff --git a/src/foo.ts b/src/foo.ts
index a1b2c3d..e4f5g6h 100644
--- a/src/foo.ts
+++ b/src/foo.ts
@@ -12,7 +12,9 @@ function setup() {
   const x = 1;
   const y = 2;
+  const z = 3;
   return { x, y };
 }
PATCH

git apply --cached --recount /tmp/commit-1.patch
git diff --staged -- src/foo.ts   # verify content landed in the right place
git diff -- src/foo.ts            # verify remaining hunks for later commits are intact
git commit -m "..."
```

The scoped (`-- <path>`) verify is important: `--recount` is fail-loud on missing context but **fail-silent** if context lines accidentally match another spot in the file. Reading the per-file staged diff after each apply catches that.

## Patch construction rules

1. **File header verbatim**: `diff --git a/X b/X`, `index ...`, `--- a/X`, `+++ b/X`.
2. **Hunk header**: `@@ -old_start,old_count +new_start,new_count @@` — with `--recount`, the numbers can be approximate; the context lines must still be correct.
3. **3 lines of context** (` ` prefix) around each hunk. Context is what `--recount` uses to locate the hunk, so don't trim it.
4. **Copy from `git diff` output** — don't reconstruct context from memory.

## Same file, hunks across different commits

With `--recount` you do **not** need to adjust `new_start` between commits. Just:

- Apply in source-file order (earliest hunk first) so the working tree shrinks predictably.
- After each apply, run the two scoped verifies above before committing.

Manual `new_start` arithmetic (`original_new_start + (lines_added_in_A − lines_removed_in_A)`) is only needed in the rare case `--recount` is unavailable or the context appears multiple times in the file.

## New (untracked) files

```bash
git add path/to/new-file   # add whole file; no patch needed
```

## Recovery

If `git diff --staged` shows the wrong content, reset the file and re-apply:

```bash
git restore --staged path/to/file
git apply --cached /tmp/commit-N.patch
```

If `git apply --cached` fails, read the error — don't retry blindly. Most common cause is a stale `new_start` after a prior commit changed file length.

## Cleanup

```bash
rm -f /tmp/commit-*.patch
```
