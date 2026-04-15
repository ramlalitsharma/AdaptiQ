'use client';

import { Suspense } from 'react';
import { MessagingPanel } from '@/components/messaging/MessagingPanel';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Link from 'next/link';

export default function MessagesPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Messages</h1>
                        <p className="text-slate-600 dark:text-slate-400">Communicate with your instructors and classmates.</p>
                    </div>

                    <Suspense fallback={<div className="text-slate-600">Loading messages…</div>}>
                        <MessagingPanel />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
