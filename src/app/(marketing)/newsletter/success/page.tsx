import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'
import { NewsletterConversion } from '@/components/newsletter/NewsletterConversion'

export const metadata: Metadata = {
  title: 'Subscription Confirmed | The Good Opal Co',
  description: 'Your gallery notes subscription is confirmed.',
  robots: { index: false, follow: false },
}

export default function NewsletterSuccessPage() {
  return (
    <MarketingShell>
      <NewsletterConversion />
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <div className="max-w-[60ch]">
          <CheckCircle className="h-6 w-6 text-success" aria-hidden="true" />
          <h1 className="mt-4 text-[2.25rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4vw,3.5rem)]">
            You&apos;re on the gallery list.
          </h1>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.6] text-ink-2">
            We will send occasional notes about newly available pieces, opal care, and work from the
            studio. You can unsubscribe at any time.
          </p>
          <Button asChild className="mt-6">
            <Link href="/store">Browse available pieces</Link>
          </Button>
        </div>
      </Container>
    </MarketingShell>
  )
}
