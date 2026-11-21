# Deployment

## Production architecture

- Application: one Docker container (`Dockerfile`, Next.js standalone, Node.js 22) on the VPS, managed by Coolify.
- Relational system of record: Postgres (`DATABASE_URL`).
- Uploads: local disk under `UPLOAD_DIR` (`/app/uploads` in the image), a persistent Coolify volume.
- Payments: Stripe Checkout plus signed webhooks.
- Transactional and newsletter email: Resend.
- Rate limiting: in-process on the single host, or Upstash Redis when configured.

Payload media and ring assets live in `UPLOAD_DIR/media` and `UPLOAD_DIR/ring-assets`.

Generated ring-builder opal faces live in the same volume at the input-addressed
path `UPLOAD_DIR/builder/opal-faces/v{generatorVersion}/{inputHash}.png`;
`inputHash` covers the source-image hash, approved contour, crop, aspect, size,
and generator version. The mapping processor never activates a generated contour
until that exact file has been written. The same-origin route
`/api/builder/opal-face/v1/{productId}/{inputHash}` streams the PNG with
immutable cache headers.

## Scheduled jobs

Coolify scheduled tasks call these routes with `Authorization: Bearer $CRON_SECRET`:

| Route | Schedule |
| --- | --- |
| `/api/cron/inventory-reservations` | `*/15 * * * *` |
| `/api/cron/woo-catalog` | `*/15 * * * *` |
| `/api/cron/builder-mappings` | `7,22,37,52 * * * *` |
| `/api/cron/ring-reference-audit` | `23 15 * * *` |
| `/api/cron/insights-retention` | `41 16 * * *` |

## Environment variables

Set these for Production. Use isolated test values for development.

```text
DATABASE_URL
PAYLOAD_SECRET
QUOTE_LINK_SECRET
CRON_SECRET
ADMIN_EMAIL
NEXT_PUBLIC_APP_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
EMAIL_FROM
CONTACT_EMAIL
EMAIL_DELIVERY_VERIFIED
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Optional:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID
NEXT_PUBLIC_CLARITY_PROJECT_ID
RING_REFERENCE_AUDIT_ENABLED
```

`NEXT_PUBLIC_APP_URL` must be the canonical HTTPS origin without a trailing slash. Generate separate `PAYLOAD_SECRET`, `QUOTE_LINK_SECRET`, and `CRON_SECRET` values from at least 32 random bytes each; never reuse them. `EMAIL_FROM` must use a Resend-verified domain, for example `The Good Opal Co <orders@example.com>`. `CONTACT_EMAIL` must be a monitored inbox. Keep `EMAIL_DELIVERY_VERIFIED=false` until that sender reaches a real recipient outside Resend, then set it to `true`. Production readiness also requires a live-mode Stripe key and the matching endpoint signing secret.

## Database migrations and catalog

Run committed Payload migrations (`pnpm payload migrate`) against the production database before starting a release that includes them. Production never pushes schema changes.

The guarded WooCommerce import runs from `src/scripts/import-woocommerce-commerce.ts` with `WOO_IMPORT_APPLY=true`, `WOO_IMPORT_RUN_ID` and `WOO_IMPORT_MODE`. Use `final-delta` only after checkout on the old store is
frozen and before checkout on this store opens. The build runs migrations first,
claims the run ID in the durable Commerce Import Runs ledger, then performs the
product/order/customer/refund import and reconciles every visible WooCommerce
product gallery by real Woo product/media ID and source order. Existing images
are refreshed when the source gallery changes; the import no longer treats any
non-empty image field as proof of freshness. A claimed ID can never run again, even when
its first attempt failed; inspect that ledger and the partial import before using
a new ID. Remove all Woo import variables immediately after success and confirm
the recorded counts in Payload.

While the legacy WooCommerce catalogue remains the merchandising source, set
`WOO_CATALOG_SYNC_ENABLED=true`. The woo-catalog job then reconciles visible products, prices,
stock changes, and ordered galleries every 15 minutes. Add a read-only WooCommerce
REST key as `WOO_CONSUMER_KEY` plus `WOO_CONSUMER_SECRET` to reconcile exact managed
reductions; source increases never raise local stock because a paid local order must
not be undone by the legacy storefront. Without both credentials the safe public
Store API fallback can only reconcile in-stock versus out-of-stock state and likewise
never increases local stock. The recurring job refuses to run against synthetic seed
identities: complete and verify the guarded commerce import first. During cutover,
stock is the lower of Payload's local quantity and WooCommerce's authenticated
quantity. Intentional replenishment must be entered in Payload. Disable and remove
the sync flag and credentials once Payload becomes the only product-management
backend.

After the `ring-reference-checks` migration has deployed, set
`RING_REFERENCE_AUDIT_ENABLED=true` to record one append-only route-health check per
Instagram design reference each UTC day. The job requests only canonical post/reel
routes, follows no redirects, stores no response body, and never treats route
availability as proof that the post content matches the ring. Keep design records in
draft until calibrated captures, physical measurements, and maker approval exist.

To reconcile source and target counts without changing data, run the import script
with the Woo credentials and `WOO_IMPORT_APPLY=false`. Dry runs never claim an
import-run ledger entry.

## First administrator

Set `ADMIN_EMAIL` to the owner address and temporarily set `ADMIN_BOOTSTRAP_PASSWORD` to a randomly generated value of at least 16 characters. Open `/admin` after the first deployment and create the first user with that exact email and temporary password. Payload allows anonymous creation only when both values match and no users exist; the server hook promotes that user to `admin`. The email uniqueness constraint prevents concurrent duplicate bootstrap attempts. Remove `ADMIN_BOOTSTRAP_PASSWORD` from Vercel immediately after creation, change the admin password, and confirm password-reset email before launch. All later user creation requires an authenticated administrator.

## Stripe

Create the endpoint:

```text
https://YOUR_DOMAIN/api/webhooks/stripe
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.expired`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

Copy the endpoint-specific signing secret to `STRIPE_WEBHOOK_SECRET`. Checkout supports Australia, New Zealand, United States, United Kingdom, Canada, Singapore, Hong Kong, and Japan; destination is selected before Stripe so the correct Australian or international rate is charged.

Order creation, customer totals, and inventory decrement share a serializable database transaction. Confirmation-email failures return an error and retry on webhook replay without duplicating the order. Refund events restock only inventory previously decremented. Disputes mark the order for manual review.

Custom quote links exchange an email URL fragment for a private, quote-scoped HttpOnly cookie, so the bearer token does not enter request logs or analytics. Quote acceptance and deposit evidence are immutable. Quote deposits use the same webhook endpoint but are classified before product-order and inventory logic; subscribe to the same checkout, refund, and dispute events listed above.

## Release gates

Run with Node 22:

```bash
pnpm install --frozen-lockfile
pnpm audit --prod
pnpm test:unit --run
pnpm validate:build
pnpm test:e2e
```

Then verify on a staging deployment:

- `/api/health` reports liveness with HTTP 200 while the database is connected;
  `liveness` is `healthy` and `status` may be `degraded` when launch dependencies
  are missing. `/api/readiness` returns HTTP 200 only when every required launch
  dependency is ready, otherwise HTTP 503. Do not launch payments until
  `revenueReady` is `true`, and do not call the release complete until `ready` is
  `true`. Issue codes are sanitized and never contain environment values.
- First-admin creation and product/post/media CRUD work.
- An uploaded image is still served after a redeploy (the uploads volume persists).
- Desktop and mobile home, store, product, cart, checkout, contact, newsletter, order tracking, legal, and error routes work without console errors.
- A Stripe test purchase creates one order, customer update, inventory decrement, and email.
- Replaying the paid event creates no duplicate and re-sends only an unsent email.
- Refund and dispute test events update the order; a refund restocks exactly once.
- Newsletter confirmation accepts only the exact unexpired token; unsubscribe works once.
- Resend rejection is reported rather than shown as success.
- Production logs, database backups, Stripe webhook failures, and Resend bounces have owners.

Owner approval remains required for domain, legal entity/ABN, contact address, privacy/terms/returns wording, inventory, product origin/treatment/certificate claims, Resend DNS, and live Stripe settlement details.
