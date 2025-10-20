import { Navigation, Footer } from '@/components/navigation'
import { Hero, Features, CTA, Contact } from '@/components/sections'
import type { Feature, Link } from '@/types'

/**
 * Service Business Template Props
 */
interface ServiceBusinessTemplateProps {
  // Site branding
  siteName: string
  logo?: { id: string; url: string; alt: string; width?: number; height?: number }

  // Navigation
  navItems?: Array<{ label: string; href: string; external?: boolean }>
  navCTA?: Link

  // Hero section
  heroTitle: string
  heroSubtitle?: string
  heroDescription?: string
  heroCTA?: Link[]
  heroImage?: { id: string; url: string; alt: string; width?: number; height?: number }

  // Features
  featuresTitle?: string
  featuresDescription?: string
  features?: Feature[]

  // CTA
  ctaTitle?: string
  ctaDescription?: string
  ctaButtons?: Link[]

  // Contact
  email?: string
  phone?: string
  address?: string

  // Footer
  footerDescription?: string
  footerLinks?: Array<{ title: string; links: Link[] }>
  socialLinks?: Array<{
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'github'
    url: string
  }>
}

/**
 * Service Business Template
 * Complete template for service-based businesses (plumbers, electricians, consultants, etc.)
 */
export function ServiceBusinessTemplate({
  siteName,
  logo,
  navItems = [],
  navCTA,
  heroTitle,
  heroSubtitle,
  heroDescription,
  heroCTA = [],
  heroImage,
  featuresTitle,
  featuresDescription,
  features = [],
  ctaTitle,
  ctaDescription,
  ctaButtons = [],
  email,
  phone,
  address,
  footerDescription,
  footerLinks = [],
  socialLinks = [],
}: ServiceBusinessTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navigation
        logoText={siteName}
        logo={logo}
        items={navItems}
        cta={navCTA}
        sticky
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          title={heroTitle}
          subtitle={heroSubtitle}
          description={heroDescription}
          cta={heroCTA}
          image={heroImage}
          alignment="left"
        />

        {/* Features Section */}
        {features.length > 0 && (
          <Features
            title={featuresTitle}
            description={featuresDescription}
            features={features}
            columns={3}
          />
        )}

        {/* CTA Section */}
        {ctaTitle && (
          <CTA
            title={ctaTitle}
            description={ctaDescription}
            buttons={ctaButtons}
            background="accent"
          />
        )}

        {/* Contact Section */}
        <Contact
          title="Contact Us"
          description="Ready to get started? Reach out to us today."
          email={email}
          phone={phone}
          address={address}
        />
      </main>

      {/* Footer */}
      <Footer
        logoText={siteName}
        logo={logo}
        description={footerDescription}
        links={footerLinks}
        social={socialLinks}
      />
    </div>
  )
}
