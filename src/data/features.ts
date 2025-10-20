/**
 * Features & Benefits Data
 * Reusable feature definitions for why-choose-us sections
 */

export interface Feature {
  icon: string
  title: string
  description: string
}

export const WHY_CHOOSE_FEATURES: Feature[] = [
  {
    icon: '💎',
    title: 'Authentic Australian',
    description: 'Every opal sourced directly from Australian miners, certified for authenticity',
  },
  {
    icon: '🌈',
    title: 'Vibrant Color Play',
    description: 'Hand-selected for exceptional fire and color - blues, greens, pinks, and more',
  },
  {
    icon: '✨',
    title: 'Expert Craftsmanship',
    description: 'Each piece carefully designed to showcase the opal\'s natural beauty',
  },
  {
    icon: '♻️',
    title: 'Ethically Sourced',
    description: 'Supporting small-scale Australian miners with fair prices',
  },
  {
    icon: '📦',
    title: 'Secure Shipping',
    description: 'Fully insured express shipping worldwide with elegant gift packaging',
  },
  {
    icon: '💯',
    title: 'Authenticity Guarantee',
    description: 'Certificate of authenticity with every purchase',
  },
]

export const TRUST_STATS: Feature[] = [
  {
    icon: '100%',
    title: 'Authentic Australian',
    description: 'All opals certified',
  },
  {
    icon: '✓',
    title: 'Certified',
    description: 'Every Purchase',
  },
  {
    icon: '🌏',
    title: 'Secure',
    description: 'Shipping Worldwide',
  },
  {
    icon: '♻️',
    title: 'Ethical',
    description: 'Sourcing Practices',
  },
]
