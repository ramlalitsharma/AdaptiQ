import { InstructorDashboard } from '@/components/admin/InstructorDashboard';

export const metadata = {
    title: 'Instructor Dashboard - Live Classes',
    description: 'Manage your upcoming and live classes',
};

export default function InstructorDashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Instructor Dashboard</h1>
                    <p className="text-slate-600">Manage your live classes and sessions</p>
                </div>

                <InstructorDashboard />
            </div>
        </div>
    );
}
