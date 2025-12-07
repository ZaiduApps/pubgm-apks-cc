
import type {Metadata} from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from '@/config/site';

// Use generateMetadata for robust server-side head tag generation
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: `${siteConfig.name} - ${siteConfig.seo.title}`,
      template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.seo.description,
    keywords: siteConfig.seo.keywords,
    openGraph: {
      title: `${siteConfig.name} - ${siteConfig.seo.title}`,
      description: siteConfig.seo.description,
      images: [siteConfig.seo.ogImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        {siteConfig.analytics.customHeadHtml && (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `</noscript>${siteConfig.analytics.customHeadHtml}<noscript>`,
            }}
          />
        )}
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
