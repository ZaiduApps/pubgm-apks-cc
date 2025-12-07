
import { getArticleBySlug, siteConfig } from '@/config/site';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MarkdownContent } from '@/components/MarkdownContent';
import { ContextualInfo } from '@/components/ContextualInfo';
import { CommentSection } from '@/components/CommentSection';
import type { Metadata } from 'next';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: `文章未找到 - ${siteConfig.name}`,
    };
  }

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [article.imageUrl],
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-3">
            {article.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            发布于 {article.date} {article.author && ` by ${article.author}`}
          </p>
        </header>

        <MarkdownContent content={article.content} />
        
        <ContextualInfo content={article.content} />

        <CommentSection />
      </div>
    </article>
  );
}

    