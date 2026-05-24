
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

interface ApkDownloadDialogProps {
  dialog: {
    description?: string;
    officialUrl?: string;
    panUrl?: string;
    title?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApkDownloadDialog({ dialog, open, onOpenChange }: ApkDownloadDialogProps) {
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
          <Button asChild size="lg">
            <Link href={dialog.panUrl || '#'} target="_blank">
              <DownloadCloud className="mr-2" />
              网盘下载
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={dialog.officialUrl || '#'} target="_blank">
              <Globe className="mr-2" />
              官网下载
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
