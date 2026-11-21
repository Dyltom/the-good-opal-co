import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CONTACT_INFO } from '@/lib/constants/contact'
import { ContactForm } from './contact-form'
import { Eyebrow } from '@/components/ui/eyebrow'
import {
  cleanContactContext,
  cleanContactMessage,
  cleanDesignConfiguration,
  inquiryLabels,
  resolveInquiryType,
} from './contact-intent'

export const metadata: Metadata = {
  title: 'Contact | The Good Opal Co',
  description:
    'Ask about an Australian opal, custom piece, order, course, or private product viewing.',
  alternates: { canonical: '/contact' },
}

interface ContactPageProps {
  searchParams: Promise<{ subject?: string; product?: string; message?: string; design?: string }>
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const query = await searchParams
  const initialInquiry = resolveInquiryType(query.subject)
  const initialProduct = cleanContactContext(query.product)
  const initialMessage = cleanContactMessage(query.message)
  const initialDesignConfiguration = cleanDesignConfiguration(query.design)
  const isCustomIntent = initialInquiry === 'custom-design'
  const isCourseIntent = initialInquiry === 'course-interest'

  return (
    <MarketingShell>
      <section className="border-b border-rule">
        <Container className="pb-8 pt-6 sm:pb-10 sm:pt-8 lg:pb-12">
          <Breadcrumb
            items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
            className="mb-6 sm:mb-8"
          />
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
            <div>
              <Eyebrow>{inquiryLabels[initialInquiry]}</Eyebrow>
              <h1 className="mt-4 text-balance font-serif text-[clamp(2.25rem,4vw,4rem)] font-medium leading-[1.02]">
                Let&apos;s talk opals.
              </h1>
            </div>
            <p className="max-w-xl text-base leading-7 text-ink-2 sm:text-lg sm:leading-8">
              {isCustomIntent
                ? 'Tell us the piece, stone, budget, and occasion you have in mind. A rough idea is enough to begin.'
                : isCourseIntent
                  ? 'Tell us what you want to learn and your current experience. We will share the confirmed format, timing, and availability when they are ready. This is an interest enquiry only.'
                  : 'Ask about a piece, request a closer viewing, or get help with an existing order. Choose the closest topic and share what matters.'}
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-12 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="font-serif text-3xl">
              {isCourseIntent ? 'What helps us reply' : 'A useful first message'}
            </h2>
            <p className="mt-4 max-w-md leading-7 text-ink-2">
              {isCourseIntent
                ? 'Share your current experience, the cutting method you want to learn, and any tools you already use. Leave anything unknown blank.'
                : 'Include a product name or link, your approximate budget, and any date that matters. Leave anything unknown blank.'}
            </p>

            <div className="mt-9 border-y border-rule py-6">
              <div className="flex gap-3">
                <Mail aria-hidden="true" className="mt-1 h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-ink-2">Prefer email?</p>
                  <a
                    className="mt-1 inline-block font-medium underline decoration-ink-3 underline-offset-4 hover:decoration-ink"
                    href={`mailto:${CONTACT_INFO.email}`}
                  >
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>
            </div>

            <nav aria-label="Helpful links" className="mt-7 space-y-3 text-sm">
              <Link
                className="flex max-w-xs items-center justify-between border-b border-rule py-2 hover:text-accent"
                href="/faq"
              >
                Opal and order questions <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className="flex max-w-xs items-center justify-between border-b border-rule py-2 hover:text-accent"
                href="/shipping"
              >
                Shipping information <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className="flex max-w-xs items-center justify-between border-b border-rule py-2 hover:text-accent"
                href="/returns"
              >
                Returns information <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </nav>
          </aside>

          <section
            aria-labelledby="contact-form-heading"
            className="border border-rule bg-bg p-5 sm:p-8 lg:p-10"
          >
            <div className="mb-8 border-b border-rule pb-6">
              <h2 id="contact-form-heading" className="font-serif text-3xl sm:text-4xl">
                Send an enquiry
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-2">
                Fields marked with an asterisk are required.
                {initialProduct ? ` We have added ${initialProduct} for you.` : ''}
              </p>
            </div>
            <ContactForm
              initialInquiry={initialInquiry}
              initialProduct={initialProduct}
              initialMessage={initialMessage}
              initialDesignConfiguration={initialDesignConfiguration}
            />
          </section>
        </div>
      </Container>
    </MarketingShell>
  )
}
