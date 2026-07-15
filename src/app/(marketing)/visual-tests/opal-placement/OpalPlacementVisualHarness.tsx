'use client'

import { useEffect, useState } from 'react'
import { OpalPlacementEditor } from '@/components/custom-builder/OpalPlacementEditor'
import {
  defaultOpalPlacement,
  type BuilderOpal,
  type OpalPlacement,
} from '@/components/custom-builder/config'

export function OpalPlacementVisualHarness({ opal }: { opal: BuilderOpal }) {
  const [placement, setPlacement] = useState<OpalPlacement>(defaultOpalPlacement)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  return (
    <main
      data-testid="opal-placement-visual-harness"
      data-hydrated={hydrated ? 'true' : 'false'}
      className="w-[390px] bg-cream p-4 lg:w-[806px] lg:p-8"
    >
      <OpalPlacementEditor
        metal="sterling-silver"
        onChange={setPlacement}
        opal={opal}
        placement={placement}
        style="aurora"
      />
    </main>
  )
}
