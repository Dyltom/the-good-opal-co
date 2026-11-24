---
name: The Good Opal Co
description: Gallery, lights on. A quiet, dense, well-lit room for Australian opals.
colors:
  bg: "#f5f2ec"
  plinth: "#ebe6dd"
  plinth-2: "#e2dcd1"
  ink: "#1c1813"
  ink-2: "#544c42"
  ink-3: "#6f665b"
  rule: "rgba(28,24,19,.12)"
  rule-2: "rgba(28,24,19,.24)"
  accent: "#7a5c24"
  ink-hover: "#3a332b"
  destructive: "#a8321f"
  success: "#3d6b35"
typography:
  display:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(28px, 3vw, 44px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(24px, 2.4vw, 34px)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  label:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
  sm: "2px"
  full: "9999px"
spacing:
  mast: "56px"
  gut: "clamp(12px, 2vw, 28px)"
  sec: "clamp(56px, 8vw, 112px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
    textColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "0 22px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 22px"
    height: "48px"
  card:
    backgroundColor: "{colors.plinth}"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "0"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
---

# Design System: The Good Opal Co

## 1. Overview

**Creative North Star: "Gallery, lights on"**

A small, well-lit gallery. Warm paper walls, stones on plinths, quiet labels,
nothing between the visitor and the opal. The page is dense: pieces start in the
first screen, headers are a title and a line, and there are no tall empty bands.

The stone is the only colour on the page. Everything else is paper, ink and a
little brass.

**Key characteristics:**

- Photographs on plinths, in tight grids, with small captions.
- Warm off-white page, dark ink text, one brass accent.
- Bodoni Moda for names and headings, Schibsted Grotesk for everything you read
  or press.
- Hairline rules instead of cards and shadows.
- Motion that follows the visitor: a soft torch on the wall, photos that carry
  across pages.

## 2. Colours

Tokens live in `tailwind.config.ts` and are named by role.

| Token | Value | Use |
| --- | --- | --- |
| `bg` | #f5f2ec | Page (gallery wall). Set on `html`. |
| `plinth` | #ebe6dd | Behind photos, panels, the drawer footer, menus. |
| `plinth-2` | #e2dcd1 | Hover and pressed panels. |
| `ink` | #1c1813 | Text, primary buttons. Hover #3a332b. |
| `ink-2` | #544c42 | Secondary text, nav links, leads. |
| `ink-3` | #6f665b | Labels, meta, separators. AA on bg and plinth. |
| `rule` / `rule-2` | ink at 12% / 24% | Hairlines; `rule-2` for control outlines. |
| `accent` | #7a5c24 | Brass: focus ring, current page, selection. Never a fill for large areas. |
| `destructive` / `success` | #a8321f / #3d6b35 | Form and status messages only. |

The prototype's #7a7166 and #8c6a2c miss AA on the page, so `ink-3` and
`accent` are darkened to the values above.

### Named rules

**The Untouched Stone Rule.** Never alter how a stone looks. No CSS filters,
tints, blend modes, gradients, scrims or overlays on product or stone photos.
Controls that sit over a photo (quick add) use a solid `bg` surface with a
border and cover only their own box.

**The One Colour Rule.** The opal supplies the colour. No decorative gradients,
glows or tinted bands anywhere in the UI.

## 3. Typography

- **Serif:** Bodoni Moda (`font-serif`), regular weight, italic for product
  names and the "Opal" in the wordmark.
- **Sans:** Schibsted Grotesk (`font-sans`), 15px / 1.55 body.
- Both load through `next/font/google` in `src/app/(marketing)/layout.tsx`.
- Prices use proportional figures: Schibsted Grotesk's tabular figures give the
  decimal point a full figure width ("$350 .00"). Use `tabular-nums` only for
  whole-number counts that must line up.

### Scale

| Role | Size | Notes |
| --- | --- | --- |
| h1 | clamp(28px, 3vw, 44px) / 1.08 | Page titles. One line where possible. |
| h2 | clamp(24px, 2.4vw, 34px) / 1.15 | Section heads. |
| h3 | 20px / 1.25 | Sub-sections. |
| Product name | 15px serif italic | Cards; two-line clamp. |
| Body | 15px / 1.55 | Leads use 16px in `ink-2`, max 60ch. |
| Nav, meta | 13.5px / 12.5px | Sans, `ink-2` / `ink-3`. |
| Label | 12px, 500, uppercase, 0.06em | Footer column heads, facet heads only. |

### Named rules

**No eyebrows.** Do not put a small label above a heading. The heading says it.

**Balanced headings.** Headings use `text-wrap: balance` and -0.01em tracking.

## 4. Layout and elevation

- Page gutter `px-gut` (clamp 12-28px). Section rhythm `py-sec`
  (clamp 56-112px) for major sections, smaller via `Section padding`.
- `PageHeader` is a title and an optional lead: no band, no background, no
  eyebrow. Content starts right under it.
- Flat. Hairline `border-rule` separates things; shadows are reserved for
  floating layers (drawer, dialogs, search suggestions).
- Corners are 2px (`rounded-sm`) on controls; photos are square-cornered.

## 5. Components

### Mast (`SiteNavigation`)

Sticky, 56px (52px under md), `bg` at 88% with a 14px backdrop blur and a
bottom rule. Wordmark left, nav (Shop, Custom rings, Courses, Our story), search,
the Bag button with a count, and a menu button under md. The menu and search open
as plinth panels under the mast and close on Escape, outside click or route
change.

### Footer

Brand column plus Shop, Buying and Studio columns, then the newsletter, factual
trust lines and Stripe payment methods, then legal links. Every route dropped
from the mast lives here.

### Buttons (`src/components/ui/button.tsx`)

- `default`: ink fill, `bg` text, hover #3a332b. One per view where possible.
- `ghost`: transparent with a `rule-2` outline; outline turns ink on hover.
- `quiet`: text only, `ink-2` to `ink`.
- `destructive`, `link`.
- Heights 48 / 44 / 52px; icon buttons are 44px square.

### ProductCard

One link per card. Photo on a `plinth` box at 4:5, then a two-column caption:
italic serif name left, price right (tabular, 500). Under it one meta line:
stone · origin · weight. Sold and Reserved show in the price slot, never on the
photo. Quick add / quick view appear on hover or focus on solid surfaces.

### Breadcrumb, PageHeader, Section, Container

Breadcrumb is 13px `ink-3` with "/" separators and `aria-current` on the
last item. Container `xl` is 90rem with `px-gut`.

### Cart drawer

Right sheet titled "Your bag (n)". Lines show a plinth thumbnail, italic name,
tabular price. The footer is a plinth panel with subtotal, shipping, region, checkout, "View bag" and "Continue shopping".

## 6. Motion

- Easing: `ease-gallery` = cubic-bezier(0.16, 1, 0.3, 1). Colour changes 200ms.
- **Torch** (`src/components/brand/Torch.tsx`): a soft white radial glow fixed
  behind the page (z-index -1). It shows only on bare wall: anything with a
  background, including every photo's plinth, covers it. It follows a fine
  pointer with a light lerp, dims when the pointer leaves, and remembers its
  place across pages. Coarse pointers and reduced motion get it static.
- **Piece morph:** `<ViewTransition name={productImageTransitionName(slug)}
  share="piece">` wraps the card photo and the product gallery, so the photo
  carries from the grid to the product page (Next `experimental.viewTransition`).
  The mast has its own transition name and does not animate. Browsers without
  View Transitions just navigate.
- **Inspect morph:** opening a product photo full screen carries the tile into
  the viewer and back (`opal-inspect`, 0.42s). The viewer shows the full-size
  file, unfiltered, and zooms to its actual pixels with pinch, double-tap, wheel,
  click, the + / - buttons or keys, and pans by drag or arrow keys.
- Card photos scale to 1.025 over 900ms on hover; nothing else moves on hover.
- `prefers-reduced-motion`: all view transitions, transforms and the torch
  movement are off.

## 7. Do and don't

Do:

- Start pages with content: the first screen should show pieces or the task.
- Keep price, stock, shipping, returns and origin close to the buy action.
- Use `formatPrice` (cents) and `formatCurrency` (dollars) for money.
- Provide empty, loading, error, focus, disabled and narrow-screen states.
- Check AA contrast; use `ink-3` as the lightest text.

Don't:

- Put filters, tints, gradients or overlays on stone photos.
- Add tall hero bands, eyebrows, decorative dividers or gradient lines.
- Nest cards, or add shadows to flat page sections.
- Use React Context as the cart source of truth, or decrement stock at checkout
  session creation.
