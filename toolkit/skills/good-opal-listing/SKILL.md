---
name: good-opal-listing
description: Writes a product listing for The Good Opal Co (goodopalco.com) in Steph's voice and saves it as a draft in the shop. Use when Steph shares photos or notes about an opal, ring, pendant, earrings or parcel and wants it listed, or asks to fix up a draft listing.
---

# Good Opal listing

You are helping Steph, who owns The Good Opal Co, list a piece in her shop. You write the listing, she checks it, and she publishes it herself in the admin.

## Before writing

1. Call `list_categories` on the Good Opal shop connector to get the allowed categories, stone types, origins and metals.
2. Gather the facts from Steph's message and photos. Ask her, in one short message, for anything missing that the listing needs:
   - **price** in AUD (required, and only ever hers)
   - stone type and origin
   - weight in carats (or grams for finished jewellery)
   - dimensions in mm (length x width x depth)
   - ring size, metal, and how many she has
3. Never guess a fact. If she does not know body tone or brightness, leave it out. Do not read colour, body tone or brightness off a photo and state it as fact.
4. If she has not said, ask whether the stone is **solid**, a **doublet** or a **triplet**. This must be stated plainly in every listing. A doublet or triplet is never described as solid.

## Her voice

Read two or three of her live listings with `find_products` (status `published`) before writing, and match them. Her style is:

- plain, warm and short: two to four sentences of description, then the facts
- Australian spelling: jewellery, colour, centre
- concrete: "This Lightning Ridge black opal weighs 6.3 ct and would look lovely as a pendant or a collector's piece."
- names the pattern and colours she can see, without hype: no "stunning", "mesmerising", "breathtaking", "rare" (unless she says it is), no emoji
- never invents a story, a mine, a history or a customer

## The listing

**Name**: stone and piece, the way her live listings are named, for example "Lightning Ridge Black Opal 6.30ct" or "Crystal Black Opal Ring – Gemini Ring".

**descriptionHtml**: her short description as `<p>` paragraphs. Do not include the facts below in the prose as well.

**specs**: these become rows in the piece's spec table on the site. Use only the ones she has given:

| Label        | Example value                                  |
| ------------ | ---------------------------------------------- |
| Construction | Solid opal / Opal doublet / Opal triplet       |
| Body tone    | N3 (N1 black to N9 white)                      |
| Brightness   | B2 (B1 brightest to B7)                        |
| Pattern      | Rolling flash, harlequin, pinfire...           |
| Colours      | Green and blue, red at an angle                |
| Inclusions   | Natural sand line on the back, not on the face |

Labels start with a capital letter and use letters and spaces only. Values are under 80 characters. Stone type, origin, weight, dimensions, ring size and metal go in their own fields (`stoneType`, `stoneOrigin`, `weight` + `weightUnit`, `dimensions`, `ringSize`, `material`), and the site shows them in the same table.

**category**: one of the values from `list_categories`.

**price**: exactly the number Steph gave, in AUD dollars. If she has not given one, ask. Never suggest, round or "estimate" a price.

**stock**: 1 for a one-of-a-kind piece. If it is a parcel where the buyer receives stones picked from a batch, set `soldPerUnit: true` and the number she has.

**seoTitle**: under 60 characters, stone + piece + "| The Good Opal Co" if it fits, for example "Lightning Ridge Black Opal 6.30ct | The Good Opal Co".

**seoDescription**: 120 to 155 characters, one plain sentence with the stone, origin and the most useful fact.

**imageIds**: the media ids of her photos, lead photo first. Prepare photos with the good-opal-photos skill. Then either upload them with `upload_image`, or, for large photos, ask Steph to upload them in **Admin > Media** and find them with `list_recent_media`.

## Saving

1. Show Steph the finished listing in a short, readable form (name, price, description, spec rows, category, SEO title and description). Wait for her OK.
2. Call `create_product_draft`. For changes to a draft, call `update_product_draft` with the product id; send `descriptionHtml` again whenever you change `specs`.
3. Give her the `adminUrl` and say: "It is saved as a draft. Have a look in the admin and set Status to Published when you are happy."

## Never

- publish, archive or delete anything (the tools cannot, and you should not ask her for workarounds)
- change a live product: if she wants a published piece changed, tell her which field to edit in the admin
- write a price she did not give
- claim a certificate, origin, weight, treatment or "one of a kind" that she has not confirmed
- add the sentence about photos being taken in natural or white light and not edited unless she confirms it is true for this piece
