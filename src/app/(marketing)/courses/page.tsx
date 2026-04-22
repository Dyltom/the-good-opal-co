import type { Metadata } from 'next'
import Link from 'next/link'
import { Container, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  GraduationCap,
  Calendar,
  Clock,
  Users,
  Award,
  Gem,
  Video,
  CheckCircle,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Opal Appreciation Courses | The Good Opal Co',
  description: 'Learn about Australian opals with our expert-led courses. From beginner to advanced, discover the art of opal appreciation and valuation.',
}

const courses = [
  {
    id: 'beginner',
    title: 'Introduction to Australian Opals',
    level: 'Beginner',
    duration: '4 weeks',
    format: 'Online',
    price: 299,
    enrolledCount: 127,
    rating: 4.9,
    description: 'Perfect for opal enthusiasts wanting to understand the basics of Australian opals, their formation, and value.',
    topics: [
      'Opal formation and geology',
      'Types of Australian opals',
      'Basic quality assessment',
      'Care and maintenance',
      'Buying tips for beginners',
      'Australian mining regions'
    ],
    includes: [
      'Weekly live sessions with Q&A',
      'Digital course materials',
      'Certificate of completion',
      'Access to online community',
      'Opal sample kit (shipped)'
    ]
  },
  {
    id: 'intermediate',
    title: 'Opal Grading & Valuation',
    level: 'Intermediate',
    duration: '6 weeks',
    format: 'Online + Workshop',
    price: 599,
    enrolledCount: 89,
    rating: 4.8,
    description: 'Develop skills in professional opal grading, valuation techniques, and market understanding.',
    topics: [
      'Professional grading systems',
      'Body tone classification',
      'Brightness assessment',
      'Pattern identification',
      'Market values and trends',
      'Documentation and certification'
    ],
    includes: [
      'Professional loupes and tools',
      'Hands-on workshop (Sydney)',
      'Industry expert mentorship',
      'Grading practice kit',
      'Professional certificate'
    ],
    featured: true
  },
  {
    id: 'advanced',
    title: 'Opal Trading Masterclass',
    level: 'Advanced',
    duration: '8 weeks',
    format: 'Hybrid',
    price: 1299,
    enrolledCount: 34,
    rating: 5.0,
    description: 'For serious collectors and traders. Learn advanced valuation, negotiation, and investment strategies.',
    topics: [
      'Advanced market analysis',
      'Investment-grade opals',
      'Negotiation strategies',
      'International markets',
      'Collection building',
      'Industry networking'
    ],
    includes: [
      'Mine site visit (Lightning Ridge)',
      'Dealer introductions',
      'Investment portfolio review',
      'Lifetime alumni access',
      'Advanced certification'
    ]
  }
]

const upcomingDates = [
  { course: 'Introduction to Australian Opals', date: 'May 15, 2026', spots: 8 },
  { course: 'Opal Grading & Valuation', date: 'May 29, 2026', spots: 5 },
  { course: 'Introduction to Australian Opals', date: 'June 12, 2026', spots: 15 },
  { course: 'Opal Trading Masterclass', date: 'June 26, 2026', spots: 3 }
]

const instructors = [
  {
    name: 'Stephanie Caruana',
    role: 'Founder & Creative Director',
    bio: 'With over 15 years as a certified gemologist, Stephanie brings expertise in opal identification and quality assessment.',
    image: '/images/instructor-stephanie.jpg'
  },
  {
    name: 'Dr. Marcus Chen',
    role: 'Gemologist',
    bio: 'Certified gemologist with 20 years experience in opal grading and valuation. Former head grader at major auction houses.',
    image: '/images/instructor-marcus.jpg'
  },
  {
    name: 'Tom Wilson',
    role: 'Mining Expert',
    bio: 'Third-generation opal miner from Lightning Ridge. Provides unique insights into the mining process and opal formation.',
    image: '/images/instructor-tom.jpg'
  }
]

export default function CoursesPage() {
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
        <main className="min-h-screen pt-10">
          {/* Hero Section */}
          <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-opal-deep via-opal-electric to-fire-pink opacity-90" />
            <div className="absolute inset-0 bg-black-rich/30" />

            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-opal-electric/20 blur-3xl animate-pulse delay-1000" />

            <Container className="relative z-10">
              <div className="text-center text-white max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <GraduationCap className="w-8 h-8" />
                  <span className="text-sm font-medium uppercase tracking-wider">
                    Opal Education
                  </span>
                </div>
                <h1 className="font-serif text-5xl md:text-7xl font-normal mb-6">
                  Master the Art of
                  <span className="block text-gradient-light">Opal Appreciation</span>
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  From beginner to expert, learn everything about Australian opals with our
                  comprehensive courses led by industry professionals.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-opal-electric hover:bg-white/90">
                    <Link href="#courses">
                      Explore Courses
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-white/30 text-white hover:bg-white/10"
                  >
                    <Link href="#upcoming">
                      Upcoming Sessions
                    </Link>
                  </Button>
                </div>
              </div>
            </Container>
          </section>

          {/* Course Cards */}
          <Section id="courses" className="py-20 bg-gray-50">
            <Container>
              <div className="text-center mb-16">
                <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
                  Our Courses
                </h2>
                <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
                  Choose the perfect course for your level of experience and learning goals
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={cn(
                      "relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl",
                      course.featured && "ring-2 ring-opal-electric scale-105"
                    )}
                  >
                    {course.featured && (
                      <div className="absolute top-0 right-0 bg-gradient-to-br from-opal-electric to-fire-pink text-white px-4 py-1 text-sm font-medium rounded-bl-xl">
                        Most Popular
                      </div>
                    )}

                    <div className="p-8">
                      {/* Header */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-opal-electric">
                            {course.level}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-fire-gold fill-current" />
                            <span className="text-sm font-medium">{course.rating}</span>
                          </div>
                        </div>
                        <h3 className="font-serif text-2xl text-charcoal mb-3">
                          {course.title}
                        </h3>
                        <p className="text-charcoal/70">
                          {course.description}
                        </p>
                      </div>

                      {/* Course Details */}
                      <div className="flex items-center gap-4 mb-6 text-sm text-charcoal/60">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.enrolledCount} enrolled
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          {course.format}
                        </div>
                      </div>

                      {/* Topics */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-charcoal mb-3">You&apos;ll Learn:</h4>
                        <ul className="space-y-2">
                          {course.topics.slice(0, 4).map((topic, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-opal-electric mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-charcoal/80">{topic}</span>
                            </li>
                          ))}
                          {course.topics.length > 4 && (
                            <li className="text-sm text-opal-electric font-medium">
                              +{course.topics.length - 4} more topics
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Price and CTA */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-serif text-3xl text-charcoal">
                            ${course.price}
                          </span>
                          <span className="text-sm text-charcoal/60">AUD</span>
                        </div>
                        <Button asChild className="w-full">
                          <Link href={`/contact?subject=course-${course.id}`}>
                            Enroll Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </Section>

          {/* Upcoming Sessions */}
          <Section id="upcoming" className="py-20 bg-white">
            <Container>
              <div className="text-center mb-16">
                <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
                  Upcoming Sessions
                </h2>
                <p className="text-xl text-charcoal/70">
                  Limited spots available - secure your place today
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="bg-gray-50 rounded-2xl p-8">
                  {upcomingDates.map((session, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between py-4",
                        index !== upcomingDates.length - 1 && "border-b border-gray-200"
                      )}
                    >
                      <div>
                        <h3 className="font-semibold text-charcoal">
                          {session.course}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-charcoal/60" />
                          <span className="text-sm text-charcoal/60">
                            {session.date}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-sm font-medium",
                          session.spots <= 5 ? "text-fire-coral" : "text-opal-electric"
                        )}>
                          {session.spots} spots left
                        </span>
                        <Button
                          asChild
                          size="sm"
                          variant={session.spots <= 5 ? "default" : "outline"}
                          className="ml-4"
                        >
                          <Link href="/contact?subject=course-booking">
                            Book
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <p className="text-charcoal/70 mb-4">
                    Can&apos;t find a suitable date?
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/contact?subject=course-inquiry">
                      Request Private Session
                    </Link>
                  </Button>
                </div>
              </div>
            </Container>
          </Section>

          {/* Instructors */}
          <Section className="py-20 bg-gray-50">
            <Container>
              <div className="text-center mb-16">
                <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
                  Learn from the Best
                </h2>
                <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
                  Our instructors bring decades of combined experience in opal mining,
                  grading, and trading
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {instructors.map((instructor) => (
                  <div key={instructor.name} className="text-center">
                    <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-opal-electric/20 to-fire-pink/20 p-1">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <Gem className="w-20 h-20 text-opal-electric" />
                      </div>
                    </div>
                    <h3 className="font-serif text-xl text-charcoal mb-1">
                      {instructor.name}
                    </h3>
                    <p className="text-sm font-medium text-opal-electric mb-3">
                      {instructor.role}
                    </p>
                    <p className="text-charcoal/70 text-sm">
                      {instructor.bio}
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </Section>

          {/* CTA Section */}
          <Section className="py-20 bg-gradient-to-br from-opal-electric to-fire-pink text-white">
            <Container>
              <div className="text-center max-w-3xl mx-auto">
                <Award className="w-16 h-16 mx-auto mb-6" />
                <h2 className="font-serif text-4xl md:text-5xl mb-6">
                  Start Your Opal Journey Today
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Join hundreds of students who have deepened their appreciation and
                  understanding of Australian opals through our expert-led courses.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="#courses">
                      Browse All Courses
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    <Link href="/contact">
                      Contact Us
                    </Link>
                  </Button>
                </div>

                <div className="mt-12 flex justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <span>Certificate provided</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>Small class sizes</span>
                  </div>
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