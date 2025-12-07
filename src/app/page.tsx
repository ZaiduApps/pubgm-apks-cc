
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
    <div className="flex flex-col gap-12 md:gap-16 pb-16">
      {/* Hero Section */}
      <section id="home" className="relative w-full aspect-video flex items-center justify-center text-center text-white">
        <Image
          src={siteConfig.hero.backgroundImage}
          alt={siteConfig.name+"下载"}
          data-ai-hint="battle royale action"
          fill
          className="object-cover object-center -z-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent -z-10" />
        <div className="container px-4 md:px-6 z-10">
          <div className="max-w-3xl mx-auto flex flex-col items-center pt-24 pb-8 sm:pt-32">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 text-shadow-lg animate-fade-in-down">
              {siteConfig.hero.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-foreground/80 max-w-2xl mb-8 animate-fade-in-up [animation-delay:0.2s]">
              {siteConfig.hero.description}
            </p>
            <div id="download" className="animate-fade-in-up [animation-delay:0.4s]">
                <GameDownloadButtons />
            </div>
          </div>
        </div>
      </section>

      {siteConfig.sections.map((section) => {
        // Skip rendering if section is explicitly disabled
        if (section.enabled === false) {
          return null;
        }

        // For sections other than community, also check if items exist and are not empty
        if (section.id !== 'community' && (!section.items || section.items.length === 0)) {
            return null;
        }

        return (
          <section key={section.id} id={section.id} className="container mx-auto px-4 md:px-6 scroll-mt-20">
            {section.id === 'community' ? (
              <CommunitySquare />
            ) : (
              <>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">{section.title}</h2>
                {section.id === 'articles' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {(section.items as Article[]).map((article) => (
                      <Card key={article.slug} className="group overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                        <Link href={`/articles/${article.slug}`} className="flex flex-col h-full">
                          <div className="relative w-full aspect-[1312/600] overflow-hidden">
                            <Image
                              src={article.imageUrl}
                              alt={article.title}
                              data-ai-hint={article.imageHint}
                              fill
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <CardContent className="p-4 flex flex-col flex-grow">
                            <CardTitle className="text-base md:text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">{article.title}</CardTitle>
                            <CardDescription className="text-xs mt-1">{article.date} {article.author && `by ${article.author}`}</CardDescription>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-grow">{article.summary}</p>
                            <div className="mt-4 flex justify-end">
                              <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                                  Read More <ArrowRight className="ml-1 h-3 w-3" />
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
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col md:flex-row">
                          <div className="relative w-full md:w-1/3 aspect-[1312/600] overflow-hidden shrink-0">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              data-ai-hint={item.imageHint}
                              fill
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <CardContent className="p-6 flex flex-col justify-center">
                            <CardTitle className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">{item.title} {item.version && `- v${item.version}`}</CardTitle>
                            <CardDescription className="text-sm mt-2">{item.date}</CardDescription>
                            <p className="text-base text-muted-foreground mt-4 line-clamp-3">{item.summary}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </section>
        )
      })}

      {/* Social Media Feed */}
      {siteConfig.video.enabled && (
        <section id={siteConfig.video.id} className="container mx-auto px-4 md:px-6 scroll-mt-20">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">{siteConfig.video.title}</h2>
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-lg shadow-lg"
              src={`${siteConfig.video.url}?muted=1`}
              title={siteConfig.video.playerTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      )}

      {/* SEO Keywords Section */}
      <div className="sr-only">
        {keywords.join(', ')}
      </div>
    </div>
  );
}

    