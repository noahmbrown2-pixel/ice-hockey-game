# Error handling discipline

Part of cross-project rules. Routed from `~/.claude/CLAUDE.md`.

## Errors carry information; never throw it away

When you catch an error, the caller's first question is **"why
did this fail?"** A user-facing error message that says only
`"FetchFailed"` or `"could not parse file"` is failing the user.
They have to read source code to figure out what happened.

Three habits cause this:

### 1. Bare swallow / opaque re-raise

`catch {}`, `catch return error.X`, or any pattern that discards
the upstream error value. The error carries the upstream's
classification (`RateLimited`, `Unauthorized`, `NotFound`,
`ParseError`, etc.). Discarding it reduces N distinct conditions
to one opaque "something went wrong."

**Fix:** capture as `catch |err|` (or your language's equivalent)
and at minimum include the error name in any user-visible
message. Better: re-raise a more specific variant from the
caller's error set so the next layer up can decide what to do.

### 2. Generic-collapse points in service layers

When a service-layer function does
`provider.fetch(...) catch return ServiceError.FetchFailed`, the
provider's specific error (`RateLimited` vs `Unauthorized` vs
`NotFound`) is permanently erased.

**Fix:** either expand the service-layer error set to mirror the
provider's distinctions, OR pass the inner error through via a
log line so the stderr path tells the user something useful even
if the typed return value is collapsed.

### 3. User-facing messages that don't name the error

A CLI command that catches an error and writes "Error: failed to
fetch data for symbol" to stderr is unhelpful. The user can't
tell whether to retry, switch to a different provider, fix
their config, or wait.

**Fix:** every user-facing error message must mention either the
underlying error name or a deliberate human translation per error
kind. The error name alone is enough for the user to look it up;
the human translation is a nice-to-have on top.

Bad: `"Error: failed to fetch data for symbol"`
Good: `"Error fetching AAPL: RateLimited (free tier 5/min, wait 60s)"`

## The grep test

If you're catching an error in user-facing code, the message
should reference either the error name (via your language's
formatting equivalent of `@errorName(err)`) or a specific error
variant by name. Hardcoded "Error: failed to ..." strings with
no error context fail this test.
