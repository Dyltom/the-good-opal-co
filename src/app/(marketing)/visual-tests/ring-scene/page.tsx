import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  applyRingStyle,
  defaultRingConfig,
  shapeForOpal,
  styleIds,
  type BuilderOpal,
  type RingConfig,
} from '@/components/custom-builder/config'
import type { RingView } from '@/components/custom-builder/RingScene'
import {
  createOpalVisualProfile,
  reviewedOpalImageUrl,
  type BuilderVisualFields,
} from '@/lib/custom-builder/opal-visual'
import { RingSceneVisualHarness } from './RingSceneVisualHarness'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { follow: false, index: false },
}

const views = ['front', 'profile'] as const satisfies readonly RingView[]
const fixtures = [
  'none',
  'reviewed',
  'placed',
  'elongated',
  'elongated-placed',
  'pear',
  'pear-placed',
  'heart',
  'heart-placed',
] as const

function visualOpal(
  slug: string,
  name: string,
  stoneType: string,
  fields?: BuilderVisualFields
): BuilderOpal {
  const imageUrl = reviewedOpalImageUrl(slug)
  if (!imageUrl) throw new Error(`Missing reviewed visual-test photo for ${slug}`)

  return {
    id: `visual-${slug}`,
    imageAlt: name,
    imageUrl,
    name,
    price: 0,
    selectionKind: 'individual',
    slug,
    stoneType,
    stoneTypeLabel: stoneType,
    ...createOpalVisualProfile(slug, name, stoneType, fields),
  }
}

const fixtureOpals = {
  reviewed: visualOpal(
    'lightning-ridge-white-opal-1-05-cts',
    'Lightning Ridge White Opal 1.05 cts',
    'white-opal'
  ),
  elongated: visualOpal(
    'lightning-ridge-black-opal-1-45-cts',
    'Lightning Ridge Black Opal 1.45 cts',
    'black-opal'
  ),
  pear: visualOpal(
    'large-queensland-boulder-opal-teardrop-4-cts',
    'Large Queensland Boulder Opal Teardrop 4 cts',
    'boulder-opal'
  ),
  heart: visualOpal(
    'mintabie-dark-opal-heart-055-cts',
    'Mintabie Dark Opal Heart 0.55 cts',
    'black-opal',
    {
      builderMappingStatus: 'reviewed',
      builderSilhouette: 'heart',
      builderPhotoFocalX: 0.49,
      builderPhotoFocalY: 0.48,
      builderPhotoZoom: 1.85,
      builderPhotoRotation: 0,
    }
  ),
} as const

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

function selectedOpalForFixture(fixture: (typeof fixtures)[number]): BuilderOpal | undefined {
  if (fixture === 'none') return undefined
  if (fixture === 'reviewed' || fixture === 'placed') return fixtureOpals.reviewed
  if (fixture.startsWith('elongated')) return fixtureOpals.elongated
  if (fixture.startsWith('pear')) return fixtureOpals.pear
  return fixtureOpals.heart
}

function configForFixture(
  requestedStyle: RingConfig['style'] | undefined,
  fixture: (typeof fixtures)[number]
) {
  const selectedOpal = selectedOpalForFixture(fixture)
  const style = requestedStyle ?? selectedOpal?.visual.recommendedStyle ?? defaultRingConfig.style
  const config = applyRingStyle(defaultRingConfig, style)
  if (!selectedOpal) return config
  const placed = fixture.endsWith('-placed') || fixture === 'placed'

  return {
    ...config,
    opalId: selectedOpal.id,
    shape: shapeForOpal(selectedOpal),
    stone: selectedOpal.renderStone,
    ...(placed
      ? {
          opalPositionX: 0.24,
          opalPositionY: -0.18,
          opalRotation: 25,
          opalScale: selectedOpal.visual.silhouette === 'elongated' ? 1.2 : 1.4,
        }
      : {}),
  } satisfies RingConfig
}

export default async function RingSceneVisualHarnessPage({ searchParams }: VisualHarnessPageProps) {
  if (process.env.ENABLE_RING_VISUAL_HARNESS !== '1') notFound()

  const query = await searchParams
  const requestedStyle = first(query.style)
  const style = enumParam(styleIds, requestedStyle, 'gemini')
  const view = enumParam(views, first(query.view), 'front')
  const fixture = enumParam(fixtures, first(query.fixture), 'none')
  const config = configForFixture(requestedStyle ? style : undefined, fixture)
  const selectedOpal = selectedOpalForFixture(fixture)

  return <RingSceneVisualHarness config={config} selectedOpal={selectedOpal} view={view} />
}
