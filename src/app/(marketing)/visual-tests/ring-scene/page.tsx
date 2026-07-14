import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  applyRingStyle,
  defaultRingConfig,
  styleIds,
  type BuilderOpal,
  type RingConfig,
} from '@/components/custom-builder/config'
import type { RingView } from '@/components/custom-builder/RingScene'
import { createOpalVisualProfile, reviewedOpalImageUrl } from '@/lib/custom-builder/opal-visual'
import { RingSceneVisualHarness } from './RingSceneVisualHarness'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { follow: false, index: false },
}

const views = ['front', 'profile'] as const satisfies readonly RingView[]
const fixtures = ['none', 'reviewed', 'placed'] as const

const reviewedOpalSlug = 'lightning-ridge-white-opal-1-05-cts'
const reviewedOpalName = 'Lightning Ridge White Opal 1.05 cts'
const reviewedOpalProfile = createOpalVisualProfile(
  reviewedOpalSlug,
  reviewedOpalName,
  'white-opal'
)
const reviewedOpalImage = reviewedOpalImageUrl(reviewedOpalSlug)

if (!reviewedOpalImage) {
  throw new Error(`Missing reviewed visual-test photo for ${reviewedOpalSlug}`)
}

const reviewedOpal: BuilderOpal = {
  id: 'visual-reviewed-opal',
  imageAlt: reviewedOpalName,
  imageUrl: reviewedOpalImage,
  name: reviewedOpalName,
  price: 0,
  selectionKind: 'individual',
  slug: reviewedOpalSlug,
  stoneType: 'white-opal',
  stoneTypeLabel: 'White opal',
  ...reviewedOpalProfile,
}

interface VisualHarnessPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function enumParam<const Values extends readonly string[]>(
  values: Values,
  value: string | undefined,
  fallback: Values[number]
): Values[number] {
  if (value === undefined) return fallback
  if (values.some((candidate) => candidate === value)) return value as Values[number]
  notFound()
}

function configForFixture(
  requestedStyle: RingConfig['style'],
  fixture: (typeof fixtures)[number]
): RingConfig {
  const style = fixture === 'none' ? requestedStyle : 'gemini'
  const config = applyRingStyle(defaultRingConfig, style)
  if (fixture === 'none') return config

  return {
    ...config,
    opalId: reviewedOpal.id,
    stone: reviewedOpal.renderStone,
    ...(fixture === 'placed'
      ? {
          opalPositionX: 0.3,
          opalPositionY: -0.22,
          opalRotation: 30,
          opalScale: 1.45,
        }
      : {}),
  }
}

export default async function RingSceneVisualHarnessPage({ searchParams }: VisualHarnessPageProps) {
  if (process.env.ENABLE_RING_VISUAL_HARNESS !== '1') notFound()

  const query = await searchParams
  const style = enumParam(styleIds, first(query.style), 'gemini')
  const view = enumParam(views, first(query.view), 'front')
  const fixture = enumParam(fixtures, first(query.fixture), 'none')
  const config = configForFixture(style, fixture)

  return (
    <RingSceneVisualHarness
      config={config}
      selectedOpal={fixture === 'none' ? undefined : reviewedOpal}
      view={view}
    />
  )
}
