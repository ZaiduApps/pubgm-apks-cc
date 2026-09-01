import { writeFile } from 'node:fs/promises';

const site = String(process.env.BAIDU_PUBGM_SITE || 'https://pubgm.apks.cc').trim().replace(/\/+$/, '');
const token = String(process.env.BAIDU_PUBGM_TOKEN || '').trim();
const apiBase = String(process.env.BAIDU_API_URL || 'https://data.zz.baidu.com/urls').trim();
const submit = String(process.env.BAIDU_SUBMIT || '').toLowerCase() === 'true';
const homeOnly = String(process.env.BAIDU_HOME_ONLY || '').toLowerCase() === 'true';
const outputPath = String(process.env.BAIDU_OUTPUT || '').trim();
const timeoutMs = Math.max(5_000, Number(process.env.BAIDU_TIMEOUT_MS || 30_000));

if (!/^https:\/\/pubgm\.apks\.cc$/i.test(site)) {
  throw new Error('BAIDU_PUBGM_SITE must be https://pubgm.apks.cc');
}
if (!token && submit) throw new Error('BAIDU_PUBGM_TOKEN is required for submission');

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      headers: { 'user-agent': 'apks-seo-ops/1.0', ...(options.headers || {}) },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = '';
  url.search = '';
  url.pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
  return url.toString();
}

function parseSitemap(xml) {
  return [...xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]*)<\/lastmod>[\s\S]*?<\/url>/gi)]
    .map((match) => ({ url: normalizeUrl(match[1].trim()), lastmod: new Date(match[2].trim()) }))
    .filter((item) => item.url.startsWith(`${site}/`) && !Number.isNaN(item.lastmod.getTime()));
}

const sitemapResponse = await request(`${site}/sitemap.xml`);
if (!sitemapResponse.ok) throw new Error(`sitemap returned HTTP ${sitemapResponse.status}`);
const entries = parseSitemap(await sitemapResponse.text());
const home = `${site}/`;
const articles = entries
  .filter((item) => new URL(item.url).pathname.startsWith('/articles/'))
  .sort((a, b) => b.lastmod - a.lastmod)
  .slice(0, 5)
  .map((item) => item.url);
const urls = [...new Set(homeOnly ? [home] : [home, ...articles])];
if (urls.length === 0 || urls.some((url) => !url.startsWith(`${site}/`))) {
  throw new Error('selected URL list is empty or contains a non-site URL');
}

const result = {
  generatedAt: new Date().toISOString(),
  site,
  mode: submit ? 'submit' : 'dry-run',
  homeOnly,
  urlCount: urls.length,
  urls,
  sitemap: { status: sitemapResponse.status, articleCandidates: articles.length },
};

if (submit) {
  const endpoint = new URL(apiBase);
  endpoint.searchParams.set('site', site);
  endpoint.searchParams.set('token', token);
  const response = await request(endpoint.toString(), {
    method: 'POST',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body: `${urls.join('\n')}\n`,
  });
  const body = await response.text();
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(`Baidu response was not JSON (HTTP ${response.status})`);
  }
  result.baidu = {
    status: response.status,
    message: typeof payload.message === 'string' ? payload.message.slice(0, 200) : null,
    success: Number(payload.success || 0),
    remain: Number.isFinite(Number(payload.remain)) ? Number(payload.remain) : null,
    notSameSiteCount: Array.isArray(payload.not_same_site) ? payload.not_same_site.length : 0,
    notValidCount: Array.isArray(payload.not_valid) ? payload.not_valid.length : 0,
  };
  if (outputPath) await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  if (!response.ok || result.baidu.notSameSiteCount > 0 || result.baidu.notValidCount > 0) {
    throw new Error(`Baidu push failed validation: HTTP ${response.status}`);
  }
}

if (outputPath) await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result, null, 2));
