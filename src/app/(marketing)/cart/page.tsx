'use client'

import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'

/**
 * Cart Page
 *
 * Shows shopping cart with items, quantities, and total
 * Uses useCart hook with localStorage
 */
export default function CartPage() {
  const { items, itemCount, total, removeItem, updateQuantity, clearCart } = useCart()
  const { toast } = useToast()

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id)
    toast({
      title: 'Item removed',
      description: `${name} has been removed from your cart.`,
    })
  }

  const handleUpdateQuantity = (id: string, quantity: number, name: string) => {
    updateQuantity(id, quantity)
    if (quantity > 0) {
      toast({
        title: 'Quantity updated',
        description: `${name} quantity updated to ${quantity}.`,
      })
    }
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart.',
      variant: 'destructive',
    })
  }

  if (items.length === 0) {
    return (
      <Section padding="lg">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

            {/* Empty cart state - Stunning Visual */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Background Image */}
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero/opal-1.jpg"
                  alt="Australian Opals"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal/80 via-charcoal/70 to-opal-blue/80" />
              </div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-20 text-center text-white">
                <div className="max-w-2xl mx-auto">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6 border-2 border-white/20">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    Your Collection Awaits
                  </h2>
                  <p className="text-xl text-white/90 mb-10 leading-relaxed">
                    Each Australian opal is a unique masterpiece formed over millions of years.
                    Start your journey and discover the perfect piece today.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild className="bg-white text-opal-blue hover:bg-cream font-semibold shadow-xl hover:scale-105 transition-all">
                      <Link href="/store">Explore Collection →</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm font-semibold">
                      <Link href="/">Back to Home</Link>
                    </Button>
                  </div>

                  {/* Trust Elements */}
                  <div className="mt-12 pt-8 border-t border-white/20">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold mb-1">130+</div>
                        <div className="text-sm text-white/80">Unique Opals</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold mb-1">100%</div>
                        <div className="text-sm text-white/80">Australian</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold mb-1">1 Year</div>
                        <div className="text-sm text-white/80">Warranty</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart functionality info */}
            <div className="mt-8 p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">🛍️ About the Cart</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This cart uses localStorage for persistence. The Payload ecommerce plugin provides:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Persistent shopping carts (database-backed)</li>
                <li>✓ Cart synced across devices for logged-in users</li>
                <li>✓ LocalStorage fallback for guest users</li>
                <li>✓ Automatic cart recovery</li>
                <li>✓ Real-time inventory checking</li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section padding="lg">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Shopping Cart</h1>
            <Button variant="outline" size="sm" onClick={handleClearCart}>
              Clear Cart
            </Button>
          </div>

          {/* Cart Items */}
          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex gap-6">
                  {/* Product Image Placeholder */}
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl flex-shrink-0">
                    {item.name.includes('Coffee') && '☕'}
                    {item.name.includes('Tea') && '🍵'}
                    {item.name.includes('Mug') && '🍺'}
                    {item.name.includes('Grinder') && '⚙️'}
                    {item.name.includes('Press') && '🫖'}
                    {item.name.includes('Infuser') && '🌿'}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {formatCurrency(item.price, 'USD')} each
                    </p>

                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.name)}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </Button>
                        <span className="w-12 text-center font-medium" aria-label={`Quantity: ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.name)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatCurrency(item.price * item.quantity, 'USD')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.price, 'USD')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Cart Summary */}
          <Card className="p-6 bg-muted">
            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal ({itemCount} items):</span>
                <span className="font-bold">{formatCurrency(total, 'USD')}</span>
              </div>
              <div className="flex gap-4">
                <Button size="lg" variant="outline" asChild className="flex-1">
                  <Link href="/store">← Continue Shopping</Link>
                </Button>
                <Button size="lg" asChild className="flex-1">
                  <Link href="/checkout">Proceed to Checkout →</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  )
}
