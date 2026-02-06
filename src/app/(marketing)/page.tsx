import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { HomeHero, TrustMarquee } from '@/components/sections'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo'

// Lazy load heavy components
const FeaturedProducts = dynamic(
  () => import('@/components/sections').then(mod => mod.FeaturedProducts),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-gray-200 rounded-lg" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: true,
  }
)

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

      <main id="main-content" tabIndex={-1}>
        {/* Hero Section */}
        <HomeHero />

      {/* Trust Marquee */}
      <TrustMarquee />

      {/* Handmade in Australia with Image */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="px-6 lg:pl-12 order-2 lg:order-1">
              <span className="text-opal-electric-accessible text-sm font-semibold uppercase tracking-wider mb-4 block">Our Craft</span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-content-inverse leading-tight">
                Handmade in <span className="text-gradient-prismatic">Australia</span>
              </h2>
              <p className="text-lg md:text-xl text-content-muted mb-8 leading-relaxed">
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
                <OptimizedImage
                  src="/api/media/file/20211104_234659-1-4.jpg"
                  alt="Vibrant Australian Opal"
                  aspectRatio="4:3"
                  className="rounded-2xl shadow-xl hover:shadow-glow transition-shadow duration-300"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
                <div className="mt-12">
                  <OptimizedImage
                    src="/api/media/file/20220109_133519-3.jpg"
                    alt="Colorful Handcrafted Opals"
                    aspectRatio="4:3"
                    className="rounded-2xl shadow-xl hover:shadow-glow transition-shadow duration-300"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Selected Categories with Images */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-opal-electric-accessible text-sm font-semibold uppercase tracking-wider mb-4 block">Browse</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-content-inverse mb-4 leading-tight">Shop by <span className="text-gradient-prismatic">Category</span></h2>
            <p className="text-lg text-content-muted max-w-2xl mx-auto">
              Explore our collection of loose opals, handcrafted jewelry, and expert services
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
            {/* Raw Opals */}
            <Link
              href="/store?category=raw-opals"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square relative bg-surface-primary">
                <OptimizedImage
                  src="/api/media/file/20210627_202327-3.jpg"
                  alt="Raw Australian Opals"
                  className="opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                  aspectRatio="1:1"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-primary via-surface-overlay to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                  <h3 className="text-lg font-bold text-content-primary tracking-wide mb-1">OPALS</h3>
                  <span className="text-xs text-content-secondary font-medium">Loose Stones</span>
                </div>
              </div>
            </Link>

            {/* Earrings */}
            <Link
              href="/store"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square relative bg-surface-primary">
                <OptimizedImage
                  src="/api/media/file/IMG_5903-3.jpg"
                  alt="Opal Earrings"
                  className="opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                  aspectRatio="1:1"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-primary via-surface-overlay to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                  <h3 className="text-lg font-bold text-content-primary tracking-wide mb-1">EARRINGS</h3>
                  <span className="text-xs text-content-secondary font-medium">Handcrafted</span>
                </div>
              </div>
            </Link>

            {/* Rings */}
            <Link
              href="/store?category=opal-rings"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square relative bg-surface-primary">
                <OptimizedImage
                  src="/api/media/file/20210819_102625-4.jpg"
                  alt="Opal Rings"
                  className="opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                  aspectRatio="1:1"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-primary via-surface-overlay to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                  <h3 className="text-lg font-bold text-content-primary tracking-wide mb-1">RINGS</h3>
                  <span className="text-xs text-content-secondary font-medium">One-of-a-Kind</span>
                </div>
              </div>
            </Link>

            {/* Services */}
            <Link
              href="/services"
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-opal-electric to-opal-deep shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square relative flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.586V5L7 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white text-center tracking-wide mb-1">SERVICES</h3>
                <span className="text-xs text-content-secondary font-medium">Repairs & Custom</span>
              </div>
            </Link>

            {/* Courses */}
            <Link
              href="/courses"
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-fire-pink to-fire-coral shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square relative flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white text-center tracking-wide mb-1">COURSES</h3>
                <span className="text-xs text-content-secondary font-medium">Learn Opal Cutting</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Arrivals - Dark background for opal pop */}
      <section className="bg-black-rich py-20 md:py-32 relative overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-opal-electric/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fire-pink/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-screen-xl mx-auto px-6 relative z-10">
          <FeaturedProducts
            title="Latest Arrivals"
            description="Fresh from our workshop - new opals and jewelry pieces"
            limit={4}
            featured={false}
            variant="dark"
          />
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-white text-white hover:bg-white hover:text-black-rich font-semibold transition-all"
            >
              <Link href="/store">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Customs Section with Image Gallery */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-content-inverse leading-tight">
                Custom Creations
              </h2>
              <p className="text-lg md:text-xl text-content-muted mb-8 leading-relaxed">
                Turn the opal of your dreams into a one-of-a-kind treasure, crafted to last a lifetime.
                Our custom jewellery is designed to be both affordable and uniquely yours.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-opal-electric rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-content-inverse">Personal Consultation</p>
                    <p className="text-sm text-content-muted">1:1 design guidance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-opal-electric rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-content-inverse">Hand-Selected Opals</p>
                    <p className="text-sm text-content-muted">Choose your stone</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-opal-electric rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-content-inverse">Expert Craftsmanship</p>
                    <p className="text-sm text-content-muted">Years of experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-opal-electric rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-content-inverse">Fair Pricing</p>
                    <p className="text-sm text-content-muted">Affordable luxury</p>
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
                <div className="col-span-2">
                  <OptimizedImage
                    src="/api/media/file/20210819_102625-4.jpg"
                    alt="Custom Aurora Opal Ring"
                    aspectRatio="16:9"
                    className="rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {/* Small Images - More Custom Rings */}
                <OptimizedImage
                  src="/api/media/file/20210819_102749-7.jpg"
                  alt="Sun and Moon Opal Ring"
                  aspectRatio="4:3"
                  className="rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <OptimizedImage
                  src="/api/media/file/20210819_101509-7.jpg"
                  alt="Coral Opal Ring"
                  aspectRatio="4:3"
                  className="rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-section-bottom md:py-section-top bg-gradient-to-b from-surface-tertiary to-surface-secondary">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-opal-electric-accessible text-sm font-semibold uppercase tracking-wider mb-4 block">Testimonials</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-content-inverse">
              Customer <span className="text-gradient-prismatic">Reviews</span>
            </h2>
            <p className="text-lg text-content-muted max-w-3xl mx-auto leading-relaxed">
              Everything we create is done with care, from start to finish. From ethically sourcing our rough materials
              to intricately crafting opals and jewellery for their forever homes, every step matters to us.
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Review 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-content-muted mb-6 leading-relaxed">
                &ldquo;Absolutely stunning! The opal ring I ordered has the most incredible play of color - blues, greens, and flashes of red. It&apos;s even more beautiful in person than the photos. The craftsmanship is exceptional!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-electric to-fire-pink rounded-full flex items-center justify-center text-white font-bold text-lg">
                  E
                </div>
                <div>
                  <p className="font-bold text-content-inverse">Emma Thompson</p>
                  <p className="text-sm text-content-muted">Melbourne, VIC</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-content-muted mb-6 leading-relaxed">
                &ldquo;I took the opal cutting course and learned so much! Now I can spot quality opals and appreciate the skill involved. The hands-on experience was invaluable. Highly recommend!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-gold to-opal-pink rounded-full flex items-center justify-center text-white font-bold text-lg">
                  J
                </div>
                <div>
                  <p className="font-bold text-content-inverse">James Wilson</p>
                  <p className="text-sm text-content-muted">Sydney, NSW</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-content-muted mb-6 leading-relaxed">
                &ldquo;The custom engagement ring exceeded all expectations! They helped me design the perfect piece featuring a Lightning Ridge black opal. My fiancée cries every time she looks at it. Worth every cent!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-turquoise to-opal-electric rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div>
                  <p className="font-bold text-content-inverse">Marcus Chen</p>
                  <p className="text-sm text-content-muted">Brisbane, QLD</p>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-content-muted mb-6 leading-relaxed">
                &ldquo;Fast shipping, beautiful packaging, and the opal earrings are gorgeous! The colors shift as I move - it&apos;s like wearing little rainbows. Great value for authentic Australian opals.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-pink to-opal-gold rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <p className="font-bold text-content-inverse">Sophie Martin</p>
                  <p className="text-sm text-content-muted">Perth, WA</p>
                </div>
              </div>
            </div>

            {/* Review 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-content-muted mb-6 leading-relaxed">
                &ldquo;I&apos;ve been collecting opals for years and these are genuine, quality stones at fair prices. The descriptions are accurate and the customer service is excellent. Will definitely buy again!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-electric to-opal-turquoise rounded-full flex items-center justify-center text-white font-bold text-lg">
                  R
                </div>
                <div>
                  <p className="font-bold text-content-inverse">Rachel Davies</p>
                  <p className="text-sm text-content-muted">Adelaide, SA</p>
                </div>
              </div>
            </div>

            {/* Review 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 border border-warm-grey">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-opal-gold fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-content-muted mb-6 leading-relaxed">
                &ldquo;Bought a pendant as a gift for my mum - she absolutely loves it! The Coober Pedy opal has amazing color and the setting is beautifully crafted. Came with certificate of authenticity too.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-opal-purple to-opal-pink rounded-full flex items-center justify-center text-white font-bold text-lg">
                  L
                </div>
                <div>
                  <p className="font-bold text-content-inverse">Luke Anderson</p>
                  <p className="text-sm text-content-muted">Hobart, TAS</p>
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
      <section className="py-section-bottom md:py-4xl bg-surface-primary">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            {/* Background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-opal-electric" />
              <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full rounded-full opacity-20 blur-3xl bg-fire-pink" />
            </div>
            <div className="relative z-10">
              <span className="text-opal-deep text-sm font-semibold uppercase tracking-wider mb-4 block">Save More</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
                Bundle and <span className="text-gradient-prismatic">Save</span>
              </h2>
              <p className="text-lg md:text-xl text-content-secondary max-w-3xl mx-auto mb-10 leading-relaxed">
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

      {/* Trust Badges / Promise Section - Improved Design */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-whisper to-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-opal-electric-accessible text-sm font-semibold uppercase tracking-wider mb-6">
              <span className="w-12 h-px bg-opal-electric-accessible"></span>
              Why Choose Us
              <span className="w-12 h-px bg-opal-electric-accessible"></span>
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal mb-6">
              The Good Opal Promise
            </h2>
            <p className="text-lg md:text-xl text-content-muted max-w-3xl mx-auto leading-relaxed">
              Quality, authenticity, and exceptional care in every piece. When you choose The Good Opal Co,
              you're not just buying jewelry – you're investing in a lifetime treasure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Express Delivery */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-opal-electric to-opal-deep rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl"></div>
              <div className="relative bg-white rounded-2xl p-8 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-200 border border-gray-200">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-opal-electric to-opal-deep rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-fire-pink rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✦</span>
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-charcoal">Express Delivery</h3>
                <p className="text-sm text-content-muted leading-relaxed">
                  Free express shipping Australia-wide. Limited time offer.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-opal-electric-accessible">2-3 Business Days</p>
                </div>
              </div>
            </div>

            {/* Warranty */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-fire-pink to-fire-coral rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl"></div>
              <div className="relative bg-white rounded-2xl p-8 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-200 border border-gray-200">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-fire-pink to-fire-coral rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-opal-electric rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-charcoal">1 Year Warranty</h3>
                <p className="text-sm text-content-muted leading-relaxed">
                  Comprehensive warranty with free cleaning & polishing service.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-fire-pink-dark">Peace of Mind</p>
                </div>
              </div>
            </div>

            {/* Premium Packaging */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-opal-emerald to-opal-teal rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl"></div>
              <div className="relative bg-white rounded-2xl p-8 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-200 border border-gray-200">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-opal-emerald to-opal-teal rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-fire-gold rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">♦</span>
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-charcoal">Premium Packaging</h3>
                <p className="text-sm text-content-muted leading-relaxed">
                  Luxury gift box, care kit & polishing cloth included.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-opal-emerald-dark">Ready to Gift</p>
                </div>
              </div>
            </div>

            {/* Authenticity */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-fire-orange to-fire-gold rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl"></div>
              <div className="relative bg-white rounded-2xl p-8 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-200 border border-gray-200">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-fire-orange to-fire-gold rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-opal-deep rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-charcoal">100% Authentic</h3>
                <p className="text-sm text-content-muted leading-relaxed">
                  Certificate of authenticity with every opal purchase.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-fire-orange">Guaranteed Genuine</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional trust element */}
          <div className="mt-16 text-center">
            <p className="text-sm text-content-muted">
              <span className="font-semibold text-charcoal">Trusted by 10,000+</span> opal lovers across Australia and worldwide
            </p>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
    </>
  )
}
