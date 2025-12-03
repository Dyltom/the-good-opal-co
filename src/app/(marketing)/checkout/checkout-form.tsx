'use client'

/**
 * Checkout Form Client Component
 *
 * Handles customer information collection and Stripe checkout session creation.
 * Uses Server Actions for form submission.
 */

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { createCheckoutSession } from './actions'
import type { Cart } from '@/lib/cart'

interface CheckoutFormProps {
  cart: Cart
}

export function CheckoutForm({ cart }: CheckoutFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const isFormValid = formData.name.trim().length >= 2 && formData.email.includes('@')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isFormValid) {
      toast({
        title: 'Invalid form',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const form = new FormData()
      form.set('name', formData.name)
      form.set('email', formData.email)

      const result = await createCheckoutSession(form)

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url
      } else {
        toast({
          title: 'Checkout Error',
          description: result.error ?? 'Failed to create checkout session. Please try again.',
          variant: 'destructive',
        })
      }
    })
  }

  // Calculate shipping
  const shippingCost = cart.total >= 500 ? 0 : 15
  const orderTotal = cart.total + shippingCost

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <form id="checkout-form" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Order confirmation will be sent to this email
                </p>
              </div>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping & Payment</h2>
          <div className="p-6 bg-muted rounded-lg text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <svg className="w-8 h-8 text-opal-blue" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
              </svg>
              <span className="text-lg font-medium">Secure Stripe Checkout</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You&apos;ll be redirected to Stripe to complete your payment securely. Shipping address
              will be collected during checkout.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>PCI DSS compliant payment processing</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Visa, Mastercard, Amex, Apple Pay, Google Pay</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex gap-3 pb-4 border-b">
                <div className="w-16 h-16 rounded bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">💎</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-sm">
                  {formatCurrency(item.price * item.quantity, 'AUD')}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>{formatCurrency(cart.total, 'AUD')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost, 'AUD')}
              </span>
            </div>
            {cart.total < 500 && (
              <p className="text-xs text-muted-foreground">
                Add {formatCurrency(500 - cart.total, 'AUD')} more for free shipping
              </p>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(orderTotal, 'AUD')}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            size="lg"
            type="submit"
            form="checkout-form"
            disabled={!isFormValid || isPending}
          >
            {isPending ? 'Redirecting to Payment...' : 'Proceed to Payment'}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By completing your purchase, you agree to our Terms of Service and Privacy Policy.
          </p>
        </Card>
      </div>
    </div>
  )
}
