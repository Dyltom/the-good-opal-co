import type { Metadata } from 'next'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { Container } from '@/components/layout'
import { EditableHeading, MarketingShell } from '@/components/marketing'
import { ClosingBand } from '@/components/sections/ClosingBand'
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo'
import { getPageContent, type ListItem, pageMetadata } from '@/lib/site-content'

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('faq', '/faq')
}

function groupByCategory(items: ListItem[]) {
  const groups: { title: string; faqs: { question: string; answer: string }[] }[] = []
  for (const { category = '', question = '', answer = '' } of items) {
    const group = groups.find((candidate) => candidate.title === category)
    if (group) group.faqs.push({ question, answer })
    else groups.push({ title: category, faqs: [{ question, answer }] })
  }
  return groups
}

export const dynamic = 'force-dynamic'

export default async function FAQPage() {
  const content = await getPageContent('faq')
  const faqCategories = groupByCategory(content.questions)
  const allFaqs = faqCategories.flatMap((category) => category.faqs)

  return (
    <MarketingShell>
      <FaqJsonLd items={allFaqs} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Frequently asked questions', url: '/faq' },
        ]}
      />
      <Container>
        <header className="grid items-center gap-[18px] pt-[18px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(20px,2.4vw,36px)]">
          <div>
            <h1 className="max-w-[14ch] text-[2.375rem] leading-[0.98] tracking-[-0.025em] md:text-[clamp(2.5rem,4.6vw,4.75rem)]">
              <EditableHeading heading={content.heroHeading} />
            </h1>
            <p className="mt-3 max-w-[50ch] text-[15px] leading-[1.6] text-ink-2 md:mt-5 md:text-base">
              {content.heroText}
            </p>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden bg-plinth md:aspect-auto md:h-[clamp(220px,22vw,340px)]">
            <Image
              src={content.heroImage.src}
              alt={content.heroImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </header>

        <div className="pt-12 md:pt-[clamp(40px,4.5vw,72px)]">
          {faqCategories.map((category, categoryIndex) => (
            <section
              key={category.title}
              aria-labelledby={`faq-${categoryIndex}`}
              className="grid gap-3 border-t border-rule-2 pb-8 pt-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[clamp(20px,3vw,56px)]"
            >
              <h2
                id={`faq-${categoryIndex}`}
                className="text-[1.625rem] leading-[1.1] tracking-[-0.015em] md:text-[clamp(1.625rem,2.4vw,2.25rem)]"
              >
                {category.title}
              </h2>
              <div>
                {category.faqs.map((faq) => (
                  <details key={faq.question} name={`faq-${categoryIndex}`} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[15px] leading-6 text-ink [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <ChevronDown
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-ink-3 group-open:rotate-180 group-open:text-accent motion-safe:transition-transform motion-safe:duration-200"
                      />
                    </summary>
                    <p className="max-w-[65ch] pb-5 text-sm leading-6 text-ink-2">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>

      <ClosingBand
        id="deciding-heading"
        heading={<EditableHeading heading={content.closingHeading} />}
        line={content.closingText}
        image={content.closingImage}
        action={{ href: '/contact?subject=product-question', label: 'Ask about a piece' }}
      />
    </MarketingShell>
  )
}
