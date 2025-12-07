
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
import { siteConfig } from '@/config/site';

interface ApkDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApkDownloadDialog({ open, onOpenChange }: ApkDownloadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{siteConfig.downloads.apk.dialog.title}</DialogTitle>
          <DialogDescription>
            {siteConfig.downloads.apk.dialog.description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button asChild size="lg">
            <Link href={siteConfig.downloads.apk.dialog.panUrl} target="_blank">
              <DownloadCloud className="mr-2" />
              网盘下载
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={siteConfig.downloads.apk.dialog.officialUrl} target="_blank">
              <Globe className="mr-2" />
              官网下载
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
