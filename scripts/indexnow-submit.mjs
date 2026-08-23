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

if (!key) {
  throw new Error('INDEXNOW_KEY is required');
}

async function read(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'user-agent': userAgent, ...(options.headers || {}) },
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}: ${body.slice(0, 200)}`);
  }
  return { response, body };
}

function sitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gi), (match) => match[1].trim())
    .filter((url) => /^https:\/\//i.test(url));
}

const results = [];
for (const site of sites) {
  const origin = `https://${site}`;
  const { body: sitemap } = await read(`${origin}/sitemap.xml`);
  const sitemapList = [...new Set(sitemapUrls(sitemap))];
  const urls = explicitUrls.length
    ? [...new Set(explicitUrls.filter((url) => new URL(url).host === site))]
    : sitemapList;
  const { body: keyBody } = await read(`${origin}/${key}.txt`);
  if (keyBody.trim() !== key) {
    throw new Error(`${site} IndexNow key file does not match INDEXNOW_KEY`);
  }

  const payload = {
    host: site,
    key,
    keyLocation: `${origin}/${key}.txt`,
    urlList: urls,
  };
  if (!shouldSubmit) {
    results.push({ site, urlCount: urls.length, mode: 'dry-run', status: null });
    continue;
  }

  const { response, body } = await read('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  results.push({
    site,
    urlCount: urls.length,
    mode: 'submit',
    status: response.status,
    response: body.slice(0, 200),
  });
}

console.log(JSON.stringify({ submittedAt: new Date().toISOString(), shouldSubmit, results }, null, 2));
