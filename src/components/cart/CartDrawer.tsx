'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * Cart Drawer Component
 *
 * Sliding drawer that shows cart contents without navigation
 * Modern e-commerce pattern (Shopify, Amazon-style)
 */
export function CartDrawer({ children }: { children: React.ReactNode }) {
  const { items, itemCount, total, removeItem, updateQuantity, isLoaded } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({isLoaded ? itemCount : 0} items)</SheetTitle>
        </SheetHeader>

        {!isLoaded ? (
          <div className="flex items-center justify-center h-full -mt-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full -mt-8">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-6">
              Add some products to get started!
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full mt-6">
            {/* Cart Items - Scrollable */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl flex-shrink-0">
                      {item.name.includes('Coffee') && '☕'}
                      {item.name.includes('Tea') && '🍵'}
                      {item.name.includes('Mug') && '🍺'}
                      {item.name.includes('Grinder') && '⚙️'}
                      {item.name.includes('Press') && '🫖'}
                      {item.name.includes('Infuser') && '🌿'}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatCurrency(item.price, 'USD')} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs ml-auto"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        {formatCurrency(item.price * item.quantity, 'USD')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total, 'USD')}</span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/cart">View Full Cart</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
