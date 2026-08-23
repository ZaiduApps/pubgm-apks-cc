import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import Link from 'next/link';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
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
  type SiteArticle,
  type SiteConfigShape,
  getArticleBySlugFromConfig,
  getArticleSeoDescription,
  getArticleTopicId,
  getPublicSiteUrl,
  getSiteConfig,
} from '@/lib/site-config';

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-dynamic';

async function getRequestHost() {
  const requestHeaders = await headers();
  return requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const requestHost = await getRequestHost();
  const config = await getSiteConfig(requestHost);
  const article = getArticleBySlugFromConfig(config, slug);

  if (!article) {
    notFound();
  }

  const siteUrl = getPublicSiteUrl(requestHost);
  const canonical = `${siteUrl}/articles/${article.slug}`;
  const description = getArticleSeoDescription(article);

  return {
    title: article.title,
    description,
    keywords: article.keywords,
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
  const requestHost = await getRequestHost();
  const config = await getSiteConfig(requestHost);
  const article = getArticleBySlugFromConfig(config, slug);

  if (!article) {
    notFound();
  }

  const siteUrl = getPublicSiteUrl(requestHost);
  const canonical = `${siteUrl}/articles/${article.slug}`;
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
          siteUrl,
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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <time dateTime={article.date}>发布于 {article.date}</time>
            {article.updatedAt && article.updatedAt !== article.date ? (
              <time dateTime={article.updatedAt}>更新于 {article.updatedAt}</time>
            ) : null}
            {authorText ? <span>{authorText.trim()}</span> : null}
          </div>
          {article.summary ? (
            <p className="mt-5 border-l-2 border-primary/60 pl-4 text-base leading-7 text-muted-foreground md:text-lg">
              {article.summary}
            </p>
          ) : null}
        </header>

        <MarkdownContent
          content={article.content}
          excludedImageUrls={shouldRenderCover ? [article.imageUrl] : []}
        />

        <RelatedArticles config={config} currentSlug={article.slug} />

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


function RelatedArticles({
  config,
  currentSlug,
}: {
  config: SiteConfigShape;
  currentSlug: string;
}) {
  const current = (config.sections || [])
    .flatMap((section) => (section.items || []) as SiteArticle[])
    .find((item) => item.slug === currentSlug);
  const currentTerms = new Set(
    `${current?.topicName || ''} ${current?.title || ''}`
      .split(/[\s，。、“”！？：；（）()/-]+/)
      .map((term) => term.trim().toLowerCase())
      .filter((term) => term.length >= 2),
  );

  const related = (config.sections || [])
    .filter((section) => section.enabled !== false && section.id !== 'community')
    .flatMap((section) => (section.items || []) as SiteArticle[])
    .filter((item) => item.slug && item.slug !== currentSlug)
    .map((item, index) => {
      const haystack = `${item.topicName || ''} ${item.title} ${item.summary}`.toLowerCase();
      const matches = [...currentTerms].filter((term) => haystack.includes(term)).length;
      const dateScore = item.date ? new Date(item.date).getTime() || 0 : 0;
      return { item, score: matches * 100000000000 + dateScore - index };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ item }) => item);

  if (related.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">相关推荐</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {related.map((item) => (
          <Link key={item.slug} href={`/articles/${item.slug}`} className="group block">
            <Card className="h-full transition-colors group-hover:border-primary/50">
              <CardContent className="p-5">
                <CardTitle className="mb-2 line-clamp-2 text-base font-semibold group-hover:text-primary">
                  {item.title}
                </CardTitle>
                {item.summary ? (
                  <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                    {item.summary}
                  </CardDescription>
                ) : null}
                <p className="mt-3 text-xs text-muted-foreground/70">{item.date}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
