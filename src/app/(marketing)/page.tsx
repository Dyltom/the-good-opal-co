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

      {/* Selected Categories with Images */}
      <section className="py-20 md:py-24 bg-cream">
        <div className="max-w-screen-xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-charcoal">Selected Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {/* Raw Opals */}
            <Link
              href="/store?category=raw-opals"
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <div className="aspect-square relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/20210627_202327-3.jpg"
                  alt="Raw Australian Opals"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <h3 className="text-xl font-bold text-white">OPALS</h3>
                </div>
              </div>
            </Link>

            {/* Earrings */}
            <Link
              href="/store"
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <div className="aspect-square relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/IMG_5903-3.jpg"
                  alt="Opal Earrings"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <h3 className="text-xl font-bold text-white">EARRINGS</h3>
                </div>
              </div>
            </Link>

            {/* Rings */}
            <Link
              href="/store?category=opal-rings"
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <div className="aspect-square relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/20210819_102625-4.jpg"
                  alt="Opal Rings"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <h3 className="text-xl font-bold text-white">RINGS</h3>
                </div>
              </div>
            </Link>

            {/* Services */}
            <Link
              href="/services"
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-opal-blue to-opal-purple shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <div className="aspect-square relative flex flex-col items-center justify-center p-6">
                <svg className="w-16 h-16 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.586V5L7 4z" />
                </svg>
                <h3 className="text-xl font-bold text-white text-center">SERVICES</h3>
              </div>
            </Link>

            {/* Courses */}
            <Link
              href="/courses"
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-opal-gold to-opal-pink shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <div className="aspect-square relative flex flex-col items-center justify-center p-6">
                <svg className="w-16 h-16 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-bold text-white text-center">COURSES</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Customs Section with Image Gallery */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-charcoal leading-tight">
                Custom Creations
              </h2>
              <p className="text-lg md:text-xl text-charcoal-60 mb-8 leading-relaxed">
                Turn the opal of your dreams into a one-of-a-kind treasure, crafted to last a lifetime.
                Our custom jewellery is designed to be both affordable and uniquely yours.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-opal-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Personal Consultation</p>
                    <p className="text-sm text-charcoal-60">1:1 design guidance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-opal-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Hand-Selected Opals</p>
                    <p className="text-sm text-charcoal-60">Choose your stone</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-opal-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Expert Craftsmanship</p>
                    <p className="text-sm text-charcoal-60">Years of experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-opal-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Fair Pricing</p>
                    <p className="text-sm text-charcoal-60">Affordable luxury</p>
                  </div>
                </div>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-opal-blue text-white px-10 py-4 rounded-xl font-semibold hover:bg-opal-blue-dark transition-all shadow-lg text-lg hover:scale-105 duration-300"
              >
                GET A QUOTE →
              </Link>
            </div>

            {/* Image Gallery - Custom Rings */}
            <div className="order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Large Image - Aurora Ring */}
                <div className="col-span-2 rounded-2xl overflow-hidden shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/api/media/file/20210819_102625-4.jpg"
                    alt="Custom Aurora Opal Ring"
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Small Images - More Custom Rings */}
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/api/media/file/20210819_102749-7.jpg"
                    alt="Sun and Moon Opal Ring"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/api/media/file/20210819_101509-7.jpg"
                    alt="Coral Opal Ring"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-charcoal">REVIEWS</h2>
            <p className="text-xl md:text-2xl text-charcoal-80 mb-6 font-medium">
              Why Our Customers Love Us
            </p>
            <p className="text-lg text-charcoal-60 max-w-3xl mx-auto leading-relaxed">
              Everything we create is done with care, from start to finish. From ethically sourcing our rough materials
              to intricately crafting opals and jewellery for their forever homes, every step matters to us.
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Review 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-charcoal-80 mb-6 leading-relaxed">
                "Absolutely stunning! The opal ring I ordered has the most incredible play of color - blues, greens, and flashes of red. It's even more beautiful in person than the photos. The craftsmanship is exceptional!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-blue to-opal-purple rounded-full flex items-center justify-center text-white font-bold text-lg">
                  E
                </div>
                <div>
                  <p className="font-bold text-charcoal">Emma Thompson</p>
                  <p className="text-sm text-charcoal-60">Melbourne, VIC</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-charcoal-80 mb-6 leading-relaxed">
                "I took the opal cutting course and learned so much! Now I can spot quality opals and appreciate the skill involved. The hands-on experience was invaluable. Highly recommend!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-gold to-opal-pink rounded-full flex items-center justify-center text-white font-bold text-lg">
                  J
                </div>
                <div>
                  <p className="font-bold text-charcoal">James Wilson</p>
                  <p className="text-sm text-charcoal-60">Sydney, NSW</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-charcoal-80 mb-6 leading-relaxed">
                "The custom engagement ring exceeded all expectations! They helped me design the perfect piece featuring a Lightning Ridge black opal. My fiancée cries every time she looks at it. Worth every cent!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-turquoise to-opal-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div>
                  <p className="font-bold text-charcoal">Marcus Chen</p>
                  <p className="text-sm text-charcoal-60">Brisbane, QLD</p>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-charcoal-80 mb-6 leading-relaxed">
                "Fast shipping, beautiful packaging, and the opal earrings are gorgeous! The colors shift as I move - it's like wearing little rainbows. Great value for authentic Australian opals."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-pink to-opal-gold rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <p className="font-bold text-charcoal">Sophie Martin</p>
                  <p className="text-sm text-charcoal-60">Perth, WA</p>
                </div>
              </div>
            </div>

            {/* Review 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-charcoal-80 mb-6 leading-relaxed">
                "I've been collecting opals for years and these are genuine, quality stones at fair prices. The descriptions are accurate and the customer service is excellent. Will definitely buy again!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-blue to-opal-turquoise rounded-full flex items-center justify-center text-white font-bold text-lg">
                  R
                </div>
                <div>
                  <p className="font-bold text-charcoal">Rachel Davies</p>
                  <p className="text-sm text-charcoal-60">Adelaide, SA</p>
                </div>
              </div>
            </div>

            {/* Review 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-charcoal-80 mb-6 leading-relaxed">
                "Bought a pendant as a gift for my mum - she absolutely loves it! The Coober Pedy opal has amazing color and the setting is beautifully crafted. Came with certificate of authenticity too."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-purple to-opal-pink rounded-full flex items-center justify-center text-white font-bold text-lg">
                  L
                </div>
                <div>
                  <p className="font-bold text-charcoal">Luke Anderson</p>
                  <p className="text-sm text-charcoal-60">Hobart, TAS</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-opal-blue text-white px-10 py-4 rounded-xl font-semibold hover:bg-opal-blue-dark transition-all shadow-lg text-lg hover:scale-105 duration-300"
            >
              CHAT TO US TODAY →
            </Link>
          </div>
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
