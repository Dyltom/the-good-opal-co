import type { Customer } from '@/types/payload-types'

export interface ContactCustomerInput {
  email: string
  inquiryType: string
  name: string
  phone?: string
}

type ContactCustomerMutation =
  | {
      kind: 'create'
      data: {
        email: string
        name: string
        phone?: string
        source: 'contact'
        tags: { tag: string }[]
        totalOrders: number
        totalSpent: number
      }
    }
  | {
      kind: 'update'
      data: {
        name?: string
        phone?: string
        tags: { tag: string }[]
      }
    }

export function contactCustomerMutation(
  input: ContactCustomerInput,
  existing?: Customer
): ContactCustomerMutation {
  const tag = `interest:${input.inquiryType}`
  if (!existing) {
    return {
      kind: 'create',
      data: {
        email: input.email.trim().toLowerCase(),
        name: input.name,
        phone: input.phone,
        source: 'contact',
        tags: [{ tag }],
        totalOrders: 0,
        totalSpent: 0,
      },
    }
  }

  const tags = (existing.tags ?? []).map(({ tag: existingTag }) => ({ tag: existingTag }))
  if (!tags.some(({ tag: existingTag }) => existingTag === tag)) tags.push({ tag })

  return {
    kind: 'update',
    data: {
      name: existing.name || input.name,
      phone: existing.phone || input.phone,
      tags,
    },
  }
}
