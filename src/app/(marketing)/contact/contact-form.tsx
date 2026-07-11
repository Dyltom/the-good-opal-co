'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { sendContactEmail } from './actions'
import { contactSchema } from './schema'
import type { ContactFormData } from './schema'
import { inquiryLabels, inquiryTypes } from './contact-intent'
import type { InquiryType } from './contact-intent'
import { Loader2 } from 'lucide-react'

interface ContactFormProps {
  initialInquiry: InquiryType
  initialProduct?: string
  initialMessage?: string
  initialDesignConfiguration?: string
}

export function ContactForm({
  initialInquiry,
  initialProduct = '',
  initialMessage = '',
  initialDesignConfiguration = '',
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      inquiryType: initialInquiry,
      message: initialMessage,
      orderNumber: '',
      product: initialProduct,
      budget: '',
      timeline: '',
      designConfiguration: initialDesignConfiguration,
      website: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      const result = await sendContactEmail(data)

      if (result.success) {
        toast({
          title: 'Enquiry received',
          description: result.confirmationDelayed
            ? `Saved as ${result.reference}. Email confirmation may be delayed.`
            : `Saved as ${result.reference}. We\'ll reply by email.`,
        })
        reset()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" {...register('website')} tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" {...register('designConfiguration')} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Your name"
            className="mt-1"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.name)}
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your@email.com"
            className="mt-1"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            required
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="inquiryType">
          What can we help with? <span className="text-red-600">*</span>
        </Label>
        <select
          id="inquiryType"
          {...register('inquiryType')}
          className="mt-1 min-h-11 w-full rounded-md border border-warm-grey bg-white px-3 py-2 text-charcoal outline-none focus-visible:border-opal-electric-accessible focus-visible:ring-2 focus-visible:ring-opal-electric/30"
          disabled={isSubmitting}
          required
        >
          {inquiryTypes.map((type) => (
            <option key={type} value={type}>
              {inquiryLabels[type]}
            </option>
          ))}
        </select>
        {errors.inquiryType && (
          <p className="mt-1 text-sm text-red-600">Please choose an inquiry type.</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">
            Phone <span className="text-gray-500">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+61 4XX XXX XXX"
            className="mt-1"
            disabled={isSubmitting}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="orderNumber">
            Order Number <span className="text-gray-500">(if applicable)</span>
          </Label>
          <Input
            id="orderNumber"
            {...register('orderNumber')}
            placeholder="e.g., #1234"
            className="mt-1"
            disabled={isSubmitting}
          />
          {errors.orderNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.orderNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="product">
            Product or piece <span className="text-gray-500">(optional)</span>
          </Label>
          <Input
            id="product"
            {...register('product')}
            placeholder="Name, link, or idea"
            className="mt-1"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="budget">
            Approximate budget <span className="text-gray-500">(optional)</span>
          </Label>
          <Input
            id="budget"
            {...register('budget')}
            placeholder="e.g. AUD $1,500–$2,500"
            className="mt-1"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="timeline">
          When do you need it? <span className="text-gray-500">(optional)</span>
        </Label>
        <Input
          id="timeline"
          {...register('timeline')}
          placeholder="A date, occasion, or no rush"
          className="mt-1"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="message">
          Message <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder="Please tell us how we can help you..."
          rows={6}
          className="mt-1"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.message)}
          required
        />
        {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </Button>

      <p className="text-center text-xs text-gray-500">
        By submitting this form, you agree to our{' '}
        <a href="/legal/privacy" className="underline hover:text-gray-700">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}
