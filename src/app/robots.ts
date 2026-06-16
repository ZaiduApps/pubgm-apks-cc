import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

import { getPublicSiteUrl } from '@/lib/site-config';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const requestHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '';
  const siteUrl = getPublicSiteUrl(requestHost);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
