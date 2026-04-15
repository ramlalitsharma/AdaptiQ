'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { CertificateGenerator } from './CertificateGenerator';
import { CheckCircle2, Award } from 'lucide-react';

interface CourseCompletionProps {
  courseSlug: string;
  courseTitle: string;
}

export function CourseCompletion({ courseSlug, courseTitle }: CourseCompletionProps) {
  const [completing, setCompleting] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/courses/${courseSlug}/complete`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.certificateId) {
        setCertificateId(data.certificateId);
      } else {
        alert('Failed to complete course');
      }
    } catch (e) {
      console.error('Completion error:', e);
      alert('Failed to complete course');
    } finally {
      setCompleting(false);
    }
  };

  if (certificateId) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <Card className="border-emerald-200 bg-emerald-50/50 backdrop-blur-sm overflow-hidden border-2 shadow-xl shadow-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-emerald-800">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="text-2xl font-black tracking-tight">🎉 Course Completed!</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-emerald-700 font-medium mb-4 text-lg">
              Outstanding work! You&apos;ve successfully mastered <strong>{courseTitle}</strong>. Your professional certification has been issued.
            </p>
          </CardContent>
        </Card>

        {/* Premium Certificate View */}
        <div className="bg-white rounded-3xl p-4 md:p-8 border border-slate-200 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <CertificateGenerator
            certificate={{
              id: certificateId,
              userName: 'Accomplished Learner',
              courseTitle: courseTitle,
              issuedAt: new Date().toISOString(),
              verificationUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/certificates/verify/${certificateId}`
            }}
          />
        </div>

        <div className="flex justify-center mt-12 pb-12">
          <Link href="/my-learning">
            <Button variant="ghost" className="text-slate-400 hover:text-slate-800 transition-colors gap-2">
              ← Back to My Learning Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-2 border-slate-100 hover:border-blue-100 transition-colors">
      <div className="p-8 md:p-12 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <Award className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Ready for your Certificate?</h2>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed">
          You&apos;ve put in the work, now claim your professional credential. Complete all lessons and quizzes to earn your verified certificate of completion.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={handleComplete}
            disabled={completing}
            size="lg"
            className="w-full sm:w-auto px-12 py-7 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 text-lg font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {completing ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Issuing Certificate...
              </div>
            ) : 'Complete Course & Get Certificate'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
