# APKSCC 多站点 SEO 工具链与交接手册

> 维护时间：2026-08-23（Asia/Shanghai）
>
> 用途：把四站 SEO 的代码边界、数据来源、竞品判断、Bing 提交流程、Admin MCP 闸门和生产交接信息集中到一份可复核文档。每次审计、配置变更、内容发布、提交或部署后，同时更新 `SEO运维记录.md`。

## 1. 项目边界

### 四个站点

| 域名 | `siteKey` | 包名 | 专题 ID | 当前用途 |
|---|---|---|---|---|
| `pubgm.apks.cc` | `pubgm` | `com.tencent.ig` | `69d33699b0f4f5a2116d6884` | PUBG Mobile 国际服、地铁逃生、下载与更新 |
| `pokemonchampions.apks.cc` | `pokemonchampions` | `jp.pokemon.pokemonchampions` | `6a2b7fd86c64ce21cc58c158` | Pokemon Champions |
| `browndust2.apks.cc` | `browndust2` | `com.neowizgames.game.browndust2` | `69d33685b0f4f5a2116d6873` | Brown Dust 2 |
| `limbuscompany.apks.cc` | `limbuscompany` | `com.ProjectMoon.LimbusCompany` | `69d3366bb0f4f5a2116d685c` | Limbus Company |

### 部署事实

| 项目 | 当前值 |
|---|---|
| 生产 VPS | 香港 `154.36.164.55` |
| 生产目录 | `/root/home/apks-sites` |
| 进程 | PM2 `pubgm-app` |
| Next.js | 15.5.7，应用端口 `3000` |
| 配置/内容 API | `http://127.0.0.1:9527`（仅香港机内） |
| Web 入口 | 宝塔 Nginx，四域名按 Host 反代到 3000 |
| PUBG Nginx 配置 | `/www/server/panel/vhost/nginx/pubgm.apks.cc.conf` |
| Nginx 二进制 | `/www/server/nginx/sbin/nginx` |
| GitHub | `git@github.com:ZaiduApps/pubgm-apks-cc.git`，分支 `main` |

生产 `ecosystem.config.js` 仍有历史路径示例，不能作为生产事实；部署前以香港机器的 PM2、监听端口和 Nginx 配置为准。

## 2. 当前目录与职责

~~~text
G:\pubgm-apks-cc\
├─ src/
│  ├─ app/                         Next.js 页面、layout、robots、sitemap
│  │  └─ articles/[slug]/page.tsx  文章详情、Metadata、Article JSON-LD
│  ├─ config/site.ts                Article/Section 类型与本地回退配置
│  ├─ lib/site-config.ts            远程配置请求、字段归一化、SEO 描述/关键词、JSON-LD
│  ├─ lib/site-runtime.ts           Host -> siteKey、canonical 域名解析
│  ├─ lib/community-api.ts          公开话题、评论与帖子 API 读取
│  └─ middleware.ts                 站点识别、文章 slug 404、请求前置控制
├─ public/                          robots 辅助文件、IndexNow key 文件等静态资源
├─ scripts/
│  ├─ seo-audit.mjs                 指定 URL 的 HTTP/初始 HTML SEO 审计
│  ├─ seo-ops-baseline.mjs          四站首页、robots、sitemap、配置、Bing 基线
│  └─ indexnow-submit.mjs           按 sitemap/URL 提交 IndexNow
├─ logs/                            脱敏审计、提交、Bing 响应和运行日志
├─ docs/                            其他项目文档
├─ SEO运维记录.md                   时间线、证据、部署与收录判断的账本
├─ SEO运维凭证.md                   本机忽略文件：有效 key、MCP 和生产连接信息
└─ package.json                     build、typecheck、seo:audit、seo:ops、seo:indexnow
~~~

`.next/`、`node_modules/`、构建输出和临时日志不是源码交接内容；不要把它们当成 SEO 配置来源。

## 3. 数据来源与渲染链

1. 站点配置：香港生产通过 `GET http://127.0.0.1:9527/site/landing-config?key=<siteKey>` 获取配置。开发机可用 `https://api.hk.apks.cc/site/landing-config?key=<siteKey>` 做只读核对；生产 API 不应暴露为浏览器数据源。
2. 话题和内容：公开话题使用 `/content/topics/public/<topic_id>`；后台检索通过 Admin MCP 的 `topic.search`、`community.search_posts`、`site.search_sources`。
3. Host 路由：`src/lib/site-runtime.ts` 将四个域名映射为 `siteKey`；`getSiteConfig()` 读取远程配置，失败时按环境决定是否回退本地配置。
4. 服务端输出：`src/app/layout.tsx` 输出站点级 title、description、keywords、canonical；`src/app/articles/[slug]/page.tsx` 输出文章级 title、description、keywords、Open Graph、Twitter Card 和 JSON-LD。
5. 文章关键词：`src/lib/site-config.ts` 优先读取文章 `keywords`、`seo_keywords`、`seoKeywords`、`tags`；缺失时从标题、摘要、正文、专题和版本号受控派生。只有正文真实匹配下载、登录问题、地铁逃生或版本号才追加对应意图词。
6. 发现与通知：XML sitemap 负责完整 URL 发现；IndexNow 只通知变更；两者都不保证 Bing 抓取、收录或排名。

## 4. 本轮竞品与页面事实

采集时间：2026-08-23，HTTP 初始 HTML；关键词和描述是观察样本，不是搜索量或排名承诺。

| 页面 | Title | Description/Keywords 观察 | 可借鉴点 |
|---|---|---|---|
| [TapTap PUBG MOBILE](https://www.taptap.cn/app/83084) | `PUBG MOBILE国际服 - TapTap` | 描述明确含“吃鸡游戏、最新版、官方正版下载”；keywords 为 `PUBG MOBILE,吃鸡,TapTap`；检测到 4 个 JSON-LD | 实体名 + 国际服 + 官方下载意图，页面结构稳定 |
| [游戏狗 PUBG 国际服](https://www.gamedog.cn/android/4000061.html) | `pubg国际服手游下载-pubg国际服(PUBG MOBILE)官方正版下载安装v4.5.0-游戏狗` | keywords 为 `pubg国际服,pubg国际服手游下载,pubg国际服官方正版`；描述含 PUBG Mobile、地铁逃生、安卓下载；H1 为 `pubg国际服` | Title 直接覆盖下载、安装、版本和官方正版意图 |

本站样本 `https://pubgm.apks.cc/articles/6a7f3cbd837db46b93680eb5` 当前线上事实：HTTP 200；Title 为 `【手游资讯】4.6版本测试服3上线 - PUBG MOBILE`；有 description、canonical、Open Graph、Twitter 和 meta keywords，但 keywords 仍是站点全局列表。这正是本轮代码修复的断点。

## 5. 关键词策略

### 页面映射

| 意图 | 推荐承接页面 | 关键词策略 | 事实约束 |
|---|---|---|---|
| 下载/安装 | 首页、真实下载指南、下载型文章 | `PUBG Mobile 下载`、`pubg国际服下载`、`PUBGM APK下载` | 页面必须有可用下载入口和设备说明 |
| 登录故障 | 登录排查文章 | `PUBGM 无法登录`、`无法登录PUBGM`、`PUBGM login error`、`login error 报错` | 正文应有复现条件、排查步骤和更新时间 |
| 地铁逃生 | Metro Royale/地铁逃生更新或下载文章 | `地铁逃生下载`、`地铁逃生更新` | 仅在文章正文出现该模式时派生 |
| 版本 | 对应版本公告 | `PUBG Mobile 4.6版本`、`地铁逃生4.7版本` | 版本号必须来自标题、正文或后台 `version`，不能把 4.7 写进无 4.7 事实的首页 |

当前后台/专题快照是 4.6 版本内容，未发现可验证的 4.7 文章。因此代码支持正文真实出现 `4.7` 时自动生成 `地铁逃生4.7版本`，但本轮没有把它硬注入首页 title/description。

meta keywords 不是主要排名控制；Title、Description、H1、正文解决问题的能力、内部链接、canonical、结构化数据和可抓取服务端 HTML 优先级更高。

## 6. SEO 工具链

### 本地命令

~~~powershell
# 类型检查：pnpm 可能因 ignored builds 触发安装拦截，必要时直接调用本地 tsc
pnpm exec tsc --noEmit -p tsconfig.typecheck.json
.\node_modules\.bin\tsc.cmd --noEmit -p tsconfig.typecheck.json

# 构建和脚本语法
npm run build
node --check scripts/seo-audit.mjs
node --check scripts/seo-ops-baseline.mjs
node --check scripts/indexnow-submit.mjs

# URL 初始 HTML 审计
node scripts/seo-audit.mjs https://pubgm.apks.cc/ https://pubgm.apks.cc/articles/<slug>

# 四站基线（需要本机环境变量，不从脚本默认值读取 key）
$env:BING_WEBMASTER_API_KEY = '<从 SEO运维凭证.md 读取>'
$env:INDEXNOW_KEY = '<从 SEO运维凭证.md 读取>'
$env:BING_WEBMASTER_SITE_URL = 'https://apks.cc/'
$env:SEO_BASELINE_OUTPUT = 'logs/seo-baseline-YYYYMMDD.json'
node scripts/seo-ops-baseline.mjs

# 只提交实际新增/更新/删除的 canonical URL
node scripts/indexnow-submit.mjs
~~~

不要把有效 key 写入命令历史、脚本默认值、公开文档、截图或 CI 日志。实际 key 只在被 `.gitignore` 忽略的 `SEO运维凭证.md` 中维护。

### Chrome/CDP

优先使用 Chrome DevTools MCP：打开目标 URL，检查 `document.title`、description、keywords、canonical、H1、`script[type="application/ld+json"]` 和初始 HTML/渲染 DOM 差异。若工具返回 `Transport closed`，记录为工具阻塞，改用 `Invoke-WebRequest`/Node HTTP，并明确这不是 CDP 渲染证据。

### Bing Webmaster 与 IndexNow

- 属性当前使用 `https://apks.cc/`，四个子域的 API 统计在根属性下归并。
- 查询：`GetUserSites`、`GetCrawlStats`、`GetRankAndTrafficStats`、`GetQueryStats`、`GetUrlSubmissionQuota`。
- IndexNow：只提交属于对应 Host 的 canonical URL；HTTP 200/202 代表接口接收，不代表已收录。
- 记录 URL、提交时间、响应状态和后续抓取/索引证据，不能把提交动作写成排名恢复。

### Admin MCP

Endpoint 和 key 见 `SEO运维凭证.md`。当前已确认的只读工具：`site.list`、`site.get_config`、`site.get_landing_preview`、`site.search_sources`、`topic.search`、`community.search_posts`、`community.search_comments`。配置写入工具：`site.update_metadata`、`site.update_content`、`site.update_status`，都支持 `mode=preview/execute`。

写入固定流程：

1. 读取当前配置，保留 before 快照。
2. 调用 `mode=preview`，检查 patch、风险、`confirm_token` 和过期时间。
3. 把 before/after、影响、回滚边界发给用户，等待明确确认。
4. 只用相同 patch、确认 token 和新的 `idempotency_key` 调用 `mode=execute`。
5. 重新调用 `site.get_config` 和 `site.get_landing_preview`，再做公网 HTML/JSON-LD 验证。

当前 MCP 工具列表没有社区发帖/文章创建工具；不能把搜索到的帖子直接当成已发布内容，也不能绕过 MCP 写入闸门调用内部接口。

## 7. Git、部署与验证

~~~powershell
git status --short
git diff --check
git add src SEO工具链与站点交接手册.md SEO运维记录.md
git commit -m "feat(seo): add article keyword metadata"
git push origin main
~~~

生产部署由香港机执行，保持现有路径、端口和 Nginx 映射：

1. 美国工作区完成 typecheck、build、代表文章 HTTP/Bingbot head 检查。
2. 推送 GitHub `main`，香港机在 `/root/home/apks-sites` 拉取目标 commit。
3. 香港机构建并重载 PM2 `pubgm-app`，不要修改 9527 API、3000 端口、SSH 端口或 root 密码。
4. 检查 `pm2 status`、`pm2 logs pubgm-app`、监听端口、Nginx 配置和四域名 200。
5. 重新抓取首页、代表文章、robots、sitemap；确认 title/description/canonical/H1/JSON-LD 在初始 head/HTML 可见。
6. 只提交实际变更 URL 到 IndexNow，记录“已实现 / 已部署可观测 / 已被 Bing 处理 / 结果已观察”四个状态。

回滚边界：代码回滚到上一个已验证 commit；配置回滚使用 MCP before 快照；不要用首页重定向替代失效文章的逐 URL 处理。

## 8. 本轮状态与待确认

- 已实现：文章类型支持 `keywords`；归一化支持 `keywords`、`seo_keywords`、`seoKeywords`、`tags`；详情页 Metadata 增加 `keywords`；Article JSON-LD 合并文章级关键词；下载、登录故障、地铁逃生和真实版本号受控派生。
- 已验证：本地 `tsc --noEmit -p tsconfig.typecheck.json`、脚本 `node --check`、`git diff --check` 通过。
- 已预览：MCP `site.update_metadata` 对 `pubgm` 的 SEO patch，风险 `medium`；目前只完成 preview，未 execute、未部署。
- 待确认：是否执行该 SEO patch。预览 token 会过期；确认后应重新生成 preview 并立即 execute。
- 待补内容：若要承接“地铁逃生4.7版本”，先通过可用内容发布链路提供真实 4.7 文章；当前 Admin MCP 没有发帖/文章创建工具，不能凭空生成帖子。
- 待观察：部署后至少观察 7-14 天的 Bing 抓取、查询、展现和点击；IndexNow 接收不能作为收录恢复结论。
