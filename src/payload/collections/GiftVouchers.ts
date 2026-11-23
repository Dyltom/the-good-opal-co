import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'
import { validateCurrencyAmount } from '../../lib/product-validation.ts'
import {
  generateGiftVoucherCode,
  giftVoucherExpiresAt,
  normaliseGiftVoucherCode,
} from '../../lib/gift-voucher-rules.ts'
import { sendGiftVoucherEmail } from '../../lib/gift-voucher-email.ts'

export const GiftVouchers: CollectionConfig = {
  slug: 'gift-vouchers',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'status', 'balance', 'initialValue', 'expiresAt', 'recipientName'],
    group: 'E-commerce',
    description:
      'Gift vouchers sold online or issued by hand. To issue one, enter the value and, if it should be emailed, the recipient. The code, balance and expiry are set automatically.',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: () => false,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (!data) return data
        if (operation === 'create') {
          const issuedAt = new Date()
          return {
            ...data,
            code: data['code'] ? normaliseGiftVoucherCode(String(data['code'])) : generateGiftVoucherCode(),
            balance: data['balance'] ?? data['initialValue'],
            expiresAt: data['expiresAt'] || giftVoucherExpiresAt(issuedAt).toISOString(),
            status: data['status'] ?? 'active',
            source: data['source'] ?? 'manual',
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create' || doc.source !== 'manual' || !doc.recipientEmail) return doc
        try {
          await sendGiftVoucherEmail(req.payload, doc.id, req)
        } catch (error) {
          req.payload.logger.error({ err: error, msg: `Gift voucher ${doc.code} email failed` })
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Generated automatically when the voucher is created' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Used', value: 'used' },
        { label: 'Void', value: 'void' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Bought online', value: 'purchase' },
        { label: 'Issued by hand', value: 'manual' },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'initialValue',
      type: 'number',
      required: true,
      min: 1,
      validate: validateCurrencyAmount,
      admin: { description: 'Face value in AUD' },
    },
    {
      name: 'balance',
      type: 'number',
      required: true,
      min: 0,
      validate: validateCurrencyAmount,
      admin: { description: 'Remaining value in AUD. Set from the face value when created.' },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      index: true,
      admin: { position: 'sidebar', description: 'Three years from issue unless changed' },
    },
    { name: 'purchaserName', type: 'text' },
    { name: 'purchaserEmail', type: 'email' },
    { name: 'recipientName', type: 'text' },
    {
      name: 'recipientEmail',
      type: 'email',
      admin: { description: 'The voucher is emailed here when it is created' },
    },
    { name: 'message', type: 'textarea', maxLength: 300 },
    {
      name: 'stripeCheckoutSessionId',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'voucherEmailSentAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'purchaseEmailSentAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'ownerEmailSentAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'emailError', type: 'textarea', admin: { readOnly: true } },
    {
      name: 'redemptions',
      type: 'array',
      admin: { readOnly: true },
      fields: [
        { name: 'checkoutToken', type: 'text', required: true, index: true },
        { name: 'stripeSessionId', type: 'text' },
        { name: 'paidOrder', type: 'relationship', relationTo: 'orders' },
        { name: 'amount', type: 'number', required: true, min: 0, validate: validateCurrencyAmount },
        {
          name: 'state',
          type: 'select',
          required: true,
          options: [
            { label: 'Held at checkout', value: 'held' },
            { label: 'Captured by paid order', value: 'captured' },
            { label: 'Released', value: 'released' },
          ],
        },
        { name: 'holdExpiresAt', type: 'date' },
        { name: 'heldAt', type: 'date', required: true },
      ],
    },
  ],
  timestamps: true,
}
