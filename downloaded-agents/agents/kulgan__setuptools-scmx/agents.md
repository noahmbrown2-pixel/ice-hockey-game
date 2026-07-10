# Versioning Scheme

This project utilizes `setuptools-scmx` with custom versioning schemes.

## Branch Scheme Logic

The `branch-scheme` operates as follows:

*   **Tags**: If the current commit is exactly on a tag, the version will be the exact tag (e.g., `1.2.3`).
*   **Branches**: For commits not directly on a tag, the version is derived from the next anticipated version, a branch-specific label, and the distance from the last tag. The format is `{next_version}.{label}.{distance}`.

    *   `{next_version}`: The version that `setuptools_scm` guesses will be the next release.
    *   `{label}`: A label determined by the branch name, as configured in `pyproject.toml`.
    *   `{distance}`: The number of commits since the last tag.

### Configured Labels

The `branch-scheme` is configured with specific labels for certain branches:

*   Branches `master` and `main` are assigned the label `rc` (release candidate).
    *   Example: If the last tag was `1.2.3` and you are on `main` branch with 5 commits since the tag, the version might be `1.2.4.rc.5`.
*   The `hotfix` branch is assigned the label `post`.
    *   Example: If the last tag was `1.2.3` and you are on `hotfix` branch with 2 commits since the tag, the version might be `1.2.4.post.2`.
*   Any other branch will use its sanitized branch name as the label.
    *   Example: If the last tag was `1.2.3` and you are on a `feature-x` branch with 10 commits since the tag, the version might be `1.2.4.feature-x.10`.

## General Configuration in `pyproject.toml`

Here's an example of how both schemes can be configured in `pyproject.toml`:

```toml
[tool.setuptools-scmx]
scheme = "branch-scheme" # or "ci-scheme"

# scmx branch scheme config
[tool.setuptools-scmx.branch-scheme]
labels = [
  { name = "rc", branches = [ "master", "main" ] },
  { name = "post", branches = [ "hotfix" ] },
]

```
