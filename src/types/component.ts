/**
 * Component prop types and UI-related types
 */

import type { ReactNode } from 'react'
import type { Image, Link } from './common'

/**
 * Base component props that all components can extend
 */
export interface BaseComponentProps {
  className?: string
  id?: string
  children?: ReactNode
}

/**
 * Component with testId for testing
 */
export interface TestableComponent {
  'data-testid'?: string
}

/**
 * Size variants
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Color variants
 */
export type ColorVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'ghost'

/**
 * Button variants
 */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link'

/**
 * Button props
 */
export interface ButtonProps extends BaseComponentProps, TestableComponent {
  variant?: ButtonVariant
  color?: ColorVariant
  size?: Size
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  href?: string
  external?: boolean
}

/**
 * Input variants
 */
export type InputVariant = 'outline' | 'filled' | 'ghost'

/**
 * Input props
 */
export interface InputProps extends BaseComponentProps, TestableComponent {
  variant?: InputVariant
  size?: Size
  type?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  error?: boolean
  errorMessage?: string
  helpText?: string
  label?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
}

/**
 * Card variants
 */
export type CardVariant = 'default' | 'outlined' | 'elevated'

/**
 * Card props
 */
export interface CardProps extends BaseComponentProps {
  variant?: CardVariant
  padding?: Size
  hoverable?: boolean
  clickable?: boolean
  onClick?: () => void
}

/**
 * Container props
 */
export interface ContainerProps extends BaseComponentProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
  centered?: boolean
}

/**
 * Section props (for page sections)
 */
export interface SectionProps extends BaseComponentProps {
  background?: 'default' | 'muted' | 'accent' | 'dark'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
}

/**
 * Hero section data
 */
export interface HeroSectionData {
  title: string
  subtitle?: string
  description?: string
  cta?: Link[]
  image?: Image
  backgroundImage?: Image
  alignment?: 'left' | 'center' | 'right'
  overlay?: boolean
}

/**
 * Feature item
 */
export interface Feature {
  icon?: string
  title: string
  description: string
}

/**
 * Features section data
 */
export interface FeaturesSectionData {
  title?: string
  description?: string
  features: Feature[]
  layout?: 'grid' | 'list'
  columns?: 2 | 3 | 4
}

/**
 * Stats item
 */
export interface Stat {
  label: string
  value: string
  suffix?: string
  prefix?: string
}

/**
 * Stats section data
 */
export interface StatsSectionData {
  title?: string
  stats: Stat[]
  layout?: 'horizontal' | 'grid'
}

/**
 * CTA section data
 */
export interface CTASectionData {
  title: string
  description?: string
  buttons: Link[]
  background?: 'default' | 'accent' | 'dark' | 'gradient'
}

/**
 * Navigation props
 */
export interface NavigationProps extends BaseComponentProps {
  logo?: Image
  logoText?: string
  items: NavItem[]
  cta?: Link
  sticky?: boolean
  transparent?: boolean
}

/**
 * Navigation item
 */
export interface NavItem {
  label: string
  href: string
  external?: boolean
  children?: NavItem[]
}

/**
 * Footer props
 */
export interface FooterProps extends BaseComponentProps {
  logo?: Image
  logoText?: string
  description?: string
  links?: FooterLinkGroup[]
  social?: SocialLink[]
  copyright?: string
}

/**
 * Footer link group
 */
export interface FooterLinkGroup {
  title: string
  links: Link[]
}

/**
 * Social link
 */
export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'github'
  url: string
  label?: string
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string
  href?: string
}

/**
 * Breadcrumbs props
 */
export interface BreadcrumbsProps extends BaseComponentProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
}

/**
 * Modal props
 */
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: Size
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

/**
 * Tabs props
 */
export interface TabsProps extends BaseComponentProps {
  defaultTab?: string
  onChange?: (tabId: string) => void
}

/**
 * Tab item
 */
export interface TabItem {
  id: string
  label: string
  content: ReactNode
  disabled?: boolean
}

/**
 * Dropdown props
 */
export interface DropdownProps extends BaseComponentProps {
  trigger: ReactNode
  align?: 'start' | 'center' | 'end'
}

/**
 * Loading state
 */
export interface LoadingProps extends BaseComponentProps {
  size?: Size
  color?: ColorVariant
  fullScreen?: boolean
  text?: string
}

/**
 * Empty state
 */
export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: Link
}

/**
 * Error state
 */
export interface ErrorStateProps extends BaseComponentProps {
  title?: string
  message: string
  retry?: () => void
  back?: () => void
}
