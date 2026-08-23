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
