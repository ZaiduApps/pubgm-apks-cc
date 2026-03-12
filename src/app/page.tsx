import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameDownloadButtons } from '@/components/GameDownloadButtons';
import { ArrowRight } from 'lucide-react';
import { siteConfig } from '@/config/site';
import type { Article } from '@/config/site';
import { CommunitySquare } from '@/components/CommunitySquare';

export default function Home() {
  const keywords = siteConfig.seo.keywords;

  return (
    <div className="flex flex-col gap-12 pb-16 md:gap-16">
      <section id="home" className="relative flex aspect-video w-full items-center justify-center text-center text-white">
        <Image
          src={siteConfig.hero.backgroundImage}
          alt={`${siteConfig.name} 下载`}
          data-ai-hint="battle royale action"
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
              {siteConfig.hero.title}
            </h1>
            <p className="mb-8 max-w-2xl text-base text-foreground/80 animate-fade-in-up [animation-delay:0.2s] sm:text-lg md:text-xl">
              {siteConfig.hero.description}
            </p>
            <div id="download" className="animate-fade-in-up [animation-delay:0.4s]">
              <GameDownloadButtons />
            </div>
          </div>
        </div>
      </section>

      {siteConfig.sections.map((section) => {
        if (section.enabled === false) return null;
        if (section.id !== 'community' && (!section.items || section.items.length === 0)) {
          return null;
        }

        return (
          <section key={section.id} id={section.id} className="container mx-auto scroll-mt-20 px-4 md:px-6">
            {section.id === 'community' ? (
              <CommunitySquare />
            ) : (
              <>
                <h2 className="mb-8 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{section.title}</h2>

                {section.id === 'articles' ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                    {(section.items as Article[]).map((article) => (
                      <Card
                        key={article.slug}
                        className="group flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                      >
                        <Link href={`/articles/${article.slug}`} className="flex h-full flex-col">
                          <div className="relative aspect-[1312/600] w-full overflow-hidden">
                            <Image
                              src={article.imageUrl}
                              alt={article.title}
                              data-ai-hint={article.imageHint}
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
                ) : section.id === 'updates' ? (
                  <div className="flex flex-col gap-8">
                    {(section.items as Article[]).slice(0, 4).map((item) => (
                      <Link key={item.slug} href={`/articles/${item.slug}`} className="group">
                        <Card className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg md:flex-row">
                          <div className="relative aspect-[1312/600] w-full shrink-0 overflow-hidden md:w-1/3">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              data-ai-hint={item.imageHint}
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
                ) : null}
              </>
            )}
          </section>
        );
      })}

      {siteConfig.video.enabled && (
        <section id={siteConfig.video.id} className="container mx-auto scroll-mt-20 px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{siteConfig.video.title}</h2>
          <div className="aspect-video">
            <iframe
              className="h-full w-full rounded-lg shadow-lg"
              src={`${siteConfig.video.url}?muted=1`}
              title={siteConfig.video.playerTitle}
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
