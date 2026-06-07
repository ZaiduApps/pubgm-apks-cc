import { ExternalLink, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CommunityTopic } from '@/lib/community-api';

type CommunitySquareProps = {
  interactionUrl: string;
  topic?: CommunityTopic | null;
};

export function CommunitySquare({ interactionUrl, topic }: CommunitySquareProps) {
  return (
    <Card className="w-full">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          交流广场
        </CardTitle>
        <Button asChild size="sm">
          <a href={interactionUrl} target="_blank" rel="noopener noreferrer">
            前往主站互动
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/70 bg-muted/20 p-5">
          <p className="text-base font-semibold text-foreground">
            {topic ? `#${topic.name}` : '主站社区'}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            专题页展示内容与主站社区联动，发帖、评论、回复和关注请进入主站完成。
          </p>
          {topic ? (
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-md bg-background/60 p-3">
                <p className="font-semibold text-foreground">{topic.postCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">帖子</p>
              </div>
              <div className="rounded-md bg-background/60 p-3">
                <p className="font-semibold text-foreground">{topic.followersCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">关注</p>
              </div>
              <div className="rounded-md bg-background/60 p-3">
                <p className="font-semibold text-foreground">{topic.heatScore}</p>
                <p className="mt-1 text-xs text-muted-foreground">热度</p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
