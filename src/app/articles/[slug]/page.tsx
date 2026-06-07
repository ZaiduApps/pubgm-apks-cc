import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { CommentSection } from '@/components/CommentSection';
import { JsonLd } from '@/components/JsonLd';
import { hasMarkdownImageUrl, MarkdownContent } from '@/components/MarkdownContent';
import {
  buildMainSiteTopicUrl,
  getCommunityCommentThreads,
  getCommunityTopic,
} from '@/lib/community-api';
import {
  buildArticleJsonLd,
  getArticleBySlugFromConfig,
  getArticleSeoDescription,
  getArticleTopicId,
  getPublicSiteUrl,
  getSiteConfig,
} from '@/lib/site-config';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = await getSiteConfig();
  const article = getArticleBySlugFromConfig(config, slug);

  if (!article) {
    return {
      robots: { index: false, follow: true },
      title: `文章未找到 - ${config.name}`,
    };
  }

  const canonical = `${getPublicSiteUrl()}/articles/${article.slug}`;
  const description = getArticleSeoDescription(article);

  return {
    title: article.title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: article.title,
      description,
      images: article.imageUrl ? [article.imageUrl] : [],
      modifiedTime: article.updatedAt || article.date,
      publishedTime: article.date,
      type: 'article',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const config = await getSiteConfig();
  const article = getArticleBySlugFromConfig(config, slug);

  if (!article) {
    notFound();
  }

  const canonical = `${getPublicSiteUrl()}/articles/${article.slug}`;
  const articleId = article.id || article.slug;
  const topicId = getArticleTopicId(config, article);
  const [commentsResult, topic] = await Promise.all([
    getCommunityCommentThreads(articleId, 20),
    getCommunityTopic(article.topicSlug || topicId),
  ]);
  const interactionUrl = buildMainSiteTopicUrl(topic, topicId);
  const shouldRenderCover =
    Boolean(article.imageUrl) && !hasMarkdownImageUrl(article.content, article.imageUrl);
  const authorText = article.author ? ` by ${article.author}` : '';

  return (
    <article className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <JsonLd
        items={buildArticleJsonLd(config, article, {
          canonicalUrl: canonical,
          comments: commentsResult.list,
          commentsTotal: commentsResult.total,
          topic,
          topicUrl: interactionUrl,
        })}
      />
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          {shouldRenderCover ? (
            <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 896px"
                unoptimized
              />
            </div>
          ) : null}
          <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tighter sm:text-4xl md:text-5xl">
            {article.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            发布于 {article.date}
            {authorText}
          </p>
        </header>

        <MarkdownContent
          content={article.content}
          excludedImageUrls={shouldRenderCover ? [article.imageUrl] : []}
        />
        <CommentSection
          comments={commentsResult.list}
          interactionUrl={interactionUrl}
          topic={topic}
          total={Math.max(commentsResult.total, article.commentCount || 0)}
        />
      </div>
    </article>
  );
}
