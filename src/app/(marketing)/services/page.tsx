import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
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
      <section className="grid lg:min-h-[34rem] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex items-center px-5 py-12 sm:px-10 sm:py-14 lg:px-[clamp(3rem,6vw,6.5rem)] lg:py-16">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-medium text-opal-electric-accessible">
              Custom opal jewellery
            </p>
            <h1 className="max-w-[12ch] text-balance font-serif text-[clamp(2.75rem,5vw,4.75rem)] font-medium leading-[1.02]">
              Begin with the stone.
            </h1>
            <p className="mt-5 max-w-[58ch] text-base leading-7 text-charcoal-light sm:text-lg sm:leading-8">
              Bring an idea, a meaningful occasion, or simply a colour you love. We&apos;ll help
              shape a one-of-a-kind piece around an Australian opal.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-charcoal bg-none text-cream hover:bg-charcoal-dark sm:w-auto"
              >
                <Link href="/services/design">Design a ring in 3D</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/contact?subject=custom-design">Start with an enquiry</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm leading-6 text-charcoal-light">
              No finished brief required. We&apos;ll ask the practical questions.
            </p>
          </div>
        </div>

        <div className="relative min-h-[22rem] overflow-hidden bg-black-rich sm:min-h-[26rem] lg:min-h-full">
          <Image
            src="/images/customs/custom-2.jpg"
            alt="Four Australian opals viewed together in natural light"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 54vw"
          />
          <div className="absolute bottom-0 left-0 max-w-xs bg-cream p-5 sm:p-7">
            <p className="font-serif text-2xl leading-tight">Every design starts differently.</p>
            <p className="mt-2 text-sm leading-6 text-charcoal-light">
              Stone first, story first, or budget first. All are useful starting points.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-warm-grey/50 bg-white py-14 sm:py-20" id="how-it-works">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div>
              <p className="text-sm font-medium text-opal-electric-accessible">The process</p>
              <h2 className="mt-3 max-w-[16ch] text-balance font-serif text-4xl leading-tight sm:text-5xl">
                Clear decisions, one at a time.
              </h2>
              <p className="mt-5 max-w-md leading-7 text-charcoal-light">
                Custom work is quoted after we understand the stone, design, material, and timing.
                Nothing moves ahead until the scope is clear.
              </p>
            </div>

            <ol className="divide-y divide-warm-grey/60 border-y border-warm-grey/60">
              {process.map((step) => (
                <li
                  key={step.number}
                  className="grid gap-3 py-6 sm:grid-cols-[4rem_0.7fr_1.3fr] sm:gap-6 sm:py-7"
                >
                  <span className="text-sm font-medium text-opal-electric-accessible">
                    {step.number}
                  </span>
                  <h3 className="font-serif text-2xl leading-tight">{step.title}</h3>
                  <p className="max-w-[58ch] text-sm leading-6 text-charcoal-light sm:text-base sm:leading-7">
                    {step.copy}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden bg-warm-grey/30">
              <Image
                src="/images/customs/custom-1.jpg"
                alt="Three heart-shaped Australian opals considered for a personal piece"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 52vw"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-opal-electric-accessible">
                Before you enquire
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                What helps us guide you
              </h2>
              <ul className="mt-6 space-y-3">
                {goodStartingPoints.map((item) => (
                  <li key={item} className="flex gap-3 leading-7 text-charcoal-light">
                    <Check
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-opal-electric-accessible"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-6 text-charcoal-light">
                Unsure about any of these? Leave the field blank. An enquiry is a conversation, not
                a commitment.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-charcoal py-14 text-cream sm:py-16">
        <Container>
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm text-opal-light">Ready when you are</p>
              <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight sm:text-5xl">
                Tell us what you have in mind.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-cream/70">
                Sketch a ring in the 3D studio, or send an enquiry with your stone, budget, and
                timing. Either way, you&apos;ll get a useful first reply.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/services/design"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cream px-7 font-medium text-charcoal transition-colors hover:bg-opal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-light focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
              >
                Open the design studio <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/contact?subject=custom-design"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-4 font-medium text-cream/80 underline-offset-4 transition-colors hover:text-cream hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-light focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
              >
                Start with an enquiry
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </MarketingShell>
  )
}
