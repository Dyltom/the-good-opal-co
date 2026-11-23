'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  GIFT_VOUCHER_MAX_AMOUNT,
  GIFT_VOUCHER_MESSAGE_MAX,
  GIFT_VOUCHER_MIN_AMOUNT,
  GIFT_VOUCHER_PRESET_AMOUNTS,
} from '@/lib/gift-voucher-rules'
import { createGiftVoucherCheckout } from './actions'
import { giftVoucherOrderSchema } from './schema'

const chipClass =
  'min-h-11 rounded-sm border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent'

export function GiftVoucherForm() {
  const [preset, setPreset] = useState<number | 'custom'>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [sendToSelf, setSendToSelf] = useState(false)
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const amount = preset === 'custom' ? Number(customAmount) : preset

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const order = { amount, sendToSelf, recipientName, recipientEmail, senderName, message }
    const parsed = giftVoucherOrderSchema.safeParse(order)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the voucher details')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await createGiftVoucherCheckout(parsed.data)
      if (result.success) window.location.assign(result.url)
      else setError(result.error)
    })
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6">
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium text-ink">Amount</legend>
        <div className="flex flex-wrap gap-2">
          {GIFT_VOUCHER_PRESET_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={preset === value}
              onClick={() => setPreset(value)}
              className={cn(chipClass, preset === value ? 'border-ink bg-ink text-bg' : 'border-rule-2 text-ink hover:border-ink')}
            >
              ${value}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={preset === 'custom'}
            onClick={() => setPreset('custom')}
            className={cn(chipClass, preset === 'custom' ? 'border-ink bg-ink text-bg' : 'border-rule-2 text-ink hover:border-ink')}
          >
            Other amount
          </button>
        </div>
        {preset === 'custom' ? (
          <div className="grid max-w-[220px] gap-1.5">
            <Label htmlFor="voucher-amount">Amount in AUD</Label>
            <Input
              id="voucher-amount"
              inputMode="numeric"
              type="number"
              min={GIFT_VOUCHER_MIN_AMOUNT}
              max={GIFT_VOUCHER_MAX_AMOUNT}
              step={1}
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder={`${GIFT_VOUCHER_MIN_AMOUNT} to ${GIFT_VOUCHER_MAX_AMOUNT}`}
            />
          </div>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-1 text-sm font-medium text-ink">Who is it for?</legend>
        <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={sendToSelf}
            onChange={(event) => setSendToSelf(event.target.checked)}
            className="h-4 w-4 accent-ink"
          />
          Send it to me, I will pass it on
        </label>
        {sendToSelf ? null : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="recipient-name">Recipient name</Label>
              <Input id="recipient-name" autoComplete="off" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="recipient-email">Recipient email</Label>
              <Input id="recipient-email" type="email" autoComplete="off" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} />
            </div>
          </div>
        )}
        <div className="grid gap-1.5">
          <Label htmlFor="sender-name">Your name</Label>
          <Input id="sender-name" autoComplete="name" value={senderName} onChange={(event) => setSenderName(event.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="voucher-message">Message (optional)</Label>
          <Textarea
            id="voucher-message"
            rows={4}
            maxLength={GIFT_VOUCHER_MESSAGE_MAX}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <p className="text-xs text-ink-3">{GIFT_VOUCHER_MESSAGE_MAX - message.length} characters left</p>
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {Number.isFinite(amount) && amount > 0 ? `Buy a $${amount} voucher` : 'Buy a voucher'}
        </Button>
        <p className="mt-3 text-xs text-ink-3">You will pay securely with Stripe. The code is emailed as soon as payment goes through.</p>
      </div>
    </form>
  )
}
