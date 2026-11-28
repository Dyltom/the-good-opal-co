import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { EditableHeading, MarketingShell, PageHeader } from '@/components/marketing'
import { BreadcrumbJsonLd } from '@/components/seo'
import { getPageContent, pageMetadata } from '@/lib/site-content'
import { GiftVoucherForm } from './gift-voucher-form'

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('giftVouchers', '/gift-vouchers')
}

export const dynamic = 'force-dynamic'

export default async function GiftVouchersPage() {
  const content = await getPageContent('giftVouchers')
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Gift vouchers', url: '/gift-vouchers' },
        ]}
      />
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <PageHeader
          title={<EditableHeading heading={content.heroHeading} />}
          description={content.heroText}
        />
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-[clamp(32px,5vw,80px)]">
          <GiftVoucherForm />
          <aside className="border-t border-rule pt-6 text-sm leading-6 text-ink-2 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <h2 className="text-[1.5rem] leading-[1.15] text-ink">How it works</h2>
            <ul className="mt-3 grid gap-2">
              <li>The code is emailed as soon as payment goes through.</li>
              <li>Valid for three years from purchase.</li>
              <li>Any balance left after an order stays on the code for next time.</li>
              <li>Not redeemable for cash.</li>
            </ul>
            <p className="mt-4">
              <Link
                href="/legal/terms#gift-vouchers"
                className="text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
              >
                Gift voucher terms
              </Link>
            </p>
          </aside>
        </div>
      </Container>
    </MarketingShell>
  )
}
