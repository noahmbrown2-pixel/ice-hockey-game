---
title: agents
tags:
  - notes
authors: Matteo Saponati
year: 2026
connections:
---
** **
** **

```table-of-contents
title: 
style: nestedList # TOC style (nestedList|nestedOrderedList|inlineFirstLevel)
minLevel: 0 # Include headings from the specified level
maxLevel: 0 # Include headings up to the specified level
include: 
exclude: 
includeLinks: true # Make headings clickable
hideWhenEmpty: false # Hide TOC if no headings are found
debugInConsole: false # Print debug info in Obsidian console
```

---

We humans and the agents are very similar. My workflow can be understood and optimized the same way as the agents' workflow. I have a scratchpad to take notes, keep important information I can use at later times, and improve my productivity. They also do. I run experiments and discuss them in my mind, thinking about possible outcomes, and how to move forward. They also do. 

This is basically becoming machine learning on models that work in token space, optimizing in token space, compounding artifacts in token space. There is something really profound here. 
https://x.com/gdb/status/2019566641491963946

These are my rough notes on learning to use these new tools and collaborate with this new kind of intelligence. Like the agents themselves, these notes are a living document. The content and structure will evolve over time. Some of the content might be wrong/outmoded when you read this. 

It is not important to have fancy, complicated tools. Only the simple tools and methods can scale, and this is what really matters. The more opportunities we have, the more we should use them for searching in these complex, high-dimensional spaces. We are finally able to explore the cracks of matter, without having to assume ideal uniformly distributed gases in the vacuum, but rather explore all the small differences that make a difference.

But the landscapes of agents is moving forward so fast, and it is hard to keep up. So now, I am starting taking notes to get the state of the art for coding agents.

(additional but discardable information) I listen to this kinda stuff when I am writing these notes, it makes me feel in the flow: https://youtu.be/bgKMgvgMCiE?si=8M396WVMquvhmROt

# GENERAL GOOD PRACTICES WITH AGENTS

My opinionated list, based on personal research and hands-on testing. One important thing to remeber: **agents aren't good at everything**. Performance depends on training data, training methods, which capabilities fall inside or outside the RL tunnel, and (crucially) how you use them.

--

- **continual note taking**. While working, codex commits notes and helpers to my personal folder in our monorepo. After a few interactions with a new part of the codebase, these helpers tend to stabilize. I've never actually read these notes, their utility to me is purely the effect on codex's performance.
  (1) have one extra .md which serves as an index, and point codex to that index in agents.md. Keep all the notes stored in a folder.
  (1) ask codex to commits notes and helpers.
  (2) after a task, ask codex what went wrong, and ask to "improve the documentation and skill so that you can more deftly navigate this situation next time".
  
  to avoid agents making the same mistakes over and over: keep long lasting docs that remember decisions, workflows, principles, nuances, etc, then in the agents file, point to these docs.

- **do NOT overestimate AGENTS.md**: the AGENTS.md is difficult to maintain, just make it a detailed set of rules and do not waste context space: (1) Do not add detail on the codebase structure. The agent already has this information by just looking at the codebase. You are just wasting space, (2) do not add details on the commands in MakeFile, the agent already has this information, (3) we do not care about backward compatibility.
  
  The AGENTS.md file should be ~100 lines of code, just as a table of content for the rest.

- **when in doubt, ask a second time, ask if the model is sure about its rationale, ask if your prompt makes sense even if you are relatively sure it does.**  I find that it significantly helps to ask for confirmation of the rationale to the agent, if the agent is sure about what it's doing, etc. I have experienced several times that the agent can correct their paths if steered this way. They can recognize mistakes: I typically get them saying "The honest answer is: ..." and indeed reveal tricks/hacks they were using or important details/assumptions.

- **just try the same prompt multiple times, but only for the right kind of tasks**. These agents are stochastic machines, multiple trials can help finding a good minima. This is especially useful for ideation, exploration, prompt search, research synthesis, brittle one-shot questions, and generating alternative plans. I would not use this blindly for deterministic code changes: you often just create multiple slightly different patches that increase review burden. For implementation, prefer one clear agent loop with tests and review; use multiple attempts only when you are explicitly searching over approaches.

- **Mix agents/models**. Use generation outputs from one model (e.g., GPT-Pro when prompted with an experiment idea) as context for other models (e.g., query Claude/Grok to explain in detail the experiment idea, find possible problems, etc). I find this sometimes quite helpful and it can really improve the quality of the query. My intuition is that, since these models have different background knowledge and probability distribution learn on top of it, mixing them allows you to explore better the space.

- **use `/review`**: this has been optimized for providing prioritized, actionable feedback. It can also gather a decent amount of context that can be handed off to another agent/chat. It feels like it has a fresh context, so it is good to use it every one and then. One caveaut is that it can burn many tokens.

- **explore `/plan`**: Plan mode is designed for reading files and planning complex changes, where Codex will not make code edits until you switch back to code mode. There are known issues where the mode might not switch reliably (showing Plan mode but still acting like Code mode), requiring a toggle back and forth.

- **managing subagents**. Apparently codex is just good enough at using subagents. For now, just ask codex to run subagents and let it do the work, you only talk with the main codex for understanding the results. 
  "I just ask 5.3 to launch subagents in some new worktree and keep tabs on how they are doing, and it just does it. The hardest part for me is mentally keeping track of all the work and looking at all the results."

- **Do research with agents**. Research move fast, and it is impossible to stay up-to-date and check all the new techniques.
  (1) ask codex to do extensive due diligence: explore publications, slack channels, reads related discussions, fetches branches with different experiments.
  (2) summarize this in an extensive set of notes with links.
  (3) wire the experiments and make hyperparameter decisions.
  (4) ask for a second opinion when in doubt.
  (5) ask to do data analysis and check for outputs. 

# **USE AGENTS AS CODING TOOLS**.

This is, of course, what they are supposed to do.

Things change way faster now, and you should allow them to do so. The repository operates with minimal blocking merge gates. Pull requests are short-lived. Test flakes are often addressed with follow-up runs rather than blocking progress indefinitely. In a system where agent throughput far exceeds human attention, corrections are cheap, and waiting is expensive.

"The primary job of our engineering team became enabling the agents to do useful work.
breaking down larger goals into smaller building blocks (design, code, review, test, etc), prompting the agent to construct those blocks, and using them to unlock more complex tasks."

https://openai.com/index/harness-engineering/
https://developers.openai.com/codex
https://blog.langchain.com/improving-deep-agents-with-harness-engineering/
https://openai.com/index/unlocking-the-codex-harness/

--
## 1. High level points.

**Make the codebase legible for the agent**. 
Information should be organized such that the agents can easily find all the relevant bits and process them correctly. Overall, it is your assistant and it should know where to look for things and what are the constraints.

Push knowledge aggressively into the codebase so agents can always find what they need. The repo should answer five questions unambiguously: (1) what is the goal, (2) how to set up, (3) how to run tests and experiments, (4) where configs live, (5) what "done" means.

Give agents a defined working environment and PR workflow. Instruct agents to review their own changes locally, request targeted peer reviews (local and cloud), respond to feedback, and iterate until all reviewers pass. The loop should be self-driving.

Overall, https://bits.logic.inc/p/ai-is-forcing-us-to-write-good-code 

--

**Encode rules as hard constraints, not guidelines.** 
In human workflows, strict rules feel pedantic. For agents, they become force multipliers: encoded once, applied everywhere. Use fast, deterministic gates (e.g. `make ci`) so agents get immediate, unambiguous feedback. Define skill boundaries with crisp descriptions, since the description _is_ the classifier.

**Work depth-first**. 
Break down larger goals into smaller building blocks (design, code, review, test, etc), prompting the agent to construct those blocks, and using them to unlock more complex tasks. When something doesn't work, ask “what capability is missing, and how do we make it both legible and enforceable for the agent?”

**Exploration is fast, merge policies should update accordingly, and this process creates a lot of garbage.**
Full agent autonomy also introduces novel problems. Codex replicates patterns that already exist in the repository—even uneven or suboptimal ones. Over time, this inevitably leads to drift. Build a recurring cleaning up process + encode golden principles for minimal waste creation.

 **Do regular spring cleaning.**
 On a regular cadence, have a set of background Codex tasks that scan for deviations, update quality grades, and open targeted refactoring pull requests. Most of these can be reviewed in under a minute and automerged.
 
## 2. Agent failure modes.

Most agent problems are not mysterious. They are usually failures of context, task shape, feedback, or verification. I want to keep this as a checklist because otherwise I keep rediscovering the same problems.

--

**Context bloat.**
Symptom: the agent starts ignoring important instructions, repeats itself, or gets worse as the conversation gets longer. Cause: too much irrelevant context, long AGENTS.md files, pasted logs, outdated plans, or multiple competing instructions. Prevention: keep AGENTS.md short, route to docs, use focused skills, and summarize before long handoffs. Recovery prompt: "Before continuing, restate the active constraints and ignore any stale or irrelevant context. What information do you actually need?"

**Stale docs.**
Symptom: the agent follows commands, paths, configs, or architecture that used to exist. Cause: docs are not updated after code changes. Prevention: every behavior-changing code change gets a doc-delta pass; make docs-check real. Recovery prompt: "Cross-check the docs against the current tree and commands. List stale claims with evidence, then patch only the high-confidence fixes."

**Repeating the same mistake.**
Symptom: the agent gets corrected, then makes the same error in a later session. Cause: the lesson never became durable context. Prevention: put durable lessons in docs, skills, AGENTS.md, or memory depending on scope. Recovery prompt: "What should be changed in the repo instructions, docs, or skills so future agents avoid this exact mistake?"

**Overgrown AGENTS.md.**
Symptom: instructions become long, contradictory, hard to maintain, and expensive in context. Cause: using AGENTS.md as a manual instead of a router. Prevention: AGENTS.md should hold stable constraints and pointers, while docs hold details. Recovery prompt: "Reduce AGENTS.md to a short router. Move detailed policy into docs and keep only the links and hard constraints."

**Pattern drift.**
Symptom: each agent patch is locally reasonable, but the codebase slowly becomes uneven. Cause: agents copy nearby patterns, including bad ones. Prevention: encode invariants, run regular cleanup tasks, and keep architecture docs current. Recovery prompt: "Find repeated divergent patterns in this area. Propose the smallest unifying refactor and the invariant that should prevent recurrence."

**Bad patterns being replicated.**
Symptom: a flawed abstraction, test style, config pattern, or error handling style spreads because it already exists in the repo. Cause: agents optimize for local consistency without enough judgment. Prevention: maintain a small list of golden patterns and anti-patterns. Recovery prompt: "Do not assume the local pattern is correct. Compare it against the repo invariants and identify whether this is a pattern to follow or a smell to remove."

**No verification artifact.**
Symptom: the agent says the task is done but there is no command, test, metric, screenshot, or diff that supports it. Cause: the prompt asked for completion rather than evidence. Prevention: define "done" as a verifiable artifact. Recovery prompt: "What evidence proves this works? Run the cheapest meaningful verification and report the exact result. If you cannot run it, explain why."

**Too much autonomy on a vague task.**
Symptom: the agent edits too broadly, invents requirements, or solves the wrong problem very thoroughly. Cause: the task was under-specified and the agent kept moving anyway. Prevention: clarify goal, non-goals, allowed files, and validation before implementation. Recovery prompt: "Stop expanding scope. Restate the goal, non-goals, touched files, and validation plan before making more edits."

**Parallel agents without ownership boundaries.**
Symptom: conflicting patches, duplicated work, or hard-to-merge outputs. Cause: subagents were launched without disjoint responsibilities. Prevention: give each agent a clear write scope or make them read-only explorers. Recovery prompt: "Assign ownership boundaries. Convert overlapping agents into read-only reviewers or merge their findings before further edits."

**Research theater.**
Symptom: the agent produces long literature notes or experiment ideas but no decision. Cause: research was optimized for completeness rather than action. Prevention: every research task should end with a decision and next experiment. Recovery prompt: "Collapse this into a decision: run, reject, defer, or ask for more information. What is the next concrete experiment and why?"

## 3. How to start a research project

### 3.1. create the initial scaffolding
https://developers.openai.com/codex/prompting/

The repository structure, CI configuration, formatting rules, package manager setup, and application framework were all generated by Codex CLI using GPT-5. Even the AGENTS.md file that instructs agents how to operate in the repository was written by Codex.

The first three prompts to create the scaffolding. These should be changed depending on the needs.

```
We are in an empty git repo for a codex-friendly ML research project.

0) Choose a <project_name>:
- Use the repo folder name sanitized as a Python package (lowercase, underscores). If that's not valid, default to `ml_research`.
- Use this consistently in src layout, CLI module, and docs.

1) Create a minimal "project contract" that locks key defaults and reduces ambiguity:
- Create `docs/project_contract.md` (very short, bullet list) with decisions + defaults:
  - project_name, Python version range, license
  - package manager (uv) and why
  - CLI framework choice (typer recommended) and config approach (dataclass or pydantic; pick one)
  - run records standard (what files must be written per run)
  - baseline policy (how baselines are stored/updated; no silent overwrites)
  - data policy (no data/artifacts in git; where local data lives)
- Mark unknowns as TODOs rather than guessing.

2) Create an `AGENTS.md` at repo root that is a short router (~100 lines max) defining:
- Expected repo structure (src/, tests/, configs/, scripts/, docs/).
- The ONE canonical commands interface (Makefile) and package manager commands (uv).
- The check targets: format/lint/typecheck/test/docs-check + a single `make ci`.
- Rules: keep deps minimal; prefer reproducible experiments; never commit data/artifacts; every change that affects usage must update docs minimally.
- A "safe commands" list (ok to run without asking) and a "never run" list (destructive/publish).

Also add module-specific override support: mention `AGENTS.override.md` for subtrees.

3) Add a Makefile (pick Makefile, not justfile) exposing:
- `make setup`, `make format`, `make lint`, `make typecheck`, `make test`, `make docs-check`, `make ci`
- Add `make train-smoke` and `make eval-smoke` placeholders for later.

4) Add repo “boring files” that prevent ambiguity:
- `README.md` with: quickstart, `make setup`, `make ci`, how to run train/eval (placeholder now), where outputs go, where docs live.
- `LICENSE` (MIT by default unless the project contract says otherwise).
- `CONTRIBUTING.md` (how to run checks, expected PR hygiene, docs updates).
- `.github/pull_request_template.md` (what changed, how tested, docs touched).
- `CITATION.cff` (minimal, with placeholder authors if unknown).

5) Validate in an empty repo:
- Ensure docs/ exists with at least `docs/index.md` (can be tiny) that links to `project_contract.md`.
- Run whatever commands make sense to confirm Makefile targets don’t error even if some are no-ops.
- Print the resulting top-level tree.
```

```
Scaffold this repository into a modern, codex-friendly ML research Python project.

Requirements:
- Use a `src/` layout (importable package under `src/<project_name>/`).
- Create `pyproject.toml` with:
  - ruff (lint + format)
  - pytest
  - mypy (or pyright; pick one and wire it into `make typecheck`)
  - a clean dependency grouping strategy (dev/test/optional extras)
- Add `.gitignore` suitable for ML research (data/, runs/, checkpoints/, wandb/, .venv/, etc.).
- Add `.pre-commit-config.yaml` that runs the same checks as CI.
- Add GitHub Actions CI to run on push/PR: format/lint/typecheck/tests.
- Keep the default runtime deps minimal; heavy ML deps (torch, etc.) may be optional extras unless you need them for the example code.

Deliver a minimal runnable package with:
- `src/<project_name>/__init__.py`
- `src/<project_name>/cli.py` that has `train` and `eval` subcommands (can be stubbed but runnable)
- `tests/test_smoke.py` that passes.
  
Update the Makefile targets so they actually work:
- `setup` creates/uses a local venv (uv) and installs dev deps
- `format` runs ruff format
- `lint` runs ruff check
- `typecheck` runs mypy
- `test` runs pytest
- `docs-check` for now just validates docs/index links exist + required docs files exist (keep it minimal; expand later)
- `ci` runs all of the above

Finally: run `make ci` and fix anything until it passes.
```  

```
Now add the minimal ML research “application framework” on top of the scaffold.

Core requirements (keep it small but real):
1) Config + determinism:
- Use a config object (dataclass or pydantic—must match the project contract).
- Include a default config file in `configs/` (e.g., `configs/default.yaml`).
- Deterministic seeding (python/random/numpy; if torch is present, seed torch too).

2) Standardized run records (REQUIRED):
- Every `train` invocation must create a unique run directory under `runs/<run_id>/` (runs/ is gitignored).
- Run directory MUST include:
  - `config_resolved.yaml` (full resolved config)
  - `command.txt` (exact CLI invocation)
  - `git.txt` (commit SHA + "dirty" status; if git unavailable, write "unknown")
  - `env.json` (python version, platform, timestamp, optional cuda availability)
  - `deps.txt` (best-effort dependency snapshot; try `uv pip freeze`, fallback to `python -m pip freeze`)
  - `metrics.json` (train + eval metrics, even if tiny)
  - a saved artifact (e.g., `artifact.pkl` or `model.pt` depending on deps)

3) Logging:
- Structured logging to stdout and to `runs/<run_id>/train.log`.

4) Minimal Dataset/Model:
- Provide a placeholder Dataset + Model abstraction with a simple baseline (e.g., linear regression or tiny MLP).
- The entire `train` must run end-to-end in < 30 seconds on CPU.

5) Eval:
- `eval` must accept `--run-id`; if omitted, evaluate the latest run.
- It loads the saved artifact and prints a metric, also writing eval results into the run dir (update `metrics.json`).

6) Baseline protection (REQUIRED; no silent overwrites):
- Store tracked baselines under `baselines/` (committed to git), e.g. `baselines/default.json`.
- `eval` should compare current metrics to the baseline (if it exists) and print a short comparison.
- Add a CLI subcommand group `baseline` with:
  - `baseline show`
  - `baseline compare --run-id <id>` (or default latest)
  - `baseline update --run-id <id> --reason "<text>"`:
    - updates `baselines/default.json` ONLY via this command
    - appends an entry to `docs/decisions/baseline_updates.md` with date, old vs new, run-id, command, git SHA, and the provided reason.
- Make it hard for agents to overwrite baselines accidentally: do NOT write to baselines anywhere else.

7) Tests (fast):
- Validate `train` creates a run dir with the required files.
- Validate `eval` runs successfully on the produced run.
- Validate baseline update workflow:
  - baseline update requires a reason
  - baseline file changes + baseline_updates.md appended

8) Makefile:
- Implement `make train-smoke` and `make eval-smoke` using the CLI and default config.
- Keep `make ci` fast; if train-smoke is too slow for CI, keep it as a separate target but ensure tests cover the same behavior.

Finally:
- Run `make ci` again and ensure everything passes.
```

### 3.2. AGENTS.md, context management is key
https://developers.openai.com/codex/guides/agents-md/
This is one of the most important piece of information for orchestrating agents correctly. The important bits are: (1) context is a scarse resouce, (2) too much guidance becomes non-guidance, (3) a monolithic manual it's hard to verify and keep fresh.
  
Codex first reads a global file from codex home, then it walks from repo root and it concatenates root-to-leaf, where later files override earlier guidance. Codex automatically enumerates these files and injects them into the conversation; the model has been trained to closely adhere to these instructions. 
1. put general rules for the whole codebase in repo/AGENTS.md
2. add specialized structures near specialized subtrees using AGENTS.override.md. 

Important: Codex skips empty files and stops adding files once the combined size reaches the limit defined by project_doc_max_bytes (32 KiB by default). Raise the limit or split instructions across nested directories when you hit the cap. 

Run this to check if everything works: `codex --ask-for-approval never "Summarize the current instructions."`
  
### 3.3 the AGENTS.md maps to docs/

Pretty important: **give the agent a map, not a long instruction manual.**
  
The repository’s knowledge base lives in a structured **docs/** directory treated as the system of record. Inside this docs/ there are all the relevant information, structured as needed. The AGENTS.md file should be ~100 lines of code, just as a table of content for the rest. Docs are alive, they change in the course of reproducing the project. 

Typically you should have:
(1) `docs/architecture.md`: for letting the contributor know where each code is
https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html
(2) `docs/experiments.md`: how to add a new experiment
(3) `docs/datasets.md`: where dataset come from, versions, splits, etc
(4) `docs/metrics.md`: what metrics mean and how they are computed.
(4) `docs/decisions.md`: all the development decisions and why they were made, so that the agent can follow-up on these decisions.
(5) `docs/invariants.md`: requirements to keep the the codebase coherent without micromanaging and being prescriptive on what to do. Create strict boundaries and predictable structure. Enforce these rules with custom linters and structural tests, plus a small set of “taste invariants.” Maybe here the standard logbooks for experiments? How to create notes and runs/< id >/report.md for example

```
Create a minimal docs/ knowledge base as the system of record, but avoid over-scaffolding.

Constraints:
- Progressive disclosure: `docs/index.md` is the router (short TOC).
- Only create essential sections + templates. Do NOT create lots of placeholder content.
- Add `docs/doc_style.md` defining required front-matter fields for docs:
  - Status (Draft/Verified), Last reviewed date, Owner(s), Related code paths
- Keep docs factual; avoid project-specific guesses beyond what exists in code.

Create only these (minimal but real):
- `docs/index.md` (TOC + links)
- `docs/project_contract.md` (already exists; ensure it links back to index)
- `docs/architecture.md` (1–2 pages max; point to key code paths)
- `docs/runbooks/index.md` + `docs/runbooks/quickstart.md` (how to setup, run checks, train/eval)
- `docs/runbooks/codex.md` (how instructions are organized, how to run summaries, doc size cap note, how overrides work)
- `docs/decisions/index.md`
	- `docs/decisions/adr_template.md` (template only)
- `docs/decisions/baseline_updates.md` (append-only log; baseline update command writes here)
- `docs/exec-plans/index.md` + `docs/exec-plans/template.md` + directories `docs/exec-plans/active/` and `docs/exec-plans/completed/` (include a tiny README in each dir so it’s tracked)
- `docs/references/index.md`

Update `AGENTS.md` minimally:
- Add ONE line pointing to `docs/index.md` and ONE line pointing to the baseline policy location.

Add a real `make docs-check`:
- Verify `docs/index.md` links point to existing files.
- Verify required doc files exist.
- Verify `docs/decisions/baseline_updates.md` exists.
- List the docs tree.

Finally:
- Run `make docs-check` and `make ci`.
```

Always use the agent to maintain the docs, asking if there is anything that should be changed and why. These documentations should be alive and dynamic. Plus, use a specific doc-gardening agent that removes useless doc.

```
Doc gardening sweep (repo-wide).

Goal: find and fix documentation drift without inventing new docs.

Steps:
1) Scan docs/ for staleness signals:
   - docs mention files/modules that don’t exist
   - commands don’t match Makefile/CLI
   - baseline policy conflicts with current baseline workflow
2) Cross-check against current tree and the last 50 commits if available.
3) Produce a prioritized list of doc issues (high/med/low) with evidence.
4) Apply fixes for high/medium issues directly in docs/.
5) For judgment calls: create an ADR stub under docs/decisions/ or add a TODO in the relevant doc (don’t guess).

Finally:
- run `make docs-check` and `make ci` if available
- write a short report under `docs/exec-plans/completed/doc_gardening_report.md` summarizing:
  - what changed
  - what remains open
  - why this improves legibility for agents
```
  
### 3.4. use skills
A skill is a folder containing `SKILL.md` (required) plus optional `scripts/`, `references/`, and `assets/` folders. Repo skills live under .agents/skills (scanned from current dir up to repo root). 
https://developers.openai.com/codex/skills
https://www.philschmid.de/agent-skills-tips

1. **capability skills**: helping the agent do things the base model can't do consistently.
2. **preference skills**: encoding your specific workflow.
  
You can directly invoce a skill with `< >` or implicitly ask codex to look for matching descriptions. 
**The most important bit is the description**. The description is the trigger mechanism. Include both _what_ the skill does and _when_ to use it:
1. use when
2. don't use when
3. input/output
4. negative examples.
Keep one job per skill, prefer instructions over scripts, imperative steps with explicit inputs/outputs, and test prompts against the description.
Keep the skill lean (< 500 lines) so that you blow context unecessarily.

It is also important to curate and manage skill over time:
1. **test the skill with multiple prompt (and edge cases) when creating**.
2. **test the models with and without skill**: if the model is good at the task without skill, remove it.
  
Create new skills, make them robust, define how you want the output to be. Typical skills you want to have:
- `ml-exec-plan` – create/refresh an execution plan in `docs/exec-plans/active/…`
- `ml-new-experiment` – scaffold a new experiment (config + code stub + docs entry + smoke run)
- `ml-results-snapshot` – run eval, capture metrics/artifacts, update results docs (and never silently overwrite baselines).
- `ml-docs-delta` – after any code change, update the system-of-record docs and explain why
- `ml-docs-gardener` – periodic sweep for doc drift (high/med/low priority list + fixes + report)

How to structure your new skill with a prompt

```
Create a minimal, high-leverage set of Codex Agent Skills for this ML research repository.

Context / constraints:
- Skills must be saved under `.agents/skills/` (repo-scoped).
- Each skill is a folder containing a required `SKILL.md` with YAML frontmatter `name` and `description`.
- Keep each `SKILL.md` concise and action-oriented. Do NOT duplicate large policy text inside skills.
- This repository uses a docs-as-system-of-record approach:
  - AGENTS.md is a short map (~100 lines).
  - docs/ contains the actual source of truth (runbooks, research specs, ADRs, exec plans).
- Therefore: skills should primarily (1) point to the relevant docs pages, (2) enforce workflows, and (3) produce consistent artifacts.

Deliverables:
1) Create these 5 skills (exact folder names and skill names):
   - `.agents/skills/ml-exec-plan/SKILL.md`
   - `.agents/skills/ml-new-experiment/SKILL.md`
   - `.agents/skills/ml-results-snapshot/SKILL.md`
   - `.agents/skills/ml-docs-delta/SKILL.md`
   - `.agents/skills/ml-docs-gardener/SKILL.md`

2) For each SKILL.md:
   - Include YAML frontmatter:
     ---
     name: <skill-name>
     description: <a crisp description that explains exactly when the skill SHOULD and SHOULD NOT trigger>
     ---
   - Then include these sections (keep each section short but concrete):
     - “When to use this”
     - “When NOT to use this”
     - “Inputs you must gather”
     - “Files to consult first” (link to relevant `docs/...` pages; do not restate their contents)
     - “Steps” (numbered, executable workflow; prefer deterministic steps like running make targets)
     - “Definition of done” (bullet list of verifiable conditions)
     - “Failure modes & escalation” (when to stop guessing and record an ADR / add tech debt item)

3) Skill-specific behavior requirements:

   A) ml-exec-plan
   - Purpose: create an execution plan artifact for non-trivial work.
   - Output: a new file in `docs/exec-plans/active/` with a consistent naming scheme (date + short slug).
   - Must include: goal, scope, non-goals, risks, validation plan, and a running decision log section.
   - Must link to any relevant existing ADRs or create an ADR stub if needed.

   B) ml-new-experiment
   - Purpose: add a new experiment in a repeatable way.
   - Must:
     - create a new config file under `configs/` (or the repo’s config area)
     - add a new experiment module / entry point under `src/`
     - add/extend a minimal test that ensures the experiment code imports and a dry-run works
     - add a docs entry under the experiment registry doc in `docs/` (create the registry doc if missing)
   - Must run the lightest possible end-to-end check (e.g., a “dry run” or 1-epoch CPU run) and record where outputs go.
   - Must never add large datasets to git; should reference docs runbook for data handling.

   C) ml-results-snapshot
   - Purpose: produce a reproducible “result snapshot” (metrics + artifacts) and update docs.
   - Must:
     - run eval and capture metrics to a stable location (gitignored artifact dir, but docs updated)
     - update a results table or markdown section in docs with date, command, config reference, and metric values
     - avoid silently overwriting prior results; if a baseline changes, record why + link to code change
   - Must include a “compare to baseline” step where possible.

   D) ml-docs-delta
   - Purpose: keep docs accurate after code changes.
   - Must:
     - inspect current git diff (or latest commits)
     - map each change to the doc page(s) that should reflect it
     - update docs minimally and precisely
     - explain why docs were/weren’t changed
   - Must run `make docs-check` if present, otherwise do basic link/file existence checks.

   E) ml-docs-gardener
   - Purpose: periodic repo-wide documentation drift cleanup.
   - Must:
     - scan docs/ for stale claims (commands that no longer work, paths that no longer exist, contradicted architecture)
     - cross-check against current tree and recent commit history
     - produce a prioritized issue list (high/med/low) with evidence
     - apply fixes for high/medium items; for judgment calls create ADR stubs or add tech-debt entries
     - write a gardening report under `docs/exec-plans/completed/` summarizing what changed and what remains.

4) Integrate into the docs knowledge base:
- Add a short `docs/references/skills.md` that lists these skills, what they do, and how to invoke them (e.g., `$ml-docs-delta`).
- Update `docs/index.md` to link to `docs/references/skills.md`.
- If AGENTS.md exists, add ONE line pointing to `docs/references/skills.md` (do not bloat AGENTS.md).

5) Verification:
- Print the resulting `.agents/skills/` tree.
- Confirm each SKILL.md has valid YAML frontmatter with `name` and `description`.
- (If available in this environment) run `/skills` or otherwise confirm the skills are discoverable.

Make the changes directly in the repo.
```

Periodically, check for opportunities of new skills clean up old/unused ones.

```
Skills Management Sweep (short, repo-only).

Goal:
- Propose new high-leverage skills from repeated work patterns.
- Detect unused/redundant skills and deprecate/merge them safely.

Constraint:
- Use ONLY repo evidence (no chat hallucination). If “recent chat sessions” aren’t accessible, approximate via:
  - docs/exec-plans/{active,completed}/
  - docs/decisions/*
  - git log/diffs
  - ripgrep for `$ml-` (explicit skill invocations) and recurring file-change patterns

Steps:
1) Inventory skills
- List `.agents/skills/*/SKILL.md`.
- Create/update `docs/references/skills_inventory.md` (1 table: skill, purpose, main outputs, consult-first docs).

2) Usage check (evidence-based)
- Use `git log -n 200 --name-only` + ripgrep to find signs each skill was used.
- Create/update `docs/references/skills_usage.md` with 3 buckets: Used / Weak evidence / No evidence (include 1–2 concrete evidence lines each).

3) New skill opportunities
- From exec plans + recurring diffs, identify repeated tasks with clear inputs/outputs.
- For each candidate: 2–3 bullets: “When to use”, “Produces”, “Verifies with (make targets)”.
- Implement ONLY candidates backed by evidence (else add a “skill idea” note in docs and stop).

4) Prune/merge safely
- For unused/overlapping skills: don’t delete; mark DEPRECATED at top of SKILL.md with reason + replacement + last reviewed date.
- If a skill is too broad: narrow its `description` decision boundary so it won’t mis-trigger.

5) Wire a fast check
- Add `make skills-check`:
  - verify each SKILL.md has YAML frontmatter with `name` and `description`
  - verify required sections exist (When to use/NOT, Inputs, Steps, DoD, Failure modes)
- Include `skills-check` in `make ci`.

6) Write a short audit report
- Create `docs/exec-plans/completed/skills_audit_<YYYY-MM-DD>.md` with:
  - evidence examined
  - skills added/updated/deprecated (why)
  - verification run results: `make skills-check`, `make docs-check`, `make ci`

Finally:
- Print `.agents/skills/` tree and run: `make skills-check && make docs-check && make ci`.
```

This is an example of a skill:

```
name: run-experiment
description: |
  Use when: you need to add or run a training/eval experiment in this repo using configs/.
  Don’t use when: you’re just editing docs or making a trivial code change.
  Inputs: config path, expected compute budget, run name.
  Outputs: run directory with manifest + metrics; short run summary; links/paths to artifacts.
---

## Safety / cost gates
- If expected cost > $X or GPU hours > Y, ask for confirmation before launching.
- Never modify production datasets or shared buckets without explicit confirmation.

## Steps
1) Validate config
   - Run: `python -m project.validate_config --config <...>`
   - Expected: exits 0; prints resolved config.

2) Run smoke (cheap)
   - Run: `make smoke` OR `python -m project.train --config <...> --max_steps 5`
   - Expected: training loop works; metrics file created.

3) Launch full run (only after confirmation if expensive)
   - Command: `python -m project.train --config <...> --run_name <...>`
   - Ensure run manifest includes git SHA and diff hash.

4) Summarize results
   - Run: `python -m project.summarize_run runs/<id>`
   - Output: markdown summary + key plots saved under runs/<id>/artifacts/

## Definition of done
- Run completed successfully or failed with a clear error + next actions.
- Summary produced with metrics + artifact paths.

## Common failure modes
- CUDA OOM → suggest batch size / grad checkpointing; log config diff
- Data not found → check docs/datasets.md and env vars
```

## 4. How to add an agent to an existing codebase.

These are a series of prompts I have used to convert a codebase into an agent-based codebase. These are a bit outdated, but might still be useful.

```
Add a Makefile to this repo for the reproducibility and testing following the style of this Makefile: SRC = src/
  SCRIPTS = scripts/
  TESTS = tests/
  DOCS = docs/
  ALL_CODE = ${SRC} ${SCRIPTS} ${TESTS}

  format:
  	uvx ruff check ${ALL_CODE} --select I --fix
  	uvx ruff format ${ALL_CODE}
  lint:
  	uvx ruff check ${ALL_CODE}
  docs-lint:
  	uvx pymarkdownlnt scan *.md
  	uvx pymarkdownlnt scan --recurse ${ALL_CODE} ${DOCS}
  test:
  	uv run pytest ${TESTS} -m "not slow"
  test-full:
  	uv run pytest ${TESTS}
  static:
  	uv run mypy ${SRC} ${SCRIPTS}
  prepare: format lint docs-lint static test
  prepare-full: format lint docs-lint static test-full

  clean:
  	rm -rf .mypy_cache .pytest_cache .ruff_cache
```

```
DO the same for an AGENTS.md for codex. Make it professional, following the style of this one: # AGENTS.md

  Guidelines for AI agents working on this codebase.

  ## Development Workflow

  - Run `make prepare` after any code edits; it handles formatting, linting, static type-checking, and tests.
  - Restate the planned steps and confirm expectations for complex requests so reviewers have a clear receipt of decisions and next actions.
  - Use `uv run python ...` for scripts.
  - Manage dependencies with `uv add` / `uv remove`; don't edit `pyproject.toml` directly when adding dependencies.
  - Important design decisions should be tracked in `docs/decision-log.md`

  ## Approvals & Escalations

  - Request escalated permissions when a command needs filesystem access outside the workspace, writes to protected locations, or requires network access.
  - If sandboxed commands fail due to permissions or connectivity, rerun them with approval instead of hacking around the restriction.
  - Include a one-line justification when requesting approval so reviewers understand the need.
  - Treat destructive operations (e.g., `rm`, `git reset --hard`) as opt-in only when the user explicitly asks for them.

  ## Code Quality & Style

  - Favor maintainable, easy-to-read code even if that drops niche backward compatibility; call out intentional behavior changes.
  - Refactor aggressively to remove dead code and simplify APIs; once code is no longer used, delete it.
  - Keep attribute access shallow; expose necessary data locally.

  ## Testing

  - Mirror every bug fix or new feature with a failing test first and keep golden files or fixtures as small as possible.
  - Keep the `tests/` directory structure aligned with `src/pensieve/`; e.g., `src/pensieve/model/config.py` pairs with `tests/pensieve/model/test_config.py`.
  - Keep tests deterministic by seeding randomness (e.g., `torch.manual_seed`, `numpy.random.seed`) when necessary.
  - Avoid mocking and patching unless absolutely necessary; prefer dependency injection instead.
  - Prefer unit-level coverage where possible; use integration test suites for end-to-end coverage only when necessary.

  ## Error Handling

  - Fail fast with explicit, informative errors instead of silent fallbacks.
  - When user input is invalid, raise clear exceptions.

  ## Workflow Reminders

  - Deliver exactly what was requested and ask clarifying questions when uncertain.
  - Surface missing context proactively - pause to request any blocking information before acting.
  - Avoid creating separate documentation files unless the user explicitly asks for them; prefer docstrings and comments.
```


```
Create a minimal docs/ knowledge base as the system of record, but avoid over-scaffolding.

Constraints:
- Progressive disclosure: `docs/index.md` is the router (short TOC).
- Only create essential sections + templates. Do NOT create lots of placeholder content.
- Add `docs/doc_style.md` defining required front-matter fields for docs:
  - Status (Draft/Verified), Last reviewed date, Owner(s), Related code paths
- Keep docs factual; avoid project-specific guesses beyond what exists in code.

Create only these (minimal but real):
- `docs/index.md` (TOC + links)
- `docs/architecture.md` (1–2 pages max; point to key code paths)
- `docs/runbooks/index.md` + `docs/runbooks/quickstart.md`
- `docs/runbooks/codex.md` (how instructions are organized, how to run summaries, doc size cap note, how overrides work)
- `docs/decisions/index.md`
	- `docs/decisions/adr_template.md` (template only)
- `docs/decisions/baseline_updates.md` (append-only log; baseline update command writes here)
- `docs/references/index.md`

Update `AGENTS.md` minimally:
- Add ONE line pointing to `docs/index.md` and ONE line pointing to the baseline policy location.

Add a real `make docs-check`:
- Verify `docs/index.md` links point to existing files.
- Verify required doc files exist.
- Verify `docs/decisions/baseline_updates.md` exists.
- List the docs tree.
```


# **USE MODELS AS RESEARCH ASSISTANTS**.

This is a personally interesting use case for agents/models. It is quite cool to see what these models can do, and how helpful they can be.

--

## 1. Literature reviews and studying papers.

Do literature review and understanding papers, methods. The typical prompt follows this structure: (1) role, tell the model who to “be”, (2) context, what exactly are you trying to learn or solve, (3) format, ask for it in the format that works best for how you learn, (4) depth, say how deep you want to go.

A few empirical bits: 
1. As of May 2026, I find Grok better at localized research review and being critical over ideas and project proposals.
2. I typically query GPT-Pro with clear prompt for the research analysis you want to do. Then I use Claude/Grok to ask clarifications/more details on specific parts of the GPT output. I empirically find this to work quite well, and it does not inflate the conversation with GPT. 

--

These are the standard prompts I use for querying:

```
You are an expert ML researcher who knows how to find the important bits of information within a research paper. I am studying the literature in ----------- and I want to understand the fundamental problems that need to be solved.

First, distill the core arguments of this paper, understand the real motivations, and how this paper is positioned compared to previous work

Next, provide a detailed analysis of the methodology and what their unique approach is. If possible, make a table with their methods used, stating what is a new, less common, or common approach is compared with previous art.

Do your analysis in depth, focusing on what really matters.
```

```
Ok, I. understand. Following your analysis, create a detailed explanation in plain-text of ------------- and answers the following questions: question_1, question_2, question_3
```
  
## 2. Write clean, concise scientific reports.

Things are moving increasingly fast in this crazy world. Our capacity to explore spaces (idea space, experiment space, parameter space, design space, ...) is increasing every year. Thus, our approach to search must adapt to the new tools that we have. 

This is my attempt to automate writing concise scientific reports. I create a main codebase for the project, then I follow this structure:

- The main branch is the source of truth, I start every hypothesis branch from here.
- For each experiment, I create a new worktree and branch where I ran the experiments and do the code changes that I want to test.
- Within this new branch, I create a new hypothesis-n/ path inside docs/ where I keep:
  a) a simple markdown file where I describe the hypothesis and the set of experiments I want to run.
  b) all the relevant artifacts from the experiments, together with .md files with notes from me or from my agents.
- I write any additional information in another external markdown file. 
- I provide all this context to the agent, and I prompt it to write a clear concise scientific report following this prompt.

--

This is the prompt that I use:

```
I am working on a research project structured around weekly iteration cycles, with at least one meaningful, decision-grade experimental iteration per week. Each iteration is defined by a hypothesis or goal and a corresponding set of experiments.

For each report, I will provide:

- Documentation on the current hypothesis
- Annotated experimental results
- Plots for the results.
- Additional project context
- Previous scientific reports (where available)
  
Your task is to write a scientific report covering the current hypothesis and experimental results. Follow these design principles when writing the report:

- First, it must highlight the hypothesis for the experiments.
- Second, it must include a TL;DR or “key takeaway” paragraph at the top and a  decision on the next step: continue, pivot, or stop.
- Third, it must list each set of experiments with: (1) goal/question, (2) key result/finding, (3) decision/conclusion. Make it clear and concise, and refer to the Methodology section below for all the details. Include the plots provided.
- Finally, it must include all the additional information about the experimental setup and all the supporting details.
```

Then just let GPT-Pro or whatever good LLM cook for a while and give you the result.

## 3. Understand a codebase from scratch.

I essentially do not read codebases anymore (at least at the first encounter). I query the model with the github link or, if possible, I download the entire codebase in .zip and give it the agent directly (usually better). 

--

This is one type of prompt I use: 

```
You are a codebase-explainer agent. Your job is to help a new Research Scientist understand this repository well enough to run experiments, modify models, and debug failures.

HARD RULES
- No hallucinations: every non-trivial claim must be grounded with references:
  - include file path(s) + symbol name(s) + line ranges (or exact snippets) that justify the claim.
  - if you’re uncertain, say “Unknown” and propose the exact file/command to verify.

WHAT TO PRODUCE (deliverables)
1) “Codebase in 15 minutes” (skim-friendly)
   - What this repo does, in 8–12 bullets.
   - The 3–5 most important entry points (CLI, scripts, notebooks, services).
   - The standard workflow to run an experiment end-to-end.
   - Each bullet must cite paths + line ranges.

2) Architecture map (detailed but understandable)
   - A component diagram (Mermaid) showing major packages/modules and how data flows.
   - For each component: purpose, key classes/functions, inputs/outputs, where configs live.
   - Call out boundaries: training loop, models, datasets, evaluation, logging, orchestration.
   - Cite paths + line ranges for each component mapping.

3) “How do I run things?”
   - Exact commands for: install/setup, unit tests, lint/format, a minimal training run, evaluation, and reproduction of a known run (if supported).
   - Identify the package manager / environment system (e.g., uv/poetry/pip/conda), and where dependencies are declared.
   - Identify where seeds, determinism flags, and hardware settings (GPU/CPU) are configured.
   - Cite paths + line ranges for commands/config.

4) Key workflows (explain like I’m new to the repo)
   - Training: from config → dataloader → model → loss → optimizer → checkpoint → metrics.
   - Evaluation: what metrics, where computed, how aggregated, where results saved.
   - Experiment tracking: logging framework, run directory structure, artifacts produced.
   - For each workflow, include a step-by-step trace with pointers to the exact functions called.

5) Glossary + “Where to change what”
   - Glossary of repo-specific terms (dataset names, abbreviations, “run”, “trial”, etc).
   - A table: “If you want to X, edit Y” (e.g., add dataset, add model, change scheduler, add metric).
   - Cite paths + symbols.

6) Risks / footguns / debugging guide
   - Top 10 failure modes you anticipate in this repo (mismatched shapes, config gotchas, device issues, caching, mixed precision, etc.).
   - For each: symptoms, likely cause, where to look first, and a suggested debug command/print.
   - Cite the relevant code areas.

PROCESS (how you should work)
A) First scan:
   - Print a compact tree of the repo (top-level + src/ + key folders).
   - Identify languages/frameworks (PyTorch/JAX/etc), configs (yaml/json/hydra/gin), and orchestration.
B) Then deep dive:
   - Locate: main entry points, config system, dataset pipeline, model definitions, training loop, eval loop, logging/tracking, checkpointing.
   - Trace one “golden path” execution flow from CLI/script to training step; include the call chain.
C) Output formatting:
   - Use headings and short paragraphs; keep it readable.
   - Every section must include citations (paths + line ranges).

START NOW
1) Show the repo tree and list the likely entry points.
2) Produce the six deliverables above in one response, in this order.
3) End with: “Open questions” + “Suggested reading order (90 minutes)” + “Next 5 questions you recommend I ask”.
```

## 4. Automatic ML research.
https://x.com/KarelDoostrlnck/status/2019477361557926281

There is so much to test here. I am actively exploring the possible paths, and this is a whole line of research by itself.

These systems have enormous potentials. The more you remove yourself from the loop, the better they can potentially get. The problem is: how to effectively remove yourself from the loop.

These are my miscellaneous notes on my experiments with automatic research and what I crawl from other people on the web and whatnot.

**The mantra**: it is possible to automatically discover complete ML algorithms just using basic mathematical operations as building blocks + evolutionary algorithms.
https://arxiv.org/abs/2003.03384

--
### 4.1. Good practices

- Compounding knowledge is one of the most important bit. Compounding knowledge is like finding self-constraints to guide search, and if done correctly, the agent can end up searching the right thing.
- Agents should write plans for next steps, executed the plans, and use the result to choose which plans to pursue next.
- Test swarm of agents with different roles, not only one agent.

One possible prompt to create an AGENTS.md tailored to working on a codebase to run automatic research:

```
The codebase is meant for research agent to run experiments autonomously. However, I also want to use coding agents as assistant for improving the codebase, NOT as the research agent. To do so, I want to have a clear AGENTS.md file that is used by the coding assistant agent, and NOT by the research agent. 
  
Write the AGENTS.md making use that the research agent does not use it or adds it into context. Write the AGENTS.md following these instructions:
  
Guidelines for AI agents working on this codebase.

## Development Workflow
- Run `make prepare` after any code edits; it handles formatting, linting, static type-checking, and tests.
- Restate the planned steps and confirm expectations for complex requests so reviewers have a clear receipt of decisions and next actions.
- Use `uv run python ...` for scripts.
- Manage dependencies with `uv add` / `uv remove`; don't edit `pyproject.toml` directly when adding dependencies.

## Approvals & Escalations
- Request escalated permissions when a command needs filesystem access outside the workspace, writes to protected locations, or requires network access.
- If sandboxed commands fail due to permissions or connectivity, rerun them with approval instead of hacking around the restriction.
- Include a one-line justification when requesting approval so reviewers understand the need.
- Treat destructive operations (e.g., `rm`, `git reset --hard`) as opt-in only when the user explicitly asks for them.

## Code Quality & Style

- Favor maintainable, easy-to-read code even if that drops niche backward compatibility; call out intentional behavior changes.
- Refactor aggressively to remove dead code and simplify APIs; once code is no longer used, delete it.
- Keep attribute access shallow; expose necessary data locally.

## Testing

- Mirror every bug fix or new feature with a failing test first and keep golden files or fixtures as small as possible.
- Keep the `tests/` directory structure aligned with the rest of the codebase.
- Keep tests deterministic by seeding randomness (e.g., `torch.manual_seed`, `numpy.random.seed`) when necessary.
- Avoid mocking and patching unless absolutely necessary; prefer dependency injection instead.
- Prefer unit-level coverage where possible; use integration test suites for end-to-end coverage only when necessary.

## Error Handling

- Fail fast with explicit, informative errors instead of silent fallbacks.
- When user input is invalid, raise clear exceptions.

## Workflow Reminders

- Deliver exactly what was requested and ask clarifying questions when uncertain.
- Surface missing context proactively - pause to request any blocking information before acting.
- Avoid creating separate documentation files unless the user explicitly asks for them; prefer docstrings and comments.
```

### 4.2. Recipes

**karpathy's recipe**
https://github.com/karpathy/autoresearch

- one file for preparing constants, data loading, tokenization, and runtime utilities. + the fixed metric you are using as reference for the agents. This is good because it gives the agent quite some scaffolding and structure.
- one file that the agents train. Contains the full GPT model, optimizer (Muon + AdamW), and training loop. Everything is fair game: architecture, hyperparameters, optimizer, batch size, etc. This file is edited and iterated on by the agent.
- `program.md` baseline instructions for one agent. Point your agent here and let it go. This file is edited and iterated on by the human. This is essentially a lightweight skill.

**deepmind's recipe**
https://deepmind.google/blog/accelerating-mathematical-and-scientific-discovery-with-gemini-deep-think/



# CODING AGENTS.

## **codex**.

Codex just works really well. It can work for hours, and it has a first-class compaction support. As of today, codex can use skills (reusable, versioned instructions) + shell tool (OpenAI hosted container with controlled internet access for the agent to install dependencies, run scripts, and write outputs) and compaction.

### memory and persistent memory

- **AGENTS.md = Manual memory**: When you ask codex to remember something for the future, for example if you want codex to do the same thing in the future when you don't specify it ("please re-apply this patch every time I ask you X and I don't specify further"). It will add it on the AGENTS.md.
- **Auto memory**:   there are a few files, one of this is MEMORY.md where it autosaves lessons about preferences, tasks, workflows, etc. You can create a skill to do that, so that you get durable agent behavior across sessions. keep it better over time.

## **cluade code**

not explored yet.

---

# HOW TO CURATE THESE NOTES.

I write these notes freely, without worrying about style, grammar, correctness, or structure. That's just what works for me. If I start thinking about those things, my "optimizer mode" kicks in, I get caught up curating and refining, and end up spending way more time on it than I should.

Therefore, I tested a couple of ideas and prompts on how to automate this with an agent. As you might have noticed, after every first heading level (H1) there is a freeform text, and then a series of H2-H3-etc with more curated information (hopefully). This is there the agent works. I use the ATX headers structure to guide the agent.

```
These are my personal notes for collecting good practices on how to use LLM agents in different settings. These notes are a living document that I keep updating while discovering new good practices and building experience with LLM agents. These notes are not supposed to be perfectly lean.

The notes follow a ATX-style headings. I keep personal notes between a Heading (one #) or a Heading 2 (two #) and the next "--". Follow these rules:
1. Do NOT consider the text between a Heading or Heading 2 and the next "--".
2. Do not consider the code parts of the text.
   
Do these steps in order:
1. Provide a detailed analysis of the current status of the notes.
2. Highlight where I could increase clarity.
3. Highlight where I could add relevant information.
```
