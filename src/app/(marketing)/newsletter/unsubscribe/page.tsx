import Link from 'next/link'
import { Container } from '@/components/layout'
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
      <Container className="pb-sec pt-[18px] md:pt-[clamp(20px,2.4vw,36px)]">
        <div className="max-w-[60ch]">
          <h1 className="text-[2.25rem] leading-[1.02] tracking-[-0.025em] md:text-[clamp(2.5rem,4vw,3.5rem)]">
            {title}
          </h1>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.6] text-ink-2">{message}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {!status && token ? (
              <form action={submitNewsletterUnsubscribe.bind(null, token)}>
                <Button type="submit">Unsubscribe</Button>
              </form>
            ) : null}
            <Button asChild variant="ghost">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}
