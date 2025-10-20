'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'

/**
 * Checkout Page
 *
 * Handles checkout flow with order summary
 * Ready for Stripe integration via Payload ecommerce plugin
 */
export default function CheckoutPage() {
  const { items, itemCount, total } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, address: value }))

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Search after 300ms of no typing
    if (value.length >= 3) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/address-search?q=${encodeURIComponent(value)}`)
          const data = await response.json()
          if (data.data?.results) {
            setAddressSuggestions(data.data.results.slice(0, 5))
            setShowSuggestions(true)
          }
        } catch (error) {
          console.error('Address search failed:', error)
        } finally {
          setIsSearching(false)
        }
      }, 300)
    } else {
      setShowSuggestions(false)
      setAddressSuggestions([])
    }
  }

  const selectAddress = (result: any) => {
    const addr = result.address || {}
    const streetNumber = addr.house_number || ''
    const street = addr.road || ''
    const address = `${streetNumber} ${street}`.trim()
    const city = addr.city || addr.town || addr.village || addr.suburb || ''
    const state = addr.state || ''
    const zip = addr.postcode || ''

    setFormData((prev) => ({
      ...prev,
      address,
      city,
      state,
      zip,
    }))
    setShowSuggestions(false)
    setAddressSuggestions([])
  }

  const isFormValid = () => {
    return Object.values(formData).every((value) => value.trim() !== '')
  }

  const handleCompleteOrder = async () => {
    if (!isFormValid()) return

    setIsProcessing(true)

    try {
      // Try Stripe checkout first
      const response = await fetch('/api/stripe/cart-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          currency: 'usd',
          customerEmail: formData.email,
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
        }),
      })

      const data = await response.json()

      if (response.ok && data.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.url
      } else {
        // Fallback to demo mode if Stripe not configured
        console.log('Stripe not configured, using demo mode')
        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // Go to success page
        window.location.href = '/checkout/success'
      }
    } catch (error) {
      // Fallback to demo mode on error
      console.log('Checkout error, falling back to demo mode:', error)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      window.location.href = '/checkout/success'
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation logoText="The Good Opal Co" items={[{ href: '/', label: 'Home' }, { href: '/store', label: 'Store' }]} />
        <main className="flex-1">
          <Section padding="lg">
            <Container>
              <div className="max-w-2xl mx-auto text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h1 className="text-3xl font-bold mb-4">No items in cart</h1>
                <p className="text-muted-foreground mb-8">
                  Add some products to your cart before checking out
                </p>
                <Button size="lg" asChild>
                  <Link href="/store">Continue Shopping</Link>
                </Button>
              </div>
            </Container>
          </Section>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation logoText="The Good Opal Co" items={[{ href: '/', label: 'Home' }, { href: '/store', label: 'Store' }]} />
      <main className="flex-1">
        <Section padding="lg">
          <Container>
            <div className="max-w-5xl mx-auto">
              <h1 className="text-4xl font-bold mb-8">Checkout</h1>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                    <form
                      id="checkout-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleCompleteOrder()
                      }}
                    >
                      <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            autoComplete="given-name"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            autoComplete="family-name"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                          <Input
                            id="address"
                            name="address"
                            autoComplete="off"
                            placeholder="Start typing your address..."
                            value={formData.address}
                            onChange={handleAddressChange}
                          />
                          {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                          {showSuggestions && addressSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto">
                              {addressSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => selectAddress(suggestion)}
                                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0 text-sm"
                                >
                                  {suggestion.display_name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Free address search powered by OpenStreetMap
                        </p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            autoComplete="address-level2"
                            placeholder="New York"
                            value={formData.city}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            name="state"
                            autoComplete="address-level1"
                            placeholder="NY"
                            value={formData.state}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            name="zip"
                            autoComplete="postal-code"
                            placeholder="10001"
                            value={formData.zip}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      </div>
                    </form>
                  </Card>

                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                    <div className="p-6 bg-muted rounded-lg text-center">
                      <div className="text-4xl mb-2">💳</div>
                      <p className="font-semibold mb-2">Stripe Integration Ready</p>
                      <p className="text-sm text-muted-foreground">
                        Payment processing via Payload ecommerce plugin + Stripe
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="p-6 sticky top-4">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3 pb-4 border-b">
                          <div className="w-16 h-16 rounded bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl flex-shrink-0">
                            {item.name.includes('Coffee') && '☕'}
                            {item.name.includes('Tea') && '🍵'}
                            {item.name.includes('Mug') && '🍺'}
                            {item.name.includes('Grinder') && '⚙️'}
                            {item.name.includes('Press') && '🫖'}
                            {item.name.includes('Infuser') && '🌿'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-sm">
                            {formatCurrency(item.price * item.quantity, 'USD')}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal ({itemCount} items)</span>
                        <span>{formatCurrency(total, 'USD')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span className="text-success">Free</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(total, 'USD')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        size="lg"
                        type="submit"
                        form="checkout-form"
                        disabled={!isFormValid() || isProcessing}
                      >
                        {isProcessing ? 'Processing Order...' : 'Complete Order'}
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/cart">← Back to Cart</Link>
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
