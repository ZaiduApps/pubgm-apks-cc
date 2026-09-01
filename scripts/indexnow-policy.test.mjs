import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectCandidateUrl, inspectFetchedPage } from './indexnow-policy.mjs';

test('只允许目标站点的 HTTPS 内容页', () => {
  assert.equal(inspectCandidateUrl('https://pubgm.apks.cc/', 'pubgm.apks.cc').eligible, true);
  assert.equal(
    inspectCandidateUrl('https://pubgm.apks.cc/articles/example', 'pubgm.apks.cc').eligible,
    true,
  );
  assert.equal(inspectCandidateUrl('http://pubgm.apks.cc/', 'pubgm.apks.cc').reason, 'non-https');
  assert.equal(inspectCandidateUrl('https://apks.cc/', 'pubgm.apks.cc').reason, 'cross-host');
});

test('过滤 robots、favicon、Next 静态资源和常见资源扩展名', () => {
  const urls = [
    'https://apks.cc/robots.txt',
    'https://apks.cc/favicon.ico',
    'https://apks.cc/_next/static/media/font.woff2',
    'https://apks.cc/assets/logo.png',
  ];
  for (const url of urls) {
    assert.equal(inspectCandidateUrl(url, 'apks.cc').eligible, false);
  }
});

test('不把真实 HTML 应用详情页按 slug 扩展名误杀', () => {
  assert.equal(
    inspectCandidateUrl('https://apks.cc/app/com.qcplay.snail.oversea.gz', 'apks.cc').eligible,
    true,
  );
});
test('只接受 200、HTML、可索引且 self-canonical 的响应', () => {
  const url = 'https://pubgm.apks.cc/articles/example';
  const valid = {
    status: 200,
    contentType: 'text/html; charset=utf-8',
    finalUrl: url,
    xRobotsTag: '',
    body: `<html><head><link href="${url}" rel="canonical"></head><body></body></html>`,
  };

  assert.equal(inspectFetchedPage(url, valid).eligible, true);
  assert.equal(inspectFetchedPage(url, { ...valid, status: 404 }).reason, 'http-404');
  assert.equal(inspectFetchedPage(url, { ...valid, contentType: 'font/woff2' }).reason, 'non-html');
  assert.equal(
    inspectFetchedPage(url, { ...valid, xRobotsTag: 'noindex, nofollow' }).reason,
    'x-robots-noindex',
  );
  assert.equal(
    inspectFetchedPage(url, {
      ...valid,
      body: '<html><head><meta name="robots" content="noindex"><link rel="canonical" href="https://pubgm.apks.cc/articles/example"></head></html>',
    }).reason,
    'meta-robots-noindex',
  );
  assert.equal(
    inspectFetchedPage(url, {
      ...valid,
      body: '<html><head><link rel="canonical" href="https://pubgm.apks.cc/"></head></html>',
    }).reason,
    'non-self-canonical',
  );
});
