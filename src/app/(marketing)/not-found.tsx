import Link from 'next/link'
import { MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <MarketingShell>
      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <span aria-hidden="true" className="opal-fire-line mx-auto block h-[3px] w-12 rounded-full" />
          <h1 className="mt-8 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
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
              href="/contact"
              className="text-sm text-charcoal/70 underline underline-offset-2 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
            >
              Ask us about a piece
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
