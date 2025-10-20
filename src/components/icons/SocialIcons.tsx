import { cn } from '@/lib/utils'

/**
 * Props for social icon components
 * Extends standard SVG element props for full flexibility
 */
export type IconProps = React.SVGProps<SVGSVGElement>

/**
 * Email Icon Component
 *
 * @example
 * ```tsx
 * <EmailIcon className="text-primary" aria-label="Email contact" />
 * ```
 */
export function EmailIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={cn('h-5 w-5', className)}
      fill="currentColor"
      viewBox="0 0 20 20"
      {...props}
    >
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  )
}

/**
 * LinkedIn Icon Component
 *
 * @example
 * ```tsx
 * <LinkedInIcon className="text-blue-600" aria-label="LinkedIn profile" />
 * ```
 */
export function LinkedInIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={cn('h-5 w-5', className)}
      fill="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

/**
 * Twitter/X Icon Component
 *
 * Uses the new X logo design
 *
 * @example
 * ```tsx
 * <TwitterIcon className="text-black dark:text-white" aria-label="X/Twitter profile" />
 * ```
 */
export function TwitterIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={cn('h-5 w-5', className)}
      fill="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
