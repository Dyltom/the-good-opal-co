'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { FooterProps, SocialLink } from '@/types'
import { Container } from '@/components/layout'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { CookieSettingsLink } from '@/components/layout/CookieConsent'

/**
 * Social Icon Component
 */
function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const icons: Record<string, React.ReactElement> = {
    facebook: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z" />
      </svg>
    ),
    twitter: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    instagram: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
    tiktok: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  }

  return icons[platform] || null
}

/**
 * Default footer configuration
 */
const defaultLinks = [
  {
    title: 'Shop',
    links: [
      { href: '/store', label: 'All Products' },
      { href: '/store?category=raw-opals', label: 'Raw Opals' },
      { href: '/store?category=opal-rings', label: 'Rings' },
      { href: '/store?category=opal-necklaces', label: 'Necklaces' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/shipping', label: 'Shipping Info' },
      { href: '/returns', label: 'Returns' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/about', label: 'Our Story' },
      { href: '/services', label: 'Services' },
    ],
  },
]

const defaultSocial: SocialLink[] = []

/**
 * Footer Component
 */
export function Footer({
  logo,
  logoText = 'The Good Opal Co',
  description = 'Australian opals and jewellery, selected and described with care.',
  links = defaultLinks,
  social = defaultSocial,
  copyright,
  className,
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn('relative', className)}>
      <div className="border-t border-warm-grey/20 bg-charcoal-dark text-white">
        <Container>
          <div className="py-16 md:py-20">
            <div className="grid gap-12 lg:grid-cols-2 mb-16">
              <div>
                <Link href="/" className="mb-6 flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-dark">
                  {logo ? (
                    <Image
                      src={logo.url}
                      alt={logo.alt}
                      width={logo.width || 48}
                      height={logo.height || 48}
                      className="h-12 w-auto"
                    />
                  ) : null}
                  <div>
                    <span className="font-serif text-2xl font-semibold">{logoText}</span>
                    <span className="block font-sans text-xs uppercase text-white/50">Australian Opals</span>
                  </div>
                </Link>
                <p className="text-white/60 mb-8 max-w-md leading-relaxed">{description}</p>

                {/* Social Links */}
                {social && social.length > 0 && (
                  <div className="flex gap-4">
                    {social.map((link) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-colors duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-dark"
                        aria-label={link.label || link.platform}
                      >
                        <SocialIcon platform={link.platform} className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Newsletter Column */}
              <div className="lg:text-right">
                <h3 className="font-serif text-lg font-semibold mb-2">From the gallery</h3>
                <p className="text-white/60 mb-6">
                  New pieces, care notes, and workshop updates, sent occasionally.
                </p>
                <NewsletterForm variant="compact" source="footer" className="lg:max-w-md lg:ml-auto" />
              </div>
            </div>

            {/* Link Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {links.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-white/80">{group.title}</h3>
                  <ul className="space-y-3">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="rounded text-sm text-white/55 transition-colors duration-200 hover:text-opal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-1 focus-visible:ring-offset-charcoal-dark"
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Trust Badges Column */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase text-white/80">What to expect</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-opal-electric" />
                    Australian opals
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-fire-pink" />
                    Origin and product details
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-opal-emerald" />
                    Tracked delivery
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-fire-orange" />
                    Care guidance
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-white/40">
                {copyright || `© ${currentYear} ${logoText}. All rights reserved.`}
              </div>
              <div className="flex gap-6 text-sm text-white/40">
                <Link href="/legal/privacy" className="rounded px-1 transition-colors hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-1 focus-visible:ring-offset-charcoal-dark">Privacy Policy</Link>
                <Link href="/legal/terms" className="rounded px-1 transition-colors hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-1 focus-visible:ring-offset-charcoal-dark">Terms of Service</Link>
                <CookieSettingsLink className="rounded px-1 transition-colors hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-1 focus-visible:ring-offset-charcoal-dark" />
              </div>
              <div className="text-xs text-white/35">
                Australian opal that doesn&apos;t cost the earth.
              </div>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}
