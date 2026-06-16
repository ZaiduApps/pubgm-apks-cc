# Game Topic Hub

Next.js 通用游戏专题页。一个部署实例可以承载多个域名，并按访问域名解析专题 key，再通过远程接口渲染不同专题内容。

## Run

- Install: `pnpm install`
- Dev: `pnpm dev`
- Typecheck: `pnpm typecheck`
- Build: `pnpm build`
- Start: `pnpm start`

## Multi-Domain Rendering

核心流程：

1. 用户访问 `a.apks.cc` 或 `b.apks.cc`
2. 服务端读取 `Host` / `x-forwarded-host`
3. `SITE_DOMAIN_KEY_MAP` 把域名解析为专题 key
4. 服务端请求 `GET {SITE_CONFIG_API_BASE}/site/landing-config?key={key}`
5. 首页、文章页、metadata、robots、sitemap 使用当前域名和当前专题配置渲染

示例：

```env
SITE_CONFIG_API_BASE=http://127.0.0.1:9527
SITE_DOMAIN_KEY_MAP=pokemonchampions.apks.cc:pokemonchampions,browndust2.apks.cc:browndust2,limbuscompany.apks.cc:limbuscompany
NEXT_PUBLIC_MAIN_SITE_URL=https://apks.cc
MAIN_SITE_URL=https://apks.cc
SITE_CONFIG_DISABLE_LOCAL_FALLBACK=true
SITE_CONFIG_DEBUG=true
```

`SITE_KEY` 仍可作为本地开发或单站点兜底 key 使用。

## Unknown Domains

当配置了 `SITE_DOMAIN_KEY_MAP` 且访问域名未命中映射时，middleware 会跳转到 `MAIN_SITE_URL`。这可以避免未配置域名生成重复 SEO 页面。

## SEO

- 页面使用动态 SSR，HTML 首屏直接包含当前专题内容。
- `metadataBase`、canonical、OpenGraph URL、`robots.txt`、`sitemap.xml` 基于当前请求域名生成。
- `analytics.customHeadHtml` 支持按专题注入站长验证和统计代码。

## Remote Config API Contract

推荐接口：

```http
GET /site/landing-config?key=game_a
```

支持 envelope：

```json
{
  "code": 0,
  "data": {
    "name": "Game A",
    "seo": {
      "title": "Game A 官网专题",
      "description": "Game A 下载、更新与攻略。",
      "keywords": ["Game A", "游戏下载"]
    },
    "hero": {
      "title": "Game A 最新版本",
      "description": "聚合下载入口、版本更新和攻略内容。",
      "backgroundImage": "https://cdn.example.com/game-a.jpg"
    },
    "sections": []
  }
}
```

也支持直接返回配置对象。Envelope 响应要求 `code=0`。

## Build Safety

- `pnpm build` 会先检查当前项目是否有运行中的 `next dev` 进程。
- 不要在同一个项目目录同时运行 `pnpm dev` 和 `pnpm build`。
- 构建期已启用 TypeScript 和 lint 校验。
