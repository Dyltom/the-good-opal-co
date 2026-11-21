import { getPayload } from '@/lib/payload'
import type { Post } from '@/types/payload-types'
import { BlogCard, toBlogCardPost } from './BlogCard'

function categoryIds(post: Post): number[] {
  return (post.categories ?? []).map((category) => (typeof category === 'object' ? category.id : category))
}

export async function RelatedReading({ post }: { post: Post }) {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ _status: { equals: 'published' } }, { id: { not_equals: post.id } }] },
    limit: 100,
    sort: '-publishedAt',
    depth: 1,
    overrideAccess: false,
  })
  const own = categoryIds(post)
  const sameCategory = (other: Post) => categoryIds(other).some((id) => own.includes(id))
  const related = [...docs.filter(sameCategory), ...docs.filter((other) => !sameCategory(other))].slice(0, 3)

  if (related.length === 0) return null

  return (
    <section aria-labelledby="related-reading" className="border-t border-rule pt-10">
      <h2 id="related-reading" className="text-[clamp(26px,3vw,38px)] leading-[1.05] tracking-[-0.015em]">
        Related reading
      </h2>
      <div className="mt-6 grid gap-x-[clamp(20px,2.4vw,40px)] gap-y-10 md:grid-cols-3">
        {related.map((other) => (
          <BlogCard key={other.id} post={toBlogCardPost(other)} headingLevel="h3" />
        ))}
      </div>
    </section>
  )
}
