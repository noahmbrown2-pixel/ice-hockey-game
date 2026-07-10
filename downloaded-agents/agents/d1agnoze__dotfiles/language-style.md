# Language-Specific Coding Style

## JavaScript and TypeScript

- Use tabs for indentation.
- Use double quotes.
- Do not use semicolons.
- Use trailing commas where supported.
- Prefer `function` declarations or function expressions for named logic and non-trivial callbacks.
- Arrow functions are fine for short inline callbacks, especially when they are the clearest option in `map`, `filter`, `reduce`, event handlers, and similar callsites.
- Follow the surrounding file or project style when it already has a clear function-style convention.
- Prefer `interface` over `type` when both are valid and the shape is object-like.
- Prefer `null` over `undefined` when choosing an explicit empty value.
- Prefer `async`/`await` over raw promise chains.
- Prefer concise one-line guards and short transformations when readability stays good.

Preferred style examples:

```ts
if (!config.appSetting) throw new Error("Something went wrong")
```

```ts
const out = listOrder.map(o => ({ ...o.Items, appContext: currentAppContext }))
```

Do not force one-line formatting when the expression becomes hard to scan.

## Go

- Let `gofmt` decide formatting.
- Use lowercase error messages.
- Wrap errors with `fmt.Errorf(... %w ...)` only when the extra context is useful for internal error handling and composition with the `errors` package.
- Use `context.Context` as the first argument when a function performs API calls or database operations.
- Prefer table-driven tests.
- Prefer small functions.
- Prefer `slog` over `log`, unless the project is very small and log levels are not needed.
- Do not wrap logging lines. Keep `log` and `slog` calls on a single line even when the message or arguments are long, so the main logic stays easier to scan.
- Prefer concise one-line forms when they remain readable.
- Prefer short `if` statements with an initializer when the initialized value is only used by that condition.

Preferred style examples:

```go
if v := math.Pow(x, n); v < lim {
	return v
}
```

```go
utils.MaxFunc(arr, func(x model.Order) string { return x.ID })
```

```go
slog.InfoContext(app.Context, "Very long system message: Lorem ipsum dolor sit amet, consectetur adipiscing", "error", err, "data", data)
```

For struct literals:

- Use a one-line struct literal when initializing fewer than 2 fields.
- Use a multi-line struct literal for 2 or more fields when that is clearer in context.

Examples:

```go
out := response{Status: true, Data: orders}
```

```go
out := response{
	App:     app,
	Data:    orders,
	Message: "it worked",
}

return c.JSON(baseResponse{Status: true, Data: out})
```

For HTTP handlers:

- If a request body, query, or param struct is only used by one handler, declare that struct inside the handler.
- Use simple local names like `body`, `query`, `param`, and short variables like `b`, `q`, `p` when they are obvious.

Example:

```go
func handleOrderDelete(c *fiber.Ctx) error {
	type body struct {
		ID string `json:"id"`
	}

	var b body

	// ...
}
```

For GORM repository functions:

- For create and update operations, prefer returning only `error`.
- Accept a pointer to the model when creation or update mutates the entity.

Example:

```go
func CreateOrder(ctx context.Context, order *Order) error {
	return db.WithContext(ctx).Create(order).Error
}
```
