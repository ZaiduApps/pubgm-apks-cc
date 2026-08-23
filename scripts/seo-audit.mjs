const urls = process.argv.slice(2);

if (urls.length === 0) {
  urls.push('https://pubgm.apks.cc/', 'https://pubgm.apks.cc/articles/pubgm-4.1-apk');
}

const getAttr = (tag, attr) => {
  const match = tag.match(new RegExp(`${attr}=["']([^"']*)["']`, 'i'));
  return match?.[1] || '';
};

const stripTags = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const extractMeta = (html, name) => {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const tag = tags.find((item) => getAttr(item, 'name') === name || getAttr(item, 'property') === name);
  return tag ? getAttr(tag, 'content') : '';
};

const extractHeadings = (html, level) => {
  const pattern = new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi');
  return Array.from(html.matchAll(pattern), (match) => stripTags(match[1]));
};

const extractJsonLdTypes = (html) => {
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  return Array.from(html.matchAll(pattern), (match) => {
    try {
      const data = JSON.parse(match[1]);
      if (Array.isArray(data)) {
        return data.map((item) => item['@type'] || Object.keys(item).join(',')).join('|');
      }
      if (Array.isArray(data['@graph'])) {
        return data['@graph'].map((item) => item['@type'] || Object.keys(item).join(',')).join('|');
      }
      return data['@type'] || Object.keys(data).join(',');
    } catch {
      return 'parse-error';
    }
  });
};

const extractCanonical = (html) => {
  const links = html.match(/<link\b[^>]*>/gi) || [];
  const canonical = links.find((link) => getAttr(link, 'rel').toLowerCase() === 'canonical');

  return canonical ? getAttr(canonical, 'href') : '';
};

const extractHeadMetadataPlacement = (html) => {
  const headEnd = html.toLowerCase().indexOf('</head>');
  const findIndex = (pattern) => html.search(pattern);

  const titleIndex = findIndex(/<title\b/i);
  const descriptionIndex = findIndex(/<meta\b[^>]*name=["']description["']/i);
  const canonicalIndex = findIndex(/<link\b[^>]*rel=["']canonical["']/i);

  return {
    titleInHead: headEnd >= 0 && titleIndex >= 0 && titleIndex < headEnd,
    descriptionInHead: headEnd >= 0 && descriptionIndex >= 0 && descriptionIndex < headEnd,
    canonicalInHead: headEnd >= 0 && canonicalIndex >= 0 && canonicalIndex < headEnd,
  };
};

const extractImageAltStats = (html) => {
  const images = html.match(/<img\b[^>]*>/gi) || [];
  const missingAlt = images.filter((img) => !getAttr(img, 'alt')).length;

  return {
    total: images.length,
    missingAlt,
  };
};

const extractLinks = (html, url) => {
  const host = new URL(url).host;
  const links = (html.match(/<a\b[^>]*href=["'][^"']*["'][^>]*>[\s\S]*?<\/a>/gi) || []).map((tag) => ({
    href: getAttr(tag, 'href'),
    text: stripTags(tag).slice(0, 80),
  }));

  return {
    total: links.length,
    internal: links.filter((link) => {
      if (!link.href || link.href.startsWith('#') || link.href.startsWith('/')) {
        return true;
      }
      try {
        return new URL(link.href).host === host;
      } catch {
        return false;
      }
    }).length,
    sample: links.slice(0, 10),
  };
};

for (const url of urls) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'PUBG-Mobile-SEO-Audit/1.0',
    },
  });
  const html = await response.text();

  console.log(JSON.stringify({
    url,
    status: response.status,
    title: stripTags((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''),
    description: extractMeta(html, 'description'),
    canonical: extractCanonical(html),
    metadataPlacement: extractHeadMetadataPlacement(html),
    h1: extractHeadings(html, 1),
    h2: extractHeadings(html, 2).slice(0, 12),
    jsonLdTypes: extractJsonLdTypes(html),
    images: extractImageAltStats(html),
    links: extractLinks(html, url),
  }, null, 2));
}
