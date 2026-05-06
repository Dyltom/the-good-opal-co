---
name: project-debug
description: Use when debugging The Good Opal Co issues involving Next.js, Payload, cart cookies, Stripe webhooks, hydration, forms, or failing tests.
---

# Project Debug Workflow

Debug from symptom to root cause before editing.

## Steps

1. Capture the exact symptom, command, route, browser action, or failing test.
2. Reproduce locally or identify the narrowest command that would reproduce it.
3. Trace the owning flow through route, component, Server Action, library helper,
   Payload query, and webhook code as relevant.
4. State the root-cause hypothesis before changing code.
5. Make the smallest fix that addresses the cause, not the symptom.
6. Add or update a regression test when practical.

## Common Project Risks

- Cart cookie serialization or stale revalidation.
- Server/client boundary mistakes and hydration mismatches.
- Payload query shape or generated type drift.
- Stripe webhook signature handling and duplicate event processing.
- Form validation mismatch between React Hook Form and Zod.
- Image or media paths that work locally but fail in production.

## Verification

- Run the original failing command or reproduction.
- Then run the closest broader check, usually `pnpm validate` or the targeted
  Playwright spec.
