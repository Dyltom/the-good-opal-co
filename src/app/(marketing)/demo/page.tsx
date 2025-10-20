import { PageBuilder, createPageConfig } from '@/lib/page-builder'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rapid Sites - PageBuilder Demo',
  description: 'See how to build pages using the PageBuilder configuration system',
}

/**
 * Demo Page using PageBuilder
 * Shows how to build pages with configuration instead of templates
 */
export default function DemoPage() {
  const pageConfig = createPageConfig({
    navigation: {
      logoText: 'Rapid Sites Demo',
      items: [
        { href: '/', label: 'Home' },
        { href: '#features', label: 'Features' },
        { href: '#stats', label: 'Stats' },
        { href: '#contact', label: 'Contact' },
      ],
      cta: { href: 'https://github.com/Dyltom/rapid-sites', label: 'GitHub', external: true },
      sticky: true,
    },

    sections: [
      {
        type: 'hero',
        data: {
          title: 'Build with Configuration, Not Code',
          subtitle: 'DRY Architecture',
          description:
            'Define pages as data structures. No more template boilerplate. Type-safe, maintainable, and reusable.',
          cta: [
            { href: '#features', label: 'See How It Works' },
            { href: '/blog', label: 'Read Blog' },
          ],
          alignment: 'center',
        },
      },
      {
        type: 'stats',
        data: {
          title: 'Framework Stats',
          stats: [
            { value: '95', label: 'Tests Passing', suffix: '+' },
            { value: '5', label: 'Phases Complete' },
            { value: '60', label: 'Components', suffix: '+' },
            { value: '100', label: 'Type Safety', suffix: '%' },
          ],
        },
      },
      {
        type: 'features',
        data: {
          title: 'Why Use PageBuilder?',
          description: 'DRY principles make development faster and more maintainable',
          features: [
            {
              icon: '📝',
              title: 'Configuration-Based',
              description: 'Define pages as JSON-like objects instead of writing JSX templates',
            },
            {
              icon: '🔄',
              title: 'Fully Reusable',
              description: 'Section components used across all pages without duplication',
            },
            {
              icon: '✅',
              title: 'Type-Safe',
              description: 'TypeScript ensures your configuration is always valid',
            },
            {
              icon: '🎯',
              title: 'Single Source of Truth',
              description: 'Update a section component once, apply everywhere',
            },
            {
              icon: '🚀',
              title: 'Rapid Development',
              description: 'Build new pages in minutes by composing existing sections',
            },
            {
              icon: '🛠️',
              title: 'Easy to Maintain',
              description: 'Clear separation between data and presentation logic',
            },
          ],
          columns: 3,
        },
      },
      {
        type: 'cta',
        data: {
          title: 'Ready to Build?',
          description: 'Start using the PageBuilder system for your next project',
          buttons: [
            { href: 'https://github.com/Dyltom/rapid-sites', label: 'View Source', external: true },
            { href: '#contact', label: 'Get Started' },
          ],
          background: 'gradient',
        },
      },
      {
        type: 'contact',
        data: {
          title: 'Get in Touch',
          description: 'Have questions? Reach out to us',
          email: 'hello@rapidsites.dev',
          phone: '(555) 123-4567',
        },
      },
    ],

    footer: {
      logoText: 'Rapid Sites',
      description: 'Multi-tenant Next.js framework built with DRY principles',
      links: [
        {
          title: 'Framework',
          links: [
            { href: '/', label: 'Home' },
            { href: '/demo', label: 'Demo' },
            { href: '/blog', label: 'Blog' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { href: 'https://github.com/Dyltom/rapid-sites', label: 'GitHub', external: true },
            { href: '/docs', label: 'Docs' },
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
