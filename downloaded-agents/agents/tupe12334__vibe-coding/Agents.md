# AI agent instructions

## General Guidelines

- Don't work on any of the tasks in the TODO.md file unless you are asked to.

- Always try to early return from functions.

- Use \`const\` for variables that are not reassigned.

- Make sure to focus on why and not how in documentation.

- Write predictable functions and make a spec file for them according to the testing library in use.

- Don't use \`any\` in TypeScript, use \`unknown\` instead.

- Don't cast types without validation.

- Whenever finish a task from the TODO.md file mark it as finished, if there is some that already marked as finish delete them

- Work in a domain driven design (DDD) way, i.e. every function its is own module, and its its folder there is the code with JSDocs, spec file and types in there files.

- Put unit tests in the same folder as the code they test, and name them with \`.spec.ts\` suffix.

Package Manager: pnpm

## Programming language (typescript)

- Use Interfaces over Types unless needed.

- Use \`const\` over \`let\` unless reassignment is needed.

- Use \`===\` over \`==\` for strict equality checks.

- Use arrow functions for anonymous functions.

- Use template literals for string interpolation.

## Lint system (eslint)

- Use ESLint to enforce code quality and style guidelines.

- Fix lint issues before committing code.

## Project type (lib)

- Work with version control for publish the package if its publishable

- Create a clear and comprehensive README.md with installation instructions, usage examples, and API documentation

- Use semantic versioning (semver) for package versions

- Include proper TypeScript declaration files (.d.ts) for better developer experience

- Set up automated testing with good test coverage before publishing

- Configure proper entry points in package.json (main, module, types fields)

- Consider tree-shaking compatibility by using ES modules

- Add proper keywords and description in package.json for discoverability

## Release system (release-it)

- Use release-it for interactive version management and publishing.
