'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '@/hooks/useCart'

/**
 * Checkout Success Page Content
 *
 * Inner component that uses useSearchParams
 */
function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  useEffect(() => {
    // Verify the session and clear cart
    const verifyAndClearCart = async () => {
      if (!sessionId) {
        // If no session ID, assume it's a demo/test order
        setIsVerifying(false)
        clearCart()
        return
      }

      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        const data = await response.json()

        if (response.ok && data.data.paymentStatus === 'paid') {
          // Payment successful, clear the cart
          clearCart()
          setIsVerifying(false)
        } else {
          setVerificationError('Payment verification failed')
          setIsVerifying(false)
        }
      } catch (error) {
        console.error('Verification error:', error)
        setVerificationError('Failed to verify payment')
        setIsVerifying(false)
      }
    }

    verifyAndClearCart()
  }, [sessionId, clearCart])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation logoText="Rapid Sites" items={[{ href: '/', label: 'Home' }, { href: '/store', label: 'Store' }]} />
        <main className="flex-1">
          <Section padding="lg">
            <Container>
              <div className="max-w-2xl mx-auto text-center">
                <Card className="p-12">
                  <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-lg">Verifying your payment...</p>
                </Card>
              </div>
            </Container>
          </Section>
        </main>
        <Footer />
      </div>
    )
  }

  if (verificationError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation logoText="Rapid Sites" items={[{ href: '/', label: 'Home' }, { href: '/store', label: 'Store' }]} />
        <main className="flex-1">
          <Section padding="lg">
            <Container>
              <div className="max-w-2xl mx-auto text-center">
                <Card className="p-12">
                  <div className="text-5xl mb-4">⚠️</div>
                  <h1 className="text-3xl font-bold mb-4">Verification Error</h1>
                  <p className="text-muted-foreground mb-8">{verificationError}</p>
                  <Button asChild>
                    <Link href="/checkout">Return to Checkout</Link>
                  </Button>
                </Card>
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
      <Navigation logoText="Rapid Sites" items={[{ href: '/', label: 'Home' }, { href: '/store', label: 'Store' }]} />
      <main className="flex-1">
        <Section padding="lg">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              <Card className="p-12">
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <div className="text-5xl">✓</div>
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold mb-4">Order Complete!</h1>
                <p className="text-lg text-muted-foreground mb-2">
                  Thank you for your order
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  We've received your order and will begin processing it shortly.
                  You'll receive a confirmation email soon.
                </p>

                {/* Order Details (Demo) */}
                <div className="bg-muted rounded-lg p-6 mb-8 text-left">
                  <h2 className="font-semibold mb-3">What's Next?</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Order confirmation email sent</li>
                    <li>✓ Payment processed successfully</li>
                    <li>→ Your order is being prepared</li>
                    <li>→ Shipping notification coming soon</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/store">Continue Shopping</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/">Return Home</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}

/**
 * Checkout Success Page
 *
 * Displays order confirmation after successful checkout
 */
export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Navigation logoText="Rapid Sites" items={[{ href: '/', label: 'Home' }, { href: '/store', label: 'Store' }]} />
          <main className="flex-1">
            <Section padding="lg">
              <Container>
                <div className="max-w-2xl mx-auto text-center">
                  <Card className="p-12">
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-lg">Loading...</p>
                  </Card>
                </div>
              </Container>
            </Section>
          </main>
          <Footer />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
