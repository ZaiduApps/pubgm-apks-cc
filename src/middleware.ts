import { NextRequest, NextResponse } from 'next/server';

import { getMainSiteUrl, normalizeRequestHost, resolveSiteIdentity } from '@/lib/site-runtime';

const PUBLIC_FILE = /\.(.*)$/;
const ARTICLE_PATH = /^\/articles\/([^/]+)$/;

// 文章 slug 存在性缓存（TTL 60s），避免每个请求都打配置 API
const slugCache = new Map<string, { expiresAt: number; slugs: Set<string> }>();
const CACHE_TTL_MS = 60_000;

async function getArticleSlugs(siteKey: string): Promise<Set<string>> {
  const now = Date.now();
  const cached = slugCache.get(siteKey);
  if (cached && cached.expiresAt > now) {
    return cached.slugs;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3_000);
    const res = await fetch(
      `http://127.0.0.1:9527/site/landing-config?key=${encodeURIComponent(siteKey)}`,
      { signal: controller.signal, cache: 'no-store' },
    );
    clearTimeout(timer);

    if (!res.ok) {
      return new Set();
    }

    const payload = (await res.json()) as {
      data?: { sections?: Array<{ items?: Array<{ slug?: string }> }> };
    };
    const slugs = new Set<string>();
    for (const section of payload.data?.sections ?? []) {
      for (const item of section.items ?? []) {
        if (item.slug) {
          slugs.add(item.slug);
        }
      }
    }

    slugCache.set(siteKey, { expiresAt: now + CACHE_TTL_MS, slugs });
    return slugs;
  } catch {
    // 配置 API 不可达时不阻塞正常流量，交给页面自身处理
    return new Set();
  }
}


// 品牌化 404 页面（middleware 运行在 edge，不能引用 React 组件，返回内联 HTML）
const SITE_NAMES: Record<string, string> = {
  pubgm: "PUBG MOBILE",
  pokemonchampions: "Pokemon Champions",
  browndust2: "棕色尘埃2",
  limbuscompany: "边狱公司",
  default: "APKS",
};

function renderNotFoundHtml(identity: { host: string; key: string }): NextResponse {
  const siteName = SITE_NAMES[identity.key] || SITE_NAMES.default;
  const homeUrl = `https://${identity.host || "pubgm.apks.cc"}`;
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>页面未找到 - ${siteName}</title>
<meta name="robots" content="noindex" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif; background: #0b0f14; color: #e5e7eb; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .container { text-align: center; padding: 2rem; max-width: 560px; }
  .code { font-size: 5rem; font-weight: 800; color: #f59e0b; line-height: 1; }
  h1 { font-size: 1.5rem; margin: 1rem 0 0.5rem; }
  p { color: #9ca3af; margin-bottom: 2rem; }
  a.button { display: inline-block; background: #f59e0b; color: #0b0f14; text-decoration: none; font-weight: 600; padding: 0.75rem 2rem; border-radius: 0.5rem; }
  a.button:hover { background: #fbbf24; }
</style>
</head>
<body>
  <div class="container">
    <div class="code">404</div>
    <h1>页面未找到</h1>
    <p>你访问的内容不存在或已被移除，请返回首页继续浏览。</p>
    <a class="button" href="${homeUrl}">返回首页</a>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const host = normalizeRequestHost(
    request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
  );
  const identity = resolveSiteIdentity(host);

  if (!identity) {
    const redirectUrl = new URL(request.url);
    const mainSiteUrl = getMainSiteUrl();
    const target = new URL(mainSiteUrl);
    target.pathname = pathname;
    target.search = redirectUrl.search;

    return NextResponse.redirect(target, 302);
  }

  // 文章页：slug 不存在时返回真 404（Next.js streamed 响应下 notFound() 状态码是 200）
  const articleMatch = pathname.match(ARTICLE_PATH);
  if (articleMatch) {
    const slug = articleMatch[1];
    const slugs = await getArticleSlugs(identity.key);
    if (slugs.size > 0 && !slugs.has(slug)) {
      return renderNotFoundHtml(identity);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
