
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { DownloadCloud, Globe } from 'lucide-react';
import Link from 'next/link';

type DownloadDialogItem = {
  id?: string;
  label?: string;
  description?: string;
  url?: string;
  kind?: string;
  target?: string;
  rel?: string;
  enabled?: boolean;
};

interface ApkDownloadDialogProps {
  dialog: {
    description?: string;
    officialUrl?: string;
    panUrl?: string;
    title?: string;
    items?: DownloadDialogItem[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApkDownloadDialog({ dialog, open, onOpenChange }: ApkDownloadDialogProps) {
  const legacyItems: DownloadDialogItem[] = [
    {
      id: 'apk-pan',
      kind: 'cloud',
      label: '网盘下载',
      url: dialog.panUrl,
    },
    {
      id: 'apk-official',
      kind: 'official',
      label: '官网下载',
      url: dialog.officialUrl,
    },
  ];
  const items = (dialog.items?.length ? dialog.items : legacyItems).filter(
    (item) => item.enabled !== false && item.url,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialog.title || '选择下载渠道'}</DialogTitle>
          <DialogDescription>
            {dialog.description || '请选择您偏好的下载方式。'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {items.map((item, index) => {
            const Icon = item.kind === 'cloud' ? DownloadCloud : Globe;
            return (
              <Button key={item.id || item.url} asChild size="lg" variant={index === 0 ? 'default' : 'secondary'}>
                <Link
                  href={item.url || '#'}
                  target={item.target || '_blank'}
                  rel={item.rel || 'noopener noreferrer'}
                >
                  <Icon className="mr-2" />
                  {item.label || '下载入口'}
                </Link>
              </Button>
            );
          })}
          {items.length === 0 && (
            <p className="rounded-md border border-border/60 px-4 py-3 text-sm text-muted-foreground">
              下载渠道正在整理中，请稍后查看。
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
