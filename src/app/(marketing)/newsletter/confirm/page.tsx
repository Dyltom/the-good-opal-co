import Link from 'next/link'
import { Container, Section } from '@/components/layout'
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
      <Section padding="xl">
        <Container>
          <div className="mx-auto max-w-xl border border-warm-grey/60 bg-white p-8 text-center shadow-sm sm:p-12">
            <h1 className="font-serif text-4xl font-semibold text-charcoal">
              {token ? 'We couldn’t confirm this link' : 'This link is incomplete'}
            </h1>
            <p className="mt-4 font-sans text-sm leading-6 text-charcoal/70">
              {token
                ? 'It may already have been used, or it is more than 24 hours old. Sign up again from the form at the foot of any page and we will send a fresh link.'
                : 'Open the confirmation link from your email again, or sign up from the form at the foot of any page.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/store">Browse available pieces</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </MarketingShell>
  )
}
