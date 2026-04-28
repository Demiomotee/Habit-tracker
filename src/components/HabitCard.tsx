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
  daily:    'Daily',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  weekly:   'Weekly',
  custom:   'Custom',
};

export default function HabitCard({ habit, today, onToggle, onEdit, onDelete }: Props) {
  const slug   = getHabitSlug(habit.name);
  const done   = habit.completions.includes(today);
  const streak = calculateCurrentStreak(habit.completions, today);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleEdit = () => { setMenuOpen(false); onEdit(); };
  const handleDelete = () => { setMenuOpen(false); onDelete(); };

  return (
    <div
      data-testid={`habit-card-${slug}`}
      style={{
        background: done ? 'var(--brand-light)' : 'var(--bg-card)',
        border: `1px solid ${done ? 'rgba(124,58,237,0.2)' : 'var(--border-soft)'}`,
        borderRadius: 16,
        padding: '0.875rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        transition: 'border-color 0.2s, background 0.2s',
        boxShadow: 'none',
      }}
    >
      {/* Completion circle */}
      <button
        data-testid={`habit-complete-${slug}`}
        onClick={onToggle}
        aria-label={done ? `Unmark ${habit.name}` : `Complete ${habit.name}`}
        style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          border: `1.5px solid ${done ? 'transparent' : 'var(--border)'}`,
          background: done ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'var(--bg-input)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: done ? '0 2px 8px rgba(124,58,237,0.28)' : 'none',
        }}
      >
        {done && <Check size={16} strokeWidth={2.5} color="white" className="check-pop" />}
      </button>

      {/* Content */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {FREQ_LABELS[habit.frequency] ?? 'Daily'}
          </span>
          {habit.description && (
            <>
              <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'var(--border)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                {habit.description}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Streak badge */}
      <div
        data-testid={`habit-streak-${slug}`}
        style={{
          display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0,
          background: streak > 0 ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'var(--bg-subtle)',
          borderRadius: 8, padding: '3px 8px',
          fontSize: '0.75rem', fontWeight: 700,
          color: streak > 0 ? '#fff' : 'var(--text-muted)',
        }}
      >
        {streak > 0 && <Flame size={11} strokeWidth={2} />}
        {streak}
      </div>

      {/* Three-dot menu */}
      <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Habit options"
          style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            border: '1px solid var(--border-soft)',
            background: menuOpen ? 'var(--bg-subtle)' : 'transparent',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <MoreHorizontal size={15} strokeWidth={1.75} />
        </button>

        {menuOpen && (
          <div className="dropdown-menu">
            <button
              data-testid={`habit-edit-${slug}`}
              onClick={handleEdit}
              className="dropdown-item"
            >
              <Pencil size={13} strokeWidth={2} color="var(--text-muted)" />
              Edit
            </button>
            <button
              data-testid={`habit-delete-${slug}`}
              onClick={handleDelete}
              className="dropdown-item danger"
            >
              <Trash2 size={13} strokeWidth={2} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
