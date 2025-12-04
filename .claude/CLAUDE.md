# The Good Opal Co - Claude Code Guidelines

> Australian opal jewelry e-commerce platform. Next.js 15 + Payload CMS + Stripe.

## Architecture Quick Reference

```
src/
├── app/(marketing)/    # Public routes (store, cart, checkout, blog)
├── app/(payload)/      # CMS admin (/admin)
├── app/api/webhooks/   # Stripe webhooks only
├── components/         # UI primitives + feature components
│   ├── ui/            # Base UI components (Button, Sheet, Toast, etc.)
│   ├── product/       # Product cards, galleries, filters
│   ├── cart/          # Cart drawer, buttons, item components
│   ├── navigation/    # Header, Footer, Skip navigation
│   ├── sections/      # Hero sections, carousels
│   ├── trust/         # Trust signals, authenticity badges
│   └── layout/        # Page transitions, error boundaries
├── hooks/             # Custom React hooks
├── lib/               # Utilities and core functionality
│   ├── accessibility/ # WCAG compliance utilities
│   ├── animations/    # Framer Motion configurations
│   ├── utils/         # Helper functions, cn(), formatters
│   └── validations/   # Zod schemas, form validation
├── payload/           # CMS collections (Products, Orders, Customers)
├── styles/            # Design tokens, global styles
└── types/             # TypeScript definitions
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
pnpm test             # Run Vitest unit tests
pnpm type-check       # TypeScript type checking only
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting
pnpm payload generate # Generate Payload types
```

## UI/UX Standards (2025)

### Design System
- **Design Tokens**: Use tokens from `src/styles/tokens.ts` for consistency
- **Color System**: WCAG AA compliant colors with accessible variants
- **Loading States**: Always show loading feedback (spinners, skeletons)
- **Empty States**: Helpful messages when no content exists
- **Error Handling**: User-friendly error messages with recovery actions
- **Animations**: Subtle, purposeful animations via Framer Motion

### Accessibility (A11Y)
- **Skip Navigation**: Skip to main content link
- **Focus Management**: Trap focus in modals/drawers
- **ARIA Labels**: Proper labels for interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Tested with NVDA/JAWS

### Performance
- **Lazy Loading**: Images and heavy components
- **Optimistic UI**: Immediate feedback for user actions
- **Code Splitting**: Route-based and component splitting
- **Image Optimization**: Next.js Image component with blur placeholders

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/cart.ts` | Cookie-based cart utilities |
| `src/app/(marketing)/cart/actions.ts` | Cart server actions |
| `src/app/(marketing)/checkout/actions.ts` | Stripe checkout logic |
| `src/app/api/webhooks/stripe/route.ts` | Order creation, stock updates |
| `src/payload.config.ts` | CMS configuration |
| `src/styles/tokens.ts` | Design system tokens |
| `src/lib/accessibility/contrast.ts` | WCAG contrast utilities |
| `src/lib/animations/variants.ts` | Framer Motion animation presets |
| `src/components/ui/LoadingStates.tsx` | Reusable loading components |
| `src/components/ui/EmptyStates.tsx` | Empty state components |

## Code Style

- Functional components with TypeScript
- Named exports for components, default for pages
- Use `cn()` from `@/lib/utils` for conditional classes
- Prefer composition over inheritance
- Extract reusable logic to custom hooks in `src/hooks/`

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useOptimisticCart` | Optimistic cart updates with rollback |
| `useUserPreferences` | Persistent user settings (theme, currency) |
| `useFocusTrap` | Trap focus within modals/drawers |
| `useMediaQuery` | Responsive breakpoint detection |
| `useFormState` | Form state management with validation |
| `useToast` | Toast notification system |

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
- Blog posts migrated from WordPress - 17 posts with SEO metadata
- UI components follow 2025 best practices with accessibility built-in
- All colors are WCAG AA compliant with accessible variants available
- Use design tokens for consistent spacing, typography, and animations

## Claude Code Productivity Tips

### Model Selection (Cost Optimization)
- Use **Sonnet** for routine coding, refactoring, tests (~80% cheaper)
- Use **Opus** for architecture decisions, complex algorithms
- Switch with `/model sonnet` or `/model opus`

### Useful Slash Commands
- `/project:store` - Implement store features following project patterns
- `/project:deploy-check` - Pre-deployment verification
- `/user:morning` - Daily standup check
- `/user:ready` - Pre-commit verification
- `/user:pr` - Create pull request with AI
- `/user:tdd` - Test-driven development cycle

### Context Management
- Use `/clear` between distinct tasks to reset context
- Use `/compact` before major features to free token space
- Keep prompts specific - reduces back-and-forth

### Research & Documentation

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
