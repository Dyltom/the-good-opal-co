import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout'
import { EditableHeading, MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'
import { JewellerQuotes } from '@/components/sections/JewellerQuotes'
import { ClosingBand } from '@/components/sections/ClosingBand'
import { getPageContent } from '@/lib/site-content'

export const metadata: Metadata = {
  title: 'Custom Opal Jewellery | The Good Opal Co',
  description:
    'Start with an Australian opal, an idea, or an occasion. Enquire about a one-of-a-kind custom jewellery piece.',
  alternates: { canonical: '/services' },
}

const process = [
  {
    number: '01',
    title: 'Tell us what matters',
    copy: 'Occasion, style, metal, budget and timing. A rough idea is enough.',
  },
  {
    number: '02',
    title: 'Choose the opal',
    copy: 'Pick one from the store, or ask for closer photos of other stones.',
  },
  {
    number: '03',
    title: 'Agree on the piece',
    copy: 'Design, quote and timing are confirmed before work begins. Custom work, including its deposit, is not eligible for change-of-mind returns.',
  },
  {
    number: '04',
    title: 'Make and deliver',
    copy: 'Made to the agreed brief and sent with care guidance.',
  },
]

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  const content = await getPageContent('services')
  return (
    <MarketingShell>
      <Container>
        <header className="grid items-center gap-[18px] pt-[18px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(20px,2.4vw,36px)]">
          <div>
            <h1 className="max-w-[12ch] text-[2.375rem] leading-[0.98] tracking-[-0.025em] md:text-[clamp(2.5rem,4.6vw,4.75rem)]">
              <EditableHeading heading={content.heroHeading} />
            </h1>
            <p className="mt-3 max-w-[50ch] text-[15px] leading-[1.6] text-ink-2 md:mt-5 md:text-base">
              {content.heroText}
            </p>
            <div className="mt-5 flex flex-wrap gap-3 md:mt-6">
              <Button asChild>
                <Link href="/services/design">
                  Design a ring in 3D <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/contact?subject=custom-design">Start with an enquiry</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-plinth md:aspect-auto md:h-[clamp(260px,27vw,400px)]">
            <Image
              src={content.heroImage.src}
              alt={content.heroImage.alt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </header>

        <section
          id="how-it-works"
          aria-labelledby="process-heading"
          className="grid gap-6 pt-14 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(48px,5.5vw,84px)]"
        >
          <h2
            id="process-heading"
            className="max-w-[16ch] text-[clamp(1.875rem,3.2vw,3.125rem)] leading-[1.04] tracking-[-0.02em]"
          >
            <EditableHeading heading={content.processHeading} />
          </h2>
          <ol className="border-t border-rule-2">
            {process.map((step) => (
              <li
                key={step.number}
                className="grid gap-1.5 border-b border-rule py-4 sm:grid-cols-[2.5rem_minmax(0,0.75fr)_minmax(0,1.25fr)] sm:gap-5 sm:py-5"
              >
                <span className="pt-1 text-[13px] tabular-nums text-ink-3">{step.number}</span>
                <h3 className="text-[1.375rem] leading-[1.15]">{step.title}</h3>
                <p className="max-w-[58ch] text-sm leading-6 text-ink-2">{step.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="pt-14 md:pt-[clamp(48px,5.5vw,84px)]">
          <JewellerQuotes />
        </div>
      </Container>

      <ClosingBand
        id="start-heading"
        heading={<EditableHeading heading={content.closingHeading} />}
        line={content.closingText}
        image={content.closingImage}
        action={{ href: '/services/design', label: 'Open the 3D designer' }}
      />
    </MarketingShell>
  )
}
