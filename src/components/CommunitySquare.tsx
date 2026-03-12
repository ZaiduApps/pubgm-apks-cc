'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Input } from './ui/input';

const mockComments = [
  {
    user: '战地老兵',
    avatar: 'https://placehold.co/40x40.png?text=B',
    comment: '新版本玩法挺有意思，期待后续继续加强平衡性。',
    date: '15分钟前',
  },
  {
    user: '快递员小哥',
    avatar: 'https://placehold.co/40x40.png?text=K',
    comment: '有没有一起打地铁逃生的队友？晚上固定开黑。',
    date: '28分钟前',
  },
  {
    user: '新手保护卡',
    avatar: 'https://placehold.co/40x40.png?text=X',
    comment: '刚入坑，请问大家更推荐哪把步枪？',
    date: '1小时前',
  },
  {
    user: '狙神女王',
    avatar: 'https://placehold.co/40x40.png?text=S',
    comment: '登录排查那篇文章帮我解决了问题，感谢分享。',
    date: '3小时前',
  },
];

export function CommunitySquare() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>交流广场</CardTitle>
        <Button variant="link" size="sm" className="h-auto p-0 text-primary">
          查看全部 <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockComments.map((comment, index) => (
            <div key={index} className="flex items-start space-x-4 text-sm">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.avatar} alt={comment.user} />
                <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <p className="font-semibold text-foreground">{comment.user}</p>
                  <p className="text-xs text-muted-foreground">{comment.date}</p>
                </div>
                <p className="text-muted-foreground">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <form className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png?text=U" alt="你的头像" />
              <AvatarFallback>你</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input placeholder="你的昵称 *" type="text" required />
                <Input placeholder="你的邮箱 *" type="email" required />
              </div>
              <Textarea placeholder="有什么新鲜事想分享给大家？ *" rows={2} required />
              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  发布
                </Button>
              </div>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
