---
name: create-bruno
description: 'Generate Bruno requests for one or many APIs in an existing Bruno collection. Use when asked to create Bruno request files, scaffold frontend-facing request examples, inspect a Bruno collection structure, reuse existing Bruno variables, or output requests in YAML/OpenCollection or legacy BRU format.'
argument-hint: 'API or endpoint list to generate Bruno requests for'
---

# Create Bruno Requests

## When to Use
- Generate Bruno request files for one API or multiple APIs the user names
- Add requests into an existing Bruno collection without breaking the collection's current structure
- Reverse-engineer how a project organizes Bruno requests before adding new ones
- Produce request examples for frontend work where the goal is to show URL, params, query, and body fields rather than provide real data

## Hard Stop Rule

If any phase below fails, report the exact failure to the user and stop immediately. Do not guess, do not continue to later phases, and do not create partial output after an unresolved error.

## Success Criteria
- The Bruno collection directory is confirmed and remembered for future runs when memory is available
- The existing collection structure has been inspected before creating anything
- The active request format is identified correctly: YAML/OpenCollection or BRU
- New requests follow the project's current naming, folder, sequence, and variable conventions
- Generated requests contain correct method, URL, path params, query params, and request body shape
- Requests are written directly into the collection by default once the target location is known
- Example values are fake, placeholder, or empty as appropriate; the goal is schema visibility, not real data

## Phase 1 - Locate the Collection

1. Ask the user for the Bruno collection directory if it is not already known for this workspace.
2. When the user provides the path, verify that it exists and is a Bruno collection.
3. Remember that path for later runs using workspace-scoped memory when the environment supports it.
4. Before moving on, confirm whether the directory is the collection root or a nested folder inside the collection.

### Validation Rules
- Treat the directory as a YAML/OpenCollection root if it contains `opencollection.yml`
- Treat the directory as a BRU collection root if it contains `bruno.json`
- If neither marker exists, report that the path is not a Bruno collection root and stop
- If the path cannot be read, report the filesystem error and stop

## Phase 2 - Learn the Existing Collection Structure

Inspect the collection before generating requests.

1. Map how folders are organized around domains, resources, flows, or screens.
2. Inspect how request files are named.
3. Inspect how folders are named.
4. Determine whether the collection uses YAML/OpenCollection files or legacy BRU files.
5. Inspect several neighboring requests in the target area to learn:
	- naming patterns
	- file extensions
	- sequence numbering conventions
	- folder metadata files such as `folder.yml` or `folder.bru`
	- collection-level or folder-level variable usage
	- auth inheritance and header conventions

### Structural Checks
- Prefer matching the existing folder layout instead of introducing a new taxonomy
- Reuse the dominant naming convention already present in the collection
- If the collection mixes YAML and BRU, report the ambiguity and stop unless one format is clearly dominant in the target area
- If the target insertion area cannot be determined from the current structure, report that and stop

## Phase 2.5 - Load the Writing Reference

Read the format-specific reference before writing requests.

- For YAML/OpenCollection requests, read [bruno-instructions.md](./references/bruno-instructions.md)
- For BRU requests, read [bruno-instructions-bru.md](./references/bruno-instructions-bru.md)

Apply the reference strictly. In particular:
- Use the correct top-level structure for the detected format
- Preserve the project's current variable interpolation style such as `{{baseUrl}}`, inherited auth, shared headers, or folder-level settings
- Do not invent collection metadata formats that conflict with the reference or the existing collection

## Phase 3 - Generate Requests for the User's APIs

Create one Bruno request per API the user asks for unless the collection already uses a different grouping pattern in the target area.

For each requested API:

1. Determine the HTTP method and endpoint path.
2. If the user request is incomplete, inspect available backend code or API specs such as OpenAPI, controllers, DTOs, validators, or route definitions to infer the request shape.
3. Determine the correct destination folder from the collection's current structure.
4. Name the request file according to the local naming convention.
5. Generate only the request definition needed for frontend visualization:
	- URL
	- path params
	- query params
	- headers when already implied by local convention
	- request body shape
6. Write the request file directly into the collection once the location and format are clear.
7. Use fake values, placeholders, or empty strings for field values unless the collection's convention clearly prefers variables.
8. Reuse existing collection variables wherever the current collection already does so.
9. Keep auth, headers, and settings minimal; inherit where the collection already inherits.

### Content Rules
- The primary goal is to expose field shape, not produce executable real-world payloads
- Prefer placeholders like empty strings, obvious fake values, or existing variables over hard-coded secrets or production-like data
- If a field type is known, represent it with a plausible placeholder of that type
- If the request body is unknown, create the minimal empty structure that still communicates the expected shape
- If the API definition is too incomplete to infer URL or request shape safely even after checking available code/spec sources, report what is missing and stop

## Error Policy

Stop immediately and report the problem if any of these occur:
- Collection path is missing, invalid, or unreadable
- Collection root markers cannot be identified
- Existing collection structure cannot be determined
- YAML versus BRU format is ambiguous
- Reference file cannot be read
- Target request location cannot be inferred safely
- The requested API lacks enough information to determine URL, params, query, or body shape

When reporting an error:
- State the phase that failed
- State the exact missing input, conflicting signal, or file/path problem
- Do not continue to a fallback phase

## Output Checklist

Before finishing, verify all of the following:
- The request was placed in the correct collection area
- The file format matches the collection format
- Variable names match the collection's current conventions
- Path params, query params, and body fields are present when applicable
- Placeholder data is clearly fake or empty
- No unrelated collection files were changed

## Example Prompts
- Create Bruno requests for `GET /products`, `GET /products/{id}`, and `POST /products` in this project.
- Add Bruno request files for the auth APIs: login, refresh token, logout.
- Inspect this Bruno collection and generate requests for the user profile endpoints using the collection's current YAML style.
- Generate BRU requests for the order APIs and follow the variables already used in the Orders folder.

## Notes for Ambiguities

Ask the user when one of these decisions is still genuinely unclear before any file is written:
- which collection directory should be used when the workspace has multiple Bruno collections
- which folder should own the new requests when multiple locations are equally plausible
- whether multiple APIs should be created as separate requests or follow an existing grouped workflow pattern

If the ambiguity cannot be resolved quickly, report it as a stop condition instead of guessing.
