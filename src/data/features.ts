/**
 * Features & Benefits Data
 * Reusable feature definitions for why-choose-us sections
 */
import type { ReactNode } from 'react'
import { SHIPPING_MESSAGES } from '@/lib/constants/shipping'

export interface Feature {
  icon: string | ReactNode
  title: string
  description: string
}

export const WHY_CHOOSE_FEATURES: Feature[] = [
  {
    icon: 'AU',
    title: 'Australian Opals',
    description: 'Known origin and product details are disclosed on each listing',
  },
  {
    icon: '01',
    title: 'Individual Character',
    description: 'Photography and measurements help you compare each one-of-a-kind piece',
  },
  {
    icon: 'Care',
    title: 'Opal Care Guidance',
    description: 'Practical advice helps you wear, clean, and store your piece safely',
  },
  {
    icon: 'Ask',
    title: 'Personal Guidance',
    description: 'Request more detail or a closer look before choosing a piece',
  },
  {
    icon: 'Ship',
    title: 'Secure Shipping',
    description: SHIPPING_MESSAGES.FEATURE_DESCRIPTION,
  },
  {
    icon: '30',
    title: 'Eligible Returns',
    description: '30-day change-of-mind returns for eligible standard, unused pieces',
  },
]

export const TRUST_STATS: Feature[] = [
  {
    icon: 'AU',
    title: 'Australian Opals',
    description: 'Details shown per piece',
  },
  {
    icon: '$15',
    title: 'Standard Delivery',
    description: 'Below AUD 500',
  },
  {
    icon: '$0',
    title: 'Standard Delivery',
    description: 'At AUD 500 or more',
  },
  {
    icon: '30',
    title: 'Eligible Returns',
    description: 'Days from delivery',
  },
]
