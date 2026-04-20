import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Award, Shield, Heart, Sparkles, Users, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | The Good Opal Co',
  description: 'Learn about our journey bringing authentic Australian opals to the world. Family-owned since 2015, committed to quality and ethical sourcing.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20 z-10" />
        <div className="relative h-[500px] w-full overflow-hidden">
          <Image
            src="/images/about-hero.jpg"
            alt="Australian opal mines"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white max-w-3xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl">
              Bringing the magic of Australian opals to the world since 2015
            </p>
          </div>
        </div>
      </section>

      <Container className="py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'About Us' },
          ]}
          className="mb-8"
        />

        {/* Mission Statement */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-charcoal mb-6">
              Treasures from the Australian Outback
            </h2>
            <p className="text-lg text-content leading-relaxed">
              The Good Opal Co is more than just a jewellery company—we&apos;re custodians of nature&apos;s most captivating gemstones.
              Our mission is to share the extraordinary beauty of Australian opals with collectors and jewellery lovers worldwide,
              while maintaining the highest standards of quality, authenticity, and ethical sourcing.
            </p>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-opal-electric/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-opal-electric" />
              </div>
              <h3 className="font-semibold text-charcoal text-xl mb-2">Authenticity Guaranteed</h3>
              <p className="text-content">
                Every opal is certified genuine and natural. We provide certificates of authenticity for all purchases.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-fire-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-fire-pink" />
              </div>
              <h3 className="font-semibold text-charcoal text-xl mb-2">Quality Commitment</h3>
              <p className="text-content">
                Recognized for our commitment to excellence in sourcing and crafting quality Australian opals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-opal-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-opal-emerald" />
              </div>
              <h3 className="font-semibold text-charcoal text-xl mb-2">Customer First</h3>
              <p className="text-content">
                Dedicated to providing exceptional service with lifetime support for every purchase.
              </p>
            </div>
          </div>
        </section>

        {/* Our Journey */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-charcoal mb-6">
                Our Journey
              </h2>
              <div className="prose prose-lg">
                <p className="text-content mb-4">
                  Founded in 2020 by Stephanie Caruana, The Good Opal Co was born from a genuine passion for
                  Australia&apos;s national gemstone and a commitment to making these beautiful stones accessible to everyone.
                </p>
                <p className="text-content mb-4">
                  Our mission is simple: to source authentic Australian opals directly from ethical miners and
                  handcraft each piece from start to finish, ensuring quality and affordability go hand in hand.
                </p>
                <p className="text-content mb-4">
                  What sets us apart is our dedication to transparency and ethical sourcing. We believe everyone
                  should be able to own a piece of Australia&apos;s natural beauty without compromising on quality or ethics.
                </p>
                <p className="text-content">
                  Today, we work directly with ethical miners across Australia&apos;s opal fields, ensuring fair prices
                  for miners and exceptional value for our customers. Every piece in our collection is hand-selected
                  for its beauty, quality, and that special something that makes Australian opals truly magical.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/images/founders.jpg"
                alt="Sarah and Michael Henderson, founders of The Good Opal Co"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white text-sm">
                  Sarah and Michael Henderson at the Lightning Ridge opal fields
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-display font-bold text-charcoal text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-opal-electric mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal text-lg mb-2">Quality First</h3>
              <p className="text-sm text-content">
                We never compromise on quality. Each opal is carefully inspected and must meet our strict standards.
              </p>
            </div>

            <div className="text-center">
              <Users className="w-12 h-12 text-fire-pink mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal text-lg mb-2">Ethical Sourcing</h3>
              <p className="text-sm text-content">
                We work directly with miners, ensuring fair compensation and sustainable mining practices.
              </p>
            </div>

            <div className="text-center">
              <Shield className="w-12 h-12 text-opal-emerald mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal text-lg mb-2">Transparency</h3>
              <p className="text-sm text-content">
                Full disclosure about origins, treatments, and pricing. What you see is what you get.
              </p>
            </div>

            <div className="text-center">
              <Globe className="w-12 h-12 text-fire-gold mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal text-lg mb-2">Global Community</h3>
              <p className="text-sm text-content">
                Connecting opal lovers worldwide through education, fair trade, and shared appreciation.
              </p>
            </div>
          </div>
        </section>

        {/* Mining Locations */}
        <section className="mb-20">
          <div className="bg-gray-50 rounded-3xl p-12">
            <h2 className="text-3xl font-display font-bold text-charcoal text-center mb-4">
              From Australia&apos;s Premier Opal Fields
            </h2>
            <p className="text-center text-content mb-12 max-w-2xl mx-auto">
              We source directly from Australia&apos;s most renowned opal mining locations,
              each producing unique varieties of this precious gemstone.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold text-charcoal text-xl mb-3">Lightning Ridge</h3>
                <p className="text-content mb-4">
                  Home of the rare and valuable black opal, Lightning Ridge produces the world&apos;s
                  most sought-after opals with their distinctive dark body tone and brilliant play of color.
                </p>
                <p className="text-sm text-content-muted">
                  <strong>Specialties:</strong> Black opal, dark crystal opal
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold text-charcoal text-xl mb-3">Coober Pedy</h3>
                <p className="text-content mb-4">
                  The &quot;Opal Capital of the World&quot; produces the majority of the world&apos;s white opals,
                  known for their light body tone and spectacular color displays.
                </p>
                <p className="text-sm text-content-muted">
                  <strong>Specialties:</strong> White opal, light crystal opal
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold text-charcoal text-xl mb-3">Queensland Boulder Fields</h3>
                <p className="text-content mb-4">
                  Unique boulder opals form in ironstone, creating stunning natural patterns
                  where precious opal fills cracks and voids in the host rock.
                </p>
                <p className="text-sm text-content-muted">
                  <strong>Specialties:</strong> Boulder opal, matrix opal
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-display font-bold text-charcoal text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden relative">
                <Image
                  src="/images/team-sarah.jpg"
                  alt="Sarah Henderson"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-charcoal text-lg">Sarah Henderson</h3>
              <p className="text-content-muted mb-2">Co-Founder & Creative Director</p>
              <p className="text-sm text-content">
                Gemologist with 15+ years experience. Oversees design and quality control.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden relative">
                <Image
                  src="/images/team-michael.jpg"
                  alt="Michael Henderson"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-charcoal text-lg">Michael Henderson</h3>
              <p className="text-content-muted mb-2">Co-Founder & Operations Director</p>
              <p className="text-sm text-content">
                Third-generation opal expert. Manages sourcing and miner relationships.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden relative">
                <Image
                  src="/images/team-emma.jpg"
                  alt="Emma Chen"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-charcoal text-lg">Emma Chen</h3>
              <p className="text-content-muted mb-2">Head Jeweler</p>
              <p className="text-sm text-content">
                Award-winning jeweler specializing in custom opal settings.
              </p>
            </div>
          </div>
        </section>

        {/* Press & Awards */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-charcoal mb-4">
              Recognition & Press
            </h2>
            <p className="text-content">
              Proud to be recognized by industry leaders and media
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60 grayscale">
            <div className="flex items-center justify-center">
              <p className="text-2xl font-bold text-gray-400">Vogue AU</p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-2xl font-bold text-gray-400">Harper&apos;s</p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-2xl font-bold text-gray-400">The Australian</p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-2xl font-bold text-gray-400">Jeweller Mag</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-opal-electric to-fire-pink p-12 rounded-3xl">
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Experience the Magic of Australian Opals
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of collectors worldwide who trust The Good Opal Co
              for authentic, high-quality Australian opals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/store">Browse Collection</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white hover:text-charcoal">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </Container>
    </div>
  )
}