"use client";

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, Share2, Bookmark, CheckCircle } from 'lucide-react';
import Link from 'lucide-react'; // Wait, Link should be from next/link
import { BlogComments } from '@/components/blog/BlogComments';

// Fix Link import
import NextLink from 'next/link';
import { SocialShare } from '@/components/ui/SocialShare';
import { BRAND_URL } from '@/lib/brand';

export function BlogPostClient({ post, slug, children }: { post: any, slug: string, children: React.ReactNode }) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const imageUrl = post.coverImage || post.metadata?.heroImage;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 z-[100] origin-left"
                style={{ scaleX }}
            />

            <header className="relative w-full h-[70vh] flex items-end justify-start overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    {imageUrl && <img src={imageUrl} alt={post.title} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
                </motion.div>

                <div className="container mx-auto px-4 pb-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="max-w-4xl space-y-6"
                    >
                        <NextLink
                            href="/blog"
                            className="inline-flex items-center gap-2 text-indigo-400 font-medium pb-4 hover:gap-4 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" /> All Stories
                        </NextLink>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 font-medium">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-white">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-white">
                                <Clock className="w-4 h-4" />
                                <span>8 min read</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                                {post.title}
                            </h1>
                            <div className="hidden md:block">
                                <SocialShare
                                    url={`${BRAND_URL}/blog/${slug}`}
                                    title={post.title}
                                    contentType="blog"
                                    contentId={slug}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <main className="container mx-auto px-4 -mt-10 pb-32">
                <div className="grid lg:grid-cols-[1fr,minmax(0,100px)] gap-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="max-w-3xl mx-auto w-full"
                    >
                        <article className="prose prose-invert prose-indigo lg:prose-xl max-w-none">
                            {children}
                        </article>

                        <div className="mt-20 pt-12 border-t border-slate-800 flex flex-col md:flex-row items-center gap-8 bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                {post.authorId?.slice(0, 1) || 'A'}
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <h4 className="text-xl font-bold text-white">Editorial Board</h4>
                                    <CheckCircle className="w-5 h-5 text-indigo-400" />
                                </div>
                                <p className="text-slate-400">
                                    This article was authored and vetted by the AdaptIQ editorial team.
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-center md:justify-start">
                            <SocialShare
                                url={`${BRAND_URL}/blog/${slug}`}
                                title={post.title}
                                contentType="blog"
                                contentId={slug}
                            />
                        </div>

                        <BlogComments blogSlug={slug} />
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
