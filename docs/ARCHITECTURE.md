# Architecture

## Runtime

- Next.js 16 App Router and React 19 on Vercel Functions.
- Payload CMS 3 for staff admin and content/data access.
- Neon PostgreSQL 16 as the relational system of record.
- Vercel Blob for Payload media.
- Stripe Checkout and signed webhooks for payment and fulfilment state.
- Resend for transactional and newsletter email.
- Upstash Redis for distributed public-action rate limits.

Products, customers, orders, staff users, posts, newsletter state, and migration
history live in PostgreSQL. Blob stores uploaded media. Redis stores only expiring
rate-limit counters.

## Application boundaries

- Public routes: `src/app/(marketing)/`.
- Payload admin: `src/app/(payload)/admin/`.
- Stripe webhook: `src/app/api/webhooks/stripe/route.ts`.
- Reusable components: `src/components/`.
- Server logic: `src/lib/`.
- Payload collections: `src/payload/collections/`.
- Committed migrations: `src/migrations/`.
- Unit tests: `src/**/__tests__/` and `src/test/`.
- Browser tests: `e2e/`.

Locale activation is an atomic content, commerce, routing, and discovery release.
See [INTERNATIONALISATION.md](./INTERNATIONALISATION.md) before publishing any
locale beyond the reviewed `en-AU` default.

## State and trust model

- React Server Components own data reads unless browser interaction is required.
- Cart identity is an HTTP-only cookie containing product IDs and quantities only.
  Product names, prices, images, and stock are hydrated from Payload server-side.
- Stripe line items are the paid source of truth during webhook fulfilment.
- Order, customer, and stock changes run in a serializable database transaction.
- Customer accounts are intentionally absent. Buyers use guest checkout and
  rate-limited order tracking; staff authenticate only through Payload `/admin`.
- Public mutations validate at the server boundary and use distributed limits in
  production.
- Analytics mounts only after analytics consent.

## Deployment

Required variables and resource topology are documented in
[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md). Production configuration fails
fast when database, media, payment, email, owner, canonical URL, or rate-limit
credentials are missing.

Committed migrations run before the Vercel build. Preview and Production must use
separate Neon databases, Blob stores, Redis resources, and Stripe credentials.
