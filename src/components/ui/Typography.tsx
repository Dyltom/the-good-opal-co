/**
 * Typography Components
 *
 * Consistent, accessible text components following the design system
 */

import { cn } from '@/lib/utils'
import { TYPOGRAPHY_PRESETS, TEXT_COLOR, getHeadingClass, getBodyClass } from '@/lib/constants/typography'
import type { ReactNode } from 'react'

interface HeadingProps {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  variant?: 'display' | 'heading'
  color?: keyof typeof TEXT_COLOR
}

/**
 * Heading component with consistent styling
 */
export function Heading({
  children,
  className,
  as: Component = 'h2',
  variant = 'heading',
  color = 'primary',
}: HeadingProps) {
  return (
    <Component
      className={cn(
        getHeadingClass(Component, variant),
        TEXT_COLOR[color],
        className
      )}
    >
      {children}
    </Component>
  )
}

interface TextProps {
  children: ReactNode
  className?: string
  as?: 'p' | 'span' | 'div'
  size?: keyof typeof TYPOGRAPHY_PRESETS.body
  color?: keyof typeof TEXT_COLOR
}

/**
 * Body text component with consistent styling
 */
export function Text({
  children,
  className,
  as: Component = 'p',
  size = 'base',
  color = 'primary',
}: TextProps) {
  return (
    <Component
      className={cn(
        getBodyClass(size),
        TEXT_COLOR[color],
        className
      )}
    >
      {children}
    </Component>
  )
}

interface OverlineProps {
  children: ReactNode
  className?: string
  color?: keyof typeof TEXT_COLOR
}

/**
 * Overline text for labels and categories
 */
export function Overline({
  children,
  className,
  color = 'opal-electric',
}: OverlineProps) {
  return (
    <span
      className={cn(
        TYPOGRAPHY_PRESETS.overline,
        TEXT_COLOR[color],
        className
      )}
    >
      {children}
    </span>
  )
}

interface CaptionProps {
  children: ReactNode
  className?: string
}

/**
 * Caption text for small descriptions
 */
export function Caption({ children, className }: CaptionProps) {
  return (
    <span className={cn(TYPOGRAPHY_PRESETS.caption, className)}>
      {children}
    </span>
  )
}

interface GradientTextProps {
  children: ReactNode
  className?: string
}

/**
 * Gradient text effect
 */
export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span className={cn('text-gradient-prismatic', className)}>
      {children}
    </span>
  )
}