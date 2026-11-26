'use client'

import { useState, useTransition } from 'react'
import { checkGiftVoucher } from '@/app/(marketing)/checkout/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'

export interface AppliedGiftVoucher {
  code: string
  available: number
}

interface GiftVoucherFieldProps {
  applied: AppliedGiftVoucher | null
  onChange: (voucher: AppliedGiftVoucher | null) => void
}

export function GiftVoucherField({ applied, onChange }: GiftVoucherFieldProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  const apply = (event: React.FormEvent) => {
    event.preventDefault()
    setError(undefined)
    startTransition(async () => {
      const result = await checkGiftVoucher(code)
      if (!result.ok) {
        setError(result.error)
        return
      }
      onChange({ code: result.code, available: result.available })
      setCode('')
    })
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-rule py-2 text-sm">
        <p className="min-w-0 text-ink-2">
          Gift voucher <span className="font-medium text-ink">{applied.code}</span>
          <span className="block text-[12.5px]">{formatCurrency(applied.available, 'AUD')} available</span>
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
          Remove
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={apply}>
      <Label htmlFor="gift-voucher-code" className="sr-only">
        Gift voucher code
      </Label>
      <div className="flex gap-2">
        <Input
          id="gift-voucher-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="GOOD-XXXX-XXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'gift-voucher-error' : undefined}
        />
        <Button type="submit" variant="ghost" disabled={isPending || code.trim() === ''} aria-busy={isPending}>
          Apply
        </Button>
      </div>
      {error ? (
        <p id="gift-voucher-error" role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  )
}
