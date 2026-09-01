import { inspectCandidateUrl, inspectFetchedPage } from './indexnow-policy.mjs';

const defaultSites = [
  'pubgm.apks.cc',
  'pokemonchampions.apks.cc',
  'browndust2.apks.cc',
  'limbuscompany.apks.cc',
];

const args = new Set(process.argv.slice(2));
const shouldSubmit = args.has('--submit') || process.env.INDEXNOW_SUBMIT === 'true';
const key = String(process.env.INDEXNOW_KEY || '').trim();
const sites = String(process.env.INDEXNOW_SITES || defaultSites.join(','))
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);
const explicitUrls = String(process.env.INDEXNOW_URLS || '')
  .split(/[\r\n,]+/)
  .map((item) => item.trim())
  .filter(Boolean);
const userAgent = 'apks-seo-ops/1.0';
const timeoutMs = Math.max(1_000, Number(process.env.INDEXNOW_TIMEOUT_MS || 30_000));
const validationConcurrency = Math.max(1, Math.min(8, Number(process.env.INDEXNOW_VALIDATION_CONCURRENCY || 4)));

if (!key) {
  throw new Error('INDEXNOW_KEY is required');
}

async function read(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      headers: { 'user-agent': userAgent, ...(options.headers || {}) },
      signal: controller.signal,
    });
    const body = await response.text();
    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}: ${body.slice(0, 200)}`);
    }
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

function sitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gi), (match) => match[1].trim())
    .filter((url) => /^https:\/\//i.test(url));
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;
        results[index] = await worker(items[index]);
      }
    }),
  );
  return results;
}

async function validateCandidate(value, site) {
  const preliminary = inspectCandidateUrl(value, site);
  if (!preliminary.eligible) return { url: value, eligible: false, reason: preliminary.reason };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(preliminary.url, {
      headers: { accept: 'text/html', 'user-agent': userAgent },
      redirect: 'follow',
      signal: controller.signal,
    });
    const body = await response.text();
    const inspected = inspectFetchedPage(preliminary.url, {
      status: response.status,
      contentType: response.headers.get('content-type'),
      finalUrl: response.url,
      xRobotsTag: response.headers.get('x-robots-tag'),
      body,
    });
    return { url: preliminary.url, ...inspected };
  } catch (error) {
    return {
      url: preliminary.url,
      eligible: false,
      reason: error?.name === 'AbortError' ? 'validation-timeout' : 'validation-fetch-error',
    };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const site of sites) {
  const origin = `https://${site}`;
  const { body: sitemap } = await read(`${origin}/sitemap.xml`);
  const sitemapList = [...new Set(sitemapUrls(sitemap))];
  const candidates = explicitUrls.length ? [...new Set(explicitUrls)] : sitemapList;
  const validations = await mapLimit(candidates, validationConcurrency, (url) => validateCandidate(url, site));
  const urls = validations.filter((item) => item.eligible).map((item) => item.url);
  const skipped = validations
    .filter((item) => !item.eligible)
    .map((item) => ({ url: item.url, reason: item.reason }));
  const { body: keyBody } = await read(`${origin}/${key}.txt`);
  if (keyBody.trim() !== key) {
    throw new Error(`${site} IndexNow key file does not match INDEXNOW_KEY`);
  }

  if (explicitUrls.length && urls.length === 0 && skipped.every((item) => item.reason === 'cross-host')) {
    results.push({ site, candidateCount: candidates.length, urlCount: 0, skipped, mode: 'skip', status: null });
    continue;
  }
  if (urls.length === 0) {
    throw new Error(`${site} has no eligible canonical HTML URLs for IndexNow`);
  }

  const payload = {
    host: site,
    key,
    keyLocation: `${origin}/${key}.txt`,
    urlList: urls,
  };
  if (!shouldSubmit) {
    results.push({ site, candidateCount: candidates.length, urlCount: urls.length, skipped, mode: 'dry-run', status: null });
    continue;
  }

  const { response, body } = await read('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  results.push({
    site,
    candidateCount: candidates.length,
    urlCount: urls.length,
    skipped,
    mode: 'submit',
    status: response.status,
    response: body.slice(0, 200),
  });
}

console.log(JSON.stringify({ submittedAt: new Date().toISOString(), shouldSubmit, results }, null, 2));
