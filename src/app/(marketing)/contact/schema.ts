import { z } from 'zod'
import { inquiryTypes } from './contact-intent'

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  phone: z.string().trim().max(40).optional(),
  inquiryType: z.enum(inquiryTypes),
  message: z.string().trim().min(10, 'Please add a little more detail.').max(5000),
  orderNumber: z.string().trim().max(80).optional(),
  product: z.string().trim().max(160).optional(),
  budget: z.string().trim().max(80).optional(),
  timeline: z.string().trim().max(80).optional(),
  designConfiguration: z.string().trim().max(1000).optional(),
  website: z.string().max(0).optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>
