'use client'

import { Container, Grid, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'
import { useFormState } from '@/hooks'

/**
 * Contact Section Props
 */
interface ContactSectionProps {
  title?: string
  description?: string
  email?: string
  phone?: string
  address?: string
  showMap?: boolean
}

/**
 * Contact form field types
 */
type ContactFormFields = {
  name: string
  email: string
  phone: string
  message: string
}

/**
 * Contact Section Component
 * Contact form with optional contact information
 */
export function Contact({
  title = 'Get in Touch',
  description,
  email,
  phone,
  address,
  showMap = false,
}: ContactSectionProps) {
  const form = useFormState<ContactFormFields>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    form.setStatus('loading')
    form.clearErrors()

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.values),
      })

      const data = await response.json()

      if (response.ok) {
        form.setStatus('success')
        form.reset()
        alert(data.data?.message || 'Message sent successfully!')
      } else {
        form.setStatus('error')
        alert(data.message || 'Failed to send message')
      }
    } catch {
      form.setStatus('error')
      alert('Failed to send message. Please try again.')
    }
  }

  return (
    <Section padding="lg">
      <Container>
        <SectionHeader title={title} description={description} />

        <Grid cols={showMap || email || phone || address ? 2 : 1} gap="lg">
          {/* Contact Form */}
          <Card className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.values.name}
                  onChange={(e) => form.setValue('name', e.target.value)}
                  required
                  disabled={form.isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.values.email}
                  onChange={(e) => form.setValue('email', e.target.value)}
                  required
                  disabled={form.isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.values.phone}
                  onChange={(e) => form.setValue('phone', e.target.value)}
                  disabled={form.isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.values.message}
                  onChange={(e) => form.setValue('message', e.target.value)}
                  required
                  disabled={form.isSubmitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={form.isSubmitting}>
                {form.isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          {(email || phone || address || showMap) && (
            <div className="space-y-6">
              {(email || phone || address) && (
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    {email && (
                      <div>
                        <p className="text-sm font-medium mb-1">Email</p>
                        <a
                          href={`mailto:${email}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {email}
                        </a>
                      </div>
                    )}
                    {phone && (
                      <div>
                        <p className="text-sm font-medium mb-1">Phone</p>
                        <a
                          href={`tel:${phone}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {phone}
                        </a>
                      </div>
                    )}
                    {address && (
                      <div>
                        <p className="text-sm font-medium mb-1">Address</p>
                        <p className="text-muted-foreground">{address}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {showMap && (
                <Card className="p-6 h-64">
                  <div className="w-full h-full bg-muted rounded flex items-center justify-center text-muted-foreground">
                    Map Placeholder
                  </div>
                </Card>
              )}
            </div>
          )}
        </Grid>
      </Container>
    </Section>
  )
}
