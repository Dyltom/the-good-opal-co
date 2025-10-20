/**
 * Centralized Spacing Constants
 *
 * Defines consistent spacing patterns used across section components.
 * Using const assertions for type safety and autocomplete.
 *
 * @example
 * ```tsx
 * import { spacing } from '@/lib/spacing'
 *
 * <div className={spacing.sectionHeader}>
 *   <h2 className={spacing.sectionTitle}>...</h2>
 * </div>
 * ```
 */

/**
 * Section-level spacing
 */
export const sectionSpacing = Object.freeze({
  /** Bottom margin for section headers (most sections) */
  headerMargin: 'mb-12',
  /** Bottom margin for compact section headers (Gallery, Newsletter) */
  headerMarginCompact: 'mb-8',
  /** Vertical spacing between section items */
  itemGap: 'space-y-6',
  /** Vertical spacing for larger gaps */
  itemGapLarge: 'space-y-8',
} as const)

/**
 * Typography spacing
 */
export const typographySpacing = Object.freeze({
  /** Bottom margin for section titles */
  titleMargin: 'mb-4',
  /** Bottom margin for small titles */
  titleMarginSmall: 'mb-2',
  /** Bottom margin for descriptions */
  descriptionMargin: 'mb-6',
  /** Bottom margin for descriptions with large gap */
  descriptionMarginLarge: 'mb-8',
} as const)

/**
 * Grid and layout spacing
 */
export const gridSpacing = Object.freeze({
  /** Gap for grid layouts (small) */
  small: 'gap-4',
  /** Gap for grid layouts (medium) */
  medium: 'gap-6',
  /** Gap for grid layouts (large) */
  large: 'gap-8',
} as const)

/**
 * Form spacing
 */
export const formSpacing = Object.freeze({
  /** Vertical spacing between form fields */
  fieldGap: 'space-y-6',
  /** Vertical spacing for compact forms */
  fieldGapCompact: 'space-y-4',
  /** Vertical spacing for form groups */
  groupGap: 'space-y-8',
} as const)

/**
 * Component spacing
 */
export const componentSpacing = Object.freeze({
  /** Spacing between icon buttons */
  iconGap: 'gap-3',
  /** Spacing for button groups */
  buttonGap: 'gap-4',
  /** Spacing for inline elements */
  inlineGap: 'gap-2',
} as const)

/**
 * All spacing constants combined
 */
export const spacing = Object.freeze({
  section: sectionSpacing,
  typography: typographySpacing,
  grid: gridSpacing,
  form: formSpacing,
  component: componentSpacing,
} as const)

/**
 * Type-safe spacing values
 * Extracts the union of all possible spacing class strings
 */
export type SpacingValue =
  | (typeof sectionSpacing)[keyof typeof sectionSpacing]
  | (typeof typographySpacing)[keyof typeof typographySpacing]
  | (typeof gridSpacing)[keyof typeof gridSpacing]
  | (typeof formSpacing)[keyof typeof formSpacing]
  | (typeof componentSpacing)[keyof typeof componentSpacing]

/**
 * Helper function to get spacing value with autocomplete
 *
 * @example
 * ```tsx
 * const gap = getSpacing('grid', 'large') // 'gap-8'
 * ```
 */
export function getSpacing<
  Category extends keyof typeof spacing,
  Key extends keyof (typeof spacing)[Category],
>(category: Category, key: Key): (typeof spacing)[Category][Key] {
  return spacing[category][key]
}
