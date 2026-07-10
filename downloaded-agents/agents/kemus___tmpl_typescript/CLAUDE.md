# _tmpl_typescript

TypeScript subtemplate (stage 1) for the copier template system.

## Structure

- `copier.yml` — copier config (no questions; variables arrive via `--data-file`)
- `post-task.sh` — leaf post-task (no children)
- `template/` — TypeScript-specific files to copy into the generated project
- `children/` — empty (leaf template)
