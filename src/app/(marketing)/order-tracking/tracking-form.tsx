'use client'

import { useFormState } from 'react-dom'
import { trackOrder } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Mail, Loader2, CheckCircle, Truck, Clock } from 'lucide-react'

export function OrderTrackingForm() {
  const [state, formAction] = useFormState(trackOrder, { error: null, order: null })

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
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form action={formAction} className="space-y-6">
          {/* Order Number */}
          <div>
            <Label htmlFor="orderNumber" className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-gray-400" />
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
            <p className="text-xs text-gray-500 mt-1">
              Found in your order confirmation email
            </p>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-gray-400" />
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
            <p className="text-xs text-gray-500 mt-1">
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
          <Button type="submit" size="lg" className="w-full">
            Track Order
          </Button>
        </form>
      </div>

      {/* Order Details */}
      {state.order && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-medium text-charcoal">
                {new Date(state.order.createdAt).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="font-medium text-charcoal">
                ${(state.order.total / 100).toFixed(2)} AUD
              </p>
            </div>
          </div>

          {/* Tracking Info */}
          {state.order.trackingNumber && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-charcoal mb-2">
                Tracking Information
              </p>
              <p className="text-sm text-gray-600">
                Tracking Number: <span className="font-mono">{state.order.trackingNumber}</span>
              </p>
              {state.order.trackingUrl && (
                <a
                  href={state.order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-opal-electric-accessible hover:underline mt-1 inline-block"
                >
                  Track Package →
                </a>
              )}
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="font-medium text-charcoal mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {state.order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                  <div>
                    <p className="font-medium text-charcoal">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-charcoal">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-medium text-charcoal mb-3">Shipping Address</h3>
            <div className="text-sm text-gray-600">
              <p>{state.order.shippingAddress.line1}</p>
              {state.order.shippingAddress.line2 && (
                <p>{state.order.shippingAddress.line2}</p>
              )}
              <p>
                {state.order.shippingAddress.city}, {state.order.shippingAddress.state} {state.order.shippingAddress.postalCode}
              </p>
              <p>{state.order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}