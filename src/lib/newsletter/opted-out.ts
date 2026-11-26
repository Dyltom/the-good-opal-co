import type { Customer } from '@/types/payload-types'
import { UNSUBSCRIBED_TAG } from './service'

export function optedOut(customer: Customer | undefined): boolean {
  if (!customer) return false
  if (customer.tags?.some(({ tag }) => tag === UNSUBSCRIBED_TAG)) return true
  return !customer.subscribedToNewsletter && Boolean(customer.subscribedAt)
}
