import { NewsService } from '@/lib/news-service';
import { Link } from '@/lib/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Newspaper, TrendingUp } from 'lucide-react';
import { requireContentWriter } from '@/lib/admin-check';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function NewsStudioPage() {
    await requireContentWriter();
    const news = await NewsService.getAllNews().catch(() => []);

    return (
        <div className="min-h-screen bg-[#fdfdfc] news-paper-theme p-8 space-y-12">
            {/* Header / Brand Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-200 pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-500/20">
                        TT
                    </div>
                    <div>
                        <h1 className="text-4xl font-black flex items-center gap-3 tracking-tighter uppercase font-serif">
                            <span className="text-red-700">Terai Times</span> <span className="text-slate-900 leading-none">News Studio</span>
                        </h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
                            Professional Newsroom Terminal | Refectl Intelligence Agency
                        </p>
                    </div>
                </div>
                <Link href="/admin/studio/news/create">
                    <Button className="bg-red-700 hover:bg-black text-white shadow-xl shadow-red-500/20 transition-all hover:scale-105 font-black uppercase text-xs tracking-[0.2em] h-14 px-10 rounded-2xl">
                        <Plus className="w-5 h-5 mr-3" />
                        Initialize Report
                    </Button>
                </Link>
            </div>

            {/* Editorial Pulse Indices (Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Intelligence', value: news.length, color: 'text-slate-900' },
                    { label: 'Deployed Reports', value: news.filter((n: any) => n.status === 'published').length, color: 'text-red-700' },
                    { label: 'Pending Drafts', value: news.filter((n: any) => n.status === 'draft').length, color: 'text-amber-600' },
                    { label: 'Trending Pulse', value: news.filter((n: any) => n.is_trending).length, color: 'text-blue-600' }
                ].map(stat => (
                    <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block mb-3 group-hover:text-red-700 transition-colors">{stat.label}</span>
                        <span className={`text-5xl font-black ${stat.color} font-serif tracking-tighter`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Archive Terminal */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                        <Newspaper size={14} /> Intelligence Archive
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                placeholder="Scan Archive..."
                                className="pl-11 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-red-700/20 focus:bg-white transition-all w-64"
                            />
                        </div>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl border border-slate-100 hover:bg-white">
                            <Filter className="w-4 h-4 text-slate-400" />
                        </Button>
                    </div>
                </div>

                {news.length === 0 ? (
                    <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-inner">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Newspaper className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-3xl font-serif font-black text-slate-900 mb-2">Archive Dormant</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mt-2 mb-10 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                            No global intelligence reports found in the terminal. Initialize a broadcast to begin.
                        </p>
                        <Link href="/admin/studio/news/create">
                            <Button className="bg-slate-900 text-white px-10 h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all">Establish Broadcast</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-50/50">
                                    <th className="p-8 border-b border-slate-100">Intelligence Asset</th>
                                    <th className="p-8 border-b border-slate-100 text-center">Region</th>
                                    <th className="p-8 border-b border-slate-100 text-center">Industry</th>
                                    <th className="p-8 border-b border-slate-100 text-center">Deployment</th>
                                    <th className="p-8 border-b border-slate-100 text-right pr-12">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {news.map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-slate-50/80 transition-all">
                                        <td className="p-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-24 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-lg border border-slate-200/50">
                                                    {item.cover_image && (
                                                        <img
                                                            src={item.cover_image}
                                                            alt=""
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1 uppercase tracking-tight font-serif">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        {item.is_trending && (
                                                            <span className="bg-red-700 text-white py-0.5 px-2 text-[8px] font-black uppercase rounded shadow-lg shadow-red-500/20">Trending</span>
                                                        )}
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                            {item.country || 'Global'}
                                        </td>
                                        <td className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {item.category || 'General'}
                                        </td>
                                        <td className="p-8 text-center">
                                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${item.status === 'published'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {item.status === 'published' ? 'Deployed' : 'Draft Intel'}
                                            </span>
                                        </td>
                                        <td className="p-8 text-right pr-12">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <Link href={`/news/${item.slug}`} target="_blank">
                                                    <Button size="sm" variant="ghost" className="h-11 w-11 p-0 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                                        <Eye className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/studio/news/edit/${item.id}`}>
                                                    <Button size="sm" variant="ghost" className="h-11 w-11 p-0 rounded-xl border border-transparent hover:border-red-100 hover:bg-red-50 group/edit transition-all">
                                                        <Edit className="w-4 h-4 text-slate-400 group-hover/edit:text-red-700" />
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="ghost" className="h-11 w-11 p-0 rounded-xl border border-transparent hover:bg-red-700 group/del transition-all">
                                                    <Trash2 className="w-4 h-4 text-slate-400 group-hover/del:text-white" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
