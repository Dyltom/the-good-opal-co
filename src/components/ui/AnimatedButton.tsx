'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buttonPress, focusRing, hoverScale } from '@/lib/animations/microInteractions'
import { forwardRef } from 'react'

interface AnimatedButtonProps extends ButtonProps {
  isLoading?: boolean
  loadingText?: string
  successAnimation?: boolean
}

/**
 * Enhanced Button with micro-interactions
 * Features press effects, focus states, loading animations
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, isLoading, loadingText, successAnimation, className, ...props }, ref) => {
    return (
      <motion.div
        {...hoverScale}
        {...buttonPress}
        {...focusRing}
        className="inline-block"
      >
        <Button
          ref={ref}
          className={cn(
            'relative overflow-hidden',
            className
          )}
          {...props}
        >
          {/* Success ripple effect */}
          <AnimatePresence>
            {successAnimation && (
              <motion.span
                className="absolute inset-0 bg-success/20"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          {/* Button content with loading state */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-2"
              >
                <motion.span
                  className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                {loadingText || 'Loading...'}
              </motion.span>
            ) : (
              <motion.span
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Hover shimmer effect */}
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            initial={{ x: '-100%', opacity: 0 }}
            whileHover={{ x: '100%', opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </Button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

/**
 * Icon Button with rotation animation
 */
export const AnimatedIconButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { icon: React.ReactNode; rotateOnHover?: boolean }
>(({ icon, rotateOnHover = true, className, ...props }, ref) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      {...focusRing}
    >
      <Button
        ref={ref}
        size="icon"
        className={cn('relative', className)}
        {...props}
      >
        <motion.span
          whileHover={rotateOnHover ? { rotate: 180 } : {}}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.span>
      </Button>
    </motion.div>
  )
})

AnimatedIconButton.displayName = 'AnimatedIconButton'