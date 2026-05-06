---
name: project-tests
description: Use when adding, updating, or fixing Vitest or Playwright tests for The Good Opal Co utilities, components, cart, checkout, forms, Payload, or user flows.
---

# Project Test Workflow

Test behavior rather than implementation details.

## Test Choice

- Use Vitest for utilities, hooks, pure logic, validation, formatting, and
  component behavior that does not need a full browser journey.
- Use Playwright for user flows: navigation, store browsing, cart, checkout,
  forms, footer links, and accessibility-critical interactions.
- Mock Stripe, Payload, email, and network boundaries unless the task explicitly
  requires integration coverage.

## Steps

1. Find nearby tests and match their helpers and naming style.
2. Cover the happy path plus the smallest meaningful edge case.
3. Prefer assertions on visible behavior, returned results, persisted state, or
   emitted events.
4. Keep fixtures small and local to the test when possible.
5. Run the targeted test first, then the nearest broader check.

## Verification

```bash
pnpm test:unit --run
pnpm test:e2e
pnpm validate
```

Use narrower file or test-name filters while iterating, then run the broader
command that matches the risk of the change.
