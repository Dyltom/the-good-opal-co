import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Page not found | The Good Opal Co',
}

export default function NotFound() {
  return (
    <MarketingShell>
      <section className="px-gut py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
            This page has wandered off.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-ink-2">
            The opal you&apos;re after may have found a home, or the address may have changed.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/store">Browse the collection</Link>
            </Button>
            <Link
              href="/contact"
              className="text-sm text-ink-2 underline underline-offset-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Ask us about a piece
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
