import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function QuizzesPage() {
    const { userId } = await auth();
    const db = await getDatabase();
    const banks = await db
        .collection('questionBanks')
        .find({ type: 'quiz' })
        .sort({ updatedAt: -1, name: 1 })
        .toArray();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quizzes & Practice Tests</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Test your knowledge with our curated collection of quizzes and practice exams.
                    </p>
                </div>

                {banks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📝</div>
                        <h3 className="text-lg font-medium">No quizzes available yet</h3>
                        <p className="text-slate-500">Check back later for new practice tests.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {banks.map((bank: any) => (
                            <Card key={String(bank._id)} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant={bank.examType ? 'default' : 'info'}>
                                            {bank.examType || 'General'}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl line-clamp-2">{bank.name}</CardTitle>
                                    <CardDescription>{bank.subject}</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto pt-0">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {bank.tags?.map((tag: string) => (
                                            <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <Link href={`/quizzes/${String(bank._id)}`}>
                                        <Button className="w-full">Start Quiz</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
