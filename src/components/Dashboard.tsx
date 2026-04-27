'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from '@/types/auth';
import { Habit } from '@/types/habit';
import {
  getHabitsByUser,
  clearSession,
  createHabit,
  updateHabit,
  deleteHabit,
} from '@/lib/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import { calculateCurrentStreak } from '@/lib/streaks';
import { getHabitSlug } from '@/lib/slug';
import { validateHabitName } from '@/lib/validators';
import HabitCard from '@/components/HabitCard';
import HabitForm from '@/components/HabitForm';
import ThemeToggle from '@/components/ThemeToggle';

interface Props {
  session: Session;
}

export default function Dashboard({ session }: Props) {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const loadHabits = useCallback(() => {
    setHabits(getHabitsByUser(session.userId));
  }, [session.userId]);

  useEffect(() => {
    loadHabits();
    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [loadHabits]);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const handleCreate = (name: string, description: string) => {
    createHabit(session.userId, name, description);
    loadHabits();
    setShowForm(false);
  };

  const handleEdit = (name: string, description: string) => {
    if (!editingHabit) return;
    const updated: Habit = {
      ...editingHabit,
      name,
      description,
    };
    updateHabit(updated);
    loadHabits();
    setEditingHabit(null);
  };

  const handleToggle = (habit: Habit) => {
    const updated = toggleHabitCompletion(habit, today);
    updateHabit(updated);
    loadHabits();
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteHabit(deleteTarget.id);
    loadHabits();
    setDeleteTarget(null);
  };

  const completedCount = habits.filter((h) => h.completions.includes(today)).length;
  const totalStreak = habits.reduce((sum, h) => sum + calculateCurrentStreak(h.completions, today), 0);

  const firstName = session.email.split('@')[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      data-testid="dashboard-page"
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 720,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="28" r="9" fill="#22c55e"/>
                <circle cx="87" cy="72" r="9" fill="#22c55e" opacity="0.7"/>
                <circle cx="33" cy="72" r="9" fill="#22c55e" opacity="0.7"/>
                <line x1="60" y1="37" x2="81" y2="65" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
                <line x1="81" y1="65" x2="39" y2="65" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
                <line x1="39" y1="65" x2="60" y2="37" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
                <circle cx="60" cy="60" r="14" fill="#22c55e"/>
                <path d="M54 60.5L58 64.5L67 56" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem',
              color: 'var(--text-primary)', letterSpacing: '-0.01em',
            }}>
              Habit Tracker
            </span>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThemeToggle />
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            }}>
              {initial}
            </div>
            <button
              data-testid="auth-logout-button"
              onClick={handleLogout}
              style={{
                padding: '0.4rem 0.9rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: '1.5rem 1.25rem', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        {/* Greeting + stats */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '1.6rem', color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            Hey, {displayName}! 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {/* Stats row */}
          {habits.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.75rem',
              marginTop: '1.25rem',
            }}>
              {[
                { label: 'Total Habits', value: habits.length, icon: '📋' },
                { label: 'Done Today', value: `${completedCount}/${habits.length}`, icon: '✅' },
                { label: 'Total Streak', value: totalStreak, icon: '🔥' },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '0.875rem 0.75rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem', fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            Your Habits
          </h3>
          <button
            data-testid="create-habit-button"
            onClick={() => { setShowForm(true); setEditingHabit(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.5rem 1rem',
              background: 'var(--brand)',
              color: '#fff',
              fontWeight: 700, fontSize: '0.85rem',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
            New habit
          </button>
        </div>

        {/* Habit form (inline) */}
        {(showForm || editingHabit) && (
          <HabitForm
            key={editingHabit?.id ?? 'new'}
            initial={editingHabit}
            onSave={editingHabit ? handleEdit : handleCreate}
            onCancel={() => { setShowForm(false); setEditingHabit(null); }}
          />
        )}

        {/* Empty state */}
        {habits.length === 0 && !showForm && (
          <div
            data-testid="empty-state"
            style={{
              textAlign: 'center', padding: '4rem 2rem',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 20, marginTop: '1rem',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🌱</div>
            <h4 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
              No habits yet
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.4rem' }}>
              Start building your first habit today
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--brand)',
                color: '#fff',
                fontWeight: 700, fontSize: '0.9rem',
                borderRadius: 10, border: 'none', cursor: 'pointer',
              }}
            >
              Create your first habit
            </button>
          </div>
        )}

        {/* Habit cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: showForm || editingHabit ? '1rem' : 0 }}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              today={today}
              onToggle={() => handleToggle(habit)}
              onEdit={() => { setEditingHabit(habit); setShowForm(false); }}
              onDelete={() => setDeleteTarget(habit)}
            />
          ))}
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 20,
            padding: '2rem', width: '100%', maxWidth: 380,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem' }}>🗑️</div>
            <h3 style={{
              fontWeight: 700, fontSize: '1.1rem',
              color: 'var(--text-primary)', textAlign: 'center',
            }}>
              Delete habit?
            </h3>
            <p style={{
              color: 'var(--text-muted)', fontSize: '0.875rem',
              textAlign: 'center', marginTop: '0.5rem',
            }}>
              &quot;{deleteTarget.name}&quot; and all its progress will be permanently deleted.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
                  color: 'var(--text-primary)', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                data-testid="confirm-delete-button"
                onClick={handleDeleteConfirm}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: 'var(--danger)', border: 'none',
                  borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
                  color: '#fff', cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
