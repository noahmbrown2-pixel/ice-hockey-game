# Auth Agent

## Stack
- Better Auth
- Google OAuth + Email/Password

## Documentation
https://www.better-auth.com/llms.txt

## Server-Side
```ts
import { auth } from '@/lib/auth'

// In API route or server action
const session = await auth.api.getSession({
  headers: request.headers,
})
```

## Client-Side
```tsx
'use client'
import { useSession, signIn, signOut, signUp } from '@/lib/auth-client'

function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return <button onClick={() => signOut()}>Logout</button>
  }

  return (
    <button onClick={() => signIn.email({ email, password })}>
      Login
    </button>
  )
}
```

## Forms with Field Component
- **DO NOT use Form component** - it is deprecated
- Use Field, FieldLabel, FieldError components
- Install: `bunx --bun shadcn@latest add field`

```tsx
<Field data-invalid={!!errors.email}>
  <FieldLabel>Email</FieldLabel>
  <Controller
    name="email"
    control={control}
    render={({ field }) => (
      <Input {...field} aria-invalid={!!errors.email} />
    )}
  />
  <FieldError>{errors.email?.message}</FieldError>
</Field>
```

## Adding New Providers
1. Add credentials to `src/config/env.ts` (use `env` object, not `.env` directly)
2. Update `src/lib/auth.ts` socialProviders
3. Run: `bunx @better-auth/cli generate`
4. Run migrations: `bun db:migrate`
