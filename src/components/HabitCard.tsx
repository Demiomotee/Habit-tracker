'use client';

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
  const slug = getHabitSlug(habit.name);
  const isCompleted = habit.completions.includes(today);
  const streak = calculateCurrentStreak(habit.completions, today);

  return (
    <div
      data-testid={`habit-card-${slug}`}
      style={{
        background: isCompleted ? 'rgba(34,197,94,0.06)' : 'var(--bg-card)',
        border: `1.5px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '1rem 1.125rem',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
      }}
    >
      {/* Complete toggle */}
      <button
        data-testid={`habit-complete-${slug}`}
        onClick={onToggle}
        aria-label={isCompleted ? `Unmark ${habit.name} as complete` : `Mark ${habit.name} as complete`}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: `2px solid ${isCompleted ? '#22c55e' : 'var(--border)'}`,
          background: isCompleted ? '#22c55e' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '0.1rem',
          transition: 'all 0.2s',
        }}
      >
        {isCompleted && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ minWidth: 0 }}>
            <h4 style={{
              fontWeight: 700, fontSize: '0.975rem',
              color: 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              opacity: isCompleted ? 0.6 : 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {habit.name}
            </h4>
            {habit.description && (
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.8rem',
                marginTop: '0.15rem', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {habit.description}
              </p>
            )}
          </div>

          {/* Streak badge */}
          <div
            data-testid={`habit-streak-${slug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
              flexShrink: 0,
              background: streak > 0
                ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                : 'var(--bg-input)',
              color: streak > 0 ? '#fff' : 'var(--text-muted)',
              fontSize: '0.75rem', fontWeight: 700,
              padding: '0.2rem 0.5rem', borderRadius: 999,
            }}
          >
            {streak > 0 ? '🔥' : '—'} {streak > 0 ? streak : '0d'}
          </div>
        </div>

        {/* Frequency badge + actions */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '0.6rem',
        }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'var(--bg-input)',
            padding: '0.15rem 0.5rem', borderRadius: 4,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Daily
          </span>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              data-testid={`habit-edit-${slug}`}
              onClick={onEdit}
              aria-label={`Edit ${habit.name}`}
              style={{
                padding: '0.3rem 0.65rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Edit
            </button>
            <button
              data-testid={`habit-delete-${slug}`}
              onClick={onDelete}
              aria-label={`Delete ${habit.name}`}
              style={{
                padding: '0.3rem 0.65rem',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 6,
                fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--danger)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
