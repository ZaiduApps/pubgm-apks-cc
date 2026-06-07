import Script from 'next/script';

type VerificationMetaTag = {
  content: string;
  name: string;
};

const VERIFICATION_META_NAMES = new Set([
  '360-site-verification',
  'baidu-site-verification',
  'google-site-verification',
  'sogou_site_verification',
]);

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function getHtmlAttribute(attributes: string, name: string) {
  const pattern = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>` + '`' + `]+))`, 'i');
  const match = attributes.match(pattern);
  if (!match) return '';
  return decodeHtmlAttribute(match[1] || match[2] || match[3] || '');
}

function getVerificationMetaTags(customHeadHtml: string): VerificationMetaTag[] {
  const tags: VerificationMetaTag[] = [];
  const seen = new Set<string>();
  const metaTagPattern = /<meta\s+([^>]*?)\/?>/gi;

  for (const match of customHeadHtml.matchAll(metaTagPattern)) {
    const attributes = match[1] || '';
    const name = getHtmlAttribute(attributes, 'name');
    const content = getHtmlAttribute(attributes, 'content');

    if (!name || !content || !VERIFICATION_META_NAMES.has(name)) continue;

    const key = `${name}:${content}`;
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push({ name, content });
  }

  return tags;
}

function getBaiduAnalyticsUrls(customHeadHtml: string) {
  const urls = new Set<string>();
  const baiduScriptPattern = /https:\/\/hm\.baidu\.com\/hm\.js\?[a-z0-9]+/gi;

  for (const match of customHeadHtml.matchAll(baiduScriptPattern)) {
    urls.add(match[0]);
  }

  return Array.from(urls);
}

function getBaiduAnalyticsScript(url: string) {
  return `
    (function() {
      var src = ${JSON.stringify(url)};
      window._hmt = window._hmt || [];
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src === src) {
          return;
        }
      }
      var hm = document.createElement("script");
      hm.async = true;
      hm.src = src;
      var target = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
      target.appendChild(hm);
    })();
  `;
}

export function CustomHeadTags({ customHeadHtml }: { customHeadHtml?: string }) {
  const html = String(customHeadHtml || '');
  const verificationTags = getVerificationMetaTags(html);
  const baiduAnalyticsUrls = getBaiduAnalyticsUrls(html);

  if (verificationTags.length === 0 && baiduAnalyticsUrls.length === 0) {
    return null;
  }

  return (
    <>
      {verificationTags.map((tag) => (
        <meta key={`${tag.name}:${tag.content}`} name={tag.name} content={tag.content} />
      ))}
    </>
  );
}

export function BaiduAnalyticsScripts({ customHeadHtml }: { customHeadHtml?: string }) {
  const html = String(customHeadHtml || '');
  const baiduAnalyticsUrls = getBaiduAnalyticsUrls(html);

  if (baiduAnalyticsUrls.length === 0) {
    return null;
  }

  return (
    <>
      {baiduAnalyticsUrls.map((url, index) => (
        <Script
          id={`baidu-analytics-${index}`}
          key={url}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: getBaiduAnalyticsScript(url),
          }}
        />
      ))}
    </>
  );
}
