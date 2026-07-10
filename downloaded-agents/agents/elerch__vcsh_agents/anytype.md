# Zig: `anytype` is almost never the right answer

Part of cross-project Zig rules. Applies to any Zig version.

Empirically, every time `anytype` looks necessary, it usually
turns out not to be. Concrete-typed parameters tend to work once
you actually try them. **Before adding any new `anytype`
parameter, stop and reconsider.** The discussion that surfaces
"no, this can be `*Foo` after all" is short and worth having
every time.

## Common reasons people reach for `anytype` and what to do instead

### "I want to avoid a circular import."

Test the assumption. Zig resolves `a.zig <-> b.zig` cycles fine
in most cases. File structs are evaluated lazily, and the cycle
only fails if evaluation actually loops. Just write the concrete
type and run `zig build`. If it fails, the answer is usually to
extract the shared type to a third file, not to weaken the
contract with `anytype`.

### "This function is genuinely polymorphic over many types."

In Zig, the right shape for runtime polymorphism is usually
`*anyopaque` plus an explicit cast at the boundary, paired with
a vtable struct of fn pointers. That's harder to abuse than
`anytype` and the cast site documents the type contract
unambiguously.

Compile-time polymorphism over a known set of types is better
expressed with `comptime T: type` parameters.

### "It's an event union and I don't want to pattern-match in every caller."

Split the contract by event class (separate methods per event
type) and let the dispatcher do the discrimination once. Each
method gets a concrete type; callers that don't care about a
class simply omit the method.

### "It's a test helper that takes any struct."

This is the one case where `anytype` is sometimes OK. Generic
test utilities like `std.testing.expectEqual` use `anytype` and
that's appropriate. But check whether a concrete type would do.

## The cost

`anytype` punches a hole in the type contract:

- The compiler can't catch wrong-shape arguments at the boundary.
- Signatures stop being self-documenting.
- Each callsite gets monomorphized into its own instantiation
  that may or may not behave the same as the others.
- Refactoring becomes harder because the caller's concrete type
  isn't visible from the function signature.

If the framework's whole point is "let the compiler enforce the
shape," `anytype` defeats that.

## When you still think `anytype` is right

If you've considered the alternatives above and still believe
`anytype` is correct, **flag it in your message to the user
before writing the code.** Phrase it as: "I think this needs
`anytype` because X. Does that match your intuition?" The
default should be discussion, not silently-typed-loose code.
