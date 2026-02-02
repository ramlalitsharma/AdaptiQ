import { NewsService } from '@/lib/news-service';
import { Link } from '@/lib/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Newspaper, TrendingUp, ShieldAlert, BarChart3, Globe } from 'lucide-react';
import { requireContentWriter } from '@/lib/admin-check';
import { format } from 'date-fns';
import { FadeIn } from '@/components/ui/Motion';

export const dynamic = 'force-dynamic';

export default async function NewsStudioPage() {
    await requireContentWriter();
    const news = await NewsService.getAllNews().catch(() => []);

    return (
        <div className="min-h-screen bg-elite-bg text-slate-100 p-8 lg:p-12 space-y-16 selection:bg-elite-accent-cyan/30">
            {/* Header / Brand Strip */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-elite-accent-cyan rounded-[2rem] flex items-center justify-center text-black font-black text-3xl shadow-2xl shadow-elite-accent-cyan/20">
                        RT
                    </div>
                    <div className="space-y-1">
                        <FadeIn>
                            <h1 className="text-4xl lg:text-5xl font-black flex items-center gap-4 tracking-tighter uppercase text-white leading-none">
                                Intelligence <span className="text-gradient-cyan">Studio</span>
                            </h1>
                        </FadeIn>
                        <FadeIn delay={0.1}>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-slate-800" /> Professional Terminal | Node: Primary Core
                            </p>
                        </FadeIn>
                    </div>
                </div>
                <FadeIn delay={0.2}>
                    <Link href="/admin/studio/news/create">
                        <Button className="bg-white text-black hover:bg-elite-accent-cyan shadow-xl transition-all font-black uppercase text-[10px] tracking-[0.3em] h-16 px-12 rounded-[2rem]">
                            <Plus className="w-5 h-5 mr-3" />
                            Initialize Report
                        </Button>
                    </Link>
                </FadeIn>
            </div>

            {/* Performance Monitoring Indices */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Network Assets', value: news.length, color: 'text-white', icon: Newspaper, accent: 'cyan' },
                    { label: 'Live Deployments', value: news.filter((n: any) => n.status === 'published').length, color: 'text-elite-accent-emerald', icon: Globe, accent: 'emerald' },
                    { label: 'Staged Buffer', value: news.filter((n: any) => n.status === 'draft').length, color: 'text-elite-accent-purple', icon: ShieldAlert, accent: 'purple' },
                    { label: 'Pulse Anomalies', value: news.filter((n: any) => n.is_trending).length, color: 'text-elite-accent-cyan', icon: TrendingUp, accent: 'cyan' }
                ].map((stat, index) => (
                    <FadeIn key={stat.label} delay={index * 0.05 + 0.3}>
                        <div className="glass-card-premium p-10 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-elite-accent-${stat.accent}/5 rounded-full blur-3xl`} />
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">{stat.label}</span>
                                <stat.icon size={16} className={`text-elite-accent-${stat.accent}`} />
                            </div>
                            <span className={`text-6xl font-black ${stat.color} tracking-tighter`}>{stat.value}</span>
                        </div>
                    </FadeIn>
                ))}
            </div>

            {/* Main Terminal (Table) */}
            <FadeIn delay={0.5}>
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3">
                            <BarChart3 size={14} className="text-elite-accent-cyan" /> Intelligence Asset Ledger
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-elite-accent-cyan transition-colors" />
                                <input
                                    placeholder="Scan Protocol..."
                                    className="pl-14 pr-8 h-12 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-elite-accent-cyan/50 focus:bg-white/10 transition-all w-72 placeholder:text-slate-700"
                                />
                            </div>
                            <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {news.length === 0 ? (
                        <div className="text-center py-40 glass-card-premium rounded-[4rem] border border-dashed border-white/5">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-white/5">
                                <Newspaper className="w-10 h-10 text-slate-700" />
                            </div>
                            <h3 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Terminal Idle</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-4 mb-12 font-black uppercase text-[10px] tracking-[0.4em] leading-relaxed">
                                No global intelligence reports detected in local buffer. Initialize a broadcast to populate.
                            </p>
                            <Link href="/admin/studio/news/create">
                                <Button className="bg-elite-accent-cyan text-black px-12 h-16 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-elite-accent-cyan/20 hover:bg-white transition-all">Establish Relay</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="glass-card-premium rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] bg-white/5">
                                        <th className="p-10 border-b border-white/5">Intelligence Asset</th>
                                        <th className="p-10 border-b border-white/5 text-center">Sector</th>
                                        <th className="p-10 border-b border-white/5 text-center">Protocol Stutus</th>
                                        <th className="p-10 border-b border-white/5 text-right pr-16">Data Access</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {news.map((item: any) => (
                                        <tr key={item.id} className="group hover:bg-white/5 transition-all">
                                            <td className="p-10">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-28 h-18 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/5 p-1 relative">
                                                        {item.cover_image ? (
                                                            <img
                                                                src={item.cover_image}
                                                                alt=""
                                                                className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-1000"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-white/5 flex items-center justify-center rounded-xl">
                                                                <Newspaper className="w-6 h-6 text-slate-800" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-xl font-black text-white group-hover:text-elite-accent-cyan transition-all line-clamp-1 uppercase tracking-tighter">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4">
                                                            {item.is_trending && (
                                                                <span className="text-elite-accent-cyan text-[8px] font-black uppercase tracking-[0.2em] animate-pulse flex items-center gap-1.5">
                                                                    <TrendingUp size={10} /> TRENDING PULSE
                                                                </span>
                                                            )}
                                                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                                {item.category || 'General'}
                                            </td>
                                            <td className="p-10 text-center">
                                                <span className={`inline-flex items-center px-5 py-2.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-[0.3em] border ${item.status === 'published'
                                                    ? 'bg-elite-accent-emerald/10 text-elite-accent-emerald border-elite-accent-emerald/20 shadow-lg shadow-elite-accent-emerald/5'
                                                    : 'bg-elite-accent-purple/10 text-elite-accent-purple border-elite-accent-purple/20'
                                                    }`}>
                                                    {item.status === 'published' ? 'Active Relay' : 'Draft Staged'}
                                                </span>
                                            </td>
                                            <td className="p-10 text-right pr-16">
                                                <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0">
                                                    <Link href={`/news/${item.slug}`} target="_blank">
                                                        <Button size="sm" variant="ghost" className="h-12 w-12 p-0 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/studio/news/edit/${item.id}`}>
                                                        <Button size="sm" variant="ghost" className="h-12 w-12 p-0 rounded-2xl border border-white/5 bg-white/5 hover:bg-elite-accent-cyan/10 hover:text-elite-accent-cyan group/edit transition-all">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button size="sm" variant="ghost" className="h-12 w-12 p-0 rounded-2xl border border-white/5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all">
                                                        <Trash2 className="w-4 h-4" />
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
            </FadeIn>
        </div>
    );
}
