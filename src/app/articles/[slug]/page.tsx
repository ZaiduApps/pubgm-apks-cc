import { getArticleBySlug, siteConfig } from '@/config/site';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MarkdownContent } from '@/components/MarkdownContent';
import { ContextualInfo } from '@/components/ContextualInfo';
import { CommentSection } from '@/components/CommentSection';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

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

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const authorText = 'author' in article && article.author ? ` by ${article.author}` : '';

  return (
    <article className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg">
            <Image src={article.imageUrl} alt={article.title} fill className="object-cover" priority />
          </div>
          <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tighter sm:text-4xl md:text-5xl">
            {article.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            发布于 {article.date}
            {authorText}
          </p>
        </header>

        <MarkdownContent content={article.content} />
        <ContextualInfo content={article.content} />
        <CommentSection />
      </div>
    </article>
  );
}
