'use client';

import { useState } from 'react';
import { Share2, Users, Copy, Check, Gift, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_URL } from '@/lib/brand';

interface ReferralDashboardProps {
    referralCode: string;
    referralCount: number;
}

export function ReferralDashboard({ referralCode, referralCount }: ReferralDashboardProps) {
    const [copied, setCopied] = useState(false);
    const referralLink = `${BRAND_URL}/signup?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        {
            name: 'Twitter',
            icon: <Twitter className="w-5 h-5" />,
            url: `https://twitter.com/intent/tweet?text=Join me on AdaptiQ and master any subject with AI!&url=${encodeURIComponent(referralLink)}`,
            color: 'bg-black text-white hover:bg-slate-800'
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin className="w-5 h-5" />,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
            color: 'bg-[#0077B5] text-white hover:bg-[#006da5]'
        }
    ];

    return (
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Users size={120} />
                </div>
                <CardTitle className="text-3xl font-black mb-2 flex items-center gap-3">
                    Invite & Earn <Gift className="w-8 h-8" />
                </CardTitle>
                <p className="text-indigo-100 font-medium max-w-md">
                    Help your friends master their future. For every friend who joins, you'll earn 100 Bonus XP!
                </p>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-sm uppercase tracking-widest font-black text-slate-400">Your Referral Link</h4>
                        <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5 transition-all focus-within:ring-2 ring-indigo-500">
                            <code className="flex-1 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                                {referralLink}
                            </code>
                            <Button
                                onClick={handleCopy}
                                className="rounded-xl px-6 font-bold flex items-center gap-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 shadow-sm"
                            >
                                <AnimatePresence mode="wait">
                                    {copied ? (
                                        <motion.div
                                            key="checked"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="flex items-center gap-2 text-emerald-500"
                                        >
                                            <Check className="w-4 h-4" /> Copied
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="copy"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Copy className="w-4 h-4" /> Copy
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm uppercase tracking-widest font-black text-slate-400">Total Referrals</h4>
                        <div className="flex items-center gap-6">
                            <div className="text-5xl font-black text-slate-900 dark:text-white">
                                {referralCount}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                                    +{referralCount * 100} Total XP Earned
                                </div>
                                <div className="text-xs text-slate-500 font-medium">
                                    Refreshes every 24 hours
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
                    <h4 className="text-center md:text-left text-sm uppercase tracking-widest font-black text-slate-400">Quick Share</h4>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        {shareOptions.map((option) => (
                            <a
                                key={option.name}
                                href={option.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all ${option.color}`}
                            >
                                {option.icon}
                                <span>Share on {option.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
