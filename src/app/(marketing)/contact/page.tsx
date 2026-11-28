import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { Container } from '@/components/layout'
import { EditableHeading, MarketingShell } from '@/components/marketing'
import { CONTACT_INFO } from '@/lib/constants/contact'
import { getPageContent, pageMetadata } from '@/lib/site-content'
import { ContactForm } from './contact-form'
import {
  cleanContactContext,
  cleanContactMessage,
  cleanDesignConfiguration,
  resolveInquiryType,
} from './contact-intent'

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('contact', '/contact')
}

interface ContactPageProps {
  searchParams: Promise<{ subject?: string; product?: string; message?: string; design?: string }>
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [query, content] = await Promise.all([searchParams, getPageContent('contact')])
  const initialInquiry = resolveInquiryType(query.subject)
  const initialProduct = cleanContactContext(query.product)
  const initialMessage = cleanContactMessage(query.message)
  const initialDesignConfiguration = cleanDesignConfiguration(query.design)
  const isCustomIntent = initialInquiry === 'custom-design'
  const isCourseIntent = initialInquiry === 'course-interest'

  return (
    <MarketingShell>
      <Container className="pb-sec">
        <header className="grid gap-3 pt-[18px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-end md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(20px,2.4vw,36px)]">
          <h1 className="text-[2.375rem] leading-[0.98] tracking-[-0.025em] md:text-[clamp(2.5rem,4.6vw,4.75rem)]">
            <EditableHeading heading={content.heroHeading} />
          </h1>
          <p className="max-w-[52ch] text-[15px] leading-[1.6] text-ink-2 md:text-base">
            {isCustomIntent
              ? content.customIntro
              : isCourseIntent
                ? content.courseIntro
                : content.heroText}
          </p>
        </header>

        <div className="mt-8 grid gap-10 border-t border-rule-2 pt-6 md:mt-[clamp(32px,3.5vw,56px)] lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-[clamp(32px,4vw,72px)]">
          <aside className="lg:sticky lg:top-[calc(theme(spacing.mast)+24px)] lg:self-start">
            <h2 className="text-[1.75rem] leading-[1.1]">
              {isCourseIntent ? content.courseTipsHeading : content.tipsHeading}
            </h2>
            <p className="mt-3 max-w-[48ch] text-sm leading-6 text-ink-2">
              {isCourseIntent ? content.courseTipsText : content.tipsText}
            </p>

            <div className="mt-6 flex gap-3 border-y border-rule py-5">
              <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 text-ink-3" />
              <div>
                <p className="text-[13px] text-ink-3">Prefer email?</p>
                <a
                  className="mt-1 inline-block text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
                  href={`mailto:${CONTACT_INFO.email}`}
                >
                  {CONTACT_INFO.email}
                </a>
                <p className="mt-2 text-[13px] text-ink-3">Based in {CONTACT_INFO.address}</p>
              </div>
            </div>

            <nav aria-label="Helpful links" className="mt-5 text-sm">
              <Link
                className="flex min-h-11 max-w-xs items-center justify-between border-b border-rule text-ink-2 transition-colors hover:text-ink"
                href="/faq"
              >
                Opal and order questions <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className="flex min-h-11 max-w-xs items-center justify-between border-b border-rule text-ink-2 transition-colors hover:text-ink"
                href="/shipping"
              >
                Shipping information <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className="flex min-h-11 max-w-xs items-center justify-between border-b border-rule text-ink-2 transition-colors hover:text-ink"
                href="/returns"
              >
                Returns information <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </nav>
          </aside>

          <section aria-labelledby="contact-form-heading" className="bg-plinth p-5 sm:p-8">
            <div className="mb-6 border-b border-rule pb-5">
              <h2 id="contact-form-heading" className="text-[1.75rem] leading-[1.1] md:text-[2rem]">
                Send an enquiry
              </h2>
              <p className="mt-2 max-w-[60ch] text-sm leading-6 text-ink-2">
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
