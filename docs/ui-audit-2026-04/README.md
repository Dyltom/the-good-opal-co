# UI Audit — April 2026

Audit of the `ui/hero-improvements` branch covering home, store, PDP, cart, and about at desktop (1440×900) and mobile (390×844), plus Lighthouse (desktop, home).

## Summary

The branch **does not build** — `ssr: false` inside `next/dynamic()` in a Server Component blocks every route under `(marketing)`. Once that's unblocked, the visible issues fall into three themes:

1. **Trust / legal** — the founder story still contradicts itself between pages, despite the earlier remediation logged in `UI_IMPROVEMENTS.md`.
2. **Store scalability** — the product index renders 126 cards on a single ~15,800px page with no pagination.
3. **Accessibility polish** — a handful of WCAG AA failures (contrast, touch size, heading order, ARIA) that Lighthouse catches.

Lighthouse (desktop, home): **Accessibility 86 · Best Practices 100 · SEO 92**.

## How this audit is organised

| File | Content |
|------|---------|
| [`01-critical.md`](./01-critical.md) | Site-breaking and legal/credibility issues. Fix first. |
| [`02-high-priority.md`](./02-high-priority.md) | Visible bugs + WCAG AA violations (Lighthouse-flagged). |
| [`03-medium-priority.md`](./03-medium-priority.md) | Code-health and maintainability issues. |
| [`04-polish.md`](./04-polish.md) | Small visual and UX refinements. |
| [`05-lighthouse.md`](./05-lighthouse.md) | Raw Lighthouse findings with offending selectors. |
| [`screenshots/`](./screenshots) | Captured states referenced in each doc. |

## Suggested sequencing

1. Land `01-critical.md` today — the site is currently down on this branch.
2. Batch `02-high-priority.md` into one PR — they're all small, focused fixes.
3. Schedule `03-medium-priority.md` for the next code-health sprint.
4. `04-polish.md` can be incremental.

## Method

- Ran `pnpm dev` on port 8412, loaded each route in Chrome via chrome-devtools MCP.
- Full-page screenshots captured at desktop and mobile viewports.
- Console messages and Lighthouse (navigation mode, desktop) collected on the home route.
- Code map produced by a parallel exploration pass; specific line numbers referenced in each doc.

All file paths in the sub-docs are relative to the repo root (e.g. `src/app/(marketing)/page.tsx:39`).
