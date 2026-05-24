'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PubgLogo } from '@/components/icons/PubgLogo';
import { Button } from '@/components/ui/button';
import { Gamepad2, Menu, MessageSquare, Newspaper, Rss, Video } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ApkDownloadDialog } from '../ApkDownloadDialog';

type HeaderProps = {
  config: {
    advertisement: {
      header: {
        downloadButtonText: string;
        enabled: boolean;
        rel: string;
        secondaryText: string;
        target: string;
        text: string;
        url: string;
      };
    };
    downloads: {
      apk: {
        dialog: {
          description: string;
          officialUrl: string;
          panUrl: string;
          title: string;
        };
      };
    };
    header: {
      logo: {
        alt: string;
        url: string;
      };
    };
    name: string;
    sections: Array<{
      enabled?: boolean;
      id: string;
      navLabel: string;
    }>;
    video: {
      enabled: boolean;
      id: string;
      navLabel: string;
    };
  };
};

const navIcons: { [key: string]: React.ElementType } = {
  home: Gamepad2,
  community: MessageSquare,
  articles: Newspaper,
  updates: Rss,
  video: Video,
};

export function Header({ config }: HeaderProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isApkDialogOpen, setIsApkDialogOpen] = useState(false);
  const headerAd = config.advertisement.header;

  const navLinks = [
    { href: '#home', label: '首页', sectionId: 'home' },
    ...config.sections
      .filter((section) => section.enabled !== false)
      .map((section) => ({
        href: `#${section.id}`,
        label: section.navLabel,
        sectionId: section.id,
      })),
    ...(config.video.enabled
      ? [{ href: `#${config.video.id}`, label: config.video.navLabel, sectionId: config.video.id }]
      : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionsToObserve = navLinks
        .map((link) => document.getElementById(link.sectionId))
        .filter(Boolean);

      let currentSection = 'home';

      sectionsToObserve.forEach((section) => {
        if (section) {
          const sectionTop = section.offsetTop;
          if (window.scrollY >= sectionTop - 100) {
            currentSection = section.id;
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navLinks]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);

    if (window.location.pathname !== '/') {
      window.location.href = `/${href}`;
      return;
    }

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveSection(targetId);
    }
    setIsSheetOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">打开菜单</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle className="sr-only">主菜单</SheetTitle>
                    <Link href="/" className="flex items-center space-x-2">
                      <PubgLogo
                        logoAlt={config.header.logo.alt}
                        logoUrl={config.header.logo.url}
                        siteName={config.name}
                      />
                    </Link>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col space-y-4">
                    {navLinks.map(({ href, label, sectionId }) => {
                      const Icon = navIcons[sectionId];
                      return (
                        <a
                          key={label}
                          href={href}
                          onClick={(e) => handleLinkClick(e, href)}
                          className={cn(
                            'flex items-center space-x-2 text-lg font-medium hover:text-foreground',
                            activeSection === sectionId ? 'text-foreground' : 'text-foreground/60'
                          )}
                        >
                          {Icon && <Icon className="h-5 w-5" />}
                          <span>{label}</span>
                        </a>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            <Link href="/" className="flex items-center space-x-2">
              <PubgLogo
                logoAlt={config.header.logo.alt}
                logoUrl={config.header.logo.url}
                siteName={config.name}
              />
            </Link>
            <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
              {navLinks.map(({ href, label, sectionId }) => (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => handleLinkClick(e, href)}
                  className={cn(
                    'nav-link relative transition-colors hover:text-foreground/80',
                    activeSection === sectionId ? 'nav-link-active text-foreground' : 'text-foreground/60'
                  )}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center">
            {headerAd.enabled && headerAd.url ? (
              <>
                <Button asChild className="animated-border-btn w-[106px] md:w-auto">
                  <a href={headerAd.url} target={headerAd.target} rel={headerAd.rel}>
                    {headerAd.text}
                  </a>
                </Button>

                <span className="mx-2 hidden md:inline">{headerAd.secondaryText}</span>
              </>
            ) : null}

            <Button
              onClick={() => setIsApkDialogOpen(true)}
              className="animated-border-btn hidden md:inline-flex"
            >
              {headerAd.downloadButtonText}
            </Button>
          </div>
        </div>
      </header>
      <ApkDownloadDialog
        dialog={config.downloads.apk.dialog}
        open={isApkDialogOpen}
        onOpenChange={setIsApkDialogOpen}
      />
    </>
  );
}
