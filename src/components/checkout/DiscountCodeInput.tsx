'use client'

import { useState, useTransition } from 'react'
import { Tag, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { applyDiscountCode, validateDiscountCode } from '@/app/(marketing)/checkout/discount-actions'
import type { DiscountApplication } from '@/lib/discounts/types'

interface DiscountCodeInputProps {
  onDiscountApplied?: (discount: DiscountApplication | null, totals: any) => void
  className?: string
}

export function DiscountCodeInput({ onDiscountApplied, className }: DiscountCodeInputProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountApplication | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleApply = () => {
    if (!code.trim()) {
      setError('Please enter a discount code')
      return
    }

    setError(null)

    startTransition(async () => {
      const result = await applyDiscountCode(code.trim())

      if (result.success && result.discount) {
        setAppliedDiscount(result.discount)
        onDiscountApplied?.(result.discount, result.totals)
      } else {
        setError(result.error || 'Invalid discount code')
      }
    })
  }

  const handleRemove = () => {
    setCode('')
    setError(null)
    setAppliedDiscount(null)
    onDiscountApplied?.(null, null)
  }

  const handleValidate = async (value: string) => {
    setCode(value)

    if (!value.trim()) {
      setError(null)
      return
    }

    // Validate on blur or after typing stops
    const result = await validateDiscountCode(value)
    if (!result.success && value.length >= 3) {
      setError(result.error || 'Invalid code')
    } else {
      setError(null)
    }
  }

  if (appliedDiscount) {
    // Show applied discount
    return (
      <div className={cn("p-4 bg-green-50 rounded-lg border border-green-200", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Tag className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="font-medium text-green-900">
                {appliedDiscount.code}
              </p>
              <p className="text-sm text-green-700">
                {appliedDiscount.description}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-green-700 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
          <Check className="h-4 w-4" />
          <span>You saved ${(appliedDiscount.amount / 100).toFixed(2)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Tag className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          value={code}
          onChange={(e) => handleValidate(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Enter discount code"
          className={cn(
            "pl-10 pr-24 h-12 uppercase",
            error && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
          )}
          disabled={isPending}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleApply}
          disabled={isPending || !code.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Hint for demo codes */}
      <p className="mt-2 text-xs text-gray-500">
        Try: WELCOME10, SAVE20, OPAL50, or FREESHIP
      </p>
    </div>
  )
}

/**
 * Discount summary line item for order summary
 */
export function DiscountSummaryLine({ discount, amount }: {
  discount: DiscountApplication
  amount: number
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-green-600" />
        <span className="text-green-700 font-medium">
          Discount ({discount.code})
        </span>
      </div>
      <span className="text-green-700 font-medium">
        -${(amount / 100).toFixed(2)}
      </span>
    </div>
  )
}