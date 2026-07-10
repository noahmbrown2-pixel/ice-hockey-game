# Resolving Commit References

When the user names a past commit (or range) to decompose, resolve it before soft-resetting. Always confirm with `git show --stat` or `git log --oneline` first when the target is anything other than `HEAD~1`.

| Reference style | Example phrase | Resolution |
| --- | --- | --- |
| Hash | "decompose `a1b2c3d`" | `git show a1b2c3d --stat` → `git reset a1b2c3d~1` |
| Relative | "last 2 commits", "the one before last" | `git log --oneline -5` → `git reset HEAD~2` |
| Natural language | "the commit that added auth" | `git log --oneline --grep=auth -20` → confirm → `git reset <hash>~1` |
| Range | "last 3 commits", "HEAD~4..HEAD" | `git log --oneline HEAD~4..HEAD` → `git reset HEAD~4` |

After the soft-reset, commits are removed from history but their changes remain in the working tree — proceed to Phase 2.

**Never** use `git reset --hard`. Soft reset only.
