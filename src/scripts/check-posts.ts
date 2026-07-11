import { getPayload } from '../lib/payload'

async function checkPosts() {
  try {
    console.log('🔍 Checking posts in database...\n')

    const payload = await getPayload()

    // Get all posts without any filters
    const allPosts = await payload.find({
      collection: 'posts',
      limit: 100,
      depth: 1
    })

    console.log(`Total posts found: ${allPosts.docs.length}`)

    if (allPosts.docs.length > 0) {
      console.log('\nPost details:')
      allPosts.docs.forEach((post, index) => {
        console.log(`\n${index + 1}. ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   _status: ${post._status}`)
        console.log(`   Published At: ${post.publishedAt}`)
        console.log(`   Created: ${post.createdAt}`)
      })
    }

    // Try querying with _status
    console.log('\n\n🔍 Checking posts with _status = published...')
    const publishedPosts = await payload.find({
      collection: 'posts',
      where: {
        _status: { equals: 'published' }
      },
      limit: 100
    })
    console.log(`Published posts found: ${publishedPosts.docs.length}`)

  } catch (error) {
    console.error('❌ Error checking posts:', error)
  } finally {
    process.exit(0)
  }
}

checkPosts()
