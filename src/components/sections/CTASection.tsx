import { Container } from '@/components/layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CTAButton {
  href: string
  label: string
  variant?: 'default' | 'outline' | 'shimmer' | 'glass'
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
 * Eye-catching call-to-action section with opal-inspired styling.
 * Features gradient orbs and luxury button variants.
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
      className={`py-20 md:py-28 relative overflow-hidden ${
        dark ? 'bg-black-rich text-white' : 'bg-white text-charcoal'
      } ${className}`}
    >
      {/* Background gradient orbs */}
      {dark && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-opal-electric" />
          <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-fire-pink" />
        </div>
      )}

      <Container className="text-center max-w-3xl relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          {title}
        </h2>
        <p className={`text-lg md:text-xl mb-10 leading-relaxed ${dark ? 'text-white/70' : 'text-charcoal/60'}`}>
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {buttons.map((button, index) => {
            // Determine button variant based on context
            const variant = button.variant || (index === 0 ? 'shimmer' : 'glass')
            return (
              <Button
                key={index}
                asChild
                size="lg"
                variant={dark ? variant : 'default'}
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
