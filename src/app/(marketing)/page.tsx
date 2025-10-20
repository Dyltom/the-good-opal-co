import type { Metadata } from 'next'
import { HeroCarousel } from '@/components/sections/HeroCarousel'
import { FeaturedProducts } from '@/components/sections'
import { Navigation, Footer } from '@/components/navigation'
import { PRODUCT_CATEGORIES } from '@/data/categories'
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

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Handmade in Australia with Image */}
      <section className="py-20 md:py-28 bg-cream overflow-hidden">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="px-6 lg:pl-12 order-2 lg:order-1">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 text-charcoal leading-tight">
                Handmade in Australia
              </h2>
              <p className="text-lg md:text-xl text-charcoal-60 mb-8 leading-relaxed">
                We source all our materials directly from Australian opal miners and handcraft each piece from start to finish,
                offering our customers ethically sourced, eco-conscious Australian opals at an exceptional price.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/store"
                  className="inline-flex items-center justify-center bg-opal-blue text-white px-8 py-4 rounded-xl font-semibold hover:bg-opal-blue-dark transition-all shadow-lg text-base"
                >
                  Shop Our Collection
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center border-2 border-charcoal text-charcoal px-8 py-4 rounded-xl font-semibold hover:bg-charcoal hover:text-white transition-all text-base"
                >
                  Our Story
                </Link>
              </div>
            </div>

            {/* Image Grid */}
            <div className="px-6 lg:pr-0 order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/20211104_234659-1-4.jpg"
                  alt="Vibrant Australian Opal"
                  className="rounded-2xl shadow-xl object-cover w-full h-64 lg:h-80"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/20220109_133519-3.jpg"
                  alt="Colorful Handcrafted Opals"
                  className="rounded-2xl shadow-xl object-cover w-full h-64 lg:h-80 mt-12"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Picks */}
      <FeaturedProducts
        title="Shop Picks"
        description="Handpicked treasures from our collection"
        limit={4}
        featured={true}
        className="bg-white py-16"
      />

      {/* Selected Categories */}
      <section className="py-20 md:py-24 bg-cream">
        <div className="max-w-screen-xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-charcoal">Selected Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {['OPALS', 'EARRINGS', 'RINGS', 'SERVICES', 'COURSES'].map((category) => (
              <Link
                key={category}
                href={`/store?category=${category.toLowerCase()}`}
                className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 border border-warm-grey group"
              >
                <h3 className="text-lg font-bold text-charcoal group-hover:text-opal-blue transition-colors">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customs Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="bg-cream rounded-3xl p-10 md:p-16 text-center shadow-sm border border-warm-grey">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-charcoal">Customs</h2>
            <p className="text-lg md:text-xl text-charcoal-60 max-w-3xl mx-auto mb-10 leading-relaxed">
              Turn the opal of your dreams into a one-of-a-kind treasure, crafted to last a lifetime.
              Our custom jewellery is designed to be both affordable and uniquely yours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-opal-blue text-white px-10 py-4 rounded-xl font-semibold hover:bg-opal-blue-dark transition-all shadow-lg text-lg"
            >
              GET A QUOTE
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 md:py-24 bg-cream">
        <div className="max-w-screen-xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-charcoal">REVIEWS</h2>
          <p className="text-xl md:text-2xl text-charcoal-80 mb-12 max-w-2xl mx-auto font-medium">
            Why our customers love us?
          </p>
          <p className="text-lg text-charcoal-60 max-w-3xl mx-auto mb-10 leading-relaxed">
            Everything we create is done with care, from start to finish. From ethically sourcing our rough materials
            to intricately crafting opals and jewellery for their forever homes, every step matters to us.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-opal-blue text-white px-10 py-4 rounded-xl font-semibold hover:bg-opal-blue-dark transition-all shadow-lg text-lg"
          >
            CHAT TO US TODAY
          </Link>
        </div>
      </section>

      {/* Bundle and Save */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="bg-cream rounded-3xl p-10 md:p-16 text-center shadow-sm border border-warm-grey">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-charcoal">Bundle and Save</h2>
            <p className="text-lg md:text-xl text-charcoal-60 max-w-3xl mx-auto mb-10 leading-relaxed">
              Automatic discounts are applied to your order. The more items you add, the greater the discount on your total.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/store?category=opals"
                className="inline-flex items-center justify-center bg-opal-blue text-white px-10 py-4 rounded-xl font-semibold hover:bg-opal-blue-dark transition-all shadow-lg text-lg"
              >
                SHOP OPALS
              </Link>
              <Link
                href="/store?category=jewellery"
                className="inline-flex items-center justify-center border-2 border-charcoal text-charcoal px-10 py-4 rounded-xl font-semibold hover:bg-charcoal hover:text-white transition-all text-lg"
              >
                SHOP JEWELLERY
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 md:py-24 bg-cream">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Express Delivery */}
            <div className="text-center">
              <div className="w-16 h-16 bg-opal-blue rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-charcoal">Express Delivery</h3>
              <p className="text-charcoal-60">Free express delivery for a limited period.</p>
            </div>

            {/* Warranty */}
            <div className="text-center">
              <div className="w-16 h-16 bg-opal-blue rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-charcoal">Warranty</h3>
              <p className="text-charcoal-60">Enjoy 1 Year of Warranty and free cleaning and polishing services on all jewellery.</p>
            </div>

            {/* Premium Packaging */}
            <div className="text-center">
              <div className="w-16 h-16 bg-opal-blue rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-charcoal">Premium Packaging</h3>
              <p className="text-charcoal-60">Each opal is carefully packaged in a glass display box, and all jewellery is packaged in a premium box, with a polishing cloth and care instructions.</p>
            </div>

            {/* Payment Options */}
            <div className="text-center">
              <div className="w-16 h-16 bg-opal-blue rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-charcoal">Payment Options</h3>
              <p className="text-charcoal-60">Purchase your products securely. With payment options like Credit Card or PayPal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="bg-cream rounded-3xl p-10 md:p-16 text-center shadow-sm border border-warm-grey">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-charcoal">KEEP IN TOUCH</h2>
            <p className="text-lg text-charcoal-60 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for new products, trends and offers, plus your chance to win a $250 store credit!
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl border-2 border-warm-grey bg-white focus:outline-none focus:border-opal-blue focus:ring-2 focus:ring-opal-blue/20 transition-all"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-opal-blue text-white rounded-xl font-semibold hover:bg-opal-blue-dark transition-all shadow-lg"
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
