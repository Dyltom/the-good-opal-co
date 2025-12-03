import { Container } from '@/components/layout'
import { ShieldCheck, Truck, RefreshCw, Gift } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface TrustBadge {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
}

interface TrustBadgesProps {
  badges?: TrustBadge[]
  className?: string
}

const defaultBadges: TrustBadge[] = [
  {
    icon: ShieldCheck,
    title: '100% Authentic',
    description: 'Certified Australian opals',
    gradient: 'from-opal-electric to-opal-deep',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $500',
    gradient: 'from-fire-pink to-fire-coral',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy',
    gradient: 'from-opal-emerald to-opal-teal',
  },
  {
    icon: Gift,
    title: 'Gift Packaging',
    description: 'Complimentary on all orders',
    gradient: 'from-fire-orange to-fire-gold',
  },
]

/**
 * TrustBadges Component
 *
 * Displays trust signals with opal-inspired styling.
 * Uses gradient icons and luxury hover effects.
 */
export function TrustBadges({ badges = defaultBadges, className = '' }: TrustBadgesProps) {
  return (
    <section className={`py-16 md:py-20 bg-gray-whisper border-y border-gray-soft ${className}`}>
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300 group-hover:scale-105`}>
                  <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-lg text-charcoal mb-1">{badge.title}</h3>
                <p className="text-sm text-charcoal/60">{badge.description}</p>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
