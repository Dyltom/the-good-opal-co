import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { OrderTrackingForm } from './tracking-form'
import { MarketingShell, PageHeader } from '@/components/marketing'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Track your order | The Good Opal Co',
  description: 'Track your order status with your order number and email',
  robots: { index: false, follow: false },
}

export default function OrderTrackingPage() {
  return (
    <MarketingShell>
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[clamp(24px,4vw,72px)]">
          <div>
            <PageHeader
              title="Track your order"
              titleClassName="text-[2.25rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4vw,3.5rem)]"
              description="Enter the order number and email from your confirmation message."
              descriptionClassName="mt-3 text-[15px] leading-[1.6]"
            />
            <p className="mt-6 border-t border-rule pt-4 text-sm leading-6 text-ink-2">
              Can&apos;t find your order? Send the details through our{' '}
              <Link
                href="/contact?subject=order"
                className="text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
              >
                order help form
              </Link>
              .
            </p>
          </div>
          <div>
            <OrderTrackingForm />
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}
