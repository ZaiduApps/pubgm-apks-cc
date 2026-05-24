import { cache } from 'react';

import { siteConfig } from '@/config/site';

type SiteConfigShape = typeof siteConfig;
type SiteArticle = SiteConfigShape['sections'][number]['items'][number];
type ApiEnvelope = {
  code?: number;
  data?: Partial<SiteConfigShape>;
  message?: string;
};

const DEFAULT_SITE_KEY = process.env.SITE_KEY?.trim() || 'pubgm';
const API_BASE = process.env.SITE_CONFIG_API_BASE?.trim() || '';

function normalizeConfig(input: Partial<SiteConfigShape> | null | undefined): SiteConfigShape {
  const sections = Array.isArray(input?.sections) ? input.sections : siteConfig.sections;
  const seoKeywords = input?.seo?.keywords;

  return {
    ...siteConfig,
    ...input,
    seo: {
      ...siteConfig.seo,
      ...(input?.seo || {}),
      keywords: Array.isArray(seoKeywords)
        ? seoKeywords.filter(Boolean)
        : siteConfig.seo.keywords,
    },
    analytics: {
      ...siteConfig.analytics,
      ...(input?.analytics || {}),
    },
    header: {
      ...siteConfig.header,
      ...(input?.header || {}),
      logo: {
        ...siteConfig.header.logo,
        ...(input?.header?.logo || {}),
      },
    },
    hero: {
      ...siteConfig.hero,
      ...(input?.hero || {}),
    },
    downloads: {
      ...siteConfig.downloads,
      ...(input?.downloads || {}),
      googlePlay: {
        ...siteConfig.downloads.googlePlay,
        ...(input?.downloads?.googlePlay || {}),
      },
      appStore: {
        ...siteConfig.downloads.appStore,
        ...(input?.downloads?.appStore || {}),
      },
      apk: {
        ...siteConfig.downloads.apk,
        ...(input?.downloads?.apk || {}),
        dialog: {
          ...siteConfig.downloads.apk.dialog,
          ...(input?.downloads?.apk?.dialog || {}),
        },
      },
    },
    video: {
      ...siteConfig.video,
      ...(input?.video || {}),
    },
    footer: {
      ...siteConfig.footer,
      ...(input?.footer || {}),
      feedback: {
        ...siteConfig.footer.feedback,
        ...(input?.footer?.feedback || {}),
      },
    },
    advertisement: {
      ...siteConfig.advertisement,
      ...(input?.advertisement || {}),
      header: {
        ...siteConfig.advertisement.header,
        ...(input?.advertisement?.header || {}),
      },
    },
    sections,
  };
}

async function fetchRemoteSiteConfig(): Promise<SiteConfigShape | null> {
  if (!API_BASE) {
    return null;
  }

  const baseUrl = API_BASE.replace(/\/$/, '');
  const url = `${baseUrl}/site/landing-config?key=${encodeURIComponent(DEFAULT_SITE_KEY)}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return null;
    }
    const json = (await response.json()) as ApiEnvelope | Partial<SiteConfigShape>;
    let payload: Partial<SiteConfigShape> | undefined;
    if (json && typeof json === 'object' && 'data' in json) {
      const envelope = json as ApiEnvelope;
      if (envelope.code !== 0) {
        return null;
      }
      payload = envelope.data;
    } else {
      payload = json as Partial<SiteConfigShape>;
    }
    if (!payload || typeof payload !== 'object') {
      return null;
    }
    return normalizeConfig(payload);
  } catch {
    return null;
  }
}

export const getSiteConfig = cache(async (): Promise<SiteConfigShape> => {
  const remote = await fetchRemoteSiteConfig();
  return remote || normalizeConfig(siteConfig);
});

export function getArticleBySlugFromConfig(config: SiteConfigShape, slug: string): null | SiteArticle {
  for (const section of config.sections) {
    if (!section.items) continue;
    const article = section.items.find((item) => item.slug === slug);
    if (article) {
      return article;
    }
  }
  return null;
}

export type { SiteArticle, SiteConfigShape };
