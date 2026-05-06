import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { HomeHero } from '@/components/sections'
import { Navigation, Footer } from '@/components/navigation'
import { Container, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { PageTransition } from '@/components/layout/PageTransition'
import Link from 'next/link'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo'
import { Gem, Crown, Wrench, GraduationCap } from 'lucide-react'

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

const TrustMarquee = dynamic(
  () => import('@/components/sections').then((mod) => mod.TrustMarquee),
  {
    loading: () => <div className="h-20 animate-pulse bg-gray-50" />,
  }
)

export const metadata: Metadata = {
  title: 'The Good Opal Co - Premium Australian Opal Jewellery',
  description:
    "Discover authentic Australian opal jewellery including rings, necklaces, earrings and raw opals. Premium quality opals that don't cost the earth.",
}

export default function HomePage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      <PageTransition>
        <div className="min-h-screen flex flex-col bg-white">
          <Navigation
            logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
            items={[
              { href: '/store', label: 'Shop' },
              { href: '/blog', label: 'Blog' },
              { href: '/courses', label: 'Courses' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
              { href: '/faq', label: 'FAQ' },
            ]}
            transparent
          />

          <main id="main-content" tabIndex={-1}>
          {/* Hero Section */}
          <HomeHero />

          {/* Shop by Category */}
          <Section className="relative bg-gradient-to-br from-slate-50 via-white to-opal-electric/5 overflow-hidden py-16 lg:py-24">
            <Container>
              <div className="mb-14 text-center max-w-5xl mx-auto">
                <span className="mb-4 block font-serif text-base font-semibold text-opal-electric">
                  Discover Our Collection
                </span>
                <h2 className="mb-6 font-serif text-4xl font-semibold leading-tight text-charcoal md:text-5xl lg:text-6xl">
                  Shop by <span className="text-opal-electric">Category</span>
                </h2>
                <p className="mx-auto max-w-3xl text-xl text-charcoal/70 leading-relaxed">
                  Explore our curated collection of Australian opals, from raw stones to exquisite jewellery pieces
                </p>
                <p className="mt-3 font-serif text-base italic text-opal-electric/80">
                  Each piece tells its own story.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-5">
                {/* Raw Opals */}
                <Link
                  href="/store?category=raw-opals"
                  className="group relative overflow-hidden rounded-xl border border-warm-grey/30 bg-white shadow-sm transition-colors duration-200 hover:border-opal-electric-accessible/30"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-charcoal to-gray-800">
                    <OptimizedImage
                      src="/api/media/file/20210627_202327-3.jpg"
                      alt="Raw Australian Opals"
                      className="opacity-90 transition-opacity duration-300 group-hover:opacity-95"
                      aspectRatio="1:1"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      priority
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Gem className="w-6 h-6 text-white/80" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                      <h3 className="mb-1.5 font-serif text-xl font-semibold text-white">Raw Opals</h3>
                      <span className="text-sm font-medium text-white/90">Uncut Gems</span>
                    </div>
                  </div>
                </Link>

                {/* Earrings */}
                <Link
                  href="/store?category=earrings"
                  className="group relative overflow-hidden rounded-xl border border-warm-grey/30 bg-white shadow-sm transition-colors duration-200 hover:border-opal-electric-accessible/30"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-charcoal to-gray-800">
                    <OptimizedImage
                      src="/api/media/file/IMG_5903-3.jpg"
                      alt="Opal Earrings"
                      className="opacity-90 transition-opacity duration-300 group-hover:opacity-95"
                      aspectRatio="1:1"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Gem className="w-6 h-6 text-white/80" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                      <h3 className="mb-1.5 font-serif text-xl font-semibold text-white">Earrings</h3>
                      <span className="text-sm font-medium text-white/90">Handcrafted</span>
                    </div>
                  </div>
                </Link>

                {/* Rings */}
                <Link
                  href="/store?category=opal-rings"
                  className="group relative overflow-hidden rounded-xl border border-warm-grey/30 bg-white shadow-sm transition-colors duration-200 hover:border-opal-electric-accessible/30"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-charcoal to-gray-800">
                    <OptimizedImage
                      src="/api/media/file/20210819_102625-4.jpg"
                      alt="Opal Rings"
                      className="opacity-90 transition-opacity duration-300 group-hover:opacity-95"
                      aspectRatio="1:1"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Crown className="w-6 h-6 text-white/80" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                      <h3 className="mb-1.5 font-serif text-xl font-semibold text-white">Rings</h3>
                      <span className="text-sm font-medium text-white/90">Unique Designs</span>
                    </div>
                  </div>
                </Link>

                {/* Services */}
                <Link
                  href="/services"
                  className="group relative overflow-hidden rounded-xl border border-warm-grey/30 bg-opal-electric-accessible shadow-sm transition-colors duration-200 hover:bg-opal-deep"
                >
                  <div className="relative flex aspect-square flex-col items-center justify-center p-6">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 transition-colors duration-300 group-hover:bg-white/20">
                      <Wrench className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mb-1.5 text-center font-serif text-xl font-semibold text-white">
                      Services
                    </h3>
                    <span className="text-sm font-medium text-white/90">Repairs & Custom</span>
                  </div>
                </Link>

                {/* Courses */}
                <Link
                  href="/courses"
                  className="group relative overflow-hidden rounded-xl border border-warm-grey/30 bg-fire-pink-dark shadow-sm transition-colors duration-200 hover:bg-fire-coral"
                >
                  <div className="relative flex aspect-square flex-col items-center justify-center p-6">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 transition-colors duration-300 group-hover:bg-white/20">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mb-1.5 text-center font-serif text-xl font-semibold text-white">
                      Courses
                    </h3>
                    <span className="text-sm font-medium text-white/90">Learn Opal Cutting</span>
                  </div>
                </Link>
              </div>
            </Container>
          </Section>

          {/* Trust Marquee */}
          <TrustMarquee />

          {/* Latest Arrivals */}
          <Section className="relative overflow-hidden bg-charcoal-dark py-24 lg:py-32">
            <Container className="relative z-10">
              <div className="mb-14 text-center max-w-5xl mx-auto">
                <span className="mb-4 block font-serif text-base font-semibold text-opal-light">
                  Newly finished pieces from the workshop.
                </span>
                <h2 className="mb-6 font-serif text-4xl font-semibold text-white md:text-5xl lg:text-6xl">
                  Latest <span className="text-opal-light">Arrivals</span>
                </h2>
                <p className="mx-auto max-w-3xl text-xl text-white/80 font-light leading-relaxed">
                  Discover new pieces with colour, provenance, and everyday wearability.
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
                  className="group px-10 py-6 text-lg bg-white text-charcoal shadow-sm transition-colors duration-300 hover:bg-cream"
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
            </Container>
          </Section>

          {/* Handmade in Australia */}
          <Section className="overflow-hidden bg-white py-16 lg:py-24">
            <Container className="max-w-screen-2xl">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                {/* Content */}
                <div className="order-2 lg:order-1 lg:pl-12">
                  <span className="mb-4 block font-serif text-base font-semibold text-opal-electric">
                    Our Craft
                  </span>
                  <h2 className="mb-6 font-serif text-4xl font-semibold leading-tight text-charcoal md:text-5xl lg:text-6xl">
                    Handmade in <span className="text-opal-electric">Australia</span>
                  </h2>
                  <p className="mb-6 text-lg leading-relaxed text-charcoal/70 md:text-xl">
                    We source all our materials directly from Australian opal miners and handcraft
                    each piece from start to finish, offering our customers ethically sourced,
                    eco-conscious Australian opals at an exceptional price.
                  </p>
                  <p className="mb-8 font-serif text-base italic text-opal-electric/80">
                    From the earth to your heart.
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
                <div className="order-1 lg:order-2 lg:pr-0">
                  <div className="grid grid-cols-2 gap-4">
                    <OptimizedImage
                      src="/api/media/file/20211104_234659-1-4.jpg"
                      alt="Vibrant Australian Opal"
                      aspectRatio="4:3"
                      className="rounded-xl border border-warm-grey/30 shadow-sm transition-opacity duration-300 hover:opacity-95"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="mt-12">
                      <OptimizedImage
                        src="/api/media/file/20220109_133519-3.jpg"
                        alt="Colorful Handcrafted Opals"
                        aspectRatio="4:3"
                        className="rounded-xl border border-warm-grey/30 shadow-sm transition-opacity duration-300 hover:opacity-95"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </Section>

          {/* Customer Testimonials Section - Temporarily Disabled */}
          {/*
            Testimonials section removed to comply with Australian Consumer Law.
            Fake customer reviews are illegal and can result in significant penalties.
            Replace with genuine customer reviews from Payload CMS when available.
          */}

          {/* Trust Badges / Promise Section */}
          <section className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20 md:py-24 overflow-hidden">
            <div className="relative mx-auto max-w-screen-xl px-6">
              <div className="mb-16 text-center">
                <span className="mb-6 inline-flex items-center gap-3 text-sm font-semibold uppercase text-opal-electric-accessible">
                  <span className="h-0.5 w-16 rounded-full bg-opal-electric-accessible/35"></span>
                  Our Commitment
                  <span className="h-0.5 w-16 rounded-full bg-opal-electric-accessible/35"></span>
                </span>
                <h2 className="mb-6 font-serif text-4xl font-semibold text-charcoal md:text-5xl lg:text-6xl">
                  The Good Opal <span className="text-opal-electric">Promise</span>
                </h2>
                <p className="mx-auto max-w-3xl text-xl text-charcoal/70 font-light">
                  Every order includes practical support before and after purchase.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {/* Express Delivery */}
                <div className="group relative">
                  <div className="relative h-full rounded-xl border border-warm-grey/30 bg-white p-8 text-center shadow-sm transition-colors duration-200 hover:border-opal-electric-accessible/25">
                    <div className="relative mb-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-opal-electric-accessible shadow-sm transition-colors duration-300 group-hover:bg-opal-deep">
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
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-fire-pink-dark shadow-sm">
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
                    <div className="mt-4 text-xs font-semibold uppercase text-opal-electric-accessible">
                      2-3 Business Days
                    </div>
                  </div>
                </div>

                {/* Warranty */}
                <div className="group relative">
                  <div className="relative h-full rounded-xl border border-warm-grey/30 bg-white p-8 text-center shadow-sm transition-colors duration-200 hover:border-fire-pink/25">
                    <div className="relative mb-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-fire-pink-dark shadow-sm transition-colors duration-300 group-hover:bg-fire-coral">
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
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-opal-electric-accessible shadow-sm">
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
                    <div className="mt-4 text-xs font-semibold uppercase text-fire-pink-dark">
                      Peace of Mind
                    </div>
                  </div>
                </div>

                {/* Premium Packaging */}
                <div className="group relative">
                  <div className="relative h-full rounded-xl border border-warm-grey/30 bg-white p-8 text-center shadow-sm transition-colors duration-200 hover:border-opal-emerald/25">
                    <div className="relative mb-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-opal-emerald-dark shadow-sm transition-colors duration-300 group-hover:bg-opal-emerald">
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
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-fire-orange shadow-sm">
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
                    <div className="mt-4 text-xs font-semibold uppercase text-opal-emerald-dark">
                      Gift Ready
                    </div>
                  </div>
                </div>

                {/* Authenticity */}
                <div className="group relative">
                  <div className="relative h-full rounded-xl border border-warm-grey/30 bg-white p-8 text-center shadow-sm transition-colors duration-200 hover:border-fire-gold/30">
                    <div className="relative mb-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-fire-orange shadow-sm transition-colors duration-300 group-hover:bg-fire-gold">
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
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-opal-electric-accessible shadow-sm">
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
                    <div className="mt-4 text-xs font-semibold uppercase text-fire-orange">
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
      </PageTransition>
    </>
  )
}
