import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Page not found | The Good Opal Co',
  robots: { index: false, follow: true },
}

export default function MissingPage() {
  notFound()
}
