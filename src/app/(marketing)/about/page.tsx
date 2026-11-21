import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { Eyebrow } from '@/components/ui/eyebrow'
import { MarketingShell } from '@/components/marketing'
import { BreadcrumbJsonLd, JsonLd, OrganizationJsonLd } from '@/components/seo'
import { APP_NAME, APP_URL } from '@/lib/constants'
import { getPayload } from '@/lib/payload'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Our Story | The Good Opal Co',
  description:
    'Meet The Good Opal Co, an Australian opal studio focused on clear product details, thoughtful selection, and personal guidance.',
  alternates: { canonical: '/about' },
}
export const dynamic = 'force-dynamic'

const aboutHeroImages = [
  { src: '/images/products/20210819_102749.jpg', alt: 'A white opal in a beaded silver halo ring, worn on a finger' },
  { src: '/images/products/20211129_164004-1-1.jpg', alt: 'A polished black opal with green and orange fire' },
  { src: '/images/products/20211104_231959.jpg', alt: 'A polished white opal with green fire, held between two fingers' },
]

const stephQuotes = [
  {
    text: 'Opal is mysterious and wonderful. I don\u2019t think the uniqueness of opal is matched by many other things in this world\u2026',
    post: 'opal-cutting-a-beginners-guide',
    title: 'Opal Cutting: A Free Beginner\u2019s Guide',
    date: 'September 2020',
  },
  {
    text: 'Lightning Ridge Opal cuts incredibly generously compared to opal from other parts of Australia. It can be more predictable which is an opal cutter\u2019s dream.',
    post: 'lightning-ridge-opal',
    title: 'Lightning Ridge Opal',
    date: 'May 2021',
  },
  {
    text: 'We are committed to sourcing all opal ethically and directly from Australian Miners. A majority of the material we source is from Lightning Ridge and Coober Pedy.',
    post: 'how-opal-is-mined',
    title: 'How Opal is Mined and Cut',
    date: 'May 2021',
  },
] as const

async function publishedPostSlugs(slugs: readonly string[]): Promise<Set<string>> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { in: slugs } }, { _status: { equals: 'published' } }] },
    select: { slug: true },
    pagination: false,
    depth: 0,
  })
  return new Set(docs.map((doc) => doc.slug).filter((slug): slug is string => typeof slug === 'string'))
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

export default async function AboutPage() {
  const livePosts = await publishedPostSlugs(stephQuotes.map((quote) => quote.post))

  return (
    <MarketingShell>
        <OrganizationJsonLd />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Person',
            '@id': `${APP_URL}/about#stephanie-caruana`,
            name: 'Stephanie Caruana',
            url: `${APP_URL}/about`,
            jobTitle: 'Founder',
            worksFor: { '@type': 'Organization', '@id': `${APP_URL}/#organization`, name: APP_NAME },
            knowsAbout: ['Australian opal', 'Opal jewellery', 'Opal cutting'],
          }}
        />
        <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]} />
        <section className="border-b border-warm-grey/60">
          <div className="grid min-h-[34rem] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center bg-cream px-6 py-16 sm:px-10 lg:px-[max(4rem,calc((100vw-80rem)/2))]">
              <div className="max-w-xl">
                <Eyebrow>
                  Our story
                </Eyebrow>
                <h1 className="mt-5 text-balance font-serif text-4xl font-medium leading-none text-charcoal sm:text-5xl lg:text-6xl">
                  A closer look at Australian opal.
                </h1>
                <p className="mt-7 max-w-lg font-sans text-lg leading-8 text-charcoal/70">
                  The Good Opal Co is a small Australian opal business built for people who want to understand the stone they are choosing, not just admire it from a distance.
                </p>
              </div>
            </div>
            <div className="grid items-center gap-3 bg-cream-dark px-5 py-10 sm:grid-cols-3 sm:gap-5 sm:px-10 lg:px-12">
              {aboutHeroImages.map((image, index) => (
                <div
                  key={image.src}
                  className={cn(
                    'relative overflow-hidden bg-cream sm:aspect-[4/5]',
                    index === 0 ? 'aspect-[4/3]' : 'hidden sm:block',
                    index !== 1 && 'lg:translate-y-8'
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 18vw"
                    className="object-cover"
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <Container className="py-16 sm:py-20 lg:py-28">
          <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <Eyebrow>
                What we do
              </Eyebrow>
              <h2 className="mt-4 text-balance font-serif text-3xl font-medium leading-tight text-charcoal sm:text-4xl lg:text-5xl">
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

          <section aria-labelledby="steph-heading" className="mt-20 lg:mt-28">
            <div>
              <Eyebrow>
                In Steph&apos;s words
              </Eyebrow>
              <h2 id="steph-heading" className="mt-4 font-serif text-3xl font-medium leading-tight text-charcoal sm:text-4xl lg:text-5xl">
                Stephanie Caruana, founder.
              </h2>
              <p className="mt-6 max-w-2xl font-sans text-base leading-8 text-charcoal/70">
                Steph has written about opal since 2020: cutting a first stone by hand, building a
                cutting machine on a budget, and how opal from each field behaves on the wheel. A few
                lines from those guides.
              </p>
              <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
                {stephQuotes.map((quote) => (
                  <li key={quote.post} className="border-t border-warm-grey/60 pt-6">
                    <figure>
                      <blockquote className="font-serif text-xl leading-relaxed text-charcoal">
                        <p>&ldquo;{quote.text}&rdquo;</p>
                      </blockquote>
                      <figcaption className="mt-4 font-sans text-sm text-charcoal/65">
                        {livePosts.has(quote.post) ? (
                          <Link
                            href={`/blog/${quote.post}`}
                            className="underline decoration-warm-grey underline-offset-4 hover:decoration-charcoal"
                          >
                            {quote.title}
                          </Link>
                        ) : (
                          quote.title
                        )}
                        , {quote.date}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
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
                src="/images/products/20211129_165058-1-3-1.jpg"
                alt="A triangular crystal opal and two smaller opals on a dark stone surface in strong light"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="max-w-xl">
              <Eyebrow>
                Buy with context
              </Eyebrow>
              <h2 className="mt-4 text-balance font-serif text-3xl font-medium leading-tight text-charcoal sm:text-4xl lg:text-5xl">
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
