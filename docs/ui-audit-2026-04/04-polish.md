# 🟢 Polish

Small refinements that improve feel without being blockers.

---

## 16. Hero stats "207 / 45 / 100%" lack labels

**Where:** `src/components/sections/HomeHero.tsx`.

The three stat numbers are visible on the rendered hero but the adjacent labels either don't render or are illegibly small. Numbers on their own read as decoration, not social proof.

**Fix:** ensure the labels are present, ≥ 12px, with enough contrast against the dark hero. Consider: `Opals sold · Five-star reviews · Australian sourced`.

**Screenshot:** [`screenshots/01-home-desktop.png`](./screenshots/01-home-desktop.png).

---

## 17. Mobile hero stacks the product preview card over the headline

**Where:** `HomeHero.tsx`, mobile breakpoint.

On 390px wide the product preview card sits above the headline in a way that crowds both. Either stack cleanly (headline → preview card → CTAs) or drop the preview card below the fold on mobile.

**Screenshot:** [`screenshots/06-home-mobile.png`](./screenshots/06-home-mobile.png).

---

## 18. PDP body uses ~45% of horizontal space

**Where:** `src/app/(marketing)/store/[slug]/page.tsx`.

The product image column has noticeable whitespace on its right, and the details column doesn't expand to fill. At 1440px this looks under-designed.

**Fix options:**

- Use a 55/45 or 60/40 split instead of a fixed-width image column.
- Let the image column include a vertical thumbnail strip on the left at lg+.
- Increase image size to hero-scale on xl+.

**Screenshot:** [`screenshots/03-pdp-desktop.png`](./screenshots/03-pdp-desktop.png).

---

## 19. Unused shadcn primitives

**Where:** `src/components/ui/`.

Candidates for removal (no grep hits in `src/app` or `src/components`):

- `toggle.tsx`
- `toggle-group.tsx`
- `slider.tsx`
- `pagination.tsx`

Note: once you implement proper store pagination (critical item #3), keep `pagination.tsx`.

---

## 20. Two empty-state implementations

**Where:**

- `src/components/ui/empty-state.tsx`
- `src/components/ui/EmptyStates.tsx`

Same concern, different component. Pick one. Naming convention note: the file named `EmptyStates.tsx` (PascalCase, plural) is the outlier — the rest of the `ui/` folder uses kebab-case for shadcn primitives.
