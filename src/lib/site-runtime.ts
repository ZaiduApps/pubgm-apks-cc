const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const DEFAULT_DOMAIN_KEY_MAP: Array<[string, string]> = [
  ['pokemonchampions.apks.cc', 'pokemonchampions'],
  ['browndust2.apks.cc', 'browndust2'],
  ['limbuscompany.apks.cc', 'limbuscompany'],
];

export type ResolvedSiteIdentity = {
  host: string;
  isMapped: boolean;
  key: string;
};

function stripPort(host: string) {
  const value = host.trim().toLowerCase();
  if (value.startsWith('[')) {
    return value.replace(/^\[([^\]]+)](?::\d+)?$/, '$1');
  }
  return value.replace(/:\d+$/, '');
}

export function normalizeRequestHost(value?: string | null) {
  const forwardedHost = String(value || '')
    .split(',')[0]
    .trim();
  return stripPort(forwardedHost);
}

export function getMainSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim().replace(/\/+$/, '') ||
    process.env.MAIN_SITE_URL?.trim().replace(/\/+$/, '') ||
    'https://apks.cc'
  );
}

export function isLocalHost(host: string) {
  return LOCAL_HOSTS.has(normalizeRequestHost(host));
}

export function getDefaultSiteKey() {
  return process.env.SITE_KEY?.trim() || 'default';
}

export function getDomainKeyMap() {
  const raw = process.env.SITE_DOMAIN_KEY_MAP || process.env.DOMAIN_KEY_MAP || '';
  const entries = raw
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const map = new Map<string, string>();

  for (const entry of entries) {
    const separatorIndex = entry.indexOf(':');
    if (separatorIndex <= 0) continue;

    const domain = normalizeRequestHost(entry.slice(0, separatorIndex));
    const key = entry.slice(separatorIndex + 1).trim();
    if (!domain || !key) continue;

    map.set(domain, key);
  }

  for (const [domain, key] of DEFAULT_DOMAIN_KEY_MAP) {
    if (!map.has(domain)) {
      map.set(domain, key);
    }
  }

  return map;
}

export function resolveSiteIdentity(host: string): ResolvedSiteIdentity | null {
  const normalizedHost = normalizeRequestHost(host);
  const map = getDomainKeyMap();

  if (!normalizedHost) {
    return {
      host: '',
      isMapped: false,
      key: getDefaultSiteKey(),
    };
  }

  const mappedKey = map.get(normalizedHost);
  if (mappedKey) {
    return {
      host: normalizedHost,
      isMapped: true,
      key: mappedKey,
    };
  }

  // 本地开发保留默认 key，避免必须配置测试域名。
  if (map.size === 0 || LOCAL_HOSTS.has(normalizedHost)) {
    return {
      host: normalizedHost,
      isMapped: false,
      key: getDefaultSiteKey(),
    };
  }

  return null;
}

export function buildSiteUrl(host: string) {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  if (explicitUrl && getDomainKeyMap().size === 0) {
    return explicitUrl.replace(/\/+$/, '');
  }

  const normalizedHost = normalizeRequestHost(host);
  if (!normalizedHost) {
    return (explicitUrl || 'https://example.com').replace(/\/+$/, '');
  }

  const protocol = normalizedHost.startsWith('localhost') || normalizedHost === '127.0.0.1'
    ? 'http'
    : 'https';

  return `${protocol}://${normalizedHost}`;
}
