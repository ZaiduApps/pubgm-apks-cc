# Bing 高信号旧 URL 对等性清单

> 采集时间：2026-08-27（Asia/Shanghai）  
> 范围：Bing 页面级 API 近 28 天窗口（截至 2026-08-21）与公网页面复核。  
> 目的：在没有页面等价性证据前，禁止批量 301 到首页。

## 判定规则

- `等价`：目标页面能满足旧 URL 的主要实体、下载任务和信息预期，且 URL/内容/内部链接已准备好。
- `部分等价`：目标只覆盖旧页面的一部分意图，需要补充内容或明确导航后再评估。
- `不等价/待核验`：主题、数据源或用户任务不同；保持旧 URL 原状态，不能凭 SEO 数据直接重定向。

## 高信号 URL

| 旧 URL | Bing 展现 | Bing 点击 | 当前状态 | 候选目标 | 判定 | 处理建议 |
|---|---:|---:|---|---|---|---|
| `https://hub.apks.cc/PUBG%20MOBILE/com.tencent.ig` | 20,572 | 1,913 | `200` | `https://pubgm.apks.cc/` | 部分等价 | 先增强 PUBGM 首页的实体说明、下载入口、版本/更新导航和文章集群；暂不 301 |
| `https://hub.apks.cc/PUBG%20MOBILE/com.tencent.ig/articles/pubgm-1761061881415` | 41 | 32 | 待页面核验 | `https://pubgm.apks.cc/articles/<同 slug>` | 待核验 | 先确认新站是否存在同 slug 和正文等价；无等价页则保留旧 URL 或制定单独迁移方案 |
| `https://apks.cc/app/com.vng.pubgmobile` | 222 | 34 | `200` | 无 | 不等价/待核验 | 这是不同包名实体，不归入 PUBGM 国际服迁移 |
| `https://apks.cc/community/post/*` | 174 | 1（样本） | 需逐条核验 | 无 | 不等价/待核验 | 社区帖子不能批量重定向到游戏首页 |

## 页面证据

### 旧 hub 页面

- HTTP `200`，响应约 `827KB`。
- Title：`PUBG MOBILE - 官网 | 下载、更新、攻略 - 官方正版入口`。
- Description：包含最新游戏下载、更新日志、游戏攻略、玩家社区、安卓/iOS。
- 页面 H1：`PUBG MOBILE`。
- 页面包含 Google Play 下载入口和约 18 个 PUBGM 文章链接。
- 旧页面 URL 本身是 `/PUBG MOBILE/com.tencent.ig`，与 `pubgm.apks.cc` 的域名/路径架构不同；当前页面未取得“已完成迁移”的证据。

### 当前 PUBGM 首页

- HTTP `200`，初始 head 有 title、description、canonical、单 H1 和 JSON-LD。
- Title：`PUBG MOBILE - 地铁逃生手游官网 | PUBG Mobile国际服下载与更新攻略`。
- H1：`PUBG Mobile 国际服 / 地铁逃生 4.6 官网入口`。
- 已覆盖下载、安卓/iOS、版本更新、登录故障、地铁逃生等意图，但信息架构与旧 hub 不完全相同。

## 推荐实验（未执行）

1. 以当前 `pubgm.apks.cc/` 为处理页，补充可验证的“PUBG MOBILE 国际服/包名 com.tencent.ig/下载与更新”实体段落，并增加指向真实文章的内部链接。
2. 保留旧 hub URL 原状至少一个观测周期；不做首页 301，不批量生成 doorway 页面。
3. 部署后只对当前 PUBGM 首页提交 IndexNow，观察 `7-14` 天页面级抓取、query、展现和点击变化。
4. 只有当旧 URL 与新页面内容、用户任务和内部链接均达到等价，且确认迁移意图后，才评估单 URL 301；否则维持 `200` 或真实 `404`。

## 证据边界

- Bing 页面级 API 证明的是历史展现/点击报告，不证明当前收录状态。
- 旧 hub 页面没有在本项目 sitemap 中，不能仅凭“历史高流量”推断应迁移或删除。
- 候选目标和关键词是实验假设，非排名或流量保证。
