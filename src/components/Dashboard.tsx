'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle2, Flame } from 'lucide-react';
import { Session } from '@/types/auth';
import { Habit, FrequencyType } from '@/types/habit';
import { getHabitsByUser, clearSession, createHabit, updateHabit, deleteHabit } from '@/lib/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import { calculateCurrentStreak } from '@/lib/streaks';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';
import ProfilePage from './ProfilePage';
import ThemeToggle from './ThemeToggle';
import { Trash2 } from 'lucide-react';

interface Props { session: Session; }

type View = 'home' | 'profile';

// Inline logo mark using the real image
function Logo() {
  return (
    <img
      src="/logo.png"
      alt="Habitly"
      style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0 }}
    />
  );
}

export default function Dashboard({ session }: Props) {
  const router = useRouter();
  const [habits, setHabits]         = useState<Habit[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [editingHabit, setEditing]  = useState<Habit | null>(null);
  const [deleteTarget, setDelete]   = useState<Habit | null>(null);
  const [view, setView]             = useState<View>('home');
  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(() => {
    setHabits(getHabitsByUser(session.userId));
  }, [session.userId]);

  useEffect(() => {
    load();
    // Register SW
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    // Listen for cross-tab sync
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('habitly-sync');
      bc.onmessage = () => load();
    } catch { /* not available */ }
    return () => bc?.close();
  }, [load]);

  const handleLogout = () => { clearSession(); router.replace('/login'); };

  const handleCreate = (name: string, desc: string, frequency: FrequencyType, customDays?: number[]) => {
    createHabit(session.userId, name, desc, frequency, customDays);
    load(); setShowForm(false);
  };
  const handleEdit = (name: string, desc: string, frequency: FrequencyType, customDays?: number[]) => {
    if (!editingHabit) return;
    updateHabit({ ...editingHabit, name, description: desc, frequency, customDays });
    load(); setEditing(null);
  };
  const handleToggle = (habit: Habit) => {
    updateHabit(toggleHabitCompletion(habit, today));
    load();
  };
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteHabit(deleteTarget.id);
    load(); setDelete(null);
  };

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit   = (h: Habit) => { setEditing(h); setShowForm(false); };

  const doneToday   = habits.filter(h => h.completions.includes(today)).length;
  const totalStreak = habits.reduce((s, h) => s + calculateCurrentStreak(h.completions, today), 0);
  const pct = habits.length > 0 ? Math.round((doneToday / habits.length) * 100) : 0;

  const firstName   = session.email.split('@')[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const initial     = displayName.charAt(0).toUpperCase();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div data-testid="dashboard-page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="app-shell">

        {/* ── TOP NAV ── */}
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Logo />
            <span style={{
              fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              Habitly
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle size="sm" />
            {/* Avatar — click to go profile */}
            <button
              onClick={() => setView(v => v === 'profile' ? 'home' : 'profile')}
              aria-label="Go to profile"
              title={`${displayName} — click for profile`}
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                border: 'none', color: '#fff', fontWeight: 700,
                fontSize: '0.875rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                letterSpacing: '-0.01em',
                boxShadow: view === 'profile' ? '0 0 0 2px var(--brand)' : 'none',
                transition: 'box-shadow 0.18s',
                outline: view === 'profile' ? '2px solid var(--brand)' : 'none',
                outlineOffset: 2,
                flexShrink: 0,
              }}
            >
              {initial}
            </button>
          </div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <div style={{ padding: '1.375rem 1.25rem 2rem' }}>

          {/* ── HOME VIEW ── */}
          {view === 'home' && (
            <>
              {/* Greeting */}
              <div style={{ marginBottom: '1.375rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {greeting} 👋
                </p>
                <h2 style={{
                  fontWeight: 800, fontSize: '1.625rem',
                  color: 'var(--text-primary)', letterSpacing: '-0.03em',
                  lineHeight: 1.15, marginTop: '0.1rem',
                }}>
                  {displayName}
                </h2>
              </div>

              {/* Progress banner */}
              {habits.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                  borderRadius: 18, padding: '1.125rem 1.25rem',
                  marginBottom: '1.25rem',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.22)',
                }}>
                  {/* Decorative circles */}
                  <div style={{ position: 'absolute', right: -16, top: -16, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                  <div style={{ position: 'absolute', right: 18, bottom: -28, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', fontWeight: 500, position: 'relative' }}>
                    Today&apos;s progress
                  </p>
                  <p style={{ color: '#fff', fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.025em', margin: '0.2rem 0 0.875rem', position: 'relative' }}>
                    {doneToday} / {habits.length} done
                  </p>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 99, position: 'relative' }}>
                    <div style={{
                      height: '100%', background: '#fff', borderRadius: 99,
                      width: `${pct}%`, transition: 'width 0.5s ease',
                      boxShadow: '0 0 6px rgba(255,255,255,0.5)',
                    }} />
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.775rem', marginTop: '0.45rem', position: 'relative' }}>
                    {pct === 100 ? '🎉 All habits done! Great work.' : `${100 - pct}% left to go`}
                  </p>
                </div>
              )}

              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Your habits
                </h3>
                <button
                  data-testid="create-habit-button"
                  onClick={openCreate}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.4rem 0.875rem', borderRadius: 99,
                    background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                    color: '#fff', fontWeight: 600, fontSize: '0.8125rem',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.22)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  <Plus size={14} strokeWidth={2.5} /> New habit
                </button>
              </div>

              {/* Empty state */}
              {habits.length === 0 && (
                <div data-testid="empty-state" style={{
                  textAlign: 'center', padding: '3rem 1.5rem',
                  border: '1.5px dashed var(--border)',
                  borderRadius: 18,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16, margin: '0 auto 1rem',
                    background: 'var(--brand-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Flame size={24} strokeWidth={1.5} color="var(--brand)" />
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    No habits yet
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.3rem', marginBottom: '1.375rem' }}>
                    Create your first habit and start building momentum
                  </p>
                  <button onClick={openCreate} className="btn btn-primary" style={{ margin: '0 auto' }}>
                    <Plus size={16} strokeWidth={2.5} /> Create first habit
                  </button>
                </div>
              )}

              {/* Habit cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {habits.map(h => (
                  <HabitCard
                    key={h.id} habit={h} today={today}
                    onToggle={() => handleToggle(h)}
                    onEdit={() => openEdit(h)}
                    onDelete={() => setDelete(h)}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── PROFILE VIEW ── */}
          {view === 'profile' && (
            <ProfilePage
              session={session}
              habits={habits}
              today={today}
              onBack={() => setView('home')}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>

      {/* ── HABIT FORM MODAL ── */}
      {(showForm || editingHabit) && (
        <HabitForm
          key={editingHabit?.id ?? 'new'}
          initial={editingHabit}
          onSave={editingHabit ? handleEdit : handleCreate}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.25rem',
        }}>
          <div className="modal-in" style={{
            width: '100%', maxWidth: 340,
            background: 'var(--bg-card)', borderRadius: 22,
            border: '1px solid var(--border-soft)',
            padding: '1.75rem 1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, margin: '0 auto 1.125rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={22} strokeWidth={1.75} color="var(--danger)" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Delete habit?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.375rem 0 0' }}>
              <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>&ldquo;{deleteTarget.name}&rdquo;</strong>
              {' '}and all its history will be removed permanently.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.5rem' }}>
              <button onClick={() => setDelete(null)} className="btn btn-ghost" style={{ flex: 1, padding: '0.75rem' }}>
                Cancel
              </button>
              <button data-testid="confirm-delete-button" onClick={handleDeleteConfirm} className="btn btn-danger" style={{ flex: 1, padding: '0.75rem' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
