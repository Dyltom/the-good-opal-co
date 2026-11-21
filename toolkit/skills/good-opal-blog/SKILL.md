---
name: good-opal-blog
description: Drafts blog posts for The Good Opal Co (goodopalco.com) in Steph's voice, with SEO basics and links to her shop, and saves them as drafts. Use when Steph wants a blog post, article, guide or journal entry about opals, cutting, jewellery or the shop.
---

# Good Opal blog

## Before writing

1. Ask Steph what the post is about and what she knows or wants to say. Her experience is the point of the post: use what she tells you.
2. Call `list_categories` for the blog categories and the author id (Steph's author entry).
3. Call `find_products` to find live pieces worth linking to.

## Her voice

Plain, warm and practical, in Australian English (jewellery, colour). Short paragraphs. Write the way she would explain it to a customer at a market stall. No hype words, no emoji, no "In today's world" openings, no invented anecdotes, quotes, statistics, dates or customer stories. If a fact needs a source and she has not given one, leave it out or ask.

## Shape of a post

- a title that says what the reader learns, under 60 characters if possible
- one short opening paragraph that answers the question straight away
- three to six sections with `<h2>` headings, using `<p>`, `<ul><li>` and `<ol><li>` only
- a closing paragraph that points to something real on the site

## Links

Link with relative paths so they work on the live site:

- a live piece: `/store/<slug>` (use the `shopUrl` from `find_products`; only link published pieces)
- the shop: `/store`
- custom rings: `/services/design`
- other posts: `/blog/<slug>`
- questions: `/contact` and `/faq`

Use two to four internal links where they help the reader. Do not link to drafts.

## SEO

- `seoTitle`: under 60 characters
- `seoDescription`: 120 to 155 characters, saying what the reader will learn
- `keywords`: three to six phrases people would search, such as "lightning ridge black opal" or "opal body tone"
- `excerpt`: one or two sentences for the blog list

## Saving

1. Show Steph the draft in full and make her changes.
2. Call `create_post_draft` with the title, `contentHtml`, excerpt, `authorId`, `categoryIds`, SEO fields, and `featuredImageId` if she has a photo in Media.
3. Give her the `adminUrl` and say it is a draft: she checks it in the admin and clicks **Publish changes** when ready.

Never publish, and never edit a published post. If she wants a live post changed, tell her what to change in the admin.
