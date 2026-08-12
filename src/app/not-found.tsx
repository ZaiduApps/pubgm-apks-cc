import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">页面未找到</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        你访问的内容不存在或已被移除，请返回首页继续浏览。
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  );
}
