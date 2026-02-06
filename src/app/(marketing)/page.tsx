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
  () => import('@/components/sections').then((mod) => mod.FeaturedProducts),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="mx-auto mb-4 h-8 w-48 rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square rounded-lg bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
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
  description:
    "Discover authentic Australian opal jewelry including rings, necklaces, earrings and raw opals. Premium quality opals that don't cost the earth.",
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

          {/* Shop by Category - Beautiful grid immediately after hero */}
          <section className="relative bg-gradient-to-b from-white to-gray-50 py-20 md:py-24 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-opal-electric/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-fire-pink/5 blur-3xl" />

            <div className="relative mx-auto max-w-screen-xl px-6">
              <div className="mb-14 text-center">
                <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-opal-electric">
                  <span className="h-px w-12 bg-opal-electric"></span>
                  Browse Collection
                  <span className="h-px w-12 bg-opal-electric"></span>
                </span>
                <h2 className="mb-6 font-serif text-4xl font-bold leading-tight text-charcoal md:text-5xl lg:text-6xl">
                  Shop by <span className="text-gradient-prismatic">Category</span>
                </h2>
                <p className="mx-auto max-w-3xl text-xl text-charcoal/70">
                  Explore our curated collection of Australian opals, from raw stones to exquisite jewelry pieces
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-5">
                {/* Raw Opals */}
                <Link
                  href="/store?category=raw-opals"
                  className="group relative overflow-hidden rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-charcoal to-gray-800">
                    <OptimizedImage
                      src="/api/media/file/20210627_202327-3.jpg"
                      alt="Raw Australian Opals"
                      className="opacity-90 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
                      aspectRatio="1:1"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                      <h3 className="mb-1.5 text-xl font-bold tracking-wide text-white">RAW OPALS</h3>
                      <span className="text-sm font-medium text-white/90">Uncut Gems</span>
                    </div>
                  </div>
                </Link>

                {/* Earrings */}
                <Link
                  href="/store"
                  className="group relative overflow-hidden rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-charcoal to-gray-800">
                    <OptimizedImage
                      src="/api/media/file/IMG_5903-3.jpg"
                      alt="Opal Earrings"
                      className="opacity-90 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
                      aspectRatio="1:1"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                      <h3 className="mb-1.5 text-xl font-bold tracking-wide text-white">EARRINGS</h3>
                      <span className="text-sm font-medium text-white/90">Handcrafted</span>
                    </div>
                  </div>
                </Link>

                {/* Rings */}
                <Link
                  href="/store?category=opal-rings"
                  className="group relative overflow-hidden rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-charcoal to-gray-800">
                    <OptimizedImage
                      src="/api/media/file/20210819_102625-4.jpg"
                      alt="Opal Rings"
                      className="opacity-90 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
                      aspectRatio="1:1"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                      <h3 className="mb-1.5 text-xl font-bold tracking-wide text-white">RINGS</h3>
                      <span className="text-sm font-medium text-white/90">Unique Designs</span>
                    </div>
                  </div>
                </Link>

                {/* Services */}
                <Link
                  href="/services"
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-opal-electric to-opal-deep shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative flex aspect-square flex-col items-center justify-center p-6">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.586V5L7 4z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-1.5 text-center text-xl font-bold tracking-wide text-white">
                      SERVICES
                    </h3>
                    <span className="text-sm font-medium text-white/90">Repairs & Custom</span>
                  </div>
                </Link>

                {/* Courses */}
                <Link
                  href="/courses"
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-fire-pink to-fire-coral shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative flex aspect-square flex-col items-center justify-center p-6">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-1.5 text-center text-xl font-bold tracking-wide text-white">
                      COURSES
                    </h3>
                    <span className="text-sm font-medium text-white/90">Learn Opal Cutting</span>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* Trust Marquee */}
          <TrustMarquee />

          {/* Latest Arrivals - Premium dark section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-black-rich via-gray-900 to-black-rich py-20 md:py-24">
            {/* Enhanced background effects */}
            <div className="absolute inset-0">
              <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-opal-electric/20 to-opal-deep/10 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-fire-pink/15 to-fire-coral/10 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[800px] rounded-full bg-gradient-to-r from-opal-turquoise/10 to-opal-emerald/10 blur-3xl" />
            </div>

            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`
              }} />
            </div>

            <div className="relative z-10 mx-auto max-w-screen-xl px-6">
              <div className="mb-14 text-center">
                <span className="mb-6 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-opal-electric to-fire-pink">
                  <span className="h-px w-16 bg-gradient-to-r from-transparent to-opal-electric"></span>
                  New & Exclusive
                  <span className="h-px w-16 bg-gradient-to-l from-transparent to-fire-pink"></span>
                </span>
                <h2 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl lg:text-7xl">
                  Latest <span className="text-gradient-prismatic">Arrivals</span>
                </h2>
                <p className="mx-auto max-w-3xl text-xl text-white/80 font-light">
                  Fresh from our workshop - discover new masterpieces crafted with passion
                </p>
              </div>

              <FeaturedProducts
                hideTitle={true}
                limit={4}
                featured={false}
                variant="dark"
              />

              <div className="mt-12 text-center">
                <Button
                  size="xl"
                  className="group px-10 py-6 text-lg bg-gradient-to-r from-white to-gray-100 text-black-rich hover:from-gray-100 hover:to-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/store">
                    Explore New Collection
                    <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Handmade in Australia */}
          <section className="overflow-hidden bg-white py-16 md:py-20">
            <div className="mx-auto max-w-screen-2xl">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                {/* Content */}
                <div className="order-2 px-6 lg:order-1 lg:pl-12">
                  <span className="mb-4 block text-sm font-semibold uppercase tracking-wider text-opal-electric">
                    Our Craft
                  </span>
                  <h2 className="mb-6 font-serif text-4xl font-bold leading-tight text-charcoal md:text-5xl lg:text-6xl">
                    Handmade in <span className="text-gradient-prismatic">Australia</span>
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-charcoal/70 md:text-xl">
                    We source all our materials directly from Australian opal miners and handcraft
                    each piece from start to finish, offering our customers ethically sourced,
                    eco-conscious Australian opals at an exceptional price.
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
                <div className="order-1 px-6 lg:order-2 lg:pr-0">
                  <div className="grid grid-cols-2 gap-4">
                    <OptimizedImage
                      src="/api/media/file/20211104_234659-1-4.jpg"
                      alt="Vibrant Australian Opal"
                      aspectRatio="4:3"
                      className="hover:shadow-glow rounded-2xl shadow-xl transition-shadow duration-300"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="mt-12">
                      <OptimizedImage
                        src="/api/media/file/20220109_133519-3.jpg"
                        alt="Colorful Handcrafted Opals"
                        aspectRatio="4:3"
                        className="hover:shadow-glow rounded-2xl shadow-xl transition-shadow duration-300"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Reviews - Streamlined */}
          <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-20">
            <div className="mx-auto max-w-screen-xl px-6">
              <div className="mb-10 text-center">
                <span className="mb-4 block text-sm font-semibold uppercase tracking-wider text-opal-electric">
                  Testimonials
                </span>
                <h2 className="mb-4 font-serif text-3xl font-bold text-charcoal md:text-4xl lg:text-5xl">
                  Customer <span className="text-gradient-prismatic">Reviews</span>
                </h2>
                <p className="mx-auto max-w-3xl text-lg text-charcoal/70">
                  Trusted by thousands of opal lovers worldwide
                </p>
              </div>

              {/* Reviews Grid - Show only top 3 */}
              <div className="mb-10 grid gap-6 md:grid-cols-3">
                {/* Review 1 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-xl">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 fill-current text-opal-gold"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-charcoal/70">
                    &ldquo;Absolutely stunning! The opal ring I ordered has the most incredible play
                    of color - blues, greens, and flashes of red. It&apos;s even more beautiful in
                    person than the photos. The craftsmanship is exceptional!&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-opal-electric to-fire-pink text-lg font-bold text-white">
                      E
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">Emma Thompson</p>
                      <p className="text-sm text-charcoal/60">Melbourne, VIC</p>
                    </div>
                  </div>
                </div>

                {/* Review 2 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-xl">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 fill-current text-opal-gold"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-charcoal/70">
                    &ldquo;The custom engagement ring exceeded all expectations! They helped me
                    design the perfect piece featuring a Lightning Ridge black opal. My fiancée
                    cries every time she looks at it. Worth every cent!&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-opal-turquoise to-opal-electric text-lg font-bold text-white">
                      M
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">Marcus Chen</p>
                      <p className="text-sm text-charcoal/60">Brisbane, QLD</p>
                    </div>
                  </div>
                </div>

                {/* Review 3 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-xl">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 fill-current text-opal-gold"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-charcoal/70">
                    &ldquo;Fast shipping, beautiful packaging, and the opal earrings are gorgeous!
                    The colors shift as I move - it&apos;s like wearing little rainbows. Great value
                    for authentic Australian opals.&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-opal-pink to-opal-gold text-lg font-bold text-white">
                      S
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">Sophie Martin</p>
                      <p className="text-sm text-charcoal/60">Perth, WA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Badges / Promise Section - Premium design */}
          <section className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20 md:py-24 overflow-hidden">
            {/* Subtle decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-opal-electric/5 blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-fire-pink/5 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-screen-xl px-6">
              <div className="mb-16 text-center">
                <span className="mb-6 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-opal-electric via-fire-pink to-opal-deep">
                  <span className="h-0.5 w-16 bg-gradient-to-r from-transparent to-opal-electric rounded-full"></span>
                  Our Commitment
                  <span className="h-0.5 w-16 bg-gradient-to-l from-transparent to-opal-deep rounded-full"></span>
                </span>
                <h2 className="mb-6 font-serif text-5xl font-extrabold text-charcoal md:text-6xl lg:text-7xl">
                  The Good Opal <span className="text-gradient-prismatic">Promise</span>
                </h2>
                <p className="mx-auto max-w-3xl text-xl text-charcoal/70 font-light">
                  Every purchase comes with our guarantee of excellence
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {/* Express Delivery */}
                <div className="group relative">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-opal-electric to-opal-deep opacity-0 blur-xl transition-all duration-300 group-hover:opacity-75"></div>
                  <div className="relative h-full transform rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:border-opal-electric/20">
                    <div className="relative mb-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-opal-electric to-opal-deep shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="h-10 w-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-fire-pink to-fire-coral flex items-center justify-center shadow-lg">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-serif mb-3 text-2xl font-bold text-charcoal">
                      Express Delivery
                    </h3>
                    <p className="text-base leading-relaxed text-charcoal/60 font-light">
                      Free express shipping on all Australian orders
                    </p>
                    <div className="mt-4 text-xs font-semibold tracking-wider text-opal-electric uppercase">
                      2-3 Business Days
                    </div>
                  </div>
                </div>

                {/* Warranty */}
                <div className="group relative">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-fire-pink to-fire-coral opacity-0 blur-xl transition-all duration-300 group-hover:opacity-75"></div>
                  <div className="relative h-full transform rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:border-fire-pink/20">
                    <div className="relative mb-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fire-pink to-fire-coral shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="h-10 w-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-opal-electric to-opal-deep flex items-center justify-center shadow-lg">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-serif mb-3 text-2xl font-bold text-charcoal">
                      1 Year Warranty
                    </h3>
                    <p className="text-base leading-relaxed text-charcoal/60 font-light">
                      Comprehensive warranty & professional cleaning service
                    </p>
                    <div className="mt-4 text-xs font-semibold tracking-wider text-fire-pink uppercase">
                      Peace of Mind
                    </div>
                  </div>
                </div>

                {/* Premium Packaging */}
                <div className="group relative">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-opal-emerald to-opal-teal opacity-0 blur-xl transition-all duration-300 group-hover:opacity-75"></div>
                  <div className="relative h-full transform rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:border-opal-emerald/20">
                    <div className="relative mb-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-opal-emerald to-opal-teal shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="h-10 w-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-fire-gold to-fire-orange flex items-center justify-center shadow-lg">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-serif mb-3 text-2xl font-bold text-charcoal">
                      Premium Packaging
                    </h3>
                    <p className="text-base leading-relaxed text-charcoal/60 font-light">
                      Luxury gift box with opal care kit included
                    </p>
                    <div className="mt-4 text-xs font-semibold tracking-wider text-opal-emerald uppercase">
                      Gift Ready
                    </div>
                  </div>
                </div>

                {/* Authenticity */}
                <div className="group relative">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-fire-orange to-fire-gold opacity-0 blur-xl transition-all duration-300 group-hover:opacity-75"></div>
                  <div className="relative h-full transform rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:border-fire-gold/20">
                    <div className="relative mb-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fire-orange to-fire-gold shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="h-10 w-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-opal-deep to-opal-electric flex items-center justify-center shadow-lg">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-serif mb-3 text-2xl font-bold text-charcoal">
                      100% Authentic
                    </h3>
                    <p className="text-base leading-relaxed text-charcoal/60 font-light">
                      Certificate of authenticity with every purchase
                    </p>
                    <div className="mt-4 text-xs font-semibold tracking-wider text-fire-gold uppercase">
                      Guaranteed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
