# The Good Opal Co - Site Improvement Action Plan

**Target Audience:** Claude Code agents implementing fixes  
**Generated:** 2026-04-21  
**Validation Required:** All changes must be tested before committing

---

## 🚨 Critical Issues (Fix Immediately)

### 1. Store Search Missing Label (WCAG Violation)
**File:** `src/app/(marketing)/store/store-content.tsx:193-198`
**Issue:** Search input has no label, violating WCAG 2.1 accessibility standards
**Fix:** Add proper label element or aria-label
**Validation:** Screen reader test, axe-core scan

```tsx
// Before: Raw input with only placeholder
<input placeholder="Search products..." />

// After: Proper label association
<label htmlFor="store-search" className="sr-only">Search products</label>
<input 
  id="store-search"
  placeholder="Search products..." 
  aria-label="Search products"
/>
```

### 2. Cart Dialog JSX Structure Bug
**File:** `src/app/(marketing)/cart/cart-content.tsx:192-199`
**Issue:** `CartClearConfirmDialog` placed between two `</Container>` tags causing invalid nesting
**Fix:** Move dialog inside proper container or render as portal
**Validation:** React dev tools warnings check, visual layout verification

### 3. No Stock Validation on Add to Cart
**File:** `src/lib/cart.ts`
**Issue:** Users can add more items than available stock
**Fix:** Add stock validation in addToCart function
**Validation:** Test overselling scenarios, verify error handling

```tsx
// Add to addToCart function
const { docs: [product] } = await payload.find({
  collection: 'products',
  where: { id: { equals: productId } }
});

if (!product || product.stock < requestedQuantity + currentCartQuantity) {
  throw new Error('Insufficient stock available');
}
```

### 4. Broken Category Filter Link
**File:** `src/app/(marketing)/page.tsx:120`
**Issue:** Category cards link to `/store` instead of `/store?category=<name>`
**Fix:** Update href to include category parameter
**Validation:** Click each category card, verify filtered results appear

### 5. Dead Link: Care Guide
**File:** `src/app/(marketing)/contact/page.tsx:163`
**Issue:** Link to `/care-guide` returns 404
**Fix:** Either create the page or update the link target
**Validation:** Click link, verify destination exists

### 6. ACL Compliance: Hardcoded Unsubstantiated Stats
**File:** `src/components/sections/ProductHero.tsx:155-167`
**Issue:** "15K+ Happy Customers", "4.9★ Average Rating" are hardcoded claims
**Fix:** Remove or replace with verifiable data from CMS
**Validation:** Legal review, verify claims can be substantiated

### 7. Three Different Contact Emails
**Files:** Multiple files contain different email addresses
**Issue:** Inconsistent contact information confuses customers
**Fix:** Standardize on single email across all pages
**Validation:** Search codebase for all email references, verify consistency

---

## 🔧 High Priority Fixes (Next Sprint)

### 8. Centralize Navigation Items
**Files:** 8+ files contain duplicate nav arrays
**Issue:** Adding/removing nav items requires changes in multiple places
**Fix:** Create `src/lib/constants/navigation.ts` with shared nav array
**Validation:** Verify all nav instances use shared constant, test nav functionality

### 9. Mobile Nav Accessibility
**File:** `src/components/navigation/Navigation.tsx:201`
**Issue:** Hamburger button missing aria-expanded and aria-controls
**Fix:** Add proper ARIA attributes
**Validation:** Screen reader test, keyboard navigation test

```tsx
<button
  aria-expanded={mobileMenuOpen}
  aria-controls="mobile-menu"
  aria-label="Toggle navigation menu"
>
```

### 10. Store Filters Not Persisted in URL
**File:** `src/app/(marketing)/store/store-content.tsx`
**Issue:** Filter state lost on refresh, not shareable
**Fix:** Sync filter/sort state with URL parameters using useSearchParams
**Validation:** Apply filters, refresh page, verify filters persist

### 11. Cart Price Staleness Risk
**File:** `src/lib/cart.ts`
**Issue:** Prices stored at add-time, not re-validated at checkout
**Fix:** Re-fetch prices in checkout action before Stripe session
**Validation:** Update product price, verify cart shows updated price at checkout

### 12. Font Naming Semantic Mismatch
**Files:** `src/styles/globals.css`, `tailwind.config.ts`
**Issue:** `--font-sans` maps to serif font (Merriweather)
**Fix:** Correct CSS variable names to match font types
**Validation:** Visual check typography renders correctly after rename

### 13. Emoji Decorators Need aria-hidden
**Files:** Multiple pages use decorative emoji without aria-hidden
**Issue:** Screen readers announce decorative emoji disruptively
**Fix:** Wrap emoji in `<span aria-hidden="true">`
**Validation:** Screen reader test headings with emoji

### 14. Shipping Promise Inconsistency
**Files:** Multiple components claim different shipping offers
**Issue:** "Free Express" vs "Free Standard" vs "$500+" inconsistency
**Fix:** Standardize shipping promises, make data-driven
**Validation:** Audit all shipping claims, verify checkout matches promises

---

## ⚡ Performance & UX Improvements

### 15. Duplicate Database Queries on Product Pages
**File:** `src/app/(marketing)/store/[slug]/page.tsx:31,113`
**Issue:** generateMetadata and page component both fetch same product
**Fix:** Use React.cache() to deduplicate queries
**Validation:** Check network tab, verify only one query per product page

### 16. Store Page Loads 200 Products
**File:** `src/app/(marketing)/store/page.tsx:89`
**Issue:** Large payload slows initial load, no pagination
**Fix:** Implement pagination or virtual scrolling
**Validation:** Network tab payload size, scroll performance testing

### 17. ProductCard Animation Performance
**File:** `src/components/product/ProductCard.tsx:101`
**Issue:** Long staggered delays (2s for 20th card)
**Fix:** Cap animation delay, respect prefers-reduced-motion
**Validation:** Test with 20+ products, verify reasonable animation timing

### 18. Touch Device Quick Actions
**File:** `src/components/product/ProductCard.tsx`
**Issue:** Hover-only quick actions inaccessible on mobile
**Fix:** Show actions on touch devices using CSS media queries
**Validation:** Test on mobile devices, verify quick actions accessible

---

## 🎨 Visual Consistency Fixes

### 19. OptimizedImage Component Adoption
**Files:** Multiple files use direct next/image instead of OptimizedImage wrapper
**Issue:** Inconsistent image loading, sizing, error handling
**Fix:** Replace all Image imports with OptimizedImage
**Validation:** Visual check image rendering, verify blur placeholders work

### 20. Color Token Standardization
**Files:** Multiple files mix semantic tokens with raw color names
**Issue:** Difficult to maintain color scheme, accessibility inconsistency
**Fix:** Standardize on semantic tokens, update raw color usage
**Validation:** Visual design review, contrast ratio verification

---

## 🧪 Validation Requirements

### Before Every Commit
1. **Type Safety:** `pnpm validate` must pass
2. **Visual Check:** Start dev server, manually test changed pages
3. **Mobile Test:** Verify responsive behavior on mobile viewport
4. **Accessibility:** Basic screen reader test with VoiceOver/NVDA

### For Critical Fixes (Items 1-7)
1. **Cross-browser Test:** Chrome, Firefox, Safari
2. **Screen Reader Test:** Full navigation with assistive technology
3. **Performance Check:** Lighthouse audit scores maintained
4. **Legal Review:** For any marketing claims or compliance-related changes

### For UX Changes (Items 8-14)
1. **User Flow Test:** Complete customer journey from landing to checkout
2. **Mobile Device Test:** Real device testing, not just browser DevTools
3. **Edge Case Test:** Empty states, error conditions, offline scenarios

### For Performance Fixes (Items 15-18)
1. **Network Throttling:** Test on slow 3G connection
2. **Large Dataset:** Test with maximum realistic product count
3. **Memory Profiling:** Check for memory leaks in animations/interactions

---

## 📋 Implementation Order

**Week 1: Critical Fixes**
- Items 1-7 (accessibility violations and business logic bugs)

**Week 2: Navigation & Consistency**  
- Items 8-9 (shared nav constants, mobile nav a11y)
- Items 12-13 (font naming, emoji aria-hidden)

**Week 3: State Management**
- Items 10-11 (URL persistence, price validation)
- Items 14 (shipping promise standardization)

**Week 4: Performance & Polish**
- Items 15-18 (query deduplication, pagination, animations)
- Items 19-20 (image component, color tokens)

---

## 🔍 Testing Checklist Template

Copy this for each fix implementation:

```
## Fix: [Fix Name]
- [ ] Code changes implemented
- [ ] TypeScript compilation passes
- [ ] Manual testing completed  
- [ ] Mobile responsive verified
- [ ] Accessibility tested (screen reader/keyboard)
- [ ] Cross-browser compatibility checked
- [ ] Performance impact assessed
- [ ] Edge cases tested
- [ ] Documentation updated (if applicable)
- [ ] Ready for commit
```

---

## ⚠️ Implementation Notes

1. **Always Read Files First:** Use Read tool before editing to understand context
2. **Surgical Changes Only:** Follow CLAUDE.md principle - touch only what's necessary
3. **Test Before Committing:** Every change must be validated per requirements above
4. **Use Sentry Commit Format:** Follow commit skill conventions for all commits
5. **One Fix Per Commit:** Don't bundle unrelated changes
6. **Update This File:** Remove completed items, add new findings

Remember: This is a production e-commerce site. Every change affects real customers and business operations. Test thoroughly.