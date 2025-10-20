import { Container } from '@/components/layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CTAButton {
  href: string
  label: string
  variant?: 'default' | 'outline' | 'secondary'
}

interface CTASectionProps {
  title: string
  description: string
  buttons: CTAButton[]
  gradient?: boolean
  className?: string
}

/**
 * Reusable CTA (Call-to-Action) Section Component
 * Eye-catching section to drive conversions
 */
export function CTASection({
  title,
  description,
  buttons,
  gradient = true,
  className = '',
}: CTASectionProps) {
  return (
    <section
      className={`py-20 md:py-28 relative overflow-hidden ${
        gradient
          ? 'bg-gradient-to-br from-opal-blue via-opal-purple to-opal-pink text-white'
          : 'bg-background'
      } ${className}`}
    >
      {gradient && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      )}
      <Container className="text-center max-w-3xl relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{title}</h2>
        <p className={`text-lg md:text-xl mb-10 leading-relaxed ${gradient ? 'opacity-95' : 'text-muted-foreground'}`}>
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {buttons.map((button, index) => (
            <Button
              key={index}
              asChild
              size="lg"
              variant={button.variant || 'secondary'}
              className={
                gradient
                  ? button.variant === 'outline'
                    ? 'border-2 border-white text-white hover:bg-white hover:text-opal-blue font-semibold px-8 rounded-xl backdrop-blur-sm bg-white/10 hover:scale-105 transition-transform shadow-xl'
                    : 'bg-white text-opal-blue hover:bg-white/90 font-semibold px-8 rounded-xl hover:scale-105 transition-transform shadow-xl'
                  : 'bg-opal-blue text-white hover:bg-opal-blue-dark font-semibold px-8 rounded-xl hover:scale-105 transition-transform shadow-lg'
              }
            >
              <Link href={button.href}>{button.label}</Link>
            </Button>
          ))}
        </div>
      </Container>
    </section>
  )
}
