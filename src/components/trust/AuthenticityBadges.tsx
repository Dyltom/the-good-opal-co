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
      title: '100% Authentic Australian Opals',
      description: 'Every stone sourced from Australian mines',
    },
    {
      icon: FileText,
      title: 'Certificate of Authenticity',
      description: 'Included with every purchase',
    },
    {
      icon: ShieldCheck,
      title: 'Lifetime Authenticity Guarantee',
      description: 'We stand behind our opals forever',
    },
    {
      icon: Award,
      title: 'Ethically Sourced',
      description: 'Direct from Australian miners',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {guarantees.map((guarantee) => {
        const Icon = guarantee.icon
        return (
          <div
            key={guarantee.title}
            className="flex items-start gap-3 p-4 bg-white border border-warm-grey rounded-lg hover:border-opal-blue transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-opal-blue-pale flex items-center justify-center">
              <Icon className="w-5 h-5 text-opal-blue" strokeWidth={2} />
            </div>
            <div>
              <h4 className="font-semibold text-charcoal text-sm leading-tight mb-1">
                {guarantee.title}
              </h4>
              <p className="text-xs text-charcoal-60 leading-relaxed">
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
    '100% Authentic Australian Opal',
    'Certificate of Authenticity Included',
    'Ethically Sourced from Australian Mines',
    'Lifetime Authenticity Guarantee',
  ]

  return (
    <div className="space-y-2">
      {checks.map((check) => (
        <div key={check} className="flex items-start gap-2">
          <BadgeCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" strokeWidth={2} />
          <span className="text-sm text-charcoal-80">{check}</span>
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
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-light text-success-dark rounded-full">
      <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span className="text-xs font-semibold">Certified Authentic</span>
    </div>
  )
}
