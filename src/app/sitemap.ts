import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

import { getPublicSiteUrl, getSiteConfig } from '@/lib/site-config';

function normalizeLastModified(value: string | undefined) {
  if (!value) return new Date();
  const dateParts = value.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (dateParts) {
    const [, year, month, day] = dateParts;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? new Date(timestamp) : new Date();
}

function getLatestContentModifiedAt(
  config: Awaited<ReturnType<typeof getSiteConfig>>,
) {
  const timestamps = config.sections
    .flatMap((section) => section.items || [])
    .map((item) => normalizeLastModified(item.updatedAt || item.date).getTime())
    .filter(Number.isFinite);

  return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const requestHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '';
  const config = await getSiteConfig(requestHost);
  const siteUrl = getPublicSiteUrl(requestHost);
  const seen = new Set<string>();
  const urls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: getLatestContentModifiedAt(config),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  for (const section of config.sections) {
    for (const item of section.items || []) {
      if (!item.slug || seen.has(item.slug)) continue;
      seen.add(item.slug);
      urls.push({
        url: `${siteUrl}/articles/${item.slug}`,
        lastModified: normalizeLastModified(item.updatedAt || item.date),
        changeFrequency: section.id === 'updates' ? 'weekly' : 'monthly',
        priority: section.id === 'updates' ? 0.8 : 0.7,
      });
    }
  }

  return urls;
}
