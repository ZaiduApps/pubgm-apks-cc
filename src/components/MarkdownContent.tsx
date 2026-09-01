import type { Components } from 'react-markdown';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  excludedImageUrls?: string[];
}

function normalizeComparableImageUrl(value?: string): string {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.trim().toLowerCase();
    const path = decodeURIComponent(parsed.pathname || '/').replace(/\/+$/, '') || '/';
    return `${host}${path}`;
  } catch {
    return raw.toLowerCase();
  }
}

function normalizeMarkdownContent(content: string): string {
  // 内容源偶尔把中文正文粘到 Discord 邀请链接后；保留邀请码并断开错误的 URL。
  const normalized = content
    .replace(/\r\n?/g, '\n')
    .replace(/^\uFEFF/, '')
    .replace(/https:\/\/discord\.gg\/([A-Za-z0-9_-]+)[^\s)\]]*/g, 'https://discord.gg/$1 ');
  const lines = normalized.split('\n');

  let minIndent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/^[ \t]*/);
    const indent = match ? match[0].length : 0;
    minIndent = Math.min(minIndent, indent);
  }

  if (!Number.isFinite(minIndent) || minIndent === 0) {
    return normalized;
  }

  return lines
    .map((line) => {
      if (!line.trim()) return '';
      return line.slice(minIndent);
    })
    .join('\n');
}

export function extractMarkdownImageUrls(content: string): string[] {
  const normalized = normalizeMarkdownContent(content);
  const urls: string[] = [];
  const seen = new Set<string>();
  const markdownImageRegex = /!\[[^\]]*]\((https?:\/\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/gi;
  const htmlImageRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  const addUrl = (value?: string) => {
    const url = String(value || '').trim();
    const normalizedUrl = normalizeComparableImageUrl(url);
    if (!url || !normalizedUrl || seen.has(normalizedUrl)) return;
    seen.add(normalizedUrl);
    urls.push(url);
  };

  while ((match = markdownImageRegex.exec(normalized)) !== null) {
    addUrl(match[1]);
  }
  while ((match = htmlImageRegex.exec(normalized)) !== null) {
    addUrl(match[1]);
  }

  return urls;
}

export function hasMarkdownImageUrl(content: string, imageUrl?: string): boolean {
  const target = normalizeComparableImageUrl(imageUrl);
  if (!target) return false;
  return extractMarkdownImageUrls(content).some((url) => normalizeComparableImageUrl(url) === target);
}

export function MarkdownContent({ content, excludedImageUrls = [] }: MarkdownContentProps) {
  const normalizedContent = normalizeMarkdownContent(content);
  const renderedImageUrls = new Set(
    excludedImageUrls.map(normalizeComparableImageUrl).filter(Boolean),
  );

  const components: Components = {
    a: ({ className, href, ...props }) => (
      <a
        className={cn('break-words text-primary underline-offset-4 hover:underline', className)}
        href={href}
        rel="noopener noreferrer nofollow ugc"
        target={href?.startsWith('http') ? '_blank' : undefined}
        {...props}
      />
    ),
    code: ({ className, children, ...props }) => {
      const language = /language-(\w+)/.exec(className || '')?.[1];
      return (
        <code
          className={cn(
            'rounded bg-muted/80 px-1.5 py-0.5 font-code text-[0.9em] text-foreground',
            language && 'px-0 py-0',
            className,
          )}
          data-language={language}
          {...props}
        >
          {children}
        </code>
      );
    },
    img: ({ alt, src }) => {
      const normalizedUrl = normalizeComparableImageUrl(src);
      if (!src || !normalizedUrl || renderedImageUrls.has(normalizedUrl)) {
        return null;
      }
      renderedImageUrls.add(normalizedUrl);

      return (
        <span className="relative mx-auto my-8 block aspect-video max-h-[58vh] w-full max-w-[760px] overflow-hidden rounded-lg bg-muted/20">
          <Image
            alt={alt || '文章配图'}
            className="object-contain"
            fill
            sizes="(min-width: 768px) 760px, 100vw"
            src={src}
            unoptimized
          />
        </span>
      );
    },
    h1: ({ className, ...props }) => (
      <h2 className={className} {...props} />
    ),
    pre: ({ className, children, ...props }) => (
      <pre
        className={cn(
          'my-6 overflow-x-auto rounded-lg border border-border/70 bg-muted/70 p-4 text-sm leading-6 text-foreground/90',
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    ),
    table: ({ className, ...props }) => (
      <div className="my-6 overflow-x-auto">
        <table className={cn('w-full min-w-[520px] border-collapse text-sm', className)} {...props} />
      </div>
    ),
    td: ({ className, ...props }) => (
      <td className={cn('border border-border/70 px-3 py-2 align-top', className)} {...props} />
    ),
    th: ({ className, ...props }) => (
      <th className={cn('border border-border/70 bg-muted px-3 py-2 text-left font-semibold', className)} {...props} />
    ),
  };

  return (
    <div className="prose prose-invert prose-lg max-w-none text-foreground/85 prose-headings:scroll-mt-24 prose-headings:text-foreground prose-p:leading-8 prose-li:leading-8 prose-blockquote:border-primary prose-blockquote:text-foreground/80">
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm, remarkBreaks]}>
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
