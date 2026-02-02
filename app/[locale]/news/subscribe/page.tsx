import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { Button } from '@/components/ui/Button';
import { Check, Mail, Shield } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Subscribe | Terai Times',
    description: 'Join the Terai Times Intelligence Network. Exclusive analysis, daily briefings, and global market signals.',
};

export default function SubscribePage() {
    return (
        <div className="min-h-screen bg-[#fdfdfc]">
            <Suspense>
                <NewsNavbar />
            </Suspense>

            <div className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center space-y-6 mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest border border-red-100">
                            <Shield size={12} />
                            Refectl Intelligence Agency
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black font-serif text-slate-900 tracking-tight leading-none">
                            Access the <span className="text-red-700">Intelligence</span> Stream
                        </h1>
                        <p className="text-xl text-slate-600 font-serif max-w-2xl mx-auto leading-relaxed">
                            Join elite decision-makers who rely on Terai Times for unfiltered geopolitical analysis, market signals, and strategic foresight.
                        </p>
                    </div>

                    {/* Pricing / Plan Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 relative">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-700/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="grid md:grid-cols-2">
                            {/* Left: Benefits */}
                            <div className="p-10 md:p-16 space-y-10">
                                <h3 className="text-2xl font-black text-slate-900 font-serif">Member Privileges</h3>
                                <ul className="space-y-6">
                                    {[
                                        'Daily Intelligence Briefing (06:00 AM)',
                                        'Weekly Deep-Dive Analysis',
                                        'Access to Archives & Research',
                                        'Ad-Free Reading Experience',
                                        'Priority Commenting Access'
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check size={14} className="text-green-700" />
                                            </div>
                                            <span className="text-slate-700 font-medium font-serif">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Right: Signup Form */}
                            <div className="bg-slate-50 p-10 md:p-16 flex flex-col justify-center border-l border-slate-100">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                type="email"
                                                placeholder="name@company.com"
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-red-700 focus:ring-2 focus:ring-red-700/10 outline-none transition-all font-serif bg-white"
                                            />
                                        </div>
                                    </div>
                                    <Button size="lg" className="w-full bg-red-700 hover:bg-black text-white rounded-xl py-6 text-xs font-black uppercase tracking-[0.2em]">
                                        Start Free Trial
                                    </Button>
                                    <p className="text-center text-xs text-slate-400 font-serif">
                                        No credit card required for 14-day trial.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
