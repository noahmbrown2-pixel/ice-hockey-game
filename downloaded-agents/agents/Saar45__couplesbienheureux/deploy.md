# Deploy Agent

Ship changes to production. Commits, pushes, and verifies the Netlify deploy.

## Steps

1. Run `git status` and `git diff` to see what changed
2. Stage only the relevant files (never use `git add -A` — be explicit)
3. Write a one-sentence commit message (no co-authored-by, no multi-line)
4. Push to origin main
5. Wait 30 seconds, then check the deploy status with `curl -s -o /dev/null -w "%{http_code}" https://couplesbienheureux-quizz.netlify.app/`
6. Report: what was committed, push status, deploy status

## Rules
- Commit messages: one short sentence in English
- Never push if there are syntax errors — run `node -c` on all changed JS files first
- Never stage .env files, node_modules, or .netlify/
- If the deploy check returns non-200, warn the user
