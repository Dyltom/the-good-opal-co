import { Container } from '@/components/layout'

interface TrustBadge {
  icon: string
  title: string
  description: string
}

interface TrustBadgesProps {
  badges?: TrustBadge[]
  className?: string
}

const defaultBadges: TrustBadge[] = [
  {
    icon: '💎',
    title: '100% Authentic',
    description: 'Certified Australian opals',
  },
  {
    icon: '📦',
    title: 'Free Shipping',
    description: 'On orders over $500',
  },
  {
    icon: '🔄',
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: '🎁',
    title: 'Gift Packaging',
    description: 'Complimentary on all orders',
  },
]

/**
 * Reusable Trust Badges Component
 * Displays guarantees and trust signals
 */
export function TrustBadges({ badges = defaultBadges, className = '' }: TrustBadgesProps) {
  return (
    <section className={`py-16 bg-slate-50 border-y ${className}`}>
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {badges.map((badge, index) => (
            <div key={index} className="space-y-2">
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className="font-semibold text-lg">{badge.title}</div>
              <div className="text-sm text-muted-foreground">{badge.description}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
