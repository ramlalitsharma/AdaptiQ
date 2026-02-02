'use client';

import { useState, useEffect } from 'react';
import { FadeIn } from '@/components/ui/Motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Search, Edit2, Trash2, Globe, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { News } from '@/lib/models/News';
import { toast } from 'react-hot-toast';

export default function NewsStudioPage() {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch('/api/admin/news');
            if (!res.ok) throw new Error('Failed to fetch news');
            const data = await res.json();
            setNews(data);
        } catch (error) {
            console.error(error);
            toast.error('Could not load news articles');
        } finally {
            setLoading(false);
        }
    };

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <FadeIn>
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">News Studio</h1>
                            <p className="text-slate-500 font-medium">Manage platform updates and announcements on Supabase.</p>
                        </div>
                        <Link href="/admin/news/new">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 shadow-lg shadow-blue-200">
                                <Plus size={18} />
                                Create Article
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-6">
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search articles..."
                                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-12 text-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Content...</p>
                                    </div>
                                ) : filteredNews.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">
                                                    <th className="px-6 py-4">Article</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Category</th>
                                                    <th className="px-6 py-4">Last Updated</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filteredNews.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                                    <FileText size={20} />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{item.title}</div>
                                                                    <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{item.slug}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={item.status === 'published' ? 'default' : 'outline'} className={item.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}>
                                                                {item.status.toUpperCase()}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                                                                {item.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs text-slate-500 font-medium">
                                                                {format(new Date(item.updated_at), 'MMM dd, yyyy')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link href={`/admin/news/${item.id}`}>
                                                                    <Button size="xs" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                                        <Edit2 size={16} />
                                                                    </Button>
                                                                </Link>
                                                                <Button size="xs" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-20 text-center">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-50 text-slate-300 mb-6">
                                            <Plus size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Articles Found</h3>
                                        <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">Start building your platform's news by creating your first article on Supabase.</p>
                                        <Link href="/admin/news/new">
                                            <Button variant="outline" className="font-bold border-slate-200">Create First Article</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
