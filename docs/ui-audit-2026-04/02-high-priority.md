# 🟠 High priority

Visible bugs and WCAG AA failures. All small, focused fixes — ideally one PR.

---

## 4. PDP "You May Also Like" shows empty tiles

**Severity:** Visible bug on every product page.

**Where:** `src/components/product/RelatedProducts.tsx` (component), rendered on `src/app/(marketing)/store/[slug]/page.tsx`.

**Behaviour:** related-product tiles render but their images are grey placeholders with a small circular icon. The query is returning items (the titles and prices are correct) but image URLs aren't resolving.

**Likely causes:**

- Related-product query doesn't populate the `featuredImage` relation.
- Component is reading a field path that no longer exists (e.g. `product.image` vs `product.featuredImage.url`).

**Verification:** open `/store/coober-pedy-white-opal-marquise-cut-parcel-6-cts`, scroll to "You May Also Like", compare with the same product card rendered on `/store`.

**Screenshot:** [`screenshots/03-pdp-desktop.png`](./screenshots/03-pdp-desktop.png).

---

## 5. Color-contrast failure on trust marquee (WCAG AA)

**Severity:** Accessibility — Lighthouse 0 on `color-contrast`.

**Evidence:**

> Element has insufficient color contrast of **2.46** (foreground `#ffffff`, background `#00b4d8`, 14px normal). WCAG AA requires ≥ 4.5:1 for normal text.

**Selector:** `main#main-content > div.bg-opal-electric > div.flex > span.mx-8` — the scrolling trust marquee.

**Fix:** either

- Darken `--opal-electric` (or use `opal-electric-700`) as the marquee background, or
- Switch text to `text-charcoal` / `text-slate-900`, or
- Bump font to `font-semibold` AND size ≥ 18px (AA for large text is 3:1, so 3.0+).

---

## 6. Hero carousel dots are 8×8 px (WCAG 2.5.8)

**Severity:** Accessibility — Lighthouse 0 on `target-size`.

**Evidence:** "Target has insufficient size (8px by 8px, should be at least 24px by 24px)".

**Selector:** `div.order-1 > div.relative > div.flex > button.transition-all` — the hero carousel pagination dots.

**Fix:** the visual dot can stay 8×8 visually, but the button hit area must be ≥ 24×24. Use padding + a transparent box:

```tsx
<button
  aria-label={`Slide ${i + 1}`}
  className="p-2 -m-2" // 24×24 hit area, 8×8 visual
>
  <span className="block h-2 w-2 rounded-full bg-white/60" />
</button>
```

---

## 7. Invalid ARIA on search input

**Severity:** Accessibility — Lighthouse 0 on `aria-allowed-attr`.

**Evidence:** `input.w-full` has `aria-expanded="false"` without being a combobox or button.

**Where:** header search input in `Navigation.tsx`.

**Fix options:**

- If the search doesn't open a listbox of suggestions, **remove `aria-expanded`**.
- If it does, implement the full combobox pattern: `role="combobox"`, `aria-controls`, `aria-autocomplete`, `aria-activedescendant`.

---

## 8. Hero LCP image not marked `priority`

**Severity:** Perf — Next flagged it in the console.

**Evidence:**

> Image with src `/api/media/file/20210627_202327-3.jpg` was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.

**Where:** `src/components/sections/HomeHero.tsx` (hero `<Image>`).

**Fix:**

```tsx
<Image
  src={heroImage}
  alt="..."
  priority
  sizes="(max-width: 768px) 100vw, 50vw"
  fill
/>
```

Expect LCP to drop 300–800ms on cold loads.

---

## 9. Heading order skips levels (WCAG 1.3.1)

**Severity:** Accessibility + SEO — Lighthouse 0 on `heading-order`.

**Evidence:** "Heading order invalid" on `a.block > div.relative > div.p-6 > h3.text-lg` — product cards render `<h3>` without an `<h2>` ancestor in the section.

**Where:** wherever `ProductCard` / `EnhancedProductCard` are used outside of an explicit section with an `<h2>`.

**Fix:** either

- Change product-card title to `<h3>` only when inside a labelled `<section><h2>…</h2></section>`, or
- Drop the card title to a generic element and make the section heading the only `<h2>`/`<h3>` depending on nesting, or
- Expose a `headingLevel` prop on `ProductCard`.
