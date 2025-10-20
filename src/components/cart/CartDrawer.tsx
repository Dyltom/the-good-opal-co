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
          <div className="flex flex-col items-center justify-center h-full -mt-8 px-4">
            {/* Animated Icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-opal-blue to-opal-purple rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-charcoal">Start Your Collection</h3>
            <p className="text-charcoal-60 text-center mb-8 max-w-xs leading-relaxed">
              Discover one-of-a-kind Australian opals, each with its own unique play of color
            </p>
            <Button asChild size="lg" className="bg-opal-blue hover:bg-opal-blue-dark text-white shadow-lg w-full max-w-xs">
              <Link href="/store">Explore Opals →</Link>
            </Button>
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
