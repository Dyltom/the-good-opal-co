import { cn } from '@/lib/utils'

/**
 * Valid heading levels for semantic HTML
 */
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/**
 * Props for SectionHeader component
 */
export interface SectionHeaderProps {
  /**
   * Section title - displayed as a heading
   */
  title?: string
  /**
   * Section description - displayed as paragraph text
   */
  description?: string
  /**
   * Whether to center the header content
   * @default true
   */
  centered?: boolean
  /**
   * HTML heading level to use for title
   * @default 'h2'
   */
  headingLevel?: HeadingLevel
  /**
   * Additional CSS classes to apply to the wrapper
   */
  className?: string
}

/**
 * SectionHeader Component
 *
 * Displays a consistent header for section components with optional title and description.
 * Supports centered and left-aligned layouts, customizable heading levels, and responsive typography.
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title="Our Features"
 *   description="Discover what makes us unique"
 * />
 * ```
 *
 * @example Non-centered with custom heading level
 * ```tsx
 * <SectionHeader
 *   title="About Us"
 *   description="Our story"
 *   centered={false}
 *   headingLevel="h3"
 * />
 * ```
 */
export function SectionHeader({
  title,
  description,
  centered = true,
  headingLevel = 'h2',
  className,
}: SectionHeaderProps) {
  // Trim whitespace to handle edge cases
  const trimmedTitle = title?.trim()
  const trimmedDescription = description?.trim()

  // Don't render if both are empty
  if (!trimmedTitle && !trimmedDescription) {
    return null
  }

  // Dynamic heading component
  const HeadingTag = headingLevel

  return (
    <div
      className={cn(
        'max-w-3xl mb-12',
        centered && 'text-center mx-auto',
        className,
      )}
    >
      {trimmedTitle && (
        <HeadingTag className="text-3xl font-bold mb-4">
          {trimmedTitle}
        </HeadingTag>
      )}
      {trimmedDescription && (
        <p className="text-lg text-muted-foreground">
          {trimmedDescription}
        </p>
      )}
    </div>
  )
}
