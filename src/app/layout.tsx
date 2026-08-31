
import type {Metadata} from 'next';
import './globals.css';
import { headers } from 'next/headers';
import { BaiduAnalyticsScripts, CustomHeadTags } from '@/components/CustomHeadTags';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { getPublicSiteUrl, getSiteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

async function getRequestHost() {
  const requestHeaders = await headers();
  return requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '';
}

// 使用 generateMetadata 生成稳定的服务端 SEO 标签
export async function generateMetadata(): Promise<Metadata> {
  const requestHost = await getRequestHost();
  const config = await getSiteConfig(requestHost);
  const siteUrl = getPublicSiteUrl(requestHost);
  const faviconUrl = config.seo.faviconUrl || config.header.logo.url || '/favicon.ico';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${config.name} - ${config.seo.title}`,
      template: `%s - ${config.name}`,
    },
    description: config.seo.description,
    keywords: config.seo.keywords,
    icons: {
      apple: faviconUrl,
      icon: faviconUrl,
      shortcut: faviconUrl,
    },
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: `${config.name} - ${config.seo.title}`,
      description: config.seo.description,
      images: [config.seo.ogImage],
      url: siteUrl,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutInner>{children}</RootLayoutInner>;
}

async function RootLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHost = await getRequestHost();
  const config = await getSiteConfig(requestHost);

  return (
    <html lang="zh-Hans" className="dark">
      <head>
        <link rel="preconnect" href="https://cdn.apks.cc" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.apks.cc" />
        <CustomHeadTags customHeadHtml={config.analytics.customHeadHtml} />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="flex flex-col min-h-screen">
          <Header config={config} />
          <main className="flex-grow">{children}</main>
          <Footer config={config} />
        </div>
        <BaiduAnalyticsScripts customHeadHtml={config.analytics.customHeadHtml} />
        <Toaster />
      </body>
    </html>
  );
}
