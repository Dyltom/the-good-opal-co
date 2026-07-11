# Production launch checklist

Use [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for exact provisioning steps.

## Automated gates

- [ ] Node 22.x active.
- [ ] `pnpm install --frozen-lockfile` passes.
- [ ] `pnpm audit --prod` reports zero known vulnerabilities.
- [ ] `pnpm test:unit --run` passes.
- [ ] `pnpm validate:build` passes.
- [ ] `pnpm test:e2e` passes in desktop and mobile Chromium.
- [ ] Fresh Neon database runs every committed migration.
- [ ] `git diff --check` passes.

## Vercel resources

- [ ] Vercel project linked to `main`, root `.`, Node 22.x, region `syd1`.
- [ ] Production Neon database uses pooled TLS URL, backups/PITR, and Australian/AP Southeast region where available.
- [ ] Preview uses a separate Neon branch/database.
- [ ] Production and Preview have separate Blob stores.
- [ ] Production and Preview have separate Upstash Redis resources.
- [ ] Every required key in `.env.example` is set in the correct Vercel environments.
- [ ] Canonical domain attached; `NEXT_PUBLIC_APP_URL` matches it exactly.

## Content and admin

- [ ] First `/admin` user is created and has `admin` role.
- [ ] Password reset email arrives from verified Resend sender.
- [ ] Product/media/post CRUD verified.
- [ ] Blob upload remains available after redeploy.
- [ ] Catalog imported or migrated; no empty storefront.
- [ ] Every published item has verified image, price, stock, description, category, origin/treatment facts, and certificate state.
- [ ] No stale item is accidentally published from legacy seed data.

## Revenue flows

- [ ] Contact enquiry reaches monitored inbox; rejection shows an error.
- [ ] Newsletter double opt-in, expired/invalid token, duplicate signup, and unsubscribe verified.
- [ ] Stripe live endpoint uses the exact production signing secret and documented events.
- [ ] Test purchase produces one order/customer update/inventory decrement/email.
- [ ] Paid webhook replay is idempotent.
- [ ] Failed email retries without duplicate order.
- [ ] Refund restocks exactly once; dispute marks manual review.
- [ ] Australian and international shipping totals/timings match checkout.
- [ ] Paid out-of-stock/manual-review order alerts an owner and receives a decision.

## Browser and operations

- [ ] Home, store, product, cart, checkout, services, about, contact, blog, FAQ, shipping, returns, order tracking, legal pages, 404, and admin checked at desktop and 390px mobile widths.
- [ ] Keyboard navigation, focus, labels, headings, contrast, and reduced-motion behavior checked.
- [ ] No unexpected browser console or Vercel runtime errors.
- [ ] `/api/health` fails when the database is unavailable and succeeds when connected.
- [ ] Sitemap and robots use the canonical production origin.
- [ ] Vercel logs/alerts, Neon backups, Stripe webhook failure alerts, and Resend bounce handling have named owners.
- [ ] Rollback procedure tested against the previous Vercel deployment and a compatible database migration state.

## Owner-supplied launch facts

- [ ] Domain and support/sender email.
- [ ] Legal entity name, ABN, business/contact address, and required disclosures.
- [ ] Approved privacy, terms, returns, shipping, and cookie policies.
- [ ] Verified inventory, price, origin, treatment, sourcing, and certificate claims.
- [ ] Stripe live-account identity, settlement currency, tax, refund, and dispute policy.
