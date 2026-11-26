import Link from 'next/link'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { CookieSettingsLink } from '@/components/layout/CookieConsent'
import { PUBLIC_CONTACT_EMAIL, SOCIAL_PROFILES } from '@/lib/constants/social'
import { ACCEPTED_PAYMENT_METHODS } from '@/lib/constants/payment'

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Shop',
    links: [
      { href: '/store', label: 'All pieces' },
      { href: '/store?category=opal-rings', label: 'Rings' },
      { href: '/store?category=opal-earrings', label: 'Earrings' },
      { href: '/store?category=raw-opals', label: 'Loose opals' },
      { href: '/gift-vouchers', label: 'Gift vouchers' },
    ],
  },
  {
    title: 'Help',
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
      { href: '/services/design', label: 'Design a ring' },
      { href: '/services', label: 'Custom work' },
      { href: '/courses', label: 'Courses' },
      { href: '/blog', label: 'Journal' },
    ],
  },
]

const linkClass = 'text-ink-2 no-underline transition-colors hover:text-ink'
const smallLinkClass = 'inline-flex min-h-11 items-center text-ink-3 no-underline hover:text-ink md:min-h-0'

export function Footer() {
  return (
    <footer className="relative mt-[clamp(48px,7vw,96px)] border-t border-rule px-gut pb-8 pt-9 text-[13.5px] text-ink-2 md:pb-11">
      <div className="grid gap-9 md:grid-cols-[1.4fr_3fr] md:gap-7">
        <div id="join" className="max-w-md scroll-mt-20">
          <h2 className="mb-1 font-serif text-xl text-ink">10% off when you join</h2>
          <p className="mb-3">A one-time code, then new pieces now and then.</p>
          <NewsletterForm />
        </div>
        <nav aria-label="Footer" className="grid grid-cols-3 gap-x-[18px] md:gap-7">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-2.5 font-sans text-xs font-medium uppercase tracking-[0.06em] text-ink-3">
                {column.title}
              </h2>
              <ul className="grid gap-1.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-9 flex flex-col gap-x-6 gap-y-3 border-t border-rule pt-5 text-[12.5px] text-ink-3 md:flex-row md:flex-wrap md:items-center">
        <div className="flex flex-wrap gap-x-5">
          <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className={smallLinkClass}>
            {PUBLIC_CONTACT_EMAIL}
          </a>
          {SOCIAL_PROFILES.map((profile) => (
            <a key={profile.url} href={profile.url} target="_blank" rel="noopener noreferrer" className={smallLinkClass}>
              {profile.label ?? profile.platform}
            </a>
          ))}
          <Link href="/legal/privacy" className={smallLinkClass}>
            Privacy
          </Link>
          <Link href="/legal/terms" className={smallLinkClass}>
            Terms
          </Link>
          <CookieSettingsLink className="inline-flex min-h-11 items-center text-ink-3 hover:text-ink md:min-h-0" />
        </div>
        <ul className="flex flex-wrap gap-1.5 md:ml-auto" aria-label="Accepted payment methods">
          {ACCEPTED_PAYMENT_METHODS.map((method) => (
            <li key={method} className="rounded-sm border border-rule-2 px-2 py-0.5 text-[11.5px] text-ink-2">
              {method}
            </li>
          ))}
        </ul>
        <p className="w-full">© {new Date().getFullYear()} The Good Opal Co · Australian opal that doesn&apos;t cost the earth.</p>
      </div>
    </footer>
  )
}
