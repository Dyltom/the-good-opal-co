import { getPayload } from '@/lib/payload'
import {
  downloadWordPressMedia,
  fetchPublishedWordPressPosts,
  type WordPressAuthor,
  type WordPressContentPost,
  type WordPressFeaturedMedia,
  type WordPressTerm,
} from '@/lib/wordpress/content-import'

const TENANT_ID = 'good-opal-co'

function enabled(name: string): boolean {
  return process.env[name] === 'true'
}

async function findOrImportMedia(media: WordPressFeaturedMedia): Promise<number> {
  const payload = await getPayload()
  const byLegacyId = await payload.find({
    collection: 'media',
    where: { legacyWordPressId: { equals: media.id } },
    limit: 1,
    overrideAccess: true,
  })
  if (byLegacyId.docs[0]) return byLegacyId.docs[0].id

  const bySourceUrl = await payload.find({
    collection: 'media',
    where: { legacySourceUrl: { equals: media.sourceUrl } },
    limit: 1,
    overrideAccess: true,
  })
  if (bySourceUrl.docs[0]) return bySourceUrl.docs[0].id

  const imported = await payload.create({
    collection: 'media',
    data: {
      legacyWordPressId: media.id,
      legacySourceUrl: media.sourceUrl,
      alt: media.alt,
      caption: media.title,
      tenantId: TENANT_ID,
    },
    file: await downloadWordPressMedia(media),
    overrideAccess: true,
  })
  return imported.id
}

async function existingPostFor(post: WordPressContentPost) {
  const payload = await getPayload()
  const byLegacyId = await payload.find({
    collection: 'posts',
    where: { legacyWordPressId: { equals: post.id } },
    limit: 1,
    overrideAccess: true,
  })
  if (byLegacyId.docs[0]) return byLegacyId.docs[0]

  const bySlug = await payload.find({
    collection: 'posts',
    where: { slug: { equals: post.slug } },
    limit: 1,
    overrideAccess: true,
  })
  const slugOwner = bySlug.docs[0]
  if (slugOwner?.legacyWordPressId && slugOwner.legacyWordPressId !== post.id) {
    throw new Error(
      `Legacy post ${post.id} conflicts with WordPress post ${slugOwner.legacyWordPressId} at slug ${post.slug}`
    )
  }
  return slugOwner
}

async function upsertAuthor(author: WordPressAuthor): Promise<number> {
  const payload = await getPayload()
  const byLegacyId = await payload.find({
    collection: 'authors',
    where: { legacyWordPressId: { equals: author.id } },
    limit: 1,
    overrideAccess: true,
  })
  const bySlug = byLegacyId.docs[0]
    ? undefined
    : (
        await payload.find({
          collection: 'authors',
          where: { slug: { equals: author.slug } },
          limit: 1,
          overrideAccess: true,
        })
      ).docs[0]
  const existing = byLegacyId.docs[0] ?? bySlug
  const data = {
    legacyWordPressId: author.id,
    name: author.name,
    slug: author.slug,
    bio: author.bio || undefined,
    tenantId: TENANT_ID,
  }
  if (existing) {
    const updated = await payload.update({
      collection: 'authors',
      id: existing.id,
      data,
      overrideAccess: true,
    })
    return updated.id
  }
  const created = await payload.create({
    collection: 'authors',
    data,
    overrideAccess: true,
  })
  return created.id
}

async function upsertCategory(term: WordPressTerm): Promise<number> {
  const payload = await getPayload()
  const byLegacyId = await payload.find({
    collection: 'categories',
    where: { legacyWordPressId: { equals: term.id } },
    limit: 1,
    overrideAccess: true,
  })
  const bySlug = byLegacyId.docs[0]
    ? undefined
    : (
        await payload.find({
          collection: 'categories',
          where: { slug: { equals: term.slug } },
          limit: 1,
          overrideAccess: true,
        })
      ).docs[0]
  const existing = byLegacyId.docs[0] ?? bySlug
  const data = {
    legacyWordPressId: term.id,
    name: term.name,
    slug: term.slug,
    description: term.description || undefined,
    tenantId: TENANT_ID,
  }
  if (existing) {
    const updated = await payload.update({
      collection: 'categories',
      id: existing.id,
      data,
      overrideAccess: true,
    })
    return updated.id
  }
  const created = await payload.create({
    collection: 'categories',
    data,
    overrideAccess: true,
  })
  return created.id
}

async function upsertTag(term: WordPressTerm): Promise<number> {
  const payload = await getPayload()
  const byLegacyId = await payload.find({
    collection: 'tags',
    where: { legacyWordPressId: { equals: term.id } },
    limit: 1,
    overrideAccess: true,
  })
  const bySlug = byLegacyId.docs[0]
    ? undefined
    : (
        await payload.find({
          collection: 'tags',
          where: { slug: { equals: term.slug } },
          limit: 1,
          overrideAccess: true,
        })
      ).docs[0]
  const existing = byLegacyId.docs[0] ?? bySlug
  const data = {
    legacyWordPressId: term.id,
    name: term.name,
    slug: term.slug,
    description: term.description || undefined,
    tenantId: TENANT_ID,
  }
  if (existing) {
    const updated = await payload.update({
      collection: 'tags',
      id: existing.id,
      data,
      overrideAccess: true,
    })
    return updated.id
  }
  const created = await payload.create({
    collection: 'tags',
    data,
    overrideAccess: true,
  })
  return created.id
}

async function importContent(): Promise<void> {
  const payload = await getPayload()
  const apply = enabled('WORDPRESS_CONTENT_APPLY')
  const posts = await fetchPublishedWordPressPosts({
    endpoint: process.env.WORDPRESS_POSTS_API_URL,
  })
  let created = 0
  let updated = 0
  let mediaImported = 0
  const mediaCache = new Map<number, number>()
  const authorCache = new Map<number, number>()
  const categoryCache = new Map<number, number>()
  const tagCache = new Map<number, number>()

  for (const post of posts) {
    const existing = await existingPostFor(post)
    if (!apply) {
      existing ? (updated += 1) : (created += 1)
      continue
    }

    let featuredImage: number | undefined
    if (post.featuredMedia) {
      const cached = mediaCache.get(post.featuredMedia.id)
      if (cached) {
        featuredImage = cached
      } else {
        featuredImage = await findOrImportMedia(post.featuredMedia)
        mediaCache.set(post.featuredMedia.id, featuredImage)
        mediaImported += 1
      }
    }

    if (!post.author) throw new Error(`WordPress post ${post.id} has no embedded author`)
    if (post.categories.length === 0) {
      throw new Error(`WordPress post ${post.id} has no embedded category`)
    }
    const author = authorCache.get(post.author.id) ?? (await upsertAuthor(post.author))
    authorCache.set(post.author.id, author)
    const categories = await Promise.all(
      post.categories.map(async (category) => {
        const id = categoryCache.get(category.id) ?? (await upsertCategory(category))
        categoryCache.set(category.id, id)
        return id
      })
    )
    const tags = await Promise.all(
      post.tags.map(async (tag) => {
        const id = tagCache.get(tag.id) ?? (await upsertTag(tag))
        tagCache.set(tag.id, id)
        return id
      })
    )

    const data = {
      legacyWordPressId: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      ...(featuredImage ? { featuredImage } : {}),
      author,
      categories,
      tags,
      _status: 'published' as const,
      publishedAt: post.publishedAt,
      tenantId: TENANT_ID,
    }

    if (existing) {
      await payload.update({
        collection: 'posts',
        id: existing.id,
        data,
        draft: false,
        overrideAccess: true,
      })
      updated += 1
    } else {
      await payload.create({ collection: 'posts', data, draft: false, overrideAccess: true })
      created += 1
    }
  }

  payload.logger.info(
    `WordPress content import ${apply ? 'applied' : 'dry run'}: ${created} create, ${updated} update, ${mediaImported} featured media processed, ${posts.length} source posts.`
  )
}

importContent()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown import error'
    console.error(`WordPress content import failed: ${message}`)
    process.exit(1)
  })
