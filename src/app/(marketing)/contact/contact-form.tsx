'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { trackEnquirySubmitted } from '@/lib/analytics'
import { sendContactEmail } from './actions'
import { contactSchema } from './schema'
import type { ContactFormData } from './schema'
import { inquiryLabels, inquiryTypes } from './contact-intent'
import type { InquiryType } from './contact-intent'
import { CheckCircle2, Loader2 } from 'lucide-react'

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
  const [sent, setSent] = useState<{ reference: string; email: string; delayed: boolean } | null>(
    null
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const sentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sent) return
    sentRef.current?.focus()
    sentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [sent])

  const {
    register,
    handleSubmit,
    reset,
    watch,
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
  const isCourseIntent = watch('inquiryType') === 'course-interest'

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await sendContactEmail(data)

      if (result.success) {
        trackEnquirySubmitted(data.inquiryType)
        setSent({
          reference: result.reference,
          email: data.email,
          delayed: Boolean(result.confirmationDelayed),
        })
        reset()
      } else {
        setSubmitError(result.error)
      }
    } catch {
      setSubmitError('Your message could not be sent. Please try again, or email us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div ref={sentRef} tabIndex={-1} role="status" className="py-6 text-center outline-none">
        <CheckCircle2
          className="mx-auto h-10 w-10 text-opal-electric-accessible"
          aria-hidden="true"
        />
        <h3 className="mt-4 font-serif text-3xl font-medium text-charcoal">Enquiry received</h3>
        <p className="mx-auto mt-3 max-w-md font-sans leading-7 text-charcoal/70">
          Thank you. We will reply to <strong className="text-charcoal">{sent.email}</strong>.
          {sent.delayed
            ? ' Your message is saved, though our confirmation email may take a little longer to arrive.'
            : ' A confirmation is on its way to your inbox.'}
        </p>
        <p className="mt-4 font-sans text-sm text-charcoal/60">
          Reference <span className="font-semibold text-charcoal">{sent.reference}</span>
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/store">Keep browsing</Link>
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => setSent(null)}>
            Send another enquiry
          </Button>
        </div>
      </div>
    )
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
            Name <span className="text-red-600">*</span>
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
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">
            Email <span className="text-red-600">*</span>
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
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
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
            Phone <span className="text-charcoal/65">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+61 4XX XXX XXX"
            className="mt-1"
            disabled={isSubmitting}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        {!isCourseIntent ? (
          <div>
            <Label htmlFor="orderNumber">
              Order number <span className="text-charcoal/65">(if applicable)</span>
            </Label>
            <Input
              id="orderNumber"
              {...register('orderNumber')}
              placeholder="e.g., #1234"
              className="mt-1"
              disabled={isSubmitting}
            />
            {errors.orderNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.orderNumber.message}</p>
            )}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className={isCourseIntent ? 'sm:col-span-2' : undefined}>
          <Label htmlFor="product">
            Course, product, or piece <span className="text-charcoal/65">(optional)</span>
          </Label>
          <Input
            id="product"
            {...register('product')}
            placeholder="Course, product, link, or idea"
            className="mt-1"
            disabled={isSubmitting}
          />
        </div>
        {!isCourseIntent ? (
          <div>
            <Label htmlFor="budget">
              Approximate budget <span className="text-charcoal/65">(optional)</span>
            </Label>
            <Input
              id="budget"
              {...register('budget')}
              placeholder="e.g. AUD $1,500–$2,500"
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>
        ) : null}
      </div>

      <div>
        <Label htmlFor="timeline">
          {isCourseIntent ? 'What timing would suit you?' : 'When do you need it?'}{' '}
          <span className="text-charcoal/65">(optional)</span>
        </Label>
        <Input
          id="timeline"
          {...register('timeline')}
          placeholder={
            isCourseIntent
              ? 'Flexible, soon, or a particular month'
              : 'A date, occasion, or no rush'
          }
          className="mt-1"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="message">
          Message <span className="text-red-600">*</span>
        </Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder={
            isCourseIntent
              ? 'Your experience, preferred cutting method, and tools you already use'
              : 'Please tell us how we can help you...'
          }
          rows={6}
          className="mt-1"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.message)}
          required
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
      </div>

      {submitError ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {submitError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : isCourseIntent ? (
          'Send course enquiry'
        ) : (
          'Send enquiry'
        )}
      </Button>

      <p className="text-center text-xs text-charcoal/65">
        By submitting this form, you agree to our{' '}
        <Link href="/legal/privacy" className="underline hover:text-charcoal">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  )
}
