'use client';
import { ArrowLeft, LogOut, LayoutGrid, CheckCircle2, Flame } from 'lucide-react';
import { Session } from '@/types/auth';
import { Habit } from '@/types/habit';
import { calculateCurrentStreak } from '@/lib/streaks';
import CalendarView from './CalendarView';

interface Props {
  session: Session;
  habits: Habit[];
  today: string;
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfilePage({ session, habits, today, onBack, onLogout }: Props) {
  const doneToday   = habits.filter(h => h.completions.includes(today)).length;
  const totalStreak = habits.reduce((s, h) => s + calculateCurrentStreak(h.completions, today), 0);
  const totalDone   = habits.reduce((s, h) => s + h.completions.length, 0);

  // Use real name
  const displayName = session.name || session.email.split('@')[0];
  const initial     = displayName.charAt(0).toUpperCase();

  const stats = [
    { icon: <LayoutGrid   size={20} strokeWidth={1.75} color="var(--brand)" />, value: habits.length, label: 'Total' },
    { icon: <CheckCircle2 size={20} strokeWidth={1.75} color="var(--brand)" />, value: doneToday,      label: 'Done today' },
    { icon: <Flame        size={20} strokeWidth={1.75} color="var(--brand)" />, value: totalStreak,    label: 'Streak pts' },
  ];

  return (
    <div className="slide-up" style={{ paddingBottom: '2rem' }}>
      {/* Back */}
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--brand)', fontWeight: 600, fontSize: '0.875rem',
        fontFamily: 'inherit', padding: '0 0 0.75rem', letterSpacing: '-0.01em',
      }}>
        <ArrowLeft size={15} strokeWidth={2.5} /> Back
      </button>

      {/* Avatar */}
      <div style={{ textAlign: 'center', padding: '1rem 0 1.625rem' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22, margin: '0 auto 0.875rem',
          background: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '1.75rem', fontWeight: 700,
        }}>
          {initial}
        </div>
        <h2 style={{ fontWeight: 700, fontSize: '1.1875rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {displayName}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8375rem', marginTop: '0.2rem' }}>{session.email}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', marginTop: '0.15rem' }}>
          {totalDone} total completion{totalDone !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats — matches the screenshot: icon on top, big number, label */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem', marginBottom: '1.25rem' }}>
        {stats.map(({ icon, value, label }) => (
          <div key={label} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 18,
            padding: '1.125rem 0.5rem',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '0.45rem',
          }}>
            {icon}
            <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {value}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', letterSpacing: '0.01em' }}>
          Completion history
        </h3>
        <CalendarView habits={habits} />
      </div>

      {/* Sign out — triggers confirm modal in parent */}
      <button
        onClick={onLogout}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem', padding: '0.875rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          borderRadius: 14,
          color: 'var(--danger)', fontWeight: 600, fontSize: '0.9375rem',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.12s',
        }}
      >
        <LogOut size={16} strokeWidth={2} />
        Sign out
      </button>
    </div>
  );
}
