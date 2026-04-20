import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { PageTransition } from '@/components/layout/PageTransition'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/button'
import { getNavigationProps } from '@/lib/constants/navigation'
import { Award, Shield, Heart, Sparkles, Users, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | The Good Opal Co',
  description: 'Learn about Stephanie\'s journey bringing authentic Australian opals to the world. Founded in 2020, committed to quality and ethical sourcing.',
}

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-white">
        <Navigation
          {...getNavigationProps({ transparent: true })}
        />
      {/* Hero Section */}
      <section className="relative pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20 z-10" />
        <div className="relative h-[500px] w-full overflow-hidden">
          <Image
            src="/images/about-hero.jpg"
            alt="Australian opal mines"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white max-w-3xl mx-auto px-6">
            <span className="font-accent text-xl text-transparent bg-clip-text bg-gradient-to-r from-opal-electric to-fire-pink mb-4 block animate-sparkle">
              ✨ Our Journey ✨
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
              Our <span className="font-accent text-opal-electric">Story</span>
            </h1>
            <p className="font-sans text-xl md:text-2xl">
              Bringing the magic of Australian opals to the world since 2015
            </p>
            <p className="font-accent text-lg text-white/70 mt-2">
              ~ From the heart of Australia to yours ~
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
            <span className="font-accent text-lg text-opal-electric mb-4 block">
              ✨ Our Mission ✨
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal mb-6">
              Treasures from the Australian <span className="font-accent text-opal-electric">Outback</span>
            </h2>
            <p className="font-sans text-lg text-content leading-relaxed mb-4">
              The Good Opal Co is more than just a jewellery business—it&apos;s a passion project dedicated to revealing
              the true beauty of Australian opal from the rough earth to one-of-a-kind pieces. Our mission is to source
              the highest quality opals directly from Australian miners and transform them into extraordinary jewellery
              that doesn&apos;t cost the Earth.
            </p>
            <p className="font-accent text-base text-opal-electric/70">
              ~ Sharing Australia&apos;s treasures with the world ~
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
              <h3 className="font-serif font-semibold text-charcoal text-xl mb-2">Authenticity Guaranteed</h3>
              <p className="font-sans text-content">
                Every opal is certified genuine and natural. We provide certificates of authenticity for all purchases.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-fire-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-fire-pink" />
              </div>
              <h3 className="font-serif font-semibold text-charcoal text-xl mb-2">Quality Commitment</h3>
              <p className="font-sans text-content">
                Recognized for our commitment to excellence in sourcing and crafting quality Australian opals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-opal-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-opal-emerald" />
              </div>
              <h3 className="font-serif font-semibold text-charcoal text-xl mb-2">Customer First</h3>
              <p className="font-sans text-content">
                Dedicated to providing exceptional service with lifetime support for every purchase.
              </p>
            </div>
          </div>
        </section>

        {/* Our Journey */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-accent text-lg text-opal-electric mb-4 block">
                ✨ How We Began ✨
              </span>
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-6">
                Our <span className="font-accent text-opal-electric">Journey</span>
              </h2>
              <div className="prose prose-lg">
                <p className="font-sans text-content mb-4 leading-relaxed">
                  Founded in 2020 by Stephanie Caruana, The Good Opal Co was born from a serendipitous encounter with
                  Australia&apos;s national gemstone. It all started in 2014 when Steph&apos;s neighbour—a part-time miner
                  at Grawin near Lightning Ridge—gifted her a jar of Lightning Ridge white opal chips.
                </p>
                <p className="font-sans text-content mb-4 leading-relaxed">
                  That first glimpse of opal&apos;s magical play of color sparked an obsession. After university, Steph
                  deprioritized her career path and spent a summer hand-sanding opal on a knife block, followed by
                  months researching equipment and a full year perfecting her cutting technique.
                </p>
                <p className="font-sans text-content mb-4 leading-relaxed">
                  What sets The Good Opal Co apart is Steph&apos;s hands-on approach—she personally hand-selects rough opal
                  directly from Australian miners, cuts and finishes every stone herself, and creates each piece of
                  jewellery using only solid gold and silver.
                </p>
                <p className="font-sans text-content leading-relaxed">
                  Today, working with select miners featured on Discovery&apos;s &quot;Outback Opal Hunters,&quot; every piece
                  in our collection is personally chosen for its beauty, quality, and that special something that makes
                  Australian opals truly magical.
                </p>
                <p className="font-accent text-base text-opal-electric/70 mt-4">
                  ~ Where passion meets perfection ~
                </p>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/images/stephanie-founder.jpg"
                alt="Stephanie Caruana, founder of The Good Opal Co, at the Lightning Ridge opal fields"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white text-sm">
                  Stephanie Caruana at the Lightning Ridge opal fields, hand-selecting stones
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <span className="font-accent text-lg text-opal-electric mb-4 block">
              ✨ What Drives Us ✨
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal">
              Our <span className="font-accent text-opal-electric">Values</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-opal-electric mx-auto mb-4" />
              <h3 className="font-serif font-semibold text-charcoal text-lg mb-2">Quality First</h3>
              <p className="font-sans text-sm text-content">
                We never compromise on quality. Each opal is carefully inspected and must meet our strict standards.
              </p>
            </div>

            <div className="text-center">
              <Users className="w-12 h-12 text-fire-pink mx-auto mb-4" />
              <h3 className="font-serif font-semibold text-charcoal text-lg mb-2">Ethical Sourcing</h3>
              <p className="font-sans text-sm text-content">
                We work directly with miners, ensuring fair compensation and sustainable mining practices.
              </p>
            </div>

            <div className="text-center">
              <Shield className="w-12 h-12 text-opal-emerald mx-auto mb-4" />
              <h3 className="font-serif font-semibold text-charcoal text-lg mb-2">Transparency</h3>
              <p className="font-sans text-sm text-content">
                Full disclosure about origins, treatments, and pricing. What you see is what you get.
              </p>
            </div>

            <div className="text-center">
              <Globe className="w-12 h-12 text-fire-gold mx-auto mb-4" />
              <h3 className="font-serif font-semibold text-charcoal text-lg mb-2">Global Community</h3>
              <p className="font-sans text-sm text-content">
                Connecting opal lovers worldwide through education, fair trade, and shared appreciation.
              </p>
            </div>
          </div>
        </section>

        {/* Mining Locations */}
        <section className="mb-20">
          <div className="bg-gray-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <span className="font-accent text-lg text-opal-electric mb-4 block">
                ✨ From Sacred Lands ✨
              </span>
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-4">
                From Australia&apos;s Premier <span className="font-accent text-opal-electric">Opal Fields</span>
              </h2>
              <p className="font-sans text-center text-content max-w-2xl mx-auto">
                We source directly from Australia&apos;s most renowned opal mining locations,
                each producing unique varieties of this precious gemstone.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-serif font-semibold text-charcoal text-xl mb-3">Lightning Ridge</h3>
                <p className="font-sans text-content mb-4">
                  Home of the rare and valuable black opal, Lightning Ridge produces the world&apos;s
                  most sought-after opals with their distinctive dark body tone and brilliant play of color.
                </p>
                <p className="font-sans text-sm text-content-muted">
                  <strong>Specialties:</strong> Black opal, dark crystal opal
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-serif font-semibold text-charcoal text-xl mb-3">Coober Pedy</h3>
                <p className="font-sans text-content mb-4">
                  The &quot;Opal Capital of the World&quot; produces the majority of the world&apos;s white opals,
                  known for their light body tone and spectacular color displays.
                </p>
                <p className="font-sans text-sm text-content-muted">
                  <strong>Specialties:</strong> White opal, light crystal opal
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-serif font-semibold text-charcoal text-xl mb-3">Queensland Boulder Fields</h3>
                <p className="font-sans text-content mb-4">
                  Unique boulder opals form in ironstone, creating stunning natural patterns
                  where precious opal fills cracks and voids in the host rock.
                </p>
                <p className="font-sans text-sm text-content-muted">
                  <strong>Specialties:</strong> Boulder opal, matrix opal
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Founder */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <span className="font-accent text-lg text-opal-electric mb-4 block">
              ✨ The Artist Behind the Magic ✨
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal">
              Meet <span className="font-accent text-opal-electric">Stephanie</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-6 overflow-hidden relative">
                <Image
                  src="/images/stephanie-founder.jpg"
                  alt="Stephanie Caruana, Founder of The Good Opal Co"
                  fill
                  sizes="192px"
                  className="object-cover"
                />
              </div>
              <h3 className="font-serif font-semibold text-charcoal text-xl mb-2">Stephanie Caruana</h3>
              <p className="font-sans text-content-muted mb-4 text-lg">Founder & Creative Director</p>
              <p className="font-sans text-content leading-relaxed max-w-2xl mx-auto">
                From receiving her first jar of Lightning Ridge opal chips as a gift to building Australia&apos;s most trusted boutique opal business, Stephanie&apos;s journey has been guided by genuine passion for these magical gemstones. Her keen eye for quality and dedication to sharing the wonder of Australian opals has made The Good Opal Co a beloved destination for collectors worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-opal-electric to-fire-pink p-12 rounded-3xl">
            <span className="font-accent text-lg text-white/80 mb-4 block">
              ✨ Join Our Journey ✨
            </span>
            <h2 className="font-serif text-3xl font-bold text-white mb-4">
              Experience the Magic of Australian <span className="font-accent">Opals</span>
            </h2>
            <p className="font-sans text-xl text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">
              Join thousands of collectors worldwide who trust The Good Opal Co
              for authentic, high-quality Australian opals.
            </p>
            <p className="font-accent text-base text-white/70 mb-8">
              ~ Where dreams become treasures ~
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
        <Footer />
      </div>
    </PageTransition>
  )
}