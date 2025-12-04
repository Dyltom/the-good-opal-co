/**
 * Focus trap hook for accessible modals and drawers
 * Implements WCAG 2.1 focus management best practices
 */

import { useEffect, useRef, useCallback } from 'react'

interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  active?: boolean
  /** Initial element to focus when trap activates */
  initialFocus?: HTMLElement | null
  /** Element to return focus to when trap deactivates */
  returnFocus?: boolean
  /** Allow clicking outside to deactivate */
  clickOutsideDeactivates?: boolean
  /** Callback when escape key is pressed */
  onEscape?: () => void
  /** Callback when clicking outside */
  onClickOutside?: () => void
}

/**
 * Custom hook for trapping focus within a container
 * Used for modals, drawers, and other overlay components
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {}
) {
  const {
    active = true,
    initialFocus,
    returnFocus = true,
    clickOutsideDeactivates = false,
    onEscape,
    onClickOutside,
  } = options

  const containerRef = useRef<T>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => {
      // Filter out elements that are not visible
      const style = window.getComputedStyle(el)
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
      )
    })
  }, [])

  // Handle tab key navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!active || !containerRef.current) return

      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements()
        if (focusableElements.length === 0) {
          event.preventDefault()
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        const activeElement = document.activeElement as HTMLElement

        // Shift + Tab
        if (event.shiftKey) {
          if (activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        }
        // Tab
        else {
          if (activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }

      // Handle Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
      }
    },
    [active, getFocusableElements, onEscape]
  )

  // Handle click outside
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!active || !containerRef.current || !clickOutsideDeactivates) return

      if (!containerRef.current.contains(event.target as Node)) {
        event.preventDefault()
        onClickOutside?.()
      }
    },
    [active, clickOutsideDeactivates, onClickOutside]
  )

  // Focus management effects
  useEffect(() => {
    if (!active) return

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Set initial focus
    const setInitialFocus = () => {
      if (initialFocus) {
        initialFocus.focus()
      } else {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          focusableElements[0]?.focus()
        }
      }
    }

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(setInitialFocus)

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)

      // Return focus to previous element
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [
    active,
    initialFocus,
    returnFocus,
    handleKeyDown,
    handleClickOutside,
    getFocusableElements,
  ])

  return containerRef
}

/**
 * Hook to manage focus for dialogs with proper ARIA attributes
 */
export function useDialogFocus<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  options: UseFocusTrapOptions = {}
) {
  const ref = useFocusTrap<T>({
    active: isOpen,
    returnFocus: true,
    ...options,
  })

  // Add ARIA attributes
  useEffect(() => {
    if (!ref.current) return

    if (isOpen) {
      ref.current.setAttribute('role', 'dialog')
      ref.current.setAttribute('aria-modal', 'true')

      // Hide other content from screen readers
      const siblings = Array.from(
        ref.current.parentElement?.children ?? []
      ).filter((el) => el !== ref.current) as HTMLElement[]

      siblings.forEach((el) => {
        el.setAttribute('aria-hidden', 'true')
      })

      return () => {
        siblings.forEach((el) => {
          el.removeAttribute('aria-hidden')
        })
      }
    } else {
      ref.current.removeAttribute('role')
      ref.current.removeAttribute('aria-modal')
    }
    return undefined
  }, [isOpen, ref])

  return ref
}

/**
 * Hook to announce content changes for screen readers
 */
export function useAriaAnnounce() {
  const announceRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create an invisible aria-live region
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.style.position = 'absolute'
    announcer.style.left = '-10000px'
    announcer.style.width = '1px'
    announcer.style.height = '1px'
    announcer.style.overflow = 'hidden'

    document.body.appendChild(announcer)
    announceRef.current = announcer

    return () => {
      document.body.removeChild(announcer)
    }
  }, [])

  const announce = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message
      // Clear after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])

  return announce
}