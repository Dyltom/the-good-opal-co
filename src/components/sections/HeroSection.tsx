import { Container } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface HeroButton {
  href: string
  label: string
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

interface HeroSectionProps {
  badge?: string
  title: string
  subtitle?: string
  description: string
  buttons: HeroButton[]
  className?: string
  gradient?: boolean
}

/**
 * Reusable Hero Section Component
 * Professional hero for landing pages and category pages
 */
export function HeroSection({
  badge,
  title,
  subtitle,
  description,
  buttons,
  className = '',
  gradient = true,
}: HeroSectionProps) {
  return (
    <section
      className={`relative py-20 md:py-32 ${
        gradient
          ? 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
          : 'bg-background'
      } ${className}`}
    >
      <Container className="text-center">
        {badge && (
          <Badge className="mb-6 bg-opal-blue/10 text-opal-blue border-opal-blue/20 text-sm px-4 py-1.5">
            {badge}
          </Badge>
        )}

        {subtitle && (
          <p className="text-sm uppercase tracking-wider text-opal-blue font-semibold mb-4">
            {subtitle}
          </p>
        )}

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance max-w-4xl mx-auto">
          {title}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {buttons.map((button, index) => (
            <Button
              key={index}
              asChild
              size="lg"
              variant={button.variant || 'default'}
              className={button.className || (button.variant === 'default' ? 'bg-opal-blue hover:bg-opal-blue-dark text-white font-semibold px-8' : '')}
            >
              <Link href={button.href}>{button.label}</Link>
            </Button>
          ))}
        </div>
      </Container>
    </section>
  )
}
