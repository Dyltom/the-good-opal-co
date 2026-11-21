# Claude toolkit for Steph

Lets Steph run everyday shop jobs from the Claude app (claude.ai or Claude Desktop): drafting listings from her photos and notes, framing photos, drafting blog posts and checking recent orders. Claude only ever creates and edits **drafts**; Steph publishes in the admin.

Two parts:

- **The Good Opal shop connector**: an MCP endpoint at `https://goodopalco.com/api/mcp` (`src/app/api/mcp/route.ts`).
- **Four skills** in `toolkit/skills/`: `good-opal-listing`, `good-opal-photos`, `good-opal-blog` and `good-opal-site-guide`.

## Design

### How Claude reaches the shop

A claude.ai **custom connector** pointing at the site's MCP endpoint, authenticated with a request header. Custom connectors work on Free, Pro, Max, Team and Enterprise plans, in claude.ai and Claude Desktop, and sync between them. Claude calls the connector from Anthropic's cloud, so the endpoint has to be public, which goodopalco.com already is.

A `.mcpb` desktop extension was rejected: it needs Claude Desktop, a local process on Steph's computer and a reinstall for every change. The connector is one URL and one header, and it updates when the site deploys.

### Hand-written route, not `@payloadcms/plugin-mcp`

|              | (a) `@payloadcms/plugin-mcp`                                                                                                                             | (b) hand-written route (chosen)                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Upgrade      | 3.86.0 matches the current Payload, so no upgrade is needed. 3.94.1 pins payload 3.94.1 exactly, forcing every `@payloadcms/*` package to move together. | None. Adds `@modelcontextprotocol/sdk` only.                                                              |
| Schema       | Adds a `payload-mcp-api-keys` collection with per-collection permission columns: a large migration.                                                      | Turns on Payload's built-in API keys for Users: 3 nullable columns.                                       |
| Tools        | Generated CRUD for every enabled collection, including delete and publish unless each is switched off. Orders would expose email, phone and address.     | 8 tools written for Steph's jobs. No delete, no publish, orders reduced to name, items, status and total. |
| Dependencies | Brings zod 3 and `mcp-handler` beside the repo's zod 4.                                                                                                  | One SDK package.                                                                                          |

The upgrade to 3.94.1 was tried in a throwaway worktree: install worked, the lockfile changed by +1181/-329 lines, `tsc`, all unit tests (1128 passed, 2 skipped) and `next build` passed. Database drift, the admin at runtime and the e2e suite were not checked, so the upgrade is possible but is its own piece of work, not part of this one.

### Auth

Payload's own `useAPIKey` on the Users collection. The route takes `Authorization: Bearer <key>`, looks the key up through Payload's API-key strategy, and refuses with 401 for a missing or unknown key (or a session cookie) and 403 for any non-Admin user. Every tool runs through the Payload local API as that user with `overrideAccess: false`, so the collections' own access rules still apply.

**Know this before issuing a key:** a Users API key is also accepted by Payload's REST API (`Authorization: users API-Key <key>`), where an Admin can do anything, including publishing and deleting. The connector's limits keep Claude to drafts; the key itself is as powerful as an admin password. That is why the key belongs to its own user, so it can be revoked without touching Steph's login, and why it is shared only between Dylan and Steph's Claude settings.

### Photos and image upload

`upload_image` takes a public https URL or base64. Claude writes base64 into the tool call as output text, so it only suits small images (well under 1 MB). For full-size phone photos the flow is: Claude prepares the photos with the photos skill, Steph downloads them and uploads them in **Admin > Media**, and Claude finds them with `list_recent_media`.

The photos skill only crops, quarter-turns, centres, pads with the photo's own edge colour and resizes. `prepare_photo.py` checks that the stone pixels were copied exactly and that the average colour inside the stone box moved no more than 2/255 after resizing and saving; if not it deletes the output.

### Tools

| Tool                   | Does                                                                          |
| ---------------------- | ----------------------------------------------------------------------------- |
| `list_categories`      | Product categories, stone types, origins, metals, blog categories and authors |
| `find_products`        | Search by name or id, drafts included                                         |
| `create_product_draft` | Always status Draft, whatever is asked                                        |
| `update_product_draft` | Refuses products that are not drafts; never changes status                    |
| `upload_image`         | Adds a JPEG, PNG or WebP to Media                                             |
| `list_recent_media`    | Recent uploads, to attach to a draft                                          |
| `list_recent_orders`   | Number, date, status, buyer name, items, total                                |
| `create_post_draft`    | Blog post saved as a draft                                                    |

Product spec rows are written as "Label: value" description lines, which the product page already shows as its details table. The product page now also uses the product's SEO title and description when they are set.

## Dylan: release

1. Before deploying, apply migration `20261122_090000_users_api_keys` to prod, either with `pnpm payload migrate` (see `docs/DEPLOYMENT.md`) or by hand:

   ```sql
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "enable_a_p_i_key" boolean;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key" varchar;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key_index" varchar;
   INSERT INTO "payload_migrations" ("name", "batch", "updated_at", "created_at")
   SELECT '20261122_090000_users_api_keys', COALESCE(MAX("batch"), 0) + 1, now(), now() FROM "payload_migrations";
   ```

2. Deploy.
3. Build the skill zips: `toolkit/package-skills.sh ~/Downloads/good-opal-skills`. It writes one zip per skill and bundles `docs/OWNER-GUIDE.md` into the site guide.

## Dylan: issue Steph's key

1. In https://goodopalco.com/admin go to **Users > Create New**.
2. Email: an address only used for this (it never receives mail from the connector), Name: `Claude for Steph`, Role: **Admin**, and a long random password nobody needs to know.
3. Tick **Enable API Key** and **Save**. Payload fills in a key.
4. Click the eye icon beside **API Key** to show it, or the copy icon to copy it.
5. Get it to Steph's Claude settings without email or chat history: set the connector up with her on her computer, or use a password manager share.

## Dylan: revoke or replace the key

- **Revoke:** open the `Claude for Steph` user, untick **Enable API Key**, **Save**. The connector stops working on the next request.
- **Replace:** Payload 3.86 does not show a "generate new key" button, and re-ticking Enable API Key brings back the same key. To issue a fresh key, create a new user as above, update the connector's header with the new key, then untick Enable API Key on the old user (or delete it).
- The site logs every tool call with the tool name, so `docker logs` on the app container shows what Claude did and when.

## Steph: set up Claude

You need a Claude account (any plan) and about 10 minutes. Dylan gives you the key.

### 1. Add the shop connector

1. Open claude.ai (or the Claude Desktop app) and sign in.
2. Open **Customize**, then **Connectors**.
3. Click **+ Add**, then **Add custom connector**.
4. Fill in:
   - Name: `Good Opal shop`
   - URL: `https://goodopalco.com/api/mcp`
   - Under authentication, choose **Request headers** and add one header: name `Authorization`, value `Bearer ` followed by the key Dylan gave you (the word Bearer, one space, then the key).
5. Click **Add**. The connector shows its tools when it connects.

### 2. Add the skills

Dylan sends you four zip files. Do not unzip them.

1. Open **Customize**, then **Skills**.
2. Click **+**, then **Create skill**, then **Upload a skill**.
3. Choose one zip. Repeat for the other three:
   - `good-opal-listing.zip`: writes listings in your voice and saves them as drafts
   - `good-opal-photos.zip`: crops and frames photos without changing colour
   - `good-opal-blog.zip`: drafts blog posts
   - `good-opal-site-guide.zip`: how the site works and what Claude must never do
4. If Claude says it cannot run code, open **Settings > Capabilities** and turn on code execution (the photos skill needs it).

### 3. Use it

Start a new chat. Click **+** under the message box and check **Good Opal shop** is switched on. Then ask in your own words, for example:

- "Here are photos of a new Lightning Ridge black opal, 3.2 ct, 12 x 9 x 3 mm, solid, N2 B2, \$675. Make a listing draft." Claude asks for anything missing, shows you the listing, then saves it as a draft and gives you its admin link. Check it there and click Publish when you are happy.
- "Crop these photos for the shop." Download the results and upload them in **Admin > Media**, then say "add the photos I just uploaded to that draft".
- "Write a blog post draft about how to care for opal jewellery." Claude asks for your notes first.
- "What orders came in this week?"

Claude cannot publish, delete, change a live piece, change prices you have not given it, change photo colours or email anyone. You do those in the admin. If the connector says the key is not valid, ask Dylan.
