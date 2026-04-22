# Lighthouse findings — home, desktop

Run configuration: `mode: navigation`, `device: desktop`, URL `http://localhost:8412/` (after unblocking critical item #1).

## Scores

| Category | Score |
|----------|-------|
| Accessibility | **86** |
| Best Practices | **100** |
| SEO | **92** |
| Performance | not run (requires production build for a meaningful score) |

Audits passed: **48**. Audits failed: **5**.

## Failed audits

Each of these maps to a fix in `02-high-priority.md`.

### `aria-allowed-attr` — score 0

> `[aria-*]` attributes do not match their roles

**Offender:** `div.ml-4 > form.relative > div.relative > input.w-full` — the header search input has `aria-expanded="false"` without a combobox role.

**Fix:** see item #7 in `02-high-priority.md`.

### `color-contrast` — score 0

> Background and foreground colors do not have a sufficient contrast ratio

**Offender:** `main#main-content > div.bg-opal-electric > div.flex > span.mx-8` — white text (`#ffffff`) on `#00b4d8` at 14px yields **2.46:1**, below the 4.5:1 AA threshold.

**Fix:** see item #5 in `02-high-priority.md`.

### `heading-order` — score 0

> Heading elements are not in a sequentially-descending order

**Offender:** `a.block > div.relative > div.p-6 > h3.text-lg` — product cards render `<h3>` inside sections that have no `<h2>`.

**Fix:** see item #9 in `02-high-priority.md`.

### `target-size` — score 0

> Touch targets do not have sufficient size or spacing

**Offender:** `div.order-1 > div.relative > div.flex > button.transition-all` — hero carousel dots are 8×8 px, below the 24×24 px WCAG 2.5.8 minimum.

**Fix:** see item #6 in `02-high-priority.md`.

### `link-text` — score 0

> Links do not have descriptive text (1 link found)

Offending node selector wasn't emitted clearly in the report. Likely an icon-only link (e.g. social icon) missing an `aria-label` or visually-hidden text label.

**Fix:** audit `Footer.tsx` social icons and any icon-only links in `Navigation.tsx`. Each should have either visible text or `aria-label="Instagram"` (etc.).

## Console messages captured during audit

- 5× image quality warnings (`quality="85"` not in `images.qualities`) — covered by item #14.
- 1× LCP image without `priority` prop — covered by item #8.
- 1× form-field issue (`A form field element should have an id or name attribute`, count: 2) — investigate alongside item #7.

## Re-running the audit

```bash
pnpm dev
# In a second terminal, or via chrome-devtools MCP:
# Lighthouse navigation mode against http://localhost:8412/
```

Retain the reports after each fix batch to track trajectory toward 100/100 on Accessibility.
