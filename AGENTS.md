# The Good Opal Co - Agent Instructions

Codex is the primary coding agent for this repository. Keep durable project rules in
this file, keep repeatable workflows in `.agents/skills/`, and keep personal
preferences in `~/.codex/AGENTS.md`.

## Priority Rules

- Use Server Components first. Add `'use client'` only for browser APIs, stateful
  interaction, effects, or client-only libraries.
- Keep cart state cookie-based for SSR compatibility. Do not introduce React
  Context as the cart source of truth.
- Do not use `any`. Use exact TypeScript types or `unknown` with guards.
- Touch only files required by the task. Do not refactor, reformat, or delete
  unrelated code.
- Protect user work. If the worktree is dirty, stage or commit only the files
  that belong to the current task.
- Never read generated, dependency, report, or backup folders unless explicitly
  asked: `node_modules/`, `.next/`, `docker-data/`, `coverage/`,
  `playwright-report/`, `test-results/`, `gdopalco-bkup/`, `media/`.
- Commit verified logical slices when the task includes shipping changes. Do not
  batch unrelated work into one commit.

## Repository Map

- App Router routes: `src/app/(marketing)/`, `src/app/(payload)/admin`,
  `src/app/api/webhooks/`.
- Components: `src/components/{ui,product,cart,navigation,sections,store}/`.
- Logic: `src/lib/{utils,validations,accessibility,animations}/`, `src/hooks/`.
- CMS: `src/payload/collections/`, `src/payload.config.ts`, generated types in
  `src/types/payload-types.ts`.
- Tests: unit tests in `src/**/__tests__/` and `src/test/`, Playwright tests in
  `e2e/` and `tests/`.
- Project skills: `.agents/skills/`. Use these instead of Claude-style custom
  slash commands.
- Legacy Claude setup: `.claude/` is compatibility history. Do not update it
  unless the user specifically asks for Claude Code support.

## Commands

```bash
pnpm install             # Install dependencies
pnpm dev                 # Dev server on port 8412
pnpm validate            # TypeScript + ESLint
pnpm validate:build      # TypeScript + ESLint + production build
pnpm test:unit --run     # Vitest unit tests
pnpm test:e2e            # Playwright E2E tests
pnpm docker:up           # Start PostgreSQL
pnpm docker:down         # Stop PostgreSQL
pnpm payload generate    # Regenerate Payload types after schema changes
pnpm seed                # Seed local data
```

`pnpm test` is a placeholder script. Use `pnpm test:unit --run` or
`pnpm test:e2e` for real checks.

## Working Method

- Start by reading the relevant files and checking existing patterns. Prefer
  `rg` and narrow file reads over broad directory scans.
- For multi-step work, state assumptions, success criteria, and a short plan
  before editing.
- Choose the smallest implementation that satisfies the request. Avoid
  speculative abstractions, new dependencies, and broad rewrites.
- When behavior changes, add or update tests at the nearest practical level.
- If a command fails, diagnose the first real error before changing code.
- Before finishing, review the diff for unrelated changes, missing tests, and
  risky patterns.

## Verification Matrix

- Docs or config only: run a targeted formatter/checker for changed files and
  parse structured config where possible.
- TypeScript utilities, hooks, or components: run `pnpm validate` and the
  relevant `pnpm test:unit --run ...` target.
- Server Actions, cart, checkout, Stripe, Payload, or webhooks: run
  `pnpm validate`, relevant unit tests, and targeted Playwright coverage when
  the flow is user-facing.
- Payload collection/schema changes: run `pnpm payload generate` and include the
  generated type changes.
- Frontend visual changes: run the dev server and verify in the Codex app
  browser at desktop and mobile widths.
- Deployment-sensitive changes: run `pnpm validate:build`.

## Next.js and Ecommerce Patterns

- Server Actions live near the route that owns the mutation, usually
  `src/app/(marketing)/{page}/actions.ts`.
- Validate all Server Action inputs with Zod at the boundary.
- Return typed action results that callers can narrow without string parsing.
- Dispatch the `cart-updated` custom event after client-visible cart mutations.
- Use Payload through existing helpers and generated types from
  `@/types/payload-types`.
- Price units vary in older code paths. Confirm whether a path expects dollars
  or cents before arithmetic, formatting, discounts, or Stripe `unit_amount`.
  `formatPrice` expects cents; `formatCurrency` expects dollars.
- Free shipping applies over AUD 500. Keep shipping and stock rules centralized,
  and preserve the unit convention already used by the touched path.
- Stripe stock updates are webhook-driven. Do not decrement stock in checkout
  session creation.

## UI and Typography

- Use the existing `cn()` utility and design tokens from `src/styles/tokens.ts`.
- Headings use `font-serif` (EB Garamond), body text uses `font-sans`
  (Merriweather), and `font-accent` (Dancing Script) is reserved for emotional
  moments such as success pages, taglines, and celebrations.
- Preserve the warm fairytale aesthetic. Avoid corporate, sharp, or generic SaaS
  visual language.
- Keep interactive controls accessible: labels, keyboard support, focus states,
  semantic elements, and WCAG AA contrast.

## Codex Workflow

- Use `$nextjs-ecommerce` for store, cart, checkout, Stripe, Payload product,
  order, pricing, inventory, or webhook work.
- Use `$impeccable` for frontend design, redesign, UI critique, layout,
  typography, motion, accessibility polish, edge-case hardening, and visual
  quality review. For substantial visible UI work, read `PRODUCT.md` and
  `DESIGN.md` first, then use the relevant Impeccable route: `shape`, `layout`,
  `typeset`, `critique`, `audit`, `harden`, or `polish`.
- Use repo skills in `.agents/skills/` for repeated workflows such as component
  creation, Server Actions, Payload collections, tests, reviews, debugging, and
  deployment checks.
- Use built-in Codex slash commands for session control: `/status`, `/diff`,
  `/review`, `/compact`, `/plan`, and `/mcp`.
- Do not create `.codex/commands/`; Codex uses built-in slash commands and
  skills for repeatable workflows.
- Use MCP only for external context that changes or cannot live in the repo.

## Documentation

- Product/design AI context: `PRODUCT.md` and `DESIGN.md`.
- Architecture: `docs/ARCHITECTURE.md`.
- Testing: `docs/TESTING.md` and `docs/VERIFICATION.md`.
- Design system: `docs/DESIGN_SYSTEM.md`.
- Typography: `docs/TYPOGRAPHY_GUIDE.md`.
- Deployment: `docs/DEPLOYMENT_CHECKLIST.md`.
