import fs from 'node:fs/promises';

const credentialText = await fs.readFile(new URL('../SEO运维凭证.md', import.meta.url), 'utf8');
const mcpUrl = credentialText.match(/^MCP_URL=(.+)$/m)?.[1]?.trim();
const mcpKey = credentialText.match(/^MCP_API_KEY=(.+)$/m)?.[1]?.trim();

if (!mcpUrl || !mcpKey) {
  throw new Error('缺少 Admin MCP 连接信息');
}

const descriptions = {
  pubgm:
    'PUBG Mobile（地铁逃生）中文入口，提供国际服 APK 下载、安卓与 iOS 官方和商店入口、版本更新公告、测试服资讯、登录闪退与安装故障排查、地铁逃生玩法攻略及常见问题；下载前可核对包名、版本和安装渠道，更新后按指南处理资源与登录异常。',
  pokemonchampions:
    '宝可梦冠军 Pokémon Champions 中文入口，提供安卓 APK 下载、Nintendo Switch、iOS 与 Android 对战资讯，整理级别对战赛季、对战证、月度挑战、维护通知、更新数据和新手常见问题；玩家可按平台查看活动时间、版本变化与对战内容，减少错过赛季公告。',
  browndust2:
    '棕色尘埃2 Brown Dust 2 中文入口，提供安卓 APK 下载、最新版安装说明、资源更新与维护公告、角色和活动资讯、攻略内容及常见问题；下载前可核对游戏版本和安装渠道，更新期间可查看维护状态、活动安排以及安装或资源校验失败的处理建议。',
  limbuscompany:
    '边狱巴士 Limbus Company 中文入口，提供国际服安卓 APK 下载、安装与版本更新说明、登录超时和网络问题排查、汉化与新手入坑教程、人格和 E.G.O 玩法资讯及常见问题；玩家可按更新状态检查资源、账号登录和设备空间，再规划前期队伍与培养路线。',
};

async function callMcp(id, name, args) {
  const response = await fetch(mcpUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'X-API-Key': mcpKey,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  });
  if (!response.ok) {
    throw new Error(`MCP HTTP ${response.status} (${name})`);
  }
  const payload = await response.json();
  if (payload.error) {
    throw new Error(`MCP ${name}: ${payload.error.message || 'unknown error'}`);
  }
  return payload.result?.structuredContent || payload.result;
}

const execute = process.argv.includes('--execute');
const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const results = [];

for (const [key, description] of Object.entries(descriptions)) {
  const patch = { landing: { seo: { description } } };
  const preview = await callMcp(`landing-preview-${key}-${runId}`, 'site.update_content', {
    key,
    patch,
    mode: 'preview',
  });
  const before = String(preview.summary?.before?.landing?.seo?.description || '');
  const after = String(preview.summary?.after?.landing?.seo?.description || '');
  if (after !== description || !preview.confirm_token) {
    throw new Error(`预览结果不符合预期: ${key}`);
  }

  const result = {
    key,
    mode: 'preview',
    risk: preview.risk_level,
    beforeLength: before.length,
    afterLength: after.length,
  };

  if (execute) {
    const executed = await callMcp(`landing-execute-${key}-${runId}`, 'site.update_content', {
      key,
      patch,
      mode: 'execute',
      confirm_token: preview.confirm_token,
      idempotency_key: `landing-seo-${key}-${runId}`,
    });
    result.mode = 'execute';
    result.updatedSections = executed.updated_sections || [];
  }
  results.push(result);
}

console.log(JSON.stringify({ execute, results }, null, 2));
