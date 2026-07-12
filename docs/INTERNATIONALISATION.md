# Internationalisation release checklist

Production currently publishes one reviewed locale: Australian English (`en-AU`).
The helpers and typed catalogue live in `src/lib/i18n/`. Never add a locale to
`SUPPORTED_LOCALES` merely because a partial or machine translation exists.

## Definition of a publishable locale

A new locale ships as one atomic release only after all items below pass:

- Add a complete typed UI catalogue and review text expansion, interpolation,
  plural rules, dates, numbers, currency display, units, names, and addresses.
- Localise every public Payload field used by products, categories, posts,
  courses, media alt text, SEO fields, and reusable content. Commit the Payload
  migration and regenerated types. Preserve AUD as the transaction currency
  unless pricing, checkout, refunds, accounting, and legal review explicitly
  approve another currency.
- Human-review product provenance, treatment, authenticity, shipping, returns,
  privacy, terms, cookies, tax, warranty, and promotional claims. A translation
  must not imply a destination, service level, price, or legal right that the
  business does not offer.
- Translate and test checkout, cart, forms, validation, error and empty states,
  consent, order tracking, quotes, course flows, and every transactional and
  newsletter email. Localise email `<html lang>`, subject, preview text, dates,
  currency, and support links.
- Add a stable localised URL for every translated public page. Generate matching
  canonical, reciprocal `hreflang`, `x-default`, sitemap, Open Graph locale,
  JSON-LD `inLanguage`, and HTTP `Content-Language` values. Internal links and
  the language selector must keep users on the equivalent page.
- Verify script coverage before enabling the locale. The marketing layout's
  current `next/font` configuration loads Latin subsets only. Add appropriate
  font subsets or script-specific fallbacks, then check weight, line height,
  glyph coverage, and layout shift on real devices.
- For right-to-left scripts, set document `dir="rtl"`; replace physical layout
  assumptions with logical properties; mirror directional icons only; and test
  navigation, filters, forms, galleries, cart, checkout, emails, and mixed LTR
  values such as SKUs, phone numbers, and prices.
- Run unit tests for locale negotiation, catalogue completeness, formatting,
  pluralisation, URL generation, and structured data. Run Playwright journeys at
  desktop, mobile, 200% text zoom, long-copy expansion, and both LTR and RTL when
  applicable. Confirm checkout payloads and stored monetary values do not change
  when display locale changes.

## Safe staging and release

While translation is incomplete, keep routes unavailable to public navigation,
the sitemap, and `hreflang`. If reviewers need a web preview, require access and
send `noindex, nofollow`; do not rely on an orphaned URL. Never canonicalise an
incomplete translation to itself or advertise it through a language selector.

At release, enable the catalogue, CMS content, localised routes, selector,
metadata, sitemap, emails, and tests together. Crawl every localised URL and
confirm reciprocal alternates, no mixed-language critical flows, no missing
glyphs, no false market claims, and no indexable untranslated fallback pages.

Removing a locale follows the reverse order: remove it from navigation and
discovery, permanently redirect each URL to the reviewed fallback equivalent,
then remove catalogue and CMS support after search engines and active links have
been audited.
