import type { Metadata } from 'next'
import { HomeHero, TrustMarquee, FeaturedProducts } from '@/components/sections'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo'

export const metadata: Metadata = {
  title: 'The Good Opal Co - Premium Australian Opal Jewelry',
  description: 'Discover authentic Australian opal jewelry including rings, necklaces, earrings and raw opals. Premium quality opals that don\'t cost the earth.',
}

export default function HomePage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <OrganizationJsonLd />
      <WebsiteJsonLd />

    <div className="flex flex-col bg-white">
      <Navigation
        logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
        items={[
          { href: '/store', label: 'Shop' },
          { href: '/blog', label: 'Blog' },
          { href: '/faq', label: 'FAQ' },
        ]}
        transparent
      />

      {/* Hero Section */}
      <HomeHero />

      {/* Trust Marquee */}
      <TrustMarquee />

      {/* Handmade in Australia with Image */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="px-6 lg:pl-12 order-2 lg:order-1">
              <span className="text-opal-electric text-sm font-semibold uppercase tracking-wider mb-4 block">Our Craft</span>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 text-charcoal leading-tight">
                Handmade in <span className="text-gradient-prismatic">Australia</span>
              </h2>
              <p className="text-lg md:text-xl text-charcoal/60 mb-8 leading-relaxed">
                We source all our materials directly from Australian opal miners and handcraft each piece from start to finish,
                offering our customers ethically sourced, eco-conscious Australian opals at an exceptional price.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/store">Shop Our Collection</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/blog">Our Story</Link>
                </Button>
              </div>
            </div>

            {/* Image Grid */}
            <div className="px-6 lg:pr-0 order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/20211104_234659-1-4.jpg"
                  alt="Vibrant Australian Opal"
                  className="rounded-2xl shadow-xl hover:shadow-glow object-cover w-full h-64 lg:h-80 transition-shadow duration-500"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/20220109_133519-3.jpg"
                  alt="Colorful Handcrafted Opals"
                  className="rounded-2xl shadow-xl hover:shadow-glow object-cover w-full h-64 lg:h-80 mt-12 transition-shadow duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Picks - DARK background for opal pop */}
      <section className="bg-black-rich py-20 md:py-28">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
              Shop <span className="text-gradient-prismatic">Picks</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Handpicked treasures from our collection
            </p>
          </div>
          <FeaturedProducts limit={4} featured={true} />
          <div className="text-center mt-12">
            <Button variant="glass" size="lg" asChild>
              <Link href="/store">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Selected Categories with Images */}
      <section className="py-20 md:py-24 bg-gray-whisper">
        <div className="max-w-screen-xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-charcoal">Selected Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {/* Raw Opals */}
            <Link
              href="/store?category=raw-opals"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-500"
            >
              <div className="aspect-square relative bg-black-rich">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/20210627_202327-3.jpg"
                  alt="Raw Australian Opals"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black-rich via-black-rich/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <h3 className="text-xl font-semibold text-white tracking-wide">OPALS</h3>
                </div>
              </div>
            </Link>

            {/* Earrings */}
            <Link
              href="/store"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-500"
            >
              <div className="aspect-square relative bg-black-rich">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/IMG_5903-3.jpg"
                  alt="Opal Earrings"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black-rich via-black-rich/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <h3 className="text-xl font-semibold text-white tracking-wide">EARRINGS</h3>
                </div>
              </div>
            </Link>

            {/* Rings */}
            <Link
              href="/store?category=opal-rings"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-500"
            >
              <div className="aspect-square relative bg-black-rich">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/20210819_102625-4.jpg"
                  alt="Opal Rings"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black-rich via-black-rich/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <h3 className="text-xl font-semibold text-white tracking-wide">RINGS</h3>
                </div>
              </div>
            </Link>

            {/* Services */}
            <Link
              href="/services"
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-opal-electric to-opal-deep shadow-lg hover:shadow-glow transition-all duration-500"
            >
              <div className="aspect-square relative flex flex-col items-center justify-center p-6">
                <svg className="w-16 h-16 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.586V5L7 4z" />
                </svg>
                <h3 className="text-xl font-semibold text-white text-center tracking-wide">SERVICES</h3>
              </div>
            </Link>

            {/* Courses */}
            <Link
              href="/courses"
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-fire-pink to-fire-coral shadow-lg hover:shadow-glow transition-all duration-500"
            >
              <div className="aspect-square relative flex flex-col items-center justify-center p-6">
                <svg className="w-16 h-16 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-semibold text-white text-center tracking-wide">COURSES</h3>
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
              <p className="text-lg md:text-xl text-charcoal/60 mb-8 leading-relaxed">
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
                    <p className="text-sm text-charcoal/60">1:1 design guidance</p>
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
                    <p className="text-sm text-charcoal/60">Choose your stone</p>
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
                    <p className="text-sm text-charcoal/60">Years of experience</p>
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
                    <p className="text-sm text-charcoal/60">Affordable luxury</p>
                  </div>
                </div>
              </div>

              <Button size="lg" asChild>
                <Link href="/contact">GET A QUOTE →</Link>
              </Button>
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
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-whisper">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-opal-electric text-sm font-semibold uppercase tracking-wider mb-4 block">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-charcoal">
              Customer <span className="text-gradient-prismatic">Reviews</span>
            </h2>
            <p className="text-lg text-charcoal/60 max-w-3xl mx-auto leading-relaxed">
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
              <p className="text-charcoal/80 mb-6 leading-relaxed">
                &ldquo;Absolutely stunning! The opal ring I ordered has the most incredible play of color - blues, greens, and flashes of red. It&apos;s even more beautiful in person than the photos. The craftsmanship is exceptional!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-blue to-opal-purple rounded-full flex items-center justify-center text-white font-bold text-lg">
                  E
                </div>
                <div>
                  <p className="font-bold text-charcoal">Emma Thompson</p>
                  <p className="text-sm text-charcoal/60">Melbourne, VIC</p>
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
              <p className="text-charcoal/80 mb-6 leading-relaxed">
                &ldquo;I took the opal cutting course and learned so much! Now I can spot quality opals and appreciate the skill involved. The hands-on experience was invaluable. Highly recommend!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-gold to-opal-pink rounded-full flex items-center justify-center text-white font-bold text-lg">
                  J
                </div>
                <div>
                  <p className="font-bold text-charcoal">James Wilson</p>
                  <p className="text-sm text-charcoal/60">Sydney, NSW</p>
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
              <p className="text-charcoal/80 mb-6 leading-relaxed">
                &ldquo;The custom engagement ring exceeded all expectations! They helped me design the perfect piece featuring a Lightning Ridge black opal. My fiancée cries every time she looks at it. Worth every cent!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-turquoise to-opal-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div>
                  <p className="font-bold text-charcoal">Marcus Chen</p>
                  <p className="text-sm text-charcoal/60">Brisbane, QLD</p>
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
              <p className="text-charcoal/80 mb-6 leading-relaxed">
                &ldquo;Fast shipping, beautiful packaging, and the opal earrings are gorgeous! The colors shift as I move - it&apos;s like wearing little rainbows. Great value for authentic Australian opals.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-pink to-opal-gold rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <p className="font-bold text-charcoal">Sophie Martin</p>
                  <p className="text-sm text-charcoal/60">Perth, WA</p>
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
              <p className="text-charcoal/80 mb-6 leading-relaxed">
                &ldquo;I&apos;ve been collecting opals for years and these are genuine, quality stones at fair prices. The descriptions are accurate and the customer service is excellent. Will definitely buy again!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-blue to-opal-turquoise rounded-full flex items-center justify-center text-white font-bold text-lg">
                  R
                </div>
                <div>
                  <p className="font-bold text-charcoal">Rachel Davies</p>
                  <p className="text-sm text-charcoal/60">Adelaide, SA</p>
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
              <p className="text-charcoal/80 mb-6 leading-relaxed">
                &ldquo;Bought a pendant as a gift for my mum - she absolutely loves it! The Coober Pedy opal has amazing color and the setting is beautifully crafted. Came with certificate of authenticity too.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-purple to-opal-pink rounded-full flex items-center justify-center text-white font-bold text-lg">
                  L
                </div>
                <div>
                  <p className="font-bold text-charcoal">Luke Anderson</p>
                  <p className="text-sm text-charcoal/60">Hobart, TAS</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/contact">CHAT TO US TODAY →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bundle and Save */}
      <section className="py-20 md:py-24 bg-black-rich">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            {/* Background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-opal-electric" />
              <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-fire-pink" />
            </div>
            <div className="relative z-10">
              <span className="text-opal-light text-sm font-semibold uppercase tracking-wider mb-4 block">Save More</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Bundle and <span className="text-gradient-prismatic">Save</span>
              </h2>
              <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
                Automatic discounts are applied to your order. The more items you add, the greater the discount on your total.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="shimmer" asChild>
                  <Link href="/store?category=opals">SHOP OPALS</Link>
                </Button>
                <Button size="lg" variant="glass" asChild>
                  <Link href="/store?category=jewellery">SHOP JEWELLERY</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-opal-electric text-sm font-semibold uppercase tracking-wider mb-4 block">Why Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal">The Good Opal <span className="text-gradient-prismatic">Promise</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Express Delivery */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-opal-electric to-opal-deep rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:shadow-glow transition-shadow duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-charcoal">Express Delivery</h3>
              <p className="text-charcoal/60">Free express delivery for a limited period.</p>
            </div>

            {/* Warranty */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-fire-pink to-fire-coral rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:shadow-glow transition-shadow duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-charcoal">1 Year Warranty</h3>
              <p className="text-charcoal/60">Free cleaning and polishing services on all jewellery.</p>
            </div>

            {/* Premium Packaging */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-opal-emerald to-opal-teal rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:shadow-glow transition-shadow duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-charcoal">Premium Packaging</h3>
              <p className="text-charcoal/60">Glass display boxes for opals, premium jewellery boxes with care kit.</p>
            </div>

            {/* Authenticity */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-fire-orange to-fire-gold rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:shadow-glow transition-shadow duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-charcoal">Certificate Included</h3>
              <p className="text-charcoal/60">Every piece comes with a certificate of authenticity.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  )
}
