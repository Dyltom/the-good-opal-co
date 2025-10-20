import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'
import type { CTASectionData } from '@/types'
import { cn } from '@/lib/utils'

/**
 * CTA Section Component
 * Call-to-action section with title, description, and buttons
 */
export function CTA({ title, description, buttons, background = 'accent' }: CTASectionData) {
  const sectionBg = background === 'gradient' ? 'accent' : background

  return (
    <Section
      padding="lg"
      background={sectionBg}
      className={cn(background === 'gradient' && 'bg-gradient-to-r from-primary to-secondary')}
    >
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          {description && <p className="text-lg mb-8 opacity-90">{description}</p>}

          <div className="flex flex-wrap gap-4 justify-center">
            {buttons.map((button, index) => (
              <Button
                key={button.href}
                asChild
                size="lg"
                variant={index === 0 ? 'default' : 'outline'}
                className={cn(
                  background === 'accent' && index === 0 && 'bg-background text-foreground hover:bg-background/90',
                  background === 'accent' && index !== 0 && 'border-background text-background hover:bg-background hover:text-foreground'
                )}
              >
                <Link href={button.href} target={button.external ? '_blank' : undefined}>
                  {button.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
