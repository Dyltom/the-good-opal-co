'use client'

import { useEffect } from 'react'
import { trackNewsletterSignup } from '@/lib/analytics'

export function NewsletterConversion() {
  useEffect(() => {
    trackNewsletterSignup('email-confirmation')
  }, [])

  return null
}
