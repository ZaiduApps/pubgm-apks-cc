
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const mockComments = [
  {
    user: '职业玩家123',
    avatar: 'https://placehold.co/40x40.png?text=P',
    comment: '很棒的攻略！关于使用新抓爬机制的技巧真的帮到我的队伍了。',
    date: '2小时前',
  },
  {
    user: '狙神女王',
    avatar: 'https://placehold.co/40x40.png?text=S',
    comment: '对M416和Beryl的分析很到位。我还是坚持用Beryl，火力更猛。',
    date: '5小时前',
  },
];

export function CommentSection() {
  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle>社区讨论</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png?text=U" alt="你的头像" />
              <AvatarFallback>你</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <form>
                <Textarea
                  placeholder="加入讨论..."
                  className="mb-2"
                  rows={3}
                />
                <Button type="submit">发表评论</Button>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {mockComments.map((comment, index) => (
            <div key={index} className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={comment.avatar} alt={comment.user} />
                <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-foreground">{comment.user}</p>
                  <p className="text-xs text-muted-foreground">{comment.date}</p>
                </div>
                <p className="text-muted-foreground">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

    