import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { BreadcrumbJsonLd, founderId, JsonLd, OrganizationJsonLd } from '@/components/seo'
import { Button } from '@/components/ui/button'
import { APP_NAME, APP_URL } from '@/lib/constants'
import { getPayload } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Our Story | The Good Opal Co',
  description:
    'Meet The Good Opal Co, an Australian opal studio focused on clear product details, thoughtful selection, and personal guidance.',
  alternates: { canonical: '/about' },
}
export const dynamic = 'force-dynamic'

const aboutHeroImages = [
  {
    src: '/images/products/20210819_102749.jpg',
    alt: 'A white opal in a beaded silver halo ring, worn on a finger',
  },
  {
    src: '/images/products/20211129_164004-1-1.jpg',
    alt: 'A polished black opal with green and orange fire',
  },
  {
    src: '/images/products/20211104_231959.jpg',
    alt: 'A polished white opal with green fire, held between two fingers',
  },
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
    where: { slug: { in: slugs } },
    select: { slug: true },
    pagination: false,
    depth: 0,
    overrideAccess: false,
  })
  return new Set(
    docs.map((doc) => doc.slug).filter((slug): slug is string => typeof slug === 'string')
  )
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

const sectionHeading = 'text-[clamp(1.875rem,3.2vw,3.125rem)] leading-[1.04] tracking-[-0.02em]'

export default async function AboutPage() {
  const livePosts = await publishedPostSlugs(stephQuotes.map((quote) => quote.post))

  return (
    <MarketingShell>
      <OrganizationJsonLd />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': founderId,
          name: 'Stephanie Caruana',
          url: `${APP_URL}/about`,
          jobTitle: 'Founder',
          worksFor: { '@type': 'Organization', '@id': `${APP_URL}/#organization`, name: APP_NAME },
          knowsAbout: ['Australian opal', 'Opal jewellery', 'Opal cutting'],
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
        ]}
      />

      <Container className="pb-sec">
        <header className="grid items-center gap-[18px] pt-[18px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(20px,2.4vw,36px)]">
          <div>
            <h1 className="max-w-[12ch] text-[2.375rem] leading-[0.98] tracking-[-0.025em] md:text-[clamp(2.5rem,4.6vw,4.75rem)]">
              A closer look at <i>Australian opal.</i>
            </h1>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.6] text-ink-2 md:mt-5 md:text-base">
              The Good Opal Co is a small Australian opal business built for people who want to
              understand the stone they are choosing, not just admire it from a distance.
            </p>
          </div>
          <ul
            aria-label="Pieces from the studio"
            className="grid grid-cols-3 items-end gap-1.5 md:gap-2"
          >
            {aboutHeroImages.map((image, index) => (
              <li
                key={image.src}
                className="relative aspect-[4/5] overflow-hidden bg-plinth md:aspect-auto md:h-[clamp(240px,25vw,380px)]"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 32vw, 18vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>
        </header>

        <section
          aria-labelledby="what-heading"
          className="grid gap-4 pt-14 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[clamp(20px,4vw,72px)] md:pt-[clamp(48px,5.5vw,84px)]"
        >
          <h2 id="what-heading" className={`max-w-[12ch] ${sectionHeading}`}>
            Opals selected <i>one piece at a time.</i>
          </h2>
          <div className="grid max-w-[60ch] gap-4 text-[15px] leading-[1.7] text-ink-2 md:text-base">
            <p>
              Every opal has its own colour, pattern, body tone, and response to light. Our role is
              to present those differences clearly so a first-time buyer, gift buyer, or collector
              can make a considered choice.
            </p>
            <p>
              The collection includes loose stones and finished jewellery. Product pages carry the
              details available for each individual piece. When something is not clear, contact us
              before ordering and we will help you inspect it more closely.
            </p>
            <p className="text-ink">
              Founder Stephanie Caruana leads The Good Opal Co and the personal guidance behind each
              enquiry.
            </p>
          </div>
        </section>

        <section aria-labelledby="steph-heading" className="pt-14 md:pt-[clamp(48px,5.5vw,84px)]">
          <div className="grid items-end gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[clamp(20px,4vw,72px)]">
            <h2 id="steph-heading" className={sectionHeading}>
              Stephanie Caruana, <i>founder.</i>
            </h2>
            <p className="max-w-[60ch] text-[15px] leading-[1.65] text-ink-2">
              Steph has written about opal since 2020: cutting a first stone by hand, building a
              cutting machine on a budget, and how opal from each field behaves on the wheel. A few
              lines from those guides.
            </p>
          </div>
          <ul className="mt-7 grid gap-7 md:mt-9 md:grid-cols-3 md:gap-[clamp(20px,2.4vw,40px)]">
            {stephQuotes.map((quote) => (
              <li key={quote.post} className="border-t border-rule-2 pt-5">
                <figure>
                  <blockquote className="font-serif text-[clamp(1.25rem,1.6vw,1.5625rem)] leading-[1.3] text-ink">
                    <p>&ldquo;{quote.text}&rdquo;</p>
                  </blockquote>
                  <figcaption className="mt-4 text-[13px] text-ink-3">
                    <cite className="italic text-ink-2">
                      {livePosts.has(quote.post) ? (
                        <Link
                          href={`/blog/${quote.post}`}
                          className="underline decoration-rule-2 underline-offset-4 transition-colors hover:decoration-ink"
                        >
                          {quote.title}
                        </Link>
                      ) : (
                        quote.title
                      )}
                    </cite>
                    , {quote.date}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="how-heading"
          className="grid gap-4 pt-14 md:grid-cols-[minmax(0,0.9fr)_minmax(0,2.2fr)] md:gap-[clamp(20px,4vw,72px)] md:pt-[clamp(48px,5.5vw,84px)]"
        >
          <h2 id="how-heading" className={sectionHeading}>
            How we <i>work</i>
          </h2>
          <div className="grid border-t border-rule md:grid-cols-3 md:border-b">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l"
              >
                <h3 className="text-[1.375rem]">{principle.title}</h3>
                <p className="mt-2 text-sm leading-[1.6] text-ink-2">{principle.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="context-heading"
          className="grid items-center gap-4 pt-14 md:grid-cols-2 md:gap-[clamp(20px,4vw,72px)] md:pt-[clamp(48px,5.5vw,84px)]"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-plinth md:aspect-square md:max-h-[calc(100svh-96px)]">
            <Image
              src="/images/products/20211129_165058-1-3-1.jpg"
              alt="A triangular crystal opal and two smaller opals on a dark stone surface in strong light"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="max-w-[52ch]">
            <h2 id="context-heading" className={sectionHeading}>
              Opal changes with the light. <i>Good information should not.</i>
            </h2>
            <p className="mb-[26px] mt-[18px] text-base leading-[1.65] text-ink-2">
              Screen colour and lighting can change how an opal appears. We use available photos and
              written details to reduce that uncertainty, then offer personal help when you need
              another look.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Button asChild>
                <Link href="/store">
                  Browse available pieces <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/contact?subject=virtual-viewing">Ask for a closer look</Link>
              </Button>
            </div>
          </div>
        </section>
      </Container>
    </MarketingShell>
  )
}
