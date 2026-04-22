# 🟡 Medium priority — code health

Not user-visible, but each of these is a small trip hazard for future work.

---

## 10. Duplicate product-card components

**Where:**

- `src/components/product/ProductCard.tsx` — the main, three-variant (`default` / `museum` / `minimal`) card. Line 68 has a dead `hoverLift` object.
- `src/components/product/EnhancedProductCard.tsx` — a parallel implementation with extra micro-interactions.

Neither imports the other. Both are referenced across the app.

**Fix:** pick one as canonical, port any unique interactions from the other, delete the loser. Also remove the dead `hoverLift` object at `ProductCard.tsx:68`.

---

## 11. `globals.css` appears to be missing from `src/styles/`

**Where:** `src/styles/tokens.ts` exports CSS custom properties (`--surface-primary`, `--content-inverse`, `--brand-opal`, etc.) and a generator function, but the expected `src/styles/globals.css` (or equivalent) that actually *injects* those variables wasn't found during the exploration pass.

**To verify:**

```bash
rg -l '@layer base|:root\s*\{' src/
```

If the tokens are imported into the layout from somewhere else, update `tokens.ts` to point at it. If they're genuinely not wired, the semantic tokens are unused — either delete them or wire them up.

---

## 12. Legacy color tokens unused

**Where:** `tailwind.config.ts:95-120`.

Tokens `opal-blue`, `opal-turquoise`, `opal-pink`, `opal-purple`, `opal-gold` do not appear in any `rg` match across `src/`. They bloat the Tailwind JIT and confuse the palette.

**Fix:** delete them. Keep the ones you actually ship (`opal-electric` etc.).

---

## 13. `Math.random()` still generates UI content

**Severity:** The earlier audit (`UI_IMPROVEMENTS.md` critical issue #4) claimed this was fully removed. It wasn't.

**Where:**

- `src/components/product/RecentPurchaseNotification.tsx:41,42`
- `src/components/product/ProductFinderQuiz.tsx`
- `src/scripts/simple-image-update.ts:64` (script — less important, but flag it)

**Why it matters:** if this is rendering fake "someone just bought X" notifications or fake ratings to real visitors, it's the same ACL exposure the last audit flagged.

**Fix:** replace with either (a) real Payload data, or (b) delete the component if there's no source of truth.

---

## 14. Next 16 will break on unconfigured image quality

**Severity:** Forward-compat.

**Evidence:** 5 console warnings on the home:

> Image with src "…" is using quality "85" which is not configured in `images.qualities`. This config will be required starting in Next.js 16.

**Fix:** add to `next.config.ts`:

```ts
images: {
  qualities: [75, 85, 100],
  // …existing config
}
```

---

## 15. Hardcoded social URLs in Footer

**Where:** `src/components/navigation/Footer.tsx:74-77` — Instagram / Facebook / TikTok URLs are literals.

**Fix:** move to a `siteSettings` Payload global (or the existing CMS settings if one exists). This is the same pattern as the contact info consolidation that was done earlier.
