import Link from 'next/link';
import { PubgLogo } from '@/components/icons/PubgLogo';
import { siteConfig } from '@/config/site';
import { FeedbackDialog } from '@/components/FeedbackDialog';

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link href="/">
              <PubgLogo />
            </Link>
            <p className="max-w-xs text-center text-sm text-muted-foreground md:text-left">
              {siteConfig.footer.description}
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-2 text-center text-xs text-muted-foreground">
          <div>
            {siteConfig.footer.copyright.replace('{year}', new Date().getFullYear().toString())}
          </div>
          <div className="flex items-center justify-center gap-4">
            <a href={`mailto:${siteConfig.footer.feedback.email}`} className="transition-colors hover:text-primary">
              {siteConfig.footer.feedback.email}
            </a>
            <FeedbackDialog />
            <a href="https://apks.cc/" className="transition-colors hover:text-primary">
              前往 apks.cc 获取更多内容
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
