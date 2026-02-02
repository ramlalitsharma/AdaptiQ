'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BRAND_NAME } from '@/lib/brand';
import { CheckCircle2, Award, ShieldCheck, Download, Share2 } from 'lucide-react';

interface CertificateProps {
    certificate: {
        id: string;
        userName: string;
        courseTitle: string;
        issuedAt: string;
        verificationUrl: string;
    };
}

export function CertificateGenerator({ certificate }: CertificateProps) {
    const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Premium Certificate Theme */}
            <div className="relative max-w-4xl mx-auto aspect-[1.414/1] bg-white shadow-2xl rounded-sm overflow-hidden border-[12px] border-double border-slate-200 p-1">
                {/* Certificate Content */}
                <div className="h-full w-full border-[1px] border-slate-300 bg-slate-50 relative p-12 flex flex-col items-center justify-between text-center overflow-hidden">

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full rotate-45 transform scale-150 flex flex-wrap gap-4">
                            {Array.from({ length: 100 }).map((_, i) => (
                                <Award key={i} className="w-12 h-12" />
                            ))}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-4 z-10">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center p-4 shadow-xl">
                                <ShieldCheck className="w-full h-full text-white" />
                            </div>
                        </div>
                        <h1 className="text-sm tracking-[0.3em] font-black text-slate-400 uppercase">Certificate of Completion</h1>
                        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto"></div>
                    </div>

                    {/* Body */}
                    <div className="z-10 mt-8 mb-4">
                        <p className="text-slate-500 font-serif italic text-lg">This is to certify that</p>
                        <h2 className="text-5xl font-black text-slate-900 mt-4 mb-6 tracking-tight drop-shadow-sm">
                            {certificate.userName}
                        </h2>
                        <p className="text-slate-500 font-serif italic text-lg mb-4">has successfully completed the professional course</p>
                        <h3 className="text-3xl font-bold text-blue-800 tracking-tight leading-tight max-w-2xl">
                            {certificate.courseTitle}
                        </h3>
                    </div>

                    {/* Footer */}
                    <div className="w-full flex justify-between items-end mt-12 z-10 px-8">
                        <div className="text-left space-y-2">
                            <div className="w-40 h-0.5 bg-slate-300"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Issued</p>
                            <p className="text-sm font-black text-slate-800">{issuedDate}</p>
                        </div>

                        <div className="flex flex-col items-center opacity-40">
                            <Award className="w-16 h-16 text-slate-300" />
                            <p className="text-[8px] mt-1 font-black uppercase text-slate-400">Authentic Token</p>
                        </div>

                        <div className="text-right space-y-2">
                            <div className="w-40 h-0.5 bg-slate-300"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verify Authenticity</p>
                            <p className="text-[10px] font-mono text-slate-500">{certificate.id}</p>
                        </div>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 -rotate-45 translate-x-16 -translate-y-16 lg:block hidden"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/5 -rotate-45 -translate-x-16 translate-y-16 lg:block hidden"></div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 gap-2">
                    <Download className="w-5 h-5" /> Download PDF
                </Button>
                <Button variant="outline" size="lg" className="gap-2 bg-white">
                    <Share2 className="w-5 h-5" /> Share Achievement
                </Button>
                <div className="w-full flex justify-center mt-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-500 border border-slate-200 shadow-inner">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Verifiable at {new URL(certificate.verificationUrl).hostname}
                    </div>
                </div>
            </div>
        </div>
    );
}
