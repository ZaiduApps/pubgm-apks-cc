
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: 'PUBG Mobile',
    seo: {
        title: '地铁逃生手游官网 | 下载、更新、攻略 - 官方正版入口',
        description: '欢迎访问PUBG Mobile中心，提供最新游戏下载、更新日志、游戏攻略和玩家社区，支持安卓与iOS系统，一站式掌握刺激战场动态。',
        keywords: ['PUBG Mobile', 'PUBG Mobile 官网', 'PUBG Mobile 下载', '吃鸡手游', '刺激战场', '地铁逃生', '和平精英国际服', 'pubgm 更新', 'PUBG Mobile 攻略', 'pubgm apk', 'pubgm 安卓下载', 'PUBG Mobile iOS下载'],
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
        backgroundImage: 'https://cdn.apks.cc/blinko/1753975129551-1753975127906-downloadbj.png',
        title: '史诗级大逃杀巨作-已更新4.2版本',
        description: '超多活动，等你游玩, 在PUBG MOBILE登上颠峰，尽情开火。 PUBG MOBILE是原创的大逃杀手机游戏，也是手机射击游戏巅峰之作。',
    },
    downloads: {
        googlePlay: {
            url: 'https://go.jujujuhaowan.com/detail/1050?inviteCode=B0000359',
            backgroundImage: 'https://cdn.apks.cc/blinko/shop.png',
            srText: '前往商城',
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
                officialUrl: 'https://f.gbcass.com/PUBGMOBILE_Global_4.2.0_uawebsite_livik01_271E08F1A.apk',
            }
        },
    },
    video: {
        id: 'video',
        title: '地铁逃生4.2版本！',
        url: 'https://cdn.apks.cc/blinko/%E3%80%90%E7%AE%80%E4%B8%AD%E7%89%88%E6%9C%AC%E6%94%BB%E7%95%A5%E3%80%91PUBGM%204.2%E7%89%88%E6%9C%AC%E6%9B%B4%E6%96%B0%E6%94%BB%E7%95%A5.mp4',
        playerTitle: 'pubgm4.2版本',
        navLabel: '官方频道',
        enabled: false,
    },
    footer: {
        description: '推荐收藏，分享给您的好友吧！这里是您获取《PUBG Mobile》新闻、更新和社区信息的最终目的地。这是一个非官方的粉丝自制网站。',
        copyright: '© {year} PUBG Mobile. 保留所有权利. 游戏内容和材料均为其各自发行商及其许可人的商标和版权。',
        feedback: {
            email: 'apkscc-feedback@foxmail.com',
            buttonText: '反馈建议',
            dialogTitle: '提交您的反馈',
            dialogDescription: '我们非常重视您的意见，请填写以下信息。您的建议将帮助我们改进网站。',
        }
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
            items: [
                {
                    slug: 'pubgm-login-solution-sim-card',
                    title: '《PUBG Mobile》登录失败/卡加载？新用户必读的“拔卡”终极解决方案',
                    summary: '遇到《PUBG Mobile》国际服登录不了、一直卡在加载画面的问题？这通常不是网络问题，而是区域限制所致。本文将详细教你如何通过最简单的“拔SIM卡”方法，顺利进入游戏，解决新玩家的燃眉之急。',
                    content: `## 为什么我的《PUBG Mobile》进不去？\n\n很多新玩家在首次安装并登录《PUBG Mobile》国际服时，会遇到一个令人困惑的问题：游戏一直卡在加载界面，或者提示“服务器没有响应”、“登录失败”。即使开了游戏加速器，问题依旧。\n\n其实，这大概率不是你的网络问题，而是游戏针对特定区域的网络限制策略。对于身处中国大陆地区的玩家，游戏客户端会检测你手机内的SIM卡信息，如果识别到是大陆地区的SIM卡，就会阻止你登录国际服。\n\n### “拔卡大法”：最简单有效的解决方案\n\n这个方法经过无数玩家验证，是目前解决新用户登录问题的最有效手段，操作步骤非常简单：\n\n1.  **彻底关闭游戏**：确保《PUBG Mobile》应用已从后台完全关闭。\n2.  **取出SIM卡**：打开你的手机卡槽，将中国大陆地区的SIM卡取出来。\n3.  **连接Wi-Fi**：确保你的手机连接在可用的Wi-Fi网络下。\n4.  **开启加速器**：打开你常用的游戏加速器，并选择《PUBG Mobile》国际服的合适节点（如亚服、日韩服）。\n5.  **重新启动游戏**：在无SIM卡、已连接Wi-Fi并开启加速器的状态下，重新打开游戏。\n\n此时，你应该能顺利通过加载界面，看到登录选项（如Twitter, Facebook, Google Play等）。\n\n> **重要提示**：成功登录并创建角色后，你就可以将SIM卡插回手机了。之后再玩游戏，就不再需要拔卡了，这个“拔卡”操作通常只需要在第一次登录时进行。\n\n这个小技巧虽然简单，但却能解决大部分新手的登录难题。如果你正被这个问题困扰，不妨立刻试试看！`,
                    author: '猫咪蒲公英',
                    date: '2025年8月20日',
                    imageUrl: 'https://cdn.apks.cc/blinko/kv3.jpg',
                    imageHint: 'phone sim card',
                },
                {
                    slug: 'pubgm-metro-royale-accelerator-recommendation',
                    title: '《PUBG Mobile》地铁逃生加速器哪个好？告别高延迟、掉线，稳定“摸金”必备利器',
                    summary: '玩《PUBG Mobile》地铁逃生模式，最怕的就是关键时刻网络延迟、掉线，导致“辛辛苦苦几十年，一朝回到解放前”。本文为你深度分析并推荐几款稳定高效的游戏加速器，助你获得流畅的网络体验，成为地铁里的常胜将军。',
                    content: `## 地铁逃生模式：网络稳定是第一生产力\n\n《PUBG Mobile》的“地铁逃生”（Metro Royale）模式以其高风险、高回报的紧张刺激玩法，吸引了大量玩家投身其中“摸金”。在这个模式里，一身价值不菲的六级甲、高级枪械和满满一背包的战利品，可能因为一次网络卡顿或掉线就付之东流。因此，一个稳定、低延迟的网络环境，其重要性甚至超过了枪法。\n\n### 为什么需要加速器？\n\n由于《PUBG Mobile》的服务器在海外，中国大陆玩家直连会面临物理距离远、网络波动大的问题，导致游戏内延迟（ping值）居高不下，容易出现人物瞬移、开门延迟、子弹“打不中人”甚至直接掉线的情况。\n\n游戏加速器通过在国内架设服务器，建立一条通往海外游戏服务器的专属“高速公路”，可以有效解决这些问题，显著降低延迟，防止掉线。\n\n### 如何选择合适的加速器？\n\n市面上的加速器琳琅满目，选择时可以关注以下几点：\n\n*   **专线节点**：是否提供《PUBG Mobile》的优化专线，特别是亚服、日韩等热门服务器节点。\n*   **稳定性**：加速效果是否稳定，会不会频繁断流。可以先通过试用或选择有口碑的老牌加速器。\n*   **延迟表现**：加速后的ping值能降低到多少。一般来说，绿色ping值（100ms以下）就能保证流畅游戏。\n*   **价格与服务**：月费、季费等价格是否合理，客服响应是否及时。\n\n### 几款主流加速器推荐（排名不分先后）\n\n1.  **UU加速器**：用户基数大，线路节点丰富，针对主流游戏的支持都比较好，是很多玩家的首选。\n2.  **迅游手游加速器**：老牌加速器厂商，技术积累雄厚，加速效果稳定，尤其在高峰时段表现依然坚挺。\n3.  **奇游加速器**：主打电竞级网络优化，延迟控制得不错，也提供了很多海外游戏的下载更新服务。\n\n> **小贴士**：没有一款加速器是“万能”的，因为每个人的本地网络环境（运营商、地区）都不同。强烈建议在付费前，先利用每个加速器提供的免费试用时间，亲自测试在你手机上的实际效果，选择体感最流畅的一款。\n\n选对加速器，你的“摸金”之路就成功了一半。祝你在地铁逃生模式中满载而归！`,
                    author: '网络优化师',
                    date: '2025年8月20日',
                    imageUrl: 'https://cdn.apks.cc/blinko/part4.jpg',
                    imageHint: 'network connection speed',
                },
                {
                    slug: 'apple-app-store-switch-region-guide',
                    title: '如何在iPhone/iPad上切换App Store到港澳台区，下载《PUBG Mobile》等海外游戏？',
                    summary: '想玩《PUBG Mobile》国际服，却发现在国区App Store里搜不到？别担心，这只是因为游戏没有在国区上架。本文将提供详细的图文教程，教你如何轻松将你的Apple ID切换到香港、澳门或台湾地区，顺利下载游戏。',
                    content: `## 前提准备：一个非国区的Apple ID\n\n首先，你需要一个非中国大陆地区的Apple ID。你可以自己注册，也可以通过一些渠道购买。注册时，地区选择香港、台湾或澳门均可。**请注意，切换地区可能会影响你已有的订阅服务，建议使用一个专门用于下载海外应用的“小号”ID。**\n\n### 切换App Store地区步骤\n\n1.  **退出当前国区账号**：\n    *   打开你的iPhone或iPad上的“App Store”。\n    *   点击右上角的头像图标。\n    *   滚动到页面最底部，点击“退出登录”。\n\n2.  **登录新的Apple ID**：\n    *   在同一个页面，输入你准备好的非国区Apple ID的账号和密码，点击“登录”。\n\n3.  **同意条款与补充信息**：\n    *   首次登录时，系统会弹出一个窗口，提示“此Apple ID尚未在iTunes Store使用过”，点击“检查”。\n    *   在接下来的页面，勾选“同意条款与条件”，然后点击“下一步”。\n    *   现在你需要填写付款信息。**关键步骤来了**：\n        *   **付款方式**：选择“无”或“None”。如果没有这个选项，说明你的账号存在未完成的订单或订阅，需要处理完才能切换。\n        *   **地址信息**：你需要填写真实的地址格式。可以通过地图软件或地址生成器获取一个对应区域（如香港）的地址、电话号码。例如，香港的电话号码是8位数。\n    *   填写完毕后，点击“下一步”。\n\n4.  **完成切换与下载**：\n    *   你会看到提示“Apple ID已完成”，点击“继续”。\n    *   此时，你的App Store就已经成功切换到你选择的区域了。商店的语言可能会变成繁体中文或英文。\n    *   现在，在搜索框中输入“PUBG Mobile”，你就能找到并下载官方正版的《PUBG Mobile》了。\n\n> **温馨提示**：下载完成后，你可以按照同样的路径，退出这个海外ID，重新登录回你自己的国区账号，这不会影响已经安装好的游戏正常使用和更新（更新时可能需要再次登录海外ID）。\n\n通过以上步骤，你就可以轻松绕开地区限制，畅玩包括《PUBG Mobile》在内的各种精彩游戏了。`,
                    author: '苹果达人',
                    date: '2025年8月20日',
                    imageUrl: 'https://cdn.apks.cc/blinko/part6.jpg',
                    imageHint: 'mobile app store',
                },
            ]
        },
        {
            id: 'updates',
            title: '版本更新日志',
            navLabel: '更新日志',
            items: [
                {
                    slug: 'version-4-2',
                    version: '4.2',
                    title: '4.2版本',
                    summary: '地铁逃生新赛季，4.2版本',
                    content: `
                    全新4.2【原初树境】主题版本将于1月7日进行不停服更新，预计更新完成时间为1月7日 11:00（UTC+0）。更新时间如有变动，我们将及时公告。更新后可通过邮件领取奖励：主题音乐唱片 Whisper*1 + V4.2福利兑换券*20+BP*1,000+AG*100；同时将自动为您发放V4.2限定密林古城主题大厅。

【版本亮点】
● 全新「原初树境」主题玩法上线：本次版本围绕世界树主题重塑艾伦格，对五大城区进行改造，在保留熟悉节奏的同时，带来更强的探索感与对抗变化。神树之力降临，在全新建筑与感染植物交织的战场中，邀你探索与净化，体验更沉浸的全态对抗。
● 「天空奇境」主题玩法返场：大家期待已久的V3.1「天空奇境」主题玩法将于2月初恢复回归，诚邀大家再度启程，在云端之上开启全新冒险！
● 经典模式：持续进行枪械平衡与战斗功能优化，新增合作攀爬机制，立体攻防更流畅。
● 赛事系统：全新赛季机制与赛事系统同步上线；荣誉奖励升级，优化竞技与挑战体验。
● WOW模式：AI助手功能升级，输入文字即可自动生成对应物件组合、上传参考视频即可一键生成动画，创意实现更轻松。
● 地铁逃生模式：全新传世武装裁决者·冰魄登场：标志性水晶蝴蝶刀外观，迅捷凌厉，制敌于瞬息！
● 重点玩法/活动时间一览（时区均为UTC+0）：
✧ 全新「原初树境」主题玩法：2026/1/6 02:00:00 - 2026/3/10 20:59:59；
✧ V3.1「天空奇境」主题玩法：将于2月初惊喜回归，敬请期待！
✧ C10S28经典&休闲赛季：2026/1/11 02:00:00 - 2026/3/14 23:59:59；
✧ C10S28巅峰赛：2026/1/19 02:00:00 - 2026/03/11 23:59:59；
✧ 地铁逃生赛季：2026/1/8 02:00:00 - 2026/3/10 20:59:59；
✧ 团竞排位赛：2026/1/27 02:00:00 - 2026/02/24 23:59:59；
✧ 疯狂周末活动：与上版本规则一致，于不同地区的周五/周六/周日开启；
✧ IP联动：超高人气剧集《浴血黑帮》联动将于1月30日惊喜上线，更多精彩内容敬请期待！


                    `,
                    date: '2025年1月07日',
                    imageUrl: 'http://cdn.apks.cc/blinko/e8e9635d266b44f6c7cf54625ee3ae10581766333.jpg@1052w_!web-dynamic.avif',
                    imageHint: 'giant robot',
                },
                {
                    slug: 'version-4-1',
                    version: '4.1',
                    title: '4.1版本',
                    summary: '地铁逃生新赛季，4.1版本',
                    content: `
               # PUBG MOBILE 4.1版本更新公告

**亲爱的玩家：**

全新4.1【极地动物城】主题版本将于11月6日进行不停服更新，预计更新完成时间为11月6日11:00（UTC+0）（北京时间：19:00）。若您在11月12日（UTC+0）前完成更新，可通过邮件领取3000BP+100AG奖励。同时将自动为您发放V4.1限定冰雪世界主题大厅。更新时间如有变动，我们将及时公告。

---

## 【版本亮点】

### ● 主题模式
当凛冬降临艾伦格，一场关于勇气与奇迹的冰雪奇遇即将开启！冰雪世界里的动物王国悄然移居至战场，带来萌趣与热血交织的全新体验：
- 4人企鹅雪橇穿梭冰原
- 咸鱼火箭炮控场破敌  
- 魔法冰鞋踏出专属冰道
- 剑鱼注射器唤醒绝地生机
- 雪国98K冰雪爆破
- 超可爱的忍者企鹅伙伴全程守护！

### ● 经典模式
经典战斗体验同步升级：
- 枪械平衡调整
- 音效及开镜瞄准优化  
- 艾伦格地图新增Boatyard区域与能量果实

### ● WOW模式
全新竞速地图将于2025/11/14上线

### ● 地铁逃生模式
- 指挥所及声望系统更新
- 新赛季将于2025/11/7开启

### ● 重点玩法/活动时间一览（时区均为UTC+0）
| 活动名称 | 时间范围 |
|---------|----------|
| C9S27经典&休闲赛季 | 2025/11/11 02:00 - 2026/01/10 23:59 |
| 地铁逃生赛季 | 2025/11/7 02:00 - 2026/01/5 00:00 |
| 团竞排位赛 | 2025/11/27 02:00 - 2026/01/01 23:59 |
| 疯狂周末活动 | 与上版本规则一致 |
| 人气对决年度盛典 | 报名：2025/11/05 00:00 - 2025/01/08 08:59<br>对决：2025/11/08 09:00 - 2025/12/10 09:00 |

### ● IP联动
- BABYMONSTER 联动即将于11月21日回归！
- 保时捷等众多知名IP联动内容陆续上线

---

## 【全新主题玩法：极地动物城】
**上线时间：** 2025/11/5 02:00 - 2026/01/5 20:59（UTC+0）  
**上线地图：** 艾伦格、利维科、维寒迪（含排位模式和匹配模式）

### 主题载具
**● 企鹅雪橇车**
- 四人两栖载具
- 可发射雪球使目标打滑
- 支持多人协作驾驶

### 主题道具
| 道具名称 | 功能描述 |
|---------|----------|
| 咸鱼火箭炮 | 发射冰冻炮弹/火焰喷射推进 |
| 魔法冰鞋 | 生成可移动的冰面轨道 |
| 剑鱼注射器 | 远程治疗+移动加速 |
| 企鹅魔药 | 提升换弹切枪速度 |
| 雪国Kar98K | 特殊冰雪外观+爆炸效果 |

### 动物NPC
| NPC类型 | 功能 |
|--------|------|
| 忍者企鹅 | 战斗辅助+物资共享 |
| 枪匠北极熊 | 高级武器任务 |
| 魔法师狐狸 | 传送门+冰鞋奖励 |
| 炼药师企鹅 | 随机药水炼制 |

---

## 【经典BR更新】
### 武器平衡调整
- 自动步枪：降低远距离伤害
- 霰弹枪：全面降低弹丸伤害
- 连发狙：提升开火稳定性

### 地图更新
- 艾伦格新增Boatyard港口区域
- 新增野生浆果采集点
- 物资卡车系统上线多张地图

---

## 【WOW更新】
### 新玩法时间表
| 玩法名称 | 上线日期 |
|---------|----------|
| 竞速狂欢 | 2025/11/14 |
| 冰雪Roguelike | 2025/11/21 |
| 冰雪鱼炮混战 | 2025/11/28 |

### 创作者更新
- 新增怪物/载具编辑功能
- 可视化编程系统升级
- WOW PASS赛季更新

---

## 【其他模式更新】
### 地铁逃生
- 新赛季：2025/11/7-2026/01/5
- 新增冰雪宝箱系统

### 家园系统
- 新增极地乐园主题
- 抢车位新赛季11/17开启

### Hub社交
- 新增冰雪主题场景
- 多款桌游玩法上线

---

**PUBG MOBILE 运营团队**  
2025年11月5日
                    `,
                    date: '2025年9月06日',
                    imageUrl: 'https://cdn.apks.cc/blinko/1920x800_1757173410_0001.jpg',
                    imageHint: 'giant robot',
                }
            ]
        }
    ]
};

export const getArticleBySlug = (slug: string) => {
    for (const section of siteConfig.sections) {
        if (!section.items) continue;
        const article = section.items.find((item: any) => item.slug === slug);
        if (article) {
            return article;
        }
    }
    return null;
};

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

export interface Update extends Article { }

