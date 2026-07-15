import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { BuilderOpal } from '@/components/custom-builder/config'
import { createOpalVisualProfile, reviewedOpalImageUrl } from '@/lib/custom-builder/opal-visual'
import { OpalPlacementVisualHarness } from './OpalPlacementVisualHarness'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { follow: false, index: false },
}

const slug = 'large-queensland-boulder-opal-teardrop-4-cts'
const name = 'Large Queensland Boulder Opal Teardrop 4 cts'
const imageUrl = reviewedOpalImageUrl(slug)

function visualOpal(): BuilderOpal {
  if (!imageUrl) throw new Error(`Missing reviewed visual-test photo for ${slug}`)
  return {
    id: 'visual-opal-placement',
    imageAlt: name,
    imageUrl,
    name,
    price: 0,
    selectionKind: 'individual',
    slug,
    stoneType: 'boulder-opal',
    stoneTypeLabel: 'Boulder opal',
    ...createOpalVisualProfile(slug, name, 'boulder-opal'),
  }
}

export default function OpalPlacementVisualHarnessPage() {
  if (process.env.ENABLE_RING_VISUAL_HARNESS !== '1') notFound()
  return <OpalPlacementVisualHarness opal={visualOpal()} />
}
