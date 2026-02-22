import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
    return (
        <div className="container py-8 space-y-8">
            {/* Profile Header Skeleton */}
            <div className="glass-panel p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-4 flex-1 w-full">
                    <Skeleton className="h-8 w-1/3" />
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="space-y-6">
                <div className="flex gap-4 border-b border-white/10 pb-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-10 w-32 rounded-lg" />
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-48 rounded-xl" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
