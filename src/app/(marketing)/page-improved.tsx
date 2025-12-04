import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { HomeHero, TrustMarquee } from '@/components/sections'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo'
import { Container } from '@/components/layout'
import { PageTransition } from '@/components/layout/PageTransition'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Heart, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductGridSkeleton } from '@/components/ui/LoadingStates'

// Lazy load heavy components
const FeaturedProducts = dynamic(
  () => import('@/components/sections').then(mod => mod.FeaturedProducts),
  {
    loading: () => <ProductGridSkeleton count={4} />,
    ssr: true,
  }
)

export const metadata: Metadata = {
  title: 'The Good Opal Co - Premium Australian Opal Jewelry',
  description: 'Discover authentic Australian opal jewelry including rings, necklaces, earrings and raw opals. Premium quality opals that don\'t cost the earth.',
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      <PageTransition>
        <div className="flex flex-col bg-white">
          <Navigation
            logoText="The Good Opal Co"
            items={[
              { href: '/store', label: 'Shop' },
              { href: '/blog', label: 'Blog' },
              { href: '/faq', label: 'FAQ' },
            ]}
          />

          <main id="main-content" tabIndex={-1}>
            {/* Hero Section */}
            <HomeHero />

            {/* Trust Indicators - Improved typography and spacing */}
            <section className="py-8 bg-gray-whisper border-y border-gray-soft">
              <Container>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="flex flex-col items-center gap-2"
                  >
                    <Shield className="w-8 h-8 text-opal-electric-accessible" />
                    <div>
                      <p className="font-display font-bold text-lg text-charcoal">100%</p>
                      <p className="text-sm text-content-muted">Australian Owned</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="flex flex-col items-center gap-2"
                  >
                    <Heart className="w-8 h-8 text-fire-pink-dark" />
                    <div>
                      <p className="font-display font-bold text-lg text-charcoal">Handcrafted</p>
                      <p className="text-sm text-content-muted">With Love</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="flex flex-col items-center gap-2"
                  >
                    <Globe className="w-8 h-8 text-opal-emerald-dark" />
                    <div>
                      <p className="font-display font-bold text-lg text-charcoal">Sustainable</p>
                      <p className="text-sm text-content-muted">Eco-Conscious</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="flex flex-col items-center gap-2"
                  >
                    <Sparkles className="w-8 h-8 text-opal-electric-accessible" />
                    <div>
                      <p className="font-display font-bold text-lg text-charcoal">Premium</p>
                      <p className="text-sm text-content-muted">Quality Guarantee</p>
                    </div>
                  </motion.div>
                </div>
              </Container>
            </section>

            {/* Handmade in Australia - Improved layout and typography */}
            <section className="py-20 md:py-32 bg-white">
              <Container>
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  {/* Content */}
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="order-2 lg:order-1"
                  >
                    <span className="inline-flex items-center gap-2 text-opal-electric-accessible text-sm font-semibold uppercase tracking-wider mb-6">
                      <span className="w-12 h-px bg-opal-electric-accessible"></span>
                      Our Craft
                    </span>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-charcoal leading-tight">
                      Handmade in{' '}
                      <span className="relative">
                        <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-opal-electric to-opal-emerald">
                          Australia
                        </span>
                        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none">
                          <path
                            d="M0,8 Q150,0 300,8"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="3"
                            opacity="0.3"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#00B4D8" />
                              <stop offset="100%" stopColor="#2ECC71" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </span>
                    </h2>
                    <p className="text-lg text-content-muted mb-8 leading-relaxed">
                      We source all our materials directly from Australian opal miners and handcraft each piece from start to finish,
                      offering our customers ethically sourced, eco-conscious Australian opals at an exceptional price.
                    </p>

                    {/* Features list */}
                    <ul className="space-y-3 mb-10">
                      {[
                        'Ethically sourced from Australian mines',
                        'Handcrafted by expert artisans',
                        'Eco-conscious practices',
                        'Fair and transparent pricing'
                      ].map((feature, i) => (
                        <motion.li
                          key={i}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          variants={fadeInUp}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 text-charcoal"
                        >
                          <svg className="w-5 h-5 text-opal-electric-accessible flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-4">
                      <Button
                        size="lg"
                        asChild
                        className="bg-opal-electric hover:bg-opal-electric-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Link href="/store">
                          Shop Our Collection
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="border-2 hover:bg-gray-whisper font-semibold"
                      >
                        <Link href="/blog">Our Story</Link>
                      </Button>
                    </div>
                  </motion.div>

                  {/* Image Grid - Improved layout */}
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="order-1 lg:order-2"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div variants={fadeInUp} className="space-y-4">
                        <div className="relative overflow-hidden rounded-2xl shadow-xl group">
                          <OptimizedImage
                            src="/api/media/file/20211104_234659-1-4.jpg"
                            alt="Vibrant Australian Opal"
                            aspectRatio="4:3"
                            className="group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 1024px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="relative overflow-hidden rounded-2xl shadow-xl group">
                          <OptimizedImage
                            src="/api/media/file/20220109_133519-3.jpg"
                            alt="Colorful Handcrafted Opals"
                            aspectRatio="1:1"
                            className="group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 1024px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-4 pt-8">
                        <div className="relative overflow-hidden rounded-2xl shadow-xl group">
                          <OptimizedImage
                            src="/api/media/file/20210627_202327-3.jpg"
                            alt="Raw Australian Opals"
                            aspectRatio="1:1"
                            className="group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 1024px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="relative overflow-hidden rounded-2xl shadow-xl group">
                          <OptimizedImage
                            src="/api/media/file/IMG_5903-3.jpg"
                            alt="Opal Jewelry"
                            aspectRatio="4:3"
                            className="group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 1024px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </Container>
            </section>

            {/* Shop Picks - Dark background for contrast */}
            <section className="bg-black-rich py-20 md:py-32 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-opal-electric/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fire-pink/10 rounded-full blur-3xl" />
              </div>

              <Container>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="text-center mb-12"
                >
                  <span className="inline-flex items-center gap-2 text-opal-deep text-sm font-semibold uppercase tracking-wider mb-6">
                    <span className="w-12 h-px bg-opal-light"></span>
                    Featured
                    <span className="w-12 h-px bg-opal-light"></span>
                  </span>
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                    Latest Treasures
                  </h2>
                  <p className="text-lg text-white/70 max-w-2xl mx-auto">
                    Our newest Australian opals and handcrafted jewelry pieces
                  </p>
                </motion.div>

                <FeaturedProducts
                  title=""
                  description=""
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
                    <Link href="/store">
                      View All Products
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </Container>
            </section>

            {/* Categories - Improved grid and visual hierarchy */}
            <section className="py-20 md:py-32 bg-gray-whisper">
              <Container>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="text-center mb-12"
                >
                  <span className="inline-flex items-center gap-2 text-opal-electric-accessible text-sm font-semibold uppercase tracking-wider mb-6">
                    <span className="w-12 h-px bg-opal-electric-accessible"></span>
                    Browse
                    <span className="w-12 h-px bg-opal-electric-accessible"></span>
                  </span>
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mb-4">
                    Shop by Category
                  </h2>
                  <p className="text-lg text-content-muted max-w-2xl mx-auto">
                    Explore our collection of loose opals, handcrafted jewelry, and expert services
                  </p>
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  {[
                    {
                      href: '/store?category=raw-opals',
                      image: '/api/media/file/20210627_202327-3.jpg',
                      title: 'OPALS',
                      subtitle: 'Loose Stones',
                      color: 'from-opal-electric/80 to-opal-deep/80'
                    },
                    {
                      href: '/store',
                      image: '/api/media/file/IMG_5903-3.jpg',
                      title: 'EARRINGS',
                      subtitle: 'Handcrafted',
                      color: 'from-fire-pink/80 to-fire-coral/80'
                    },
                    {
                      href: '/store?category=opal-rings',
                      image: '/api/media/file/20210819_102625-4.jpg',
                      title: 'RINGS',
                      subtitle: 'One-of-a-Kind',
                      color: 'from-opal-emerald/80 to-opal-teal/80'
                    },
                    {
                      href: '/services',
                      title: 'SERVICES',
                      subtitle: 'Repairs & Custom',
                      isService: true,
                      icon: (
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.586V5L7 4z" />
                        </svg>
                      )
                    },
                    {
                      href: '/courses',
                      title: 'COURSES',
                      subtitle: 'Learn Opal Cutting',
                      isService: true,
                      icon: (
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )
                    }
                  ].map((category, i) => (
                    <motion.div key={i} variants={fadeInUp}>
                      <Link
                        href={category.href}
                        className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 block"
                      >
                        {category.isService ? (
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-br",
                            i === 3 ? "from-opal-electric to-opal-deep" : "from-fire-pink to-fire-coral"
                          )}>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                {category.icon}
                              </div>
                              <h3 className="font-display font-bold text-lg tracking-wide mb-1">{category.title}</h3>
                              <span className="text-xs font-medium text-white/80">{category.subtitle}</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <OptimizedImage
                              src={category.image!}
                              alt={category.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                            <div className={cn(
                              "absolute inset-0 bg-gradient-to-t",
                              category.color
                            )} />
                            <div className="absolute bottom-0 left-0 right-0 p-5 text-center text-white">
                              <h3 className="font-display font-bold text-lg tracking-wide mb-1">{category.title}</h3>
                              <span className="text-xs font-medium text-white/80">{category.subtitle}</span>
                            </div>
                          </>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </Container>
            </section>

            {/* Custom Creations - Better visual design */}
            <section className="py-20 md:py-32 bg-white relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              <Container>
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  {/* Content */}
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                  >
                    <span className="inline-flex items-center gap-2 text-opal-electric-accessible text-sm font-semibold uppercase tracking-wider mb-6">
                      <span className="w-12 h-px bg-opal-electric-accessible"></span>
                      Bespoke
                    </span>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-charcoal leading-tight">
                      Custom Creations
                    </h2>
                    <p className="text-lg text-content-muted mb-8 leading-relaxed">
                      Turn the opal of your dreams into a one-of-a-kind treasure, crafted to last a lifetime.
                      Our custom jewelry is designed to be both affordable and uniquely yours.
                    </p>

                    {/* Process Steps */}
                    <div className="space-y-6 mb-10">
                      {[
                        {
                          step: '01',
                          title: 'Personal Consultation',
                          desc: 'Share your vision with our expert designers'
                        },
                        {
                          step: '02',
                          title: 'Stone Selection',
                          desc: 'Choose from our curated collection of opals'
                        },
                        {
                          step: '03',
                          title: 'Expert Crafting',
                          desc: 'Watch your unique piece come to life'
                        },
                        {
                          step: '04',
                          title: 'Lifetime Warranty',
                          desc: 'Enjoy your treasure with complete peace of mind'
                        }
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          variants={fadeInUp}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-4"
                        >
                          <span className="flex-shrink-0 w-12 h-12 rounded-full bg-opal-sky flex items-center justify-center text-white font-display font-bold">
                            {item.step}
                          </span>
                          <div>
                            <h3 className="font-semibold text-charcoal mb-1">{item.title}</h3>
                            <p className="text-sm text-content-muted">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button
                        size="lg"
                        asChild
                        className="bg-opal-electric hover:bg-opal-electric-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Link href="/services">
                          Start Your Custom Piece
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="ghost"
                        asChild
                        className="font-semibold"
                      >
                        <Link href="/store">View Gallery</Link>
                      </Button>
                    </div>
                  </motion.div>

                  {/* Image Gallery */}
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-2 gap-4"
                  >
                    {[
                      '/api/media/file/IMG_5894-3.jpg',
                      '/api/media/file/IMG_5917-2.jpg',
                      '/api/media/file/20211104_234746-3.jpg',
                      '/api/media/file/IMG_5908-5.jpg'
                    ].map((src, i) => (
                      <motion.div
                        key={i}
                        variants={fadeInUp}
                        className="relative overflow-hidden rounded-lg shadow-lg group"
                      >
                        <OptimizedImage
                          src={src}
                          alt="Custom Opal Jewelry"
                          aspectRatio="1:1"
                          className="group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </Container>
            </section>

            {/* Newsletter CTA - Improved design */}
            <section className="py-20 bg-gradient-to-r from-opal-electric to-opal-emerald relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              </div>

              <Container>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="max-w-2xl mx-auto text-center text-white relative z-10"
                >
                  <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-80" />
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                    Join the Opal Family
                  </h2>
                  <p className="text-lg mb-8 text-white/90">
                    Be the first to see new arrivals, get exclusive offers, and learn about the fascinating world of Australian opals.
                  </p>
                  <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 rounded-lg bg-white/20 backdrop-blur border border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      required
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-white text-opal-electric-accessible hover:bg-gray-100 font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Subscribe
                    </Button>
                  </form>
                  <p className="text-sm mt-4 text-white/70">
                    No spam, unsubscribe anytime. Privacy guaranteed.
                  </p>
                </motion.div>
              </Container>
            </section>
          </main>

          <Footer logoText="The Good Opal Co" />
        </div>
      </PageTransition>
    </>
  )
}