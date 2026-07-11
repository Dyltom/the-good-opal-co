import type { Metadata } from 'next'
import { QuoteAccessRedeemer } from './quote-access-redeemer'

export const metadata: Metadata = {
  title: 'Secure quote access | The Good Opal Co',
  robots: { index: false, follow: false, nocache: true },
}

export default function QuoteAccessPage() {
  return <QuoteAccessRedeemer />
}
