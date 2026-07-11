import { getPayload } from '@/lib/payload'
import type { CustomQuote } from '@/types/payload-types'
import { quoteTermsHash } from '../custom-quote-evidence'
import { verifyQuoteLinkToken, type QuoteLinkClaims } from './quote-link-token'

export const QUOTE_ACCESS_COOKIE = 'good-opal-quote-access'

export interface CustomerQuoteAccess {
  claims: QuoteLinkClaims
  quote: CustomQuote
}

export async function getCustomerQuoteAccess(token: string): Promise<CustomerQuoteAccess | null> {
  const claims = verifyQuoteLinkToken(token)
  if (!claims || !/^\d+$/.test(claims.quoteId)) return null

  try {
    const payload = await getPayload()
    const quote = await payload.findByID({
      collection: 'custom-quotes',
      id: Number(claims.quoteId),
      overrideAccess: true,
      depth: 0,
    })
    if (
      quote.revision !== claims.revision ||
      (quote.linkVersion ?? 1) !== claims.linkVersion ||
      quoteTermsHash(quote) !== claims.termsHash ||
      (quote.status !== 'sent' && quote.status !== 'accepted')
    ) {
      return null
    }
    return { claims, quote }
  } catch {
    return null
  }
}
