import Link from 'next/link'
import { Wordmark } from '@/components/brand/Wordmark'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { CookieSettingsLink } from '@/components/layout/CookieConsent'
import { PUBLIC_CONTACT_EMAIL, SOCIAL_PROFILES } from '@/lib/constants/social'
import { METHODS_ENABLED_IN_STRIPE } from '@/components/trust'

type FooterLink = { href: string; label: string; external?: boolean }

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Shop',
    links: [
      { href: '/store', label: 'All pieces' },
      { href: '/store?category=opal-rings', label: 'Rings' },
      { href: '/store?category=opal-earrings', label: 'Earrings' },
      { href: '/store?category=raw-opals', label: 'Loose opals' },
      { href: '/services/design', label: 'Design a ring' },
    ],
  },
  {
    title: 'Buying',
    links: [
      { href: '/shipping', label: 'Shipping' },
      { href: '/returns', label: 'Returns' },
      { href: '/faq', label: 'Questions' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { href: '/about', label: 'Our story' },
      { href: '/services', label: 'Custom work' },
      { href: '/courses', label: 'Opal-cutting courses' },
      { href: '/blog', label: 'Journal' },
      ...SOCIAL_PROFILES.map((profile) => ({
        href: profile.url,
        label: profile.label ?? profile.platform,
        external: true,
      })),
    ],
  },
]

const linkClass = 'text-ink-2 no-underline transition-colors hover:text-ink'

export function Footer() {
  return (
    <footer className="relative mt-[clamp(48px,7vw,96px)] border-t border-rule px-gut pb-8 pt-9 text-[13.5px] text-ink-2 md:pb-11">
      <div className="grid grid-cols-2 gap-x-[18px] gap-y-[26px] md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-7">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="mb-2.5 block text-[22px] text-ink no-underline" aria-label="The Good Opal Co home">
            <Wordmark />
          </Link>
          <p className="max-w-[34ch]">Australian opals and jewellery, selected and described with care.</p>
          <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className={`mt-2 inline-block ${linkClass}`}>
            {PUBLIC_CONTACT_EMAIL}
          </a>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="mb-2.5 font-sans text-xs font-medium uppercase tracking-[0.06em] text-ink-3">
              {column.title}
            </h2>
            <ul className="grid gap-1.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-9 grid gap-6 border-t border-rule pt-7 md:grid-cols-[1.4fr_3fr] md:gap-7">
        <div className="max-w-md">
          <h2 className="mb-1 font-serif text-xl text-ink">From the gallery</h2>
          <p className="mb-3">New pieces, care notes, and workshop updates, sent occasionally.</p>
          <NewsletterForm />
        </div>
        <div className="grid content-start gap-3">
          <p>Australian opals · Origin and product details · Tracked delivery · Care guidance</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>Secure checkout by Stripe</span>
            <ul className="flex flex-wrap gap-1.5" aria-label="Accepted payment methods">
              {METHODS_ENABLED_IN_STRIPE.map((method) => (
                <li key={method} className="rounded-sm border border-rule-2 px-2 py-0.5 text-xs text-ink-2">
                  {method}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-x-6 gap-y-2 border-t border-rule pt-5 text-[12.5px] text-ink-3 md:flex-row md:flex-wrap md:items-center">
        <p>© {new Date().getFullYear()} The Good Opal Co</p>
        <div className="flex flex-wrap gap-x-5">
          <Link href="/legal/privacy" className="inline-flex min-h-11 items-center text-ink-3 no-underline hover:text-ink md:min-h-0">
            Privacy policy
          </Link>
          <Link href="/legal/terms" className="inline-flex min-h-11 items-center text-ink-3 no-underline hover:text-ink md:min-h-0">
            Terms of service
          </Link>
          <CookieSettingsLink className="inline-flex min-h-11 items-center text-ink-3 hover:text-ink md:min-h-0" />
        </div>
        <p className="md:ml-auto">Australian opal that doesn&apos;t cost the earth.</p>
      </div>
    </footer>
  )
}
