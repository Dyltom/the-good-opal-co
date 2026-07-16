import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'

/**
 * Global 404 Not Found Page
 */
export default function NotFound() {
  return (
    <Section padding="lg" className="bg-cream">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            This page has wandered off.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-charcoal/70">
            The opal you&apos;re after may have found a home, or the address may have changed.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/store">Browse the collection</Link>
            </Button>
            <Link
              href="/"
              className="text-sm text-charcoal/70 underline underline-offset-2 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
            >
              Back to home
            </Link>
          </div>

          <p className="mt-8 text-sm text-charcoal/65">
            Looking for something specific?{' '}
            <Link
              href="/contact"
              className="underline underline-offset-2 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
            >
              Contact us
            </Link>
          </p>
        </div>
      </Container>
    </Section>
  )
}
