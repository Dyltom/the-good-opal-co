import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell, PageHeader } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'Subscription Confirmed | The Good Opal Co',
  description: 'Your gallery notes subscription is confirmed.',
}

export default function NewsletterSuccessPage() {
  return (
    <MarketingShell>
      <Container className="flex min-h-[34rem] items-center justify-center py-16">
          <div className="max-w-xl text-center">
            <CheckCircle className="mx-auto h-9 w-9 text-opal-electric-accessible" aria-hidden="true" />
            <PageHeader
              eyebrow="Subscription confirmed"
              title="You're on the gallery list."
              description="We will send occasional notes about newly available pieces, opal care, and work from the studio. You can unsubscribe at any time."
              align="center"
              className="mt-6"
              descriptionClassName="text-base"
            />
            <Link href="/store" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-charcoal px-7 font-sans text-sm font-semibold text-cream hover:bg-charcoal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2">Browse available pieces</Link>
          </div>
      </Container>
    </MarketingShell>
  )
}
