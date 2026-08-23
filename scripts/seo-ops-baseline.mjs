import { writeFile } from 'node:fs/promises';

const sites = [
  { key: 'pubgm', host: 'pubgm.apks.cc' },
  { key: 'pokemonchampions', host: 'pokemonchampions.apks.cc' },
  { key: 'browndust2', host: 'browndust2.apks.cc' },
  { key: 'limbuscompany', host: 'limbuscompany.apks.cc' },
];

const userAgent =
  process.env.SEO_AUDIT_USER_AGENT ||
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)';
const timeoutMs = Number(process.env.SEO_OPS_TIMEOUT_MS || 30_000);
const configApiBase = String(process.env.SEO_CONFIG_API_BASE || process.env.SITE_CONFIG_API_BASE || '')
  .trim()
  .replace(/\/$/, '');
const bingApiKey = String(process.env.BING_WEBMASTER_API_KEY || '').trim();
const bingSiteUrl = String(process.env.BING_WEBMASTER_SITE_URL || 'https://apks.cc/').trim();
const outputPath = String(process.env.SEO_BASELINE_OUTPUT || '').trim();

async function fetchText(url, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': userAgent, ...headers },
      signal: controller.signal,
    });
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  } finally {
    clearTimeout(timer);
  }
}

function attr(tag, name) {
  return tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'))?.[1] || '';
}

function textContent(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function metadata(html) {
  const headEnd = html.toLowerCase().indexOf('</head>');
  const titleTag = html.match(/<title\b[^>]*>[\s\S]*?<\/title>/i)?.[0] || '';
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  const descriptionTag = metaTags.find((tag) => attr(tag, 'name').toLowerCase() === 'description') || '';
  const canonicalTag = (html.match(/<link\b[^>]*>/gi) || []).find(
    (tag) => attr(tag, 'rel').toLowerCase() === 'canonical',
  ) || '';
  const index = (pattern) => html.search(pattern);

  return {
    title: textContent(titleTag.replace(/^<title[^>]*>|<\/title>$/gi, '')),
    description: attr(descriptionTag, 'content'),
    canonical: attr(canonicalTag, 'href'),
    metadataPlacement: {
      titleInHead: headEnd >= 0 && index(/<title\b/i) < headEnd,
      descriptionInHead: headEnd >= 0 && index(/<meta\b[^>]*name=["']description["']/i) < headEnd,
      canonicalInHead: headEnd >= 0 && index(/<link\b[^>]*rel=["']canonical["']/i) < headEnd,
    },
    h1: Array.from(html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi), (match) => textContent(match[1])),
    jsonLdTypes: Array.from(
      html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
      (match) => {
        try {
          const value = JSON.parse(match[1]);
          const values = Array.isArray(value) ? value : value?.['@graph'] || [value];
          return values.map((item) => item?.['@type']).filter(Boolean);
        } catch {
          return ['parse-error'];
        }
      },
    ).flat(),
    bodyChars: textContent(html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '').length,
    links: (html.match(/<a\b[^>]*href=["'][^"']+["']/gi) || []).length,
    images: (html.match(/<img\b[^>]*>/gi) || []).length,
    missingAlt: (html.match(/<img\b(?![^>]*\balt=["'][^"']*["'])[^>]*>/gi) || []).length,
  };
}

function sitemapStats(xml) {
  return {
    locCount: (xml.match(/<loc>/gi) || []).length,
    invalidLocCount: Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)).filter((match) => {
      try {
        return new URL(match[1].trim()).protocol !== 'https:';
      } catch {
        return true;
      }
    }).length,
    latestLastmod: Array.from(xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/gi), (match) => match[1]).sort().at(-1) || null,
  };
}

async function inspectSite(site) {
  const origin = `https://${site.host}`;
  const [home, robots, sitemap, keyFile] = await Promise.all(
    ['/', '/robots.txt', '/sitemap.xml', `/${process.env.INDEXNOW_KEY || '71480f851f5a462899e861af2d387343'}.txt`].map(
      (path) => fetchText(`${origin}${path}`).catch((error) => ({ error: error.message })),
    ),
  );
  const config = configApiBase
    ? await fetchText(`${configApiBase}/site/landing-config?key=${encodeURIComponent(site.key)}`).catch((error) => ({ error: error.message }))
    : null;
  let configSummary = null;
  if (config?.body) {
    try {
      const data = JSON.parse(config.body)?.data || {};
      const source = data.data_source || {};
      const topic = source.topic_id ? await fetchText(`${configApiBase}/content/topics/public/${encodeURIComponent(source.topic_id)}`).catch(() => null) : null;
      const topicData = topic?.body ? JSON.parse(topic.body)?.data || {} : {};
      configSummary = {
        name: data.name || null,
        seo: data.seo || null,
        dataSource: {
          mode: source.mode || null,
          appId: source.app_id || null,
          packageName: source.pkg || null,
          topicId: source.topic_id || null,
          articleLimit: source.article_limit ?? null,
          postLimit: source.post_limit ?? null,
          updateLimit: source.update_limit ?? null,
        },
        topic: source.topic_id
          ? {
              name: topicData.name || null,
              slug: topicData.slug || null,
              postCount: topicData.post_count ?? null,
              followersCount: topicData.followers_count ?? null,
              heatScore: topicData.heat_score ?? null,
              lastPostAt: topicData.last_post_at || null,
            }
          : null,
      };
    } catch {
      configSummary = { error: 'invalid config API response' };
    }
  }

  return {
    key: site.key,
    host: site.host,
    home: home.error ? { error: home.error } : { status: home.status, responseHeaders: { 'cache-control': home.headers?.['cache-control'], vary: home.headers?.vary }, ...metadata(home.body) },
    robots: robots.error ? { error: robots.error } : { status: robots.status, hasSitemap: /sitemap:/i.test(robots.body) },
    sitemap: sitemap.error ? { error: sitemap.error } : { status: sitemap.status, ...sitemapStats(sitemap.body) },
    indexNowKey: keyFile.error ? { error: keyFile.error } : { status: keyFile.status, value: keyFile.body.trim(), matchesExpected: keyFile.body.trim() === (process.env.INDEXNOW_KEY || '71480f851f5a462899e861af2d387343') },
    config: configSummary,
  };
}

async function bingRequest(method, params = {}) {
  const url = new URL(`https://ssl.bing.com/webmaster/api.svc/json/${method}`);
  url.searchParams.set('apikey', bingApiKey);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetchText(url.toString(), { accept: 'application/json' });
  if (response.status < 200 || response.status >= 300) throw new Error(`Bing ${method} returned ${response.status}`);
  return JSON.parse(response.body)?.d ?? null;
}

async function inspectBing() {
  if (!bingApiKey) return { enabled: false, reason: 'BING_WEBMASTER_API_KEY is not set' };
  try {
    const [sitesResult, rankResult, queryResult, quotaResult] = await Promise.all([
      bingRequest('GetUserSites'),
      bingRequest('GetRankAndTrafficStats', { siteUrl: bingSiteUrl }),
      bingRequest('GetQueryStats', { siteUrl: bingSiteUrl }),
      bingRequest('GetUrlSubmissionQuota', { siteUrl: bingSiteUrl }),
    ]);
    return {
      enabled: true,
      siteUrl: bingSiteUrl,
      verifiedSites: (Array.isArray(sitesResult) ? sitesResult : []).map((item) => ({ url: item.Url, verified: item.IsVerified })),
      quota: quotaResult ? { daily: quotaResult.DailyQuota, monthly: quotaResult.MonthlyQuota, used: quotaResult.MonthlyQuotaUsed } : null,
      rankAndTraffic: Array.isArray(rankResult) ? rankResult : [],
      queryStats: Array.isArray(queryResult) ? queryResult : [],
      note: 'Bing API data is returned with provider-specific reporting dates; filter and compare client-side after recording the run timestamp.',
    };
  } catch (error) {
    return { enabled: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  userAgent,
  sites: await Promise.all(sites.map(inspectSite)),
  bing: await inspectBing(),
};

if (outputPath) await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
