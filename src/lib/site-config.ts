import { cache } from 'react';

import { siteConfig } from '@/config/site';
import type { CommunityComment, CommunityTopic } from '@/lib/community-api';
import {
  buildSiteUrl,
  normalizeRequestHost,
  resolveSiteIdentity,
} from '@/lib/site-runtime';

type SiteConfigShape = typeof siteConfig;
type SiteArticle = SiteConfigShape['sections'][number]['items'][number];
type SiteSection = SiteConfigShape['sections'][number];
type DownloadSection = SiteConfigShape['downloads']['sections'][number];
type DownloadSectionItem = DownloadSection['items'][number];
type HeroDownloadButton = SiteConfigShape['downloads']['hero_buttons'][number];
type SiteEnrichment = SiteConfigShape['enrichment'];
type EnrichmentContentItem = SiteEnrichment['contentDigest']['items'][number];
type EnrichmentFaq = SiteEnrichment['faqs'][number];
type EnrichmentGuideItem = SiteEnrichment['downloadGuide']['items'][number];
type ApiEnvelope = {
  code?: number;
  data?: Partial<SiteConfigShape>;
  message?: string;
};

type ArticleJsonLdOptions = {
  canonicalUrl?: string;
  comments?: CommunityComment[];
  commentsTotal?: number;
  siteUrl?: string;
  topic?: CommunityTopic | null;
  topicUrl?: string;
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

const API_BASE = process.env.SITE_CONFIG_API_BASE?.trim() || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const USE_REMOTE_IN_DEV = process.env.SITE_CONFIG_USE_REMOTE_IN_DEV === 'true';
const DEBUG_REMOTE = process.env.SITE_CONFIG_DEBUG === 'true';
const DISABLE_LOCAL_FALLBACK = process.env.SITE_CONFIG_DISABLE_LOCAL_FALLBACK === 'true';
// 配置接口属于增强数据，超时后使用本地快照，不能阻塞页面首屏和爬虫抓取。
const REMOTE_CONFIG_TIMEOUT_MS = Math.max(
  500,
  Number(process.env.SITE_CONFIG_TIMEOUT_MS || 2500),
);
let hasLoggedRemoteRuntime = false;

function shouldUseRemoteConfig() {
  if (!API_BASE) {
    return false;
  }

  if (IS_PRODUCTION) {
    return true;
  }

  return USE_REMOTE_IN_DEV;
}

function getRemoteRequestUrl(siteKey: string) {
  if (!API_BASE) {
    return '';
  }

  const baseUrl = API_BASE.replace(/\/$/, '');
  return `${baseUrl}/site/landing-config?key=${encodeURIComponent(siteKey)}`;
}

function logRemoteRuntime(siteKey: string, host: string) {
  if (!DEBUG_REMOTE || hasLoggedRemoteRuntime) {
    return;
  }

  hasLoggedRemoteRuntime = true;
  console.info(
    `[site-config] runtime: env=${process.env.NODE_ENV || 'development'} remote=${shouldUseRemoteConfig()} apiBase=${API_BASE || '(empty)'} requestUrl=${getRemoteRequestUrl(siteKey) || '(disabled)'} localFallback=${DISABLE_LOCAL_FALLBACK ? 'disabled' : 'enabled'} siteKey=${siteKey} host=${host || '(empty)'}`,
  );
}

function normalizeText(value: unknown, fallback = '') {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function normalizeMarkdownText(value: unknown, fallback = '') {
  const text = String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/^\uFEFF/, '')
    .trim();
  return text || fallback;
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item || '').trim()).filter(Boolean);
}

function normalizeNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.max(0, Math.floor(number));
}

function normalizeKeywords(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return siteConfig.seo.keywords;
}

function normalizeArticleKeywordInput(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (item && typeof item === 'object') {
          const record = item as Record<string, any>;
          return [record.name, record.label, record.value, record.keyword];
        }
        return [item];
      })
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,，、|]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function addUniqueKeyword(target: string[], value: unknown) {
  const keyword = String(value || '').replace(/\s+/g, ' ').trim();
  if (
    !keyword ||
    target.some((item) => item.toLocaleLowerCase() === keyword.toLocaleLowerCase())
  ) {
    return;
  }
  target.push(keyword);
}

function extractArticleVersion(value: unknown) {
  const text = String(value || '');
  const match =
    text.match(/(?:\bv|version)\s*(\d+(?:\.\d+){1,2})/i) ||
    text.match(/(\d+(?:\.\d+){1,2})\s*版本/i) ||
    text.match(/版本\s*(\d+(?:\.\d+){1,2})/i);
  return match?.[1] || '';
}

// 关键词只从文章自身字段和可验证的搜索意图派生，避免把全站词堆到每一篇文章。
function buildArticleKeywords({
  raw,
  title,
  summary,
  content,
  topicNames,
  version,
}: {
  raw: Record<string, any>;
  title: string;
  summary: string;
  content: string;
  topicNames: string[];
  version: string;
}) {
  const explicit = [
    ...normalizeArticleKeywordInput(raw.keywords),
    ...normalizeArticleKeywordInput(raw.seo_keywords),
    ...normalizeArticleKeywordInput(raw.seoKeywords),
    ...normalizeArticleKeywordInput(raw.tags),
  ];
  const sourceText = `${title} ${summary} ${content} ${topicNames.join(' ')} ${version} ${raw.app_id || raw.appId || ''}`;
  const isPubgm = /pubg\s*mobile|pubgm|pubg国际服|绝地求生|地铁逃生|com\.tencent\.ig/i.test(sourceText);
  const hasDownloadIntent = /下载|安装|安装包|apk|安卓|ios|商店|download|install/i.test(sourceText);
  const hasLoginIssue = /login\s*(?:error|eer)|登录|无法|失败|报错|error|错误|进不去|卡在|加载/i.test(sourceText);
  const hasMetroIntent = /地铁逃生|metro\s*royale|metro/i.test(sourceText);
  const hasUpdateIntent = /更新|版本|update|patch|\bv\d+\.\d+/i.test(sourceText);
  const detectedVersion = extractArticleVersion(`${title} ${summary} ${content} ${version}`);
  const result: string[] = [];

  explicit.forEach((keyword) => addUniqueKeyword(result, keyword));
  addUniqueKeyword(result, title);
  topicNames.forEach((topicName) => addUniqueKeyword(result, topicName));

  if (isPubgm) {
    addUniqueKeyword(result, 'PUBG Mobile');
    addUniqueKeyword(result, 'PUBGM');
  }
  if (isPubgm && hasDownloadIntent) {
    addUniqueKeyword(result, 'PUBG Mobile 下载');
    addUniqueKeyword(result, 'pubg国际服下载');
    if (/apk|安装包|安卓|android/i.test(sourceText)) {
      addUniqueKeyword(result, 'PUBGM APK下载');
    }
  }
  if (isPubgm && hasLoginIssue) {
    addUniqueKeyword(result, 'PUBGM 无法登录');
    addUniqueKeyword(result, '无法登录PUBGM');
    addUniqueKeyword(result, 'PUBGM login error');
    addUniqueKeyword(result, 'login error 报错');
    addUniqueKeyword(result, 'PUBGM 登录失败');
  }
  if (isPubgm && hasMetroIntent) {
    addUniqueKeyword(result, '地铁逃生');
    if (hasDownloadIntent) addUniqueKeyword(result, '地铁逃生下载');
    if (hasUpdateIntent) addUniqueKeyword(result, '地铁逃生更新');
    if (detectedVersion) addUniqueKeyword(result, `地铁逃生${detectedVersion}版本`);
  }
  if (isPubgm && detectedVersion) {
    addUniqueKeyword(result, `PUBG Mobile ${detectedVersion}版本`);
  }

  return result.slice(0, 16);
}

function normalizeDateText(value: unknown) {
  const text = String(value || '').trim();
  if (!text) {
    return new Date().toISOString().slice(0, 10);
  }
  const timestamp = new Date(text).getTime();
  if (!Number.isFinite(timestamp)) {
    return text;
  }
  return new Date(timestamp).toISOString().slice(0, 10);
}

function slugify(value: unknown, fallback: string) {
  const text = String(value || fallback || '').trim();
  return encodeURIComponent(text).replace(/%/g, '').slice(0, 120) || fallback;
}

function normalizeArticle(input: unknown, index: number): SiteArticle {
  const raw = (input || {}) as Record<string, any>;
  const title = normalizeText(raw.title || raw.name, `内容 ${index + 1}`);
  const fallbackImage = siteConfig.seo.ogImage || siteConfig.hero.backgroundImage;
  const id = normalizeText(raw.id || raw._id);
  const topicInfo = (raw.topic_info || {}) as Record<string, any>;
  const topicInfos = Array.isArray(raw.topic_infos) ? raw.topic_infos : [];
  const topicIds = normalizeStringList([
    raw.topic_id,
    ...(Array.isArray(raw.topic_ids) ? raw.topic_ids : []),
    topicInfo._id,
    ...topicInfos.map((topic: Record<string, any>) => topic?._id),
  ]);
  const topicNames = normalizeStringList([
    raw.topicName || raw.topic_name,
    topicInfo.name,
    ...topicInfos.map((topic: Record<string, any>) => topic?.name),
  ]);
  const topicSlugs = normalizeStringList([
    raw.topicSlug || raw.topic_slug,
    topicInfo.slug,
    ...topicInfos.map((topic: Record<string, any>) => topic?.slug),
  ]);
  const summary = normalizeText(raw.summary || raw.description, title);
  const content = normalizeMarkdownText(
    raw.content,
    `# ${title}\n\n${normalizeText(raw.summary || raw.description, '')}`,
  );
  const version = normalizeText(raw.version);

  return {
    id: id || undefined,
    slug: normalizeText(raw.slug, slugify(raw._id || raw.gid || title, `item-${index + 1}`)),
    title,
    summary,
    content,
    keywords: buildArticleKeywords({
      raw,
      title,
      summary,
      content,
      topicNames,
      version,
    }),
    author: normalizeText(raw.author || raw.author_name, '站点编辑部'),
    date: normalizeDateText(raw.date || raw.release_at || raw.publish_at || raw.created_at),
    imageUrl: normalizeText(raw.imageUrl || raw.image_cover || raw.cover || raw.display_cover, fallbackImage),
    imageHint: normalizeText(raw.imageHint || raw.image_hint, title),
    version: version || undefined,
    appId: normalizeText(raw.appId || raw.app_id) || undefined,
    commentCount: normalizeNumber(raw.commentCount ?? raw.comment_count),
    likeCount: normalizeNumber(raw.likeCount ?? raw.like_count),
    postType: normalizeText(raw.postType || raw.post_type) || undefined,
    topicId: topicIds[0] || undefined,
    topicIds,
    topicName: topicNames[0] || undefined,
    topicSlug: topicSlugs[0] || undefined,
    updatedAt: normalizeDateText(raw.updatedAt || raw.updated_at || raw.date || raw.created_at),
    viewCount: normalizeNumber(raw.viewCount ?? raw.view_count),
  };
}

function normalizeSections(input: unknown): SiteSection[] {
  if (!Array.isArray(input)) {
    return siteConfig.sections;
  }

  return input
    .map((section, sectionIndex) => {
      const rawSection = (section || {}) as Record<string, any>;
      const id = normalizeText(rawSection.id, `section-${sectionIndex + 1}`);
      const title = normalizeText(rawSection.title || rawSection.navLabel || rawSection.nav_label, id);
      const items = Array.isArray(rawSection.items)
        ? rawSection.items.map((item: Record<string, any>, itemIndex: number) =>
            normalizeArticle(item, itemIndex),
          )
        : [];

      return {
        enabled: rawSection.enabled ?? true,
        id,
        items,
        navLabel: normalizeText(rawSection.navLabel || rawSection.nav_label || title, title),
        title,
        count: Number.isFinite(Number(rawSection.count)) ? Number(rawSection.count) : undefined,
        post_type: normalizeText(rawSection.post_type),
        sort: normalizeText(rawSection.sort),
        source_mode: normalizeText(rawSection.source_mode),
        source_summary:
          rawSection.source_summary && typeof rawSection.source_summary === 'object'
            ? (rawSection.source_summary as SiteSection['source_summary'])
            : null,
        topic_id: normalizeText(rawSection.topic_id),
      };
    })
    .filter((section) => section.id);
}

function normalizeDownloadKind(value: unknown) {
  const kind = String(value || '').trim();
  return [
    'accelerator',
    'android',
    'cloud',
    'community',
    'ios',
    'mirror',
    'official',
    'store',
    'other',
  ].includes(kind)
    ? kind
    : 'other';
}

function normalizeDownloadItem(input: unknown, index: number): DownloadSectionItem | null {
  const raw = (input || {}) as Record<string, any>;
  const url = normalizeText(raw.url);
  if (!url) {
    return null;
  }

  return {
    id: normalizeText(raw.id, `download-${index + 1}`),
    label: normalizeText(raw.label || raw.title, '下载渠道'),
    description: normalizeText(raw.description),
    url,
    kind: normalizeDownloadKind(raw.kind),
    platform: normalizeText(raw.platform),
    badge: normalizeText(raw.badge),
    primary: Boolean(raw.primary),
    target: raw.target === '_self' ? '_self' : '_blank',
    rel: normalizeText(raw.rel, 'noopener noreferrer'),
    sort: Number.isFinite(Number(raw.sort)) ? Number(raw.sort) : index,
    enabled: raw.enabled !== false,
  };
}

function normalizeDownloadSections(input: unknown): DownloadSection[] {
  if (!Array.isArray(input)) {
    return siteConfig.downloads.sections;
  }

  return input
    .map((section, sectionIndex) => {
      const rawSection = (section || {}) as Record<string, any>;
      const items = Array.isArray(rawSection.items)
        ? rawSection.items
            .map((item: unknown, itemIndex: number) => normalizeDownloadItem(item, itemIndex))
            .filter(Boolean)
        : [];

      return {
        id: normalizeText(rawSection.id, `download-section-${sectionIndex + 1}`),
        title: normalizeText(rawSection.title, '下载分区'),
        description: normalizeText(rawSection.description),
        enabled: rawSection.enabled !== false,
        sort: Number.isFinite(Number(rawSection.sort)) ? Number(rawSection.sort) : sectionIndex,
        items: items as DownloadSectionItem[],
      };
    })
    .filter((section) => section.items.length > 0)
    .sort((a, b) => a.sort - b.sort);
}

function normalizeHeroDownloadButtons(input: unknown): HeroDownloadButton[] {
  const rawButtons = Array.isArray(input) ? input : siteConfig.downloads.hero_buttons;

  return rawButtons
    .map((button, buttonIndex) => {
      const raw = (button || {}) as Record<string, any>;
      const actionType = raw.action_type === 'modal' ? 'modal' : 'link';
      const modalItems = Array.isArray(raw.modal?.items)
        ? raw.modal.items
            .map((item: unknown, itemIndex: number) => normalizeDownloadItem(item, itemIndex))
            .filter(Boolean)
        : [];

      return {
        action_type: actionType,
        backgroundImage: normalizeText(raw.backgroundImage || raw.background_image),
        badge: normalizeText(raw.badge),
        description: normalizeText(raw.description),
        enabled: raw.enabled !== false,
        id: normalizeText(raw.id, `hero-download-${buttonIndex + 1}`),
        kind: normalizeDownloadKind(raw.kind),
        label: normalizeText(raw.label || raw.title, '下载渠道'),
        modal: {
          description: normalizeText(raw.modal?.description, '请选择适合你的下载方式。'),
          items: modalItems as NonNullable<HeroDownloadButton['modal']>['items'],
          title: normalizeText(raw.modal?.title, '选择下载渠道'),
        },
        platform: normalizeText(raw.platform),
        primary: Boolean(raw.primary),
        rel: normalizeText(raw.rel, 'noopener noreferrer'),
        sort: Number.isFinite(Number(raw.sort)) ? Number(raw.sort) : buttonIndex,
        target: raw.target === '_self' ? '_self' : '_blank',
        url: normalizeText(raw.url),
      };
    })
    .filter((button) => {
      if (button.enabled === false) return false;
      if (button.action_type === 'modal') return button.modal.items.length > 0;
      return Boolean(button.url);
    })
    .sort((a, b) => a.sort - b.sort) as HeroDownloadButton[];
}

function getEnabledDownloadItems(sections: DownloadSection[]) {
  return sections
    .filter((section) => section.enabled !== false)
    .flatMap((section) => section.items || [])
    .filter((item) => item.enabled !== false && item.url);
}

function getEnabledHeroDownloadItems(buttons: HeroDownloadButton[]) {
  return buttons
    .filter((button) => button.enabled !== false)
    .flatMap((button) => {
      if (button.action_type === 'modal') {
        return (button.modal?.items || []).map((item) => ({
          ...item,
          badge: item.badge || button.badge,
          description: item.description || button.description,
          platform: item.platform || button.platform,
        }));
      }
      return [button];
    })
    .filter((item) => item.enabled !== false && item.url);
}

function buildFallbackFaqs(name: string, downloadSections: DownloadSection[]): EnrichmentFaq[] {
  const downloadCount = getEnabledDownloadItems(downloadSections).length;
  return [
    {
      id: 'download',
      question: `${name} 怎么下载？`,
      answer:
        downloadCount > 0
          ? `页面提供 ${downloadCount} 个下载渠道，建议按设备平台选择官方、商店或主推入口。`
          : '下载渠道正在整理中，页面会优先展示后台配置的有效入口。',
    },
    {
      id: 'android',
      question: `${name} 支持 Android APK 吗？`,
      answer: '安卓用户可以查看 APK、网盘、官方详情页或商店入口，按页面提示选择适合设备的渠道。',
    },
    {
      id: 'ios',
      question: `iPhone 和 iPad 如何获取 ${name}？`,
      answer: 'iOS 用户可优先查看 App Store 分区，并按目标地区商店页面完成获取。',
    },
    {
      id: 'updates',
      question: `${name} 最新版本内容在哪里看？`,
      answer: '版本更新日志会展示专题页自动聚合的推荐内容、活动变化和玩法更新。',
    },
    {
      id: 'guides',
      question: `${name} 攻略和社区内容会自动更新吗？`,
      answer: '专题页会根据后台已发布内容自动展示攻略、资讯、帖子和更新内容。',
    },
  ];
}

function buildFallbackDownloadGuide(name: string, downloadSections: DownloadSection[]) {
  const items = getEnabledDownloadItems(downloadSections).map(
    (item): EnrichmentGuideItem => ({
      badge: item.badge,
      description: item.description || `${item.label} 下载入口`,
      href: item.url,
      id: item.id,
      kind: item.kind,
      platform: item.platform,
      title: item.label,
    }),
  );

  return {
    title: `${name} 下载指南`,
    description: '按设备、平台和渠道类型选择下载入口，优先使用官方、商店或主推渠道。',
    items,
  };
}

function buildFallbackContentDigest(name: string, sections: SiteSection[]) {
  const items = sections
    .filter((section) => section.enabled !== false && section.id !== 'community')
    .flatMap((section) =>
      (section.items || []).map(
        (item): EnrichmentContentItem => ({
          date: item.date,
          href: `/articles/${item.slug}`,
          id: item.slug,
          section_id: section.id,
          section_title: section.title,
          summary: item.summary,
          title: item.title,
        }),
      ),
    )
    .slice(0, 12);

  return {
    title: `${name} 内容导览`,
    description: '聚合攻略、版本更新和社区内容，方便快速定位重点信息。',
    items,
  };
}

function normalizeEnrichment(
  input: unknown,
  sections: SiteSection[],
  downloadSections: DownloadSection[],
  name: string,
): SiteEnrichment {
  const raw = (input || {}) as Record<string, any>;
  const fallback = {
    contentDigest: buildFallbackContentDigest(name, sections),
    downloadGuide: buildFallbackDownloadGuide(name, downloadSections),
    faqs: buildFallbackFaqs(name, downloadSections),
  };
  const faqs = Array.isArray(raw.faqs)
    ? raw.faqs
        .map((item: Record<string, any>, index: number): EnrichmentFaq => ({
          answer: normalizeText(item.answer),
          id: normalizeText(item.id, `faq-${index + 1}`),
          question: normalizeText(item.question),
        }))
        .filter((item: EnrichmentFaq) => item.question && item.answer)
    : fallback.faqs;
  const rawDownloadGuide = (raw.downloadGuide || {}) as Record<string, any>;
  const rawDownloadItems = Array.isArray(rawDownloadGuide.items)
    ? rawDownloadGuide.items
    : fallback.downloadGuide.items;
  const rawContentDigest = (raw.contentDigest || {}) as Record<string, any>;
  const rawContentItems = Array.isArray(rawContentDigest.items)
    ? rawContentDigest.items
    : fallback.contentDigest.items;

  return {
    faqs: faqs.length > 0 ? faqs : fallback.faqs,
    downloadGuide: {
      title: normalizeText(rawDownloadGuide.title, fallback.downloadGuide.title),
      description: normalizeText(
        rawDownloadGuide.description,
        fallback.downloadGuide.description,
      ),
      items: rawDownloadItems
        .map((item: Record<string, any>, index: number): EnrichmentGuideItem => ({
          badge: normalizeText(item.badge),
          description: normalizeText(item.description),
          href: normalizeText(item.href || item.url),
          id: normalizeText(item.id, `guide-${index + 1}`),
          kind: normalizeDownloadKind(item.kind),
          platform: normalizeText(item.platform),
          title: normalizeText(item.title || item.label, '下载渠道'),
        }))
        .filter((item: EnrichmentGuideItem) => item.href && item.title),
    },
    contentDigest: {
      title: normalizeText(raw.contentDigest?.title, fallback.contentDigest.title),
      description: normalizeText(raw.contentDigest?.description, fallback.contentDigest.description),
      items:
        rawContentItems
          .map((item: Record<string, any>, index: number): EnrichmentContentItem => ({
            date: normalizeDateText(item.date),
            href: normalizeText(item.href || item.url),
            id: normalizeText(item.id, `content-${index + 1}`),
            section_id: normalizeText(item.section_id || item.sectionId),
            section_title: normalizeText(item.section_title || item.sectionTitle),
            summary: normalizeText(item.summary),
            title: normalizeText(item.title, '内容条目'),
          }))
          .filter((item: EnrichmentContentItem) => item.href && item.title) || fallback.contentDigest.items,
    },
  };
}

function appendRelToken(rel: string, token: string) {
  const values = new Set(String(rel || '').split(/\s+/).filter(Boolean));
  values.add(token);
  return Array.from(values).join(' ');
}

function getUrlHost(value: unknown) {
  try {
    return new URL(String(value || '')).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isPubgmCommercialUrl(value: unknown) {
  const host = getUrlHost(value);
  return host === 'go.jujujuhaowan.com' || host === 'mobile.jujujuhaowan.com';
}

function isApksAppUrl(value: unknown) {
  try {
    const url = new URL(String(value || ''));
    return url.hostname.toLowerCase() === 'apks.cc' && url.pathname.startsWith('/app/');
  } catch {
    return false;
  }
}

function isPubgmSiteUrl(value: unknown) {
  try {
    return new URL(String(value || '')).hostname.toLowerCase() === 'pubgm.apks.cc';
  } catch {
    return false;
  }
}

function normalizePubgmDownloadItem<T extends { url?: string; label?: string; description?: string; badge?: string; kind?: string; rel?: string }>(item: T): T {
  if (isPubgmCommercialUrl(item.url)) {
    return {
      ...item,
      label: '第三方服务入口',
      description: '第三方商业服务入口，非 Google Play 官方商店。',
      badge: '第三方服务',
      kind: 'other',
      rel: appendRelToken(item.rel || 'noopener noreferrer', 'sponsored'),
    };
  }

  if (isApksAppUrl(item.url)) {
    return {
      ...item,
      label: 'APKSCC 应用详情',
      description: '查看本站收录的版本、包名和安装信息，非发行商官网。',
      badge: '站内详情',
      kind: 'other',
    };
  }

  if (getUrlHost(item.url) === 'www.123pan.com') {
    return {
      ...item,
      label: '网盘安装包',
      description: '通过第三方网盘获取安装包，请先核对版本、文件完整性和签名。',
      badge: '第三方下载',
      kind: 'cloud',
    };
  }

  return item;
}

function normalizePubgmCommercialConfig(config: SiteConfigShape): SiteConfigShape {
  const downloads = config.downloads;
  return {
    ...config,
    downloads: {
      ...downloads,
      googlePlay: isPubgmCommercialUrl(downloads.googlePlay?.url)
        ? {
            ...downloads.googlePlay,
            srText: '第三方服务入口',
          }
        : downloads.googlePlay,
      hero_buttons: downloads.hero_buttons.map((button) => {
        const normalizedButton = normalizePubgmDownloadItem(button);
        if (!button.modal) return normalizedButton;
        return {
          ...normalizedButton,
          modal: {
            ...button.modal,
            items: button.modal.items.map((item) => normalizePubgmDownloadItem(item)),
          },
        };
      }) as typeof downloads.hero_buttons,
      sections: downloads.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => normalizePubgmDownloadItem(item)),
      })),
      apk: {
        ...downloads.apk,
        dialog: {
          ...downloads.apk.dialog,
          description: '请选择适合你的下载方式，并核对来源、版本和文件完整性。',
        },
      },
    },
    advertisement: {
      ...config.advertisement,
      header: isPubgmCommercialUrl(config.advertisement.header.url)
        ? {
            ...config.advertisement.header,
            text: '第三方充值优惠',
            secondaryText: '',
            rel: appendRelToken(config.advertisement.header.rel, 'sponsored'),
          }
        : config.advertisement.header,
    },
    footer: {
      ...config.footer,
      description: `${config.footer.description} 本站为独立游戏资讯与下载导航站，并非 Tencent、Level Infinite 或 PUBG MOBILE 官方网站。`,
      copyright: '© {year} APKSCC 编辑部。PUBG MOBILE 名称、商标和素材归相应权利方所有。',
    },
  };
}

function normalizeConfig(input: Partial<SiteConfigShape> | null | undefined, siteKey = ''): SiteConfigShape {
  const sections = normalizeSections(input?.sections);
  const seoKeywords = normalizeKeywords(input?.seo?.keywords);
  const downloadSections = normalizeDownloadSections(input?.downloads?.sections);
  const heroButtons = normalizeHeroDownloadButtons(input?.downloads?.hero_buttons);
  const name = normalizeText(input?.name, siteConfig.name);
  const enrichment = normalizeEnrichment(input?.enrichment, sections, downloadSections, name);
  const dataSource = input?.data_source || siteConfig.data_source;

  const config: SiteConfigShape = {
    ...siteConfig,
    ...input,
    name,
    seo: {
      ...siteConfig.seo,
      ...(input?.seo || {}),
      description: normalizeText(input?.seo?.description, siteConfig.seo.description),
      faviconUrl: normalizeText(
        input?.seo?.faviconUrl || (input?.seo as Record<string, any> | undefined)?.favicon_url,
        siteConfig.seo.faviconUrl,
      ),
      keywords: seoKeywords,
      ogImage: normalizeText(input?.seo?.ogImage, siteConfig.seo.ogImage),
      title: normalizeText(input?.seo?.title, siteConfig.seo.title),
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
      backgroundImage: normalizeText(input?.hero?.backgroundImage, siteConfig.hero.backgroundImage),
      description: normalizeText(input?.hero?.description, siteConfig.hero.description),
      title: normalizeText(input?.hero?.title, siteConfig.hero.title),
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
      hero_buttons: heroButtons,
      sections: downloadSections,
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
      headerDownload: {
        ...siteConfig.advertisement.headerDownload,
        ...(input?.advertisement?.headerDownload || {}),
        enabled: input?.advertisement?.headerDownload?.enabled ?? siteConfig.advertisement.headerDownload.enabled,
        text: normalizeText(
          input?.advertisement?.headerDownload?.text ||
            input?.advertisement?.header?.downloadButtonText,
          siteConfig.advertisement.headerDownload.text,
        ),
        heroButtonId: normalizeText(input?.advertisement?.headerDownload?.heroButtonId),
        modalItemId: normalizeText(input?.advertisement?.headerDownload?.modalItemId),
      },
    },
    data_source: {
      ...siteConfig.data_source,
      ...(dataSource || {}),
      curated_article_ids: normalizeStringList(dataSource?.curated_article_ids),
      curated_post_ids: normalizeStringList(dataSource?.curated_post_ids),
      section_configs: Array.isArray(dataSource?.section_configs)
        ? dataSource.section_configs
        : siteConfig.data_source.section_configs,
    },
    enrichment,
    sections,
  };

  return siteKey === 'pubgm' ? normalizePubgmCommercialConfig(config) : config;
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

  const dataSource = (landing.data_source || {}) as Record<string, any>;
  const sectionConfigs = Array.isArray(dataSource.section_configs)
    ? dataSource.section_configs
    : [];
  const manualSections = Array.isArray(landing.manual_sections)
    ? landing.manual_sections
    : [];
  const sectionSource = sectionConfigs.length > 0 ? sectionConfigs : manualSections;

  const sections = sectionSource.map((section: Record<string, any>, idx: number) => ({
    enabled: section.enabled ?? true,
    id: String(section.id || `section-${idx + 1}`),
    items: Array.isArray(section.items) ? section.items : [],
    navLabel: String(section.navLabel || section.nav_label || section.title || `Section ${idx + 1}`),
    title: String(section.title || section.navLabel || section.nav_label || `Section ${idx + 1}`),
  }));

  const parsedKeywords = normalizeKeywords(landingSeo.keywords);

  return {
    name: String(input.basic?.site_name || landingSeo.title || siteConfig.name),
    seo: {
      ...input.seo,
      description: String(landingSeo.description || input.seo?.description || ''),
      faviconUrl: String(
        landingSeo.faviconUrl ||
          landingSeo.favicon_url ||
          input.basic?.favicon_url ||
          '',
      ),
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
      headerDownload: {
        ...(landingAd.headerDownload || {}),
        enabled: landingAd.headerDownload?.enabled ?? true,
        text: String(
          landingAd.headerDownload?.text ||
            landingAd.header?.downloadButtonText ||
            '游戏下载',
        ),
        heroButtonId: String(landingAd.headerDownload?.heroButtonId || ''),
        modalItemId: String(landingAd.headerDownload?.modalItemId || ''),
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
    data_source: landing.data_source,
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

const getSiteConfigByIdentity = cache(async (host: string, siteKey: string): Promise<SiteConfigShape> => {
  const remote = await fetchRemoteSiteConfig(host, siteKey);
  if (shouldUseRemoteConfig() && DISABLE_LOCAL_FALLBACK && !remote) {
    throw new Error(`[site-config] remote config is required but unavailable for key: ${siteKey}`);
  }
  if (shouldUseRemoteConfig() && !remote && DEBUG_REMOTE) {
    console.warn('[site-config] remote config unavailable, falling back to local config');
  }
  return remote || normalizeConfig(siteConfig, siteKey);
});

async function fetchRemoteSiteConfig(host: string, siteKey: string): Promise<SiteConfigShape | null> {
  logRemoteRuntime(siteKey, host);

  if (!shouldUseRemoteConfig()) {
    if (DEBUG_REMOTE) {
      console.info('[site-config] remote config disabled, using local config');
    }
    return null;
  }

  const url = getRemoteRequestUrl(siteKey);
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const controller = new AbortController();
    timer = setTimeout(() => controller.abort(), REMOTE_CONFIG_TIMEOUT_MS);
    const response = await fetch(url, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    clearTimeout(timer);
    timer = undefined;
    if (!response.ok) {
      if (DEBUG_REMOTE) {
        console.warn(
          '[site-config] remote request failed:',
          response.status,
          url,
          `localFallback=${DISABLE_LOCAL_FALLBACK ? 'disabled' : 'enabled'}`,
        );
      }
      return null;
    }
    const json = (await response.json()) as ApiEnvelope | Partial<SiteConfigShape>;
    let payload: Partial<SiteConfigShape> | undefined;
    if (json && typeof json === 'object' && 'data' in json) {
      const envelope = json as ApiEnvelope;
      if (envelope.code !== 0) {
        if (DEBUG_REMOTE) {
          console.warn(
            '[site-config] remote envelope code is not 0:',
            envelope.code,
            `localFallback=${DISABLE_LOCAL_FALLBACK ? 'disabled' : 'enabled'}`,
          );
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
      console.info('[site-config] remote payload applied for key:', siteKey);
    }
    return normalizeConfig(transformedPayload, siteKey);
  } catch (error) {
    if (timer) clearTimeout(timer);
    if (DEBUG_REMOTE) {
      console.warn(
        '[site-config] remote request exception:',
        url,
        error instanceof Error ? error.message : error,
      );
    }
    return null;
  }
}

export async function getSiteConfig(requestHost = ''): Promise<SiteConfigShape> {
  const host = normalizeRequestHost(requestHost);
  const identity = resolveSiteIdentity(host);
  if (!identity) {
    throw new Error(`[site-config] unmapped host: ${host || '(empty)'}`);
  }
  return getSiteConfigByIdentity(identity.host, identity.key);
}

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

export function getPublicSiteUrl(requestHost = '') {
  return buildSiteUrl(requestHost);
}

export function stripMarkdownToPlainText(value: unknown) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateSeoText(value: unknown, maxLength = 160) {
  const text = stripMarkdownToPlainText(value);
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export function getArticleSeoDescription(article: SiteArticle) {
  const summary = stripMarkdownToPlainText(article.summary);
  const content = stripMarkdownToPlainText(article.content);

  // 后台摘要可能只有一句话；继续从正文取一段，避免详情页 description
  // 因摘要过短而无法准确表达文章主题。正文已去除 Markdown，不会把标题标记带进 head。
  const descriptionSource =
    summary && content && !content.startsWith(summary)
      ? `${summary} ${content}`
      : summary || content;

  return truncateSeoText(descriptionSource, 158) || article.title;
}

export function getArticleTopicId(config: SiteConfigShape, article?: SiteArticle | null) {
  const articleTopicId = String(article?.topicId || article?.topicIds?.[0] || '').trim();
  if (articleTopicId) {
    return articleTopicId;
  }

  const dataSourceTopicId = String(config.data_source?.topic_id || '').trim();
  if (dataSourceTopicId) {
    return dataSourceTopicId;
  }

  for (const section of config.sections) {
    const topicId = String(section.source_summary?.topic_id || section.topic_id || '').trim();
    if (topicId) {
      return topicId;
    }
  }

  return '';
}

export function buildHomeJsonLd(config: SiteConfigShape, requestHost = '') {
  const siteUrl = getPublicSiteUrl(requestHost);
  const websiteName = isPubgmSiteUrl(siteUrl) ? 'PUBGM APKSCC' : config.name;
  const downloadItems = getEnabledDownloadItems(config.downloads.sections);
  const heroDownloadItems =
    downloadItems.length > 0
      ? downloadItems
      : getEnabledHeroDownloadItems(config.downloads.hero_buttons);
  const jsonLd: Array<Record<string, any>> = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: websiteName,
      url: siteUrl,
      description: config.seo.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: config.name,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Android, iOS',
      image: config.seo.ogImage,
      description: config.seo.description,
      url: siteUrl,
    },
  ];

  if (config.enrichment.faqs.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: config.enrichment.faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  if (heroDownloadItems.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${config.name} 下载入口`,
      itemListElement: heroDownloadItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        url: item.url,
      })),
    });
  }

  return jsonLd;
}

export function buildArticleJsonLd(
  config: SiteConfigShape,
  article: SiteArticle,
  options: ArticleJsonLdOptions = {},
) {
  const siteUrl = options.siteUrl || getPublicSiteUrl();
  const canonicalUrl = options.canonicalUrl || `${siteUrl}/articles/${article.slug}`;
  const description = getArticleSeoDescription(article);
  const articleBody = truncateSeoText(article.content, 5000);
  const comments = options.comments || [];
  const commentCount = Math.max(Number(options.commentsTotal || 0), Number(article.commentCount || 0), comments.length);
  const isPubgmSite = (() => {
    try {
      return new URL(siteUrl).hostname.toLowerCase() === 'pubgm.apks.cc';
    } catch {
      return false;
    }
  })();
  const author = {
    '@type': article.author ? 'Person' : 'Organization',
    name: article.author || config.name,
  };

  const articleJsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description,
    image: article.imageUrl,
    author,
    dateModified: article.updatedAt || article.date,
    datePublished: article.date,
    inLanguage: 'zh-CN',
    // 文章结构化数据只表达文章自身的关键词，避免把首页词注入无关文章。
    keywords: Array.from(new Set(article.keywords || [])).filter(Boolean),
    mainEntityOfPage: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: isPubgmSite ? 'APKSCC 编辑部' : config.name,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: config.header.logo.url,
      },
    },
    wordCount: articleBody ? articleBody.length : undefined,
  };

  if (commentCount > 0) {
    articleJsonLd.commentCount = commentCount;
  }

  if (comments.length > 0) {
    articleJsonLd.comment = comments.slice(0, 20).map((comment) => ({
      '@type': 'Comment',
      text: comment.content,
      dateCreated: comment.createdAt,
      upvoteCount: comment.likeCount,
      author: {
        '@type': 'Person',
        name: comment.userName,
      },
    }));
  }

  const jsonLdItems: Array<Record<string, any>> = [
    articleJsonLd,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          item: siteUrl,
          name: config.name,
          position: 1,
        },
        {
          '@type': 'ListItem',
          item: canonicalUrl,
          name: article.title,
          position: 2,
        },
      ],
    },
  ];

  return jsonLdItems;
}

export type { SiteArticle, SiteConfigShape };
