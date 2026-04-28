'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { theme, toggle } = useTheme();
  const s = size === 'sm' ? 36 : 40;
  const iconSize = size === 'sm' ? 15 : 17;

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        width: s, height: s, borderRadius: 12,
        background: 'var(--bg-subtle)',
        border: '1.5px solid var(--border)',
        color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
    >
      {theme === 'dark'
        ? <Sun size={iconSize} strokeWidth={2} />
        : <Moon size={iconSize} strokeWidth={2} />}
    </button>
  );
}
