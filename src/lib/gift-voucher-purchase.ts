import type Stripe from 'stripe'
import { isValidGiftVoucherAmount } from '@/lib/gift-voucher-rules'
import { GIFT_VOUCHER_PURCHASE_METADATA_KEY, issuePurchasedGiftVoucher } from '@/lib/gift-vouchers'

export function isGiftVoucherPurchaseSession(session: Stripe.Checkout.Session): boolean {
  return session.metadata?.[GIFT_VOUCHER_PURCHASE_METADATA_KEY] === 'true'
}

export async function issueGiftVoucherFromSession(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {}
  const amount = Number(metadata['amount'])
  if (!isValidGiftVoucherAmount(amount) || session.amount_total !== amount * 100) {
    throw new Error(`Gift voucher session ${session.id} paid ${session.amount_total} for a ${metadata['amount']} voucher`)
  }
  const purchaserEmail = session.customer_details?.email ?? session.customer_email ?? ''
  return issuePurchasedGiftVoucher({
    stripeCheckoutSessionId: session.id,
    amount,
    purchaserName: metadata['purchaserName'] ?? '',
    purchaserEmail,
    recipientName: metadata['recipientName'] ?? '',
    recipientEmail: metadata['recipientEmail'] || purchaserEmail,
    message: metadata['message'] || undefined,
    issuedAt: new Date(session.created * 1000),
  })
}
