import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { serializeLearningPath } from '@/lib/models/LearningPath';
import { notFound } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Circle, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LearningPathDetailPage({ params }: { params: { id: string, locale: string } }) {
    const { id } = params;
    const { userId } = await auth();

    const db = await getDatabase();
    const pathDoc = await db.collection('learningPaths').findOne({ _id: new ObjectId(id) });

    if (!pathDoc) return notFound();

    const path = serializeLearningPath(pathDoc as any);

    // Fetch course details for the steps
    const courseIds = path.courses.map(c => c.courseId).filter(id => ObjectId.isValid(id));
    const courses = await db.collection('courses').find({
        _id: { $in: courseIds.map(id => new ObjectId(id)) }
    }).toArray();

    const courseMap = new Map(courses.map(c => [String(c._id), c]));

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-200 pt-12 pb-8">
                <div className="container mx-auto px-4">
                    <Link href="/learning-paths" className="text-indigo-600 font-bold flex items-center gap-2 mb-6 hover:underline">
                        ← Back to Paths
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-indigo-100 text-indigo-700 font-black">AI GENERATED</Badge>
                                <Badge variant="info">{path.difficulty}</Badge>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900">{path.title}</h1>
                            <p className="text-lg text-slate-600 max-w-2xl">{path.description}</p>
                        </div>
                        <div className="flex gap-4">
                            <Button size="lg" className="bg-indigo-600 text-white rounded-2xl px-8 font-bold">
                                Renew Path
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <BookOpen className="text-indigo-600" /> Your Curriculum
                    </h2>

                    <div className="space-y-4">
                        {path.courses.map((step, index) => {
                            const course = courseMap.get(step.courseId);
                            return (
                                <div key={index} className="group relative">
                                    {index < path.courses.length - 1 && (
                                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200 -z-10" />
                                    )}
                                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex items-start gap-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black relative overflow-hidden group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-slate-900">{course?.title || 'Unknown Course'}</h3>
                                                <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-100">Recommended</Badge>
                                            </div>
                                            <p className="text-slate-500 text-sm line-clamp-2">
                                                {course?.description || 'This course is part of your AI-generated curriculum to help you reach your mastery goal.'}
                                            </p>
                                            <div className="flex items-center gap-4 pt-4">
                                                {course ? (
                                                    <Link href={`/courses/${course.slug}`}>
                                                        <Button variant="inverse" size="sm" className="rounded-xl flex items-center gap-2">
                                                            Go to Course <ChevronRight size={16} />
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button disabled size="sm" variant="ghost" className="rounded-xl">Course Unavailable</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-16 p-8 bg-indigo-600 rounded-[3rem] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                            <Sparkles size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-2xl font-black">Need a deeper dive?</h3>
                            <p className="text-indigo-100 max-w-lg">
                                Your AI path is adaptive. As you complete these courses, you can regenerate the path to include more advanced topics or bridge any specific knowledge gaps you discover.
                            </p>
                            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-bold px-8">
                                Ask Prof. AI for help
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
