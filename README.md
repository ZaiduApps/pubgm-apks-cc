# PUBG Mobile Hub

Next.js static-style site with server-side configurable landing content.

## Run

- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`

## Site Config Environment Variables

- `SITE_CONFIG_API_BASE`: Remote config API base URL, for example `https://api.example.com`.
- `SITE_KEY`: Site key for config lookup. Default is `pubgm`.
- `SITE_CONFIG_USE_REMOTE_IN_DEV`: Whether to use remote config in development. Default is `false`.

### Environment Behavior

- Production (`NODE_ENV=production`):
  - Uses remote config when `SITE_CONFIG_API_BASE` is set.
  - Falls back to local `src/config/site.ts` when remote request fails.
- Development (`NODE_ENV!=production`):
  - Uses local config by default.
  - Uses remote config only when `SITE_CONFIG_USE_REMOTE_IN_DEV=true`.

## Remote Config API Contract

Request path:

- `GET {SITE_CONFIG_API_BASE}/site/landing-config?key={SITE_KEY}`

Accepted response formats:

- Envelope:

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

- Direct config object:

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

If envelope format is used, `code` must be `0`.

## Hydration Note

To avoid hydration mismatch in development, custom head HTML injection from remote config is only enabled in production.
