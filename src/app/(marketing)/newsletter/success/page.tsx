import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { CheckCircle, Mail, ShoppingBag, Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Welcome to Our Newsletter | The Good Opal Co',
  description: 'Thank you for subscribing to The Good Opal Co newsletter',
}

export default function NewsletterSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-display font-bold text-charcoal mb-2">
              Welcome to the Family! 🎉
            </h1>

            <p className="text-lg text-content mb-6">
              Your newsletter subscription has been confirmed.
            </p>

            <div className="bg-gradient-to-r from-opal-electric/10 to-fire-pink/10 p-6 rounded-lg mb-8">
              <p className="text-sm text-gray-600 mb-2">Your welcome discount code:</p>
              <p className="text-3xl font-bold text-opal-electric">WELCOME10</p>
              <p className="text-sm text-gray-600 mt-2">Get 10% off your first purchase</p>
            </div>

            <Button asChild size="lg" className="mb-6">
              <Link href="/store">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Start Shopping
              </Link>
            </Button>
          </div>

          {/* What to Expect */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-display font-bold text-charcoal mb-6 text-center">
              What&apos;s Coming Your Way
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-opal-electric/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-opal-electric" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">Exclusive Offers</h3>
                <p className="text-sm text-content">
                  Early access to sales and subscriber-only discounts
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-fire-pink/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-fire-pink" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">New Collections</h3>
                <p className="text-sm text-content">
                  Be the first to see our latest opal treasures
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-opal-emerald/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-opal-emerald" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">Care Tips</h3>
                <p className="text-sm text-content">
                  Expert advice on caring for your precious opals
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Follow us for daily opal inspiration
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="#"
                  className="text-gray-400 hover:text-opal-electric transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-opal-electric transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-opal-electric transition-colors"
                  aria-label="Pinterest"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}