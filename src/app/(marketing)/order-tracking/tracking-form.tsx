'use client'

import { useActionState } from 'react'
import { trackOrder } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Mail, CheckCircle, Truck, Clock, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const statusDisplay: Record<string, { label: string; detail: string; icon: typeof Package }> = {
  pending: {
    label: 'Confirming payment',
    detail: 'Stripe is confirming your payment. This usually takes a few minutes.',
    icon: Clock,
  },
  processing: {
    label: 'Being prepared',
    detail: 'We are checking and packing your piece. You will get tracking details once it ships.',
    icon: Package,
  },
  shipped: {
    label: 'On its way',
    detail: 'Your parcel is with the carrier. Use the tracking number below to follow it.',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    detail: 'The carrier has marked your parcel as delivered.',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    detail: 'This order was cancelled. Contact us if you were not expecting this.',
    icon: Package,
  },
  refunded: {
    label: 'Refunded',
    detail: 'This order has been refunded to your original payment method.',
    icon: Package,
  },
  disputed: {
    label: 'Under review',
    detail: 'This order is under review. Contact us and we will help.',
    icon: Package,
  },
}

export function OrderTrackingForm() {
  const [state, formAction, isPending] = useActionState(trackOrder, {
    error: '' as string,
    order: null,
  })

  return (
    <>
      <div className="rounded-sm border border-rule bg-bg p-8 shadow-sm">
        <form action={formAction} className="space-y-6">
          <div>
            <Label htmlFor="orderNumber" className="mb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-ink-3" />
              Order number
            </Label>
            <Input
              id="orderNumber"
              name="orderNumber"
              type="text"
              required
              placeholder="OPAL-XXXXX-XXXX"
              className="h-12 uppercase"
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-ink-2">In your order confirmation email</p>
          </div>
          <div>
            <Label htmlFor="email" className="mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-ink-3" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="h-12"
              autoComplete="email"
            />
            <p className="mt-1 text-xs text-ink-2">The email you used at checkout</p>
          </div>
          {state.error && (
            <div className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding your order…
              </>
            ) : (
              'Track order'
            )}
          </Button>
        </form>
      </div>
      {state.order && (
        <div className="mt-8 rounded-sm border border-rule bg-bg p-8 shadow-sm">
          <p className="text-sm text-ink-2">Order number</p>
          <h2 className="mb-6 mt-1 break-all font-mono text-base text-ink">
            {state.order.orderNumber}
          </h2>
          {(() => {
            const display = statusDisplay[state.order.status] ?? statusDisplay.processing!
            const StatusIcon = display.icon
            return (
              <div className="mb-8 flex items-start gap-3 rounded-sm bg-bg p-4">
                <StatusIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
                <div>
                  <p className="font-medium text-ink">{display.label}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-2">{display.detail}</p>
                </div>
              </div>
            )
          })()}

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm text-ink-2">Ordered</p>
              <p className="font-medium text-ink">
                {new Date(state.order.createdAt).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-ink-2">Total</p>
              <p className="font-medium text-ink">
                {formatCurrency(state.order.total, 'AUD')}
              </p>
            </div>
          </div>
          {state.order.trackingNumber && (
            <div className="mb-8 rounded-sm bg-bg p-4">
              <p className="mb-2 text-sm font-medium text-ink">Tracking</p>
              <p className="text-sm text-ink-2">
                Tracking number: <span className="font-mono">{state.order.trackingNumber}</span>
              </p>
            </div>
          )}
          <div>
            <h3 className="mb-4 font-medium text-ink">Items</h3>
            <div className="space-y-3">
              {state.order.items.map(
                (item: { name: string; price: number; quantity: number }, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-rule py-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-ink">{item.name}</p>
                      <p className="text-sm text-ink-2">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-ink">
                      {formatCurrency(item.price * item.quantity, 'AUD')}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="mt-8 border-t border-rule pt-8">
            <h3 className="mb-3 font-medium text-ink">Shipping destination</h3>
            <div className="text-sm text-ink-2">
              <p>
                {state.order.shippingDestination.city}, {state.order.shippingDestination.state}
              </p>
              <p>
                {new Intl.DisplayNames(['en-AU'], { type: 'region' }).of(
                  state.order.shippingDestination.country
                ) ?? state.order.shippingDestination.country}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
