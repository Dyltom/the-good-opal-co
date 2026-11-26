'use client'

import Script from 'next/script'
import { GOOGLE_MERCHANT_ID, type SurveyOptIn } from '@/lib/customer-reviews'

interface Gapi {
  load(module: string, callback: () => void): void
  surveyoptin: { render(config: Record<string, unknown>): void }
}

export function CustomerReviewsOptIn({ optIn }: { optIn: SurveyOptIn }) {
  return (
    <Script
      src="https://apis.google.com/js/platform.js"
      strategy="afterInteractive"
      onLoad={() => {
        const gapi = (window as unknown as { gapi?: Gapi }).gapi
        gapi?.load('surveyoptin', () =>
          gapi.surveyoptin.render({
            merchant_id: GOOGLE_MERCHANT_ID,
            order_id: optIn.orderId,
            email: optIn.email,
            delivery_country: optIn.deliveryCountry,
            estimated_delivery_date: optIn.estimatedDeliveryDate,
          })
        )
      }}
    />
  )
}
