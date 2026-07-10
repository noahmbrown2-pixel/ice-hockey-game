# AGENTS.md for bbop-skills

Best practices for BBOP group repos, intended for coding agents and humans

TODO: fill in extra description here

## Repo management

This repo uses `uv` for managing dependencies. Never use commands like `pip` to add or manage dependencies.
`uv run` is the best way to run things, unless you are using `justfile` or `makefile` target

`mkdocs` is used for documentation.