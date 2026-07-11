/**
 * Import blog posts from WordPress into Payload CMS
 * Run with: npx tsx scripts/import-wordpress-posts.ts
 */

import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import { getPayload } from 'payload'
import config from '@/payload.config'
import * as fs from 'fs'

const POSTS_JSON = '/Users/dylanhenderson/the-good-opal-co/scripts/wordpress-posts.json'

interface WordPressPost {
  id: number
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  content: string
}

/**
 * Converts markdown-like text content to Lexical rich text format
 */
function contentToLexical(content: string) {
  const lines = content.split('\n')
  const children: unknown[] = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()

    if (!line) {
      i++
      continue
    }

    // Handle headings
    if (line.startsWith('## ')) {
      children.push({
        type: 'heading',
        tag: 'h2',
        children: [{ text: line.slice(3), type: 'text' }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      })
      i++
      continue
    }

    // Handle unordered list items
    if (line.startsWith('- ')) {
      const listItems: unknown[] = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        listItems.push({
          type: 'listitem',
          value: 1,
          children: [{ text: lines[i].trim().slice(2), type: 'text' }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        })
        i++
      }
      children.push({
        type: 'list',
        tag: 'ul',
        listType: 'bullet',
        children: listItems,
        direction: 'ltr',
        format: '',
        indent: 0,
        start: 1,
        version: 1,
      })
      continue
    }

    // Handle ordered list items (numbered steps)
    if (/^\d+\.\s/.test(line) || line.startsWith('**Step ')) {
      const listItems: unknown[] = []
      while (i < lines.length) {
        const currentLine = lines[i].trim()
        if (/^\d+\.\s/.test(currentLine) || currentLine.startsWith('**Step ')) {
          const text = currentLine.replace(/^\d+\.\s/, '').replace(/^\*\*Step \d+:\*\*\s?/, '')
          listItems.push({
            type: 'listitem',
            value: listItems.length + 1,
            children: [{ text, type: 'text' }],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          })
          i++
        } else if (currentLine && !currentLine.startsWith('#') && !currentLine.startsWith('|')) {
          break
        } else {
          break
        }
      }
      if (listItems.length > 0) {
        children.push({
          type: 'list',
          tag: 'ol',
          listType: 'number',
          children: listItems,
          direction: 'ltr',
          format: '',
          indent: 0,
          start: 1,
          version: 1,
        })
      }
      continue
    }

    // Handle bold text at start (like "**You'll need:**")
    if (line.startsWith('**') && line.includes(':**')) {
      const boldText = line.replace(/\*\*/g, '')
      children.push({
        type: 'paragraph',
        children: [{ text: boldText, type: 'text', format: 1 }], // format: 1 = bold
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 1,
      })
      i++
      continue
    }

    // Handle tables (skip for now - just note them as text)
    if (line.startsWith('|')) {
      // Skip table rows
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        i++
      }
      children.push({
        type: 'paragraph',
        children: [{ text: '[Ring size chart - see website for full table]', type: 'text', format: 2 }], // format: 2 = italic
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      })
      continue
    }

    // Regular paragraph
    // Handle inline bold
    let paragraphChildren: unknown[] = []
    const boldRegex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    let hasFormatting = false

    while ((match = boldRegex.exec(line)) !== null) {
      hasFormatting = true
      if (match.index > lastIndex) {
        paragraphChildren.push({ text: line.slice(lastIndex, match.index), type: 'text' })
      }
      paragraphChildren.push({ text: match[1], type: 'text', format: 1 })
      lastIndex = match.index + match[0].length
    }

    if (hasFormatting) {
      if (lastIndex < line.length) {
        paragraphChildren.push({ text: line.slice(lastIndex), type: 'text' })
      }
    } else {
      paragraphChildren = [{ text: line, type: 'text' }]
    }

    children.push({
      type: 'paragraph',
      children: paragraphChildren,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    })
    i++
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

async function importPosts() {
  console.log('Starting WordPress posts import...\n')

  const payload = await getPayload({ config })

  // Read posts JSON
  const postsData: WordPressPost[] = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf-8'))
  console.log(`Found ${postsData.length} posts to import\n`)

  let createdPosts = 0

  for (const post of postsData) {
    try {
      console.log(`\n Processing: ${post.title}`)

      // Check if post already exists
      const existing = await payload.find({
        collection: 'posts',
        where: {
          slug: { equals: post.slug },
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        console.log(`  -> Post already exists, skipping`)
        continue
      }

      // Convert content to Lexical format
      const richTextContent = contentToLexical(post.content)

      // Create post
      const postData = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: richTextContent,
        _status: 'published' as const,
        publishedAt: post.publishedAt,
        tenantId: 'goodopalco',
      }

      await payload.create({
        collection: 'posts',
        data: postData,
        draft: false,
      })

      createdPosts++
      console.log(`  -> Post created successfully`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(`  -> Error: ${message}`)
    }
  }

  console.log(`\n\n Import Complete!`)
  console.log(` Created ${createdPosts} posts`)

  process.exit(0)
}

importPosts().catch((error) => {
  console.error('Import failed:', error)
  process.exit(1)
})
