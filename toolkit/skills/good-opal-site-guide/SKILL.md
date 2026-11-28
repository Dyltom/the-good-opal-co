---
name: good-opal-site-guide
description: How The Good Opal Co website and its admin work, what the Good Opal shop connector can and cannot do, and the things Claude must never do for the shop. Use for any question about running goodopalco.com, the admin, orders, products, drafts or the Claude connector.
---

# Good Opal site guide

Steph owns The Good Opal Co and sells Australian opals and opal jewellery at goodopalco.com. Dylan built and looks after the site.

## Where things are

- The shop: https://goodopalco.com/store. A piece's page is /store/<slug>.
- The admin: https://goodopalco.com/admin. Steph logs in with her email and password.
- The full guide to the admin is Steph's owner guide, `OWNER-GUIDE.md` in this skill folder (the latest copy is https://github.com/Dyltom/the-good-opal-co/blob/main/docs/OWNER-GUIDE.md). Answer from it rather than guessing; if it does not cover something, say so and suggest she asks Dylan.

Key admin facts:

- **Products** have a Status: Draft (only Steph sees it), Published (live in the shop) or Archived (hidden everywhere).
- A description line written as "Label: value" shows in the piece's details table.
- Stock 1 means one of a kind; 0 means sold.
- Prices are full AUD prices. The site does not add GST.
- **Orders** are paid through Stripe and appear in the admin as Processing. When Steph sets an order to Shipped with a tracking number, the site emails the buyer. Refunds are done in Stripe, never by setting Refunded by hand.
- **Posts** use Save Draft and Publish changes.
- Home, About, FAQ, Shipping, Returns, Privacy, Terms and Services pages are part of the site's code: Dylan changes those.

## What the connector can do

The "Good Opal shop" connector lets Claude:

- find products, including drafts
- create a product as a draft and change drafts
- make a private 24-hour link where Steph uploads photos from her phone or computer straight onto a draft, and look at a draft's photos
- find blog posts, create blog post drafts and change posts that are not live yet
- list recent orders: number, date, status, buyer's name, items and total. It cannot see emails, phone numbers or addresses.
- list categories, stone types, origins, metals and blog authors

It can also read and change the headings, short paragraphs, lists and photos on the main pages: home, about, services, courses, FAQ (every question and answer), gifts, gift vouchers, contact and journal, plus each page's search title and description, and the terms, privacy, cookies, shipping and returns pages (`get_site_content`, `update_site_content`). A policy page's text is sent as markdown and replaces the whole page, so read the live page first and never change legal wording Steph has not approved, and a course's photo and text (`find_courses`, `update_course`). Those changes go live straight away, so show Steph the exact new wording or photo and get her yes before saving; every earlier version can be restored in the admin under **Page content**. For a new page photo, call `photo_upload_link` with no product, then pass the new media id to `update_site_content`.

Apart from page content, it cannot publish, archive, delete, change a live product, change an order, issue refunds or send email. Steph does all of those in the admin or Stripe.

## Never

1. **Never publish** a product or post, or ask Steph to let you. She publishes.
2. **Never delete** anything, or suggest deleting a product or order. Pieces are archived; orders are her records.
3. **Never set or change a price** she has not given you in this conversation.
4. **Never alter stone colour** in a photo: no filters, tints, white balance, saturation, contrast or brightness changes, background replacement or enhancement. Crop, quarter-turn and pad only (see good-opal-photos).
5. **Never email or message customers**, and never draft a message as if it has been sent. If she wants to reply to a customer, write the text for her to send herself.
6. Never invent a fact, review, certificate, origin, weight, discount, delivery time or story.
7. Never share order details outside this conversation.

## When something looks wrong

If a tool returns an error, tell Steph plainly what it said and what to try next. If the connector stops working or asks her to sign in, she opens **Customize > Connectors** in Claude, picks Good Opal Co and clicks **Connect**, then signs in with her shop email and password. This also happens after she changes her shop password.
