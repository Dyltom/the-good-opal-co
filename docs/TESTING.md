# Testing guide

## Local gates

Use Node.js 22 or 24:

```bash
pnpm audit --prod
pnpm test:unit --run
pnpm validate:build
pnpm test:e2e
```

`pnpm validate` runs TypeScript and ESLint. `pnpm validate:build` also creates the
optimized Next.js production build. `pnpm test` is the non-watch unit suite.

## Unit and component tests

Vitest tests live beside source in `__tests__` folders and in `src/test/`.

```bash
pnpm test:unit --run
pnpm test:unit --run src/test/checkout-validation.test.ts
pnpm test:unit:watch
pnpm test:unit:coverage
```

Some source-regression tests guard accessibility and architecture conventions;
they do not replace browser or integration acceptance.

## Browser smoke tests

Playwright tests live only in `e2e/`. The configuration starts port 8412 and runs
desktop Chromium plus a 390 px mobile Chromium viewport.

```bash
pnpm test:e2e
pnpm test:e2e:headed
pnpm test:e2e:debug
```

The suite checks canonical public routes, desktop/mobile navigation, catalog or
empty state, available-product cart mutation, checkout validation, health,
robots, sitemap, redirects, 404 behavior, accessible contact fields, browser
exceptions, console errors, and same-origin HTTP failures including images.

Catalog-dependent tests skip only when no published/available product exists.
Launch acceptance therefore requires a reviewed catalog with at least one
in-stock item.

## Database and integration acceptance

CI starts PostgreSQL 16, applies every committed migration, runs unit/static/build
gates, installs Chromium, and runs the browser suite.

Local tests cannot establish that provisioned external services work. Before
launch, use a Vercel Preview with isolated resources to verify:

- Payload first-admin bootstrap and product/post/media CRUD.
- Blob upload, retrieval, and persistence after redeploy.
- Stripe test checkout, paid webhook replay, refund, dispute, and exact-once stock
  behavior.
- Resend contact, password reset, newsletter confirmation/unsubscribe, order
  confirmation, rejection, and retry behavior.
- Upstash limits across separate function instances.
- Neon backup restore/PITR and deployment rollback.

See [VERIFICATION.md](./VERIFICATION.md) for current evidence and
[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for the release checklist.
