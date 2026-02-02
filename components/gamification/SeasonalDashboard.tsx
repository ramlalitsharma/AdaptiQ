'use client';

import { motion } from 'framer-motion';
import { Sparkles, Trophy, ChevronRight, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';

interface SeasonalChallenge {
    id: string;
    title: string;
    themeColor: string;
    progressPercent: number;
    rewardBadgeId: string;
    daysRemaining: number;
}

interface SeasonalDashboardProps {
    challenges: SeasonalChallenge[];
}

export function SeasonalDashboard({ challenges }: SeasonalDashboardProps) {
    if (challenges.length === 0) return null;

    return (
        <div className="space-y-4">
            {challenges.map((challenge) => (
                <motion.div
                    key={challenge.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative overflow-hidden group bg-white rounded-3xl p-6 shadow-2xl border border-slate-50"
                >
                    {/* Background Decoration */}
                    <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-10 transition-colors bg-${challenge.themeColor || 'indigo'}-500`} />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-2xl bg-${challenge.themeColor || 'indigo'}-50 text-${challenge.themeColor || 'indigo'}-600`}>
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                                        Seasonal Event
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                        Expires in {challenge.daysRemaining} days
                                    </p>
                                </div>
                            </div>
                            <Zap className="text-amber-500 animate-pulse" size={16} fill="currentColor" />
                        </div>

                        <div className="mb-6">
                            <h4 className="text-xl font-black text-slate-900 mb-2 truncate">{challenge.title}</h4>
                            <div className="flex items-center gap-4">
                                <Progress value={challenge.progressPercent} color={challenge.themeColor || 'indigo'} className="h-2.5 bg-slate-100" />
                                <span className="text-xs font-black text-slate-900">{challenge.progressPercent}%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                    <Trophy size={14} />
                                </div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    REWARD: <span className="text-slate-900">LIMITED EDITION BADGE</span>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-slate-50 group">
                                Enter Hub <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
