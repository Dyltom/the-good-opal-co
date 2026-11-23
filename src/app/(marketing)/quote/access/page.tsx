import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing'
import { QuoteAccessRedeemer } from './quote-access-redeemer'

export const metadata: Metadata = {
  title: 'Secure quote access | The Good Opal Co',
  robots: { index: false, follow: false, nocache: true },
}

export default function QuoteAccessPage() {
  return (
    <MarketingShell>
      <QuoteAccessRedeemer />
    </MarketingShell>
  )
}
