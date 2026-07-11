import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CONTACT_INFO } from '@/lib/constants/contact'
import { ContactForm } from './contact-form'
import { cleanContactContext, inquiryLabels, resolveInquiryType } from './contact-intent'

export const metadata: Metadata = {
  title: 'Contact | The Good Opal Co',
  description: 'Ask about an Australian opal, a custom piece, an order, or a private product viewing.',
}

interface ContactPageProps {
  searchParams: Promise<{ subject?: string; product?: string }>
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const query = await searchParams
  const initialInquiry = resolveInquiryType(query.subject)
  const initialProduct = cleanContactContext(query.product)
  const isCustomIntent = initialInquiry === 'custom-design'

  return (
    <MarketingShell>
        <section className="border-b border-warm-grey/50 px-5 py-14 sm:px-10 sm:py-20 lg:px-[clamp(3rem,8vw,9rem)] lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-sm font-medium text-opal-electric-accessible">{inquiryLabels[initialInquiry]}</p>
              <h1 className="mt-4 max-w-[11ch] text-balance font-serif text-[clamp(3.2rem,7vw,6.8rem)] font-medium leading-[0.95]">
                Let&apos;s talk opals.
              </h1>
            </div>
            <p className="max-w-xl text-base leading-7 text-charcoal-light sm:text-lg sm:leading-8">
              {isCustomIntent
                ? 'Tell us the piece, stone, budget, and occasion you have in mind. A rough idea is enough to begin.'
                : 'Ask about a piece, request a closer viewing, or get help with an existing order. Choose the closest inquiry type and share what matters.'}
            </p>
          </div>
        </section>

        <Container className="py-12 sm:py-16 lg:py-20">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} className="mb-10" />

          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="font-serif text-3xl">A useful first message</h2>
              <p className="mt-4 max-w-md leading-7 text-charcoal-light">
                Include a product name or link, your approximate budget, and any date that matters. Leave anything unknown blank.
              </p>

              <div className="mt-9 border-y border-warm-grey/60 py-6">
                <div className="flex gap-3">
                  <Mail aria-hidden="true" className="mt-1 h-5 w-5 text-opal-electric-accessible" />
                  <div>
                    <p className="text-sm text-charcoal-light">Prefer email?</p>
                    <a className="mt-1 inline-block font-medium underline decoration-warm-grey underline-offset-4 hover:decoration-charcoal" href={`mailto:${CONTACT_INFO.email}`}>
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>
              </div>

              <nav aria-label="Helpful links" className="mt-7 space-y-3 text-sm">
                <Link className="flex max-w-xs items-center justify-between border-b border-warm-grey/40 py-2 hover:text-opal-electric-accessible" href="/faq">
                  Opal and order questions <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link className="flex max-w-xs items-center justify-between border-b border-warm-grey/40 py-2 hover:text-opal-electric-accessible" href="/shipping">
                  Shipping information <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link className="flex max-w-xs items-center justify-between border-b border-warm-grey/40 py-2 hover:text-opal-electric-accessible" href="/returns">
                  Returns information <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </nav>
            </aside>

            <section aria-labelledby="contact-form-heading" className="bg-white p-5 shadow-sm sm:p-8 lg:p-10">
              <div className="mb-8 border-b border-warm-grey/50 pb-6">
                <h2 id="contact-form-heading" className="font-serif text-3xl sm:text-4xl">Send an enquiry</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-charcoal-light">
                  Fields marked with an asterisk are required. Your selected inquiry and product are already carried through from the previous page.
                </p>
              </div>
              <ContactForm initialInquiry={initialInquiry} initialProduct={initialProduct} />
            </section>
          </div>
        </Container>
    </MarketingShell>
  )
}
