import type { Customer, Order, Product } from '@/types/payload-types'
import { getPayload } from '@/lib/payload'
import {
  fetchWooCommerceSnapshot,
  mapWooCustomer,
  mapWooOrder,
  mapWooPrivateProduct,
  type LegacyCustomerData,
  type LegacyProductData,
} from '@/lib/woocommerce/private-commerce'

const TENANT_ID = 'good-opal-co'

interface ImportCounts {
  created: number
  updated: number
  archived: number
  skipped: number
}

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

function richText(text: string) {
  return {
    root: {
      type: 'root' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph' as const,
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text' as const,
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
              text: text || 'Product details available on request.',
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

async function findAllProducts(): Promise<Product[]> {
  const payload = await getPayload()
  const docs: Product[] = []
  let page = 1
  let hasNextPage = true
  while (hasNextPage) {
    const result = await payload.find({
      collection: 'products',
      page,
      limit: 100,
      overrideAccess: true,
    })
    docs.push(...result.docs)
    hasNextPage = result.hasNextPage
    page += 1
  }
  return docs
}

async function findAllOrders(): Promise<Order[]> {
  const payload = await getPayload()
  const docs: Order[] = []
  let page = 1
  let hasNextPage = true
  while (hasNextPage) {
    const result = await payload.find({
      collection: 'orders',
      page,
      limit: 100,
      overrideAccess: true,
    })
    docs.push(...result.docs)
    hasNextPage = result.hasNextPage
    page += 1
  }
  return docs
}

async function findAllCustomers(): Promise<Customer[]> {
  const payload = await getPayload()
  const docs: Customer[] = []
  let page = 1
  let hasNextPage = true
  while (hasNextPage) {
    const result = await payload.find({
      collection: 'customers',
      page,
      limit: 100,
      overrideAccess: true,
    })
    docs.push(...result.docs)
    hasNextPage = result.hasNextPage
    page += 1
  }
  return docs
}

function productCreateData(product: LegacyProductData) {
  return {
    ...product,
    description: richText(product.description),
    featured: false,
    certified: false,
    tenantId: TENANT_ID,
  }
}

function productUpdateData(product: LegacyProductData) {
  return {
    ...product,
    description: richText(product.description),
  }
}

function customerUpdateData(customer: LegacyCustomerData) {
  return {
    legacyWooId: customer.legacyWooId,
    wooCreatedAt: customer.wooCreatedAt,
    ...(customer.name ? { name: customer.name } : {}),
    ...(customer.phone ? { phone: customer.phone } : {}),
    totalOrders: customer.totalOrders,
    totalSpent: customer.totalSpent,
    defaultAddress: customer.defaultAddress,
  }
}

function productNameKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

async function importCommerce(): Promise<void> {
  const apply = process.env['WOO_IMPORT_APPLY'] === 'true'
  const credentials = {
    baseUrl: requiredEnvironmentValue('WOO_BASE_URL'),
    consumerKey: requiredEnvironmentValue('WOO_CONSUMER_KEY'),
    consumerSecret: requiredEnvironmentValue('WOO_CONSUMER_SECRET'),
  }
  const payload = await getPayload()
  const snapshot = await fetchWooCommerceSnapshot(credentials)
  const [existingProducts, existingOrders, existingCustomers] = await Promise.all([
    findAllProducts(),
    findAllOrders(),
    findAllCustomers(),
  ])

  const productsByLegacyId = new Map(
    existingProducts
      .filter(
        (product): product is Product & { legacyWooId: number } =>
          typeof product.legacyWooId === 'number'
      )
      .map((product) => [product.legacyWooId, product])
  )
  const productsBySku = new Map(
    existingProducts
      .filter((product) => product.sku)
      .map((product) => [product.sku as string, product])
  )
  const productsBySlug = new Map(existingProducts.map((product) => [product.slug, product]))
  const productNameBuckets = new Map<string, Product[]>()
  for (const product of existingProducts) {
    const key = productNameKey(product.name)
    productNameBuckets.set(key, [...(productNameBuckets.get(key) ?? []), product])
  }
  const productsByUniqueName = new Map(
    [...productNameBuckets].flatMap(([key, products]) =>
      products.length === 1 && products[0] ? [[key, products[0]] as const] : []
    )
  )
  const productReferences = new Map<number, { id: string | number; slug: string }>()
  const productCounts: ImportCounts = { created: 0, updated: 0, archived: 0, skipped: 0 }
  const productPlans = snapshot.products.map((sourceProduct) => {
    const mapped = mapWooPrivateProduct(sourceProduct)
    const identityCandidates = [
      productsByLegacyId.get(sourceProduct.id),
      productsBySku.get(`WP-${sourceProduct.id}`),
      productsBySku.get(mapped.sku),
    ].filter((product): product is Product => product !== undefined)
    const identityIds = new Set(identityCandidates.map((product) => String(product.id)))
    if (identityIds.size > 1) {
      throw new Error(`WooCommerce product ${sourceProduct.id} has conflicting legacy identities`)
    }
    const existing =
      identityCandidates[0] ??
      productsByUniqueName.get(productNameKey(mapped.name)) ??
      productsBySlug.get(mapped.slug)
    return { sourceProduct, mapped, existing }
  })
  const matchedExistingProductIds = new Set(
    productPlans.flatMap(({ existing }) => (existing ? [String(existing.id)] : []))
  )
  if (matchedExistingProductIds.size !== productPlans.filter(({ existing }) => existing).length) {
    throw new Error('Multiple WooCommerce products resolve to the same historical product')
  }
  const displacedSlugOwners = new Map<string, Product>()
  for (const { sourceProduct, mapped, existing } of productPlans) {
    const slugOwner = productsBySlug.get(mapped.slug)
    if (!slugOwner || slugOwner.id === existing?.id) continue
    if (matchedExistingProductIds.has(String(slugOwner.id))) {
      throw new Error(`WooCommerce product ${sourceProduct.id} conflicts with another current slug`)
    }
    if (!slugOwner.sku?.startsWith('WP-') && typeof slugOwner.legacyWooId !== 'number') {
      throw new Error(`WooCommerce product ${sourceProduct.id} conflicts with a local product slug`)
    }
    displacedSlugOwners.set(String(slugOwner.id), slugOwner)
  }

  if (apply) {
    for (const displaced of displacedSlugOwners.values()) {
      await payload.update({
        collection: 'products',
        id: displaced.id,
        data: {
          slug: `${displaced.slug}-legacy-${displaced.id}`,
          status: 'archived',
          stock: 0,
        },
        overrideAccess: true,
      })
    }
  }

  for (const { sourceProduct, mapped, existing } of productPlans) {
    if (existing) {
      productCounts.updated += 1
      productReferences.set(sourceProduct.id, { id: existing.id, slug: mapped.slug })
      if (apply) {
        await payload.update({
          collection: 'products',
          id: existing.id,
          data: productUpdateData(mapped),
          overrideAccess: true,
        })
      }
    } else {
      productCounts.created += 1
      if (apply) {
        const created = await payload.create({
          collection: 'products',
          data: productCreateData(mapped),
          overrideAccess: true,
        })
        productReferences.set(sourceProduct.id, { id: created.id, slug: created.slug })
      }
    }
  }

  const staleProducts = existingProducts.filter((product) => {
    const sourceManaged =
      typeof product.legacyWooId === 'number' || Boolean(product.sku?.startsWith('WP-'))
    return sourceManaged && !matchedExistingProductIds.has(String(product.id))
  })
  productCounts.archived = staleProducts.length
  if (apply) {
    for (const staleProduct of staleProducts) {
      await payload.update({
        collection: 'products',
        id: staleProduct.id,
        data: { status: 'archived', stock: 0 },
        overrideAccess: true,
      })
    }
  }

  const customersByLegacyId = new Map(
    existingCustomers
      .filter(
        (customer): customer is Customer & { legacyWooId: number } =>
          typeof customer.legacyWooId === 'number'
      )
      .map((customer) => [customer.legacyWooId, customer])
  )
  const customersByEmail = new Map(
    existingCustomers.map((customer) => [customer.email.trim().toLowerCase(), customer])
  )
  const registeredCustomerStats = new Map<string, { totalOrders: number; totalSpent: number }>()
  const touchedCustomerEmails = new Set<string>()
  const customerCounts: ImportCounts = { created: 0, updated: 0, archived: 0, skipped: 0 }

  for (const sourceCustomer of snapshot.customers) {
    const mapped = mapWooCustomer(sourceCustomer)
    if (!mapped) {
      customerCounts.skipped += 1
      continue
    }
    registeredCustomerStats.set(mapped.email, {
      totalOrders: mapped.totalOrders,
      totalSpent: mapped.totalSpent,
    })
    const byLegacyId = customersByLegacyId.get(sourceCustomer.id)
    const byEmail = customersByEmail.get(mapped.email)
    if (byLegacyId && byEmail && byLegacyId.id !== byEmail.id) {
      throw new Error(`WooCommerce customer ${sourceCustomer.id} conflicts with an existing email`)
    }
    const existing = byLegacyId ?? byEmail
    if (existing) {
      customerCounts.updated += 1
      if (apply) {
        await payload.update({
          collection: 'customers',
          id: existing.id,
          data: customerUpdateData(mapped),
          overrideAccess: true,
        })
      }
    } else {
      customerCounts.created += 1
      if (apply) {
        const created = await payload.create({
          collection: 'customers',
          data: mapped,
          overrideAccess: true,
        })
        customersByEmail.set(mapped.email, created)
      }
    }
    touchedCustomerEmails.add(mapped.email)
  }

  const orderMetrics = new Map<
    string,
    {
      name: string
      phone?: string
      totalOrders: number
      totalSpent: number
      lastOrderDate: string
      defaultAddress: {
        line1: string
        line2?: string
        city: string
        state: string
        postalCode: string
        country: string
      }
    }
  >()
  for (const sourceOrder of snapshot.orders) {
    const mappedOrder = mapWooOrder(
      sourceOrder,
      snapshot.refundsByOrderId.get(sourceOrder.id) ?? [],
      productReferences
    )
    const previous = orderMetrics.get(mappedOrder.customer.email)
    const paidAmount = sourceOrder.date_paid_gmt ? mappedOrder.total : 0
    const refundedAmount = mappedOrder.legacyRefunds.reduce((sum, refund) => sum + refund.amount, 0)
    const lastOrderDate =
      !previous || mappedOrder.orderPlacedAt > previous.lastOrderDate
        ? mappedOrder.orderPlacedAt
        : previous.lastOrderDate
    orderMetrics.set(mappedOrder.customer.email, {
      name: mappedOrder.customer.name,
      ...(mappedOrder.customer.phone ? { phone: mappedOrder.customer.phone } : {}),
      totalOrders: (previous?.totalOrders ?? 0) + 1,
      totalSpent: (previous?.totalSpent ?? 0) + Math.max(0, paidAmount - refundedAmount),
      lastOrderDate,
      defaultAddress: mappedOrder.shippingAddress,
    })
  }
  for (const [email, guest] of orderMetrics) {
    const existing = customersByEmail.get(email)
    const registered = registeredCustomerStats.get(email)
    const guestData = {
      email,
      name: guest.name,
      phone: guest.phone,
      source: 'import' as const,
      totalOrders: guest.totalOrders + (registered?.totalOrders ?? 0),
      totalSpent: guest.totalSpent + (registered?.totalSpent ?? 0),
      lastOrderDate: guest.lastOrderDate,
      defaultAddress: guest.defaultAddress,
      tags: [{ tag: 'WooCommerce guest' }],
    }
    if (existing) {
      if (!touchedCustomerEmails.has(email)) customerCounts.updated += 1
      if (apply) {
        await payload.update({
          collection: 'customers',
          id: existing.id,
          data: {
            name: guestData.name,
            ...(guestData.phone ? { phone: guestData.phone } : {}),
            totalOrders: guestData.totalOrders,
            totalSpent: guestData.totalSpent,
            lastOrderDate: guestData.lastOrderDate,
            defaultAddress: guestData.defaultAddress,
          },
          overrideAccess: true,
        })
      }
    } else if (touchedCustomerEmails.has(email)) {
      // Dry-run customer create already counted from the registered customer endpoint.
      continue
    } else {
      customerCounts.created += 1
      if (apply) {
        const created = await payload.create({
          collection: 'customers',
          data: guestData,
          overrideAccess: true,
        })
        customersByEmail.set(email, created)
      }
    }
    touchedCustomerEmails.add(email)
  }

  const ordersByLegacyId = new Map(
    existingOrders
      .filter(
        (order): order is Order & { legacyWooId: number } => typeof order.legacyWooId === 'number'
      )
      .map((order) => [order.legacyWooId, order])
  )
  const ordersByStripeSession = new Map(
    existingOrders.map((order) => [order.stripeSessionId, order])
  )
  const orderCounts: ImportCounts = { created: 0, updated: 0, archived: 0, skipped: 0 }

  for (const sourceOrder of snapshot.orders) {
    const mapped = mapWooOrder(
      sourceOrder,
      snapshot.refundsByOrderId.get(sourceOrder.id) ?? [],
      productReferences
    )
    const byLegacyId = ordersByLegacyId.get(sourceOrder.id)
    const bySession = ordersByStripeSession.get(mapped.stripeSessionId)
    if (byLegacyId && bySession && byLegacyId.id !== bySession.id) {
      throw new Error(
        `WooCommerce order ${sourceOrder.id} conflicts with an existing import record`
      )
    }
    const existing = byLegacyId ?? bySession
    if (existing) {
      orderCounts.updated += 1
      if (apply) {
        await payload.update({
          collection: 'orders',
          id: existing.id,
          data: mapped,
          overrideAccess: true,
        })
      }
    } else {
      orderCounts.created += 1
      if (apply) {
        await payload.create({
          collection: 'orders',
          data: mapped,
          overrideAccess: true,
        })
      }
    }
  }

  const mode = apply ? 'applied' : 'dry run'
  payload.logger.info(
    `WooCommerce commerce import ${mode}: ` +
      `${productCounts.created} products create, ${productCounts.updated} update, ${productCounts.archived} archive; ` +
      `${customerCounts.created} customers create, ${customerCounts.updated} update, ${customerCounts.skipped} skip; ` +
      `${orderCounts.created} orders create, ${orderCounts.updated} update; ` +
      `${[...snapshot.refundsByOrderId.values()].flat().length} refunds.`
  )
}

importCommerce()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown import error'
    console.error(`WooCommerce commerce import failed: ${message}`)
    process.exit(1)
  })
