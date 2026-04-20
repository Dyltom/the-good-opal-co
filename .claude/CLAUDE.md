# The Good Opal Co - Next.js E-commerce (v1.0.0)
Dylan Henderson | dylanh@trialbayservices.com.au

## 🚨 Critical Rules
- **Server Components First:** Use `'use client'` only when absolutely needed
- **Cart State:** Cookie-based (NOT Context) for SSR compatibility  
- **No `any` Types:** Use proper TypeScript types or `unknown` with guards
- **Commit Often:** Working code gets committed immediately - no batching

## 📁 Project Structure
- **Routes:** `app/(marketing)/`, `app/(payload)/admin`, `app/api/webhooks/`
- **Components:** `components/{ui,product,cart,navigation,sections}/`
- **Logic:** `lib/{utils,validations,accessibility,animations}/`, `hooks/`
- **CMS:** `payload/collections/`, Payload 3.60 + PostgreSQL
- **Never read:** `node_modules/`, `.next/`, `docker-data/`

## 🔧 Commands
```bash
pnpm dev                 # Dev server (port 8412)
pnpm validate           # Type check + lint + test  
pnpm test:e2e           # Playwright E2E tests
pnpm docker:up          # Start PostgreSQL
pnpm payload generate   # Generate CMS types
```

## 💡 Key Patterns
- **Server Actions:** `app/(marketing)/{page}/actions.ts` for mutations
- **Cart Updates:** Dispatch `cart-updated` custom event after changes
- **Type Safety:** Import from `@/types/payload-types` (auto-generated)
- **Styling:** `cn()` utility, design tokens from `styles/tokens.ts`
- **Forms:** React Hook Form + Zod validation at boundaries

## 🎯 Karpathy-Inspired Coding Principles

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First  
**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"  
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check] 
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## 🏗️ Architecture Details

**Data Flow:** Browser → Server Components → Server Actions → Payload CMS → PostgreSQL

**Payment Flow:** Cart → Checkout Server Action → Stripe Session → Webhook → Order Creation

**Key Files:**
- `lib/cart.ts` - Cookie-based cart utilities
- `app/api/webhooks/stripe/route.ts` - Order processing  
- `payload.config.ts` - CMS configuration
- `middleware.ts` - Auth, rate limiting, security headers

**Stripe Integration:** AUD pricing, free shipping >$500, webhook-driven stock updates

**A11Y Standards:** WCAG AA compliance, skip navigation, focus management, screen reader tested

For detailed technical docs see `/docs/ARCHITECTURE.md`