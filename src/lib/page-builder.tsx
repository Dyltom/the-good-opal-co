/**
 * Page Builder System
 * DRY approach to building pages from configuration
 * Avoids template code duplication
 */

import type { ReactNode } from 'react'
import { Navigation, Footer } from '@/components/navigation'
import {
  Hero,
  Features,
  Stats,
  Testimonials,
  CTA,
  Contact,
} from '@/components/sections'
import type {
  HeroSectionData,
  FeaturesSectionData,
  StatsSectionData,
  CTASectionData,
  NavItem,
  FooterLinkGroup,
  SocialLink,
  Link,
  Testimonial,
} from '@/types'

/**
 * Page Section Configuration
 * Union type of all possible section types
 */
export type PageSectionConfig =
  | { type: 'hero'; data: HeroSectionData }
  | { type: 'features'; data: FeaturesSectionData }
  | { type: 'stats'; data: StatsSectionData }
  | { type: 'testimonials'; data: TestimonialsSectionProps }
  | { type: 'cta'; data: CTASectionData }
  | { type: 'contact'; data: ContactSectionProps }
  | { type: 'custom'; component: ReactNode }

/**
 * Testimonials Section Props
 */
interface TestimonialsSectionProps {
  title?: string
  description?: string
  testimonials: Array<
    Pick<Testimonial, 'name' | 'role' | 'company' | 'content' | 'avatar' | 'rating'>
  >
  columns?: 2 | 3
}

/**
 * Contact Section Props
 */
interface ContactSectionProps {
  title?: string
  description?: string
  email?: string
  phone?: string
  address?: string
  showMap?: boolean
}

/**
 * Page Configuration
 * Complete page definition as a data structure
 */
export interface PageConfig {
  // Navigation
  navigation?: {
    logoText?: string
    logo?: { id: string; url: string; alt: string; width?: number; height?: number }
    items?: NavItem[]
    cta?: Link
    sticky?: boolean
  }

  // Sections
  sections: PageSectionConfig[]

  // Footer
  footer?: {
    logoText?: string
    logo?: { id: string; url: string; alt: string; width?: number; height?: number }
    description?: string
    links?: FooterLinkGroup[]
    social?: SocialLink[]
    copyright?: string
  }
}

/**
 * Section Renderer
 * Maps section config to React components
 */
function renderSection(section: PageSectionConfig, index: number): ReactNode {
  switch (section.type) {
    case 'hero':
      return <Hero key={`hero-${index}`} {...section.data} />
    case 'features':
      return <Features key={`features-${index}`} {...section.data} />
    case 'stats':
      return <Stats key={`stats-${index}`} {...section.data} />
    case 'testimonials':
      return <Testimonials key={`testimonials-${index}`} {...section.data} />
    case 'cta':
      return <CTA key={`cta-${index}`} {...section.data} />
    case 'contact':
      return <Contact key={`contact-${index}`} {...section.data} />
    case 'custom':
      return section.component
    default:
      return null
  }
}

/**
 * Page Builder Component
 * Renders a complete page from configuration
 */
export function PageBuilder({ config }: { config: PageConfig }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      {config.navigation && <Navigation items={[]} {...config.navigation} />}

      {/* Main Content */}
      <main className="flex-1">
        {config.sections.map((section, index) => renderSection(section, index))}
      </main>

      {/* Footer */}
      {config.footer && <Footer {...config.footer} />}
    </div>
  )
}

/**
 * Create page config helper
 * Type-safe builder for page configurations
 */
export function createPageConfig(config: PageConfig): PageConfig {
  return config
}
