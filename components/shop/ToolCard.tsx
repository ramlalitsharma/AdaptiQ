'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ToolCardProps {
    tool: {
        id: string;
        name: string;
        icon: string;
        description: string;
        href?: string;
        color: string;
        price: string;
        category: string;
        features: string[];
        isUltra?: boolean;
    };
}

export function ToolCard({ tool }: ToolCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <Card className="relative h-full overflow-hidden bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors group">
                {/* Glow Effect */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />

                <div className="p-8 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-3xl shadow-lg shadow-black/20`}>
                            {tool.icon}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{tool.category}</span>
                            {tool.isUltra && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase border border-amber-500/20">
                                    Ultra Core
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow space-y-4">
                        <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">
                            {tool.name}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {tool.description}
                        </p>

                        {/* Features List */}
                        <ul className="space-y-2 pt-2">
                            {tool.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                                    <CheckCircle2 size={12} className="text-indigo-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pricing</span>
                            <span className={`text-lg font-black ${tool.price === 'FREE'
                                ? 'text-green-400'
                                : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500'
                                }`}>
                                {tool.price}
                            </span>
                        </div>

                        <Link href={tool.href || '#'}>
                            <Button
                                variant="inverse"
                                className={`rounded-xl px-5 py-2.5 bg-white text-slate-900 font-bold hover:bg-indigo-500 hover:text-white transition-all transform group-hover:translate-x-1`}
                            >
                                {tool.price === 'FREE' ? 'Launch' : 'Secure Access'}
                                <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
