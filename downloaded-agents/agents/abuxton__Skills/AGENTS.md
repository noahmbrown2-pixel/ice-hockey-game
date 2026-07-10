# AGENTS.md

This file is the primary project reference for agent-facing guidance in this repository. It documents the available skills, explains how to use them, and provides guidance for writing and publishing new skills.

Use this alongside `.github/copilot-instructions.md`: that file captures repository-wide coding conventions, while `AGENTS.md` is the source of truth for skill discovery and skill maintenance guidance.

## Available Skills

| Name | Description |
| ---- | ----------- |
| [act](skills/act/SKILL.md) | Run, debug, and troubleshoot GitHub Actions locally using nektos/act. |
| [shields-badges](skills/shields-badges/SKILL.md) | Analyse a repository to identify its focus and technology stack, then apply appropriate [shields.io](https://shields.io) badges to markdown files. |
| [writing-skills](skills/writing-skills/SKILL.md) | Author high-quality agent skills following the agentskills.io specification, with correct frontmatter, workflow structure, and reference assets. |
| [publishing-npm](skills/publishing-npm/SKILL.md) | Prepare and publish an npm package that ships agent skills, following the skills-npm convention for skill bundling and distribution. |
| [github-gist](skills/github-gist/SKILL.md) | Create, manage, and organize GitHub Gists using the gh CLI. |
| [gitattributes-manager](skills/gitattributes-manager/SKILL.md) | Create, review, and safely update `.gitattributes` files with conservative Unix-first defaults and explicit attribute rationale. |
| [xkcd-says-what](skills/xkcd-says-what/SKILL.md) | Fetch a matching XKCD comic and generate validated Markdown or HTML embed output for docs or terminal use. |
| [asciinema-record](skills/asciinema-record/SKILL.md) | Record a terminal session to a named .cast file using asciinema, trim the recording to marked content, and optionally convert it to a GIF using agg. |
| [do-nothing-scripting](skills/do-nothing-scripting/SKILL.md) | Derive a do-nothing bash script from an asciinema `.cast` file, a plain text file, shell history output, or a user interview — encoding each step as a manual prompt that the operator can later replace with real automation. |

## Using Skills

Skills are instruction files (`SKILL.md`) that coding agents discover and apply to perform tasks more accurately. Each skill lives in its own directory under `skills/`:

```text
skills/
└── <skill-name>/
    ├── SKILL.md          # Main skill instruction file
    └── references/       # Optional supporting assets
```

### With skills-npm (Recommended)

Install this package and symlink its skills automatically using [skills-npm](https://github.com/antfu/skills-npm):

```bash
npm install @abuxton/skills
npx skills-npm
```

To symlink skills after every install, add a `prepare` script to your `package.json`:

```json
{
  "scripts": {
    "prepare": "npx skills-npm"
  }
}
```

`skills-npm` symlinks skills to `skills/npm-<package-name>-<skill-name>` in your project. Add the following to your `.gitignore` to avoid committing these symlinks:

```gitignore
skills/npm-*
```

### Manual Usage

Copy a skill directory to your project's `skills/` folder:

```bash
cp -r node_modules/@abuxton/skills/skills/shields-badges ./skills/
```

Reference the skill in a GitHub Copilot prompt:

```text
Using the shields-badges skill, analyse this repository and add appropriate badges to README.md.
```

## Writing New Skills

Use the [writing-skills](skills/writing-skills/SKILL.md) skill to author a new skill, or follow this summary:

1. Create a directory under `skills/<skill-name>/`
2. Add a `SKILL.md` file with YAML frontmatter (`name`, `description`) and body sections (`## Role`, `## Workflow`, optional `## Notes`)
3. Add supporting reference assets to `skills/<skill-name>/references/` if needed
4. Add the skill to the `## Available Skills` table in `README.md` and in this file

### SKILL.md Template

```markdown
---
name: <skill-name>
description: '<One sentence describing what the skill does.>'
---

# <Skill Title>

<Brief introduction paragraph.>

## Role

You are an expert in ...

- Capability one
- Capability two

## Workflow

1. **Step one** — Description.
2. **Step two** — Description.

## Notes

- Edge case or tip.
```

## Publishing Skills via npm

This repository is published as `@abuxton/skills` on npm. The `skills/` directory is included in the published package via the `files` field in `package.json`.

Use the [publishing-npm](skills/publishing-npm/SKILL.md) skill for step-by-step guidance, or follow this summary:

1. Ensure `package.json` includes `"skills"` in the `files` array
2. Run `npm pack --dry-run` to verify skills are included in the tarball
3. Run `npm publish --access public` to publish

### Versioning

Use [Conventional Commits](https://www.conventionalcommits.org/) and semantic versioning:

- `feat(skills): add <skill-name> skill` → bump minor version
- `fix(skills/<skill-name>): correct workflow step` → bump patch version
- Breaking changes → bump major version

Bump the version with:

```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```
