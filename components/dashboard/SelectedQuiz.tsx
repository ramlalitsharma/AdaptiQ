'use client';

import { useEffect, useState } from 'react';
import { AdaptiveQuiz } from '@/components/quiz/AdaptiveQuiz';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function SelectedQuiz() {
  const [selection, setSelection] = useState<{ subjectName?: string } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('adaptiq-subject-selection');
      if (raw) setSelection(JSON.parse(raw));
    } catch {}
  }, []);

  if (!selection?.subjectName) {
    return (
      <div className="p-6 rounded-xl border bg-white text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a subject to begin</h3>
        <p className="text-sm text-gray-600 mb-4">Select a subject, level and chapter to start an adaptive quiz.</p>
        <Link href="/subjects">
          <Button>Browse Subjects</Button>
        </Link>
      </div>
    );
  }

  return <AdaptiveQuiz topic={selection.subjectName} />;
}


