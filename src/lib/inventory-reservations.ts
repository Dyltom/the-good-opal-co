import type Stripe from 'stripe'
import type { InventoryReservation } from '@/types/payload-types'
import { dollarsToCents } from '@/lib/checkout-pricing'
import { getPayload } from '@/lib/payload'

// Stripe requires expires_at to be at least 30 minutes after it receives the
// request. One minute of transport margin prevents a boundary rejection.
export const CHECKOUT_RESERVATION_MINUTES = 31
export const INVENTORY_RESERVATION_METADATA_KEY = 'inventoryReservationToken'

export interface ReservationItemInput {
  productId: string
  slug: string
  name: string
  unitAmountCents: number
  quantity: number
}

export class InventoryUnavailableError extends Error {
  constructor(message = 'One or more pieces are no longer available.') {
    super(message)
    this.name = 'InventoryUnavailableError'
  }
}

function isSerializationFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? error.code : undefined
  if (code === '40001') return true
  const cause = 'cause' in error ? error.cause : undefined
  return cause !== error && isSerializationFailure(cause)
}

async function withSerializationRetry<T>(work: () => Promise<T>): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await work()
    } catch (error) {
      lastError = error
      if (!isSerializationFailure(error)) throw error
    }
  }
  throw lastError
}

export function checkoutReservationExpiresAt(now = new Date()): Date {
  return new Date(now.getTime() + CHECKOUT_RESERVATION_MINUTES * 60 * 1000)
}

export function reservationTokenFromSession(session: Stripe.Checkout.Session): string | null {
  return (
    session.metadata?.[INVENTORY_RESERVATION_METADATA_KEY] ?? session.client_reference_id ?? null
  )
}

export function reservationMatchesCheckoutItems(
  reserved: InventoryReservation['items'],
  paid: readonly ReservationItemInput[]
): boolean {
  if (reserved.length !== paid.length) return false

  const reservedByProduct = new Map(
    reserved.map((item) => [
      item.productId,
      {
        slug: item.slug,
        name: item.name,
        unitAmountCents: item.unitAmountCents,
        quantity: item.quantity,
      },
    ])
  )

  return paid.every((item) => {
    const match = reservedByProduct.get(item.productId)
    return (
      match?.slug === item.slug &&
      match.name === item.name &&
      match.unitAmountCents === item.unitAmountCents &&
      match.quantity === item.quantity
    )
  })
}

export async function findReservationByToken(token: string): Promise<InventoryReservation | null> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'inventory-reservations',
    where: { token: { equals: token } },
    limit: 1,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

async function reserveCheckoutInventoryOnce(input: {
  token: string
  stripeSessionId: string
  expiresAt: Date
  items: readonly ReservationItemInput[]
}): Promise<InventoryReservation> {
  const payload = await getPayload()
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('Database transactions are required for checkout')
  const req = { transactionID }

  try {
    const existing = await payload.find({
      collection: 'inventory-reservations',
      where: { token: { equals: input.token } },
      limit: 1,
      req,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      await payload.db.commitTransaction(transactionID)
      return existing.docs[0]
    }

    const products = []
    for (const item of input.items) {
      const product = await payload.findByID({
        collection: 'products',
        id: item.productId,
        req,
        overrideAccess: true,
      })
      const stock = product.stock ?? 0
      const currentUnitAmount = dollarsToCents(product.price)
      if (
        product.status !== 'published' ||
        product.slug !== item.slug ||
        product.name !== item.name ||
        currentUnitAmount !== item.unitAmountCents ||
        stock < item.quantity
      ) {
        throw new InventoryUnavailableError()
      }
      products.push({ product, item, stock })
    }

    const reservation = await payload.create({
      collection: 'inventory-reservations',
      req,
      overrideAccess: true,
      data: {
        token: input.token,
        stripeSessionId: input.stripeSessionId,
        status: 'active',
        expiresAt: input.expiresAt.toISOString(),
        items: input.items.map((item) => ({ ...item })),
      },
    })

    for (const { product, item, stock } of products) {
      await payload.update({
        collection: 'products',
        id: product.id,
        req,
        overrideAccess: true,
        data: { stock: stock - item.quantity },
      })
    }

    await payload.db.commitTransaction(transactionID)
    return reservation
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

export async function reserveCheckoutInventory(input: {
  token: string
  stripeSessionId: string
  expiresAt: Date
  items: readonly ReservationItemInput[]
}): Promise<InventoryReservation> {
  return withSerializationRetry(() => reserveCheckoutInventoryOnce(input))
}

type ReleaseReason = 'checkout-expired' | 'async-payment-failed' | 'checkout-create-failed'

async function releaseInventoryReservationOnce(
  session: Stripe.Checkout.Session,
  reason: ReleaseReason
): Promise<InventoryReservation | null> {
  const token = reservationTokenFromSession(session)
  if (!token) return null

  const payload = await getPayload()
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('Database transactions are required for checkout')
  const req = { transactionID }

  try {
    const result = await payload.find({
      collection: 'inventory-reservations',
      where: { token: { equals: token } },
      limit: 1,
      req,
      overrideAccess: true,
    })
    const reservation = result.docs[0]
    if (!reservation || reservation.status === 'released' || reservation.status === 'consumed') {
      await payload.db.commitTransaction(transactionID)
      return reservation ?? null
    }

    for (const item of reservation.items) {
      const product = await payload.findByID({
        collection: 'products',
        id: item.productId,
        req,
        overrideAccess: true,
      })
      await payload.update({
        collection: 'products',
        id: product.id,
        req,
        overrideAccess: true,
        data: { stock: (product.stock ?? 0) + item.quantity },
      })
    }

    const released = await payload.update({
      collection: 'inventory-reservations',
      id: reservation.id,
      req,
      overrideAccess: true,
      data: {
        status: 'released',
        releasedAt: new Date().toISOString(),
        releaseReason: reason,
      },
    })
    await payload.db.commitTransaction(transactionID)
    return released
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

export async function releaseInventoryReservation(
  session: Stripe.Checkout.Session,
  reason: ReleaseReason
): Promise<InventoryReservation | null> {
  return withSerializationRetry(() => releaseInventoryReservationOnce(session, reason))
}

async function markReservationPaymentPendingOnce(session: Stripe.Checkout.Session): Promise<void> {
  const token = reservationTokenFromSession(session)
  if (!token) return
  const payload = await getPayload()
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('Database transactions are required for checkout')
  const req = { transactionID }

  try {
    const result = await payload.find({
      collection: 'inventory-reservations',
      where: { token: { equals: token } },
      limit: 1,
      req,
      overrideAccess: true,
    })
    const reservation = result.docs[0]
    if (reservation?.status === 'active') {
      await payload.update({
        collection: 'inventory-reservations',
        id: reservation.id,
        req,
        overrideAccess: true,
        data: { status: 'pending-payment' },
      })
    }
    await payload.db.commitTransaction(transactionID)
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

export async function markReservationPaymentPending(
  session: Stripe.Checkout.Session
): Promise<void> {
  return withSerializationRetry(() => markReservationPaymentPendingOnce(session))
}
