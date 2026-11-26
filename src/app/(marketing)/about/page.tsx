import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout'
import { linkArrow, MarketingShell } from '@/components/marketing'
import { BreadcrumbJsonLd, founderId, JsonLd, OrganizationJsonLd } from '@/components/seo'
import { TorchBand } from '@/components/sections/TorchBand'
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

const GUIDE = {
  text: 'Opal is mysterious and wonderful. I don\u2019t think the uniqueness of opal is matched by many other things in this world\u2026',
  post: 'opal-cutting-a-beginners-guide',
  title: 'Opal Cutting: A Free Beginner\u2019s Guide',
  date: 'September 2020',
} as const

async function isPublished(slug: string): Promise<boolean> {
  const payload = await getPayload()
  const { totalDocs } = await payload.count({
    collection: 'posts',
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })
  return totalDocs > 0
}

export default async function AboutPage() {
  const guideLive = await isPublished(GUIDE.post)

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

      <Container>
        <header className="grid items-center gap-[18px] pt-[18px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(20px,2.4vw,36px)]">
          <div>
            <h1 className="max-w-[12ch] text-[2.375rem] leading-[0.98] tracking-[-0.025em] md:text-[clamp(2.5rem,4.6vw,4.75rem)]">
              A closer look at <i>Australian opal.</i>
            </h1>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.6] text-ink-2 md:mt-5 md:text-base">
              A small Australian opal studio. Every stone is chosen by hand and shown as it is.
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

        <div className="mx-auto max-w-[44rem] pt-sec text-center">
          <figure>
            <blockquote className="text-pretty font-serif text-[clamp(1.625rem,2.6vw,2.375rem)] leading-[1.2] tracking-[-0.015em] text-ink">
              <p>&ldquo;{GUIDE.text}&rdquo;</p>
            </blockquote>
            <figcaption className="mt-5 text-[13px] text-ink-3">
              Stephanie Caruana, <cite className="italic">{GUIDE.title}</cite>, {GUIDE.date}
            </figcaption>
          </figure>
          <Link href={guideLive ? `/blog/${GUIDE.post}` : '/blog'} className={`${linkArrow} mt-6`}>
            {guideLive ? 'Read the guide' : 'Read the Journal'}
            <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
          </Link>
        </div>
      </Container>

      <TorchBand
        id="founder-heading"
        heading={
          <>
            Stephanie Caruana, <i>founder and cutter.</i>
          </>
        }
        line="She buys opal direct from Australian miners, mostly from Lightning Ridge and Coober Pedy, and has written about cutting it since 2020."
        image={{
          src: '/images/studio/steph-at-the-wheel.jpg',
          alt: 'Fingers holding a freshly cut white opal in front of the cutting wheel',
          position: '40% 35%',
        }}
        action={{ href: '/store', label: 'Browse the collection' }}
      />
    </MarketingShell>
  )
}
