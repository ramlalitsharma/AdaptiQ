'use client';

import { useState } from 'react';
import { Share2, Link as LinkIcon, Twitter, Linkedin, Facebook, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { trackShare } from '@/lib/analytics';

interface SocialShareProps {
    url: string;
    title: string;
    contentType: 'course' | 'blog' | 'exam';
    contentId: string;
}

export function SocialShare({ url, title, contentType, contentId }: SocialShareProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareLinks = [
        {
            name: 'Twitter',
            icon: <Twitter className="w-4 h-4" />,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            color: 'hover:bg-sky-500 hover:text-white',
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin className="w-4 h-4" />,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            color: 'hover:bg-blue-700 hover:text-white',
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-4 h-4" />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: 'hover:bg-blue-600 hover:text-white',
        },
    ];

    const handleCopyLink = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        trackShare(contentType, contentId, 'link');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareClick = (method: string) => {
        trackShare(contentType, contentId, method.toLowerCase());
    };

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all shadow-sm"
            >
                <Share2 className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-700 dark:text-slate-200">Share</span>
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="space-y-1">
                                {shareLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => handleShareClick(link.name)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 transition-all ${link.color}`}
                                    >
                                        {link.icon}
                                        <span>Share on {link.name}</span>
                                    </a>
                                ))}

                                <hr className="my-2 border-slate-100 dark:border-slate-800" />

                                <button
                                    onClick={handleCopyLink}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <LinkIcon className={`w-4 h-4 ${copied ? 'text-emerald-500' : ''}`} />
                                        <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
                                    </div>
                                    {copied && <Check className="w-4 h-4 text-emerald-500" />}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
