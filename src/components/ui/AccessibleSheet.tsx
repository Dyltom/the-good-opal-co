'use client'

import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { Cross2Icon } from '@radix-ui/react-icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useAriaAnnounce } from '@/hooks/useFocusTrap'

/**
 * Enhanced Sheet with focus management and animations
 * Radix UI already handles focus trap, we add animations and announcements
 */

const AccessibleSheet = SheetPrimitive.Root

const AccessibleSheetTrigger = SheetPrimitive.Trigger

const AccessibleSheetClose = SheetPrimitive.Close

const AccessibleSheetPortal = SheetPrimitive.Portal

/**
 * Sheet overlay with animation
 */
const AccessibleSheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
      className
    )}
    {...props}
  />
))
AccessibleSheetOverlay.displayName = 'AccessibleSheetOverlay'

interface AccessibleSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: 'top' | 'right' | 'bottom' | 'left'
  onOpenAutoFocus?: (event: Event) => void
  onCloseAutoFocus?: (event: Event) => void
}

/**
 * Sheet content with enhanced focus management
 */
const AccessibleSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  AccessibleSheetContentProps
>(({ side = 'right', className, children, onOpenAutoFocus, onCloseAutoFocus, ...props }, ref) => {
  const announce = useAriaAnnounce()

  // Announce when sheet opens
  React.useEffect(() => {
    announce('Dialog opened. Press Escape to close.')
    return () => {
      announce('Dialog closed.')
    }
  }, [announce])

  const slideVariants = {
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    top: {
      initial: { y: '-100%' },
      animate: { y: 0 },
      exit: { y: '-100%' },
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
  }

  const sideClasses = {
    top: 'inset-x-0 top-0 border-b',
    bottom: 'inset-x-0 bottom-0 border-t',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
  }

  return (
    <AccessibleSheetPortal>
      <AnimatePresence>
        <AccessibleSheetOverlay />
        <SheetPrimitive.Content
          ref={ref}
          onOpenAutoFocus={(event) => {
            // Focus the first focusable element or close button
            onOpenAutoFocus?.(event)
          }}
          onCloseAutoFocus={(event) => {
            // Return focus to trigger
            onCloseAutoFocus?.(event)
          }}
          className={cn(
            'fixed z-50 gap-4 bg-background p-6 shadow-xl transition-none',
            sideClasses[side],
            className
          )}
          asChild
          {...props}
        >
          <motion.div
            initial={slideVariants[side].initial}
            animate={slideVariants[side].animate}
            exit={slideVariants[side].exit}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            {children}
            <SheetPrimitive.Close
              className={cn(
                'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background',
                'transition-all duration-200',
                'hover:opacity-100 hover:rotate-90',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
              )}
              aria-label="Close dialog"
            >
              <Cross2Icon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
          </motion.div>
        </SheetPrimitive.Content>
      </AnimatePresence>
    </AccessibleSheetPortal>
  )
})
AccessibleSheetContent.displayName = 'AccessibleSheetContent'

const AccessibleSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
AccessibleSheetHeader.displayName = 'AccessibleSheetHeader'

const AccessibleSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
AccessibleSheetFooter.displayName = 'AccessibleSheetFooter'

const AccessibleSheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
AccessibleSheetTitle.displayName = 'AccessibleSheetTitle'

const AccessibleSheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
AccessibleSheetDescription.displayName = 'AccessibleSheetDescription'

export {
  AccessibleSheet,
  AccessibleSheetPortal,
  AccessibleSheetOverlay,
  AccessibleSheetTrigger,
  AccessibleSheetClose,
  AccessibleSheetContent,
  AccessibleSheetHeader,
  AccessibleSheetFooter,
  AccessibleSheetTitle,
  AccessibleSheetDescription,
}