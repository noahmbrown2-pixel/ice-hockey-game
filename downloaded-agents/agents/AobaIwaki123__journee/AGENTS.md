# Project Debug Rules (Non-Obvious Only)
- **Mock Authentication**: Enabled via `NEXT_PUBLIC_ENABLE_MOCK_AUTH=true`. Mock users are seeded with `npm run seed:mock-users`.
- **Supabase Admin Client**: `supabaseAdmin` requires `SUPABASE_SERVICE_ROLE_KEY` and bypasses RLS. If not configured, admin operations will not be available.
- **NextAuth Debug Mode**: Enabled in development environment via `debug: process.env.NODE_ENV === "development"` in `lib/auth/auth-options.ts`.
- **Error Handling in Callbacks**: `signIn` and `jwt` callbacks in `lib/auth/auth-options.ts` often log errors but return `true` (for mock auth) or `false` (for Google auth) to allow/disallow sign-in, which might mask issues if not carefully observed.
- **Zustand Persistence**: Global state is persisted to IndexedDB via `persist` middleware. Debugging state changes might require inspecting IndexedDB.
- **AI Streaming Debugging**: Server streams chunks via Server-Sent Events (SSE). Debugging involves inspecting network requests for `text/event-stream` content.
