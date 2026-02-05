import { confirmNewsletterSubscription } from '../actions'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function ConfirmationHandler({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-display font-bold text-charcoal mb-2">
          Invalid Confirmation Link
        </h1>
        <p className="text-content mb-6">
          This confirmation link appears to be invalid or incomplete.
        </p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    )
  }

  // Attempt to confirm the subscription
  const result = await confirmNewsletterSubscription(token)

  if (!result.success) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-display font-bold text-charcoal mb-2">
          Confirmation Failed
        </h1>
        <p className="text-content mb-6">
          {result.message || 'We couldn\'t confirm your subscription. The link may have expired.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Success - will redirect to success page
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
      </div>
      <h1 className="text-2xl font-display font-bold text-charcoal mb-2">
        Confirming your subscription...
      </h1>
      <p className="text-content">
        Please wait while we confirm your newsletter subscription.
      </p>
    </div>
  )
}