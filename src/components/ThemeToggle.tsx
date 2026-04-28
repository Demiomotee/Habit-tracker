'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { theme, toggle } = useTheme();
  const dim = size === 'sm' ? 34 : 38;
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        width: dim, height: dim, borderRadius: 10,
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-soft)',
        color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.18s', flexShrink: 0,
      }}
    >
      {theme === 'dark' ? <Sun size={iconSize} strokeWidth={1.75} /> : <Moon size={iconSize} strokeWidth={1.75} />}
    </button>
  );
}
