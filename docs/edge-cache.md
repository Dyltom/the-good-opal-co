# Edge cache

Cloudflare serves anonymous page views of the public shop pages from its edge, so most
traffic never reaches the VPS. Pages still render dynamically on the origin; the edge
keeps each rendered URL for up to 5 minutes, and the app purges it as soon as anything
on those pages changes.

## How it works

- **The origin decides the TTL.** `src/lib/edge-cache.ts` lists the public pages
  (`EDGE_CACHED_PAGES`). `next.config.ts` sends
  `Cache-Control: public, max-age=0, must-revalidate, s-maxage=300` and `Cache-Tag: html`
  on them, but only when the request has no `RSC` header, no `payload-token` cookie and
  no `store_three=1` / `store_details=1` cookie. Every other response keeps Next's
  `private, no-cache, no-store`.
- **The Cloudflare cache rule makes those pages cacheable.** It matches the same pages
  with the same bypasses and respects the origin's headers. A page is only cached when
  both the rule and the origin allow it, so if the two lists drift apart, that page just
  isn't cached.
- **The app purges.** Payload `afterChange`/`afterDelete` hooks on products,
  inventory reservations, media (not new uploads), posts (published ones only), authors,
  categories, tags, courses, reviews, ring designs, ring assets and the `site-content`
  global purge cache tag `html`. That covers stock changes from checkout, the Stripe
  webhook and reservation expiry, since they all save through `payload.update`. Purges
  wait 2s for the transaction to commit and are throttled to one every 15s. They never
  throw and never slow a save; if one fails, it logs `Edge cache purge failed`. Each
  server start also purges, once at startup and again 2 minutes later, so no cached page
  points at the previous build's JS chunks.
- Browsers get `max-age=0, must-revalidate`, so a purge reaches returning visitors on
  their next request.
- RSC navigation and prefetch requests are never cached. Next 16.2 does not check the
  `_rsc` hash against the router headers (`experimental.validateRSCRequestHeaders` is
  off in stable builds), so caching them by URL would let anyone poison them.

## Environment

| Variable                 | Value                                                                |
| ------------------------ | -------------------------------------------------------------------- |
| `CLOUDFLARE_ZONE_ID`     | `eb5201867ab753909c5e28dd034ea67b`                                   |
| `CLOUDFLARE_PURGE_TOKEN` | API token with **Zone > Cache Purge > Purge** on goodopalco.com only |

If either one is unset, purging is off: the app logs this once, and pages refresh when
their 5-minute TTL runs out.

Creating the rule needs a token with **Zone > Cache Rules > Edit** on the zone. Keep it
separate from the app's purge-only token.

## Cloudflare cache rule

The zone has no `http_request_cache_settings` entrypoint yet (checked 2026-11-28), so
the `PUT` below creates it. The `PUT` replaces every rule in that phase, so run the
`GET` first and add any existing rules to the body.

```bash
ZONE=eb5201867ab753909c5e28dd034ea67b
curl -sS -H "Authorization: Bearer $CF_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE/rulesets/phases/http_request_cache_settings/entrypoint"

curl -sS -X PUT -H "Authorization: Bearer $CF_TOKEN" -H 'Content-Type: application/json' \
  "https://api.cloudflare.com/client/v4/zones/$ZONE/rulesets/phases/http_request_cache_settings/entrypoint" \
  --data @- <<'JSON'
{
  "rules": [
    {
      "description": "Edge cache public shop pages (origin sets s-maxage, app purges tag html)",
      "expression": "(http.host eq \"goodopalco.com\" and http.request.method in {\"GET\" \"HEAD\"} and (http.request.uri.path in {\"/\" \"/about\" \"/blog\" \"/contact\" \"/courses\" \"/faq\" \"/gift-vouchers\" \"/gifts\" \"/privacy\" \"/returns\" \"/services\" \"/shipping\" \"/store\" \"/terms\"} or starts_with(http.request.uri.path, \"/blog/\") or starts_with(http.request.uri.path, \"/courses/\") or starts_with(http.request.uri.path, \"/legal/\") or starts_with(http.request.uri.path, \"/services/\") or starts_with(http.request.uri.path, \"/store/\")) and not any(http.request.headers[\"rsc\"][*] eq \"1\") and not (http.cookie contains \"payload-token=\") and not (http.cookie contains \"store_three=1\") and not (http.cookie contains \"store_details=1\"))",
      "action": "set_cache_settings",
      "action_parameters": {
        "cache": true,
        "edge_ttl": {
          "mode": "respect_origin",
          "status_code_ttl": [{ "status_code_range": { "from": 500, "to": 599 }, "value": -1 }]
        },
        "browser_ttl": { "mode": "respect_origin" }
      }
    }
  ]
}
JSON
```

Never cached: `/api`, `/admin`, `/account`, `/cart`, `/checkout`, `/quote`,
`/order-tracking`, `/search`, `/newsletter`, `/visual-tests`, unknown paths, anything
other than GET/HEAD, RSC requests, signed-in admins, and visitors with a saved store view.
5xx responses are never stored. Cached paths keep 404s and redirects for 5 minutes, or
until the next purge. The cache key is the full URL, so each store filter combination
is cached on its own.

## Verify

```bash
curl -sI https://goodopalco.com/store | grep -iE 'cache-control|cf-cache-status'
curl -sI https://goodopalco.com/store | grep -i cf-cache-status
curl -sI -H 'RSC: 1' https://goodopalco.com/store | grep -i cf-cache-status
curl -sI --cookie 'payload-token=x' https://goodopalco.com/store | grep -i cf-cache-status
curl -sI https://goodopalco.com/cart | grep -iE 'cache-control|cf-cache-status'
```

Expect, in order:

1. `public, max-age=0, must-revalidate, s-maxage=300` with `MISS`.
2. `HIT`.
3. `DYNAMIC`.
4. `DYNAMIC`.
5. `private, no-cache, no-store` with `DYNAMIC`.

Then change a product's stock in the admin. Within about 5 seconds, the next anonymous
request to `/store` should show `MISS` again. If it doesn't, look for `Edge cache purge`
in the app logs.

## Roll back

Delete the rule, or empty the phase:

```bash
RULESET=$(curl -sS -H "Authorization: Bearer $CF_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE/rulesets/phases/http_request_cache_settings/entrypoint" \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["id"])')
curl -sS -X DELETE -H "Authorization: Bearer $CF_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE/rulesets/$RULESET/rules/<rule id from the GET>"
```

Without the rule, Cloudflare doesn't cache HTML at all; by default it caches only static
file extensions, whatever headers the app sends. Pages already cached expire within 5
minutes.
