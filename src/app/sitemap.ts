import type { MetadataRoute } from 'next';

import { getPublicSiteUrl, getSiteConfig } from '@/lib/site-config';

function normalizeLastModified(value: string | undefined) {
  if (!value) return new Date();
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? new Date(timestamp) : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await getSiteConfig();
  const siteUrl = getPublicSiteUrl();
  const seen = new Set<string>();
  const urls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
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
        lastModified: normalizeLastModified(item.date),
        changeFrequency: section.id === 'updates' ? 'weekly' : 'monthly',
        priority: section.id === 'updates' ? 0.8 : 0.7,
      });
    }
  }

  return urls;
}
