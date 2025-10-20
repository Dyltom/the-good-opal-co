import { Container, Section } from '@/components/layout'

/**
 * Global Loading Page
 */
export default function Loading() {
  return (
    <Section padding="lg">
      <Container>
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Container>
    </Section>
  )
}
