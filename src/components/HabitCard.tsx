'use client';
import { useRef, useState, useEffect } from 'react';
import { Check, Flame, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';

interface Props {
  habit: Habit;
  today: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const FREQ_LABELS: Record<string, string> = {
  daily: 'Daily', weekdays: 'Weekdays', weekends: 'Weekends', weekly: 'Weekly', custom: 'Custom',
};

export default function HabitCard({ habit, today, onToggle, onEdit, onDelete }: Props) {
  const slug      = getHabitSlug(habit.name);
  const done      = habit.completions.includes(today);
  const streak    = calculateCurrentStreak(habit.completions, today);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div
      data-testid={`habit-card-${slug}`}
      style={{
        background: done ? 'var(--brand-light)' : 'var(--bg-card)',
        border: `1px solid ${done ? 'rgba(124,58,237,0.18)' : 'var(--border-soft)'}`,
        borderRadius: 14,
        padding: '0.875rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        transition: 'background 0.18s, border-color 0.18s',
      }}
    >

      <button
        data-testid={`habit-complete-${slug}`}
        onClick={onToggle}
        aria-label={done ? `Unmark ${habit.name}` : `Complete ${habit.name}`}
        style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          border: `1.5px solid ${done ? 'transparent' : 'var(--border)'}`,
          background: done ? 'var(--brand)' : 'var(--bg-input)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.18s',
        }}
      >
        {done && <Check size={15} strokeWidth={3} color="white" className="check-pop" />}
      </button>


      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 600, fontSize: '0.9375rem',
          color: done ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: done ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
        }}>
          {habit.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {FREQ_LABELS[habit.frequency] ?? 'Daily'}
          </span>
          {habit.description && (
            <>
              <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'var(--border)', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {habit.description}
              </span>
            </>
          )}
        </div>
      </div>


      <div
        data-testid={`habit-streak-${slug}`}
        style={{
          display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0,
          background: streak > 0 ? '#f97316' : 'var(--bg-subtle)',
          borderRadius: 7, padding: '3px 7px',
          fontSize: '0.74rem', fontWeight: 700,
          color: streak > 0 ? '#fff' : 'var(--text-muted)',
        }}
      >
        {streak > 0 && <Flame size={11} strokeWidth={2} />}
        {streak}
      </div>


      <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Habit options"
          style={{
            width: 28, height: 28, borderRadius: 7,
            border: '1px solid var(--border-soft)',
            background: menuOpen ? 'var(--bg-subtle)' : 'transparent',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.12s',
          }}
        >
          <MoreHorizontal size={14} strokeWidth={1.75} />
        </button>

        {menuOpen && (
          <div className="dropdown-menu">
            <button data-testid={`habit-edit-${slug}`}
              onClick={() => { setMenuOpen(false); onEdit(); }} className="dropdown-item">
              <Pencil size={12} strokeWidth={2} color="var(--text-muted)" /> Edit
            </button>
            <button data-testid={`habit-delete-${slug}`}
              onClick={() => { setMenuOpen(false); onDelete(); }} className="dropdown-item danger">
              <Trash2 size={12} strokeWidth={2} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
