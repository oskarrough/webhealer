## Direct Property Access

1. Prefer direct property access over getters/setters when they add no value.
2. Only create wrapper methods when they provide additional functionality beyond simple property access (validation, transformation, logging, etc).
3. Avoid creating methods like `getHealth()` that simply return `health.current` or `takeDamage()` that just call `health.damage()`.
4. Keep the code path direct and clear - each unnecessary abstraction layer makes the code harder to follow.

Remember: Methods should do something meaningful beyond simple property access or delegation.