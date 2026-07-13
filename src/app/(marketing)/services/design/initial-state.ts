import {
  applyRingStyle,
  shapeForOpal,
  styleIds,
  type BuilderOpal,
  type RingConfig,
} from '@/components/custom-builder/config'

interface InitialBuilderState {
  config: RingConfig
  unavailableOpalRequested: boolean
}

export function resolveInitialBuilderState(
  initialConfig: RingConfig,
  opals: readonly BuilderOpal[],
  requestedStyle?: string
): InitialBuilderState {
  const requestedOpal = opals.find((opal) => opal.id === initialConfig.opalId)
  const unavailableOpalRequested = Boolean(initialConfig.opalId && !requestedOpal)
  const hasValidRequestedStyle = styleIds.some((style) => style === requestedStyle)
  const styleId = hasValidRequestedStyle
    ? initialConfig.style
    : requestedOpal?.visual.recommendedStyle
  const config: RingConfig = requestedOpal
    ? {
        ...applyRingStyle(
          {
            ...initialConfig,
            opalId: requestedOpal.id,
            stone: requestedOpal.renderStone,
          },
          styleId ?? initialConfig.style
        ),
        shape: shapeForOpal(requestedOpal),
      }
    : { ...initialConfig, opalId: undefined }

  return { config, unavailableOpalRequested }
}
