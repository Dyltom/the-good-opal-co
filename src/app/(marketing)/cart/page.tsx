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

            {/* Empty cart state */}
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Add some products from our store to get started!
              </p>
              <Button size="lg" asChild>
                <Link href="/store">Continue Shopping</Link>
              </Button>
            </Card>

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
