# PUBG Mobile Hub

Next.js site with a server-side site-config loader.

## Run

- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`

## Runtime TypeError Fix

- `__webpack_modules__[moduleId] is not a function` is caused by Next.js development/build output conflicts
- The root cause is not the remote config URL when logs already show `remote payload applied`
- The project now uses the default `.next` output directory
- `pnpm build` now blocks when this project already has a running `next dev` process

Recovery steps:

1. Stop the current `pnpm dev` process
2. Delete legacy `dist` output when it still exists
3. Run `pnpm build` alone, or restart `pnpm dev` alone

## Site Config Source

- Unified entry: `src/lib/site-config.ts`
- Local fallback config: `src/config/site.ts`
- Remote API: `GET {SITE_CONFIG_API_BASE}/site/landing-config?key={SITE_KEY}`

## Next.js Environment Files

- Next.js auto-loads `.env.local`, `.env.development.local`, `.env.production.local`
- `.element.env` is not loaded by `next dev`
- Copy values from `.env.example` into `.env.local` for local development

Recommended local development config:

```env
SITE_CONFIG_API_BASE=http://127.0.0.1:9527
SITE_KEY=pubgm
SITE_CONFIG_USE_REMOTE_IN_DEV=true
SITE_CONFIG_DISABLE_LOCAL_FALLBACK=true
SITE_CONFIG_DEBUG=true
```

## Environment Behavior

- Production (`NODE_ENV=production`)
  - Uses remote config when `SITE_CONFIG_API_BASE` is set
  - Falls back to local `src/config/site.ts` when remote request fails
- Development (`NODE_ENV!=production`)
  - Uses local config by default
  - Uses remote config only when `SITE_CONFIG_USE_REMOTE_IN_DEV=true`
  - Recommended debug mode sets `SITE_CONFIG_DISABLE_LOCAL_FALLBACK=true` so remote failures surface immediately

## Debugging Signals

When `SITE_CONFIG_DEBUG=true`, the server logs:

- whether remote config is enabled
- the request URL being used
- whether local fallback is enabled or disabled
- whether remote payload was applied or local fallback was used

## SEO and Analytics Injection

- `analytics.customHeadHtml` is injected in both development and production
- Local `http://localhost:3000/` can be compared directly with production for verification tags and analytics scripts
- The same custom head HTML powers Baidu, Google, 360, Sogou verification and Baidu Analytics when present in site config

## Build Safety

- Do not run `pnpm dev` and `pnpm build` at the same time for the same project
- `pnpm build` performs a preflight process check and fails fast when a local dev server is already running
- Legacy `dist` output is historical only, `.next` is now the active Next.js build directory

## Remote Config API Contract

Accepted response formats:

```json
{
  "code": 0,
  "data": {
    "name": "PUBG Mobile",
    "seo": {
      "title": "...",
      "description": "...",
      "keywords": ["..."]
    },
    "hero": {
      "title": "...",
      "description": "...",
      "backgroundImage": "..."
    },
    "sections": []
  }
}
```

```json
{
  "name": "PUBG Mobile",
  "seo": {
    "title": "...",
    "description": "...",
    "keywords": ["..."]
  },
  "hero": {
    "title": "...",
    "description": "...",
    "backgroundImage": "..."
  },
  "sections": []
}
```

Envelope responses require `code=0`.

## Hydration Note

Custom head HTML is injected through the root layout so development and production expose the same SEO verification and analytics markers.
