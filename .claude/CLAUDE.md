# The Good Opal Co - Claude Code Guidelines

> Australian opal jewelry e-commerce platform. Next.js 15 + Payload CMS + Stripe.

## Architecture Quick Reference

```
src/
├── app/(marketing)/    # Public routes (store, cart, checkout, blog)
├── app/(payload)/      # CMS admin (/admin)
├── app/api/webhooks/   # Stripe webhooks only
├── components/         # UI primitives + feature components
├── lib/                # Utilities (cart, stripe, email, payload)
├── payload/            # CMS collections (Products, Orders, Customers)
└── types/              # TypeScript definitions
```

**Data Flow:** Browser → Next.js Server Components → Payload CMS → PostgreSQL

## IMPORTANT: Git Workflow

**COMMIT WORKING CODE REGULARLY** - After completing any meaningful change:
1. Verify the code works (no type errors, tests pass)
2. Stage and commit with a descriptive conventional commit message
3. Do NOT batch up many changes - commit incrementally

This prevents losing work and makes code review easier.

## Core Patterns (MUST FOLLOW)

### Server-First Architecture
- Use **Server Components** by default, `'use client'` only when needed
- Use **Server Actions** for mutations, not API routes
- Cart uses **cookies** (not Context) for SSR compatibility

### SOLID Principles
- **S**: One component = one responsibility
- **O**: Extend via props/composition, don't modify base components
- **L**: Components implementing same interface are interchangeable
- **I**: Small, focused prop interfaces (no god objects)
- **D**: Depend on abstractions (`getPayload()`, hooks, not concrete implementations)

### Type Safety
- NEVER use `any` - use proper types or `unknown` with type guards
- Zod for runtime validation at system boundaries
- Leverage Payload's generated types from `payload-types.ts`

## Common Commands

```bash
pnpm dev              # Start dev server (port 8412)
pnpm docker:up        # Start PostgreSQL
pnpm build            # Production build
pnpm validate         # Type check + lint + test
pnpm test:e2e         # Playwright E2E tests
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/cart.ts` | Cookie-based cart utilities |
| `src/app/(marketing)/cart/actions.ts` | Cart server actions |
| `src/app/(marketing)/checkout/actions.ts` | Stripe checkout logic |
| `src/app/api/webhooks/stripe/route.ts` | Order creation, stock updates |
| `src/payload.config.ts` | CMS configuration |

## Code Style

- Functional components with TypeScript
- Named exports for components, default for pages
- Use `cn()` from `@/lib/utils` for conditional classes
- Prefer composition over inheritance
- Extract reusable logic to custom hooks in `src/hooks/`

## Stripe Integration

Payment flow: Cart → Server Action creates Checkout Session → Redirect to Stripe → Webhook creates Order in Payload

Currency: AUD | Shipping: Free over $500, otherwise $15

## Database

- **PostgreSQL 16** via Docker (`pnpm docker:up`)
- **Drizzle ORM** for migrations
- Collections: Products, Orders, Customers, Users, Media, Posts, Categories

## Testing Requirements

- Unit tests with **Vitest** for utilities and hooks
- E2E tests with **Playwright** for user flows
- Run `pnpm validate` before committing

## Important Notes

- Server Actions handle cart mutations - dispatch `cart-updated` custom event after changes
- Product stock is decremented via Stripe webhook, not checkout action
- Use `getPayload()` from `@/lib/payload` for server-side CMS access
- All prices stored in cents, display with `formatPrice()` from utils

## Research & Documentation

Use MCP servers for enhanced capabilities:
- **sequential-thinking**: Complex problem decomposition and planning
- **memory**: Persistent project knowledge across sessions (global)
- **chrome-devtools**: Browser debugging and testing (global)

For library docs, use web search or fetch documentation directly.

## Git Commits

Follow conventional commits: `type(scope): description`
- `feat:` new feature
- `fix:` bug fix
- `refactor:` code restructuring
- `docs:` documentation
- `test:` tests
- `chore:` maintenance

---

See `docs/ARCHITECTURE.md` for detailed technical documentation.
