import { inferBuilderStoneType } from '@/lib/custom-builder/opal-visual'

type SeedProductCategory =
  | 'opal-rings'
  | 'opal-necklaces'
  | 'opal-earrings'
  | 'opal-bracelets'
  | 'raw-opals'

type SyntheticBuilderMapping =
  | Record<string, never>
  | {
      builderMappingStatus: 'reviewed'
      stoneType: string
    }

/**
 * CI publishes a synthetic catalogue so browser tests can exercise opal
 * selection. Recovery and production seeds must not invent maker approval.
 */
export function syntheticBuilderMappingForSeed(
  name: string,
  category: SeedProductCategory,
  useSyntheticTestStock: boolean
): SyntheticBuilderMapping {
  if (!useSyntheticTestStock || category !== 'raw-opals') return {}

  const stoneType = inferBuilderStoneType(undefined, name)
  if (stoneType === 'unknown-opal') return {}

  return { builderMappingStatus: 'reviewed', stoneType }
}
