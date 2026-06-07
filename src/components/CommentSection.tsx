import { ExternalLink, MessageSquare, ThumbsUp } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CommunityComment, CommunityTopic } from '@/lib/community-api';

type CommentSectionProps = {
  comments: CommunityComment[];
  interactionUrl: string;
  topic?: CommunityTopic | null;
  total: number;
};

function formatCommentTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '刚刚';
  }
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
}

function getFallbackName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 2) : '匿';
}

function CommentItem({ comment, isReply = false }: { comment: CommunityComment; isReply?: boolean }) {
  return (
    <div className={`flex items-start gap-3 ${isReply ? 'rounded-md bg-muted/35 p-3' : ''}`}>
      <Avatar className={isReply ? 'h-8 w-8' : 'h-10 w-10'}>
        {comment.userAvatar ? <AvatarImage src={comment.userAvatar} alt={comment.userName} /> : null}
        <AvatarFallback>{getFallbackName(comment.userName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">{comment.userName}</p>
          <span className="text-xs text-muted-foreground">{formatCommentTime(comment.createdAt)}</span>
          {comment.likeCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ThumbsUp className="h-3 w-3" />
              {comment.likeCount}
            </span>
          ) : null}
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

export function CommentSection({ comments, interactionUrl, topic, total }: CommentSectionProps) {
  return (
    <Card className="mt-12">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-primary" />
            社区讨论
          </CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{total} 条讨论</span>
            {topic ? <Badge variant="outline">#{topic.name}</Badge> : null}
          </div>
        </div>
        <Button asChild size="sm">
          <a href={interactionUrl} target="_blank" rel="noopener noreferrer">
            前往主站互动
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id || `${comment.userName}-${comment.createdAt}`} className="space-y-3">
                <CommentItem comment={comment} />
                {comment.replies.length > 0 ? (
                  <div className="ml-6 space-y-3 border-l border-border/60 pl-4">
                    {comment.replies.map((reply) => (
                      <CommentItem
                        key={reply.id || `${reply.userName}-${reply.createdAt}`}
                        comment={reply}
                        isReply
                      />
                    ))}
                    {comment.replyHasMore ? (
                      <a
                        className="inline-flex text-sm text-primary hover:underline"
                        href={interactionUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        查看全部 {comment.replyTotal} 条回复
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-6 text-center">
            <p className="font-medium text-foreground">这篇内容还在等待第一条讨论</p>
            <p className="mt-2 text-sm text-muted-foreground">
              评论与回复会从主站社区同步展示，发布互动请进入对应话题页。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
