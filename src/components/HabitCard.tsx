'use client';
import { Check, Flame, Pencil, Trash2 } from 'lucide-react';
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

export default function HabitCard({ habit, today, onToggle, onEdit, onDelete }: Props) {
  const slug      = getHabitSlug(habit.name);
  const done      = habit.completions.includes(today);
  const streak    = calculateCurrentStreak(habit.completions, today);

  return (
    <div
      data-testid={`habit-card-${slug}`}
      style={{
        background: done ? 'var(--brand-light)' : 'var(--bg-card)',
        border: `1.5px solid ${done ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`,
        borderRadius: 18,
        padding: '1rem 1.125rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        transition: 'all 0.22s ease',
        boxShadow: done ? '0 4px 16px rgba(124,58,237,0.1)' : 'var(--shadow-sm)',
      }}
    >
      {/* Completion toggle */}
      <button
        data-testid={`habit-complete-${slug}`}
        onClick={onToggle}
        aria-label={done ? `Unmark ${habit.name}` : `Complete ${habit.name}`}
        style={{
          width: 36, height: 36, borderRadius: 12, flexShrink: 0,
          border: `2px solid ${done ? 'transparent' : 'var(--border)'}`,
          background: done
            ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
            : 'var(--bg-input)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.22s ease',
          boxShadow: done ? '0 2px 8px rgba(124,58,237,0.35)' : 'none',
        }}
      >
        {done && (
          <Check size={17} strokeWidth={3} color="white" className="check-pop" />
        )}
      </button>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 600, fontSize: '0.9375rem',
          color: done ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: done ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          transition: 'all 0.2s',
        }}>
          {habit.name}
        </p>
        {habit.description && (
          <p style={{
            fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {habit.description}
          </p>
        )}
      </div>

      {/* Streak badge */}
      <div
        data-testid={`habit-streak-${slug}`}
        style={{
          display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0,
          background: streak > 0 ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'var(--bg-subtle)',
          borderRadius: 8,
          padding: '3px 8px',
          fontSize: '0.75rem', fontWeight: 700,
          color: streak > 0 ? '#fff' : 'var(--text-muted)',
        }}
      >
        {streak > 0 && <Flame size={12} strokeWidth={2.5} className="streak-fire" />}
        {streak > 0 ? streak : '0'}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <button
          data-testid={`habit-edit-${slug}`}
          onClick={onEdit}
          aria-label={`Edit ${habit.name}`}
          style={{
            width: 32, height: 32, borderRadius: 9, border: '1.5px solid var(--border)',
            background: 'var(--bg-input)', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <Pencil size={13} strokeWidth={2} />
        </button>
        <button
          data-testid={`habit-delete-${slug}`}
          onClick={onDelete}
          aria-label={`Delete ${habit.name}`}
          style={{
            width: 32, height: 32, borderRadius: 9,
            border: '1.5px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.06)', color: 'var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <Trash2 size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
