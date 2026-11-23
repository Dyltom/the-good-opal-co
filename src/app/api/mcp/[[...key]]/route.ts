import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import type { ShapeOutput } from '@modelcontextprotocol/sdk/server/zod-compat.js'
import type { CollectionConfig, Payload, Where } from 'payload'
import sharp from 'sharp'
import { z } from 'zod'
import { APP_URL } from '@/lib/constants'
import { getPayload } from '@/lib/payload'
import { extractPlainText } from '@/lib/rich-text'
import { wordpressHtmlToLexical } from '@/lib/wordpress/content-import'
import { Orders } from '@/payload/collections/Orders'
import { Products } from '@/payload/collections/Products'
import type { Order, Product, User } from '@/types/payload-types'

const MAX_IMAGE_BYTES = 15 * 1024 * 1024
const IMAGE_TYPES: Record<string, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const INSTRUCTIONS = `Tools for running The Good Opal Co shop (goodopalco.com) on behalf of its owner, Steph.
Everything you create is a draft. Steph reviews and publishes in the admin; you cannot publish, delete, email customers or change a live product.
Never invent a price, stone fact, measurement, review or story. Ask Steph for anything you do not know.
Photos: upload them unchanged in colour. Never recolour, brighten, saturate or filter a stone photo.`

function selectValues(collection: CollectionConfig, name: string): [string, ...string[]] {
  const field = collection.fields.find(
    (candidate) => 'name' in candidate && candidate.name === name
  )
  if (!field || field.type !== 'select')
    throw new Error(`${collection.slug}.${name} is not a select field`)
  const values = field.options.map((option) => (typeof option === 'string' ? option : option.value))
  if (!values[0]) throw new Error(`${collection.slug}.${name} has no options`)
  return [values[0], ...values.slice(1)]
}

function selectOptions(collection: CollectionConfig, name: string) {
  const field = collection.fields.find(
    (candidate) => 'name' in candidate && candidate.name === name
  )
  if (!field || field.type !== 'select') return []
  return field.options.map((option) =>
    typeof option === 'string'
      ? { value: option, label: option }
      : { value: option.value, label: String(option.label) }
  )
}

const positive = z.number().positive()
const productCore = {
  name: z.string().trim().min(3).max(120).describe('Product name as shown in the shop'),
  price: z
    .number()
    .nonnegative()
    .describe('Price in AUD dollars, exactly as Steph set it. Never guess.'),
  category: z.enum(selectValues(Products, 'category')),
  descriptionHtml: z
    .string()
    .min(1)
    .max(20000)
    .describe(
      'Listing text as simple HTML: <p>, <h2>, <ul><li>, <a href>. Replaces the whole description.'
    ),
}
const productExtras = {
  specs: z
    .array(
      z.object({
        label: z
          .string()
          .regex(
            /^[A-Z][A-Za-z ]{1,18}$/,
            'Start with a capital, letters and spaces only, max 19 characters'
          ),
        value: z.string().trim().min(1).max(80),
      })
    )
    .max(12)
    .optional()
    .describe(
      'Extra spec rows shown in the product spec table, e.g. Body tone: N3, Brightness: B2, Pattern: Rolling flash, Construction: Solid opal. Needs descriptionHtml in the same call.'
    ),
  stoneType: z.enum(selectValues(Products, 'stoneType')).optional(),
  stoneOrigin: z.enum(selectValues(Products, 'stoneOrigin')).optional(),
  material: z.enum(selectValues(Products, 'material')).optional(),
  weight: positive.optional().describe('Stone weight in carats, or piece weight in grams'),
  weightUnit: z.enum(selectValues(Products, 'weightUnit')).optional(),
  dimensions: z
    .object({ length: positive.optional(), width: positive.optional(), depth: positive.optional() })
    .optional()
    .describe('Millimetres'),
  ringSize: z.string().trim().max(20).optional(),
  stock: z
    .number()
    .int()
    .min(0)
    .max(1000)
    .optional()
    .describe('How many Steph has. Defaults to 1 on create.'),
  soldPerUnit: z
    .boolean()
    .optional()
    .describe(
      'True for parcels priced per stone where the buyer gets stones picked from the batch'
    ),
  imageIds: z
    .array(z.number().int().positive())
    .max(20)
    .optional()
    .describe('Media IDs in gallery order, first is the lead photo. Replaces the whole gallery.'),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
}

type ProductInput = Partial<{
  [K in keyof typeof productCore]: z.infer<(typeof productCore)[K]>
}> & { [K in keyof typeof productExtras]?: z.infer<(typeof productExtras)[K]> }

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function productData(input: ProductInput): Partial<Product> {
  if (input.specs && input.descriptionHtml === undefined) {
    throw new Error(
      'Send descriptionHtml together with specs: the description is replaced as a whole.'
    )
  }
  const data: Partial<Product> = {}
  if (input.name !== undefined) data.name = input.name
  if (input.price !== undefined) data.price = input.price
  if (input.category !== undefined) data.category = input.category as Product['category']
  if (input.descriptionHtml !== undefined) {
    const specRows = (input.specs ?? []).map(
      (spec) => `<p>${escapeHtml(spec.label)}: ${escapeHtml(spec.value)}</p>`
    )
    data.description = wordpressHtmlToLexical(
      [input.descriptionHtml, ...specRows].join('\n')
    ) as unknown as Product['description']
  }
  if (input.stoneType !== undefined) data.stoneType = input.stoneType as Product['stoneType']
  if (input.stoneOrigin !== undefined)
    data.stoneOrigin = input.stoneOrigin as Product['stoneOrigin']
  if (input.material !== undefined) data.material = input.material as Product['material']
  if (input.weight !== undefined) data.weight = input.weight
  if (input.weightUnit !== undefined) data.weightUnit = input.weightUnit as Product['weightUnit']
  if (input.dimensions !== undefined) data.dimensions = input.dimensions
  if (input.ringSize !== undefined) data.ringSize = input.ringSize
  if (input.stock !== undefined) data.stock = input.stock
  if (input.soldPerUnit !== undefined) data.soldPerUnit = input.soldPerUnit
  if (input.imageIds !== undefined) data.images = input.imageIds.map((image) => ({ image }))
  if (input.seoTitle !== undefined || input.seoDescription !== undefined) {
    data.meta = {
      ...(input.seoTitle !== undefined && { title: input.seoTitle }),
      ...(input.seoDescription !== undefined && { description: input.seoDescription }),
    }
  }
  return data
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'untitled'
  )
}

async function uniqueSlug(
  payload: Payload,
  collection: 'products' | 'posts',
  base: string
): Promise<string> {
  for (let attempt = 1; attempt <= 50; attempt += 1) {
    const slug = attempt === 1 ? base : `${base}-${attempt}`
    const { totalDocs } = await payload.count({
      collection,
      where: { slug: { equals: slug } },
      overrideAccess: true,
      trash: true,
    })
    if (totalDocs === 0) return slug
  }
  throw new Error(`Could not find a free web address starting with ${base}`)
}

function adminUrl(collection: string, id: number): string {
  return `${APP_URL}/admin/collections/${collection}/${id}`
}

function productSummary(product: Product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    status: product.status,
    price: product.price,
    stock: product.stock ?? 0,
    category: product.category,
    stoneType: product.stoneType ?? null,
    stoneOrigin: product.stoneOrigin ?? null,
    weight: product.weight ?? null,
    weightUnit: product.weightUnit ?? null,
    dimensions: product.dimensions ?? null,
    imageIds: (product.images ?? []).map((entry) =>
      typeof entry.image === 'object' && entry.image ? entry.image.id : entry.image
    ),
    description: extractPlainText(product.description),
    seoTitle: product.meta?.title ?? null,
    seoDescription: product.meta?.description ?? null,
    adminUrl: adminUrl('products', product.id),
    shopUrl: product.status === 'published' ? `${APP_URL}/store/${product.slug}` : null,
    updatedAt: product.updatedAt,
  }
}

function orderSummary(order: Order) {
  return {
    orderNumber: order.orderNumber,
    placedAt: order.orderPlacedAt ?? order.createdAt,
    status: order.status,
    customerName: order.customer?.name ?? null,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    total: order.total,
    currency: order.currency ?? 'AUD',
  }
}

async function imageBytes(input: { url?: string; base64?: string }): Promise<Buffer> {
  if (input.base64) return Buffer.from(input.base64.replace(/^data:[^,]*,/, ''), 'base64')
  const url = new URL(input.url ?? '')
  if (url.protocol !== 'https:') throw new Error('Only https image links can be uploaded.')
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  if (!response.ok) throw new Error(`The image link answered ${response.status}.`)
  if (Number(response.headers.get('content-length') ?? 0) > MAX_IMAGE_BYTES) {
    throw new Error('That image is over 15 MB.')
  }
  return Buffer.from(await response.arrayBuffer())
}

function result(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] }
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const details =
    error &&
    typeof error === 'object' &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object'
      ? ` ${JSON.stringify(error.data)}`
      : ''
  return { isError: true, content: [{ type: 'text' as const, text: `${message}${details}` }] }
}

function shopServer(payload: Payload, user: User): McpServer {
  const server = new McpServer(
    { name: 'good-opal-shop', version: '1.0.0' },
    { instructions: INSTRUCTIONS }
  )
  const access = { user, overrideAccess: false } as const

  function tool<Shape extends z.ZodRawShape>(
    name: string,
    description: string,
    inputSchema: Shape,
    readOnly: boolean,
    run: (input: ShapeOutput<Shape>) => Promise<unknown>
  ) {
    const callback = async (input: ShapeOutput<Shape>) => {
      payload.logger.info({ msg: 'Claude shop tool', tool: name, userId: user.id })
      try {
        return result(await run(input))
      } catch (error) {
        return failure(error)
      }
    }
    server.registerTool(
      name,
      { description, inputSchema, annotations: { readOnlyHint: readOnly, destructiveHint: false } },
      callback as unknown as ToolCallback<Shape>
    )
  }

  tool(
    'list_categories',
    'Lists the allowed values for product category, stone type, origin, metal and weight unit, plus blog categories and authors.',
    {},
    true,
    async () => {
      const [blogCategories, authors] = await Promise.all([
        payload.find({ collection: 'categories', limit: 100, depth: 0, sort: 'name', ...access }),
        payload.find({ collection: 'authors', limit: 50, depth: 0, sort: 'name', ...access }),
      ])
      return {
        productCategories: selectOptions(Products, 'category'),
        stoneTypes: selectOptions(Products, 'stoneType'),
        stoneOrigins: selectOptions(Products, 'stoneOrigin'),
        materials: selectOptions(Products, 'material'),
        weightUnits: selectOptions(Products, 'weightUnit'),
        blogCategories: blogCategories.docs.map(({ id, name, slug }) => ({ id, name, slug })),
        authors: authors.docs.map(({ id, name }) => ({ id, name })),
      }
    }
  )

  tool(
    'find_products',
    'Searches products by name, or fetches one by id. Includes drafts.',
    {
      id: z.number().int().positive().optional(),
      query: z.string().trim().max(100).optional().describe('Words in the product name'),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    },
    true,
    async ({ id, query, status, limit }) => {
      const where: Where = {
        and: [
          ...(id ? [{ id: { equals: id } }] : []),
          ...(query ? [{ name: { like: query } }] : []),
          ...(status ? [{ status: { equals: status } }] : []),
        ],
      }
      const found = await payload.find({
        collection: 'products',
        where,
        limit: limit ?? 20,
        depth: 0,
        sort: '-updatedAt',
        ...access,
      })
      return { totalDocs: found.totalDocs, products: found.docs.map(productSummary) }
    }
  )

  tool(
    'create_product_draft',
    'Creates a new product as a DRAFT that is not visible in the shop. Steph checks it and publishes it in the admin.',
    { ...productCore, ...productExtras },
    false,
    async (input) => {
      const created = await payload.create({
        collection: 'products',
        data: {
          ...productData(input),
          name: input.name,
          price: input.price,
          category: input.category as Product['category'],
          slug: await uniqueSlug(payload, 'products', slugify(input.name)),
          stock: input.stock ?? 1,
          status: 'draft',
        } as Product,
        ...access,
      })
      return {
        ...productSummary(created),
        next: 'Steph reviews this draft in the admin and publishes it herself.',
      }
    }
  )

  tool(
    'update_product_draft',
    'Changes fields on a product that is still a draft. Refuses live or archived products. Cannot publish.',
    {
      id: z.number().int().positive(),
      name: productCore.name.optional(),
      price: productCore.price.optional(),
      category: productCore.category.optional(),
      descriptionHtml: productCore.descriptionHtml.optional(),
      ...productExtras,
    },
    false,
    async ({ id, ...input }) => {
      const existing = await payload.findByID({ collection: 'products', id, depth: 0, ...access })
      if (existing.status !== 'draft') {
        throw new Error(
          `"${existing.name}" is ${existing.status}, not a draft. Steph changes it in the admin.`
        )
      }
      const updated = await payload.update({
        collection: 'products',
        id,
        data: productData(input),
        ...access,
      })
      return productSummary(updated)
    }
  )

  tool(
    'upload_image',
    'Adds one photo to the media library from an https link or base64 data, unchanged. Returns the media id to use in imageIds. For big photos, ask Steph to upload them in Admin > Media and use list_recent_media instead.',
    {
      alt: z.string().trim().min(3).max(200).describe('What the photo shows, for screen readers'),
      filename: z.string().trim().min(1).max(100),
      url: z.string().url().optional(),
      base64: z.string().optional(),
    },
    false,
    async ({ alt, filename, url, base64 }) => {
      if (Boolean(url) === Boolean(base64)) throw new Error('Send either url or base64, not both.')
      const data = await imageBytes({ url, base64 })
      if (data.byteLength > MAX_IMAGE_BYTES) throw new Error('That image is over 15 MB.')
      const metadata = await sharp(data)
        .metadata()
        .catch(() => null)
      const mimetype = metadata?.format ? IMAGE_TYPES[metadata.format] : undefined
      if (!mimetype || !metadata?.format)
        throw new Error('That file is not a JPEG, PNG or WebP image.')
      const name = `${slugify(filename.replace(/\.[a-z0-9]+$/i, ''))}.${metadata.format === 'jpeg' ? 'jpg' : metadata.format}`
      const media = await payload.create({
        collection: 'media',
        data: { alt },
        file: { data, mimetype, name, size: data.byteLength },
        ...access,
      })
      return {
        id: media.id,
        filename: media.filename,
        width: media.width,
        height: media.height,
        url: media.url,
      }
    }
  )

  tool(
    'list_recent_media',
    'Lists the newest photos in the media library, for example ones Steph just uploaded in the admin, with their ids.',
    { limit: z.number().int().min(1).max(30).optional() },
    true,
    async ({ limit }) => {
      const found = await payload.find({
        collection: 'media',
        where: { mimeType: { contains: 'image/' } },
        sort: '-createdAt',
        limit: limit ?? 10,
        depth: 0,
        ...access,
      })
      return found.docs.map(({ id, alt, filename, width, height, url, createdAt }) => ({
        id,
        alt,
        filename,
        width,
        height,
        url,
        createdAt,
      }))
    }
  )

  tool(
    'list_recent_orders',
    'Lists recent orders: number, date, status, customer name, items and total. Read only; no contact details.',
    {
      status: z.enum(selectValues(Orders, 'status')).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    },
    true,
    async ({ status, limit }) => {
      const found = await payload.find({
        collection: 'orders',
        where: status ? { status: { equals: status } } : {},
        sort: '-orderPlacedAt',
        limit: limit ?? 20,
        depth: 0,
        ...access,
      })
      return { totalDocs: found.totalDocs, orders: found.docs.map(orderSummary) }
    }
  )

  tool(
    'create_post_draft',
    'Creates a blog post as a DRAFT. Steph reviews and publishes it in the admin.',
    {
      title: z.string().trim().min(3).max(140),
      contentHtml: z
        .string()
        .min(1)
        .max(60000)
        .describe(
          'Post body as simple HTML: <p>, <h2>, <h3>, <ul><li>, <ol><li>, <a href="/store/...">'
        ),
      excerpt: z.string().trim().max(300).optional(),
      authorId: z.number().int().positive().describe('From list_categories authors'),
      categoryIds: z
        .array(z.number().int().positive())
        .min(1)
        .max(5)
        .describe('From list_categories blogCategories'),
      featuredImageId: z.number().int().positive().optional(),
      seoTitle: z.string().trim().max(70).optional(),
      seoDescription: z.string().trim().max(170).optional(),
      keywords: z.array(z.string().trim().min(1).max(60)).max(10).optional(),
    },
    false,
    async (input) => {
      const post = await payload.create({
        collection: 'posts',
        draft: true,
        data: {
          title: input.title,
          slug: await uniqueSlug(payload, 'posts', slugify(input.title)),
          excerpt: input.excerpt,
          content: wordpressHtmlToLexical(input.contentHtml) as unknown as Product['description'],
          author: input.authorId,
          categories: input.categoryIds,
          featuredImage: input.featuredImageId,
          seo: {
            title: input.seoTitle,
            description: input.seoDescription,
            keywords: input.keywords,
          },
          _status: 'draft',
        },
        ...access,
      })
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post._status,
        adminUrl: adminUrl('posts', post.id),
        next: 'Steph reviews this draft in the admin and publishes it herself.',
      }
    }
  )

  return server
}

type Authentication = { user: User } | { status: 401 | 403; message: string }

async function authenticate(
  payload: Payload,
  request: Request,
  pathKey: string | undefined
): Promise<Authentication> {
  const key =
    pathKey ?? request.headers.get('authorization')?.match(/^Bearer\s+(\S+)\s*$/i)?.[1]
  if (!key)
    return {
      status: 401,
      message: 'Add the shop API key to the end of the connector URL: /api/mcp/<key>.',
    }
  const { user } = await payload.auth({
    headers: new Headers({ authorization: `users API-Key ${key}` }),
    canSetHeaders: false,
  })
  if (!user || (user as User & { _strategy?: string })._strategy !== 'api-key')
    return { status: 401, message: 'That API key is not valid.' }
  if (user.role !== 'admin')
    return { status: 403, message: 'That API key does not belong to a shop admin.' }
  return { user }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key?: string[] }> }
): Promise<Response> {
  const { key = [] } = await params
  if (key.length > 1) return new Response(null, { status: 404 })
  const payload = await getPayload()
  const authentication = await authenticate(payload, request, key[0])
  if (!('user' in authentication)) {
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32001, message: authentication.message }, id: null },
      {
        status: authentication.status,
        headers: authentication.status === 401 ? { 'WWW-Authenticate': 'Bearer' } : undefined,
      }
    )
  }

  const server = shopServer(payload, authentication.user)
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
    maxRequestBodySize: 24 * 1024 * 1024,
  })
  await server.connect(transport)
  try {
    return await transport.handleRequest(request)
  } finally {
    await server.close()
  }
}

export function GET(): Response {
  return new Response(null, { status: 405, headers: { Allow: 'POST' } })
}

export const DELETE = GET
