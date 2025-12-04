'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EnhancedToastProvider = ToastPrimitives.Provider

/**
 * Enhanced Toast Viewport with better positioning
 */
const EnhancedToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-20 right-4 z-[100] flex w-full max-w-sm flex-col gap-3',
      'md:top-4 md:right-6',
      className
    )}
    {...props}
  />
))
EnhancedToastViewport.displayName = 'EnhancedToastViewport'

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl p-4 shadow-xl backdrop-blur-md transition-all',
  {
    variants: {
      variant: {
        default: 'bg-white/90 border border-gray-200 text-gray-900',
        success: 'bg-success/10 border border-success/30 text-success',
        error: 'bg-error/10 border border-error/30 text-error',
        warning: 'bg-warning/10 border border-warning/30 text-warning',
        info: 'bg-info/10 border border-info/30 text-info',
        loading: 'bg-white/90 border border-gray-200 text-gray-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface EnhancedToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  icon?: React.ReactNode
  showProgress?: boolean
  autoClose?: boolean
  duration?: number
}

/**
 * Enhanced Toast with icons and progress bar
 */
const EnhancedToast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  EnhancedToastProps
>(({ className, variant, icon, showProgress = true, autoClose = true, duration = 5000, ...props }, ref) => {
  const defaultIcons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    loading: <Loader2 className="w-5 h-5 animate-spin" />,
  }

  const currentIcon = icon || (variant && variant !== 'default' ? defaultIcons[variant] : null)

  return (
    <ToastPrimitives.Root
      ref={ref}
      duration={autoClose ? duration : Infinity}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex w-full items-start gap-3"
        >
          {currentIcon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            >
              {currentIcon}
            </motion.div>
          )}
          <div className="flex-1 min-w-0">
            {props.children}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      {showProgress && autoClose && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </ToastPrimitives.Root>
  )
})
EnhancedToast.displayName = 'EnhancedToast'

/**
 * Toast Action with better styling
 */
const EnhancedToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-3',
      'text-sm font-medium transition-all duration-200',
      'bg-white/20 hover:bg-white/30 backdrop-blur-sm',
      'focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
))
EnhancedToastAction.displayName = 'EnhancedToastAction'

/**
 * Toast Close with animation
 */
const EnhancedToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'rounded-lg p-1 text-current/50 opacity-60 transition-all duration-200',
      'hover:opacity-100 hover:bg-white/20',
      'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-current',
      'group-hover:opacity-80',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </ToastPrimitives.Close>
))
EnhancedToastClose.displayName = 'EnhancedToastClose'

/**
 * Toast Title with better typography
 */
const EnhancedToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
EnhancedToastTitle.displayName = 'EnhancedToastTitle'

/**
 * Toast Description with better spacing
 */
const EnhancedToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90 mt-1.5 leading-relaxed', className)}
    {...props}
  />
))
EnhancedToastDescription.displayName = 'EnhancedToastDescription'

/**
 * Hook for programmatic toast usage
 */
export function useEnhancedToast() {
  const [toasts, setToasts] = React.useState<Array<{
    id: string
    title?: string
    description?: string
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'
    action?: React.ReactNode
    duration?: number
  }>>([])

  const toast = React.useCallback((props: Omit<typeof toasts[0], 'id'>) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, ...props }])

    // Auto-remove after duration
    if (props.variant !== 'loading' && props.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, props.duration || 5000)
    }

    return id
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = React.useCallback(() => {
    setToasts([])
  }, [])

  return { toast, toasts, dismiss, dismissAll }
}

export {
  EnhancedToastProvider,
  EnhancedToastViewport,
  EnhancedToast,
  EnhancedToastTitle,
  EnhancedToastDescription,
  EnhancedToastClose,
  EnhancedToastAction,
}