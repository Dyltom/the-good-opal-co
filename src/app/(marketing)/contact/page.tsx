import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Navigation } from '@/components/navigation'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { ContactForm } from './contact-form'
import { CONTACT_INFO } from '@/lib/constants/contact'
import { PageTransition } from '@/components/layout/PageTransition'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us | The Good Opal Co',
  description: 'Get in touch with The Good Opal Co for questions about Australian opals, custom orders, or support.',
}

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
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
        <Container className="py-12">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Contact Us' },
          ]}
          className="mb-8"
        />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-accent text-xl text-transparent bg-clip-text bg-gradient-to-r from-opal-electric to-fire-pink mb-4 block animate-sparkle">
              ✨ Let&apos;s Connect ✨
            </span>
            <h1 className="font-serif text-4xl font-bold text-charcoal mb-4">
              Contact <span className="font-accent text-opal-electric">Us</span>
            </h1>
            <p className="font-sans text-lg text-content-muted max-w-2xl mx-auto">
              Have a question about our Australian opals? Need help with an order?
              We&apos;re here to help and would love to hear from you.
            </p>
            <p className="font-accent text-base text-opal-electric/70 mt-2">
              ~ Where questions become conversations ~
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="font-serif text-2xl font-semibold text-charcoal mb-6">
                Get in <span className="font-accent text-opal-electric">Touch</span>
              </h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-opal-electric/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-opal-electric" />
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-charcoal mb-1">Email</h3>
                    <p className="font-sans text-content">
                      <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-opal-electric-accessible transition-colors">
                        {CONTACT_INFO.email}
                      </a>
                    </p>
                    <p className="font-sans text-sm text-content-muted mt-1">
                      We&apos;ll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-fire-pink/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-fire-pink" />
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-charcoal mb-1">Phone</h3>
                    <p className="font-sans text-content">{CONTACT_INFO.phone}</p>
                    <p className="font-sans text-sm text-content-muted mt-1">
                      {CONTACT_INFO.businessHours.weekdays}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-opal-emerald/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-opal-emerald" />
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-charcoal mb-1">Visit Us</h3>
                    <p className="font-sans text-content">
                      By appointment only<br />
                      Sydney, NSW, Australia
                    </p>
                    <p className="font-sans text-sm text-content-muted mt-1">
                      Contact us to schedule a viewing
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-fire-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-fire-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-charcoal mb-1">Business Hours</h3>
                    <div className="font-sans text-content space-y-1">
                      <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                      <p>Saturday: 10:00 AM - 2:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                    <p className="font-sans text-sm text-content-muted mt-1">
                      All times in AEST
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-serif font-semibold text-charcoal mb-4">
                  Quick <span className="font-accent text-opal-electric">Links</span>
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/faq" className="font-sans text-content hover:text-opal-electric-accessible transition-colors">
                      Frequently Asked Questions
                    </a>
                  </li>
                  <li>
                    <a href="/shipping" className="font-sans text-content hover:text-opal-electric-accessible transition-colors">
                      Shipping Information
                    </a>
                  </li>
                  <li>
                    <a href="/returns" className="font-sans text-content hover:text-opal-electric-accessible transition-colors">
                      Returns & Refunds
                    </a>
                  </li>
                  <li>
                    <a href="/care-guide" className="font-sans text-content hover:text-opal-electric-accessible transition-colors">
                      Opal Care Guide
                    </a>
                  </li>
                </ul>
              </div>

              {/* Department Contacts */}
              <div className="mt-8">
                <h3 className="font-serif font-semibold text-charcoal mb-4">
                  Department <span className="font-accent text-opal-electric">Contacts</span>
                </h3>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-serif font-medium text-charcoal mb-1">Customer Support</h4>
                    <p className="font-sans text-sm text-content">
                      <a href="mailto:support@thegoodopalco.com" className="hover:text-opal-electric-accessible transition-colors">
                        support@thegoodopalco.com
                      </a>
                    </p>
                    <p className="font-sans text-xs text-content-muted mt-1">
                      Order inquiries, product questions
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-serif font-medium text-charcoal mb-1">Custom Orders</h4>
                    <p className="font-sans text-sm text-content">
                      <a href="mailto:custom@thegoodopalco.com" className="hover:text-opal-electric-accessible transition-colors">
                        custom@thegoodopalco.com
                      </a>
                    </p>
                    <p className="font-sans text-xs text-content-muted mt-1">
                      Bespoke jewelry, special requests
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-serif font-medium text-charcoal mb-1">Wholesale Inquiries</h4>
                    <p className="font-sans text-sm text-content">
                      <a href="mailto:wholesale@thegoodopalco.com" className="hover:text-opal-electric-accessible transition-colors">
                        wholesale@thegoodopalco.com
                      </a>
                    </p>
                    <p className="font-sans text-xs text-content-muted mt-1">
                      Bulk orders, trade accounts
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-serif font-medium text-charcoal mb-1">Press & Media</h4>
                    <p className="font-sans text-sm text-content">
                      <a href="mailto:press@thegoodopalco.com" className="hover:text-opal-electric-accessible transition-colors">
                        press@thegoodopalco.com
                      </a>
                    </p>
                    <p className="font-sans text-xs text-content-muted mt-1">
                      Media inquiries, collaborations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h2 className="font-serif text-2xl font-semibold text-charcoal mb-6">
                  Send Us a <span className="font-accent text-opal-electric">Message</span>
                </h2>
                <ContactForm />
              </div>

              {/* Response Time Notice */}
              <div className="mt-8 p-4 bg-opal-electric/5 rounded-lg">
                <p className="font-sans text-sm text-content text-center">
                  We typically respond to all inquiries within 24 hours during business days.
                  For urgent matters, please call us during business hours.
                </p>
              </div>
            </div>
          </div>

          {/* Map Section (Optional) */}
          <div className="mt-16">
            <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="font-sans text-gray-500">
                  Visit us by appointment in Sydney, Australia
                </p>
                <p className="font-sans text-sm text-gray-400 mt-2">
                  Contact us to schedule a private viewing of our collection
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
      </div>
    </PageTransition>
  )
}