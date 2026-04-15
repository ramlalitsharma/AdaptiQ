'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Target, Cpu } from 'lucide-react';

export function ShopHero() {
    return (
        <div className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b border-black/10 dark:border-white/10 bg-background">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                    >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium text-slate-300 uppercase tracking-widest">The Ultra Era is Here</span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight"
                    >
                        Power Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">Potential.</span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Access the world's most powerful AI agents, autonomous workflows, and strategic business tools. Designed for professionals and enterprises who demand the elite.
                    </motion.p>

                    {/* Feature Highlights */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-6 pt-4"
                    >
                        <div className="flex items-center gap-2 text-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <Cpu size={16} className="text-blue-400" />
                            </div>
                            <span className="text-sm font-semibold tracking-wide">Multi-Model AI</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <Zap size={16} className="text-indigo-400" />
                            </div>
                            <span className="text-sm font-semibold tracking-wide">Auto-Workflows</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                                <Target size={16} className="text-violet-400" />
                            </div>
                            <span className="text-sm font-semibold tracking-wide">Market ROI</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
