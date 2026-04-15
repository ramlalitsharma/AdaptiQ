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
        <div className="space-y-6">
            {challenges.map((challenge) => (
                <motion.div
                    key={challenge.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative overflow-hidden glass-card-premium rounded-[2.5rem] p-8 border border-white/5"
                >
                    {/* Background Decryption Wave */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-elite-accent-purple/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-elite-accent-purple/10 border border-elite-accent-purple/20 text-elite-accent-purple">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em] mb-1">Seasonal Incursion</div>
                                    <div className="text-[10px] font-black text-elite-accent-purple uppercase tracking-widest">
                                        Time remaining: {challenge.daysRemaining} Cycles
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                <Zap className="text-amber-400" size={12} fill="currentColor" />
                                <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Active Surge</span>
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{challenge.title}</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Sync Progress</span>
                                    <span className="text-white">{challenge.progressPercent}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                                    <motion.div
                                        className="h-full bg-elite-accent-purple rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${challenge.progressPercent}%` }}
                                        transition={{ duration: 1.5, ease: 'circOut' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                                    <Trophy size={18} />
                                </div>
                                <div>
                                    <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Unlock Sequence</div>
                                    <div className="text-[9px] font-black text-white uppercase tracking-widest">LIMITED ASSET // R0-X</div>
                                </div>
                            </div>
                            <Button className="h-10 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl group transition-all">
                                Initialize Hub
                                <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
