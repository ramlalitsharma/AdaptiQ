'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FadeIn } from '@/components/ui/Motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Save, Globe, Eye, Image as ImageIcon, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { News } from '@/lib/models/News';
import { MediaUploader } from '@/components/admin/MediaUploader';

export default function NewsEditorPage() {
    const { id } = useParams();
    const router = useRouter();
    const isNew = id === 'new';

    const [formData, setFormData] = useState<Partial<News>>({
        title: '',
        slug: '',
        summary: '',
        content: '',
        category: 'Product Update',
        status: 'draft'
    });
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew) {
            fetchItem();
        }
    }, [id, isNew]);

    const fetchItem = async () => {
        try {
            const res = await fetch(`/api/admin/news/${id}`);
            if (!res.ok) throw new Error('Failed to fetch article');
            const data = await res.json();
            setFormData(data);
        } catch (error) {
            toast.error('Failed to load article');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (publish = false) => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                status: publish ? 'published' : formData.status || 'draft'
            };

            const res = await fetch('/api/admin/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success(publish ? 'Article Published! 🚀' : 'Progress Saved');
            router.push('/admin/news');
        } catch (error) {
            toast.error('Could not save article');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase text-slate-300 tracking-widest">Loading Editor...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/news">
                            <Button size="xs" variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100">
                                <ChevronLeft size={20} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 leading-none">
                                {isNew ? 'Create New Article' : 'Edit News Article'}
                            </h1>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stored on Supabase Content DB</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => handleSave(false)} isLoading={saving && formData.status === 'draft'}>
                            Save Draft
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={() => handleSave(true)} isLoading={saving && formData.status === 'published'}>
                            <Globe size={16} />
                            Publish to Live
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-10 grid gap-8 lg:grid-cols-[1fr,320px]">
                <div className="space-y-8">
                    <FadeIn>
                        <Card className="border-none shadow-xl overflow-hidden bg-white">
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Title</label>
                                    <input
                                        className="w-full text-3xl font-black text-slate-900 border-none p-0 focus:ring-0 placeholder:text-slate-200"
                                        placeholder="Type a catchy headline..."
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary / Excerpt</label>
                                    <textarea
                                        className="w-full min-h-[100px] text-lg text-slate-600 border-none p-0 focus:ring-0 placeholder:text-slate-200 resize-none font-medium leading-relaxed"
                                        placeholder="Brief summary to hook your readers..."
                                        value={formData.summary}
                                        onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                                    />
                                </div>

                                <hr className="border-slate-50" />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Body</label>
                                        <div className="flex gap-2">
                                            <Button size="xs" variant="ghost" className="text-blue-600 font-bold bg-blue-50">
                                                <Sparkles size={14} className="mr-1" /> AI Refine
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Integrated TipTap replacement for now */}
                                    <textarea
                                        className="w-full min-h-[400px] bg-slate-50/50 rounded-2xl p-6 text-slate-700 border-2 border-dashed border-slate-100 focus:border-blue-200 focus:outline-none transition-all"
                                        placeholder="Start writing the full story..."
                                        value={formData.content as string}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </FadeIn>
                </div>

                <div className="space-y-6">
                    <FadeIn delay={0.1}>
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-50">
                                <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Article Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Category</label>
                                    <select
                                        className="w-full rounded-xl border-slate-200 text-sm font-bold bg-white"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    >
                                        <option>Product Update</option>
                                        <option>Partnership</option>
                                        <option>Course News</option>
                                        <option>Events</option>
                                        <option>Community</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Clean URL Slug</label>
                                    <div className="relative">
                                        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={14} />
                                        <input
                                            type="text"
                                            className="w-full pl-9 rounded-xl border-slate-200 text-sm font-bold bg-slate-50 text-slate-500"
                                            value={formData.slug}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <hr className="border-slate-50" />

                                <div className="space-y-4">
                                    <MediaUploader
                                        label="Banner Image"
                                        currentValue={formData.banner_image}
                                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, banner_image: url }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </FadeIn>

                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Eye size={16} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Live Preview</h4>
                                <p className="text-[10px] text-blue-700 font-medium leading-relaxed">Changes are reflected instantly in the news feed after publishing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
