'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    ShieldCheck,
    FileJson,
    Trash2,
    Lock,
    UserRoundCheck,
    ExternalLink,
    Download,
    AlertTriangle,
    Server
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComplianceDashboard() {
    const [isExporting, setIsExporting] = useState(false);

    const handleGlobalExport = () => {
        // This would trigger a system-wide anonymized dump or similar for auditors
        alert("System-wide audit dump initiated. This may take several minutes.");
    };

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="space-y-1 text-center md:text-left">
                <h1 className="text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
                    <ShieldCheck className="text-emerald-600 w-8 h-8" /> Compliance & Governance
                </h1>
                <p className="text-slate-500 font-medium">Manage platform privacy, enterprise security, and regulatory requirements.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Lock className="w-5 h-5 text-indigo-600" /> Identity & SSO
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <span className="text-sm font-bold text-slate-700">Enterprise SAML</span>
                                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-sm font-bold text-slate-700">OAuth (Google/GitHub)</span>
                                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-xl border-slate-200 flex items-center gap-2">
                            Access Clerk Settings <ExternalLink size={14} />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserRoundCheck className="w-5 h-5 text-emerald-600" /> GDPR Data Tools
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Fulfill Subject Access Requests (SAR) instantly by generating a portable data package for any user.
                        </p>
                        <div className="space-y-2 pt-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter User ID or Email..."
                                    className="w-full p-3 pr-20 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-emerald-500/20"
                                />
                                <Button size="sm" className="absolute right-1.5 top-1.5 bottom-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 gap-2">
                                    <Download size={14} /> Export
                                </Button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Users can also self-export from their privacy settings.</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden md:col-span-2 lg:col-span-1">
                    <CardHeader className="bg-red-50/50 border-b border-red-50">
                        <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-5 h-5 text-red-600" /> Critical Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <Button className="w-full bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 rounded-xl flex items-center justify-start gap-3 py-6 h-auto transition-all">
                            <Trash2 className="w-5 h-5" />
                            <div className="text-left">
                                <div className="font-black text-sm uppercase tracking-tighter">Permanent Wipe</div>
                                <div className="text-[10px] opacity-70">Delete all data for a specific account</div>
                            </div>
                        </Button>
                        <Button
                            onClick={handleGlobalExport}
                            className="w-full bg-slate-900 text-white hover:bg-black rounded-xl flex items-center justify-start gap-3 py-6 h-auto transition-all"
                        >
                            <FileJson className="w-5 h-5" />
                            <div className="text-left">
                                <div className="font-black text-sm uppercase tracking-tighter">Audit Dump</div>
                                <div className="text-[10px] opacity-70">Download full platform activity as JSON</div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black tracking-widest uppercase">
                            Enterprise Ready
                        </div>
                        <h2 className="text-3xl font-black">Platform Global Infrastructure</h2>
                        <p className="text-slate-400 leading-relaxed">
                            AdaptiQ infrastructure is distributed across multiple regions. All data is encrypted at rest (AES-256) and in transit (TLS 1.3).
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                <Server size={14} className="text-emerald-500" /> MongoDB Atlas Managed
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                <ShieldCheck size={14} className="text-emerald-500" /> Clerk Secure Auth
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                            <div className="text-3xl font-black text-emerald-500">99.9%</div>
                            <div className="text-[10px] uppercase font-black text-slate-500 mt-1">Uptime SLA</div>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                            <div className="text-3xl font-black text-indigo-500">24/7</div>
                            <div className="text-[10px] uppercase font-black text-slate-500 mt-1">Audit Monitoring</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
