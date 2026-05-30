
import type {Metadata} from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { getSiteConfig } from '@/lib/site-config';

// 使用 generateMetadata 生成稳定的服务端 SEO 标签
export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return {
    title: {
      default: `${config.name} - ${config.seo.title}`,
      template: `%s - ${config.name}`,
    },
    description: config.seo.description,
    keywords: config.seo.keywords,
    openGraph: {
      title: `${config.name} - ${config.seo.title}`,
      description: config.seo.description,
      images: [config.seo.ogImage],
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
  const config = await getSiteConfig();
  const shouldInjectCustomHeadHtml = Boolean(config.analytics.customHeadHtml);

  return (
    <html lang="zh-Hans" className="dark">
      <head>
        {/* 
          <head> 主要由 Next.js Metadata API 管理。
          这里注入统计和搜索引擎验证 HTML，方便本地与线上做 SEO 对比。
          <noscript> 包裹用于在 head 中安全插入原始 HTML。
        */}
        {shouldInjectCustomHeadHtml && (
          <noscript
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: `</noscript>${config.analytics.customHeadHtml}<noscript>`,
            }}
          />
        )}
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="flex flex-col min-h-screen">
          <Header config={config} />
          <main className="flex-grow">{children}</main>
          <Footer config={config} />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
