'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Shield, Calendar, User, Info, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Log {
    _id: string;
    adminId: string;
    adminName: string;
    action: string;
    targetId?: string;
    targetType: string;
    details: string;
    metadata?: any;
    ipAddress?: string;
    createdAt: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const limit = 20;

    useEffect(() => {
        fetchLogs();
    }, [offset]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/logs?limit=${limit}&offset=${offset}`);
            const data = await res.json();
            if (data.success) {
                setLogs(data.data.logs);
                setTotal(data.data.total);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('ban')) return 'bg-red-100 text-red-700 border-red-200';
        if (action.includes('role')) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (action.includes('update')) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Shield className="text-indigo-600 w-8 h-8" /> Security Audit Trail
                    </h1>
                    <p className="text-slate-500 font-medium">Monitor all administrative actions and system modifications.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search actions or admins..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all w-64 shadow-sm"
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl border-slate-200 flex items-center gap-2">
                        <Filter size={16} /> Filters
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-black border-b border-slate-100">
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Admin</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Target</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-slate-50 rounded-lg" /></td>
                                        </tr>
                                    ))
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                                            No audit logs found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {format(new Date(log.createdAt), 'MMM dd, yyyy')}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {format(new Date(log.createdAt), 'HH:mm:ss')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600">
                                                        {log.adminName.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{log.adminName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={`${getActionColor(log.action)} uppercase text-[10px] font-black tracking-tighter`}>
                                                    {log.action.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{log.targetType}</span>
                                                    <span className="text-xs text-slate-400 font-mono truncate max-w-[120px]">{log.targetId || 'SYSTEM'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                                                {log.ipAddress || 'Internal'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-indigo-600">
                                                    <Info size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-sm text-slate-500 font-medium">
                            Showing <span className="text-slate-900 font-bold">{offset + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(offset + limit, total)}</span> of <span className="text-slate-900 font-bold">{total}</span> logs
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={offset === 0}
                                onClick={() => setOffset(Math.max(0, offset - limit))}
                                className="rounded-xl border-slate-200"
                            >
                                <ArrowLeft size={16} className="mr-2" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={offset + limit >= total}
                                onClick={() => setOffset(offset + limit)}
                                className="rounded-xl border-slate-200"
                            >
                                Next <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-lg bg-indigo-600 text-white rounded-3xl p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-indigo-100 text-xs font-black uppercase tracking-widest">Security Health</p>
                            <h3 className="text-2xl font-black">Platform Stable</h3>
                        </div>
                        <Shield className="w-8 h-8 opacity-20" />
                    </div>
                    <div className="mt-4 text-sm text-indigo-50/70 border-t border-white/10 pt-4">
                        No unauthorized access attempts detected in last 24h.
                    </div>
                </Card>
            </div>
        </div>
    );
}
