import { Suspense } from 'react'
import { Container } from '@/components/layout'
import { ConfirmationHandler } from './confirmation-handler'

export default function NewsletterConfirmPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-md mx-auto">
          <Suspense
            fallback={
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
              </div>
            }
          >
            <ConfirmationHandler searchParams={searchParams} />
          </Suspense>
        </div>
      </Container>
    </div>
  )
}