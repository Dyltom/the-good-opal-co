import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react'
import { RingConfigurator, ringConfigFromRecord } from '@/components/custom-builder'
import type { BuilderOpal } from '@/components/custom-builder/config'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { resolveMediaUrl } from '@/lib/media-url'
import { ownedProductImageUrl } from '@/lib/owned-product-image'
import {
  classifyOpalListing,
  createOpalVisualProfile,
  inferBuilderStoneType,
  isAvailableOpalListing,
  reviewedOpalImageUrl,
} from '@/lib/custom-builder/opal-visual'
import { getPayload } from '@/lib/payload'
import type { Media } from '@/types/payload-types'
import { resolveInitialBuilderState } from './initial-state'
import {
  builderCatalogueImageAlt,
  resolveBuilderCatalogueImageUrl,
  shouldIncludeBuilderCatalogueProduct,
} from './catalogue'

export const metadata: Metadata = {
  title: 'Design Your Custom Opal Ring | The Good Opal Co',
  description:
    'Explore a custom Australian opal ring in interactive 3D, then send the complete concept for a personal design consultation.',
  alternates: { canonical: '/services/design' },
}
export const dynamic = 'force-dynamic'

interface DesignPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

const stoneTypeLabels: Record<string, string> = {
  'black-opal': 'Black opal',
  'white-opal': 'White opal',
  'boulder-opal': 'Boulder opal',
  'crystal-opal': 'Crystal opal',
  'fire-opal': 'Fire opal',
  'matrix-opal': 'Matrix opal',
  'opal-doublet': 'Opal doublet',
}

const originLabels: Record<string, string> = {
  'lightning-ridge': 'Lightning Ridge, NSW',
  'coober-pedy': 'Coober Pedy, SA',
  mintabie: 'Mintabie, SA',
  andamooka: 'Andamooka, SA',
  queensland: 'Queensland',
  'other-australian': 'Australia',
}

const builderOpalPriority = [
  'mintabie-semi-black-opal-1-35-cts',
  'lightning-ridge-white-opal-1-05-cts',
  'queensland-crystal-pipe-opal-1-45-cts',
  'mintabie-semi-black-opal-1-05-cts',
] as const

const productImageOverrides: Record<string, string> = {
  '20211104_234659': '20211104_234659-1-1.jpg',
  '20210923_173846': '20210923_173846-1.jpg',
  '20211129_165305': '20211129_165305-1.jpg',
  '20211129_164200': '20211129_164200-1-1.jpg',
  '20211129_164004': '20211129_164004-1-1.jpg',
  'wp-5499-img_0803': 'IMG_0803.jpg',
  'wp-5507-img': 'IMG-0741-1.jpg',
  'wp-5481-img_0810': 'IMG_0808.jpg',
}

function normaliseAssetStem(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/(?:-\d+)+$/, '')
    .toLowerCase()
}

function productImageFallback(filename?: string | null): string | undefined {
  if (!filename) return undefined

  const stem = normaliseAssetStem(filename)
  const extension = filename.split('.').pop()?.toLowerCase()
  if (!extension || !['jpg', 'jpeg', 'png', 'webp'].includes(extension)) return undefined

  const publicFilename = productImageOverrides[stem] ?? filename
  return `/images/products/${publicFilename}`
}

async function getBuilderOpals(): Promise<BuilderOpal[]> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 2000,
    pagination: false,
    overrideAccess: true,
    sort: '-updatedAt',
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      stoneType: true,
      stoneOrigin: true,
      weight: true,
      dimensions: true,
      builderEligible: true,
      builderMappingStatus: true,
      builderMappedImageIndex: true,
      builderSilhouette: true,
      builderRecommendedStyle: true,
      builderBodyColour: true,
      builderFlashColourPrimary: true,
      builderFlashColourSecondary: true,
      builderFlashColourAccent: true,
      builderTransmission: true,
      builderPhotoFocalX: true,
      builderPhotoFocalY: true,
      builderPhotoZoom: true,
      builderPhotoRotation: true,
      builderContour: true,
      builderContourCandidate: true,
      builderPhotoAnalysisConfidence: true,
      builderPhotoCandidateFocalX: true,
      builderPhotoCandidateFocalY: true,
      builderPhotoCandidateZoom: true,
      builderPhotoCandidateRotation: true,
      builderContourSourceImageHash: true,
      builderMappingAnalyzedImageHash: true,
    },
    where: {
      and: [
        { category: { equals: 'raw-opals' } },
        { status: { equals: 'published' } },
        { stock: { greater_than: 0 } },
      ],
    },
  })
  const products = result.docs.filter(shouldIncludeBuilderCatalogueProduct)

  const selectedImage = (product: (typeof products)[number]) => {
    const index =
      typeof product.builderMappedImageIndex === 'number' &&
      Number.isInteger(product.builderMappedImageIndex) &&
      product.builderMappedImageIndex >= 0
        ? product.builderMappedImageIndex
        : 0
    return product.images?.[index]?.image ?? product.images?.[0]?.image
  }
  const mediaIds = products.flatMap((product) => {
    const image = selectedImage(product)
    return typeof image === 'number' ? [image] : []
  })
  const mediaResult =
    mediaIds.length > 0
      ? await payload.find({
          collection: 'media',
          depth: 0,
          limit: mediaIds.length,
          pagination: false,
          where: { id: { in: mediaIds } },
          select: { id: true, url: true, filename: true, alt: true },
        })
      : { docs: [] }
  const mediaById = new Map(mediaResult.docs.map((media) => [String(media.id), media as Media]))

  return products
    .filter((product) => isAvailableOpalListing(product.name))
    .flatMap((product): BuilderOpal[] => {
      const mappedImage = selectedImage(product)
      const image = mappedImage ? mediaById.get(String(mappedImage)) : undefined
      const imageUrl = resolveBuilderCatalogueImageUrl(
        resolveMediaUrl(image?.url),
        reviewedOpalImageUrl(product.slug, product.builderMappingStatus),
        ownedProductImageUrl(product.slug),
        productImageFallback(image?.filename)
      )
      if (!imageUrl) return []

      const stoneType = inferBuilderStoneType(product.stoneType, product.name)

      const renderProfile = createOpalVisualProfile(product.slug, product.name, stoneType, product)
      return [
        {
          id: String(product.id),
          name: product.name,
          slug: product.slug,
          imageUrl,
          imageAlt: builderCatalogueImageAlt(product.slug, product.name, image?.alt),
          price: product.price,
          stoneType,
          stoneTypeLabel: stoneTypeLabels[stoneType] ?? 'Australian opal',
          originLabel: product.stoneOrigin ? originLabels[product.stoneOrigin] : undefined,
          weight: product.weight ?? undefined,
          selectionKind: classifyOpalListing(product.name),
          ...renderProfile,
        },
      ]
    })
    .sort((left, right) => {
      const leftIndex = builderOpalPriority.indexOf(
        left.slug as (typeof builderOpalPriority)[number]
      )
      const rightIndex = builderOpalPriority.indexOf(
        right.slug as (typeof builderOpalPriority)[number]
      )
      const priorityDifference =
        (leftIndex < 0 ? 999 : leftIndex) - (rightIndex < 0 ? 999 : rightIndex)
      if (priorityDifference !== 0) return priorityDifference

      const kindOrder: Record<BuilderOpal['selectionKind'], number> = {
        individual: 0,
        assortment: 1,
        parcel: 2,
        specimen: 3,
      }
      const kindDifference = kindOrder[left.selectionKind] - kindOrder[right.selectionKind]
      return kindDifference || left.name.localeCompare(right.name)
    })
}

export default async function DesignPage({ searchParams }: DesignPageProps) {
  const [query, opals] = await Promise.all([
    searchParams,
    getBuilderOpals().catch((error: unknown) => {
      console.error('Ring builder catalogue unavailable; rendering design-only fallback', error)
      return []
    }),
  ])
  const initialConfig = ringConfigFromRecord(
    Object.fromEntries(Object.entries(query).map(([key, value]) => [key, first(value)]))
  )
  const { config: hydratedConfig, unavailableOpalRequested } = resolveInitialBuilderState(
    initialConfig,
    opals,
    first(query.y)
  )

  return (
    <MarketingShell>
      <header className="border-b border-warm-grey/60 px-5 py-10 sm:px-10 sm:py-14 lg:px-[clamp(3rem,8vw,9rem)] lg:py-16">
        <Link
          href="/services"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-charcoal-light hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Custom jewellery
        </Link>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-opal-electric-accessible">
              Interactive ring builder
            </p>
            <h1 className="mt-3 max-w-[12ch] text-balance font-serif text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.95]">
              See the possibilities.
            </h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-charcoal-light sm:text-lg sm:leading-8">
            Rotate, zoom, and refine a ring concept around the colour of an Australian opal. Save
            the combination in your link and bring it into a real design conversation.
          </p>
        </div>
      </header>

      <RingConfigurator
        initialConfig={hydratedConfig}
        opals={opals}
        unavailableOpalRequested={unavailableOpalRequested}
      />

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 border-y border-warm-grey/60 py-10 md:grid-cols-3 md:gap-12">
            <div>
              <Sparkles aria-hidden="true" className="h-5 w-5 text-opal-electric-accessible" />
              <h2 className="mt-4 font-serif text-2xl">A visual starting point</h2>
              <p className="mt-2 text-sm leading-6 text-charcoal-light">
                The studio communicates proportion and mood. It does not pretend every natural stone
                looks identical.
              </p>
            </div>
            <div>
              <WandSparkles aria-hidden="true" className="h-5 w-5 text-opal-electric-accessible" />
              <h2 className="mt-4 font-serif text-2xl">Made around your opal</h2>
              <p className="mt-2 text-sm leading-6 text-charcoal-light">
                We match suitable available stones, confirm dimensions, and refine the setting
                before making begins.
              </p>
            </div>
            <div>
              <ShieldCheck aria-hidden="true" className="h-5 w-5 text-opal-electric-accessible" />
              <h2 className="mt-4 font-serif text-2xl">Quote before commitment</h2>
              <p className="mt-2 text-sm leading-6 text-charcoal-light">
                Your consultation confirms scope, timing, and exact AUD price. A builder estimate
                never becomes an automatic charge.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </MarketingShell>
  )
}
