import Script from 'next/script';

type CustomMetaTag = {
  attributes: Record<string, string>;
  key: string;
};

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function getCustomMetaTags(customHeadHtml: string): CustomMetaTag[] {
  const tags: CustomMetaTag[] = [];
  const seen = new Set<string>();
  const metaTagPattern = /<meta\s+([^>]*?)\/?>/gi;

  for (const match of customHeadHtml.matchAll(metaTagPattern)) {
    const attributes = match[1] || '';
    const parsedAttributes: Record<string, string> = {};
    const attributePattern = /([a-zA-Z_:][a-zA-Z0-9:._-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>` + '`' + `]+))/g;

    for (const attributeMatch of attributes.matchAll(attributePattern)) {
      const name = attributeMatch[1].toLowerCase();
      parsedAttributes[name] = decodeHtmlAttribute(
        attributeMatch[2] || attributeMatch[3] || attributeMatch[4] || '',
      );
    }

    if (Object.keys(parsedAttributes).length === 0) continue;

    const key = JSON.stringify(parsedAttributes);
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push({ attributes: parsedAttributes, key });
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
  const customMetaTags = getCustomMetaTags(html);
  const baiduAnalyticsUrls = getBaiduAnalyticsUrls(html);

  if (customMetaTags.length === 0 && baiduAnalyticsUrls.length === 0) {
    return null;
  }

  return (
    <>
      {customMetaTags.map((tag) => (
        <meta key={tag.key} {...tag.attributes} />
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
