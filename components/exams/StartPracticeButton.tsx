'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  subjectName: string;
  levelName?: 'Basic' | 'Intermediate' | 'Advanced';
}

export function StartPracticeButton({ subjectName, levelName = 'Intermediate' }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      // Persist selection
      localStorage.setItem('adaptiq-subject-selection', JSON.stringify({ subjectName, levelName }));
      // Save for analytics/history
      try {
        await fetch('/api/user/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjectName, levelName }),
        });
      } catch {}
      // Notify quiz and navigate
      try { window.dispatchEvent(new Event('adaptiq-selection-updated')); } catch {}
      window.location.href = '/dashboard#adaptive-quiz';
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button className="w-full" size="lg" onClick={handleClick} isLoading={loading}>
      Start Practice Test
    </Button>
  );
}


