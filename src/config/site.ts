export type SiteConfig = typeof siteConfig;

export interface Article {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author?: string;
  date: string;
  imageUrl: string;
  imageHint: string;
  version?: string;
  appId?: string;
  commentCount?: number;
  likeCount?: number;
  postType?: string;
  topicId?: string;
  topicIds?: string[];
  topicName?: string;
  topicSlug?: string;
  updatedAt?: string;
  viewCount?: number;
}

export interface Section {
  id: string;
  title: string;
  navLabel: string;
  enabled?: boolean;
  items: Article[];
  count?: number;
  post_type?: string;
  sort?: string;
  source_mode?: string;
  source_summary?: {
    count?: number;
    empty_reason?: string;
    item_count?: number;
    post_type?: string;
    sort?: string;
    source_kind?: string;
    source_mode?: string;
    topic_id?: string;
  } | null;
  topic_id?: string;
}

export type Update = Article;

export interface DownloadSectionItem {
  id: string;
  label: string;
  description: string;
  url: string;
  kind: string;
  platform: string;
  badge: string;
  primary: boolean;
  target: '_blank' | '_self';
  rel: string;
  sort: number;
  enabled: boolean;
}

export interface DownloadSection {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  sort: number;
  items: DownloadSectionItem[];
}

export interface EnrichmentFaq {
  id: string;
  question: string;
  answer: string;
}

export interface EnrichmentGuideItem {
  badge: string;
  description: string;
  href: string;
  id: string;
  kind: string;
  platform: string;
  title: string;
}

export interface EnrichmentContentItem {
  date: string;
  href: string;
  id: string;
  section_id: string;
  section_title: string;
  summary: string;
  title: string;
}

export interface SiteEnrichment {
  faqs: EnrichmentFaq[];
  downloadGuide: {
    title: string;
    description: string;
    items: EnrichmentGuideItem[];
  };
  contentDigest: {
    title: string;
    description: string;
    items: EnrichmentContentItem[];
  };
}

export interface LandingDataSource {
  app_id: string;
  article_limit: number;
  curated_article_ids: string[];
  curated_post_ids: string[];
  mode: string;
  pkg: string;
  post_limit: number;
  section_configs: Array<Partial<Section>>;
  sort: string;
  topic_id: string;
  update_limit: number;
}

const articles: Article[] = [
  {
    slug: 'game-login-network-checklist',
    title: '游戏登录失败卡加载？新手必看的网络排查指南',
    summary: '很多用户首次进入游戏时会卡在加载页。本文给你一套稳定可复现的排查步骤。',
    content: `## 为什么会卡在加载页面？

常见原因不是手机性能，而是网络链路和区域识别。

### 推荐排查顺序

1. 完全关闭游戏并清理后台进程。
2. 使用稳定 Wi-Fi，避免弱网环境。
3. 开启游戏加速器并选择低延迟节点。
4. 重新启动游戏，观察是否进入登录页。

> 如果你是首次安装国际服，建议先完成首次登录再做其他设置。`,
    author: '站点编辑部',
    date: '2025年08月20日',
    imageUrl: 'https://cdn.apks.cc/blinko/624x365_1773327671_0001.png',
    imageHint: 'phone sim card',
  },
  {
    slug: 'game-accelerator-recommendation',
    title: '海外游戏加速器怎么选？先看这 4 个标准',
    summary: '低延迟和稳定性比峰值速度更重要，按这四个标准选择基本不会踩坑。',
    content: `## 海外游戏对网络要求更高

这个模式容错率低，掉线或高延迟都会直接影响战利品收益。

### 选择加速器时优先关注

- 节点稳定性（高峰时段是否抖动）
- 目标区服覆盖（亚服/日韩服）
- 延迟波动（而不是单次最低值）
- 客服响应和退款策略

建议先用试用时段做实测，再决定是否付费。`,
    author: '网络优化专栏',
    date: '2025年08月20日',
    imageUrl: 'https://cdn.apks.cc/blinko/part4.jpg',
    imageHint: 'network connection speed',
  },
  {
    slug: 'apple-app-store-switch-region-guide',
    title: 'iPhone 如何切换 App Store 地区下载海外游戏',
    summary: '看不到国际服应用时，通常是商店地区限制。本文给你完整的切换流程。',
    content: `## 切区前准备

你需要一个可用的非国区 Apple ID，并确认没有未完成订阅。

### 操作步骤

1. 在 App Store 退出当前账号。
2. 登录目标地区账号。
3. 按提示补充付款与地址信息（可选 None 时优先选 None）。
4. 完成后搜索并下载目标应用。

> 切回原账号不会影响已安装应用的使用。`,
    author: 'iOS 指南',
    date: '2025年08月20日',
    imageUrl: 'https://cdn.apks.cc/blinko/part6.jpg',
    imageHint: 'mobile app store',
  },
];

const updates: Update[] = [
  {
    slug: 'version-latest',
    version: 'latest',
    title: '游戏版本更新速览',
    summary: '新版本加入职业技能系统、全新主题玩法与经典模式扩展内容。',
    content: `# 游戏版本更新重点

> 发布时间：2026年03月12日

## 1. 主题玩法

- 新增职业技能成长分支
- 地图内加入主题事件与互动点
- 新增阶段性活动奖励

## 2. 经典模式

- 新枪械与载具加入轮换
- Erangel 场景和天气效果优化
- 操作与交互细节继续打磨

## 3. 系统体验

- 网络切换策略优化
- 更多机型开放高帧率选项
- 社交展示卡片能力增强`,
    date: '2026年03月12日',
    imageUrl: 'https://cdn.apks.cc/blinko/1920x800_1773327661_0001.jpg',
    imageHint: 'update announcement',
  },
];

export const siteConfig = {
  name: 'Game Topic',
  seo: {
    title: '游戏专题页 | 下载、更新、攻略 - 官方入口',
    description: '提供游戏最新下载、版本更新、攻略与社区内容。',
    keywords: [
      '游戏专题',
      '游戏官网',
      '游戏下载',
      '游戏攻略',
      '游戏更新',
      '游戏攻略',
      'game apk',
    ],
    ogImage: 'https://cdn.apks.cc/blinko/1753974441995-1753974441505-share.jpg',
    faviconUrl: '',
  },
  analytics: {
    customHeadHtml: '',
  },
  header: {
    logo: {
      url: 'https://cdn.apks.cc/blinko/1753973194134-1753973193794-nav_logo.png',
      alt: 'Game Topic Logo',
    },
  },
  hero: {
    backgroundImage: 'https://cdn.apks.cc/blinko/1920x960_1773327676_0001.png',
    title: '热门游戏专题，最新版本现已上线',
    description: '聚合下载入口、版本更新、攻略资讯与社区内容。',
  },
  downloads: {
    googlePlay: {
      url: 'https://go.jujujuhaowan.com/detail/1050?inviteCode=B0000359',
      backgroundImage: 'https://cdn.apks.cc/blinko/shop.png',
      srText: '前往商店',
    },
    appStore: {
      url: 'https://example.com/app-store',
      backgroundImage: 'https://cdn.apks.cc/blinko/1753972022261-1753972021905-app_store.png',
      srText: '在 App Store 下载',
    },
      apk: {
        backgroundImage: 'https://cdn.apks.cc/blinko/1753971933326-1753971932556-apk_download.png',
        line1: 'Android Download',
        line2: '安卓下载',
        dialog: {
        title: '选择下载渠道',
        description: '请选择您偏好的下载方式。',
        panUrl: 'https://www.123pan.com/s/4H3LVv-gUpI',
          officialUrl: 'https://apks.cc/app/com.tencent.ig',
        },
      },
      hero_buttons: [
        {
          id: 'google-play',
          label: '前往商店',
          description: 'Android 商店入口。',
          url: 'https://go.jujujuhaowan.com/detail/1050?inviteCode=B0000359',
          backgroundImage: 'https://cdn.apks.cc/blinko/shop.png',
          kind: 'store',
          platform: 'Android',
          badge: 'Google Play',
          primary: true,
          target: '_blank',
          rel: 'noopener noreferrer',
          sort: 0,
          enabled: true,
          action_type: 'link',
        },
        {
          id: 'app-store',
          label: '在 App Store 下载',
          description: 'iPhone 与 iPad 商店入口。',
          url: 'https://example.com/app-store',
          backgroundImage: 'https://cdn.apks.cc/blinko/1753972022261-1753972021905-app_store.png',
          kind: 'ios',
          platform: 'iOS',
          badge: 'App Store',
          primary: false,
          target: '_blank',
          rel: 'noopener noreferrer',
          sort: 1,
          enabled: true,
          action_type: 'link',
        },
        {
          id: 'apk',
          label: '安卓下载',
          description: 'Android APK 下载入口。',
          url: 'https://www.123pan.com/s/4H3LVv-gUpI',
          backgroundImage: 'https://cdn.apks.cc/blinko/1753971933326-1753971932556-apk_download.png',
          kind: 'android',
          platform: 'Android',
          badge: 'APK',
          primary: true,
          target: '_blank',
          rel: 'noopener noreferrer',
          sort: 2,
          enabled: true,
          action_type: 'modal',
          modal: {
            title: '选择下载渠道',
            description: '请选择您偏好的下载方式。',
            items: [
              {
                id: 'apk-pan',
                label: '网盘下载',
                description: '通过网盘获取安卓安装包。',
                url: 'https://www.123pan.com/s/4H3LVv-gUpI',
                kind: 'cloud',
                platform: 'Android',
                badge: 'APK',
                primary: true,
                target: '_blank',
                rel: 'noopener noreferrer',
                sort: 0,
                enabled: true,
              },
              {
                id: 'apk-official',
                label: '官网详情页',
                description: '查看版本信息、包名和下载说明。',
                url: 'https://apks.cc/app/com.tencent.ig',
                kind: 'official',
                platform: 'Android',
                badge: '官方',
                primary: false,
                target: '_blank',
                rel: 'noopener noreferrer',
                sort: 1,
                enabled: true,
              },
            ],
          },
        },
      ],
      sections: [
      {
        id: 'official',
        title: '官方与商店下载',
        description: '适合优先选择官方入口、应用商店和稳定更新通道的玩家。',
        enabled: true,
        sort: 0,
        items: [
          {
            id: 'google-play',
            label: 'Google Play',
            description: '通过商店入口进入游戏页面。',
            url: 'https://go.jujujuhaowan.com/detail/1050?inviteCode=B0000359',
            kind: 'store',
            platform: 'Android',
            badge: '推荐',
            primary: true,
            target: '_blank',
            rel: 'noopener noreferrer',
            sort: 0,
            enabled: true,
          },
          {
            id: 'app-store',
            label: 'App Store',
            description: 'iPhone 和 iPad 用户可通过 App Store 获取。',
            url: 'https://example.com/app-store',
            kind: 'ios',
            platform: 'iOS',
            badge: '',
            primary: false,
            target: '_blank',
            rel: 'noopener noreferrer',
            sort: 1,
            enabled: true,
          },
        ],
      },
      {
        id: 'android',
        title: '安卓 APK 与备用渠道',
        description: '适合需要 APK、网盘或备用镜像入口的安卓设备。',
        enabled: true,
        sort: 1,
        items: [
          {
            id: 'apk-pan',
            label: '网盘下载',
            description: '通过网盘获取安卓安装包。',
            url: 'https://www.123pan.com/s/4H3LVv-gUpI',
            kind: 'cloud',
            platform: 'Android',
            badge: 'APK',
            primary: true,
            target: '_blank',
            rel: 'noopener noreferrer',
            sort: 0,
            enabled: true,
          },
          {
            id: 'apk-official',
            label: '官网详情页',
            description: '查看版本信息、包名和下载说明。',
            url: 'https://apks.cc/app/com.tencent.ig',
            kind: 'official',
            platform: 'Android',
            badge: '',
            primary: false,
            target: '_blank',
            rel: 'noopener noreferrer',
            sort: 1,
            enabled: true,
          },
        ],
      },
    ] as DownloadSection[],
  },
  enrichment: {
    faqs: [
      {
        id: 'download',
        question: '游戏怎么下载安装？',
        answer: '页面提供商店、App Store、网盘和官网详情入口，建议按设备平台选择对应下载渠道。',
      },
      {
        id: 'android',
        question: '游戏支持 Android APK 吗？',
        answer: '安卓用户可以查看 APK 与备用渠道分区，按页面提示选择网盘或官网详情入口。',
      },
      {
        id: 'ios',
        question: 'iPhone 如何获取游戏？',
        answer: 'iPhone 和 iPad 用户可通过 App Store 入口进入对应地区商店页面。',
      },
      {
        id: 'updates',
        question: '游戏最新版本内容在哪里看？',
        answer: '版本更新日志会展示当前专题聚合的更新重点、活动内容和玩法变化。',
      },
      {
        id: 'guides',
        question: '游戏攻略会更新吗？',
        answer: '攻略、资讯和社区内容会随后台已发布内容自动进入专题页展示。',
      },
    ],
    downloadGuide: {
      title: '游戏下载指南',
      description: '按设备、平台和渠道类型选择下载入口，优先使用官方、商店或主推渠道。',
      items: [] as EnrichmentGuideItem[],
    },
    contentDigest: {
      title: '游戏内容导览',
      description: '聚合攻略、版本更新和社区内容，方便快速定位重点信息。',
      items: [] as EnrichmentContentItem[],
    },
  } as SiteEnrichment,
  video: {
    id: 'video',
    title: '游戏版本介绍',
    url: 'https://example.com/game-version.mp4',
    playerTitle: '游戏版本视频',
    navLabel: '官方频道',
    enabled: false,
  },
  footer: {
    description: '这里是获取游戏新闻、更新和社区信息的聚合专题页。',
    copyright:
      '© {year} Game Topic. 游戏内容与素材版权归其发行商及授权方所有。',
    feedback: {
      email: 'apkscc-feedback@foxmail.com',
      buttonText: '反馈建议',
      dialogTitle: '提交你的反馈',
      dialogDescription: '我们非常重视你的意见，请填写以下信息。',
    },
  },
  advertisement: {
    header: {
      enabled: true,
      text: '🎁 官网优惠购买',
      url: 'https://go.jujujuhaowan.com/?inviteCode=B0000359',
      target: '_blank',
      rel: 'noopener noreferrer',
      secondaryText: 'or',
      downloadButtonText: '游戏下载',
    },
    headerDownload: {
      enabled: true,
      text: '游戏下载',
      heroButtonId: 'apk',
      modalItemId: 'apk-pan',
    },
  },
  data_source: {
    mode: 'default_all',
    app_id: '',
    pkg: '',
    topic_id: '',
    article_limit: 6,
    post_limit: 6,
    update_limit: 3,
    sort: 'latest',
    curated_article_ids: [] as string[],
    curated_post_ids: [] as string[],
    section_configs: [] as Array<Partial<Section>>,
  } as LandingDataSource,
  sections: [
    {
      id: 'community',
      title: '交流广场',
      navLabel: '社区',
      enabled: false,
      items: [],
    },
    {
      id: 'articles',
      title: '最新文章',
      navLabel: '资讯',
      items: articles,
    },
    {
      id: 'updates',
      title: '版本更新日志',
      navLabel: '更新日志',
      items: updates,
    },
  ] as Section[],
};

export const getArticleBySlug = (slug: string): Article | null => {
  for (const section of siteConfig.sections) {
    if (!section.items) continue;
    const article = section.items.find((item) => item.slug === slug);
    if (article) {
      return article;
    }
  }
  return null;
};
