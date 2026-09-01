const blockedExactPaths = new Set([
  '/robots.txt',
  '/favicon.ico',
  '/sitemap.xml',
  '/sitemap_index.xml',
]);

const blockedPathPrefixes = ['/_next/', '/api/', '/cdn-cgi/'];
const blockedAssetExtension = /\.(?:avif|bmp|css|eot|gif|ico|jpe?g|js|json|map|otf|pdf|png|svg|tiff?|ttf|webmanifest|webp|woff2?|xml)$/i;

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1]?.trim() || '';
}

function normalizeComparableUrl(value) {
  const url = new URL(value);
  url.hash = '';
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.toString().replace(/\/$/, url.pathname === '/' && !url.search ? '' : '/');
}

export function inspectCandidateUrl(value, site) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return { eligible: false, reason: 'invalid-url' };
  }

  if (url.protocol !== 'https:') return { eligible: false, reason: 'non-https' };
  if (url.username || url.password) return { eligible: false, reason: 'credentials-in-url' };
  if (url.hostname.toLowerCase() !== site.toLowerCase()) return { eligible: false, reason: 'cross-host' };
  if (url.port) return { eligible: false, reason: 'non-default-port' };
  if (url.hash) return { eligible: false, reason: 'fragment-url' };

  const pathname = url.pathname.toLowerCase();
  if (blockedExactPaths.has(pathname)) return { eligible: false, reason: 'system-resource' };
  if (blockedPathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return { eligible: false, reason: 'system-resource' };
  }
  if (blockedAssetExtension.test(pathname)) return { eligible: false, reason: 'static-asset' };

  url.hash = '';
  return { eligible: true, url: url.toString() };
}

export function inspectFetchedPage(candidateUrl, response) {
  if (response.status !== 200) return { eligible: false, reason: `http-${response.status}` };

  const contentType = String(response.contentType || '').toLowerCase();
  if (!contentType.startsWith('text/html')) return { eligible: false, reason: 'non-html' };

  const headerRobots = String(response.xRobotsTag || '').toLowerCase();
  if (/(?:^|[,\s])noindex(?:$|[,\s])/.test(headerRobots)) {
    return { eligible: false, reason: 'x-robots-noindex' };
  }

  let finalUrl;
  try {
    finalUrl = normalizeComparableUrl(response.finalUrl || candidateUrl);
  } catch {
    return { eligible: false, reason: 'invalid-final-url' };
  }
  if (finalUrl !== normalizeComparableUrl(candidateUrl)) {
    return { eligible: false, reason: 'redirected-url' };
  }

  const head = String(response.body || '').match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const metaRobots = (head.match(/<meta\b[^>]*>/gi) || [])
    .filter((tag) => ['robots', 'bingbot'].includes(attr(tag, 'name').toLowerCase()))
    .map((tag) => attr(tag, 'content').toLowerCase());
  if (metaRobots.some((value) => /(?:^|[,\s])noindex(?:$|[,\s])/.test(value))) {
    return { eligible: false, reason: 'meta-robots-noindex' };
  }

  const canonicalTag = (head.match(/<link\b[^>]*>/gi) || [])
    .find((tag) => attr(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical'));
  const canonical = canonicalTag ? attr(canonicalTag, 'href') : '';
  if (!canonical) return { eligible: false, reason: 'missing-canonical' };

  let canonicalUrl;
  try {
    canonicalUrl = normalizeComparableUrl(new URL(canonical, candidateUrl).toString());
  } catch {
    return { eligible: false, reason: 'invalid-canonical' };
  }
  if (canonicalUrl !== normalizeComparableUrl(candidateUrl)) {
    return { eligible: false, reason: 'non-self-canonical' };
  }

  return { eligible: true };
}
