# 🔴 Critical — fix before anything else

These block the site, violate consumer-law guidance, or make the primary store experience unusable.

---

## 1. Build error takes down every `(marketing)` route

**Severity:** Blocking — no page in the marketing group renders. Visitors see the Next.js error overlay.

**Where:** `src/app/(marketing)/page.tsx:39`

```tsx
const TrustMarquee = dynamic(
  () => import('@/components/sections').then((mod) => mod.TrustMarquee),
  {
    loading: () => <div className="h-20 animate-pulse bg-gray-50" />,
    ssr: false, // Not critical for SEO   ← rejected by Next 15 in a Server Component
  }
)
```

Next 15 does not allow `ssr: false` inside `next/dynamic()` when the caller is a Server Component. Because `page.tsx` has no `'use client'` directive, the entire `(marketing)` route group fails to compile and the dev/prod build throws on load.

**Fix options (pick one):**

- **Simplest:** delete the `ssr: false` line. `TrustMarquee` is small; letting it SSR is fine.
- **If you really want to skip SSR:** move the dynamic import into a thin client wrapper component and render that from the server page.

**Verification:** `pnpm dev`, visit `/`, confirm the marquee renders without the error overlay.

**Screenshot:** [`screenshots/01-home-desktop.png`](./screenshots/01-home-desktop.png) — currently shows only the Next.js error screen.

**✅ Fixed — 2026-04-22 (dyltom):**
- Removed the `ssr: false` line from the `TrustMarquee` dynamic import in `src/app/(marketing)/page.tsx:35-40`. Kept the loading skeleton; let the marquee SSR since it's small.
- Added regression test `src/app/(marketing)/__tests__/home-page.test.ts` that parses the page source and fails if (a) `'use client'` is ever added without revisiting the dynamic imports, or (b) any `dynamic()` call re-introduces `ssr: false`.
- Verified: `curl http://localhost:8412/` returns HTTP 200, hero `<h1>` renders, no `Unhandled Runtime Error` / `error-overlay__` / `__nextjs_original-stack-frame` markers in the HTML.

---

## 2. Founder story contradicts itself across pages

**Severity:** Trust / credibility. Flagged in the earlier `UI_IMPROVEMENTS.md` audit as "fixed" (commit `681cb72`), but the regression is live.

**Where:**

| File | Line | Name used |
|------|------|-----------|
| `src/app/(marketing)/about/page.tsx` | 14, 132, 159, 166, 278, 286, 292, 295 | **Stephanie Caruana** |
| `src/app/(marketing)/courses/page.tsx` | 116 | **Sarah Henderson** |
| `src/app/(marketing)/blog/[slug]/page.tsx` | 116 | **Sarah Henderson** (fallback) |
| `src/scripts/seed-blog-posts.ts` | 750 | **Sarah Henderson** |

The About page rendered headings in the audit read "Meet Stephanie" and "Stephanie Caruana", while course instructor and blog author attribution still point at Sarah Henderson.

**Fix:**

1. Decide the canonical founder story.
2. Grep the repo: `rg -l 'Henderson|Caruana|Stephanie'` should return only files you've intentionally touched.
3. Update the About page metadata (`description` at line 14) alongside the visible copy.

**Why it matters:** a luxury-goods site with inconsistent founder attribution reads as AI-generated or fraudulent. The earlier audit explicitly called this out as an ACL (Australian Consumer Law) concern.

**✅ Fixed — 2026-04-22 (dyltom):**
- Canonicalised on **Stephanie Caruana** (About page is the source of truth). Replaced "Sarah Henderson" in:
  - `src/app/(marketing)/courses/page.tsx:116-120` (instructor card — also renamed the image reference to `/images/instructor-stephanie.jpg` and dropped the "Co-" prefix on the role)
  - `src/app/(marketing)/blog/[slug]/page.tsx:116` (fallback author label)
  - `src/scripts/seed-blog-posts.ts:750` (seeder default)
- Added regression test `src/test/founder-consistency.test.ts` that fails if "Sarah Henderson" reappears in the three files above and asserts the About page still names Stephanie Caruana.
- Verified: `curl /about` → "Stephanie Caruana" x10, 0 "Sarah Henderson". `curl /courses` → "Stephanie Caruana" x3, 0 "Sarah Henderson".
- ⚠️ Follow-up: an instructor headshot at `/images/instructor-stephanie.jpg` may not exist yet — flagging for next ticket rather than fabricating a photo.

---

## 3. Store listing ships 126 products on one page

**Severity:** Usability blocker — the page is ~15,800px tall on desktop. No pagination, no infinite scroll, no "load more".

**Evidence:**

```js
// Evaluated in-page on /store
{ productCount: 126, hasPagination: false, loadMoreButton: false }
```

**Where:** `src/app/(marketing)/store/page.tsx` (listing), plus any server query feeding it.

**Impact:**

- Huge LCP and CLS on the catalog page.
- Mobile scroll becomes unusable.
- Image bandwidth is uncapped.

**Fix options:**

- **Pagination:** URL-based (`?page=2`). Preserves shareable links, good for SEO.
- **Infinite scroll:** nicer on mobile, but needs a fallback crawler path.
- **Hybrid:** show 24 initially, "Load more" button that appends, `?page=N` for SEO.

**Ancillary fixes to batch here:**

- Cap image sizes via `sizes` prop so 5-column desktop grid doesn't request full-width images.
- Add skeleton loading on the initial server render.

**Screenshot:** [`screenshots/02-store-desktop.png`](./screenshots/02-store-desktop.png) — full page, note the absurd vertical extent.

**✅ Fixed — 2026-04-22 (dyltom):**
- Added URL-based pagination (`?page=N`) with a cap of **24 products per page**. Went with the audit's *Pagination* option, not *Hybrid* / *Load more*, because it keeps shareable/crawlable links and pairs best with the existing client-side filters.
- Extracted a standalone utility at `src/lib/pagination.ts` (`paginate` / `clampPage` / `totalPages`) with unit tests in `src/lib/__tests__/pagination.test.ts` (11 cases covering empty lists, past-end pages, uneven divisions, NaN clamping).
- Wired it into `src/app/(marketing)/store/store-content.tsx`: added `page` state seeded from `useSearchParams`, reset to 1 on any filter/sort/search change (stale page numbers would otherwise show an empty grid), and syncs `page=N` into the URL via the existing query-param sync effect. Only `pagedProducts` is mapped over in the grid — guarded by a source-level regression test.
- Added a local `StorePagination` sub-component (button-based, not Link-based) to avoid double-navigation with the URL-sync effect. Includes `aria-current="page"`, disabled prev/next, and ellipsis for long ranges.
- Tightened `<Image sizes>` on `ProductCard` (`src/components/product/ProductCard.tsx:149`) to reflect the real 5-column 2xl grid (`20vw` at ≥1280px instead of `25vw`) — stops the browser fetching oversized images.
- Verified: `/store` renders exactly **24** cards on page 1 with pagination nav present; `/store?page=2` SSRs with the "2" button `aria-current="page"` and Previous re-enabled, also 24 cards.
- ⚠️ Known limitation: initial server query still fetches up to 200 products (`limit: 200`). Client-side filters need the full set, so cutting the server payload means moving filters/sort server-side too — noted for a follow-up ticket rather than expanding this fix.
