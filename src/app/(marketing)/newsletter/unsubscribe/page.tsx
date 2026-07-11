import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'
import { submitNewsletterUnsubscribe } from '../actions'

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string; status?: string }>
}

export const metadata = {
  title: 'Newsletter preferences | The Good Opal Co',
  robots: { index: false, follow: false },
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token, status } = await searchParams

  const title = status === 'success' ? 'You are unsubscribed' : 'Newsletter preferences'
  const message =
    status === 'success'
      ? 'You will no longer receive marketing emails from us.'
      : status === 'invalid'
        ? 'This unsubscribe link is invalid or has already been used.'
        : 'Confirm that you want to stop receiving marketing emails.'

  return (
    <MarketingShell>
      <Section padding="xl">
        <Container>
          <div className="mx-auto max-w-xl border border-warm-grey/60 bg-white p-8 text-center shadow-sm sm:p-12">
            <h1 className="font-serif text-4xl font-semibold text-charcoal">{title}</h1>
            <p className="mt-4 font-sans text-sm leading-6 text-charcoal/70">{message}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!status && token ? (
                <form action={submitNewsletterUnsubscribe.bind(null, token)}>
                  <Button type="submit">Unsubscribe</Button>
                </form>
              ) : null}
              <Button asChild variant="outline">
                <Link href="/">Return home</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </MarketingShell>
  )
}
