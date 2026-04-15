'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Brain, Rocket, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreatePathPage() {
    const [goal, setGoal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleGenerate = async () => {
        if (goal.length < 5) {
            setError('Please describe your goal in more detail.');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const response = await fetch('/api/learning-paths/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal }),
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // Successfully generated
            router.push(`/learning-paths/${data.path.id}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Something went wrong while generating your path.');
            setIsGenerating(false);
        }
    };

    const loadingSteps = [
        "Analyzing existing courses...",
        "Reviewing your learning goals...",
        "Mapping prerequisites...",
        "Designing custom bridge units...",
        "Finalizing your curriculum..."
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />

            <main className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center">
                <div className="max-w-3xl w-full space-y-12">
                    {!isGenerating ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                <Brain className="w-4 h-4" /> AI Goal Intelligence
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1]">
                                What do you want to <span className="text-indigo-600">master</span> today?
                            </h1>
                            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                                Tell us your career goal or interest, and Prof. AI will design a perfect, step-by-step curriculum just for you.
                            </p>

                            <div className="pt-8 flex flex-col items-center space-y-4">
                                <div className="w-full relative group">
                                    <input
                                        type="text"
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        placeholder="e.g., Become a Senior Frontend Engineer at a top tech company"
                                        className="w-full p-6 pr-24 text-xl rounded-[2rem] border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 focus:ring-4 ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-white shadow-xl group-hover:shadow-2xl"
                                    />
                                    <Button
                                        onClick={handleGenerate}
                                        className="absolute right-3 top-3 bottom-3 rounded-2xl bg-indigo-600 hover:bg-black text-white px-8 transition-all font-bold flex items-center gap-2"
                                    >
                                        Design <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </div>
                                {error && <p className="text-red-500 font-medium">{error}</p>}

                                <div className="flex flex-wrap justify-center gap-3 pt-4">
                                    {['React Developer', 'Cloud Architect', 'AI Researcher', 'Product Design'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setGoal(`I want to be a ${tag}`)}
                                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-12 text-center"
                        >
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                                <div className="relative bg-white dark:bg-slate-900 w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-indigo-100 dark:border-white/10">
                                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Prof. AI is designing your future...</h2>
                                <div className="flex justify-center">
                                    <div className="h-1 w-64 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 15, ease: "linear" }}
                                            className="h-full bg-indigo-600"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 min-h-[40px]">
                                    <AnimatePresence mode="wait">
                                        {loadingSteps.map((step, i) => (
                                            <motion.p
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ delay: i * 2 }}
                                                className="text-slate-500 font-medium"
                                            >
                                                {step}
                                            </motion.p>
                                        )).slice(-1)}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <Card className="max-w-md mx-auto bg-slate-50 dark:bg-white/5 border-none shadow-sm rounded-3xl">
                                <CardContent className="p-6 flex items-start gap-4 text-left">
                                    <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-2xl text-indigo-600">
                                        <Rocket className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>Did you know?</strong> Structured learning paths increase retention by 40% compared to ad-hoc course browsing.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
