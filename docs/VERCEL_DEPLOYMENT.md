# Vercel deployment

## Production architecture

- Application and Next.js functions: Vercel, Node.js 22, `syd1`.
- Relational system of record: Neon Postgres through Vercel Marketplace.
- CMS media: Vercel Blob.
- Payments: Stripe Checkout plus signed webhooks.
- Transactional and newsletter email: Resend.
- Distributed abuse protection: Upstash Redis through Vercel Marketplace.

Products, customers, orders, users, posts, and migration state live in Neon. Images uploaded through Payload live in Blob. Redis contains only short-lived rate-limit counters.

## Resource setup

1. Import the Git repository into Vercel. Root directory is the repository root; framework is Next.js; production branch is `main`; Node is 22.x.
2. Add Neon from Vercel Marketplace. Choose an Australian/AP Southeast region when available and enable backups/PITR. Use its pooled TLS URL as `DATABASE_URL`.
3. Add Vercel Blob. Vercel injects `BLOB_READ_WRITE_TOKEN`.
4. Add Upstash Redis from Vercel Marketplace. Vercel injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
5. Create separate Neon branches/databases, Blob stores, Stripe test credentials, and Redis resources for Preview. Never connect a preview deployment to the production database.
6. Attach the final domain before configuring live Stripe or transactional links.

## Environment variables

Set these for Production. Use isolated test values for Preview and Development.

```text
DATABASE_URL
PAYLOAD_SECRET
ADMIN_EMAIL
NEXT_PUBLIC_APP_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
EMAIL_FROM
CONTACT_EMAIL
EMAIL_DELIVERY_VERIFIED
BLOB_READ_WRITE_TOKEN
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Optional:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID
```

`NEXT_PUBLIC_APP_URL` must be the canonical HTTPS origin without a trailing slash. Generate `PAYLOAD_SECRET` from at least 32 random bytes. `EMAIL_FROM` must use a Resend-verified domain, for example `The Good Opal Co <orders@example.com>`. `CONTACT_EMAIL` must be a monitored inbox. Keep `EMAIL_DELIVERY_VERIFIED=false` until that sender reaches a real recipient outside Resend, then set it to `true`. Production readiness also requires a live-mode Stripe key and the matching endpoint signing secret.

## Database migrations and catalog

`vercel.json` delegates to `scripts/vercel-build.mjs`. Production builds run committed Payload migrations before `next build`; Preview and Development builds never run migrations. Every environment still needs an isolated database because the running application can write through Payload. Do not run concurrent production deployments. Use a preview database, verify the artifact, then schedule the production deployment.

For later schema changes:

```bash
pnpm payload generate:types
pnpm payload migrate:create descriptive_name
```

A fresh database has schema but no sellable catalog. The checked-in seed imports the legacy catalog and matching public product images into Payload/Blob. Its safe default creates drafts with zero stock:

```bash
pnpm seed
```

Review every product, image, description, price, treatment/origin claim, and physical stock count in `/admin`. Only if the imported stock file has been independently verified should it be published during import:

```bash
SEED_PUBLISH=true pnpm seed
```

The seed is idempotent by product slug and does not overwrite existing products.

For the final legacy commerce cutover, the importer can authenticate to the old
WordPress administrator without creating a persistent WooCommerce API key. Set
`WOO_BASE_URL`, `WOO_ADMIN_USERNAME`, `WOO_ADMIN_PASSWORD`, and
`WOO_IMPORT_ON_DEPLOY=true` for one controlled Production deployment. The build
runs migrations first, then performs an idempotent product/order/customer/refund
import. Remove all four variables immediately after the successful import and
confirm the imported counts in Payload. Never set the import flag for Preview.

## First administrator

Set `ADMIN_EMAIL` to the owner address, then open `/admin` after the first deployment and create the first user with that exact email. Payload allows anonymous creation only for that address and only while no users exist; the server hook promotes it to `admin`. The email uniqueness constraint prevents concurrent duplicate bootstrap attempts. All later user creation requires an authenticated administrator. Confirm password-reset email before launch.

## Stripe

Create the endpoint:

```text
https://YOUR_DOMAIN/api/webhooks/stripe
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

Copy the endpoint-specific signing secret to `STRIPE_WEBHOOK_SECRET`. Checkout supports Australia, New Zealand, United States, United Kingdom, Canada, Singapore, Hong Kong, and Japan; destination is selected before Stripe so the correct Australian or international rate is charged.

Order creation, customer totals, and inventory decrement share a serializable database transaction. Confirmation-email failures return an error and retry on webhook replay without duplicating the order. Refund events restock only inventory previously decremented. Disputes mark the order for manual review.

## Release gates

Run with Node 22:

```bash
pnpm install --frozen-lockfile
pnpm audit --prod
pnpm test:unit --run
pnpm validate:build
pnpm test:e2e
```

Then verify on a Vercel Preview:

- `/api/health` reports `database: connected`. Its `status` and HTTP status are
  liveness signals; `readiness.status` may be `degraded` while the storefront is
  online. Do not launch payments until `readiness.revenueReady` is `true`, and do
  not call the release complete until `readiness.ready` is `true`. Readiness
  issue codes are deliberately sanitized and never contain environment values.
- First-admin creation and product/post/media CRUD work.
- An uploaded image is served from Blob after a new deployment.
- Desktop and mobile home, store, product, cart, checkout, contact, newsletter, order tracking, legal, and error routes work without console errors.
- A Stripe test purchase creates one order, customer update, inventory decrement, and email.
- Replaying the paid event creates no duplicate and re-sends only an unsent email.
- Refund and dispute test events update the order; a refund restocks exactly once.
- Newsletter confirmation accepts only the exact unexpired token; unsubscribe works once.
- Resend rejection is reported rather than shown as success.
- Production logs, Vercel Web Analytics/Speed Insights, Neon alerts/backups, Stripe webhook failures, and Resend bounces have owners.

Owner approval remains required for domain, legal entity/ABN, contact address, privacy/terms/returns wording, inventory, product origin/treatment/certificate claims, Resend DNS, and live Stripe settlement details.
