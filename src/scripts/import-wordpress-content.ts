import { getPayload } from '@/lib/payload'
import {
  downloadWordPressMedia,
  fetchPublishedWordPressPosts,
  type WordPressContentPost,
  type WordPressFeaturedMedia,
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

    const data = {
      legacyWordPressId: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      ...(featuredImage ? { featuredImage } : {}),
      status: 'published' as const,
      publishedAt: post.publishedAt,
      tenantId: TENANT_ID,
    }

    if (existing) {
      await payload.update({
        collection: 'posts',
        id: existing.id,
        data,
        overrideAccess: true,
      })
      updated += 1
    } else {
      await payload.create({ collection: 'posts', data, overrideAccess: true })
      created += 1
    }
  }

  payload.logger.info(
    `WordPress content import ${apply ? 'applied' : 'dry run'}: ${created} create, ${updated} update, ${mediaImported} featured media processed, ${posts.length} source posts.`
  )
}

importContent().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
