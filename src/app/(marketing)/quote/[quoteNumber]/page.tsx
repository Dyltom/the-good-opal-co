import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { formatPrice } from '@/lib/utils'
import { formatCustomQuoteExpiry } from '@/lib/custom-quote-evidence'
import { getCustomerQuoteAccess, QUOTE_ACCESS_COOKIE } from '@/lib/custom-quotes/customer-access'
import { QuoteActions } from './quote-actions'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Private custom quote | The Good Opal Co',
  robots: { index: false, follow: false, nocache: true },
}

export default async function CustomerQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ quoteNumber: string }>
  searchParams: Promise<{ payment?: string }>
}) {
  const [{ quoteNumber }, query, store] = await Promise.all([params, searchParams, cookies()])
  const token = store.get(QUOTE_ACCESS_COOKIE)?.value
  const access = token ? await getCustomerQuoteAccess(token) : null
  if (!access || access.quote.quoteNumber !== quoteNumber) return <UnavailableQuote />

  const quote = access.quote
  const balanceCents = Math.max(0, quote.amountCents - quote.depositAmountCents)
  const disputeActive = Boolean(quote.stripeDisputeStatus && quote.stripeDisputeStatus !== 'won')

  return (
    <MarketingShell>
      <main className="bg-cream py-14 sm:py-20">
        <Container className="max-w-3xl">
          <div className="bg-ivory rounded-[2rem] border border-charcoal/10 p-6 shadow-sm sm:p-10">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-opal-deep">
              Private custom jewellery quote
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-serif text-4xl text-charcoal sm:text-5xl">Your commission</h1>
                <p className="mt-2 font-sans text-sm text-charcoal/60">
                  {quote.quoteNumber}
                  {quote.revision > 1 ? ` · Revision ${quote.revision}` : ''}
                </p>
              </div>
              <QuoteStatus status={quote.status} depositStatus={quote.depositStatus} />
            </div>

            <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-charcoal/10 bg-charcoal/10 sm:grid-cols-2">
              <QuoteFact label="Quoted total" value={`${formatPrice(quote.amountCents)} AUD`} />
              <QuoteFact
                label="Deposit"
                value={
                  quote.depositAmountCents > 0
                    ? `${formatPrice(quote.depositAmountCents)} AUD`
                    : 'No deposit required'
                }
              />
              <QuoteFact label="Balance after deposit" value={`${formatPrice(balanceCents)} AUD`} />
              <QuoteFact label="Valid until" value={formatCustomQuoteExpiry(quote.validUntil)} />
            </dl>

            <section className="mt-10" aria-labelledby="quote-terms">
              <h2 id="quote-terms" className="font-serif text-3xl text-charcoal">
                Scope and terms
              </h2>
              <div className="mt-5 whitespace-pre-wrap break-words rounded-2xl bg-white p-6 font-sans text-sm leading-7 text-charcoal/80 sm:p-8">
                {quote.terms}
              </div>
            </section>

            {query.payment === 'return' && quote.depositStatus !== 'paid' && (
              <p
                className="bg-opal-pale mt-6 rounded-xl p-4 font-sans text-sm text-charcoal"
                role="status"
              >
                Payment returned successfully. Stripe is confirming the deposit; refresh shortly if
                the status has not updated.
              </p>
            )}
            {quote.depositStatus === 'paid' &&
              (quote.stripeRefundedAmountCents ?? 0) === 0 &&
              !disputeActive && (
                <p
                  className="mt-6 rounded-xl bg-emerald-50 p-4 font-sans text-sm text-emerald-900"
                  role="status"
                >
                  Deposit recorded. We’ll be in touch with the next production update.
                </p>
              )}
            {(quote.depositStatus === 'refunded' || (quote.stripeRefundedAmountCents ?? 0) > 0) && (
              <p
                className="mt-6 rounded-xl bg-amber-50 p-4 font-sans text-sm text-amber-900"
                role="status"
              >
                Refunded through Stripe: {formatPrice(quote.stripeRefundedAmountCents ?? 0)} AUD.
              </p>
            )}
            {disputeActive && (
              <p
                className="mt-6 rounded-xl bg-red-50 p-4 font-sans text-sm text-red-900"
                role="alert"
              >
                This deposit is under payment review. Production remains paused while it is
                resolved.
              </p>
            )}

            <div className="mt-8">
              <QuoteActions
                quoteNumber={quote.quoteNumber}
                status={quote.status as 'sent' | 'accepted'}
                depositStatus={quote.depositStatus}
                depositAmountCents={quote.depositAmountCents}
              />
            </div>
          </div>
        </Container>
      </main>
    </MarketingShell>
  )
}

function QuoteFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5 sm:p-6">
      <dt className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal/55">
        {label}
      </dt>
      <dd className="mt-2 font-serif text-xl text-charcoal">{value}</dd>
    </div>
  )
}

function QuoteStatus({ status, depositStatus }: { status: string; depositStatus: string }) {
  const label =
    depositStatus === 'paid'
      ? 'Deposit paid'
      : depositStatus === 'refunded'
        ? 'Deposit refunded'
        : status === 'accepted'
          ? 'Accepted'
          : 'Awaiting acceptance'
  return (
    <span className="rounded-full border border-charcoal/15 bg-white px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-charcoal">
      {label}
    </span>
  )
}

function UnavailableQuote() {
  return (
    <MarketingShell>
      <main className="bg-cream py-24 sm:py-32">
        <Container className="max-w-xl text-center">
          <h1 className="font-serif text-4xl text-charcoal">This quote is unavailable</h1>
          <p className="mt-5 font-sans leading-7 text-charcoal/70">
            The secure link may have expired or been replaced. Contact us for a fresh copy.
          </p>
        </Container>
      </main>
    </MarketingShell>
  )
}
