
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ApkDownloadDialog } from './ApkDownloadDialog';

type GameDownloadButtonsProps = {
  downloads: {
    hero_buttons?: Array<{
      action_type?: string;
      backgroundImage?: string;
      description?: string;
      enabled?: boolean;
      id?: string;
      label?: string;
      modal?: {
        description?: string;
        items?: Array<{
          description?: string;
          enabled?: boolean;
          id?: string;
          kind?: string;
          label?: string;
          rel?: string;
          target?: string;
          url?: string;
        }>;
        title?: string;
      };
      rel?: string;
      sort?: number;
      target?: string;
      url?: string;
    }>;
    googlePlay?: {
      backgroundImage?: string;
      srText?: string;
      url?: string;
    };
    appStore?: {
      backgroundImage?: string;
      srText?: string;
      url?: string;
    };
    apk?: {
      backgroundImage?: string;
      line1?: string;
      line2?: string;
      dialog?: {
        description?: string;
        officialUrl?: string;
        panUrl?: string;
        title?: string;
      };
    };
  };
};

function splitButtonLabel(label?: string) {
  return String(label || '')
    .split(/<br\s*\/?>/i)
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function DownloadButtonLabel({ label }: { label?: string }) {
  const lines = splitButtonLabel(label);

  if (lines.length <= 1) {
    return <span className="px-4 text-base font-bold leading-tight">{label}</span>;
  }

  return (
    <span className="flex flex-col items-center px-4 leading-tight">
      <span className="text-xs font-medium">{lines[0]}</span>
      <span className="text-lg font-bold">{lines.slice(1).join(' ')}</span>
    </span>
  );
}

export function GameDownloadButtons({ downloads }: GameDownloadButtonsProps) {
    const [openDialogId, setOpenDialogId] = useState('');
    const hasAppStore = Boolean(downloads.appStore?.url && downloads.appStore?.backgroundImage);
    const hasGooglePlay = Boolean(downloads.googlePlay?.url && downloads.googlePlay?.backgroundImage);
    const hasApkDownload = Boolean(
      downloads.apk?.dialog?.panUrl || downloads.apk?.dialog?.officialUrl,
    );
    const heroButtons = (downloads.hero_buttons || [])
      .filter((button) => button.enabled !== false)
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));

    if (heroButtons.length > 0) {
      return (
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
          {heroButtons.map((button) => {
            const isModal = button.action_type === 'modal';
            const hasModalItems = Boolean(button.modal?.items?.some((item) => item.enabled !== false && item.url));
            const className = "animated-border-btn !p-0 w-[180px] h-[52px] sm:w-[200px] sm:h-[58px] bg-cover bg-center hover:scale-105 transition-transform duration-300 text-white border border-white/50 flex items-center justify-center";
            const style = button.backgroundImage
              ? { backgroundImage: `url('${button.backgroundImage}')` }
              : undefined;

            return (
              <div key={button.id || button.label} className="contents">
                {isModal ? (
                  <Button
                    size="lg"
                    disabled={!hasModalItems}
                    onClick={() => setOpenDialogId(button.id || button.label || '')}
                    className={className}
                    style={style}
                  >
                    <DownloadButtonLabel label={button.label} />
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    disabled={!button.url}
                    className={className}
                    style={style}
                  >
                    <Link
                      href={button.url || '#'}
                      target={button.target || '_blank'}
                      rel={button.rel || 'noopener noreferrer'}
                    >
                      <span className="sr-only">{button.description || button.label}</span>
                      {!button.backgroundImage && (
                        <DownloadButtonLabel label={button.label} />
                      )}
                    </Link>
                  </Button>
                )}

                {isModal && (
                  <ApkDownloadDialog
                    dialog={button.modal || {}}
                    open={openDialogId === (button.id || button.label || '')}
                    onOpenChange={(open) => setOpenDialogId(open ? button.id || button.label || '' : '')}
                  />
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4">

            {hasAppStore && downloads.appStore && (
                <Button asChild size="lg" className="animated-border-btn !p-0 w-[180px] h-[52px] sm:w-[200px] sm:h-[58px] bg-cover bg-center hover:scale-105 transition-transform duration-300 border border-white/50" style={{backgroundImage: `url('${downloads.appStore.backgroundImage}')`}}>
                    <Link href={downloads.appStore.url || '#'}>
                        <span className="sr-only">{downloads.appStore.srText}</span>
                    </Link>
                </Button>
            )}

            {hasGooglePlay && downloads.googlePlay && (
                <Button asChild size="lg" className="animated-border-btn !p-0 w-[180px] h-[52px] sm:w-[200px] sm:h-[58px] bg-cover bg-center hover:scale-105 transition-transform duration-300 border border-white/50" style={{backgroundImage: `url('${downloads.googlePlay.backgroundImage}')`}}>
                    <Link href={downloads.googlePlay.url || '#'} target="_blank">
                        <span className="sr-only">{downloads.googlePlay.srText}</span>
                    </Link>
                </Button>
            )}
            
            {downloads.apk && (
                <Button 
                  size="lg" 
                  disabled={!hasApkDownload}
                  onClick={() => setOpenDialogId('legacy-apk')}
                  className="animated-border-btn !p-0 w-[180px] h-[52px] sm:w-[200px] sm:h-[58px] bg-cover bg-center hover:scale-105 transition-transform duration-300 text-white border border-white/50 flex items-center justify-center" 
                  style={{backgroundImage: `url('${downloads.apk.backgroundImage}')`}}
                >
                    <div className="flex flex-col items-center leading-tight scale-90 sm:scale-100">
                        <span className="text-xs font-medium">{downloads.apk.line1}</span>
                        <span className="font-bold text-lg">{downloads.apk.line2}</span>
                    </div>
                </Button>
            )}

            {downloads.apk && (
              <ApkDownloadDialog
                dialog={downloads.apk.dialog || {}}
                open={openDialogId === 'legacy-apk'}
                onOpenChange={(open) => setOpenDialogId(open ? 'legacy-apk' : '')}
              />
            )}
        </div>
    );
}
