import type { ReactElement } from 'react'
import type { Payload, PayloadRequest } from 'payload'
import { Resend } from 'resend'
import { GiftVoucherEmail, GiftVoucherPurchaseEmail, formatVoucherDate } from '../emails/gift-voucher.tsx'
import type { GiftVoucher } from '../types/payload-types.ts'

type EmailRequest = Partial<PayloadRequest>

function baseUrl(): string {
  return (process.env['NEXT_PUBLIC_APP_URL'] ?? '').replace(/\/$/, '')
}

function voucherDeliveryEmail(voucher: GiftVoucher): string | null {
  return voucher.recipientEmail || voucher.purchaserEmail || null
}

async function recordEmail(
  payload: Payload,
  voucher: GiftVoucher,
  field: 'voucherEmailSentAt' | 'purchaseEmailSentAt' | 'ownerEmailSentAt',
  error: { message: string } | null,
  req?: EmailRequest
): Promise<void> {
  await payload.update({
    collection: 'gift-vouchers',
    id: voucher.id,
    overrideAccess: true,
    depth: 0,
    ...(req ? { req } : {}),
    data: error
      ? { emailError: error.message.slice(0, 1000) }
      : { [field]: new Date().toISOString(), emailError: null },
  })
  if (error) throw new Error(`Resend rejected gift voucher email: ${error.message}`)
}

export async function sendGiftVoucherEmail(
  payload: Payload,
  voucherId: number,
  req?: EmailRequest
): Promise<void> {
  const voucher = await payload.findByID({
    collection: 'gift-vouchers',
    id: voucherId,
    overrideAccess: true,
    depth: 0,
    ...(req ? { req } : {}),
  })
  const to = voucherDeliveryEmail(voucher)
  if (voucher.voucherEmailSentAt || !to) return

  const resend = new Resend(process.env['RESEND_API_KEY'] ?? '')
  const { error } = await resend.emails.send(
    {
      from: process.env['EMAIL_FROM'] ?? '',
      to,
      replyTo: process.env['CONTACT_EMAIL'] || undefined,
      subject: voucher.purchaserName
        ? `A gift voucher from ${voucher.purchaserName}`
        : 'Your Good Opal Co gift voucher',
      react: GiftVoucherEmail({
        code: voucher.code,
        amount: voucher.initialValue,
        expiresAt: voucher.expiresAt,
        recipientName: voucher.recipientName ?? undefined,
        fromName: voucher.purchaserName ?? undefined,
        message: voucher.message ?? undefined,
        baseUrl: baseUrl(),
        supportEmail: process.env['CONTACT_EMAIL'] ?? '',
      }) as ReactElement,
    },
    { idempotencyKey: `gift-voucher/${voucher.id}` }
  )
  await recordEmail(payload, voucher, 'voucherEmailSentAt', error, req)
}

function ownerVoucherEmailText(voucher: GiftVoucher): string {
  return [
    `New gift voucher sold: ${voucher.code}`,
    `Value paid: $${voucher.initialValue.toFixed(2)} AUD`,
    `Valid until: ${formatVoucherDate(voucher.expiresAt)}`,
    '',
    `From: ${voucher.purchaserName ?? ''} <${voucher.purchaserEmail ?? ''}>`,
    `To: ${voucher.recipientName ?? ''} <${voucherDeliveryEmail(voucher) ?? ''}>`,
    ...(voucher.message ? ['', `Message: ${voucher.message}`] : []),
    '',
    `Open the voucher: ${baseUrl()}/admin/collections/gift-vouchers/${voucher.id}`,
  ].join('\n')
}

export async function sendGiftVoucherPurchaseEmails(payload: Payload, voucherId: number): Promise<void> {
  await sendGiftVoucherEmail(payload, voucherId)
  const voucher = await payload.findByID({
    collection: 'gift-vouchers',
    id: voucherId,
    overrideAccess: true,
    depth: 0,
  })
  const resend = new Resend(process.env['RESEND_API_KEY'] ?? '')
  const sentTo = voucherDeliveryEmail(voucher) ?? ''

  if (!voucher.purchaseEmailSentAt && voucher.purchaserEmail) {
    if (sentTo.toLowerCase() === voucher.purchaserEmail.toLowerCase()) {
      await recordEmail(payload, voucher, 'purchaseEmailSentAt', null)
    } else {
      const { error } = await resend.emails.send(
        {
          from: process.env['EMAIL_FROM'] ?? '',
          to: voucher.purchaserEmail,
          replyTo: process.env['CONTACT_EMAIL'] || undefined,
          subject: 'Your gift voucher is on its way',
          react: GiftVoucherPurchaseEmail({
            purchaserName: voucher.purchaserName ?? '',
            amount: voucher.initialValue,
            expiresAt: voucher.expiresAt,
            sentTo,
            recipientName: voucher.recipientName ?? undefined,
            baseUrl: baseUrl(),
            supportEmail: process.env['CONTACT_EMAIL'] ?? '',
          }) as ReactElement,
        },
        { idempotencyKey: `gift-voucher-purchase/${voucher.id}` }
      )
      await recordEmail(payload, voucher, 'purchaseEmailSentAt', error)
    }
  }

  if (!voucher.ownerEmailSentAt) {
    const { error } = await resend.emails.send(
      {
        from: process.env['EMAIL_FROM'] ?? '',
        to: process.env['CONTACT_EMAIL'] ?? '',
        replyTo: voucher.purchaserEmail || undefined,
        subject: `New gift voucher - ${voucher.code}`,
        text: ownerVoucherEmailText(voucher),
      },
      { idempotencyKey: `owner-gift-voucher/${voucher.id}` }
    )
    await recordEmail(payload, voucher, 'ownerEmailSentAt', error)
  }
}
