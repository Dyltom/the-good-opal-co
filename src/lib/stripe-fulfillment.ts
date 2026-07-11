import { z } from 'zod'

const shippingDetailsSchema = z.object({
  name: z.string().trim().min(1),
  address: z.object({
    line1: z.string().trim().min(1),
    line2: z.string().trim().min(1).nullable().optional(),
    city: z.string().trim().min(1),
    state: z.string().trim().min(1).nullable().optional(),
    postal_code: z.string().trim().min(1).nullable().optional(),
    country: z.string().trim().length(2),
  }),
})

export type CheckoutShippingDetails = z.infer<typeof shippingDetailsSchema>

interface CheckoutSessionShippingSource {
  collected_information?: {
    shipping_details?: unknown
  } | null
}

export function getRequiredCheckoutShippingDetails(
  session: CheckoutSessionShippingSource
): CheckoutShippingDetails {
  const parsed = shippingDetailsSchema.safeParse(session.collected_information?.shipping_details)

  if (!parsed.success) {
    throw new Error('Paid Stripe session is missing valid shipping details')
  }

  return parsed.data
}

export function shouldFinalizeCheckout(
  paymentStatus: string | null,
  orderConfirmed: boolean
): boolean {
  return paymentStatus === 'paid' && orderConfirmed
}
