
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

function getHost(value?: string) {
  try {
    return new URL(String(value || '')).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function legacyItem(id: string, url: string | undefined, fallbackLabel: string): DownloadDialogItem {
  const host = getHost(url);
  if (host === 'www.123pan.com') {
    return {
      id,
      kind: 'cloud',
      label: '网盘安装包',
      description: '第三方网盘入口，请核对版本、文件完整性和签名。',
      url,
    };
  }
  if (host === 'apks.cc') {
    return {
      id,
      kind: 'other',
      label: 'APKSCC 应用详情',
      description: '查看本站收录的版本、包名和安装信息，非发行商官网。',
      url,
    };
  }
  if (host === 'go.jujujuhaowan.com' || host === 'mobile.jujujuhaowan.com') {
    return {
      id,
      kind: 'other',
      label: '第三方服务入口',
      description: '第三方商业服务入口，非官方应用商店。',
      rel: 'noopener noreferrer sponsored',
      url,
    };
  }
  return { id, kind: 'other', label: fallbackLabel, url };
}

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
  preferredItemId?: string;
}

export function ApkDownloadDialog({
  dialog,
  open,
  onOpenChange,
  preferredItemId = '',
}: ApkDownloadDialogProps) {
  const legacyItems: DownloadDialogItem[] = [
    legacyItem('apk-pan', dialog.panUrl, '网盘安装包'),
    legacyItem('apk-official', dialog.officialUrl, '官网下载'),
  ];
  const enabledItems = (dialog.items?.length ? dialog.items : legacyItems).filter(
    (item) => item.enabled !== false && item.url,
  );
  const preferredItem = enabledItems.find((item) => item.id === preferredItemId);
  const items = preferredItem
    ? [preferredItem, ...enabledItems.filter((item) => item.id !== preferredItemId)]
    : enabledItems;

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
