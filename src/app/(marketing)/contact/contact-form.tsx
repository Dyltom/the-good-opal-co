'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { sendContactEmail } from './actions'
import { Loader2 } from 'lucide-react'

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  orderNumber: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
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
      subject: '',
      message: '',
      orderNumber: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      const result = await sendContactEmail(data)

      if (result.success) {
        toast({
          title: 'Message sent!',
          description: 'Thank you for contacting us. We\'ll get back to you within 24 hours.',
        })
        reset()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
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
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
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
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
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
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
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
            <p className="text-sm text-red-500 mt-1">{errors.orderNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="subject">
          Subject <span className="text-red-500">*</span>
        </Label>
        <select
          id="subject"
          {...register('subject')}
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opal-electric focus:border-transparent"
          disabled={isSubmitting}
        >
          <option value="">Select a subject</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Order Support">Order Support</option>
          <option value="Custom Order Request">Custom Order Request</option>
          <option value="Product Information">Product Information</option>
          <option value="Wholesale Inquiry">Wholesale Inquiry</option>
          <option value="Returns/Exchanges">Returns/Exchanges</option>
          <option value="Other">Other</option>
        </select>
        {errors.subject && (
          <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>
        )}
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
        />
        {errors.message && (
          <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        By submitting this form, you agree to our{' '}
        <a href="/legal/privacy" className="underline hover:text-gray-700">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}