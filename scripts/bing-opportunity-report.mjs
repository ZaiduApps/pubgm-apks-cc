import { writeFile } from 'node:fs/promises';

const sites = [
  { key: 'pubgm', host: 'pubgm.apks.cc' },
  { key: 'pokemonchampions', host: 'pokemonchampions.apks.cc' },
  { key: 'browndust2', host: 'browndust2.apks.cc' },
  { key: 'limbuscompany', host: 'limbuscompany.apks.cc' },
];

const apiKey = String(process.env.BING_WEBMASTER_API_KEY || '').trim();
const siteUrl = String(process.env.BING_WEBMASTER_SITE_URL || 'https://apks.cc/').trim();
const outputPath = String(process.env.BING_OPPORTUNITY_OUTPUT || '').trim();
const windowDays = Math.max(1, Number(process.env.BING_OPPORTUNITY_WINDOW_DAYS || 28));
const concurrency = Math.max(1, Math.min(8, Number(process.env.BING_OPPORTUNITY_CONCURRENCY || 4)));
const timeoutMs = Math.max(1_000, Number(process.env.BING_WEBMASTER_TIMEOUT_MS || 30_000));

if (!apiKey) {
  throw new Error('BING_WEBMASTER_API_KEY is required');
}

function parseBingDate(value) {
  const match = String(value || '').match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
  if (match) return new Date(Number(match[1]));
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    url.search = '';
    url.pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch {
    return String(value || '').trim();
  }
}

function classifyQuery(query) {
  const value = String(query || '').toLowerCase();
  if (/登录|login|error|报错|闪退|进不去|无法进入/.test(value)) return 'login-troubleshooting';
  if (/地铁逃生|metro royale/.test(value)) return 'metro-royale';
  if (/下载|apk|安装|download/.test(value)) return 'download-install';
  if (/官网|官方网站|入口|official/.test(value)) return 'official-navigation';
  if (/\b(?:v)?\d+(?:\.\d+)+\b|版本|更新/.test(value)) return 'version-update';
  return 'other';
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'apks-seo-ops/1.0' },
      signal: controller.signal,
    });
    const body = await response.text();
    if (!response.ok) throw new Error(`${url} returned ${response.status}: ${body.slice(0, 160)}`);
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function bingRequest(method, params = {}) {
  const url = new URL(`https://ssl.bing.com/webmaster/api.svc/json/${method}`);
  url.searchParams.set('apikey', apiKey);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return JSON.parse(await fetchText(url.toString()))?.d ?? [];
}

function sitemapUrls(xml, host) {
  return Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi), (match) => normalizeUrl(match[1].trim()))
    .filter((url) => {
      try {
        return new URL(url).hostname === host;
      } catch {
        return false;
      }
    });
}

function latestDate(rows) {
  return rows.reduce((latest, row) => {
    const date = parseBingDate(row.Date);
    return date && (!latest || date > latest) ? date : latest;
  }, null);
}

function aggregate(rows, startDate, endDate, valueField = 'Query') {
  const groups = new Map();
  for (const row of rows) {
    const date = parseBingDate(row.Date);
    if (!date || date < startDate || date > endDate) continue;
    const value = String(row[valueField] || '').trim();
    if (!value) continue;
    const current = groups.get(value) || {
      value,
      clicks: 0,
      impressions: 0,
      weightedClickPosition: 0,
      weightedImpressionPosition: 0,
    };
    const clicks = Number(row.Clicks || 0);
    const impressions = Number(row.Impressions || 0);
    current.clicks += clicks;
    current.impressions += impressions;
    if (Number(row.AvgClickPosition) >= 0) current.weightedClickPosition += Number(row.AvgClickPosition) * clicks;
    if (Number(row.AvgImpressionPosition) >= 0) {
      current.weightedImpressionPosition += Number(row.AvgImpressionPosition) * impressions;
    }
    groups.set(value, current);
  }

  return [...groups.values()]
    .map((item) => ({
      [valueField === 'Query' ? 'query' : 'value']: item.value,
      clicks: item.clicks,
      impressions: item.impressions,
      ctr: item.impressions ? Number((item.clicks / item.impressions).toFixed(4)) : null,
      avgClickPosition: item.clicks ? Number((item.weightedClickPosition / item.clicks).toFixed(2)) : null,
      avgImpressionPosition: item.impressions
        ? Number((item.weightedImpressionPosition / item.impressions).toFixed(2))
        : null,
    }))
    .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks);
}

async function mapLimit(values, limit, worker) {
  const output = new Array(values.length);
  let cursor = 0;
  async function run() {
    while (cursor < values.length) {
      const index = cursor++;
      output[index] = await worker(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, run));
  return output;
}

const inventories = await Promise.all(
  sites.map(async (site) => ({
    ...site,
    urls: [...new Set(sitemapUrls(await fetchText(`https://${site.host}/sitemap.xml`), site.host))],
  })),
);
const currentUrls = new Set(inventories.flatMap((site) => site.urls));
const [pageStats, queryStats] = await Promise.all([
  bingRequest('GetPageStats', { siteUrl }),
  bingRequest('GetQueryStats', { siteUrl }),
]);
const providerLatest = latestDate([...pageStats, ...queryStats]);
if (!providerLatest) throw new Error('Bing returned no dated page or query rows');
const windowEnd = new Date(providerLatest);
windowEnd.setUTCHours(23, 59, 59, 999);
const windowStart = new Date(windowEnd);
windowStart.setUTCDate(windowStart.getUTCDate() - windowDays + 1);
windowStart.setUTCHours(0, 0, 0, 0);

const pageRows = await mapLimit([...currentUrls], concurrency, async (page) => {
  try {
    const rows = await bingRequest('GetPageQueryStats', { siteUrl, page });
    const queryAggregates = aggregate(rows, windowStart, windowEnd);
    const topQueries = queryAggregates.slice(0, 20);
    return {
      page,
      status: 'ok',
      rowCount: rows.length,
      clicks: queryAggregates.reduce((sum, item) => sum + item.clicks, 0),
      impressions: queryAggregates.reduce((sum, item) => sum + item.impressions, 0),
      topQueries: topQueries.map((item) => ({ ...item, cluster: classifyQuery(item.query) })),
    };
  } catch (error) {
    return { page, status: 'error', error: error instanceof Error ? error.message : String(error) };
  }
});

const pageAggregates = aggregate(pageStats, windowStart, windowEnd).map((item) => ({
  ...item,
  page: normalizeUrl(item.query),
  query: undefined,
}));
const currentPageStats = pageAggregates
  .filter((item) => currentUrls.has(item.page))
  .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks);
const historicalPageStats = pageAggregates
  .filter((item) => !currentUrls.has(item.page))
  .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks)
  .slice(0, 50);
const queryAggregates = aggregate(queryStats, windowStart, windowEnd).slice(0, 200);
const clusterSummary = Object.values(
  queryAggregates.reduce((result, item) => {
    const cluster = classifyQuery(item.query);
    result[cluster] ||= { cluster, clicks: 0, impressions: 0, queries: 0 };
    result[cluster].clicks += item.clicks;
    result[cluster].impressions += item.impressions;
    result[cluster].queries += 1;
    return result;
  }, {}),
).sort((a, b) => b.impressions - a.impressions);

const report = {
  generatedAt: new Date().toISOString(),
  provider: 'Bing Webmaster API',
  property: siteUrl,
  window: {
    providerLatestDate: providerLatest.toISOString(),
    start: windowStart.toISOString(),
    end: windowEnd.toISOString(),
    days: windowDays,
  },
  coverage: {
    sitemapSites: inventories.map((site) => ({ key: site.key, host: site.host, urls: site.urls.length })),
    currentUrls: currentUrls.size,
    pageStatsRows: pageStats.length,
    queryStatsRows: queryStats.length,
    pageQueryRequested: pageRows.length,
    pageQuerySucceeded: pageRows.filter((item) => item.status === 'ok').length,
    pageQueryFailed: pageRows.filter((item) => item.status === 'error').length,
  },
  clusterSummary,
  topQueries: queryAggregates.slice(0, 50).map((item) => ({ ...item, cluster: classifyQuery(item.query) })),
  currentPageStats,
  currentPageQueries: pageRows.sort((a, b) => (b.impressions || 0) - (a.impressions || 0)),
  historicalUrlsNotInCurrentSitemaps: historicalPageStats,
  interpretation: [
    'Bing API rows are provider reports and do not prove indexing for every URL.',
    'The rolling window ends on Bing latest returned date, not the local run date.',
    'Historical URLs are reported separately and are not automatically redirect candidates.',
    'IndexNow submission and content publication are outside this read-only report.',
  ],
};

if (outputPath) await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
