'use client';

import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="w-10 h-10 p-0"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
    >
      {resolvedTheme === 'dark' ? '🌙' : '☀️'}
    </Button>
  );
}

