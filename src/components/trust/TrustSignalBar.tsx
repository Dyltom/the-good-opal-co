import { ShieldCheck, Truck, RefreshCcw, Award } from 'lucide-react'

/**
 * Trust Signal Bar Component
 * Displays 4 key trust signals to build customer confidence
 * Place below hero or in sticky header
 */
export function TrustSignalBar() {
  const trustSignals = [
    {
      icon: ShieldCheck,
      title: 'Certified Authentic',
      description: 'Certificate included',
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders $500+',
    },
    {
      icon: RefreshCcw,
      title: '30-Day Returns',
      description: 'Risk-free shopping',
    },
    {
      icon: Award,
      title: '100% Australian',
      description: 'Locally owned',
    },
  ]

  return (
    <div className="bg-cream-dark border-y border-warm-grey py-6">
      <div className="w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustSignals.map((signal) => {
            const Icon = signal.icon
            return (
              <div
                key={signal.title}
                className="flex items-center justify-center gap-3 text-center md:text-left"
              >
                <Icon className="w-6 h-6 text-opal-blue flex-shrink-0" strokeWidth={2} />
                <div className="hidden md:block">
                  <p className="font-semibold text-charcoal text-sm leading-tight">
                    {signal.title}
                  </p>
                  <p className="text-xs text-charcoal-60 mt-0.5">
                    {signal.description}
                  </p>
                </div>
                <div className="md:hidden text-xs">
                  <p className="font-semibold text-charcoal">{signal.title}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Compact version for smaller spaces
 */
export function TrustSignalBarCompact() {
  return (
    <div className="flex items-center justify-center gap-6 py-3 text-xs text-charcoal-60">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-opal-blue" />
        <span>Certified</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Truck className="w-4 h-4 text-opal-blue" />
        <span>Free Shipping</span>
      </div>
      <div className="flex items-center gap-1.5">
        <RefreshCcw className="w-4 h-4 text-opal-blue" />
        <span>30-Day Returns</span>
      </div>
    </div>
  )
}
