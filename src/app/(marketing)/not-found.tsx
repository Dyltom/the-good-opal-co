import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'

/**
 * Global 404 Not Found Page
 */
export default function NotFound() {
  return (
    <Section padding="lg">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>

          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/blog">View Blog</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
