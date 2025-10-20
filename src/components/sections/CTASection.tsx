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
      className={`py-20 ${
        gradient
          ? 'bg-gradient-to-r from-opal-blue to-opal-teal text-white'
          : 'bg-background'
      } ${className}`}
    >
      <Container className="text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{title}</h2>
        <p className={`text-lg md:text-xl mb-8 ${gradient ? 'opacity-90' : 'text-muted-foreground'}`}>
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
                  ? 'bg-white text-opal-blue hover:bg-gray-100 font-semibold'
                  : 'bg-opal-blue text-white hover:bg-opal-blue-dark font-semibold'
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
