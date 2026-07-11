/**
 * Magical Icons Component
 *
 * Custom SVG icons designed for the fairytale opal store aesthetic.
 * Each icon matches the warm, mystical, artsy vibe.
 */

import { cn } from '@/lib/utils'

interface IconProps {
  className?: string
  size?: number
}

export function MagicalStarIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('text-current', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M12 4L12.5 7.5L16 8L12.5 8.5L12 12L11.5 8.5L8 8L11.5 7.5L12 4Z"
        fill="currentColor"
        opacity="0.4"
      />
      <circle cx="6" cy="6" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="18" cy="6" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="6" cy="18" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="18" cy="18" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

export function CrystalBallIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('text-current', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base */}
      <ellipse cx="12" cy="20" rx="8" ry="2" fill="currentColor" opacity="0.3" />
      <rect x="6" y="18" width="12" height="3" rx="1" fill="currentColor" opacity="0.4" />

      {/* Crystal Ball */}
      <circle cx="12" cy="12" r="7" fill="currentColor" opacity="0.2" />
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />

      {/* Inner glow */}
      <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.1" />

      {/* Mystical swirls */}
      <path
        d="M8 10C9 8, 11 8, 12 10C13 8, 15 8, 16 10"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M8 14C9 16, 11 16, 12 14C13 16, 15 16, 16 14"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />

      {/* Shine */}
      <circle cx="9.5" cy="9.5" r="1.5" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

export function EnchantedCrownIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('text-current', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Crown base */}
      <path
        d="M4 16L6 8L10 12L12 6L14 12L18 8L20 16H4Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M4 16L6 8L10 12L12 6L14 12L18 8L20 16"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Gems */}
      <circle cx="8" cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />

      {/* Crown band */}
      <rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor" opacity="0.6" />

      {/* Sparkles */}
      <path d="M7 5L7.5 6.5L9 6L7.5 5.5L7 4L6.5 5.5L5 6L6.5 6.5L7 5Z" fill="currentColor" opacity="0.7" />
      <path d="M17 5L17.5 6.5L19 6L17.5 5.5L17 4L16.5 5.5L15 6L16.5 6.5L17 5Z" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

export function MysticalGemIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('text-current', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer gem shape */}
      <path
        d="M12 2L20 8L16 22L8 22L4 8L12 2Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M12 2L20 8L16 22L8 22L4 8L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Inner facets */}
      <path d="M12 2L16 8L12 22L8 8L12 2Z" fill="currentColor" opacity="0.3" />
      <path d="M4 8L12 8L20 8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M8 8L12 22" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M16 8L12 22" stroke="currentColor" strokeWidth="1" opacity="0.6" />

      {/* Magical sparkles */}
      <circle cx="6" cy="5" r="1" fill="currentColor" opacity="0.8" />
      <circle cx="18" cy="5" r="0.5" fill="currentColor" opacity="0.8" />
      <circle cx="20" cy="12" r="0.5" fill="currentColor" opacity="0.8" />
      <circle cx="4" cy="15" r="1" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

export function MagicalWandIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('text-current', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wand */}
      <path
        d="M3 21L21 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Star tip */}
      <path
        d="M21 3L19.5 1.5L21 0.5L22.5 1.5L21 3Z"
        fill="currentColor"
      />

      {/* Magical trail */}
      <circle cx="7" cy="17" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="10" cy="14" r="0.5" fill="currentColor" opacity="0.7" />
      <circle cx="13" cy="11" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="16" cy="8" r="0.5" fill="currentColor" opacity="0.8" />

      {/* Sparkles */}
      <path d="M5 19L5.5 20.5L7 20L5.5 19.5L5 18L4.5 19.5L3 20L4.5 20.5L5 19Z" fill="currentColor" opacity="0.6" />
      <path d="M15 6L15.5 7.5L17 7L15.5 6.5L15 5L14.5 6.5L13 7L14.5 7.5L15 6Z" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

export function CrescentMoonIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('text-current', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Moon crescent */}
      <path
        d="M21 12.79A9 9 0 1111.21 3A7 7 0 0021 12.79Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M21 12.79A9 9 0 1111.21 3A7 7 0 0021 12.79Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Stars around moon */}
      <path d="M5 8L5.5 9.5L7 9L5.5 8.5L5 7L4.5 8.5L3 9L4.5 9.5L5 8Z" fill="currentColor" opacity="0.7" />
      <path d="M18 5L18.5 6.5L20 6L18.5 5.5L18 4L17.5 5.5L16 6L17.5 6.5L18 5Z" fill="currentColor" opacity="0.6" />
      <circle cx="7" cy="4" r="0.5" fill="currentColor" opacity="0.8" />
      <circle cx="20" cy="16" r="0.5" fill="currentColor" opacity="0.8" />
      <circle cx="4" cy="16" r="1" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

export function FleurDeLisIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('text-current', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Center stem */}
      <path
        d="M12 3V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Top petal */}
      <path
        d="M12 3C10 1 8 2 8 4C8 6 10 7 12 7C14 7 16 6 16 4C16 2 14 1 12 3Z"
        fill="currentColor"
        opacity="0.4"
      />

      {/* Side petals */}
      <path
        d="M12 12C10 10 6 10 5 12C4 14 6 16 8 15C10 14 11 13 12 12Z"
        fill="currentColor"
        opacity="0.4"
      />
      <path
        d="M12 12C14 10 18 10 19 12C20 14 18 16 16 15C14 14 13 13 12 12Z"
        fill="currentColor"
        opacity="0.4"
      />

      {/* Bottom flourish */}
      <path
        d="M12 21C10 19 8 20 8 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12 21C14 19 16 20 16 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function SparkleIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('text-current', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main sparkle */}
      <path
        d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        fill="currentColor"
        opacity="0.6"
      />

      {/* Smaller sparkles */}
      <path
        d="M19 5L19.5 6.5L21 6L19.5 5.5L19 4L18.5 5.5L17 6L18.5 6.5L19 5Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M5 19L5.5 20.5L7 20L5.5 19.5L5 18L4.5 19.5L3 20L4.5 20.5L5 19Z"
        fill="currentColor"
        opacity="0.8"
      />
      <circle cx="6" cy="6" r="1" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="18" r="0.5" fill="currentColor" opacity="0.9" />
    </svg>
  )
}
