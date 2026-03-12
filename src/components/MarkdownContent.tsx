import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface MarkdownContentProps {
  content: string;
}

function normalizeMarkdownContent(content: string): string {
  const normalized = content.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
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

export function MarkdownContent({ content }: MarkdownContentProps) {
  const normalizedContent = normalizeMarkdownContent(content);

  return (
    <div className="prose prose-invert prose-lg max-w-none text-foreground/80">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{normalizedContent}</ReactMarkdown>
    </div>
  );
}
