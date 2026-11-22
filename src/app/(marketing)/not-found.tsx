import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Page not found | The Good Opal Co',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <MarketingShell>
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <div className="max-w-[60ch]">
          <h1 className="text-[2.25rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4vw,3.5rem)]">
            This page has <i>wandered off.</i>
          </h1>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.6] text-ink-2">
            The opal you&apos;re after may have found a home, or the address may have changed.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/store">
                Browse the collection <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/contact">Ask us about a piece</Link>
            </Button>
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}
