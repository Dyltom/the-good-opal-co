import { Container } from '@/components/layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CTAButton {
  href: string
  label: string
  variant?: 'default' | 'outline'
}

interface CTASectionProps {
  title: string
  description: string
  buttons: CTAButton[]
  dark?: boolean
  className?: string
}

/**
 * CTASection Component
 *
 * Reusable editorial call-to-action band.
 */
export function CTASection({
  title,
  description,
  buttons,
  dark = true,
  className = '',
}: CTASectionProps) {
  return (
    <section
      className={`relative py-20 md:py-28 ${
        dark ? 'bg-charcoal text-cream' : 'border-y border-warm-grey/60 bg-cream text-charcoal'
      } ${className}`}
    >
      <Container className="relative max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight">
          {title}
        </h2>
        <p className={`mb-10 text-lg leading-relaxed md:text-xl ${dark ? 'text-cream/70' : 'text-charcoal/60'}`}>
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {buttons.map((button, index) => {
            const variant = button.variant || (index === 0 ? 'default' : 'outline')
            return (
              <Button
                key={index}
                asChild
                size="lg"
                variant={dark ? variant : 'default'}
                className={
                  dark
                    ? variant === 'default'
                      ? 'bg-cream text-charcoal hover:bg-opal-light'
                      : 'border-cream/55 text-cream hover:border-cream hover:bg-cream hover:text-charcoal'
                    : undefined
                }
              >
                <Link href={button.href}>{button.label}</Link>
              </Button>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
