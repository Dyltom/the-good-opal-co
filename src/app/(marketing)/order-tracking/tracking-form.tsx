'use client'

import { useActionState } from 'react'
import { trackOrder } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Mail, CheckCircle, Truck, Clock, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function OrderTrackingForm() {
  const [state, formAction, isPending] = useActionState(trackOrder, { error: '' as string, order: null })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5" />
      case 'shipped':
        return <Truck className="h-5 w-5" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-warm-grey/60 text-charcoal'
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-warm-grey/60 p-8">
        <form action={formAction} className="space-y-6">
          {/* Order Number */}
          <div>
            <Label htmlFor="orderNumber" className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-charcoal/50" />
              Order Number
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
            <p className="text-xs text-charcoal/65 mt-1">
              Found in your order confirmation email
            </p>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-charcoal/50" />
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              className="h-12"
              autoComplete="email"
            />
            <p className="text-xs text-charcoal/65 mt-1">
              The email used when placing the order
            </p>
          </div>

          {/* Error Message */}
          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {state.error}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tracking...
              </>
            ) : (
              'Track Order'
            )}
          </Button>
        </form>
      </div>

      {/* Order Details */}
      {state.order && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-warm-grey/60 p-8">
          <h2 className="text-xl font-semibold text-charcoal mb-6">
            Order #{state.order.orderNumber}
          </h2>

          {/* Status */}
          <div className="mb-8">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(state.order.status)}`}>
              {getStatusIcon(state.order.status)}
              <span className="capitalize">{state.order.status}</span>
            </div>
          </div>

          {/* Order Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-charcoal/70 mb-1">Order Date</p>
              <p className="font-medium text-charcoal">
                {new Date(state.order.createdAt).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-charcoal/70 mb-1">Total Amount</p>
              <p className="font-medium text-charcoal">
                {formatCurrency(state.order.total, 'AUD')}
              </p>
            </div>
          </div>

          {/* Tracking Info */}
          {state.order.trackingNumber && (
            <div className="mb-8 p-4 bg-cream rounded-lg">
              <p className="text-sm font-medium text-charcoal mb-2">
                Tracking Information
              </p>
              <p className="text-sm text-charcoal/70">
                Tracking Number: <span className="font-mono">{state.order.trackingNumber}</span>
              </p>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="font-medium text-charcoal mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {state.order.items.map((item: { name: string; price: number; quantity: number }, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-warm-grey/60 last:border-0">
                  <div>
                    <p className="font-medium text-charcoal">{item.name}</p>
                    <p className="text-sm text-charcoal/70">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-charcoal">
                    {formatCurrency(item.price * item.quantity, 'AUD')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping destination */}
          <div className="mt-8 pt-8 border-t border-warm-grey/60">
            <h3 className="font-medium text-charcoal mb-3">Shipping destination</h3>
            <div className="text-sm text-charcoal/70">
              <p>
                {state.order.shippingDestination.city}, {state.order.shippingDestination.state}
              </p>
              <p>{state.order.shippingDestination.country}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
