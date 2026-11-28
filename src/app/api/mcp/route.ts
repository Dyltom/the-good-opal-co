import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import type { ShapeOutput } from '@modelcontextprotocol/sdk/server/zod-compat.js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { CollectionConfig, Payload, Where } from 'payload'
import { z } from 'zod'
import { APP_URL } from '@/lib/constants'
import {
  findShopAdmin,
  looksLikeOAuthToken,
  photoUploadUrl,
  PROTECTED_RESOURCE_METADATA_URL,
  readAccessToken,
} from '@/lib/mcp-oauth'
import { getPayload } from '@/lib/payload'
import { extractPlainText } from '@/lib/rich-text'
import {
  isPicture,
  resolvePageContent,
  SITE_CONTENT_DEFAULTS,
  SITE_PAGES,
  type ContentValue,
  type SitePage,
} from '@/lib/site-content'
import { wordpressHtmlToLexical } from '@/lib/wordpress/content-import'
import { Orders } from '@/payload/collections/Orders'
import { Products } from '@/payload/collections/Products'
import type { Course, Media, Order, Post, Product, SiteContent, User } from '@/types/payload-types'

const PAGE_LIST = SITE_PAGES.join(', ')

const INSTRUCTIONS = `Tools for running The Good Opal Co shop (goodopalco.com) on behalf of its owner, Steph.
Everything you create is a draft. Steph reviews and publishes in the admin; you cannot publish, delete, email customers or change a live product or post.
Never invent a price, stone fact, measurement, review or story. Ask Steph for anything you do not know.
Photos: once a listing draft exists, call photo_upload_link with its id and give Steph the link. She opens it on her phone or computer, picks the photos, and they are added to the draft unchanged, in the order she picks them. Then call find_products to see them and reorder with update_product_draft if the lead photo is not the clearest face-up shot. Never recolour, brighten, saturate or filter a stone photo.
If a draft needs changes after it is saved, update it with update_product_draft or update_post_draft rather than creating another draft.
Page text, lists and photos on these pages: ${PAGE_LIST}. Read them with get_site_content and change them with update_site_content. That changes the live site straight away (the admin keeps every earlier version), so show Steph the new wording and get her yes first. For a new page photo, call photo_upload_link without a product, then pass the new media id to update_site_content.
Courses on the /courses page: read them with find_courses and change a course's photo or text with update_course (live straight away, so get Steph's yes first).
If a tool says the shop sign-in has expired, Steph opens the Good Opal shop connector in Claude's settings and clicks Connect.`

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

type Thumbnail = { type: 'text'; text: string } | { type: 'image'; data: string; mimeType: string }

class WithPhotos {
  constructor(
    readonly value: unknown,
    readonly photos: Thumbnail[]
  ) {}
}

function result(output: unknown) {
  const value = output instanceof WithPhotos ? output.value : output
  const photos = output instanceof WithPhotos ? output.photos : []
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }, ...photos] }
}

async function thumbnails(
  payload: Payload,
  media: Media[],
  labels = media.map(({ id }, index) => `Photo ${index + 1}: media id ${id}`)
): Promise<Thumbnail[]> {
  const upload = payload.collections.media.config.upload
  const directory = typeof upload === 'object' ? upload.staticDir : undefined
  const files = await Promise.all(
    media.map(async ({ sizes, mimeType }, index): Promise<Thumbnail[]> => {
      const filename = sizes?.thumbnail?.filename
      const data =
        directory && filename
          ? await readFile(path.join(directory, filename)).catch(() => null)
          : null
      if (!data) return []
      return [
        { type: 'text', text: labels[index] ?? '' },
        {
          type: 'image',
          data: data.toString('base64'),
          mimeType: sizes?.thumbnail?.mimeType ?? mimeType ?? 'image/jpeg',
        },
      ]
    })
  )
  return files.flat()
}

function photoSummary({ id, alt, filename, width, height, url, createdAt }: Media) {
  return { id, alt, filename, width, height, url, createdAt }
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

const postCore = {
  title: z.string().trim().min(3).max(140),
  contentHtml: z
    .string()
    .min(1)
    .max(60000)
    .describe(
      'Post body as simple HTML: <p>, <h2>, <h3>, <ul><li>, <ol><li>, <a href="/store/...">. Replaces the whole post body.'
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
}

type PostInput = { [K in keyof typeof postCore]?: z.infer<(typeof postCore)[K]> }

function postData(input: PostInput): Partial<Post> {
  const data: Partial<Post> = {}
  if (input.title !== undefined) data.title = input.title
  if (input.contentHtml !== undefined)
    data.content = wordpressHtmlToLexical(input.contentHtml) as unknown as Post['content']
  if (input.excerpt !== undefined) data.excerpt = input.excerpt
  if (input.authorId !== undefined) data.author = input.authorId
  if (input.categoryIds !== undefined) data.categories = input.categoryIds
  if (input.featuredImageId !== undefined) data.featuredImage = input.featuredImageId
  if (
    input.seoTitle !== undefined ||
    input.seoDescription !== undefined ||
    input.keywords !== undefined
  ) {
    data.seo = {
      ...(input.seoTitle !== undefined && { title: input.seoTitle }),
      ...(input.seoDescription !== undefined && { description: input.seoDescription }),
      ...(input.keywords !== undefined && { keywords: input.keywords }),
    }
  }
  return data
}

function relationId(value: number | { id: number } | null | undefined): number | null {
  return typeof value === 'object' && value ? value.id : (value ?? null)
}

function postSummary(post: Post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post._status ?? 'draft',
    excerpt: post.excerpt ?? null,
    authorId: relationId(post.author),
    categoryIds: (post.categories ?? []).map(relationId),
    featuredImageId: relationId(post.featuredImage),
    seoTitle: post.seo?.title ?? null,
    seoDescription: post.seo?.description ?? null,
    keywords: post.seo?.keywords ?? [],
    adminUrl: adminUrl('posts', post.id),
    blogUrl: post._status === 'published' ? `${APP_URL}/blog/${post.slug}` : null,
    updatedAt: post.updatedAt,
  }
}

const headingChange = z
  .object({
    text: z.string().trim().max(120).optional(),
    italic: z.string().trim().max(120).optional().describe('Words shown in italics after text'),
  })
  .describe('Empty strings for both bring back the original wording')
const pictureChange = z.object({
  mediaId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional()
    .describe('A photo in the media library. null brings back the original photo.'),
  alt: z.string().trim().max(200).optional().describe('Photo description for screen readers'),
})
const paragraphChange = z
  .string()
  .trim()
  .max(600)
  .describe('Empty string brings back the original wording')

function listChange(fallback: Record<string, string>[]) {
  const item = Object.fromEntries(
    Object.keys(fallback[0] ?? {}).map((key) => [key, z.string().trim().max(1500)])
  )
  return z
    .array(z.object(item).strict())
    .max(60)
    .describe(
      'Replaces the whole list, in order. Read the current list first and send every item to keep. An empty list brings back the original list.'
    )
}

function changeSchema(fallback: ContentValue) {
  if (typeof fallback === 'string') return paragraphChange
  if (Array.isArray(fallback)) return listChange(fallback)
  if (isPicture(fallback)) return pictureChange
  return headingChange
}

function pageChangeSchema(page: SitePage) {
  const defaults: Record<string, ContentValue> = SITE_CONTENT_DEFAULTS[page]
  const fields = Object.entries(defaults).map(([key, fallback]) => [
    key,
    changeSchema(fallback).optional(),
  ])
  return z.object(Object.fromEntries(fields)).strict().optional()
}

type StoredPage = Record<string, unknown>
type PictureChange = z.infer<typeof pictureChange>
type HeadingChange = z.infer<typeof headingChange>

function mergePage(
  page: SitePage,
  stored: StoredPage,
  changes: Record<string, unknown>
): StoredPage {
  const defaults: Record<string, ContentValue> = SITE_CONTENT_DEFAULTS[page]
  const merged: StoredPage = { ...stored }
  for (const [key, change] of Object.entries(changes)) {
    const fallback = defaults[key]
    if (change === undefined || fallback === undefined) continue
    const existing = (stored[key] ?? {}) as Record<string, unknown>
    if (typeof fallback === 'string' || Array.isArray(fallback)) merged[key] = change
    else if (isPicture(fallback)) {
      const picture = change as PictureChange
      merged[key] = {
        image:
          picture.mediaId === undefined
            ? relationId(existing['image'] as number | null)
            : picture.mediaId,
        alt: picture.alt ?? existing['alt'] ?? null,
      }
    } else merged[key] = { ...existing, ...(change as HeadingChange) }
  }
  return merged
}

function changedMediaIds(changes: Record<string, unknown>): number[] {
  return Object.values(changes).flatMap((change) =>
    change &&
    typeof change === 'object' &&
    'mediaId' in change &&
    typeof change.mediaId === 'number'
      ? [change.mediaId]
      : []
  )
}

function courseSummary(course: Course) {
  return {
    id: course.id,
    title: course.title,
    status: course.status,
    summary: course.summary,
    introduction: course.introduction,
    duration: course.duration ?? null,
    featuredImageId: relationId(course.featuredImage),
    adminUrl: adminUrl('courses', course.id),
    url: course.status === 'published' ? `${APP_URL}/courses/${course.slug}` : null,
  }
}

function sitePageSummary(page: SitePage, stored: SiteContent[SitePage] | undefined) {
  const content: Record<string, ContentValue> = resolvePageContent(page, stored)
  const values: Record<string, unknown> = stored ?? {}
  return Object.fromEntries(
    Object.entries(content).map(([key, value]) => {
      if (!isPicture(value)) return [key, value]
      const image = (values[key] as { image?: number | Media | null } | undefined)?.image
      return [
        key,
        {
          mediaId: relationId(image),
          src: value.src,
          alt: value.alt,
          original: !relationId(image),
        },
      ]
    })
  )
}

function pagePhotos(global: SiteContent): { media: Media[]; labels: string[] } {
  const media: Media[] = []
  const labels: string[] = []
  for (const page of SITE_PAGES) {
    for (const [key, value] of Object.entries(global[page] ?? {})) {
      const image = value && typeof value === 'object' && 'image' in value ? value.image : null
      if (typeof image === 'object' && image) {
        media.push(image)
        labels.push(`${page}.${key}: media id ${image.id}`)
      }
    }
  }
  return { media, labels }
}

async function siteContentSummary(payload: Payload, global: SiteContent) {
  const pages = Object.fromEntries(
    SITE_PAGES.map((page) => [page, sitePageSummary(page, global[page])])
  )
  const { media, labels } = pagePhotos(global)
  return new WithPhotos(
    {
      pages,
      adminUrl: `${APP_URL}/admin/globals/site-content`,
      note: 'Photos with original: true are the built-in site photos; the pictures below are the ones Steph has chosen.',
    },
    await thumbnails(payload, media, labels)
  )
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

  async function assertPhotos(mediaIds: number[]) {
    if (mediaIds.length === 0) return
    const found = await payload.find({
      collection: 'media',
      where: { and: [{ id: { in: mediaIds } }, { mimeType: { contains: 'image/' } }] },
      limit: mediaIds.length,
      depth: 0,
      ...access,
    })
    const missing = mediaIds.filter((id) => !found.docs.some((doc) => doc.id === id))
    if (missing.length > 0)
      throw new Error(`No photo with media id ${missing.join(', ')}. Check list_recent_media.`)
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
    'Searches products by name, or fetches one by id. Includes drafts. Fetching by id also shows its photos, lead photo first.',
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
        depth: id ? 1 : 0,
        sort: '-updatedAt',
        ...access,
      })
      const summary = { totalDocs: found.totalDocs, products: found.docs.map(productSummary) }
      const [product] = found.docs
      if (!id || !product) return summary
      const gallery = (product.images ?? []).flatMap(({ image }) =>
        typeof image === 'object' && image ? [image] : []
      )
      return new WithPhotos(summary, await thumbnails(payload, gallery))
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
    'list_recent_media',
    'Shows the newest photos in the media library, newest first, with their ids, for example ones Steph just uploaded.',
    { limit: z.number().int().min(1).max(20).optional() },
    true,
    async ({ limit }) => {
      const found = await payload.find({
        collection: 'media',
        where: { mimeType: { contains: 'image/' } },
        sort: '-createdAt',
        limit: limit ?? 8,
        depth: 0,
        ...access,
      })
      return new WithPhotos(found.docs.map(photoSummary), await thumbnails(payload, found.docs))
    }
  )

  tool(
    'describe_photos',
    'Sets the description (alt text) of photos already in the media library, by id. Look at the photos first, then write one plain sentence each saying what the photo shows.',
    {
      photos: z
        .array(
          z.object({
            id: z.number().int().positive(),
            alt: z.string().trim().min(1).max(200).describe('What the photo shows'),
          })
        )
        .min(1)
        .max(50),
    },
    false,
    async ({ photos }) => {
      const updated = []
      for (const { id, alt } of photos) {
        updated.push(
          photoSummary(await payload.update({ collection: 'media', id, data: { alt }, ...access }))
        )
      }
      return { updated }
    }
  )

  tool(
    'photo_upload_link',
    'Makes a private link, valid for 24 hours, where Steph picks photos from her phone or computer to add to the shop unchanged. With productId, the photos are appended to that draft listing in the order she picks them. Give her the link and ask her to tell you when they are uploaded.',
    {
      productId: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('A draft product to add the photos to. Leave out for a blog photo.'),
    },
    false,
    async ({ productId }) => {
      if (productId) {
        const product = await payload.findByID({
          collection: 'products',
          id: productId,
          depth: 0,
          ...access,
        })
        if (product.status !== 'draft')
          throw new Error(
            `"${product.name}" is ${product.status}, not a draft. Steph adds photos to it in the admin.`
          )
      }
      const admin = await findShopAdmin(payload, user.id)
      if (!admin) throw new Error('Only a shop admin can add photos.')
      return {
        ...photoUploadUrl(admin, productId),
        next: 'Give Steph this link. When she says the photos are uploaded, check them with find_products (or list_recent_media for a blog photo).',
      }
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
    'find_posts',
    'Searches blog posts by title, or fetches one by id with its full text. Includes drafts.',
    {
      id: z.number().int().positive().optional(),
      query: z.string().trim().max(100).optional().describe('Words in the title'),
      status: z.enum(['draft', 'published']).optional(),
      limit: z.number().int().min(1).max(30).optional(),
    },
    true,
    async ({ id, query, status, limit }) => {
      const found = await payload.find({
        collection: 'posts',
        where: {
          and: [
            ...(id ? [{ id: { equals: id } }] : []),
            ...(query ? [{ title: { like: query } }] : []),
            ...(status ? [{ _status: { equals: status } }] : []),
          ],
        },
        draft: true,
        limit: limit ?? 10,
        depth: 0,
        sort: '-updatedAt',
        ...access,
      })
      return {
        totalDocs: found.totalDocs,
        posts: found.docs.map((post) => ({
          ...postSummary(post),
          ...(id && { content: extractPlainText(post.content) }),
        })),
      }
    }
  )

  tool(
    'create_post_draft',
    'Creates a blog post as a DRAFT. Steph reviews and publishes it in the admin.',
    postCore,
    false,
    async (input) => {
      const post = await payload.create({
        collection: 'posts',
        draft: true,
        data: {
          ...postData(input),
          title: input.title,
          content: wordpressHtmlToLexical(input.contentHtml) as unknown as Post['content'],
          author: input.authorId,
          categories: input.categoryIds,
          slug: await uniqueSlug(payload, 'posts', slugify(input.title)),
          _status: 'draft',
        },
        ...access,
      })
      return {
        ...postSummary(post),
        next: 'Steph reviews this draft in the admin and publishes it herself.',
      }
    }
  )

  tool(
    'update_post_draft',
    'Changes fields on a blog post that is not live. Refuses published posts. Cannot publish.',
    {
      id: z.number().int().positive(),
      ...Object.fromEntries(
        Object.entries(postCore).map(([name, schema]) => [name, schema.optional()])
      ),
    } as { id: z.ZodNumber } & {
      [K in keyof typeof postCore]: z.ZodOptional<(typeof postCore)[K]>
    },
    false,
    async ({ id, ...input }) => {
      const live = await payload.findByID({ collection: 'posts', id, depth: 0, ...access })
      if (live._status === 'published')
        throw new Error(`"${live.title}" is live. Steph changes it in the admin.`)
      const updated = await payload.update({
        collection: 'posts',
        id,
        draft: true,
        data: postData(input),
        ...access,
      })
      return postSummary(updated)
    }
  )

  tool(
    'get_site_content',
    `Shows the current headings, text, lists and photos on these pages: ${PAGE_LIST}. Includes each chosen photo's media id and a thumbnail.`,
    {},
    true,
    async () =>
      siteContentSummary(
        payload,
        await payload.findGlobal({ slug: 'site-content', depth: 1, ...access })
      )
  )

  tool(
    'update_site_content',
    `Changes headings, text, lists or photos on one of these pages: ${PAGE_LIST}. This changes the LIVE site straight away; every earlier version stays restorable in the admin. Pass only the fields to change, under the page they belong to; other fields are kept. For a new photo, call photo_upload_link without a product so it lands in the media library, then pass its media id here.`,
    Object.fromEntries(SITE_PAGES.map((page) => [page, pageChangeSchema(page)])) as Record<
      SitePage,
      ReturnType<typeof pageChangeSchema>
    >,
    false,
    async (input) => {
      const changes = SITE_PAGES.flatMap((page) => {
        const pageChanges = input[page] as Record<string, unknown> | undefined
        return pageChanges && Object.keys(pageChanges).length > 0
          ? [[page, pageChanges] as const]
          : []
      })
      if (changes.length === 0)
        throw new Error('Nothing to change: name a page and the fields to change.')
      const mediaIds = [
        ...new Set(changes.flatMap(([, pageChanges]) => changedMediaIds(pageChanges))),
      ]
      await assertPhotos(mediaIds)
      const current = await payload.findGlobal({ slug: 'site-content', depth: 0, ...access })
      const data = Object.fromEntries(
        SITE_PAGES.map((page) => {
          const pageChanges = changes.find(([changed]) => changed === page)?.[1]
          const stored = (current[page] ?? {}) as StoredPage
          return [page, pageChanges ? mergePage(page, stored, pageChanges) : stored]
        })
      )
      const updated = await payload.updateGlobal({
        slug: 'site-content',
        data,
        depth: 1,
        ...access,
      })
      return siteContentSummary(payload, updated)
    }
  )

  tool(
    'find_courses',
    'Lists the courses on the /courses page with their text, status and photo media id.',
    {},
    true,
    async () => {
      const found = await payload.find({
        collection: 'courses',
        limit: 30,
        depth: 0,
        sort: '-publishedAt',
        ...access,
      })
      return { courses: found.docs.map(courseSummary) }
    }
  )

  tool(
    'update_course',
    'Changes a course’s photo or text. Published courses change on the LIVE /courses page straight away, so show Steph the change and get her yes first. For a new photo, call photo_upload_link without a product, then pass its media id as featuredImageId (null brings back the built-in photo).',
    {
      id: z.number().int().positive(),
      title: z.string().trim().min(3).max(120).optional(),
      summary: z.string().trim().min(1).max(420).optional(),
      introduction: z.string().trim().min(1).max(4000).optional(),
      duration: z.string().trim().max(80).optional(),
      featuredImageId: z.number().int().positive().nullable().optional(),
    },
    false,
    async ({ id, featuredImageId, ...text }) => {
      if (featuredImageId === undefined && Object.keys(text).length === 0)
        throw new Error('Nothing to change: name the fields to change.')
      if (featuredImageId) await assertPhotos([featuredImageId])
      const updated = await payload.update({
        collection: 'courses',
        id,
        data: {
          ...text,
          ...(featuredImageId !== undefined && { featuredImage: featuredImageId }),
        },
        depth: 0,
        ...access,
      })
      return courseSummary(updated)
    }
  )

  return server
}

type Authentication =
  | { user: User }
  | { status: 401 | 403; message: string; invalidToken?: boolean }

async function authenticateOAuth(payload: Payload, token: string): Promise<Authentication> {
  const access = readAccessToken(token)
  const admin = access && (await findShopAdmin(payload, access.userId, access.sessionVersion))
  if (!admin)
    return {
      status: 401,
      message: 'The shop sign-in has expired. Reconnect the connector in Claude.',
      invalidToken: true,
    }
  return { user: admin.user }
}

async function authenticate(payload: Payload, request: Request): Promise<Authentication> {
  const key = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)\s*$/i)?.[1]
  if (!key)
    return {
      status: 401,
      message: 'Connect this connector in Claude and sign in with your shop login.',
    }
  if (looksLikeOAuthToken(key)) return authenticateOAuth(payload, key)
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

function challenge(invalidToken: boolean | undefined): string {
  const error = invalidToken ? ', error="invalid_token"' : ''
  return `Bearer resource_metadata="${PROTECTED_RESOURCE_METADATA_URL}"${error}`
}

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload()
  const authentication = await authenticate(payload, request)
  if (!('user' in authentication)) {
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32001, message: authentication.message }, id: null },
      {
        status: authentication.status,
        headers:
          authentication.status === 401
            ? { 'WWW-Authenticate': challenge(authentication.invalidToken) }
            : undefined,
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
