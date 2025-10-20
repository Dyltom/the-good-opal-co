import Link from 'next/link'
import Image from 'next/image'
import { Container, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'
import type { HeroSectionData } from '@/types'

/**
 * Hero Section Component
 * Large header section with title, description, CTA buttons, and optional image
 */
export function Hero({
  title,
  subtitle,
  description,
  cta = [],
  image,
  backgroundImage,
  alignment = 'center',
  overlay = false,
}: HeroSectionData) {
  return (
    <Section padding="lg" className="relative overflow-hidden">
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage.url}
            alt={backgroundImage.alt || ''}
            fill
            className="object-cover"
            priority
          />
          {overlay && <div className="absolute inset-0 bg-black/50" />}
        </div>
      )}

      <Container className="relative z-10">
        <div
          className={`flex flex-col gap-8 ${
            alignment === 'center'
              ? 'items-center text-center'
              : alignment === 'right'
                ? 'items-end text-right'
                : 'items-start text-left'
          } ${image ? 'lg:flex-row lg:items-center lg:justify-between' : ''}`}
        >
          {/* Content */}
          <div className={`flex-1 ${image ? 'lg:max-w-xl' : 'max-w-3xl mx-auto'}`}>
            {subtitle && (
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                {subtitle}
              </p>
            )}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              {title}
            </h1>
            {description && <p className="text-lg text-muted-foreground mb-8">{description}</p>}

            {/* CTAs */}
            {cta.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {cta.map((button, index) => (
                  <Button
                    key={button.href}
                    asChild
                    size="lg"
                    variant={index === 0 ? 'default' : 'outline'}
                  >
                    <Link href={button.href} target={button.external ? '_blank' : undefined}>
                      {button.label}
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Hero Image */}
          {image && (
            <div className="flex-1 lg:max-w-lg">
              <Image
                src={image.url}
                alt={image.alt}
                width={image.width || 600}
                height={image.height || 400}
                className="rounded-lg shadow-2xl"
                priority
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
