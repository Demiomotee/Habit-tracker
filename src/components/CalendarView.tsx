'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Habit } from '@/types/habit';

interface Props {
  habits: Habit[];
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarView({ habits }: Props) {
  const now = new Date();
  const [viewDate, setViewDate] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const todayStr = now.toISOString().split('T')[0];

  // Build a set of all completion dates across all habits
  const allCompletions = new Set<string>(habits.flatMap(h => h.completions));

  const { year, month } = viewDate;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => setViewDate(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const next = () => setViewDate(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-soft)',
      borderRadius: 20,
      padding: '1.125rem',
      boxShadow: 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={prev} style={{
          width: 32, height: 32, borderRadius: 9,
          border: '1px solid var(--border-soft)',
          background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <ChevronLeft size={15} strokeWidth={2} />
        </button>

        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {MONTH_NAMES[month]} {year}
        </span>

        <button onClick={next} style={{
          width: 32, height: 32, borderRadius: 9,
          border: '1px solid var(--border-soft)',
          background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Day of week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.4rem' }}>
        {DOW.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.25rem 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
        {/* Empty leading cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} style={{ aspectRatio: '1' }} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
          const isDone  = allCompletions.has(dateStr);
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;

          return (
            <div
              key={day}
              className={[
                'cal-day',
                isDone ? 'done' : '',
                isToday && !isDone ? 'today' : '',
                isToday && isDone ? 'today done' : '',
                isFuture ? 'faded' : '',
              ].join(' ')}
              title={dateStr}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.875rem', justifyContent: 'center' }}>
        {[
          { color: 'linear-gradient(135deg,#7c3aed,#9333ea)', label: 'Completed' },
          { color: 'transparent', border: '2px solid var(--brand)', label: 'Today' },
          { color: 'var(--bg-subtle)', label: 'Upcoming' },
        ].map(({ color, border, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{
              width: 12, height: 12, borderRadius: 4,
              background: color, border: border ?? 'none',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
