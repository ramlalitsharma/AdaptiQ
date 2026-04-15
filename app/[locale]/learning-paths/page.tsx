import { auth } from '@/lib/auth';
import { LearningPathService } from '@/lib/learning-path-service';
import { LearningPathCard } from '@/components/learning/LearningPathCard';
import { Button } from '@/components/ui/Button';
import { Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LearningPathsPage() {
    const { userId } = await auth();
    const userPaths = userId ? await LearningPathService.getUserPaths(userId) : [];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                            Accelerated <span className="text-indigo-600">Learning Paths</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                            Skip the guesswork. Join structured journeys designed by experts or let our AI build a custom curriculum tailored to your career goals.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/learning-paths/create">
                                <Button size="xl" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" /> Generate My AI Path
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 space-y-16">
                {userPaths.length > 0 && (
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900">Your AI Paths</h2>
                                <p className="text-slate-500">Customized learning journeys designed for your goals.</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {userPaths.map((path) => (
                                <LearningPathCard key={path.id} path={path as any} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Featured Paths Placeholder */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">Featured Curriculums</h2>
                            <p className="text-slate-500">Industry-standard paths chosen by thousands of learners.</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Logic to fetch public paths could go here */}
                        <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4 md:col-span-3">
                            <div className="bg-slate-100 p-4 rounded-full text-slate-400">
                                <Plus size={40} />
                            </div>
                            <p className="text-slate-500 font-medium">Explore standard paths or create your own with AI.</p>
                            <Link href="/learning-paths/create">
                                <Button variant="outline" className="rounded-xl">Start AI Goal Creator</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
