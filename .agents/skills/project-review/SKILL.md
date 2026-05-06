---
name: project-review
description: Use when reviewing changes in The Good Opal Co for correctness, security, type safety, tests, accessibility, performance, or deployment risk.
---

# Project Review Workflow

Review like a code reviewer. Findings come first and must be tied to files and
lines.

## Focus Areas

- Behavior regressions in cart, checkout, Stripe, Payload, routing, and forms.
- Type safety issues, especially `any`, unchecked `unknown`, and stale generated
  Payload types.
- Server/client boundary mistakes in the Next.js App Router.
- Security risks: secrets, unsafe redirects, insufficient input validation,
  webhook verification, auth checks, and rate limits.
- Missing tests or verification for changed behavior.
- Accessibility regressions in interactive UI.
- Performance risks such as unnecessary client components, waterfalls, large
  images, or repeated expensive queries.

## Output

1. Findings ordered by severity, with file and line references.
2. Open questions or assumptions.
3. Brief change summary only after findings.

If there are no findings, say so and list remaining test gaps or residual risk.

## Verification

- Use `/review` for Codex working-tree review when appropriate.
- Run or recommend the narrowest checks that prove the reviewed behavior.
