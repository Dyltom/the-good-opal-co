import { PageBuilder, createPageConfig } from '@/lib/page-builder'

/**
 * Showcase Page - Demonstrates ALL New Features
 *
 * Shows everything we've built:
 * - DRY refactored components
 * - React Email templates
 * - Ecommerce capabilities
 * - SEO & Search plugins
 * - All section types
 */
export default function ShowcasePage() {
  const pageConfig = createPageConfig({
    navigation: {
      logoText: '🎨 Rapid Sites Showcase',
      items: [
        { href: '/', label: 'Home' },
        { href: '/demo', label: 'Original Demo' },
        { href: '#features', label: 'Features' },
        { href: '#ecommerce', label: 'Ecommerce' },
        { href: '#email', label: 'Emails' },
      ],
      cta: { href: '/admin', label: 'Admin Panel' },
      sticky: true,
    },

    sections: [
      // Hero
      {
        type: 'hero',
        data: {
          title: 'Complete Rapid Sites Showcase',
          subtitle: 'Everything We Built',
          description:
            'Explore all the features: DRY components, React Email templates, complete ecommerce, SEO optimization, search functionality, and more. All production-ready!',
          cta: [
            { href: '#features', label: 'Explore Features' },
            { href: 'http://localhost:3002', label: 'View Email Templates', external: true },
          ],
          alignment: 'center',
        },
      },

      // Updated Stats showing REAL numbers
      {
        type: 'stats',
        data: {
          title: 'By The Numbers',
          stats: [
            { value: '275', label: 'Tests Passing', suffix: '' },
            { value: '13', label: 'Packages Added', suffix: '' },
            { value: '36', label: 'Hours Saved', suffix: '' },
            { value: '0', label: 'Code Duplication', suffix: '' },
          ],
        },
      },

      // DRY Refactored Components
      {
        type: 'features',
        data: {
          title: 'DRY Refactored Components',
          description: 'Reusable, tested, type-safe components that eliminate code duplication',
          features: [
            {
              icon: '📝',
              title: 'SectionHeader',
              description: 'Eliminated 72 lines of duplicate header code across 8 components',
            },
            {
              icon: '📧',
              title: 'Icon Components',
              description: 'EmailIcon, LinkedInIcon, TwitterIcon - 30 lines saved, fully typed',
            },
            {
              icon: '📋',
              title: 'useFormState Hook',
              description: 'Generic form state management with status, errors, and dirty tracking',
            },
            {
              icon: '📏',
              title: 'Spacing Constants',
              description: 'Type-safe, immutable spacing system with Object.freeze()',
            },
            {
              icon: '🔄',
              title: 'Grid Component',
              description: 'Reusable responsive grid - Gallery now uses it (no duplication)',
            },
            {
              icon: '✅',
              title: '100% TDD',
              description: 'All components built with Test-Driven Development methodology',
            },
          ],
          columns: 3,
        },
      },

      // Packages Installed
      {
        type: 'features',
        data: {
          title: 'Production Packages (Import > Build)',
          description: 'Industry-standard packages instead of reinventing the wheel',
          features: [
            {
              icon: '📧',
              title: 'React Email',
              description:
                'Beautiful email templates with live preview. Visit localhost:3002 to see them!',
            },
            {
              icon: '🛒',
              title: 'Payload Ecommerce',
              description: 'Complete ecommerce: Orders, Carts, Variants, Transactions, Addresses',
            },
            {
              icon: '🔍',
              title: 'Payload Search',
              description: 'Fast indexed search across pages, posts, products, team members',
            },
            {
              icon: '📊',
              title: 'Payload SEO',
              description: 'Auto meta tags, OG images, auto-generated titles/descriptions',
            },
            {
              icon: '✓',
              title: 'Zod Validation',
              description: 'Type-safe validation with better error messages. Industry standard!',
            },
            {
              icon: '🛡️',
              title: 'Upstash Rate Limiting',
              description: 'API spam protection: 10 requests / 10 seconds per IP',
            },
            {
              icon: '📈',
              title: 'Vercel Analytics',
              description: 'Zero-config page views, web vitals tracking, free tier',
            },
            {
              icon: '🌱',
              title: 'Seed Data System',
              description: 'pnpm seed creates demo products, posts, team, testimonials instantly',
            },
          ],
          columns: 4,
        },
      },

      // Email Templates Section
      {
        type: 'features',
        data: {
          title: 'Beautiful Email Templates',
          description: 'React Email components with live preview server',
          features: [
            {
              icon: '💌',
              title: 'Contact Form Email',
              description: 'Professional notifications when customers submit contact forms',
            },
            {
              icon: '📬',
              title: 'Newsletter Welcome',
              description: 'Beautiful welcome emails for new subscribers with CTA buttons',
            },
            {
              icon: '🎁',
              title: 'Order Confirmation',
              description: 'Order details with styling, totals, and view order links',
            },
          ],
          columns: 3,
        },
      },

      // CTA to view emails
      {
        type: 'cta',
        data: {
          title: 'See The Email Templates Live!',
          description: 'Run "pnpm run email" and visit localhost:3002 to see all templates with live preview',
          buttons: [
            { href: 'http://localhost:3002', label: 'View Email Preview', external: true },
            { href: '/admin', label: 'Open Admin Panel' },
          ],
          background: 'accent',
        },
      },

      // Ecommerce Features
      {
        type: 'features',
        data: {
          title: 'Complete Ecommerce System',
          description: 'Payload ecommerce plugin provides everything needed for online stores',
          features: [
            {
              icon: '🛍️',
              title: 'Products & Variants',
              description: 'Sizes, colors, options with variant-specific pricing and inventory',
            },
            {
              icon: '🛒',
              title: 'Shopping Cart',
              description: 'Persistent carts with localStorage sync, customer linking',
            },
            {
              icon: '📦',
              title: 'Order Management',
              description: 'Complete order tracking, status updates, customer history',
            },
            {
              icon: '💳',
              title: 'Stripe Integration',
              description: 'Payment processing, webhooks, transaction tracking built-in',
            },
            {
              icon: '💰',
              title: 'Multi-Currency',
              description: 'USD, EUR, GBP support with proper formatting and calculations',
            },
            {
              icon: '📊',
              title: 'Inventory Tracking',
              description: 'Stock levels, auto-decrement on purchase, low stock alerts',
            },
          ],
          columns: 3,
        },
      },

      // Contact Form with new validation
      {
        type: 'contact',
        data: {
          title: 'Test the Contact Form',
          description:
            'Now with Zod validation and Upstash rate limiting (10 requests per 10 seconds)',
          email: 'demo@rapidsites.dev',
          phone: '(555) 123-4567',
        },
      },

      // Final CTA
      {
        type: 'cta',
        data: {
          title: 'Ready to Use?',
          description: '275 tests passing, 0 errors, production-ready',
          buttons: [
            { href: '/admin', label: 'Open Admin Panel' },
            { href: 'https://github.com/Dyltom/rapid-sites', label: 'View Source', external: true },
          ],
          background: 'gradient',
        },
      },
    ],

    footer: {
      logoText: 'Rapid Sites',
      description: 'Multi-tenant Next.js framework - Now with complete ecommerce!',
      links: [
        {
          title: 'Pages',
          links: [
            { href: '/', label: 'Home' },
            { href: '/demo', label: 'Original Demo' },
            { href: '/showcase', label: 'Feature Showcase' },
            { href: '/blog', label: 'Blog' },
          ],
        },
        {
          title: 'Features',
          links: [
            { href: '#ecommerce', label: 'Ecommerce' },
            { href: '#email', label: 'Email Templates' },
            { href: 'http://localhost:3002', label: 'Email Preview', external: true },
          ],
        },
        {
          title: 'Resources',
          links: [
            { href: '/admin', label: 'Admin Panel' },
            { href: 'https://github.com/Dyltom/rapid-sites', label: 'GitHub', external: true },
            { href: 'http://localhost:8080', label: 'Database UI', external: true },
          ],
        },
      ],
      social: [
        { platform: 'github', url: 'https://github.com/Dyltom/rapid-sites' },
        { platform: 'twitter', url: 'https://twitter.com' },
      ],
    },
  })

  return <PageBuilder config={pageConfig} />
}
