const TRUST_ITEMS = [
  'Australian opals',
  'Product details disclosed',
  'Tracked delivery',
  '30-day eligible returns',
  'Care guidance',
  'Secure Stripe checkout',
] as const

export function TrustMarquee() {
  return (
    <section aria-label="Order information" className="border-y border-warm-grey/60 bg-cream">
      <ul className="mx-auto flex max-w-7xl flex-wrap justify-center px-4 py-3 sm:px-6 lg:px-8">
        {TRUST_ITEMS.map((item) => (
          <li
            key={item}
            className="flex items-center font-sans text-xs font-semibold text-charcoal/75 after:mx-3 after:text-warm-grey after:content-['/'] last:after:hidden sm:text-sm sm:after:mx-5"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
