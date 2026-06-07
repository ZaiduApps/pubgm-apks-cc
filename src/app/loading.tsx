export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">内容加载中</p>
          <p className="mt-1 text-xs text-muted-foreground">正在读取专题配置与社区数据</p>
        </div>
      </div>
    </div>
  );
}
