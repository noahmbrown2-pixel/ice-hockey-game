# API Agent

## Stack
- Hono with OpenAPIHono
- Zod 4 for validation
- Scalar for API docs

## Endpoints
- `/api/doc` - OpenAPI JSON spec
- `/api/reference` - Scalar UI
- `/api/health` - Health check

## Zod 4 Syntax
Use top-level validators:
```ts
z.url()    // NOT z.string().url()
z.email()  // NOT z.string().email()
```

## Creating Routes
```ts
import { createRoute, z } from '@hono/zod-openapi'

const route = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User found',
    },
  },
})

app.openapi(route, async (c) => {
  const { id } = c.req.valid('param')
  const user = await userRepository.findById(id)
  return c.json(user)
})
```

## Middleware
Located in `src/server/api/middleware/`

## Type-Safe Environment
```ts
import { env } from '@/config/env'
// Use env.VARIABLE_NAME, never process.env
```
