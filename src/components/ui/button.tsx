import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-sm border font-sans font-medium no-underline transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-ink bg-ink text-bg hover:border-[#3a332b] hover:bg-[#3a332b]',
        ghost: 'border-rule-2 bg-transparent text-ink hover:border-ink',
        quiet: 'border-transparent bg-transparent text-ink-2 hover:text-ink',
        destructive: 'border-destructive bg-destructive text-bg hover:bg-destructive/90',
        link: 'border-transparent text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-12 px-[22px] text-[15px]',
        sm: 'min-h-11 px-4 text-sm',
        lg: 'min-h-[52px] px-7 text-base',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px]',
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
