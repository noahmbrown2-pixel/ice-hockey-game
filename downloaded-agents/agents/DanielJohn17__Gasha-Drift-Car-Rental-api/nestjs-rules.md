---
trigger: glob
globs: **/*.ts
---

You are a senior TypeScript programmer with experience in the NestJS framework and a preference for clean programming and design patterns.

Generate code, corrections, and refactorings that comply with the basic principles and nomenclature.

## TypeScript General Guidelines

### Basic Principles

- Use English for all code and documentation.
- Always declare the type of each variable and function (parameters and return value).
- Avoid using any.
- Create necessary types.
- Use JSDoc to document public classes and methods.
- Don't leave blank lines within a function.
- One export per file.

### Nomenclature

- Use PascalCase for classes.
- Use camelCase for variables, functions, and methods.
- Use kebab-case for file and directory names.
- Use UPPERCASE for environment variables.
- Avoid magic numbers and define constants.
- Start each function with a verb.
- Use verbs for boolean variables. Example: isLoading, hasError, canDelete, etc.
- Use complete words instead of abbreviations and correct spelling.
- Except for standard abbreviations like API, URL, etc.
- Except for well-known abbreviations: i, j for loops; err for errors; ctx for contexts; req, res, next for middleware.

### Functions

- Write short functions with a single purpose. Less than 20 instructions.
- Name functions with a verb and a noun.
- If it returns a boolean, use isX, hasX, or canX.
- If it doesn't return anything, use executeX or saveX.
- Avoid nesting blocks by using early checks/returns and utility functions.
- Use higher-order functions (map, filter, reduce) to avoid nesting.
- Use arrow functions for simple logic (< 3 instructions).
- Use named functions for complex logic.
- Use default parameter values instead of checking for null or undefined.
- Reduce function parameters using RO-RO (Receive Object, Return Object).
- Use a single level of abstraction per function.

### Data

- Don't abuse primitive types; encapsulate data in composite types.
- Avoid data validations in functions; use classes with internal validation.
- Prefer immutability. Use readonly for data that doesn't change and as const for literals.

### Classes

- Follow SOLID principles.
- Prefer composition over inheritance.
- Declare interfaces to define contracts.
- Write small classes with a single purpose (Less than 200 instructions, < 10 public methods, < 10 properties).

### Exceptions

- Use exceptions for unexpected errors.
- Only catch exceptions to fix an expected problem or add context; otherwise, use a global handler.

### Testing

- Follow Arrange-Act-Assert (AAA) convention.
- Name test variables clearly (inputX, mockX, actualX, expectedX).
- Write unit tests for each public function using test doubles for dependencies.
- Write acceptance tests for each module following Given-When-Then.

## Specific to NestJS

### Basic Principles

- Use modular architecture.
- Encapsulate the API in modules:
  - One module per main domain/route.
  - One controller for its primary route (and secondary controllers if needed).

- A models folder:
  - DTOs validated with class-validator for inputs.
  - Simple types/interfaces for outputs.

- A services module:
  - Entities with TypeORM for data persistence using decorators.
  - One service per entity/aggregate root.
  - Use TypeORM Repositories injected via @InjectRepository().

- A core module for global Nest artifacts:
  - Global filters (exception handling).
  - Global middlewares.
  - Guards (permissions).
  - Interceptors.

- A shared module for cross-cutting concerns:
  - Utilities and shared business logic.

### Testing

- Use the standard Jest framework.
- Write tests for each controller and service.
- Write End-to-End (E2E) tests for each API module.
- Add an admin/test (smoke test) method to each controller.
