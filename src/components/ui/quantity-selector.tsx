'use client'

import { Button } from '@/components/ui/button'

interface QuantitySelectorProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

/**
 * Quantity Selector Component
 *
 * Reusable component for selecting item quantity with +/- buttons
 * Includes ARIA labels for accessibility
 */
export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= min && value <= max) {
      onQuantityChange(value)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-11 w-11 p-0 text-lg md:h-8 md:w-8 md:text-base"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
      >
        −
      </Button>
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className="w-16 text-center border rounded-md py-1 px-2"
        aria-label={`Quantity: ${quantity}`}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-11 w-11 p-0 text-lg md:h-8 md:w-8 md:text-base"
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  )
}
