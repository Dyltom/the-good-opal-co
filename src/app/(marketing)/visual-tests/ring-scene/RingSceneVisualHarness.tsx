'use client'

import { useCallback, useState } from 'react'
import type { BuilderOpal, RingConfig } from '@/components/custom-builder/config'
import { RingScene, type RingView } from '@/components/custom-builder/RingScene'
import { selectRingRenderModel } from '@/lib/custom-builder/ring-render-model'

interface RingSceneVisualHarnessProps {
  config: RingConfig
  selectedOpal?: BuilderOpal
  view: RingView
}

type RenderState = 'context-lost' | 'pending' | 'ready'

export function RingSceneVisualHarness({
  config,
  selectedOpal,
  view,
}: RingSceneVisualHarnessProps) {
  const [renderState, setRenderState] = useState<RenderState>('pending')
  const handleContextLost = useCallback(() => setRenderState('context-lost'), [])
  const handleRenderReady = useCallback(() => setRenderState('ready'), [])

  return (
    <main
      data-testid="ring-scene-visual-harness"
      data-render-state={renderState}
      className="relative h-[488px] w-[390px] overflow-hidden bg-[#24241f] lg:h-[920px] lg:w-[806px]"
    >
      <RingScene
        allowMotion={false}
        config={config}
        onContextLost={handleContextLost}
        onRenderReady={handleRenderReady}
        reduceMotion
        renderModel={selectRingRenderModel({ config, opal: selectedOpal })}
        selectedOpal={selectedOpal}
        view={view}
      />
    </main>
  )
}
