import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Skeleton className="relative w-full aspect-video rounded-lg mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/4" />
        </header>

        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>

        {/* ContextualInfo Skeleton */}
        <div className="mt-12 mb-8">
            <Skeleton className="h-32 w-full rounded-lg" />
        </div>

        {/* CommentSection Skeleton */}
        <div className="mt-12">
            <Skeleton className="h-24 w-full rounded-lg mb-8" />
            <div className="space-y-6">
                <div className="flex items-start space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
                <div className="flex items-start space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
