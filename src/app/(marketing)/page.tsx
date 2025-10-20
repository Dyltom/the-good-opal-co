import type { Metadata } from 'next'
import { HeroSection, CategoryGrid, FeaturesGrid, TrustBadges, CTASection } from '@/components/sections'
import { TrustSignalBar } from '@/components/trust'
import { PRODUCT_CATEGORIES } from '@/data/categories'
import { WHY_CHOOSE_FEATURES } from '@/data/features'

export const metadata: Metadata = {
  title: 'The Good Opal Co - Premium Australian Opal Jewelry',
  description: 'Discover authentic Australian opal jewelry including rings, necklaces, earrings and raw opals. Premium quality opals that don\'t cost the earth.',
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection
        badge="Authentic Australian Opals"
        title="Each Opal Tells a Story Millions of Years in the Making"
        subtitle="Premium Australian Opal Jewelry"
        description="Discover the vibrant beauty of authentic Australian opals. Hand-selected for exceptional fire and color from the mines of Lightning Ridge, Coober Pedy, and beyond."
        buttons={[
          { href: '/store', label: 'Discover Your Perfect Opal →', className: 'bg-opal-blue hover:bg-opal-blue-dark text-white font-semibold px-8' },
          { href: '/blog', label: 'Our Story', variant: 'outline', className: 'border-opal-blue text-opal-blue hover:bg-opal-blue/10' },
        ]}
      />

      {/* Trust Signal Bar */}
      <TrustSignalBar />

      {/* Shop By Collection */}
      <CategoryGrid
        categories={PRODUCT_CATEGORIES.slice(0, 3)} // Show first 3 categories
      />

      {/* Why Choose Us */}
      <FeaturesGrid
        title="Why Choose The Good Opal Co"
        description="Premium Australian opals, ethically sourced and expertly crafted"
        features={WHY_CHOOSE_FEATURES}
        columns={3}
        className="bg-muted/30"
      />

      {/* Trust Badges */}
      <TrustBadges />

      {/* CTA Section */}
      <CTASection
        title="Ready to Find Your Perfect Opal?"
        description="Browse our collection of stunning Australian opal jewelry, each piece one-of-a-kind"
        buttons={[
          { href: '/store', label: 'Explore Collection →' },
          { href: '/contact', label: 'Design Your Dream Piece', variant: 'outline' },
        ]}
      />

      {/* Newsletter Section - Simple inline */}
      <section className="py-20 bg-muted/30">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 mx-auto">
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
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-primary-foreground shadow h-10 px-4 py-2 bg-opal-blue hover:bg-opal-blue-dark"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
