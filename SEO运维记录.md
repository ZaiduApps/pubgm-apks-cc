# APKSCC 多站点 SEO 运维记录

> 本文件是持续维护的项目运行账本。每次 SEO 审计、内容发布、配置变更、IndexNow 提交或生产部署后，必须在“运维变更日志”追加一条记录，并同步保存基线/原始响应。
>
> 安全边界：GitHub 仓库 `ZaiduApps/pubgm-apks-cc` 为公开仓库。有效 Bing、IndexNow、Admin MCP 凭证只保存在根目录 `SEO运维凭证.md`（已加入 `.gitignore`），不得提交、打印到 CI 日志或复制到应用源码。凭证如曾经进入公开 Git 历史，应立即轮换。

安全事件：检查发现 Bing/IndexNow key 曾出现在公开 Git 历史的 `2b1c5ce`、`a5cec85` 及此前源码/公开 key 文件中；Admin MCP key 未出现在 Git 历史。当前代码已移除 Bing/IndexNow 默认值，运行时必须通过本机环境变量或忽略凭证文件注入。Bing Webmaster key 与 IndexNow key 共用，建议尽快在 Bing/IndexNow 侧轮换后同步更新 `SEO运维凭证.md` 和公开 key 文件。

## 1. 项目与部署

| 项目 | 当前值 |
|---|---|
| GitHub | `git@github.com:ZaiduApps/pubgm-apks-cc.git` |
| 默认分支 | `main` |
| 香港生产 VPS | `154.36.164.55` |
| 生产路径 | `/root/home/apks-sites` |
| 进程管理 | PM2，进程名 `pubgm-app` |
| 应用 | Next.js 15.5.7，监听 `3000` |
| 配置/内容 API | `http://127.0.0.1:9527` |
| 入口 | 宝塔 Nginx + Cloudflare（四个域名反代到 `3000`） |
| Nginx 实际二进制 | `/www/server/nginx/sbin/nginx` |
| PUBG Nginx 配置 | `/www/server/panel/vhost/nginx/pubgm.apks.cc.conf` |
| 部署方式 | 美国工作区验证 -> GitHub -> 香港生产拉取/构建/PM2 验证 |

### 域名到站点配置

| 域名 | `siteKey` | 应用包名 | 话题 ID |
|---|---|---|---|
| `pubgm.apks.cc` | `pubgm` | `com.tencent.ig` | `69d33699b0f4f5a2116d6884` |
| `pokemonchampions.apks.cc` | `pokemonchampions` | `jp.pokemon.pokemonchampions` | `6a2b7fd86c64ce21cc58c158` |
| `browndust2.apks.cc` | `browndust2` | `com.neowizgames.game.browndust2` | `69d33685b0f4f5a2116d6873` |
| `limbuscompany.apks.cc` | `limbuscompany` | `com.ProjectMoon.LimbusCompany` | `69d3366bb0f4f5a2116d685c` |

## 2. 数据来源与链路

1. 页面配置：`GET http://127.0.0.1:9527/site/landing-config?key=<siteKey>`。
2. 公开话题：`GET /content/topics/public/<topic_id>`；Admin MCP 也可用 `topic.search` 查询后台话题。
3. 页面运行时：Next.js 按请求 Host 选择四站配置，服务端请求配置/文章/帖子并生成首页、文章、robots、sitemap 和 JSON-LD。
4. Bing Webmaster：属性为 `https://apks.cc/`，四个子域的统计在根域属性中归并；使用 `GetUserSites`、`GetRankAndTrafficStats`、`GetQueryStats`、`GetUrlSubmissionQuota`。
5. IndexNow：每站提交实际新增/更新/删除的 canonical URL；HTTP `200/202` 仅表示接口接收，不等于 Bing 已收录。
6. Admin MCP：`POST https://api.hk.apks.cc/mcp/admin`，JSON-RPC 2.0；连接信息和 key 见本机忽略文件 `SEO运维凭证.md`。

## 3. 当前 SEO 基线

### 3.1 运行快照

- 采集时间：`2026-08-23T04:53:51.455Z`（北京时间 `2026-08-23 12:53:51`）。
- 采集命令：`node scripts/seo-ops-baseline.mjs`。
- 报告文件：`logs/seo-baseline-20260823.json`。
- 抓取 UA：`Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)`。
- 当前工作区的 hosts 覆盖使后三个公网域名在本次 Node 请求中 `fetch failed`；此前 Chrome/CDP 公网验证已确认四站首页均 `200`、初始 head 有 title/description/canonical、单 H1、服务端正文和 JSON-LD。下次基线必须先记录并清除本机 hosts 覆盖，验证后恢复。

### 3.2 PUBG 现状（本次可重复实测）

- 首页：`200`；title、description、canonical 均位于初始 `<head>`；单 H1；正文约 `161,697` 字符；18 张图片均有 alt；44 个链接。
- JSON-LD：`WebSite`、`SoftwareApplication`、`FAQPage`、`ItemList`。
- `robots.txt`：`200`，包含 sitemap；`sitemap.xml`：`200`，16 个 URL，URL 均为 HTTPS，最新 `lastmod` 为 `2026-08-13T00:00:00.000Z`。
- IndexNow key 文件：`200`，与当前 key 匹配。
- 站点 SEO：标题为“地铁逃生手游官网 | PUBG Mobile国际服下载与更新攻略”；关键词覆盖下载、国际服、地铁逃生、更新、安装、常见问题；配置 API 与运行时首页字段一致。
- 话题快照：`PUBG MOBILE：绝地求生M`，帖子 `213`，热度 `2159`，最后发帖 `2026-08-13`。这些是动态指标，不作为长期 KPI。

### 3.3 其他站点配置快照

| 站点 | 后台主题帖子 | 热度 | 最近发帖 | 本次公网 Node 快照 |
|---|---:|---:|---|---|
| Pokémon Champions | 39 | 407 | 2026-08-05 | 受本机 hosts 覆盖，待复核 |
| Brown Dust 2 | 1644 | 16474 | 2026-08-23 | 受本机 hosts 覆盖，待复核 |
| Limbus Company | 4 | 60 | 2026-08-12 | 受本机 hosts 覆盖，待复核 |

## 4. Bing 事件基线与判断

- 已验证根属性：`https://apks.cc/`，状态为已验证；配额快照：每日 `1000`，月度 `9000`。
- 历史序列中 `2026-07-26` 约 `662 clicks / 6,278 impressions`，`2026-07-27` 约 `190 / 1,641`，`2026-07-28` 约 `35 / 449`。
- 首页 SSR、缓存边界、内部链接和 crawler metadata 修复发生在 `2026-08-12` 之后，时间不支持直接把 7 月 27 日下跌归因于“服务端请求数据渲染”。必须继续对齐：发布记录 -> Nginx/Cloudflare -> Bing 抓取 -> URL/查询词 -> canonical/索引。
- SERP 当日样本曾观察到：`PUBG MOBILE APK 下载` 的结果包含 APKPure、3DM、Softonic 等；`PUBG Mobile 国际服下载` 包含 TapTap、PUBG 官方站、Gamedog、3DM 等。只作为有日期的竞品样本，不填未验证的搜索量/难度。

### 4.1 2026-08-23 提交与收录复核

- 通过公网 DNS 读取四站 sitemap 后，IndexNow 于 `2026-08-23 14:26:24`（北京时间）提交共 `37` 条 canonical URL：PUBG `16`、Pokémon `7`、Brown Dust 2 `8`、Limbus `6`；四站均返回 HTTP `200`。这只证明 IndexNow 接收通知，不证明已抓取或已收录。
- Bing Webmaster `GetCrawlStats` 根属性最新数据为 `2026-08-22`：`InIndex=5,798`、当日 `CrawledPages=683`、累计 `Code2xx=6,695`、累计 `Code5xx=72`、当日 `CrawlErrors=15`。`2026-07-26` 对应为 `InIndex=4,891`、`CrawledPages=325`、累计 `Code2xx=5,480`、累计 `Code5xx=66`、当日 `CrawlErrors=10`。根属性收录数量增加约 `18.5%`，没有出现 7/26 后的收录总量坍塌。
- 展现/点击明显没有恢复到 7/26 前水平：`2026-07-20..26` 日均约 `556.7 clicks / 6,823.1 impressions`；`2026-07-27..08-02` 日均约 `52.7 / 546.6`；`2026-08-14..21` 日均约 `26.9 / 238.8`。API 最新日 `2026-08-21` 为 `50 clicks / 285 impressions`。
- 当前 API 属性只有 `https://apks.cc/`；对四个子域分别调用 `GetCrawlStats`、`GetRankAndTrafficStats` 返回空数组，因此不能把 `5,798` 拆成 PUBG 单站收录量，也不能从该 API 证明某个子域已恢复。
- Bing `site:` 查询的本次 HTTP 结果返回与目标域无关的泛化结果，未作为收录数量证据；可靠证据以 Bing Webmaster、服务器日志和 URL 级检查为准。

### 4.2 能否回到 7/26 前效果

当前结论：**不能通过简单回退“7/26 前代码版本”证明或保证恢复**。仓库在 `2026-07-01..08-01` 没有 Git 提交；本段历史判断采集时生产版本为 `09c448e`，本轮已部署到 `2399bbc`，随后同步运维文档至 `c0a9098`。同时 Bing 根属性 `InIndex` 在上涨，下降发生在展现/点击层。更合理的目标是恢复目标查询的展现和点击，而不是回退页面代码。

待验证假设（未定论）：根域属性归并/查询分布变化、Bing SERP 或需求变化、页面 canonical/内容质量重新评估、7 月窗口的生产配置或外部变更。下一步需要 Bing URL/查询维度和 7/20..8/02 的 Cloudflare/Nginx 原始日志；当前 7 月日志已轮转，不能从现有服务器日志补齐。

## 5. Admin MCP 能力快照

已通过 `initialize` 和 `tools/list` 验证服务端：`interface-admin-mcp 1.0.0`，协议 `2024-11-05`。

- 只读：`site.list`、`site.get_config`、`site.get_landing_preview`、`site.search_sources`、`community.search_posts`、`community.search_comments`、`topic.search`。
- 写入：`site.update_metadata`、`site.update_content`、`site.update_status`；均支持 `mode=preview/execute`。
- 写入闸门：先读取当前配置 -> `preview` -> 展示 before/after、风险和 `confirm_token` -> 等待用户明确确认 -> 使用同一 patch、token 和唯一 `idempotency_key` 执行 -> 重新读取并用 landing preview 验证。
- 当前已完成：站点列表、PUBG 配置、PUBG landing preview、PUBG 话题和已发布帖子只读查询。
- 当前未完成：没有创建草稿、发布帖子或修改 SEO 配置；未获得用户针对具体 patch 的 execute 确认前不得写入。

## 6. 运维变更日志

| 时间（北京时间） | 动作 | 结果 | 证据/提交 |
|---|---|---|---|
| 2026-08-23 12:53 | 四站 SEO 基线脚本 + Bing Webmaster 查询 | PUBG 本次 HTTP 可达；后三站受本机 hosts 覆盖；Bing API 可用 | `logs/seo-baseline-20260823.json` |
| 2026-08-23 13:00 | 访问共享笔记并解析 APKSCC Admin MCP 说明 | EdgeEver 分享页/API `200`；获得 MCP endpoint、工具范围和 preview 闸门 | 共享笔记 token 见用户提供链接 |
| 2026-08-23 13:05 | MCP `initialize`、`tools/list`、站点/配置/话题/帖子查询 | 只读成功；四个非 `main` 站点可管理；没有写操作 | `interface-admin-mcp 1.0.0` |
| 2026-08-23 13:10 | Chrome/CDP 打开共享笔记 | 失败：DevTools MCP `Transport closed`；未将失败误报为 Chrome 验证成功 | 待 Chrome MCP 恢复后补验 |
| 2026-08-23 13:15 | 建立本运维账本与凭证隔离规则 | 本地凭证明文保存，公开 GitHub 只提交账本/SOP，不提交 key | `5a86eac` |
| 2026-08-23 13:20 | 凭证暴露检查与运行时闸门 | 发现 Bing/IndexNow key 在历史提交；移除基线脚本默认 key，缺少 `INDEXNOW_KEY` 时不再请求 key 文件 | `git log -S`、`scripts/seo-ops-baseline.mjs`、`5a86eac` |
| 2026-08-23 13:25 | Admin MCP 发帖能力搜索 | `tools/list` 未发现社区发帖/文章创建工具；`ops.capability_search` 仅返回只读检索和通用高风险工作流，未执行写入 | MCP 请求 `capability-post-1..5` |
| 2026-08-23 13:35 | 本阶段提交与远端同步 | 文档、SOP、基线脱敏改动已推送；未部署生产、未执行 MCP 写操作 | `5a86eac`，`origin/main` 同步 |
| 2026-08-23 14:26 | 四站 IndexNow 提交 | 37 条 sitemap canonical URL，四站均 HTTP 200；本机 hosts 临时移除后已恢复 | `logs/indexnow-submit-20260823.json` |
| 2026-08-23 14:27 | Bing 收录/展现复核与生产只读检查 | 根属性 InIndex 4,891 -> 5,798；展现/点击未恢复；当时生产 `09c448e`、PM2 online、8/22 Bingbot 请求 200 | `logs/bing-indexing-check-20260823.json` |

## 7. 每次运维后追加模板

```text
时间（北京时间）：YYYY-MM-DD HH:mm
范围：站点 / URL / 查询词 / 文章
动作：审计、配置 preview、配置 execute、发帖、部署、IndexNow、回滚
事实证据：API 响应、HTTP 状态、渲染结果、日志路径、Bing 原始响应
结果：已实现 / 已部署可观测 / 已被 Bing 处理 / 结果已观察
变更：commit、生产版本、PM2/Nginx 状态
下一步：观察窗口、指标、停止规则、回滚边界
```

## 8. 当前待办与阻塞

1. 恢复 Chrome DevTools MCP 传输后，重新完成共享笔记与四站公网 CDP 验证。
2. 清除/记录本机 hosts 覆盖，重新生成四站完整基线。
3. 对 PUBG 先做关键词-页面映射和事实核验，再设计一篇人工审核草稿；不批量伪原创、不把 IndexNow 接收当收录。
4. 若执行 Admin MCP 写入，必须先提交具体 preview patch 给用户确认；执行后更新本文件并提交 Git。

## 9. 2026-08-23 15:28 本轮竞品、文章关键词与 MCP 预览

### 事实证据

- 竞品 HTTP 复核：TapTap `https://www.taptap.cn/app/83084` 的 Title 为 `PUBG MOBILE国际服 - TapTap`，描述包含最新版/官方正版下载，检测到 4 个 JSON-LD；游戏狗 `https://www.gamedog.cn/android/4000061.html` 的 Title 覆盖 `pubg国际服手游下载`、官方正版、安装和 `v4.5.0`，keywords 为 `pubg国际服,pubg国际服手游下载,pubg国际服官方正版`，H1 为 `pubg国际服`。
- 文章详情复核：`/articles/6a7f3cbd837db46b93680eb5` HTTP 200，Title 为 `【手游资讯】4.6版本测试服3上线 - PUBG MOBILE`；当前线上 keywords 仍为站点全局列表，未随文章标题/正文变化。
- Admin MCP 只读重试：`site.list` 返回 `pubgm`、`manageable: true`；`site.get_config` 显示当前专题标题/描述以下载、4.6、登录闪退为主，专题预览 SEO 健康度 `100`，文章聚合 `12` 条。当前配置/文章快照未提供可验证的 4.7 文章。
- Chrome DevTools MCP 仍返回 `Transport closed`；本轮 Chrome 渲染证据未完成，竞品与线上页面使用 HTTP 初始 HTML 复核，已在交接手册注明边界。

### 实现与预览

- 本地代码已加入文章级 `keywords` 字段、后台 `keywords/seo_keywords/seoKeywords/tags` 归一化、下载/登录故障/地铁逃生/真实版本号的受控派生，并将文章关键词写入详情页 Metadata 和 Article JSON-LD。
- 关键词策略将用户输入的 `login eer报错` 规范为可验证的 `login error 报错`，同时覆盖 `PUBGM无法登录`、`无法登录PUBGM`、`PUBGM login error`、`PUBGM登录报错`。只有正文真实出现版本号时才生成 `地铁逃生<version>版本`，未把无事实依据的 `地铁逃生4.7版本` 注入首页。
- Admin MCP `site.update_metadata` 已生成 `pubgm` 的 `mode=preview`，风险 `medium`，预览内容为下载、APK、无法登录、login error、登录报错和版本更新意图；未执行、未部署，等待用户明确确认。临时 confirm token 不写入仓库。
- 交接文档新增：`SEO工具链与站点交接手册.md`，包含四站目录、数据/API、竞品观察、关键词映射、Bing/IndexNow、Chrome/CDP、MCP 闸门和部署验证。

### 验证与下一步

- 已通过本地 `.\\node_modules\\.bin\\tsc.cmd --noEmit -p tsconfig.typecheck.json`、三个 SEO 脚本 `node --check` 和 `git diff --check`。
- 下一步：用户确认后重新生成 preview 并立即 execute，重新读取配置和 landing preview；代码提交后再按香港生产边界部署、检查代表文章初始 head，并提交实际变更 URL 到 IndexNow。
- 4.7 关键词的前置条件：先提供或发布真实 4.7 版本文章；当前 Admin MCP 工具列表没有社区发帖/文章创建能力，不能凭空发帖或伪造版本事实。

## 10. 2026-08-23 15:50 文章级关键词部署与 IndexNow

- GitHub：`2399bbc feat(seo): add article keyword metadata` 已推送 `origin/main`。
- 香港生产：`hk.apk` / `154.36.164.55` 的 `/root/home/apks-sites` 快进到 `2399bbc`；`pnpm install --frozen-lockfile`、`pnpm build` 成功；PM2 `pubgm-app` 重载后 online，生产本地首页和 robots 为 200。
- 公网 Bingbot 样本：`https://pubgm.apks.cc/`、`/robots.txt`、`/sitemap.xml`、代表文章均 200；代表文章初始 head 已有文章级 keywords（含 `PUBG Mobile 4.6版本`、`地铁逃生4.6版本`）、description、self-canonical，JSON-LD 脚本 2 个。
- IndexNow：提交 `pubgm.apks.cc` sitemap 的 16 条 URL，接口 HTTP 200；证据 `logs/indexnow-submit-20260823-article-keywords.json`。这表示接口接收，不代表 Bing 已抓取或收录。
- 结果状态：代码已实现；已部署可观测；已被 Bing 接收通知；收录、查询、展现和点击尚未观察。
- MCP `site.update_metadata` 仍只完成 preview，未 execute；等待用户明确确认后再执行并重新读取配置/专题预览。

## 11. 2026-08-23 16:25 Bing Recommendations 复核与详情页 description 修复

### 复核事实

- Bing Recommendations 报告中的 51 个问题不能直接当作当前线上事实：Bing 明细 API 方法 `GetRecommendations`、`GetRecommendationsSummary`、`GetSiteScanRecommendations` 均返回 `404`，无法取得对应 URL 清单。
- 使用 Bingbot UA，并通过 `curl --resolve` 绕过美国工作区 hosts 覆盖，对四站当前 sitemap 全部 URL 逐页复核：页面均为 `200`，均有 self-canonical，均有 description，且每页检测到恰好 1 个 `<h1>`；未发现重要页面的 `noindex`/`nofollow`。
- 复核前仍可确认的短 description 主要来自后台文章摘要过短，以及四个首页远程 SEO 配置（首页当前约 75-101 字符）。首页配置属于 Admin MCP 写入范围，本轮没有绕过 preview/确认闸门修改。

### 实施与验证

- 修改 `src/lib/site-config.ts` 的 `getArticleSeoDescription`：当后台 summary 过短时，将去 Markdown 的正文前段拼接后再截取约 158 字符；不改变事实内容、关键词、robots、canonical、sitemap 或 H1 结构。
- 本地 `npm run typecheck`、`npm run build`、`git diff --check` 通过。
- GitHub 提交：`00054cc fix(seo): extend short article descriptions`。
- 香港生产 `/root/home/apks-sites` 已快进到 `00054cc`；`pnpm install --frozen-lockfile`、`pnpm build` 通过；PM2 `pubgm-app` reload 后 `online`。
- Bingbot 公网复核：Brown Dust 2、Limbus Company 两个此前 49-96 字符的详情页，以及 PUBG 代表文章，description 已为 157-158 字符；canonical 正确且每页 1 个 H1。

### 结论与未决项

- 已修复：详情页由短 summary 导致的 description 过短问题（代码级、已部署可观测）。
- 未修改：Bing 报告中 9 个多 H1、1 个重要页面 robots、2 个 IndexNow、2 个 sitemap 缺失；当前线上逐页证据不复现，不能瞎改。
- 未决：四站首页 description 仍由后台配置提供且偏短。若要修改，下一步必须提交具体 `site.update_metadata` preview，展示 before/after 后由用户明确确认 execute；不能以代码 fallback 代替远程配置。
- 观测边界：部署/IndexNow 接收不等于 Bing 已重新抓取、收录或流量恢复；继续观察 7-14 天的 URL、查询、展现、点击与抓取日志。
- Chrome DevTools MCP 本轮再次返回 `Transport closed`，未将 HTTP 初始 HTML 结果冒充为 Chrome 渲染证据；待 CDP 传输恢复后补做 rendered DOM/Lighthouse 复核。

## 12. 2026-08-23 16:45 四站首页 description 配置 preview

### 当前事实

- Admin MCP 已恢复：`site.list` 返回 `pubgm`、`pokemonchampions`、`browndust2`、`limbuscompany`，四站均 `manageable: true`。
- 四次 `site.update_metadata` 均为 `mode=preview`，均返回 `risk_level=medium`、确认有效期 600000ms；未执行写入。
- 每个 patch 只包含 `seo.description`，title suffix、keywords、app_seo 和其他配置保持不变。

### Preview 方案

| 站点 | 当前 description 长度 | 预览 description 长度 | 主要覆盖意图 |
|---|---:|---:|---|
| `pubgm` | 约 85 | 123 | 国际服 APK、安卓/iOS、版本、登录/安装、地铁逃生 |
| `pokemonchampions` | 约 101 | 143 | 安卓 APK、Switch/iOS/Android、赛季、维护、对战 |
| `browndust2` | 约 75 | 121 | Brown Dust 2 APK、安装、维护、活动、角色、故障 |
| `limbuscompany` | 约 87 | 128 | 安卓 APK、更新、登录网络、汉化、入坑、人格/E.G.O |

新描述均基于当前后台配置和已发布专题内容，没有加入未验证版本号或虚构功能。临时 `confirm_token` 未写入仓库、日志或交接文档；需用户明确确认后，使用相同 patch 执行，并立即复读配置、landing preview、四站公网 head 和 IndexNow 变更 URL。

## 13. 2026-08-23 17:25 四站首页 description 执行、缓存刷新与 IndexNow

### 执行结果

- 用户确认执行四站首页 description；原先只写入顶层 `seo.description` 的结果已复核为配置源已更新，但专题页仍由 `landing.seo.description` 覆盖。
- 已定位读取链路：Admin MCP `site.get_config`、`site.get_landing_preview` 和 `GET /site/landing-config?key=<siteKey>` 均读取 Interface 的同一 Mongo 站点配置；Next.js 的 `src/lib/site-config.ts` 使用 `fetch(..., { next: { revalidate: 60 } })`，其 fetch cache 会跨 PM2 reload 保留。
- 通过 Admin MCP 对四站执行 `site.update_content`，每站 patch 仅为 `landing.seo.description`，均经过新的 preview -> execute 闸门，风险 `medium`，返回 `updated_sections=["landing"]`。四站长度：PUBG `85 -> 123`、Pokémon `101 -> 143`、Brown Dust 2 `75 -> 121`、Limbus `87 -> 128`。
- 生产仅清理 `/root/home/apks-sites/.next/cache/fetch-cache`，随后只重载 PM2 `pubgm-app`；未重启 Interface、9527、Nginx 或其他服务。

### 三层验证

- Interface `http://127.0.0.1:9527/site/landing-config`：四站均返回新 `landing.seo.description`，HTTP `200`。
- Next.js 3000 按四个 Host 请求：四站初始 HTML 均返回新 description。
- 四站公网 Bingbot UA 请求：均 HTTP `200`；description 长度分别为 `123/143/121/128`，每页 `canonical=1`、`h1=1`。
- Chrome DevTools MCP 本轮仍返回 `Transport closed`，公网结果是 HTTP 初始 HTML 证据，不冒充 Chrome 渲染证据。

### IndexNow

- 已提交四个首页 canonical：`https://pubgm.apks.cc/`、`https://pokemonchampions.apks.cc/`、`https://browndust2.apks.cc/`、`https://limbuscompany.apks.cc/`。
- 四站均返回 HTTP `200`，证据：`logs/indexnow-submit-20260823-home-description.json`。这只表示 IndexNow 接收通知，不表示 Bing 已抓取、收录、排名或流量恢复。

### 可复用工具与后续边界

- 新增 `scripts/site-landing-seo-sync.mjs`：默认只生成四站 `landing.seo.description` preview，显式传 `--execute` 才执行；脚本不输出或保存凭证、confirm token。
- 以后修改首页描述必须同时核对顶层 `seo.description` 与 `landing.seo.description`，并在执行后清理 Next fetch cache 或等待其 TTL 后验证公网 head；不能只以 `site.get_config` 成功作为生效证据。
- 结果状态：MCP 配置已执行、生产已部署可观测、IndexNow 已接收；Bing 抓取/收录/查询/展现/点击尚未观察，继续观察至少 `7-14` 天。

## 14. 2026-08-26 生产异常复核与低风险 SEO 实施

### 事实证据

- 香港生产复核：`pubgm-app`、`interface-api`、`interface-schedule` 均 online；3000、9527、80、443 正常监听；Nginx `-t` 通过；根盘可用约 `3.7GB`。本轮未清理缓存、日志或其他项目。
- 四站公网首页和四个代表包名的 `/seo/game-page` 当前均 HTTP `200`；代表包名响应约 `0.6-1.1s`。
- `/seo/game-page` 的约 `3906` 次 `500` 集中在 `2026-08-25 20:42`，来源 `120.85.35.143`，User-Agent 为 `node`，查询为批量包名审计；不是四站 Bingbot 页面请求。本轮不修改 Interface/Mongo。
- Bingbot 对已不存在的旧文章 URL 继续收到真实 `404 + noindex`；未做首页重定向。
- Bing 最新可用性能数据仍未恢复至 `2026-07-26` 前量级；该结论不支持通过回退代码保证恢复。

### 实施与验证

- `src/lib/community-api.ts`：社区评论/话题读取增加默认 `2500ms` AbortController 超时，失败继续降级为空数据，不阻塞文章正文、metadata、canonical、JSON-LD。
- `scripts/seo-ops-baseline.mjs`：新增显式 `SEO_DEEP=1` 深度模式，逐条检查 sitemap URL 的状态码、耗时、description、canonical、robots、H1、初始 head metadata 和 JSON-LD。
- 深度巡检报告 `logs/seo-deep-20260826.json`：四站共 `37` 个 URL，全部 `200`；无 canonical、H1 或短 description 异常。
- `node --check scripts/seo-ops-baseline.mjs`、typecheck、`git diff --check` 和代表文章 `seo-audit` 通过。`pnpm build` 被本机 pnpm 依赖构建脚本审批策略拦截；直接 `next build --no-lint` 已完成编译、类型检查、静态页生成和 trace 收集。

### MCP preview

- 重新读取 `pubgm` 配置后生成 `site.update_metadata` preview，仅追加：`PUBGM无法登录`、`无法登录PUBGM`、`PUBGM login error`、`PUBGM登录报错`、`login error 报错`。
- title suffix 和 description 未改变；风险 `medium`；尚未 execute、部署或提交 IndexNow，等待用户对该具体 preview 明确确认。

### 当前状态与下一步

- 代码改动已实现但尚未提交/部署；MCP 配置为 preview；Bing/IndexNow 未产生本轮写入。
- 生产空间低于 5GB，本轮停止在部署前，不清理缓存；若要部署需先取得针对 `/root/home/apks-sites/.next/cache` 的单独授权。
- MCP execute 后才执行生产部署和实际变更 URL 的 IndexNow，并继续观察 7-14 天抓取、查询、展现、点击与 5xx。

## 15. 2026-08-27 生产 PM2 启动故障恢复

### 故障证据

- 四站公网首页返回 `502`；本机 `127.0.0.1:3000` 连接被拒绝。
- `pubgm-app` 虽显示 online，但约 5 分钟内重启 `18` 次，进程树实际卡在 `pnpm.mjs install`，Next.js 未监听 3000。
- 生产根盘可用空间由约 `2.8GB` 降至 `2.4GB`，继续安装存在耗尽风险。
- 停止前日志包含大量 npm registry 超时，以及 `[site-config] unmapped host: 154.36.164.55`；后者属于 IP 主机探测/请求异常，非本次 3000 未启动的直接原因。

### 恢复动作（已获用户确认）

- 停止并删除异常的 PM2 `pubgm-app` 实例，终止其依赖安装链路；未清理项目缓存、日志或其他 PM2 项目。
- 使用已有 `.next` 产物和缓存中的 `swc-linux-x64-gnu-15.5.7.tgz` 补齐 Next SWC 运行包，删除未完成的 musl 临时下载文件。
- 以 `node_modules/next/dist/bin/next start -p 3000` 直接托管为 PM2 `pubgm-app`，并执行 `pm2 save`。

### 恢复验证

- PM2 `pubgm-app`：`online`，版本 `15.5.7`，重启次数 `0`；3000 正常监听。
- Nginx `-t`：通过；9527 Interface 保持 online。
- 四站首页：`pubgm`、`pokemonchampions`、`browndust2`、`limbuscompany` 均 HTTP `200`，响应约 `2.4-2.9s`。
- 当前生产运行方式已从 `pnpm start` 调整为直接 Next 启动，避免再次触发异常的安装链路。后续正式部署需在 PM2 ecosystem 中固化该启动命令，避免 `pm2 resurrect` 恢复旧配置。

## 16. 2026-08-27 四站 SEO 基线与 Bing 文档边界复核

### 本轮范围

- 工作模式：`site inventory + template sample`，目标是建立四站持续 SEO SOP；本轮不改代码、不改 MCP 配置、不发帖、不提交 IndexNow。
- 参考依据：Bing 官方 Sitemap/抓取控制文档、IndexNow 官方协议文档及 Bing Webmaster API 实际响应；IndexNow 接收不等于抓取或收录。
- 证据文件：`logs/seo-deep-20260827.json`、`logs/seo-baseline-20260827.json`。

### 当前事实

- 四站 sitemap 共 `37` 个 URL：PUBGM `16`、Pokémon `7`、Brown Dust 2 `8`、Limbus Company `6`；深度巡检全部 HTTP `200`。
- 四站首页和文章页初始 head 均有 title、description、self-canonical；每页恰好 `1` 个 H1；JSON-LD 分别检测到首页 `WebSite/SoftwareApplication/FAQPage/ItemList`、文章 `Article/BreadcrumbList`。
- 四站文章未发现 robots noindex、canonical 漂移或 4xx/5xx；PUBGM 仍有 3 篇旧文章 description 约 `101-112` 字符，属于内容时效/意图覆盖不足，不是抓取阻断。
- Bing Webmaster API 根属性 `https://apks.cc/` 可验证，当前返回约 `382` 条 rank/traffic 行、`2076` 条 query 行；配额返回 daily `1000`、monthly `5000`。这些是 API 报告行，不等同于已收录 URL 数。
- IndexNow 本轮未提交；本地脚本未注入 `INDEXNOW_KEY`，报告中的 key 状态为未启用。
- `qiaomu-seo` 知识校验脚本无法运行，因为该技能包的 `data/seo-source-registry.json` 不在当前安装路径；不把校验失败误报为站点问题。Bing Webmaster API 一个旧帮助链接返回 `404`，因此只采用实际 API 响应和仍可访问的官方文档，不引用失效页面的具体规则。

### 第一性原理判断

- 当前主要瓶颈不是继续增加 meta keywords，而是：可验证的 Bing 查询/落地页映射、文章级关键词与问题答案覆盖、更新时间与 sitemap/IndexNow 联动、以及生产启动和 SSR 稳定性。
- 不应为每个关键词生成一个页面；相近意图应合并到同一可解决问题的文章，版本号和故障词必须有正文事实支撑。

### 后续循环 SOP（建议）

1. 每日：采集四站状态码、响应耗时、robots、sitemap、canonical、H1、metadata、5xx 和生产磁盘；异常先分“可抓取/可渲染/可索引/已收录”阶段。
2. 每周：调用 Bing `GetUserSites`、`GetQueryStats`、`GetRankAndTrafficStats`、配额接口，按根域与子域、日期、query/page 维度保存快照；不把 API 接收写成收录。
3. 内容变更后：先核对后台专题/文章事实和话题 ID，再做 MCP `preview -> 明确确认 -> execute`；只对实际变更 canonical URL 做 IndexNow，随后验证公网初始 head。
4. 每两周：用 Bing 查询/落地页与 sitemap 交叉表挑选页面，做一个可回滚的小实验，观察至少 `7-14` 天；判断指标为抓取成功率、索引覆盖、query 展现/点击和合格访问，不以单次排名判断。

### 优先级

- P0：把直接 `next start` 的 PM2 启动方式固化到生产 ecosystem，避免 `pnpm start` 再次触发安装；补充运行时 3000/9527/Nginx 监控。
- P1：建立 Bing query -> 现有 URL 映射；优先补齐 PUBGM 登录故障、下载/安装、真实版本公告三类内容，并让文章级 keywords/title/description 与正文一致。
- P1：修复 3 篇 PUBGM 旧文章的事实型摘要（不是机械填充长度），更新 sitemap `lastmod` 后走 IndexNow。
- P2：通过 Admin MCP 只读核对四站 `data_source.topic_id` 与话题状态；若无发帖工具，不自动生成营销软文。

## 18. 2026-08-27 Bing 页面级 query 映射

### 实施

- 新增只读脚本 `scripts/bing-opportunity-report.mjs`，命令 `pnpm seo:bing-opportunities`。
- 脚本读取四站 sitemap（当前 `37` 个 URL），调用 Bing `GetPageStats`、`GetQueryStats` 和带 `page` 参数的 `GetPageQueryStats`，按 Bing 最新返回日期滚动 `28` 天聚合。
- 输出当前 sitemap 页面、历史但不在当前 sitemap 的 URL、query 意图簇和页面级 query 明细；不执行 MCP 写入、内容发布或 IndexNow 提交。
- 本轮生成 `logs/bing-opportunities-20260827.json`；`node --check`、`git diff --check` 通过；37/37 个页面级 API 请求成功。

### 关键发现

- API 数据窗口结束于 `2026-08-21`，不是本地运行日；近 28 天 query 聚合不能表述为实时排名。
- 当前 sitemap 页面中，只有 Brown Dust 2 首页出现约 `50` 次展现、`4` 次点击；其余当前 URL 在该窗口暂无页面级展现记录。
- 历史高信号 URL 为 `https://hub.apks.cc/PUBG%20MOBILE/com.tencent.ig`，约 `20,572` 次展现、`1,913` 次点击；该 URL 仍返回 `200`，但不属于四站当前 sitemap。
- PUBGM 当前 sitemap 之外的历史文章 URL（例如 `pubgm-login-solution-sim-card`、`pubgm-metro-royale-accelerator-recommendation`）公网返回 `404`，不应直接据 Bing 历史数据做首页重定向；需逐 URL 判断是否有等价的新页面。
- 近 28 天 query 主题以 `pubg`、`pubg官网`、`pubg mobile`、`pubg国际服下载`、`pubgm`、`pubg下载` 为主；登录故障簇只有 `1` 次展现，不能据此宣称已验证需求规模。

### 判断与下一步

- 当前最重要的 SEO 任务是把历史高信号实体/下载意图迁移到现有四站可索引页面，并通过真实内容和内部链接承接；这属于 URL/内容迁移实验，需要先做旧 URL 对等性清单，不能批量重定向。
- 近期实验建议：选择一个有真实资料支撑的 PUBGM 下载或登录排查页面，保留现有 URL，完善 title/H1/正文问题答案/内部链接，完成部署后只提交该 URL 到 IndexNow，观察 `7-14` 天抓取与 query 变化。
- 页面级 API 已可用，后续每周应保留该报告，比较“当前 sitemap 页面”和“历史 URL”两组，而不是只看根属性总量。

## 19. 2026-08-27 旧高信号 URL 对等性初筛

- 新增 `SEO旧URL对等性清单.md`，记录 Bing 高信号旧 hub 页面与当前 PUBGM 首页的逐 URL 对比、证据和迁移边界。
- `https://hub.apks.cc/PUBG%20MOBILE/com.tencent.ig` 近 28 天约 `20,572` 展现、`1,913` 点击，旧页面仍 `200`，title/description/下载与文章导航完整；当前 `pubgm.apks.cc/` 仅判定为“部分等价”。
- 旧 hub 下的文章 URL、`apks.cc/app/*` 和社区帖子 URL 不得批量重定向到 PUBGM 首页；必须逐 URL 核验实体和用户任务。
- 本轮不改 Nginx、不做 301、不删除旧 URL、不提交 IndexNow；下一步是增强当前 PUBGM 首页的实体/包名/下载更新导航后开展单页实验。

## 20. 2026-08-27 爬虫初始响应对照：旧 hub 与 PUBGM

### 结果

- 对 `https://hub.apks.cc/PUBG%20MOBILE/com.tencent.ig` 与 `https://pubgm.apks.cc/` 使用 Bingbot 兼容 UA 对照抓取；两页均 HTTP `200`，HTML 有完整 `</html>`、单 H1，正文和文章链接位于初始响应，不是空壳页面。
- 旧 hub 响应约 `970KB`，包含 PUBGM 文章导航和下载入口，但未检测到 JSON-LD。
- 当前 PUBGM 初始 HTML 包含文章、下载、地铁逃生、登录相关内容，并检测到 `WebSite/SoftwareApplication/FAQPage/ItemList` JSON-LD。
- 因此暂无证据支持“服务端响应没返回数据导致 Bing 没爬到正文”。

### 响应稳定性

- 旧 hub 多次请求约 `2.2-3.0s`，TTFB 约 `1.1-1.5s`。
- 当前 PUBGM 多次请求通常约 `2.1-3.0s`，但出现一次总耗时约 `18.0s`；仍返回 `200`，说明存在 SSR 响应长尾。
- 长尾可能降低 Bing 抓取效率，但当前样本不足以证明已发生抓取超时或内容丢失。

### 后续验证

- 在生产日志按 Bingbot/URL 统计 P50/P95/P99、超时和 5xx，并分别测量 `landing-config` 与社区话题/评论请求耗时。
- 在取得长尾证据前，不做首页重构或大范围缓存调整；保持正文、title、description、canonical、JSON-LD 在初始响应可用。

## 17. 2026-08-27 PM2 配置固化与 Bing 查询机会初筛

### PM2 配置

- 修正仓库 `ecosystem.config.js`：默认路径改为 `/root/home/apks-sites`，应用名为 `pubgm-app`，直接执行 `node_modules/next/dist/bin/next start -p 3000`，单实例 fork；路径可通过 `APKS_SITES_PATH` 覆盖。
- 本地 `require('./ecosystem.config.js')` 与 `git diff --check` 通过。
- 本轮只修改仓库配置，尚未用 ecosystem 在香港执行 reload；生产仍保持已验证的直接 Next 进程。

### Bing 查询初筛

- 根属性 API 查询数据范围：最早 `2025-08-15`，最新 `2026-08-21`；不是实时排名快照。
- 聚合后高信号主题包括：`pubg mobile`、`pubg`、`pubg官网`、`pubg国际服下载`、`pubgm`、`pubg mobile官网下载`、`pubg地铁逃生`、`pubgm下载`。
- 这些是历史展现/点击信号，不代表当前四站各页面已经收录；下一步必须补齐 query 与 landing page 维度映射，再选择单篇内容实验。

### 巡检更正

- 深度报告中 description 低于首页 `123` 字符基准的实际页面为：PUBGM 两篇旧文章（`112/101` 字符）和 Brown Dust 2 首页（`121` 字符）。此前记录将其概括为“三篇 PUBGM 旧文章”不准确；后续以 `logs/seo-deep-20260827.json` 为准。

## 21. 2026-08-27 SSR 配置请求超时保护

- 生产 Nginx 错误日志显示 502 集中发生于 18:06-18:13 的 3000 未监听窗口；恢复后 Bingbot 首页请求为 `200`。
- `pubgm.apks.cc` 初始 HTML 数据完整，但存在约 `18s` 的单次响应长尾；社区接口已有 2500ms 超时，站点配置请求此前没有超时上限。
- `src/lib/site-config.ts` 新增 `SITE_CONFIG_TIMEOUT_MS`（默认 `2500ms`）AbortController；超时/异常时保持原有本地回退逻辑，显式禁用回退时仍按原策略抛错。
- 未修改 Interface、Nginx、URL、robots、sitemap 或内容配置。
- 本地 `tsc --noEmit -p tsconfig.typecheck.json`、`next build --no-lint`、`git diff --check` 通过。
- 本轮未部署香港生产；需在磁盘空间和 PM2 状态确认后按发布流程部署。

## 22. 2026-08-28 香港生产部署 `602b04c`

### 部署

- 部署前香港根盘可用约 `8.1GB`（80%），满足安全线；生产原版本为 `ef1f989`。
- `/root/home/apks-sites` 快进到 `602b04c`，未执行 `pnpm install`；使用现有依赖运行 `node node_modules/next/dist/bin/next build --no-lint`，构建成功。
- 仅重启并保存 PM2 `pubgm-app`；未触碰 Interface/9527、Mongo、Nginx 配置或其他 PM2 项目。

### 生产验证

- PM2 `pubgm-app`：`online`，直接 Next `start -p 3000`，无不稳定重启；3000、9527 正常监听。
- Nginx `-t` 通过；根盘仍约 `8.1GB` 可用。
- 四站首页公网均 `200`：PUBGM 约 `0.90s`、Pokémon `0.36s`、Brown Dust 2 `0.26s`、Limbus `0.28s`。
- PUBGM `robots.txt`：`Allow: /`，明确允许 Bingbot，Sitemap 指向 `https://pubgm.apks.cc/sitemap.xml`。
- PUBGM sitemap：`16` 个 URL，全部 HTTPS；代表文章 `/articles/6a7f3cbd837db46b93680eb5` 为 `200`，初始 head 有 description、self-canonical、单 H1、JSON-LD。
- Bing 基线 API：根属性已验证，rank/traffic `383` 行、query `2076` 行，配额 daily `996`、monthly `3996`；本轮未提交 IndexNow。

### 状态边界

- 已实现、已部署并可观测；Bing 是否重新抓取、收录、排名和流量变化仍需至少 `7-14` 天观察，不能由本次部署或 API 返回推断。

## 23. 2026-08-30 Bing description 建议复核

### 审计范围与证据

- 针对 Bing Webmaster 后台“将 description 添加到页面 head”建议，使用 Bingbot 兼容 UA、香港源站直连、Chrome/CDP 渲染和 Bing Webmaster API 复核 `https://pubgm.apks.cc/`。
- 公网与 `127.0.0.1:3000 + Host: pubgm.apks.cc` 均返回 `200`；两侧初始 HTML 的 `<head>` 内都只有一个 `<meta name="description">`，文案一致，并同时具备 title、canonical 和单 H1。
- Chrome/CDP 渲染后仍只有一个 description、一个 canonical 和单 H1；正文约 `7102` 个可见字符，检测到 `WebSite`、`SoftwareApplication`、`FAQPage`、`ItemList` JSON-LD，未加载 `http:` 混合内容资源。
- 深度巡检 PUBGM sitemap 当前 `16/16` 个 URL：非 200、缺失 description、description 位于 head 外、缺失 title/canonical、H1 数量异常、`noindex` 均为 `0`。
- 首页 description 当前为 `123` 个字符；两篇旧文章为 `112/101` 个字符。长度本身不是通用排名门槛，本轮只确认它们不属于“缺失 description”。

### Bing 侧证据与结论

- Bing `GetUrlInfo` 显示首页最近抓取时间为 `2026-08-29T01:54:16Z`，记录文档大小约 `312895` 字节，与当前公网响应体量接近；`GetCrawlIssues` 当前返回 `0` 条。
- `GetPageStats` 中 PUBGM 首页数据最新只到 `2026-07-17`，明显落后于最近抓取时间；Bing 各报告模块的更新时间不同，不能用旧流量统计日期反推当前抓取页面缺少 metadata。
- Bing Webmaster 公共 API 的 WSDL 不提供 Recommendations 明细接口，无法从 API 取得该建议对应的具体扫描批次和 URL；后台提示可能来自旧扫描或故障窗口，属于合理推断，不表述为已确认事实。
- 当前代码与生产提交均由 `src/app/layout.tsx` 的 `generateMetadata()` 服务端输出 `config.seo.description`，没有证据支持再次添加 description 标签；重复添加反而会制造冲突信号。
- 本轮不改代码、不改后台 SEO 配置、不提交 IndexNow。待 Bing 后台重新扫描后复核该建议；若仍存在，必须先导出后台示例 URL 和扫描时间，再按具体页面定位。
