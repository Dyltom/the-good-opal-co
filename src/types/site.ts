/**
 * Site and page configuration types
 */

import type { ID, Image, Link, SEO, Slug, Timestamps } from './common'

/**
 * Page types
 */
export type PageType = 'home' | 'about' | 'services' | 'contact' | 'blog' | 'custom'

/**
 * Page status
 */
export type PageStatus = 'draft' | 'published' | 'archived'

/**
 * Page entity
 */
export interface Page extends Timestamps {
  id: ID
  tenantId: ID
  title: string
  slug: Slug
  type: PageType
  status: PageStatus
  template?: string
  content: PageContent
  seo?: SEO
  publishedAt?: Date | null
}

/**
 * Page content structure
 */
export interface PageContent {
  sections: PageSection[]
}

/**
 * Page section
 */
export interface PageSection {
  id: string
  type: SectionType
  order: number
  visible: boolean
  data: Record<string, unknown>
}

/**
 * Available section types
 */
export type SectionType =
  | 'hero'
  | 'about'
  | 'services'
  | 'features'
  | 'testimonials'
  | 'team'
  | 'pricing'
  | 'cta'
  | 'contact'
  | 'faq'
  | 'gallery'
  | 'stats'
  | 'blog-list'
  | 'custom-html'

/**
 * Navigation menu item
 */
export interface MenuItem {
  id: string
  label: string
  href: string
  order: number
  external?: boolean
  children?: MenuItem[]
}

/**
 * Navigation menu
 */
export interface NavigationMenu {
  id: ID
  tenantId: ID
  name: string
  slug: Slug
  items: MenuItem[]
}

/**
 * Blog post
 */
export interface BlogPost extends Timestamps {
  id: ID
  tenantId: ID
  title: string
  slug: Slug
  excerpt?: string
  content: string
  featuredImage?: Image
  author?: Author
  categories?: Category[]
  tags?: Tag[]
  status: PageStatus
  publishedAt?: Date | null
  seo?: SEO
}

/**
 * Blog author
 */
export interface Author {
  id: ID
  name: string
  slug: Slug
  bio?: string
  avatar?: Image
  social?: {
    twitter?: string
    linkedin?: string
    website?: string
  }
}

/**
 * Blog category
 */
export interface Category {
  id: ID
  tenantId: ID
  name: string
  slug: Slug
  description?: string
  postCount?: number
}

/**
 * Blog tag
 */
export interface Tag {
  id: ID
  tenantId: ID
  name: string
  slug: Slug
  postCount?: number
}

/**
 * Testimonial
 */
export interface Testimonial extends Timestamps {
  id: ID
  tenantId: ID
  name: string
  role?: string
  company?: string
  content: string
  rating?: number
  avatar?: Image
  featured?: boolean
  approved?: boolean
}

/**
 * Team member
 */
export interface TeamMember extends Timestamps {
  id: ID
  tenantId: ID
  name: string
  slug: Slug
  role: string
  bio?: string
  avatar?: Image
  email?: string
  phone?: string
  social?: {
    linkedin?: string
    twitter?: string
  }
  order: number
}

/**
 * Service offering
 */
export interface Service extends Timestamps {
  id: ID
  tenantId: ID
  name: string
  slug: Slug
  description: string
  icon?: string
  image?: Image
  features?: string[]
  price?: string
  order: number
  featured?: boolean
}

/**
 * Pricing plan
 */
export interface PricingPlan extends Timestamps {
  id: ID
  tenantId: ID
  name: string
  slug: Slug
  description?: string
  price: string
  interval?: 'monthly' | 'yearly' | 'one-time'
  features: PricingFeature[]
  highlighted?: boolean
  order: number
  cta?: Link
}

/**
 * Pricing feature
 */
export interface PricingFeature {
  text: string
  included: boolean
}

/**
 * FAQ item
 */
export interface FAQ extends Timestamps {
  id: ID
  tenantId: ID
  question: string
  answer: string
  category?: string
  order: number
}

/**
 * Gallery image
 */
export interface GalleryImage extends Timestamps {
  id: ID
  tenantId: ID
  image: Image
  category?: string
  order: number
}

/**
 * Contact form submission
 */
export interface ContactSubmission extends Timestamps {
  id: ID
  tenantId: ID
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  metadata?: Record<string, unknown>
}
