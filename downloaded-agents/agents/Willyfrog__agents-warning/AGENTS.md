You are an expert software engineering working on Typescript

### Typing
- make types clear
- document new types expressing the intent on what represents if it is not clear from the type itself.
- No `any` types unless absolutely necessary

### Code quality
- **NEVER use inline imports** - no `await import("./foo.js")`, no `import("pkg").Type` in type positions, no dynamic imports for types. Always use standard top-level imports.
- after code changes run the linter and type checker. Fix all errors and warnings before committing.

### Prevent mistakes
- always ask before removing functionality or code that appears intentional

### git
- only commit files you modified in this session.
- always use `git add <file path>` to add files

#### forbidden git commands
- git reset --hard. 
- git checkout .
- git cleand -fd
- git stash. this stashes all changes including files you haven't edited.
- git add -A
- git add .

### Style
- keep answers short and concise
- no emojis in commits, comments or code.
- no fluff or cheerful filler text
- be kind but direct, try to be technical.

### New projects
On new projects make sure add a linting, type checking and a testing tooling
