import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="min-h-screen news-paper-theme pb-20">
            <NewsNavbar />

            <div className="container mx-auto px-4 mt-8">
                <div className="space-y-16">
                    {/* Lead Story Skeleton */}
                    <section className="border-b-2 border-slate-900/5 pb-12">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr,450px] gap-12 items-center">
                            <div className="order-2 lg:order-1 space-y-6">
                                <div className="flex items-center gap-3">
                                    <Skeleton width={100} height={12} className="rounded-full" />
                                </div>
                                <Skeleton height={80} className="w-[90%] rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton height={20} className="w-full" />
                                    <Skeleton height={20} className="w-[95%]" />
                                    <Skeleton height={20} className="w-[85%]" />
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <Skeleton width={150} height={40} />
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <Skeleton className="aspect-[4/3] rounded-[2rem] w-full" />
                            </div>
                        </div>
                    </section>

                    {/* Secondary Stories Skeleton */}
                    <section>
                        <div className="flex items-center justify-between mb-8 pb-4">
                            <Skeleton width={200} height={24} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="aspect-[16/10] rounded-2xl w-full" />
                                    <Skeleton width={80} height={20} />
                                    <Skeleton height={32} className="w-full" />
                                    <SkeletonText lines={2} />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
