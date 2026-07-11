import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'Our Story | The Good Opal Co',
  description:
    'Meet The Good Opal Co, an Australian opal studio focused on clear product details, thoughtful selection, and personal guidance.',
}

const principles = [
  {
    title: 'The stone comes first',
    description:
      'Photography and product details should help you see the character of each opal before you decide.',
  },
  {
    title: 'Details over claims',
    description:
      'We share the origin, material, measurements, and treatment information available for each piece.',
  },
  {
    title: 'Questions are welcome',
    description:
      'If colour, scale, or a fine detail matters, ask for another image or a virtual viewing before purchase.',
  },
]

export default function AboutPage() {
  return (
    <MarketingShell>
        <section className="border-b border-warm-grey/60">
          <div className="grid min-h-[34rem] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center bg-cream px-6 py-16 sm:px-10 lg:px-[max(4rem,calc((100vw-80rem)/2))]">
              <div className="max-w-xl">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fire-pink-dark">
                  Our story
                </p>
                <h1 className="mt-5 text-balance font-serif text-5xl font-medium leading-none text-charcoal sm:text-6xl lg:text-7xl">
                  A closer look at Australian opal.
                </h1>
                <p className="mt-7 max-w-lg font-sans text-lg leading-8 text-charcoal/70">
                  The Good Opal Co is a small Australian opal business built for people who want to understand the stone they are choosing, not just admire it from a distance.
                </p>
              </div>
            </div>
            <div className="relative min-h-[25rem] bg-charcoal lg:min-h-full">
              <Image
                src="/images/about-hero.jpg"
                alt="A selection of polished Australian opals in gem cases"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        <Container className="py-16 sm:py-20 lg:py-28">
          <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fire-pink-dark">
                What we do
              </p>
              <h2 className="mt-4 text-balance font-serif text-4xl font-medium leading-tight text-charcoal sm:text-5xl">
                Opals selected one piece at a time.
              </h2>
            </div>
            <div className="max-w-2xl space-y-6 font-sans text-base leading-8 text-charcoal/70">
              <p>
                Every opal has its own colour, pattern, body tone, and response to light. Our role is to present those differences clearly so a first-time buyer, gift buyer, or collector can make a considered choice.
              </p>
              <p>
                The collection includes loose stones and finished jewellery. Product pages carry the details available for each individual piece. When something is not clear, contact us before ordering and we will help you inspect it more closely.
              </p>
              <p>
                Founder Stephanie Caruana leads The Good Opal Co and the personal guidance behind each enquiry.
              </p>
            </div>
          </section>

          <section className="mt-20 border-y border-warm-grey/60 py-12 lg:mt-28 lg:py-16">
            <h2 className="sr-only">How we work</h2>
            <div className="grid gap-10 md:grid-cols-3 md:gap-0">
              {principles.map((principle, index) => (
                <article
                  key={principle.title}
                  className="md:px-8 md:first:pl-0 md:last:pr-0 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-warm-grey/60"
                >
                  <p className="font-serif text-2xl text-charcoal" aria-hidden="true">
                    0{index + 1}
                  </p>
                  <h3 className="mt-5 font-serif text-2xl font-medium text-charcoal">
                    {principle.title}
                  </h3>
                  <p className="mt-3 font-sans text-sm leading-7 text-charcoal/70">
                    {principle.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-20 grid items-center gap-10 lg:mt-28 lg:grid-cols-2 lg:gap-20">
            <div className="relative aspect-[4/5] overflow-hidden bg-charcoal">
              <Image
                src="/images/founders.jpg"
                alt="A polished Australian opal viewed under direct light"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="max-w-xl">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fire-pink-dark">
                Buy with context
              </p>
              <h2 className="mt-4 text-balance font-serif text-4xl font-medium leading-tight text-charcoal sm:text-5xl">
                Opal changes with the light. Good information should not.
              </h2>
              <p className="mt-6 font-sans text-base leading-8 text-charcoal/70">
                Screen colour and lighting can change how an opal appears. We use available photos and written details to reduce that uncertainty, then offer personal help when you need another look.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/store"
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-charcoal px-6 font-sans text-sm font-semibold text-cream transition-colors hover:bg-charcoal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
                >
                  Browse available pieces
                </Link>
                <Link
                  href="/contact?subject=virtual-viewing"
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-charcoal/25 px-6 font-sans text-sm font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
                >
                  Ask for a closer look
                </Link>
              </div>
            </div>
          </section>
        </Container>
    </MarketingShell>
  )
}
