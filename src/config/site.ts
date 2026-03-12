export type SiteConfig = typeof siteConfig;

export interface Article {
  slug: string;
  title: string;
  summary: string;
  content: string;
  author?: string;
  date: string;
  imageUrl: string;
  imageHint: string;
  version?: string;
}

export interface Section {
  id: string;
  title: string;
  navLabel: string;
  enabled?: boolean;
  items: Article[];
}

export interface Update extends Article {}

const articles: Article[] = [
  {
    slug: 'pubgm-login-solution-sim-card',
    title: '《PUBG Mobile》登录失败卡加载？新手必看的 SIM 卡排查指南',
    summary: '很多新用户首次进入国际服时会卡在加载页。本文给你一套稳定可复现的排查步骤。',
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
    slug: 'pubgm-metro-royale-accelerator-recommendation',
    title: '地铁逃生模式加速器怎么选？先看这 4 个标准',
    summary: '低延迟和稳定性比“峰值速度”更重要，按这四个标准选择基本不会踩坑。',
    content: `## 地铁逃生对网络要求更高

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
    slug: 'version-4-3',
    version: '4.3',
    title: '🔥 PUBG MOBILE 4.3 版本更新速览',
    summary: '新版本加入职业技能系统、全新主题玩法与经典模式扩展内容。',
    content: `# PUBG MOBILE 4.3 更新重点

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
  name: 'PUBG Mobile',
  seo: {
    title: '地铁逃生手游官网 | 下载、更新、攻略 - 官方入口',
    description: '提供 PUBG Mobile 最新下载、版本更新、攻略与社区内容。',
    keywords: [
      'PUBG Mobile',
      'PUBG Mobile 官网',
      'PUBG Mobile 下载',
      '地铁逃生',
      'PUBG Mobile 更新',
      'PUBG Mobile 攻略',
      'pubgm apk',
    ],
    ogImage: 'https://cdn.apks.cc/blinko/1753974441995-1753974441505-share.jpg',
  },
  analytics: {
    customHeadHtml: `
      <meta name="baidu-site-verification" content="codeva-9XyV2k6cAS" />
      <meta name="google-site-verification" content="wheyJrkeJteNmtsowo1dyWiAtd18QqJR0VGilx25600" />
      <meta name="360-site-verification" content="999219046b1b9e0ef3a7f7c0f481fe20" />
      <meta name="sogou_site_verification" content="2rU7VTaXRK" />
      <script>
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?b2e255a5512aa46a4f692adf9c8bfe00";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
      </script>
    `,
  },
  header: {
    logo: {
      url: 'https://cdn.apks.cc/blinko/1753973194134-1753973193794-nav_logo.png',
      alt: 'PUBG Mobile Logo',
    },
  },
  hero: {
    backgroundImage: 'https://cdn.apks.cc/blinko/1920x960_1773327676_0001.png',
    title: '史诗级大逃杀手游，4.3 版本现已上线',
    description: '超多活动与玩法更新，立即加入 PUBG MOBILE。',
  },
  downloads: {
    googlePlay: {
      url: 'https://go.jujujuhaowan.com/detail/1050?inviteCode=B0000359',
      backgroundImage: 'https://cdn.apks.cc/blinko/shop.png',
      srText: '前往商店',
    },
    appStore: {
      url: 'https://apps.apple.com/hk/app/pubg-mobile/id1330123889',
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
  },
  video: {
    id: 'video',
    title: '地铁逃生 4.2 版本介绍',
    url: 'https://cdn.apks.cc/blinko/%E3%80%90%E7%AE%80%E4%B8%AD%E7%89%88%E6%9C%AC%E6%94%BB%E7%95%A5%E3%80%91PUBGM%204.2%E7%89%88%E6%9C%AC%E6%9B%B4%E6%96%B0%E6%94%BB%E7%95%A5.mp4',
    playerTitle: 'PUBGM 4.2 版本视频',
    navLabel: '官方频道',
    enabled: false,
  },
  footer: {
    description: '这里是获取 PUBG Mobile 新闻、更新和社区信息的聚合站点。',
    copyright:
      '© {year} PUBG Mobile. 游戏内容与素材版权归其发行商及授权方所有。',
    feedback: {
      email: 'apkscc-feedback@foxmail.com',
      buttonText: '反馈建议',
      dialogTitle: '提交你的反馈',
      dialogDescription: '我们非常重视你的意见，请填写以下信息。',
    },
  },
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
