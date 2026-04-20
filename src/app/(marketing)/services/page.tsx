import type { Metadata } from 'next'
import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  Gem,
  Settings,
  Heart,
  Clock,
  Shield,
  Sparkles,
  Palette
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Custom Design Services | The Good Opal Co',
  description: 'Create your dream opal jewellery with our custom design services. From engagement rings to statement pieces, we bring your vision to life.',
}

const services = [
  {
    icon: Gem,
    title: 'Custom Opal Selection',
    description: 'Choose from our extensive collection or let us source the perfect opal based on your preferences for colour, size, and budget.',
    features: [
      'Personal consultation',
      'Video viewing sessions',
      'Expert recommendations',
      'Multiple options presented'
    ]
  },
  {
    icon: Palette,
    title: 'Bespoke Design Process',
    description: 'Work with our designers to create a unique piece that reflects your personal style and the opal\'s natural beauty.',
    features: [
      'Initial concept sketches',
      'CAD renderings',
      'Design revisions',
      'Final approval before crafting'
    ]
  },
  {
    icon: Settings,
    title: 'Expert Craftsmanship',
    description: 'Our skilled jewellers handcraft each piece with meticulous attention to detail, ensuring your opal is perfectly showcased.',
    features: [
      'Handcrafted in Australia',
      'Premium metals only',
      'Secure stone settings',
      'Quality inspections'
    ]
  },
  {
    icon: Shield,
    title: 'Lifetime Support',
    description: 'Your custom piece comes with our full support, including cleaning, maintenance, and any future modifications.',
    features: [
      'Lifetime authenticity guarantee',
      'Annual cleaning service',
      'Resize and repair options',
      'Insurance documentation'
    ]
  }
]

const process = [
  {
    step: 1,
    title: 'Initial Consultation',
    description: 'Share your vision, preferences, and budget with our design team via email or video call.',
    duration: '1-2 days'
  },
  {
    step: 2,
    title: 'Opal Selection',
    description: 'We present opal options that match your criteria, with detailed photos and videos.',
    duration: '3-5 days'
  },
  {
    step: 3,
    title: 'Design Development',
    description: 'Our designers create sketches and CAD renderings of your custom piece.',
    duration: '1 week'
  },
  {
    step: 4,
    title: 'Approval & Refinement',
    description: 'Review designs, request changes, and give final approval before production.',
    duration: '3-5 days'
  },
  {
    step: 5,
    title: 'Crafting',
    description: 'Our jewellers handcraft your piece with precision and care.',
    duration: '4-6 weeks'
  },
  {
    step: 6,
    title: 'Delivery',
    description: 'Your custom piece is delivered in beautiful packaging with all certificates.',
    duration: '2-5 days'
  }
]

// Testimonials removed to comply with Australian Consumer Law
// Real testimonials should be fetched from Payload CMS when available

export default function ServicesPage() {
  return (
    <>
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
      />

      <PageTransition>
        <main className="min-h-screen">
          {/* Hero Section */}
          <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
            {/* Background with gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black-rich via-charcoal to-black-rich" />
            <div className="absolute inset-0 bg-gradient-to-t from-black-rich/50 to-transparent" />

            {/* Animated gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-opal-electric/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fire-pink/20 rounded-full blur-3xl animate-pulse delay-1000" />

            <Container className="relative z-10">
              <div className="text-center text-white max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="h-px w-12 bg-gradient-to-r from-transparent to-opal-electric"></span>
                  <span className="text-sm font-medium uppercase tracking-wider text-opal-electric">
                    Custom Design Services
                  </span>
                  <span className="h-px w-12 bg-gradient-to-l from-transparent to-opal-electric"></span>
                </div>
                <h1 className="font-serif text-5xl md:text-7xl font-normal mb-6">
                  Create Your Dream
                  <span className="block text-gradient-prismatic">Opal Jewellery</span>
                </h1>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  From concept to creation, we bring your vision to life with handcrafted
                  Australian opal jewellery that&apos;s uniquely yours.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/contact?subject=custom-design">
                      Start Your Design
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <Link href="#process">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
            </Container>
          </section>

          {/* Services Grid */}
          <Section className="py-16 lg:py-24 bg-white">
            <Container>
              <div className="text-center mb-16">
                <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
                  What We Offer
                </h2>
                <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
                  Comprehensive custom design services to create your perfect opal jewellery piece
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {services.map((service) => (
                  <div
                    key={service.title}
                    className="group relative bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-opal-electric to-fire-pink rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="font-serif text-2xl text-charcoal mb-3">
                      {service.title}
                    </h3>
                    <p className="text-charcoal/70 mb-6">
                      {service.description}
                    </p>

                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-opal-electric mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-charcoal/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Container>
          </Section>

          {/* Process Timeline */}
          <Section id="process" className="py-16 lg:py-24 bg-gray-50">
            <Container>
              <div className="text-center mb-16">
                <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
                  Our Design Process
                </h2>
                <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
                  A collaborative journey from initial concept to finished masterpiece
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                {process.map((step, index) => (
                  <div key={step.step} className="relative">
                    {/* Connection line */}
                    {index < process.length - 1 && (
                      <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-opal-electric to-fire-pink" />
                    )}

                    <div className="flex gap-8 mb-12">
                      {/* Step number */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-opal-electric to-fire-pink rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {step.step}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-8">
                        <div className="flex items-baseline justify-between mb-2">
                          <h3 className="font-serif text-2xl text-charcoal">
                            {step.title}
                          </h3>
                          <span className="text-sm text-opal-electric font-medium">
                            <Clock className="inline w-4 h-4 mr-1" />
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-charcoal/70">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-lg text-charcoal/80 mb-6">
                  Total timeline: 6-8 weeks from consultation to delivery
                </p>
                <Button asChild size="lg">
                  <Link href="/contact?subject=custom-design">
                    Start Your Custom Design
                  </Link>
                </Button>
              </div>
            </Container>
          </Section>

          {/* Customer Testimonials Section - Temporarily Disabled */}
          {/*
            Testimonials section removed to comply with Australian Consumer Law.
            Replace with genuine customer reviews from Payload CMS when available.
          */}

          {/* CTA Section */}
          <Section className="py-16 lg:py-24 bg-gradient-to-br from-black-rich to-charcoal text-white">
            <Container>
              <div className="text-center max-w-3xl mx-auto">
                <Heart className="w-16 h-16 mx-auto mb-6 text-fire-pink" />
                <h2 className="font-serif text-4xl md:text-5xl mb-6">
                  Ready to Create Something Special?
                </h2>
                <p className="text-xl text-white/80 mb-8">
                  Whether it&apos;s an engagement ring, anniversary gift, or personal treasure,
                  we&apos;ll help you create a one-of-a-kind piece that tells your story.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/contact?subject=custom-design">
                      Start Your Design Journey
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    <Link href="/store">
                      Browse Our Collection
                    </Link>
                  </Button>
                </div>
              </div>
            </Container>
          </Section>
        </main>
      </PageTransition>

      <Footer />
    </>
  )
}