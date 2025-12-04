/**
 * Touch Target Accessibility Utilities
 *
 * Ensures all interactive elements meet WCAG 2.5.5 minimum touch target size
 * Minimum: 44x44px for mobile touch targets
 */

import { cn } from '@/lib/utils'

/**
 * Minimum touch target classes for different button sizes
 */
export const touchTargetClasses = {
  // Icon buttons - ensure 44px minimum
  iconSm: 'min-w-[44px] min-h-[44px] w-11 h-11', // 44x44px
  iconMd: 'min-w-[48px] min-h-[48px] w-12 h-12', // 48x48px
  iconLg: 'min-w-[56px] min-h-[56px] w-14 h-14', // 56x56px

  // Regular buttons - height should be 44px minimum on mobile
  buttonSm: 'min-h-[44px] px-4 py-2.5 sm:min-h-[36px] sm:py-2', // 44px mobile, 36px desktop
  buttonMd: 'min-h-[44px] px-6 py-3 sm:min-h-[40px] sm:py-2.5', // 44px mobile, 40px desktop
  buttonLg: 'min-h-[48px] px-8 py-3.5 sm:min-h-[44px] sm:py-3', // 48px mobile, 44px desktop

  // Form controls
  input: 'min-h-[44px] px-3 py-2.5', // 44px height
  checkbox: 'w-5 h-5 cursor-pointer', // With proper padding on label
  radio: 'w-5 h-5 cursor-pointer', // With proper padding on label

  // Links and clickable areas
  link: 'inline-flex items-center min-h-[44px] px-2 -mx-2', // Adds padding for touch
  navLink: 'flex items-center min-h-[44px] px-4', // Navigation links

  // Card and list items
  cardClickable: 'min-h-[80px] p-4', // Larger touch area for cards
  listItem: 'min-h-[44px] px-4 py-3', // List items
}

/**
 * Get appropriate touch target class based on element type and size
 */
export function getTouchTargetClass(
  type: 'icon' | 'button' | 'input' | 'link' | 'card' | 'checkbox' | 'radio',
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  switch (type) {
    case 'icon':
      return touchTargetClasses[`icon${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof touchTargetClasses]
    case 'button':
      return touchTargetClasses[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof touchTargetClasses]
    case 'input':
      return touchTargetClasses.input
    case 'checkbox':
    case 'radio':
      return touchTargetClasses[type]
    case 'link':
      return touchTargetClasses.link
    case 'card':
      return touchTargetClasses.cardClickable
    default:
      return touchTargetClasses.buttonMd
  }
}

/**
 * Wrap small elements to meet touch target requirements
 */
export function ensureTouchTarget(className?: string, type: 'icon' | 'button' = 'icon'): string {
  const baseClass = type === 'icon' ? touchTargetClasses.iconSm : touchTargetClasses.buttonSm
  return cn(baseClass, className)
}

/**
 * Touch-friendly spacing for form elements
 */
export const touchFormClasses = {
  fieldWrapper: 'space-y-2 mb-4', // Space between label and input
  checkboxWrapper: 'flex items-start space-x-3 min-h-[44px] py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2',
  radioWrapper: 'flex items-start space-x-3 min-h-[44px] py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2',
  labelWithInput: 'block text-sm font-medium mb-1.5', // Label spacing
}

/**
 * Mobile-specific touch enhancements
 */
export const mobileTouchEnhancements = {
  // Increase tap area on mobile without visual change
  expandTapArea: 'relative before:absolute before:-inset-2 before:content-[""] sm:before:hidden',

  // Better touch feedback
  touchFeedback: 'active:scale-95 transition-transform duration-150',

  // Prevent accidental taps
  safeSpacing: 'my-2 sm:my-1', // More vertical space on mobile
}

/**
 * Check if an element meets touch target requirements
 */
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  const minSize = 44 // Minimum 44px

  // Check both width and height
  return rect.width >= minSize && rect.height >= minSize
}

/**
 * Common patterns for accessible touch targets
 */
export const accessiblePatterns = {
  // Close button (X)
  closeButton: cn(
    touchTargetClasses.iconSm,
    'rounded-full hover:bg-gray-100 transition-colors',
    'flex items-center justify-center',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opal-electric-accessible'
  ),

  // Icon-only button
  iconButton: cn(
    touchTargetClasses.iconSm,
    'rounded-lg hover:bg-gray-100 transition-colors',
    'flex items-center justify-center',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opal-electric-accessible'
  ),

  // Small action button
  smallButton: cn(
    touchTargetClasses.buttonSm,
    'rounded-lg font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opal-electric-accessible'
  ),

  // Checkbox or radio label
  selectionLabel: cn(
    touchFormClasses.checkboxWrapper,
    'transition-colors cursor-pointer'
  ),

  // Clickable list item
  clickableListItem: cn(
    touchTargetClasses.listItem,
    'hover:bg-gray-50 transition-colors cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-opal-electric-accessible'
  ),
}