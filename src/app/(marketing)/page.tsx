import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout'

export const metadata: Metadata = {
  title: 'The Good Opal Co - Premium Australian Opal Jewelry',
  description: 'Discover authentic Australian opal jewelry including rings, necklaces, earrings and raw opals. Premium quality opals that don\'t cost the earth.',
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Full bleed with overlay */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center bg-gradient-to-br from-opal-blue/10 via-opal-teal/10 to-opal-pink/10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <Container className="relative z-10 text-center">
          <Badge className="mb-6 bg-opal-blue/20 text-opal-blue-dark border-opal-blue/30 hover:bg-opal-blue/30">
            Authentic Australian Opals
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-opal-blue via-opal-teal to-opal-pink bg-clip-text text-transparent animate-fade-in">
            Australian Opal That
            <br />
            Doesn't Cost The Earth
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover the vibrant beauty of authentic Australian opals. Hand-selected for exceptional fire and color.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-opal-blue hover:bg-opal-blue-dark text-white text-lg px-8">
              <Link href="/store">Shop Collection</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-opal-blue text-opal-blue hover:bg-opal-blue/10 text-lg px-8">
              <Link href="/blog">Learn About Opals</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Featured Collections */}
      <section className="py-20 bg-background">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop By Collection</h2>
            <p className="text-lg text-muted-foreground">Curated pieces showcasing the finest Australian opals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Opal Rings */}
            <Link href="/store?category=opal-rings" className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-gradient-to-br from-opal-blue/20 to-opal-teal/20">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Opal Rings</h3>
                <p className="text-sm opacity-90 mb-4">Statement pieces & everyday elegance</p>
                <Button variant="secondary" size="sm" className="bg-white/90 text-gray-900 hover:bg-white">
                  View Collection
                </Button>
              </div>
            </Link>

            {/* Opal Necklaces */}
            <Link href="/store?category=opal-necklaces" className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-gradient-to-br from-opal-pink/20 to-opal-orange/20">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Necklaces & Pendants</h3>
                <p className="text-sm opacity-90 mb-4">Elegant pieces showcasing opal fire</p>
                <Button variant="secondary" size="sm" className="bg-white/90 text-gray-900 hover:bg-white">
                  View Collection
                </Button>
              </div>
            </Link>

            {/* Raw Opals */}
            <Link href="/store?category=raw-opals" className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-gradient-to-br from-opal-teal/20 to-opal-yellow/20">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Raw Opals</h3>
                <p className="text-sm opacity-90 mb-4">Unset stones for collectors</p>
                <Button variant="secondary" size="sm" className="bg-white/90 text-gray-900 hover:bg-white">
                  View Collection
                </Button>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/30">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose The Good Opal Co</h2>
            <p className="text-lg text-muted-foreground">Premium Australian opals, ethically sourced and expertly crafted</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-opal-blue/10 flex items-center justify-center">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Authentic Australian</h3>
              <p className="text-muted-foreground">
                Every opal sourced directly from Australian miners, certified for authenticity
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-opal-teal/10 flex items-center justify-center">
                <span className="text-3xl">🌈</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Vibrant Color Play</h3>
              <p className="text-muted-foreground">
                Hand-selected for exceptional fire and color - blues, greens, pinks, and more
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-opal-pink/10 flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Craftsmanship</h3>
              <p className="text-muted-foreground">
                Each piece carefully designed to showcase the opal's natural beauty
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-opal-orange/10 flex items-center justify-center">
                <span className="text-3xl">♻️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ethically Sourced</h3>
              <p className="text-muted-foreground">
                Supporting small-scale Australian miners with fair prices
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-opal-yellow/10 flex items-center justify-center">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Shipping</h3>
              <p className="text-muted-foreground">
                Fully insured express shipping worldwide with elegant gift packaging
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-opal-blue/10 flex items-center justify-center">
                <span className="text-3xl">💯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Authenticity Guarantee</h3>
              <p className="text-muted-foreground">
                Certificate of authenticity with every purchase
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-background border-y">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-center">
            <div>
              <div className="text-2xl font-bold text-opal-blue mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Authentic Australian</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-opal-teal mb-1">Certified</div>
              <div className="text-sm text-muted-foreground">Every Purchase</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-opal-pink mb-1">Secure</div>
              <div className="text-sm text-muted-foreground">Shipping Worldwide</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-opal-orange mb-1">Ethical</div>
              <div className="text-sm text-muted-foreground">Sourcing Practices</div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-opal-blue via-opal-teal to-opal-pink text-white">
        <Container className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Find Your Perfect Opal?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Browse our collection of stunning Australian opal jewelry
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-opal-blue hover:bg-gray-100 text-lg px-8">
              <Link href="/store">Shop Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
              <Link href="#contact">Custom Commissions</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-muted/30">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our newsletter for new arrivals, opal care tips, and exclusive offers
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md border bg-background"
              />
              <Button type="submit" className="bg-opal-blue hover:bg-opal-blue-dark">
                Subscribe
              </Button>
            </form>
          </div>
        </Container>
      </section>
    </div>
  )
}
