# The Good Opal Co Product Context

## Register

The Good Opal Co is a brand-led ecommerce site. Design is part of the
product: the interface must sell authentic Australian opals through beauty,
trust, education, and an easy buying flow.

Use brand defaults for marketing, collection, product, about, blog, and service
pages. Use product defaults for cart, checkout, account, admin-adjacent flows,
forms, filters, and transactional states.

## Audience

- Gift buyers who need confidence, plain-language guidance, and visible trust
  cues before purchasing.
- Opal collectors who care about origin, authenticity, color play, and
  craftsmanship details.
- Jewellery customers comparing price, availability, shipping, returns, and
  product photography.
- New opal buyers who need education without feeling talked down to.

## Core Jobs

- Help shoppers understand why an opal is special.
- Make product comparison fast: price, material, size, stock, origin, and care.
- Keep purchase flows clear, calm, and SSR-compatible.
- Make the brand feel warm, magical, Australian, and trustworthy.
- Preserve accessible commerce fundamentals: labels, focus states, contrast,
  semantic controls, responsive layouts, and honest messaging.

## Brand Personality

- Authentic: genuine Australian opals, transparent sourcing, no fake scarcity.
- Warm: personal, helpful, generous, and human.
- Refined: gallery-like presentation without corporate luxury stiffness.
- Educational: explains opal quality, care, origin, and value clearly.
- Magical: iridescent, fairytale-adjacent moments used with restraint.

## Strategic Principles

1. Product photography is the primary visual asset. UI effects support the
   stones; they do not compete with them.
2. The store should feel like accessible luxury, not a generic SaaS storefront.
3. Trust cues belong close to buying decisions: price, add-to-cart, checkout,
   shipping, returns, authenticity, and stock.
4. Educational content should reduce uncertainty in the buying flow, not force
   users into a separate research journey.
5. The warm fairytale feeling should be tangible but controlled. A little
   shimmer goes further than a screen full of glows.

## Anti-References

- Generic AI-generated landing pages.
- Purple-blue SaaS gradients as the dominant visual identity.
- Card grids inside card grids.
- Decorative gradient orbs and bokeh backgrounds.
- Dark, blurred, cropped, or atmospheric imagery when users need to inspect the
  actual opal.
- Corporate fintech or dashboard visual language.
- Overusing the script font for routine labels, navigation, body copy, or
  product metadata.
- Emoji as a substitute for designed iconography.
- Immediate destructive actions without undo or confirmation.

## AI Design Tooling

Impeccable is installed project-local in `.agents/skills/impeccable`. Use it as
a design critic, shaping workflow, and anti-pattern checker. It must not replace
this product context or the project design system.

Useful Impeccable routes for this project:

- `$impeccable shape` before substantial UI changes.
- `$impeccable critique` for hierarchy, clarity, and emotional resonance.
- `$impeccable layout` for spacing, rhythm, and visual flow.
- `$impeccable typeset` for typography hierarchy and readable measure.
- `$impeccable harden` for overflow, empty states, errors, i18n, and edge cases.
- `$impeccable audit` and `$impeccable polish` before shipping visual work.

## Source Documents

- `AGENTS.md` for repository rules and working method.
- `DESIGN.md` for the compact agent-readable visual contract.
- `docs/DESIGN_SYSTEM.md` for detailed brand and component guidance.
- `docs/TYPOGRAPHY_GUIDE.md` for font usage rules.
- `docs/UI_UX_REDESIGN_GUIDE.md` for deeper redesign direction.
- `src/styles/tokens.ts`, `src/app/globals.css`, and `tailwind.config.ts` for
  implementation tokens.
