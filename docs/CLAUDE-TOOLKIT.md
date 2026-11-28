# Claude toolkit for Steph

Lets Steph run everyday shop jobs from the Claude app (claude.ai or Claude Desktop): drafting listings from her photos and notes, framing photos, drafting blog posts and checking recent orders. Claude only ever creates and edits **drafts**; Steph publishes in the admin.

Two parts:

- **The Good Opal shop connector**: an MCP endpoint at `https://goodopalco.com/api/mcp` (`src/app/api/mcp/route.ts`), with an OAuth sign-in under `src/app/api/oauth/` and `src/app/.well-known/`.
- **Four skills** in `toolkit/skills/`: `good-opal-listing`, `good-opal-photos`, `good-opal-blog` and `good-opal-site-guide`.

## Design

### How Claude reaches the shop

A claude.ai **custom connector** pointing at `https://goodopalco.com/api/mcp`. When Steph clicks **Connect**, Claude opens the shop's sign-in page, she signs in with her normal shop login (or is already signed in to the admin) and clicks **Allow Claude**. Custom connectors work on Free, Pro, Max, Team and Enterprise plans, in claude.ai and Claude Desktop, and sync between them. Claude calls the connector from Anthropic's cloud, so the endpoint has to be public, which goodopalco.com already is.

The first version put a Payload API key at the end of the URL. Every attempt Steph made failed: the admin shows a freshly generated key before it is saved, the setup notes mentioned a copy button that does not exist, and a mistyped key fell through to claude.ai's OAuth discovery, which then 404ed ("Couldn't reach Good Opal shop"). The sign-in removes the key from her setup entirely.

A `.mcpb` desktop extension was rejected: it needs Claude Desktop, a local process on Steph's computer and a reinstall for every change. The connector is one URL, and it updates when the site deploys.

### Hand-written route, not `@payloadcms/plugin-mcp`

|              | (a) `@payloadcms/plugin-mcp`                                                                                                                             | (b) hand-written route (chosen)                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Upgrade      | 3.86.0 matches the current Payload, so no upgrade is needed. 3.94.1 pins payload 3.94.1 exactly, forcing every `@payloadcms/*` package to move together. | None. Adds `@modelcontextprotocol/sdk` only.                                                              |
| Schema       | Adds a `payload-mcp-api-keys` collection with per-collection permission columns: a large migration.                                                      | Turns on Payload's built-in API keys for Users: 3 nullable columns.                                       |
| Tools        | Generated CRUD for every enabled collection, including delete and publish unless each is switched off. Orders would expose email, phone and address.     | 8 tools written for Steph's jobs. No delete, no publish, orders reduced to name, items, status and total. |
| Dependencies | Brings zod 3 and `mcp-handler` beside the repo's zod 4.                                                                                                  | One SDK package.                                                                                          |

The upgrade to 3.94.1 was tried in a throwaway worktree: install worked, the lockfile changed by +1181/-329 lines, `tsc`, all unit tests (1128 passed, 2 skipped) and `next build` passed. Database drift, the admin at runtime and the e2e suite were not checked, so the upgrade is possible but is its own piece of work, not part of this one.

### Auth

OAuth 2.1 as claude.ai expects it, kept stateless so there is no table or migration:

- `POST /api/mcp` without a token answers 401 with `WWW-Authenticate: Bearer resource_metadata=".../.well-known/oauth-protected-resource/api/mcp"`.
- `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` describe the endpoints. Claude registers itself at `/api/oauth/register` (dynamic client registration). Only Claude's callbacks (`https://claude.ai/api/mcp/auth_callback`, `https://claude.com/api/mcp/auth_callback`) and loopback callbacks (Claude Code) are accepted.
- `/api/oauth/authorize` shows the consent page and requires PKCE (S256). It takes the admin session cookie or the email and password of a shop login, and only an Admin can allow access.
- `/api/oauth/token` swaps the code for an access token (30 days) and a refresh token (1 year). Claude refreshes on its own.
- Client ids, codes and tokens are HMAC-signed with a key derived from `PAYLOAD_SECRET` (`src/lib/mcp-oauth.ts`). Each token carries a fingerprint of the user's password salt, so **changing that user's password disconnects Claude**, and every request re-checks that the user is still an Admin.

Header-capable clients such as Claude Code can also send a Payload API key as `Authorization: Bearer <key>` (Users > Enable API Key). Such a key is also accepted by Payload's REST API, where an Admin can do anything, so it is as powerful as an admin password. Steph does not need one.

Every tool runs through the Payload local API as the signed-in user with `overrideAccess: false`, so the collections' own access rules still apply. The Activity log records connector changes as "Claude connector".

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

1. Merge and deploy. No migration.
2. Build the skill zips: `toolkit/package-skills.sh ~/Downloads/good-opal-skills`. It writes one zip per skill and bundles `docs/OWNER-GUIDE.md` into the site guide.

## Dylan: disconnect Claude

- Steph removes the connector in Claude (**Customize > Connectors**), or
- change the password of the shop login she connected with: every token it issued stops working on the next request.
- The site logs every tool call with the tool name, so `docker logs` on the app container shows what Claude did and when.

## Steph: set up Claude

You need a Claude account (any plan), your shop login and about 10 minutes.

### 1. Add the shop connector

1. Open claude.ai (or the Claude Desktop app) and sign in.
2. Open **Customize**, then **Connectors**.
3. Click **+ Add**, then **Add custom connector**.
4. Fill in:
   - Name: `Good Opal shop`
   - URL: `https://goodopalco.com/api/mcp`
   - Leave everything under **Advanced settings** empty.
5. Click **Add**, then **Connect**.
6. A Good Opal Co page opens. Sign in with the email and password you use for the shop admin and click **Sign in and allow Claude** (or **Allow Claude** if you are already signed in). It takes you back to Claude, and the connector shows its tools.

If you added the connector before with a different URL, remove that one first (**⋯ > Remove**).

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

Claude cannot publish, delete, change a live piece, change prices you have not given it, change photo colours or email anyone. You do those in the admin. If the connector stops working, open **Customize > Connectors**, click **Good Opal shop** and click **Connect** again.
