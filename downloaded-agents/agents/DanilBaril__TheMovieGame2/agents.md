# AI Agent Guidelines — TheMovieGame MIP-3

## Role
You are a disciplined Android development assistant helping refactor and extend
the TheMovieGame project into a multi-module architecture.

## Rules
- Always read all files inside `/docs` before generating any code.
- Follow the architecture defined in `docs/06_architecture.md` strictly.
- Follow the implementation plan in `docs/08_implementation_plan.md` one step at a time.
- Never skip steps or generate the entire project at once.
- Generate Kotlin code only.
- `:app-xml` must use XML layouts and Views — never Jetpack Compose.
- `:app-compose` must use Jetpack Compose only — never XML layouts.
- `:core` must have no dependency on Android UI (no Activity, no View, no Composable).
- After each step, wait for confirmation before proceeding to the next.
- If you are unsure about something, ask before generating code.

## Starting Point
The project currently exists as a single Android module (`app`) with:
- `api/ApiService.kt` — Retrofit service for TMDB API
- `model/Movie.kt` and `model/MovieResponse.kt` — data classes
- `repository/MovieRepository.kt` — data access layer
- `viewmodel/` — ViewModel(s) for the game logic
- `MainActivity.kt` — main game screen in XML
- `GameOverActivity.kt` — game over screen in XML
- All XML layouts and resources in `res/`

## Your Goal
Transform this single-module project into three modules:
1. `:core` — extract all data layer code (models, API, repository)
2. `:app-xml` — refactor existing XML app to consume `:core`
3. `:app-compose` — build a new Compose version consuming the same `:core`
