/**
 * TrustMarquee Component
 *
 * Infinite scrolling marquee displaying trust signals.
 * Uses pure CSS animation for performance.
 *
 * Follows SOLID principles:
 * - Single Responsibility: Only displays trust messaging
 * - Dependency Inversion: Uses configuration array for easy updates
 */

const TRUST_ITEMS = [
  'Handcrafted in Australia',
  'Ethically Sourced',
  'Free Express Shipping',
  '1 Year Warranty',
  'Certificate of Authenticity',
  'Premium Packaging',
] as const

export function TrustMarquee() {
  return (
    <div className="bg-opal-electric-accessible py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Duplicate items for seamless loop */}
        {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
          <span
            key={i}
            className="mx-8 text-sm font-medium text-white tracking-normal flex items-center gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
