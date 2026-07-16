import type { BuilderOpal, RingConfig } from '@/components/custom-builder/config'
import { proceduralRingModelVersions } from '@/components/custom-builder/config'
import type { RingDesignRenderManifest } from './ring-design-manifest'
import type { BuilderStoneContourV1 } from './stone-contour'

type RingAssetVariant = RingDesignRenderManifest['model']['variants'][number]

export type RingRenderModelSelection =
  | {
      kind: 'asset'
      makerApproved: true
      manifest: RingDesignRenderManifest
      variant: RingAssetVariant
    }
  | {
      kind: 'procedural'
      makerApproved: false
      reason:
        | 'missing-manifest'
        | 'style-mismatch'
        | 'missing-evidence'
        | 'unrenderable-dimensions'
        | 'unsupported-shape'
        | 'unsupported-opal'
        | 'unsupported-metal'
        | 'stone-out-of-range'
        | 'contour-mismatch'
        | 'unsupported-ring-size'
        | 'unsupported-assembly'
        | 'unsupported-shank-version'
        | 'ambiguous-variant'
      version: string
    }

interface SelectRingRenderModelInput {
  config: RingConfig
  manifest?: RingDesignRenderManifest | null
  opal?: BuilderOpal
}

function procedural(
  config: RingConfig,
  reason: Extract<RingRenderModelSelection, { kind: 'procedural' }>['reason']
): RingRenderModelSelection {
  return {
    kind: 'procedural',
    makerApproved: false,
    reason,
    version: proceduralRingModelVersions[config.style],
  }
}

function contourDeviationMm(
  actual: BuilderStoneContourV1,
  reference: BuilderStoneContourV1,
  widthMm: number,
  lengthMm: number
): number {
  return actual.radii.reduce((maximum, radius, index) => {
    const angle = (index / actual.radii.length) * Math.PI * 2
    const baseRadiusMm = Math.hypot(
      Math.cos(angle) * widthMm * 0.5,
      Math.sin(angle) * lengthMm * 0.5
    )
    const deviation = Math.abs(radius - reference.radii[index]!) * baseRadiusMm
    return Math.max(maximum, deviation)
  }, 0)
}

function supportsRingSize(variant: RingAssetVariant, size: number): boolean {
  if (variant.assembly === 'complete-ring') {
    return Math.abs(variant.ringFit.sizeUs - size) < 0.001
  }
  return variant.ringFit.sizesUs.some((candidate) => Math.abs(candidate - size) < 0.001)
}

/**
 * Chooses one calibrated variant only when every approved physical constraint
 * matches. Missing or ambiguous evidence fails closed to the concept renderer.
 */
export function selectRingRenderModel({
  config,
  manifest,
  opal,
}: SelectRingRenderModelInput): RingRenderModelSelection {
  if (!manifest) return procedural(config, 'missing-manifest')
  if (manifest.style !== config.style) return procedural(config, 'style-mismatch')
  if (
    !opal ||
    opal.selectionKind !== 'individual' ||
    opal.visual.evidence !== 'catalogue' ||
    opal.visual.photoFit !== 'reviewed' ||
    !opal.visual.dimensionsMm ||
    !opal.visual.contour
  ) {
    return procedural(config, 'missing-evidence')
  }
  if (opal.visual.silhouette !== config.shape) return procedural(config, 'unsupported-shape')
  const { depth, length, width } = opal.visual.dimensionsMm
  if (depth > Math.min(width, length) * 0.75) {
    return procedural(config, 'unrenderable-dimensions')
  }

  const renderableVariants = manifest.model.variants.filter(
    (variant) =>
      variant.assembly === 'complete-ring' ||
      variant.assembly === 'authored-head-procedural-shank'
  )
  if (renderableVariants.length === 0) return procedural(config, 'unsupported-assembly')

  const currentAssemblyVariants = renderableVariants.filter(
    (variant) =>
      variant.assembly === 'complete-ring' ||
      variant.ringFit.shankVersion === proceduralRingModelVersions[config.style]
  )
  if (currentAssemblyVariants.length === 0) {
    return procedural(config, 'unsupported-shank-version')
  }

  const shapeVariants = currentAssemblyVariants.filter(
    (variant) => variant.stoneFit.shape === opal.visual.silhouette
  )
  if (shapeVariants.length === 0) return procedural(config, 'unsupported-shape')

  const opalVariants = shapeVariants.filter((variant) =>
    variant.stoneFit.allowedOpalIds.includes(opal.id)
  )
  if (opalVariants.length === 0) return procedural(config, 'unsupported-opal')

  const metalVariants = opalVariants.filter((variant) =>
    variant.approvedMetals.includes(config.metal)
  )
  if (metalVariants.length === 0) return procedural(config, 'unsupported-metal')

  const dimensionVariants = metalVariants.filter(({ stoneFit }) => {
    const { reference, toleranceMm } = stoneFit
    return (
      Math.abs(width - reference.widthMm) <= toleranceMm.width &&
      Math.abs(length - reference.lengthMm) <= toleranceMm.length &&
      Math.abs(depth - reference.depthMm) <= toleranceMm.depth
    )
  })
  if (dimensionVariants.length === 0) return procedural(config, 'stone-out-of-range')

  const contourVariants = dimensionVariants.filter(
    ({ stoneFit }) =>
      contourDeviationMm(opal.visual.contour!, stoneFit.reference.contour, width, length) <=
      stoneFit.toleranceMm.contour
  )
  if (contourVariants.length === 0) return procedural(config, 'contour-mismatch')

  const sizeVariants = contourVariants.filter((variant) => supportsRingSize(variant, config.size))
  if (sizeVariants.length === 0) return procedural(config, 'unsupported-ring-size')
  if (sizeVariants.length !== 1) return procedural(config, 'ambiguous-variant')

  return { kind: 'asset', makerApproved: true, manifest, variant: sizeVariants[0]! }
}
