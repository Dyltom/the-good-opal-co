'use client'

/**
 * Improved Checkout Form with Proper Validation
 *
 * Features:
 * - Proper email regex validation
 * - Real-time field validation with debouncing
 * - Accessible error messages
 * - Loading states with disabled form
 * - Better mobile layout
 */

import { useState, useTransition, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, cn } from '@/lib/utils'
import { getStickyOffset } from '@/lib/constants/layout'
import { createCheckoutSession } from './actions'
import type { DiscountApplication, DiscountCalculationResult } from '@/lib/discounts/types'
import type { Cart } from '@/lib/cart'
import { AlertCircle, Lock, CheckCircle, Truck, CreditCard, ShoppingBag } from 'lucide-react'
import { DiscountCodeInput } from '@/components/checkout/DiscountCodeInput'

interface CheckoutFormProps {
  cart: Cart
}

// Email regex pattern for proper validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Name validation pattern (letters, spaces, hyphens, apostrophes)
const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/

interface FormErrors {
  name?: string
  email?: string
}

export function CheckoutForm({ cart }: CheckoutFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    discountCode: '',
  })
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<FormErrors>({})
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountApplication | null>(null)
  const [discountedTotals, setDiscountedTotals] = useState<DiscountCalculationResult | null>(null)
  const { toast } = useToast()

  // Handle discount application
  const handleDiscountApplied = (discount: DiscountApplication, totals: DiscountCalculationResult) => {
    setAppliedDiscount(discount)
    setDiscountedTotals(totals)
    if (discount) {
      setFormData(prev => ({ ...prev, discountCode: discount.code }))
    } else {
      setFormData(prev => ({ ...prev, discountCode: '' }))
    }
  }

  // Validate individual fields
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        if (!NAME_REGEX.test(value)) return 'Name can only contain letters, spaces, hyphens and apostrophes'
        return undefined

      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address'
        return undefined

      default:
        return undefined
    }
  }

  // Handle input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Only show errors for touched fields
    if (touchedFields.has(name)) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }))
    }
  }

  // Handle field blur to mark as touched
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouchedFields(prev => new Set(prev).add(name))

    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }))
  }

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const nameValid = !validateField('name', formData.name)
    const emailValid = !validateField('email', formData.email)
    return nameValid && emailValid
  }, [formData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Touch all fields to show errors
    setTouchedFields(new Set(['name', 'email']))

    // Validate all fields
    const newErrors: FormErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
    }
    setErrors(newErrors)

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== undefined)) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form before proceeding.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const form = new FormData()
      form.set('name', formData.name.trim())
      form.set('email', formData.email.trim())
      if (formData.discountCode) {
        form.set('discountCode', formData.discountCode)
      }

      const result = await createCheckoutSession(form)

      if (result.success && result.url) {
        // Show success state briefly before redirect
        toast({
          title: 'Redirecting to payment...',
          description: 'You will be redirected to Stripe Checkout.',
        })

        // Small delay for user feedback
        setTimeout(() => {
          window.location.href = result.url
        }, 500)
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
  const shippingCost = cart.total >= 50000 ? 0 : 1500 // Fixed: Use cents consistently
  const orderTotal = cart.total + shippingCost

  return (
    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Checkout Form - Responsive width */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Contact Information
          </h2>
          <form id="checkout-form" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  Full Name
                  <span className="text-red-500 text-sm" aria-label="required">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={cn(
                      "pr-10",
                      touchedFields.has('name') && errors.name && "border-red-500 focus:ring-red-500"
                    )}
                    aria-invalid={touchedFields.has('name') && !!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    disabled={isPending}
                    required
                  />
                  {/* Validation Icon */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {touchedFields.has('name') && (
                      errors.name ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )
                    )}
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  {touchedFields.has('name') && errors.name && (
                    <motion.p
                      id="name-error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-500 mt-1"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  Email Address
                  <span className="text-red-500 text-sm" aria-label="required">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={cn(
                      "pr-10",
                      touchedFields.has('email') && errors.email && "border-red-500 focus:ring-red-500"
                    )}
                    aria-invalid={touchedFields.has('email') && !!errors.email}
                    aria-describedby={errors.email ? "email-error" : "email-description"}
                    disabled={isPending}
                    required
                  />
                  {/* Validation Icon */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {touchedFields.has('email') && (
                      errors.email ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )
                    )}
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  {touchedFields.has('email') && errors.email ? (
                    <motion.p
                      id="email-error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-500 mt-1"
                    >
                      {errors.email}
                    </motion.p>
                  ) : (
                    <p id="email-description" className="text-xs text-muted-foreground mt-1">
                      Order confirmation will be sent to this email
                    </p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </form>
        </Card>

        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Shipping & Payment
          </h2>
          <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg text-center border border-gray-100">
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <svg className="w-8 h-8 text-opal-electric-accessible" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                </svg>
              </motion.div>
              <span className="text-base md:text-lg font-medium">Secure Stripe Checkout</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll be redirected to Stripe to complete your payment securely.
              Shipping address will be collected during checkout.
            </p>
          </div>

          {/* Security Features with proper focus states */}
          <div className="mt-6 space-y-3">
            {[
              { icon: CheckCircle, text: '256-bit SSL encryption' },
              { icon: CheckCircle, text: 'PCI DSS compliant payment processing' },
              { icon: CheckCircle, text: 'Visa, Mastercard, Amex, Apple Pay, Google Pay' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <item.icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Order Summary - Fixed on desktop, static on mobile */}
      <div className="lg:col-span-1">
        <Card className={cn(
          "p-4 md:p-6",
          "lg:sticky",
          getStickyOffset() // Dynamic offset based on nav height
        )}>
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Order Summary
          </h2>

          {/* Cart Items - Responsive sizing */}
          <div className="space-y-3 mb-6 max-h-64 lg:max-h-96 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex gap-3 pb-3 border-b last:border-0">
                {/* Smaller thumbnails on mobile */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl md:text-2xl">💎</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-sm whitespace-nowrap">
                  {formatCurrency(item.price * item.quantity, 'AUD')}
                </p>
              </div>
            ))}
          </div>

          {/* Discount Code Input */}
          <div className="mb-4">
            <DiscountCodeInput
              onDiscountApplied={handleDiscountApplied}
              className="w-full"
            />
          </div>

          {/* Totals with animations */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>{formatCurrency(discountedTotals?.subtotal || cart.total, 'AUD')}</span>
            </div>
            {appliedDiscount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-between text-sm text-green-600"
              >
                <span>Discount ({appliedDiscount.code})</span>
                <span>-{formatCurrency(discountedTotals?.discount || 0, 'AUD')}</span>
              </motion.div>
            )}
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3" />
                Shipping
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={shippingCost}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}
                >
                  {shippingCost === 0 ? 'FREE' : formatCurrency(discountedTotals?.shipping ?? shippingCost, 'AUD')}
                </motion.span>
              </AnimatePresence>
            </div>
            {cart.total < 50000 && ( // Fixed: Use cents
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-muted-foreground"
              >
                Add {formatCurrency(50000 - cart.total, 'AUD')} more for free shipping
              </motion.p>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={orderTotal}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  {formatCurrency(discountedTotals?.total || orderTotal, 'AUD')}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Submit Button with enhanced states */}
          <Button
            className={cn(
              "w-full h-12 text-base font-semibold transition-all",
              "focus:ring-2 focus:ring-offset-2 focus:ring-opal-electric-accessible",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            size="lg"
            type="submit"
            form="checkout-form"
            disabled={!isFormValid || isPending}
            aria-busy={isPending}
          >
            <AnimatePresence mode="wait">
              {isPending ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Redirecting to Payment...
                </motion.span>
              ) : (
                <motion.span
                  key="default"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Proceed to Secure Payment
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          {/* Terms text with proper link focus states */}
          <p className="text-xs text-center text-muted-foreground mt-4 px-2">
            By completing your purchase, you agree to our{' '}
            <a
              href="/terms"
              className="underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-opal-electric-accessible focus:ring-offset-1 rounded"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              className="underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-opal-electric-accessible focus:ring-offset-1 rounded"
            >
              Privacy Policy
            </a>.
          </p>
        </Card>
      </div>
    </div>
  )
}