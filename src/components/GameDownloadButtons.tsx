
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ApkDownloadDialog } from './ApkDownloadDialog';

type GameDownloadButtonsProps = {
  downloads: {
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

export function GameDownloadButtons({ downloads }: GameDownloadButtonsProps) {
    const [isApkDialogOpen, setIsApkDialogOpen] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row gap-4">

            {downloads.appStore && (
                <Button asChild size="lg" className="animated-border-btn !p-0 w-[180px] h-[52px] sm:w-[200px] sm:h-[58px] bg-cover bg-center hover:scale-105 transition-transform duration-300 border border-white/50" style={{backgroundImage: `url('${downloads.appStore.backgroundImage}')`}}>
                    <Link href={downloads.appStore.url || '#'}>
                        <span className="sr-only">{downloads.appStore.srText}</span>
                    </Link>
                </Button>
            )}

            {downloads.googlePlay && (
                <Button asChild size="lg" className="animated-border-btn !p-0 w-[180px] h-[52px] sm:w-[200px] sm:h-[58px] bg-cover bg-center hover:scale-105 transition-transform duration-300 border border-white/50" style={{backgroundImage: `url('${downloads.googlePlay.backgroundImage}')`}}>
                    <Link href={downloads.googlePlay.url || '#'} target="_blank">
                        <span className="sr-only">{downloads.googlePlay.srText}</span>
                    </Link>
                </Button>
            )}
            
            {downloads.apk && (
                <Button 
                  size="lg" 
                  onClick={() => setIsApkDialogOpen(true)}
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
                open={isApkDialogOpen}
                onOpenChange={setIsApkDialogOpen}
              />
            )}
        </div>
    );
}
