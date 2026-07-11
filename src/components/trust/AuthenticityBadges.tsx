import { BadgeCheck, Award, FileText, ShieldCheck } from 'lucide-react'

/**
 * Authenticity Badges Component
 * Displays opal authenticity guarantees
 * Use on product pages and about page
 */
export function AuthenticityBadges() {
  const guarantees = [
    {
      icon: BadgeCheck,
      title: 'Australian opals',
      description: 'Stone details shown on each product page',
    },
    {
      icon: FileText,
      title: 'Product documentation',
      description: 'Certificate details shown when available',
    },
    {
      icon: ShieldCheck,
      title: 'Questions welcomed',
      description: 'Ask for another image or a virtual viewing',
    },
    {
      icon: Award,
      title: 'Origin details',
      description: 'Origin disclosed where known',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {guarantees.map((guarantee) => {
        const Icon = guarantee.icon
        return (
          <div
            key={guarantee.title}
            className="flex items-start gap-3 p-4 bg-white border border-warm-grey rounded-lg hover:border-opal-electric-accessible transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-opal-light/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-opal-electric-accessible" strokeWidth={2} />
            </div>
            <div>
              <h4 className="font-semibold text-charcoal text-sm leading-tight mb-1">
                {guarantee.title}
              </h4>
              <p className="text-xs text-charcoal/60 leading-relaxed">
                {guarantee.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Compact authenticity list for product pages
 */
export function AuthenticityChecklist() {
  const checks = [
    'Australian opal',
    'Origin disclosed where known',
    'Certificate details shown when available',
    'Closer images available on request',
  ]

  return (
    <div className="space-y-2">
      {checks.map((check) => (
        <div key={check} className="flex items-start gap-2">
          <BadgeCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" strokeWidth={2} />
          <span className="text-sm text-charcoal/80">{check}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Authenticity badge for product cards
 */
export function AuthenticityBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-light text-success rounded-full">
      <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span className="text-xs font-semibold">Australian opal</span>
    </div>
  )
}
