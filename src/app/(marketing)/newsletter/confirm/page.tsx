import Link from 'next/link'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'
import { confirmNewsletterSubscription } from '../actions'

export const metadata = {
  title: 'Confirm subscription | The Good Opal Co',
  robots: { index: false, follow: false },
}

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (token) await confirmNewsletterSubscription(token)

  return (
    <MarketingShell>
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <div className="max-w-[60ch]">
          <h1 className="text-[2.25rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4vw,3.5rem)]">
            {token ? 'We couldn’t confirm this link' : 'This link is incomplete'}
          </h1>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.6] text-ink-2">
            {token
              ? 'It may already have been used, or it is more than 24 hours old. Sign up again from the form at the foot of any page and we will send a fresh link.'
              : 'Open the confirmation link from your email again, or sign up from the form at the foot of any page.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/store">Browse available pieces</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}
