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
