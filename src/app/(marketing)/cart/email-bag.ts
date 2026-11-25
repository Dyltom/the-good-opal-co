'use server'

import type { ReactElement } from 'react'
import { Resend } from 'resend'
import { z } from 'zod'
import { SavedBagEmail } from '@/emails/saved-bag'
import { getCart } from '@/lib/cart'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'

export interface EmailBagState {
  success: boolean
  message: string
}

const SENT = 'Sent. Check your inbox for your bag.'
const HOUR = 60 * 60

export async function emailMyBag(
  _prev: EmailBagState | null,
  formData: FormData
): Promise<EmailBagState> {
  const email = z.string().trim().email().safeParse(formData.get('email'))
  if (!email.success) return { success: false, message: 'Please enter a valid email address.' }
  if (formData.get('website') || formData.get('js') !== '1') return { success: true, message: SENT }

  const cart = await getCart()
  if (cart.items.length === 0) return { success: false, message: 'Your bag is empty.' }

  const allowed =
    (await checkRateLimit({
      scope: 'email-bag',
      identifier: await getRequestIdentifier(email.data),
      limit: 2,
      windowSeconds: 24 * HOUR,
    })) &&
    (await checkRateLimit({
      scope: 'email-bag-address',
      identifier: await getRequestIdentifier(),
      limit: 3,
      windowSeconds: HOUR,
    })) &&
    (await checkRateLimit({
      scope: 'email-bag-sitewide',
      identifier: 'all',
      limit: 20,
      windowSeconds: HOUR,
    }))
  if (!allowed) return { success: false, message: 'Too many attempts. Please try again later.' }

  const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] ?? '').replace(/\/$/, '')
  const sent = await new Resend(process.env['RESEND_API_KEY'] ?? '').emails
    .send({
      from: process.env['EMAIL_FROM'] ?? '',
      to: email.data,
      replyTo: process.env['CONTACT_EMAIL'] || undefined,
      subject: 'Your bag from The Good Opal Co',
      react: SavedBagEmail({
        lines: cart.items,
        baseUrl,
        supportEmail: process.env['CONTACT_EMAIL'] ?? '',
      }) as ReactElement,
    })
    .catch((error: unknown) => ({ error: { message: String(error) } }))
  if (sent.error) {
    console.error(`Saved bag email rejected: ${sent.error.message}`)
    return { success: false, message: 'We could not send that just now. Please try again.' }
  }
  return { success: true, message: SENT }
}
