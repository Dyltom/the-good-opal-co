import { z } from 'zod'
import {
  GIFT_VOUCHER_MAX_AMOUNT,
  GIFT_VOUCHER_MESSAGE_MAX,
  GIFT_VOUCHER_MIN_AMOUNT,
} from '@/lib/gift-voucher-rules'

export const giftVoucherOrderSchema = z
  .object({
    amount: z
      .number({ message: 'Choose an amount' })
      .int('Use a whole-dollar amount')
      .min(GIFT_VOUCHER_MIN_AMOUNT, `The smallest voucher is $${GIFT_VOUCHER_MIN_AMOUNT}`)
      .max(GIFT_VOUCHER_MAX_AMOUNT, `The largest voucher is $${GIFT_VOUCHER_MAX_AMOUNT}`),
    sendToSelf: z.boolean(),
    recipientName: z.string().trim().max(100),
    recipientEmail: z.string().trim().max(254),
    senderName: z.string().trim().min(1, 'Add your name so they know who it is from').max(100),
    message: z
      .string()
      .trim()
      .max(GIFT_VOUCHER_MESSAGE_MAX, `Keep the message under ${GIFT_VOUCHER_MESSAGE_MAX} characters`),
  })
  .superRefine((value, ctx) => {
    if (value.sendToSelf) return
    if (!value.recipientName) {
      ctx.addIssue({ code: 'custom', path: ['recipientName'], message: 'Add the recipient name' })
    }
    if (!z.string().email().safeParse(value.recipientEmail).success) {
      ctx.addIssue({ code: 'custom', path: ['recipientEmail'], message: 'Add a valid email for the recipient' })
    }
  })

export type GiftVoucherOrder = z.infer<typeof giftVoucherOrderSchema>
