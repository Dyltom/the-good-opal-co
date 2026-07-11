import { NextRequest, NextResponse } from 'next/server'
import { deliverCustomQuote } from '@/lib/custom-quotes/delivery'
import { getPayload } from '@/lib/payload'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 })
  }

  const payload = await getPayload()
  const auth = await payload.auth({ headers: request.headers, canSetHeaders: false })
  if (!auth.user || auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  }
  const id = Number((await params).id)
  if (!Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json({ error: 'Invalid quote ID.' }, { status: 400 })
  }

  const quote = await payload.findByID({
    collection: 'custom-quotes',
    id,
    overrideAccess: true,
    depth: 0,
  })
  if (quote.status === 'sent' || quote.status === 'accepted') {
    return NextResponse.json({ sent: true, message: 'Quote was already delivered.' })
  }
  if (quote.status !== 'draft' || new Date(quote.validUntil).getTime() <= Date.now()) {
    return NextResponse.json(
      { error: 'Only a live draft quote can be delivered.' },
      { status: 409 }
    )
  }

  const attemptAt = new Date().toISOString()
  await payload.update({
    collection: 'custom-quotes',
    id: quote.id,
    overrideAccess: true,
    context: { quoteDeliveryEvidence: true },
    data: {
      deliveryStatus: 'issuing',
      deliveryAttemptCount: (quote.deliveryAttemptCount ?? 0) + 1,
      deliveryLastAttemptAt: attemptAt,
      customerEmailError: null,
    },
  })

  try {
    const delivery = await deliverCustomQuote(quote, payload)
    await payload.update({
      collection: 'custom-quotes',
      id: quote.id,
      overrideAccess: true,
      context: { quoteDeliveryEvidence: true },
      data: {
        status: 'sent',
        deliveryStatus: 'sent',
        customerEmailSentAt: delivery.sentAt,
        customerEmailProviderId: delivery.providerId,
        customerEmailError: null,
      },
    })
    return NextResponse.json({ sent: true, message: 'Quote delivered securely.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown delivery error'
    await payload.update({
      collection: 'custom-quotes',
      id: quote.id,
      overrideAccess: true,
      context: { quoteDeliveryEvidence: true },
      data: { deliveryStatus: 'failed', customerEmailError: message.slice(0, 1000) },
    })
    console.error(`Custom quote ${quote.id} delivery failed`)
    return NextResponse.json(
      { error: 'Quote delivery failed. The draft is safe; retry from the quote.' },
      { status: 502 }
    )
  }
}
