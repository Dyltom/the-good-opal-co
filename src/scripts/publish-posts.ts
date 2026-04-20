import { getPayload } from '../lib/payload'

async function publishPosts() {
  try {
    console.log('📝 Publishing existing posts...\n')

    const payload = await getPayload()

    // Get all posts
    const allPosts = await payload.find({
      collection: 'posts',
      limit: 100,
      depth: 0
    })

    console.log(`Found ${allPosts.docs.length} posts to publish`)

    let publishedCount = 0

    for (const post of allPosts.docs) {
      try {
        // Update the post to published status
        await payload.update({
          collection: 'posts',
          id: post.id,
          data: {
            _status: 'published'
          }
        })

        console.log(`✅ Published: ${post.title}`)
        publishedCount++
      } catch (error) {
        console.error(`❌ Failed to publish: ${post.title}`, error)
      }
    }

    console.log(`\n🎉 Successfully published ${publishedCount} out of ${allPosts.docs.length} posts!`)

  } catch (error) {
    console.error('❌ Error publishing posts:', error)
  } finally {
    process.exit(0)
  }
}

publishPosts()