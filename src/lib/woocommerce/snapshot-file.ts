import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import {
  wooCustomerSchema,
  wooOrderSchema,
  wooPrivateProductSchema,
  wooRefundSchema,
  type WooCommerceSnapshot,
} from './private-commerce'

const refundsFileSchema = z.record(z.string(), z.array(wooRefundSchema))

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, 'utf8')) as unknown
}

export async function loadWooCommerceSnapshotDirectory(
  directory: string
): Promise<WooCommerceSnapshot> {
  const root = path.resolve(directory)
  const [products, orders, customers, refundRecord] = await Promise.all([
    readJson(path.join(root, 'products.json')).then((value) =>
      z.array(wooPrivateProductSchema).parse(value)
    ),
    readJson(path.join(root, 'orders.json')).then((value) => z.array(wooOrderSchema).parse(value)),
    readJson(path.join(root, 'customers.json')).then((value) =>
      z.array(wooCustomerSchema).parse(value)
    ),
    readJson(path.join(root, 'refunds.json')).then((value) => refundsFileSchema.parse(value)),
  ])

  const refundsByOrderId = new Map<number, z.infer<typeof wooRefundSchema>[]>()
  for (const [orderId, refunds] of Object.entries(refundRecord)) {
    const parsedOrderId = Number.parseInt(orderId, 10)
    if (!Number.isInteger(parsedOrderId) || parsedOrderId < 1) {
      throw new Error(`Invalid WooCommerce refund order ID: ${orderId}`)
    }
    refundsByOrderId.set(parsedOrderId, refunds)
  }

  return { products, orders, customers, refundsByOrderId }
}
