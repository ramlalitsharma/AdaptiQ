'use client';

import { useEffect, useState } from 'react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-50">
      <div className="mx-auto max-w-3xl bg-white shadow-xl border border-gray-200 rounded-lg p-4 md:p-5">
        <div className="md:flex items-start md:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              We use cookies to enhance your experience, analyze usage, and show relevant content. By clicking "Accept", you consent to our cookies in accordance with our {' '}
              <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>.
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => { localStorage.setItem('cookie-consent', 'rejected'); setVisible(false); }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reject
            </button>
            <button
              onClick={() => { localStorage.setItem('cookie-consent', 'accepted'); setVisible(false); }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


