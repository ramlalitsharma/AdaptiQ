'use client';

import { useState } from 'react';
import { SubjectSelector } from '@/components/quiz/SubjectSelector';
import { Button } from '@/components/ui/Button';

export function SubjectPickerCard() {
  const [selection, setSelection] = useState<{
    subjectId?: string;
    subjectName?: string;
    levelId?: string;
    levelName?: string;
  }>({});

  const canStart = Boolean(selection.subjectId);

  const handleStart = () => {
    if (!selection.subjectName) return;
    // TODO: route to a subject-specific quiz page or initialize quiz with selection
    // For now, store selection for the quiz component to read if needed
    try {
      localStorage.setItem('adaptiq-subject-selection', JSON.stringify(selection));
    } catch {}
    // Optionally navigate, or leave as-is for the embedded quiz to read
  };

  return (
    <div className="space-y-4">
      <SubjectSelector onChange={(s) => setSelection({ subjectName: s.subjectName, levelName: s.levelName })} />
      <div className="flex justify-end">
        <Button onClick={async () => {
          if (!selection.subjectName) return;
          try {
            await fetch('/api/user/subjects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjectName: selection.subjectName, levelName: selection.levelName }) });
          } catch {}
          handleStart();
          try {
            window.location.hash = '#adaptive-quiz';
            window.dispatchEvent(new Event('adaptiq-selection-updated'));
          } catch {}
        }} disabled={!selection.subjectName}>
          Use Selection
        </Button>
      </div>
    </div>
  );
}


