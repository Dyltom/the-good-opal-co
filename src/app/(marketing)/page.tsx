import { ServiceBusinessTemplate } from '@/components/templates/ServiceBusinessTemplate'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rapid Sites - Multi-Tenant Next.js Framework',
  description: 'Build and deploy professional small business websites in minutes',
}

export default function HomePage() {
  return (
    <ServiceBusinessTemplate
      siteName="Rapid Sites Demo"
      heroTitle="Build Beautiful Websites in Minutes"
      heroSubtitle="Rapid Deployment"
      heroDescription="A multi-tenant Next.js framework for agencies deploying professional small business websites. Built with Payload CMS, shadcn/ui, and TypeScript."
      heroCTA={[
        { href: '#features', label: 'Learn More' },
        { href: 'https://github.com/Dyltom/rapid-sites', label: 'View on GitHub', external: true },
      ]}
      navItems={[
        { href: '#features', label: 'Features' },
        { href: '#contact', label: 'Contact' },
        { href: 'https://github.com/Dyltom/rapid-sites', label: 'GitHub', external: true },
      ]}
      featuresTitle="What We Offer"
      featuresDescription="Everything you need to rapidly deploy professional websites for small businesses"
      features={[
        {
          icon: '🚀',
          title: 'Rapid Deployment',
          description: 'Deploy new client sites in minutes with our multi-tenant architecture',
        },
        {
          icon: '🎨',
          title: 'Easy Customization',
          description: 'Per-tenant theming with CSS variables and shadcn/ui components',
        },
        {
          icon: '📝',
          title: 'Content Management',
          description: 'Payload CMS 3.0 integrated directly into Next.js for easy content updates',
        },
        {
          icon: '🔒',
          title: 'Type-Safe',
          description: 'Built with TypeScript strict mode for maximum reliability',
        },
        {
          icon: '📱',
          title: 'Responsive',
          description: 'Mobile-first design that works perfectly on all devices',
        },
        {
          icon: '⚡',
          title: 'Performance',
          description: 'Next.js 15 with App Router for blazing fast page loads',
        },
      ]}
      ctaTitle="Ready to Get Started?"
      ctaDescription="Start building professional websites for your clients today"
      ctaButtons={[
        { href: 'https://github.com/Dyltom/rapid-sites', label: 'View Documentation', external: true },
        { href: '#contact', label: 'Contact Us' },
      ]}
      email="contact@rapidsites.dev"
      phone="(555) 123-4567"
      address="123 Web Street, Internet City, 12345"
      footerDescription="Multi-tenant Next.js framework for rapidly deploying small business websites."
      footerLinks={[
        {
          title: 'Product',
          links: [
            { href: '#features', label: 'Features' },
            { href: '/docs', label: 'Documentation' },
            { href: '/pricing', label: 'Pricing' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { href: 'https://github.com/Dyltom/rapid-sites', label: 'GitHub', external: true },
            { href: '/roadmap', label: 'Roadmap' },
            { href: '/changelog', label: 'Changelog' },
          ],
        },
      ]}
      socialLinks={[
        { platform: 'github', url: 'https://github.com/Dyltom/rapid-sites' },
        { platform: 'twitter', url: 'https://twitter.com' },
      ]}
    />
  )
}
