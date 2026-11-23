import type { Metadata } from 'next'
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
import { withSalePrice } from '@/lib/promotions'
import { loadPublishedRingDesignRenderManifests } from '@/lib/custom-builder/ring-design-manifest'
import { resolveCanonicalFaceMapping } from '@/lib/custom-builder/canonical-face-mapping'
import { getMetalSpot } from '@/lib/custom-builder/metal-spot'
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
  'opal-triplet': 'Opal triplet',
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
      category: true,
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
      builderPhotoAnalysisConfidence: true,
      builderPhotoAnalysisVersion: true,
      builderContourSourceImageHash: true,
      builderMappingAnalyzedImageHash: true,
      builderMappingAnalysisError: true,
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
      const canonicalFace = resolveCanonicalFaceMapping(
        product.id,
        product,
        1 / renderProfile.visual.aspectRatio
      )
      return [
        {
          id: String(product.id),
          name: product.name,
          slug: product.slug,
          imageUrl,
          imageAlt: builderCatalogueImageAlt(product.slug, product.name, image?.alt),
          price: withSalePrice(product).price,
          stoneType,
          stoneTypeLabel: stoneTypeLabels[stoneType] ?? 'Australian opal',
          originLabel: product.stoneOrigin ? originLabels[product.stoneOrigin] : undefined,
          weight: product.weight ?? undefined,
          selectionKind: classifyOpalListing(product.name),
          ...renderProfile,
          visual: {
            ...renderProfile.visual,
            ...(canonicalFace
              ? {
                  canonicalFace: {
                    inputHash: canonicalFace.identity.inputHash,
                    sourceImageHash: canonicalFace.sourceImageHash,
                    url: canonicalFace.url,
                  },
                }
              : {}),
          },
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
  const [query, opals, ringDesignManifests, metalSpot] = await Promise.all([
    searchParams,
    getBuilderOpals().catch((error: unknown) => {
      console.error('Ring builder catalogue unavailable; rendering design-only fallback', error)
      return []
    }),
    loadPublishedRingDesignRenderManifests().catch((error: unknown) => {
      console.error('Approved ring assets unavailable; using concept renderer', error)
      return []
    }),
    getMetalSpot(),
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
      <RingConfigurator
        initialConfig={hydratedConfig}
        metalSpot={metalSpot}
        opals={opals}
        ringDesignManifests={ringDesignManifests}
        unavailableOpalRequested={unavailableOpalRequested}
      />

      <Container className="pb-sec pt-8 md:pt-10">
        <div className="grid border-t border-rule md:grid-cols-3 md:border-b">
          <div className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">A visual starting point</h2>
            <p className="mt-2 max-w-[48ch] text-sm leading-6 text-ink-2">
              A guide to proportion and colour. Every natural opal is unique, so your consultation
              confirms the real stone.
            </p>
          </div>
          <div className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">Made around your opal</h2>
            <p className="mt-2 max-w-[48ch] text-sm leading-6 text-ink-2">
              We match suitable available stones, confirm dimensions, and refine the setting before
              making begins.
            </p>
          </div>
          <div className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l">
            <h2 className="text-[1.375rem] leading-[1.15]">Quote before commitment</h2>
            <p className="mt-2 max-w-[48ch] text-sm leading-6 text-ink-2">
              Your consultation confirms scope, timing, and exact AUD price. A builder estimate
              never becomes an automatic charge.
            </p>
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}
