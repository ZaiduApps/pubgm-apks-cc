
import type {Metadata} from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { getSiteConfig } from '@/lib/site-config';

// Use generateMetadata for robust server-side head tag generation
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

  return (
    <html lang="zh-Hans" className="dark">
      <head>
        {/* 
          The <head> tag is mostly managed by Next.js via the Metadata API.
          We are injecting custom HTML here for analytics and other scripts
          that need to be present in the initial server-rendered HTML.
          The <noscript> tag is a trick to allow dangerouslySetInnerHTML
          in the head without causing React hydration errors.
        */}
        {config.analytics.customHeadHtml && (
          <noscript
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
