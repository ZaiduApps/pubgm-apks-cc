import { cache } from 'react';

import { siteConfig } from '@/config/site';

type SiteConfigShape = typeof siteConfig;
type SiteArticle = SiteConfigShape['sections'][number]['items'][number];
type ApiEnvelope = {
  code?: number;
  data?: Partial<SiteConfigShape>;
  message?: string;
};

type AdminLandingPayload = {
  advertisement?: Record<string, any>;
  analytics?: Record<string, any>;
  basic?: Record<string, any>;
  downloads?: Record<string, any>;
  footer?: Record<string, any>;
  hero?: Record<string, any>;
  landing?: Record<string, any>;
  seo?: Record<string, any>;
  video?: Record<string, any>;
};

const DEFAULT_SITE_KEY = process.env.SITE_KEY?.trim() || 'pubgm';
const API_BASE = process.env.SITE_CONFIG_API_BASE?.trim() || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const USE_REMOTE_IN_DEV = process.env.SITE_CONFIG_USE_REMOTE_IN_DEV === 'true';
const DEBUG_REMOTE = process.env.SITE_CONFIG_DEBUG === 'true';
const DISABLE_LOCAL_FALLBACK = process.env.SITE_CONFIG_DISABLE_LOCAL_FALLBACK === 'true';

function shouldUseRemoteConfig() {
  if (!API_BASE) {
    return false;
  }

  if (IS_PRODUCTION) {
    return true;
  }

  return USE_REMOTE_IN_DEV;
}

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

function transformAdminPayload(input: AdminLandingPayload): Partial<SiteConfigShape> {
  const landing = (input.landing || {}) as Record<string, any>;
  const landingSeo = (landing.seo || {}) as Record<string, any>;
  const landingHero = (landing.hero || {}) as Record<string, any>;
  const landingAd = (landing.advertisement || {}) as Record<string, any>;
  const landingAnalytics = (landing.analytics || {}) as Record<string, any>;
  const landingDownloads = (landing.downloads || {}) as Record<string, any>;
  const landingVideo = (landing.video || {}) as Record<string, any>;
  const landingFooter = (landing.footer || {}) as Record<string, any>;
  const landingOverrides =
    landing.overrides && typeof landing.overrides === 'object'
      ? (landing.overrides as Record<string, any>)
      : {};

  const manualSections = Array.isArray(landing.manual_sections)
    ? landing.manual_sections
    : [];

  const sections = manualSections.map((section: Record<string, any>, idx: number) => ({
    enabled: section.enabled ?? true,
    id: String(section.id || `section-${idx + 1}`),
    items: Array.isArray(section.items) ? section.items : [],
    navLabel: String(section.navLabel || section.nav_label || section.title || `Section ${idx + 1}`),
    title: String(section.title || section.navLabel || section.nav_label || `Section ${idx + 1}`),
  }));

  const parsedKeywords = Array.isArray(landingSeo.keywords)
    ? landingSeo.keywords
    : typeof landingSeo.keywords === 'string'
      ? landingSeo.keywords
          .split(',')
          .map((item: string) => item.trim())
          .filter(Boolean)
      : siteConfig.seo.keywords;

  return {
    name: String(input.basic?.site_name || landingSeo.title || siteConfig.name),
    seo: {
      ...input.seo,
      description: String(landingSeo.description || input.seo?.description || ''),
      keywords: parsedKeywords,
      ogImage: String(landingSeo.ogImage || input.seo?.ogImage || ''),
      title: String(landingSeo.title || input.seo?.title || ''),
    },
    analytics: {
      ...input.analytics,
      customHeadHtml: String(
        landingAnalytics.customHeadHtml || input.analytics?.customHeadHtml || '',
      ),
    },
    advertisement: {
      ...input.advertisement,
      header: {
        ...input.advertisement?.header,
        ...(landingAd.header || {}),
      },
    },
    footer: {
      ...input.footer,
      ...landingFooter,
      ...(landingOverrides.footer || {}),
    },
    hero: {
      ...input.hero,
      backgroundImage: String(landingHero.backgroundImage || input.hero?.backgroundImage || ''),
      description: String(landingHero.description || input.hero?.description || ''),
      title: String(landingHero.title || input.hero?.title || ''),
    },
    sections: sections.length > 0 ? sections : undefined,
    video: {
      ...input.video,
      ...landingVideo,
      ...(landingOverrides.video || {}),
    },
    downloads: {
      ...input.downloads,
      ...landingDownloads,
      ...(landingOverrides.downloads || {}),
    },
  };
}

function toSitePayload(payload: unknown): Partial<SiteConfigShape> | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const typedPayload = payload as Record<string, any>;
  if (typedPayload.landing && typeof typedPayload.landing === 'object') {
    return transformAdminPayload(typedPayload as AdminLandingPayload);
  }

  return typedPayload as Partial<SiteConfigShape>;
}

async function fetchRemoteSiteConfig(): Promise<SiteConfigShape | null> {
  if (!shouldUseRemoteConfig()) {
    return null;
  }

  const baseUrl = API_BASE.replace(/\/$/, '');
  const url = `${baseUrl}/site/landing-config?key=${encodeURIComponent(DEFAULT_SITE_KEY)}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      if (DEBUG_REMOTE) {
        console.warn('[site-config] remote request failed:', response.status, url);
      }
      return null;
    }
    const json = (await response.json()) as ApiEnvelope | Partial<SiteConfigShape>;
    let payload: Partial<SiteConfigShape> | undefined;
    if (json && typeof json === 'object' && 'data' in json) {
      const envelope = json as ApiEnvelope;
      if (envelope.code !== 0) {
        if (DEBUG_REMOTE) {
          console.warn('[site-config] remote envelope code is not 0:', envelope.code);
        }
        return null;
      }
      payload = envelope.data;
    } else {
      payload = json as Partial<SiteConfigShape>;
    }
    const transformedPayload = toSitePayload(payload);
    if (!transformedPayload) {
      if (DEBUG_REMOTE) {
        console.warn('[site-config] remote payload invalid');
      }
      return null;
    }
    if (DEBUG_REMOTE) {
      console.info('[site-config] remote payload applied for key:', DEFAULT_SITE_KEY);
    }
    return normalizeConfig(transformedPayload);
  } catch {
    if (DEBUG_REMOTE) {
      console.warn('[site-config] remote request exception:', url);
    }
    return null;
  }
}

export const getSiteConfig = cache(async (): Promise<SiteConfigShape> => {
  const remote = await fetchRemoteSiteConfig();
  if (shouldUseRemoteConfig() && DISABLE_LOCAL_FALLBACK && !remote) {
    throw new Error(
      `[site-config] remote config is required but unavailable for key: ${DEFAULT_SITE_KEY}`,
    );
  }
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
