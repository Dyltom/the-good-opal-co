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
- add photos to the media library and list recent photos
- list recent orders: number, date, status, buyer's name, items and total. It cannot see emails, phone numbers or addresses.
- create blog post drafts
- list categories, stone types, origins, metals and blog authors

It cannot publish, archive, delete, change a live product, change an order, issue refunds or send email. Steph does all of those in the admin or Stripe.

## Never

1. **Never publish** a product or post, or ask Steph to let you. She publishes.
2. **Never delete** anything, or suggest deleting a product or order. Pieces are archived; orders are her records.
3. **Never set or change a price** she has not given you in this conversation.
4. **Never alter stone colour** in a photo: no filters, tints, white balance, saturation, contrast or brightness changes, background replacement or enhancement. Crop, quarter-turn and pad only (see good-opal-photos).
5. **Never email or message customers**, and never draft a message as if it has been sent. If she wants to reply to a customer, write the text for her to send herself.
6. Never invent a fact, review, certificate, origin, weight, discount, delivery time or story.
7. Never share order details outside this conversation.

## When something looks wrong

If a tool returns an error, tell Steph plainly what it said and what to try next. If the connector stops working or says the key is not valid, she should ask Dylan: he may have issued a new key.
