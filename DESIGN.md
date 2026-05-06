---
name: The Good Opal Co
description: Warm fairytale ecommerce for authentic Australian opals.
colors:
  black-rich: "#0A0A12"
  cream: "#FAF9F6"
  white: "#FFFFFF"
  gray-soft: "#E8E6E3"
  charcoal: "#2C2C2C"
  charcoal-light: "#6B6966"
  opal-electric: "#00B4D8"
  opal-deep: "#0077B6"
  opal-electric-accessible: "#005A87"
  opal-light: "#90E0EF"
  fire-pink: "#FF8FAB"
  fire-pink-dark: "#CC5A7A"
  fire-coral: "#FF6B6B"
  fire-orange: "#FF9F43"
  fire-gold: "#FFD93D"
  opal-emerald: "#2ECC71"
  opal-emerald-dark: "#1A7F41"
  opal-teal: "#48D1CC"
typography:
  display:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0"
  headline:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0"
  title:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.375
    letterSpacing: "0"
rounded:
  sm: "2px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section-gap: "56px"
components:
  button-primary:
    backgroundColor: "{colors.opal-electric}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "10px 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.opal-deep}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "10px 24px"
    height: "44px"
  button-ghost:
    backgroundColor: "{colors.white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.full}"
    padding: "10px 24px"
    height: "44px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "36px"
---

# Design System: The Good Opal Co

## 1. Overview

**Creative North Star: "The Opal Gallery in the Bush"**

The interface should feel like entering a small, warm Australian opal gallery:
intimate, handmade, sunlit, and trustworthy, with moments of iridescent magic
only where they help the stone feel alive. The brand is allowed to be beautiful,
but the buying experience must stay clear and practical.

Design choices should honor the opal first. Product photography, origin details,
price, stock, shipping, returns, and authenticity cues have priority over
decorative chrome. Use color as play-of-color: rare flashes, prismatic accents,
and editorial emphasis, not a full-screen tech gradient.

Reject generic AI-generated landing pages, corporate SaaS polish, nested card
layouts, and dark decorative effects that hide the jewellery. The experience is
warm fairytale commerce, not fintech, not dashboard, not template luxury.

**Key Characteristics:**

- Photography-led product discovery.
- Warm cream, white, charcoal, and opal accent flashes.
- Serif-led editorial hierarchy with readable body text.
- Accessible ecommerce controls with visible focus and clear states.
- Magical details used as punctuation, not wallpaper.

## 2. Colors

The palette is warm neutral commerce with controlled opal fire. Use neutrals for
surface and legibility, then reserve saturated color for CTAs, active states,
trust moments, badges, and small emotional highlights.

### Primary

- **Electric Opal**: Primary action color. Use for CTAs, active nav states,
  progress, focus rings, and high-confidence commerce actions.
- **Accessible Opal Deep**: Text-safe opal blue for links and text on white
  surfaces. Use this instead of Electric Opal when contrast matters.
- **Gallery Charcoal**: Main text, quiet outlines, and editorial anchors.

### Secondary

- **Fire Pink**: Emotional accent for celebratory or brand moments. Use
  sparingly in gradients, success accents, and magical section details.
- **Opal Emerald**: Authenticity, confirmation, and natural opal flashes.
- **Fire Gold**: Price-adjacent warmth, provenance accents, and premium craft
  cues when used in small quantities.

### Tertiary

- **Opal Light** and **Opal Teal**: Soft supporting blues for low-pressure
  backgrounds, badges, education blocks, and subtle hover states.
- **Fire Coral** and **Fire Orange**: Warm accents for urgency or warmth. Do not
  use them for destructive actions unless the semantic error palette is also
  present.

### Neutral

- **Cream**: Brand warmth and gentle section backgrounds.
- **White**: Product cards, checkout forms, gallery surfaces, and dense UI.
- **Gray Soft**: Borders, dividers, and subdued surfaces.
- **Charcoal Light**: Secondary copy and metadata where contrast remains safe.
- **Black Rich**: Dark hero, footer, and opal-pop backgrounds.

### Named Rules

**The Stone First Rule.** If color treatment competes with product photography,
remove the color treatment.

**The Accessible Opal Rule.** Electric Opal is for fills and accents. For text on
white, use Accessible Opal Deep.

**The No Generic Glow Rule.** Do not use purple-blue SaaS gradients, decorative
orbs, or bokeh backgrounds as default atmosphere.

## 3. Typography

**Display Font:** EB Garamond with Georgia fallback.
**Body Font:** Merriweather with Georgia fallback.
**Accent Font:** Dancing Script, reserved for emotional moments.

**Character:** The pairing is literary, warm, and handmade. EB Garamond carries
luxury and story; Merriweather keeps buying, education, and form copy readable.
Dancing Script is a rare accent, not a working UI font.

### Hierarchy

- **Display** (600, 48-72px, 1.05-1.1): Home hero, major campaign moments,
  product-page hero names, and editorial section leads.
- **Headline** (600, 36-48px, 1.1-1.2): Section headers, collection headings,
  about/story page anchors.
- **Title** (600, 24-30px, 1.25-1.3): Product titles, card titles, checkout
  panels, and modal headings.
- **Body** (400, 16-18px, 1.5-1.625): Product descriptions, education copy,
  checkout instructions, and blog excerpts. Keep long-form copy near 65ch.
- **Label** (500-600, 12-14px, 1.375): Form labels, metadata, badges, and small
  navigation. Uppercase only for short labels.

### Named Rules

**The Accent Restraint Rule.** Dancing Script is only for emotional moments such
as success pages, taglines, and celebrations. Never use it for navigation, form
labels, product metadata, or body copy.

**The No Tiny Serif UI Rule.** If a control label becomes hard to scan, simplify
the hierarchy before shrinking the type.

**The Balanced Headline Rule.** Use balanced wrapping for display headings and
avoid negative letter spacing.

## 4. Elevation

The system uses a hybrid of soft elevation and tonal layering. Product surfaces
should feel tactile but not heavy. Shadows may appear on cards, sheets, menus,
and hover states, but the default page composition should not become a field of
floating panels.

### Shadow Vocabulary

- **Low Elevation** (`0 2px 4px rgb(0 0 0 / 0.05)`): Small cards, badges, and
  quiet UI affordances.
- **Medium Elevation** (`0 8px 16px rgb(0 0 0 / 0.1)`): Product cards, drawers,
  menus, and focused purchase panels.
- **High Elevation** (`0 16px 32px rgb(0 0 0 / 0.15)`): Modals and important
  overlays only.
- **Opal Glow**: Use colored shadow only on primary CTAs or rare hover
  emphasis. Never use it as general page atmosphere.

### Named Rules

**The Flat Page Rule.** Page sections are full-width bands or unframed layouts.
Use cards for repeated items, tools, modals, and product surfaces.

**The No Card Nesting Rule.** Do not put UI cards inside other cards unless the
inner item is a repeated product, order, or line item with a clear semantic role.

## 5. Components

Components should feel handmade but reliable: softened, tactile, accessible, and
clear. Commerce clarity beats decorative flourish.

### Buttons

- **Shape:** Fully rounded pills for primary actions; up to 8px radius for dense
  transactional controls where a pill wastes space.
- **Primary:** Electric Opal to Opal Deep gradient, white text, minimum 44px
  mobile touch target, and clear hover/active/focus states.
- **Hover / Focus:** Hover may deepen color, lift 1-2px, or add restrained opal
  shadow. Focus must use a visible `focus-visible` ring.
- **Secondary / Ghost / Tertiary:** Use charcoal, white, and soft neutral
  surfaces. Do not make secondary actions look as loud as the buy action.

### Chips

- **Style:** Compact pill or 8px rounded chip with neutral border, readable text,
  and selected state using Accessible Opal Deep or a soft opal tint.
- **State:** Selected, disabled, and count states must remain readable on mobile.
  Filter state should be visible in the URL where practical.

### Cards / Containers

- **Corner Style:** Usually 8-12px. Larger radii are allowed only for product
  media or brand-led storytelling moments.
- **Background:** White or warm neutral. Dark cards are reserved for opal-pop
  visual moments.
- **Shadow Strategy:** Soft elevation at rest, stronger elevation on hover only
  when it improves affordance.
- **Border:** Gray Soft or warm neutral. Avoid thick decorative borders.
- **Internal Padding:** 16-24px for UI cards, 24-32px for editorial panels.

### Inputs / Fields

- **Style:** White or transparent surface, 6px radius, neutral border, readable
  label, and clear placeholder example when needed.
- **Focus:** Opal ring or border shift. Never remove outline without replacement.
- **Error / Disabled:** Inline error near the field with a concrete next step.
  Disabled state must remain legible.

### Navigation

- **Style:** Compact, warm, and scan-friendly. The logo and product search matter
  more than decorative nav effects.
- **Desktop:** Preserve command clarity: store, education, services, cart,
  search, and account controls must remain easy to reach.
- **Mobile:** Use predictable drawer/sheet behavior, safe-area awareness, and
  large touch targets.

### Product Surfaces

- **Product Cards:** Image first, with product name, price, stock/sold status,
  and key material details. Hover should reveal useful details, not hide the
  image behind heavy overlays.
- **Product Detail:** Prioritize image inspection, price, add-to-cart, stock,
  shipping, returns, authenticity, and origin details above decorative content.
- **Cart / Checkout:** Product, quantity, total, shipping threshold, errors, and
  payment actions must be direct and calm.

## 6. Do's and Don'ts

### Do:

- **Do** use Impeccable as a critic and shaping workflow for meaningful UI work.
- **Do** use product photography, macro image quality, and image framing as the
  primary design asset.
- **Do** keep trust badges close to the price, cart, checkout, and shipping
  decisions.
- **Do** use `Intl.NumberFormat` and project currency helpers for prices.
- **Do** keep filters, tabs, pagination, and meaningful state reflected in the
  URL where practical.
- **Do** provide empty, loading, error, overflow, hover, focus, disabled, and
  mobile states for commerce components.
- **Do** test text overflow with long product names, sold-out labels, and mobile
  widths.
- **Do** honor reduced motion and animate transform or opacity where possible.

### Don't:

- **Don't** use generic AI-generated landing page composition.
- **Don't** use purple-blue SaaS gradients as the dominant visual identity.
- **Don't** create card grids inside card grids.
- **Don't** add decorative gradient orbs, bokeh backgrounds, or abstract glows as
  default atmosphere.
- **Don't** use dark, blurred, cropped, or atmospheric imagery when users need to
  inspect the actual opal.
- **Don't** turn the brand into corporate fintech, dashboard UI, or template
  luxury.
- **Don't** overuse Dancing Script or emoji as a substitute for designed
  hierarchy and iconography.
- **Don't** introduce React Context as the cart source of truth.
- **Don't** decrement stock during checkout session creation; stock updates are
  webhook-driven.
