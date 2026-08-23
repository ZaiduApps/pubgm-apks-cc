# 四站点 SEO 运维 SOP

## 1. 目标与边界

目标是让 `pubgm.apks.cc`、`pokemonchampions.apks.cc`、`browndust2.apks.cc`、`limbuscompany.apks.cc` 形成可观测、可复核、可回滚的 SEO 增长循环。循环的顺序是：

`配置与内容源 -> 服务端响应 -> 爬虫抓取 -> 渲染 -> 索引 -> 查询词/页面展现 -> 内容与内部链接实验 -> 复盘`

必须分开记录以下状态：URL 已发现、允许抓取、已抓取、已渲染、具备索引资格、已选 canonical、已在查询中展现。HTTP 200、Lighthouse 通过、IndexNow 接收都不能单独证明已收录或排名提升。

当前生产边界：香港 VPS `154.36.164.55`，项目 `/root/home/apks-sites`，PM2 `pubgm-app`，Next.js 监听 `3000`，Nginx/Cloudflare 负责四域名入口。发布前先在当前美国工作区验证，再通过 GitHub 同步并在香港验证；不修改既有 SSH/root 密码、端口、站点映射和无关工作区改动。

根目录账本：`SEO运维记录.md`。每次 SEO 审计、配置变更、内容发布、IndexNow 提交或生产部署后，必须追加时间、范围、动作、事实证据、结果阶段、commit/生产版本和下一步；同时保存对应的基线 JSON、Bing 原始响应或日志路径。有效凭证只放在本机忽略文件 `SEO运维凭证.md`，不得进入公开 Git 历史。

## 2. 当前基线（2026-08-23）

### 技术与渲染

- 四站首页和 PUBG 文章样本在 Chrome/CDP、Bingbot UA 下均返回 `200`，初始 head 包含 title、description、canonical；均为单 H1，首页包含 `WebSite`、`SoftwareApplication`、`FAQPage`、`ItemList`，文章包含 `Article`、`BreadcrumbList`。
- `scripts/seo-audit.mjs` 已默认使用 Bingbot UA，可检查 metadata 是否位于初始 head。
- Next.js 已配置 `htmlLimitedBots`，防止爬虫 metadata 被流式追加到初始 head 之后。
- Nginx 当前站点配置已关闭 HTML `proxy_cache`；线上响应仍会带 `Cache-Control: public, max-age=60, stale-while-revalidate=300`，需要通过日志与 Bing 数据观察缓存/重验证效果。
- 本地 hosts 曾覆盖后三个域名到 `127.0.0.1`，CDP 公网验证时应使用公网 DNS 或临时移除覆盖并恢复。

### 数据来源

- 页面配置：`GET http://127.0.0.1:9527/site/landing-config?key=<siteKey>`。
- 站点映射：`SITE_DOMAIN_KEY_MAP` 加内置四站默认映射。
- 社区话题：`GET /content/topics/public/<topic_id>`。
- Bing：`GetUserSites`、`GetRankAndTrafficStats`、`GetQueryStats`、`GetUrlSubmissionQuota`；当前已验证的 Webmaster 属性是根域 `https://apks.cc/`，四站 IndexNow key 文件均返回 `200`。
- IndexNow：只提交发生新增/更新/删除的 canonical URL，并保存请求时间、URL、状态码；`200/202` 只表示请求已接收。

### 后台绑定快照

| 站点 | siteKey | topic_id | 主题帖子 | 热度 | 最后发帖 |
|---|---|---|---:|---:|---|
| PUBG MOBILE | `pubgm` | `69d33699b0f4f5a2116d6884` | 213 | 2159 | 2026-08-13 |
| Pokémon Champions | `pokemonchampions` | `6a2b7fd86c64ce21cc58c158` | 39 | 407 | 2026-08-05 |
| 棕色尘埃2 | `browndust2` | `69d33685b0f4f5a2116d6873` | 1644 | 16474 | 2026-08-23 |
| 边狱公司 | `limbuscompany` | `69d3366bb0f4f5a2116d685c` | 4 | 60 | 2026-08-12 |

以上主题数据是后台 API 的只读快照，发帖数和热度会变化，不能当作长期指标。

### Bing 事件基线

根域 `GetRankAndTrafficStats` 的历史序列显示：2026-07-26 约 662 clicks / 6,278 impressions，2026-07-27 约 190 / 1,641，2026-07-28 约 35 / 449。2026-08-12 之后代码才陆续加入首页 SSR、缓存边界、内部链接和 crawler metadata 修复。因此“服务端请求渲染直接造成 7 月 27 日下跌”目前只是未证实假设；必须继续对齐发布、Nginx/Cloudflare、抓取日志与查询词/页面维度。

Bing 根域统计包含多个子域和主站路径，不能将根域汇总直接当成 PUBG 子域独立流量；Bing API 返回的历史日期格式也需在本地按运行时间、日期和 URL 过滤。

## 3. 每日巡检（只读）

在仓库根目录执行：

```powershell
$env:BING_WEBMASTER_API_KEY = '<本机环境变量，不写入仓库>'
$env:BING_WEBMASTER_SITE_URL = 'https://apks.cc/'
$env:SEO_CONFIG_API_BASE = 'http://127.0.0.1:9527'
$env:SEO_BASELINE_OUTPUT = 'logs/seo-baseline.json'
node scripts/seo-ops-baseline.mjs
```

检查四站：状态码、响应时间（可用 curl 另测）、初始 head metadata、H1、JSON-LD、正文字符数、canonical、robots、sitemap URL 数量/lastmod、IndexNow key。若配置 API 可达，同时记录 SEO 字段、数据源、topic_id 与主题活跃度。

检查线上日志时按 `bingbot`、`Googlebot`、`/robots.txt`、`/sitemap.xml`、文章路径、5xx、超时和 Cloudflare Ray 维度聚合。Cloudflare 代理日志中的 UA 可以被伪造；不能只凭 UA 认定真实 Bingbot，真实爬虫结论需要 Bing 官方 IP/反向 DNS 或 Webmaster 报告支撑。

## 4. 每周分析

1. 固化根域 Bing 近 28/90 天 `RankAndTrafficStats` 与 `QueryStats` 原始 JSON，记录属性、时区、日期范围和抓取时间。
2. 按 URL 主机拆分页面展现与点击，单独查看四个子域、`hub.apks.cc` 和 `apks.cc` 主站，避免根域归并造成误诊。
3. 将查询词分成品牌/导航、下载/安装、版本更新、故障排查、玩法攻略、社区/话题六类；优先覆盖已有页面能真实满足的意图，不按每个词机械生成页面。
4. 对每个高展现低点击 URL 检查 title/description 与 Bing SERP 竞品；对高点击低展现词检查页面是否被错误 canonical、内部链接不足或只在 JS 后出现。
5. 以 Bing SERP 当日样本记录前三竞争结果的页面类型、标题承诺、更新信号、正文结构、下载/官方入口和 FAQ，而不是复制其文本。

## 5. 内容与关键词策略（PUBGM 优先）

当前已观察到的 Bing 查询包括：`pubg mobile官网下载`、`pubg mobile下载`、`pubg mobile官网`、`pubgm`、`pubg mobile国际服下载`、`pubg mobile apk下载`、`地铁逃生下载`、`登录不了/安装问题`、版本号与更新词。查询量、难度和排名没有第三方或 Bing 明确证据时标为 `unknown`，不填估算数字。

推荐页面地图：

| 意图 | 页面角色 | 现有承接 |
|---|---|---|
| 品牌/官网入口 | 首页 | `https://pubgm.apks.cc/` |
| 国际服下载/安装 | 首页下载指南 + FAQ | 首页下载与常见问题区 |
| 版本更新/测试服 | 独立文章 | `/articles/<slug>` |
| 登录、闪退、网络 | 独立故障排查文章 | 现有文章与相关推荐 |
| Metro Royale/地铁逃生玩法 | 版本或攻略文章 | 现有文章，需检查是否有稳定专题入口 |
| 社区讨论 | 主站话题页 | 当前 `topic_id` 外链，不默认把低量帖子做成索引页 |

内容发布门槛：事实来源可追溯、解决一个明确任务、有独特实测/整理价值、作者/更新时间透明、与已有页面不抢同一意图、正文不是关键词堆叠。禁止批量伪原创、无事实营销软文、门页、隐藏文字、重复标题和只为 IndexNow 制造 URL。

## 6. 发布与 IndexNow 闸门

1. 先在后台或内容源确认文章事实、slug、日期、封面、topic 绑定和 canonical 归属。
2. 本地运行 `pnpm typecheck`、`node scripts/seo-ops-baseline.mjs`、`node scripts/seo-audit.mjs <代表 URL>`；生产 build 使用已验证的 `node node_modules/next/dist/bin/next build --no-lint` 作为依赖缺失时的替代检查，并记录原因。
3. Git 提交单一职责变更，推送 GitHub；香港生产拉取后构建、重载 PM2/Nginx，验证 PM2 online、监听端口、HTTP 200、Bingbot 初始 head、robots/sitemap。
4. 仅对实际新增/更新/删除的 canonical URL 调用 IndexNow；记录 URL、提交时间、响应状态、响应体摘要，随后分别等待并观察抓取/索引证据。
5. 后台自动发帖必须有人工审核、事实来源和每日上限。当前已确认 Admin MCP 的 `community.search_posts`、`topic.search` 只读能力，以及 `site.update_*` 配置写入能力；是否存在内容发布写工具必须以每次 `tools/list` 的实际结果为准。任何写入均需 preview、用户明确确认 token、唯一幂等键和执行后复读验证，不自动批量发布。

IndexNow 可复跑命令（默认 dry-run）：

```powershell
$env:INDEXNOW_KEY = '<IndexNow key>'
node scripts/indexnow-submit.mjs
node scripts/indexnow-submit.mjs --submit
```

`--submit` 是显式写入闸门。生产发布时建议再设置 `INDEXNOW_URLS` 为本次实际新增/更新的 canonical URL（逗号或换行分隔）；未设置时脚本仅在显式提交模式下使用当前 sitemap URL 列表。脚本会逐站校验 sitemap、key 文件和 URL host，不接受跨域 URL。

## 7. 事件诊断与实验

遇到 Bing 下跌，按以下顺序排查：

`可访问性/5xx -> robots 与 sitemap -> 初始 HTML 与渲染 -> canonical/重复 -> 页面内容与内部链接 -> 查询意图/竞品 -> 外部需求与平台波动`

每个实验只改变一个模板或页面组，预先登记假设、处理组、对照组、主指标、护栏指标、观察窗口和停止规则。当前建议先做“代表首页/文章的可抓取性与首字节延迟”监测实验，再做 title/内部链接实验；不要同时改架构、内容、链接和跟踪，否则无法归因。

## 8. 回滚与证据保留

- 代码回滚到上一个可验证 Git commit；保留生产构建日志和 PM2/Nginx 配置备份。
- Nginx 变更前保存 `/www/server/panel/vhost/nginx/pubgm.apks.cc.conf` 备份，恢复后执行实际 Nginx 二进制的 `-t` 和 reload。
- 不删除旧文章或大批量改 canonical，除非有 URL 级映射、索引证据、替代页面和回滚计划。
- 每次运行保留 `logs/seo-baseline-YYYYMMDD.json`、Bing 原始响应和变更 commit，报告“已实现/已部署可观测/已被 Bing 处理/结果已观察”四个阶段，不把其中任一阶段冒充排名结果。
