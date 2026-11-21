import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { Button } from '@/components/ui/button'

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
    copy: 'Share the occasion, style, metal preference, budget, and any date you are working toward. A rough idea is enough.',
  },
  {
    number: '02',
    title: 'Choose the opal',
    copy: 'We discuss suitable stones and can share closer photos or video where available. You can also enquire about a stone already in the store.',
  },
  {
    number: '03',
    title: 'Agree on the piece',
    copy: 'We confirm the design direction, quote, expected timing, and what is included before work begins.',
  },
  {
    number: '04',
    title: 'Make and deliver',
    copy: 'Your piece is made to the agreed brief. Delivery details and care guidance are provided when it is ready.',
  },
]

const goodStartingPoints = [
  'A particular opal, colour, or shape',
  'A ring, pendant, earrings, or another piece',
  'Your approximate budget in AUD',
  'A date or occasion, if timing matters',
]

export default function ServicesPage() {
  return (
    <MarketingShell>
      <Container className="pb-sec">
        <header className="grid items-center gap-[18px] pt-[18px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(20px,2.4vw,36px)]">
          <div>
            <h1 className="max-w-[12ch] text-[2.375rem] leading-[0.98] tracking-[-0.025em] md:text-[clamp(2.5rem,4.6vw,4.75rem)]">
              Begin with <i>the stone.</i>
            </h1>
            <p className="mt-3 max-w-[50ch] text-[15px] leading-[1.6] text-ink-2 md:mt-5 md:text-base">
              Bring an idea, a meaningful occasion, or simply a colour you love. We&apos;ll help
              shape a one-of-a-kind piece around an Australian opal.
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
            <p className="mt-3 text-[13px] leading-5 text-ink-3">
              No finished brief required. We&apos;ll ask the practical questions.
            </p>
          </div>
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden bg-plinth md:aspect-auto md:h-[clamp(260px,27vw,400px)]">
              <Image
                src="/images/customs/custom-2.jpg"
                alt="Four Australian opals viewed together in natural light"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <figcaption className="mt-3 text-sm leading-6 text-ink-2">
              <span className="font-serif text-base text-ink">
                Every design starts differently.
              </span>{' '}
              Stone first, story first, or budget first. All are useful starting points.
            </figcaption>
          </figure>
        </header>

        <section
          id="how-it-works"
          aria-labelledby="process-heading"
          className="grid gap-6 pt-14 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(48px,5.5vw,84px)]"
        >
          <div>
            <h2
              id="process-heading"
              className="max-w-[16ch] text-[clamp(1.875rem,3.2vw,3.125rem)] leading-[1.04] tracking-[-0.02em]"
            >
              Clear decisions, <i>one at a time.</i>
            </h2>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.65] text-ink-2">
              Custom work is quoted after we understand the stone, design, material, and timing.
              Nothing moves ahead until the scope is clear.
            </p>
          </div>
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

        <section
          aria-labelledby="guide-heading"
          className="grid items-center gap-6 pt-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(48px,5.5vw,84px)]"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-plinth">
            <Image
              src="/images/customs/custom-1.jpg"
              alt="Three heart-shaped Australian opals considered for a personal piece"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 52vw"
            />
          </div>
          <div>
            <h2
              id="guide-heading"
              className="text-[clamp(1.875rem,3.2vw,3.125rem)] leading-[1.04] tracking-[-0.02em]"
            >
              What helps us <i>guide you</i>
            </h2>
            <ul className="mt-5 border-t border-rule-2">
              {goodStartingPoints.map((item) => (
                <li key={item} className="border-b border-rule py-3 text-[15px] leading-6 text-ink">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-[52ch] text-sm leading-6 text-ink-2">
              Unsure about any of these? Leave the field blank. An enquiry is a conversation, not a
              commitment.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="start-heading"
          className="mt-14 grid items-end gap-6 bg-plinth p-6 sm:p-8 md:mt-[clamp(48px,5.5vw,84px)] md:grid-cols-[minmax(0,1fr)_auto] md:gap-10 md:p-10"
        >
          <div>
            <h2
              id="start-heading"
              className="max-w-[16ch] text-[clamp(1.875rem,3.2vw,3.125rem)] leading-[1.04] tracking-[-0.02em]"
            >
              Tell us what you <i>have in mind.</i>
            </h2>
            <p className="mt-3 max-w-[56ch] text-[15px] leading-[1.65] text-ink-2">
              Sketch a ring in the 3D studio, or send an enquiry with your stone, budget, and
              timing. Either way, you&apos;ll get a useful first reply.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/services/design">
                Open the design studio <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/contact?subject=custom-design">Start with an enquiry</Link>
            </Button>
          </div>
        </section>
      </Container>
    </MarketingShell>
  )
}
