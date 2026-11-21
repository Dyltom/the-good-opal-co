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
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[2.25rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4vw,3.5rem)]">
                Your commission
              </h1>
              <p className="mt-2 text-[13px] text-ink-3">
                Private custom jewellery quote &middot; {quote.quoteNumber}
                {quote.revision > 1 ? ` · Revision ${quote.revision}` : ''}
              </p>
            </div>
            <QuoteStatus status={quote.status} depositStatus={quote.depositStatus} />
          </div>

          <dl className="mt-8 grid border-t border-rule sm:grid-cols-2">
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
            <h2 id="quote-terms" className="text-[1.75rem] leading-[1.1] md:text-[2rem]">
              Scope and terms
            </h2>
            <div className="mt-4 max-w-[65ch] whitespace-pre-wrap break-words bg-plinth p-5 text-sm leading-7 text-ink sm:p-7">
              {quote.terms}
            </div>
          </section>

          {query.payment === 'return' && quote.depositStatus !== 'paid' && (
            <p
              className="mt-6 border-l-2 border-rule-2 bg-plinth px-4 py-3 text-sm text-ink"
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
                className="mt-6 border-l-2 border-success bg-plinth px-4 py-3 text-sm text-success"
                role="status"
              >
                Deposit recorded. We’ll be in touch with the next production update.
              </p>
            )}
          {(quote.depositStatus === 'refunded' || (quote.stripeRefundedAmountCents ?? 0) > 0) && (
            <p
              className="mt-6 border-l-2 border-ink-3 bg-plinth px-4 py-3 text-sm text-ink"
              role="status"
            >
              Refunded through Stripe: {formatPrice(quote.stripeRefundedAmountCents ?? 0)} AUD.
            </p>
          )}
          {disputeActive && (
            <p
              className="mt-6 border-l-2 border-destructive bg-plinth px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              This deposit is under payment review. Production remains paused while it is resolved.
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
    </MarketingShell>
  )
}

function QuoteFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-rule py-4 sm:odd:pr-6 sm:even:border-l sm:even:pl-6">
      <dt className="text-[13px] text-ink-3">{label}</dt>
      <dd className="mt-1 font-serif text-[1.375rem] leading-tight text-ink">{value}</dd>
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
  return <span className="border border-rule-2 px-3 py-1.5 text-[13px] text-ink">{label}</span>
}

function UnavailableQuote() {
  return (
    <MarketingShell>
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <div className="max-w-[60ch]">
          <h1 className="text-[2.25rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4vw,3.5rem)]">
            This quote is unavailable
          </h1>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.6] text-ink-2">
            The secure link may have expired or been replaced. Contact us for a fresh copy.
          </p>
        </div>
      </Container>
    </MarketingShell>
  )
}
