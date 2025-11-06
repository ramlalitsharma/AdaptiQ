'use client';

import Link from 'next/link';

export function Resources({ subjectName }: { subjectName: string }) {
  const resources = [
    { title: `${subjectName} Crash Course`, href: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(subjectName + ' crash course') },
    { title: `${subjectName} Cheatsheet (Google)`, href: 'https://www.google.com/search?q=' + encodeURIComponent(subjectName + ' cheatsheet filetype:pdf') },
    { title: `${subjectName} Past Papers`, href: 'https://www.google.com/search?q=' + encodeURIComponent(subjectName + ' past papers filetype:pdf') },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {resources.map((r) => (
        <a key={r.title} className="block p-4 border rounded-xl hover:shadow-md transition-shadow bg-white" href={r.href} target="_blank" rel="noreferrer">
          <div className="font-semibold text-gray-900">{r.title}</div>
          <div className="text-sm text-gray-600 mt-1">Opens in a new tab</div>
        </a>
      ))}
    </div>
  );
}


