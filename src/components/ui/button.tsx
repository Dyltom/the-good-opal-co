import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button variants using CVA for type-safe styling
 * Follows SOLID principles with single responsibility and open/closed design
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-charcoal text-cream hover:bg-charcoal-dark',
        destructive:
          'bg-fire-coral text-cream hover:bg-fire-coral/90',
        outline:
          'border border-charcoal/45 bg-transparent text-charcoal hover:border-charcoal hover:bg-white/60',
        secondary:
          'bg-charcoal/5 text-charcoal hover:bg-charcoal/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
        ghost:
          'text-charcoal hover:bg-charcoal/5 dark:text-white dark:hover:bg-white/10',
        link:
          'text-opal-electric-accessible underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-[44px] h-11 px-6 py-2.5 sm:min-h-[40px] sm:py-2',
        sm: 'min-h-[44px] h-11 px-4 py-2 text-xs sm:h-9 sm:min-h-[36px]',
        lg: 'min-h-[48px] h-12 px-8 py-3 text-base sm:min-h-[44px]',
        xl: 'min-h-[56px] h-14 px-10 py-3.5 text-lg',
        icon: 'min-w-[44px] min-h-[44px] h-11 w-11 sm:h-10 sm:w-10 sm:min-w-[40px] sm:min-h-[40px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Shared shadcn/Radix button primitive for the editorial storefront.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
