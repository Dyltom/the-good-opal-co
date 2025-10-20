import type { Metadata } from 'next'
import { CategoryGrid, FeaturesGrid, TrustBadges, FeaturedProducts } from '@/components/sections'
import { TrustSignalBar } from '@/components/trust'
import { Navigation, Footer } from '@/components/navigation'
import { PRODUCT_CATEGORIES } from '@/data/categories'
import { WHY_CHOOSE_FEATURES } from '@/data/features'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Good Opal Co - Premium Australian Opal Jewelry',
  description: 'Discover authentic Australian opal jewelry including rings, necklaces, earrings and raw opals. Premium quality opals that don\'t cost the earth.',
}

export default function HomePage() {
  return (
    <div className="flex flex-col bg-white">
      <Navigation
        logo={{ url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
        items={[
          { href: '/store', label: 'Shop' },
          { href: '/blog', label: 'Blog' },
          { href: '/faq', label: 'FAQ' },
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-white py-20 md:py-32">
        <div className="max-w-screen-xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-widest text-opal-blue mb-4 font-semibold">Authentic Australian Opals</p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-charcoal">
            Each Opal Tells a Story<br />Millions of Years in the Making
          </h1>
          <p className="text-xl text-charcoal-60 mb-10 max-w-2xl mx-auto">
            Hand-selected for exceptional fire and color from the mines of Lightning Ridge, Coober Pedy, and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/store" className="inline-flex items-center justify-center bg-opal-blue text-white px-10 py-4 rounded-md font-semibold hover:bg-opal-blue-dark transition-all shadow-md hover:shadow-lg">
              Discover Your Perfect Opal →
            </Link>
            <Link href="/blog" className="inline-flex items-center justify-center border-2 border-charcoal px-10 py-4 rounded-md font-semibold hover:bg-charcoal hover:text-white transition-all">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signal Bar */}
      <TrustSignalBar className="bg-cream" />

      {/* Featured Products */}
      <FeaturedProducts
        title="Featured Collection"
        description="Exceptional pieces from our latest arrivals"
        limit={4}
        featured={true}
        className="bg-white"
      />

      {/* Shop By Collection */}
      <CategoryGrid
        title="Shop By Collection"
        description="Explore our carefully curated collections of Australian opal jewelry"
        categories={PRODUCT_CATEGORIES.slice(0, 3)}
        className="bg-cream"
      />

      {/* New Arrivals */}
      <FeaturedProducts
        title="New Arrivals"
        description="Just arrived from the Australian opal mines"
        limit={8}
        featured={false}
        className="bg-white"
      />

      {/* Why Choose Us */}
      <FeaturesGrid
        title="Why Choose The Good Opal Co"
        description="Premium Australian opals, ethically sourced and expertly crafted"
        features={WHY_CHOOSE_FEATURES}
        columns={3}
        className="bg-cream"
      />

      {/* Trust Badges */}
      <TrustBadges className="bg-white" />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-opal-blue to-opal-turquoise text-white">
        <div className="max-w-screen-xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Find Your Perfect Opal?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Browse our collection of stunning Australian opal jewelry, each piece one-of-a-kind
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/store" className="inline-flex items-center justify-center bg-white text-opal-blue px-10 py-4 rounded-md font-semibold hover:bg-cream transition-all shadow-xl">
              Explore Full Collection →
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center border-2 border-white px-10 py-4 rounded-md font-semibold hover:bg-white hover:text-opal-blue transition-all">
              Custom Commissions
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-cream">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Connected</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our newsletter for new arrivals, opal care tips, and exclusive offers
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-md border-2 border-warm-grey bg-white focus:outline-none focus:border-opal-gold transition-all"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-charcoal transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
