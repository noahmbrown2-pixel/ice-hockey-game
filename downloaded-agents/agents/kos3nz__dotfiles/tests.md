# Good and Bad Tests

## Good Tests

**Integration-style**: Test through real interfaces, not mocks of internal parts.

```typescript
// GOOD: Tests observable behavior
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

Characteristics:

- Tests behavior users/callers care about
- Uses public API only
- Survives internal refactors
- Describes WHAT, not HOW
- One logical assertion per test

## Bad Tests

**Implementation-detail tests**: Coupled to internal structure.

```typescript
// BAD: Tests implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

Red flags:

- Mocking internal collaborators
- Testing private methods
- Asserting on call counts/order
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT
- Verifying through external means instead of interface

```typescript
// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

## Same-file tests (e.g. Rust)

The two rules are invariant to where the test lives. In Rust the test sits in the
same file under `#[cfg(test)]`, but it still asserts observable behavior through the
public API — it does not reach into private fields.

```rust
pub struct Cart { items: Vec<Item> }

impl Cart {
    pub fn add(&mut self, item: Item) { self.items.push(item); }
    pub fn total(&self) -> Money { /* ... */ }
}

#[cfg(test)]
mod tests {
    use super::*;

    // GOOD: behavior through the public API
    #[test]
    fn cart_totals_added_items() {
        let mut cart = Cart::new();
        cart.add(Item::priced(500));
        assert_eq!(cart.total(), Money::from(500));
    }
    // BAD: cart.items.len() — reaching into private state couples the test to layout
}
```

## Build-first tests (E2E)

Sometimes you cannot write a correct assertion first because the UI it targets does
not exist yet — the one build-first case. Build the page, then _immediately_ write
the test against what is really rendered, asserting through user-facing queries
(role, label, text) rather than DOM structure or test ids.

```typescript
// GOOD: build the checkout page, then assert what the user actually sees
test("user sees confirmation after checking out", async ({ page }) => {
  await page.goto("/cart");
  await page.getByRole("button", { name: "Checkout" }).click();
  await expect(page.getByText("Order confirmed")).toBeVisible();
});

// BAD: pre-written against UI that doesn't exist yet, coupled to markup
await expect(page.locator("div.confirmation > span.status")).toHaveText("ok");
```
