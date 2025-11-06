'use client';

import React, { useState } from 'react';

export function Tabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div className="flex gap-2 border-b mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium ${active === t.id ? 'bg-white border border-b-0 -mb-px' : 'text-gray-600 hover:text-gray-800'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {tabs.map((t) => (
          <div key={t.id} className={active === t.id ? 'block' : 'hidden'}>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}


