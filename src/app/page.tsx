import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameDownloadButtons } from '@/components/GameDownloadButtons';
import { ArrowRight, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { CommunitySquare } from '@/components/CommunitySquare';
import { JsonLd } from '@/components/JsonLd';
import { buildMainSiteTopicUrl, getCommunityTopic } from '@/lib/community-api';
import { buildHomeJsonLd, getSiteConfig, type SiteArticle } from '@/lib/site-config';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const requestHeaders = await headers();
  const requestHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '';
  const config = await getSiteConfig(requestHost);
  const topicId = String(config.data_source?.topic_id || '').trim();
  const topic = await getCommunityTopic(topicId);
  const communityInteractionUrl = buildMainSiteTopicUrl(topic, topicId);
  const keywords = config.seo.keywords;
  const faqItems = config.enrichment.faqs.filter((item) => item.question && item.answer);
  const hasSeoGuide = faqItems.length > 0;

  return (
    <div className="flex flex-col gap-12 pb-16 md:gap-16">
      <JsonLd items={buildHomeJsonLd(config, requestHost)} />

      <section id="home" className="relative flex aspect-video w-full items-center justify-center text-center text-white">
        <Image
          src={config.hero.backgroundImage}
          alt={`${config.name} 下载`}
          fill
          sizes="100vw"
          unoptimized
          priority
          className="-z-10 object-cover object-center"
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

        <div className="container z-10 px-4 md:px-6">
          <div className="mx-auto flex max-w-3xl flex-col items-center pb-8 pt-24 sm:pt-32">
            <h1 className="mb-4 text-4xl font-bold tracking-tighter text-shadow-lg animate-fade-in-down sm:text-5xl md:text-6xl lg:text-7xl">
              {config.hero.title}
            </h1>
            <p className="mb-8 max-w-2xl text-base text-foreground/80 animate-fade-in-up [animation-delay:0.2s] sm:text-lg md:text-xl">
              {config.hero.description}
            </p>
            <div id="download" className="animate-fade-in-up [animation-delay:0.4s]">
              <GameDownloadButtons downloads={config.downloads} />
            </div>
          </div>
        </div>
      </section>

      {hasSeoGuide && (
        <section id="guide" className="container mx-auto scroll-mt-20 px-4 md:px-6">
          <div className="mb-8 flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">专题指南</h2>
          </div>
          <div className="grid gap-6">
            {faqItems.length > 0 && (
              <div className="rounded-lg border border-border/60 bg-card/70 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">常见问题</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {faqItems.slice(0, 6).map((item) => (
                    <details
                      key={item.id}
                      open
                      className="h-full rounded-md border border-border/60 bg-background/60 p-4"
                    >
                      <summary className="cursor-pointer whitespace-normal break-words text-base font-semibold leading-snug">
                        {item.question}
                      </summary>
                      <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-muted-foreground">
                        {item.answer}
                      </p>
                    </details>
                    ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {config.sections.map((section) => {
        if (section.enabled === false) return null;
        const sectionItems = (section.items || []) as SiteArticle[];
        const hasSectionItems = sectionItems.length > 0;

        return (
          <section key={section.id} id={section.id} className="container mx-auto scroll-mt-20 px-4 md:px-6">
            {section.id === 'community' ? (
              <CommunitySquare interactionUrl={communityInteractionUrl} topic={topic} />
            ) : (
              <>
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{section.title}</h2>
                  {section.id === 'topic_posts' ? (
                    <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
                      <a href={communityInteractionUrl} target="_blank" rel="noopener noreferrer">
                        去话题互动
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
                {!hasSectionItems ? (
                  <div className="rounded-lg border border-border/60 bg-card/70 px-5 py-6 text-sm text-muted-foreground">
                    当前分区内容正在整理中，请稍后查看。
                  </div>
                ) : section.id === 'updates' ? (
                  <div className="flex flex-col gap-8">
                    {sectionItems.slice(0, 4).map((item) => (
                      <Link key={item.slug} href={`/articles/${item.slug}`} className="group">
                        <Card className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg md:flex-row">
                          <div className="relative aspect-[1312/600] w-full shrink-0 overflow-hidden md:w-1/3">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              sizes="100vw"
                              unoptimized
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <CardContent className="flex flex-col justify-center p-6">
                            <CardTitle className="text-xl font-bold transition-colors group-hover:text-primary md:text-2xl">
                              {item.title} {item.version && `- v${item.version}`}
                            </CardTitle>
                            <CardDescription className="mt-2 text-sm">{item.date}</CardDescription>
                            <p className="mt-4 line-clamp-3 text-base text-muted-foreground">{item.summary}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                    {sectionItems.map((article) => (
                      <Card
                        key={article.slug}
                        className="group flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                      >
                        <Link href={`/articles/${article.slug}`} className="flex h-full flex-col">
                          <div className="relative aspect-[1312/600] w-full overflow-hidden">
                            <Image
                              src={article.imageUrl}
                              alt={article.title}
                              fill
                              sizes="100vw"
                              unoptimized
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>

                          <CardContent className="flex flex-grow flex-col p-4">
                            <CardTitle className="line-clamp-2 text-base font-bold transition-colors group-hover:text-primary md:text-lg">
                              {article.title}
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs">
                              {article.date} {article.author && `by ${article.author}`}
                            </CardDescription>
                            <p className="mt-2 line-clamp-2 flex-grow text-sm text-muted-foreground">{article.summary}</p>
                            <div className="mt-4 flex justify-end">
                              <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                                阅读更多 <ArrowRight className="ml-1 h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}

      {config.video.enabled && (
        <section id={config.video.id} className="container mx-auto scroll-mt-20 px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{config.video.title}</h2>
          <div className="aspect-video">
            <iframe
              className="h-full w-full rounded-lg shadow-lg"
              src={`${config.video.url}?muted=1`}
              title={config.video.playerTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <div className="sr-only">{keywords.join(', ')}</div>
    </div>
  );
}
