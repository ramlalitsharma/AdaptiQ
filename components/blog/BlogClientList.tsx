"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Search, ArrowUpRight, BookOpen } from 'lucide-react';

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1510915228340-45c4f29df81c?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80',
];

function getFallbackImage(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[index];
}

export function BlogClientList({ initialPosts }: { initialPosts: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState(initialPosts);

    useEffect(() => {
        const results = initialPosts.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setTimeout(() => setFilteredPosts(results), 0);
    }, [searchTerm, initialPosts]);

    const featuredPost = filteredPosts[0];
    const remainingPosts = filteredPosts.slice(1);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
            <section className="relative overflow-hidden pt-32 pb-20">
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto text-center space-y-6"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                            AdaptIQ <span className="text-indigo-400">Insights</span>
                        </h1>
                        <div className="flex items-center justify-center pt-8">
                            <div className="relative w-full max-w-lg group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <main className="container mx-auto px-4 pb-32">
                {!filteredPosts.length ? (
                    <p className="text-center py-20 text-slate-500">No articles found.</p>
                ) : (
                    <div className="space-y-24">
                        {featuredPost && (
                            <Link href={`/blog/${featuredPost.slug}`} className="block group">
                                <div className="grid lg:grid-cols-2 gap-8 items-center bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-4">
                                    <img
                                        src={featuredPost.coverImage || getFallbackImage(featuredPost.title)}
                                        alt={featuredPost.title}
                                        className="rounded-[2rem] aspect-video object-cover"
                                    />
                                    <div className="p-8 space-y-4">
                                        <h2 className="text-4xl font-bold text-white group-hover:text-indigo-400">{featuredPost.title}</h2>
                                        <p className="text-slate-400 line-clamp-3">{featuredPost.excerpt}</p>
                                        <div className="text-indigo-400 font-semibold flex items-center gap-2">
                                            Read Full Article <ArrowUpRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {remainingPosts.map((post: any) => (
                                <Link key={post._id} href={`/blog/${post.slug}`} className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group">
                                    <img src={post.coverImage || getFallbackImage(post.title)} alt={post.title} className="aspect-video object-cover" />
                                    <div className="p-6 space-y-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400">{post.title}</h3>
                                        <p className="text-slate-400 text-sm line-clamp-2">{post.excerpt}</p>
                                        <div className="text-indigo-400 text-sm font-semibold flex items-center gap-2">
                                            Read More <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
